import { getAllSchedules } from '@/lib/data'
import { deleteSchedule } from '@/lib/actions' // Импортируем для bind в форме (мобилка)
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
	ArrowRight,
	CalendarDays,
	Clock,
	Plane,
	Pencil,
	Trash2
} from 'lucide-react'
import { ScheduleActions } from '@/components/custom-ui/admin/ScheduleActions' // <--- НАШ НОВЫЙ КОМПОНЕНТ

// ... функция formatDaysOfWeek ...
function formatDaysOfWeek(days: number[]) {
	const dayMap = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
	if (days.length === 7) return 'Ежедневно'
	return days.map(day => dayMap[day - 1]).join(', ')
}

export default async function SchedulePage() {
	const schedules = await getAllSchedules()

	return (
		<div className='container mx-auto max-w-7xl px-4 py-6 md:py-10'>
			{/* ... Заголовок ... */}
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold md:text-3xl'>
						Управление расписаниями
					</h1>
					<p className='text-muted-foreground text-sm'>
						Всего рейсов: {schedules.length}
					</p>
				</div>
				<Button
					asChild
					className='w-full sm:w-auto'
				>
					<Link href='/admin/schedules/new'>Добавить расписание</Link>
				</Button>
			</div>

			{/* --- МОБИЛЬНАЯ ВЕРСИЯ (Карточки) --- */}
			<div className='grid gap-4 md:hidden'>
				{schedules.map(schedule => (
					<Card
						key={schedule.schedule_id}
						className='border-l-primary overflow-hidden border-l-4'
					>
						{/* ... Header и Content карточки как было ... */}
						<CardHeader className='pb-3'>
							<div className='flex items-center justify-between'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Plane className='h-4 w-4' />
									{schedule.flight_number}
								</CardTitle>
								<span className='text-muted-foreground font-mono text-xs'>
									ID: {schedule.schedule_id}
								</span>
							</div>
							<CardDescription className='text-foreground flex items-center gap-2 font-medium'>
								{schedule.departure_city}
								<ArrowRight className='text-muted-foreground h-3 w-3' />
								{schedule.arrival_city}
							</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-4 text-sm'>
							{/* ... время и дни ... */}
							<div className='bg-muted/50 flex justify-between rounded-md p-2'>
								<div className='flex flex-col'>
									<span className='text-muted-foreground text-xs'>Вылет</span>
									<span className='font-bold'>{schedule.departure_time}</span>
								</div>
								<div className='flex flex-col text-right'>
									<span className='text-muted-foreground text-xs'>Прилет</span>
									<span className='font-bold'>{schedule.arrival_time}</span>
								</div>
							</div>
							<div className='flex items-start gap-2'>
								<CalendarDays className='text-muted-foreground mt-0.5 h-4 w-4' />
								<div className='flex flex-col'>
									<span className='text-muted-foreground text-xs'>
										Дни выполнения:
									</span>
									<span>{formatDaysOfWeek(schedule.days_of_week)}</span>
								</div>
							</div>

							{/* --- КНОПКИ ДЕЙСТВИЙ (МОБИЛЬНЫЕ) --- */}
							<div className='flex gap-2 pt-2'>
								{/* Кнопка Изменить */}
								<Button
									variant='outline'
									size='sm'
									className='flex-1'
									asChild
								>
									<Link href={`/admin/schedules/${schedule.schedule_id}`}>
										<Pencil className='mr-2 h-3.5 w-3.5' />
										Изменить
									</Link>
								</Button>

								{/* Кнопка Удалить (используем тот же ScheduleActions, но стилизуем или простое удаление) */}
								{/* Для простоты на мобильных можно использовать тот же ScheduleActions, но он скроется в три точки. */}
								{/* Либо, для лучшего UX, используем Server Action напрямую через форму (без подтверждения, или лучше тоже через компонент) */}
								<div className='flex-shrink-0'>
									<ScheduleActions scheduleId={schedule.schedule_id} />
								</div>
							</div>
							{/* Если вы хотите большие кнопки на мобилке, нужно сделать отдельный компонент DeleteButton,
                                но использование ScheduleActions (три точки) справа от "Изменить" тоже норм вариант.
                                Я оставил кнопку "Изменить" большой, а удаление и прочее спрятал в "..." справа.
                            */}
						</CardContent>
					</Card>
				))}
			</div>

			{/* --- ДЕСКТОПНАЯ ВЕРСИЯ (Таблица) --- */}
			<div className='bg-card hidden rounded-md border md:block'>
				<Table>
					{/* ... Header таблицы ... */}
					<TableHeader>
						<TableRow>
							<TableHead className='w-[80px]'>ID</TableHead>
							<TableHead>Рейс</TableHead>
							<TableHead>Маршрут</TableHead>
							<TableHead>Время (Вылет - Прилет)</TableHead>
							<TableHead className='w-[30%]'>Дни выполнения</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{schedules.map(schedule => (
							<TableRow key={schedule.schedule_id}>
								{/* ... Ячейки с данными ... */}
								<TableCell className='text-muted-foreground font-medium'>
									{schedule.schedule_id}
								</TableCell>
								<TableCell className='font-bold'>
									{schedule.flight_number}
								</TableCell>
								<TableCell>
									<div className='flex flex-col'>
										<span className='font-medium'>
											{schedule.departure_city}
										</span>
										<span className='text-muted-foreground text-xs'>to</span>
										<span className='font-medium'>{schedule.arrival_city}</span>
									</div>
								</TableCell>
								<TableCell>
									<div className='bg-muted/40 flex w-fit items-center gap-2 rounded-md px-2 py-1 whitespace-nowrap'>
										<Clock className='text-muted-foreground h-3 w-3' />
										<span className='font-medium'>
											{schedule.departure_time}
										</span>
										<ArrowRight className='text-muted-foreground/50 h-3 w-3' />
										<span className='font-medium'>{schedule.arrival_time}</span>
									</div>
								</TableCell>
								<TableCell className='text-muted-foreground text-sm'>
									{formatDaysOfWeek(schedule.days_of_week)}
								</TableCell>

								{/* --- ДЕЙСТВИЯ (ДЕСКТОП) --- */}
								<TableCell className='text-right'>
									<ScheduleActions scheduleId={schedule.schedule_id} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
