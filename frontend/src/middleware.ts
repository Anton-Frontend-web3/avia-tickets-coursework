import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET, // <-- как у тебя в NextAuth
  })

  // ✅ token.id — твоя реальность
  const tokenId = (token as any)?.id as string | undefined
  const role = (token as any)?.role as string | undefined
  const isAuth = Boolean(tokenId)

  const publicPath = isPublicPath(pathname)

  // --- НЕ АВТОРИЗОВАН ---
  if (!isAuth) {
    if (pathname === '/' || publicPath) return NextResponse.next()

    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // --- АВТОРИЗОВАН ---
  if (publicPath) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url))
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  if (pathname === '/') {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'agent') return NextResponse.redirect(new URL('/agent/check-in', req.url))
    return NextResponse.next()
  }

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
