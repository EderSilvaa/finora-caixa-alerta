-- Migration: AI Analysis System for 24/7 Monitoring (SAFE VERSION)
-- Created: 2025-01-17
-- Description: Creates tables and functions for continuous AI analysis (safe to re-run)

-- Table: ai_analysis_results
-- Stores the results of AI analyses run in background
CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Analysis status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,

  -- Financial snapshot at analysis time
  current_balance NUMERIC(15, 2),
  total_revenue NUMERIC(15, 2),
  total_expenses NUMERIC(15, 2),
  days_until_zero INTEGER,

  -- AI Insights
  insights JSONB DEFAULT '{}',

  -- AI Predictions
  balance_prediction JSONB,

  -- Anomalies detected
  anomalies JSONB DEFAULT '[]',

  -- Spending patterns
  spending_patterns JSONB DEFAULT '[]',

  -- Metadata
  transaction_count INTEGER DEFAULT 0,
  analysis_duration_ms INTEGER
);

-- Index for faster queries (drop and recreate to avoid conflicts)
DROP INDEX IF EXISTS idx_ai_analysis_user_date;
CREATE INDEX idx_ai_analysis_user_date ON ai_analysis_results(user_id, analysis_date DESC);

DROP INDEX IF EXISTS idx_ai_analysis_status;
CREATE INDEX idx_ai_analysis_status ON ai_analysis_results(status);

-- Table: ai_alerts
-- Stores critical alerts that need user attention
CREATE TABLE IF NOT EXISTS ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES ai_analysis_results(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Alert details
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Alert status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Optional action data
  action_required BOOLEAN DEFAULT FALSE,
  action_url TEXT,

  -- Related data
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL
);

-- Index for alerts
DROP INDEX IF EXISTS idx_ai_alerts_user_unread;
CREATE INDEX idx_ai_alerts_user_unread ON ai_alerts(user_id, is_read, created_at DESC);

DROP INDEX IF EXISTS idx_ai_alerts_type;
CREATE INDEX idx_ai_alerts_type ON ai_alerts(type);

-- Table: ai_analysis_schedule
-- Tracks when to run analysis for each user
CREATE TABLE IF NOT EXISTS ai_analysis_schedule (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Schedule settings
  enabled BOOLEAN DEFAULT TRUE,
  frequency_minutes INTEGER DEFAULT 60, -- Run every hour by default

  -- Last run tracking
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'failed', 'skipped')),

  -- Next scheduled run
  next_run_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  consecutive_failures INTEGER DEFAULT 0,
  last_error TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function: Get latest analysis for user
CREATE OR REPLACE FUNCTION get_latest_analysis(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  analysis_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  current_balance NUMERIC,
  insights JSONB,
  balance_prediction JSONB,
  anomalies JSONB,
  spending_patterns JSONB,
  unread_alerts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.analysis_date,
    a.status,
    a.current_balance,
    a.insights,
    a.balance_prediction,
    a.anomalies,
    a.spending_patterns,
    (SELECT COUNT(*)::INTEGER FROM ai_alerts WHERE user_id = p_user_id AND is_read = FALSE) as unread_alerts
  FROM ai_analysis_results a
  WHERE a.user_id = p_user_id AND a.status = 'completed'
  ORDER BY a.analysis_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark alert as read
CREATE OR REPLACE FUNCTION mark_alert_read(p_alert_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ai_alerts
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_alert_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Schedule next analysis
CREATE OR REPLACE FUNCTION schedule_next_analysis(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_frequency INTEGER;
BEGIN
  -- Get user's frequency setting
  SELECT frequency_minutes INTO v_frequency
  FROM ai_analysis_schedule
  WHERE user_id = p_user_id;

  -- If not found, insert default
  IF NOT FOUND THEN
    INSERT INTO ai_analysis_schedule (user_id, next_run_at)
    VALUES (p_user_id, NOW() + INTERVAL '60 minutes')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Update next run time
    UPDATE ai_analysis_schedule
    SET next_run_at = NOW() + (v_frequency || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own analysis results" ON ai_analysis_results;
DROP POLICY IF EXISTS "Users can view own alerts" ON ai_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON ai_alerts;
DROP POLICY IF EXISTS "Users can view own schedule" ON ai_analysis_schedule;
DROP POLICY IF EXISTS "Users can update own schedule" ON ai_analysis_schedule;
DROP POLICY IF EXISTS "Service role full access to analysis" ON ai_analysis_results;
DROP POLICY IF EXISTS "Service role full access to alerts" ON ai_alerts;
DROP POLICY IF EXISTS "Service role full access to schedule" ON ai_analysis_schedule;

-- Recreate policies
-- Users can only see their own analysis results
CREATE POLICY "Users can view own analysis results"
  ON ai_analysis_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own alerts
CREATE POLICY "Users can view own alerts"
  ON ai_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own alerts (mark as read)
CREATE POLICY "Users can update own alerts"
  ON ai_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their schedule
CREATE POLICY "Users can view own schedule"
  ON ai_analysis_schedule FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their schedule
CREATE POLICY "Users can update own schedule"
  ON ai_analysis_schedule FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert/update everything (for edge functions)
CREATE POLICY "Service role full access to analysis"
  ON ai_analysis_results FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to alerts"
  ON ai_alerts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to schedule"
  ON ai_analysis_schedule FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Trigger: Initialize schedule for new users
DROP TRIGGER IF EXISTS on_user_created_init_schedule ON auth.users;

CREATE OR REPLACE FUNCTION init_user_analysis_schedule()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_analysis_schedule (user_id, next_run_at)
  VALUES (NEW.id, NOW() + INTERVAL '5 minutes') -- First analysis after 5 minutes
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_init_schedule
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_analysis_schedule();

-- Comments
COMMENT ON TABLE ai_analysis_results IS 'Stores results of automated AI analyses run in background';
COMMENT ON TABLE ai_alerts IS 'Critical alerts generated by AI that require user attention';
COMMENT ON TABLE ai_analysis_schedule IS 'Controls when AI analysis runs for each user';
