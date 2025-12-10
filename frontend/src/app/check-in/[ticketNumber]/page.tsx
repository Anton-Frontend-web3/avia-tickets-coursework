import { notFound, redirect } from 'next/navigation'
import { getCheckInSession } from '@/lib/data'
import { getCheckInStatus } from '@/lib/utils'
import { GroupCheckInSeatMap } from '@/components/custom-ui/check-in/GroupCheckInSeatMap'

interface PageProps {
	params: Promise<{ ticketNumber: string }>
}

export default async function CheckInSeatSelectionPage({ params }: PageProps) {
	const { ticketNumber } = await params

	const session = await getCheckInSession(ticketNumber)
	if (!session) notFound()

	const allCheckedIn = session.passengers.every(
		(p: any) => p.check_in_status === 'Checked-in'
	)
	if (allCheckedIn) {
		redirect(`/check-in/success?ticket=${ticketNumber}`)
	}

	const timeStatus = getCheckInStatus(session.flight.departure_datetime)
	if (!timeStatus.isOpen) {
		return (
			<div className='p-10 text-center text-red-500'>{timeStatus.message}</div>
		)
	}

	return (
		<div className='container mx-auto max-w-6xl py-8'>
			<h1 className='mb-6 text-2xl font-bold'>Выбор мест</h1>

			<GroupCheckInSeatMap
				layout={session.flight.seat_map}
				occupiedSeats={session.occupiedSeats}
				passengers={session.passengers}
			/>
		</div>
	)
}
