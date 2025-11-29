'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Briefcase } from 'lucide-react' // Добавил иконку для красоты

import { createBookingGroup } from '@/lib/actions'
import {
	bookingFormSchema,
	type BookingFormValues
} from '@/shared/schemas/booking.schema'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { PassengerCard } from '@/components/custom-ui/booking/PassengerCard'

interface Props {
	flightId: number
	initialCounts: { adults: number; children: number; infants: number }
	baggageOption: string
}

// Словарь для красивого отображения названия тарифа
const BAGGAGE_LABELS: Record<string, string> = {
	'no_baggage': 'Без багажа',
	'baggage_10': 'Багаж 10 кг',
	'baggage_20': 'Багаж 20 кг',
	// на случай если id отличаются
	'checked_20kg': 'Багаж 20 кг' 
}

export function BookingForm({ flightId, initialCounts, baggageOption }: Props) {
	const router = useRouter()

	const generateDefaultPassengers = () => {
		const adults = Array(initialCounts.adults)
			.fill(null)
			.map(() => ({
				type: 'adult' as const,
				firstName: '',
				lastName: '',
				middleName: '',
				hasNoMiddleName: false,
				birthDate: '',
				gender: undefined as 'male' | 'female' | undefined,
				documentType: 'passport_rf' as const,
				documentSeries: '',
				documentNumber: '',
				validUntil: undefined
			}))

		const children = Array(initialCounts.children)
			.fill(null)
			.map(() => ({
				type: 'child' as const,
				firstName: '',
				lastName: '',
				middleName: '',
				hasNoMiddleName: false,
				birthDate: '',
				gender: undefined as 'male' | 'female' | undefined,
				documentType: 'birth_certificate' as const,
				documentSeries: '',
				documentNumber: '',
				validUntil: undefined
			}))

		const infants = Array(initialCounts.infants)
			.fill(null)
			.map(() => ({
				type: 'infant' as const,
				firstName: '',
				lastName: '',
				middleName: '',
				hasNoMiddleName: false,
				birthDate: '',
				gender: undefined as 'male' | 'female' | undefined,
				documentType: 'birth_certificate' as const,
				documentSeries: '',
				documentNumber: '',
				validUntil: undefined
			}))

		return [...adults, ...children, ...infants]
	}

	const form = useForm<BookingFormValues>({
		resolver: zodResolver(bookingFormSchema),
		defaultValues: {
			flightId,
			passengers: generateDefaultPassengers()
		}
	})

	const { fields } = useFieldArray({
		control: form.control,
		name: 'passengers'
	})

	const { isSubmitting } = form.formState

	const onSubmit = useCallback(
		async (values: BookingFormValues) => {
			try {
				// --- ВАЖНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ---
				// Мы объединяем данные формы (пассажиры) и пропс (багаж)
				const payload = {
					...values,
					baggageOption: baggageOption // Передаем выбор в Server Action
				}

				const result = await createBookingGroup(payload)

				if (result.success) {
					toast.success(
						`Успешно забронировано ${result.ticketNumbers?.length ?? 1} билет(а)!`
					)
					form.reset()
					// Редирект в профиль или на страницу успеха
					setTimeout(() => router.push('/profile'), 2000) 
				} else {
					toast.error(result.error ?? 'Неизвестная ошибка при бронировании')
				}
			} catch (error) {
				console.error('Ошибка при бронировании:', error)
				toast.error('Не удалось выполнить бронирование. Попробуйте позже.')
			}
		},
		[form, router, baggageOption] // Добавили baggageOption в зависимости
	)

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8'
			>
				{fields.map((field, index) => (
					<PassengerCard
						key={field.id}
						control={form.control}
						getValues={form.getValues}
						index={index}
					/>
				))}

				{/* Панель с кнопкой и информацией о тарифе */}
				<div className='bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-4 z-10 rounded-xl border p-4 shadow-2xl backdrop-blur flex flex-col gap-3'>
					
					{/* Информационная плашка о выбранном багаже */}
					<div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-blue-900 border border-blue-100">
						<div className="flex items-center gap-2">
							<Briefcase className="h-4 w-4" />
							<span className="text-sm font-medium">
								Выбранный тариф: {BAGGAGE_LABELS[baggageOption] || 'Тариф не определен'}
							</span>
						</div>
					</div>

					<Button
						type='submit'
						size='lg'
						className='w-full text-lg font-medium'
						disabled={isSubmitting || fields.length === 0}
					>
						{isSubmitting
							? 'Оформляем бронирование...'
							: `Забронировать · ${fields.length} пассажир(ов)`}
					</Button>
				</div>
			</form>
		</Form>
	)
}