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
import { FreightQuote } from "@/lib/api";

type VendorQuotesTableProps = {
  quotes: FreightQuote[];
  lowestRate: number;
  onSelectQuote: (quoteId: string) => void;
};

export function VendorQuotesTable({
  quotes,
  lowestRate,
  onSelectQuote,
}: VendorQuotesTableProps) {
  if (quotes.length === 0) {
    return null;
  }

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
              <TableHead className="text-right">Freight</TableHead>
              <TableHead className="text-right">Local Charges</TableHead>
              <TableHead className="text-right">Documentation</TableHead>
              <TableHead className="text-right">Total Rate</TableHead>
              <TableHead className="text-center">Transit</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const isLowest = Number(quote.totalRate ?? 0) === lowestRate;

              return (
                <TableRow key={quote.id} className={isLowest ? "bg-green-50" : ""}>
                  <TableCell className="font-medium">
                    {quote.vendorName}
                    {isLowest && <Badge className="ml-2 bg-green-600 text-white">Lowest</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {quote.freightRate ?? 0} {quote.currency ?? "USD"}
                  </TableCell>
                  <TableCell className="text-right">
                    {quote.localCharges ?? 0} {quote.currency ?? "USD"}
                  </TableCell>
                  <TableCell className="text-right">
                    {quote.documentation ?? 0} {quote.currency ?? "USD"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {quote.totalRate ?? 0} {quote.currency ?? "USD"}
                  </TableCell>
                  <TableCell className="text-center">{quote.transitDays ?? "-"} days</TableCell>
                  <TableCell className="text-sm">{quote.validUntil ?? "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {quote.remarks ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => onSelectQuote(quote.id)}>
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
