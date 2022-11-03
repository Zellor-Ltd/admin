export interface FanFilter {
  id: string;
  user: string;
  isFilter?: boolean;
  isGroup?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profile?: string;
  specialLock?: 'y' | 'n';
  group?: string;
}
export interface Fan {
  signUpDate?: any;
  addresses?: any[];
  personalDetails?: any;
  pwd?: string;
  birthday?: any;
  gender?: string;
  phoneNumber?: string;
  currencyCode?: string;
  line1?: string;
  city?: any;
  country?: any;
  postalCode?: any;
  serverAlias?: any;
  followingCreators?: any;
  followingCategories?: any;
  id: string;
  name: string;
  userName: string;
  email: string;
  user: string;
  phone: string;
  address: string;
  profile: string;
  specialLock: boolean;
  group?: string;
  hCreationDate?: Date;
}
