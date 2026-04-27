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
var QuoteMatchingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteMatchingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_1 = require("../../../common/normalization/email");
const inquiry_entity_1 = require("../../inquiries/entities/inquiry.entity");
const rfq_entity_1 = require("../../rfqs/entities/rfq.entity");
const vendor_cc_recipient_entity_1 = require("../../vendors/entities/vendor-cc-recipient.entity");
const vendor_contact_entity_1 = require("../../vendors/entities/vendor-contact.entity");
const vendor_office_entity_1 = require("../../vendors/entities/vendor-office.entity");
let QuoteMatchingService = class QuoteMatchingService {
    static { QuoteMatchingService_1 = this; }
    rfqRepo;
    inquiryRepo;
    contactRepo;
    ccRepo;
    officeRepo;
    static INQUIRY_NUMBER_REGEX = /\bE\d{6}\b/i;
    constructor(rfqRepo, inquiryRepo, contactRepo, ccRepo, officeRepo) {
        this.rfqRepo = rfqRepo;
        this.inquiryRepo = inquiryRepo;
        this.contactRepo = contactRepo;
        this.ccRepo = ccRepo;
        this.officeRepo = officeRepo;
    }
    extractInquiryNumber(subject) {
        const match = subject?.match(QuoteMatchingService_1.INQUIRY_NUMBER_REGEX);
        return match ? match[0].toUpperCase() : null;
    }
    async matchMessage(candidate) {
        const inquiryNumber = this.extractInquiryNumber(candidate.subject);
        const inquiry = inquiryNumber
            ? await this.inquiryRepo.findOne({ where: { inquiryNumber } })
            : null;
        const rfqs = inquiry
            ? await this.findRfqsForInquiry(inquiry.id)
            : [];
        const inquiryVendorIds = Array.from(new Set(rfqs.flatMap((rfq) => rfq.vendorIds ?? [])));
        const vendorMatch = await this.findVendorMatchBySenderEmail(candidate.fromEmail, inquiryVendorIds);
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
    async findRfqsForInquiry(inquiryId) {
        return this.rfqRepo.find({
            where: { inquiryId, sent: true },
            order: { sentAt: 'DESC', createdAt: 'DESC' },
        });
    }
    findRfqMatch(input) {
        const { rfqs, subject, matchedVendorId } = input;
        if (rfqs.length === 0) {
            return {
                matchedRfqId: null,
                suggestedRfqIds: [],
                matchedBy: [],
            };
        }
        if (matchedVendorId) {
            const vendorScopedRfqs = rfqs.filter((rfq) => (rfq.vendorIds ?? []).includes(matchedVendorId));
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
                matchedBy: [],
            };
        }
        const subjectMatches = rfqs.filter((rfq) => {
            const normalizedRfqSubject = rfq.subjectLine?.trim().toLowerCase();
            return (normalizedRfqSubject &&
                (normalizedSubject.includes(normalizedRfqSubject) ||
                    normalizedRfqSubject.includes(normalizedSubject)));
        });
        return {
            matchedRfqId: subjectMatches.length === 1 ? subjectMatches[0].id : null,
            suggestedRfqIds: subjectMatches.length > 0
                ? subjectMatches.map((rfq) => rfq.id)
                : rfqs.map((rfq) => rfq.id),
            matchedBy: subjectMatches.length === 1 ? ['rfq_subject_match'] : [],
        };
    }
    async findVendorMatchBySenderEmail(fromEmail, inquiryVendorIds) {
        const normalizedEmail = (0, email_1.normalizeEmail)(fromEmail);
        if (!normalizedEmail) {
            return {
                matchedVendorId: null,
                suggestedVendorIds: [],
                matchedBy: [],
            };
        }
        const exactMatchOfficeIds = await this.findOfficeIdsByExactEmail(normalizedEmail);
        const exactMatchVendorIds = await this.findVendorIdsForOfficeIds(exactMatchOfficeIds, inquiryVendorIds);
        if (exactMatchVendorIds.length === 1) {
            return {
                matchedVendorId: exactMatchVendorIds[0],
                suggestedVendorIds: exactMatchVendorIds,
                matchedBy: ['sender_exact_email'],
            };
        }
        const domain = (0, email_1.getEmailDomain)(normalizedEmail);
        const domainMatchOfficeIds = domain
            ? await this.findOfficeIdsByEmailDomain(domain)
            : [];
        const domainMatchVendorIds = await this.findVendorIdsForOfficeIds(domainMatchOfficeIds, inquiryVendorIds);
        return {
            matchedVendorId: exactMatchVendorIds.length === 1
                ? exactMatchVendorIds[0]
                : domainMatchVendorIds.length === 1
                    ? domainMatchVendorIds[0]
                    : null,
            suggestedVendorIds: exactMatchVendorIds.length > 0 ? exactMatchVendorIds : domainMatchVendorIds,
            matchedBy: exactMatchVendorIds.length > 0
                ? ['sender_exact_email']
                : domainMatchVendorIds.length > 0
                    ? ['sender_email_domain']
                    : [],
        };
    }
    async findOfficeIdsByExactEmail(normalizedEmail) {
        const [contacts, ccRecipients] = await Promise.all([
            this.contactRepo.find({
                where: [
                    {
                        isActive: true,
                        emailPrimary: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) = :email`, {
                            email: normalizedEmail,
                        }),
                    },
                    {
                        isActive: true,
                        emailSecondary: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) = :email`, {
                            email: normalizedEmail,
                        }),
                    },
                ],
            }),
            this.ccRepo.find({
                where: {
                    isActive: true,
                    email: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) = :email`, {
                        email: normalizedEmail,
                    }),
                },
            }),
        ]);
        return Array.from(new Set([
            ...contacts.map((contact) => contact.officeId),
            ...ccRecipients.map((recipient) => recipient.officeId),
        ]));
    }
    async findOfficeIdsByEmailDomain(domain) {
        const domainPattern = `%@${domain}`;
        const [contacts, ccRecipients] = await Promise.all([
            this.contactRepo.find({
                where: [
                    {
                        isActive: true,
                        emailPrimary: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
                            domainPattern,
                        }),
                    },
                    {
                        isActive: true,
                        emailSecondary: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
                            domainPattern,
                        }),
                    },
                ],
            }),
            this.ccRepo.find({
                where: {
                    isActive: true,
                    email: (0, typeorm_2.Raw)((alias) => `LOWER(${alias}) LIKE :domainPattern`, {
                        domainPattern,
                    }),
                },
            }),
        ]);
        return Array.from(new Set([
            ...contacts.map((contact) => contact.officeId),
            ...ccRecipients.map((recipient) => recipient.officeId),
        ]));
    }
    async findVendorIdsForOfficeIds(officeIds, inquiryVendorIds) {
        if (officeIds.length === 0) {
            return [];
        }
        const offices = await this.officeRepo.findBy({ id: (0, typeorm_2.In)(officeIds) });
        const vendorIds = Array.from(new Set(offices.map((office) => office.vendorId)));
        if (inquiryVendorIds.length === 0) {
            return vendorIds;
        }
        const inquiryVendorIdSet = new Set(inquiryVendorIds);
        return vendorIds.filter((vendorId) => inquiryVendorIdSet.has(vendorId));
    }
    buildMatchResult(input) {
        const { matchedInquiryId, matchedRfqId, matchedVendorId } = input;
        const matchConfidence = matchedInquiryId && matchedRfqId && matchedVendorId
            ? 'high'
            : matchedInquiryId && (matchedRfqId || matchedVendorId)
                ? 'medium'
                : matchedInquiryId
                    ? 'low'
                    : 'none';
        const matchReason = matchConfidence === 'high'
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
};
exports.QuoteMatchingService = QuoteMatchingService;
exports.QuoteMatchingService = QuoteMatchingService = QuoteMatchingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rfq_entity_1.Rfq)),
    __param(1, (0, typeorm_1.InjectRepository)(inquiry_entity_1.Inquiry, 'business')),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_contact_entity_1.VendorContact, 'business')),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_cc_recipient_entity_1.VendorCcRecipient, 'business')),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_office_entity_1.VendorOffice, 'business')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuoteMatchingService);
//# sourceMappingURL=quote-matching.service.js.map