// Zod schemas for loan validation
import { z } from 'zod'

/**
 * Loan input validation schema (client → server)
 * Used for POST /api/loans requests
 */
export const LoanInputSchema = z.object({
  amount: z
    .number({ message: 'Loan amount must be a number' })
    .min(1, 'Loan amount must be greater than 0')
    .max(100000000, 'Loan amount cannot exceed ₹10 crores')
    .finite('Loan amount must be a valid number'),
    
  tenure_months: z
    .number({ message: 'Tenure must be a number' })
    .int('Tenure must be a whole number')
    .min(3, 'Minimum tenure is 3 months')
    .max(84, 'Maximum tenure is 84 months'),
    
  purpose: z
    .string({ message: 'Loan purpose is required' })
    .min(3, 'Purpose must be at least 3 characters')
    .max(120, 'Purpose cannot exceed 120 characters')
    .trim()
    .refine(str => str.length > 0, 'Purpose cannot be empty'),
    
  income: z
    .number({ message: 'Income must be a number' })
    .min(1, 'Monthly income must be greater than 0')
    .max(10000000, 'Monthly income cannot exceed ₹1 crore')
    .finite('Income must be a valid number'),
    
  employment_length_years: z
    .number({ message: 'Employment length must be a number' })
    .min(0, 'Employment length cannot be negative')
    .max(40, 'Employment length cannot exceed 40 years')
    .finite('Employment length must be a valid number'),
    
  credit_score: z
    .number({ message: 'Credit score must be a number' })
    .int('Credit score must be a whole number')
    .min(300, 'Credit score must be at least 300')
    .max(900, 'Credit score cannot exceed 900'),
    
  dti_ratio: z
    .number({ message: 'DTI ratio must be a number' })
    .min(0, 'DTI ratio cannot be negative')
    .max(1, 'DTI ratio cannot exceed 1.0')
    .finite('DTI ratio must be a valid number')
})

/**
 * Loan output schema (server → client)
 * Represents a loan record from database
 */
export const LoanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number(),
  tenure_months: z.number(),
  purpose: z.string(),
  income: z.number(),
  employment_length_years: z.number(),
  credit_score: z.number(),
  dti_ratio: z.number(),
  status: z.enum(['submitted', 'approved', 'rejected', 'needs_review']),
  created_at: z.string().datetime()
})

/**
 * List response schema for GET /api/loans
 */
export const LoanListResponseSchema = z.object({
  items: z.array(LoanSchema),
  page: z.number().int().min(1),
  page_size: z.number().int().min(1).max(50),
  total: z.number().int().min(0),
  has_next: z.boolean()
})

/**
 * Query parameters schema for GET /api/loans
 */
export const LoanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['submitted', 'approved', 'rejected', 'needs_review']).optional(),
  q: z.string().max(100).optional(), // Search query for purpose
  sort: z.enum(['created_at', 'amount']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  all: z.coerce.boolean().default(false) // Admin flag to see all loans
})

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  })
})

// Type exports
export type LoanInput = z.infer<typeof LoanInputSchema>
export type Loan = z.infer<typeof LoanSchema>
export type LoanListResponse = z.infer<typeof LoanListResponseSchema>
export type LoanListQuery = z.infer<typeof LoanListQuerySchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * Helper function to format Zod validation errors
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })
  
  return errors
}
