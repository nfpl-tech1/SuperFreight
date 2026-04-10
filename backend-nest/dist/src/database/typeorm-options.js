"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppTypeOrmModuleOptions = getAppTypeOrmModuleOptions;
exports.getBusinessTypeOrmModuleOptions = getBusinessTypeOrmModuleOptions;
exports.createAppDataSource = createAppDataSource;
exports.createBusinessDataSource = createBusinessDataSource;
const typeorm_1 = require("typeorm");
const configuration_1 = __importDefault(require("../config/configuration"));
const entity_sets_1 = require("../config/entity-sets");
const migration_sets_1 = require("./migration-sets");
function buildOptions(connectionName, config, entities, migrations, logging) {
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
function getDatabaseConfig(config, key) {
    const databaseConfig = config.get(key);
    if (!databaseConfig) {
        throw new Error(`Missing database configuration for ${key}`);
    }
    return databaseConfig;
}
function getAppTypeOrmModuleOptions(config) {
    return buildOptions(undefined, getDatabaseConfig(config, 'appDatabase'), entity_sets_1.APP_DB_ENTITIES, migration_sets_1.APP_DB_MIGRATIONS, config.get('nodeEnv') === 'development');
}
function getBusinessTypeOrmModuleOptions(config) {
    return buildOptions('business', getDatabaseConfig(config, 'businessDatabase'), entity_sets_1.BUSINESS_DB_ENTITIES, migration_sets_1.BUSINESS_DB_MIGRATIONS, config.get('nodeEnv') === 'development');
}
function createAppDataSource() {
    const config = (0, configuration_1.default)();
    return new typeorm_1.DataSource(buildOptions('app-migrations', config.appDatabase, entity_sets_1.APP_DB_ENTITIES, migration_sets_1.APP_DB_MIGRATIONS, config.nodeEnv === 'development'));
}
function createBusinessDataSource() {
    const config = (0, configuration_1.default)();
    return new typeorm_1.DataSource(buildOptions('business-migrations', config.businessDatabase, entity_sets_1.BUSINESS_DB_ENTITIES, migration_sets_1.BUSINESS_DB_MIGRATIONS, config.nodeEnv === 'development'));
}
//# sourceMappingURL=typeorm-options.js.map