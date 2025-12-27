// useTaxSettings Hook - Manage tax regime configuration
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { taxService } from '@/services/tax.service'
import type { TaxSettings, TaxSettingsInput } from '@/types/tax'

export function useTaxSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<TaxSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetchSettings()
  }, [user?.id])

  const fetchSettings = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const data = await taxService.getSettings(user.id)
      setSettings(data)

      if (!data) {
        console.log('[useTaxSettings] No settings found. User needs to configure tax regime.')
      }
    } catch (err: any) {
      console.error('[useTaxSettings] Error fetching settings:', err)
      setError(err.message || 'Failed to load tax settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (input: TaxSettingsInput): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      const updated = await taxService.updateSettings(user.id, input)
      setSettings(updated)

      console.log('[useTaxSettings] Settings updated successfully')
    } catch (err: any) {
      console.error('[useTaxSettings] Error updating settings:', err)
      setError(err.message || 'Failed to update settings')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const needsConfiguration = !settings && !loading

  return {
    settings,
    loading,
    error,
    needsConfiguration,
    updateSettings,
    refreshSettings: fetchSettings,
  }
}
