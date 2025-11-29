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

const formSchema = z.object({
	from: z.string().min(1, 'Please select your departure city.'),

	to: z.string().min(1, 'Please select the city of arrival.'),

	date: z.date({
		error: 'Please select a date.'
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
			date: undefined
		}
	})
	function onSubmit(values: z.infer<typeof formSchema>) {
		const queryParams = new URLSearchParams({
			from: values.from,
			to: values.to,
			date: format(values.date, 'yyyy-MM-dd')
		})
		router.push(`/search?${queryParams.toString()}`)
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='grid grid-cols-1 items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]'
			>
				<FormField
					control={form.control}
					name='from'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>From</FormLabel>
							<CityComboBox
								cities={cities}
								isLoading={isLoading}
								value={field.value}
								onChange={field.onChange}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='to'
					render={({ field }) => (
						<FormItem className='flex w-[200px] flex-col'>
							<FormLabel>To</FormLabel>
							<CityComboBox
								cities={cities}
								isLoading={isLoading}
								value={field.value}
								onChange={field.onChange}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='date'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Date</FormLabel>
							<DatePicker
								value={field.value}
								onChange={field.onChange}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
	)
}

export default memo(InputQueryForm)
