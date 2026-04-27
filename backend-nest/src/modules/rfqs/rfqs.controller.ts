import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
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
import { validateSync, ValidationError } from 'class-validator';

type OfficeSelectionInput = {
  vendorId: string;
  officeId: string;
};

type ResponseFieldInput = {
  fieldKey: string;
  fieldLabel: string;
  isCustom: boolean;
};

const CREATE_RFQ_DTO_VALIDATION_OPTIONS = {
  whitelist: true,
  forbidNonWhitelisted: true,
} as const;

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

function parseOptionalStringField(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildCreateRfqDtoPayload(rawBody: Record<string, unknown>) {
  return {
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
      parseJsonField<OfficeSelectionInput[]>(
        rawBody.officeSelections,
        'officeSelections',
      ) ?? [],
    responseFields:
      parseJsonField<ResponseFieldInput[]>(
        rawBody.responseFields,
        'responseFields',
      ) ?? [],
    customCcEmail: parseOptionalStringField(rawBody.customCcEmail),
    sendNow: parseBooleanField(rawBody.sendNow),
    mailSubject: rawBody.mailSubject,
    mailBodyHtml: rawBody.mailBodyHtml,
  };
}

function getFirstValidationMessage(validationErrors: ValidationError[]) {
  return Object.values(validationErrors[0]?.constraints ?? {})[0];
}

@Controller('rfqs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RfqsController {
  constructor(private readonly rfqsService: RfqsService) {}

  @Get()
  list(@Query('inquiryId') inquiryId?: string) {
    return this.rfqsService.list(inquiryId);
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
    const dto = plainToInstance(
      CreateRfqDto,
      buildCreateRfqDtoPayload(rawBody),
    );
    const validationErrors = validateSync(
      dto,
      CREATE_RFQ_DTO_VALIDATION_OPTIONS,
    );

    if (validationErrors.length > 0) {
      throw new BadRequestException(
        getFirstValidationMessage(validationErrors) || 'Invalid RFQ payload.',
      );
    }

    return dto;
  }
}
