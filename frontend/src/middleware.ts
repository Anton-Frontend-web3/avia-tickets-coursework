import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // пропускаем статику/next internals (matcher ниже тоже фильтрует, но пусть будет)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  // ✅ анти-зомби: считаем авторизованным только если есть id
  const isAuth = Boolean(token?.id)

  const publicPath = isPublicPath(pathname)

  // --------- НЕ АВТОРИЗОВАН ----------
  if (!isAuth) {
    // главная пусть открывается всем
    if (pathname === '/' || publicPath) return NextResponse.next()

    // всё остальное — на логин
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // --------- АВТОРИЗОВАН ----------
  const role = (token as any).role as 'admin' | 'agent' | 'client' | undefined

  // авторизованный не должен сидеть на login/register/...
  if (publicPath) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url))
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  // главная: админа/агента можно увести в их разделы, клиента оставить на /
  if (pathname === '/') {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url))
    return NextResponse.next()
  }

  // RBAC
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  if (pathname.startsWith('/agent') && role !== 'agent' && role !== 'admin') {
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}