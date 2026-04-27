import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookController } from './outlook.controller';
import { OutlookMailService } from './outlook-mail.service';
import { OutlookService } from './outlook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutlookConnection, OutlookSubscription]),
    UsersModule,
  ],
  controllers: [OutlookController],
  providers: [OutlookService, OutlookAuthService, OutlookMailService],
  exports: [OutlookService],
})
export class OutlookModule {}
