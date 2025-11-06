-- Bank Connections Table for Pluggy Integration
-- This table stores user's connected bank accounts via Pluggy/Open Finance

CREATE TABLE IF NOT EXISTS bank_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Pluggy Item Information
  pluggy_item_id text NOT NULL UNIQUE,
  pluggy_connector_id integer NOT NULL,
  connector_name text NOT NULL,
  connector_image_url text,

  -- Connection Status
  status text NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, OUTDATED, LOGIN_ERROR, etc.

  -- Metadata
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'OUTDATED', 'LOGIN_ERROR', 'WAITING_USER_INPUT', 'DISABLED'))
);

-- Bank Accounts Table
-- Stores individual accounts within a bank connection
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank_connection_id uuid REFERENCES bank_connections(id) ON DELETE CASCADE NOT NULL,

  -- Pluggy Account Information
  pluggy_account_id text NOT NULL UNIQUE,
  account_type text NOT NULL, -- CHECKING, SAVINGS, CREDIT, etc.
  account_subtype text,
  account_name text NOT NULL,

  -- Balance Information
  balance numeric(15, 2) NOT NULL DEFAULT 0,
  currency_code text NOT NULL DEFAULT 'BRL',

  -- Metadata
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add Pluggy tracking fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS pluggy_transaction_id text UNIQUE,
ADD COLUMN IF NOT EXISTS pluggy_account_id text,
ADD COLUMN IF NOT EXISTS bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS synced_from_bank boolean NOT NULL DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_pluggy_item_id ON bank_connections(pluggy_item_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_connection_id ON bank_accounts(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_pluggy_account_id ON bank_accounts(pluggy_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pluggy_transaction_id ON transactions(pluggy_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account_id ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_synced_from_bank ON transactions(synced_from_bank);

-- Enable Row Level Security
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_connections
CREATE POLICY "Users can view their own bank connections"
  ON bank_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank connections"
  ON bank_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections"
  ON bank_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections"
  ON bank_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts"
  ON bank_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts"
  ON bank_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
  ON bank_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
  ON bank_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bank_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_bank_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_connection_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_updated_at();

-- Helper function to get user's total balance across all accounts
CREATE OR REPLACE FUNCTION get_total_bank_balance(p_user_id uuid)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(balance), 0)
  FROM bank_accounts
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Helper function to check if transaction already exists (avoid duplicates)
CREATE OR REPLACE FUNCTION transaction_exists(p_pluggy_transaction_id text)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM transactions
    WHERE pluggy_transaction_id = p_pluggy_transaction_id
  );
$$ LANGUAGE sql STABLE;
