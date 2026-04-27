import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookMailService } from './outlook-mail.service';
import {
  SentMessageReference,
  SendMailPayload,
} from './outlook.types';

@Injectable()
export class OutlookService {
  constructor(
    private readonly outlookAuthService: OutlookAuthService,
    private readonly outlookMailService: OutlookMailService,
  ) {}

  async getStatus(user: User) {
    return this.outlookAuthService.getStatus(user);
  }

  getConnectUrl(user: User) {
    return this.outlookAuthService.getConnectUrl(user);
  }

  async completeConnection(user: User, code: string) {
    return this.outlookAuthService.completeConnection(user, code);
  }

  async reconnect(user: User) {
    return this.outlookAuthService.reconnect(user);
  }

  async sendMail(user: User, payload: SendMailPayload) {
    return this.outlookMailService.sendMail(user, payload);
  }

  async sendMailTracked(user: User, payload: SendMailPayload): Promise<SentMessageReference> {
    return this.outlookMailService.sendMailTracked(user, payload);
  }

  async listInboxMessagesForUser(
    userId: string,
    options: { receivedAfter?: Date; top?: number } = {},
  ) {
    return this.outlookMailService.listInboxMessagesForUser(userId, options);
  }

  async listMessageAttachmentsForUser(userId: string, messageId: string) {
    return this.outlookMailService.listMessageAttachmentsForUser(
      userId,
      messageId,
    );
  }

  async getMessageDetailsForUser(userId: string, messageId: string) {
    return this.outlookMailService.getMessageDetailsForUser(userId, messageId);
  }
}
