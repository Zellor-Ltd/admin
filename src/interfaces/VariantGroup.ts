import { ProductBrand } from './ProductBrand';

export interface VariantGroup {
  id: string;
  name: string;
  productBrand: ProductBrand;
  hCreationDate?: string;
  hLastUpdate?: string;
}
