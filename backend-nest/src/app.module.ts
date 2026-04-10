import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import {
  getAppTypeOrmModuleOptions,
  getBusinessTypeOrmModuleOptions,
} from './database/typeorm-options';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { OutlookModule } from './modules/outlook/outlook.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { RfqsModule } from './modules/rfqs/rfqs.module';
import { CustomerQuotesModule } from './modules/customer-quotes/customer-quotes.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Root application module.
 *
 * Architecture decisions:
 * - ConfigModule is global so every module can inject ConfigService without re-importing
 * - TypeORM is configured async so it can read from ConfigService
 * - AuditInterceptor is registered as APP_INTERCEPTOR (DI-aware global) so it can
 *   inject AuditService while still intercepting every controller
 * - Feature modules (Auth, Users, Audit) are self-contained and independently testable
 */
@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      name: 'default',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getAppTypeOrmModuleOptions,
    }),
    TypeOrmModule.forRootAsync({
      name: 'business',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getBusinessTypeOrmModuleOptions,
    }),
    AuthModule,
    UsersModule,
    AuditModule,
    OutlookModule,
    InquiriesModule,
    RfqsModule,
    CustomerQuotesModule,
    ShipmentsModule,
    VendorsModule,
  ],
  providers: [
    HealthService,
    // Global audit interceptor — logs @Audit()-decorated endpoints automatically
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
