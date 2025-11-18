import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
  enabled: boolean;
  alert_cash_low: boolean;
  alert_goals_progress: boolean;
  alert_analysis_ready: boolean;
  alert_recurring_payment: boolean;
  alert_anomaly_detected: boolean;
  daily_digest: boolean;
  daily_digest_time: string;
  weekly_summary: boolean;
  weekly_summary_day: number;
  weekly_summary_time: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  channel_push: boolean;
  channel_email: boolean;
  channel_whatsapp: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push
        // Note: You need to generate VAPID keys and set VITE_VAPID_PUBLIC_KEY in .env
        // Generate keys: npx web-push generate-vapid-keys
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          console.warn('VITE_VAPID_PUBLIC_KEY not configured. Push notifications will not work.');
          console.warn('Generate VAPID keys with: npx web-push generate-vapid-keys');
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey ? this.urlBase64ToUint8Array(vapidKey) : undefined
        });
      }

      // Save subscription to database
      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      await this.saveSubscription(userId, pushSubscription);

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(userId: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from database
      await this.removeSubscription(userId);
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      throw error;
    }
  }

  /**
   * Save push subscription to database
   */
  private async saveSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        push_subscription: subscription,
        enabled: true
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  /**
   * Remove push subscription from database
   */
  private async removeSubscription(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        push_subscription: null,
        enabled: false
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  /**
   * Show local notification (for testing)
   */
  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    // Use maybeSingle() instead of single() to avoid error when no record exists
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }

    // If no preferences exist yet, create default ones
    if (!data) {
      const { data: newPrefs, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating notification preferences:', insertError);
        return null;
      }

      return newPrefs as NotificationPreferences;
    }

    return data as NotificationPreferences | null;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id' // Specify which column to use for conflict resolution
        }
      );

    if (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Send notification (backend will handle actual push)
   */
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_history')
      .insert({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        channel: 'push',
        data: data,
        status: 'pending'
      });

    if (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  /**
   * Get notification history
   */
  async getHistory(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('notification_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting notification history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Helper: Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Helper: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Check if notification should be sent based on quiet hours
   */
  isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  }
}

export const notificationService = new NotificationService();
