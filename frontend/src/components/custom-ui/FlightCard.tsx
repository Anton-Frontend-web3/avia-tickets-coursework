'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Upload, Check } from 'lucide-react' // Добавил иконку Check для обратной связи
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner' // Для уведомлений

import { IFlight } from '@/app/search/page'
import { formatTime, calculateDuration, formatDateWithDay } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { BaggageOption, BaggageSelector } from './BaggageSelector'

const baggageOptions: BaggageOption[] = [
	{ id: 'no_baggage', name: 'Без багажа', price: 0 },
	{ id: 'baggage_10', name: 'Багаж 10 кг', price: 2039 },
	{ id: 'baggage_20', name: 'Багаж 20 кг', price: 3599 }
]

interface IFlightCard {
	flight: IFlight & { booking_id?: number; baggage_option?: string }
	isBooked?: boolean
}

function FlightCardComponent({ flight, isBooked = false }: IFlightCard) {
	const [isCopied, setIsCopied] = useState(false) // Состояние для анимации иконки

	const savedBaggage =
		isBooked && flight.baggage_option
			? baggageOptions.find(b => b.id === flight.baggage_option)
			: null

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
		const params = new URLSearchParams(searchParams.toString())
		params.set('baggage', selectedBaggage.id)
		return `/flight/${flight.flight_id}?${params.toString()}`
	}

	const bookingUrl = createBookingUrl()

	// --- ЛОГИКА ИКОНКИ (ПОДЕЛИТЬСЯ) ---
	const handleShare = (e: React.MouseEvent) => {
		e.preventDefault() // Чтобы не сработал Link, если он есть рядом
		e.stopPropagation()

		// Формируем полную ссылку
		const url = `${window.location.origin}/flight/${flight.flight_id}`

		navigator.clipboard.writeText(url).then(() => {
			toast.success('Ссылка на рейс скопирована!')
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000) // Возвращаем иконку через 2 сек
		})
	}

	return (
		<div className='relative flex flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row'>
			{/* --- ИКОНКА ПОДЕЛИТЬСЯ --- */}
			<div className='absolute top-2 right-2 z-20'>
				<Button
					variant='ghost'
					size='icon'
					onClick={handleShare}
					className='h-8 w-8 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
				>
					{isCopied ? (
						<Check className='h-4 w-4 text-green-500' />
					) : (
						<Upload className='h-4 w-4' />
					)}
				</Button>
			</div>

			{/* 1. ЛЕВАЯ ЧАСТЬ: Информация о рейсе */}
			<div className='w-full md:w-[45%]'>
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

			{/* 2. ЦЕНТРАЛЬНАЯ ЧАСТЬ: Выбор багажа */}
			<div className='flex w-full justify-center md:w-auto md:flex-1'>
				{!isBooked ? (
					<BaggageSelector
						options={baggageOptions}
						selectedOption={selectedBaggage}
						onSelect={setSelectedBaggage}
					/>
				) : (
					<div className='text-center text-sm text-gray-500'>
						Тариф: {selectedBaggage.name} <br />
						(Оплачено)
					</div>
				)}
			</div>

			{/* 3. ПРАВАЯ ЧАСТЬ: Цена и Кнопка */}
			{/* 
                md:pt-6 — добавляет отступ сверху ТОЛЬКО на десктопе, 
                чтобы цена не наезжала на иконку "Поделиться"
            */}
			<div className='flex w-full flex-row items-center justify-between gap-3 md:w-auto md:flex-col md:items-end md:justify-center md:pt-6'>
				{/* Блок цены */}
				<div className='text-left md:text-right'>
					<p className='text-xl font-bold md:text-3xl'>
						{finalPrice.toLocaleString('ru-RU')} ₽
					</p>
					{!isBooked && (
						<p className='text-[10px] text-gray-500 md:text-xs'>
							{selectedBaggage.name}
						</p>
					)}
				</div>

				{/* Блок кнопки */}
				{isBooked ? (
					<Link
						href={`/booking/${flight.booking_id}`}
						className='w-auto md:w-full'
					>
						<Button
							variant='outline'
							className='w-full border-blue-600 text-blue-600 hover:bg-blue-50 '
						>
							Заказ
						</Button>
					</Link>
				) : (
					<Link
						href={bookingUrl}
						className='w-auto md:w-full'
					>
						<Button className='xs:text-sm xs:h-10 xs:px-4 h-8 w-full px-3 text-xs xs:w-auto  ' >
							Забронировать
						</Button>
					</Link>
				)}
			</div>
		</div>
	)
}

export const FlightCard = memo(FlightCardComponent)
