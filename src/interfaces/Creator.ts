import { Image } from './Image';

export interface Creator {
  vIndex?: number;
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
  user?: string;
  paypal?: string;
}
