declare class ResponseFieldDto {
    fieldKey: string;
    fieldLabel: string;
    isCustom: boolean;
}
declare class OfficeSelectionDto {
    vendorId: string;
    officeId: string;
}
export declare class CreateRfqDto {
    inquiryId: string;
    inquiryNumber: string;
    departmentId: string;
    formValues: Record<string, unknown>;
    vendorIds: string[];
    officeSelections?: OfficeSelectionDto[];
    responseFields: ResponseFieldDto[];
    sendNow?: boolean;
    mailSubject?: string;
    mailBodyHtml?: string;
}
export {};
