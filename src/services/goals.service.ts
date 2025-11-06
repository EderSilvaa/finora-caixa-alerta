// Financial Goals Service
import { supabase } from '@/lib/supabase'
import type { FinancialGoal } from '@/types'
import type { FinancialGoalInput } from '@/lib/validations'

export const goalsService = {
  /**
   * Get all financial goals for user
   */
  async getGoals(userId: string): Promise<FinancialGoal[]> {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(g => ({
      id: g.id,
      userId: g.user_id,
      title: g.title,
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      deadline: g.deadline,
      percentage: Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100),
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    }))
  },

  /**
   * Create new financial goal
   */
  async createGoal(userId: string, input: FinancialGoalInput): Promise<FinancialGoal> {
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: userId,
        title: input.title,
        target_amount: input.targetAmount,
        current_amount: input.currentAmount || 0,
        deadline: input.deadline,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      deadline: data.deadline,
      percentage: Math.round((Number(data.current_amount) / Number(data.target_amount)) * 100),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Update financial goal
   */
  async updateGoal(goalId: string, updates: Partial<FinancialGoalInput>): Promise<FinancialGoal> {
    const updateData: any = {}
    if (updates.title) updateData.title = updates.title
    if (updates.targetAmount) updateData.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline

    const { data, error } = await supabase
      .from('financial_goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      deadline: data.deadline,
      percentage: Math.round((Number(data.current_amount) / Number(data.target_amount)) * 100),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Delete financial goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase.from('financial_goals').delete().eq('id', goalId)

    if (error) throw error
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, newAmount: number): Promise<FinancialGoal> {
    const { data, error } = await supabase
      .from('financial_goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      deadline: data.deadline,
      percentage: Math.round((Number(data.current_amount) / Number(data.target_amount)) * 100),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },
}
