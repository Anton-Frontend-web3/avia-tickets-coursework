import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // --- ЛОГИКА ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ ---
  if (token) {
    // --- НОВОЕ ПРАВИЛО! ---
    // Если залогиненный пользователь пытается зайти на ГЛАВНУЮ страницу...
    if (pathname === '/') {
      // ...отправляем его в соответствующий "домашний" раздел.
      if (token.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      if (token.role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url));
      return NextResponse.redirect(new URL('/profile', req.url));
    }
    // --- КОНЕЦ НОВОГО ПРАВИЛА ---

    // Если залогиненный пользователь пытается зайти на /login или /register...
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      // ...тоже отправляем его в "домашний" раздел.
      if (token.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      if (token.role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url));
      return NextResponse.redirect(new URL('/profile', req.url));
    }

    // Защита админ-панели
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Защита панели агента
    if (pathname.startsWith('/agent') && token.role !== 'agent' && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // --- ЛОГИКА ДЛЯ НЕАВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ ---
  if (!token) {
    if (pathname.startsWith('/profile') || pathname.startsWith('/admin') || pathname.startsWith('/agent')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};