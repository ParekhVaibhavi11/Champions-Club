BEGIN;

ALTER TABLE shop_orders
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS membership_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(32),
  ADD COLUMN IF NOT EXISTS receipt_email_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS receipt_emailed_at TIMESTAMPTZ;

UPDATE shop_orders AS o
SET customer_name = u.full_name,
    customer_email = u.email
FROM users AS u
WHERE u.id = o.customer_id
  AND (o.customer_name IS NULL OR o.customer_email IS NULL);

UPDATE shop_orders
SET customer_name = COALESCE(customer_name, 'Existing POS Customer'),
    customer_email = COALESCE(customer_email, 'legacy-order-' || id || '@invalid.local'),
    receipt_email_status = COALESCE(receipt_email_status, 'LEGACY')
WHERE customer_name IS NULL OR customer_email IS NULL OR receipt_email_status IS NULL;

ALTER TABLE shop_orders
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN customer_email SET NOT NULL,
  ALTER COLUMN receipt_email_status SET DEFAULT 'PENDING',
  ALTER COLUMN receipt_email_status SET NOT NULL;

COMMIT;
