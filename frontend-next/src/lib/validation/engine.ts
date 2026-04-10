import type { FieldDefinition, FormValues, ValidationResult } from "@/types/rfq";
import { isFieldVisible } from "./visibility";
import { validateFieldType } from "./typeChecks";
import { validateFieldRules } from "./ruleChecks";

function isEmpty(value: string | string[] | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

export function validateField(field: FieldDefinition, value: string | string[] | undefined): string | null {
    if (field.required && isEmpty(value)) {
        return `${field.label} is required.`;
    }
    if (isEmpty(value)) return null;

    const typeError = validateFieldType(field, value!);
    if (typeError) return typeError;

    const ruleError = validateFieldRules(field, value!);
    if (ruleError) return ruleError;

    return null;
}

export function validateAllFields(fields: FieldDefinition[], values: FormValues): ValidationResult {
    const errors: Record<string, string> = {};

    for (const field of fields) {
        if (!isFieldVisible(field, values)) continue;
        const error = validateField(field, values[field.key]);
        if (error) {
            errors[field.key] = error;
        }
    }

    return {
        errors,
        warnings: [],
        isValid: Object.keys(errors).length === 0,
    };
}
