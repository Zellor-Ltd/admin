import { Brand } from './Brand';
import { Setting } from './Setting';

export interface Promotion {
  id: string;
  brand: Brand;
  [key: string]: any;
}

export type PromotionAndStatusList = {
  promotion: Promotion;
  promoStatusList?: Setting[];
};
