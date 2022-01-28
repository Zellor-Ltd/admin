import { Image } from './Image';

export interface Creator {
  id: string;
  status: string;
  userName: string;
  creatorId: string;
  firstName: string;
  lastName: string;
  coverPictureUrl?: string;
  avatar?: Image;
  masthead?: Image[];
  activeMasthead?: Image;
}
