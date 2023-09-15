export interface Transaction {
  id?: string;
  userId: string;
  tagId: string;
  discoDollars: number;
  discoGold: number;
  brandId: string;
  name: string;
  brandTxtColor: string;
  logoUrl: string;
  brandCardUrl: string;
  hCreationDate?: string;
  hLastUpdate?: string;
}
