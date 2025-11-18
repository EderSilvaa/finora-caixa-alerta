import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationPreferences } from '@/services/notification.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  preferences: NotificationPreferences | null;
  loading: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isSupported: notificationService.isSupported(),
    permission: notificationService.getPermission(),
    isSubscribed: false,
    preferences: null,
    loading: true,
  });

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        preferences: null,
        loading: false,
      }));
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const prefs = await notificationService.getPreferences(user.id);
      setState((prev) => ({
        ...prev,
        preferences: prefs,
        isSubscribed: prefs?.enabled || false,
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const permission = await notificationService.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast.success('Permissão concedida!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Permissão negada. Habilite nas configurações do navegador.');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Erro ao solicitar permissão');
      return false;
    }
  }, [state.isSupported]);

  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    if (!state.isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Request permission if not granted
      if (state.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({ ...prev, loading: false }));
          return false;
        }
      }

      // Subscribe to push notifications
      const subscription = await notificationService.subscribeToPush(user.id);

      if (subscription) {
        await loadPreferences();
        toast.success('Notificações ativadas com sucesso!');
        return true;
      }

      setState((prev) => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Erro ao ativar notificações');
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  }, [user, state.isSupported, state.permission, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      await notificationService.unsubscribeFromPush(user.id);
      await loadPreferences();
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast.error('Erro ao desativar notificações');
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  }, [user]);

  const updatePreferences = useCallback(
    async (preferences: Partial<NotificationPreferences>) => {
      if (!user) return false;

      try {
        await notificationService.updatePreferences(user.id, preferences);
        await loadPreferences();
        return true;
      } catch (error) {
        console.error('Error updating preferences:', error);
        toast.error('Erro ao atualizar preferências');
        return false;
      }
    },
    [user]
  );

  const sendTestNotification = useCallback(async () => {
    if (!state.isSupported) {
      toast.error('Notificações não são suportadas');
      return false;
    }

    if (state.permission !== 'granted') {
      toast.error('Permissão de notificação não concedida');
      return false;
    }

    try {
      await notificationService.showNotification('🎉 Teste de Notificação', {
        body: 'Suas notificações estão funcionando perfeitamente!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
        requireInteraction: false,
      });

      toast.success('Notificação de teste enviada!');
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erro ao enviar notificação de teste');
      return false;
    }
  }, [state.isSupported, state.permission]);

  const sendNotification = useCallback(
    async (
      type: string,
      title: string,
      message: string,
      data?: any
    ) => {
      if (!user) return false;
      if (!state.preferences?.enabled) return false;

      // Check if notification type is enabled
      const typeKey = `alert_${type}` as keyof NotificationPreferences;
      if (typeKey in state.preferences && !state.preferences[typeKey]) {
        return false;
      }

      // Check quiet hours
      if (notificationService.isInQuietHours(state.preferences)) {
        console.log('Notification suppressed due to quiet hours');
        return false;
      }

      try {
        await notificationService.sendNotification(user.id, type, title, message, data);
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    },
    [user, state.preferences]
  );

  const getNotificationHistory = useCallback(
    async (limit = 50) => {
      if (!user) return [];

      try {
        return await notificationService.getHistory(user.id, limit);
      } catch (error) {
        console.error('Error getting notification history:', error);
        return [];
      }
    },
    [user]
  );

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
    sendNotification,
    getNotificationHistory,
    refresh: loadPreferences,
  };
}
