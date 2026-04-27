"use client";

import {
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus, RefreshCcw, SquarePen, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { canEditModule, canViewModule } from "@/lib/module-access";
import {
  api,
  getErrorMessage,
  type PortMasterDetail,
  type PortMasterListItem,
  type PortMode,
  type UpsertPortMasterPayload,
} from "@/lib/api";
import { trimToUndefined } from "@/lib/payload/payload-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const ALL_FILTER = "ALL";

type FilterState = {
  search: string;
  portMode: PortMode | typeof ALL_FILTER;
  status: "ACTIVE" | "INACTIVE" | typeof ALL_FILTER;
};

type AliasDraft = {
  id?: string;
  alias: string;
  countryName: string;
  isPrimary: boolean;
  sourceWorkbook: string;
  sourceSheet: string;
};

type PortDraft = {
  code: string;
  name: string;
  cityName: string;
  stateName: string;
  countryName: string;
  portMode: PortMode;
  unlocode: string;
  sourceConfidence: string;
  isActive: boolean;
  notes: string;
  aliases: AliasDraft[];
};

function emptyAliasDraft(): AliasDraft {
  return {
    alias: "",
    countryName: "",
    isPrimary: false,
    sourceWorkbook: "",
    sourceSheet: "",
  };
}

function emptyPortDraft(): PortDraft {
  return {
    code: "",
    name: "",
    cityName: "",
    stateName: "",
    countryName: "",
    portMode: "SEAPORT",
    unlocode: "",
    sourceConfidence: "",
    isActive: true,
    notes: "",
    aliases: [],
  };
}

function draftFromDetail(port: PortMasterDetail): PortDraft {
  return {
    code: port.code,
    name: port.name,
    cityName: port.cityName ?? "",
    stateName: port.stateName ?? "",
    countryName: port.countryName,
    portMode: port.portMode,
    unlocode: port.unlocode ?? "",
    sourceConfidence: port.sourceConfidence ?? "",
    isActive: port.isActive,
    notes: port.notes ?? "",
    aliases: port.aliases.map((alias) => ({
      id: alias.id,
      alias: alias.alias,
      countryName: alias.countryName ?? "",
      isPrimary: alias.isPrimary,
      sourceWorkbook: alias.sourceWorkbook ?? "",
      sourceSheet: alias.sourceSheet ?? "",
    })),
  };
}

function toPayload(draft: PortDraft): UpsertPortMasterPayload {
  const hasPrimaryAlias = draft.aliases.some(
    (alias) => alias.isPrimary && alias.alias.trim(),
  );

  return {
    code: draft.code.trim(),
    name: draft.name.trim(),
    cityName: trimToUndefined(draft.cityName),
    stateName: trimToUndefined(draft.stateName),
    countryName: draft.countryName.trim(),
    portMode: draft.portMode,
    unlocode: trimToUndefined(draft.unlocode),
    sourceConfidence: trimToUndefined(draft.sourceConfidence),
    isActive: draft.isActive,
    notes: trimToUndefined(draft.notes),
    aliases: draft.aliases
      .filter((alias) => alias.alias.trim())
      .map((alias, index) => ({
        alias: alias.alias.trim(),
        countryName: trimToUndefined(alias.countryName),
        isPrimary: alias.isPrimary || (!hasPrimaryAlias && index === 0),
        sourceWorkbook: trimToUndefined(alias.sourceWorkbook),
        sourceSheet: trimToUndefined(alias.sourceSheet),
      })),
  };
}

export default function AdminPortsPage() {
  const { user } = useAuth();
  const isBaseAdmin = user?.role === "ADMIN" || user?.isAppAdmin === true;
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    portMode: ALL_FILTER,
    status: ALL_FILTER,
  });
  const deferredSearch = useDeferredValue(filters.search);
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState<{
    items: PortMasterListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PortDraft>(() => emptyPortDraft());
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const latestCatalogRequestId = useRef(0);

  const loadCatalog = useCallback(async () => {
    const requestId = latestCatalogRequestId.current + 1;
    latestCatalogRequestId.current = requestId;
    setLoading(true);
    try {
      const data = await api.getPortMaster({
        page,
        pageSize: PAGE_SIZE,
        search: deferredSearch.trim() || undefined,
        portMode:
          filters.portMode === ALL_FILTER ? undefined : filters.portMode,
        isActive:
          filters.status === ALL_FILTER
            ? undefined
            : filters.status === "ACTIVE",
      });
      if (requestId !== latestCatalogRequestId.current) {
        return;
      }
      setCatalog(data);
    } catch (error) {
      if (requestId !== latestCatalogRequestId.current) {
        return;
      }
      toast.error(getErrorMessage(error, "Failed to load port master"));
    } finally {
      if (requestId === latestCatalogRequestId.current) {
        setLoading(false);
      }
    }
  }, [deferredSearch, filters.portMode, filters.status, page]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const stats = useMemo(() => {
    const items = catalog?.items ?? [];
    return {
      visible: items.length,
      active: items.filter((port) => port.isActive).length,
      seaports: items.filter((port) => port.portMode === "SEAPORT").length,
      airports: items.filter((port) => port.portMode === "AIRPORT").length,
    };
  }, [catalog]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingPortId(null);
    setLoadingDetail(false);
    setDraft(emptyPortDraft());
    setDialogOpen(true);
  };

  const openEditDialog = async (portId: string) => {
    setDialogMode("edit");
    setEditingPortId(portId);
    setDraft(emptyPortDraft());
    setDialogOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await api.getPortMasterDetail(portId);
      setDraft(draftFromDetail(detail));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load port details"));
      setDialogOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSave = async () => {
    if (!draft.code.trim() || !draft.name.trim() || !draft.countryName.trim()) {
      toast.error("Code, name, and country are required");
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(draft);
      if (dialogMode === "create") {
        await api.createPortMaster(payload);
      } else if (editingPortId) {
        await api.updatePortMaster(editingPortId, payload);
      }

      setDialogOpen(false);
      await loadCatalog();
      toast.success(dialogMode === "create" ? "Port created" : "Port updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save port"));
    } finally {
      setSaving(false);
    }
  };

  const handleAliasChange = (
    index: number,
    field: keyof AliasDraft,
    value: string | boolean,
  ) => {
    setDraft((current) => ({
      ...current,
      aliases: current.aliases.map((alias, aliasIndex) => {
        if (field === "isPrimary") {
          if (aliasIndex !== index) {
            return { ...alias, isPrimary: false };
          }
          return { ...alias, isPrimary: Boolean(value) };
        }

        if (aliasIndex !== index) {
          return alias;
        }

        return { ...alias, [field]: String(value) };
      }),
    }));
  };

  const canViewPorts = isBaseAdmin || canViewModule(user, "admin-ports");
  const canEditPorts = isBaseAdmin || canEditModule(user, "admin-ports");

  if (!canViewPorts) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Port Master</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage airport and seaport records, keep aliases clean, and control
            what stays active for vendor matching.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadCatalog()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canEditPorts && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Port
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Visible Ports" value={String(stats.visible)} />
        <StatCard label="Active In View" value={String(stats.active)} />
        <StatCard label="Seaports In View" value={String(stats.seaports)} />
        <StatCard label="Airports In View" value={String(stats.airports)} />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search by code, name, city, country, UN/LOCODE, or alias.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
          <Field label="Search">
            <Input
              value={filters.search}
              onChange={(event) => {
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }));
                setPage(1);
              }}
              placeholder="Try Jebel Ali, AEDXB, Ho Chi Minh, Cat Lai..."
            />
          </Field>

          <Field label="Mode">
            <Select
              value={filters.portMode}
              onValueChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  portMode: value as FilterState["portMode"],
                }));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All modes</SelectItem>
                <SelectItem value="SEAPORT">Seaport</SelectItem>
                <SelectItem value="AIRPORT">Airport</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  status: value as FilterState["status"],
                }));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  search: "",
                  portMode: ALL_FILTER,
                  status: ALL_FILTER,
                });
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Port Records</CardTitle>
          <CardDescription>
            Review aliases and linked office coverage before changing shared
            master data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Aliases</TableHead>
                  <TableHead>Linked Offices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading port master...
                    </TableCell>
                  </TableRow>
                ) : catalog && catalog.items.length > 0 ? (
                  catalog.items.map((port) => (
                    <TableRow key={port.id}>
                      <TableCell className="font-medium">{port.code}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{port.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {[port.cityName, port.stateName]
                              .filter(Boolean)
                              .join(", ") || "No city/state"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{port.portMode}</Badge>
                      </TableCell>
                      <TableCell>{port.countryName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {port.aliases.slice(0, 3).map((alias) => (
                            <Badge key={alias.id} variant="secondary">
                              {alias.alias}
                            </Badge>
                          ))}
                          {port.aliases.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              No aliases
                            </span>
                          ) : null}
                          {port.aliases.length > 3 ? (
                            <Badge variant="outline">
                              +{port.aliases.length - 3} more
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{port.linkedOfficeCount}</TableCell>
                      <TableCell>
                        <Badge variant={port.isActive ? "default" : "outline"}>
                          {port.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canEditPorts && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void openEditDialog(port.id)}
                          >
                            <SquarePen className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No ports matched these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {catalog
                ? `Showing page ${catalog.page} of ${Math.max(catalog.totalPages, 1)} (${catalog.total} records)`
                : "No data loaded yet"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!catalog || catalog.page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!catalog || catalog.page >= catalog.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent className="w-full max-w-[min(96vw,1060px)]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add Port" : "Edit Port"}
            </DialogTitle>
            <DialogDescription>
              Keep Port Master clean: use real port records, then add
              workbook-friendly aliases only where they are safe.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading port details...
            </div>
          ) : (
            <div className="grid max-h-[68svh] gap-5 overflow-y-auto pr-1">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Code">
                  <Input
                    value={draft.code}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        code: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Name">
                  <Input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Mode">
                  <Select
                    value={draft.portMode}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        portMode: value as PortMode,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEAPORT">Seaport</SelectItem>
                      <SelectItem value="AIRPORT">Airport</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Country">
                  <Input
                    value={draft.countryName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        countryName: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={draft.cityName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        cityName: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={draft.stateName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        stateName: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="UN/LOCODE">
                  <Input
                    value={draft.unlocode}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        unlocode: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Source Confidence">
                  <Input
                    value={draft.sourceConfidence}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sourceConfidence: event.target.value,
                      }))
                    }
                    placeholder="official, reviewed, workbook override..."
                  />
                </Field>
              </div>

              <Field label="Notes">
                <Textarea
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Store context for future cleanup work..."
                />
              </Field>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Checkbox
                  checked={draft.isActive}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                  }
                  id="port-is-active"
                />
                <Label htmlFor="port-is-active" className="cursor-pointer">
                  Keep this port active for matching and vendor coverage
                </Label>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">Aliases</h3>
                    <p className="text-sm text-muted-foreground">
                      Use aliases for safe alternate labels only. Broad aliases
                      can create wrong matches later.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        aliases: [...current.aliases, emptyAliasDraft()],
                      }))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Alias
                  </Button>
                </div>

                {draft.aliases.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                    No aliases added yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {draft.aliases.map((alias, index) => (
                      <div
                        key={alias.id ?? `alias-${index}`}
                        className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(200px,2fr)_minmax(120px,1fr)_minmax(130px,1fr)_minmax(130px,1fr)_auto_auto]"
                      >
                        <Field label="Alias">
                          <Input
                            value={alias.alias}
                            onChange={(event) =>
                              handleAliasChange(
                                index,
                                "alias",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field label="Country Scope">
                          <Input
                            value={alias.countryName}
                            onChange={(event) =>
                              handleAliasChange(
                                index,
                                "countryName",
                                event.target.value,
                              )
                            }
                            placeholder="Optional"
                          />
                        </Field>
                        <Field label="Source Workbook">
                          <Input
                            value={alias.sourceWorkbook}
                            onChange={(event) =>
                              handleAliasChange(
                                index,
                                "sourceWorkbook",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field label="Source Sheet">
                          <Input
                            value={alias.sourceSheet}
                            onChange={(event) =>
                              handleAliasChange(
                                index,
                                "sourceSheet",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                        <div className="flex items-end pb-2 xl:justify-center">
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={alias.isPrimary}
                              onCheckedChange={(checked) =>
                                handleAliasChange(
                                  index,
                                  "isPrimary",
                                  checked === true,
                                )
                              }
                            />
                            Primary
                          </label>
                        </div>
                        <div className="flex items-end justify-end pb-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                aliases: current.aliases.filter(
                                  (_, aliasIndex) => aliasIndex !== index,
                                ),
                              }))
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || loadingDetail}
            >
              {saving
                ? "Saving..."
                : dialogMode === "create"
                  ? "Create Port"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
