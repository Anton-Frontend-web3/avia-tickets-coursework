'use client'
import PassengerList from '@/components/custom-ui/chech-inAgent/ListPassengers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IPassengerCheck } from '@/shared/types/pessenger.type'
import { useCallback, useEffect, useState } from 'react'

export default function ListPassengersPage() {
	const [flightIdInput, setFlightIdInput] = useState('')
	const [searchedFlightId, setSearchedFlightId] = useState<string | null>(null)
	const [passengers, setPassengers] = useState<IPassengerCheck[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const handleSearch = useCallback(async () => {
		if (!searchedFlightId) return

		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(
				`/api/flights/${searchedFlightId}/passengers`,
				{ cache: 'no-store' }
			)
			if (!response.ok) {
				throw new Error('Рейс не найден или произошла ошибка.')
			}
			const data = await response.json()
			setPassengers(data)
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message)
			} else {
				setError('Произошла неизвестная ошибка.')
			}
		} finally {
			setIsLoading(false)
		}
	}, [searchedFlightId])

	const onSearchClick = () => {
		if (!flightIdInput.trim()) {
			setError('Пожалуйста, введите ID рейса.')
			return
		}
		setSearchedFlightId(flightIdInput)
	}

	useEffect(() => {
		handleSearch()
	}, [handleSearch])

	const renderContent = () => {
		if (isLoading) {
			return <p>Загрузка...</p>
		}
		if (error) {
			return <p>Ошибка: {error}</p>
		}
		if (passengers.length > 0) {
			return (
				<PassengerList
					passengers={passengers}
					onStatusChange={handleSearch}
				/>
			)
		} else {
			return <p>Пассажиры на данный рейс не найдены или ID рейса не введен.</p>
		}
	}

	return (
		<div>
			<h1>Регистрация пассажиров на рейс</h1>

			<div className='flex gap-3'>
				<Input
					value={flightIdInput}
					onChange={e => setFlightIdInput(e.target.value)}
					type='number'
					placeholder='ID рейса'
				/>
				<Button
					onClick={onSearchClick}
					disabled={isLoading}
				>
					{isLoading ? 'Поиск...' : 'Найти рейс'}
				</Button>
			</div>
			<div className='mt-8'>{renderContent()}</div>
		</div>
	)
}
