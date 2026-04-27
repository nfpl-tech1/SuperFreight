import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookAuthService } from './outlook-auth.service';
import {
  GraphMessageAttachment,
  GraphMessageDetail,
  GraphMessageSummary,
  GraphMailRequestBody,
  SentMessageReference,
  SendMailPayload,
} from './outlook.types';

@Injectable()
export class OutlookMailService {
  private static readonly GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
  private static readonly IMMUTABLE_ID_HEADER = 'IdType="ImmutableId"';
  private static readonly TEXT_BODY_HEADER = 'outlook.body-content-type="text"';

  constructor(private readonly outlookAuthService: OutlookAuthService) {}

  private async sendGraphMailRequest(
    accessToken: string,
    body: GraphMailRequestBody,
  ) {
    const response = await fetch(
      `${OutlookMailService.GRAPH_BASE_URL}/me/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: {
        code?: string;
        message?: string;
      };
    } | null;

    throw new BadRequestException(
      payload?.error?.message || 'Unable to send mail through Outlook.',
    );
  }

  private buildPreferHeader(...values: string[]) {
    return values.join(', ');
  }

  private async getGraphJson<TPayload>(
    accessToken: string,
    path: string,
    options: {
      method?: string;
      body?: unknown;
      prefer?: string[];
    } = {},
  ): Promise<TPayload> {
    const response = await fetch(`${OutlookMailService.GRAPH_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.prefer?.length
          ? { Prefer: this.buildPreferHeader(...options.prefer) }
          : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });

    const payload = (await response.json().catch(() => null)) as
      | (TPayload & {
          error?: {
            message?: string;
          };
        })
      | null;

    if (!response.ok || !payload) {
      throw new BadRequestException(
        payload?.error?.message ||
          'Unable to read mail from Outlook. Please reconnect Outlook.',
      );
    }

    return payload;
  }

