// useRecurringRevenue Hook - Detect recurring revenue patterns and predict next income
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface RecurringRevenue {
  id: string
  client_name: string // Extracted from description
  average_amount: number
  typical_day: number // Day of month (1-31)
  frequency_days: number // Average days between payments
  last_payment_date: string
  next_expected_date: string
  days_since_last: number
  is_overdue: boolean
  confidence: number // 0-100
  pattern_description: string
}

export interface RevenueAlert {
  id: string
  recurring_revenue_id: string
  client_name: string
  expected_amount: number
  days_overdue: number
  severity: 'high' | 'medium' | 'low'
  message: string
}

export function useRecurringRevenue() {
  const { user } = useAuth()
  const [recurringRevenues, setRecurringRevenues] = useState<RecurringRevenue[]>([])
  const [alerts, setAlerts] = useState<RevenueAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const analyzeRecurringRevenue = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get last 6 months of income transactions
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: transactions, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .gte('date', sixMonthsAgo.toISOString())
          .order('date', { ascending: true })

        if (fetchError) throw fetchError

        if (!transactions || transactions.length < 2) {
          setRecurringRevenues([])
          setAlerts([])
          setLoading(false)
          return
        }

        // Group by client name (extracted from description)
        const byClient = groupByClient(transactions)

        // Detect patterns for each client
        const patterns: RecurringRevenue[] = []
        Object.entries(byClient).forEach(([clientName, clientTransactions]) => {
          if (clientTransactions.length >= 2) { // At least 2 transactions to detect pattern
            const pattern = detectPattern(clientName, clientTransactions)
            if (pattern) {
              patterns.push(pattern)
            }
          }
        })

        setRecurringRevenues(patterns)

        // Generate alerts for overdue payments
        const newAlerts = generateAlerts(patterns)
        setAlerts(newAlerts)

        console.log('[useRecurringRevenue] Detected', patterns.length, 'recurring revenue patterns')
        console.log('[useRecurringRevenue] Generated', newAlerts.length, 'alerts')

        setLoading(false)
      } catch (err: any) {
        console.error('[useRecurringRevenue] Error:', err)
        setError(err.message || 'Failed to analyze recurring revenue')
        setLoading(false)
      }
    }

    analyzeRecurringRevenue()
  }, [user?.id])

  return {
    recurringRevenues,
    alerts,
    loading,
    error,
    totalExpectedRevenue: recurringRevenues.reduce((sum, r) => sum + r.average_amount, 0),
    overdueCount: alerts.filter(a => a.severity === 'high').length,
  }
}

/**
 * Group transactions by client name (extracted from description)
 */
function groupByClient(transactions: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}

  transactions.forEach(tx => {
    // Extract potential client name from description
    // Common patterns: "Pagamento Cliente X", "Venda - Empresa Y", "Cliente Z"
    const clientName = extractClientName(tx.description)

    if (!grouped[clientName]) {
      grouped[clientName] = []
    }
    grouped[clientName].push(tx)
  })

  return grouped
}

/**
 * Extract client name from transaction description
 */
function extractClientName(description: string): string {
  if (!description) return 'Cliente Desconhecido'

  // Remove common prefixes
  let cleaned = description
    .replace(/pagamento\s+/gi, '')
    .replace(/venda\s+/gi, '')
    .replace(/cliente\s+/gi, '')
    .replace(/empresa\s+/gi, '')
    .replace(/\s*-\s*/g, ' ')
    .trim()

  // Get first 2-3 words as client name
  const words = cleaned.split(' ')
  return words.slice(0, Math.min(3, words.length)).join(' ') || 'Cliente Desconhecido'
}

/**
 * Detect recurring pattern in client transactions
 */
