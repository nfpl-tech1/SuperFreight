"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { VendorLocationOption, VendorTypeDefinition } from "@/lib/api";
import {
  capabilityConfig,
  emptyContactDraft,
  type CcDraft,
  type ContactDraft,
  type OfficeDraft,
  type VendorDraft,
} from "@/app/(protected)/vendors/vendors.helpers";
import {
  Field,
  SearchablePortMultiSelect,
} from "@/app/(protected)/vendors/vendors.parts";

export function VendorDialog({
  open,
  draft,
  mode,
  saving,
  onOpenChange,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  draft: VendorDraft;
  mode: "create" | "edit";
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (draft: VendorDraft) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Vendor" : "Edit Vendor"}
          </DialogTitle>
          <DialogDescription>
            Keep the parent company clean here. Office-level operations live in
            the office records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-company-name">Company Name</Label>
            <Input
              id="vendor-company-name"
              value={draft.companyName}
              onChange={(event) =>
                onDraftChange({ ...draft, companyName: event.target.value })
              }
              placeholder="e.g. Nagarkot Forwarders Pvt. Ltd."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-notes">Notes</Label>
            <Textarea
              id="vendor-notes"
              value={draft.notes}
              onChange={(event) =>
                onDraftChange({ ...draft, notes: event.target.value })
              }
              placeholder="Internal notes about this vendor organization"
              rows={4}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Checkbox
              checked={draft.isActive}
              onCheckedChange={(checked) =>
                onDraftChange({ ...draft, isActive: checked === true })
              }
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Vendor is active
              </p>
              <p className="text-xs text-slate-500">
                Inactive vendors stay in the master but can be filtered out.
              </p>
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Vendor"
                : "Save Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteVendorDialog({
  open,
  vendorName,
  deleting,
  onOpenChange,
  onDelete,
}: {
  open: boolean;
  vendorName: string;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete vendor</DialogTitle>
          <DialogDescription>
            This will permanently remove {vendorName || "this vendor"} and all of
            its offices, contacts, CC recipients, and linked vendor mappings.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OfficeDialog({
  open,
  draft,
  mode,
  saving,
  portOptions,
  vendorTypes,
  onOpenChange,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  draft: OfficeDraft;
  mode: "create" | "edit";
  saving: boolean;
  portOptions: VendorLocationOption[];
  vendorTypes: VendorTypeDefinition[];
  onOpenChange: (open: boolean) => void;
  onDraftChange: (draft: OfficeDraft) => void;
  onSave: () => void;
}) {
  const suggestedPortOptions = useMemo(() => {
    const normalizedCity = draft.cityName.trim().toLowerCase();
    const normalizedCountry = draft.countryName.trim().toLowerCase();

    const rank = (port: VendorLocationOption) => {
      let score = 0;
      const haystack = [
        port.label,
        port.subLabel,
        port.countryName,
        port.portMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedCity && haystack.includes(normalizedCity)) {
        score += 25;
      }
      if (normalizedCountry && haystack.includes(normalizedCountry)) {
        score += 15;
      }

      return score;
    };

    return [...portOptions].sort((left, right) => rank(right) - rank(left));
  }, [draft.cityName, draft.countryName, portOptions]);

  const toggleType = (typeId: string) => {
    onDraftChange({
      ...draft,
      typeIds: draft.typeIds.includes(typeId)
        ? draft.typeIds.filter((current) => current !== typeId)
        : [...draft.typeIds, typeId],
    });
  };

  const updateContact = (index: number, patch: Partial<ContactDraft>) => {
    onDraftChange({
      ...draft,
      contacts: draft.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, ...patch } : contact,
      ),
    });
  };

  const setPrimaryContact = (index: number) => {
    onDraftChange({
      ...draft,
      contacts: draft.contacts.map((contact, contactIndex) => ({
        ...contact,
        isPrimary: contactIndex === index,
      })),
    });
  };

  const updateCc = (index: number, patch: Partial<CcDraft>) => {
    onDraftChange({
      ...draft,
      ccRecipients: draft.ccRecipients.map((recipient, recipientIndex) =>
        recipientIndex === index ? { ...recipient, ...patch } : recipient,
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Office" : "Edit Office"}
          </DialogTitle>
          <DialogDescription>
            Capture the office location, its capability tags, the people we can
            reach, and any operational CC IDs.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90svh-11rem)] pr-4">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="External Code"
                value={draft.externalCode}
                onChange={(value) =>
                  onDraftChange({ ...draft, externalCode: value })
                }
                placeholder="Optional external office code"
              />
              <Field
                label="City"
                value={draft.cityName}
                onChange={(value) =>
                  onDraftChange({ ...draft, cityName: value })
                }
              />
              <Field
                label="State"
                value={draft.stateName}
                onChange={(value) =>
                  onDraftChange({ ...draft, stateName: value })
                }
              />
              <Field
                label="Country"
                value={draft.countryName}
                onChange={(value) =>
                  onDraftChange({ ...draft, countryName: value })
                }
              />
              <Field
                label="Specialization"
                value={draft.specializationRaw}
                onChange={(value) =>
                  onDraftChange({ ...draft, specializationRaw: value })
                }
                placeholder="Raw specialization text from ops or source data"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-address">Address / Raw Location</Label>
              <Textarea
                id="office-address"
                value={draft.addressRaw}
                onChange={(event) =>
                  onDraftChange({ ...draft, addressRaw: event.target.value })
                }
                rows={3}
                placeholder="Full office address or imported raw location text"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <Checkbox
                  checked={draft.isActive}
                  onCheckedChange={(checked) =>
                    onDraftChange({ ...draft, isActive: checked === true })
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Office is active
                  </p>
                  <p className="text-xs text-slate-500">
                    Keep inactive branches visible without using them
                    operationally.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <Checkbox
                  checked={draft.isPrimary}
                  onCheckedChange={(checked) =>
                    onDraftChange({ ...draft, isPrimary: checked === true })
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Primary / strongest office
                  </p>
                  <p className="text-xs text-slate-500">
                    This becomes the default office shown for the vendor.
                  </p>
                </div>
              </label>
            </div>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Vendor Types
                </h3>
                <p className="text-xs text-slate-500">
                  Tag the operational roles handled by this office.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {vendorTypes.map((vendorType) => {
                  const active = draft.typeIds.includes(vendorType.id);
                  return (
                    <button
                      key={vendorType.id}
                      type="button"
                      onClick={() => toggleType(vendorType.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-[hsl(228,55%,23%)] bg-[hsl(228,55%,23%)] text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {vendorType.typeName}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Linked Ports
                </h3>
                <p className="text-xs text-slate-500">
                  Link this office with Port Master entries used for RFQ vendor
                  filtering.
                </p>
              </div>
              {portOptions.length > 0 ? (
                <SearchablePortMultiSelect
                  options={suggestedPortOptions}
                  selectedIds={draft.portIds}
                  onChange={(nextIds) =>
                    onDraftChange({
                      ...draft,
                      portIds: nextIds,
                    })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-center text-sm text-slate-500">
                  No ports available from Port Master.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Capabilities
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle the extra abilities captured in the WCA-style source
                  data.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {capabilityConfig.map((capability) => (
                  <label
                    key={capability.key}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <Checkbox
                      checked={draft.capabilities[capability.key]}
                      onCheckedChange={(checked) =>
                        onDraftChange({
                          ...draft,
                          capabilities: {
                            ...draft.capabilities,
                            [capability.key]: checked === true,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-slate-700">
                      {capability.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Contacts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add the people this office can be reached through.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onDraftChange({
                      ...draft,
                      contacts: [...draft.contacts, emptyContactDraft()],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-4">
                {draft.contacts.map((contact, index) => (
                  <div
                    key={`contact-${index}`}
                    className="space-y-3 rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        Contact {index + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={contact.isPrimary ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrimaryContact(index)}
                        >
                          {contact.isPrimary
                            ? "Primary Contact"
                            : "Set Primary"}
                        </Button>
                        {draft.contacts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onDraftChange({
                                ...draft,
                                contacts: draft.contacts.filter(
                                  (_, contactIndex) => contactIndex !== index,
                                ),
                              })
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label="Name"
                        value={contact.contactName}
                        onChange={(value) =>
                          updateContact(index, { contactName: value })
                        }
                      />
                      <Field
                        label="Designation"
                        value={contact.designation}
                        onChange={(value) =>
                          updateContact(index, { designation: value })
                        }
                      />
                      <Field
                        label="Primary Email"
                        value={contact.emailPrimary}
                        onChange={(value) =>
                          updateContact(index, { emailPrimary: value })
                        }
                      />
                      <Field
                        label="Secondary Email"
                        value={contact.emailSecondary}
                        onChange={(value) =>
                          updateContact(index, { emailSecondary: value })
                        }
                      />
                      <Field
                        label="Mobile 1"
                        value={contact.mobile1}
                        onChange={(value) =>
                          updateContact(index, { mobile1: value })
                        }
                      />
                      <Field
                        label="Mobile 2"
                        value={contact.mobile2}
                        onChange={(value) =>
                          updateContact(index, { mobile2: value })
                        }
                      />
                      <Field
                        label="Landline"
                        value={contact.landline}
                        onChange={(value) =>
                          updateContact(index, { landline: value })
                        }
                      />
                      <Field
                        label="WhatsApp"
                        value={contact.whatsappNumber}
                        onChange={(value) =>
                          updateContact(index, { whatsappNumber: value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    CC Recipients
                  </h3>
                  <p className="text-xs text-slate-500">
                    Optional operational CC IDs that should stay attached to
                    this office.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onDraftChange({
                      ...draft,
                      ccRecipients: [
                        ...draft.ccRecipients,
                        { email: "", isActive: true },
                      ],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add CC
                </Button>
              </div>

              <div className="space-y-3">
                {draft.ccRecipients.length > 0 ? (
                  draft.ccRecipients.map((recipient, index) => (
                    <div
                      key={`cc-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center"
                    >
                      <Input
                        value={recipient.email}
                        onChange={(event) =>
                          updateCc(index, { email: event.target.value })
                        }
                        placeholder="team@example.com"
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <Checkbox
                          checked={recipient.isActive}
                          onCheckedChange={(checked) =>
                            updateCc(index, { isActive: checked === true })
                          }
                        />
                        Active
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          onDraftChange({
                            ...draft,
                            ccRecipients: draft.ccRecipients.filter(
                              (_, recipientIndex) => recipientIndex !== index,
                            ),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No CC recipients added yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Office"
                : "Save Office"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
