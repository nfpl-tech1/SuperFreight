"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, Check, ChevronDown, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VendorLocationOption } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ALL_FILTER } from "@/app/(protected)/vendors/vendors.helpers";

export function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-slate-50/70 shadow-none">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function getPortSearchText(port: VendorLocationOption) {
  return [
    port.label,
    port.subLabel,
    port.countryName,
    port.portMode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getPortDisplayLabel(port: VendorLocationOption) {
  return port.subLabel ? `${port.label} (${port.subLabel})` : port.label;
}

export function SearchablePortSelect({
  options,
  value,
  onChange,
  placeholder = "Port",
  allLabel = "All ports",
  className,
}: {
  options: VendorLocationOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedPort = options.find((port) => port.id === value) ?? null;

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return options.slice(0, 8);
    }

    return options
      .filter((port) => getPortSearchText(port).includes(normalizedSearch))
      .slice(0, 8);
  }, [options, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full sm:w-[18rem]", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Anchor className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-left text-slate-700">
            {selectedPort
              ? getPortDisplayLabel(selectedPort)
              : value === ALL_FILTER
                ? allLabel
                : placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search port, city, country"
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="mt-3 flex max-h-64 flex-col gap-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect(ALL_FILTER)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50",
                value === ALL_FILTER
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600",
              )}
            >
              <span>{allLabel}</span>
              {value === ALL_FILTER ? <Check className="h-4 w-4" /> : null}
            </button>

            {filteredOptions.map((port) => {
              const selected = port.id === value;
              return (
                <button
                  key={port.id}
                  type="button"
                  onClick={() => handleSelect(port.id)}
                  className={cn(
                    "flex items-start justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50",
                    selected ? "bg-slate-100" : "",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {port.label}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {port.subLabel || port.countryName}
                    </p>
                  </div>
                  {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" /> : null}
                </button>
              );
            })}

            {filteredOptions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                No ports match this search.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SearchablePortMultiSelect({
  options,
  selectedIds,
  onChange,
}: {
  options: VendorLocationOption[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const selectedPorts = useMemo(
    () => options.filter((port) => selectedIds.includes(port.id)),
    [options, selectedIds],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return options
      .filter((port) => !selectedIds.includes(port.id))
      .filter((port) =>
        normalizedSearch
          ? getPortSearchText(port).includes(normalizedSearch)
          : true,
      )
      .slice(0, normalizedSearch ? 8 : 6);
  }, [options, search, selectedIds]);

  const addPort = (portId: string) => {
    onChange([...selectedIds, portId]);
    setSearch("");
  };

  const removePort = (portId: string) => {
    onChange(selectedIds.filter((current) => current !== portId));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search port, city, country"
          className="pl-9"
        />
      </div>

      {selectedPorts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedPorts.map((port) => (
            <button
              key={port.id}
              type="button"
              onClick={() => removePort(port.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(228,55%,23%)] bg-[hsl(228,55%,23%)] px-3 py-1.5 text-sm text-white transition hover:opacity-90"
            >
              <span className="max-w-[18rem] truncate">
                {getPortDisplayLabel(port)}
              </span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No ports linked yet. Search and add the ports this office serves.
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Suggestions
        </p>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {filteredOptions.map((port) => (
            <button
              key={port.id}
              type="button"
              onClick={() => addPort(port.id)}
              className="rounded-xl bg-white px-3 py-2 text-left transition hover:bg-slate-100"
            >
              <p className="truncate text-sm font-medium text-slate-900">
                {port.label}
              </p>
              <p className="truncate text-xs text-slate-500">
                {port.subLabel || port.countryName}
              </p>
            </button>
          ))}

          {filteredOptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm text-slate-500">
              No ports match this search.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
