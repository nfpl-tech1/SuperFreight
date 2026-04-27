"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  api,
  getErrorMessage,
  type VendorCatalogPage,
  type VendorDetail,
  type VendorLocationOption,
  type VendorLookups,
  type VendorOfficeDetail,
} from "@/lib/api";
import { toast } from "sonner";
import {
  ALL_FILTER,
  buildOfficeNameCandidate,
  emptyOfficeDraft,
  getVisibleVendorTypes,
  officeDraftFromDetail,
  PAGE_SIZE,
  toOfficePayload,
  toVendorPayload,
  type OfficeDraft,
  type VendorDraft,
  type VendorFilters,
  vendorDraftFromDetail,
  hasAnyContactValue,
} from "@/app/(protected)/vendors/vendors.helpers";
import {
  DeleteVendorDialog,
  OfficeDialog,
  VendorDialog,
} from "@/app/(protected)/vendors/vendors.dialogs";
import { VendorDetailDialog } from "@/app/(protected)/vendors/vendor-detail-dialog";
import { VendorCatalogSection } from "@/app/(protected)/vendors/vendors.catalog";
import { canEditModule } from "@/lib/module-access";

export default function VendorsPage() {
  const { user } = useAuth();
  const isBaseAdmin = user?.role === "ADMIN" || user?.isAppAdmin === true;
  const canManage = isBaseAdmin || canEditModule(user, "vendors");
  const [lookups, setLookups] = useState<VendorLookups>({
    vendorTypes: [],
    countries: [],
  });
  const [portOptions, setPortOptions] = useState<VendorLocationOption[]>([]);
  const [catalog, setCatalog] = useState<VendorCatalogPage | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorDetail | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState<VendorFilters>({
    search: "",
    typeCode: ALL_FILTER,
    portId: ALL_FILTER,
  });
  const deferredSearch = useDeferredValue(filters.search);
  const [page, setPage] = useState(1);
  const [loadingBootData, setLoadingBootData] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
  const [vendorDialogMode, setVendorDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [officeDialogMode, setOfficeDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [vendorDraft, setVendorDraft] = useState<VendorDraft>({
    companyName: "",
    notes: "",
    isActive: true,
  });
  const [officeDraft, setOfficeDraft] = useState<OfficeDraft>(emptyOfficeDraft);
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
  const [savingVendor, setSavingVendor] = useState(false);
  const [savingOffice, setSavingOffice] = useState(false);
  const [deleteVendorDialogOpen, setDeleteVendorDialogOpen] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState(false);

  const selectedVendorListItem = useMemo(
    () =>
      catalog?.items.find((vendor) => vendor.id === selectedVendorId) ?? null,
    [catalog, selectedVendorId],
  );
  const visibleLookups = useMemo(
    () => ({
      ...lookups,
      vendorTypes: getVisibleVendorTypes(lookups.vendorTypes),
    }),
    [lookups],
  );

  const loadPortOptions = useCallback(async () => {
    const firstPage = await api.getVendorLocationOptions({
      page: 1,
      pageSize: 100,
      locationKind: "PORT",
    });

    const items = [...firstPage.items];
    for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
      const nextPage = await api.getVendorLocationOptions({
        page: currentPage,
        pageSize: 100,
        locationKind: "PORT",
      });
      items.push(...nextPage.items);
    }

    return items;
  }, []);

  const loadLookups = useCallback(async () => {
    const [lookupData, ports] = await Promise.all([
      api.getVendorLookups(),
      loadPortOptions(),
    ]);
    setLookups(lookupData);
    setPortOptions(ports);
  }, [loadPortOptions]);

  const refreshCatalog = useCallback(
    async (preferredVendorId?: string) => {
      setLoadingCatalog(true);
      try {
        const data = await api.getVendors({
          page,
          pageSize: PAGE_SIZE,
          search: deferredSearch.trim() || undefined,
          typeCodes:
            filters.typeCode === ALL_FILTER ? undefined : [filters.typeCode],
          locationKind: filters.portId === ALL_FILTER ? undefined : "PORT",
          locationId: filters.portId === ALL_FILTER ? undefined : filters.portId,
          locationScope: filters.portId === ALL_FILTER ? undefined : "EXACT",
        });
        setCatalog(data);
        setSelectedVendorId((current) => {
          if (
            preferredVendorId &&
            data.items.some((vendor) => vendor.id === preferredVendorId)
          ) {
            return preferredVendorId;
          }
          if (current && data.items.some((vendor) => vendor.id === current)) {
            return current;
          }
          return null;
        });
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load vendor catalog"));
      } finally {
        setLoadingCatalog(false);
      }
    },
    [
      deferredSearch,
      filters.portId,
      filters.typeCode,
      page,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingBootData(true);
      try {
        const [lookupData, ports] = await Promise.all([
          api.getVendorLookups(),
          loadPortOptions(),
        ]);
        if (!cancelled) {
          setLookups(lookupData);
          setPortOptions(ports);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "Failed to load vendor master"));
        }
      } finally {
        if (!cancelled) {
          setLoadingBootData(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadPortOptions]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (!selectedVendorId) {
      setSelectedVendor(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingDetail(true);
      try {
        const detail = await api.getVendorDetail(selectedVendorId);
        if (!cancelled) {
          setSelectedVendor(detail);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "Failed to load vendor details"));
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedVendorId]);

  const openVendorDetails = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setSelectedVendor(null);
    setDetailDialogOpen(true);
  };

  const openCreateVendor = () => {
    setVendorDialogMode("create");
    setVendorDraft({
      companyName: "",
      notes: "",
      isActive: true,
    });
    setVendorDialogOpen(true);
  };

  const openEditVendor = () => {
    if (!selectedVendor) return;
    setDetailDialogOpen(false);
    setVendorDialogMode("edit");
    setVendorDraft(vendorDraftFromDetail(selectedVendor));
    setVendorDialogOpen(true);
  };

  const openCreateOffice = () => {
    if (!selectedVendorId) return;
    setDetailDialogOpen(false);
    setOfficeDialogMode("create");
    setEditingOfficeId(null);
    setOfficeDraft(emptyOfficeDraft());
    setOfficeDialogOpen(true);
  };

  const openDeleteVendor = () => {
    if (!selectedVendor) return;
    setDetailDialogOpen(false);
    setDeleteVendorDialogOpen(true);
  };

  const openEditOffice = (office: VendorOfficeDetail) => {
    setDetailDialogOpen(false);
    setOfficeDialogMode("edit");
    setEditingOfficeId(office.id);
    setOfficeDraft(officeDraftFromDetail(office));
    setOfficeDialogOpen(true);
  };

  const handleVendorSave = async () => {
    if (!vendorDraft.companyName.trim()) {
      toast.error("Vendor company name is required");
      return;
    }

    setSavingVendor(true);
    try {
      const payload = toVendorPayload(vendorDraft);
      const saved =
        vendorDialogMode === "create"
          ? await api.createVendor(payload)
          : await api.updateVendor(selectedVendorId as string, payload);

      setSelectedVendor(saved);
      setSelectedVendorId(saved.id);
      setDetailDialogOpen(true);
      setVendorDialogOpen(false);
      await refreshCatalog(saved.id);
      toast.success(
        vendorDialogMode === "create" ? "Vendor created" : "Vendor updated",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save vendor"));
    } finally {
      setSavingVendor(false);
    }
  };

  const handleOfficeSave = async () => {
    if (!selectedVendorId) {
      toast.error("Select a vendor first");
      return;
    }

    if (!buildOfficeNameCandidate(officeDraft)) {
      toast.error(
        "Add at least a city, state, country, or external code for this office",
      );
      return;
    }

    const primaryContacts = officeDraft.contacts
      .filter((contact) => hasAnyContactValue(contact))
      .filter((contact) => contact.isPrimary).length;
    if (primaryContacts > 1) {
      toast.error("Only one primary contact can be selected per office");
      return;
    }

    setSavingOffice(true);
    try {
      const payload = toOfficePayload(officeDraft);
      const saved =
        officeDialogMode === "create"
          ? await api.createVendorOffice(selectedVendorId, payload)
          : await api.updateVendorOffice(editingOfficeId as string, payload);

      setSelectedVendor(saved);
      setSelectedVendorId(saved.id);
      setDetailDialogOpen(true);
      setOfficeDialogOpen(false);
      await refreshCatalog(saved.id);
      toast.success(
        officeDialogMode === "create" ? "Office added" : "Office updated",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save vendor office"));
    } finally {
      setSavingOffice(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      typeCode: ALL_FILTER,
      portId: ALL_FILTER,
    });
    setPage(1);
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendorId) {
      toast.error("Select a vendor first");
      return;
    }

    setDeletingVendor(true);
    try {
      await api.deleteVendor(selectedVendorId);
      setDeleteVendorDialogOpen(false);
      setSelectedVendor(null);
      setSelectedVendorId(null);

      if ((catalog?.items.length ?? 0) === 1 && page > 1) {
        setPage((current) => Math.max(current - 1, 1));
      } else {
        await refreshCatalog();
      }

      toast.success("Vendor deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete vendor"));
    } finally {
      setDeletingVendor(false);
    }
  };

  return (
    <div className="flex h-full min-h-full flex-col gap-3">
      <VendorCatalogSection
        canManage={canManage}
        catalog={catalog}
        filters={filters}
        loadingBootData={loadingBootData}
        loadingCatalog={loadingCatalog}
        lookups={visibleLookups}
        onCreateVendor={openCreateVendor}
        onPortChange={(value) => {
          setFilters((current) => ({
            ...current,
            portId: value,
          }));
          setPage(1);
        }}
        onNextPage={() => setPage((current) => current + 1)}
        onOpenVendorDetails={openVendorDetails}
        onPreviousPage={() =>
          setPage((current) => Math.max(current - 1, 1))
        }
        onRefresh={() =>
          void Promise.all([
            loadLookups(),
            refreshCatalog(selectedVendorId ?? undefined),
          ])
        }
        onResetFilters={resetFilters}
        onSearchChange={(value) => {
          setFilters((current) => ({
            ...current,
            search: value,
          }));
          setPage(1);
        }}
        portOptions={portOptions}
        onTypeChange={(value) => {
          setFilters((current) => ({
            ...current,
            typeCode: value,
          }));
          setPage(1);
        }}
      />

      <VendorDetailDialog
        open={detailDialogOpen}
        vendor={selectedVendor}
        vendorListItem={selectedVendorListItem}
        loading={loadingDetail}
        canManage={canManage}
        onOpenChange={setDetailDialogOpen}
        onEditVendor={openEditVendor}
        onAddOffice={openCreateOffice}
        onDeleteVendor={openDeleteVendor}
        onEditOffice={openEditOffice}
      />

      <DeleteVendorDialog
        open={deleteVendorDialogOpen}
        vendorName={selectedVendor?.companyName ?? selectedVendorListItem?.companyName ?? ""}
        deleting={deletingVendor}
        onOpenChange={setDeleteVendorDialogOpen}
        onDelete={handleDeleteVendor}
      />

      <VendorDialog
        open={vendorDialogOpen}
        draft={vendorDraft}
        mode={vendorDialogMode}
        saving={savingVendor}
        onOpenChange={setVendorDialogOpen}
        onDraftChange={setVendorDraft}
        onSave={handleVendorSave}
      />

      <OfficeDialog
        open={officeDialogOpen}
        draft={officeDraft}
        mode={officeDialogMode}
        saving={savingOffice}
        portOptions={portOptions}
        vendorTypes={visibleLookups.vendorTypes}
        onOpenChange={setOfficeDialogOpen}
        onDraftChange={setOfficeDraft}
        onSave={handleOfficeSave}
      />
    </div>
  );
}
