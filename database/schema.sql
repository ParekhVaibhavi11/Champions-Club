-- Champions Club Baseline Database Schema
-- Compatible with PostgreSQL 13+

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Clean up existing tables if re-running
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS cafe_order_items CASCADE;
DROP TABLE IF EXISTS cafe_orders CASCADE;
DROP TABLE IF EXISTS dining_tables CASCADE;
DROP TABLE IF EXISTS cafe_menu_items CASCADE;
DROP TABLE IF EXISTS cafe_categories CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS shop_order_items CASCADE;
DROP TABLE IF EXISTS shop_orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS social_registrations CASCADE;
DROP TABLE IF EXISTS social_sessions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS court_allocations CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS membership_benefits CASCADE;
DROP TABLE IF EXISTS membership_plans CASCADE;
DROP TABLE IF EXISTS member_profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

DROP TYPE IF EXISTS allocation_type;
DROP TYPE IF EXISTS allocation_status;

-- 1. Users & Roles
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    role VARCHAR(30) NOT NULL DEFAULT 'member', -- 'admin', 'front_desk', 'staff', 'member'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    member_code VARCHAR(30) UNIQUE NOT NULL,
    emergency_contact VARCHAR(100),
    preferred_sport VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membership Plans & Subscriptions
CREATE TABLE membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Gold', 'Silver', 'Junior'
    price_annual NUMERIC(10, 2) NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    discount_shop_pct INT DEFAULT 0,
    discount_cafe_pct INT DEFAULT 0,
    max_daily_bookings INT DEFAULT 2,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES membership_plans(id),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'SUSPENDED'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sports & Courts
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'Tennis', 'Cricket', 'Padel', 'Badminton'
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50)
);

CREATE TABLE courts (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'Tennis Court 1 (Clay)', 'Padel Court A'
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Allocations & Bookings (GiST Exclusion Guard)
CREATE TYPE allocation_type AS ENUM ('MEMBER_BOOKING', 'GUEST_BOOKING', 'SOCIAL_PLAY', 'MAINTENANCE');
CREATE TYPE allocation_status AS ENUM ('CONFIRMED', 'CANCELLED', 'CHECKED_IN');

CREATE TABLE court_allocations (
    id SERIAL PRIMARY KEY,
    court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    slot_range TSTZRANGE NOT NULL,
    type allocation_type NOT NULL,
    status allocation_status NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Guaranteed database-level mutual exclusion
    CONSTRAINT no_court_overlap EXCLUDE USING gist (
        court_id WITH =,
        slot_range WITH &&
    ) WHERE (status = 'CONFIRMED')
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    allocation_id INT UNIQUE NOT NULL REFERENCES court_allocations(id) ON DELETE CASCADE,
    member_id INT REFERENCES users(id),
    booked_by_staff_id INT REFERENCES users(id),
    guest_name VARCHAR(100),
    guest_phone VARCHAR(20),
    fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_sessions (
    id SERIAL PRIMARY KEY,
    allocation_id INT UNIQUE NOT NULL REFERENCES court_allocations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL DEFAULT 'Friday Social Play',
    capacity INT NOT NULL DEFAULT 16,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_registrations (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES social_sessions(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_social_session_user UNIQUE(session_id, user_id)
);

-- 5. Gear Shop (In-store counter sales only)
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES product_categories(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    retail_price NUMERIC(10, 2) NOT NULL,
    member_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory (
    product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_orders (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id), -- NULL for walk-in non-members
    cashier_id INT NOT NULL REFERENCES users(id),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 6. Café & Bar
CREATE TABLE dining_tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'AVAILABLE' -- 'AVAILABLE', 'OCCUPIED'
);

CREATE TABLE cafe_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE cafe_menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES cafe_categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE cafe_orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES dining_tables(id),
    member_id INT REFERENCES users(id),
    order_type VARCHAR(20) DEFAULT 'TAB', -- 'TAB', 'INSTANT'
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'SETTLED', 'CANCELLED'
    kitchen_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PREPARING', 'READY', 'SERVED'
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    opened_by_staff_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE cafe_order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES cafe_orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES cafe_menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    special_notes TEXT
);

-- 7. Invoices & Payments (Unified Ledger)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id),
    source_type VARCHAR(30) NOT NULL, -- 'MEMBERSHIP', 'COURT', 'SHOP', 'CAFE'
    source_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id),
    source_type VARCHAR(30) NOT NULL, -- 'MEMBERSHIP', 'COURT', 'SHOP', 'CAFE'
    source_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'CARD', 'UPI'
    transaction_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SUCCESS',
    collected_by_staff_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRM Leads & Inquiries
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(25) NOT NULL,
    interested_sport VARCHAR(50),
    preferred_plan VARCHAR(50),
    status VARCHAR(20) DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'QUOTED', 'CONVERTED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
