import { Brand } from "./Brand";
import { Tag } from "./Tag";
import { Video } from "./Video";

export interface Segment {
  brands: Brand[];
  tags: Tag[];
  video: Video;
  influencer: any;
}
