"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDemoVendorAndInquirySeed2026032701100 = void 0;
const _2026032400400_BusinessVendorMasterPhase1_1 = require("./2026032400400-BusinessVendorMasterPhase1");
const _2026032700800_BusinessVendorLocationSourcing_1 = require("./2026032700800-BusinessVendorLocationSourcing");
const SERVICE_LOCATIONS = [
    {
        id: '00000000-0000-0000-0000-00000000a001',
        name: 'Mumbai',
        cityName: 'Mumbai',
        stateName: 'Maharashtra',
        countryName: 'India',
        locationKind: 'INLAND_CITY',
        notes: 'Demo inland coverage for Mumbai operations.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a002',
        name: 'Nhava Sheva',
        cityName: 'Nhava Sheva',
        stateName: 'Maharashtra',
        countryName: 'India',
        locationKind: 'CUSTOMS_NODE',
        notes: 'Demo customs-side location near JNPT.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a003',
        name: 'JNPT CFS',
        cityName: 'Nhava Sheva',
        stateName: 'Maharashtra',
        countryName: 'India',
        locationKind: 'CFS',
        notes: 'Demo CFS location for local port handling.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a004',
        name: 'Ahmedabad',
        cityName: 'Ahmedabad',
        stateName: 'Gujarat',
        countryName: 'India',
        locationKind: 'INLAND_CITY',
        notes: 'Demo inland origin point.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a005',
        name: 'Chennai',
        cityName: 'Chennai',
        stateName: 'Tamil Nadu',
        countryName: 'India',
        locationKind: 'INLAND_CITY',
        notes: 'Demo inland origin point.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a006',
        name: 'Singapore',
        cityName: 'Singapore',
        stateName: null,
        countryName: 'Singapore',
        locationKind: 'INLAND_CITY',
        notes: 'Demo destination city coverage for Singapore partners.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a007',
        name: 'Dubai',
        cityName: 'Dubai',
        stateName: null,
        countryName: 'UAE',
        locationKind: 'INLAND_CITY',
        notes: 'Demo destination city coverage for UAE partners.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a008',
        name: 'Rotterdam',
        cityName: 'Rotterdam',
        stateName: null,
        countryName: 'Netherlands',
        locationKind: 'CUSTOMS_NODE',
        notes: 'Demo destination customs coverage for Rotterdam.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a009',
        name: 'Los Angeles',
        cityName: 'Los Angeles',
        stateName: 'California',
        countryName: 'USA',
        locationKind: 'INLAND_CITY',
        notes: 'Demo destination inland coverage for Los Angeles.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a010',
        name: 'Colombo',
        cityName: 'Colombo',
        stateName: null,
        countryName: 'Sri Lanka',
        locationKind: 'CUSTOMS_NODE',
        notes: 'Demo destination handling coverage for Colombo.',
    },
    {
        id: '00000000-0000-0000-0000-00000000a011',
        name: 'Alexandria',
        cityName: 'Alexandria',
        stateName: null,
        countryName: 'Egypt',
        locationKind: 'CUSTOMS_NODE',
        notes: 'Demo Mediterranean handling coverage.',
    },
];
const INDIA_VENDOR_SEEDS = [
    {
        id: '00000000-0000-0000-0000-000000000101',
        companyName: 'Western Route Carriers',
        notes: 'Demo transporter for India-side pickups and drayage.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001101',
                officeName: 'Mumbai Transport Desk',
                cityName: 'Mumbai',
                stateName: 'Maharashtra',
                countryName: 'India',
                addressRaw: 'Bhiwandi Truck Terminal, Mumbai, India',
                externalCode: 'WRC-MUM',
                specializationRaw: 'Factory pickup, port drayage, and linehaul coordination.',
                doesProjectCargo: true,
                doesOwnTransportation: true,
                typeCodes: ['TRANSPORTER'],
                portRefs: [{ name: 'Nhava Sheva', country: 'India', isPrimary: true }],
                serviceLocationIds: [
                    '00000000-0000-0000-0000-00000000a001',
                    '00000000-0000-0000-0000-00000000a002',
                    '00000000-0000-0000-0000-00000000a004',
                    '00000000-0000-0000-0000-00000000a005',
                ],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002101',
                        contactName: 'Rohan Karki',
                        salutation: 'Mr.',
                        designation: 'Operations Manager',
                        emailPrimary: 'rohan@westernroute.com',
                        mobile1: '+91-9810011101',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [
                    {
                        id: '00000000-0000-0000-0000-000000003101',
                        email: 'ops@westernroute.com',
                    },
                ],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000102',
        companyName: 'Gateway Customs Brokers',
        notes: 'Demo CHA and licensing vendor for JNPT area.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001102',
                officeName: 'Nhava Sheva Clearance Cell',
                cityName: 'Nhava Sheva',
                stateName: 'Maharashtra',
                countryName: 'India',
                addressRaw: 'Opp. JNPT Customs House, Nhava Sheva, India',
                externalCode: 'GCB-JNP',
                specializationRaw: 'Customs clearance, documentation, and licensing.',
                doesOwnCustomClearance: true,
                typeCodes: ['CHA', 'LICENSING'],
                portRefs: [{ name: 'Nhava Sheva', country: 'India', isPrimary: true }],
                serviceLocationIds: [
                    '00000000-0000-0000-0000-00000000a001',
                    '00000000-0000-0000-0000-00000000a002',
                    '00000000-0000-0000-0000-00000000a003',
                ],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002102',
                        contactName: 'Anita Sharma',
                        salutation: 'Ms.',
                        designation: 'Senior CHA Executive',
                        emailPrimary: 'anita@gatewaycustoms.in',
                        mobile1: '+91-9810011102',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [
                    {
                        id: '00000000-0000-0000-0000-000000003102',
                        email: 'docs@gatewaycustoms.in',
                    },
                ],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000103',
        companyName: 'Harbor CFS Solutions',
        notes: 'Demo CFS and buffer-yard operator near JNPT.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001103',
                officeName: 'JNPT Yard Office',
                cityName: 'Nhava Sheva',
                stateName: 'Maharashtra',
                countryName: 'India',
                addressRaw: 'JNPT CFS Cluster, Nhava Sheva, India',
                externalCode: 'HCS-JNP',
                specializationRaw: 'Port-side storage, de-stuffing, and handling.',
                doesOwnWarehousing: true,
                typeCodes: ['CFS_BUFFER_YARD'],
                portRefs: [{ name: 'Nhava Sheva', country: 'India', isPrimary: true }],
                serviceLocationIds: [
                    '00000000-0000-0000-0000-00000000a002',
                    '00000000-0000-0000-0000-00000000a003',
                ],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002103',
                        contactName: 'Milan Bajaj',
                        salutation: 'Mr.',
                        designation: 'Terminal Supervisor',
                        emailPrimary: 'milan@harborcfs.in',
                        mobile1: '+91-9810011103',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [
                    {
                        id: '00000000-0000-0000-0000-000000003103',
                        email: 'yard@harborcfs.in',
                    },
                ],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000104',
        companyName: 'Blue Ocean Shipping Line',
        notes: 'Demo carrier and shipping-line vendor for ocean main carriage.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001104',
                officeName: 'Mumbai Line Desk',
                cityName: 'Mumbai',
                stateName: 'Maharashtra',
                countryName: 'India',
                addressRaw: 'Nariman Point, Mumbai, India',
                externalCode: 'BOSL-MUM',
                specializationRaw: 'Ocean main carriage, direct sailings, and routing.',
                doesSeaFreight: true,
                typeCodes: ['SHIPPING_LINE', 'CARRIER'],
                portRefs: [
                    { name: 'Nhava Sheva', country: 'India', isPrimary: true },
                    { name: 'Singapore', country: 'Singapore' },
                    { name: 'Jebel Ali', country: 'UAE' },
                    { name: 'Colombo', country: 'Sri Lanka' },
                ],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a001'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002104',
                        contactName: 'Rajesh Gupta',
                        salutation: 'Mr.',
                        designation: 'Trade Manager',
                        emailPrimary: 'rajesh@blueoceanline.com',
                        mobile1: '+91-9810011104',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [
                    {
                        id: '00000000-0000-0000-0000-000000003104',
                        email: 'pricing@blueoceanline.com',
                    },
                ],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000105',
        companyName: 'Global Co-Load Express',
        notes: 'Demo co-loader for transshipment-heavy ocean moves.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001105',
                officeName: 'Mumbai Consolidation Desk',
                cityName: 'Mumbai',
                stateName: 'Maharashtra',
                countryName: 'India',
                addressRaw: 'Andheri East, Mumbai, India',
                externalCode: 'GCL-MUM',
                specializationRaw: 'LCL consolidation and ocean co-loading.',
                doesSeaFreight: true,
                doesOwnConsolidation: true,
                typeCodes: ['CO_LOADER', 'CARRIER'],
                portRefs: [
                    { name: 'Nhava Sheva', country: 'India', isPrimary: true },
                    { name: 'Singapore', country: 'Singapore' },
                    { name: 'Rotterdam', country: 'Netherlands' },
                ],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a001'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002105',
                        contactName: 'Deepak Adhikari',
                        salutation: 'Mr.',
                        designation: 'LCL Pricing Lead',
                        emailPrimary: 'deepak@globalcoload.com',
                        mobile1: '+91-9810011105',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [
                    {
                        id: '00000000-0000-0000-0000-000000003105',
                        email: 'lcl@globalcoload.com',
                    },
                ],
            },
        ],
    },
];
const OVERSEAS_VENDOR_SEEDS = [
    {
        id: '00000000-0000-0000-0000-000000000106',
        companyName: 'Lion City WCA Partners',
        notes: 'Demo destination WCA partner in Singapore.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001106',
                officeName: 'Singapore Operations',
                cityName: 'Singapore',
                stateName: null,
                countryName: 'Singapore',
                addressRaw: 'Jurong Logistics Hub, Singapore',
                externalCode: 'LCW-SIN',
                specializationRaw: 'Destination handling and overseas coordination.',
                doesSeaFreight: true,
                typeCodes: ['WCA_AGENT'],
                portRefs: [
                    { name: 'Singapore', country: 'Singapore', isPrimary: true },
                ],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a006'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002106',
                        contactName: 'Mei Lin',
                        salutation: 'Ms.',
                        designation: 'Customer Success Lead',
                        emailPrimary: 'meilin@lioncitywca.sg',
                        mobile1: '+65-8123-1106',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000107',
        companyName: 'Gulf Gateway Logistics',
        notes: 'Demo destination partner at Jebel Ali / Dubai.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001107',
                officeName: 'Dubai Gateway Office',
                cityName: 'Dubai',
                stateName: null,
                countryName: 'UAE',
                addressRaw: 'JAFZA South, Dubai, UAE',
                externalCode: 'GGL-DXB',
                specializationRaw: 'Destination handling and customs support in UAE.',
                doesSeaFreight: true,
                doesOwnCustomClearance: true,
                typeCodes: ['WCA_AGENT', 'CHA'],
                portRefs: [{ name: 'Jebel Ali', country: 'UAE', isPrimary: true }],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a007'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002107',
                        contactName: 'Omar Farouk',
                        salutation: 'Mr.',
                        designation: 'Destination Manager',
                        emailPrimary: 'omar@gulfgateway.ae',
                        mobile1: '+971-55-1107',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000108',
        companyName: 'Delta Destination Logistics',
        notes: 'Demo Rotterdam destination and customs partner.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001108',
                officeName: 'Rotterdam Destination Desk',
                cityName: 'Rotterdam',
                stateName: null,
                countryName: 'Netherlands',
                addressRaw: 'Maasvlakte, Rotterdam, Netherlands',
                externalCode: 'DDL-RTM',
                specializationRaw: 'Destination handling, deconsolidation, and customs.',
                doesSeaFreight: true,
                doesOwnCustomClearance: true,
                doesOwnWarehousing: true,
                typeCodes: ['WCA_AGENT', 'CHA'],
                portRefs: [
                    { name: 'Rotterdam', country: 'Netherlands', isPrimary: true },
                ],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a008'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002108',
                        contactName: 'Laura Visser',
                        salutation: 'Ms.',
                        designation: 'Import Supervisor',
                        emailPrimary: 'laura@deltadestination.nl',
                        mobile1: '+31-6-1108',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000109',
        companyName: 'Pacific Coast Forwarding',
        notes: 'Demo destination partner in Los Angeles.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001109',
                officeName: 'Los Angeles Partner Desk',
                cityName: 'Los Angeles',
                stateName: 'California',
                countryName: 'USA',
                addressRaw: 'Long Beach Logistics Center, Los Angeles, USA',
                externalCode: 'PCF-LAX',
                specializationRaw: 'Destination handling and final-mile coordination.',
                doesSeaFreight: true,
                typeCodes: ['WCA_AGENT'],
                portRefs: [{ name: 'Los Angeles', country: 'USA', isPrimary: true }],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a009'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002109',
                        contactName: 'William Torres',
                        salutation: 'Mr.',
                        designation: 'Operations Lead',
                        emailPrimary: 'william@pacificcoastfwd.com',
                        mobile1: '+1-310-555-1109',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000110',
        companyName: 'Ceylon Freight Partners',
        notes: 'Demo Colombo destination handling partner.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001110',
                officeName: 'Colombo Service Desk',
                cityName: 'Colombo',
                stateName: null,
                countryName: 'Sri Lanka',
                addressRaw: 'Colombo Port City, Sri Lanka',
                externalCode: 'CFP-CMB',
                specializationRaw: 'Destination handling and customs coordination.',
                doesSeaFreight: true,
                doesOwnCustomClearance: true,
                typeCodes: ['WCA_AGENT', 'CHA'],
                portRefs: [{ name: 'Colombo', country: 'Sri Lanka', isPrimary: true }],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a010'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002110',
                        contactName: 'Anjula Perera',
                        salutation: 'Ms.',
                        designation: 'Destination Executive',
                        emailPrimary: 'anjula@ceylonfreight.lk',
                        mobile1: '+94-77-110110',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
    {
        id: '00000000-0000-0000-0000-000000000111',
        companyName: 'Cairo Port Services',
        notes: 'Demo carrier and CHA vendor for Egypt-facing moves.',
        offices: [
            {
                id: '00000000-0000-0000-0000-000000001111',
                officeName: 'Alexandria Service Hub',
                cityName: 'Alexandria',
                stateName: null,
                countryName: 'Egypt',
                addressRaw: 'El Dekheila Logistics Zone, Alexandria, Egypt',
                externalCode: 'CPS-ALY',
                specializationRaw: 'Port handling and customs support in Egypt.',
                doesSeaFreight: true,
                doesOwnCustomClearance: true,
                typeCodes: ['CARRIER', 'CHA'],
                portRefs: [
                    { name: 'Alexandria', country: 'Egypt', isPrimary: true },
                    { name: 'Ain Sokhna', country: 'Egypt' },
                ],
                serviceLocationIds: ['00000000-0000-0000-0000-00000000a011'],
                contacts: [
                    {
                        id: '00000000-0000-0000-0000-000000002111',
                        contactName: 'Youssef Adel',
                        salutation: 'Mr.',
                        designation: 'Port Operations Lead',
                        emailPrimary: 'youssef@cairoportservices.eg',
                        mobile1: '+20-10-1111111',
                        isPrimary: true,
                    },
                ],
                ccRecipients: [],
            },
        ],
    },
];
const VENDORS = [...INDIA_VENDOR_SEEDS, ...OVERSEAS_VENDOR_SEEDS];
const INQUIRIES = [
    {
        id: '00000000-0000-0000-0000-000000004001',
        inquiryNumber: 'E900001',
        inquiryType: 'CHA_FREIGHT',
        status: 'PENDING',
        customerName: 'Everest Home Appliances',
        customerRole: 'Shipper',
        tradeLane: 'Export',
        origin: 'Nhava Sheva',
        destination: 'Singapore',
        shipmentMode: 'FCL',
        incoterm: 'FOB',
        cargoSummary: 'Kitchen appliances, 1 x 40HC',
        createdAt: '2026-03-22T09:00:00.000Z',
    },
    {
        id: '00000000-0000-0000-0000-000000004002',
        inquiryNumber: 'E900002',
        inquiryType: 'CHA_FREIGHT',
        status: 'RFQ_SENT',
        customerName: 'Global Retail Imports',
        customerRole: 'Consignee',
        tradeLane: 'Export',
        origin: 'Nhava Sheva',
        destination: 'Jebel Ali',
        shipmentMode: 'FCL',
        incoterm: 'EXW',
        cargoSummary: 'Retail fixtures, 2 x 40HC',
        createdAt: '2026-03-21T09:30:00.000Z',
    },
    {
        id: '00000000-0000-0000-0000-000000004003',
        inquiryNumber: 'E900003',
        inquiryType: 'CHA_FREIGHT',
        status: 'QUOTES_RECEIVED',
        customerName: 'Nordic Consumer Goods',
        customerRole: 'Shipper',
        tradeLane: 'Export',
        origin: 'Nhava Sheva',
        destination: 'Rotterdam',
        shipmentMode: 'FCL',
        incoterm: 'CIF',
        cargoSummary: 'Home decor, 2 x 40HC',
        createdAt: '2026-03-20T10:00:00.000Z',
    },
    {
        id: '00000000-0000-0000-0000-000000004004',
        inquiryNumber: 'E900004',
        inquiryType: 'FREIGHT_ONLY',
        status: 'QUOTED_TO_CUSTOMER',
        customerName: 'Kathmandu Meditech',
        customerRole: 'Shipper',
        tradeLane: 'Export',
        origin: 'Nhava Sheva',
        destination: 'Los Angeles',
        shipmentMode: 'FCL',
        incoterm: 'DAP',
        cargoSummary: 'Medical devices, 1 x 40HC',
        createdAt: '2026-03-19T11:00:00.000Z',
    },
    {
        id: '00000000-0000-0000-0000-000000004005',
        inquiryNumber: 'E900005',
        inquiryType: 'FREIGHT_ONLY',
        status: 'CLOSED',
        customerName: 'Lotus Foods',
        customerRole: 'Consignee',
        tradeLane: 'Export',
        origin: 'Nhava Sheva',
        destination: 'Colombo',
        shipmentMode: 'LCL',
        incoterm: 'FOB',
        cargoSummary: 'Packaged tea, 18 CBM',
        createdAt: '2026-03-18T08:45:00.000Z',
    },
];
const JOBS = INQUIRIES.map((inquiry, index) => ({
    id: `00000000-0000-0000-0000-00000000500${index + 1}`,
    inquiryId: inquiry.id,
    customerName: inquiry.customerName,
    tradeLane: inquiry.tradeLane,
    currentStage: inquiry.status,
}));
const JOB_SERVICE_PARTS = [
    {
        id: '00000000-0000-0000-0000-000000006001',
        jobId: JOBS[0].id,
        partType: 'TRANSPORTATION',
        status: 'OPEN',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Transport' },
    },
    {
        id: '00000000-0000-0000-0000-000000006002',
        jobId: JOBS[0].id,
        partType: 'CHA',
        status: 'OPEN',
        applicationSlug: 'rfq',
        meta: { quoteType: 'CHA' },
    },
    {
        id: '00000000-0000-0000-0000-000000006003',
        jobId: JOBS[1].id,
        partType: 'TRANSPORTATION',
        status: 'RFQ_SENT',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Transport' },
    },
    {
        id: '00000000-0000-0000-0000-000000006004',
        jobId: JOBS[1].id,
        partType: 'CHA',
        status: 'RFQ_SENT',
        applicationSlug: 'rfq',
        meta: { quoteType: 'CHA' },
    },
    {
        id: '00000000-0000-0000-0000-000000006005',
        jobId: JOBS[1].id,
        partType: 'FREIGHT',
        status: 'RFQ_SENT',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Ocean Freight' },
    },
    {
        id: '00000000-0000-0000-0000-000000006006',
        jobId: JOBS[2].id,
        partType: 'TRANSPORTATION',
        status: 'QUOTES_RECEIVED',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Transport' },
    },
    {
        id: '00000000-0000-0000-0000-000000006007',
        jobId: JOBS[2].id,
        partType: 'CHA',
        status: 'QUOTES_RECEIVED',
        applicationSlug: 'rfq',
        meta: { quoteType: 'CHA' },
    },
    {
        id: '00000000-0000-0000-0000-000000006008',
        jobId: JOBS[2].id,
        partType: 'FREIGHT',
        status: 'QUOTES_RECEIVED',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Ocean Freight' },
    },
    {
        id: '00000000-0000-0000-0000-000000006009',
        jobId: JOBS[3].id,
        partType: 'FREIGHT',
        status: 'QUOTED_TO_CUSTOMER',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Ocean Freight' },
    },
    {
        id: '00000000-0000-0000-0000-000000006010',
        jobId: JOBS[4].id,
        partType: 'FREIGHT',
        status: 'CLOSED',
        applicationSlug: 'rfq',
        meta: { quoteType: 'Ocean Freight' },
    },
];
function normalizeNameKey(value) {
    return (value ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
async function ensureVendorSchema(queryRunner) {
    if (!(await queryRunner.hasTable('vendor_master'))) {
        await new _2026032400400_BusinessVendorMasterPhase1_1.BusinessVendorMasterPhase12026032400400().up(queryRunner);
    }
    if (!(await queryRunner.hasTable('service_location_master'))) {
        await new _2026032700800_BusinessVendorLocationSourcing_1.BusinessVendorLocationSourcing2026032700800().up(queryRunner);
    }
}
async function insertRow(queryRunner, tableName, row) {
    await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(tableName)
        .values(row)
        .orIgnore()
        .execute();
}
async function findVendorTypeId(queryRunner, typeCode) {
    const rawRows = await queryRunner.query(`
      SELECT "id"
      FROM "vendor_type_master"
      WHERE "typeCode" = $1
      LIMIT 1
    `, [typeCode]);
    const rows = Array.isArray(rawRows) ? rawRows : [];
    if (!rows.length) {
        throw new Error(`Vendor type not found for code: ${typeCode}`);
    }
    return rows[0].id;
}
async function findPortId(queryRunner, name, countryName) {
    const rawRows = await queryRunner.query(`
      SELECT "id"
      FROM "port_master"
      WHERE "name" = $1 AND "countryName" = $2
      LIMIT 1
    `, [name, countryName]);
    const rows = Array.isArray(rawRows) ? rawRows : [];
    if (!rows.length) {
        throw new Error(`Port not found for ${name} / ${countryName}`);
    }
    return rows[0].id;
}
class BusinessDemoVendorAndInquirySeed2026032701100 {
    name = 'BusinessDemoVendorAndInquirySeed2026032701100';
    async up(queryRunner) {
        await ensureVendorSchema(queryRunner);
        const typeIdByCode = new Map();
        const allTypeCodes = Array.from(new Set(VENDORS.flatMap((vendor) => vendor.offices.flatMap((office) => office.typeCodes))));
        for (const typeCode of allTypeCodes) {
            typeIdByCode.set(typeCode, await findVendorTypeId(queryRunner, typeCode));
        }
        for (const serviceLocation of SERVICE_LOCATIONS) {
            const createdAt = new Date();
            await insertRow(queryRunner, 'service_location_master', {
                id: serviceLocation.id,
                name: serviceLocation.name,
                normalizedName: normalizeNameKey(serviceLocation.name),
                cityName: serviceLocation.cityName,
                normalizedCityName: normalizeNameKey(serviceLocation.cityName),
                stateName: serviceLocation.stateName,
                countryName: serviceLocation.countryName,
                normalizedCountryName: normalizeNameKey(serviceLocation.countryName),
                locationKind: serviceLocation.locationKind,
                regionId: null,
                isActive: true,
                notes: serviceLocation.notes,
                createdAt,
                updatedAt: createdAt,
            });
        }
        for (const vendor of VENDORS) {
            const createdAt = new Date();
            const primaryOfficeId = vendor.offices[0]?.id ?? null;
            await insertRow(queryRunner, 'vendor_master', {
                id: vendor.id,
                companyName: vendor.companyName,
                normalizedName: normalizeNameKey(vendor.companyName),
                isActive: true,
                notes: vendor.notes,
                primaryOfficeId: null,
                createdAt,
                updatedAt: createdAt,
            });
            for (const office of vendor.offices) {
                await insertRow(queryRunner, 'vendor_offices', {
                    id: office.id,
                    vendorId: vendor.id,
                    officeName: office.officeName,
                    cityName: office.cityName,
                    stateName: office.stateName,
                    countryName: office.countryName,
                    addressRaw: office.addressRaw,
                    externalCode: office.externalCode,
                    specializationRaw: office.specializationRaw,
                    isActive: true,
                    isIataCertified: office.isIataCertified ?? false,
                    doesSeaFreight: office.doesSeaFreight ?? false,
                    doesProjectCargo: office.doesProjectCargo ?? false,
                    doesOwnConsolidation: office.doesOwnConsolidation ?? false,
                    doesOwnTransportation: office.doesOwnTransportation ?? false,
                    doesOwnWarehousing: office.doesOwnWarehousing ?? false,
                    doesOwnCustomClearance: office.doesOwnCustomClearance ?? false,
                    createdAt,
                    updatedAt: createdAt,
                });
                for (const typeCode of office.typeCodes) {
                    await insertRow(queryRunner, 'vendor_office_type_map', {
                        officeId: office.id,
                        vendorTypeId: typeIdByCode.get(typeCode),
                        isActive: true,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
                for (const portRef of office.portRefs) {
                    await insertRow(queryRunner, 'vendor_office_ports', {
                        officeId: office.id,
                        portId: await findPortId(queryRunner, portRef.name, portRef.country),
                        isPrimary: portRef.isPrimary ?? false,
                        notes: null,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
                for (const [index, serviceLocationId,] of office.serviceLocationIds.entries()) {
                    await insertRow(queryRunner, 'vendor_office_service_locations', {
                        officeId: office.id,
                        serviceLocationId,
                        isPrimary: index === 0,
                        notes: null,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
                for (const contact of office.contacts) {
                    await insertRow(queryRunner, 'vendor_contacts', {
                        id: contact.id,
                        officeId: office.id,
                        contactName: contact.contactName,
                        salutation: contact.salutation,
                        designation: contact.designation,
                        emailPrimary: contact.emailPrimary,
                        emailSecondary: null,
                        mobile1: contact.mobile1,
                        mobile2: null,
                        landline: null,
                        whatsappNumber: contact.mobile1,
                        isPrimary: contact.isPrimary,
                        isActive: true,
                        notes: null,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
                for (const ccRecipient of office.ccRecipients) {
                    await insertRow(queryRunner, 'vendor_cc_recipients', {
                        id: ccRecipient.id,
                        officeId: office.id,
                        email: ccRecipient.email,
                        isActive: true,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
            }
            if (primaryOfficeId) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update('vendor_master')
                    .set({ primaryOfficeId, updatedAt: createdAt })
                    .where(`"id" = :id`, { id: vendor.id })
                    .execute();
            }
        }
        for (const inquiry of INQUIRIES) {
            const createdAt = new Date(inquiry.createdAt);
            await insertRow(queryRunner, 'inquiries', {
                id: inquiry.id,
                inquiryNumber: inquiry.inquiryNumber,
                inquiryType: inquiry.inquiryType,
                status: inquiry.status,
                customerName: inquiry.customerName,
                customerRole: inquiry.customerRole,
                tradeLane: inquiry.tradeLane,
                origin: inquiry.origin,
                destination: inquiry.destination,
                shipmentMode: inquiry.shipmentMode,
                incoterm: inquiry.incoterm,
                cargoSummary: inquiry.cargoSummary,
                ownerUserId: null,
                mailboxOwnerUserId: null,
                latestClientThreadKey: null,
                latestAgentThreadKey: null,
                firstReadAt: null,
                lastMailEventAt: createdAt,
                extractedData: {
                    origin: inquiry.origin,
                    destination: inquiry.destination,
                    shipmentMode: inquiry.shipmentMode,
                    incoterm: inquiry.incoterm,
                    cargoSummary: inquiry.cargoSummary,
                },
                aiMeta: { source: 'demo-seed' },
                createdAt,
                updatedAt: createdAt,
            });
        }
        for (const [index, job] of JOBS.entries()) {
            const createdAt = new Date(INQUIRIES[index]?.createdAt ?? new Date().toISOString());
            await insertRow(queryRunner, 'jobs', {
                id: job.id,
                inquiryId: job.inquiryId,
                customerName: job.customerName,
                tradeLane: job.tradeLane,
                currentStage: job.currentStage,
                createdAt,
                updatedAt: createdAt,
            });
        }
        for (const part of JOB_SERVICE_PARTS) {
            await insertRow(queryRunner, 'job_service_parts', {
                id: part.id,
                jobId: part.jobId,
                partType: part.partType,
                ownerUserId: null,
                status: part.status,
                applicationSlug: part.applicationSlug,
                meta: part.meta,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
        DELETE FROM "job_service_parts"
        WHERE "id" = ANY($1::uuid[])
      `, [JOB_SERVICE_PARTS.map((part) => part.id)]);
        await queryRunner.query(`
        DELETE FROM "jobs"
        WHERE "id" = ANY($1::uuid[])
      `, [JOBS.map((job) => job.id)]);
        await queryRunner.query(`
        DELETE FROM "inquiries"
        WHERE "id" = ANY($1::uuid[])
      `, [INQUIRIES.map((inquiry) => inquiry.id)]);
        await queryRunner.query(`
        DELETE FROM "vendor_master"
        WHERE "id" = ANY($1::uuid[])
      `, [VENDORS.map((vendor) => vendor.id)]);
        await queryRunner.query(`
        DELETE FROM "service_location_master"
        WHERE "id" = ANY($1::uuid[])
      `, [SERVICE_LOCATIONS.map((serviceLocation) => serviceLocation.id)]);
    }
}
exports.BusinessDemoVendorAndInquirySeed2026032701100 = BusinessDemoVendorAndInquirySeed2026032701100;
//# sourceMappingURL=2026032701100-BusinessDemoVendorAndInquirySeed.js.map