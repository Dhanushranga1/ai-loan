import { getUser } from '@/app/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'

export default async function DashboardPage() {
  const user = await getUser()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your AI Loan Approval dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Name:</span>{' '}
                {user?.user_metadata?.full_name || 'Not provided'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Member since:</span>{' '}
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>Your loan application status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No loan applications yet</p>
              <button className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Apply for Loan
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Calculate EMI
              </button>
              <button className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Check Eligibility
              </button>
              <button className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                View History
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
