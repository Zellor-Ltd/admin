export interface Brand {
  cancelationUrl: string;
  confirmationUrl: string;
  id: string;
  status: string;
  brandId: string;
  brandLogoUrl: string;
  brandName: string;
  overlayHtmlWithDiscount: string;
  overlayHtmlWithoutDiscount: string;
  duration: number;
  opacity: number;
  startTime: number;
  x: number;
  y: number;
  z: number;
  automated?: boolean;
}
