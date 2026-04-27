"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildSignatureHtml, getInitialSignatureDraft } from "@/lib/signature-builder";

type SignatureSetupCardProps = {
  email: string;
  fullName?: string | null;
  departmentName?: string | null;
  isSaving: boolean;
  onSave: (signatureHtml: string) => Promise<void>;
  onSkip?: () => void;
  showStepBadge?: boolean;
};

export function SignatureSetupCard({
  email,
  fullName,
  departmentName,
  isSaving,
  onSave,
  onSkip,
  showStepBadge = false,
}: SignatureSetupCardProps) {
  const [draft, setDraft] = useState(() =>
    getInitialSignatureDraft({
      name: fullName,
      email,
      departmentName,
    }),
  );

  const signatureHtml = buildSignatureHtml(draft);
  const canSave =
    draft.fullName.trim().length > 0 &&
    draft.designation.trim().length > 0 &&
    draft.phone.trim().length > 0;

  return (
    <Card className="border-slate-200 shadow-lg shadow-slate-950/5">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {showStepBadge ? <Badge variant="outline">Step 2</Badge> : null}
          <Badge variant="secondary">Signature Builder</Badge>
        </div>
        <CardTitle>Create your email signature</CardTitle>
        <CardDescription>
          We&apos;ll build a clean Nagarkot signature inside the app and attach it to every RFQ email
          you send from SuperFreight.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-medium text-slate-900">What we use</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Name and email are taken from your account. Add your designation and contact number
              once, and we&apos;ll generate the signature for you.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-name">Name</Label>
            <Input
              id="signature-name"
              value={draft.fullName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fullName: event.target.value }))
              }
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-designation">Designation</Label>
            <Input
              id="signature-designation"
              value={draft.designation}
              onChange={(event) =>
                setDraft((current) => ({ ...current, designation: event.target.value }))
              }
              placeholder="Assistant Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-phone">Contact number</Label>
            <Input
              id="signature-phone"
              value={draft.phone}
              onChange={(event) =>
                setDraft((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-email">Email</Label>
            <Input id="signature-email" value={draft.email} readOnly className="bg-slate-50" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => void onSave(signatureHtml)} disabled={!canSave || isSaving}>
              {isSaving ? "Saving signature..." : "Save and continue"}
            </Button>
            {onSkip ? (
              <Button variant="outline" onClick={onSkip} disabled={isSaving}>
                Skip for now
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">Live preview</p>
            <Badge variant={canSave ? "default" : "outline"}>
              {canSave ? "Ready to save" : "Fill all fields"}
            </Badge>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-inner shadow-slate-950/5">
            <div
              className="email-signature-zone signature-builder-preview overflow-x-auto rounded-2xl bg-white p-4"
              dangerouslySetInnerHTML={{ __html: signatureHtml }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
