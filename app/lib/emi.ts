// EMI and DTI calculation helpers (pure functions)

/**
 * Calculate monthly EMI (Equated Monthly Installment)
 * Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * @param principal - Loan amount (P)
 * @param annualRate - Annual interest rate (as decimal, e.g., 0.12 for 12%)
 * @param tenureMonths - Loan tenure in months (n)
 * @returns Monthly EMI amount
 */
export function calculateEMI(
  principal: number,
  annualRate: number = 0.18, // Default 18% annual rate
  tenureMonths: number
): number {
  // TODO: Implement EMI calculation formula
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / tenureMonths
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
              (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  
  return Math.round(emi * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate Debt-to-Income ratio
 * @param emi - Monthly EMI amount
 * @param monthlyIncome - Monthly income
 * @returns DTI ratio (0-1)
 */
export function calculateDTI(emi: number, monthlyIncome: number): number {
  // TODO: Implement DTI calculation
  if (monthlyIncome <= 0) return 1
  return Math.round((emi / monthlyIncome) * 10000) / 10000 // Round to 4 decimal places
}
