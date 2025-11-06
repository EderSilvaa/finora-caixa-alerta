// useTransactionStats Hook - Calculate financial statistics from real transaction data
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface TransactionStats {
  currentBalance: number
  totalRevenue: number
  totalExpenses: number
  monthlySavings: number
  monthlyGrowth: number
  loading: boolean
  error: string | null
}

export interface MonthlyData {
  month: string
  receita: number
  despesas: number
}

export interface CashFlowProjection {
  day: number
  balance: number
}

export function useTransactionStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<TransactionStats>({
    currentBalance: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    monthlySavings: 0,
    monthlyGrowth: 0,
    loading: true,
    error: null,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [cashFlowProjection, setCashFlowProjection] = useState<CashFlowProjection[]>([])

  useEffect(() => {
    if (!user?.id) return

    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }))

        // Get current month's start and end dates
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Get previous month's dates for comparison
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // Fetch current month transactions
        const { data: currentMonthTransactions, error: currentError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', currentMonthStart.toISOString())
          .lte('date', currentMonthEnd.toISOString())

        if (currentError) throw currentError

        // Fetch previous month transactions for growth calculation
        const { data: previousMonthTransactions, error: previousError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', previousMonthStart.toISOString())
          .lte('date', previousMonthEnd.toISOString())

        if (previousError) throw previousError

        // Calculate current month stats
        const currentRevenue = currentMonthTransactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        const currentExpenses = currentMonthTransactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        // Calculate previous month revenue for growth
        const previousRevenue = previousMonthTransactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        // Calculate monthly growth percentage
        const growth = previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0

        // Calculate current balance (all-time income - all-time expenses)
        const { data: allTransactions, error: allError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)

        if (allError) throw allError

        const allTimeRevenue = allTransactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        const allTimeExpenses = allTransactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        const balance = allTimeRevenue - allTimeExpenses

        setStats({
          currentBalance: balance,
          totalRevenue: currentRevenue,
          totalExpenses: currentExpenses,
          monthlySavings: currentRevenue - currentExpenses,
          monthlyGrowth: Number(growth.toFixed(1)),
          loading: false,
          error: null,
        })

        // Fetch last 6 months data for chart
        await fetchMonthlyData()

        // Generate cash flow projection
        await generateCashFlowProjection(balance, currentRevenue, currentExpenses)
      } catch (error: any) {
        console.error('Error fetching transaction stats:', error)
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load statistics',
        }))
      }
    }

    fetchStats()
  }, [user?.id])

  const fetchMonthlyData = async () => {
    if (!user?.id) return

    try {
      const now = new Date()
      const months: MonthlyData[] = []

      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString())
          .lte('date', monthEnd.toISOString())

        if (error) throw error

        const revenue = transactions
          ?.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        const expenses = transactions
          ?.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0) || 0

        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        months.push({
          month: monthNames[monthStart.getMonth()],
          receita: revenue,
          despesas: expenses,
        })
      }

      setMonthlyData(months)
    } catch (error: any) {
      console.error('Error fetching monthly data:', error)
    }
  }

  const generateCashFlowProjection = async (
    currentBalance: number,
    monthlyRevenue: number,
    monthlyExpenses: number
  ) => {
    // Simple projection: assume current revenue/expense pattern continues
    const dailyNet = (monthlyRevenue - monthlyExpenses) / 30
    const projection: CashFlowProjection[] = []

    let balance = currentBalance

    // Project for next 102 days
    for (let day = 0; day <= 102; day += 15) {
      projection.push({
        day,
        balance: Math.max(0, Math.round(balance)),
      })
      balance += dailyNet * 15
    }

    setCashFlowProjection(projection)
  }

  const calculateDaysUntilZero = (): number => {
    if (stats.currentBalance <= 0) return 0
    if (stats.monthlySavings >= 0) return 999 // Positive cash flow, won't reach zero

    const dailyBurn = Math.abs(stats.monthlySavings) / 30
    const daysUntilZero = Math.floor(stats.currentBalance / dailyBurn)

    return daysUntilZero
  }

  return {
    stats,
    monthlyData,
    cashFlowProjection,
    daysUntilZero: calculateDaysUntilZero(),
  }
}
