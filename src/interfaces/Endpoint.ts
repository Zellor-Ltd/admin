export interface Endpoint {
  id: string;
  name: string;
  action: "Search" | "Insert" | "Update" | "Delete";
  application: string;
  container: string;
  description: string;
  isActive: boolean;
}
