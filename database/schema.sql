-- ====================================================================
-- Champions Club Management System — Comprehensive PostgreSQL Schema
-- Database: PostgreSQL 15+
-- Concurrency & Integrity: GiST exclusion, Foreign Keys, CHECK constraints
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'front_desk', 'staff', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE membership_tier AS ENUM ('GOLD', 'SILVER', 'JUNIOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE allocation_type AS ENUM ('MEMBER_BOOKING', 'GUEST_BOOKING', 'SOCIAL_PLAY', 'MAINTENANCE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE allocation_status AS ENUM ('CONFIRMED', 'CANCELLED', 'CHECKED_IN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('CASH', 'CARD', 'UPI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE kitchen_status_type AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tab_status_type AS ENUM ('OPEN', 'SETTLED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_type AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'LOST', 'REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. IDENTITY & USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL DEFAULT 'member',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL, -- 'front_desk', 'shop', 'cafe', 'kitchen', 'management'
    can_access_pos BOOLEAN DEFAULT FALSE,
    can_access_kitchen BOOLEAN DEFAULT FALSE,
    hourly_wage NUMERIC(10, 2) DEFAULT 0.00,
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS member_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    member_code VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password-reset codes are single-use and expire after a short period.
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    token VARCHAR(128) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_used
    ON password_resets(user_id, used);

-- 4. MEMBERSHIP PLANS & BENEFITS
CREATE TABLE IF NOT EXISTS membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tier membership_tier NOT NULL UNIQUE,
    monthly_fee NUMERIC(10, 2) NOT NULL,
    court_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- e.g. 100.00 for free court access or 20.00
    shop_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cafe_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    free_court_hours_per_month INT NOT NULL DEFAULT 0,
    max_daily_sessions INT NOT NULL DEFAULT 2,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES membership_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status membership_status NOT NULL DEFAULT 'ACTIVE',
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_status ON memberships(user_id, status);

-- 5. SPORTS & COURTS
CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS courts (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    surface_type VARCHAR(50), -- Clay, Hard, Grass, Turf
    hourly_rate_member NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    hourly_rate_guest NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURT ALLOCATIONS & BOOKINGS (CONCURRENCY DEFENSE via GiST)
-- Common table for 1-hr bookings, maintenance, and Friday Social Play.
CREATE TABLE IF NOT EXISTS court_allocations (
    id SERIAL PRIMARY KEY,
    court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    slot_range TSTZRANGE NOT NULL,
    type allocation_type NOT NULL,
    status allocation_status NOT NULL DEFAULT 'CONFIRMED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Guaranteed collision-free constraint across all event types
    CONSTRAINT no_court_overlap EXCLUDE USING gist (
        court_id WITH =,
        slot_range WITH &&
    ) WHERE (status = 'CONFIRMED')
);

CREATE INDEX IF NOT EXISTS idx_allocations_court_range ON court_allocations USING gist (court_id, slot_range);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    allocation_id INT UNIQUE NOT NULL REFERENCES court_allocations(id) ON DELETE CASCADE,
    member_id INT REFERENCES users(id) ON DELETE SET NULL, -- Null if guest walk-in
    booked_by_staff_id INT REFERENCES users(id) ON DELETE SET NULL,
    guest_name VARCHAR(150),
    guest_phone VARCHAR(50),
    fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status payment_status_type NOT NULL DEFAULT 'SUCCESS',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_member_created ON bookings(member_id, created_at);

-- Friday Social Play: Multiple participants share one allocation
CREATE TABLE IF NOT EXISTS social_sessions (
    id SERIAL PRIMARY KEY,
    allocation_id INT UNIQUE NOT NULL REFERENCES court_allocations(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL DEFAULT 'Friday Night Social Play',
    capacity INT NOT NULL DEFAULT 16,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_registrations (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES social_sessions(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fee_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_social_session_user UNIQUE(session_id, user_id)
);

-- 7. GEAR SHOP & INVENTORY (CATALOG VIEW ONLINE, IN-STORE POS SALES ONLY)
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    retail_price NUMERIC(10, 2) NOT NULL,
    member_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change_qty INT NOT NULL,
    balance_qty INT NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- 'POS_SALE', 'RESTOCK', 'DAMAGE', 'ADJUSTMENT'
    reference_id INT, -- e.g. shop_orders.id
    recorded_by_id INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_orders (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(254) NOT NULL,
    cashier_id INT NOT NULL REFERENCES users(id),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    membership_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    membership_tier VARCHAR(32),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method_type NOT NULL,
    payment_status payment_status_type NOT NULL DEFAULT 'SUCCESS',
    receipt_email_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    receipt_emailed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 8. CAFÉ & BAR (TABLES, OPEN TABS, KITCHEN ORDERS)
CREATE TABLE IF NOT EXISTS cafe_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES cafe_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    member_discount_eligible BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dining_tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'AVAILABLE' -- 'AVAILABLE', 'OCCUPIED'
);

CREATE TABLE IF NOT EXISTS cafe_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    table_id INT REFERENCES dining_tables(id) ON DELETE SET NULL,
    member_id INT REFERENCES users(id) ON DELETE SET NULL,
    guest_name VARCHAR(100),
    order_type VARCHAR(20) NOT NULL DEFAULT 'TAB', -- 'TAB', 'INSTANT'
    status tab_status_type NOT NULL DEFAULT 'OPEN',
    kitchen_status kitchen_status_type NOT NULL DEFAULT 'PENDING',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    opened_by_staff_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cafe_order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES cafe_orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CRM & LEADS
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    sport_interest VARCHAR(100),
    inquiry_type VARCHAR(50) DEFAULT 'TRIAL_SESSION', -- 'TRIAL_SESSION', 'MEMBERSHIP', 'CORPORATE'
    status lead_status_type NOT NULL DEFAULT 'NEW',
    reference_code VARCHAR(64) UNIQUE,
    preferred_date DATE,
    preferred_time TIME,
    participants_count INT NOT NULL DEFAULT 1,
    court_id INT REFERENCES courts(id),
    booking_id INT REFERENCES bookings(id),
    secret_token VARCHAR(64),
    fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    visit_count INT NOT NULL DEFAULT 1,
    payment_method payment_method_type,
    payment_status payment_status_type,
    invoice_id INT,
    notes TEXT,
    assigned_staff_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    plan_id INT REFERENCES membership_plans(id),
    quote_amount NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    valid_until DATE,
    status VARCHAR(30) DEFAULT 'SENT', -- 'SENT', 'ACCEPTED', 'EXPIRED'
    created_by_id INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HR & STAFF SHIFTS
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    monthly_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS shifts (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    shift_type VARCHAR(50) DEFAULT 'REGULAR', -- 'MORNING', 'EVENING', 'FULL_DAY'
    cash_drawer_start NUMERIC(10, 2) DEFAULT 0.00,
    cash_drawer_end NUMERIC(10, 2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- 'SICK', 'VACATION', 'CASUAL'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    reviewed_by_id INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FINANCE, INVOICES & PAYMENTS (SEPARATE ACCOUNTING)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    source_type VARCHAR(50) NOT NULL, -- 'MEMBERSHIP', 'COURT', 'SHOP', 'CAFE', 'CORPORATE'
    source_id INT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PAID', -- 'PAID', 'PENDING', 'VOID'
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    source_type VARCHAR(50) NOT NULL, -- 'MEMBERSHIP', 'COURT', 'SHOP', 'CAFE'
    source_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method_type NOT NULL,
    transaction_ref VARCHAR(100),
    status payment_status_type NOT NULL DEFAULT 'SUCCESS',
    collected_by_id INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'EQUIPMENT', 'UTILITIES', 'SUPPLIES', 'MAINTENANCE'
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    recorded_by_id INT REFERENCES users(id),
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
