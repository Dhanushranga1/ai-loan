// Loan detail page
import { Container } from '@/app/components/container'

export default function LoanDetailPage({ params }: { params: { id: string } }) {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900">Loan Details</h1>
        <p className="text-gray-600">Loan ID: {params.id}</p>
        {/* TODO: Implement loan detail view with decision section */}
      </div>
    </Container>
  )
}
