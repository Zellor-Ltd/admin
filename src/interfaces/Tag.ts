import { Position } from "./Position";

export interface Tag {
  tagId?: string;
  productId?: string;
  productName?: string;
  clickSound?: string;
  productImageUrl?: string;
  startTime?: string;
  template?: string;
  duration?: number;
  productDiscount?: number;
  discoDollars?: number;
  discoGold?: number;
  productPrice?: number;
  position?: Position[];
}
