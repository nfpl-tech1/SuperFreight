export declare enum VendorTypeCode {
    TRANSPORTER = "TRANSPORTER",
    CFS_BUFFER_YARD = "CFS_BUFFER_YARD",
    CHA = "CHA",
    IATA = "IATA",
    CO_LOADER = "CO_LOADER",
    CARRIER = "CARRIER",
    SHIPPING_LINE = "SHIPPING_LINE",
    PACKER = "PACKER",
    LICENSING = "LICENSING",
    WCA_AGENT = "WCA_AGENT"
}
export declare class VendorTypeMaster {
    id: string;
    typeCode: VendorTypeCode;
    typeName: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
