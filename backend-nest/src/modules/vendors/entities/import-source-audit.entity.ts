import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ImportSourceAuditEntityKind {
  VENDOR = 'VENDOR',
  OFFICE = 'OFFICE',
  PORT = 'PORT',
  SERVICE_LOCATION = 'SERVICE_LOCATION',
  PORT_LINK = 'PORT_LINK',
  SERVICE_LOCATION_LINK = 'SERVICE_LOCATION_LINK',
  CONTACT = 'CONTACT',
}

export enum ImportSourceAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SKIPPED = 'SKIPPED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

@Index('IDX_import_source_audit_source', [
  'sourceWorkbook',
  'sourceSheet',
  'sourceRowNumber',
])
@Index('IDX_import_source_audit_entity', ['entityKind', 'action'])
@Entity('import_source_audit')
export class ImportSourceAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceWorkbook: string;

  @Column()
  sourceSheet: string;

  @Column({ type: 'int' })
  sourceRowNumber: number;

  @Column({ type: 'enum', enum: ImportSourceAuditEntityKind })
  entityKind: ImportSourceAuditEntityKind;

  @Column({ type: 'enum', enum: ImportSourceAuditAction })
  action: ImportSourceAuditAction;

  @Column({ type: 'varchar', nullable: true })
  confidence: string | null;

  @Column({ type: 'varchar', nullable: true })
  normalizedKey: string | null;

  @Column({ type: 'uuid', nullable: true })
  vendorId: string | null;

  @Column({ type: 'uuid', nullable: true })
  officeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  portId: string | null;

  @Column({ type: 'uuid', nullable: true })
  serviceLocationId: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayloadJson: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
