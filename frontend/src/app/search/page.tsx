'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import InputQueryForm from '@/components/custom-ui/InputQueryForm'
// Давайте предположим, что у вас будут эти компоненты
import { FlightList } from '@/components/custom-ui/FlightList'
import { SkeletonLoader } from '@/components/custom-ui/SkeletonLoader'

// Определяем тип для наших рейсов. TypeScript будет нам помогать.
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
}

export default function SearchPage() {
	const [flights, setFlights] = useState<IFlight[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const searchParams = useSearchParams()

	useEffect(() => {
		const from = searchParams.get('from')
		const to = searchParams.get('to')
		const date = searchParams.get('date')

		if (from && to && date) {
			const fetchFlights = async () => {
				try {
					setIsLoading(true)
					setError(null)

					const queryParams = new URLSearchParams({ from, to, date })
					const response = await fetch(
						`/api/flights/search?${queryParams.toString()}`
					)

					if (!response.ok) {
						throw new Error('Не удалось загрузить рейсы. Попробуйте позже.')
					}

					const data: IFlight[] = await response.json()
					setFlights(data)
				} catch (err: unknown) {
					if (err instanceof Error) {
						setError(err.message)
					} else {
						setError('Произошла неизвестная ошибка.')
					}
				} finally {
					setIsLoading(false)
				}
			}

			fetchFlights()
		} else {
			setIsLoading(false)
		}
	}, [searchParams])

	const renderContent = () => {
		if (isLoading) {
			return <p>Загрузка...</p> // return <SkeletonLoader />;
		}

		if (error) {
			return <p className='text-red-500'>Ошибка: {error}</p>
		}
		return (
			<FlightList
				flights={flights}
				isLoading={isLoading}
			/>
		)
	}

	return (
		<>
			<div className='mb-8'>
				<InputQueryForm />
			</div>
			<h2 className='mb-4 text-2xl font-bold'>Найденные рейсы</h2>
			{renderContent()}
		</>
	)
}
