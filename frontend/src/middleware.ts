import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.AUTH_SECRET })
	const { pathname } = req.nextUrl

    // --- ИСПРАВЛЕНИЕ: Вводим строгую переменную авторизации ---
    // Мы считаем пользователя авторизованным, ТОЛЬКО если есть токен И у него есть ID.
    // Если токен пустой {} (зомби), то isAuth будет false.
    const isAuth = !!token && !!token.id; 

	const publicPaths = [
		'/login',
		'/register',
		'/forgot-password',
		'/reset-password'
	]

	// Добавим '/' в публичные пути
	if (!isAuth && pathname === '/') {
		// return NextResponse.next() // Оставим как есть
	}

	const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

	// --- СЦЕНАРИЙ 1: НЕ АВТОРИЗОВАН (isAuth === false) ---
	if (!isAuth) {
		if (!isPublicPath && pathname !== '/') {
			const url = new URL('/login', req.url)
			url.searchParams.set('callbackUrl', pathname)
			return NextResponse.redirect(url)
		}
		return NextResponse.next()
	}

	// --- СЦЕНАРИЙ 2: АВТОРИЗОВАН (isAuth === true) ---
	if (isAuth) {
		if (isPublicPath) {
			if (token.role === 'admin')
				return NextResponse.redirect(new URL('/admin/dashboard', req.url))
			if (token.role === 'agent')
				return NextResponse.redirect(new URL('/agent/check-in', req.url))

			return NextResponse.redirect(new URL('/profile', req.url))
		}

        if (pathname === '/') {
            if (token.role === 'admin')
				return NextResponse.redirect(new URL('/admin/dashboard', req.url))
			if (token.role === 'agent')
				return NextResponse.redirect(new URL('/agent/check-in', req.url))
            
            return NextResponse.next()
        }

		if (pathname.startsWith('/admin') && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/profile', req.url))
		}

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

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}