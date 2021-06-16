import { Product } from "./Product";

export interface Order {
  id?: string;
  product?: Product;
  [key: string]: any;
}
