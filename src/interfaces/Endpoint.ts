export interface Endpoint {
  id: string;
  name: string;
  action: "Search" | "GetById" | "Insert" | "Update" | "Delete";
  application: string;
  container: string;
  description: string;
  isActive: boolean;
}
