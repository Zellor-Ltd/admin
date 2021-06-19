export interface Transaction {
  id?: string;
  userId: string;
  tagId: string;
  discoDollars: number;
  discoGold: number;
  brandId: string;
  brandName: string;
  brandTxtColor: string;
  brandLogoUrl: string;
  brandCardUrl: string;
  hCreationDate?: string;
  hLastUpdate?: string;
}
