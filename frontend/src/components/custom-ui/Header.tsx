'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Ticket } from 'lucide-react';
import { Menu } from 'lucide-react'; // <-- Иконка для бургера
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// Определяем наши навигационные ссылки
const navLinks = [
  { href: '/search', label: 'Билеты', icon: Ticket },
  { href: '/profile', label: 'Профиль', icon: User, protected: true }, // Защищенная ссылка
];

export function Header() {
  const pathname = usePathname();
  // Хук useSession для получения данных о сессии на клиенте
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  
return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AviaApp
        </Link>

        {/* --- НАВИГАЦИЯ ДЛЯ ДЕСКТОПА (без изменений) --- */}
        <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
              // Не показываем защищенные ссылки, если пользователь не авторизован
              if (link.protected && !session) return null;

              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-blue-600',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  <link.icon className="inline-block h-4 w-4 mr-1" />
                  {link.label}
                </Link>
              );
            })}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          ) : session ? (
            <>
              <span className="text-sm text-gray-700 hidden sm:block">
                {session.user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Войти
              </Button>
            </Link>
          )}
          </div>

          {/* --- НАВИГАЦИЯ ДЛЯ МОБИЛЬНЫХ --- */}
          <div className="md:hidden"> {/* <-- Этот блок виден ТОЛЬКО на экранах < 768px */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Навигация</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Рендерим те же самые ссылки, но в вертикальном виде */}
                  {navLinks.map((link) => {
                    if (link.protected && !session) return null;
                    return (
                      <Link key={link.href} href={link.href} className="text-lg font-medium">
                        {link.label}
                      </Link>
                    );
                  })}
                  {/* Добавляем сюда кнопки входа/выхода для мобильной версии */}
                  <hr className="my-4" />
                  {session ? (
                     <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                       Выйти
                     </Button>
                  ) : (
                    <Link href="/login" passHref>
                      <Button size="sm" className="w-full">Войти</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}