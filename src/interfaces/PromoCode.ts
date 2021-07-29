export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  dollars: number;
  shopName: string;
  hCreationDate?: string;
  hLastUpdate?: string;
}
