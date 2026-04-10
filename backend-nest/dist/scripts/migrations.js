"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_options_1 = require("../src/database/typeorm-options");
async function withDataSource(label, dataSource, command) {
    await dataSource.initialize();
    try {
        if (command === 'run') {
            const migrations = await dataSource.runMigrations();
            if (migrations.length === 0) {
                console.log(`${label}: no pending migrations.`);
                return;
            }
            for (const migration of migrations) {
                console.log(`${label}: applied ${migration.name}`);
            }
            return;
        }
        await dataSource.undoLastMigration();
        console.log(`${label}: reverted last migration.`);
    }
    finally {
        await dataSource.destroy();
    }
}
async function main() {
    const command = (process.argv[2] ?? 'run');
    const target = (process.argv[3] ?? 'all');
    if (!['run', 'revert'].includes(command)) {
        throw new Error(`Unsupported migration command: ${command}`);
    }
    if (!['app', 'business', 'all'].includes(target)) {
        throw new Error(`Unsupported migration target: ${target}`);
    }
    if (target === 'app' || target === 'all') {
        await withDataSource('app', (0, typeorm_options_1.createAppDataSource)(), command);
    }
    if (target === 'business' || target === 'all') {
        await withDataSource('business', (0, typeorm_options_1.createBusinessDataSource)(), command);
    }
}
main().catch((error) => {
    console.error('TypeORM migration command failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=migrations.js.map