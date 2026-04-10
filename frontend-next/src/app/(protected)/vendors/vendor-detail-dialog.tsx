"use client";

import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  VendorCatalogPage,
  VendorDetail,
  VendorOfficeDetail,
} from "@/lib/api";
import {
  capabilityLabels,
  getVisibleVendorTypes,
} from "@/app/(protected)/vendors/vendors.helpers";
import { InfoTile } from "@/app/(protected)/vendors/vendors.parts";

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatServiceLocationLabel(location: VendorOfficeDetail["serviceLocations"][number]) {
  const baseLabel = (location.cityName ?? location.name)
    .replace(/\s*-\s*$/, "")
    .split(",")[0]
    .trim();

  return [toTitleCase(baseLabel), location.countryName].filter(Boolean).join(", ");
}

export function VendorDetailDialog({
  open,
  vendor,
  vendorListItem,
  loading,
  canManage,
  onOpenChange,
  onEditVendor,
  onAddOffice,
  onDeleteVendor,
  onEditOffice,
}: {
  open: boolean;
  vendor: VendorDetail | null;
  vendorListItem: VendorCatalogPage["items"][number] | null;
  loading: boolean;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onEditVendor: () => void;
  onAddOffice: () => void;
  onDeleteVendor: () => void;
  onEditOffice: (office: VendorOfficeDetail) => void;
}) {
  const dialogTitle =
    vendor?.companyName ?? vendorListItem?.companyName ?? "Vendor details";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-4 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                Review and update offices, contacts, capabilities, and CC
                recipients.
              </DialogDescription>
            </div>
            {canManage && vendor ? (
              <div className="flex flex-wrap gap-2 pr-8">
                <Button variant="destructive" onClick={onDeleteVendor}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Vendor
                </Button>
                <Button variant="outline" onClick={onEditVendor}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Vendor
                </Button>
                <Button onClick={onAddOffice}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Office
                </Button>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92svh-5.5rem)]">
          <div className="flex flex-col gap-6 p-6">
            {loading ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Loading vendor details...
              </p>
            ) : vendor ? (
              <>
                {vendor.notes ? (
                  <Card className="border-slate-200 bg-slate-50/70">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Internal Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">
                      {vendor.notes}
                    </CardContent>
                  </Card>
                ) : null}

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Offices
                  </h2>
                  <p className="text-xs text-slate-500">
                    {vendor.offices.length} office records
                  </p>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={vendor.offices
                    .filter((office) => office.isPrimary)
                    .map((office) => office.id)}
                  className="flex flex-col gap-3"
                >
                  {vendor.offices.map((office) => {
                    const visibleVendorTypes = getVisibleVendorTypes(
                      office.vendorTypes,
                    );
                    const visibleCapabilities = capabilityLabels(
                      office.capabilities,
                    );

                    return (
                      <AccordionItem
                        key={office.id}
                        value={office.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline">
                          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-left">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {office.officeName}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {[
                                  office.cityName,
                                  office.stateName,
                                  office.countryName,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "Location not set"}
                              </p>
                            </div>
                            {office.isPrimary ? <Badge>Primary Office</Badge> : null}
                            <Badge
                              variant={office.isActive ? "default" : "secondary"}
                            >
                              {office.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-slate-200 px-5 pb-5 pt-4">
                          <div className="flex flex-col gap-5">
                            <div className="grid gap-3 md:grid-cols-2">
                              <InfoTile
                                label="External Code"
                                value={office.externalCode ?? "Not set"}
                              />
                              <InfoTile
                                label="Specialization"
                                value={office.specializationRaw ?? "Not set"}
                              />
                            </div>

                            {office.addressRaw ? (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                {office.addressRaw}
                              </div>
                            ) : null}

                            <section className="flex flex-col gap-2">
                              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Types & Capabilities
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {visibleVendorTypes.map((vendorType) => (
                                  <Badge
                                    key={vendorType.id}
                                    variant="outline"
                                    className="border-slate-200 bg-slate-50 text-slate-600"
                                  >
                                    {vendorType.typeName}
                                  </Badge>
                                ))}
                                {visibleCapabilities.map((label) => (
                                  <Badge
                                    key={label}
                                    className="bg-[hsl(228,55%,23%)] text-white"
                                  >
                                    {label}
                                  </Badge>
                                ))}
                                {visibleVendorTypes.length === 0 &&
                                visibleCapabilities.length === 0 ? (
                                  <span className="text-sm text-slate-500">
                                    No type or capability tags yet.
                                  </span>
                                ) : null}
                              </div>
                            </section>

                            <section className="flex flex-col gap-3">
                              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Contacts
                              </h3>
                              {office.contacts.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                  {office.contacts.map((contact) => (
                                    <div
                                      key={contact.id}
                                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">
                                            {contact.contactName}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            {contact.designation ??
                                              "No designation"}
                                          </p>
                                        </div>
                                        {contact.isPrimary ? (
                                          <Badge>Primary</Badge>
                                        ) : null}
                                      </div>

                                      <div className="mt-3 flex flex-col gap-2 text-xs text-slate-600">
                                        {contact.emailPrimary ? (
                                          <p className="break-all">
                                            <Mail className="mr-1 inline h-3.5 w-3.5" />
                                            {contact.emailPrimary}
                                          </p>
                                        ) : null}
                                        {contact.mobile1 || contact.mobile2 ? (
                                          <p>
                                            <Phone className="mr-1 inline h-3.5 w-3.5" />
                                            {[contact.mobile1, contact.mobile2]
                                              .filter(Boolean)
                                              .join(" / ")}
                                          </p>
                                        ) : null}
                                        {!contact.emailPrimary &&
                                        !contact.mobile1 &&
                                        !contact.mobile2 ? (
                                          <p className="text-slate-500">
                                            No direct contact details captured.
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No contacts captured for this office yet.
                                </p>
                              )}
                            </section>

                            <section className="flex flex-col gap-2">
                              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                CC Recipients
                              </h3>
                              {office.ccRecipients.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {office.ccRecipients.map((recipient) => (
                                    <Badge
                                      key={recipient.id}
                                      variant="outline"
                                      className="border-slate-200 bg-white text-slate-600"
                                    >
                                      {recipient.email}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No CC recipients captured for this office.
                                </p>
                              )}
                            </section>

                            <section className="flex flex-col gap-2">
                              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Linked Ports
                              </h3>
                              {office.ports.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {office.ports.map((port) => (
                                    <Badge
                                      key={port.id}
                                      variant="outline"
                                      className="border-slate-200 bg-white text-slate-600"
                                    >
                                      {port.name} ({port.code})
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No linked ports found for this office yet.
                                </p>
                              )}
                            </section>

                            <section className="flex flex-col gap-2">
                              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Linked Service Locations
                              </h3>
                              {office.serviceLocations.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {Array.from(
                                    new Map(
                                      office.serviceLocations.map((location) => [
                                        formatServiceLocationLabel(location),
                                        location,
                                      ]),
                                    ).entries(),
                                  ).map(([label, location]) => (
                                    <Badge
                                      key={location.id}
                                      variant="outline"
                                      className="border-slate-200 bg-white text-slate-600"
                                    >
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No linked service locations found for this office
                                  yet.
                                </p>
                              )}
                            </section>

                            {canManage ? (
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => onEditOffice(office)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Office
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Vendor details are not available for this selection.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
