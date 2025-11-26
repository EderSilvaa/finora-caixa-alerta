// Edge Function: AI Insights API
// Centralized OpenAI API calls from frontend (secure backend)
// Uses OPENAI_API_KEY from Supabase secrets

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OpenAI API configuration
const OPENAI_API_BASE = 'https://api.openai.com/v1'
const OPENAI_MODEL = 'gpt-4o'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from secrets
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured in secrets')
    }

    // Debug: Log headers
    const authHeader = req.headers.get('Authorization')
    console.log('[AUTH DEBUG] Authorization header:', authHeader ? 'Present' : 'Missing')

    if (!authHeader) {
      console.error('[AUTH ERROR] No Authorization header found')
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client with the service role key to verify the JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify JWT token by getting user from the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    console.log('[AUTH DEBUG] User:', user ? user.id : 'null')
    console.log('[AUTH DEBUG] Auth error:', authError)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { action, userId, daysAhead, ...params } = await req.json()

    // Validate userId matches authenticated user
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Route to appropriate handler
    let result
    switch (action) {
      case 'generate-insights':
        result = await generateInsights(supabase, userId, openaiKey)
        break
      case 'predict-balance':
        result = await predictBalance(supabase, userId, openaiKey, daysAhead || 30)
        break
      case 'detect-anomalies':
        result = await detectAnomalies(supabase, userId, openaiKey)
        break
      case 'analyze-patterns':
        result = await analyzeSpendingPatterns(supabase, userId, openaiKey)
        break
      case 'generate-action-plan':
        result = await generateActionPlan(
          supabase,
          userId,
          openaiKey,
          params.daysUntilZero,
          params.currentBalance,
          params.monthlyBurn
        )
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('AI Insights error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper: Get user financial data
async function getUserFinancialData(supabase: any, userId: string) {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', threeMonthsAgo.toISOString())
    .order('date', { ascending: false })

  if (txError) throw txError

  const income =
    transactions?.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0) ||
    0
  const expenses =
    transactions?.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0) ||
    0
  const currentBalance = income - expenses

  const { data: bankAccounts } = await supabase.from('bank_accounts').select('*').eq('user_id', userId)

  const totalBankBalance = bankAccounts?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0

  return {
    transactions: transactions || [],
    currentBalance,
    totalBankBalance,
    income,
    expenses,
    period: {
      start: threeMonthsAgo.toISOString(),
      end: now.toISOString(),
      days: 90,
    },
  }
}

// Helper: Call OpenAI API
async function callOpenAI(apiKey: string, messages: any[], options: any = {}) {
  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      response_format: { type: 'json_object' },
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1500,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  return JSON.parse(content)
}

// Helper: Preprocess financial data
function preprocessFinancialData(data: any) {
  const expenses = data.transactions.filter((t: any) => t.type === 'expense')

  // Top 5 categories
  const byCategory: Record<string, number> = {}
  expenses.forEach((t: any) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, total]) => `${cat} R$ ${total.toFixed(0)}`)
    .join(', ')

  // Recent high-value transactions
  const recentHighValue = data.transactions
    .slice(0, 15)
    .filter((t: any) => t.amount > 100)
    .map((t: any) => `${t.description.substring(0, 20)} R$ ${t.amount.toFixed(0)}`)
    .join(', ')

  // Category breakdown
  const categoryBreakdown = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat, total]) => `${cat}: R$ ${total.toFixed(0)}`)
    .join(' | ')

  // Top expenses
  const topExpenses = expenses
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 10)
    .map((t: any) => `${t.description.substring(0, 25)} R$ ${t.amount.toFixed(0)}`)
    .join(', ')

  return { topCategories, recentHighValue, categoryBreakdown, topExpenses }
}

