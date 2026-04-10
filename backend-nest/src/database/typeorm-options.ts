import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import configuration from '../config/configuration';
import { APP_DB_ENTITIES, BUSINESS_DB_ENTITIES } from '../config/entity-sets';
import { APP_DB_MIGRATIONS, BUSINESS_DB_MIGRATIONS } from './migration-sets';

type RuntimeDatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  migrationsRun?: boolean;
};

function buildOptions(
  connectionName: string | undefined,
  config: RuntimeDatabaseConfig,
  entities: Function[],
  migrations: Function[],
  logging: boolean,
): DataSourceOptions {
  return {
    type: 'postgres',
    ...(connectionName ? { name: connectionName } : {}),
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.name,
    entities,
    migrations,
    migrationsRun: config.migrationsRun ?? false,
    synchronize: false,
    logging,
  };
}

function getDatabaseConfig(
  config: ConfigService,
  key: 'appDatabase' | 'businessDatabase',
): RuntimeDatabaseConfig {
  const databaseConfig = config.get<RuntimeDatabaseConfig>(key);
  if (!databaseConfig) {
    throw new Error(`Missing database configuration for ${key}`);
  }

  return databaseConfig;
}

export function getAppTypeOrmModuleOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return buildOptions(
    undefined,
    getDatabaseConfig(config, 'appDatabase'),
    APP_DB_ENTITIES,
    APP_DB_MIGRATIONS,
    config.get<string>('nodeEnv') === 'development',
  );
}

export function getBusinessTypeOrmModuleOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return buildOptions(
    'business',
    getDatabaseConfig(config, 'businessDatabase'),
    BUSINESS_DB_ENTITIES,
    BUSINESS_DB_MIGRATIONS,
    config.get<string>('nodeEnv') === 'development',
  );
}

export function createAppDataSource(): DataSource {
  const config = configuration();
  return new DataSource(
    buildOptions(
      'app-migrations',
      config.appDatabase,
      APP_DB_ENTITIES,
      APP_DB_MIGRATIONS,
      config.nodeEnv === 'development',
    ),
  );
}

export function createBusinessDataSource(): DataSource {
  const config = configuration();
  return new DataSource(
    buildOptions(
      'business-migrations',
      config.businessDatabase,
      BUSINESS_DB_ENTITIES,
      BUSINESS_DB_MIGRATIONS,
      config.nodeEnv === 'development',
    ),
  );
}
