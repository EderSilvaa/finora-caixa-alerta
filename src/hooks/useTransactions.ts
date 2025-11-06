// Transactions Hook with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions.service'
import type { TransactionInput } from '@/lib/validations'
import { useToast } from './use-toast'

export function useTransactions(userId: string | undefined) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get all transactions
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => transactionsService.getTransactions(userId!),
    enabled: !!userId,
  })

  // Get monthly stats
  const { data: monthlyStats } = useQuery({
    queryKey: ['monthly-stats', userId],
    queryFn: () => transactionsService.getMonthlyStats(userId!),
    enabled: !!userId,
  })

  // Get current balance
  const { data: currentBalance } = useQuery({
    queryKey: ['current-balance', userId],
    queryFn: () => transactionsService.getCurrentBalance(userId!),
    enabled: !!userId,
  })

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: (input: TransactionInput) =>
      transactionsService.createTransaction(userId!, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-balance', userId] })
      queryClient.invalidateQueries({ queryKey: ['projections', userId] })

      toast({
        title: data.type === 'income' ? 'Receita registrada!' : 'Despesa registrada!',
        description: `R$ ${data.amount.toLocaleString('pt-BR')} adicionado.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar transação',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Update transaction mutation
  const updateTransaction = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TransactionInput> }) =>
      transactionsService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-balance', userId] })

      toast({
        title: 'Transação atualizada!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar transação',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete transaction mutation
  const deleteTransaction = useMutation({
    mutationFn: (id: string) => transactionsService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['monthly-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['current-balance', userId] })

      toast({
        title: 'Transação excluída!',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    transactions,
    monthlyStats,
    currentBalance,
    isLoading,
    error,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
  }
}
