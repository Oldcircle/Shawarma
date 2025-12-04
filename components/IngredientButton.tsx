import React from 'react';
import { IngredientType } from '../types';
import { INGREDIENT_COLORS, INGREDIENT_NAMES } from '../constants';

interface IngredientButtonProps {
  type: IngredientType;
  onClick: () => void;
  count?: number; // Infinite if undefined, else stock level
  disabled?: boolean;
}

export const IngredientButton: React.FC<IngredientButtonProps> = ({ type, onClick, count, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-1 group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-full aspect-square md:w-24 md:h-24 rounded-2xl
          bg-white
          border-b-4
          ${disabled ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer shadow-sm hover:shadow-md'}
          transition-all duration-200 active:scale-95 active:border-b-0 active:translate-y-1
          flex items-center justify-center
          overflow-hidden
        `}
      >
        {/* Ingredient Visual */}
        <div className={`
          w-16 h-16 rounded-full shadow-inner transform group-hover:scale-110 transition-transform duration-300
          ${INGREDIENT_COLORS[type]}
          flex items-center justify-center
        `}>
          {/* Subtle sheen */}
          <div className="w-1/2 h-1/2 bg-white/20 rounded-full absolute top-2 right-2 blur-sm"></div>
        </div>

        {/* Stock Counter Badge */}
        {count !== undefined && (
          <div className={`
            absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm
            ${count > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}
          `}>
            x{count}
          </div>
        )}
      </button>

      {/* Label */}
      <span className="text-xs font-bold text-gray-600 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
        {INGREDIENT_NAMES[type]}
      </span>
    </div>
  );
};