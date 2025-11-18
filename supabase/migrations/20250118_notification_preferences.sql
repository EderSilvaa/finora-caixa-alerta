-- Migration: Notification Preferences System
-- Created: 2025-01-18
-- Description: Allows users to configure when and what notifications they want to receive

-- Table: notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- General settings
  enabled BOOLEAN DEFAULT false,
  push_subscription JSONB, -- Web Push subscription object

  -- Alert types
  alert_cash_low BOOLEAN DEFAULT true,
  alert_goals_progress BOOLEAN DEFAULT true,
  alert_analysis_ready BOOLEAN DEFAULT true,
  alert_recurring_payment BOOLEAN DEFAULT true,
  alert_anomaly_detected BOOLEAN DEFAULT true,

  -- Schedule settings
  daily_digest BOOLEAN DEFAULT false,
  daily_digest_time TIME DEFAULT '09:00:00',

  weekly_summary BOOLEAN DEFAULT false,
  weekly_summary_day INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday, etc
  weekly_summary_time TIME DEFAULT '09:00:00',

  -- Custom schedule (cron-like format)
  custom_schedule TEXT[],

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',

  -- Notification channels
  channel_push BOOLEAN DEFAULT true,
  channel_email BOOLEAN DEFAULT false,
  channel_whatsapp BOOLEAN DEFAULT false,

  CONSTRAINT unique_user_notification_prefs UNIQUE(user_id)
);

-- Index for faster queries
CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_enabled ON notification_preferences(enabled) WHERE enabled = true;

-- Table: notification_history
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('cash_low', 'goal_progress', 'analysis_ready', 'recurring_payment', 'anomaly', 'daily_digest', 'weekly_summary')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Delivery info
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'whatsapp')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'clicked')),
  error_message TEXT,

  -- Metadata
  data JSONB,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Index for notification history
CREATE INDEX idx_notification_history_user ON notification_history(user_id, created_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status) WHERE status = 'pending';

-- Function: Get user notification preferences
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  enabled BOOLEAN,
  alert_cash_low BOOLEAN,
  alert_goals_progress BOOLEAN,
  alert_analysis_ready BOOLEAN,
  alert_recurring_payment BOOLEAN,
  alert_anomaly_detected BOOLEAN,
  daily_digest BOOLEAN,
  daily_digest_time TIME,
  weekly_summary BOOLEAN,
  weekly_summary_day INTEGER,
  weekly_summary_time TIME,
  quiet_hours_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  push_subscription JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    np.id,
    np.enabled,
    np.alert_cash_low,
    np.alert_goals_progress,
    np.alert_analysis_ready,
    np.alert_recurring_payment,
    np.alert_anomaly_detected,
    np.daily_digest,
    np.daily_digest_time,
    np.weekly_summary,
    np.weekly_summary_day,
    np.weekly_summary_time,
    np.quiet_hours_enabled,
    np.quiet_hours_start,
    np.quiet_hours_end,
    np.push_subscription
  FROM notification_preferences np
  WHERE np.user_id = p_user_id;

  -- If user doesn't have preferences yet, return defaults
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Save notification to history
CREATE OR REPLACE FUNCTION save_notification_history(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_channel TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification_history (user_id, type, title, message, channel, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_channel, p_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark notification as sent
CREATE OR REPLACE FUNCTION mark_notification_sent(
  p_notification_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE notification_history
  SET
    sent_at = NOW(),
    status = CASE WHEN p_success THEN 'sent' ELSE 'failed' END,
    error_message = p_error_message
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark notification as clicked
CREATE OR REPLACE FUNCTION mark_notification_clicked(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notification_history
  SET
    status = 'clicked',
    clicked_at = NOW()
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own notification preferences
DROP POLICY IF EXISTS "Users can view own notification prefs" ON notification_preferences;
CREATE POLICY "Users can view own notification prefs"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification prefs" ON notification_preferences;
CREATE POLICY "Users can update own notification prefs"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification prefs" ON notification_preferences;
CREATE POLICY "Users can insert own notification prefs"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their notification history
DROP POLICY IF EXISTS "Users can view own notification history" ON notification_history;
CREATE POLICY "Users can view own notification history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all notifications
DROP POLICY IF EXISTS "Service role full access to notification prefs" ON notification_preferences;
CREATE POLICY "Service role full access to notification prefs"
  ON notification_preferences FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to notification history" ON notification_history;
CREATE POLICY "Service role full access to notification history"
  ON notification_history FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Trigger: Update timestamp on preferences change
CREATE OR REPLACE FUNCTION update_notification_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_notification_prefs_update ON notification_preferences;
CREATE TRIGGER on_notification_prefs_update
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_prefs_timestamp();

-- Comments
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences and push subscriptions';
COMMENT ON TABLE notification_history IS 'Stores history of all notifications sent to users';
COMMENT ON COLUMN notification_preferences.push_subscription IS 'Web Push API subscription object (endpoint, keys)';
COMMENT ON COLUMN notification_preferences.custom_schedule IS 'Array of custom notification times in cron format';
