import { Brand } from "./Brand";
import { Tag } from "./Tag";

export interface Video {
  videoFeedId?: string;
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: Tag[];
  brands?: Brand;
}
