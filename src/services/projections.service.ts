// Cash Flow Projections Service
import { supabase } from '@/lib/supabase'
import type { Projection, Transaction } from '@/types'
import { transactionsService } from './transactions.service'

export const projectionsService = {
  /**
   * Get projections for user
   */
  async getProjections(userId: string, limit = 102): Promise<Projection[]> {
    const { data, error } = await supabase
      .from('projections')
      .select('*')
      .eq('user_id', userId)
      .order('projection_date', { ascending: true })
      .limit(limit)

    if (error) throw error

    return data.map(p => ({
      id: p.id,
      userId: p.user_id,
      projectionDate: p.projection_date,
      projectedBalance: Number(p.projected_balance),
      confidenceLevel: Number(p.confidence_level),
      createdAt: p.created_at,
    }))
  },

  /**
   * Calculate cash flow projection
   * Simple algorithm based on historical data
   */
  async calculateProjection(userId: string, days = 102): Promise<Projection[]> {
    // Get historical transactions (last 90 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    const transactions = await transactionsService.getTransactionsByDateRange(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    )

    // Calculate current balance
    const currentBalance = await transactionsService.getCurrentBalance(userId)

    // Calculate average daily income and expenses
    const totalDays = 90
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const avgDailyIncome = totalIncome / totalDays
    const avgDailyExpense = totalExpenses / totalDays
    const avgDailyNet = avgDailyIncome - avgDailyExpense

    // Generate projections
    const projections: Projection[] = []
    let balance = currentBalance

    for (let day = 0; day <= days; day++) {
      const projectionDate = new Date()
      projectionDate.setDate(projectionDate.getDate() + day)

      // Add some variance (±10%)
      const variance = day === 0 ? 0 : (Math.random() - 0.5) * 0.2
      const dailyNet = avgDailyNet * (1 + variance)

      balance += dailyNet

      // Confidence decreases over time
      const confidence = Math.max(0.3, 1 - (day / days) * 0.7)

      projections.push({
        id: `proj-${day}`,
        userId,
        projectionDate: projectionDate.toISOString(),
        projectedBalance: Number(balance.toFixed(2)),
        confidenceLevel: Number(confidence.toFixed(2)),
      })
    }

    return projections
  },

  /**
   * Save projections to database
   */
  async saveProjections(projections: Omit<Projection, 'id' | 'createdAt'>[]): Promise<void> {
    // Delete old projections for this user
    if (projections.length > 0) {
      await supabase
        .from('projections')
        .delete()
        .eq('user_id', projections[0].userId)
    }

    // Insert new projections
    const { error } = await supabase.from('projections').insert(
      projections.map(p => ({
        user_id: p.userId,
        projection_date: p.projectionDate,
        projected_balance: p.projectedBalance,
        confidence_level: p.confidenceLevel,
      }))
    )

    if (error) throw error
  },

  /**
   * Calculate days until balance reaches zero
   */
  async calculateDaysUntilZero(userId: string): Promise<number | null> {
    const projections = await this.calculateProjection(userId, 102)

    for (let i = 0; i < projections.length; i++) {
      if (projections[i].projectedBalance <= 0) {
        return i
      }
    }

    return null // Balance doesn't reach zero in projection period
  },

  /**
   * Get chart data for projections
   */
  async getProjectionChartData(userId: string) {
    const projections = await this.calculateProjection(userId, 102)

    // Sample data points for chart (every 15 days + day 0 and final day)
    const chartPoints = [0, 15, 30, 45, 60, 75, 90, 102]

    return chartPoints.map(day => ({
      day,
      balance: projections[day]?.projectedBalance || 0,
    }))
  },
}
