import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
	getDashboardStats,
	getSalesChartData,
	getSystemHealth
} from '@/lib/data'


// Иконки
import {
	Users,
	CreditCard,
	PlaneTakeoff,
	CalendarClock,
	ArrowUpRight
} from 'lucide-react'

// Shadcn UI компоненты
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


// Наш новый компонент графика
import { OverviewChart } from '@/components/custom-ui/admin/OverviewChart'
import { SystemHealth } from '@/components/custom-ui/admin/SystemHealth'

export default async function AdminDashboardPage() {
	const session = await getServerSession(authOptions)

	// Запускаем запросы параллельно для скорости
	const [stats, chartData, health] = await Promise.all([
		getDashboardStats(),
		getSalesChartData(),
		getSystemHealth()
	])

	return (
		<div className='flex-1 space-y-8 p-8 pt-6'>
			{/* Заголовок */}
			<div className='flex items-center justify-between space-y-2'>
				<h2 className='text-3xl font-bold tracking-tight'>Панель управления</h2>
				<div className='flex items-center space-x-2'>
					<span className='text-muted-foreground text-sm'>
						Привет, {session?.user?.email}
					</span>
				</div>
			</div>
			<SystemHealth data={health} />
			{/* Блок карточек KPI */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Общая выручка</CardTitle>
						<CreditCard className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{stats.totalRevenue.toLocaleString('ru-RU')} ₽
						</div>
						<p className='text-muted-foreground text-xs'>
							+20.1% с прошлого месяца
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Бронирования</CardTitle>
						<Users className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>+{stats.totalBookings}</div>
						<p className='text-muted-foreground text-xs'>
							Всего подтвержденных билетов
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Предстоящие рейсы
						</CardTitle>
						<PlaneTakeoff className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.upcomingFlights}</div>
						<p className='text-muted-foreground text-xs'>
							Запланировано на будущее
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Активность</CardTitle>
						<CalendarClock className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>+573</div>
						<p className='text-muted-foreground text-xs'>Посещений за час</p>
					</CardContent>
				</Card>
			</div>

			{/* ОСНОВНОЙ КОНТЕНТ: График и Продажи */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				{/* ГРАФИК ВЫРУЧКИ (Занимает 4 колонки) */}
				<Card className='col-span-4'>
					<CardHeader>
						<CardTitle>Обзор выручки</CardTitle>
					</CardHeader>
					<CardContent className='pl-2'>
						<OverviewChart data={chartData} />
					</CardContent>
				</Card>

				{/* ПОСЛЕДНИЕ ПРОДАЖИ (Занимает 3 колонки) */}
				{/* Я перенес таблицу сюда, так как она логичнее смотрится рядом с графиком */}
				<Card className='col-span-3'>
					<CardHeader>
						<CardTitle>Недавние продажи</CardTitle>
						<p className='text-muted-foreground text-sm'>
							Последние 5 транзакций
						</p>
					</CardHeader>
					<CardContent>
						{/* Упрощенная таблица для боковой панели */}
						<div className='space-y-8'>
							{stats.recentBookings.map((booking: any) => (
								<div
									key={booking.booking_id}
									className='flex items-center'
								>
									<div className='space-y-1'>
										<p className='text-sm leading-none font-medium'>
											{booking.last_name} {booking.first_name}
										</p>
										<p className='text-muted-foreground text-sm'>
											{booking.ticket_number}
										</p>
									</div>
									<div className='ml-auto font-medium'>
										+{parseInt(booking.base_price).toLocaleString()}₽
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* БЫСТРЫЕ ДЕЙСТВИЯ (Нижний ряд) */}
		</div>
	)
}
