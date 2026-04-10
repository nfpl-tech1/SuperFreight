"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const entity_sets_1 = require("../src/config/entity-sets");
function getDbConfig(prefix) {
    const fallbackPrefix = prefix === 'APP' ? 'DB' : 'APP_DB';
    const host = process.env[`${prefix}_DB_HOST`] ||
        process.env[`${fallbackPrefix}_HOST`] ||
        'localhost';
    const port = Number(process.env[`${prefix}_DB_PORT`] ||
        process.env[`${fallbackPrefix}_PORT`] ||
        '5432');
    const username = process.env[`${prefix}_DB_USERNAME`] ||
        process.env[`${fallbackPrefix}_USERNAME`] ||
        process.env.DB_USER ||
        'postgres';
    const password = process.env[`${prefix}_DB_PASSWORD`] ||
        process.env[`${fallbackPrefix}_PASSWORD`] ||
        process.env.DB_PASS ||
        'postgres';
    const database = process.env[`${prefix}_DB_NAME`] ||
        (prefix === 'APP'
            ? process.env.DB_NAME || 'superfreight_app'
            : 'logistics_business_core');
    return { host, port, username, password, database };
}
function createDataSource(name, config, entities) {
    return new typeorm_1.DataSource({
        type: 'postgres',
        name,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        entities,
        synchronize: false,
    });
}
async function truncateTables(dataSource, tables) {
    if (!tables.length)
        return;
    const quotedTables = tables.map((table) => `"${table}"`).join(', ');
    await dataSource.query(`TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE;`);
}
async function cleanBusinessDatabase(dataSource) {
    await truncateTables(dataSource, [
        'external_thread_refs',
        'ownership_assignments',
        'job_service_parts',
        'jobs',
        'inquiries',
        'rate_sheets',
        'vendor_cc_recipients',
        'vendor_contacts',
        'vendor_office_ports',
        'vendor_office_type_map',
        'vendor_offices',
        'vendor_master',
    ]);
}
async function cleanAppDatabase(dataSource) {
    await truncateTables(dataSource, [
        'audit_logs',
        'consumed_sso_tokens',
        'customer_drafts',
        'freight_quotes',
        'outlook_connections',
        'outlook_subscriptions',
        'rfq_field_specs',
        'rfqs',
        'user_departments',
        'user_role_assignments',
        'users',
    ]);
    const systemRoles = await dataSource.query('SELECT id FROM "app_roles" WHERE "isSystem" = true');
    const systemRoleIds = systemRoles.map((row) => row.id);
    if (!systemRoleIds.length) {
        await truncateTables(dataSource, [
            'role_permissions',
            'role_scope_rules',
            'app_roles',
        ]);
        return;
    }
    await dataSource.query('DELETE FROM "role_permissions" WHERE "roleId" NOT IN (SELECT id FROM "app_roles" WHERE "isSystem" = true)');
    await dataSource.query('DELETE FROM "role_scope_rules" WHERE "roleId" NOT IN (SELECT id FROM "app_roles" WHERE "isSystem" = true)');
    await dataSource.query('DELETE FROM "app_roles" WHERE "isSystem" = false');
}
async function main() {
    const appConfig = getDbConfig('APP');
    const businessConfig = getDbConfig('BUSINESS');
    const appDataSource = createDataSource('clean-app-db', appConfig, entity_sets_1.APP_DB_ENTITIES);
    const businessDataSource = createDataSource('clean-business-db', businessConfig, entity_sets_1.BUSINESS_DB_ENTITIES);
    console.log(`Cleaning app DB: ${appConfig.database}`);
    console.log(`Cleaning business DB: ${businessConfig.database}`);
    await appDataSource.initialize();
    await businessDataSource.initialize();
    try {
        await cleanAppDatabase(appDataSource);
        await cleanBusinessDatabase(businessDataSource);
        console.log('SuperFreight data cleanup completed successfully.');
        console.log('Preserved default system roles; all other runtime data was removed.');
    }
    finally {
        await Promise.allSettled([
            appDataSource.destroy(),
            businessDataSource.destroy(),
        ]);
    }
}
main().catch((error) => {
    console.error('SuperFreight data cleanup failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=clean-db.js.map