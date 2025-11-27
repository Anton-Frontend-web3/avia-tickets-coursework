// Импортируем наш тип Flight, чтобы TypeScript нам помогал

import { BookingForm } from '@/components/custom-ui/BookingForm';
import { getFlightDetailsById } from '@/lib/data'

export default async function FlightDetailPage({ params }: { params: { flight_id: string } }) {
   const resolvedParams = await params; 
   const flight = await getFlightDetailsById(resolvedParams.flight_id)
  if (!flight) {
    return <div>Рейс не найден или произошла ошибка.</div>;
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-4">Детали перелёта</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-xl"><strong>{flight.airline_name}</strong> - Рейс {flight.flight_number}</p>
        <p className="mt-2">Маршрут: <strong>{flight.departure_city}</strong> → <strong>{flight.arrival_city}</strong></p>
        <p>Вылет: {new Date(flight.departure_datetime).toLocaleString('ru-RU')}</p>
        <p>Прилет: {new Date(flight.arrival_datetime).toLocaleString('ru-RU')}</p>
        <p className="text-2xl font-bold mt-4">Цена: {parseInt(flight.base_price).toLocaleString('ru-RU')} ₽</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Оформление бронирования</h2>
        <div className="bg-white p-6 rounded-lg">
            <BookingForm flightId={flight.flight_id}/>
        </div>
      </div>
    </div>
  );
}