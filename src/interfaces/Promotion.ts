import { Brand } from "./Brand";

export interface Promotion {
  id: string;
  brand: Brand;
  [key: string]: any;
}
