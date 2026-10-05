import type React from 'react'
import { AppNav } from '@/components/layout/AppNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lingua-bg min-h-screen">
      <AppNav />
      <main className="pt-16">{children}</main>
    </div>
  )
}
