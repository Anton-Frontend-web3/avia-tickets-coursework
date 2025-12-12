import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { getBookingsByUserId } from '@/lib/data'
import { FlightList } from '@/components/custom-ui/flights/FlightList'
import { IFlight } from '../search/page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plane, CalendarCheck, CalendarX, History } from 'lucide-react'

import {parseDate} from '@/lib/utils'


function EmptyState({ message, icon: Icon }: { message: string, icon: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Icon className="h-10 w-10 mb-4 opacity-50" />
            <p>{message}</p>
        </div>
    )
}

export default async function ProfilePage() {
	const session = await getServerSession(authOptions)

	if (!session || !session.user || !session.user.id) {
		redirect('/login')
	}

	const bookings = await getBookingsByUserId(session.user.id)
    const now = new Date()

    // 1. БУДУЩИЕ
    const upcoming = bookings
        .filter((b: any) => {
            const flightDate = parseDate(b.departure_datetime);
            return b.status === 'Confirmed' && flightDate > now;
        })
        .sort((a: any, b: any) => parseDate(a.departure_datetime).getTime() - parseDate(b.departure_datetime).getTime())

    // 2. ПРОШЕДШИЕ
    const past = bookings
        .filter((b: any) => {
            const flightDate = parseDate(b.departure_datetime);
            // Либо дата уже прошла, либо статус не Confirmed (но и не Cancelled, например Arrived, если бы он был)
            // В вашем случае проверяем только дату и Confirmed
            return b.status === 'Confirmed' && flightDate <= now;
        })
        .sort((a: any, b: any) => parseDate(b.departure_datetime).getTime() - parseDate(a.departure_datetime).getTime())

    // 3. ОТМЕНЕННЫЕ
    const cancelled = bookings
        .filter((b: any) => b.status === 'Cancelled')
        .sort((a: any, b: any) => new Date(b.booking_datetime).getTime() - new Date(a.booking_datetime).getTime())

		return (
			<div className="container mx-auto py-8 px-4 max-w-4xl">
				<div className='mb-8'>
					<h1 className='text-3xl font-bold'>Личный кабинет</h1>
					<p className='text-muted-foreground'>
						Добро пожаловать, {session.user.email}!
					</p>
				</div>
	
				{bookings.length === 0 ? (
					 <EmptyState message="У вас пока нет ни одного бронирования." icon={Plane} />
				) : (
					<Tabs defaultValue="upcoming" className="w-full">
  <TabsList className="grid w-full grid-cols-3 mb-4">
    <TabsTrigger value="upcoming" className="gap-1 sm:gap-2">
      <CalendarCheck className="h-4 w-4 hidden sm:block" />
      Предстоящие
    </TabsTrigger>
    <TabsTrigger value="past" className="gap-1 sm:gap-2">
      <History className="h-4 w-4 hidden sm:block" />
      Прошедшие
    </TabsTrigger>
    <TabsTrigger value="cancelled" className="gap-1 sm:gap-2">
      <CalendarX className="h-4 w-4 hidden sm:block" />
      Отмененные
    </TabsTrigger>
  </TabsList>

  <TabsContent value="upcoming" className="space-y-4">
    {upcoming.length > 0 ? (
      <FlightList flights={upcoming as IFlight[]} isLoading={false} isBooked={true} />
    ) : (
      <EmptyState message="Нет предстоящих рейсов." icon={Plane} />
    )}
  </TabsContent>

  <TabsContent value="past" className="space-y-4">
    {past.length > 0 ? (
      <div className="opacity-80">
        <FlightList flights={past as IFlight[]} isLoading={false} isBooked={true} />
      </div>
    ) : (
      <EmptyState message="История полетов пуста." icon={History} />
    )}
  </TabsContent>

  <TabsContent value="cancelled" className="space-y-4">
    {cancelled.length > 0 ? (
      <FlightList flights={cancelled as IFlight[]} isLoading={false} isBooked={true} />
    ) : (
      <EmptyState message="Нет отмененных бронирований." icon={CalendarX} />
    )}
  </TabsContent>
</Tabs>
				)}
			</div>
		)
	}