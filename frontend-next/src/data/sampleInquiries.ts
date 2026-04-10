import type { InquiryData } from "@/types/rfq";

export const sampleInquiries: InquiryData[] = [
    { id: "INQ-1001", label: "INQ-1001 — Himalayan Exports (KTM → Hamburg)", customer: "Himalayan Exports Pvt Ltd", departmentId: "ocean_freight" },
    { id: "INQ-1002", label: "INQ-1002 — Nepal Tea (BRT → London)", customer: "Nepal Tea Collective", departmentId: "air_freight" },
    { id: "INQ-1003", label: "INQ-1003 — Pokhara Crafts (KTM → Birgunj)", customer: "Pokhara Handicrafts", departmentId: "road_freight" },
    { id: "INQ-1004", label: "INQ-1004 — Everest Pharma (Mumbai → KTM)", customer: "Everest Pharmaceuticals", departmentId: "air_freight" },
    { id: "INQ-1005", label: "INQ-1005 — Global Trading (Shanghai → KTM)", customer: "Global Trading House", departmentId: "ocean_freight" },
    { id: "INQ-1006", label: "INQ-1006 — SilkRoute Exports (KTM → Dubai)", customer: "SilkRoute Exports", departmentId: "overseas_agents" },
];
