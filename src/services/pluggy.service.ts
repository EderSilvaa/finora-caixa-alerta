// Pluggy Service - Open Finance Brasil Integration (Browser-compatible)
const PLUGGY_API_BASE = 'https://api.pluggy.ai'

const clientId = import.meta.env.VITE_PLUGGY_CLIENT_ID
const clientSecret = import.meta.env.VITE_PLUGGY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error('Missing Pluggy credentials. Please check your .env file.')
}

// API Key cache
let cachedApiKey: string | null = null
let apiKeyExpiry: number | null = null

export interface PluggyItem {
  id: string
  connector: {
    id: number
    name: string
    imageUrl: string
  }
  status: string
  createdAt: string
  updatedAt: string
}

export interface PluggyAccount {
  id: string
  type: string
  subtype: string
  name: string
  balance: number
  currencyCode: string
  itemId: string
}

export interface PluggyTransaction {
  id: string
  accountId: string
  description: string
  amount: number
  date: string
  category: string
  type: 'DEBIT' | 'CREDIT'
  currencyCode: string
}

export interface ConnectTokenResponse {
  accessToken: string
}

/**
 * Get API Key from Pluggy (cached for 24 hours)
 */
async function getApiKey(): Promise<string> {
  // Return cached key if still valid
  if (cachedApiKey && apiKeyExpiry && Date.now() < apiKeyExpiry) {
    return cachedApiKey
  }

  try {
    console.log('[PLUGGY AUTH] Attempting authentication...')
    console.log('[PLUGGY AUTH] Client ID:', clientId)
    console.log('[PLUGGY AUTH] Client Secret exists:', !!clientSecret)

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

    console.log('[PLUGGY AUTH] Response status:', response.status)

    const responseText = await response.text()
    console.log('[PLUGGY AUTH] Response body:', responseText)

    if (!response.ok) {
      throw new Error(`Pluggy auth failed: ${response.status} - ${responseText}`)
    }

    const data = JSON.parse(responseText)
    cachedApiKey = data.apiKey
    // Cache for 23 hours (API key valid for 24h)
    apiKeyExpiry = Date.now() + 23 * 60 * 60 * 1000

    console.log('[PLUGGY AUTH] Authentication successful!')
    return cachedApiKey!
  } catch (error: any) {
    console.error('[PLUGGY AUTH] Error:', error)
    throw new Error('Failed to authenticate with Pluggy')
  }
}

/**
 * Make authenticated request to Pluggy API
 */
async function pluggyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = await getApiKey()

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

export const pluggyService = {
  /**
   * Create a Connect Token for Pluggy Connect Widget
   */
  async createConnectToken(): Promise<ConnectTokenResponse> {
    try {
      const data = await pluggyRequest<ConnectTokenResponse>('/connect_token', {
        method: 'POST',
      })
      return data
    } catch (error: any) {
      console.error('Error creating Pluggy connect token:', error)
      throw new Error(error.message || 'Failed to create connect token')
    }
  },

  /**
   * Get all connected items (bank connections)
   */
  async getItems(): Promise<PluggyItem[]> {
    try {
      const data = await pluggyRequest<{ results: PluggyItem[] }>('/items')
      return data.results
    } catch (error: any) {
      console.error('Error fetching Pluggy items:', error)
      throw new Error(error.message || 'Failed to fetch connected banks')
    }
  },

  /**
   * Get a specific item by ID
   */
  async getItem(itemId: string): Promise<PluggyItem> {
    try {
      const data = await pluggyRequest<PluggyItem>(`/items/${itemId}`)
      return data
    } catch (error: any) {
      console.error('Error fetching Pluggy item:', error)
      throw new Error(error.message || 'Failed to fetch bank connection')
    }
  },

  /**
   * Delete an item (disconnect a bank)
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      await pluggyRequest(`/items/${itemId}`, {
        method: 'DELETE',
      })
    } catch (error: any) {
      console.error('Error deleting Pluggy item:', error)
      throw new Error(error.message || 'Failed to disconnect bank')
    }
  },

  /**
   * Get all accounts for a specific item
   */
  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    try {
      const data = await pluggyRequest<{ results: PluggyAccount[] }>(
        `/accounts?itemId=${itemId}`
      )
      return data.results
    } catch (error: any) {
      console.error('Error fetching Pluggy accounts:', error)
      throw new Error(error.message || 'Failed to fetch accounts')
    }
  },

  /**
   * Get a specific account by ID
   */
  async getAccount(accountId: string): Promise<PluggyAccount> {
    try {
      const data = await pluggyRequest<PluggyAccount>(`/accounts/${accountId}`)
      return data
    } catch (error: any) {
      console.error('Error fetching Pluggy account:', error)
      throw new Error(error.message || 'Failed to fetch account')
    }
  },

  /**
   * Get transactions for a specific account
   */
  async getTransactions(
    accountId: string,
    from?: string,
    to?: string
  ): Promise<PluggyTransaction[]> {
    try {
      let url = `/transactions?accountId=${accountId}`
      if (from) url += `&from=${from}`
      if (to) url += `&to=${to}`

      const data = await pluggyRequest<{ results: PluggyTransaction[] }>(url)
      return data.results
    } catch (error: any) {
      console.error('Error fetching Pluggy transactions:', error)
      throw new Error(error.message || 'Failed to fetch transactions')
    }
  },

  /**
   * Get all connectors (available banks)
   */
  async getConnectors(): Promise<any[]> {
    try {
      const data = await pluggyRequest<{ results: any[] }>('/connectors')
      return data.results
    } catch (error: any) {
      console.error('Error fetching Pluggy connectors:', error)
      throw new Error(error.message || 'Failed to fetch available banks')
    }
  },

  /**
   * Format Pluggy transaction to match our Supabase schema
   */
  formatTransactionForSupabase(
    transaction: PluggyTransaction,
    userId: string
  ): {
    user_id: string
    type: 'income' | 'expense'
    category: string
    amount: number
    description: string
    date: string
    pluggy_transaction_id: string
    pluggy_account_id: string
    synced_from_bank: boolean
  } {
    return {
      user_id: userId,
      type: transaction.type === 'CREDIT' ? 'income' : 'expense',
      category: this.mapPluggyCategory(transaction.category),
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: transaction.date,
      pluggy_transaction_id: transaction.id,
      pluggy_account_id: transaction.accountId,
      synced_from_bank: true,
    }
  },

  /**
   * Map Pluggy categories to our app categories
   */
  mapPluggyCategory(pluggyCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Food and Drink': 'alimentação',
      'Transportation': 'transporte',
      'Shopping': 'compras',
      'Entertainment': 'lazer',
      'Healthcare': 'saúde',
      'Bills and Utilities': 'contas',
      'Transfer': 'transferência',
      'Investment': 'investimento',
      'Income': 'receita',
      'Other': 'outros',
    }

    return categoryMap[pluggyCategory] || 'outros'
  },

  /**
   * Check if Pluggy is properly configured
   */
  isConfigured(): boolean {
    return !!(clientId && clientSecret)
  },
}
