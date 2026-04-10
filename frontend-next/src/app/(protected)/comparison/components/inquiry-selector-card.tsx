"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inquiry } from "@/lib/api";
import { formatInquiryOptionLabel } from "../comparison.helpers";

type InquirySelectorCardProps = {
  inquiries: Inquiry[];
  selectedInquiry: string;
  onSelectInquiry: (value: string) => void;
};

export function InquirySelectorCard({
  inquiries,
  selectedInquiry,
  onSelectInquiry,
}: InquirySelectorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Inquiry</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedInquiry} onValueChange={onSelectInquiry}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Pick an inquiry..." />
          </SelectTrigger>
          <SelectContent>
            {inquiries.map((inquiry) => (
              <SelectItem key={inquiry.id} value={inquiry.id}>
                {formatInquiryOptionLabel(inquiry)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
