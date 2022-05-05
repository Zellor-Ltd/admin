import { Brand } from './Brand';
import { Tag } from './Tag';

export interface Segment {
  id?: string;
  sequence: number;
  tags: Tag[];
  brands: Brand[];
  video?: any;
  watermarkVideo?: any;
  thumbnail?: any;
  selectedOption?: 'creator' | 'productBrand';
  selectedFeedTitle?: string;
  selectedIconUrl?: string;
}
