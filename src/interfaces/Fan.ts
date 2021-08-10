export interface FanFilter {
  id: string;
  user: string;
  isFilter?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profile?: string;
  specialLock?: "y" | "n";
}
export interface Fan {
  id: string;
  name: string;
  email: string;
  user: string;
  phone: string;
  address: string;
  profile: string;
  specialLock: boolean;
}
