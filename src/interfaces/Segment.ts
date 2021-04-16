import { Brand } from "./Brand";
import { Tag } from "./Tag";
import { Video } from "./Video";

export interface Segment {
  id?: string;
  sequence: number;
  tags: Tag[];
  video?: any;
  thumbnail?: any;
}
