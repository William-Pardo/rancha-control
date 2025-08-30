export interface User {
  id: string;
  name: string;
  role: 'admin' | 'member';
  avatar?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  expirationDate?: string;
  addedBy: string;
  addedAt: string;
  updatedAt?: string;
}

export interface Contribution {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  category: 'groceries' | 'utilities' | 'other';
}

export type FoodCategory = 
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'grains'
  | 'canned'
  | 'frozen'
  | 'snacks'
  | 'beverages'
  | 'other';