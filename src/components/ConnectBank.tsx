// ConnectBank Component - Pluggy Connect Widget Integration
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Building2, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import { pluggyService } from '@/services/pluggy.service'
import { syncService } from '@/services/sync.service'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

declare global {
  interface Window {
    PluggyConnect: any
  }
}

interface BankConnection {
  id: string
  connector_name: string
  connector_image_url: string | null
  status: string
  last_synced_at: string | null
  created_at: string
}

export function ConnectBank() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [loadingConnections, setLoadingConnections] = useState(true)
  const [pluggyInstance, setPluggyInstance] = useState<any>(null)

  // Load Pluggy Connect script (only once)
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="pluggy-connect"]')) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.7.0/pluggy-connect.js'
    script.async = true
    script.id = 'pluggy-connect-script'
    document.body.appendChild(script)

    return () => {
      // Don't remove script on unmount to prevent reloading
      // The script can be reused across component remounts
    }
  }, [])

  // Fetch user's bank connections
  useEffect(() => {
    if (user?.id) {
      fetchConnections()
    }
  }, [user])

  const fetchConnections = async () => {
    try {
      setLoadingConnections(true)
      const { data, error } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (error: any) {
      console.error('Error fetching bank connections:', error)
      toast({
        title: 'Erro ao carregar conexões',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingConnections(false)
    }
  }

  const handleConnectBank = async () => {
    if (!pluggyService.isConfigured()) {
      toast({
        title: 'Configuração pendente',
        description: 'Pluggy não está configurado. Verifique as credenciais.',
        variant: 'destructive',
      })
      return
    }

    // Check if PluggyConnect is loaded
    if (!window.PluggyConnect) {
      toast({
        title: 'Carregando...',
        description: 'Aguarde o carregamento do módulo de conexão bancária.',
      })
      return
    }

    try {
      setLoading(true)

      // Create connect token
      const { accessToken } = await pluggyService.createConnectToken()

      // Reuse or create Pluggy Connect widget instance
      if (pluggyInstance) {
        // Reopen existing instance with new token
        pluggyInstance.update({ connectToken: accessToken })
        pluggyInstance.init()
      } else {
        // Create new instance
        const pluggyConnect = new window.PluggyConnect({
          connectToken: accessToken,
          includeSandbox: import.meta.env.DEV, // Include sandbox banks in development
          onSuccess: async (itemData: any) => {
            console.log('Bank connected successfully:', itemData)
            await handleConnectionSuccess(itemData)
          },
          onError: (error: any) => {
            console.error('Pluggy Connect error:', error)
            toast({
              title: 'Erro ao conectar banco',
              description: error.message || 'Tente novamente mais tarde',
              variant: 'destructive',
            })
            setLoading(false)
          },
          onClose: () => {
            setLoading(false)
          },
        })

        setPluggyInstance(pluggyConnect)
        pluggyConnect.init()
      }
    } catch (error: any) {
      console.error('Error initializing Pluggy Connect:', error)
      toast({
        title: 'Erro ao abrir conexão',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleConnectionSuccess = async (itemData: any) => {
    try {
      if (!user?.id) return

      // Save bank connection to Supabase
      const { error } = await supabase.from('bank_connections').insert({
        user_id: user.id,
        pluggy_item_id: itemData.item.id,
        pluggy_connector_id: itemData.item.connector.id,
        connector_name: itemData.item.connector.name,
        connector_image_url: itemData.item.connector.imageUrl,
        status: itemData.item.status,
      })

      if (error) throw error

      // Fetch accounts for this connection
      const accounts = await pluggyService.getAccounts(itemData.item.id)

      // Save accounts to Supabase
      const accountsToInsert = accounts.map((account) => ({
        user_id: user.id,
        bank_connection_id: itemData.item.id,
        pluggy_account_id: account.id,
        account_type: account.type,
        account_subtype: account.subtype,
        account_name: account.name,
        balance: account.balance,
        currency_code: account.currencyCode,
      }))

      const { error: accountsError } = await supabase
        .from('bank_accounts')
        .insert(accountsToInsert)

      if (accountsError) throw accountsError

      toast({
        title: 'Banco conectado!',
        description: `${itemData.item.connector.name} conectado com sucesso.`,
      })

      // Refresh connections list
      fetchConnections()
    } catch (error: any) {
      console.error('Error saving bank connection:', error)
      toast({
        title: 'Erro ao salvar conexão',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncTransactions = async () => {
    if (!user?.id) return

    try {
      setSyncing(true)

      toast({
        title: 'Sincronizando transações',
        description: 'Aguarde enquanto sincronizamos suas transações...',
      })

      const result = await syncService.syncAllTransactions(user.id, 90)

      if (result.success) {
        toast({
          title: 'Sincronização concluída!',
          description: `${result.newTransactions} novas transações adicionadas.`,
        })
      } else {
        toast({
          title: 'Sincronização com avisos',
          description: `${result.newTransactions} transações adicionadas. ${result.errors.length} erros encontrados.`,
          variant: 'default',
        })
      }

      // Refresh connections to update last_synced_at
      fetchConnections()
    } catch (error: any) {
      console.error('Error syncing transactions:', error)
      toast({
        title: 'Erro ao sincronizar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnectBank = async (connectionId: string, itemId: string) => {
    try {
      // Delete from Pluggy
      await pluggyService.deleteItem(itemId)

      // Delete from Supabase (cascade will handle accounts)
      const { error } = await supabase
        .from('bank_connections')
        .delete()
        .eq('id', connectionId)

      if (error) throw error

      toast({
        title: 'Banco desconectado',
        description: 'Conexão removida com sucesso.',
      })

      // Refresh connections list
      fetchConnections()
    } catch (error: any) {
      console.error('Error disconnecting bank:', error)
      toast({
        title: 'Erro ao desconectar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        )
      case 'OUTDATED':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Desatualizado
          </Badge>
        )
      case 'LOGIN_ERROR':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro de Login
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Conectar Banco
          </CardTitle>
          <CardDescription>
            Conecte sua conta bancária para sincronizar automaticamente suas transações via Open Finance Brasil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={handleConnectBank}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Conectar novo banco
                </>
              )}
            </Button>

            {connections.length > 0 && (
              <Button
                onClick={handleSyncTransactions}
                disabled={syncing}
                variant="outline"
                className="w-full md:w-auto"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar transações
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bancos Conectados</CardTitle>
          <CardDescription>
            Gerencie suas conexões bancárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConnections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum banco conectado</p>
              <p className="text-sm">Clique em "Conectar novo banco" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {connection.connector_image_url ? (
                      <img
                        src={connection.connector_image_url}
                        alt={connection.connector_name}
                        className="w-10 h-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{connection.connector_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Conectado em{' '}
                        {new Date(connection.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(connection.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnectBank(connection.id, connection.pluggy_item_id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
