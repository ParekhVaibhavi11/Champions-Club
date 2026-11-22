import pool from './config/db.js';

async function migrateLeadsSchema() {
  const newStatuses = ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  for (const s of newStatuses) {
    try {
      await pool.query(`ALTER TYPE lead_status_type ADD VALUE IF NOT EXISTS '${s}'`);
      console.log(`Added enum value: ${s}`);
    } catch (e) {
      console.log(`Enum value note for ${s}:`, e.message);
    }
  }

  await pool.query(`
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
    ADD COLUMN IF NOT EXISTS invoice_id INT
  `);

  console.log('✅ Leads schema extended successfully for Guest Trial Booking System!');
  process.exit(0);
}

migrateLeadsSchema().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
