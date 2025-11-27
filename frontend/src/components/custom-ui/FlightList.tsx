'use client';

import { IFlight } from "@/app/search/page";
import  {FlightCard} from "./FlightCard"; 
import { SkeletonLoader } from "./SkeletonLoader"; // <-- Импортируем ваш скелетон
import { memo } from 'react';

interface FlightListProps {
  flights: IFlight[];
  isLoading: boolean;
}

function FlightListComponent({ flights, isLoading }: FlightListProps) {
  // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
  if (isLoading) {
    // Показываем 3 скелетона, стилизованных под нашу карточку
    return (
      <div className="flex flex-col gap-4">
        <SkeletonLoader count={3} className="h-[160px] rounded-xl" />
      </div>
    );
  }

  if (flights.length === 0) {
    return <p className="text-center text-gray-500 mt-8">По вашему запросу рейсы не найдены.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {flights.map(flight => (
        <FlightCard flight={flight} key={flight.flight_id} />
      ))}
    </div>
  );
}

export const FlightList = memo(FlightListComponent);