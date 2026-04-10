export interface Enquiry {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  shipmentType: "Ocean" | "Air" | "Transport" | "CHA";
  cargoDescription: string;
  weight: string;
  status: "Pending" | "RFQ Sent" | "Quotes Received" | "Quoted to Customer" | "Closed";
  date: string;
}

export const enquiries: Enquiry[] = [
  { id: "ENQ-001", customer: "Himalayan Exports Pvt Ltd", origin: "Kathmandu, Nepal", destination: "Hamburg, Germany", shipmentType: "Ocean", cargoDescription: "Handicraft items, 40 cartons", weight: "2,400 KG", status: "Pending", date: "2026-02-25" },
  { id: "ENQ-002", customer: "Nepal Tea Collective", origin: "Biratnagar, Nepal", destination: "London, UK", shipmentType: "Air", cargoDescription: "Organic tea, 120 bags", weight: "1,800 KG", status: "RFQ Sent", date: "2026-02-24" },
  { id: "ENQ-003", customer: "Everest Garments", origin: "Birgunj, Nepal", destination: "Kolkata, India", shipmentType: "Transport", cargoDescription: "Ready-made garments, 2 trucks", weight: "8,000 KG", status: "Quotes Received", date: "2026-02-22" },
  { id: "ENQ-004", customer: "Sagarmatha Imports", origin: "Shanghai, China", destination: "Birgunj, Nepal", shipmentType: "CHA", cargoDescription: "Electronics, 1x20' FCL", weight: "14,000 KG", status: "Quoted to Customer", date: "2026-02-20" },
  { id: "ENQ-005", customer: "Lumbini Spices", origin: "Nepalgunj, Nepal", destination: "Dubai, UAE", shipmentType: "Air", cargoDescription: "Spice consignment, 60 cartons", weight: "900 KG", status: "Pending", date: "2026-02-27" },
  { id: "ENQ-006", customer: "Pokhara Handicrafts", origin: "Pokhara, Nepal", destination: "New York, USA", shipmentType: "Ocean", cargoDescription: "Pashmina & handmade goods, 25 cartons", weight: "1,200 KG", status: "Closed", date: "2026-02-15" },
];
