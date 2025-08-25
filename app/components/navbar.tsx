'use client'

import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-xl">AI Loan Approval</span>
        </Link>
        
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/loans">
            <Button variant="ghost">My Loans</Button>
          </Link>
          <Link href="/loans/new">
            <Button variant="ghost">Apply</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
