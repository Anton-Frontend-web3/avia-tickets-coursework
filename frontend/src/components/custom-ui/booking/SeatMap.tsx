'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ReservationTimer } from './ReservationTimer' // <--- Импортируем таймер

interface SeatMapProps {
	flightId: number
	onSelectionChange: (seats: string[]) => void
	maxSeats: number
}

export function SeatMap({
	flightId,
	onSelectionChange,
	maxSeats
}: SeatMapProps) {
	const [layout, setLayout] = useState<any>(null)
	const [occupied, setOccupied] = useState<string[]>([])
	const [selected, setSelected] = useState<string[]>([])

	// Состояние для времени истечения (передадим его в таймер)
	const [expiresAt, setExpiresAt] = useState<Date | null>(null)

	const fetchSeats = async () => {
		try {
			const res = await fetch(`/api/flights/${flightId}/seats`)
			if (!res.ok) return
			const data = await res.json()

			setLayout(data.layout)
			setOccupied([...data.booked, ...data.reservedByOthers])

			if (data.myHolds.length > 0) {
				setSelected(data.myHolds)
				onSelectionChange(data.myHolds)
				// Если таймер еще не запущен, но места есть - запускаем условно на 10 мин
				// (точное время обновится при следующем клике)
				if (!expiresAt) setExpiresAt(new Date(Date.now() + 10 * 60000))
			}
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {
		fetchSeats()
		const interval = setInterval(fetchSeats, 5000)
		return () => clearInterval(interval)
	}, [flightId])

	const handleSeatClick = async (seatId: string) => {
		if (occupied.includes(seatId)) return

		let newSelected = [...selected]
		if (selected.includes(seatId)) {
			newSelected = newSelected.filter(s => s !== seatId)
		} else {
			if (newSelected.length >= maxSeats) {
				toast.warning(`Максимум ${maxSeats} мест`)
				return
			}
			newSelected.push(seatId)
		}

		setSelected(newSelected)
		onSelectionChange(newSelected)

		try {
			const res = await fetch(`/api/flights/${flightId}/seats/reserve`, {
				method: 'POST',
				body: JSON.stringify({ seatNumbers: newSelected })
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error)
			}

			// Обновляем время таймера ответом от сервера
			if (data.expiresAt) {
				setExpiresAt(new Date(data.expiresAt))
			} else if (newSelected.length === 0) {
				setExpiresAt(null)
			}
		} catch (e: any) {
			toast.error(e.message || 'Не удалось занять место')
			fetchSeats() // Откат изменений при ошибке
		}
	}

	if (!layout)
		return (
			<div className='p-4 text-center text-gray-500'>
				Загрузка карты мест...
			</div>
		)

	return (
		<div className='flex flex-col'>
			{/* Используем наш новый компонент */}
			<ReservationTimer expiresAt={expiresAt} />

			<div className='flex max-h-[400px] flex-col gap-2 overflow-auto rounded-xl border bg-white p-4 shadow-sm'>
				{/* ЛЕГЕНДА */}
				<div className='mb-6 flex justify-center gap-6 text-xs'>
					<div className='flex items-center gap-2'>
						<div className='h-5 w-5 rounded bg-gray-200' />
						<span className='text-gray-500'>Занято</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-5 w-5 rounded border border-blue-200 bg-blue-50' />
						<span className='text-gray-600'>Свободно</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='h-5 w-5 rounded bg-blue-600 shadow-sm' />
						<span className='font-medium text-blue-700'>Ваш выбор</span>
					</div>
				</div>

				{/* СЕТКА МЕСТ */}
				{Array.from({ length: layout.rows }).map((_, i) => {
					const rowNum = i + 1
					return (
						<div
							key={rowNum}
							className='flex items-center justify-center gap-3'
						>
							<span className='w-6 text-center text-xs font-medium text-gray-400'>
								{rowNum}
							</span>
							{layout.letters.map((letter: string) => {
								const seatId = `${rowNum}${letter}`
								const isTaken = occupied.includes(seatId)
								const isMySelection = selected.includes(seatId)
								const isAisle = layout.aisleAfter?.includes(letter)

								return (
									<div
										key={seatId}
										className='flex'
									>
										<button
											type='button'
											disabled={isTaken}
											onClick={() => handleSeatClick(seatId)}
											className={cn(
												'flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold transition-all duration-200',
												isTaken
													? 'cursor-not-allowed bg-gray-100 text-gray-300'
													: isMySelection
														? 'scale-105 bg-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1'
														: 'border border-blue-200 bg-blue-50 text-blue-900 hover:scale-105 hover:bg-blue-100'
											)}
										>
											{letter}
										</button>
										{isAisle && <div className='w-8' />}
									</div>
								)
							})}
						</div>
					)
				})}
			</div>
		</div>
	)
}
