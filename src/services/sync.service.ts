// Transaction Sync Service
// Syncs transactions from Pluggy to Supabase
import { pluggyService } from './pluggy.service'
import { supabase } from '@/lib/supabase'

export interface SyncResult {
  success: boolean
  newTransactions: number
  updatedTransactions: number
  errors: string[]
}

export const syncService = {
  /**
   * Sync transactions from all connected bank accounts for a user
   * @param userId - The user's ID
   * @param daysBack - Number of days to sync back (default: 90)
   */
  async syncAllTransactions(userId: string, daysBack: number = 90): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      newTransactions: 0,
      updatedTransactions: 0,
      errors: [],
    }

    try {
      // Get all bank connections for the user
      const { data: connections, error: connectionsError } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')

      if (connectionsError) throw connectionsError

      if (!connections || connections.length === 0) {
        result.errors.push('No active bank connections found')
        return result
      }

      // Sync each connection
      for (const connection of connections) {
        try {
          const connectionResult = await this.syncConnectionTransactions(
            userId,
            connection.pluggy_item_id,
            daysBack
          )
          result.newTransactions += connectionResult.newTransactions
          result.updatedTransactions += connectionResult.updatedTransactions
          result.errors.push(...connectionResult.errors)

          // Update last_synced_at
          await supabase
            .from('bank_connections')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', connection.id)
        } catch (error: any) {
          result.errors.push(`Error syncing ${connection.connector_name}: ${error.message}`)
        }
      }

      result.success = result.errors.length === 0
      return result
    } catch (error: any) {
      result.errors.push(`Fatal error: ${error.message}`)
      return result
    }
  },

  /**
   * Sync transactions from a specific bank connection
   */
  async syncConnectionTransactions(
    userId: string,
    itemId: string,
    daysBack: number = 90
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      newTransactions: 0,
      updatedTransactions: 0,
      errors: [],
    }

    try {
      // Get all accounts for this connection
      const accounts = await pluggyService.getAccounts(itemId)

      // Calculate date range
      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - daysBack)

      const from = fromDate.toISOString().split('T')[0] // YYYY-MM-DD
      const to = toDate.toISOString().split('T')[0]

      // Sync transactions for each account
      for (const account of accounts) {
        try {
          // Get transactions from Pluggy
          const pluggyTransactions = await pluggyService.getTransactions(
            account.id,
            from,
            to
          )

          // Get corresponding bank_account from Supabase
          const { data: bankAccount } = await supabase
            .from('bank_accounts')
            .select('id')
            .eq('pluggy_account_id', account.id)
            .single()

          if (!bankAccount) {
            result.errors.push(`Bank account not found for Pluggy account ${account.id}`)
            continue
          }

          // Process each transaction
          for (const pluggyTx of pluggyTransactions) {
            try {
              // Check if transaction already exists
              const { data: existing } = await supabase
                .from('transactions')
                .select('id')
                .eq('pluggy_transaction_id', pluggyTx.id)
                .single()

              if (existing) {
                // Transaction already exists, skip
                continue
              }

              // Format transaction for Supabase
              const formattedTx = pluggyService.formatTransactionForSupabase(
                pluggyTx,
                userId
              )

              // Add bank_account_id
              const txToInsert = {
                ...formattedTx,
                bank_account_id: bankAccount.id,
              }

              // Insert transaction
              const { error: insertError } = await supabase
                .from('transactions')
                .insert(txToInsert)

              if (insertError) {
                result.errors.push(
                  `Error inserting transaction ${pluggyTx.id}: ${insertError.message}`
                )
              } else {
                result.newTransactions++
              }
            } catch (error: any) {
              result.errors.push(
                `Error processing transaction ${pluggyTx.id}: ${error.message}`
              )
            }
          }
        } catch (error: any) {
          result.errors.push(
            `Error syncing account ${account.name}: ${error.message}`
          )
        }
      }

      result.success = result.errors.length === 0
      return result
    } catch (error: any) {
      result.errors.push(`Fatal error: ${error.message}`)
      return result
    }
  },

  /**
   * Sync account balances from Pluggy to Supabase
   */
  async syncAccountBalances(userId: string): Promise<{ success: boolean; errors: string[] }> {
    const result = {
      success: false,
      errors: [] as string[],
    }

    try {
      // Get all bank connections for the user
      const { data: connections, error: connectionsError } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')

      if (connectionsError) throw connectionsError

      if (!connections || connections.length === 0) {
        result.errors.push('No active bank connections found')
        return result
      }

      // Sync each connection's accounts
      for (const connection of connections) {
        try {
          const accounts = await pluggyService.getAccounts(connection.pluggy_item_id)

          for (const account of accounts) {
            try {
              // Update balance in Supabase
              const { error: updateError } = await supabase
                .from('bank_accounts')
                .update({ balance: account.balance })
                .eq('pluggy_account_id', account.id)

              if (updateError) {
                result.errors.push(
                  `Error updating balance for account ${account.name}: ${updateError.message}`
                )
              }
            } catch (error: any) {
              result.errors.push(
                `Error processing account ${account.name}: ${error.message}`
              )
            }
          }
        } catch (error: any) {
          result.errors.push(
            `Error syncing balances for ${connection.connector_name}: ${error.message}`
          )
        }
      }

      result.success = result.errors.length === 0
      return result
    } catch (error: any) {
      result.errors.push(`Fatal error: ${error.message}`)
      return result
    }
  },

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId: string): Promise<{
    lastSync: string | null
    totalConnections: number
    activeConnections: number
  }> {
    try {
      const { data: connections } = await supabase
        .from('bank_connections')
        .select('last_synced_at, status')
        .eq('user_id', userId)

      if (!connections || connections.length === 0) {
        return {
          lastSync: null,
          totalConnections: 0,
          activeConnections: 0,
        }
      }

      const activeConnections = connections.filter((c) => c.status === 'ACTIVE')
      const lastSyncs = connections
        .map((c) => c.last_synced_at)
        .filter((d) => d !== null)
        .sort()
        .reverse()

      return {
        lastSync: lastSyncs[0] || null,
        totalConnections: connections.length,
        activeConnections: activeConnections.length,
      }
    } catch (error: any) {
      console.error('Error getting sync status:', error)
      return {
        lastSync: null,
        totalConnections: 0,
        activeConnections: 0,
      }
    }
  },
}
