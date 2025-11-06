// Cash Flow Projections Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectionsService } from '@/services/projections.service'
import { useToast } from './use-toast'

export function useProjections(userId: string | undefined) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get projection chart data
  const {
    data: projectionData = [],
    isLoading,
  } = useQuery({
    queryKey: ['projections', userId],
    queryFn: () => projectionsService.getProjectionChartData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Get days until zero
  const { data: daysUntilZero } = useQuery({
    queryKey: ['days-until-zero', userId],
    queryFn: () => projectionsService.calculateDaysUntilZero(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // Recalculate projection mutation
  const recalculateProjection = useMutation({
    mutationFn: async () => {
      const projections = await projectionsService.calculateProjection(userId!, 102)
      await projectionsService.saveProjections(
        projections.map(({ id, createdAt, ...rest }) => rest)
      )
      return projections
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections', userId] })
      queryClient.invalidateQueries({ queryKey: ['days-until-zero', userId] })

      toast({
        title: 'Projeção atualizada!',
        description: 'As previsões foram recalculadas.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar projeção',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return {
    projectionData,
    daysUntilZero,
    isLoading,
    recalculateProjection: recalculateProjection.mutate,
    isRecalculating: recalculateProjection.isPending,
  }
}
