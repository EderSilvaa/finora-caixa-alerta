// Edge Function: Pluggy API Proxy
// Secure proxy for Pluggy Open Finance API calls
// Uses PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET from Supabase secrets

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pluggy API configuration
const PLUGGY_API_BASE = 'https://api.pluggy.ai'

// API Key cache (24 hours)
let cachedApiKey: string | null = null
let apiKeyExpiry: number | null = null

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Pluggy credentials from secrets
    const clientId = Deno.env.get('PLUGGY_CLIENT_ID')
    const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      throw new Error('Pluggy credentials not configured in secrets')
    }

    // Debug: Log headers
    const authHeader = req.headers.get('Authorization')
    console.log('[PLUGGY AUTH DEBUG] Authorization header:', authHeader ? 'Present' : 'Missing')

    if (!authHeader) {
      console.error('[PLUGGY AUTH ERROR] No Authorization header found')
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

    console.log('[PLUGGY AUTH DEBUG] User:', user ? user.id : 'null')
    console.log('[PLUGGY AUTH DEBUG] Auth error:', authError)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { action, itemId, accountId, from, to } = await req.json()

    // Get Pluggy API key
    const apiKey = await getPluggyApiKey(clientId, clientSecret)

    // Route to appropriate handler
    let result
    switch (action) {
      case 'create-connect-token':
        result = await createConnectToken(apiKey)
        break
      case 'get-items':
        result = await getItems(apiKey)
        break
      case 'get-item':
        if (!itemId) throw new Error('itemId is required')
        result = await getItem(apiKey, itemId)
        break
      case 'delete-item':
        if (!itemId) throw new Error('itemId is required')
        result = await deleteItem(apiKey, itemId)
        break
      case 'get-accounts':
        if (!itemId) throw new Error('itemId is required')
        result = await getAccounts(apiKey, itemId)
        break
      case 'get-account':
        if (!accountId) throw new Error('accountId is required')
        result = await getAccount(apiKey, accountId)
        break
      case 'get-transactions':
        if (!accountId) throw new Error('accountId is required')
        result = await getTransactions(apiKey, accountId, from, to)
        break
      case 'get-connectors':
        result = await getConnectors(apiKey)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Pluggy API error:', error)
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

// Helper: Get Pluggy API Key (cached for 24 hours)
async function getPluggyApiKey(clientId: string, clientSecret: string): Promise<string> {
  // Return cached key if still valid
  if (cachedApiKey && apiKeyExpiry && Date.now() < apiKeyExpiry) {
    return cachedApiKey
  }

  console.log('[PLUGGY AUTH] Authenticating with Pluggy...')

  const response = await fetch(`${PLUGGY_API_BASE}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pluggy auth failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  cachedApiKey = data.apiKey

  // Cache for 23 hours (API key valid for 24h)
  apiKeyExpiry = Date.now() + 23 * 60 * 60 * 1000

  console.log('[PLUGGY AUTH] Authentication successful!')
  return cachedApiKey!
}

// Helper: Make authenticated request to Pluggy API
async function pluggyRequest(apiKey: string, endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${PLUGGY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pluggy API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

// Action: Create Connect Token
async function createConnectToken(apiKey: string) {
  const data = await pluggyRequest(apiKey, '/connect_token', {
    method: 'POST',
  })
  return data
}

// Action: Get Items (bank connections)
async function getItems(apiKey: string) {
  const data = await pluggyRequest(apiKey, '/items')
  return data.results || []
}

// Action: Get specific item
async function getItem(apiKey: string, itemId: string) {
  const data = await pluggyRequest(apiKey, `/items/${itemId}`)
  return data
}

// Action: Delete item (disconnect bank)
async function deleteItem(apiKey: string, itemId: string) {
  await pluggyRequest(apiKey, `/items/${itemId}`, {
    method: 'DELETE',
  })
  return { success: true }
}

// Action: Get accounts for an item
async function getAccounts(apiKey: string, itemId: string) {
  const data = await pluggyRequest(apiKey, `/accounts?itemId=${itemId}`)
  return data.results || []
}

// Action: Get specific account
async function getAccount(apiKey: string, accountId: string) {
  const data = await pluggyRequest(apiKey, `/accounts/${accountId}`)
  return data
}

// Action: Get transactions for an account
async function getTransactions(apiKey: string, accountId: string, from?: string, to?: string) {
  let url = `/transactions?accountId=${accountId}`
  if (from) url += `&from=${from}`
  if (to) url += `&to=${to}`

  const data = await pluggyRequest(apiKey, url)
  return data.results || []
}

// Action: Get connectors (available banks)
async function getConnectors(apiKey: string) {
  const data = await pluggyRequest(apiKey, '/connectors')
  return data.results || []
}