function detectPattern(clientName: string, transactions: any[]): RecurringRevenue | null {
  if (transactions.length < 2) return null

  // Sort by date
  const sorted = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate average amount
  const avgAmount = sorted.reduce((sum, tx) => sum + Number(tx.amount), 0) / sorted.length

  // Calculate intervals between payments (in days)
  const intervals: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    intervals.push(diffDays)
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length

  // Calculate standard deviation to check consistency
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
  const stdDev = Math.sqrt(variance)

  // Only consider as recurring if intervals are relatively consistent
  // (standard deviation < 30% of average)
  const coefficientOfVariation = stdDev / avgInterval
  if (coefficientOfVariation > 0.3 && intervals.length > 2) {
    return null // Too inconsistent
  }

  // Calculate confidence based on number of occurrences and consistency
  const occurrenceScore = Math.min(sorted.length / 6, 1) * 50 // Max 50 points
  const consistencyScore = Math.max(0, (1 - coefficientOfVariation) * 50) // Max 50 points
  const confidence = Math.round(occurrenceScore + consistencyScore)

  // Last payment info
  const lastPayment = sorted[sorted.length - 1]
  const lastDate = new Date(lastPayment.date)
  const now = new Date()
  const daysSinceLast = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate next expected date
  const nextExpectedDate = new Date(lastDate)
  nextExpectedDate.setDate(nextExpectedDate.getDate() + Math.round(avgInterval))

  // Typical day of month
  const daysOfMonth = sorted.map(tx => new Date(tx.date).getDate())
  const avgDayOfMonth = Math.round(daysOfMonth.reduce((sum, d) => sum + d, 0) / daysOfMonth.length)

  // Check if overdue (tolerance: 5 days)
  const isOverdue = daysSinceLast > avgInterval + 5

  // Generate pattern description
  const patternDescription = generatePatternDescription(avgInterval, avgAmount, sorted.length)

  return {
    id: `recurring_${clientName.replace(/\s+/g, '_').toLowerCase()}`,
    client_name: clientName,
    average_amount: Number(avgAmount.toFixed(2)),
    typical_day: avgDayOfMonth,
    frequency_days: Math.round(avgInterval),
    last_payment_date: lastPayment.date,
    next_expected_date: nextExpectedDate.toISOString(),
    days_since_last: daysSinceLast,
    is_overdue: isOverdue,
    confidence,
    pattern_description: patternDescription,
  }
}

/**
 * Generate human-readable pattern description
 */
function generatePatternDescription(intervalDays: number, amount: number, count: number): string {
  let frequency = ''

  if (intervalDays <= 10) {
    frequency = 'semanalmente'
  } else if (intervalDays <= 20) {
    frequency = 'quinzenalmente'
  } else if (intervalDays <= 35) {
    frequency = 'mensalmente'
  } else if (intervalDays <= 50) {
    frequency = 'a cada 45 dias'
  } else if (intervalDays <= 70) {
    frequency = 'bimestralmente'
  } else {
    frequency = `a cada ${Math.round(intervalDays)} dias`
  }

  return `Paga ${frequency} (~R$ ${amount.toFixed(0)}) há ${count} vezes`
}

/**
 * Generate alerts for overdue payments
 */
function generateAlerts(patterns: RecurringRevenue[]): RevenueAlert[] {
  const alerts: RevenueAlert[] = []

  patterns.forEach(pattern => {
    if (!pattern.is_overdue) return

    const daysOverdue = pattern.days_since_last - pattern.frequency_days

    let severity: 'high' | 'medium' | 'low' = 'low'
    if (daysOverdue > 15) severity = 'high'
    else if (daysOverdue > 7) severity = 'medium'

    let message = ''
    if (severity === 'high') {
      message = `${pattern.client_name} está ${daysOverdue} dias atrasado! Última transação: ${new Date(pattern.last_payment_date).toLocaleDateString('pt-BR')}. Valor esperado: R$ ${pattern.average_amount.toFixed(2)}`
    } else if (severity === 'medium') {
      message = `${pattern.client_name} costuma pagar todo dia ${pattern.typical_day}. Já se passaram ${daysOverdue} dias desde o pagamento esperado.`
    } else {
      message = `${pattern.client_name}: pagamento levemente atrasado (${daysOverdue} dias)`
    }

    alerts.push({
      id: `alert_${pattern.id}`,
      recurring_revenue_id: pattern.id,
      client_name: pattern.client_name,
      expected_amount: pattern.average_amount,
      days_overdue: daysOverdue,
      severity,
      message,
    })
  })

  return alerts.sort((a, b) => {
    // Sort by severity and then by days overdue
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.days_overdue - a.days_overdue
  })
}
