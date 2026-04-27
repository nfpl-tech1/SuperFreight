"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Rfq } from "@/lib/api";

type RfqSelectorCardProps = {
  rfqs: Rfq[];
  selectedRfqId: string;
  onSelectRfq: (value: string) => void;
};

export function RfqSelectorCard({
  rfqs,
  selectedRfqId,
  onSelectRfq,
}: RfqSelectorCardProps) {
  const selectedRfq = rfqs.find((rfq) => rfq.id === selectedRfqId) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select RFQ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedRfqId} onValueChange={onSelectRfq}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Pick an RFQ for comparison..." />
          </SelectTrigger>
          <SelectContent>
            {rfqs.map((rfq) => (
              <SelectItem key={rfq.id} value={rfq.id}>
                {rfq.subjectLine || `${rfq.departmentId} (${rfq.id.slice(0, 8)})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedRfq ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Requested comparison fields for this RFQ:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRfq.fieldSpecs.length > 0 ? (
                selectedRfq.fieldSpecs.map((field) => (
                  <Badge key={field.id} variant="outline">
                    {field.fieldLabel}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">No field specs found</Badge>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
