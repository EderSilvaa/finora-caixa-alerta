// useTaxOptimization Hook - AI-powered tax regime optimization
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { taxService } from '@/services/tax.service'
import type { TaxOptimization } from '@/types/tax'

export function useTaxOptimization() {
  const { user } = useAuth()
  const [optimization, setOptimization] = useState<TaxOptimization | null>(null)
  const [history, setHistory] = useState<TaxOptimization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    fetchHistory()
  }, [user?.id])

  const fetchHistory = async () => {
    if (!user?.id) return

    try {
      const data = await taxService.getOptimizationHistory(user.id, 10)
      setHistory(data)

      // Set latest optimization if exists and is still pending
      const latest = data.find((opt) => opt.user_action === 'pending' || !opt.user_action)
      if (latest) {
        setOptimization(latest)
      }

      console.log('[useTaxOptimization] Loaded optimization history:', data.length)
    } catch (err: any) {
      console.error('[useTaxOptimization] Error fetching history:', err)
    }
  }

  const runOptimization = async (): Promise<TaxOptimization | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      console.log('[useTaxOptimization] Requesting AI optimization...')

      const result = await taxService.requestOptimization(user.id)
      setOptimization(result)

      // Refresh history
      await fetchHistory()

      console.log('[useTaxOptimization] Optimization completed:', result)

      return result
    } catch (err: any) {
      console.error('[useTaxOptimization] Error running optimization:', err)
      setError(err.message || 'Failed to run tax optimization')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const acceptOptimization = async (optimizationId: string): Promise<void> => {
    try {
      setError(null)

      await taxService.respondToOptimization(optimizationId, 'accepted')

      // Update current optimization
      if (optimization?.id === optimizationId) {
        setOptimization((prev) =>
          prev ? { ...prev, user_action: 'accepted', action_date: new Date().toISOString() } : null
        )
      }

      // Update history
      setHistory((prev) =>
        prev.map((opt) =>
          opt.id === optimizationId
            ? { ...opt, user_action: 'accepted', action_date: new Date().toISOString() }
            : opt
        )
      )

      console.log('[useTaxOptimization] Optimization accepted')
    } catch (err: any) {
      console.error('[useTaxOptimization] Error accepting optimization:', err)
      setError(err.message || 'Failed to accept optimization')
      throw err
    }
  }

  const rejectOptimization = async (optimizationId: string): Promise<void> => {
    try {
      setError(null)

      await taxService.respondToOptimization(optimizationId, 'rejected')

      // Update current optimization
      if (optimization?.id === optimizationId) {
        setOptimization(null)
      }

      // Update history
      setHistory((prev) =>
        prev.map((opt) =>
          opt.id === optimizationId
            ? { ...opt, user_action: 'rejected', action_date: new Date().toISOString() }
            : opt
        )
      )

      console.log('[useTaxOptimization] Optimization rejected')
    } catch (err: any) {
      console.error('[useTaxOptimization] Error rejecting optimization:', err)
      setError(err.message || 'Failed to reject optimization')
      throw err
    }
  }

  // Helper: Check if optimization suggests savings
  const hasPotentialSavings = (): boolean => {
    return optimization ? optimization.potential_savings > 0 : false
  }

  // Helper: Get savings percentage
  const getSavingsPercentage = (): number => {
    if (!optimization || optimization.current_annual_tax === 0) return 0
    return (optimization.potential_savings / optimization.current_annual_tax) * 100
  }

  return {
    optimization,
    history,
    loading,
    error,
    runOptimization,
    acceptOptimization,
    rejectOptimization,
    refreshHistory: fetchHistory,
    hasPotentialSavings,
    getSavingsPercentage,
  }
}
