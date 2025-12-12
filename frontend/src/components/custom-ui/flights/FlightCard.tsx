'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Upload, Check, Info } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { IFlight } from '@/app/search/page'
import { 
	formatTime, 
	formatDateWithDay, 
	formatTimeZoneOffset, 
	formatDuration
} from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip'

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
	const [isCopied, setIsCopied] = useState(false)

	const savedBaggage =
		isBooked && flight.baggage_option
			? baggageOptions.find(b => b.id === flight.baggage_option)
			: null

	const [selectedBaggage, setSelectedBaggage] = useState<BaggageOption>(
		savedBaggage || baggageOptions[0]
	)

	// Форматирование времени
	const departureTime = formatTime(flight.departure_datetime)
	const arrivalTime = formatTime(flight.arrival_datetime)
	const duration = formatDuration(flight.duration_minutes);
	const departureDate = formatDateWithDay(flight.departure_datetime)
	const arrivalDate = formatDateWithDay(flight.arrival_datetime)
	
	// Часовые пояса (UTC+3)
	const depOffset = formatTimeZoneOffset(flight.departure_datetime, flight.departure_timezone);
	const arrOffset = formatTimeZoneOffset(flight.arrival_datetime, flight.arrival_timezone);
	
	// Проверка на следующий день (для отображения +1)
	const isNextDay = new Date(flight.departure_datetime).getDate() !== new Date(flight.arrival_datetime).getDate();

	const searchParams = useSearchParams()
	const finalPrice = parseInt(flight.base_price, 10) + selectedBaggage.price

	const createBookingUrl = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('baggage', selectedBaggage.id)
		return `/flight/${flight.flight_id}?${params.toString()}`
	}

	const bookingUrl = createBookingUrl()

	const handleShare = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const url = `${window.location.origin}/flight/${flight.flight_id}`
		navigator.clipboard.writeText(url).then(() => {
			toast.success('Ссылка на рейс скопирована!')
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000)
		})
	}

	return (
		<div className='border-border bg-card relative flex flex-col items-center gap-4 rounded-xl border p-4 shadow-sm md:flex-row'>
			
			{/* КНОПКА ПОДЕЛИТЬСЯ */}
			<div className=' flex gap-4 absolute top-2 right-2 z-20'>
			<TooltipProvider>
    <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
            <div className='text-muted-foreground flex cursor-pointer items-center gap-1 text-[10px] opacity-70 hover:opacity-100 transition-opacity'>
                <Info className='h-3 w-3' />
                <span className="hidden xs:inline">Время местное</span>
                <span className="xs:hidden">Инфо</span>
            </div>
        </TooltipTrigger>
        
        <TooltipContent
            className="max-w-[250px] text-center break-words whitespace-normal bg-popover text-popover-foreground border-border"
            collisionPadding={10}
            side="bottom"
        >
            <p>Время вылета и прилета указано местное для каждого аэропорта</p>
        </TooltipContent>
    </Tooltip>
</TooltipProvider>
				<Button
					variant='ghost'
					size='icon'
					onClick={handleShare}
					className='text-muted-foreground hover:bg-primary/10 hover:text-primary h-8 w-8'
				>
					{isCopied ? (
						<Check className='h-4 w-4 text-emerald-500' />
					) : (
						<Upload className='h-4 w-4' />
					)}
				</Button>
				
			</div>

			{/* 1. ЛЕВАЯ ЧАСТЬ: ИНФОРМАЦИЯ О РЕЙСЕ */}
			<div className='w-full md:w-[45%]'>
				
				{/* Логотип и Тултип "Местное время" */}
				<div className='mb-3 flex items-center justify-between pr-8'>
					<div className='flex items-center gap-2'>
						{flight.logo_url ? (
							<Image
								src={flight.logo_url}
								alt={flight.airline_name}
								width={24}
								height={24}
								className='rounded-full object-contain'
							/>
						) : (
							<div className='bg-muted h-[24px] w-[24px] rounded-full'></div>
						)}
						<p className='text-foreground text-sm font-medium'>
							{flight.airline_name}
						</p>
					</div>
					
				</div>

				{/* Сетка времени */}
				<div className='flex items-center justify-between gap-4'>
					
					{/* ВЫЛЕТ */}
					<div className='text-left'>
						<p className='text-2xl font-bold leading-none'>{departureTime}</p>
						{/* UTC Offset */}
						<p className='text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-1'>
							{depOffset}
						</p>
						<p className='text-muted-foreground text-xs mt-0.5'>{departureDate}</p>
						{/* IATA Код (SVO) */}
						<p className='text-foreground font-bold text-xs mt-1'>{flight.departure_code}</p>
					</div>

					{/* СЕРЕДИНА (Продолжительность) */}
					<div className='text-muted-foreground text-center text-xs'>
						<p>Прямой</p>
						<div className='bg-border my-1 h-px w-16'></div>
						<p>{duration}</p>
					</div>

					{/* ПРИЛЕТ */}
					<div className='text-right'>
						<div className='flex items-start justify-end gap-0.5'>
							<p className='text-2xl font-bold leading-none'>{arrivalTime}</p>
						</div>
						{/* UTC Offset */}
						<p className='text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-1'>
							{arrOffset}
						</p>
						<p className='text-muted-foreground text-xs mt-0.5'>{arrivalDate}</p>
						{/* IATA Код (DXB) */}
						<p className='text-foreground font-bold text-xs mt-1'>{flight.arrival_code}</p>
					</div>
				</div>
				
				{/* Города */}
				<p className='text-muted-foreground mt-3 text-xs truncate'>
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
					<div className='text-muted-foreground text-center text-sm'>
						Тариф: {selectedBaggage.name} <br />
						(Оплачено)
					</div>
				)}
			</div>

			{/* 3. ПРАВАЯ ЧАСТЬ: Цена и Кнопка */}
			<div className='flex w-full flex-row items-center justify-between gap-3 md:w-auto md:flex-col md:items-end md:justify-center md:pt-6'>
				<div className='text-left md:text-right'>
					<p className='text-xl font-bold md:text-3xl'>
						{finalPrice.toLocaleString('ru-RU')} ₽
					</p>
					{!isBooked && (
						<p className='text-muted-foreground text-[10px] md:text-xs'>
							{selectedBaggage.name}
						</p>
					)}
				</div>

				{isBooked ? (
					<Link
						href={`/booking/${flight.booking_id}`}
						className='w-auto md:w-full'
					>
						<Button
							variant='outline'
							className='border-primary text-primary hover:bg-primary/10 w-full'
						>
							Заказ
						</Button>
					</Link>
				) : (
					<Link
						href={bookingUrl}
						className='w-auto md:w-full'
					>
						<Button className='xs:text-sm xs:h-10 xs:px-4 xs:w-auto h-8 w-full px-3 text-xs min-w-[120px]'>
							Забронировать
						</Button>
					</Link>
				)}
			</div>
		</div>
	)
}

export const FlightCard = memo(FlightCardComponent)