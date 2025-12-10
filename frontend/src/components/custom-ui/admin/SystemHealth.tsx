'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Database, Server, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemHealthProps {
	data: {
		status: string
		latency: number
		activeConnections: number
		version: string
		uptime: number
	}
}

function formatUptime(seconds: number) {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	if (h > 0) return `${h}ч ${m}м`
	return `${m}м`
}

export function SystemHealth({ data }: SystemHealthProps) {
	const isOnline = data.status === 'online'

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{/* Статус и Пинг */}
			<Card
				className={cn(
					'border-l-4',
					isOnline ? 'border-l-green-500' : 'border-l-red-500'
				)}
			>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Статус системы</CardTitle>
					<Activity
						className={cn(
							'h-4 w-4',
							isOnline ? 'text-green-500' : 'text-red-500'
						)}
					/>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-2 text-2xl font-bold'>
						{isOnline ? 'Online' : 'Offline'}
						{isOnline && (
							<span className='text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs font-normal'>
								{data.latency} ms
							</span>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Подключения к БД */}
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>PostgreSQL</CardTitle>
					<Database className='text-muted-foreground h-4 w-4' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{data.activeConnections}</div>
					<p className='text-muted-foreground text-xs'>
						Активных соединений (v{data.version})
					</p>
				</CardContent>
			</Card>

			{/* Uptime */}
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Время работы</CardTitle>
					<Clock className='text-muted-foreground h-4 w-4' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{formatUptime(data.uptime)}</div>
					<p className='text-muted-foreground text-xs'>Без перезагрузки</p>
				</CardContent>
			</Card>

			{/* Сервер (можно вывести окружение) */}
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Окружение</CardTitle>
					<Server className='text-muted-foreground h-4 w-4' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold uppercase'>
						{process.env.NODE_ENV || 'Dev'}
					</div>
					<p className='text-muted-foreground text-xs'>Режим работы</p>
				</CardContent>
			</Card>
		</div>
	)
}
