
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  registrationDate: string;
  lastLogin?: string;
  orderCount: number;
  totalSpent: number;
  participatedLotteries?: number[];
  wonLotteries?: number[];
}
