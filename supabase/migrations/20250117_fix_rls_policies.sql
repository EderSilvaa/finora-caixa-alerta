-- Fix RLS Policies: Allow users to INSERT their own analysis
-- This is needed for the frontend to save analysis results

-- Users can insert their own analysis results
DROP POLICY IF EXISTS "Users can insert own analysis results" ON ai_analysis_results;
CREATE POLICY "Users can insert own analysis results"
  ON ai_analysis_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own alerts
DROP POLICY IF EXISTS "Users can insert own alerts" ON ai_alerts;
CREATE POLICY "Users can insert own alerts"
  ON ai_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own schedule
DROP POLICY IF EXISTS "Users can insert own schedule" ON ai_analysis_schedule;
CREATE POLICY "Users can insert own schedule"
  ON ai_analysis_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);
