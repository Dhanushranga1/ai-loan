import { requireAdmin } from '@/lib/admin'
import { getServerUser } from '@/app/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const user = await getServerUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">System administration and monitoring</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/loans"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to User View
              </a>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-gray-100 border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-6">
            <a
              href="/loans"
              className="py-3 px-1 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Loan Applications
            </a>
            <a
              href="/admin/users"
              className="py-3 px-1 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Users
            </a>
            <a
              href="/admin/reports"
              className="py-3 px-1 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Reports
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
