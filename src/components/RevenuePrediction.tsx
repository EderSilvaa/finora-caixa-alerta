import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Calendar, DollarSign, Clock, CheckCircle2, Mail, MessageSquare, Loader2 } from "lucide-react";
import { useRecurringRevenue, type RecurringRevenue, type RevenueAlert } from "@/hooks/useRecurringRevenue";

interface RevenuePredictionProps {
  onSendReminder?: (clientName: string, amount: number) => void;
}

export const RevenuePrediction = ({ onSendReminder }: RevenuePredictionProps) => {
  const { recurringRevenues, alerts, loading, error, totalExpectedRevenue, overdueCount } = useRecurringRevenue();

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-destructive/10 via-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="flex items-center gap-3 py-6 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (recurringRevenues.length === 0) {
    return null; // Don't show if no recurring revenue detected
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'muted';
      default: return 'muted';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { label: 'Alta confiança', variant: 'success' as const };
    if (confidence >= 60) return { label: 'Média confiança', variant: 'default' as const };
    return { label: 'Baixa confiança', variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      {/* Alerts Section - Only show if there are alerts */}
      {alerts.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-warning/15 via-card/95 to-warning/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    ⚠️ Receitas em Atraso
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {overdueCount} cliente{overdueCount !== 1 ? 's' : ''} com pagamento atrasado
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs font-semibold">
                R$ {alerts.reduce((sum, a) => sum + a.expected_amount, 0).toLocaleString('pt-BR')} em atraso
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {alerts.map((alert) => {
              const severityColor = getSeverityColor(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:border-${severityColor}/40 ${
                    alert.severity === 'high'
                      ? 'bg-destructive/10 border-destructive/30'
                      : alert.severity === 'medium'
                      ? 'bg-warning/10 border-warning/30'
                      : 'bg-muted/20 border-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
                        alert.severity === 'high' ? 'text-destructive' : alert.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                      }`} />
                      <h4 className="text-sm font-semibold text-foreground">{alert.client_name}</h4>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {alert.days_overdue} dias
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => onSendReminder?.(alert.client_name, alert.expected_amount)}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Enviar Cobrança
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => onSendReminder?.(alert.client_name, alert.expected_amount)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recurring Revenue Section */}
      <Card className="border-0 bg-gradient-to-br from-success/5 via-card/95 to-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Receitas Recorrentes
                </CardTitle>
                <CardDescription className="text-sm">
                  {recurringRevenues.length} cliente{recurringRevenues.length !== 1 ? 's' : ''} com padrão identificado
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-semibold border-success/30 text-success">
              ~R$ {totalExpectedRevenue.toLocaleString('pt-BR')}/mês
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {recurringRevenues.map((revenue) => {
            const nextDate = new Date(revenue.next_expected_date);
            const now = new Date();
            const daysUntilNext = Math.round((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isUpcoming = daysUntilNext >= 0 && daysUntilNext <= 7;
            const confidenceBadge = getConfidenceBadge(revenue.confidence);

            return (
              <div
                key={revenue.id}
                className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
                  revenue.is_overdue
                    ? 'bg-warning/5 border-warning/20 hover:border-warning/40'
                    : isUpcoming
                    ? 'bg-success/5 border-success/20 hover:border-success/40'
                    : 'bg-background/60 border-border/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{revenue.client_name}</h4>
                      <Badge variant={confidenceBadge.variant} className="text-xs">
                        {revenue.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{revenue.pattern_description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-success">
                      R$ {revenue.average_amount.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">média</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Próximo: <span className="font-semibold text-foreground">
                        {nextDate.toLocaleDateString('pt-BR')}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className={`font-semibold ${
                      revenue.is_overdue
                        ? 'text-warning'
                        : isUpcoming
                        ? 'text-success'
                        : 'text-muted-foreground'
                    }`}>
                      {revenue.is_overdue
                        ? `${revenue.days_since_last - revenue.frequency_days} dias atraso`
                        : daysUntilNext === 0
                        ? 'Hoje'
                        : daysUntilNext === 1
                        ? 'Amanhã'
                        : daysUntilNext > 0
                        ? `em ${daysUntilNext} dias`
                        : `há ${Math.abs(daysUntilNext)} dias`
                      }
                    </span>
                  </div>
                </div>

                {isUpcoming && !revenue.is_overdue && (
                  <div className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="font-medium">Pagamento esperado em breve</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary Card */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Receita Previsível Mensal</p>
                  <p className="text-xs text-muted-foreground">
                    Baseado em {recurringRevenues.length} padrão{recurringRevenues.length !== 1 ? 'ões' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  R$ {totalExpectedRevenue.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-muted-foreground">~por mês</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
