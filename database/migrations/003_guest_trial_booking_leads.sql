-- Guest trial booking fields required by POST /api/v1/trials/request and its
-- invoice/status lookups. Run against databases created before guest bookings.
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'REQUESTED';
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'RESCHEDULED';
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS 'NO_SHOW';

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS reference_code VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS preferred_date DATE,
  ADD COLUMN IF NOT EXISTS preferred_time TIME,
  ADD COLUMN IF NOT EXISTS participants_count INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS court_id INT REFERENCES courts(id),
  ADD COLUMN IF NOT EXISTS booking_id INT REFERENCES bookings(id),
  ADD COLUMN IF NOT EXISTS secret_token VARCHAR(64),
  ADD COLUMN IF NOT EXISTS fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS visit_count INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payment_method payment_method_type,
  ADD COLUMN IF NOT EXISTS payment_status payment_status_type,
  ADD COLUMN IF NOT EXISTS invoice_id INT;
