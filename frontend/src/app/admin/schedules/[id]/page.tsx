import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getScheduleById, getAirportsForSelect } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { ScheduleForm } from '@/components/custom-ui/admin/ScheduleForm' // Ваша форма

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function EditSchedulePage({ params }: PageProps) {
	// 1. Получаем ID из URL
	const { id } = await params
	const scheduleId = parseInt(id)

	if (isNaN(scheduleId)) return notFound()

	// 2. Параллельно загружаем данные расписания и список аэропортов
	const [schedule, airports] = await Promise.all([
		getScheduleById(scheduleId),
		getAirportsForSelect()
	])

	if (!schedule) {
		return notFound()
	}

	// 3. Подготавливаем начальные данные для формы
	// (Приводим типы из БД к формату формы, например days_of_week из number[] в string[])
	const initialData = {
		flight_number: schedule.flight_number,
		departure_airport_id: schedule.departure_airport_id.toString(),
		arrival_airport_id: schedule.arrival_airport_id.toString(),
		departure_time: schedule.departure_time.slice(0, 5), // Обрезаем секунды 12:00:00 -> 12:00
		arrival_time: schedule.arrival_time.slice(0, 5),
		days_of_week: schedule.days_of_week.map((d: number) => d.toString())
	}

	return (
		<div className='container mx-auto max-w-2xl px-4 py-10'>
			{/* Кнопка назад */}
			<div className='mb-6'>
				<Link href='/admin/schedules'>
					<Button
						variant='ghost'
						className='pl-0 hover:bg-transparent'
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Назад к списку
					</Button>
				</Link>
			</div>

			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Редактирование рейса</h1>
				<p className='text-muted-foreground'>
					Измените параметры регулярного рейса #{scheduleId}
				</p>
			</div>

			{/* 
                4. Рендерим форму.
                Важно: Ваш ScheduleForm должен уметь принимать:
                - initialData (для заполнения полей)
                - isEditMode (чтобы менять текст кнопки "Создать" на "Сохранить")
                - scheduleId (чтобы передать его в updateSchedule)
            */}
			<div className='bg-card rounded-xl border p-6 shadow-sm'>
				<ScheduleForm
					airports={airports}
					initialData={initialData}
					isEditMode={true}
					scheduleId={scheduleId}
				/>
			</div>
		</div>
	)
}
