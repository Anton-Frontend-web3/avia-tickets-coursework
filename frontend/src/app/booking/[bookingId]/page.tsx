import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plane, User, CreditCard } from 'lucide-react' // Calendar убрал, он не используется

import { getBookingDetails } from '@/lib/data'
import { formatTime, formatDateWithDay } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CancelBookingButton } from '@/components/custom-ui/CancelBookingButton'

// Словарь для перевода типов документов
const DOC_TYPE_LABELS: Record<string, string> = {
	passport_rf: 'Паспорт РФ',
	passport_international: 'Загранпаспорт',
	birth_certificate: 'Свид. о рождении'
}

interface PageProps {
	params: Promise<{ bookingId: string }>
}

export default async function BookingDetailsPage({ params }: PageProps) {
	const { bookingId } = await params
	const booking = await getBookingDetails(bookingId)

	if (!booking) {
		return notFound()
	}

	const isConfirmed = booking.status === 'Confirmed'

	const statusClasses = isConfirmed
		? 'bg-green-50 text-green-700 border-green-200'
		: 'bg-red-50 text-red-700 border-red-200'

	const statusLabel = isConfirmed
		? 'Оплачено и подтверждено'
		: 'Бронирование отменено'

	const departureDate = formatDateWithDay(booking.departure_datetime.toString())
	const departureTime = formatTime(booking.departure_datetime.toString())
	const arrivalDate = formatDateWithDay(booking.arrival_datetime.toString())
	const arrivalTime = formatTime(booking.arrival_datetime.toString())

	// Формируем красивое название документа
	const documentLabel = DOC_TYPE_LABELS[booking.document_type] || 'Документ'

	// Формируем строку "Серия Номер" (если серии нет, то просто номер)
	const fullDocumentNumber = booking.document_series
		? `${booking.document_series} ${booking.document_number}`
		: booking.document_number

	return (
		<div className='container mx-auto max-w-3xl px-4 py-10'>
			<div className='mb-6'>
				<Link href='/profile'>
					<Button
						variant='ghost'
						className='pl-0 hover:bg-transparent hover:text-blue-600'
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Вернуться в личный кабинет
					</Button>
				</Link>
			</div>

			<Card className='overflow-hidden border-gray-200 shadow-md'>
				<CardHeader className='border-b bg-gray-50/50 pb-4'>
						<div className="flex flex-col gap-2">
                            <div>
                                <CardDescription className='mb-1 text-xs uppercase tracking-wider'>Код бронирования (PNR)</CardDescription>
                                <CardTitle className='font-mono text-3xl font-black tracking-widest text-blue-700'>
                                    {booking.booking_reference}
                                </CardTitle>
                            </div>
                            <div>
                                <CardDescription className='mb-1 text-xs'>Номер билета</CardDescription>
                                <p className='font-mono text-sm font-medium text-gray-600'>
                                    {booking.ticket_number}
                                </p>
                            </div>
                        </div>
				</CardHeader>

				<CardContent className='space-y-8 pt-6'>
					{/* Информация о рейсе */}
					<section>
						<div className='mb-4 flex items-center gap-2 text-gray-800'>
							<Plane className='h-5 w-5 text-blue-500' />
							<h3 className='text-lg font-semibold'>Информация о рейсе</h3>
						</div>

						<div className='space-y-4 rounded-lg border border-gray-100 bg-white p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-medium text-gray-900'>
									{booking.airline_name}
								</span>
								<span className='text-sm text-gray-500'>
									Рейс {booking.flight_number}
								</span>
							</div>

							<div className='flex items-center justify-between gap-4'>
								<div className='text-left'>
									<p className='text-3xl font-bold text-gray-900'>
										{departureTime}
									</p>
									<p className='text-sm font-medium text-gray-600'>
										{departureDate}
									</p>
									<p className='mt-1 text-xs text-gray-400'>
										{booking.departure_city} ({booking.departure_code})
									</p>
								</div>

								<div className='flex flex-1 flex-col items-center px-2'>
									<div className='relative mt-2 h-[2px] w-full bg-gray-200'>
										<div className='absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full bg-gray-300'></div>
										<div className='absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-gray-300'></div>
									</div>
								</div>

								<div className='text-right'>
									<p className='text-3xl font-bold text-gray-900'>
										{arrivalTime}
									</p>
									<p className='text-sm font-medium text-gray-600'>
										{arrivalDate}
									</p>
									<p className='mt-1 text-xs text-gray-400'>
										{booking.arrival_city} ({booking.arrival_code})
									</p>
								</div>
							</div>
						</div>
					</section>

					<Separator />

					{/* Пассажир - ИЗМЕНЕНИЯ ЗДЕСЬ */}
					<section>
						<div className='mb-4 flex items-center gap-2 text-gray-800'>
							<User className='h-5 w-5 text-blue-500' />
							<h3 className='text-lg font-semibold'>Пассажир</h3>
						</div>

						<div className='grid grid-cols-1 gap-6 rounded-lg bg-gray-50/50 p-4 sm:grid-cols-2'>
							<div>
								<p className='mb-1 text-xs text-gray-500'>
									Фамилия Имя Отчество
								</p>
								<p className='font-medium text-gray-900'>
									{booking.last_name} {booking.first_name} {booking.middle_name}
								</p>
							</div>
							<div>
								{/* Выводим тип документа (Паспорт РФ) */}
								<p className='mb-1 text-xs text-gray-500'>{documentLabel}</p>
								{/* Выводим Серию и Номер */}
								<p className='font-medium text-gray-900'>
									{fullDocumentNumber}
								</p>
							</div>
						</div>
					</section>

					<Separator />

					{/* Оплата и Багаж */}
					<section>
						<div className='mb-4 flex items-center gap-2 text-gray-800'>
							<CreditCard className='h-5 w-5 text-blue-500' />
							<h3 className='text-lg font-semibold'>Оплата и услуги</h3>
						</div>
						<div className='flex flex-col gap-3'>
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<span className='text-gray-600'>Стоимость билета</span>
								<span className='text-xl font-bold text-gray-900'>
									{parseInt(booking.base_price).toLocaleString('ru-RU')} ₽
								</span>
							</div>

							<div className='flex items-center justify-between rounded-lg border bg-blue-50/50 p-4'>
								<span className='text-gray-600'>Багаж</span>
								<span className='font-medium text-blue-900'>
									{booking.baggage_option === 'no_baggage'
										? 'Без багажа'
										: booking.baggage_option === 'baggage_10'
											? 'Багаж 10 кг'
											: 'Багаж 20 кг'}
								</span>
							</div>
						</div>
					</section>
				</CardContent>
				{isConfirmed && (
					<CardFooter className='flex justify-end border-t bg-gray-50 p-6'>
						<CancelBookingButton bookingId={booking.booking_id} />
					</CardFooter>
				)}
			</Card>
		</div>
	)
}
