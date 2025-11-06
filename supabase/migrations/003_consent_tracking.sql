-- Add consent tracking to bank_connections table
-- This tracks LGPD and Open Finance Brasil consent for each bank connection

ALTER TABLE bank_connections
ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
ADD COLUMN IF NOT EXISTS consent_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS consent_ip_address text;

-- Add comment explaining the consent fields
COMMENT ON COLUMN bank_connections.consent_given_at IS 'Timestamp when user gave explicit consent for data access (LGPD compliance)';
COMMENT ON COLUMN bank_connections.consent_expires_at IS 'Consent expiration date (12 months from given_at per Open Finance Brasil rules)';
COMMENT ON COLUMN bank_connections.consent_ip_address IS 'IP address from which consent was given (audit trail)';

-- Create function to automatically set consent expiration when given_at is updated
CREATE OR REPLACE FUNCTION set_consent_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If consent_given_at is being set, automatically calculate expiration (12 months)
  IF NEW.consent_given_at IS NOT NULL AND (OLD.consent_given_at IS NULL OR NEW.consent_given_at != OLD.consent_given_at) THEN
    NEW.consent_expires_at := NEW.consent_given_at + INTERVAL '12 months';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set consent expiration
DROP TRIGGER IF EXISTS trigger_set_consent_expiration ON bank_connections;
CREATE TRIGGER trigger_set_consent_expiration
  BEFORE INSERT OR UPDATE OF consent_given_at ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION set_consent_expiration();

-- Create index for faster consent expiration queries
CREATE INDEX IF NOT EXISTS idx_bank_connections_consent_expires
ON bank_connections(consent_expires_at)
WHERE consent_expires_at IS NOT NULL;

-- Create view to find connections with expiring consent (within 30 days)
CREATE OR REPLACE VIEW expiring_consents AS
SELECT
  bc.*,
  (bc.consent_expires_at - NOW()) as time_until_expiration
FROM bank_connections bc
WHERE bc.consent_expires_at IS NOT NULL
  AND bc.consent_expires_at > NOW()
  AND bc.consent_expires_at <= (NOW() + INTERVAL '30 days')
ORDER BY bc.consent_expires_at ASC;

-- Grant access to the view
GRANT SELECT ON expiring_consents TO authenticated;
