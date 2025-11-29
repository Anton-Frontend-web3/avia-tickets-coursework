'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { useCities } from '@/hooks/use-cites'
import { CityComboBox } from './CityComboBox'
import { DatePicker } from './DatePicker'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { memo } from 'react'

import { PassengerSelector, PassengerCounts } from './PassengerSelector'
const formSchema = z.object({
	from: z.string().min(1, 'Выберите город вылета.'),

	to: z.string().min(1, 'Выберите город прилета.'),

	date: z.date({
		error: 'Выберите дату.'
	}),
	passengers: z.object({
		adults: z.number().min(1),
		children: z.number().min(0),
		infants: z.number().min(0)
	})
})

function InputQueryForm() {
	const { cities, isLoading } = useCities()
	const router = useRouter()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			from: '',
			to: '',
			date: undefined,
			passengers: {
				adults: 1,
				children: 0,
				infants: 0
			}
		}
	})
	function onSubmit(values: z.infer<typeof formSchema>) {
		const queryParams = new URLSearchParams({
			from: values.from,
			to: values.to,
			date: format(values.date, 'yyyy-MM-dd'),
			// ПЕРЕДАЕМ КАЖДЫЙ ТИП ОТДЕЛЬНО
			adults: values.passengers.adults.toString(),
			children: values.passengers.children.toString(),
			infants: values.passengers.infants.toString()
		})
		router.push(`/search?${queryParams.toString()}`)
	}

	return (
		<Form {...form}>
			{/* --- ИЗМЕНЕНИЯ ЗДЕСЬ --- */}
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				// 1. По умолчанию - вертикальная сетка, 1 колонка.
				// 2. На lg экранах (1024px+) - переключаемся на сложный грид в ряд.
				className='grid grid-cols-1 items-end gap-6 pb-6 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]'
			>
				<FormField
					control={form.control}
					name='from'
					render={({ field }) => (
						// Убираем жесткую ширину. `grid` сам распределит место.
						<FormItem className='relative flex flex-col'>
							<FormLabel>Откуда</FormLabel>
							<CityComboBox
								cities={cities}
								isLoading={isLoading}
								value={field.value}
								onChange={field.onChange}
							/>
							<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='to'
					render={({ field }) => (
						<FormItem className='relative flex flex-col'>
							<FormLabel>Куда</FormLabel>
							<CityComboBox
								cities={cities}
								isLoading={isLoading}
								value={field.value}
								onChange={field.onChange}
							/>

							<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='date'
					render={({ field }) => (
						<FormItem className='relative flex flex-col'>
							<FormLabel>Когда</FormLabel>
							<DatePicker
								value={field.value}
								onChange={field.onChange}
								disablePastDates={true}
							/>
							<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='passengers'
					render={({ field }) => (
						<FormItem className='relative flex flex-col'>
							<FormLabel>Пассажиры</FormLabel>
							<PassengerSelector
								value={field.value}
								onChange={field.onChange}
							/>
							<FormMessage className='absolute top-full left-0 mt-1 text-xs' />
						</FormItem>
					)}
				/>

				{/* Кнопка тоже становится частью сетки */}
				<Button
					type='submit'
					className='w-full lg:w-auto'
				>
					Найти
				</Button>
			</form>
		</Form>
	)
}

export default memo(InputQueryForm)
