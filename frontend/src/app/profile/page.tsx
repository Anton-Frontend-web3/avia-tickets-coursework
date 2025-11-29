import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { getBookingsByUserId } from '@/lib/data'
import { FlightList } from '@/components/custom-ui/FlightList'
import { IFlight } from '../search/page'

export default async function ProfilePage() {
	const session = await getServerSession(authOptions)

	if (!session || !session.user) {
		redirect('/login')
	}

	const bookings = await getBookingsByUserId(session.user.id)

	return (
		<div>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Личный кабинет</h1>
				<p className='text-muted-foreground'>
					Добро пожаловать, {session.user.email}!
				</p>
				{/* Здесь в будущем будет кнопка "Выйти" */}
			</div>

			<h2 className='mb-4 text-2xl font-bold'>Ваши бронирования</h2>

			<FlightList
				flights={bookings as IFlight[]} // Приводим тип, т.к. структура похожа
				isLoading={false}
				isBooked={true}
			/>
		</div>
	)
}
