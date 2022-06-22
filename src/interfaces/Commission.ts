export interface Commission {
  date?: Date;
  dueDate?: Date;
  id: string;
  item: any;
  status: string;
  commissionAmount: number;
  commissionPercentage: number;
}
