import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/curriculum',
  '/lesson',
  '/shadow',
  '/scenario',
  '/progress',
  '/exam',
  '/review',
  '/onboarding',
]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  try {
    const sessionRes = await fetch(
      new URL('/api/auth/get-session', request.url).toString(),
      {
        headers: { cookie: request.headers.get('cookie') ?? '' },
        cache: 'no-store',
      }
    )
    const session = (await sessionRes.json()) as { user?: unknown } | null
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/curriculum/:path*',
    '/lesson/:path*',
    '/shadow/:path*',
    '/scenario/:path*',
    '/progress/:path*',
    '/exam/:path*',
    '/review/:path*',
    '/onboarding/:path*',
  ],
}
