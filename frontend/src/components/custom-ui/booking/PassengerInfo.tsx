'use client'

import { Control, useWatch, useFormContext } from 'react-hook-form' // <--- 1. Импортируем useFormContext
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BookingFormValues } from '@/shared/schemas/booking.schema'

interface Props {
	control: Control<BookingFormValues>
	index: number
}

export function PassengerInfo({ control, index }: Props) {
	// 2. Достаем setValue из контекста формы
	const { setValue } = useFormContext<BookingFormValues>()

	const hasNoMiddleName = useWatch({
		control,
		name: `passengers.${index}.hasNoMiddleName`
	})

	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
			{/* Фамилия */}
			<FormField
				control={control}
				name={`passengers.${index}.lastName`}
				render={({ field }) => (
					<FormItem className='relative'>
						<FormLabel>Фамилия</FormLabel>
						<FormControl>
							<Input
								placeholder='Иванов'
								{...field}
							/>
						</FormControl>
						<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
					</FormItem>
				)}
			/>

			{/* Имя */}
			<FormField
				control={control}
				name={`passengers.${index}.firstName`}
				render={({ field }) => (
					<FormItem className='relative'>
						<FormLabel>Имя</FormLabel>
						<FormControl>
							<Input
								placeholder='Иван'
								{...field}
							/>
						</FormControl>
						<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
					</FormItem>
				)}
			/>

			{/* Отчество и Свитч */}
			<>
				<FormField
					control={control}
					name={`passengers.${index}.middleName`}
					render={({ field }) => (
						<FormItem className='relative'>
							<FormLabel>Отчество</FormLabel>
							<FormControl>
								<Input
									placeholder='Иванович'
									{...field}
									disabled={hasNoMiddleName}
									// Важно: если значение null/undefined, ставим пустую строку, чтобы React не ругался
									value={field.value || ''}
								/>
							</FormControl>
							<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name={`passengers.${index}.hasNoMiddleName`}
					render={({ field }) => (
						<FormItem className='flex flex-row items-center gap-2 pt-9'>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={checked => {
										// 3. Обновляем сам свитч
										field.onChange(checked)

										// 4. Если свитч ВКЛЮЧЕН (checked === true), очищаем отчество
										if (checked) {
											setValue(`passengers.${index}.middleName`, '', {
												shouldValidate: true, // Убираем ошибки валидации, если они были
												shouldDirty: true
											})
										}
									}}
								/>
							</FormControl>
							<FormLabel className='text-muted-foreground !mt-0 text-sm'>
								Нет отчества
							</FormLabel>
						</FormItem>
					)}
				/>
			</>

			{/* Дата рождения */}
			<FormField
				control={control}
				name={`passengers.${index}.birthDate`}
				render={({ field }) => (
					<FormItem className='relative'>
						<FormLabel>Дата рождения</FormLabel>
						<FormControl>
							<Input
								type='date'
								max={new Date().toISOString().split('T')[0]}
								{...field}
							/>
						</FormControl>
						<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
					</FormItem>
				)}
			/>

			{/* Пол */}
			<FormField
				control={control}
				name={`passengers.${index}.gender`}
				render={({ field }) => (
					<FormItem className='relative'>
						<FormLabel>Пол</FormLabel>
						<FormControl>
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className='flex gap-4 pt-2'
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem
										value='male'
										id={`m-${index}`}
									/>
									<label htmlFor={`m-${index}`}>Мужской</label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem
										value='female'
										id={`f-${index}`}
									/>
									<label htmlFor={`f-${index}`}>Женский</label>
								</div>
							</RadioGroup>
						</FormControl>
						<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
					</FormItem>
				)}
			/>
		</div>
	)
}
