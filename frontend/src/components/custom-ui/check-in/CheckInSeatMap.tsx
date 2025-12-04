'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { processSeatSelection } from '@/lib/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CheckInSeatMapProps {
	layout: any // JSON из базы
	occupiedSeats: string[]
	ticketNumber: string
}

export function CheckInSeatMap({
	layout,
	occupiedSeats,
	ticketNumber
}: CheckInSeatMapProps) {
	const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
	const [isPending, setIsPending] = useState(false)

	// Функция расчета цены
	const getSeatPrice = (row: number, letter: string) => {
		let price = 0
		// Цена за ряд (1 = 1500р)
		if (layout.rowPrices && layout.rowPrices[row.toString()]) {
			price += layout.rowPrices[row.toString()]
		}
		// Цена за букву (A = 500р)
		if (layout.prices && layout.prices[letter]) {
			price += layout.prices[letter]
		}
		return price
	}

	const handleConfirm = async () => {
		if (!selectedSeat) return
		setIsPending(true)

		const row = parseInt(selectedSeat)
		const letter = selectedSeat.replace(/[0-9]/g, '')
		const price = getSeatPrice(row, letter)

		try {
			// Если цена > 0, тут можно вызвать модалку оплаты
			// Но мы сразу вызываем серверный экшен
			await processSeatSelection(ticketNumber, selectedSeat, price)
		} catch (e) {
			toast.error('Ошибка при выборе места')
			setIsPending(false)
		}
	}

	const currentPrice = selectedSeat
		? getSeatPrice(parseInt(selectedSeat), selectedSeat.replace(/[0-9]/g, ''))
		: 0

	return (
		<div className='flex flex-col gap-6'>
			{/* ЛЕГЕНДА */}
			<div className='flex flex-wrap justify-center gap-4 text-xs'>
				<div className='flex items-center gap-1'>
					<div className='h-4 w-4 rounded border border-blue-300 bg-blue-100' />
					Бесплатно
				</div>
				<div className='flex items-center gap-1'>
					<div className='h-4 w-4 rounded border border-purple-300 bg-purple-100' />
					Платно
				</div>
				<div className='flex items-center gap-1'>
					<div className='h-4 w-4 rounded bg-gray-200' />
					Занято
				</div>
				<div className='flex items-center gap-1'>
					<div className='h-4 w-4 rounded bg-green-500' />
					Ваш выбор
				</div>
			</div>

			{/* КАРТА */}
			<div className='flex max-h-[500px] flex-col gap-2 overflow-auto rounded-xl border bg-white p-4 shadow-inner'>
				{Array.from({ length: layout.rows }).map((_, i) => {
					const rowNum = i + 1
					return (
						<div
							key={rowNum}
							className='flex items-center justify-center gap-3'
						>
							<span className='w-6 text-center text-xs text-gray-400'>
								{rowNum}
							</span>
							{layout.letters.map((letter: string) => {
								const seatId = `${rowNum}${letter}`
								const isTaken = occupiedSeats.includes(seatId)
								const isSelected = selectedSeat === seatId
								const isAisle = layout.aisleAfter?.includes(letter)
								const price = getSeatPrice(rowNum, letter)
								const isPaid = price > 0

								return (
									<div
										key={seatId}
										className='flex'
									>
										<button
											disabled={isTaken || isPending}
											onClick={() => setSelectedSeat(seatId)}
											className={cn(
												'flex h-9 w-9 flex-col items-center justify-center rounded-md text-[10px] font-bold transition-all',
												isTaken
													? 'cursor-not-allowed bg-gray-200 text-gray-400'
													: isSelected
														? 'scale-110 bg-green-600 text-white shadow-md'
														: isPaid
															? 'border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100'
															: 'border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
											)}
										>
											<span>{letter}</span>
											{/* Показываем цену, если платно и не занято */}
											{!isTaken && !isSelected && isPaid && (
												<span className='text-[8px] opacity-70'>{price}₽</span>
											)}
										</button>
										{isAisle && <div className='w-6' />}
									</div>
								)
							})}
						</div>
					)
				})}
			</div>

			{/* ПАНЕЛЬ ДЕЙСТВИЙ */}
			<div className='sticky bottom-0 flex flex-col gap-3 rounded-lg border bg-gray-50 p-4'>
				{selectedSeat ? (
					<div className='text-center'>
						<p className='mb-2 text-lg font-medium'>
							Выбрано место: <span className='font-bold'>{selectedSeat}</span>
						</p>
						<p className='mb-4 text-sm text-gray-600'>
							К оплате:{' '}
							<span
								className={cn(
									'font-bold',
									currentPrice > 0 ? 'text-purple-600' : 'text-green-600'
								)}
							>
								{currentPrice > 0 ? `${currentPrice} ₽` : 'Бесплатно'}
							</span>
						</p>
						<Button
							onClick={handleConfirm}
							disabled={isPending}
							className='w-full bg-green-600 hover:bg-green-700'
						>
							{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{currentPrice > 0 ? 'Перейти к оплате' : 'Подтвердить место'}
						</Button>
					</div>
				) : (
					<p className='text-center text-sm text-gray-500'>
						Выберите место на схеме
					</p>
				)}
			</div>
		</div>
	)
}
