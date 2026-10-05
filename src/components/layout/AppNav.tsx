'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/curriculum', label: 'Curriculum', icon: '📚' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/exam', label: 'Exam Prep', icon: '🎯' },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#080812]/80 backdrop-blur-xl">
      <Link href="/dashboard" className="text-lg font-bold text-white tracking-tight">
        Lingua AI
      </Link>

      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              pathname.startsWith(item.href)
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        Sign out
      </button>
    </nav>
  )
}
