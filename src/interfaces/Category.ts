import { Image } from "./Image";

export interface Category {
  id: string;
  name: string;
  image: Image;
  searchTags?: string[];
}

export interface ProductCategory {
  id: string;
  superCategory?: string;
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
  image: Image;
  searchTags?: string[];
  hCreationDate?: string;
  hLastUpdate?: string;
}

export interface SelectedProductCategories {
  superCategory?: ProductCategory;
  category?: ProductCategory;
  subCategory?: ProductCategory;
  subSubCategory?: ProductCategory;
}

export interface SelectedCategories {
  superCategory?: string;
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
}
export interface AllCategories {
  "Super Category": ProductCategory[];
  Category: ProductCategory[];
  "Sub Category": ProductCategory[];
  "Sub Sub Category": ProductCategory[];
}

export interface CategoryAPI {
  fetch: () => Promise<any>;
  save: (params: any) => Promise<any>;
  delete: (params: any) => Promise<any>;
}

export interface AllCategoriesAPI {
  superCategory: CategoryAPI;
  category: CategoryAPI;
  subCategory: CategoryAPI;
  subSubCategory: CategoryAPI;
}
