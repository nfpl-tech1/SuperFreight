"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const path = __importStar(require("node:path"));
const typeorm_options_1 = require("../src/database/typeorm-options");
const port_master_entity_1 = require("../src/modules/vendors/entities/port-master.entity");
const port_lookup_ambiguity_report_1 = require("../src/modules/vendors/port-lookup-ambiguity-report");
const DEFAULT_REPORT_DIR = '.\\reports';
async function writeJsonFile(filePath, payload) {
    const resolvedPath = path.resolve(filePath);
    await (0, promises_1.mkdir)(path.dirname(resolvedPath), { recursive: true });
    await (0, promises_1.writeFile)(resolvedPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return resolvedPath;
}
async function main() {
    const reportDir = path.resolve(DEFAULT_REPORT_DIR);
    const dataSource = (0, typeorm_options_1.createBusinessDataSource)();
    await dataSource.initialize();
    try {
        const airportReports = await (0, port_lookup_ambiguity_report_1.generatePortLookupAmbiguityReports)(dataSource, port_master_entity_1.PortMode.AIRPORT);
        const seaportReports = await (0, port_lookup_ambiguity_report_1.generatePortLookupAmbiguityReports)(dataSource, port_master_entity_1.PortMode.SEAPORT);
        const outputs = {
            airport: {
                reportFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.airport.json'), airportReports.unresolved),
                resolvedFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.airport.resolved.json'), airportReports.resolved),
                unresolvedFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.airport.unresolved.json'), airportReports.unresolved),
                rawCount: airportReports.raw.count,
                resolvedCount: airportReports.resolved.count,
                unresolvedCount: airportReports.unresolved.count,
            },
            seaport: {
                reportFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.seaport.json'), seaportReports.unresolved),
                resolvedFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.seaport.resolved.json'), seaportReports.resolved),
                unresolvedFilePath: await writeJsonFile(path.join(reportDir, 'port-lookup-ambiguities.seaport.unresolved.json'), seaportReports.unresolved),
                rawCount: seaportReports.raw.count,
                resolvedCount: seaportReports.resolved.count,
                unresolvedCount: seaportReports.unresolved.count,
            },
        };
        console.log(JSON.stringify(outputs, null, 2));
    }
    finally {
        await dataSource.destroy();
    }
}
main().catch((error) => {
    console.error('Port lookup ambiguity report generation failed.');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=report-port-lookup-ambiguities.js.map