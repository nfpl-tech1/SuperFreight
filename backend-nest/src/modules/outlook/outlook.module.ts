import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OutlookConnection } from './entities/outlook-connection.entity';
import { OutlookSubscription } from './entities/outlook-subscription.entity';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutlookConnection, OutlookSubscription]),
    UsersModule,
  ],
  controllers: [OutlookController],
  providers: [OutlookService],
  exports: [OutlookService],
})
export class OutlookModule {}
