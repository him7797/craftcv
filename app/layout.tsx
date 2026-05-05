import type { Metadata } from 'next'
import { Space_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CraftCV — AI Resume Builder for Engineers',
  description:
    'Local-first AI. JD-tailored bullets. Live scoring out of 100. Zero cloud lock-in. Built for one user — you.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
