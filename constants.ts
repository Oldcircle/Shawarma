import { IngredientType } from './types';

export const INGREDIENT_PRICES: Record<IngredientType, number> = {
  [IngredientType.PITA]: 5,
  [IngredientType.MEAT]: 20,
  [IngredientType.CUCUMBER]: 5,
  [IngredientType.FRIES]: 8,
  [IngredientType.SAUCE]: 2,
  [IngredientType.CHEESE]: 10,
};

// More vibrant/realistic colors for the new UI
export const INGREDIENT_COLORS: Record<IngredientType, string> = {
  [IngredientType.PITA]: 'bg-[#F2D2BD] border-[#D4A086]', // Wheat
  [IngredientType.MEAT]: 'bg-[#8B4513] border-[#5D2906]', // Cooked Meat
  [IngredientType.CUCUMBER]: 'bg-[#4ADE80] border-[#166534]', // Fresh Green
  [IngredientType.FRIES]: 'bg-[#FACC15] border-[#CA8A04]', // Golden Yellow
  [IngredientType.SAUCE]: 'bg-[#F8FAFC] border-[#CBD5E1]', // White/Cream
  [IngredientType.CHEESE]: 'bg-[#FDBA74] border-[#EA580C]', // Cheddar Orange
};

export const INGREDIENT_NAMES: Record<IngredientType, string> = {
  [IngredientType.PITA]: '饼皮',
  [IngredientType.MEAT]: '烤肉',
  [IngredientType.CUCUMBER]: '黄瓜',
  [IngredientType.FRIES]: '薯条',
  [IngredientType.SAUCE]: '秘制酱',
  [IngredientType.CHEESE]: '芝士',
};

export const BASE_PATIENCE = 100;
export const PATIENCE_DECAY_RATE = 0.5; // per tick