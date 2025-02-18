export interface Plan {
  id: string;
  name?: string;
  key?: string;
  users?: number;
  priceMonthly?: number;
  priceYearly?: number;
  videoUploads?: number;
  videoPlaysMonth?: number;
  showWatermark?: boolean;
}
