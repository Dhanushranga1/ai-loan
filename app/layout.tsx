import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/app/components/navbar'
import { Toaster } from 'sonner'

// Production Enhancement: Phase 5 Task 8 - Main branch deployment
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'AI Loan Approval System',
  description: 'Smart loan approval with transparent AI decision making',
}

// Production deployment information component
function DeploymentInfo() {
  const isProduction = process.env.NODE_ENV === 'production'
  const buildNumber = process.env.BUILD_NUMBER
  const version = process.env.npm_package_version || '1.0.0'
  
  if (!isProduction) return null
  
  return (
    <div className="fixed bottom-0 right-0 p-2 text-xs text-gray-400 bg-gray-50 rounded-tl-md border-l border-t border-gray-200">
      v{version}{buildNumber ? `-${buildNumber}` : ''} | {new Date().toISOString().split('T')[0]}
    </div>
  )
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
        <DeploymentInfo />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
