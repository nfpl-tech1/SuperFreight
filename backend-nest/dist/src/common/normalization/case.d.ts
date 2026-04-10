type SmartTitleCaseOptions = {
    preserveGenericAcronyms?: boolean;
};
export declare function toSmartTitleCase(value: string, uppercaseWords?: Set<string>, options?: SmartTitleCaseOptions): string;
export {};
