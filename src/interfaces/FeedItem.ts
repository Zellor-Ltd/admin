import { Creator } from './Creator';
import { Segment } from './Segment';
import { Video } from './Video';
import { ProductBrand } from './ProductBrand';

export interface FeedItem {
  video: Video;
  id: string;
  index?: number;
  category: String;
  format: String;
  language: String;
  lengthTotal: number;
  market: String;
  modelRelease: String;
  target: String;
  title: String;
  validity: string;
  goLiveDate: string;
  package: Segment[];
  _id: String;
  productBrand?: ProductBrand | string;
  hashtags?: string[];
  ageMax?: number;
  ageMin?: number;
  status?: any;
  shortDescription?: string;
  creator?: Creator;
  selectedOption?: 'productBrand' | 'creator';
}
