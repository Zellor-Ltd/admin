import { Brand } from "./Brand";
import { SelectedProductCategories } from "./Category";
import { Video } from "./Video";

export interface Product {
  id: string;
  image: string;
  name: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  currencyIsoCode: string;
  tagText: string;
  relatedVideos: Video[];
  mainRelatedVideo: Video;
  brand: Brand;
  offerExpirationDate: Date;
  categories?: SelectedProductCategories[];
}
