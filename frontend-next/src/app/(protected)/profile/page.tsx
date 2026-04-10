"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api, OutlookStatus } from "@/lib/api";
import { toast } from "sonner";

type SignatureTab = "paste" | "html" | "preview";

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const [outlookStatus, setOutlookStatus] = useState<OutlookStatus | null>(null);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);

  const [signatureHtml, setSignatureHtml] = useState<string>("");
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [activeTab, setActiveTab] = useState<SignatureTab>("paste");
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const hasSyncedFromUser = useRef(false);

  useEffect(() => {
    api.getOutlookStatus().then(setOutlookStatus).catch(() => null);
  }, []);

  // Load saved signature into the paste zone once on mount
  useEffect(() => {
    if (user?.emailSignature && !hasSyncedFromUser.current) {
      hasSyncedFromUser.current = true;
      setSignatureHtml(user.emailSignature);
      if (pasteZoneRef.current) {
        pasteZoneRef.current.innerHTML = user.emailSignature;
      }
    }
  }, [user?.emailSignature]);

  // When switching to "paste" tab, sync the textarea content back in
  const handleTabChange = (tab: SignatureTab) => {
    if (tab === "paste" && pasteZoneRef.current) {
      pasteZoneRef.current.innerHTML = signatureHtml;
    }
    setActiveTab(tab);
  };

  const handlePasteZoneInput = useCallback(() => {
    if (pasteZoneRef.current) {
      setSignatureHtml(pasteZoneRef.current.innerHTML);
    }
  }, []);

  const handleReconnectOutlook = async () => {
    setIsConnectingOutlook(true);
    try {
      const result = await api.getOutlookConnectUrl();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start Outlook reconnection.");
      setIsConnectingOutlook(false);
    }
  };

  const handleSaveSignature = async () => {
    setIsSavingSignature(true);
    try {
      const html = signatureHtml.trim();
      await api.updateMySignature(html || null);
      await refreshSession();
      toast.success("Signature saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save signature.");
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleClearSignature = async () => {
    setSignatureHtml("");
    if (pasteZoneRef.current) pasteZoneRef.current.innerHTML = "";
    setIsSavingSignature(true);
    try {
      await api.updateMySignature(null);
      await refreshSession();
      toast.success("Signature cleared.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear signature.");
    } finally {
      setIsSavingSignature(false);
    }
  };

  if (!user) return null;

  const tabs: { key: SignatureTab; label: string }[] = [
    { key: "paste", label: "Paste from Outlook" },
    { key: "html", label: "Edit HTML" },
    { key: "preview", label: "Preview" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><span className="font-semibold w-36 inline-block">Name:</span>{user.name ?? "N/A"}</div>
          <div><span className="font-semibold w-36 inline-block">Email:</span>{user.email}</div>
          <div><span className="font-semibold w-36 inline-block">OS User ID:</span>{user.osUserId ?? "N/A"}</div>
          <div>
            <span className="font-semibold w-36 inline-block">Base Role:</span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
          </div>
          <div>
            <span className="font-semibold block mb-2">Custom Roles:</span>
            <div className="flex gap-2 flex-wrap">
              {user.customRoles.length > 0
                ? user.customRoles.map((role) => <Badge key={role.id} variant="outline">{role.name}</Badge>)
                : <span className="text-muted-foreground">No custom roles assigned.</span>}
            </div>
          </div>
          <div>
            <span className="font-semibold block mb-2">Departments:</span>
            <div className="flex gap-2 flex-wrap">
              {user.departments.length > 0
                ? user.departments.map((department) => <Badge key={department} variant="outline">{department}</Badge>)
                : <span className="text-muted-foreground">No departments assigned.</span>}
            </div>
          </div>
          <div>
            <span className="font-semibold w-36 inline-block">Outlook:</span>
            <Badge variant={outlookStatus?.isConnected ? "default" : outlookStatus?.reconnectRequired ? "outline" : "secondary"}>
              {outlookStatus?.isConnected ? "Connected" : outlookStatus?.reconnectRequired ? "Reconnect required" : "Not connected"}
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
              <Button onClick={() => void handleReconnectOutlook()} disabled={isConnectingOutlook}>
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

      <Card>
        <CardHeader>
          <CardTitle>Email Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This signature will be appended to every RFQ email you send. Open a new email in Outlook,
            click inside your signature (including the logo), select all (<kbd className="px-1 py-0.5 rounded bg-muted border border-border text-xs">Ctrl+A</kbd>
            ), copy, then paste below — images are preserved.
          </p>

          <div className="flex gap-1 text-sm border-b border-border pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-3 py-1.5 rounded-t border-x border-t transition-colors -mb-px ${
                  activeTab === tab.key
                    ? "bg-background border-border text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "paste" && (
            <div
              ref={pasteZoneRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handlePasteZoneInput}
              className="email-signature-zone min-h-35 rounded-md border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring overflow-auto"
              data-placeholder="Paste your Outlook signature here (Ctrl+V)..."
              style={{ caretColor: "black" }}
            />
          )}

          {activeTab === "html" && (
            <textarea
              className="w-full min-h-35 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Raw HTML of your signature..."
              value={signatureHtml}
              onChange={(e) => setSignatureHtml(e.target.value)}
            />
          )}

          {activeTab === "preview" && (
            <div
              className="email-signature-zone min-h-35 rounded-md border border-border bg-white px-4 py-3 text-sm overflow-auto"
              dangerouslySetInnerHTML={{
                __html: signatureHtml || "<span style='color:#94a3b8'>No signature set.</span>",
              }}
            />
          )}

          <div className="flex gap-2">
            <Button onClick={() => void handleSaveSignature()} disabled={isSavingSignature}>
              {isSavingSignature ? "Saving..." : "Save Signature"}
            </Button>
            {signatureHtml && (
              <Button variant="outline" onClick={() => void handleClearSignature()} disabled={isSavingSignature}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
