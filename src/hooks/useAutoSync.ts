// useAutoSync Hook - Automatic daily transaction synchronization
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { syncService } from '@/services/sync.service'
import { supabase } from '@/lib/supabase'

const SYNC_INTERVAL_HOURS = 24 // Sync every 24 hours

export interface SyncStatus {
  isSyncing: boolean
  lastSyncAt: string | null
  shouldSync: boolean
  timeSinceLastSync: number | null // in hours
  error: string | null
}

export function useAutoSync() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    shouldSync: false,
    timeSinceLastSync: null,
    error: null,
  })

  // Check if sync is needed based on last sync time
  const checkSyncNeeded = async (): Promise<boolean> => {
    if (!user?.id) return false

    try {
      // Get the most recent sync from bank_connections
      const { data: connections, error } = await supabase
        .from('bank_connections')
        .select('last_synced_at')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .order('last_synced_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (!connections || connections.length === 0) {
        // No connections, no sync needed
        return false
      }

      const lastSyncAt = connections[0].last_synced_at

      if (!lastSyncAt) {
        // Never synced before, should sync
        setSyncStatus((prev) => ({
          ...prev,
          lastSyncAt: null,
          shouldSync: true,
          timeSinceLastSync: null,
        }))
        return true
      }

      // Calculate hours since last sync
      const lastSyncDate = new Date(lastSyncAt)
      const now = new Date()
      const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60)

      const shouldSync = hoursSinceLastSync >= SYNC_INTERVAL_HOURS

      setSyncStatus((prev) => ({
        ...prev,
        lastSyncAt,
        shouldSync,
        timeSinceLastSync: hoursSinceLastSync,
      }))

      return shouldSync
    } catch (error: any) {
      console.error('Error checking sync status:', error)
      setSyncStatus((prev) => ({
        ...prev,
        error: error.message,
      }))
      return false
    }
  }

  // Perform automatic sync
  const performAutoSync = async (): Promise<void> => {
    if (!user?.id) return

    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }))

      const result = await syncService.syncAllTransactions(user.id, 90)

      // Update last sync time
      const now = new Date().toISOString()
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: now,
        shouldSync: false,
        timeSinceLastSync: 0,
        error: result.success ? null : 'Sync completed with warnings',
      }))

      return result
    } catch (error: any) {
      console.error('Error during auto-sync:', error)
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: error.message,
      }))
      throw error
    }
  }

  // Manual sync trigger
  const manualSync = async (): Promise<void> => {
    return performAutoSync()
  }

  // Check and auto-sync on mount
  useEffect(() => {
    if (!user?.id) return

    const initAutoSync = async () => {
      const shouldSync = await checkSyncNeeded()

      if (shouldSync) {
        // Wait a bit to let the UI render before syncing
        setTimeout(() => {
          performAutoSync()
        }, 2000) // 2 second delay
      }
    }

    initAutoSync()

    // Set up periodic check every hour to catch new 24h windows
    const intervalId = setInterval(async () => {
      const shouldSync = await checkSyncNeeded()
      if (shouldSync && !syncStatus.isSyncing) {
        performAutoSync()
      }
    }, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(intervalId)
  }, [user?.id])

  // Format time since last sync for display
  const getLastSyncText = (): string => {
    if (!syncStatus.lastSyncAt) return 'Nunca sincronizado'

    if (syncStatus.timeSinceLastSync === null) return 'Calculando...'

    const hours = syncStatus.timeSinceLastSync

    if (hours < 1) {
      const minutes = Math.floor(hours * 60)
      return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`
    } else if (hours < 24) {
      const roundedHours = Math.floor(hours)
      return `há ${roundedHours} hora${roundedHours !== 1 ? 's' : ''}`
    } else {
      const days = Math.floor(hours / 24)
      return `há ${days} dia${days !== 1 ? 's' : ''}`
    }
  }

  return {
    syncStatus,
    manualSync,
    getLastSyncText,
    checkSyncNeeded,
  }
}
