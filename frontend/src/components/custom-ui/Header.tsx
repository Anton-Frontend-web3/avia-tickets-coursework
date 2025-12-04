'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// 1. Добавляем иконку CheckCircle
import { LogIn, LogOut, User, Ticket, Menu, CheckCircle } from 'lucide-react'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'

// 2. Добавляем ссылку на регистрацию в массив
const navLinks = [
	{ href: '/search', label: 'Билеты', icon: Ticket },
	// Ссылка на регистрацию (доступна всем)
	{ href: '/check-in', label: 'Регистрация', icon: CheckCircle },
	{ href: '/profile', label: 'Профиль', icon: User, protected: true }
]

export function Header() {
	const pathname = usePathname()
	const { data: session, status } = useSession()
	const isLoading = status === 'loading'

	return (
		<header className='sticky top-0 z-50 bg-white shadow-sm'>
			<nav className='container mx-auto flex items-center justify-between px-4 py-3'>
				<Link
					href='/'
					className='text-xl font-bold text-blue-600'
				>
					AviaApp
				</Link>

				{/* --- НАВИГАЦИЯ ДЛЯ ДЕСКТОПА --- */}
				<div className='hidden items-center gap-6 md:flex'>
					{navLinks.map(link => {
						if (link.protected && !session) return null

						const isActive = pathname.startsWith(link.href)
						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									'flex items-center text-sm font-medium transition-colors hover:text-blue-600',
									isActive ? 'text-blue-600' : 'text-gray-500'
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
							<div className='h-9 w-20 animate-pulse rounded-md bg-gray-200'></div>
						) : session ? (
							<>
								<span className='hidden text-sm text-gray-700 sm:block'>
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
							<Link
								href='/login'
								passHref
							>
								<Button size='sm'>
									<LogIn className='mr-2 h-4 w-4' />
									Войти
								</Button>
							</Link>
						)}
					</div>

					{/* --- НАВИГАЦИЯ ДЛЯ МОБИЛЬНЫХ --- */}
					<div className='md:hidden'>
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant='outline'
									size='icon'
								>
									<Menu className='h-5 w-5' />
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Навигация</SheetTitle>
								</SheetHeader>
								<div className='mt-6 flex flex-col space-y-4'>
									{navLinks.map(link => {
										if (link.protected && !session) return null

										const isActive = pathname.startsWith(link.href)
										return (
											<Link
												key={link.href}
												href={link.href}
												className={cn(
													'flex items-center text-lg font-medium',
													isActive ? 'text-blue-600' : 'text-gray-700'
												)}
											>
												<link.icon className='mr-2 h-5 w-5' />
												{link.label}
											</Link>
										)
									})}
									<hr className='my-4' />
									{session ? (
										<Button
											variant='outline'
											size='sm'
											onClick={() => signOut({ callbackUrl: '/' })}
										>
											<LogOut className='mr-2 h-4 w-4' />
											Выйти
										</Button>
									) : (
										<Link
											href='/login'
											passHref
										>
											<Button
												size='sm'
												className='w-full'
											>
												<LogIn className='mr-2 h-4 w-4' />
												Войти
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
