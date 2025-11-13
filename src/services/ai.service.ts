// AI Service - GPT-4o Integration for Predictive Financial Analysis
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  console.warn('OpenAI API key not found. AI features will be disabled.')
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Para uso no frontend (use backend em produção!)
}) : null

// Types
export interface AIInsight {
  id?: string
  title: string
  description: string
  category: 'spending' | 'income' | 'balance' | 'savings' | 'risk' | 'opportunity'
  severity: 'high' | 'medium' | 'low'
  action_items?: string[]
  confidence?: number
}

export interface BalancePrediction {
  predicted_balance: number
  confidence: number
  days_ahead: number
  trend: string
  factors?: string[]
}

export interface SpendingPattern {
  category: string
  average_amount: number
  trend: 'increasing' | 'decreasing' | 'stable'
  insights?: string
}

export interface AnomalyDetection {
  transaction_description: string
  amount?: number
  date: string
  reason: string
  severity: 'high' | 'medium' | 'low'
}

export const aiService = {
  /**
   * Check if AI service is configured and ready
   */
  isConfigured(): boolean {
    return !!openai
  },

  /**
   * Generate comprehensive financial insights for a user
   */
  async generateInsights(userId: string): Promise<AIInsight[]> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      console.log('[AI] Generating insights for user:', userId)

      // Get user's financial data
      const financialData = await this.getUserFinancialData(userId)

      // Create prompt for GPT-4o
      const prompt = this.createInsightsPrompt(financialData)

      // Call GPT-4o
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista financeiro especializado em finanças pessoais brasileiras. Analise os dados e forneça insights práticos e acionáveis em português do Brasil. Seja objetivo e focado em ajudar o usuário a melhorar sua saúde financeira.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      const insights = JSON.parse(response)
      console.log('[AI] Generated', insights.insights?.length || 0, 'insights')

      // Save insights to Supabase
      await this.saveInsights(userId, insights.insights || [])

      return insights.insights || []
    } catch (error: any) {
      console.error('[AI] Error generating insights:', error)
      throw new Error(`Failed to generate insights: ${error.message}`)
    }
  },

  /**
   * Predict future balance using AI
   */
  async predictBalance(userId: string, daysAhead: number = 30): Promise<BalancePrediction> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      console.log(`[AI] Predicting balance for ${daysAhead} days ahead`)

      const financialData = await this.getUserFinancialData(userId)
      const prompt = this.createBalancePredictionPrompt(financialData, daysAhead)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em modelagem financeira e previsões estatísticas. Use análise de tendências, sazonalidade e padrões históricos para fazer previsões precisas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for more consistent predictions
        max_tokens: 1000
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      const prediction = JSON.parse(response)
      console.log('[AI] Balance prediction:', prediction)

      return prediction
    } catch (error: any) {
      console.error('[AI] Error predicting balance:', error)
      throw new Error(`Failed to predict balance: ${error.message}`)
    }
  },

  /**
   * Detect spending anomalies
   */
  async detectAnomalies(userId: string): Promise<AnomalyDetection[]> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      console.log('[AI] Detecting anomalies')

      const financialData = await this.getUserFinancialData(userId)
      const prompt = this.createAnomalyDetectionPrompt(financialData)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em detecção de fraudes e anomalias financeiras. Identifique transações suspeitas, gastos incomuns e padrões anormais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1500
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      const result = JSON.parse(response)
      console.log('[AI] Detected', result.anomalies?.length || 0, 'anomalies')

      return result.anomalies || []
    } catch (error: any) {
      console.error('[AI] Error detecting anomalies:', error)
      throw new Error(`Failed to detect anomalies: ${error.message}`)
    }
  },

  /**
   * Analyze spending patterns by category
   */
  async analyzeSpendingPatterns(userId: string): Promise<SpendingPattern[]> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      console.log('[AI] Analyzing spending patterns')

      const financialData = await this.getUserFinancialData(userId)
      const prompt = this.createSpendingPatternsPrompt(financialData)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de comportamento financeiro. Identifique padrões de gastos, tendências e oportunidades de economia.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 2000
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      const result = JSON.parse(response)
      console.log('[AI] Analyzed', result.patterns?.length || 0, 'spending patterns')

      return result.patterns || []
    } catch (error: any) {
      console.error('[AI] Error analyzing patterns:', error)
      throw new Error(`Failed to analyze spending patterns: ${error.message}`)
    }
  },

  /**
   * Get user's financial data from Supabase
   */
  async getUserFinancialData(userId: string) {
    const now = new Date()
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Get transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', threeMonthsAgo.toISOString())
      .order('date', { ascending: false })

    if (txError) throw txError

    // Get current balance
    const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const currentBalance = income - expenses

    // Get bank accounts
    const { data: bankAccounts } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)

    const totalBankBalance = bankAccounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0

    return {
      transactions: transactions || [],
      currentBalance,
      totalBankBalance,
      income,
      expenses,
      period: {
        start: threeMonthsAgo.toISOString(),
        end: now.toISOString(),
        days: 90
      }
    }
  },

  /**
   * Create prompt for generating insights
   */
  createInsightsPrompt(data: any): string {
    return `Analise os dados financeiros abaixo e gere insights práticos e acionáveis em português do Brasil:

**Dados Financeiros (últimos 90 dias):**
- Saldo Atual: R$ ${data.currentBalance.toFixed(2)}
- Saldo em Contas Bancárias: R$ ${data.totalBankBalance.toFixed(2)}
- Total de Receitas: R$ ${data.income.toFixed(2)}
- Total de Despesas: R$ ${data.expenses.toFixed(2)}
- Número de Transações: ${data.transactions.length}

**Transações Recentes (últimas 10):**
${data.transactions.slice(0, 10).map((t: any) => `- ${t.date}: ${t.type === 'income' ? '+' : '-'}R$ ${t.amount} (${t.category}) - ${t.description}`).join('\n')}

**Análise por Categoria:**
${this.summarizeByCategory(data.transactions)}

**Tarefa:**
Gere 3-5 insights financeiros práticos no formato JSON EXATO:
{
  "insights": [
    {
      "title": "Título curto e direto",
      "description": "Descrição detalhada do insight com números específicos",
      "category": "spending" | "income" | "balance" | "savings" | "risk" | "opportunity",
      "severity": "high" | "medium" | "low",
      "action_items": ["ação 1", "ação 2"],
      "confidence": 85
    }
  ]
}

**Regras importantes:**
- Use APENAS as categorias: spending, income, balance, savings, risk, opportunity
- Use APENAS severidades: high (urgente), medium (importante), low (informativo)
- action_items deve ser um array de strings com ações específicas
- Seja específico com números e datas
- Foque em:
  1. Alertas sobre saldo negativo futuro
  2. Oportunidades de economia
  3. Padrões de gasto preocupantes
  4. Reconhecimento de bons hábitos
  5. Sugestões específicas e acionáveis`
  },

  /**
   * Create prompt for balance prediction
   */
  createBalancePredictionPrompt(data: any, daysAhead: number): string {
    return `Com base nos dados financeiros abaixo, preveja o saldo futuro usando análise matemática:

**Dados Atuais:**
- Saldo: R$ ${data.currentBalance.toFixed(2)}
- Receitas (90 dias): R$ ${data.income.toFixed(2)}
- Despesas (90 dias): R$ ${data.expenses.toFixed(2)}
- Média diária de receitas: R$ ${(data.income / 90).toFixed(2)}
- Média diária de despesas: R$ ${(data.expenses / 90).toFixed(2)}

**Transações dos últimos 30 dias:**
${data.transactions.slice(0, 30).map((t: any) => `${t.date}: ${t.type === 'income' ? '+' : '-'}R$ ${t.amount}`).join('\n')}

Preveja o saldo para daqui a ${daysAhead} dias no formato JSON EXATO:
{
  "predicted_balance": 15420.50,
  "confidence": 0.85,
  "days_ahead": ${daysAhead},
  "trend": "Tendência crescente com volatilidade moderada",
  "factors": ["Receita recorrente detectada", "Despesas fixas estáveis", "Sazonalidade identificada"]
}

**Importante:**
- predicted_balance: valor numérico da previsão
- confidence: 0 a 1 (ex: 0.85 = 85% de confiança)
- trend: descrição textual da tendência
- factors: array com 3-5 fatores considerados na análise
- Use análise de tendências, médias móveis e sazonalidade`
  },

  /**
   * Create prompt for anomaly detection
   */
  createAnomalyDetectionPrompt(data: any): string {
    return `Detecte transações anormais ou suspeitas nos dados abaixo:

**Transações (últimos 30 dias):**
${data.transactions.slice(0, 30).map((t: any, i: number) =>
  `${i + 1}. ${t.date} | ${t.type === 'income' ? '+' : '-'}R$ ${t.amount} | ${t.category} | ${t.description}`
).join('\n')}

**Médias Históricas:**
- Despesa média: R$ ${(data.expenses / data.transactions.filter((t: any) => t.type === 'expense').length).toFixed(2)}
- Receita média: R$ ${(data.income / data.transactions.filter((t: any) => t.type === 'income').length).toFixed(2)}

Identifique anomalias no formato JSON EXATO:
{
  "anomalies": [
    {
      "transaction_description": "Nome da transação",
      "amount": 2500.00,
      "date": "2025-01-10",
      "reason": "Valor 300% acima da média desta categoria",
      "severity": "high"
    }
  ]
}

**Procure por:**
1. Valores muito acima da média (200%+)
2. Transações duplicadas
3. Categorias incomuns
4. Padrões suspeitos

Se não houver anomalias, retorne {"anomalies": []}`
  },

  /**
   * Create prompt for spending patterns analysis
   */
  createSpendingPatternsPrompt(data: any): string {
    return `Analise os padrões de gasto por categoria e identifique tendências:

**Gastos por Categoria (últimos 90 dias):**
${this.summarizeByCategory(data.transactions)}

**Receitas Mensais:** R$ ${(data.income / 3).toFixed(2)}

**Todas as transações por categoria:**
${data.transactions.filter((t: any) => t.type === 'expense').slice(0, 50).map((t: any) =>
  `${t.date} | ${t.category} | R$ ${t.amount}`
).join('\n')}

Retorne análise no formato JSON EXATO:
{
  "patterns": [
    {
      "category": "alimentacao",
      "average_amount": 1250.00,
      "trend": "increasing",
      "insights": "Gastos com alimentação aumentaram 15% no último mês. Considere meal prep para economizar."
    }
  ]
}

**Regras:**
- category: nome da categoria em português
- average_amount: média mensal de gastos
- trend: "increasing" (aumentando), "decreasing" (diminuindo), ou "stable" (estável)
- insights: análise detalhada com recomendações específicas
- Identifique pelo menos 3-5 categorias principais
- Seja específico com números e percentuais`
  },

  /**
   * Summarize transactions by category
   */
  summarizeByCategory(transactions: any[]): string {
    const byCategory: Record<string, { total: number; count: number }> = {}

    transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!byCategory[t.category]) {
          byCategory[t.category] = { total: 0, count: 0 }
        }
        byCategory[t.category].total += Number(t.amount)
        byCategory[t.category].count++
      }
    })

    return Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, data]) => `- ${cat}: R$ ${data.total.toFixed(2)} (${data.count} transações)`)
      .join('\n')
  },

  /**
   * Save insights to Supabase ai_insights table
   */
  async saveInsights(userId: string, insights: AIInsight[]) {
    const insightsToSave = insights.map(insight => ({
      user_id: userId,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      action: insight.action,
      is_read: false
    }))

    const { error } = await supabase
      .from('ai_insights')
      .insert(insightsToSave)

    if (error) {
      console.error('[AI] Error saving insights:', error)
    } else {
      console.log('[AI] Saved', insightsToSave.length, 'insights to database')
    }
  }
}
