'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Search } from 'lucide-react'

import {
	checkInAuthSchema,
	CheckInAuthValues
} from '@/shared/schemas/seatRegister.schema'
import { findBookingForCheckIn } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

export default function CheckInPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<CheckInAuthValues>({
		resolver: zodResolver(checkInAuthSchema),
		defaultValues: {
			ticketNumber: '',
			lastName: ''
		}
	})

	async function onSubmit(values: CheckInAuthValues) {
		setIsLoading(true)
		try {
			// Server Action возвращает теперь redirectTicket
			const result: any = await findBookingForCheckIn(values)

			if (result.error) {
				toast.error(result.error)
				return
			}

			if (result.success) {
				toast.success('Бронирование найдено!')

				const targetTicket = result.redirectTicket || values.ticketNumber

				router.push(`/check-in/${targetTicket}`)
			}
		} catch (e) {
			toast.error('Произошла ошибка')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-[80vh] items-center justify-center p-4'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-center text-2xl font-bold'>
						Онлайн-регистрация
					</CardTitle>
					<CardDescription className='text-center'>
						Введите данные бронирования для поиска рейса
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-4'
						>
							<FormField
								control={form.control}
								name='ticketNumber'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Номер билета</FormLabel>
										<FormControl>
											<Input
												placeholder='TKT-XXXXXX'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='lastName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Фамилия пассажира</FormLabel>
										<FormControl>
											<Input
												placeholder='Иванов'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								className='w-full'
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Поиск...
									</>
								) : (
									<>
										<Search className='mr-2 h-4 w-4' />
										Найти бронирование
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
