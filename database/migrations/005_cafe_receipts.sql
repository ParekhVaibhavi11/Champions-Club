BEGIN;

ALTER TABLE cafe_orders
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS membership_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(32),
  ADD COLUMN IF NOT EXISTS receipt_email_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS receipt_emailed_at TIMESTAMPTZ;

UPDATE cafe_orders AS o
SET guest_email = u.email
FROM users AS u
WHERE u.id = o.member_id AND o.guest_email IS NULL;

UPDATE cafe_orders
SET receipt_email_status = COALESCE(receipt_email_status, 'LEGACY')
WHERE receipt_email_status IS NULL;

ALTER TABLE cafe_orders
  ALTER COLUMN receipt_email_status SET DEFAULT 'PENDING',
  ALTER COLUMN receipt_email_status SET NOT NULL;

COMMIT;
