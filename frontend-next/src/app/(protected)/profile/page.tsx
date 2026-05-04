"use client";

import { useEffect, useState } from "react";
import { SignatureSetupCard } from "@/app/onboarding/components/signature-setup-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage, OutlookStatus } from "@/lib/api";
import { canEditModule } from "@/lib/module-access";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const canEditProfile = canEditModule(user, "profile");
  const [outlookStatus, setOutlookStatus] = useState<OutlookStatus | null>(null);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  useEffect(() => {
    api.getOutlookStatus().then(setOutlookStatus).catch(() => null);
  }, []);

  const handleReconnectOutlook = async () => {
    setIsConnectingOutlook(true);
    try {
      const result = await api.getOutlookConnectUrl();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to start Outlook reconnection."));
      setIsConnectingOutlook(false);
    }
  };

  const handleSaveGeneratedSignature = async (signatureHtmlFromBuilder: string) => {
    setIsSavingSignature(true);
    try {
      await api.updateMySignature(signatureHtmlFromBuilder);
      await refreshSession();
      toast.success("Generated signature saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save generated signature."));
    } finally {
      setIsSavingSignature(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">User Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="inline-block w-36 font-semibold">Name:</span>
            {user.name ?? "N/A"}
          </div>
          <div>
            <span className="inline-block w-36 font-semibold">Email:</span>
            {user.email}
          </div>
          <div>
            <span className="inline-block w-36 font-semibold">OS User ID:</span>
            {user.osUserId ?? "N/A"}
          </div>
          <div>
            <span className="inline-block w-36 font-semibold">Base Role:</span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
          </div>
          <div>
            <span className="mb-2 block font-semibold">Custom Roles:</span>
            <div className="flex flex-wrap gap-2">
              {user.customRoles.length > 0 ? (
                user.customRoles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">No custom roles assigned.</span>
              )}
            </div>
          </div>
          <div>
            <span className="mb-2 block font-semibold">Departments:</span>
            <div className="flex flex-wrap gap-2">
              {user.departments.length > 0 ? (
                user.departments.map((department) => (
                  <Badge key={department} variant="outline">
                    {department}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">No departments assigned.</span>
              )}
            </div>
          </div>
          <div>
            <span className="inline-block w-36 font-semibold">Outlook:</span>
            <Badge
              variant={
                outlookStatus?.isConnected
                  ? "default"
                  : outlookStatus?.reconnectRequired
                    ? "outline"
                    : "secondary"
              }
            >
              {outlookStatus?.isConnected
                ? "Connected"
                : outlookStatus?.reconnectRequired
                  ? "Reconnect required"
                  : "Not connected"}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-sm text-muted-foreground">
              {outlookStatus?.isConnected
                ? `Mailbox connected as ${outlookStatus.mailbox ?? user.email}.`
                : outlookStatus?.reconnectRequired
                  ? "Your mailbox needs one Outlook reconnect to enable sending with the new mail flow."
                  : "Connect your Outlook mailbox to send RFQs directly from your logged-in account."}
            </div>
            <div>
              <Button onClick={() => void handleReconnectOutlook()} disabled={!canEditProfile || isConnectingOutlook}>
                {isConnectingOutlook
                  ? "Opening Microsoft..."
                  : outlookStatus?.isConnected
                    ? "Reconnect Outlook"
                    : "Connect Outlook"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SignatureSetupCard
        email={user.email}
        fullName={user.name}
        departmentName={user.departmentName}
        isSaving={isSavingSignature}
        onSave={canEditProfile ? handleSaveGeneratedSignature : undefined}
      />
    </div>
  );
}
