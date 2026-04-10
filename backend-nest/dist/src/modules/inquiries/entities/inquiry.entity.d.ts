export declare enum InquiryType {
    CHA_ONLY = "CHA_ONLY",
    FREIGHT_ONLY = "FREIGHT_ONLY",
    CHA_FREIGHT = "CHA_FREIGHT"
}
export declare enum InquiryStatus {
    PENDING = "PENDING",
    RFQ_SENT = "RFQ_SENT",
    QUOTES_RECEIVED = "QUOTES_RECEIVED",
    QUOTED_TO_CUSTOMER = "QUOTED_TO_CUSTOMER",
    CLOSED = "CLOSED"
}
export declare enum TradeLane {
    EXPORT = "Export",
    IMPORT = "Import",
    CROSS_TRADE = "Cross Trade"
}
export declare enum ShipmentMode {
    AIR = "AIR",
    FCL = "FCL",
    LCL = "LCL"
}
export declare enum InquiryCustomerRole {
    CONSIGNEE = "Consignee/Agent",
    SHIPPER = "Shipper"
}
export declare class Inquiry {
    id: string;
    inquiryNumber: string;
    inquiryType: InquiryType;
    status: InquiryStatus;
    customerName: string;
    customerRole: InquiryCustomerRole | null;
    tradeLane: string | null;
    origin: string | null;
    destination: string | null;
    shipmentMode: string | null;
    incoterm: string | null;
    cargoSummary: string | null;
    ownerUserId: string | null;
    mailboxOwnerUserId: string | null;
    latestClientThreadKey: string | null;
    latestAgentThreadKey: string | null;
    firstReadAt: Date | null;
    lastMailEventAt: Date | null;
    extractedData: Record<string, unknown> | null;
    aiMeta: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
