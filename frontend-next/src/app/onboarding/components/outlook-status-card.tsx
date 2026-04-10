"use client";

import { Badge } from "@/components/ui/badge";
import { OutlookStatus } from "@/lib/api";

type OutlookStatusCardProps = {
  status: OutlookStatus | null;
};

export function OutlookStatusCard({ status }: OutlookStatusCardProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Mailbox Status</p>
          <p className="text-sm text-muted-foreground">
            {status?.mailbox ?? "Your Nagarkot mailbox will be used for workflow monitoring."}
          </p>
        </div>
        <Badge variant={status?.isConnected ? "default" : "secondary"}>
          {status?.isConnected ? "Connected" : "Pending"}
        </Badge>
      </div>
      {status?.subscription && (
        <p className="mt-3 text-xs text-muted-foreground">
          Subscription active until {status.subscription.expiresAt ?? "TBD"}.
        </p>
      )}
    </div>
  );
}
