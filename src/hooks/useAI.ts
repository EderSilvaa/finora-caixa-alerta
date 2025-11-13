// React Hook for AI Features
import { useState, useCallback } from 'react'
import { aiService, AIInsight, BalancePrediction, SpendingPattern, AnomalyDetection } from '@/services/ai.service'
import { useAuth } from './useAuth'

export function useAI() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [balancePrediction, setBalancePrediction] = useState<BalancePrediction | null>(null)
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if AI is configured
  const isConfigured = aiService.isConfigured()

  // Generate financial insights
  const generateInsights = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!isConfigured) {
      setError('AI service not configured. Please add VITE_OPENAI_API_KEY to .env')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[useAI] Generating insights...')

      const result = await aiService.generateInsights(user.id)
      setInsights(result)

      console.log('[useAI] Generated', result.length, 'insights')
    } catch (err: any) {
      console.error('[useAI] Error generating insights:', err)
      setError(err.message || 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isConfigured])

  // Predict future balance
  const predictBalance = useCallback(async (daysAhead: number = 30) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!isConfigured) {
      setError('AI service not configured')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log(`[useAI] Predicting balance for ${daysAhead} days...`)

      const result = await aiService.predictBalance(user.id, daysAhead)
      setBalancePrediction(result)

      console.log('[useAI] Balance prediction:', result)
    } catch (err: any) {
      console.error('[useAI] Error predicting balance:', err)
      setError(err.message || 'Failed to predict balance')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isConfigured])

  // Detect spending anomalies
  const detectAnomalies = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!isConfigured) {
      setError('AI service not configured')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[useAI] Detecting anomalies...')

      const result = await aiService.detectAnomalies(user.id)
      setAnomalies(result)

      console.log('[useAI] Detected', result.length, 'anomalies')
    } catch (err: any) {
      console.error('[useAI] Error detecting anomalies:', err)
      setError(err.message || 'Failed to detect anomalies')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isConfigured])

  // Analyze spending patterns
  const analyzeSpendingPatterns = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!isConfigured) {
      setError('AI service not configured')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[useAI] Analyzing spending patterns...')

      const result = await aiService.analyzeSpendingPatterns(user.id)
      setSpendingPatterns(result)

      console.log('[useAI] Analyzed', result.length, 'patterns')
    } catch (err: any) {
      console.error('[useAI] Error analyzing patterns:', err)
      setError(err.message || 'Failed to analyze spending patterns')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isConfigured])

  // Run full AI analysis (all features)
  const runFullAnalysis = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!isConfigured) {
      setError('AI service not configured. Please add VITE_OPENAI_API_KEY to .env.local')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[useAI] Running full AI analysis...')

      // Run all analyses in parallel
      const [insightsResult, balanceResult, anomaliesResult, patternsResult] = await Promise.all([
        aiService.generateInsights(user.id),
        aiService.predictBalance(user.id, 30),
        aiService.detectAnomalies(user.id),
        aiService.analyzeSpendingPatterns(user.id)
      ])

      setInsights(insightsResult)
      setBalancePrediction(balanceResult)
      setAnomalies(anomaliesResult)
      setSpendingPatterns(patternsResult)

      console.log('[useAI] Full analysis complete')
    } catch (err: any) {
      console.error('[useAI] Error in full analysis:', err)
      setError(err.message || 'Failed to run full analysis')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isConfigured])

  return {
    // State
    insights,
    balancePrediction,
    spendingPatterns,
    anomalies,
    loading,
    error,
    isConfigured,

    // Actions
    generateInsights,
    predictBalance,
    detectAnomalies,
    analyzeSpendingPatterns,
    runFullAnalysis,
  }
}
