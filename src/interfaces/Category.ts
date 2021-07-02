import { Image } from "./Image";

export interface Category {
  id: string;
  name: string;
  image: Image;
  searchTags?: string[];
}

export interface ProductCategory {
  id: string;
  supercategory?: string;
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  image: Image;
  searchTags?: string[];
}
