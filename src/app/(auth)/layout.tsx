import type React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Lingua AI',
  description:
    'Sign in or create your Lingua AI account to start learning French, German, or Italian.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lingua-bg flex min-h-screen items-center justify-center px-4 py-12">
      {children}
    </div>
  )
}
