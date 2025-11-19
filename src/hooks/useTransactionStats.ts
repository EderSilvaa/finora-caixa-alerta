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

interface TransactionData {
  type: 'income' | 'expense'
  amount: number
  date?: string
  description?: string
}

// localStorage cache keys
const CACHE_KEYS = {
  STATS: 'finora_stats_cache',
  MONTHLY_DATA: 'finora_monthly_data_cache',
  PROJECTION: 'finora_projection_cache',
  TIMESTAMP: 'finora_cache_timestamp',
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

// Save data to localStorage cache
const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString())
  } catch (error) {
    console.error('Error saving to cache:', error)
  }
}

// Load data from localStorage cache
const loadFromCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP)
    if (!timestamp) return null

    const age = Date.now() - parseInt(timestamp)
    if (age > CACHE_DURATION) {
      // Cache expired, clear it
      clearCache()
      return null
    }

    return JSON.parse(cached)
  } catch (error) {
    console.error('Error loading from cache:', error)
    return null
  }
}

// Clear all cache
const clearCache = () => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
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

    // Load from cache immediately for instant display
    const cachedStats = loadFromCache(CACHE_KEYS.STATS)
    const cachedMonthlyData = loadFromCache(CACHE_KEYS.MONTHLY_DATA)
    const cachedProjection = loadFromCache(CACHE_KEYS.PROJECTION)

    if (cachedStats) {
      setStats({ ...cachedStats, loading: true }) // Keep loading true while fetching fresh data
    }
    if (cachedMonthlyData) {
      setMonthlyData(cachedMonthlyData)
    }
    if (cachedProjection) {
      setCashFlowProjection(cachedProjection)
    }

    const fetchStats = async () => {
      try {
        if (!cachedStats) {
          // Only show loading if no cache
          setStats((prev) => ({ ...prev, loading: true, error: null }))
        }

        // OPTIMIZED: Single query to fetch all transactions with date
        // Instead of 3 separate queries, fetch once and filter in memory
        const { data: allTransactions, error: allError } = await supabase
          .from('transactions')
          .select('type, amount, date')
          .eq('user_id', user.id)
          .order('date', { ascending: true }) as { data: TransactionData[] | null; error: any }

        if (allError) throw allError

        const transactions = allTransactions || []

        // Get current month's start and end dates
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Get previous month's dates for comparison
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // Filter transactions in memory (much faster than 3 separate DB queries)
        const currentMonthTransactions = transactions.filter(t => {
          if (!t.date) return false
          const date = new Date(t.date)
          return date >= currentMonthStart && date <= currentMonthEnd
        })

        const previousMonthTransactions = transactions.filter(t => {
          if (!t.date) return false
          const date = new Date(t.date)
          return date >= previousMonthStart && date <= previousMonthEnd
        })

        // Calculate current month stats
        const currentRevenue = currentMonthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const currentExpenses = currentMonthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        // Calculate previous month revenue for growth
        const previousRevenue = previousMonthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        // Calculate monthly growth percentage
        const growth = previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0

        // Calculate current balance (all-time income - all-time expenses)
        const allTimeRevenue = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const allTimeExpenses = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        const balance = allTimeRevenue - allTimeExpenses

        const statsData = {
          currentBalance: balance,
          totalRevenue: currentRevenue,
          totalExpenses: currentExpenses,
          monthlySavings: currentRevenue - currentExpenses,
          monthlyGrowth: Number(growth.toFixed(1)),
          loading: false,
          error: null,
        }

        setStats(statsData)
        saveToCache(CACHE_KEYS.STATS, statsData)

        // Generate monthly data from the already-fetched transactions
        await generateMonthlyDataFromTransactions(transactions)

        // Generate cash flow projection from the same transactions (no extra query)
        await generateCashFlowProjection(balance, currentRevenue, currentExpenses, transactions)
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

  // OPTIMIZED: Process monthly data from already-fetched transactions (no additional queries)
  const generateMonthlyDataFromTransactions = async (transactions: TransactionData[]) => {
    try {
      const now = new Date()
      const months: MonthlyData[] = []
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

      // Get last 6 months of data by filtering the already-fetched transactions
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

        // Filter transactions for this month (in memory, no DB query)
        const monthTransactions = transactions.filter(t => {
          if (!t.date) return false
          const date = new Date(t.date)
          return date >= monthStart && date <= monthEnd
        })

        const revenue = monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const expenses = monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        months.push({
          month: monthNames[monthStart.getMonth()],
          receita: revenue,
          despesas: expenses,
        })
      }

      setMonthlyData(months)
      saveToCache(CACHE_KEYS.MONTHLY_DATA, months)
    } catch (error: any) {
      console.error('Error generating monthly data:', error)
    }
  }

  // Helper functions for advanced projection (defined before use)
  const calculateDailyBalances = (transactions: TransactionData[]) => {
    const dailyMap = new Map<string, number>()

    transactions.forEach(t => {
      if (!t.date) return
      const date = new Date(t.date).toISOString().split('T')[0]
      const current = dailyMap.get(date) || 0
      const change = t.type === 'income' ? t.amount : -t.amount
      dailyMap.set(date, current + change)
    })

    return Array.from(dailyMap.values())
  }

  const calculateLinearRegression = (values: number[]) => {
    const n = values.length
    if (n === 0) return { slope: 0, intercept: 0 }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

    values.forEach((y, x) => {
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope: slope || 0, intercept: intercept || 0 }
  }

  const calculateEMA = (values: number[], period: number) => {
    if (values.length === 0) return { value: 0, trend: 0 }

    const multiplier = 2 / (period + 1)
    let ema = values[0]

    for (let i = 1; i < values.length; i++) {
      ema = (values[i] - ema) * multiplier + ema
    }

    const recentValues = values.slice(-Math.min(7, values.length))
    const trend = recentValues.length > 1
      ? (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length
      : 0

    return { value: ema, trend }
  }

  const detectRecurringTransactions = (transactions: TransactionData[]) => {
    const patterns: Array<{ amount: number; frequency: number; type: 'income' | 'expense' }> = []
    const amountMap = new Map<number, number>()

    transactions.forEach(t => {
      const roundedAmount = Math.round(t.amount / 10) * 10
      const count = amountMap.get(roundedAmount) || 0
      amountMap.set(roundedAmount, count + 1)
    })

    amountMap.forEach((count, amount) => {
      if (count >= 3) {
        const matchingTransactions = transactions.filter(
          t => Math.abs(t.amount - amount) <= 10
        )
        const type = matchingTransactions[0]?.type || 'expense'
        const avgFrequency = 30

        patterns.push({ amount, frequency: avgFrequency, type })
      }
    })

    return patterns
  }

  const analyzeSeasonality = (transactions: TransactionData[]) => {
    const monthlyTotals = new Array(12).fill(0)
    const monthlyCounts = new Array(12).fill(0)

    transactions.forEach(t => {
      if (!t.date) return
      const month = new Date(t.date).getMonth()
      const netChange = t.type === 'income' ? t.amount : -t.amount
      monthlyTotals[month] += netChange
      monthlyCounts[month]++
    })

    const monthlyAverages = monthlyTotals.map((total, i) =>
      monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0
    )

    const overallAverage = monthlyAverages.reduce((a, b) => a + b, 0) / 12
    const factors = monthlyAverages.map(avg =>
      overallAverage !== 0 ? avg / overallAverage : 1
    )

    return factors.map(f => isNaN(f) ? 1 : f)
  }

  const getRecurringAdjustment = (
    day: number,
    patterns: Array<{ amount: number; frequency: number; type: 'income' | 'expense' }>
  ) => {
    let adjustment = 0

    patterns.forEach(pattern => {
      if (day % pattern.frequency === 0) {
        adjustment += pattern.type === 'income' ? pattern.amount : -pattern.amount
      }
    })

    return adjustment / 30
  }

  const generateSimpleProjection = (
    currentBalance: number,
    monthlyRevenue: number,
    monthlyExpenses: number
  ) => {
    console.log('[Fallback] Using simple projection')
    const dailyNet = (monthlyRevenue - monthlyExpenses) / 30
    const projection: CashFlowProjection[] = []
    let balance = currentBalance

    for (let day = 0; day <= 120; day++) {
      projection.push({ day, balance: Math.round(balance) })
      balance += dailyNet
      balance = balance * (1 + (Math.random() - 0.5) * 0.06)
    }

    setCashFlowProjection(projection)
    saveToCache(CACHE_KEYS.PROJECTION, projection)
  }

  const generateCashFlowProjection = async (
    currentBalance: number,
    monthlyRevenue: number,
    monthlyExpenses: number,
    allTransactions: TransactionData[] // OPTIMIZED: Receive transactions instead of fetching again
  ) => {
    try {
      // Filter for last 6 months only (for ML projection)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const transactions = allTransactions.filter(t => {
        if (!t.date) return false
        const date = new Date(t.date)
        return date >= sixMonthsAgo
      })

      // If no historical data, use simple projection
      if (transactions.length < 10) {
        console.log('[Projection] Insufficient data, using simple projection')
        generateSimpleProjection(currentBalance, monthlyRevenue, monthlyExpenses)
        return
      }

      // 1. LINEAR REGRESSION - Calculate trend from historical data
      const dailyBalances = calculateDailyBalances(transactions)
      const trend = calculateLinearRegression(dailyBalances)

      // 2. EXPONENTIAL MOVING AVERAGE - Give more weight to recent data
      const ema = calculateEMA(dailyBalances, 14) // 14-day EMA

      // 3. PATTERN DETECTION - Identify recurring transactions
      const recurringPatterns = detectRecurringTransactions(transactions)

      // 4. SEASONALITY ANALYSIS - Detect monthly spending patterns
      const seasonalityFactors = analyzeSeasonality(transactions)

      // 5. MACHINE LEARNING PROJECTION - Combine all factors
      const projection: CashFlowProjection[] = []
      const projectionDays = 120
      let balance = currentBalance

      for (let day = 0; day <= projectionDays; day++) {
        // Base projection using EMA
        const baseChange = ema.trend

        // Apply linear regression trend
        const trendAdjustment = trend.slope

        // Apply recurring patterns (salaries, bills, etc.)
        const recurringAdjustment = getRecurringAdjustment(day, recurringPatterns)

        // Apply seasonality (monthly patterns)
        const currentMonth = new Date().getMonth()
        const projectedMonth = (currentMonth + Math.floor(day / 30)) % 12
        const seasonalFactor = seasonalityFactors[projectedMonth] || 1

        // Combine all factors with weighted importance
        const dailyChange = (
          baseChange * 0.3 +           // 30% EMA
          trendAdjustment * 0.25 +     // 25% Linear trend
          recurringAdjustment * 0.35   // 35% Recurring patterns (most reliable)
        ) * seasonalFactor              // Apply seasonal adjustment

        // Add realistic variance (±3% instead of 5% for more stability)
        const variance = (Math.random() - 0.5) * 0.06
        const adjustedChange = dailyChange * (1 + variance)

        balance += adjustedChange

        projection.push({
          day,
          balance: Math.round(balance),
        })
      }

      console.log('[Advanced ML Projection] Generated with:', {
        dataPoints: transactions.length,
        trend: trend.slope > 0 ? 'positive' : 'negative',
        emaPoints: dailyBalances.length,
        recurringPatterns: recurringPatterns.length,
        seasonalVariance: Math.max(...seasonalityFactors) - Math.min(...seasonalityFactors)
      })

      setCashFlowProjection(projection)
      saveToCache(CACHE_KEYS.PROJECTION, projection)
    } catch (error: any) {
      console.error('Error generating advanced projection:', error)
      // Fallback to simple projection
      generateSimpleProjection(currentBalance, monthlyRevenue, monthlyExpenses)
    }
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
