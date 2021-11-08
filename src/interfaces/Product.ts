import { Brand } from "./Brand";
import { SelectedProductCategories } from "./Category";
import { Video } from "./Video";
import { Tag } from "./Tag";
import { ProductBrand } from "./ProductBrand";

export interface Product {
  id: string;
  image: string;
  name: string;
  description: string;
  maxDiscoDollars: number;
  originalPrice: number;
  discountedPrice: number;
  discoPercentage: number;
  currencyIsoCode: string;
  productBrand?: string;
  tagText: string;
  relatedVideos: Video[];
  mainRelatedVideo: Video;
  brand: Brand;
  offerExpirationDate: Date;
  categories?: SelectedProductCategories[];
  checkout: string;
  confirmationUrl: string;
  cancelationUrl: string;
  tags?: Tag[];
  searchTags: string;
  ageMin: number;
  ageMax: number;
  tagImage: string;
  thumbnailUrl: string;
  lastGoLiveDate?: Date;
  goLiveDate?: Date;
  outOfStock?: boolean;
  status?: string;
}
