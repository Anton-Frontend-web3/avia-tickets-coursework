'use client';

import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo } from 'react';

export interface BaggageOption {
  id: string;
  name: string;
  price: number;
}

interface BaggageSelectorProps {
  options: BaggageOption[];
  selectedOption: BaggageOption;
  onSelect: (option: BaggageOption) => void;
}

function BaggageSelectorComponent({ options, selectedOption, onSelect }: BaggageSelectorProps) {
  
  return (
    // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
    // Убираем w-full и добавляем max-w-xs (или другой размер)xs
    <div className="grid grid-cols-3 md:grid-cols-2 gap-2 w-xs mx-auto">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          className={cn(
            'border rounded-md p-2 text-left transition-all flex flex-col items-center justify-center aspect-square',
            selectedOption.id === option.id
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          )}
        >
          <Briefcase className="h-4 w-4 text-gray-600 mb-1" />
          <p className="font-semibold text-[10px] text-center leading-tight">{option.name}</p>
          {option.price > 0 && (
            <p className="text-[10px] text-gray-500 text-center">+ {option.price.toLocaleString('ru-RU')} ₽</p>
          )}
        </button>
      ))}
    </div>
  );
}

export const BaggageSelector = memo(BaggageSelectorComponent)