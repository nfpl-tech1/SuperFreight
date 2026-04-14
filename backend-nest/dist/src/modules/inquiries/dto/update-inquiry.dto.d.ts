import { InquiryCustomerRole, InquiryType, ShipmentMode, TradeLane } from '../entities/inquiry.entity';
export declare class UpdateInquiryDto {
    inquiryNumber?: string;
    customerName?: string;
    customerRole?: InquiryCustomerRole;
    tradeLane?: TradeLane;
    origin?: string;
    destination?: string;
    shipmentMode?: ShipmentMode;
    incoterm?: string;
    cargoSummary?: string;
    inquiryType?: InquiryType;
}