  private async postGraphRequest(
    accessToken: string,
    path: string,
    body?: unknown,
    options: {
      prefer?: string[];
    } = {},
  ) {
    const response = await fetch(`${OutlookMailService.GRAPH_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.prefer?.length
          ? { Prefer: this.buildPreferHeader(...options.prefer) }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.ok) {
      if (response.status === 204) {
        return null;
      }

      return response.json().catch(() => null);
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: {
        message?: string;
      };
    } | null;

    throw new BadRequestException(
      payload?.error?.message ||
        'Unable to complete the Outlook mail request.',
    );
  }

  private mapGraphRecipients(
    recipients: Array<{ address: string; name?: string | null }>,
  ) {
    return recipients.map((recipient) => ({
      emailAddress: {
        address: recipient.address,
        name: recipient.name ?? undefined,
      },
    }));
  }

  private mapGraphAttachments(
    attachments: SendMailPayload['attachments'] = [],
  ) {
    return attachments.map((attachment) => ({
      '@odata.type': '#microsoft.graph.fileAttachment' as const,
      name: attachment.fileName,
      contentType: attachment.contentType,
      contentBytes: attachment.contentBytes,
    }));
  }

  private buildSendMailRequestBody(
    payload: SendMailPayload,
  ): GraphMailRequestBody {
    return {
      message: {
        subject: payload.subject,
        body: {
          contentType: 'HTML',
          content: payload.htmlBody,
        },
        toRecipients: this.mapGraphRecipients(payload.to),
        ccRecipients: this.mapGraphRecipients(payload.cc ?? []),
        attachments: this.mapGraphAttachments(payload.attachments),
      },
      saveToSentItems: true,
    };
  }

  private async createDraftMessage(
    connection: OutlookConnection,
    requestBody: GraphMailRequestBody,
  ) {
    const response = await this.getGraphJson<GraphMessageDetail>(
      connection.accessToken!,
      '/me/messages',
      {
        method: 'POST',
        body: requestBody.message,
        prefer: [OutlookMailService.IMMUTABLE_ID_HEADER],
      },
    );

    return response;
  }

  private async sendDraftMessage(connection: OutlookConnection, messageId: string) {
    await this.postGraphRequest(
      connection.accessToken!,
      `/me/messages/${messageId}/send`,
      undefined,
      {
        prefer: [OutlookMailService.IMMUTABLE_ID_HEADER],
      },
    );
  }

  private async getMessageById(
    connection: OutlookConnection,
    messageId: string,
    bodyContentType: 'text' | 'html' = 'text',
  ) {
    const prefer = [OutlookMailService.IMMUTABLE_ID_HEADER];
    if (bodyContentType === 'text') {
      prefer.push(OutlookMailService.TEXT_BODY_HEADER);
    }

    return this.getGraphJson<GraphMessageDetail>(
      connection.accessToken!,
      `/me/messages/${messageId}?$select=id,internetMessageId,conversationId,createdDateTime,sentDateTime,receivedDateTime,subject,webLink,hasAttachments,bodyPreview,body,from,isDraft`,
      {
        prefer,
      },
    );
  }

  private async waitForSentMessage(
    connection: OutlookConnection,
    draftMessage: GraphMessageDetail,
  ) {
    const attempts = 4;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const sentMessage = await this.getMessageById(connection, draftMessage.id);
        if (!sentMessage.isDraft) {
          return sentMessage;
        }
      } catch {
        // Sending to Sent Items is asynchronous. Keep retrying a few times.
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }

    return draftMessage;
  }

  private toSentMessageReference(message: GraphMessageDetail): SentMessageReference {
    return {
      id: message.id,
      internetMessageId: message.internetMessageId ?? null,
      conversationId: message.conversationId ?? null,
      webLink: message.webLink ?? null,
      subject: message.subject ?? null,
      createdDateTime: message.createdDateTime ?? null,
      sentDateTime: message.sentDateTime ?? null,
    };
  }

  private async sendMailWithRetry(
    connection: OutlookConnection,
    requestBody: GraphMailRequestBody,
  ) {
    try {
      await this.sendGraphMailRequest(connection.accessToken!, requestBody);
    } catch {
      const refreshedConnection =
        await this.outlookAuthService.refreshConnectionAccessToken(connection);
      await this.sendGraphMailRequest(
        refreshedConnection.accessToken!,
        requestBody,
      );
    }
  }

  private buildInboxMessagesPath(receivedAfter?: Date, top = 50) {
    const params = new URLSearchParams({
      $top: String(top),
      $orderby: 'receivedDateTime asc',
      $select:
        'id,internetMessageId,conversationId,receivedDateTime,subject,webLink,hasAttachments,bodyPreview,from',
    });

    if (receivedAfter) {
      params.set('$filter', `receivedDateTime ge ${receivedAfter.toISOString()}`);
    }

    return `/me/messages?${params.toString()}`;
  }

  async listInboxMessagesForUser(
    userId: string,
    options: { receivedAfter?: Date; top?: number } = {},
  ) {
    const connection = await this.outlookAuthService.getValidConnectionForUser(
      userId,
    );
    const response = await this.getGraphJson<{ value?: GraphMessageSummary[] }>(
      connection.accessToken!,
      this.buildInboxMessagesPath(options.receivedAfter, options.top),
    );

    return response.value ?? [];
  }

  async getMessageDetailsForUser(userId: string, messageId: string) {
    const connection = await this.outlookAuthService.getValidConnectionForUser(
      userId,
    );
    return this.getMessageById(connection, messageId);
  }

  async listMessageAttachmentsForUser(userId: string, messageId: string) {
    const connection = await this.outlookAuthService.getValidConnectionForUser(
      userId,
    );
    const response = await this.getGraphJson<{ value?: GraphMessageAttachment[] }>(
      connection.accessToken!,
      `/me/messages/${messageId}/attachments?$select=id,name,contentType,size,isInline,lastModifiedDateTime,contentBytes`,
      {
        prefer: [OutlookMailService.IMMUTABLE_ID_HEADER],
      },
    );

    return response.value ?? [];
  }

  async sendMail(user: User, payload: SendMailPayload) {
    const connection = await this.outlookAuthService.getValidConnectionForUser(
      user.id,
    );
    const requestBody = this.buildSendMailRequestBody(payload);

    await this.sendMailWithRetry(connection, requestBody);
  }

  async sendMailTracked(user: User, payload: SendMailPayload) {
    const connection = await this.outlookAuthService.getValidConnectionForUser(
      user.id,
    );
    const requestBody = this.buildSendMailRequestBody(payload);
    const draftMessage = await this.createDraftMessage(connection, requestBody);

    try {
      await this.sendDraftMessage(connection, draftMessage.id);
    } catch {
      const refreshedConnection =
        await this.outlookAuthService.refreshConnectionAccessToken(connection);
      await this.sendDraftMessage(refreshedConnection, draftMessage.id);
    }

    const sentMessage = await this.waitForSentMessage(connection, draftMessage);
    return this.toSentMessageReference(sentMessage);
  }
}
