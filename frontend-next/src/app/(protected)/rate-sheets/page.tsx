"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { api, RateSheet } from "@/lib/api";

export default function RateSheetsPage() {
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    shippingLine: "",
    tradeLane: "",
    currency: "USD",
    amount: "",
    effectiveMonth: "",
    notes: "",
  });

  const loadRateSheets = async () => {
    try {
      setRateSheets(await api.getRateSheets());
    } catch {
      toast.error("Failed to load rate sheets");
    }
  };

  useEffect(() => {
    void loadRateSheets();
  }, []);

  const handleCreate = async () => {
    try {
      await api.createRateSheet({
        shippingLine: form.shippingLine,
        tradeLane: form.tradeLane || null,
        currency: form.currency || null,
        amount: Number(form.amount),
        effectiveMonth: form.effectiveMonth || null,
        notes: form.notes || null,
      });
      await loadRateSheets();
      setIsOpen(false);
      toast.success("Rate sheet added");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save rate sheet"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Sheet Visibility</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly shipping-line rates stored in the shared business database.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Rate Sheet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Rate Sheet</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Shipping Line</Label><Input value={form.shippingLine} onChange={(e) => setForm({ ...form, shippingLine: e.target.value })} /></div>
              <div className="space-y-2"><Label>Trade Lane</Label><Input value={form.tradeLane} onChange={(e) => setForm({ ...form, tradeLane: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
                <div className="space-y-2"><Label>Amount</Label><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Effective Month</Label><Input type="date" value={form.effectiveMonth} onChange={(e) => setForm({ ...form, effectiveMonth: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full" disabled={!form.shippingLine}>Save Rate Sheet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Current Rates</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipping Line</TableHead>
                <TableHead>Trade Lane</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateSheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell>{sheet.shippingLine}</TableCell>
                  <TableCell>{sheet.tradeLane ?? "-"}</TableCell>
                  <TableCell>{sheet.amount ?? "-"} {sheet.currency ?? ""}</TableCell>
                  <TableCell>{sheet.effectiveMonth ?? "-"}</TableCell>
                  <TableCell>{sheet.notes ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
