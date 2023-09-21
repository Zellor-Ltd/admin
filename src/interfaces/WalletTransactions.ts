import { Fan } from './Fan';

export interface WalletDetailParams {
  fan: Fan;
  brand: {
    id: string;
    discoDollars: number;
    discoGold: number;
    name: string;
    brandTxtColor: string;
    logoUrl: string;
    brandCardUrl: string;
  };
}

export interface WalletTransaction {
  [key: string]: any;
  type?: string;
}
