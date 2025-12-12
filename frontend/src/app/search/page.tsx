


import { Suspense } from 'react'
import InputQueryFormClient from '@/components/custom-ui/search/InputQueryFormClient'
import { FlightList } from '@/components/custom-ui/flights/FlightList'
import { getFlights } from '@/lib/data'

export const dynamic = 'force-dynamic'
export interface IFlight {
  logo_url?: string | null
  flight_id: number
  flight_number: string
  departure_city: string
  arrival_city: string
  departure_datetime: string
  arrival_datetime: string
  base_price: string
  airline_name: string
  ticket_number?: string
  departure_timezone: string
  arrival_timezone: string
  departure_airport_name: string
  arrival_airport_name: string
  departure_code: string
  arrival_code: string
  duration_minutes: number
}

interface SearchPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    date?: string
    returnDate?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const { from, to, date, returnDate } = await searchParams
  
	let flights: IFlight[] = []
  
	if (from && to && date) {
	  try {
		flights = await getFlights(from, to, date, returnDate)
	  } catch (error) {
		console.error('Ошибка при получении рейсов:', error)
	  }
	}
  
	return (
	  <>
		<div className='mb-8'>
		  <Suspense fallback={null}>
			<InputQueryFormClient />
		  </Suspense>
		</div>
  
		<h2 className='mb-4 text-2xl font-bold'>Найденные рейсы</h2>
  
		<FlightList flights={flights} isLoading={false} />
	  </>
	)
  }