import type { FieldDefinition, FormValues } from "@/types/rfq";

function matchesCondition(actual: string | string[] | undefined, expected: string | string[]): boolean {
    const normalizedActual = String(actual ?? "").trim().toLowerCase();
    if (Array.isArray(expected)) {
        const normalizedExpected = expected.map((v) => v.trim().toLowerCase());
        return normalizedExpected.includes(normalizedActual);
    }
    return normalizedActual === expected.trim().toLowerCase();
}

export function isFieldVisible(field: FieldDefinition, values: FormValues): boolean {
    const visibleIf = field.rules?.visible_if;
    if (!visibleIf || typeof visibleIf !== "object") return true;
    return Object.entries(visibleIf).every(([key, expected]) =>
        matchesCondition(values[key] as string | undefined, expected),
    );
}
