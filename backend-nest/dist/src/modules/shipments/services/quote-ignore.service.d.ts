import { QuoteIgnoreRule } from '../entities/quote-ignore-rule.entity';
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
export declare class QuoteIgnoreService {
    private static readonly AUTO_REPLY_PATTERNS;
    private static readonly DELIVERY_FAILURE_PATTERNS;
    getIgnoreReason(candidate: IgnoreCandidate, context?: IgnoreEvaluationContext): string | null;
    private getSystemIgnoreReason;
    private getRuleIgnoreReason;
    private matchesRule;
    private containsAny;
    private matchesAnyPattern;
}
export {};
