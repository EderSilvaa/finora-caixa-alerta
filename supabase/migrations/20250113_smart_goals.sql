-- Smart Financial Goals Table
-- Stores intelligent, AI-suggested goals with real-time progress tracking

CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,

  -- Progress tracking
  progress_percentage INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN target_amount > 0 THEN LEAST(100, ROUND((current_amount / target_amount * 100)::numeric, 0)::integer)
      ELSE 0
    END
  ) STORED,

  -- Time-based goals
  target_date DATE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- AI-generated insights
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  daily_target DECIMAL(10, 2), -- How much per day to reach goal
  weekly_target DECIMAL(10, 2), -- How much per week to reach goal
  on_track BOOLEAN DEFAULT TRUE, -- Is user on pace to hit goal?
  days_behind INTEGER DEFAULT 0, -- How many days behind schedule
  suggested_actions TEXT[], -- Array of action items from AI

  -- Goal status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Category
  category TEXT DEFAULT 'savings' CHECK (category IN (
    'savings', -- General savings
    'emergency_fund', -- Emergency reserves
    'debt_payment', -- Pay off debt
    'business_expansion', -- Grow business
    'equipment', -- Buy equipment/assets
    'reserve', -- Cash reserve
    'custom' -- User-defined
  )),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/manage their own goals
CREATE POLICY "Users can view their own goals"
  ON financial_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON financial_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON financial_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON financial_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_target_date ON financial_goals(target_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_financial_goals_timestamp
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_updated_at();

-- Function to calculate if goal is on track
CREATE OR REPLACE FUNCTION calculate_goal_on_track(
  p_goal_id UUID
)
RETURNS TABLE(
  on_track BOOLEAN,
  days_behind INTEGER,
  daily_required DECIMAL(10, 2)
) AS $$
DECLARE
  v_goal RECORD;
  v_days_total INTEGER;
  v_days_elapsed INTEGER;
  v_expected_progress DECIMAL(10, 2);
BEGIN
  -- Get goal details
  SELECT * INTO v_goal
  FROM financial_goals
  WHERE id = p_goal_id;

  -- If no target date, can't calculate
  IF v_goal.target_date IS NULL THEN
    RETURN QUERY SELECT TRUE, 0, 0::DECIMAL(10, 2);
    RETURN;
  END IF;

  -- Calculate days
  v_days_total := v_goal.target_date - v_goal.started_at::DATE;
  v_days_elapsed := CURRENT_DATE - v_goal.started_at::DATE;

  -- Calculate expected progress
  IF v_days_total > 0 THEN
    v_expected_progress := (v_days_elapsed::DECIMAL / v_days_total) * v_goal.target_amount;
  ELSE
    v_expected_progress := v_goal.target_amount;
  END IF;

  -- Calculate daily required to catch up
  DECLARE
    v_remaining_amount DECIMAL(10, 2);
    v_remaining_days INTEGER;
    v_daily_required DECIMAL(10, 2);
    v_is_on_track BOOLEAN;
    v_days_behind INTEGER;
  BEGIN
    v_remaining_amount := v_goal.target_amount - v_goal.current_amount;
    v_remaining_days := v_goal.target_date - CURRENT_DATE;

    IF v_remaining_days > 0 THEN
      v_daily_required := v_remaining_amount / v_remaining_days;
    ELSE
      v_daily_required := v_remaining_amount;
    END IF;

    -- Check if on track (within 10% tolerance)
    v_is_on_track := v_goal.current_amount >= (v_expected_progress * 0.9);

    -- Calculate days behind
    IF NOT v_is_on_track THEN
      v_days_behind := GREATEST(0, FLOOR((v_expected_progress - v_goal.current_amount) / (v_goal.target_amount / v_days_total)));
    ELSE
      v_days_behind := 0;
    END IF;

    RETURN QUERY SELECT v_is_on_track, v_days_behind, v_daily_required;
  END;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE financial_goals IS 'Stores user financial goals with AI-powered tracking and suggestions';
COMMENT ON COLUMN financial_goals.daily_target IS 'Amount user needs to save/earn per day to reach goal on time';
COMMENT ON COLUMN financial_goals.weekly_target IS 'Amount user needs to save/earn per week to reach goal on time';
COMMENT ON COLUMN financial_goals.on_track IS 'Whether user is on pace to complete goal by target date';
COMMENT ON COLUMN financial_goals.suggested_actions IS 'AI-generated action items to help reach goal';