// Action: Generate Insights
async function generateInsights(supabase: any, userId: string, openaiKey: string) {
  const financialData = await getUserFinancialData(supabase, userId)
  const summary = preprocessFinancialData(financialData)

  const prompt = `Dados 90d: Saldo R$ ${financialData.currentBalance.toFixed(0)} | Receita R$ ${financialData.income.toFixed(0)} | Despesa R$ ${financialData.expenses.toFixed(0)} | ${financialData.transactions.length} transações

Top categorias: ${summary.topCategories}

Gere 3-5 insights JSON:
{
  "insights": [{
    "title": "< 60 chars",
    "description": "Detalhes com números",
    "category": "spending|income|balance|savings|risk|opportunity",
    "severity": "high|medium|low",
    "action_items": ["ação específica"],
    "confidence": 85
  }]
}

Foco: alertas urgentes, economia, padrões ruins, ações acionáveis.`

  const result = await callOpenAI(
    openaiKey,
    [
      {
        role: 'system',
        content:
          'CFO virtual do Finora. 10k+ usuários, R$ 2M+ economizados. Insights diretos com números reais, ações executáveis hoje. Zero teoria.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.7, max_tokens: 1500 }
  )

  return result.insights || []
}

// Action: Predict Balance
async function predictBalance(supabase: any, userId: string, openaiKey: string, daysAhead: number) {
  const financialData = await getUserFinancialData(supabase, userId)

  const dailyAvg = {
    income: (financialData.income / 90).toFixed(0),
    expense: (financialData.expenses / 90).toFixed(0),
    net: ((financialData.income - financialData.expenses) / 90).toFixed(0),
  }

  const prompt = `Saldo: R$ ${financialData.currentBalance.toFixed(0)} | Média diária: +R$ ${dailyAvg.income} -R$ ${dailyAvg.expense} = ${dailyAvg.net}/dia

Preveja ${daysAhead}d JSON:
{
  "predicted_balance": 15420.50,
  "confidence": 0.85,
  "days_ahead": ${daysAhead},
  "trend": "texto curto",
  "factors": ["3-5 fatores"]
}

Use tendência, médias, sazonalidade.`

  const result = await callOpenAI(
    openaiKey,
    [
      {
        role: 'system',
        content: 'Especialista modelagem financeira. Use tendências, sazonalidade, médias móveis. Previsões precisas e confiança honesta.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.3, max_tokens: 800 }
  )

  return result
}

// Action: Detect Anomalies
async function detectAnomalies(supabase: any, userId: string, openaiKey: string) {
  const financialData = await getUserFinancialData(supabase, userId)
  const summary = preprocessFinancialData(financialData)

  const expenses = financialData.transactions.filter((t: any) => t.type === 'expense')
  const incomes = financialData.transactions.filter((t: any) => t.type === 'income')

  const prompt = `${financialData.transactions.length} transações | Despesa média: R$ ${(financialData.expenses / expenses.length).toFixed(0)} | Receita média: R$ ${(financialData.income / incomes.length).toFixed(0)}

Top 15 recentes: ${summary.recentHighValue}

Detecte anomalias JSON:
{"anomalies": [{"transaction_description": "nome", "amount": 2500, "date": "2025-01-10", "reason": "motivo", "severity": "high|medium|low"}]}

Buscar: valor >200% média, duplicatas, padrões estranhos. Vazio se ok.`

  const result = await callOpenAI(
    openaiKey,
    [
      {
        role: 'system',
        content: 'Detector de fraudes/anomalias. Identifique: transações suspeitas, duplicatas, valores 200%+ acima da média.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.2, max_tokens: 1000 }
  )

  return result.anomalies || []
}

// Action: Analyze Spending Patterns
async function analyzeSpendingPatterns(supabase: any, userId: string, openaiKey: string) {
  const financialData = await getUserFinancialData(supabase, userId)
  const summary = preprocessFinancialData(financialData)

  const prompt = `Receita mensal: R$ ${(financialData.income / 3).toFixed(0)}

${summary.categoryBreakdown}

Analise JSON:
{"patterns": [{"category": "nome", "average_amount": 1250, "trend": "increasing|decreasing|stable", "insights": "análise com % e recomendação"}]}

3-5 categorias principais, números específicos.`

  const result = await callOpenAI(
    openaiKey,
    [
      {
        role: 'system',
        content: 'Analista comportamento financeiro. Identifique padrões, tendências, oportunidades economia. Use números e %.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.4, max_tokens: 1200 }
  )

  return result.patterns || []
}

// Action: Generate Action Plan
async function generateActionPlan(
  supabase: any,
  userId: string,
  openaiKey: string,
  daysUntilZero: number,
  currentBalance: number,
  monthlyBurn: number
) {
  const financialData = await getUserFinancialData(supabase, userId)
  const summary = preprocessFinancialData(financialData)

  const prompt = `🚨 CRÍTICO: Saldo R$ ${currentBalance.toFixed(0)} zera em ${daysUntilZero}d | Queima R$ ${monthlyBurn.toFixed(0)}/mês

${summary.topExpenses}

Gere 4-6 ações JSON:
{
  "actions": [{
    "id": "1",
    "title": "< 60 chars",
    "description": "Específico: quem, quanto, quando, como (80+ chars)",
    "impact": "+X dias ou -R$ Y/mês",
    "priority": "high|medium|low",
    "category": "revenue|expense|negotiation|financing",
    "completed": false
  }]
}

Exemplos BOM:
• "Antecipar Cliente Alfa R$ 3.5k com 3% desc (ref: #1234) - ligar 14h hoje" → "+12d"
• "Cancelar Netflix/Spotify R$ 150/mês - app agora" → "-R$ 150"

Exemplos RUIM:
• "Reduzir despesas" (vago)
• "Aumentar vendas" (genérico)

Ações HOJE, números reais, baseado em dados.`

  const result = await callOpenAI(
    openaiKey,
    [
      {
        role: 'system',
        content: 'Consultor crises financeiras. Gere ações executáveis HOJE. Específico: quem, quanto, quando, como. Zero teoria, só ação.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.7, max_tokens: 1500 }
  )

  return result.actions || []
}
