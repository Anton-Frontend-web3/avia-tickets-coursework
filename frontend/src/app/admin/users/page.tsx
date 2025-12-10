import Link from 'next/link'
import { ArrowLeft, Users as UsersIcon, Mail, Shield, Hash } from 'lucide-react'
import { getFilteredUsers } from '@/lib/data'
import { UserRoleSelect } from '@/components/custom-ui/admin/UserRoleSelect'
import { Search } from '@/components/custom-ui/admin/Search'
import { Pagination } from '@/components/custom-ui/admin/Pagination'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PageProps {
	searchParams: Promise<{
		query?: string
		page?: string
	}>
}

// Вспомогательная функция для стилей ролей (чтобы не дублировать код)
const getRoleBadgeStyles = (role: string) => {
	switch (role) {
		case 'admin':
			return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
		case 'agent':
			return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
	}
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
	const params = await searchParams
	const query = params.query || ''
	const currentPage = Number(params.page) || 1

	const { users, totalPages } = await getFilteredUsers(query, currentPage)

	return (
		// АДАПТИВ: px-2 для самых маленьких, px-4 для остальных
		<div className='container mx-auto max-w-5xl px-2 py-6 sm:px-4 sm:py-10'>
			<div className='mb-6'>
				<Link href='/admin'>
					<Button
						variant='ghost'
						className='pl-0 hover:bg-transparent'
					>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Назад к Дашборду
					</Button>
				</Link>
			</div>

			{/* АДАПТИВ: Заголовок и поиск в колонку на мобильных */}
			<div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
						Пользователи
					</h1>
					<p className='text-sm text-muted-foreground sm:text-base'>
						Управление ролями и доступом
					</p>
				</div>
				<div className='w-full md:w-auto'>
					<Search placeholder='Поиск по email...' />
				</div>
			</div>

			<Card className='border-0 px-2 shadow-none sm:border sm:shadow-sm'>
				<CardHeader className='px-0 sm:px-6'>
					<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
						<UsersIcon className='h-5 w-5' />
						Список аккаунтов
					</CardTitle>
				</CardHeader>
				<CardContent className='px-0 sm:px-6'>
					
					{/* --- МОБИЛЬНАЯ ВЕРСИЯ (Список карточек) --- */}
					{/* Видна только на экранах < 768px (md) */}
					<div className='flex flex-col  gap-4 md:hidden'>
						{users.length === 0 ? (
							<div className='py-8 text-center text-muted-foreground'>
								Пользователи не найдены.
							</div>
						) : (
							users.map((user: any) => (
								<div
									key={user.user_id}
									className='flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm'
								>
									{/* Верхняя часть карточки: ID и Роль */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-2 text-xs text-muted-foreground'>
											<Hash className='h-3 w-3' />
											<span className='font-mono'>{user.user_id}</span>
										</div>
										<span
											className={cn(
												'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
												getRoleBadgeStyles(user.role)
											)}
										>
											{user.role}
										</span>
									</div>

									{/* Email */}
									<div className='flex items-center gap-2'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										<span className='truncate font-medium'>{user.email}</span>
									</div>

									{/* Действие (смена роли) */}
									<div className='mt-2 flex items-center justify-between border-t pt-3'>
										<span className='flex items-center gap-2 text-sm text-muted-foreground'>
											<Shield className='h-3.5 w-3.5' />
											Права доступа:
										</span>
										<UserRoleSelect
											userId={user.user_id}
											currentRole={user.role}
										/>
									</div>
								</div>
							))
						)}
					</div>

					{/* --- ДЕСКТОПНАЯ ВЕРСИЯ (Таблица) --- */}
					{/* Скрыта на мобильных, видна от md и выше */}
					<div className='hidden md:block'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[80px]'>ID</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Текущая роль</TableHead>
									<TableHead className='text-right'>Действие</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className='h-24 text-center text-muted-foreground'
										>
											Пользователи не найдены.
										</TableCell>
									</TableRow>
								) : (
									users.map((user: any) => (
										<TableRow key={user.user_id}>
											<TableCell className='font-mono text-muted-foreground'>
												{user.user_id}
											</TableCell>
											<TableCell className='font-medium'>
												{user.email}
											</TableCell>
											<TableCell>
												<span
													className={cn(
														'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
														getRoleBadgeStyles(user.role)
													)}
												>
													{user.role}
												</span>
											</TableCell>
											<TableCell className='text-right'>
												<div className='flex justify-end'>
													<UserRoleSelect
														userId={user.user_id}
														currentRole={user.role}
													/>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Пагинация */}
					<div className='mt-6 flex justify-center sm:justify-end'>
						<Pagination totalPages={totalPages} />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}