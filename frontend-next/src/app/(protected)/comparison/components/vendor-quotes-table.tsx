"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FreightQuote, RfqFieldSpec } from "@/lib/api";
import {
  formatComparisonValue,
  getComparisonColumns,
} from "../comparison.helpers";

type VendorQuotesTableProps = {
  canEdit: boolean;
  fieldSpecs: RfqFieldSpec[];
  lowestRate: number | null;
  onReviewQuote: (quoteId: string) => void;
  onSelectQuote: (quoteId: string) => void;
  quotes: FreightQuote[];
};

export function VendorQuotesTable({
  canEdit,
  fieldSpecs,
  lowestRate,
  onReviewQuote,
  onSelectQuote,
  quotes,
}: VendorQuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendor Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No quote drafts are available for this RFQ yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const comparisonColumns = getComparisonColumns(fieldSpecs, quotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vendor Quotes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Total Rate</TableHead>
              {comparisonColumns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead>Remarks</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const isLowest =
                lowestRate !== null && Number(quote.totalRate ?? 0) === lowestRate;

              return (
                <TableRow key={quote.id} className={isLowest ? "bg-emerald-50" : ""}>
                  <TableCell className="font-medium">
                    {quote.vendorName}
                    {isLowest ? (
                      <Badge className="ml-2 bg-emerald-600 text-white">Lowest</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {quote.reviewStatus || "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>v{quote.versionNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {quote.receivedAt
                      ? new Date(quote.receivedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {quote.totalRate ?? "-"} {quote.currency ?? "USD"}
                  </TableCell>
                  {comparisonColumns.map((column) => (
                    <TableCell key={column.key}>
                      {formatComparisonValue(quote.comparisonFields?.[column.key])}
                    </TableCell>
                  ))}
                  <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                    {quote.remarks || "-"}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onReviewQuote(quote.id)} disabled={!canEdit}>
                      Review
                    </Button>
                    <Button size="sm" onClick={() => onSelectQuote(quote.id)}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
