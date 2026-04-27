import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';
import {
  getEmailDomain,
  normalizeEmail,
} from '../../../common/normalization/email';
import { Inquiry } from '../../inquiries/entities/inquiry.entity';
import { Rfq } from '../../rfqs/entities/rfq.entity';
import { VendorCcRecipient } from '../../vendors/entities/vendor-cc-recipient.entity';
import { VendorContact } from '../../vendors/entities/vendor-contact.entity';
import { VendorOffice } from '../../vendors/entities/vendor-office.entity';

type MatchCandidate = {
  fromEmail: string | null;
  subject: string | null;
};

export type QuoteMessageMatch = {
  inquiryNumber: string | null;
  matchedInquiryId: string | null;
  matchedRfqId: string | null;
  matchedVendorId: string | null;
  matchConfidence: 'none' | 'low' | 'medium' | 'high';
  matchReason: string;
  matchedBy: string[];
  suggestedVendorIds: string[];
  suggestedRfqIds: string[];
};

@Injectable()
export class QuoteMatchingService {
  private static readonly INQUIRY_NUMBER_REGEX = /\bE\d{6}\b/i;

  constructor(
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(VendorContact, 'business')
    private readonly contactRepo: Repository<VendorContact>,
    @InjectRepository(VendorCcRecipient, 'business')
    private readonly ccRepo: Repository<VendorCcRecipient>,
    @InjectRepository(VendorOffice, 'business')
    private readonly officeRepo: Repository<VendorOffice>,
  ) {}

  extractInquiryNumber(subject?: string | null) {
    const match = subject?.match(QuoteMatchingService.INQUIRY_NUMBER_REGEX);
    return match ? match[0].toUpperCase() : null;
  }

  async matchMessage(candidate: MatchCandidate): Promise<QuoteMessageMatch> {
    const inquiryNumber = this.extractInquiryNumber(candidate.subject);
    const inquiry = inquiryNumber
      ? await this.inquiryRepo.findOne({ where: { inquiryNumber } })
      : null;
    const rfqs = inquiry
      ? await this.findRfqsForInquiry(inquiry.id)
      : [];
    const inquiryVendorIds = Array.from(
      new Set(rfqs.flatMap((rfq) => rfq.vendorIds ?? [])),
    );
    const vendorMatch = await this.findVendorMatchBySenderEmail(
      candidate.fromEmail,
      inquiryVendorIds,
    );
    const rfqMatch = this.findRfqMatch({
      rfqs,
      subject: candidate.subject,
      matchedVendorId: vendorMatch.matchedVendorId,
    });
    const matchedBy = [
      ...(inquiry ? ['inquiry_number'] : []),
      ...(vendorMatch.matchedBy ?? []),
      ...(rfqMatch.matchedBy ?? []),
    ];

    return this.buildMatchResult({
      inquiryNumber,
      matchedInquiryId: inquiry?.id ?? null,
      matchedRfqId: rfqMatch.matchedRfqId,
      matchedVendorId: vendorMatch.matchedVendorId,
      matchedBy,
      suggestedVendorIds: vendorMatch.suggestedVendorIds,
      suggestedRfqIds: rfqMatch.suggestedRfqIds,
    });
  }

  private async findRfqsForInquiry(inquiryId: string) {
    return this.rfqRepo.find({
      where: { inquiryId, sent: true },
      order: { sentAt: 'DESC', createdAt: 'DESC' },
    });
  }

  private findRfqMatch(input: {
    rfqs: Rfq[];
    subject: string | null;
    matchedVendorId: string | null;
  }) {
    const { rfqs, subject, matchedVendorId } = input;
    if (rfqs.length === 0) {
      return {
        matchedRfqId: null,
        suggestedRfqIds: [],
        matchedBy: [] as string[],
      };
    }

    if (matchedVendorId) {
      const vendorScopedRfqs = rfqs.filter((rfq) =>
        (rfq.vendorIds ?? []).includes(matchedVendorId),
      );
      if (vendorScopedRfqs.length === 1) {
        return {
          matchedRfqId: vendorScopedRfqs[0].id,
          suggestedRfqIds: vendorScopedRfqs.map((rfq) => rfq.id),
          matchedBy: ['rfq_vendor_membership'],
        };
      }
    }

    if (rfqs.length === 1) {
      return {
        matchedRfqId: rfqs[0].id,
        suggestedRfqIds: [rfqs[0].id],
        matchedBy: ['single_rfq_for_inquiry'],
      };
    }

    const normalizedSubject = subject?.trim().toLowerCase();
    if (!normalizedSubject) {
      return {
        matchedRfqId: null,
        suggestedRfqIds: rfqs.map((rfq) => rfq.id),
        matchedBy: [] as string[],
      };
    }

    const subjectMatches = rfqs.filter((rfq) => {
      const normalizedRfqSubject = rfq.subjectLine?.trim().toLowerCase();
      return (
        normalizedRfqSubject &&
        (normalizedSubject.includes(normalizedRfqSubject) ||
          normalizedRfqSubject.includes(normalizedSubject))
      );
    });

    return {
      matchedRfqId: subjectMatches.length === 1 ? subjectMatches[0].id : null,
      suggestedRfqIds:
        subjectMatches.length > 0
          ? subjectMatches.map((rfq) => rfq.id)
          : rfqs.map((rfq) => rfq.id),
      matchedBy: subjectMatches.length === 1 ? ['rfq_subject_match'] : [],
    };
  }

