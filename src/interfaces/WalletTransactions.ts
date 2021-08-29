import { Fan } from "./Fan";

export interface WalletDetailParams {
  fan: Fan;
  brand: {
    id: string;
    discoDollars: number;
    discoGold: number;
    name: string;
  };
}

export interface WalletTransaction {
  [key: string]: any;
}
