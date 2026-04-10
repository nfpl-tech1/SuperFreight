"use client";

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutlookActionButtons } from "./components/outlook-action-buttons";
import { OutlookStatusCard } from "./components/outlook-status-card";
import { useOutlookOnboarding } from "./hooks/use-outlook-onboarding";

function OnboardingInner() {
  const { busy, status, handleConnect, handleReconnect } = useOutlookOnboarding();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Connect Outlook To Finish Setup</CardTitle>
          <CardDescription>
            SuperFreight needs mailbox access to detect inquiries, link RFQs and quotations, and track response timing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OutlookStatusCard status={status} />
          <OutlookActionButtons
            busy={busy}
            isConnected={!!status?.isConnected}
            onConnect={() => void handleConnect()}
            onReconnect={() => void handleReconnect()}
          />
        </CardContent>
      </Card>
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
