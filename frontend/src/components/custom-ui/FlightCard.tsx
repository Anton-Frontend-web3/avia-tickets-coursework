// src/components/custom-ui/FlightCard.tsx
'use client';

import { memo, useState } from 'react';
import Image from 'next/image'; 
import { Upload } from 'lucide-react';

import { IFlight } from '@/app/search/page';
import { formatTime, calculateDuration, formatDateWithDay } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {BaggageOption,BaggageSelector } from './BaggageSelector';
import Link from 'next/link';


const baggageOptions: BaggageOption[] = [
  { id: 'no_baggage', name: 'Без багажа', price: 0 },
  { id: 'baggage_10', name: 'Багаж 10 кг', price: 2039 },
  { id: 'baggage_20', name: 'Багаж 20 кг', price: 3599 },
];
//TODO сделать адптив
 function FlightCardComponent({ flight }: { flight: IFlight }) {

  const [selectedBaggage, setSelectedBaggage] = useState<BaggageOption>(baggageOptions[0]);


  const departureTime = formatTime(flight.departure_datetime);
  const arrivalTime = formatTime(flight.arrival_datetime);
  const duration = calculateDuration(flight.departure_datetime, flight.arrival_datetime);
  const departureDate = formatDateWithDay(flight.departure_datetime);
  const arrivalDate = formatDateWithDay(flight.arrival_datetime);
  

  const finalPrice = parseInt(flight.base_price, 10) + selectedBaggage.price;

  return (
    <div className="relative bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
      
      {/* Кнопка "Upload" теперь спозиционирована абсолютно */}
      <div className="absolute top-2 right-2">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-500">
            <Upload className="h-5 w-5" />
        </Button>
      </div>
   
      {/* 1. Левая часть (без изменений) */}
      <div className="w-full md:w-5/12"> {/* Занимает 5/12 ширины на десктопе */}
              <div className="flex items-center gap-2 mb-3">
                 {flight.logo_url ? (
                            // 2. Если существует, используем ЕЕ, а не "/path-to-logo.png"
                            <Image
                              src={flight.logo_url} 
                              alt={flight.airline_name}
                              width={24} // Немного увеличим для четкости
                              height={24}
                              className="rounded-full object-contain" // object-contain сохраняет пропорции
                            />
                          ) : (
                            // (Опционально) Показываем заглушку, если логотипа нет
                            <div className="w-[24px] h-[24px] bg-gray-200 rounded-full"></div>
                          )}
                <p className="text-sm font-medium text-gray-700">{flight.airline_name}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-2xl font-bold">{departureTime}</p>
                  <p className="text-xs text-gray-500">{departureDate}</p>
                </div>
                <div className="text-center text-xs text-gray-500">
                  <p>Прямой</p>
                  <div className="w-16 h-px bg-gray-200 my-1"></div>
                  <p>{duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{arrivalTime}</p>
                  <p className="text-xs text-gray-500">{arrivalDate}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {flight.departure_city} – {flight.arrival_city}
              </p>
            </div>

      {/* 2. Центральная часть (без изменений) */}
      <div className="w-full md:w-3/12 flex justify-center"> 
        <BaggageSelector
          options={baggageOptions}
          selectedOption={selectedBaggage}
          onSelect={setSelectedBaggage}
        />
      </div>

      {/* 3. Правая часть (полностью переделана) */}
      <div className="w-full md:w-4/12 flex items-center justify-between h-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0">
  
  
        <div className="text-left">
          <p className="text-3xl font-bold whitespace-nowrap">{finalPrice.toLocaleString('ru-RU')} ₽</p>
          <p className="text-xs text-gray-500">{selectedBaggage.name}, за одного</p>
        </div>
        
        {/* Блок с кнопкой "Выбрать" */}
        <Link href={`/flight/${flight.flight_id}`} >
          <Button className="ml-4">Выбрать</Button>
        </Link>

        </div>
    </div>
  );
}

export const FlightCard = memo(FlightCardComponent)