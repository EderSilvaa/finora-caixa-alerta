// Tax Dashboard - Gestão completa de impostos
import { useState } from 'react'
import { useTaxSettings } from '@/hooks/useTaxSettings'
import { useTaxCalculations } from '@/hooks/useTaxCalculations'
import { useTaxPayments } from '@/hooks/useTaxPayments'
import { useTaxOptimization } from '@/hooks/useTaxOptimization'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaxSettingsModal } from '@/components/tax/TaxSettingsModal'
import {
  Settings,
  Calculator,
  Calendar,
  TrendingDown,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TaxDashboard() {
  const { settings, needsConfiguration } = useTaxSettings()
  const { currentCalculation, calculating, calculateTaxes, getTaxBurden } = useTaxCalculations()
  const { upcomingPayments, getCriticalPayments, getTotalUpcoming } = useTaxPayments()
  const { optimization, loading: optLoading, runOptimization } = useTaxOptimization()

  const [showSettings, setShowSettings] = useState(false)

  const taxBurden = getTaxBurden()
  const criticalPayments = getCriticalPayments()
  const totalUpcoming = getTotalUpcoming()

  // Se não tem configuração, mostrar banner
  if (needsConfiguration) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription>
            Configure seu regime tributário para começar a calcular impostos automaticamente.
            <Button className="mt-4" onClick={() => setShowSettings(true)}>
              Configurar Agora
            </Button>
          </AlertDescription>
        </Alert>

        {/* Modal de Configurações */}
        <TaxSettingsModal open={showSettings} onOpenChange={setShowSettings} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Impostos</h1>
          <p className="text-muted-foreground">
            Regime: <strong>{settings?.regime.replace('_', ' ')}</strong>
            {settings?.simples_anexo && <> - Anexo {settings.simples_anexo}</>}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impostos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentCalculation?.total_tax_amount.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximo Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingPayments[0]
                ? format(new Date(upcomingPayments[0].due_date), 'dd/MM')
                : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingPayments[0]?.tax_type.toUpperCase() || 'Nenhum pendente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carga Tributária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxBurden?.toFixed(1) || '--'}%</div>
            <p className="text-xs text-muted-foreground">Sobre a receita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Economia Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {optimization?.potential_savings.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {optimization ? `${optimization.savings_percentage.toFixed(1)}% de redução` : 'Sem análise'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {criticalPayments.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção! Vencimentos próximos</AlertTitle>
          <AlertDescription>
            Você tem {criticalPayments.length} pagamento(s) vencendo nos próximos 3 dias.
            <ul className="mt-2 space-y-1">
              {criticalPayments.map((payment) => (
                <li key={payment.id}>
                  {payment.tax_type.toUpperCase()}: R$ {payment.amount.toFixed(2)} -{' '}
                  {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Calendar className="mr-2 h-4 w-4" />
            Vencimentos
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <TrendingDown className="mr-2 h-4 w-4" />
            Otimização AI
          </TabsTrigger>
        </TabsList>

        {/* Calculadora */}
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cálculo de Impostos</CardTitle>
                  <CardDescription>
                    {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                  </CardDescription>
                </div>
                <Button onClick={calculateTaxes} disabled={calculating}>
                  {calculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recalcular
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCalculation ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita do Mês</p>
                      <p className="text-lg font-semibold">
                        R$ {currentCalculation.revenue_base?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Últimos 12 Meses</p>
                      <p className="text-lg font-semibold">
                        R$ {currentCalculation.revenue_last_12m?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DAS (Simples Nacional)</span>
                      <span className="font-semibold">
                        R$ {currentCalculation.das_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ISS (Serviços)</span>
                      <span className="font-semibold">
                        R$ {currentCalculation.iss_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">INSS (Previdência)</span>
                      <span className="font-semibold">
                        R$ {currentCalculation.inss_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-bold">
                        R$ {currentCalculation.total_tax_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {currentCalculation.is_manual_override ? (
                      <Badge variant="outline">Ajuste Manual</Badge>
                    ) : (
                      <Badge variant="secondary">Automático</Badge>
                    )}
                    <span>
                      Calculado em{' '}
                      {currentCalculation.calculated_at
                        ? format(new Date(currentCalculation.calculated_at), "dd/MM/yyyy 'às' HH:mm")
                        : 'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum cálculo encontrado para este mês.</p>
                  <Button className="mt-4" onClick={calculateTaxes} disabled={calculating}>
                    Calcular Impostos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vencimentos */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimentos</CardTitle>
              <CardDescription>
                Total a pagar nos próximos 30 dias: R$ {totalUpcoming.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{payment.tax_type.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {payment.amount.toFixed(2)}</p>
                        <Badge
                          variant={
                            new Date(payment.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 mb-4 text-green-600" />
                  <p>Nenhum pagamento pendente nos próximos 30 dias.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Otimização AI */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Otimização de Regime Tributário</CardTitle>
                  <CardDescription>Análise AI para reduzir sua carga tributária</CardDescription>
                </div>
                <Button onClick={runOptimization} disabled={optLoading}>
                  {optLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    'Rodar Análise'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {optimization ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Regime Atual</p>
                      <p className="font-semibold">{optimization.current_regime}</p>
                      <p className="text-sm mt-1">
                        R$ {optimization.current_annual_tax.toFixed(2)}/ano
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-green-50">
                      <p className="text-sm text-muted-foreground">Regime Sugerido</p>
                      <p className="font-semibold text-green-700">
                        {optimization.suggested_regime}
                      </p>
                      <p className="text-sm mt-1 text-green-700">
                        R$ {optimization.projected_annual_tax.toFixed(2)}/ano
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-green-50 border-green-200">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Economia Potencial</AlertTitle>
                    <AlertDescription className="text-green-800">
                      <span className="text-2xl font-bold">
                        R$ {optimization.potential_savings.toFixed(2)}
                      </span>{' '}
                      ({optimization.savings_percentage.toFixed(1)}% de redução)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <p className="font-semibold mb-2">Fundamentação:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {optimization.reasoning?.factors?.map((factor, idx) => (
                        <li key={idx} className="text-sm">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Recomendação:</p>
                    <p className="text-sm">{optimization.recommendation}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="default">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aceitar Sugestão
                    </Button>
                    <Button variant="outline">
                      <XCircle className="mr-2 h-4 w-4" />
                      Dispensar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Confiança da análise: {(optimization.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma análise de otimização disponível.</p>
                  <Button className="mt-4" onClick={runOptimization} disabled={optLoading}>
                    Rodar Análise AI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configurações */}
      <TaxSettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
