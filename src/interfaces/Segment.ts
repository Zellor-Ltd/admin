import { Brand } from './Brand';
import { Tag } from './Tag';
import { Video } from './Video';

export interface Segment {
  id?: string;
  sequence: number;
  tags: Tag[];
  brands: Brand[];
  video?: any;
  thumbnail?: any;
}
