export enum IngredientType {
  PITA = 'PITA',
  MEAT = 'MEAT',
  CUCUMBER = 'CUCUMBER',
  FRIES = 'FRIES',
  SAUCE = 'SAUCE',
  CHEESE = 'CHEESE'
}

export interface OrderItem {
  type: IngredientType;
}

export interface Customer {
  id: string;
  patience: number;
  maxPatience: number;
  order: IngredientType[];
  avatarId: number; // For visual variety
}

export interface DayStats {
  dayNumber: number;
  servedCount: number;
  failedCount: number;
  moneyEarned: number;
  tips: number;
  perfectOrders: number;
}

export enum GameState {
  MENU,
  PLAYING,
  DAY_END,
  GAME_OVER
}

export interface GameConfig {
  dayDurationSeconds: number;
  customerSpawnRateMs: number;
  meatRegenRateMs: number;
}