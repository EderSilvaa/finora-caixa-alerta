import { useState } from 'react';
import { Bell, X, AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAIAnalysis, type AIAlert } from '@/hooks/useAIAnalysis';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AlertsCenter = () => {
  const { alerts, markAlertAsRead, markAllAlertsAsRead } = useAIAnalysis();
  const [open, setOpen] = useState(false);

  const getAlertIcon = (type: AIAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (type: AIAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  const handleMarkAsRead = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAlertAsRead(alertId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAlertsAsRead();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {alerts.length > 9 ? '9+' : alerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold">Alertas</h3>
            <p className="text-sm text-muted-foreground">
              {alerts.length} {alerts.length === 1 ? 'alerta não lido' : 'alertas não lidos'}
            </p>
          </div>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todos como lidos
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum alerta novo</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors cursor-pointer group',
                    alert.actionRequired && 'bg-muted/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm leading-none">{alert.title}</h4>
                            <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                              {alert.type === 'critical'
                                ? 'Crítico'
                                : alert.type === 'warning'
                                ? 'Aviso'
                                : 'Info'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => handleMarkAsRead(alert.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {alert.message}
                      </p>

                      {alert.actionRequired && alert.actionUrl && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          Ver detalhes →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
