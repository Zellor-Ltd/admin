export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  dollars: number;
  hCreationDate?: string;
  hLastUpdate?: string;
}
