import { ScheduleForm } from '@/components/custom-ui/ScheduleForm'
import { getAirportsForSelect } from '@/lib/data'

// 1. Делаем компонент страницы АСИНХРОННЫМ
export default async function NewSchedulePage() {
	// 2. "ДОЖИДАЕМСЯ" (await) выполнения "обещания"
	const airports = await getAirportsForSelect()

	return (
		<div>
			<h1 className='mb-6 text-3xl font-bold'>Новое расписание</h1>
			{/* 3. Теперь в `airports` лежит реальный массив, а не Promise */}
			<ScheduleForm airports={airports} />
		</div>
	)
}
