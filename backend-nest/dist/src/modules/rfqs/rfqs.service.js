"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RfqsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_1 = require("../../common/normalization/email");
const inquiry_entity_1 = require("../inquiries/entities/inquiry.entity");
const outlook_service_1 = require("../outlook/outlook.service");
const vendor_cc_recipient_entity_1 = require("../vendors/entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("../vendors/entities/vendor-contact.entity");
const vendor_master_entity_1 = require("../vendors/entities/vendor-master.entity");
const vendor_office_entity_1 = require("../vendors/entities/vendor-office.entity");
const rfq_field_spec_entity_1 = require("./entities/rfq-field-spec.entity");
const rfq_entity_1 = require("./entities/rfq.entity");
const rfq_mail_builder_1 = require("./rfq-mail-builder");
const rfq_builders_1 = require("./rfq-builders");
let RfqsService = class RfqsService {
    rfqRepo;
    fieldSpecRepo;
    inquiryRepo;
    vendorRepo;
    officeRepo;
    contactRepo;
    ccRepo;
    outlookService;
    constructor(rfqRepo, fieldSpecRepo, inquiryRepo, vendorRepo, officeRepo, contactRepo, ccRepo, outlookService) {
        this.rfqRepo = rfqRepo;
        this.fieldSpecRepo = fieldSpecRepo;
        this.inquiryRepo = inquiryRepo;
        this.vendorRepo = vendorRepo;
        this.officeRepo = officeRepo;
        this.contactRepo = contactRepo;
        this.ccRepo = ccRepo;
        this.outlookService = outlookService;
    }
    list() {
        return this.rfqRepo.find({ order: { createdAt: 'DESC' } });
    }
    async create(dto, user) {
        const rfq = await this.createDraftRfq(dto, user);
        await this.saveFieldSpecs(rfq.id, dto);
        if (dto.sendNow) {
            await this.completeRfqSend(rfq, dto, user);
        }
        return this.rfqRepo.findOne({ where: { id: rfq.id } });
    }
    async createDraftRfq(dto, user) {
        const draftDto = dto.sendNow ? { ...dto, sendNow: false } : dto;
        return this.rfqRepo.save(this.rfqRepo.create((0, rfq_builders_1.buildRfqCreateInput)(draftDto, user.id)));
    }
    async saveFieldSpecs(rfqId, dto) {
        await this.fieldSpecRepo.save((0, rfq_builders_1.buildRfqFieldSpecInputs)(rfqId, dto).map((fieldSpec) => this.fieldSpecRepo.create(fieldSpec)));
    }
    async completeRfqSend(rfq, dto, user) {
        await this.sendRfqToSelectedVendors(rfq, dto, user);
        await this.markRfqAsSent(rfq, dto.mailSubject);
        await this.markInquiryAsRfqSent(rfq.inquiryId);
    }
    async sendRfqToSelectedVendors(rfq, dto, user) {
        const inquiry = await this.findInquiryForRfqOrThrow(rfq.inquiryId);
        const recipients = await this.resolveVendorRecipients(dto.vendorIds, dto.officeSelections ?? []);
        const mailDraft = (0, rfq_mail_builder_1.resolveMailDraft)(dto, inquiry, user.name ?? user.email);
        for (const recipient of recipients) {
            await this.sendRfqMailToRecipient(user, recipient, mailDraft.subjectLine, mailDraft.bodyHtml);
        }
    }
    async findInquiryForRfqOrThrow(inquiryId) {
        const inquiry = await this.inquiryRepo.findOne({
            where: { id: inquiryId },
        });
        if (!inquiry) {
            throw new common_1.NotFoundException('Inquiry not found for this RFQ.');
        }
        return inquiry;
    }
    async sendRfqMailToRecipient(user, recipient, subjectLine, bodyHtml) {
        await this.outlookService.sendMail(user, {
            subject: subjectLine,
            htmlBody: (0, rfq_mail_builder_1.personalizeMailBodyHtml)(bodyHtml, {
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
    async markRfqAsSent(rfq, mailSubject) {
        rfq.sent = true;
        rfq.sentAt = new Date();
        rfq.subjectLine = mailSubject?.trim() || rfq.subjectLine || null;
        await this.rfqRepo.save(rfq);
    }
    async markInquiryAsRfqSent(inquiryId) {
        const inquiry = await this.inquiryRepo.findOne({
            where: { id: inquiryId },
        });
        if (!inquiry || inquiry.status === inquiry_entity_1.InquiryStatus.RFQ_SENT) {
            return;
        }
        inquiry.status = inquiry_entity_1.InquiryStatus.RFQ_SENT;
        await this.inquiryRepo.save(inquiry);
    }
    async resolveVendorRecipients(vendorIds, officeSelections) {
        const uniqueVendorIds = this.getUniqueVendorIdsOrThrow(vendorIds);
        const officeSelectionMap = this.buildOfficeSelectionMap(officeSelections);
        const lookups = await this.loadVendorRecipientLookups(uniqueVendorIds);
        const missingRecipients = [];
        const recipients = [];
        for (const vendorId of uniqueVendorIds) {
            recipients.push(...this.resolveRecipientsForVendor(vendorId, lookups, officeSelectionMap.get(vendorId) ?? [], missingRecipients));
        }
        this.throwIfRecipientsMissing(missingRecipients);
        return this.dedupeRecipients(recipients);
    }
    resolveRecipientsForVendor(vendorId, lookups, selectedOfficeIds, missingRecipients) {
        const vendor = lookups.vendorsById.get(vendorId);
        if (!vendor) {
            missingRecipients.push(`Unknown vendor (${vendorId})`);
            return [];
        }
        const targetOffices = this.resolveTargetOfficesForVendor(vendor, lookups.officesByVendorId.get(vendorId) ?? [], selectedOfficeIds, missingRecipients);
        if (targetOffices.length === 0) {
            missingRecipients.push(vendor.companyName);
            return [];
        }
        return targetOffices.flatMap((office) => {
            const recipient = this.buildVendorRecipient(vendor, office, lookups.contactsByOfficeId.get(office.id) ?? [], lookups.ccByOfficeId.get(office.id) ?? []);
            if (!recipient) {
                missingRecipients.push(`${vendor.companyName} (${office.officeName} has no usable contact email)`);
                return [];
            }
            return [recipient];
        });
    }
    getUniqueVendorIdsOrThrow(vendorIds) {
        const uniqueVendorIds = Array.from(new Set(vendorIds));
        if (uniqueVendorIds.length === 0) {
            throw new common_1.BadRequestException('Please select at least one vendor before sending the RFQ.');
        }
        return uniqueVendorIds;
    }
    buildOfficeSelectionMap(officeSelections) {
        return officeSelections.reduce((map, selection) => {
            const currentSelections = map.get(selection.vendorId) ?? [];
            currentSelections.push(selection.officeId);
            map.set(selection.vendorId, currentSelections);
            return map;
        }, new Map());
    }
    async loadVendorRecipientLookups(vendorIds) {
        const [vendors, offices] = await Promise.all([
            this.vendorRepo.find({
                where: { id: (0, typeorm_2.In)(vendorIds) },
            }),
            this.officeRepo.find({
                where: { vendorId: (0, typeorm_2.In)(vendorIds) },
                order: { createdAt: 'ASC' },
            }),
        ]);
        const officeIds = offices.map((office) => office.id);
        const [contacts, ccRecipients] = officeIds.length
            ? await Promise.all([
                this.contactRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds), isActive: true },
                    order: { isPrimary: 'DESC', createdAt: 'ASC' },
                }),
                this.ccRepo.find({
                    where: { officeId: (0, typeorm_2.In)(officeIds), isActive: true },
                    order: { createdAt: 'ASC' },
                }),
            ])
            : [[], []];
        return {
            vendorsById: new Map(vendors.map((vendor) => [vendor.id, vendor])),
            officesByVendorId: this.groupBy(offices, (office) => office.vendorId),
            contactsByOfficeId: this.groupBy(contacts, (contact) => contact.officeId),
            ccByOfficeId: this.groupBy(ccRecipients, (recipient) => recipient.officeId),
        };
    }
    resolveTargetOfficesForVendor(vendor, vendorOffices, selectedOfficeIds, missingRecipients) {
        const normalizedOfficeIds = Array.from(new Set(selectedOfficeIds));
        if (normalizedOfficeIds.length > 0) {
            return normalizedOfficeIds
                .map((selectedOfficeId) => {
                const office = vendorOffices.find((candidateOffice) => candidateOffice.id === selectedOfficeId);
                if (!office) {
                    missingRecipients.push(`${vendor.companyName} (selected office not found)`);
                    return null;
                }
                return office;
            })
                .filter((office) => Boolean(office));
        }
        const fallbackOffice = this.pickFallbackOffice(vendor, vendorOffices);
        return fallbackOffice ? [fallbackOffice] : [];
    }
    pickFallbackOffice(vendor, vendorOffices) {
        return (vendorOffices.find((office) => office.id === vendor.primaryOfficeId && office.isActive) ??
            vendorOffices.find((office) => office.isActive) ??
            vendorOffices[0]);
    }
    buildVendorRecipient(vendor, office, contacts, ccRecipients) {
        const chosenContact = this.pickContactWithUsableEmail(contacts);
        const primaryEmail = (0, email_1.normalizeEmail)(chosenContact?.emailPrimary) ??
            (0, email_1.normalizeEmail)(chosenContact?.emailSecondary);
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
    pickContactWithUsableEmail(contacts) {
        return (contacts.find((contact) => Boolean((0, email_1.normalizeEmail)(contact.emailPrimary) ||
            (0, email_1.normalizeEmail)(contact.emailSecondary))) ?? null);
    }
    collectCcEmails(ccRecipients, primaryEmail) {
        return Array.from(new Set(ccRecipients
            .map((recipient) => (0, email_1.normalizeEmail)(recipient.email))
            .filter((address) => Boolean(address) && address !== primaryEmail)));
    }
    throwIfRecipientsMissing(missingRecipients) {
        if (missingRecipients.length === 0) {
            return;
        }
        throw new common_1.BadRequestException(`The selected vendors are missing a usable contact email: ${missingRecipients.join(', ')}. Please update Vendor Master before sending.`);
    }
    dedupeRecipients(recipients) {
        return Array.from(new Map(recipients.map((recipient) => [
            `${recipient.vendorId}::${recipient.officeId}::${recipient.email}`,
            recipient,
        ])).values());
    }
    groupBy(items, getKey) {
        return items.reduce((map, item) => {
            const key = getKey(item);
            const current = map.get(key) ?? [];
            current.push(item);
            map.set(key, current);
            return map;
        }, new Map());
    }
};
exports.RfqsService = RfqsService;
exports.RfqsService = RfqsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rfq_entity_1.Rfq)),
    __param(1, (0, typeorm_1.InjectRepository)(rfq_field_spec_entity_1.RfqFieldSpec)),
    __param(2, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_master_entity_1.VendorMaster, 'business')),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_office_entity_1.VendorOffice, 'business')),
    __param(5, (0, typeorm_1.InjectRepository)(vendor_contact_entity_1.VendorContact, 'business')),
    __param(6, (0, typeorm_1.InjectRepository)(vendor_cc_recipient_entity_1.VendorCcRecipient, 'business')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        outlook_service_1.OutlookService])
], RfqsService);
//# sourceMappingURL=rfqs.service.js.map