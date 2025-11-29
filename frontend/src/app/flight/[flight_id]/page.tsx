import { BookingForm } from '@/components/custom-ui/booking/BookingForm'
import { getFlightDetailsById } from '@/lib/data'

// 1. Обновляем типы пропсов. searchParams - это Promise в Next.js 15+
interface PageProps {
	params: Promise<{ flight_id: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FlightDetailPage({
	params,
	searchParams
}: PageProps) {
	// 2. Ждем разрешения промисов (для Next.js 15)
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams

	const flight = await getFlightDetailsById(resolvedParams.flight_id)

	if (!flight) {
		return <div>Рейс не найден или произошла ошибка.</div>
	}
	const baggageOption = (resolvedSearchParams.baggage as string) || 'no_baggage';
	// 3. Извлекаем количество пассажиров из URL или ставим дефолтные значения
	const initialCounts = {
		adults: Number(resolvedSearchParams.adults) || 1,
		children: Number(resolvedSearchParams.children) || 0,
		infants: Number(resolvedSearchParams.infants) || 0
	}

	return (
		<div className=''>
			<h1 className='mb-4 text-3xl font-bold'>Детали перелёта</h1>

			<div className='rounded-lg bg-white p-6 shadow-md'>
				<p className='text-xl'>
					<strong>{flight.airline_name}</strong> - Рейс {flight.flight_number}
				</p>
				<p className='mt-2'>
					Маршрут: <strong>{flight.departure_city}</strong> →{' '}
					<strong>{flight.arrival_city}</strong>
				</p>
				<p>
					Вылет: {new Date(flight.departure_datetime).toLocaleString('ru-RU')}
				</p>
				<p>
					Прилет: {new Date(flight.arrival_datetime).toLocaleString('ru-RU')}
				</p>
				<p className='mt-4 text-2xl font-bold'>
					Цена: {parseInt(flight.base_price).toLocaleString('ru-RU')} ₽
				</p>
			</div>

			<div className='mt-8'>
				<h2 className='mb-4 text-2xl font-bold'>Оформление бронирования</h2>
				<div className='rounded-lg bg-white p-6'>
					{/* 4. Передаем initialCounts в форму */}
					<BookingForm
						flightId={flight.flight_id}
						initialCounts={initialCounts}
						baggageOption={baggageOption}
					/>
				</div>
			</div>
		</div>
	)
}
