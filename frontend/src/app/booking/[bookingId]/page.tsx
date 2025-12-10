import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plane, User, CreditCard, ArrowDown } from 'lucide-react'

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
import { CancelBookingButton } from '@/components/custom-ui/booking/CancelBookingButton'

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
		? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
		: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'

	const statusLabel = isConfirmed
		? 'Оплачено и подтверждено'
		: 'Бронирование отменено'

	const departureDate = formatDateWithDay(booking.departure_datetime.toString())
	const departureTime = formatTime(booking.departure_datetime.toString())
	const arrivalDate = formatDateWithDay(booking.arrival_datetime.toString())
	const arrivalTime = formatTime(booking.arrival_datetime.toString())

	const documentLabel = DOC_TYPE_LABELS[booking.document_type] || 'Документ'

	const fullDocumentNumber = booking.document_series
		? `${booking.document_series} ${booking.document_number}`
		: booking.document_number

	return (
		<div className='container mx-auto max-w-3xl px-3 py-6 md:px-4 md:py-10'>
			<div className='mb-6'>
				<Link href='/profile'>
					<Button
						variant='ghost'
						className='hover:text-primary pl-0 hover:bg-transparent'
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Вернуться в личный кабинет
					</Button>
				</Link>
			</div>

			<Card className='border-border bg-card text-card-foreground overflow-hidden shadow-md'>
				<CardHeader className='border-border border-b pb-4'>
					<div className='flex flex-col gap-2'>
						<div>
							<CardDescription className='text-muted-foreground mb-1 text-xs tracking-wider uppercase'>
								Код бронирования (PNR)
							</CardDescription>

							<CardTitle className='text-primary font-mono text-3xl font-black tracking-widest'>
								{booking.booking_reference}
							</CardTitle>
						</div>
						<div>
							<CardDescription className='text-muted-foreground mb-1 text-xs'>
								Номер билета
							</CardDescription>
							<p className='text-foreground font-mono text-sm font-medium'>
								{booking.ticket_number}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className='space-y-8 pt-6'>
					<section>
						<div className='text-foreground mb-4 flex items-center gap-2'>
							<Plane className='text-primary h-5 w-5' />
							<h3 className='text-lg font-semibold'>Информация о рейсе</h3>
						</div>

						<div className='border-border bg-muted/20 space-y-4 rounded-lg border p-4'>
							<div className='flex flex-col justify-between gap-1 sm:flex-row sm:items-center'>
								<span className='text-foreground font-medium'>
									{booking.airline_name}
								</span>
								<span className='text-muted-foreground text-sm'>
									Рейс {booking.flight_number}
								</span>
							</div>

							<div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4'>
								{/* Вылет */}
								<div className='text-center md:text-left'>
									<p className='text-foreground text-2xl font-bold md:text-3xl'>
										{departureTime}
									</p>
									<p className='text-muted-foreground text-sm font-medium'>
										{departureDate}
									</p>
									<p className='text-muted-foreground/70 mt-1 text-xs'>
										{booking.departure_city} ({booking.departure_code})
									</p>
								</div>

								<div className='flex flex-1 items-center justify-center px-2'>
									<ArrowDown className='text-muted-foreground/50 h-5 w-5 md:hidden' />

									<div className='hidden w-full md:block'>
										<div className='bg-border relative mt-2 h-[2px] w-full'>
											<div className='bg-primary/50 absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full'></div>
											<div className='bg-primary/50 absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full'></div>
										</div>
									</div>
								</div>

								<div className='text-center md:text-right'>
									<p className='text-foreground text-2xl font-bold md:text-3xl'>
										{arrivalTime}
									</p>
									<p className='text-muted-foreground text-sm font-medium'>
										{arrivalDate}
									</p>
									<p className='text-muted-foreground/70 mt-1 text-xs'>
										{booking.arrival_city} ({booking.arrival_code})
									</p>
								</div>
							</div>
						</div>
					</section>

					<section>
						<div className='text-foreground mb-4 flex items-center gap-2'>
							<User className='text-primary h-5 w-5' />
							<h3 className='text-lg font-semibold'>Пассажир</h3>
						</div>

						<div className='border-border bg-muted/20 grid grid-cols-1 gap-6 rounded-lg border p-4 sm:grid-cols-2'>
							<div>
								<p className='text-muted-foreground mb-1 text-xs'>
									Фамилия Имя Отчество
								</p>
								<p className='text-foreground font-medium'>
									{booking.last_name} {booking.first_name} {booking.middle_name}
								</p>
							</div>
							<div>
								<p className='text-muted-foreground mb-1 text-xs'>
									{documentLabel}
								</p>
								<p className='text-foreground font-medium'>
									{fullDocumentNumber}
								</p>
							</div>
						</div>
					</section>

					<section>
						<div className='text-foreground mb-4 flex items-center gap-2'>
							<CreditCard className='text-primary h-5 w-5' />
							<h3 className='text-lg font-semibold'>Оплата и услуги</h3>
						</div>
						<div className='flex flex-col gap-3'>
							<div className='border-border bg-card flex items-center justify-between rounded-lg border p-4'>
								<span className='text-muted-foreground'>Стоимость билета</span>
								<span className='text-foreground text-xl font-bold'>
									{parseInt(booking.base_price).toLocaleString('ru-RU')} ₽
								</span>
							</div>

							<div className='border-primary/20 bg-primary/5 flex items-center justify-between rounded-lg border p-4'>
								<span className='text-muted-foreground'>Багаж</span>
								<span className='text-primary font-medium'>
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

				{isConfirmed ? (
					<CardFooter className='border-border bg-muted/40 flex flex-col items-center gap-4 border-t p-6 sm:flex-row sm:justify-between'>
						<div
							className={`w-full rounded-full border px-4 py-1.5 text-center text-sm font-medium sm:w-fit ${statusClasses}`}
						>
							{statusLabel}
						</div>
						<CancelBookingButton bookingId={booking.booking_id} />
					</CardFooter>
				) : (
					<CardFooter className='border-border bg-muted/40 flex justify-start border-t p-6'>
						<div
							className={`w-fit rounded-full border px-4 py-1.5 text-sm font-medium ${statusClasses}`}
						>
							{statusLabel}
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	)
}
