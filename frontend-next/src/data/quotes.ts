export interface VendorQuote {
  id: string;
  enquiryId: string;
  vendorId: string;
  vendorName: string;
  freightRate: number;
  localCharges: number;
  documentation: number;
  totalRate: number;
  currency: string;
  transitDays: number;
  validUntil: string;
  remarks: string;
}

export const vendorQuotes: VendorQuote[] = [
  { id: "Q001", enquiryId: "ENQ-001", vendorId: "V001", vendorName: "Himalayan Freight Co.", freightRate: 1200, localCharges: 150, documentation: 50, totalRate: 1400, currency: "USD", transitDays: 28, validUntil: "2026-03-15", remarks: "Via Colombo transshipment" },
  { id: "Q002", enquiryId: "ENQ-001", vendorId: "V004", vendorName: "Gulf Freight Services", freightRate: 1100, localCharges: 200, documentation: 60, totalRate: 1360, currency: "USD", transitDays: 32, validUntil: "2026-03-10", remarks: "Direct service from Nhava Sheva" },
  { id: "Q003", enquiryId: "ENQ-003", vendorId: "V002", vendorName: "SilkRoute Logistics", freightRate: 800, localCharges: 100, documentation: 30, totalRate: 930, currency: "USD", transitDays: 5, validUntil: "2026-03-20", remarks: "Road freight via Birgunj ICD" },
  { id: "Q004", enquiryId: "ENQ-003", vendorId: "V005", vendorName: "Eastern Customs House", freightRate: 750, localCharges: 120, documentation: 40, totalRate: 910, currency: "USD", transitDays: 6, validUntil: "2026-03-22", remarks: "Includes customs clearance" },
];
