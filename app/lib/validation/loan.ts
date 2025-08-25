// Zod schemas for loan validation
import { z } from 'zod'

// TODO: Implement comprehensive Zod schemas for loan validation
export const LoanInputSchema = z.object({
  amount: z.number().min(1).max(100000000),
  tenure_months: z.number().int().min(3).max(84),
  purpose: z.string().min(3).max(120),
  income: z.number().min(1).max(10000000),
  employment_length_years: z.number().min(0).max(40),
  credit_score: z.number().int().min(300).max(900),
  dti_ratio: z.number().min(0).max(1)
})

export type LoanInput = z.infer<typeof LoanInputSchema>
