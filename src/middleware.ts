import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 認証が必要ないパス
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/unauthorized'
  ) {
    return NextResponse.next()
  }

  const authKey = process.env.AUTH_KEY || 'token'
  const authValue = process.env.AUTH_VALUE || ''
  
  // URLパラメータまたはCookieからトークンを確認
  const providedToken = request.nextUrl.searchParams.get(authKey)
  const cookieToken = request.cookies.get('auth_token')?.value

  if (providedToken === authValue) {
    // 正しいトークンがURLにある場合、Cookieに保存してリダイレクト
    const response = NextResponse.redirect(new URL(request.nextUrl.pathname, request.url))
    response.cookies.set('auth_token', authValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24時間
    })
    return response
  }
  
  if (cookieToken === authValue) {
    // Cookieに正しいトークンがある場合、そのまま通す
    return NextResponse.next()
  }

  // 認証失敗
  return NextResponse.redirect(new URL('/unauthorized', request.url))
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}