"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QuoteIgnoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteIgnoreService = void 0;
const common_1 = require("@nestjs/common");
const email_1 = require("../../../common/normalization/email");
let QuoteIgnoreService = class QuoteIgnoreService {
    static { QuoteIgnoreService_1 = this; }
    static AUTO_REPLY_PATTERNS = [
        'automatic reply',
        'autoreply',
        'out of office',
        'out-of-office',
        'ooo',
    ];
    static DELIVERY_FAILURE_PATTERNS = [
        'delivery has failed',
        'delivery status notification',
        'mail delivery failed',
        'mail undeliverable',
        'undeliverable',
    ];
    getIgnoreReason(candidate, context = {}) {
        return (this.getSystemIgnoreReason(candidate, context.mailboxAddress) ??
            this.getRuleIgnoreReason(candidate, context));
    }
    getSystemIgnoreReason(candidate, mailboxAddress) {
        const normalizedSender = (0, email_1.normalizeEmail)(candidate.fromEmail);
        const normalizedMailbox = (0, email_1.normalizeEmail)(mailboxAddress);
        const subject = (candidate.subject ?? '').toLowerCase();
        if (normalizedSender && normalizedMailbox && normalizedSender === normalizedMailbox) {
            return 'self_sent';
        }
        if (this.matchesAnyPattern(subject, QuoteIgnoreService_1.AUTO_REPLY_PATTERNS)) {
            return 'auto_reply';
        }
        if (this.matchesAnyPattern(subject, QuoteIgnoreService_1.DELIVERY_FAILURE_PATTERNS)) {
            return 'delivery_failure';
        }
        return null;
    }
    getRuleIgnoreReason(candidate, context) {
        for (const rule of context.rules ?? []) {
            if (!rule.isActive) {
                continue;
            }
            if (this.matchesRule(candidate, rule.conditions, !!context.isUnmatched)) {
                return `rule:${rule.name}`;
            }
        }
        return null;
    }
    matchesRule(candidate, conditions, isUnmatched) {
        if (conditions.applyWhenUnmatchedOnly !== undefined &&
            conditions.applyWhenUnmatchedOnly !== isUnmatched) {
            return false;
        }
        if (conditions.hasAttachments !== undefined &&
            conditions.hasAttachments !== candidate.hasAttachments) {
            return false;
        }
        if (conditions.senderEmailEquals?.length &&
            !conditions.senderEmailEquals.some((email) => (0, email_1.normalizeEmail)(email) !== null &&
                (0, email_1.normalizeEmail)(email) === (0, email_1.normalizeEmail)(candidate.fromEmail))) {
            return false;
        }
        if (conditions.senderDomainEquals?.length &&
            !conditions.senderDomainEquals.some((domain) => domain.trim().toLowerCase() === (0, email_1.getEmailDomain)(candidate.fromEmail))) {
            return false;
        }
        if (conditions.subjectContains?.length &&
            !this.containsAny(candidate.subject, conditions.subjectContains)) {
            return false;
        }
        if (conditions.bodyContains?.length &&
            !this.containsAny(candidate.bodyPreview, conditions.bodyContains)) {
            return false;
        }
        return true;
    }
    containsAny(value, patterns) {
        const normalizedValue = (value ?? '').toLowerCase();
        return patterns.some((pattern) => normalizedValue.includes(pattern.trim().toLowerCase()));
    }
    matchesAnyPattern(value, patterns) {
        return patterns.some((pattern) => value.includes(pattern));
    }
};
exports.QuoteIgnoreService = QuoteIgnoreService;
exports.QuoteIgnoreService = QuoteIgnoreService = QuoteIgnoreService_1 = __decorate([
    (0, common_1.Injectable)()
], QuoteIgnoreService);
//# sourceMappingURL=quote-ignore.service.js.map