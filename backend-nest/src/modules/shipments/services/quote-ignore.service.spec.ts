import { QuoteIgnoreService } from './quote-ignore.service';
import { QuoteIgnoreRule } from '../entities/quote-ignore-rule.entity';

describe('QuoteIgnoreService', () => {
  let service: QuoteIgnoreService;

  beforeEach(() => {
    service = new QuoteIgnoreService();
  });

  it('ignores self-sent mail based on mailbox address', () => {
    expect(
      service.getIgnoreReason(
        {
          fromEmail: 'ops@example.com',
          subject: 'RFQ E123456 - Follow up',
          bodyPreview: null,
          hasAttachments: false,
        },
        {
          mailboxAddress: 'ops@example.com',
        },
      ),
    ).toBe('self_sent');
  });

  it('ignores automatic replies using subject heuristics', () => {
    expect(
      service.getIgnoreReason({
        fromEmail: 'vendor@example.com',
        subject: 'Automatic reply: out of office',
        bodyPreview: null,
        hasAttachments: false,
      }),
    ).toBe('auto_reply');
  });

  it('applies active ignore rules when conditions match', () => {
    const rule = {
      id: 'rule-1',
      mailboxOwnerUserId: null,
      name: 'Ignore known chatter',
      priority: 10,
      isActive: true,
      conditions: {
        senderDomainEquals: ['example.com'],
        subjectContains: ['test thread'],
      },
      createdByUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies QuoteIgnoreRule;

    expect(
      service.getIgnoreReason(
        {
          fromEmail: 'someone@example.com',
          subject: 'Test thread for old shipment',
          bodyPreview: null,
          hasAttachments: false,
        },
        {
          rules: [rule],
          isUnmatched: true,
        },
      ),
    ).toBe('rule:Ignore known chatter');
  });

  it('respects applyWhenUnmatchedOnly rule conditions', () => {
    const rule = {
      id: 'rule-1',
      mailboxOwnerUserId: null,
      name: 'Ignore only when unmatched',
      priority: 10,
      isActive: true,
      conditions: {
        subjectContains: ['follow up'],
        applyWhenUnmatchedOnly: true,
      },
      createdByUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies QuoteIgnoreRule;

    expect(
      service.getIgnoreReason(
        {
          fromEmail: 'vendor@example.com',
          subject: 'Follow up',
          bodyPreview: null,
          hasAttachments: false,
        },
        {
          rules: [rule],
          isUnmatched: false,
        },
      ),
    ).toBeNull();
  });
});
