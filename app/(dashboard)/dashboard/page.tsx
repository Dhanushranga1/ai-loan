import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Container } from '@/app/components/container'

export default function DashboardPage() {
  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your loan applications and track your progress</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📝</span>
                New Loan Application
              </CardTitle>
              <CardDescription>
                Start a new loan application process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/loans/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Your Loans
              </CardTitle>
              <CardDescription>
                View and manage your existing loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/loans">
                <Button variant="outline" className="w-full">
                  View Loans
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💡</span>
                Loan Calculator
              </CardTitle>
              <CardDescription>
                Calculate EMI and loan eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Calculate EMI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Applications
              </CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Approved
              </CardTitle>
              <div className="text-2xl font-bold text-green-600">0</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Review
              </CardTitle>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rejected
              </CardTitle>
              <div className="text-2xl font-bold text-red-600">0</div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest loan application activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📭</span>
              <p>No recent activity</p>
              <p className="text-sm">Start by creating your first loan application</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
