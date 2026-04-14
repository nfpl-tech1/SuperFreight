"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsCompactDesktop } from "@/hooks/use-is-compact-desktop";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { api, Inquiry } from "@/lib/api";
import { InquiryFormDialog } from "@/app/(protected)/inquiries/InquiryFormDialog";
import {
  buildInquiryPayload,
  createEmptyInquiryForm,
  createInquiryFormFromInquiry,
  isCustomerRoleRequired,
  type InquiryFormState,
} from "@/app/(protected)/inquiries/inquiry-form.helpers";

function InquiryCard({
  inquiry,
  onEdit,
  onDelete,
}: {
  inquiry: Inquiry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const routeSummary = `${inquiry.origin ?? "TBC"} -> ${inquiry.destination ?? "TBC"}`;

  return (
    <div className="rounded-xl border border-border/70 bg-[hsl(214_38%_98%)] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-bold text-primary">
              {inquiry.inquiryNumber}
            </span>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium">
              {inquiry.shipmentMode ?? inquiry.inquiryType}
            </Badge>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">{inquiry.customerName}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
            <span className="truncate">{inquiry.origin ?? "TBC"}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">{inquiry.destination ?? "TBC"}</span>
          </div>
        </div>
        <Badge className="rounded-full bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-primary shadow-none">
          {inquiry.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Customer Role
          </dt>
          <dd className="mt-1 text-foreground">{inquiry.customerRole ?? "TBC"}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Trade Lane
          </dt>
          <dd className="mt-1 text-foreground">{inquiry.tradeLane ?? "TBC"}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Route
          </dt>
          <dd className="mt-1 text-foreground">{routeSummary}</dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Incoterm
          </dt>
          <dd className="mt-1 text-foreground">{inquiry.incoterm ?? "TBC"}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  const isMobile = useIsMobile();
  const isCompactDesktop = useIsCompactDesktop();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState<Inquiry | null>(null);
  const [form, setForm] = useState<InquiryFormState>(createEmptyInquiryForm);
  const requiresCustomerRole = isCustomerRoleRequired(form);
  const showDesktopTable = !isMobile && !isCompactDesktop;

  const loadInquiries = async () => {
    try {
      setInquiries(await api.getInquiries());
    } catch {
      toast.error("Failed to load inquiries");
    }
  };

  useEffect(() => {
    let cancelled = false;

    api.getInquiries()
      .then((data) => {
        if (!cancelled) {
          setInquiries(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load inquiries");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resetDialog = () => {
    setDialogMode("create");
    setEditingInquiryId(null);
    setForm(createEmptyInquiryForm());
    setSaving(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  const openCreateDialog = () => {
    resetDialog();
    setIsOpen(true);
  };

  const openEditDialog = (inquiry: Inquiry) => {
    setDialogMode("edit");
    setEditingInquiryId(inquiry.id);
    setForm(createInquiryFormFromInquiry(inquiry));
    setIsOpen(true);
  };

  const openDeleteDialog = (inquiry: Inquiry) => {
    setDeletingInquiry(inquiry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeleting(false);
      setDeletingInquiry(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildInquiryPayload(form);

      if (dialogMode === "edit" && editingInquiryId) {
        await api.updateInquiry(editingInquiryId, payload);
      } else {
        await api.createInquiry(payload);
      }
      await loadInquiries();
      setIsOpen(false);
      resetDialog();
      toast.success(
        dialogMode === "edit" ? "Inquiry updated" : "Inquiry captured",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : dialogMode === "edit"
            ? "Failed to update inquiry"
            : "Failed to create inquiry",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInquiry) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteInquiry(deletingInquiry.id);
      await loadInquiries();
      handleDeleteDialogOpenChange(false);
      toast.success("Inquiry deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete inquiry",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Inquiry Capture</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mailbox-originated and manually captured inquiries for Freight.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" />
          Capture Inquiry
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <InquiryFormDialog
          mode={dialogMode}
          form={form}
          saving={saving}
          isCustomerRoleRequired={requiresCustomerRole}
          onFormChange={setForm}
          onSave={handleSave}
        />
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete inquiry</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              {deletingInquiry?.inquiryNumber ?? "this inquiry"} and its linked
              RFQs, quotes, drafts, jobs, and ownership history.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDeleteDialogOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Inquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 px-4 py-4 sm:px-5 xl:px-6 xl:py-5">
          <CardTitle>Open Inquiries</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 xl:p-6">
          {showDesktopTable ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquiry #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Customer Role</TableHead>
                  <TableHead>Trade Lane</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Incoterm</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">
                      {inquiry.inquiryNumber}
                    </TableCell>
                    <TableCell>{inquiry.customerName}</TableCell>
                    <TableCell>{inquiry.customerRole ?? "TBC"}</TableCell>
                    <TableCell>{inquiry.tradeLane ?? "TBC"}</TableCell>
                    <TableCell>
                      {inquiry.origin ?? "TBC"} {"->"}{" "}
                      {inquiry.destination ?? "TBC"}
                    </TableCell>
                    <TableCell>{inquiry.shipmentMode ?? inquiry.inquiryType}</TableCell>
                    <TableCell>{inquiry.incoterm ?? "TBC"}</TableCell>
                    <TableCell>{inquiry.status.replaceAll("_", " ")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openEditDialog(inquiry)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => openDeleteDialog(inquiry)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {inquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  onEdit={() => openEditDialog(inquiry)}
                  onDelete={() => openDeleteDialog(inquiry)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
