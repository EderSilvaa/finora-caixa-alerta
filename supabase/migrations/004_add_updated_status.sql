-- Add UPDATED status to bank_connections constraint
-- Pluggy returns 'UPDATED' status when a connection is successfully synced

-- Drop the old constraint
ALTER TABLE bank_connections
DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with UPDATED status
ALTER TABLE bank_connections
ADD CONSTRAINT valid_status
CHECK (status IN ('ACTIVE', 'UPDATED', 'OUTDATED', 'LOGIN_ERROR', 'WAITING_USER_INPUT', 'DISABLED'));
