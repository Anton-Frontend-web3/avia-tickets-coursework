'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { createSchedule } from '@/lib/actions'
import { SelectOption } from '@/lib/data'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// Схема Zod, которую мы определили ранее
const scheduleSchema = z.object({
	flight_number: z.string().min(3, { message: 'Номер рейса обязателен.' }),

	departure_airport_id: z.string({ message: 'Выберите аэропорт вылета.' }),
	arrival_airport_id: z.string({ message: 'Выберите аэропорт прилета.' }),
	departure_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'Время в формате ЧЧ:ММ'
	}),
	arrival_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'Время в формате ЧЧ:ММ'
	}),
	days_of_week: z
		.array(z.string())
		.min(1, { message: 'Выберите хотя бы один день недели.' })
})

const daysOfWeek = [
	{ id: '1', label: 'Понедельник' },
	{ id: '2', label: 'Вторник' },
	{ id: '3', label: 'Среда' },
	{ id: '4', label: 'Четверг' },
	{ id: '5', label: 'Пятница' },
	{ id: '6', label: 'Суббота' },
	{ id: '7', label: 'Воскресенье' }
]

interface ScheduleFormProps {
	airports: SelectOption[]
}

export function ScheduleForm({ airports }: ScheduleFormProps) {
	const router = useRouter()
	const form = useForm<z.infer<typeof scheduleSchema>>({
		resolver: zodResolver(scheduleSchema),
		defaultValues: {
			flight_number: '',
			departure_airport_id: undefined,
			arrival_airport_id: undefined,
			departure_time: '',
			arrival_time: '',
			days_of_week: []
		}
	})

	const { isSubmitting } = form.formState

	async function onSubmit(values: z.infer<typeof scheduleSchema>) {
		const dataToSend = {
			...values,
			departure_airport_id: parseInt(values.departure_airport_id, 10),
			arrival_airport_id: parseInt(values.arrival_airport_id, 10)
		}

		const result = await createSchedule(dataToSend)

		if (result?.error) {
			toast.error('Ошибка создания', { description: result.error })
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='mx-auto max-w-2xl space-y-6'
			>
				<FormField
					control={form.control}
					name='flight_number'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Номер рейса</FormLabel>
							<Input
								placeholder='SU-001'
								{...field}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					<FormField
						control={form.control}
						name='departure_airport_id'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Аэропорт вылета</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Выберите аэропорт' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{airports.map(airport => (
											<SelectItem
												key={airport.value}
												value={airport.value}
											>
												{airport.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='arrival_airport_id'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Аэропорт прилета</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value?.toString()}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Выберите аэропорт' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{airports.map(airport => (
											<SelectItem
												key={airport.value}
												value={airport.value}
											>
												{airport.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					<FormField
						control={form.control}
						name='departure_time'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Время вылета</FormLabel>
								<Input
									type='time'
									{...field}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='arrival_time'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Время прилета</FormLabel>
								<Input
									type='time'
									{...field}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name='days_of_week'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Дни выполнения</FormLabel>
							<div className='grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4'>
								{daysOfWeek.map(day => (
									<FormField
										key={day.id}
										control={form.control}
										name='days_of_week'
										render={({ field }) => (
											<FormItem className='flex flex-row items-center space-y-0 space-x-3'>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(day.id)}
														onCheckedChange={checked => {
															return checked
																? field.onChange([
																		...(field.value || []),
																		day.id
																	])
																: field.onChange(
																		field.value?.filter(
																			value => value !== day.id
																		)
																	)
														}}
													/>
												</FormControl>
												<FormLabel className='font-normal'>
													{day.label}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type='submit'
					className='w-full'
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Создание...' : 'Создать расписание'}
				</Button>
			</form>
		</Form>
	)
}
