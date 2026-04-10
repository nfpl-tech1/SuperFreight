export type QuoteFormState = {
  vendorId: string;
  vendorName: string;
  freightRate: string;
  localCharges: string;
  documentation: string;
  totalRate: string;
  transitDays: string;
  validUntil: string;
  remarks: string;
};

export type SelectableVendor = {
  id: string;
  name: string;
  locationMaster: string;
};
