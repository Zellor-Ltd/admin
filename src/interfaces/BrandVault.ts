import { Brand } from "./Brand";

export interface BrandVault {
  id: string;
  shopName: string;
  tokenType: string;
  token: string;
  record: Brand[];
}
