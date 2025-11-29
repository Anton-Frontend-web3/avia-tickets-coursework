'use client'

import { Control, useWatch } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { BookingFormValues } from '@/shared/schemas/booking.schema'

interface MiddleNameSectionProps {
	control: Control<BookingFormValues>
}

export function MiddleNameSection({ control }: MiddleNameSectionProps) {
	const hasNoMiddleName = useWatch({
		control,
		name: 'hasNoMiddleName'
	})

	return (
		<>
			<FormField
				control={control}
				name='middleName'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Отчество</FormLabel>
						<FormControl>
							<Input
								placeholder='Иванович'
								{...field}
								disabled={hasNoMiddleName}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name='hasNoMiddleName'
				render={({ field }) => (
					<FormItem className='flex flex-row items-center justify-start gap-2 sm:pt-8'>
						<FormControl>
							<Switch
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
						</FormControl>
						<FormLabel className='!mt-0 text-sm font-normal text-gray-600'>
							Нет отчества в документе
						</FormLabel>
					</FormItem>
				)}
			/>
		</>
	)
}
