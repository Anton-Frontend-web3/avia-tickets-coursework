'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Импортируем серверные экшены
import { createSchedule, updateSchedule } from '@/lib/actions'
import { SelectOption } from '@/lib/data'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
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

// --- СХЕМА ВАЛИДАЦИИ (ZOD) ---
const formSchema = z.object({
	flight_number: z.string().min(3, 'Минимум 3 символа (напр. SU-100)'),
	departure_airport_id: z.string().min(1, 'Выберите аэропорт вылета'),
	arrival_airport_id: z.string().min(1, 'Выберите аэропорт прилета'),
	departure_time: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Формат ЧЧ:ММ'),
	arrival_time: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Формат ЧЧ:ММ'),
    // НОВОЕ ПОЛЕ:
    arrival_day_offset: z.string(), // "0", "1" или "2"
	days_of_week: z.array(z.string()).min(1, 'Выберите хотя бы один день')
})

type ScheduleFormValues = z.infer<typeof formSchema>

// Дни недели для чекбоксов
const DAYS = [
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
	initialData?: ScheduleFormValues
	isEditMode?: boolean
	scheduleId?: number
}

export function ScheduleForm({
	airports,
	initialData,
	isEditMode = false,
	scheduleId
}: ScheduleFormProps) {
	const [isPending, startTransition] = useTransition()

	const form = useForm<ScheduleFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData || {
			flight_number: '',
			departure_airport_id: '',
			arrival_airport_id: '',
			departure_time: '',
			arrival_time: '',
            arrival_day_offset: '0', // По умолчанию в тот же день
			days_of_week: []
		}
	})

	const onSubmit = (values: ScheduleFormValues) => {
		startTransition(async () => {
			let result

			if (isEditMode && scheduleId) {
				result = await updateSchedule(scheduleId, values)
			} else {
				result = await createSchedule(values)
			}

			if (result?.error) {
				toast.error(result.error)
			} else {
				toast.success(
					isEditMode ? 'Расписание обновлено!' : 'Расписание создано!'
				)
				if (!isEditMode) form.reset()
			}
		})
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-6'
			>
				{/* 1. Номер рейса */}
				<FormField
					control={form.control}
					name='flight_number'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Номер рейса</FormLabel>
							<FormControl>
								<Input
									placeholder='SU-1234'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className='grid gap-6 md:grid-cols-2'>
					{/* 2. Аэропорт вылета */}
					<FormField
						control={form.control}
						name='departure_airport_id'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Откуда</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Выберите аэропорт' />
										</SelectTrigger>
									</FormControl>
									<SelectContent className='max-h-[300px] w-[var(--radix-select-trigger-width)]'>
										{airports.map(airport => (
											<SelectItem
												key={airport.value}
												value={airport.value}
											>
												<span className='block truncate'>{airport.label}</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 3. Аэропорт прилета */}
					<FormField
						control={form.control}
						name='arrival_airport_id'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Куда</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Выберите аэропорт' />
										</SelectTrigger>
									</FormControl>
									<SelectContent className='max-h-[300px] w-[var(--radix-select-trigger-width)]'>
										{airports.map(airport => (
											<SelectItem
												key={airport.value}
												value={airport.value}
												disabled={
													airport.value === form.watch('departure_airport_id')
												}
											>
												<span className='block truncate'>{airport.label}</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='grid gap-6 md:grid-cols-3'>
					{/* 4. Время вылета */}
					<FormField
						control={form.control}
						name='departure_time'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Время вылета (местное)</FormLabel>
								<FormControl>
									<Input
										type='time'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 5. Время прилета */}
					<FormField
						control={form.control}
						name='arrival_time'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Время прилета (местное)</FormLabel>
								<FormControl>
									<Input
										type='time'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

                    {/* 6. Сдвиг дня прилета (НОВОЕ ПОЛЕ) */}
                    <FormField
						control={form.control}
						name='arrival_day_offset'
						render={({ field }) => (
							<FormItem>
								<FormLabel>День прилета</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
                                    defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Выберите день' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="0">В тот же день</SelectItem>
                                        <SelectItem value="1">На следующий день (+1)</SelectItem>
                                        <SelectItem value="2">Через 2 дня (+2)</SelectItem>
                                        <SelectItem value="-1">Предыдущий день (-1)</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* 7. Дни недели */}
				<FormField
					control={form.control}
					name='days_of_week'
					render={() => (
						<FormItem>
							<div className='mb-4'>
								<FormLabel className='text-base'>Дни выполнения</FormLabel>
								<FormDescription>
									Выберите дни, по которым выполняется рейс.
								</FormDescription>
							</div>
							<div className='flex flex-wrap gap-x-6 gap-y-3'>
								{DAYS.map(day => (
									<FormField
										key={day.id}
										control={form.control}
										name='days_of_week'
										render={({ field }) => {
											return (
												<FormItem
													key={day.id}
													className='flex flex-row items-center space-y-0 space-x-2'
												>
													<FormControl>
														<Checkbox
															checked={field.value?.includes(day.id)}
															onCheckedChange={checked => {
																return checked
																	? field.onChange([...field.value, day.id])
																	: field.onChange(
																			field.value?.filter(
																				value => value !== day.id
																			)
																		)
															}}
														/>
													</FormControl>
													<FormLabel className='cursor-pointer font-normal'>
														{day.label}
													</FormLabel>
												</FormItem>
											)
										}}
									/>
								))}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type='submit'
					disabled={isPending}
					className='w-full md:w-auto'
				>
					{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					{isEditMode ? 'Сохранить изменения' : 'Создать расписание'}
				</Button>
			</form>
		</Form>
	)
}