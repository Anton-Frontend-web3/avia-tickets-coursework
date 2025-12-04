import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, Home, Plane } from 'lucide-react'
import { pool } from '@/lib/db' // Убедитесь, что pool импортирован, если getBoardingPasses внутри файла
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateWithDay, formatTime } from '@/lib/utils'
import { PrintButton } from './PrintButton'

// 1. ОПИСЫВАЕМ ТИП ДАННЫХ
interface BoardingPassData {
    ticket_number: string;
    seat_number: string;
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

// (Если getBoardingPasses находится в этом же файле)
async function getBoardingPasses(ticketNumber: string): Promise<BoardingPassData[]> {
    const refRes = await pool.query(
        `SELECT booking_reference FROM Bookings WHERE ticket_number = $1`, 
        [ticketNumber]
    );
    
    if (refRes.rows.length === 0) return [];
    const { booking_reference } = refRes.rows[0];

    const res = await pool.query(`
        SELECT 
            b.ticket_number,
            b.seat_number,
            p.first_name, p.last_name,
            f.departure_datetime, f.arrival_datetime,
            dep.iata_code as dep_code, dep.city as dep_city,
            arr.iata_code as arr_code, arr.city as arr_city,
            s.flight_number,
            arl.name as airline
        FROM Bookings b
        JOIN Passengers p ON b.passenger_id = p.passenger_id
        JOIN Flights f ON b.flight_id = f.flight_id
        JOIN Schedules s ON f.schedule_id = s.schedule_id
        JOIN Airports dep ON s.departure_airport_id = dep.airport_id
        JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
        JOIN Aircrafts a ON f.aircraft_id = a.aircraft_id
        JOIN Airlines arl ON a.airline_id = arl.airline_id
        WHERE b.booking_reference = $1 AND b.check_in_status = 'Checked-in'
        ORDER BY p.last_name
    `, [booking_reference]);

    return res.rows as BoardingPassData[];
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
				<h1 className='text-2xl font-bold text-red-600'>
					Билеты не найдены или регистрация не завершена
				</h1>
				<Link href='/check-in'>
					<Button className='mt-4'>Вернуться</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className='flex min-h-screen flex-col items-center bg-gray-50 px-4 py-10 print:bg-white print:p-0'>
			<div className='mb-8 space-y-2 text-center print:hidden'>
				<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
					<CheckCircle className='h-8 w-8 text-green-600' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900'>
					Регистрация успешна!
				</h1>
				<p className='text-gray-500'>
					Места подтверждены для {passes.length} пассажиров.
				</p>
			</div>

            {/* 2. УБРАЛИ index, ЯВНО УКАЗАЛИ ТИП data */}
            <div className="flex flex-col gap-8 w-full max-w-2xl print:gap-4 print:w-full">
                {passes.map((data: BoardingPassData) => { 
                    const departureDate = formatDateWithDay(data.departure_datetime.toString())
                    const departureTime = formatTime(data.departure_datetime.toString())
                    const boardingTimeDate = new Date(new Date(data.departure_datetime).getTime() - 40 * 60000)
                    const boardingTime = formatTime(boardingTimeDate.toString())

                    return (
                        <Card key={data.ticket_number} className='overflow-hidden border-0 shadow-xl print:shadow-none print:border print:border-black print:mb-8 print:break-inside-avoid'>
                            {/* ... ВЕСЬ JSX КАРТОЧКИ (БЕЗ ИЗМЕНЕНИЙ) ... */}
                            <div className='flex items-center justify-between bg-blue-600 p-6 text-white print:bg-white print:text-black print:border-b'>
                                <div>
                                    <p className='text-sm opacity-80 print:opacity-100'>Посадочный талон</p>
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
                                        <p className='text-xs text-gray-500 uppercase'>Пассажир</p>
                                        <p className='text-lg font-bold truncate'>
                                            {data.last_name} {data.first_name}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500 uppercase'>Место</p>
                                        <p className='text-4xl font-black text-blue-600 print:text-black'>
                                            {data.seat_number}
                                        </p>
                                    </div>

                                    <div>
                                        <p className='text-xs text-gray-500 uppercase'>Откуда</p>
                                        <p className='text-2xl font-bold'>{data.dep_code}</p>
                                        <p className='text-sm text-gray-600'>{data.dep_city}</p>
                                    </div>
                                    <div className='flex items-center justify-center'>
                                        <Plane className='h-8 w-8 rotate-45 transform text-gray-300 print:text-black' />
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500 uppercase'>Куда</p>
                                        <p className='text-2xl font-bold'>{data.arr_code}</p>
                                        <p className='text-sm text-gray-600'>{data.arr_city}</p>
                                    </div>

                                    <div>
                                        <p className='text-xs text-gray-500 uppercase'>Дата</p>
                                        <p className='font-medium'>{departureDate}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase'>Посадка до</p>
                                        <p className='font-bold text-red-500 print:text-black'>{boardingTime}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500 uppercase'>Вылет</p>
                                        <p className='font-bold'>{departureTime}</p>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between border-t-2 border-dashed border-gray-300 bg-gray-50 p-6 print:bg-white'>
                                    <div className='space-y-1'>
                                        <p className='text-xs text-gray-500'>
                                            Билет № {data.ticket_number}
                                        </p>
                                        <div className='flex h-10 w-48 items-center justify-center bg-black/10 font-mono text-xs text-gray-400 print:border print:border-black print:bg-transparent'>
                                            ||| || ||| || |||
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-xs text-gray-500'>Зона</p>
                                        <p className='text-xl font-bold'>3</p>
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