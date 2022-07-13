export interface Payment {
  hCreationDate?: Date;
  id: string;
  description?: string;
  quantity: number;
  creatorId: string;
  payment: number;
}
