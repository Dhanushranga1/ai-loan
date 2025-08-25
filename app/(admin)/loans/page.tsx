import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createServerSupabaseClient } from '@/app/lib/supabaseServer'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Skeleton } from '@/app/components/ui/skeleton'

interface LoanWithProfile {
  id: string
  amount: number
  purpose: string
  status: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string
    email: string
  }[] | null
}

interface AdminLoansListProps {
  searchParams: {
    status?: string
    page?: string
    search?: string
  }
}

async function AdminLoansList({ searchParams }: AdminLoansListProps) {
  // Require admin access
  await requireAdmin()

  const supabase = await createServerSupabaseClient()
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize

  // Build query with filters
  let query = supabase
    .from('loan_applications')
    .select(`
      id,
      amount,
      purpose,
      status,
      created_at,
      user_id,
      profiles!loan_applications_user_id_fkey(
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  // Apply status filter
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  // Apply search filter (removed profiles search for now as it requires different approach)
  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    query = query.ilike('purpose', `%${searchTerm}%`)
  }

  const { data: loans, error } = await query

  if (error) {
    console.error('Error fetching loans:', error)
    return (
      <div className="p-8">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading loans: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get total count for pagination
  let countQuery = supabase
    .from('loan_applications')
    .select('*', { count: 'exact', head: true })

  if (searchParams.status && searchParams.status !== 'all') {
    countQuery = countQuery.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    const searchTerm = searchParams.search.toLowerCase()
    countQuery = countQuery.ilike('purpose', `%${searchTerm}%`)
  }

  const { count } = await countQuery
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin - Loan Applications</h1>
        <Badge variant="default" className="text-sm">
          {count || 0} total loans
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <form method="GET" className="flex gap-4 flex-wrap">
              <div className="flex gap-2">
                <select
                  name="status"
                  defaultValue={searchParams.status || 'all'}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by name, email, or purpose..."
                  defaultValue={searchParams.search || ''}
                  className="px-3 py-2 border rounded-md min-w-64"
                />
              </div>

              <Button type="submit" variant="outline">
                Apply Filters
              </Button>

              {(searchParams.status || searchParams.search) && (
                <Button asChild variant="ghost">
                  <Link href="/loans">Clear Filters</Link>
                </Button>
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      <div className="space-y-4">
        {loans && loans.length > 0 ? (
          loans.map((loan: LoanWithProfile) => (
            <Card key={loan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        ${loan.amount.toLocaleString()}
                      </h3>
                      <Badge
                        variant={
                          loan.status === 'approved' ? 'approved' :
                          loan.status === 'rejected' ? 'rejected' :
                          loan.status === 'pending' ? 'pending' :
                          'default'
                        }
                      >
                        {loan.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600">
                      <strong>Purpose:</strong> {loan.purpose}
                    </p>

                    <p className="text-gray-600">
                      <strong>Applicant:</strong> {
                        loan.profiles && loan.profiles.length > 0
                          ? `${loan.profiles[0].full_name} (${loan.profiles[0].email})`
                          : 'Unknown applicant'
                      }
                    </p>

                    <p className="text-sm text-gray-500">
                      Applied: {new Date(loan.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/loans/${loan.id}`}>
                        View Details
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No loans found with the current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Button asChild variant="outline">
              <a
                href={`?${new URLSearchParams({
                  ...searchParams,
                  page: (page - 1).toString()
                }).toString()}`}
              >
                Previous
              </a>
            </Button>
          )}

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Button asChild variant="outline">
              <a
                href={`?${new URLSearchParams({
                  ...searchParams,
                  page: (page + 1).toString()
                }).toString()}`}
              >
                Next
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function AdminLoansLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-24" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-80" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AdminLoansPage({ searchParams }: AdminLoansListProps) {
  return (
    <Suspense fallback={<AdminLoansLoading />}>
      <AdminLoansList searchParams={searchParams} />
    </Suspense>
  )
}
