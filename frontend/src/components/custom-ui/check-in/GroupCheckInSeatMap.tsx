'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { User, Check, Loader2, Users, Baby } from 'lucide-react'
import { processGroupCheckIn } from '@/lib/actions'

interface Passenger {
	ticket_number: string
	first_name: string
	last_name: string
	seat_number: string | null
	check_in_status: string
	is_infant: boolean
}

interface Props {
	layout: any
	occupiedSeats: string[]
	passengers: Passenger[]
}

export function GroupCheckInSeatMap({
	layout,
	occupiedSeats,
	passengers
}: Props) {
	const passengersNeedSeats = passengers.filter(p => !p.is_infant)

	const [selections, setSelections] = useState<Record<string, string>>(() => {
		const initial: Record<string, string> = {}
		passengersNeedSeats.forEach(p => {
			if (p.seat_number) initial[p.ticket_number] = p.seat_number
		})
		return initial
	})

	const [activeTicket, setActiveTicket] = useState<string>(
		passengersNeedSeats.find(p => !p.seat_number)?.ticket_number ||
			passengersNeedSeats[0].ticket_number
	)

	const [isPending, setIsPending] = useState(false)

	const getBaseSeatPrice = (row: number, letter: string) => {
		let price = 0
		if (layout.rowPrices?.[row.toString()])
			price += layout.rowPrices[row.toString()]
		if (layout.prices?.[letter]) price += layout.prices[letter]
		return price
	}

	const calculateFinancials = () => {
		const seats = Object.values(selections)
		let baseTotal = 0
		let neighborSurcharge = 0

		seats.forEach(seat => {
			const row = parseInt(seat)
			const letter = seat.replace(/[0-9]/g, '')
			baseTotal += getBaseSeatPrice(row, letter)
		})

		const rowsMap: Record<string, number[]> = {}
		seats.forEach(seat => {
			const row = seat.match(/\d+/)?.[0] || ''
			const letter = seat.replace(/\d+/, '')
			const letterIndex = layout.letters.indexOf(letter)
			if (!rowsMap[row]) rowsMap[row] = []
			rowsMap[row].push(letterIndex)
		})

		Object.values(rowsMap).forEach(indices => {
			indices.sort((a, b) => a - b)
			for (let i = 0; i < indices.length - 1; i++) {
				if (indices[i + 1] === indices[i] + 1) {
					neighborSurcharge += 500
				}
			}
		})

		return {
			baseTotal,
			neighborSurcharge,
			total: baseTotal + neighborSurcharge
		}
	}
	const financials = calculateFinancials()

	const handleSeatClick = (seatId: string) => {
		if (
			occupiedSeats.includes(seatId) &&
			!Object.values(selections).includes(seatId)
		)
			return

		const occupiedByFamily = Object.entries(selections).find(
			([ticket, seat]) => seat === seatId && ticket !== activeTicket
		)
		if (occupiedByFamily) {
			setActiveTicket(occupiedByFamily[0])
			return
		}

		setSelections(prev => ({ ...prev, [activeTicket]: seatId }))

		const nextPassenger = passengersNeedSeats.find(
			p => p.ticket_number !== activeTicket && !selections[p.ticket_number]
		)
		if (nextPassenger) {
			setActiveTicket(nextPassenger.ticket_number)
		}
	}

	const handleConfirm = async () => {
		if (Object.keys(selections).length < passengersNeedSeats.length) {
			toast.error('Пожалуйста, выберите места для всех взрослых и детей')
			return
		}

		setIsPending(true)
		try {
			const infantTickets = passengers
				.filter(p => p.is_infant)
				.map(p => p.ticket_number)
			await processGroupCheckIn(selections, infantTickets)
		} catch (e) {
			toast.error('Ошибка сохранения')
			setIsPending(false)
		}
	}

	return (
		<div className='flex flex-col-reverse gap-6 lg:grid lg:grid-cols-4'>
			{/* ЛЕВАЯ КОЛОНКА (СПИСОК ПАССАЖИРОВ) */}
			{/* pb-32 на мобильных нужно, чтобы контент не скрывался за фиксированной кнопкой */}
			<div className='flex h-full flex-col pb-32 lg:col-span-1 lg:pb-0'>
				<div className='flex-1 space-y-3'>
					<h3 className='text-foreground mb-4 text-lg font-bold'>Пассажиры</h3>
					{passengers.map(p => {
						const selectedSeat = selections[p.ticket_number]
						const isActive = activeTicket === p.ticket_number
						const seatPrice = selectedSeat
							? getBaseSeatPrice(
									parseInt(selectedSeat),
									selectedSeat.replace(/[0-9]/g, '')
								)
							: 0

						if (p.is_infant) {
							return (
								<div
									key={p.ticket_number}
									className='border-border bg-muted flex cursor-default items-center justify-between rounded-lg border border-dashed p-3 opacity-80'
								>
									<div className='flex items-center gap-2 overflow-hidden'>
										<div className='rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
											<Baby className='h-4 w-4' />
										</div>
										<div className='truncate'>
											<p className='text-foreground text-sm font-medium'>
												{p.first_name}
											</p>
											<p className='text-muted-foreground text-xs'>Младенец</p>
										</div>
									</div>
									<span className='rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'>
										На руках
									</span>
								</div>
							)
						}

						return (
							<div
								key={p.ticket_number}
								onClick={() => setActiveTicket(p.ticket_number)}
								className={cn(
									'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all',
									isActive
										? 'border-primary bg-primary/10 ring-primary ring-1'
										: 'border-border hover:bg-muted/50',
									selectedSeat && !isActive
										? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
										: 'bg-card'
								)}
							>
								<div className='flex items-center gap-2 overflow-hidden'>
									<div
										className={cn(
											'rounded-full p-2',
											isActive
												? 'bg-primary/20 text-primary'
												: 'bg-muted text-muted-foreground'
										)}
									>
										<User className='h-4 w-4' />
									</div>
									<div className='truncate'>
										<p className='text-foreground text-sm font-medium'>
											{p.first_name}
										</p>
										{seatPrice > 0 && (
											<span className='text-primary text-[10px] font-bold'>
												+{seatPrice}₽
											</span>
										)}
									</div>
								</div>
								{selectedSeat ? (
									<span className='border-border bg-background text-primary min-w-[30px] rounded border px-2 py-1 text-center text-xs font-bold'>
										{selectedSeat}
									</span>
								) : (
									<span className='text-muted-foreground text-xs'>Выбрать</span>
								)}
							</div>
						)
					})}
				</div>

				<div className='border-border bg-background fixed right-0 bottom-0 left-0 z-50 rounded-xl border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:static lg:mt-6 lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none'>
					{/* Контейнер для центрирования на широких экранах планшетов, если нужно, но оставим full для мобилок */}
					<div className='mx-auto w-full max-w-5xl space-y-2 lg:max-w-none'>
						{financials.neighborSurcharge > 0 && (
							<div className='flex items-center justify-between rounded bg-orange-50 p-2 text-sm text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'>
								<span className='flex items-center gap-1'>
									<Users className='h-4 w-4' /> Выбор мест рядом:
								</span>
								<span className='font-bold'>
									+{financials.neighborSurcharge} ₽
								</span>
							</div>
						)}
						<div className='flex items-center justify-between'>
							<span className='text-muted-foreground font-medium'>
								Итого к оплате:
							</span>
							<span
								className={cn(
									'text-xl font-bold',
									financials.total > 0
										? 'text-primary'
										: 'text-green-600 dark:text-green-400'
								)}
							>
								{financials.total > 0 ? `${financials.total} ₽` : 'Бесплатно'}
							</span>
						</div>
						<Button
							onClick={handleConfirm}
							className='w-full'
							disabled={
								isPending ||
								Object.keys(selections).length < passengersNeedSeats.length
							}
						>
							{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{financials.total > 0
								? 'Перейти к оплате'
								: 'Зарегистрировать всех'}
						</Button>
					</div>
				</div>
			</div>

			{/* ПРАВАЯ КОЛОНКА (КАРТА) */}
			<div className='flex flex-col gap-6 lg:col-span-3'>
				{/* ЛЕГЕНДА */}
				<div className='bg-card border-border flex flex-wrap justify-center gap-4 rounded-lg border p-3 text-xs shadow-sm'>
					<div className='text-muted-foreground flex items-center gap-1'>
						<div className='h-4 w-4 rounded border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30' />
						Бесплатно
					</div>
					<div className='text-muted-foreground flex items-center gap-1'>
						<div className='h-4 w-4 rounded border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/30' />
						Платно
					</div>
					<div className='text-muted-foreground flex items-center gap-1'>
						<div className='bg-muted h-4 w-4 rounded' />
						Занято
					</div>
					<div className='text-foreground flex items-center gap-1 font-medium'>
						<div className='h-4 w-4 rounded bg-green-500' />
						Ваш выбор
					</div>
				</div>

				{/* КАРТА */}
				<div className='border-border bg-card flex min-h-[500px] flex-1 flex-col items-center rounded-xl border p-2 shadow-sm sm:p-6'>
					<div className='flex max-h-[600px] w-full flex-col items-center gap-2 overflow-auto'>
						{Array.from({ length: layout.rows }).map((_, i) => {
							const rowNum = i + 1
							return (
								<div
									key={rowNum}
									className='flex items-center justify-center gap-1.5 sm:gap-3'
								>
									<span className='text-muted-foreground w-6 text-center text-xs'>
										{rowNum}
									</span>
									{layout.letters.map((letter: string) => {
										const seatId = `${rowNum}${letter}`
										const isTaken =
											occupiedSeats.includes(seatId) &&
											!Object.values(selections).includes(seatId)
										const selectedByTicket = Object.keys(selections).find(
											k => selections[k] === seatId
										)
										const isSelected = !!selectedByTicket
										const isMyActive = selectedByTicket === activeTicket
										const passengerName = selectedByTicket
											? passengers.find(
													p => p.ticket_number === selectedByTicket
												)?.first_name
											: ''
										const price = getBaseSeatPrice(rowNum, letter)
										const isPaid = price > 0

										return (
											<button
												key={seatId}
												disabled={isTaken || isPending}
												onClick={() => handleSeatClick(seatId)}
												className={cn(
													'relative flex h-8 w-8 flex-col items-center justify-center rounded-md text-[9px] font-bold transition-all sm:h-9 sm:w-9 sm:text-[10px]',
													isTaken
														? 'bg-muted text-muted-foreground cursor-not-allowed'
														: isMyActive
															? 'z-20 scale-110 bg-green-600 text-white shadow-md ring-2 ring-green-400 ring-offset-1 dark:ring-offset-black'
															: isSelected
																? 'border border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300'
																: isPaid
																	? 'border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40'
																	: 'border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40'
												)}
											>
												{isSelected ? (
													<span className='uppercase'>
														{passengerName ? (
															passengerName[0]
														) : (
															<Check className='h-3 w-3' />
														)}
													</span>
												) : (
													<span>{letter}</span>
												)}
												{!isTaken && !isSelected && isPaid && (
													<span className='opacity-70'>{price}</span>
												)}
											</button>
										)
									})}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
