// src/components/custom-ui/FlightCard.tsx
'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'

import { IFlight } from '@/app/search/page'
import { formatTime, calculateDuration, formatDateWithDay } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { BaggageOption, BaggageSelector } from './BaggageSelector'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const baggageOptions: BaggageOption[] = [
	{ id: 'no_baggage', name: 'Без багажа', price: 0 },
	{ id: 'baggage_10', name: 'Багаж 10 кг', price: 2039 },
	{ id: 'baggage_20', name: 'Багаж 20 кг', price: 3599 }
]

interface IFlightCard{
	flight: IFlight & { booking_id?: number;baggage_option?: string }
	isBooked?:boolean
}


function FlightCardComponent({ flight, isBooked = false }: IFlightCard) {
	const savedBaggage = isBooked && flight.baggage_option 
        ? baggageOptions.find(b => b.id === flight.baggage_option) 
        : null;

    const [selectedBaggage, setSelectedBaggage] = useState<BaggageOption>(
        savedBaggage || baggageOptions[0]
    )

	const departureTime = formatTime(flight.departure_datetime)
	const arrivalTime = formatTime(flight.arrival_datetime)
	const duration = calculateDuration(
		flight.departure_datetime,
		flight.arrival_datetime
	)
	const departureDate = formatDateWithDay(flight.departure_datetime)
	const arrivalDate = formatDateWithDay(flight.arrival_datetime)
	const searchParams = useSearchParams()

	const finalPrice = parseInt(flight.base_price, 10) + selectedBaggage.price
	const createBookingUrl = () => {
        // Создаем копию текущих параметров
        const params = new URLSearchParams(searchParams.toString())
        
        // Добавляем/Обновляем параметр багажа
        params.set('baggage', selectedBaggage.id)
        
        // Возвращаем итоговую ссылку
        return `/flight/${flight.flight_id}?${params.toString()}`
    }

    const bookingUrl = createBookingUrl()

	return (
		<div className='relative flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row'>
			
			<div className='absolute top-2 right-2'>
				<Button
					variant='ghost'
					size='icon'
					className='text-gray-400 hover:text-blue-500'
				>
					<Upload className='h-5 w-5' />
				</Button>
			</div>

		
			<div className='w-full md:w-5/12'>
				<div className='mb-3 flex items-center gap-2'>
					{flight.logo_url ? (
						
						<Image
							src={flight.logo_url}
							alt={flight.airline_name}
							width={24} 
							height={24}
							className='rounded-full object-contain' 
						/>
					) : (
						<div className='h-[24px] w-[24px] rounded-full bg-gray-200'></div>
					)}
					<p className='text-sm font-medium text-gray-700'>
						{flight.airline_name}
					</p>
				</div>
				<div className='flex items-center justify-between gap-4'>
					<div className='text-left'>
						<p className='text-2xl font-bold'>{departureTime}</p>
						<p className='text-xs text-gray-500'>{departureDate}</p>
					</div>
					<div className='text-center text-xs text-gray-500'>
						<p>Прямой</p>
						<div className='my-1 h-px w-16 bg-gray-200'></div>
						<p>{duration}</p>
					</div>
					<div className='text-right'>
						<p className='text-2xl font-bold'>{arrivalTime}</p>
						<p className='text-xs text-gray-500'>{arrivalDate}</p>
					</div>
				</div>
				<p className='mt-2 text-xs text-gray-500'>
					{flight.departure_city} – {flight.arrival_city}
				</p>
			</div>

			
			<div className="col-span-1 md:col-span-3 flex justify-center">
        {!isBooked ? (
            <BaggageSelector
                options={baggageOptions}
                selectedOption={selectedBaggage}
                onSelect={setSelectedBaggage}
            />
        ) : (
            <div className="text-sm text-gray-500 text-center">
                Тариф: {selectedBaggage.name} <br/>
                (Оплачено)
            </div>
        )}
      </div>

	
			<div className="col-span-1 md:col-span-4 flex flex-col items-center sm:items-end justify-between h-full">

        
        <div className="text-center sm:text-right my-2 sm:my-0">
          <p className="text-3xl font-bold">{finalPrice.toLocaleString('ru-RU')} ₽</p>
          {!isBooked && <p className="text-xs text-gray-500">{selectedBaggage.name}, за одного</p>}
        </div>
        {isBooked ? (
            <Link href={`/booking/${flight.booking_id}`} className="w-full sm:w-auto">
                <Button variant="outline" className="mt-2 w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Подробнее о заказе
                </Button>
            </Link>
        ) : (
            <Link href={bookingUrl} className="w-full sm:w-auto">
                <Button className="mt-2 w-full">Выбрать</Button>
            </Link>
        )}
      </div>
		</div>
	)
}

export const FlightCard = memo(FlightCardComponent)
