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
  // Input validation
  if (principal <= 0 || tenureMonths <= 0) {
    return 0
  }

  const monthlyRate = annualRate / 12

  // If no interest rate, simple division
  if (monthlyRate === 0) {
    return Math.round((principal / tenureMonths) * 100) / 100
  }

  // EMI calculation using the standard formula
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1
  const emi = numerator / denominator

  return Math.round(emi * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate Debt-to-Income ratio
 * @param emi - Monthly EMI amount
 * @param monthlyIncome - Monthly income
 * @returns DTI ratio (0-1)
 */
export function calculateDTI(emi: number, monthlyIncome: number): number {
  // Input validation
  if (monthlyIncome <= 0 || emi < 0) {
    return emi < 0 ? 0 : 1 // Return 1 for zero income (worst case)
  }

  const dti = emi / monthlyIncome
  return Math.round(dti * 10000) / 10000 // Round to 4 decimal places
}

/**
 * Get DTI status and recommendation
 * @param dtiRatio - DTI ratio (0-1)
 * @returns Object with status and message
 */
export function getDTIStatus(dtiRatio: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor'
  message: string
  color: 'green' | 'blue' | 'yellow' | 'red'
} {
  if (dtiRatio <= 0.25) {
    return {
      status: 'excellent',
      message: 'Excellent DTI ratio! Strong approval chances.',
      color: 'green'
    }
  } else if (dtiRatio <= 0.35) {
    return {
      status: 'good',
      message: 'Good DTI ratio. Meets lending standards.',
      color: 'blue'
    }
  } else if (dtiRatio <= 0.50) {
    return {
      status: 'fair',
      message: 'Fair DTI ratio. Consider longer tenure.',
      color: 'yellow'
    }
  } else {
    return {
      status: 'poor',
      message: 'High DTI ratio. Approval may be difficult.',
      color: 'red'
    }
  }
}

/**
 * Calculate total interest payable over the loan tenure
 * @param principal - Loan amount
 * @param emi - Monthly EMI
 * @param tenureMonths - Loan tenure in months
 * @returns Total interest amount
 */
export function calculateTotalInterest(
  principal: number,
  emi: number,
  tenureMonths: number
): number {
  const totalPayment = emi * tenureMonths
  const totalInterest = totalPayment - principal
  return Math.round(totalInterest * 100) / 100
}

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol'
  }).format(amount).replace('₹', currency)
}

/**
 * Suggest optimal tenure based on DTI preferences
 * @param principal - Loan amount
 * @param monthlyIncome - Monthly income
 * @param annualRate - Annual interest rate
 * @param targetDTI - Target DTI ratio (default: 0.35)
 * @returns Suggested tenure in months
 */
export function suggestOptimalTenure(
  principal: number,
  monthlyIncome: number,
  annualRate: number = 0.18,
  targetDTI: number = 0.35
): number {
  const maxEMI = monthlyIncome * targetDTI

  // Binary search for optimal tenure
  let minTenure = 3
  let maxTenure = 84
  let optimalTenure = 12

  while (minTenure <= maxTenure) {
    const midTenure = Math.floor((minTenure + maxTenure) / 2)
    const emi = calculateEMI(principal, annualRate, midTenure)

    if (emi <= maxEMI) {
      optimalTenure = midTenure
      maxTenure = midTenure - 1
    } else {
      minTenure = midTenure + 1
    }
  }

  return Math.max(3, Math.min(84, optimalTenure))
}