  private async findVendorMatchBySenderEmail(
    fromEmail: string | null,
    inquiryVendorIds: string[],
  ) {
    const normalizedEmail = normalizeEmail(fromEmail);
    if (!normalizedEmail) {
      return {
        matchedVendorId: null,
        suggestedVendorIds: [],
        matchedBy: [] as string[],
      };
    }

    const exactMatchOfficeIds = await this.findOfficeIdsByExactEmail(
      normalizedEmail,
    );
    const exactMatchVendorIds = await this.findVendorIdsForOfficeIds(
      exactMatchOfficeIds,
      inquiryVendorIds,
    );
    if (exactMatchVendorIds.length === 1) {
      return {
        matchedVendorId: exactMatchVendorIds[0],
        suggestedVendorIds: exactMatchVendorIds,
        matchedBy: ['sender_exact_email'],
      };
    }

    const domain = getEmailDomain(normalizedEmail);
    const domainMatchOfficeIds = domain
      ? await this.findOfficeIdsByEmailDomain(domain)
      : [];
    const domainMatchVendorIds = await this.findVendorIdsForOfficeIds(
      domainMatchOfficeIds,
      inquiryVendorIds,
    );

    return {
      matchedVendorId:
        exactMatchVendorIds.length === 1
          ? exactMatchVendorIds[0]
          : domainMatchVendorIds.length === 1
            ? domainMatchVendorIds[0]
            : null,
      suggestedVendorIds:
        exactMatchVendorIds.length > 0 ? exactMatchVendorIds : domainMatchVendorIds,
      matchedBy:
        exactMatchVendorIds.length > 0
          ? ['sender_exact_email']
          : domainMatchVendorIds.length > 0
            ? ['sender_email_domain']
            : [],
    };
  }

  private async findOfficeIdsByExactEmail(normalizedEmail: string) {
    const [contacts, ccRecipients] = await Promise.all([
      this.contactRepo.find({
        where: [
          {
            isActive: true,
            emailPrimary: Raw((alias) => `LOWER(${alias}) = :email`, {
              email: normalizedEmail,
            }),
          },
          {
            isActive: true,
            emailSecondary: Raw((alias) => `LOWER(${alias}) = :email`, {
              email: normalizedEmail,
            }),
          },
        ],
      }),
      this.ccRepo.find({
        where: {
          isActive: true,
          email: Raw((alias) => `LOWER(${alias}) = :email`, {
            email: normalizedEmail,
          }),
        },
      }),
    ]);

    return Array.from(
      new Set([
        ...contacts.map((contact) => contact.officeId),
        ...ccRecipients.map((recipient) => recipient.officeId),
      ]),
    );
  }

  private async findOfficeIdsByEmailDomain(domain: string) {
    const domainPattern = `%@${domain}`;
    const [contacts, ccRecipients] = await Promise.all([
      this.contactRepo.find({
        where: [
          {
            isActive: true,
            emailPrimary: Raw((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
              domainPattern,
            }),
          },
          {
            isActive: true,
            emailSecondary: Raw((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
              domainPattern,
            }),
          },
        ],
      }),
      this.ccRepo.find({
        where: {
          isActive: true,
          email: Raw((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
            domainPattern,
          }),
        },
      }),
    ]);

    return Array.from(
      new Set([
        ...contacts.map((contact) => contact.officeId),
        ...ccRecipients.map((recipient) => recipient.officeId),
      ]),
    );
  }

  private async findVendorIdsForOfficeIds(
    officeIds: string[],
    inquiryVendorIds: string[],
  ) {
    if (officeIds.length === 0) {
      return [];
    }

    const offices = await this.officeRepo.findBy({ id: In(officeIds) });
    const vendorIds = Array.from(new Set(offices.map((office) => office.vendorId)));
    if (inquiryVendorIds.length === 0) {
      return vendorIds;
    }

    const inquiryVendorIdSet = new Set(inquiryVendorIds);
    return vendorIds.filter((vendorId) => inquiryVendorIdSet.has(vendorId));
  }

  private buildMatchResult(input: {
    inquiryNumber: string | null;
    matchedInquiryId: string | null;
    matchedRfqId: string | null;
    matchedVendorId: string | null;
    matchedBy: string[];
    suggestedVendorIds: string[];
    suggestedRfqIds: string[];
  }): QuoteMessageMatch {
    const { matchedInquiryId, matchedRfqId, matchedVendorId } = input;
    const matchConfidence =
      matchedInquiryId && matchedRfqId && matchedVendorId
        ? 'high'
        : matchedInquiryId && (matchedRfqId || matchedVendorId)
          ? 'medium'
          : matchedInquiryId
            ? 'low'
            : 'none';

    const matchReason =
      matchConfidence === 'high'
        ? 'inquiry_vendor_rfq_resolved'
        : matchConfidence === 'medium'
          ? 'inquiry_matched_partial_resolution'
          : matchConfidence === 'low'
            ? 'inquiry_matched_needs_review'
            : 'no_inquiry_match';

    return {
      ...input,
      matchConfidence,
      matchReason,
    };
  }
}
