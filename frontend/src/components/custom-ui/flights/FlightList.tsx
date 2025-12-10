'use client'

import { IFlight } from '@/app/search/page'
import { FlightCard } from './FlightCard'
import { SkeletonLoader } from '../SkeletonLoader'
import { memo } from 'react'

interface FlightListProps {
	flights: IFlight[]
	isLoading: boolean
	isBooked?: boolean
}

function FlightListComponent({
	flights,
	isLoading,
	isBooked = false
}: FlightListProps) {
	if (isLoading) {
		return (
			<div className='flex flex-col gap-4'>
				<SkeletonLoader
					count={3}
					className='h-[160px] rounded-xl'
				/>
			</div>
		)
	}

	if (flights.length === 0) {
		return (
			<p className='mt-8 text-center text-gray-500'>
				По вашему запросу рейсы не найдены.
			</p>
		)
	}

	return (
		<div className='flex flex-col gap-4'>
			{flights.map((flight, index) => (
				<FlightCard
					flight={flight}
					key={flight.ticket_number || `${flight.flight_id}-${index}`}
					isBooked={isBooked}
				/>
			))}
		</div>
	)
}

export const FlightList = memo(FlightListComponent)
