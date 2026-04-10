import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { normalizeEmail } from '../../common/normalization/email';
import { Inquiry, InquiryStatus } from '../inquiries/entities/inquiry.entity';
import { OutlookService } from '../outlook/outlook.service';
import { User } from '../users/entities/user.entity';
import { VendorCcRecipient } from '../vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../vendors/entities/vendor-contact.entity';
import { VendorMaster } from '../vendors/entities/vendor-master.entity';
import { VendorOffice } from '../vendors/entities/vendor-office.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqFieldSpec } from './entities/rfq-field-spec.entity';
import { Rfq } from './entities/rfq.entity';
import { personalizeMailBodyHtml, resolveMailDraft } from './rfq-mail-builder';
import { buildRfqCreateInput, buildRfqFieldSpecInputs } from './rfq-builders';

type VendorRecipient = {
  vendorId: string;
  officeId: string;
  companyName: string;
  officeName: string | null;
  email: string;
  contactName: string | null;
  salutation: string | null;
  cc: string[];
};

type OfficeSelection = {
  vendorId: string;
  officeId: string;
};

type VendorRecipientLookups = {
  vendorsById: Map<string, VendorMaster>;
  officesByVendorId: Map<string, VendorOffice[]>;
  contactsByOfficeId: Map<string, VendorContact[]>;
  ccByOfficeId: Map<string, VendorCcRecipient[]>;
};

@Injectable()
export class RfqsService {
  constructor(
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(RfqFieldSpec)
    private readonly fieldSpecRepo: Repository<RfqFieldSpec>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(VendorMaster, 'business')
    private readonly vendorRepo: Repository<VendorMaster>,
    @InjectRepository(VendorOffice, 'business')
    private readonly officeRepo: Repository<VendorOffice>,
    @InjectRepository(VendorContact, 'business')
    private readonly contactRepo: Repository<VendorContact>,
    @InjectRepository(VendorCcRecipient, 'business')
    private readonly ccRepo: Repository<VendorCcRecipient>,
    private readonly outlookService: OutlookService,
  ) {}

  list() {
    return this.rfqRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateRfqDto, user: User) {
    const rfq = await this.createDraftRfq(dto, user);
    await this.saveFieldSpecs(rfq.id, dto);

    if (dto.sendNow) {
      await this.completeRfqSend(rfq, dto, user);
    }

    return this.rfqRepo.findOne({ where: { id: rfq.id } });
  }

  private async createDraftRfq(dto: CreateRfqDto, user: User) {
    const draftDto = dto.sendNow ? { ...dto, sendNow: false } : dto;

    return this.rfqRepo.save(
      this.rfqRepo.create(buildRfqCreateInput(draftDto, user.id)),
    );
  }

  private async saveFieldSpecs(rfqId: string, dto: CreateRfqDto) {
    await this.fieldSpecRepo.save(
      buildRfqFieldSpecInputs(rfqId, dto).map((fieldSpec) =>
        this.fieldSpecRepo.create(fieldSpec),
      ),
    );
  }

  private async completeRfqSend(rfq: Rfq, dto: CreateRfqDto, user: User) {
    await this.sendRfqToSelectedVendors(rfq, dto, user);
    await this.markRfqAsSent(rfq, dto.mailSubject);
    await this.markInquiryAsRfqSent(rfq.inquiryId);
  }

  private async sendRfqToSelectedVendors(
    rfq: Rfq,
    dto: CreateRfqDto,
    user: User,
  ) {
    const inquiry = await this.findInquiryForRfqOrThrow(rfq.inquiryId);

    const recipients = await this.resolveVendorRecipients(
      dto.vendorIds,
      dto.officeSelections ?? [],
    );
    const mailDraft = resolveMailDraft(dto, inquiry, user.name ?? user.email);

    for (const recipient of recipients) {
      await this.sendRfqMailToRecipient(
        user,
        recipient,
        mailDraft.subjectLine,
        mailDraft.bodyHtml,
      );
    }
  }

  private async findInquiryForRfqOrThrow(inquiryId: string) {
    const inquiry = await this.inquiryRepo.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found for this RFQ.');
    }

