
export enum FoodCategory {
  DAIRY = 'Lácteos',
  FRUITS = 'Frutas',
  VEGETABLES = 'Verduras',
  GRAINS = 'Granos y Cereales',
  PROTEIN = 'Proteínas',
  PANTRY = 'Despensa',
  DRINKS = 'Bebidas',
  OTHER = 'Otros',
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  addedAt: Date;
  addedBy: string; // User ID
  consumedAt: Date | null;
}

export interface Contribution {
  id: string;
  amount: number;
  date: Date;
  userId: string;
}

export interface User {
  id: string;
  name: string;
}

export interface AIAnalysis {
    consumptionPatterns: string;
    nutritionalBalance: string;
    shoppingSuggestions: string[];
    budgetOptimization: string;
}
