import { Image } from "./Image";

export interface Category {
  id: string;
  name: string;
  image: Image;
  searchTags?: string[];
}
