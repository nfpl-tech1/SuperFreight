import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { CustomerDraft } from '../customer-quotes/entities/customer-draft.entity';
import { Rfq } from '../rfqs/entities/rfq.entity';
import { FreightQuote } from '../shipments/entities/freight-quote.entity';
import { ExternalThreadRef } from './entities/external-thread-ref.entity';
import { Inquiry } from './entities/inquiry.entity';
import { JobServicePart } from './entities/job-service-part.entity';
import { Job } from './entities/job.entity';
import { OwnershipAssignment } from './entities/ownership-assignment.entity';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerDraft, FreightQuote, Rfq]),
    TypeOrmModule.forFeature(
      [ExternalThreadRef, Inquiry, Job, JobServicePart, OwnershipAssignment],
      'business',
    ),
    AuditModule,
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
