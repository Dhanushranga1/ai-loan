import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Container } from '@/app/components/container'

export default function NewLoanPage() {
  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Loan Application</h1>
          <p className="text-gray-600">Complete the form below to apply for a loan</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>
                  Provide information about the loan you're requesting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Loan Amount (₹)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      placeholder="500000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tenure" className="text-sm font-medium">
                      Tenure (Months)
                    </label>
                    <input
                      id="tenure"
                      type="number"
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="purpose" className="text-sm font-medium">
                    Loan Purpose
                  </label>
                  <select
                    id="purpose"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select purpose</option>
                    <option value="personal">Personal</option>
                    <option value="home">Home</option>
                    <option value="car">Car</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="income" className="text-sm font-medium">
                      Monthly Income (₹)
                    </label>
                    <input
                      id="income"
                      type="number"
                      placeholder="75000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="employment" className="text-sm font-medium">
                      Employment Length (Years)
                    </label>
                    <input
                      id="employment"
                      type="number"
                      placeholder="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="creditScore" className="text-sm font-medium">
                      Credit Score
                    </label>
                    <input
                      id="creditScore"
                      type="number"
                      placeholder="750"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dtiRatio" className="text-sm font-medium">
                      Debt-to-Income Ratio
                    </label>
                    <input
                      id="dtiRatio"
                      type="number"
                      step="0.01"
                      placeholder="0.30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    Save Draft
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Submit Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EMI Calculator</CardTitle>
                <CardDescription>
                  Live calculation based on your inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600">₹ --</div>
                  <p className="text-sm text-gray-600">Monthly EMI</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Higher credit scores improve approval chances</p>
                <p>• Keep DTI ratio below 35% for better rates</p>
                <p>• Longer employment history is preferred</p>
                <p>• Choose appropriate loan tenure for your budget</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}
