"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { VendorLocationOption } from "@/types/rfq";

export type VendorLocationModeOption = {
    value: string;
    label: string;
};

interface Props {
    label?: string;
    placeholder: string;
    value: string;
    selectedMode?: string;
    modeOptions?: VendorLocationModeOption[];
    options: VendorLocationOption[];
    loading?: boolean;
    enableLocationOptions?: boolean;
    onModeChange?: (value: string) => void;
    onQueryChange: (value: string) => void;
    onSelect: (option: VendorLocationOption) => void;
    onClear: () => void;
}

export function VendorLocationPicker({
    label,
    placeholder,
    value,
    selectedMode = "all",
    modeOptions = [{ value: "all", label: "All" }],
    options,
    loading = false,
    enableLocationOptions = true,
    onModeChange,
    onQueryChange,
    onSelect,
    onClear,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const showModeSelect = modeOptions.length > 1 || Boolean(onModeChange);

    return (
        <div className="relative">
            <div className="space-y-2">
                {label ? <div className="text-sm font-medium text-foreground">{label}</div> : null}
                <div className="flex overflow-hidden rounded-md border border-border/80 bg-white">
                    {showModeSelect ? (
                        <Select
                            value={selectedMode}
                            onValueChange={(nextValue) => {
                                setIsOpen(false);
                                onModeChange?.(nextValue);
                            }}
                        >
                            <SelectTrigger className="h-12 w-[220px] rounded-none border-0 border-r bg-[hsl(214_38%_98%)] px-4 text-sm shadow-none focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {modeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : null}

                    <div className="relative flex-1">
                        <Input
                            value={value}
                            onFocus={() => {
                                if (enableLocationOptions) {
                                    setIsOpen(true);
                                }
                            }}
                            onChange={(event) => {
                                if (enableLocationOptions) {
                                    setIsOpen(true);
                                }
                                onQueryChange(event.target.value);
                            }}
                            onBlur={() => {
                                window.setTimeout(() => setIsOpen(false), 120);
                            }}
                            placeholder={placeholder}
                            className="h-12 rounded-none border-0 pr-24 text-sm shadow-none focus-visible:ring-0"
                            autoComplete="off"
                        />
                        {value ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-sm px-3 text-xs"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    setIsOpen(false);
                                    onClear();
                                }}
                            >
                                Clear
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {enableLocationOptions && isOpen ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-border/80 bg-white shadow-lg">
                    <ScrollArea className="max-h-72">
                        <div className="p-1.5">
                            {loading ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                    Loading locations...
                                </div>
                            ) : options.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                    No matching locations found.
                                </div>
                            ) : (
                                options.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={cn(
                                            "flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/40",
                                        )}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            onSelect(option);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="text-sm font-medium text-foreground">{option.label}</span>
                                        {option.subLabel ? (
                                            <span className="mt-0.5 text-xs text-muted-foreground">
                                                {option.subLabel}
                                            </span>
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ) : null}
        </div>
    );
}
