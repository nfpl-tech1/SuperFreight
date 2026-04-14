import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Audit } from '../../common/decorators/audit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { RfqsService } from './rfqs.service';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

function parseJsonField<TValue>(
  value: unknown,
  fieldName: string,
): TValue | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value as TValue;
  }

  try {
    return JSON.parse(value) as TValue;
  } catch {
    throw new BadRequestException(`${fieldName} must be valid JSON.`);
  }
}

function parseBooleanField(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

@Controller('rfqs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RfqsController {
  constructor(private readonly rfqsService: RfqsService) {}

  @Get()
  list() {
    return this.rfqsService.list();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 10))
  @Audit('RFQ_CREATED', 'rfq')
  create(
    @Body() rawBody: Record<string, unknown>,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.rfqsService.create(
      this.parseCreateRfqDto(rawBody),
      user,
      files,
    );
  }

  private parseCreateRfqDto(rawBody: Record<string, unknown>) {
    const dto = plainToInstance(CreateRfqDto, {
      inquiryId: rawBody.inquiryId,
      inquiryNumber: rawBody.inquiryNumber,
      departmentId: rawBody.departmentId,
      formValues:
        parseJsonField<Record<string, unknown>>(
          rawBody.formValues,
          'formValues',
        ) ?? {},
      vendorIds: parseJsonField<string[]>(rawBody.vendorIds, 'vendorIds') ?? [],
      officeSelections:
        parseJsonField<Array<{ vendorId: string; officeId: string }>>(
          rawBody.officeSelections,
          'officeSelections',
        ) ?? [],
      responseFields:
        parseJsonField<
          Array<{
            fieldKey: string;
            fieldLabel: string;
            isCustom: boolean;
          }>
        >(rawBody.responseFields, 'responseFields') ?? [],
      sendNow: parseBooleanField(rawBody.sendNow),
      mailSubject: rawBody.mailSubject,
      mailBodyHtml: rawBody.mailBodyHtml,
    });

    const validationErrors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (validationErrors.length > 0) {
      const firstConstraint = Object.values(
        validationErrors[0]?.constraints ?? {},
      )[0];
      throw new BadRequestException(firstConstraint || 'Invalid RFQ payload.');
    }

    return dto;
  }
}
