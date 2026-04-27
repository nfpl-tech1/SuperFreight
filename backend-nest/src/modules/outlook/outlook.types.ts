export type OutlookTokenPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error_description?: string;
};

export type OutlookMailboxProfile = {
  id?: string;
  mail?: string | null;
  userPrincipalName?: string | null;
};

export type GraphMailRequestBody = {
  message: {
    subject: string;
    body: {
      contentType: 'HTML';
      content: string;
    };
    toRecipients: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    ccRecipients: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    attachments: Array<{
      '@odata.type': '#microsoft.graph.fileAttachment';
      name: string;
      contentType: string;
      contentBytes: string;
    }>;
  };
  saveToSentItems: true;
};

export type SendMailPayload = {
  subject: string;
  htmlBody: string;
  to: Array<{ address: string; name?: string | null }>;
  cc?: Array<{ address: string; name?: string | null }>;
  attachments?: Array<{
    fileName: string;
    contentType: string;
    contentBytes: string;
  }>;
};

export type GraphMessageSummary = {
  id: string;
  internetMessageId?: string | null;
  conversationId?: string | null;
  receivedDateTime: string;
  createdDateTime?: string | null;
  sentDateTime?: string | null;
  subject?: string | null;
  webLink?: string | null;
  hasAttachments?: boolean;
  bodyPreview?: string | null;
  isDraft?: boolean;
  from?: {
    emailAddress?: {
      address?: string | null;
      name?: string | null;
    };
  };
};

export type GraphMessageDetail = GraphMessageSummary & {
  body?: {
    contentType?: 'text' | 'html' | string;
    content?: string | null;
  };
};

export type GraphMessageAttachment = {
  id: string;
  '@odata.type'?: string;
  name?: string | null;
  contentType?: string | null;
  size?: number | null;
  isInline?: boolean;
  lastModifiedDateTime?: string | null;
  contentBytes?: string | null;
};

export type SentMessageReference = {
  id: string;
  internetMessageId: string | null;
  conversationId: string | null;
  webLink: string | null;
  subject: string | null;
  createdDateTime: string | null;
  sentDateTime: string | null;
};

export type MicrosoftConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
};
