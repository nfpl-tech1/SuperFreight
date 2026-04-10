"use client";

import { Button } from "@/components/ui/button";

type OutlookActionButtonsProps = {
  busy: boolean;
  isConnected: boolean;
  onConnect: () => void;
  onReconnect: () => void;
};

export function OutlookActionButtons({
  busy,
  isConnected,
  onConnect,
  onReconnect,
}: OutlookActionButtonsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Button onClick={onConnect} disabled={busy} size="lg">
        {busy ? "Working..." : "Connect Outlook"}
      </Button>
      <Button variant="outline" onClick={onReconnect} disabled={busy || !isConnected} size="lg">
        Refresh Subscription
      </Button>
    </div>
  );
}
