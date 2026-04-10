"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DepartmentDefinition } from "@/types/rfq";

interface Props {
    departments: DepartmentDefinition[];
    selectedId: string;
    onChange: (departmentId: string) => void;
}

export function DepartmentSelector({ departments, selectedId, onChange }: Props) {
    return (
        <Select value={selectedId} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
                {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
