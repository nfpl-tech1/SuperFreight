import { Injectable } from '@nestjs/common';
import {
  getEmailDomain,
  normalizeEmail,
} from '../../../common/normalization/email';
import {
  QuoteIgnoreRule,
  QuoteIgnoreRuleConditions,
} from '../entities/quote-ignore-rule.entity';

type IgnoreCandidate = {
  fromEmail: string | null;
  subject: string | null;
  bodyPreview: string | null;
  hasAttachments: boolean;
};

type IgnoreEvaluationContext = {
  mailboxAddress?: string | null;
  rules?: QuoteIgnoreRule[];
  isUnmatched?: boolean;
};

@Injectable()
export class QuoteIgnoreService {
  private static readonly AUTO_REPLY_PATTERNS = [
    'automatic reply',
    'autoreply',
    'out of office',
    'out-of-office',
    'ooo',
  ];

  private static readonly DELIVERY_FAILURE_PATTERNS = [
    'delivery has failed',
    'delivery status notification',
    'mail delivery failed',
    'mail undeliverable',
    'undeliverable',
  ];

  getIgnoreReason(
    candidate: IgnoreCandidate,
    context: IgnoreEvaluationContext = {},
  ) {
    return (
      this.getSystemIgnoreReason(candidate, context.mailboxAddress) ??
      this.getRuleIgnoreReason(candidate, context)
    );
  }

  private getSystemIgnoreReason(
    candidate: IgnoreCandidate,
    mailboxAddress?: string | null,
  ) {
    const normalizedSender = normalizeEmail(candidate.fromEmail);
    const normalizedMailbox = normalizeEmail(mailboxAddress);
    const subject = (candidate.subject ?? '').toLowerCase();

    if (normalizedSender && normalizedMailbox && normalizedSender === normalizedMailbox) {
      return 'self_sent';
    }

    if (this.matchesAnyPattern(subject, QuoteIgnoreService.AUTO_REPLY_PATTERNS)) {
      return 'auto_reply';
    }

    if (
      this.matchesAnyPattern(
        subject,
        QuoteIgnoreService.DELIVERY_FAILURE_PATTERNS,
      )
    ) {
      return 'delivery_failure';
    }

    return null;
  }

  private getRuleIgnoreReason(
    candidate: IgnoreCandidate,
    context: IgnoreEvaluationContext,
  ) {
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

  private matchesRule(
    candidate: IgnoreCandidate,
    conditions: QuoteIgnoreRuleConditions,
    isUnmatched: boolean,
  ) {
    if (
      conditions.applyWhenUnmatchedOnly !== undefined &&
      conditions.applyWhenUnmatchedOnly !== isUnmatched
    ) {
      return false;
    }

    if (
      conditions.hasAttachments !== undefined &&
      conditions.hasAttachments !== candidate.hasAttachments
    ) {
      return false;
    }

    if (
      conditions.senderEmailEquals?.length &&
      !conditions.senderEmailEquals.some(
        (email) =>
          normalizeEmail(email) !== null &&
          normalizeEmail(email) === normalizeEmail(candidate.fromEmail),
      )
    ) {
      return false;
    }

    if (
      conditions.senderDomainEquals?.length &&
      !conditions.senderDomainEquals.some(
        (domain) =>
          domain.trim().toLowerCase() === getEmailDomain(candidate.fromEmail),
      )
    ) {
      return false;
    }

    if (
      conditions.subjectContains?.length &&
      !this.containsAny(candidate.subject, conditions.subjectContains)
    ) {
      return false;
    }

    if (
      conditions.bodyContains?.length &&
      !this.containsAny(candidate.bodyPreview, conditions.bodyContains)
    ) {
      return false;
    }

    return true;
  }

  private containsAny(value: string | null, patterns: string[]) {
    const normalizedValue = (value ?? '').toLowerCase();
    return patterns.some((pattern) =>
      normalizedValue.includes(pattern.trim().toLowerCase()),
    );
  }

  private matchesAnyPattern(value: string, patterns: string[]) {
    return patterns.some((pattern) => value.includes(pattern));
  }
}
