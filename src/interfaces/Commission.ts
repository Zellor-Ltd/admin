export interface Commission {
  date?: Date;
  dueDate?: Date;
  id: string;
  item: any;
  productId: any;
  description?: string;
  quantity: number;
  status: string;
  price: number;
  discount: number;
  salePrice: number;
  commissionAmount: number;
  commissionPercentage: number;
}
