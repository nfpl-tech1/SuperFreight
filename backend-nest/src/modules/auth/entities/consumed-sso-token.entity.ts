import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('consumed_sso_tokens')
export class ConsumedSsoToken {
  @PrimaryColumn()
  tokenId: string;

  @Column()
  appSlug: string;

  @CreateDateColumn()
  consumedAt: Date;
}
