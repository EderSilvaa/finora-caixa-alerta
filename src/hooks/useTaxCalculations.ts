// useTaxCalculations Hook - Manage monthly tax calculations
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { taxService } from '@/services/tax.service'
import type { TaxCalculation, TaxCalculationInput, TaxCalculationDetails } from '@/types/tax'

export function useTaxCalculations(month?: number, year?: number) {
  const { user } = useAuth()
  const [calculations, setCalculations] = useState<TaxCalculation[]>([])
  const [currentCalculation, setCurrentCalculation] = useState<TaxCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use current month/year if not specified
  const targetMonth = month || new Date().getMonth() + 1
  const targetYear = year || new Date().getFullYear()

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchCalculations()
  }, [user?.id, targetMonth, targetYear])

  const fetchCalculations = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Fetch calculations for the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const startMonth = sixMonthsAgo.getMonth() + 1
      const startYear = sixMonthsAgo.getFullYear()

      const data = await taxService.getCalculations(
        user.id,
        startYear,
        startMonth,
        targetYear,
        targetMonth
      )

      setCalculations(data)

      // Find current month's calculation
      const current = data.find((calc) => calc.month === targetMonth && calc.year === targetYear)
      setCurrentCalculation(current || null)

      console.log('[useTaxCalculations] Loaded', data.length, 'calculations')
    } catch (err: any) {
      console.error('[useTaxCalculations] Error fetching calculations:', err)
      setError(err.message || 'Failed to load tax calculations')
    } finally {
      setLoading(false)
    }
  }

  const calculateTaxes = async (): Promise<TaxCalculationDetails | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setCalculating(true)
      setError(null)

      console.log('[useTaxCalculations] Calculating taxes for', targetMonth, '/', targetYear)

      // Call RPC function to calculate taxes
      const result = await taxService.calculateMonthlyTax(user.id, targetMonth, targetYear)

      // Save calculation to database
      await taxService.saveCalculation(user.id, targetMonth, targetYear, result)

      // Refresh calculations
      await fetchCalculations()

      console.log('[useTaxCalculations] Taxes calculated successfully:', result)

      return result
    } catch (err: any) {
      console.error('[useTaxCalculations] Error calculating taxes:', err)
      setError(err.message || 'Failed to calculate taxes')
      throw err
    } finally {
      setCalculating(false)
    }
  }

  const updateManualCalculation = async (updates: Partial<TaxCalculationInput>): Promise<void> => {
    if (!currentCalculation) {
      throw new Error('No calculation found for current month')
    }

    try {
      setCalculating(true)
      setError(null)

      const updated = await taxService.updateCalculation(currentCalculation.id, updates)
      setCurrentCalculation(updated)

      // Update in list
      setCalculations((prev) => prev.map((calc) => (calc.id === updated.id ? updated : calc)))

      console.log('[useTaxCalculations] Calculation updated manually')
    } catch (err: any) {
      console.error('[useTaxCalculations] Error updating calculation:', err)
      setError(err.message || 'Failed to update calculation')
      throw err
    } finally {
      setCalculating(false)
    }
  }

  const deleteCalculation = async (calculationId: string): Promise<void> => {
    try {
      setCalculating(true)
      setError(null)

      await taxService.deleteCalculation(calculationId)

      // Remove from list
      setCalculations((prev) => prev.filter((calc) => calc.id !== calculationId))

      if (currentCalculation?.id === calculationId) {
        setCurrentCalculation(null)
      }

      console.log('[useTaxCalculations] Calculation deleted')
    } catch (err: any) {
      console.error('[useTaxCalculations] Error deleting calculation:', err)
      setError(err.message || 'Failed to delete calculation')
      throw err
    } finally {
      setCalculating(false)
    }
  }

  // Helper: Get total taxes for a month
  const getMonthlyTotal = (monthNum: number, yearNum: number): number => {
    const calc = calculations.find((c) => c.month === monthNum && c.year === yearNum)
    return calc?.total_tax_amount || 0
  }

  // Helper: Get tax burden percentage for current month
  const getTaxBurden = (): number | null => {
    if (!currentCalculation || !currentCalculation.revenue_base || currentCalculation.revenue_base === 0) {
      return null
    }

    return (currentCalculation.total_tax_amount / currentCalculation.revenue_base) * 100
  }

  return {
    calculations,
    currentCalculation,
    loading,
    calculating,
    error,
    calculateTaxes,
    updateManualCalculation,
    deleteCalculation,
    refreshCalculations: fetchCalculations,
    getMonthlyTotal,
    getTaxBurden,
  }
}
