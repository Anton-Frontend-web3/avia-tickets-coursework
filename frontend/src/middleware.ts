import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.AUTH_SECRET })
	const { pathname } = req.nextUrl

	// Список путей, доступных БЕЗ авторизации
	// Обратите внимание: мы не включаем сюда '/' или '/search', значит они будут закрыты
	const publicPaths = ['/login', '/register']

	// Проверяем, является ли текущий путь публичным
	const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

	// --- СЦЕНАРИЙ 1: ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН ---
	if (!token) {
		// Если путь НЕ публичный (например, /, /search, /profile) -> на выход
		if (!isPublicPath) {
			// Можно добавить ?callbackUrl=..., чтобы вернуть пользователя обратно после входа
			const url = new URL('/login', req.url)
			url.searchParams.set('callbackUrl', pathname)
			return NextResponse.redirect(url)
		}
		// Если путь публичный (логин/регистрация) -> пускаем
		return NextResponse.next()
	}

	// --- СЦЕНАРИЙ 2: ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН ---
	if (token) {
		// Если авторизованный пытается зайти на страницы входа/регистрации или на главную
		if (isPublicPath || pathname === '/') {
			if (token.role === 'admin')
				return NextResponse.redirect(new URL('/admin/dashboard', req.url))
			if (token.role === 'agent')
				return NextResponse.redirect(new URL('/agent/check-in', req.url))

			// Клиента перекидываем в профиль (или на поиск, если хотите)
			return NextResponse.redirect(new URL('/profile', req.url))
		}

		// Защита админ-панели (Role Based Access Control)
		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/profile', req.url))
		}

		// Защита панели агента
		if (
			pathname.startsWith('/agent') &&
			token.role !== 'agent' &&
			token.role !== 'admin'
		) {
			return NextResponse.redirect(new URL('/profile', req.url))
		}
	}

	return NextResponse.next()
}

// Matcher исключает статику и API, чтобы не ломать загрузку картинок и работу next-auth
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
