import { Brand } from "./Brand";
import { Position } from "./Position";

export interface Tag {
  id: string;
  brand: Brand;
  tagName: string;
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
