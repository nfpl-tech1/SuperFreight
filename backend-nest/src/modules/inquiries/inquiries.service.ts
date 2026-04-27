import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { findOneOrThrow } from '../../common/persistence/find-or-throw.helpers';
import { CustomerDraft } from '../customer-quotes/entities/customer-draft.entity';
import { Rfq } from '../rfqs/entities/rfq.entity';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { User } from '../users/entities/user.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { TransferInquiryDto } from './dto/transfer-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { ExternalThreadRef } from './entities/external-thread-ref.entity';
import { Inquiry } from './entities/inquiry.entity';
import { Job } from './entities/job.entity';
import { JobServicePart } from './entities/job-service-part.entity';
import { OwnershipAssignment } from './entities/ownership-assignment.entity';
import {
  buildFreightServicePartCreateInput,
  buildInquiryCreateInput,
  buildInquiryUpdateInput,
  buildJobCreateInput,
  buildJobUpdateInput,
  buildOwnershipTransferInput,
} from './inquiry-workflow.helpers';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(CustomerDraft)
    private readonly customerDraftRepo: Repository<CustomerDraft>,
    @InjectRepository(FreightQuote)
    private readonly freightQuoteRepo: Repository<FreightQuote>,
    @InjectRepository(Rfq)
    private readonly rfqRepo: Repository<Rfq>,
    @InjectRepository(Inquiry, 'business')
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(Job, 'business')
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(JobServicePart, 'business')
    private readonly servicePartRepo: Repository<JobServicePart>,
    @InjectRepository(OwnershipAssignment, 'business')
    private readonly ownershipRepo: Repository<OwnershipAssignment>,
  ) {}

  list(currentUser: User) {
    const where =
      currentUser.role === 'ADMIN'
        ? {}
        : [
            { ownerUserId: currentUser.id },
            { mailboxOwnerUserId: currentUser.id },
          ];
    return this.inquiryRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateInquiryDto, currentUser: User) {
    const inquiry = await this.createInquiryRecord(dto, currentUser);
    const job = await this.createJobRecord(inquiry);
    await this.createFreightServicePart(job.id, inquiry);

    return inquiry;
  }

  async update(id: string, dto: UpdateInquiryDto, currentUser: User) {
    const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);

    if ('inquiryNumber' in dto) {
      const nextInquiryNumber = dto.inquiryNumber?.trim() || '';
      if (!nextInquiryNumber) {
        throw new ConflictException('Inquiry number cannot be empty.');
      }

      if (nextInquiryNumber !== inquiry.inquiryNumber) {
        await this.ensureInquiryNumberAvailable(nextInquiryNumber, inquiry.id);
      }
    }

    Object.assign(inquiry, buildInquiryUpdateInput(dto));
    const savedInquiry = await this.inquiryRepo.save(inquiry);
    await this.syncJobFromInquiry(savedInquiry);

    return savedInquiry;
  }

  async transfer(id: string, dto: TransferInquiryDto, currentUser: User) {
    const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);

    const previousOwner = inquiry.ownerUserId;
    inquiry.ownerUserId = dto.newOwnerUserId;
    await this.inquiryRepo.save(inquiry);

    await this.recordOwnershipTransfer(
      inquiry.id,
      previousOwner,
      dto.newOwnerUserId,
      currentUser.id,
      dto.reason,
    );

    return inquiry;
  }

  async remove(id: string, currentUser: User) {
    const inquiry = await this.findAccessibleInquiryOrThrow(id, currentUser);

    await this.customerDraftRepo.manager.transaction(async (appManager) => {
      await appManager.getRepository(CustomerDraft).delete({
        inquiryId: inquiry.id,
      });
      await appManager.getRepository(FreightQuote).delete({
        inquiryId: inquiry.id,
      });
      await appManager.getRepository(Rfq).delete({
        inquiryId: inquiry.id,
      });
    });

    await this.inquiryRepo.manager.transaction(async (businessManager) => {
      const jobRepo = businessManager.getRepository(Job);
      const job = await jobRepo.findOne({ where: { inquiryId: inquiry.id } });

      if (job) {
        await businessManager.getRepository(JobServicePart).delete({
          jobId: job.id,
        });
      }

      await businessManager.getRepository(ExternalThreadRef).delete({
        inquiryId: inquiry.id,
      });
      await businessManager.getRepository(OwnershipAssignment).delete({
        inquiryId: inquiry.id,
      });
      await jobRepo.delete({ inquiryId: inquiry.id });
      await businessManager.getRepository(Inquiry).delete(inquiry.id);
    });

    return {
      success: true,
      id: inquiry.id,
    };
  }

  private async createInquiryRecord(dto: CreateInquiryDto, currentUser: User) {
    const inquiryNumber = dto.inquiryNumber?.trim();

    if (inquiryNumber) {
      await this.ensureInquiryNumberAvailable(inquiryNumber);
    }

    return this.inquiryRepo.save(
      this.inquiryRepo.create(
        buildInquiryCreateInput(
          dto,
          currentUser.id,
          inquiryNumber ?? (await this.generateInquiryNumber()),
        ),
      ),
    );
  }

  private async createJobRecord(inquiry: Inquiry) {
    return this.jobRepo.save(this.jobRepo.create(buildJobCreateInput(inquiry)));
  }

  private async syncJobFromInquiry(inquiry: Inquiry) {
    const job = await this.jobRepo.findOne({
      where: { inquiryId: inquiry.id },
    });
    if (!job) {
      return;
    }

    await this.jobRepo.save({
      ...job,
      ...buildJobUpdateInput(inquiry),
    });
  }

  private async createFreightServicePart(jobId: string, inquiry: Inquiry) {
    await this.servicePartRepo.save(
      this.servicePartRepo.create(
        buildFreightServicePartCreateInput(
          jobId,
          inquiry,
          this.config.get<string>('os.appSlug') ?? 'super-freight',
        ),
      ),
    );
  }

  private async recordOwnershipTransfer(
    inquiryId: string,
    previousOwnerUserId: string | null,
    newOwnerUserId: string,
    changedByUserId: string,
    reason?: string,
  ) {
    await this.ownershipRepo.save(
      this.ownershipRepo.create(
        buildOwnershipTransferInput(
          inquiryId,
          previousOwnerUserId,
          newOwnerUserId,
          changedByUserId,
          reason,
        ),
      ),
    );
  }

  private async generateInquiryNumber() {
    for (;;) {
      const suffix = Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, '0');
      const inquiryNumber = `E${suffix}`;
      const exists = await this.inquiryRepo.findOne({
        where: { inquiryNumber },
      });
      if (!exists) return inquiryNumber;
    }
  }

  private async ensureInquiryNumberAvailable(
    inquiryNumber: string,
    excludeInquiryId?: string,
  ) {
    const existingInquiry = await this.inquiryRepo.findOne({
      where: { inquiryNumber },
    });

    if (existingInquiry && existingInquiry.id !== excludeInquiryId) {
      throw new ConflictException(
        `Inquiry number ${inquiryNumber} is already in use.`,
      );
    }
  }

  private async findAccessibleInquiryOrThrow(id: string, currentUser: User) {
    const where =
      currentUser.role === 'ADMIN'
        ? { id }
        : [
            { id, ownerUserId: currentUser.id },
            { id, mailboxOwnerUserId: currentUser.id },
          ];

    return findOneOrThrow(this.inquiryRepo, where, 'Inquiry');
  }
}
