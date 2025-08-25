import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Container } from '@/app/components/container'

export default function HomePage() {
  return (
    <Container>
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🏦 AI Loan Approval System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience fast, fair, and transparent loan approvals powered by advanced AI technology.
            Get instant decisions with clear explanations.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚡</span>
                Instant Decisions
              </CardTitle>
              <CardDescription>
                Get loan approval decisions in seconds, not days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our AI analyzes your application and provides immediate feedback
                based on transparent criteria.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔍</span>
                Transparent AI
              </CardTitle>
              <CardDescription>
                Understand exactly why decisions are made
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Every decision comes with clear explanations of the factors
                that influenced the outcome.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔒</span>
                Secure & Private
              </CardTitle>
              <CardDescription>
                Your data is protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Bank-level encryption and privacy controls ensure your
                information remains safe and confidential.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to apply for your loan?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of satisfied customers who trust our AI-powered loan approval system.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Application
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
