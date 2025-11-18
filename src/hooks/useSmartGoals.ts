// useSmartGoals Hook - Manage intelligent financial goals with real-time tracking
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface FinancialGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_amount: number
  current_amount: number
  progress_percentage: number
  target_date: string | null
  started_at: string
  is_ai_suggested: boolean
  daily_target: number | null
  weekly_target: number | null
  on_track: boolean
  days_behind: number
  suggested_actions: string[] | null
  status: 'active' | 'paused' | 'completed' | 'failed'
  completed_at: string | null
  category: 'savings' | 'emergency_fund' | 'debt_payment' | 'business_expansion' | 'equipment' | 'reserve' | 'custom'
  created_at: string
  updated_at: string
}

export interface CreateGoalData {
  title: string
  description?: string
  target_amount: number
  current_amount?: number
  target_date?: string
  category?: FinancialGoal['category']
  is_ai_suggested?: boolean
}

export function useSmartGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    fetchGoals()
  }, [user?.id])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        // Se a tabela não existir, retorna array vazio sem crashar
        if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist')) {
          console.warn('[useSmartGoals] Table financial_goals does not exist yet. Run migration.')
          setGoals([])
          return
        }
        throw fetchError
      }

      setGoals(data || [])
      console.log('[useSmartGoals] Loaded', data?.length || 0, 'goals')
    } catch (err: any) {
      console.error('[useSmartGoals] Error fetching goals:', err)
      setError(err.message || 'Failed to load goals')
      setGoals([]) // Set empty array to prevent blocking
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: CreateGoalData): Promise<FinancialGoal | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      // Calculate daily and weekly targets if target_date is provided
      let daily_target = null
      let weekly_target = null

      if (goalData.target_date) {
        const now = new Date()
        const targetDate = new Date(goalData.target_date)
        const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysRemaining > 0) {
          const remaining_amount = goalData.target_amount - (goalData.current_amount || 0)
          daily_target = remaining_amount / daysRemaining
          weekly_target = daily_target * 7
        }
      }

      const { data, error: insertError } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description || null,
          target_amount: goalData.target_amount,
          current_amount: goalData.current_amount || 0,
          target_date: goalData.target_date || null,
          category: goalData.category || 'savings',
          is_ai_suggested: goalData.is_ai_suggested || false,
          daily_target,
          weekly_target,
          on_track: true,
          days_behind: 0,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      console.log('[useSmartGoals] Created goal:', data.title)

      // Refresh goals list
      await fetchGoals()

      return data
    } catch (err: any) {
      console.error('[useSmartGoals] Error creating goal:', err)
      throw new Error(`Failed to create goal: ${err.message}`)
    }
  }

  const updateGoalProgress = async (goalId: string, newAmount: number): Promise<void> => {
    try {
      // Get goal to calculate if on track
      const goal = goals.find(g => g.id === goalId)
      if (!goal) throw new Error('Goal not found')

      // Calculate new progress
      const progress_percentage = Math.min(100, Math.round((newAmount / goal.target_amount) * 100))

      // Check if on track
      let on_track = true
      let days_behind = 0

      if (goal.target_date) {
        const now = new Date()
        const targetDate = new Date(goal.target_date)
        const startDate = new Date(goal.started_at)

        const days_total = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const days_elapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        // Expected progress at this point
        const expected_progress = (days_elapsed / days_total) * goal.target_amount

        // Check if within 10% tolerance
        on_track = newAmount >= (expected_progress * 0.9)

        if (!on_track) {
          const daily_rate = goal.target_amount / days_total
          days_behind = Math.floor((expected_progress - newAmount) / daily_rate)
        }
      }

      // Update goal
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({
          current_amount: newAmount,
          on_track,
          days_behind,
          status: progress_percentage >= 100 ? 'completed' : 'active',
          completed_at: progress_percentage >= 100 ? new Date().toISOString() : null,
        })
        .eq('id', goalId)

      if (updateError) throw updateError

      console.log('[useSmartGoals] Updated goal progress:', goalId)

      // Refresh goals
      await fetchGoals()
    } catch (err: any) {
      console.error('[useSmartGoals] Error updating goal progress:', err)
      throw new Error(`Failed to update goal: ${err.message}`)
    }
  }

  const deleteGoal = async (goalId: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)

      if (deleteError) throw deleteError

      console.log('[useSmartGoals] Deleted goal:', goalId)

      // Refresh goals
      await fetchGoals()
    } catch (err: any) {
      console.error('[useSmartGoals] Error deleting goal:', err)
      throw new Error(`Failed to delete goal: ${err.message}`)
    }
  }

  const generateAIGoals = async (
    currentBalance: number,
    monthlyIncome: number,
    monthlyExpenses: number
  ): Promise<CreateGoalData[]> => {
    // Generate smart goal suggestions based on financial health
    const suggestions: CreateGoalData[] = []
    const monthlySavings = monthlyIncome - monthlyExpenses

    // 1. Emergency Fund (3-6 months of expenses)
    if (currentBalance < monthlyExpenses * 3) {
      const targetAmount = monthlyExpenses * 6
      const monthsToComplete = monthlySavings > 0 ? Math.ceil((targetAmount - currentBalance) / monthlySavings) : 12

      suggestions.push({
        title: 'Fundo de Emergência',
        description: 'Reserve de 3-6 meses de despesas para emergências',
        target_amount: targetAmount,
        current_amount: currentBalance,
        target_date: new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'emergency_fund',
        is_ai_suggested: true,
      })
    }

    // 2. Monthly Savings Goal (10-20% of income)
    if (monthlySavings > 0) {
      const targetMonthlySavings = monthlyIncome * 0.15 // 15% of income
      const currentSavingsRate = (monthlySavings / monthlyIncome) * 100

      if (currentSavingsRate < 15) {
        suggestions.push({
          title: 'Meta de Economia Mensal',
          description: `Economize 15% da sua receita (R$ ${targetMonthlySavings.toFixed(2)}/mês)`,
          target_amount: targetMonthlySavings * 3, // 3 months target
          current_amount: 0,
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'savings',
          is_ai_suggested: true,
        })
      }
    }

    // 3. Business Expansion (if positive cash flow)
    if (monthlySavings > monthlyIncome * 0.1) {
      const expansionAmount = monthlyIncome * 2 // 2 months of revenue
      suggestions.push({
        title: 'Expansão do Negócio',
        description: 'Investimento para crescimento e novos equipamentos',
        target_amount: expansionAmount,
        current_amount: 0,
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'business_expansion',
        is_ai_suggested: true,
      })
    }

    return suggestions
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / activeGoals.length)
    : 0
  const goalsOnTrack = activeGoals.filter(g => g.on_track).length
  const goalsBehind = activeGoals.filter(g => !g.on_track).length

  return {
    goals: activeGoals,
    completedGoals,
    loading,
    error,
    totalProgress,
    goalsOnTrack,
    goalsBehind,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    generateAIGoals,
    refreshGoals: fetchGoals,
  }
}
