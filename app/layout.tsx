import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/app/components/navbar'
import { Toaster } from 'sonner'

// CI Pipeline Test: Phase 5 Task 7 - Pipeline verification
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'AI Loan Approval System',
  description: 'Smart loan approval with transparent AI decision making',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
