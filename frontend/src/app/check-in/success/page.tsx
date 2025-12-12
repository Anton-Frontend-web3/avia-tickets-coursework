import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, Home, Plane } from 'lucide-react'
import { pool } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateWithDay, formatTime } from '@/lib/utils'
import { PrintButton } from './PrintButton'
import { getBoardingPasses } from '@/lib/data'

export interface BoardingPassData {
    ticket_number: string;
    seat_number: string | null;
    first_name: string;
    last_name: string;
    departure_datetime: Date;
    arrival_datetime: Date;
    dep_code: string;
    dep_city: string;
    arr_code: string;
    arr_city: string;
    flight_number: string;
    airline: string;
}

interface PageProps {
	searchParams: Promise<{ ticket: string }>
}

export default async function CheckInSuccessPage({ searchParams }: PageProps) {
	const { ticket } = await searchParams

	if (!ticket) return notFound()

	const passes = await getBoardingPasses(ticket)

	if (!passes || passes.length === 0) {
		return (
			<div className='container py-20 text-center'>
				<h1 className='text-destructive text-2xl font-bold'>
					Билеты не найдены или регистрация не завершена
				</h1>
				<Link href='/check-in'>
					<Button className='mt-4'>Вернуться</Button>
				</Link>
			</div>
		)
	}

	return (
		// bg-background: адаптируется под тему (белый/черный)
		<div className='bg-background flex min-h-screen flex-col items-center px-4 py-10 print:bg-white print:p-0'>
			<div className='mb-8 space-y-2 text-center print:hidden'>
				{/* Иконка успеха */}
				<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
					<CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
				</div>
				<h1 className='text-foreground text-3xl font-bold'>
					Регистрация успешна!
				</h1>
				<p className='text-muted-foreground'>
					Места подтверждены для {passes.length} пассажиров.
				</p>
			</div>

			<div className='flex w-full max-w-2xl flex-col gap-8 print:w-full print:gap-4'>
				{passes.map((data: BoardingPassData) => {
					const departureDate = formatDateWithDay(
						data.departure_datetime
					)
					const departureTime = formatTime(data.departure_datetime)
					const boardingTimeDate = new Date(
						new Date(data.departure_datetime).getTime() - 40 * 60000
					)
					const boardingTime = formatTime(boardingTimeDate)

					return (
						<Card
							key={data.ticket_number}
							// bg-card, border-border: адаптивные цвета карточки
							className='border-border bg-card overflow-hidden border shadow-xl print:mb-8 print:break-inside-avoid print:border print:border-black print:shadow-none'
						>
							{/* Шапка: bg-primary (синий в светлой, другой в темной) */}
							<div className='bg-primary text-primary-foreground flex items-center justify-between p-6 print:border-b print:bg-white print:text-black'>
								<div>
									<p className='text-sm opacity-80 print:opacity-100'>
										Посадочный талон
									</p>
									<p className='text-xl font-bold'>{data.airline}</p>
								</div>
								<div className='text-right'>
									<p className='text-sm opacity-80 print:opacity-100'>Рейс</p>
									<p className='text-xl font-bold'>{data.flight_number}</p>
								</div>
							</div>

							<CardContent className='p-0'>
								<div className='grid grid-cols-3 gap-6 p-6'>
									<div className='col-span-2'>
										<p className='text-muted-foreground text-xs uppercase'>
											Пассажир
										</p>
										<p className='text-foreground truncate text-lg font-bold'>
											{data.last_name} {data.first_name}
										</p>
									</div>
									<div className='text-right'>
										<p className='text-muted-foreground text-xs uppercase'>
											Место
										</p>
										{/* Если места нет (младенец), пишем прочерк */}
										<p className='text-primary text-4xl font-black print:text-black'>
											{data.seat_number || '---'}
										</p>
									</div>

									<div>
										<p className='text-muted-foreground text-xs uppercase'>
											Откуда
										</p>
										<p className='text-foreground text-2xl font-bold'>
											{data.dep_code}
										</p>
										<p className='text-muted-foreground text-sm'>
											{data.dep_city}
										</p>
									</div>
									<div className='flex items-center justify-center'>
										<Plane className='text-muted-foreground/30 h-8 w-8 rotate-45 transform print:text-black' />
									</div>
									<div className='text-right'>
										<p className='text-muted-foreground text-xs uppercase'>
											Куда
										</p>
										<p className='text-foreground text-2xl font-bold'>
											{data.arr_code}
										</p>
										<p className='text-muted-foreground text-sm'>
											{data.arr_city}
										</p>
									</div>

									<div>
										<p className='text-muted-foreground text-xs uppercase'>
											Дата
										</p>
										<p className='text-foreground font-medium'>
											{departureDate}
										</p>
									</div>
									<div>
										<p className='text-muted-foreground text-xs uppercase'>
											Посадка до
										</p>
										<p className='text-destructive font-bold print:text-black'>
											{boardingTime}
										</p>
									</div>
									<div className='text-right'>
										<p className='text-muted-foreground text-xs uppercase'>
											Вылет
										</p>
										<p className='text-foreground font-bold'>{departureTime}</p>
									</div>
								</div>

								{/* Отрывная часть */}
								<div className='border-border flex items-center justify-between border-t-2 border-dashed p-6 print:bg-white'>
									<div className='space-y-1'>
										<p className='text-muted-foreground text-xs'>
											Билет № {data.ticket_number}
										</p>
										{/* Имитация штрихкода */}
										<div className='bg-foreground/10 text-muted-foreground flex h-10 w-30 items-center justify-center font-mono text-xs print:border print:border-black print:bg-transparent'>
											||| || ||| || |
										</div>
									</div>
									<div className='text-right'>
										<p className='text-muted-foreground text-xs'>Зона</p>
										<p className='text-foreground text-xl font-bold'>3</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<div className='mt-8 flex gap-4 print:hidden'>
				<Link href='/'>
					<Button variant='outline'>
						<Home className='mr-2 h-4 w-4' /> На главную
					</Button>
				</Link>
				<PrintButton />
			</div>
		</div>
	)
}
