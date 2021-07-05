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

export interface AllCategories {
  "Super Category": ProductCategory[];
  Category: ProductCategory[];
  "Sub Category": ProductCategory[];
  "Sub Sub Category": ProductCategory[];
}

export interface CategoryAPI {
  fetch: Function;
  save: Function;
  delete?: Function;
}

export interface AllCategoriesAPI {
  category: CategoryAPI;
  supercategory: CategoryAPI;
  subcategory: CategoryAPI;
  subsubcategory: CategoryAPI;
}
