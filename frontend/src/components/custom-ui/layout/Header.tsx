'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/custom-ui/layout/ThemeToggle'
import {
	LogIn,
	LogOut,
	User,
	Ticket,
	Menu,
	CheckCircle,
	CalendarClock,
	ClipboardCheck,
    Users, 
    Settings // <--- 1. ДОБАВИЛИ ИКОНКУ НАСТРОЕК
} from 'lucide-react'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'

export function Header() {
	const pathname = usePathname()
	const { data: session, status } = useSession()
	const isLoading = status === 'loading'

	const role = session?.user?.role

	const getNavLinks = () => {
		if (!session) return []
		const baseLinks = [{ href: '/search', label: 'Поиск', icon: Ticket }]
        
        // <--- 2. СОЗДАЛИ ОБЩУЮ ССЫЛКУ ДЛЯ ВСЕХ ---
        const settingsLink = { 
            href: '/settings', 
            label: 'Настройки', 
            icon: Settings, 
            protected: true // Видна только авторизованным
        }

		// 1. Сценарий АДМИНА
		if (role === 'admin') {
			return [
				{
					href: '/admin/dashboard',
					label: 'Дашборд',
					icon: ClipboardCheck 
				},
				{
					href: '/admin/schedules',
					label: 'Расписание',
					icon: CalendarClock
				},
                {
					href: '/admin/users',
					label: 'Пользователи',
					icon: Users
				},
                settingsLink // <--- Добавили в конец
			]
		}

		// 2. Сценарий АГЕНТА
		if (role === 'agent') {
			return [
				...baseLinks,
				{
					href: '/agent/check-in',
					label: 'Регистрация',
					icon: ClipboardCheck
				},
				{ href: '/profile', label: 'Профиль', icon: User },
                settingsLink // <--- Добавили в конец
			]
		}

		// 3. Сценарий КЛИЕНТА
		return [
			...baseLinks,
			{ href: '/check-in', label: 'Регистрация', icon: CheckCircle },
			{ href: '/profile', label: 'Профиль', icon: User, protected: true },
            settingsLink // <--- Добавили в конец
		]
	}

	const navLinks = getNavLinks()

	return (
		<header className='border-border bg-card/80 sticky top-0 z-50 border-b backdrop-blur'>
			<nav className='text-foreground container mx-auto flex items-center justify-between px-4 py-3'>
				<Link
					href={role === 'admin' ? '/admin/dashboard' : '/'} // Поправил ссылку для админа на дашборд
					className='text-primary text-xl font-bold'
				>
					AviaApp
				</Link>

				{/* --- НАВИГАЦИЯ ДЛЯ ДЕСКТОПА --- */}
				<div className='hidden items-center gap-6 md:flex'>
					{navLinks.map(link => {
						// @ts-ignore
						if (link.protected && !session) return null

						const isActive = pathname.startsWith(link.href)
                        // Для главной страницы /admin проверка startsWith может быть слишком широкой, уточняем
                        const isExactActive = link.href === '/admin/dashboard' ? pathname === '/admin/dashboard' : isActive;

						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									'hover:text-primary flex items-center text-sm font-medium transition-colors',
									isExactActive ? 'text-primary' : 'text-muted-foreground'
								)}
							>
								<link.icon className='mr-1.5 h-4 w-4' />
								{link.label}
							</Link>
						)
					})}
				</div>

				<div className='flex items-center gap-4'>
					<div className='hidden items-center gap-4 md:flex'>
						{isLoading ? (
							<div className='bg-muted h-9 w-20 animate-pulse rounded-md'></div>
						) : session ? (
							<>
								<span className='text-muted-foreground hidden text-sm sm:block'>
									{session.user?.email}
								</span>
								<Button
									variant='outline'
									size='sm'
									onClick={() => signOut({ callbackUrl: '/' })}
								>
									<LogOut className='mr-2 h-4 w-4' />
									Выйти
								</Button>
							</>
						) : (
							<Link href='/login' passHref>
								<Button size='sm'>
									<LogIn className='mr-2 h-4 w-4' />
									Войти
								</Button>
							</Link>
						)}
					</div>
					<ThemeToggle />

					{/* --- НАВИГАЦИЯ ДЛЯ МОБИЛЬНЫХ --- */}
					<div className='md:hidden'>
						<Sheet>
							<SheetTrigger asChild>
								<Button variant='outline' size='icon'>
									<Menu className='h-5 w-5' />
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Меню</SheetTitle>
								</SheetHeader>
								<div className='mt-6 flex flex-col space-y-4'>
									{navLinks.map(link => {
										// @ts-ignore
										if (link.protected && !session) return null
										
                                        const isActive = pathname.startsWith(link.href)
                                        const isExactActive = link.href === '/admin/dashboard' ? pathname === '/admin/dashboard' : isActive;

										return (
											<Link
												key={link.href}
												href={link.href}
												className={cn(
													'flex items-center text-lg font-medium',
													isExactActive ? 'text-primary' : 'text-foreground'
												)}
											>
												<link.icon className='mr-2 h-5 w-5' />
												{link.label}
											</Link>
										)
									})}
									<hr className='my-4' />
                                    {session ? (
										<Button variant='outline' size='sm' onClick={() => signOut({ callbackUrl: '/' })}>
											<LogOut className='mr-2 h-4 w-4' /> Выйти
										</Button>
									) : (
										<Link href='/login' passHref>
											<Button size='sm' className='w-full'>
												<LogIn className='mr-2 h-4 w-4' /> Войти
											</Button>
										</Link>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</nav>
		</header>
	)
}