"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export default function InquiriesPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inquiry Capture</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mailbox-originated and manually captured inquiries for Freight.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
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

      <Card>
        <CardHeader><CardTitle>Open Inquiries</CardTitle></CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
