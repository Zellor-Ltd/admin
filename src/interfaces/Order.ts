import { Product } from "./Product";

export interface Order {
  id?: string;
  amount?: number;
  paid?: boolean;
  stage?: string;
  hCreationDate?: string;
  hLastUpdate?: string;
  customerEmail?: string;
  product?: Product;
  userid: string;
  [key: string]: any;
}
