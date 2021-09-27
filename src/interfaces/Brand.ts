export interface Brand {
  checkout: string;
  cancelationUrl: string;
  confirmationUrl: string;
  discoPercentage: number;
  id: string;
  status: string;
  brandId: string;
  brandLogoUrl: string;
  brandName: string;
  shopName?: string;
  overlayHtmlWithDiscount: string;
  overlayHtmlWithoutDiscount: string;
  duration: number;
  opacity: number;
  startTime: number;
  x: number;
  y: number;
  z: number;
  automated?: boolean;
  paused?: boolean;
  colourLogo?: any;
  blackLogo?: any;
  whiteLogo?: any;
  brandLogo?: any;
  brandCard?: any;
  thumbnail?: any;
}
