// Pluggy Service - Open Finance Brasil Integration
// Uses secure Edge Functions instead of direct Pluggy API calls
import { supabase } from '@/lib/supabase'

const clientId = import.meta.env.VITE_PLUGGY_CLIENT_ID

if (!clientId) {
  console.error('Missing Pluggy Client ID. Please check your .env file.')
}

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

export const pluggyService = {
  /**
   * Create a Connect Token for Pluggy Connect Widget
   */
  async createConnectToken(): Promise<ConnectTokenResponse> {
    try {
      console.log('[PLUGGY] Creating connect token...')

      // Note: supabase.functions.invoke() automatically sends auth token if session exists
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'create-connect-token',
        },
      })

      console.log('[PLUGGY] Response:', { data, error })

      if (error) {
        console.error('[PLUGGY] Edge Function error details:', error)
        throw new Error(error.message || 'Failed to create connect token')
      }

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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-items',
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch connected banks')
      }

      return data || []
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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-item',
          itemId,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch bank connection')
      }

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
      const { error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'delete-item',
          itemId,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to disconnect bank')
      }
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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-accounts',
          itemId,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch accounts')
      }

      return data || []
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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-account',
          accountId,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch account')
      }

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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-transactions',
          accountId,
          from,
          to,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch transactions')
      }

      return data || []
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
      const { data, error } = await supabase.functions.invoke('pluggy-api', {
        body: {
          action: 'get-connectors',
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to fetch available banks')
      }

      return data || []
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
    return !!clientId
  },
}
