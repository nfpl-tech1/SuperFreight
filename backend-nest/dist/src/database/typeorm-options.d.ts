import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
export declare function getAppTypeOrmModuleOptions(config: ConfigService): TypeOrmModuleOptions;
export declare function getBusinessTypeOrmModuleOptions(config: ConfigService): TypeOrmModuleOptions;
export declare function createAppDataSource(): DataSource;
export declare function createBusinessDataSource(): DataSource;
