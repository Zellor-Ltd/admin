import { Segment } from './Segment';
import { Video } from './Video';

export interface FeedItem {
  video: Video;
  id: string;
  category: String;
  format: String;
  language: String;
  lengthTotal: number;
  market: String;
  modelRelease: String;
  target: String;
  title: String;
  validity: String;
  package: Segment[];
  _id: String;
}
