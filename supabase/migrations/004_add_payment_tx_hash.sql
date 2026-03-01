-- Add payment_tx_hash to delivery_requests for on-chain payment verification
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS payment_tx_hash text;

-- Unique constraint prevents double-use of a transaction
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_requests_payment_tx_hash
  ON delivery_requests (payment_tx_hash)
  WHERE payment_tx_hash IS NOT NULL;

-- Drop old Stripe column if it exists
ALTER TABLE delivery_requests DROP COLUMN IF EXISTS stripe_payment_intent_id;

-- Drop Stripe fields from users and transactions
ALTER TABLE users DROP COLUMN IF EXISTS stripe_account_id;
ALTER TABLE transactions DROP COLUMN IF EXISTS stripe_payment_intent_id;
