import { getAllSchedules } from '@/lib/data'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function formatDaysOfWeek(days: number[]) {
	const dayMap = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
	if (days.length === 7) return 'Ежедневно'
	return days.map(day => dayMap[day - 1]).join(', ')
}

export default async function SchedulePage() {
	const schedules = await getAllSchedules()

	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Управление расписаниями</h1>
				<Button asChild>
					<Link href='/admin/schedules/new'>Добавить расписание</Link>
				</Button>
			</div>
			<Table>
				<TableCaption>Полный список регулярных рейсов.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[100px]'>ID</TableHead>
						<TableHead>Номер рейса</TableHead>
						<TableHead>Откуда</TableHead>
						<TableHead>Куда</TableHead>
						<TableHead>Время вылета</TableHead>
						<TableHead>Время прилета</TableHead>
						<TableHead>Дни выполнения</TableHead>
						<TableHead className='text-right'>Действия</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{schedules.map(schedule => (
						<TableRow key={schedule.schedule_id}>
							<TableCell className='font-medium'>
								{schedule.schedule_id}
							</TableCell>
							<TableCell>{schedule.flight_number}</TableCell>
							<TableCell>{schedule.departure_city}</TableCell>
							<TableCell>{schedule.arrival_city}</TableCell>
							<TableCell>{schedule.departure_time}</TableCell>
							<TableCell>{schedule.arrival_time}</TableCell>
							<TableCell>{formatDaysOfWeek(schedule.days_of_week)}</TableCell>
							<TableCell className='text-right'>
								{/* Здесь будут кнопки "Редактировать" и "Удалить" */}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
