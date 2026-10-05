import type { Metadata } from 'next'
import type React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lingua AI — Learn French, German, Italian with AI',
  description:
    'A structured CEFR-aligned language curriculum with an AI teacher. Prepare for DELF, Goethe-Zertifikat, and CILS exams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-[var(--font-inter)] antialiased">{children}</body>
    </html>
  )
}
