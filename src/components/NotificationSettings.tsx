import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, MessageSquare, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { notificationService, NotificationPreferences } from '@/services/notification.service';
import { useAuth } from '@/hooks/useAuth';

export function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    alert_cash_low: true,
    alert_goals_progress: true,
    alert_analysis_ready: true,
    alert_recurring_payment: true,
    alert_anomaly_detected: true,
    daily_digest: false,
    daily_digest_time: '08:00',
    weekly_summary: false,
    weekly_summary_day: 1, // Monday
    weekly_summary_time: '09:00',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    channel_push: true,
    channel_email: false,
    channel_whatsapp: false,
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const prefs = await notificationService.getPreferences(user.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleToggleNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (!preferences.enabled) {
        // Enable notifications
        const permission = await notificationService.requestPermission();

        if (permission === 'granted') {
          await notificationService.subscribeToPush(user.id);

          const newPrefs = { ...preferences, enabled: true };
          setPreferences(newPrefs);
          await notificationService.updatePreferences(user.id, newPrefs);

          toast.success('Notificações ativadas com sucesso!');
        } else {
          toast.error('Permissão de notificação negada');
        }
      } else {
        // Disable notifications
        await notificationService.unsubscribeFromPush(user.id);

        const newPrefs = { ...preferences, enabled: false };
        setPreferences(newPrefs);
        await notificationService.updatePreferences(user.id, newPrefs);

        toast.success('Notificações desativadas');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Erro ao alterar configuração de notificações');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!user) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    try {
      await notificationService.updatePreferences(user.id, { [key]: value });
      toast.success('Preferência atualizada');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Erro ao atualizar preferência');
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;

    setTestingNotification(true);
    try {
      await notificationService.showNotification(
        '🎉 Teste de Notificação',
        {
          body: 'Suas notificações estão funcionando perfeitamente!',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'test-notification',
          requireInteraction: false,
        }
      );
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Error testing notification:', error);
      toast.error('Erro ao enviar notificação de teste');
    } finally {
      setTestingNotification(false);
    }
  };

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {preferences.enabled ? (
                  <Bell className="h-5 w-5 text-violet-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-gray-400" />
                )}
                Notificações
              </CardTitle>
              <CardDescription>
                Receba alertas importantes sobre seu fluxo de caixa
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences.enabled}
                onCheckedChange={handleToggleNotifications}
                disabled={loading}
              />
              <Label htmlFor="notifications-enabled" className="sr-only">
                Ativar notificações
              </Label>
            </div>
          </div>
        </CardHeader>

        {preferences.enabled && (
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={testingNotification}
              className="w-full sm:w-auto"
            >
              <Bell className="h-4 w-4 mr-2" />
              {testingNotification ? 'Enviando...' : 'Testar Notificação'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Alert Types */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipos de Alertas</CardTitle>
            <CardDescription>
              Escolha quais eventos você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <Label htmlFor="alert-cash-low" className="font-medium">
                    Caixa Baixo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando o saldo estiver abaixo do limite
                  </p>
                </div>
              </div>
              <Switch
                id="alert-cash-low"
                checked={preferences.alert_cash_low}
                onCheckedChange={(checked) => handlePreferenceChange('alert_cash_low', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="alert-goals-progress" className="font-medium">
                    Progresso de Metas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizações sobre suas metas financeiras
                  </p>
                </div>
              </div>
              <Switch
                id="alert-goals-progress"
                checked={preferences.alert_goals_progress}
                onCheckedChange={(checked) => handlePreferenceChange('alert_goals_progress', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="alert-analysis-ready" className="font-medium">
                    Análise Pronta
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando uma nova análise estiver disponível
                  </p>
                </div>
              </div>
              <Switch
                id="alert-analysis-ready"
                checked={preferences.alert_analysis_ready}
                onCheckedChange={(checked) => handlePreferenceChange('alert_analysis_ready', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <Label htmlFor="alert-recurring-payment" className="font-medium">
                    Pagamentos Recorrentes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Lembretes de contas a pagar
                  </p>
                </div>
              </div>
              <Switch
                id="alert-recurring-payment"
                checked={preferences.alert_recurring_payment}
                onCheckedChange={(checked) => handlePreferenceChange('alert_recurring_payment', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <Label htmlFor="alert-anomaly-detected" className="font-medium">
                    Anomalias Detectadas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Gastos ou receitas fora do padrão
                  </p>
                </div>
              </div>
              <Switch
                id="alert-anomaly-detected"
                checked={preferences.alert_anomaly_detected}
                onCheckedChange={(checked) => handlePreferenceChange('alert_anomaly_detected', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digest & Summary */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumos Automáticos</CardTitle>
            <CardDescription>
              Receba resumos periódicos do seu fluxo de caixa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-digest" className="font-medium">
                  Resumo Diário
                </Label>
                <Switch
                  id="daily-digest"
                  checked={preferences.daily_digest}
                  onCheckedChange={(checked) => handlePreferenceChange('daily_digest', checked)}
                />
              </div>
              {preferences.daily_digest && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="daily-digest-time" className="text-sm text-muted-foreground">
                    Horário
                  </Label>
                  <input
                    type="time"
                    id="daily-digest-time"
                    value={preferences.daily_digest_time}
                    onChange={(e) => handlePreferenceChange('daily_digest_time', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-summary" className="font-medium">
                  Resumo Semanal
                </Label>
                <Switch
                  id="weekly-summary"
                  checked={preferences.weekly_summary}
                  onCheckedChange={(checked) => handlePreferenceChange('weekly_summary', checked)}
                />
              </div>
              {preferences.weekly_summary && (
                <div className="ml-6 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="weekly-summary-day" className="text-sm text-muted-foreground">
                      Dia da Semana
                    </Label>
                    <Select
                      value={String(preferences.weekly_summary_day)}
                      onValueChange={(value) => handlePreferenceChange('weekly_summary_day', Number(value))}
                    >
                      <SelectTrigger id="weekly-summary-day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly-summary-time" className="text-sm text-muted-foreground">
                      Horário
                    </Label>
                    <input
                      type="time"
                      id="weekly-summary-time"
                      value={preferences.weekly_summary_time}
                      onChange={(e) => handlePreferenceChange('weekly_summary_time', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Horário de Silêncio</CardTitle>
            <CardDescription>
              Não receba notificações durante esses horários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours" className="font-medium">
                Ativar Horário de Silêncio
              </Label>
              <Switch
                id="quiet-hours"
                checked={preferences.quiet_hours_enabled}
                onCheckedChange={(checked) => handlePreferenceChange('quiet_hours_enabled', checked)}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="space-y-3 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-start" className="text-sm text-muted-foreground">
                    Início
                  </Label>
                  <input
                    type="time"
                    id="quiet-hours-start"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => handlePreferenceChange('quiet_hours_start', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-end" className="text-sm text-muted-foreground">
                    Fim
                  </Label>
                  <input
                    type="time"
                    id="quiet-hours-end"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => handlePreferenceChange('quiet_hours_end', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notification Channels */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Canais de Notificação</CardTitle>
            <CardDescription>
              Escolha como deseja receber as notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-violet-500" />
                <Label htmlFor="channel-push" className="font-medium">
                  Notificações Push
                </Label>
              </div>
              <Switch
                id="channel-push"
                checked={preferences.channel_push}
                onCheckedChange={(checked) => handlePreferenceChange('channel_push', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="channel-email" className="font-medium">
                    Email
                  </Label>
                  <p className="text-sm text-muted-foreground">Em breve</p>
                </div>
              </div>
              <Switch
                id="channel-email"
                checked={preferences.channel_email}
                onCheckedChange={(checked) => handlePreferenceChange('channel_email', checked)}
                disabled
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="channel-whatsapp" className="font-medium">
                    WhatsApp
                  </Label>
                  <p className="text-sm text-muted-foreground">Em breve</p>
                </div>
              </div>
              <Switch
                id="channel-whatsapp"
                checked={preferences.channel_whatsapp}
                onCheckedChange={(checked) => handlePreferenceChange('channel_whatsapp', checked)}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
