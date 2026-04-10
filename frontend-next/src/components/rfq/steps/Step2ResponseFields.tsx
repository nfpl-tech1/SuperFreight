"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { ResponseField } from "@/types/rfq";
import {
    countSelectedResponseFields,
    splitResponseFields,
} from "@/components/rfq/steps/rfq-step.helpers";

interface Props {
    responseFields: ResponseField[];
    onToggle: (id: string) => void;
    onAddCustom: (label: string) => void;
    onRemoveCustom: (id: string) => void;
}

export function Step2ResponseFields({ responseFields, onToggle, onAddCustom, onRemoveCustom }: Props) {
    const [newFieldLabel, setNewFieldLabel] = useState("");
    const { predefined, custom } = splitResponseFields(responseFields);
    const selectedCount = countSelectedResponseFields(responseFields);

    const handleAdd = () => {
        const trimmed = newFieldLabel.trim();
        if (trimmed) { onAddCustom(trimmed); setNewFieldLabel(""); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-3 flex shrink-0 flex-col gap-3 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-primary m-0">Expected Response Fields</h2>
                    <p className="text-[0.8125rem] text-muted-foreground m-0">
                        Select the data points you expect vendors to include in their RFQ response.
                    </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                    {selectedCount} field{selectedCount !== 1 ? "s" : ""} selected
                </Badge>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
                {/* Standard Fields */}
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="px-4 py-2 border-b border-border">
                        <span className="text-sm font-semibold leading-none text-card-foreground">Standard Fields</span>
                    </div>
                    <div className="px-4 py-3">
                        <div className="grid gap-1 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))]">
                            {predefined.map((field) => (
                                <label key={field.id} className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded hover:bg-[hsl(214_40%_97%)] transition-colors">
                                    <Checkbox checked={field.selected} onCheckedChange={() => onToggle(field.id)} />
                                    <span className={`text-[0.8125rem] ${field.selected ? "text-primary font-medium" : "text-[hsl(215_20%_40%)]"}`}>
                                        {field.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Fields */}
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="px-4 py-2 border-b border-border">
                        <span className="text-sm font-semibold leading-none text-card-foreground">Custom Fields</span>
                    </div>
                    <div className="px-4 py-3 flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a custom field name and press Enter..."
                                className="w-full sm:max-w-xs"
                            />
                            <Button size="sm" onClick={handleAdd} disabled={!newFieldLabel.trim()}>
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </div>
                        {custom.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {custom.map((field) => (
                                    <div key={field.id} className="flex items-center gap-1.5 px-2 py-1.5 border border-border rounded text-[0.8125rem]">
                                        <Checkbox checked={field.selected} onCheckedChange={() => onToggle(field.id)} />
                                        <span className="text-[0.8125rem] text-[hsl(215_20%_40%)]">{field.label}</span>
                                        <button
                                            type="button"
                                            className="bg-transparent border-0 cursor-pointer p-0.5 text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                                            onClick={() => onRemoveCustom(field.id)}
                                            title="Remove"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {custom.length === 0 && (
                            <p className="text-[0.8125rem] text-muted-foreground italic">No custom fields added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
