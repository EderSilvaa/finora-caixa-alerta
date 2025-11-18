import { supabase } from '@/lib/supabase';

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: 'daily_digest' | 'weekly_summary' | 'cash_low_alert' | 'goal_reminder';
  scheduledFor: Date;
  data?: any;
}

class NotificationSchedulerService {
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL_MS = 60000; // Check every minute

  /**
   * Start the notification scheduler
   */
  start(): void {
    if (this.checkInterval) {
      console.warn('Notification scheduler is already running');
      return;
    }

    console.log('Starting notification scheduler...');
    this.checkInterval = window.setInterval(() => {
      this.checkScheduledNotifications();
    }, this.CHECK_INTERVAL_MS);

    // Run initial check
    this.checkScheduledNotifications();
  }

  /**
   * Stop the notification scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Notification scheduler stopped');
    }
  }

  /**
   * Check and send scheduled notifications
   */
  private async checkScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      // Check for daily digests
      await this.checkDailyDigests(currentTime);

      // Check for weekly summaries
      await this.checkWeeklySummaries(currentTime, currentDay);

      // Check for cash low alerts
      await this.checkCashLowAlerts();

      // Check for goal reminders
      await this.checkGoalReminders();
    } catch (error) {
      console.error('Error checking scheduled notifications:', error);
    }
  }

  /**
   * Check and send daily digest notifications
   */
  private async checkDailyDigests(currentTime: string): Promise<void> {
    try {
      // Get users who want daily digest at this time
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('user_id, daily_digest_time')
        .eq('enabled', true)
        .eq('daily_digest', true);

      if (error) throw error;

      if (!preferences || preferences.length === 0) return;

      for (const pref of preferences) {
        const digestTime = pref.daily_digest_time.substring(0, 5); // HH:MM format

        // Check if it's time to send (with 1-minute tolerance)
        if (digestTime === currentTime) {
          await this.sendDailyDigest(pref.user_id);
        }
      }
    } catch (error) {
      console.error('Error checking daily digests:', error);
    }
  }

  /**
   * Check and send weekly summary notifications
   */
  private async checkWeeklySummaries(currentTime: string, currentDay: number): Promise<void> {
    try {
      // Get users who want weekly summary at this time and day
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('user_id, weekly_summary_time, weekly_summary_day')
        .eq('enabled', true)
        .eq('weekly_summary', true)
        .eq('weekly_summary_day', currentDay);

      if (error) throw error;

      if (!preferences || preferences.length === 0) return;

      for (const pref of preferences) {
        const summaryTime = pref.weekly_summary_time.substring(0, 5); // HH:MM format

        if (summaryTime === currentTime) {
          await this.sendWeeklySummary(pref.user_id);
        }
      }
    } catch (error) {
      console.error('Error checking weekly summaries:', error);
    }
  }

  /**
   * Check for cash low alerts
   */
  private async checkCashLowAlerts(): Promise<void> {
    try {
      // Get users with cash low alerts enabled
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('enabled', true)
        .eq('alert_cash_low', true);

      if (error) throw error;

      if (!preferences || preferences.length === 0) return;

      for (const pref of preferences) {
        // Get user's current balance and threshold
        const { data: projection } = await supabase.rpc('get_cash_projection', {
          p_user_id: pref.user_id,
          p_days_ahead: 7
        });

        if (projection && projection.length > 0) {
          const firstNegativeDay = projection.find((day: any) => day.balance < 0);

          if (firstNegativeDay) {
            // Check if we already sent an alert today
            const today = new Date().toISOString().split('T')[0];
            const { data: recentAlert } = await supabase
              .from('notification_history')
              .select('id')
              .eq('user_id', pref.user_id)
              .eq('type', 'cash_low')
              .gte('created_at', `${today}T00:00:00`)
              .single();

            if (!recentAlert) {
              await this.sendCashLowAlert(pref.user_id, firstNegativeDay);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking cash low alerts:', error);
    }
  }

  /**
   * Check for goal reminders
   */
  private async checkGoalReminders(): Promise<void> {
    try {
      // Get users with goals progress alerts enabled
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('enabled', true)
        .eq('alert_goals_progress', true);

      if (error) throw error;

      if (!preferences || preferences.length === 0) return;

      for (const pref of preferences) {
        // Get user's goals that are close to deadline or milestone
        const { data: goals } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', pref.user_id)
          .eq('status', 'active');

        if (goals && goals.length > 0) {
          for (const goal of goals) {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const daysUntilDeadline = Math.floor(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            // Send reminder if:
            // 1. Progress is at 25%, 50%, 75%, or 90%
            // 2. Deadline is in 7, 3, or 1 day(s)
            const milestones = [25, 50, 75, 90];
            const deadlineAlerts = [7, 3, 1];

            if (milestones.some((m) => Math.abs(progress - m) < 1)) {
              await this.sendGoalProgressAlert(pref.user_id, goal, progress);
            } else if (deadlineAlerts.includes(daysUntilDeadline)) {
              await this.sendGoalDeadlineAlert(pref.user_id, goal, daysUntilDeadline);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking goal reminders:', error);
    }
  }

  /**
   * Send daily digest notification
   */
  private async sendDailyDigest(userId: string): Promise<void> {
    try {
      // Get today's summary
      const { data: summary } = await supabase.rpc('get_daily_summary', {
        p_user_id: userId
      });

      if (summary) {
        await supabase
          .from('notification_history')
          .insert({
            user_id: userId,
            type: 'daily_digest',
            title: '📊 Resumo Diário',
            message: `Saldo: R$ ${summary.balance.toFixed(2)} | Entradas: R$ ${summary.income.toFixed(2)} | Saídas: R$ ${summary.expenses.toFixed(2)}`,
            channel: 'push',
            data: summary,
            status: 'pending'
          });
      }
    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  }

  /**
   * Send weekly summary notification
   */
  private async sendWeeklySummary(userId: string): Promise<void> {
    try {
      const { data: summary } = await supabase.rpc('get_weekly_summary', {
        p_user_id: userId
      });

      if (summary) {
        await supabase
          .from('notification_history')
          .insert({
            user_id: userId,
            type: 'weekly_summary',
            title: '📈 Resumo Semanal',
            message: `Semana: Saldo final R$ ${summary.ending_balance.toFixed(2)} | Economia: R$ ${summary.savings.toFixed(2)}`,
            channel: 'push',
            data: summary,
            status: 'pending'
          });
      }
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }

  /**
   * Send cash low alert
   */
  private async sendCashLowAlert(userId: string, firstNegativeDay: any): Promise<void> {
    try {
      const daysUntil = Math.ceil(
        (new Date(firstNegativeDay.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          type: 'cash_low',
          title: '⚠️ Alerta de Caixa Baixo',
          message: `Seu caixa pode ficar negativo em ${daysUntil} dias. Saldo previsto: R$ ${firstNegativeDay.balance.toFixed(2)}`,
          channel: 'push',
          data: { first_negative_day: firstNegativeDay, days_until: daysUntil },
          status: 'pending'
        });
    } catch (error) {
      console.error('Error sending cash low alert:', error);
    }
  }

  /**
   * Send goal progress alert
   */
  private async sendGoalProgressAlert(userId: string, goal: any, progress: number): Promise<void> {
    try {
      await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          type: 'goal_progress',
          title: '🎯 Progresso da Meta',
          message: `Você atingiu ${progress.toFixed(0)}% da meta "${goal.name}"! Continue assim!`,
          channel: 'push',
          data: { goal_id: goal.id, progress },
          status: 'pending'
        });
    } catch (error) {
      console.error('Error sending goal progress alert:', error);
    }
  }

  /**
   * Send goal deadline alert
   */
  private async sendGoalDeadlineAlert(userId: string, goal: any, daysLeft: number): Promise<void> {
    try {
      await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          type: 'goal_progress',
          title: '⏰ Prazo da Meta',
          message: `Faltam ${daysLeft} dia(s) para a meta "${goal.name}". Atual: R$ ${goal.current_amount.toFixed(2)} de R$ ${goal.target_amount.toFixed(2)}`,
          channel: 'push',
          data: { goal_id: goal.id, days_left: daysLeft },
          status: 'pending'
        });
    } catch (error) {
      console.error('Error sending goal deadline alert:', error);
    }
  }
}

export const notificationScheduler = new NotificationSchedulerService();
