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
  Settings,
} from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type NavLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  protected?: boolean
}

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthed = status === 'authenticated'
  const role = session?.user?.role

  const settingsLink: NavLink = {
    href: '/settings',
    label: 'Настройки',
    icon: Settings,
    protected: true,
  }

  const baseLinks: NavLink[] = [{ href: '/search', label: 'Поиск', icon: Ticket }]

  const navLinks: NavLink[] = (() => {
    // пока грузится — покажем минимум, чтобы хедер был “живым”
    if (!isAuthed) return baseLinks

    if (role === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Дашборд', icon: ClipboardCheck },
        { href: '/admin/schedules', label: 'Расписание', icon: CalendarClock },
        { href: '/admin/users', label: 'Пользователи', icon: Users },
        settingsLink,
      ]
    }

    if (role === 'agent') {
      return [
        ...baseLinks,
        { href: '/agent/check-in', label: 'Регистрация', icon: ClipboardCheck },
        { href: '/profile', label: 'Профиль', icon: User, protected: true },
        settingsLink,
      ]
    }

    return [
      ...baseLinks,
      { href: '/check-in', label: 'Регистрация', icon: CheckCircle },
      { href: '/profile', label: 'Профиль', icon: User, protected: true },
      settingsLink,
    ]
  })()

  const visibleLinks = navLinks.filter(l => !l.protected || isAuthed)

  const brandHref = role === 'admin' ? '/admin/dashboard' : '/'

  return (
    <header className='border-border bg-card/80 sticky top-0 z-50 border-b backdrop-blur'>
      <nav className='text-foreground container mx-auto flex items-center justify-between px-4 py-3'>
        <Link href={brandHref} className='text-primary text-xl font-bold'>
          AviaApp
        </Link>

        {/* Desktop nav */}
        <div className='hidden items-center gap-6 md:flex'>
          {visibleLinks.map(link => {
            const isActive = link.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(link.href)

            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'hover:text-primary flex items-center text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className='mr-1.5 h-4 w-4' />
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className='flex items-center gap-4'>
          {/* Desktop auth */}
          <div className='hidden items-center gap-4 md:flex'>
            {isLoading ? (
              <div className='bg-muted h-9 w-20 animate-pulse rounded-md' />
            ) : isAuthed ? (
              <>
                <span className='text-muted-foreground hidden text-sm sm:block'>
                  {session?.user?.email}
                </span>
                <Button variant='outline' size='sm' onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Выйти
                </Button>
              </>
            ) : (
              <Link href='/login'>
                <Button size='sm'>
                  <LogIn className='mr-2 h-4 w-4' />
                  Войти
                </Button>
              </Link>
            )}
          </div>

          <ThemeToggle />

          {/* Mobile nav */}
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
                  {visibleLinks.map(link => {
                    const isActive = link.href === '/admin/dashboard'
                      ? pathname === '/admin/dashboard'
                      : pathname.startsWith(link.href)

                    const Icon = link.icon

                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            'flex items-center text-lg font-medium',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          <Icon className='mr-2 h-5 w-5' />
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  })}

                  <hr className='my-4' />

                  {isAuthed ? (
                    <SheetClose asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className='mr-2 h-4 w-4' /> Выйти
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link href='/login'>
                        <Button size='sm' className='w-full'>
                          <LogIn className='mr-2 h-4 w-4' /> Войти
                        </Button>
                      </Link>
                    </SheetClose>
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