    return inquiry;
  }

  private async sendRfqMailToRecipient(
    user: User,
    recipient: VendorRecipient,
    subjectLine: string,
    bodyHtml: string,
  ) {
    await this.outlookService.sendMail(user, {
      subject: subjectLine,
      htmlBody: personalizeMailBodyHtml(bodyHtml, {
        companyName: recipient.companyName,
        contactName: recipient.contactName,
        salutation: recipient.salutation,
        senderName: user.name ?? user.email,
        emailSignature: user.emailSignature,
      }),
      to: [{ address: recipient.email, name: recipient.contactName }],
      cc: recipient.cc.map((address) => ({ address })),
    });
  }

  private async markRfqAsSent(rfq: Rfq, mailSubject?: string | null) {
    rfq.sent = true;
    rfq.sentAt = new Date();
    rfq.subjectLine = mailSubject?.trim() || rfq.subjectLine || null;
    await this.rfqRepo.save(rfq);
  }

  private async markInquiryAsRfqSent(inquiryId: string) {
    const inquiry = await this.inquiryRepo.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry || inquiry.status === InquiryStatus.RFQ_SENT) {
      return;
    }

    inquiry.status = InquiryStatus.RFQ_SENT;
    await this.inquiryRepo.save(inquiry);
  }

  private async resolveVendorRecipients(
    vendorIds: string[],
    officeSelections: OfficeSelection[],
  ) {
    const uniqueVendorIds = this.getUniqueVendorIdsOrThrow(vendorIds);
    const officeSelectionMap = this.buildOfficeSelectionMap(officeSelections);
    const lookups = await this.loadVendorRecipientLookups(uniqueVendorIds);

    const missingRecipients: string[] = [];
    const recipients: VendorRecipient[] = [];

    for (const vendorId of uniqueVendorIds) {
      recipients.push(
        ...this.resolveRecipientsForVendor(
          vendorId,
          lookups,
          officeSelectionMap.get(vendorId) ?? [],
          missingRecipients,
        ),
      );
    }

    this.throwIfRecipientsMissing(missingRecipients);
    return this.dedupeRecipients(recipients);
  }

  private resolveRecipientsForVendor(
    vendorId: string,
    lookups: VendorRecipientLookups,
    selectedOfficeIds: string[],
    missingRecipients: string[],
  ) {
    const vendor = lookups.vendorsById.get(vendorId);

    if (!vendor) {
      missingRecipients.push(`Unknown vendor (${vendorId})`);
      return [];
    }

    const targetOffices = this.resolveTargetOfficesForVendor(
      vendor,
      lookups.officesByVendorId.get(vendorId) ?? [],
      selectedOfficeIds,
      missingRecipients,
    );

    if (targetOffices.length === 0) {
      missingRecipients.push(vendor.companyName);
      return [];
    }

    return targetOffices.flatMap((office) => {
      const recipient = this.buildVendorRecipient(
        vendor,
        office,
        lookups.contactsByOfficeId.get(office.id) ?? [],
        lookups.ccByOfficeId.get(office.id) ?? [],
      );

      if (!recipient) {
        missingRecipients.push(
          `${vendor.companyName} (${office.officeName} has no usable contact email)`,
        );
        return [];
      }

      return [recipient];
    });
  }

  private getUniqueVendorIdsOrThrow(vendorIds: string[]) {
    const uniqueVendorIds = Array.from(new Set(vendorIds));

    if (uniqueVendorIds.length === 0) {
      throw new BadRequestException(
        'Please select at least one vendor before sending the RFQ.',
      );
    }

    return uniqueVendorIds;
  }

  private buildOfficeSelectionMap(officeSelections: OfficeSelection[]) {
    return officeSelections.reduce<Map<string, string[]>>((map, selection) => {
      const currentSelections = map.get(selection.vendorId) ?? [];
      currentSelections.push(selection.officeId);
      map.set(selection.vendorId, currentSelections);
      return map;
    }, new Map());
  }

  private async loadVendorRecipientLookups(
    vendorIds: string[],
  ): Promise<VendorRecipientLookups> {
    const [vendors, offices] = await Promise.all([
      this.vendorRepo.find({
        where: { id: In(vendorIds) },
      }),
      this.officeRepo.find({
        where: { vendorId: In(vendorIds) },
        order: { createdAt: 'ASC' },
      }),
    ]);

    const officeIds = offices.map((office) => office.id);
    const [contacts, ccRecipients] = officeIds.length
      ? await Promise.all([
          this.contactRepo.find({
            where: { officeId: In(officeIds), isActive: true },
            order: { isPrimary: 'DESC', createdAt: 'ASC' },
          }),
          this.ccRepo.find({
            where: { officeId: In(officeIds), isActive: true },
            order: { createdAt: 'ASC' },
          }),
        ])
      : [[], []];

    return {
      vendorsById: new Map(vendors.map((vendor) => [vendor.id, vendor])),
      officesByVendorId: this.groupBy(offices, (office) => office.vendorId),
      contactsByOfficeId: this.groupBy(contacts, (contact) => contact.officeId),
      ccByOfficeId: this.groupBy(
        ccRecipients,
        (recipient) => recipient.officeId,
      ),
    };
  }

  private resolveTargetOfficesForVendor(
    vendor: VendorMaster,
    vendorOffices: VendorOffice[],
    selectedOfficeIds: string[],
    missingRecipients: string[],
  ) {
    const normalizedOfficeIds = Array.from(new Set(selectedOfficeIds));

    if (normalizedOfficeIds.length > 0) {
      return normalizedOfficeIds
        .map((selectedOfficeId) => {
          const office = vendorOffices.find(
            (candidateOffice) => candidateOffice.id === selectedOfficeId,
          );

          if (!office) {
            missingRecipients.push(
              `${vendor.companyName} (selected office not found)`,
            );
            return null;
          }

          return office;
        })
        .filter((office): office is VendorOffice => Boolean(office));
    }

    const fallbackOffice = this.pickFallbackOffice(vendor, vendorOffices);
    return fallbackOffice ? [fallbackOffice] : [];
  }

  private pickFallbackOffice(
    vendor: VendorMaster,
    vendorOffices: VendorOffice[],
  ) {
    return (
      vendorOffices.find(
        (office) => office.id === vendor.primaryOfficeId && office.isActive,
      ) ??
      vendorOffices.find((office) => office.isActive) ??
      vendorOffices[0]
    );
  }

  private buildVendorRecipient(
    vendor: VendorMaster,
    office: VendorOffice,
    contacts: VendorContact[],
    ccRecipients: VendorCcRecipient[],
  ): VendorRecipient | null {
    const chosenContact = this.pickContactWithUsableEmail(contacts);
    const primaryEmail =
      normalizeEmail(chosenContact?.emailPrimary) ??
      normalizeEmail(chosenContact?.emailSecondary);

    if (!primaryEmail) {
      return null;
    }

    return {
      vendorId: vendor.id,
      officeId: office.id,
      companyName: vendor.companyName,
      officeName: office.officeName,
      email: primaryEmail,
      contactName: chosenContact?.contactName ?? null,
      salutation: chosenContact?.salutation ?? null,
      cc: this.collectCcEmails(ccRecipients, primaryEmail),
    };
  }

  private pickContactWithUsableEmail(contacts: VendorContact[]) {
    return (
      contacts.find((contact) =>
        Boolean(
          normalizeEmail(contact.emailPrimary) ||
          normalizeEmail(contact.emailSecondary),
        ),
      ) ?? null
    );
  }

  private collectCcEmails(
    ccRecipients: VendorCcRecipient[],
    primaryEmail: string,
  ) {
    return Array.from(
      new Set(
        ccRecipients
          .map((recipient) => normalizeEmail(recipient.email))
          .filter(
            (address): address is string =>
              Boolean(address) && address !== primaryEmail,
          ),
      ),
    );
  }

  private throwIfRecipientsMissing(missingRecipients: string[]) {
    if (missingRecipients.length === 0) {
      return;
    }

    throw new BadRequestException(
      `The selected vendors are missing a usable contact email: ${missingRecipients.join(
        ', ',
      )}. Please update Vendor Master before sending.`,
    );
  }

  private dedupeRecipients(recipients: VendorRecipient[]) {
    return Array.from(
      new Map(
        recipients.map((recipient) => [
          `${recipient.vendorId}::${recipient.officeId}::${recipient.email}`,
          recipient,
        ]),
      ).values(),
    );
  }

  private groupBy<TItem>(items: TItem[], getKey: (item: TItem) => string) {
    return items.reduce<Map<string, TItem[]>>((map, item) => {
      const key = getKey(item);
      const current = map.get(key) ?? [];
      current.push(item);
      map.set(key, current);
      return map;
    }, new Map());
  }
}
