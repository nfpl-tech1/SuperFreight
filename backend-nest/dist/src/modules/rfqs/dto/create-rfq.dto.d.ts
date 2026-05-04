declare class ResponseFieldDto {
    fieldKey: string;
    fieldLabel: string;
    isCustom: boolean;
}
declare class OfficeSelectionDto {
    vendorId: string;
    officeId: string;
}
export declare class MscFieldsDto {
    shipper: string;
    forwarder: string;
    por: string;
    pol: string;
    pod: string;
    commodity: string;
    cargoWeight: string;
    volume: string;
    requestedRates: string;
    freeTimeIfAny: string;
    validity: string;
    termsOfShipment: string;
    specificRemarks: string;
}
export declare class CreateRfqDto {
    inquiryId: string;
    inquiryNumber: string;
    departmentId: string;
    formValues: Record<string, unknown>;
    vendorIds: string[];
    officeSelections?: OfficeSelectionDto[];
    responseFields: ResponseFieldDto[];
    mscFields?: MscFieldsDto;
    customCcEmail?: string;
    sendNow?: boolean;
    mailSubject?: string;
    mailBodyHtml?: string;
}
export {};
