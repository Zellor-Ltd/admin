import { Image } from './Image';

export interface Creator {
  displayInCreatorGrid?: boolean;
  discountPercentage?: number;
  couponCode?: string;
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
