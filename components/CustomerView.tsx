import React from 'react';
import { Customer } from '../types';
import { INGREDIENT_COLORS } from '../constants';
import { User, Frown, Meh, Smile } from 'lucide-react';

interface CustomerViewProps {
  customer: Customer;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ customer }) => {
  const patiencePercent = (customer.patience / customer.maxPatience) * 100;
  
  let MoodIcon = Smile;
  let moodColor = "text-green-500 bg-green-50 border-green-200";
  let faceColor = "bg-gray-100";
  
  if (patiencePercent < 50) {
    MoodIcon = Meh;
    moodColor = "text-yellow-500 bg-yellow-50 border-yellow-200";
    faceColor = "bg-orange-50";
  }
  if (patiencePercent < 20) {
    MoodIcon = Frown;
    moodColor = "text-red-500 bg-red-50 border-red-200";
    faceColor = "bg-red-50";
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Order Cloud/Bubble */}
      <div className="mb-2 bg-white p-2 rounded-2xl border-2 border-gray-100 shadow-md relative min-w-[100px] transform transition-transform hover:-translate-y-1">
        <div className="flex gap-1.5 justify-center flex-wrap max-w-[120px]">
          {customer.order.map((ing, idx) => (
            <div 
              key={idx} 
              className={`w-6 h-6 rounded-full border border-black/5 shadow-sm ${INGREDIENT_COLORS[ing]}`}
              title={ing}
            />
          ))}
        </div>
        {/* Bubble tail */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-100 rotate-45"></div>
      </div>

      {/* Customer Avatar Body */}
      <div className="relative group">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg
          ${faceColor}
          transition-colors duration-300
        `}>
          <User size={36} className="text-gray-400" />
        </div>
        
        {/* Mood Indicator Badge */}
        <div className={`
          absolute -top-1 -right-1 rounded-full p-1 border shadow-sm
          ${moodColor}
        `}>
            <MoodIcon size={16} strokeWidth={2.5} />
        </div>
      </div>

      {/* Patience Bar */}
      <div className="w-14 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden border border-black/5">
        <div 
          className={`h-full transition-all duration-200 ${patiencePercent < 30 ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: `${patiencePercent}%` }}
        />
      </div>
    </div>
  );
};