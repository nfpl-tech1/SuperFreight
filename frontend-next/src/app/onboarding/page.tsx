"use client";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import { OutlookActionButtons } from "./components/outlook-action-buttons";
import { OutlookStatusCard } from "./components/outlook-status-card";
import { SignatureSetupCard } from "./components/signature-setup-card";
import { useOutlookOnboarding } from "./hooks/use-outlook-onboarding";

function OnboardingInner() {
  const { user, refreshSession } = useAuth();
  const {
    busy,
    needsSignatureSetup,
    status,
    handleConnect,
    handleReconnect,
    skipSignatureSetup,
  } = useOutlookOnboarding();
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  const handleSaveSignature = async (signatureHtml: string) => {
    setIsSavingSignature(true);

    try {
      await api.updateMySignature(signatureHtml);
      await refreshSession();
      toast.success("Signature saved. You are ready to start.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save signature."));
    } finally {
      setIsSavingSignature(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(23,55,100,0.12),_transparent_32%),linear-gradient(180deg,_#f7fbff_0%,_#eef4fb_45%,_#f8fafc_100%)] p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#173764_0%,#244c86_60%,#2d5c9d_100%)] p-8 text-white lg:border-r lg:border-b-0">
              <Badge className="bg-white/12 text-white hover:bg-white/12" variant="outline">
                Onboarding
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Connect Outlook and launch with a ready-made signature.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
                SuperFreight needs mailbox access to detect inquiries, link RFQs and quotations, and
                track response timing. Right after that, we generate a branded signature so your first
                outbound RFQ already looks polished.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Step 1
                  </p>
                  <p className="mt-2 text-base font-medium">Connect mailbox</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Authorize Outlook so RFQs and responses flow through your actual work inbox.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Step 2
                  </p>
                  <p className="mt-2 text-base font-medium">Create signature</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Add your designation and phone once. We build the HTML signature inside the app.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <CardTitle>
                    {needsSignatureSetup ? "Mailbox connected" : "Connect Outlook to finish setup"}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {needsSignatureSetup
                      ? "Your mailbox is ready. Finish with a generated signature before you start sending RFQs."
                      : "Once Outlook is connected, we will take you straight into signature setup."}
                  </CardDescription>
                </div>
                <OutlookStatusCard status={status} />
                <OutlookActionButtons
                  busy={busy}
                  isConnected={Boolean(status?.isConnected || user?.outlookConnected)}
                  onConnect={() => void handleConnect()}
                  onReconnect={() => void handleReconnect()}
                />
                {needsSignatureSetup ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    Outlook is already connected. Save your generated signature below and you&apos;re
                    ready to move into the dashboard.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    We only ask for Outlook access and a few signature details once during onboarding.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {needsSignatureSetup && user ? (
          <SignatureSetupCard
            email={user.email}
            fullName={user.name}
            departmentName={user.departmentName}
            isSaving={isSavingSignature}
            onSave={handleSaveSignature}
            onSkip={skipSignatureSetup}
            showStepBadge
          />
        ) : null}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
