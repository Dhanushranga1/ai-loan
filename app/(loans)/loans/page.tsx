import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Container } from '@/app/components/container'

export default function LoansPage() {
  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
            <p className="text-gray-600">View and manage your loan applications</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Application
          </Button>
        </div>

        {/* Loans List */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>
              All your loan applications and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📄</span>
              <p>No loan applications found</p>
              <p className="text-sm">Start by creating your first loan application</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Apply for a Loan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
