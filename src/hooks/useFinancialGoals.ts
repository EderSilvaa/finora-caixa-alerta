// Financial Goals Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsService } from '@/services/goals.service'
import type { FinancialGoalInput } from '@/lib/validations'
import { useToast } from './use-toast'

export function useFinancialGoals(userId: string | undefined) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get all goals
  const {
    data: goals = [],
    isLoading,
  } = useQuery({
    queryKey: ['financial-goals', userId],
    queryFn: () => goalsService.getGoals(userId!),
    enabled: !!userId,
  })

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: (input: FinancialGoalInput) => goalsService.createGoal(userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals', userId] })

      toast({
        title: 'Meta criada!',
        description: 'Sua meta financeira foi adicionada.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar meta',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update goal mutation
  const updateGoal = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FinancialGoalInput> }) =>
      goalsService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals', userId] })

      toast({
        title: 'Meta atualizada!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar meta',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: (id: string) => goalsService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals', userId] })

      toast({
        title: 'Meta excluída!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir meta',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update goal progress
  const updateGoalProgress = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      goalsService.updateGoalProgress(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals', userId] })
    },
  })

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    updateGoalProgress: updateGoalProgress.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
  }
}
