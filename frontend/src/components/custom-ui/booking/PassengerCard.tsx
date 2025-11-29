'use client'

import { Control, UseFormGetValues } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingFormValues } from '@/shared/schemas/booking.schema'
import { PassengerInfo } from '@/components/custom-ui/booking/PassengerInfo'
import { PassengerDocs } from '@/components/custom-ui/booking/PassengerDocs'

interface Props {
	control: Control<BookingFormValues>
	getValues: UseFormGetValues<BookingFormValues> // Нужно для получения типа пассажира
	index: number
}

export function PassengerCard({ control, getValues, index }: Props) {
	// Получаем тип (adult/child) для заголовка
	const type = getValues(`passengers.${index}.type`)
	const title = type === 'adult' ? 'Взрослый' : 'Ребенок'
	const badgeVariant = type === 'adult' ? 'default' : 'secondary'

	return (
		<Card className='border-l-4 border-l-blue-500 shadow-sm'>
			<CardHeader className='pb-2'>
				<CardTitle className='flex items-center gap-3 text-lg'>
					{title} {index + 1}
					<Badge
						variant={badgeVariant}
						className='text-xs font-normal'
					>
						{type === 'adult' ? 'Старше 12 лет' : 'До 12 лет'}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<PassengerInfo
					control={control}
					index={index}
				/>
				<PassengerDocs index={index} />
			</CardContent>
		</Card>
	)
}
