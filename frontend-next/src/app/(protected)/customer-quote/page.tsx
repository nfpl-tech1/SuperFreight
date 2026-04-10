"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, CustomerDraft, FreightQuote, Inquiry } from "@/lib/api";

function CustomerQuoteInner() {
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(searchParams.get("quoteId") || "");
  const [marginPercent, setMarginPercent] = useState("10");
  const [draft, setDraft] = useState<CustomerDraft | null>(null);

  useEffect(() => {
    void Promise.all([api.getQuotes(), api.getInquiries()])
      .then(([quoteData, inquiryData]) => {
        setQuotes(quoteData);
        setInquiries(inquiryData);
      })
      .catch(() => toast.error("Failed to load quote drafting data"));
  }, []);

  const quote = quotes.find((item) => item.id === selectedQuoteId);
  const inquiry = quote ? inquiries.find((item) => item.id === quote.inquiryId) : null;

  const handleGenerate = async () => {
    if (!quote) return;
    try {
      const result = await api.generateCustomerDraft({
        inquiryId: quote.inquiryId,
        quoteId: quote.id,
        marginPercent: Number(marginPercent),
      });
      setDraft(result);
      toast.success("Customer draft generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate draft");
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft.draftBody);
    toast.success("Quote draft copied to clipboard.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Quote Draft</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Configure Quote</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Vendor Quote</Label>
              <Select value={selectedQuoteId} onValueChange={setSelectedQuoteId}>
                <SelectTrigger><SelectValue placeholder="Pick a quote..." /></SelectTrigger>
                <SelectContent>
                  {quotes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.vendorName} ({item.totalRate ?? 0} {item.currency ?? "USD"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Margin (%)</Label>
              <Input type="number" value={marginPercent} onChange={(e) => setMarginPercent(e.target.value)} placeholder="10" />
            </div>
          </div>
          {inquiry && (
            <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
              Drafting against {inquiry.inquiryNumber} for {inquiry.customerName}.
            </div>
          )}
          <Button onClick={handleGenerate} disabled={!selectedQuoteId}>Generate Draft</Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quote Draft</CardTitle>
            <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="h-4 w-4 mr-1" /> Copy to Clipboard</Button>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">{draft.draftBody}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CustomerQuotePage() {
  return (
    <Suspense>
      <CustomerQuoteInner />
    </Suspense>
  );
}
