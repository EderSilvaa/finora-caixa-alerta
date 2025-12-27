// useTaxPayments Hook - Manage tax payments and deadlines
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { taxService } from '@/services/tax.service'
import type { TaxPayment, TaxPaymentInput } from '@/types/tax'

export function useTaxPayments(days = 30) {
  const { user } = useAuth()
  const [upcomingPayments, setUpcomingPayments] = useState<TaxPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchPayments()
  }, [user?.id, days])

  const fetchPayments = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const data = await taxService.getUpcomingPayments(user.id, days)
      setUpcomingPayments(data)

      console.log('[useTaxPayments] Loaded', data.length, 'upcoming payments')
    } catch (err: any) {
      console.error('[useTaxPayments] Error fetching payments:', err)
      setError(err.message || 'Failed to load tax payments')
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (payment: TaxPaymentInput): Promise<TaxPayment> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setError(null)

      const newPayment = await taxService.createPayment(user.id, payment)

      // Add to list
      setUpcomingPayments((prev) => [...prev, newPayment])

      console.log('[useTaxPayments] Payment created:', newPayment.id)

      return newPayment
    } catch (err: any) {
      console.error('[useTaxPayments] Error creating payment:', err)
      setError(err.message || 'Failed to create payment')
      throw err
    }
  }

  const markPaid = async (
    paymentId: string,
    paidAmount: number,
    transactionId?: string
  ): Promise<void> => {
    try {
      setError(null)

      const updated = await taxService.markPaymentPaid(paymentId, paidAmount, transactionId)

      // Remove from upcoming payments
      setUpcomingPayments((prev) => prev.filter((p) => p.id !== paymentId))

      console.log('[useTaxPayments] Payment marked as paid:', updated.id)
    } catch (err: any) {
      console.error('[useTaxPayments] Error marking payment as paid:', err)
      setError(err.message || 'Failed to mark payment as paid')
      throw err
    }
  }

  // Helper: Get next payment due
  const getNextPaymentDue = (): TaxPayment | null => {
    if (upcomingPayments.length === 0) return null
    return upcomingPayments[0] // Already sorted by due_date ascending
  }

  // Helper: Get critical payments (due in <= 3 days)
  const getCriticalPayments = (): TaxPayment[] => {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    return upcomingPayments.filter((payment) => {
      const dueDate = new Date(payment.due_date)
      return dueDate <= threeDaysFromNow
    })
  }

  // Helper: Get total upcoming payments amount
  const getTotalUpcoming = (): number => {
    return upcomingPayments.reduce((total, payment) => total + payment.amount, 0)
  }

  return {
    upcomingPayments,
    loading,
    error,
    createPayment,
    markPaid,
    refreshPayments: fetchPayments,
    getNextPaymentDue,
    getCriticalPayments,
    getTotalUpcoming,
  }
}
