import { Brand } from "./Brand";
import { SelectedProductCategories } from "./Category";
import { Video } from "./Video";
import { Tag } from "./Tag";
import { ProductBrand } from "./ProductBrand";
import { Image } from "./Image";

export interface Product {
  id: string;
  image: Image[];
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
  searchTags: string[];
  ageMin: number;
  ageMax: number;
  tagImage: Image;
  thumbnailUrl: Image;
  lastGoLiveDate?: Date;
  goLiveDate?: Date;
  outOfStock?: boolean;
  status?: string;
}
