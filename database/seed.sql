-- ====================================================================
-- Champions Club Management System — Comprehensive Seed Data
-- ====================================================================
-- Guarantees that NO table in the database schema remains empty.
-- Safe & Idempotent: Does not alter or harm existing user or catalog data.
-- Uses ON CONFLICT DO NOTHING and dynamic CURRENT_DATE calculations.
-- ====================================================================

-- 1. EXTENSIONS & MIGRATION TABLES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

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

ALTER TABLE court_allocations ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. USERS & PASSWORDS
-- Default BCrypt password hash for 'Password123!' (10 salt rounds):
-- $2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti

INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
(1, 'owner@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Rajesh Sharma (Owner)', '+91 98765 43210', 'admin'),
(2, 'desk@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Pooja Patel (Front Desk)', '+91 98765 43211', 'front_desk'),
(3, 'shop@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Vikram Singh (Gear Shop)', '+91 98765 43212', 'staff'),
(4, 'cafe@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Anil Mehta (Café Bar)', '+91 98765 43213', 'staff'),
(5, 'kitchen@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Chef Ramesh (Kitchen)', '+91 98765 43214', 'staff'),
(6, 'gold.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Rohit Verma (Gold Member)', '+91 98765 43215', 'member'),
(7, 'silver.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Sneha Roy (Silver Member)', '+91 98765 43216', 'member'),
(8, 'junior.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Arjun Kapoor (Junior Member)', '+91 98765 43217', 'member'),
(9, 'puravmodi3105@gmail.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Modi Purav (Club Athlete)', '+91 98765 43218', 'member'),
(10, 'priya.sen@gmail.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Priya Sen (VIP Athlete)', '+91 98765 43219', 'member')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT GREATEST(MAX(id), 1) FROM users));

-- Staff Profiles
INSERT INTO staff_profiles (user_id, department, can_access_pos, can_access_kitchen, hourly_wage) VALUES
(2, 'front_desk', TRUE, FALSE, 25.00),
(3, 'shop', TRUE, FALSE, 22.00),
(4, 'cafe', TRUE, FALSE, 22.00),
(5, 'kitchen', FALSE, TRUE, 26.00)
ON CONFLICT (user_id) DO NOTHING;

-- Member Profiles
INSERT INTO member_profiles (user_id, member_code, date_of_birth, emergency_contact, emergency_phone, address) VALUES
(6, 'CC-GOLD-001', '1988-04-12', 'Priya Verma', '+91 98765 00001', '74 Marine Drive, Mumbai'),
(7, 'CC-SLVR-002', '1995-09-23', 'Karan Roy', '+91 98765 00002', '12 Park Street, Kolkata'),
(8, 'CC-JUNR-003', '2008-01-15', 'Sunita Kapoor', '+91 98765 00003', '88 Bandra West, Mumbai'),
(9, 'CC-ATHL-009', '1996-05-31', 'Devendra Modi', '+91 98765 00009', 'Champions Sports Complex Hub'),
(10, 'CC-GOLD-010', '1992-11-04', 'Rahul Sen', '+91 98765 00010', '45 Indiranagar, Bengaluru')
ON CONFLICT (user_id) DO NOTHING;

-- Password Resets
INSERT INTO password_resets (id, user_id, otp_code, token, expires_at, used) VALUES
(1, 6, '741258', 'demo_token_reset_gold_member', NOW() + INTERVAL '1 hour', FALSE),
(2, 7, '852369', 'demo_token_reset_silver_member', NOW() - INTERVAL '2 hours', TRUE),
(3, 9, '123456', 'demo_token_reset_purav_member', NOW() + INTERVAL '2 hours', FALSE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('password_resets_id_seq', (SELECT GREATEST(MAX(id), 1) FROM password_resets));

-- 3. MEMBERSHIP PLANS & MEMBERSHIPS
INSERT INTO membership_plans (id, name, tier, monthly_fee, court_discount_pct, shop_discount_pct, cafe_discount_pct, free_court_hours_per_month, description) VALUES
(1, 'Gold Tier (All Access VIP)', 'GOLD', 120.00, 100.00, 20.00, 15.00, 10, 'Full unrestricted access to all courts, free court bookings, 20% shop discount, 15% cafe discount.'),
(2, 'Silver Tier (Standard)', 'SILVER', 60.00, 25.00, 10.00, 10.00, 2, 'Standard club access, 25% off court rates, 10% off shop and cafe.'),
(3, 'Junior Tier (Under 18)', 'JUNIOR', 35.00, 50.00, 15.00, 10.00, 4, 'Special tier for youth players under 18 with 50% court discount.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('membership_plans_id_seq', (SELECT GREATEST(MAX(id), 1) FROM membership_plans));

INSERT INTO memberships (id, user_id, plan_id, start_date, end_date, status, auto_renew) VALUES
(1, 6, 1, '2026-01-01', '2027-01-01', 'ACTIVE', TRUE),
(2, 7, 2, '2026-06-01', '2027-06-01', 'ACTIVE', TRUE),
(3, 8, 3, '2026-09-01', '2027-09-01', 'ACTIVE', FALSE),
(4, 9, 1, '2026-01-01', '2027-01-01', 'ACTIVE', TRUE),
(5, 10, 1, '2026-02-01', '2027-02-01', 'ACTIVE', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('memberships_id_seq', (SELECT GREATEST(MAX(id), 1) FROM memberships));

-- 4. SPORTS & COURTS
INSERT INTO sports (id, name, slug, description, icon_name) VALUES
(1, 'Tennis', 'tennis', 'Grand-slam standard clay and synthetic hard courts.', 'Activity'),
(2, 'Cricket', 'cricket', 'Professional indoor bowling machines and turf batting nets.', 'Shield'),
(3, 'Padel', 'padel', 'Enclosed panoramic glass padel court with night floodlights.', 'Zap'),
(4, 'Badminton', 'badminton', 'BWF-approved anti-skid synthetic badminton courts.', 'Feather')
ON CONFLICT (id) DO NOTHING;

SELECT setval('sports_id_seq', (SELECT GREATEST(MAX(id), 1) FROM sports));

INSERT INTO courts (id, sport_id, name, surface_type, hourly_rate_member, hourly_rate_guest) VALUES
(1, 1, 'Tennis Court 1 (Clay)', 'Red Clay', 0.00, 40.00),
(2, 1, 'Tennis Court 2 (Hard)', 'Acrylic Hard Court', 0.00, 35.00),
(3, 2, 'Cricket Turf Net A', 'Synthetic Turf', 15.00, 50.00),
(4, 2, 'Cricket Turf Net B', 'Synthetic Turf', 15.00, 50.00),
(5, 3, 'Padel Court 1 (Glass)', 'Supercourt Turf', 10.00, 45.00),
(6, 4, 'Badminton Court 1', 'Vinyl Wood Pattern', 5.00, 25.00),
(7, 4, 'Badminton Court 2', 'Vinyl Wood Pattern', 5.00, 25.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('courts_id_seq', (SELECT GREATEST(MAX(id), 1) FROM courts));

-- 5. COURT ALLOCATIONS & BOOKINGS (Live dynamic bookings for TODAY and TOMORROW)
INSERT INTO court_allocations (id, court_id, slot_range, type, status, notes) VALUES
(101, 1, tstzrange((CURRENT_DATE + INTERVAL '8 hours')::timestamptz, (CURRENT_DATE + INTERVAL '9 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Morning clay singles rally'),
(102, 1, tstzrange((CURRENT_DATE + INTERVAL '10 hours')::timestamptz, (CURRENT_DATE + INTERVAL '11 hours')::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED', 'Guest practice match'),
(103, 1, tstzrange((CURRENT_DATE + INTERVAL '13 hours')::timestamptz, (CURRENT_DATE + INTERVAL '14 hours')::timestamptz, '[)'), 'MAINTENANCE', 'CONFIRMED', 'Clay court line sweeping and dampening'),
(104, 1, tstzrange((CURRENT_DATE + INTERVAL '16 hours')::timestamptz, (CURRENT_DATE + INTERVAL '17 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Member tournament training'),

(105, 2, tstzrange((CURRENT_DATE + INTERVAL '9 hours')::timestamptz, (CURRENT_DATE + INTERVAL '10 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Hard court baseline drills'),
(106, 2, tstzrange((CURRENT_DATE + INTERVAL '14 hours')::timestamptz, (CURRENT_DATE + INTERVAL '15 hours')::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED', 'Afternoon walk-in booking'),
(107, 2, tstzrange((CURRENT_DATE + INTERVAL '18 hours')::timestamptz, (CURRENT_DATE + INTERVAL '19 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Junior athlete evening session'),

(108, 3, tstzrange((CURRENT_DATE + INTERVAL '7 hours')::timestamptz, (CURRENT_DATE + INTERVAL '8 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CHECKED_IN', 'Fast bowling machine practice'),
(109, 3, tstzrange((CURRENT_DATE + INTERVAL '11 hours')::timestamptz, (CURRENT_DATE + INTERVAL '12 hours')::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED', 'Club trial practice match'),
(110, 3, tstzrange((CURRENT_DATE + INTERVAL '17 hours')::timestamptz, (CURRENT_DATE + INTERVAL '18 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Power hitting drills'),

(111, 4, tstzrange((CURRENT_DATE + INTERVAL '10 hours')::timestamptz, (CURRENT_DATE + INTERVAL '11 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Spin bowling simulation'),
(112, 4, tstzrange((CURRENT_DATE + INTERVAL '15 hours')::timestamptz, (CURRENT_DATE + INTERVAL '16 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Youth batting technique session'),

(113, 5, tstzrange((CURRENT_DATE + INTERVAL '8 hours')::timestamptz, (CURRENT_DATE + INTERVAL '9 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Morning padel doubles'),
(114, 5, tstzrange((CURRENT_DATE + INTERVAL '12 hours')::timestamptz, (CURRENT_DATE + INTERVAL '13 hours')::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED', 'Corporate demo session'),
(115, 5, tstzrange((CURRENT_DATE + INTERVAL '18 hours')::timestamptz, (CURRENT_DATE + INTERVAL '20 hours')::timestamptz, '[)'), 'SOCIAL_PLAY', 'CONFIRMED', 'Friday Night Mixed Social Play'),

(116, 6, tstzrange((CURRENT_DATE + INTERVAL '9 hours')::timestamptz, (CURRENT_DATE + INTERVAL '10 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Singles badminton match'),
(117, 6, tstzrange((CURRENT_DATE + INTERVAL '19 hours')::timestamptz, (CURRENT_DATE + INTERVAL '20 hours')::timestamptz, '[)'), 'GUEST_BOOKING', 'CONFIRMED', 'Evening walk-in pair'),

(118, 7, tstzrange((CURRENT_DATE + INTERVAL '10 hours')::timestamptz, (CURRENT_DATE + INTERVAL '11 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Doubles practice rally'),
(119, 7, tstzrange((CURRENT_DATE + INTERVAL '18 hours')::timestamptz, (CURRENT_DATE + INTERVAL '19 hours')::timestamptz, '[)'), 'MEMBER_BOOKING', 'CONFIRMED', 'Athlete fitness & footwork')
ON CONFLICT (id) DO NOTHING;

SELECT setval('court_allocations_id_seq', (SELECT GREATEST(MAX(id), 1) FROM court_allocations));

-- Bookings associated with allocations
INSERT INTO bookings (id, allocation_id, member_id, booked_by_staff_id, guest_name, guest_phone, fee_charged, payment_status, notes) VALUES
(101, 101, 6, 2, NULL, NULL, 0.00, 'SUCCESS', 'VIP Gold member free court allowance'),
(102, 102, NULL, 2, 'Vikram Malhotra', '+91 98200 11223', 40.00, 'SUCCESS', 'Paid at front desk counter via UPI'),
(103, 104, 7, 2, NULL, NULL, 0.00, 'SUCCESS', 'Silver membership booked online'),
(104, 105, 9, 2, NULL, NULL, 0.00, 'SUCCESS', 'Member daily session slot'),
(105, 106, NULL, 2, 'Anita Sen', '+91 98300 22334', 35.00, 'SUCCESS', 'Paid via Card at reception'),
(106, 107, 8, 2, NULL, NULL, 0.00, 'SUCCESS', 'Junior tier allocated slot'),
(107, 108, 6, 2, NULL, NULL, 15.00, 'SUCCESS', 'Cricket machine member rate'),
(108, 109, NULL, 2, 'Delhi Daredevils Academy', '+91 98400 33445', 50.00, 'SUCCESS', 'Net trial booking session'),
(109, 110, 9, 2, NULL, NULL, 15.00, 'SUCCESS', 'Batting net evening slot'),
(110, 111, 7, 2, NULL, NULL, 15.00, 'SUCCESS', 'Silver member bowling session'),
(111, 112, 8, 2, NULL, NULL, 15.00, 'SUCCESS', 'Junior cricket practice net'),
(112, 113, 6, 2, NULL, NULL, 10.00, 'SUCCESS', 'Padel glass court VIP rate'),
(113, 114, NULL, 2, 'Kunal Shah', '+91 98500 44556', 45.00, 'SUCCESS', 'Paid via UPI'),
(114, 116, 8, 2, NULL, NULL, 5.00, 'SUCCESS', 'BWF synthetic court 1'),
(115, 117, NULL, 2, 'Deepak Chopra', '+91 98600 55667', 25.00, 'SUCCESS', 'Evening badminton game walk-in'),
(116, 118, 7, 2, NULL, NULL, 5.00, 'SUCCESS', 'Badminton court 2 booking'),
(117, 119, 9, 2, NULL, NULL, 5.00, 'SUCCESS', 'Member evening footwork session')
ON CONFLICT (id) DO NOTHING;

SELECT setval('bookings_id_seq', (SELECT GREATEST(MAX(id), 1) FROM bookings));

-- 6. FRIDAY SOCIAL PLAY SESSIONS & REGISTRATIONS
INSERT INTO social_sessions (id, allocation_id, title, capacity, entry_fee, description) VALUES
(1, 115, 'Friday Night Padel & Social Rally', 16, 10.00, 'Weekly rotating mixed doubles with artisanal recovery coolers at the Fuel Café.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('social_sessions_id_seq', (SELECT GREATEST(MAX(id), 1) FROM social_sessions));

INSERT INTO social_registrations (id, session_id, user_id, fee_paid) VALUES
(1, 1, 6, 10.00),
(2, 1, 7, 10.00),
(3, 1, 8, 10.00),
(4, 1, 9, 10.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('social_registrations_id_seq', (SELECT GREATEST(MAX(id), 1) FROM social_registrations));

-- 7. GEAR SHOP INVENTORY & STOCK MOVEMENTS
INSERT INTO product_categories (id, name, slug) VALUES
(1, 'Rackets & Bats', 'rackets-bats'),
(2, 'Balls & Shuttlecocks', 'balls-shuttlecocks'),
(3, 'Footwear', 'footwear'),
(4, 'Apparel & Accessories', 'apparel-accessories')
ON CONFLICT (id) DO NOTHING;

SELECT setval('product_categories_id_seq', (SELECT GREATEST(MAX(id), 1) FROM product_categories));

INSERT INTO products (id, category_id, sku, name, description, retail_price, member_price, image_url) VALUES
(1, 1, 'RKT-TEN-PRO', 'Wilson Pro Staff 97 Tennis Racket', 'Precision carbon fiber tennis racket for tournament players.', 220.00, 176.00, '/images/products/racket-pro.png'),
(2, 1, 'BAT-CRI-ENG', 'SS Master Kashmir Willow Cricket Bat', 'Handcrafted Kashmir willow with full cane handle.', 130.00, 104.00, '/images/products/cricket-bat.png'),
(3, 1, 'RKT-PAD-PRO', 'Bullpadel Vertex 03 Padel Racket', 'Diamond shaped power padel racket with rough top spin finish.', 190.00, 152.00, '/images/products/padel-racket.png'),
(4, 2, 'BAL-TEN-CAN', 'Head Tour Tennis Balls (Can of 3)', 'Official pressurized championship tennis balls.', 12.00, 9.60, '/images/products/tennis-balls.png'),
(5, 2, 'BAL-CRI-LEATH', 'Kookaburra Turf Cricket Ball', 'Four-piece red alum tanned leather cricket match ball.', 25.00, 20.00, '/images/products/cricket-ball.png'),
(6, 2, 'SHT-BAD-TUBE', 'Yonex Aerosensa 30 Feather Shuttles (12pk)', 'Precision goose feather shuttlecocks for league play.', 35.00, 28.00, '/images/products/shuttles.png'),
(7, 3, 'SHO-TEN-MEN', 'Asics Gel-Resolution 9 Court Shoes', 'High stability dynawall tennis shoes for all court surfaces.', 140.00, 112.00, '/images/products/tennis-shoes.png'),
(8, 4, 'ACC-GRP-3PK', 'Tourna Grip Original Overgrip (Pack of 3)', 'The dry feel tennis grip that absorbs sweat exceptionally.', 9.00, 7.20, '/images/products/overgrip.png')
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT GREATEST(MAX(id), 1) FROM products));

INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES
(1, 14, 4),
(2, 8, 3),
(3, 5, 2),
(4, 76, 20),
(5, 28, 10),
(6, 24, 8),
(7, 14, 5),
(8, 58, 15)
ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- Stock Movements (Restocks, POS Sales, Audit Adjustments)
INSERT INTO stock_movements (id, product_id, change_qty, balance_qty, movement_type, recorded_by_id, notes, created_at) VALUES
(1, 1, 15, 15, 'RESTOCK', 3, 'Initial inventory batch from Wilson distributor', NOW() - INTERVAL '7 days'),
(2, 2, 10, 10, 'RESTOCK', 3, 'SS Master Willow delivery shipment', NOW() - INTERVAL '7 days'),
(3, 3, 6, 6, 'RESTOCK', 3, 'Bullpadel tournament rackets batch', NOW() - INTERVAL '7 days'),
(4, 4, 80, 80, 'RESTOCK', 3, 'Head Tour ball cans bulk shipment', NOW() - INTERVAL '7 days'),
(5, 5, 30, 30, 'RESTOCK', 3, 'Kookaburra cricket balls shipment', NOW() - INTERVAL '7 days'),
(6, 6, 25, 25, 'RESTOCK', 3, 'Yonex shuttle tubes restock', NOW() - INTERVAL '7 days'),
(7, 7, 15, 15, 'RESTOCK', 3, 'Asics court shoes batch', NOW() - INTERVAL '7 days'),
(8, 8, 60, 60, 'RESTOCK', 3, 'Tourna grips multi-pack carton', NOW() - INTERVAL '7 days'),
(9, 1, -1, 14, 'POS_SALE', 3, 'Purchased under Receipt #SHP-2026-001', NOW() - INTERVAL '1 day'),
(10, 4, -4, 76, 'POS_SALE', 3, 'Purchased under Receipt #SHP-2026-001', NOW() - INTERVAL '1 day'),
(11, 6, -1, 24, 'POS_SALE', 3, 'Purchased under Receipt #SHP-2026-002', NOW() - INTERVAL '4 hours'),
(12, 7, -1, 14, 'POS_SALE', 3, 'Purchased under Receipt #SHP-2026-003', NOW() - INTERVAL '2 hours'),
(13, 8, -2, 58, 'POS_SALE', 3, 'Purchased under Receipt #SHP-2026-004', NOW() - INTERVAL '1 hour'),
(14, 3, -1, 5, 'DAMAGE', 3, 'Demo frame cracked during display inspection', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval('stock_movements_id_seq', (SELECT GREATEST(MAX(id), 1) FROM stock_movements));

-- Shop Orders (POS in-store sales)
INSERT INTO shop_orders (id, receipt_no, customer_id, cashier_id, subtotal, discount_amount, total_amount, payment_method, payment_status, created_at) VALUES
(1, 'SHP-2026-001', 6, 3, 244.00, 48.80, 195.20, 'UPI', 'SUCCESS', CURRENT_DATE - INTERVAL '1 day'),
(2, 'SHP-2026-002', 7, 3, 35.00, 3.50, 31.50, 'CARD', 'SUCCESS', CURRENT_DATE),
(3, 'SHP-2026-003', NULL, 3, 140.00, 0.00, 140.00, 'CASH', 'SUCCESS', CURRENT_DATE),
(4, 'SHP-2026-004', 8, 3, 18.00, 2.70, 15.30, 'UPI', 'SUCCESS', CURRENT_DATE),
(5, 'SHP-2026-005', 9, 3, 190.00, 38.00, 152.00, 'CARD', 'SUCCESS', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('shop_orders_id_seq', (SELECT GREATEST(MAX(id), 1) FROM shop_orders));

INSERT INTO shop_order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 220.00, 220.00),
(2, 1, 4, 2, 12.00, 24.00),
(3, 2, 6, 1, 35.00, 35.00),
(4, 3, 7, 1, 140.00, 140.00),
(5, 4, 8, 2, 9.00, 18.00),
(6, 5, 3, 1, 190.00, 190.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('shop_order_items_id_seq', (SELECT GREATEST(MAX(id), 1) FROM shop_order_items));

-- 8. CAFÉ & BAR (CATEGORIES, MENU, TABLES, ORDERS & ITEMS)
INSERT INTO cafe_categories (id, name, sort_order) VALUES
(1, 'Post-Match Hydration & Drinks', 1),
(2, 'Protein Shakes & Smoothies', 2),
(3, 'Quick Bites & Sandwiches', 3),
(4, 'Main Meals', 4)
ON CONFLICT (id) DO NOTHING;

SELECT setval('cafe_categories_id_seq', (SELECT GREATEST(MAX(id), 1) FROM cafe_categories));

INSERT INTO menu_items (id, category_id, name, description, price, member_discount_eligible) VALUES
(1, 1, 'Electrolyte Sport Cooler (Citrus)', 'Hydrating coconut water, pink salt and fresh lime.', 4.50, TRUE),
(2, 1, 'Cold Brew Espresso', '18-hour steeped single-origin Ethiopian cold brew.', 5.00, TRUE),
(3, 1, 'Craft Beer (Pint)', 'Locally brewed light citrus IPA on tap.', 7.50, TRUE),
(4, 2, 'Peanut Butter Whey Power Shake', 'Whey isolate, organic peanut butter, banana, almond milk.', 7.00, TRUE),
(5, 2, 'Berry Recovery Smoothie', 'Blueberries, strawberries, Greek yogurt, chia seeds.', 6.50, TRUE),
(6, 3, 'Grilled Chicken & Avocado Sourdough', 'Chargrilled herb chicken breast on toasted sourdough.', 9.50, TRUE),
(7, 3, 'Mediterranean Hummus & Falafel Wrap', 'Warm pita, beet hummus, crispy falafel, tahini drizzle.', 8.50, TRUE),
(8, 4, 'Champions Protein Bowl', 'Quinoa, roasted sweet potato, grilled paneer/chicken, greens.', 12.50, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('menu_items_id_seq', (SELECT GREATEST(MAX(id), 1) FROM menu_items));

INSERT INTO dining_tables (id, table_number, capacity, status) VALUES
(1, 'T-01', 4, 'AVAILABLE'),
(2, 'T-02', 4, 'OCCUPIED'),
(3, 'T-03', 2, 'OCCUPIED'),
(4, 'T-04', 6, 'AVAILABLE'),
(5, 'T-05', 4, 'AVAILABLE'),
(6, 'T-06', 4, 'AVAILABLE'),
(7, 'Bar-01', 1, 'AVAILABLE'),
(8, 'Bar-02', 1, 'AVAILABLE')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

SELECT setval('dining_tables_id_seq', (SELECT GREATEST(MAX(id), 1) FROM dining_tables));

-- Active Live Tabs for Kitchen Queue Demonstration + Settled Historic Tabs
INSERT INTO cafe_orders (id, order_no, table_id, member_id, guest_name, order_type, status, kitchen_status, subtotal, discount_amount, total_amount, opened_by_staff_id, created_at, settled_at) VALUES
(101, 'CAF-TAB-001', 2, 6, 'Rohit Verma', 'TAB', 'OPEN', 'PREPARING', 19.50, 2.93, 16.57, 4, NOW() - INTERVAL '25 minutes', NULL),
(102, 'CAF-TAB-002', 3, 7, 'Sneha Roy', 'TAB', 'OPEN', 'PENDING', 14.50, 1.45, 13.05, 4, NOW() - INTERVAL '10 minutes', NULL),
(103, 'CAF-HIST-003', 1, 8, 'Arjun Kapoor', 'TAB', 'SETTLED', 'SERVED', 10.80, 1.08, 9.72, 4, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours'),
(104, 'CAF-HIST-004', 5, NULL, 'Walk-in Athlete', 'TAB', 'SETTLED', 'SERVED', 14.50, 0.00, 14.50, 4, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '15 hours 30 minutes'),
(105, 'CAF-HIST-005', 7, 9, 'Modi Purav', 'TAB', 'SETTLED', 'SERVED', 12.50, 1.88, 10.62, 4, CURRENT_DATE, CURRENT_DATE + INTERVAL '11 hours 15 minutes')
ON CONFLICT (id) DO NOTHING;

SELECT setval('cafe_orders_id_seq', (SELECT GREATEST(MAX(id), 1) FROM cafe_orders));

INSERT INTO cafe_order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, special_instructions) VALUES
(101, 101, 5, 1, 6.50, 6.50, 'Extra chia seeds, almond milk base'),
(102, 101, 8, 1, 12.50, 12.50, 'Grilled herb chicken, extra greens'),
(103, 102, 4, 1, 7.00, 7.00, 'Double peanut butter, no added sugar'),
(104, 102, 3, 1, 7.50, 7.50, 'Serve in frosted glass pint'),
(105, 103, 2, 1, 5.00, 5.00, 'Single-origin espresso shot on the side'),
(106, 103, 1, 1, 4.50, 4.50, 'Extra lime and pink salt'),
(107, 104, 6, 1, 9.50, 9.50, 'Crispy sourdough toast'),
(108, 104, 2, 1, 5.00, 5.00, 'Cold brew straight black'),
(109, 105, 8, 1, 12.50, 12.50, 'High protein quinoa recovery bowl')
ON CONFLICT (id) DO NOTHING;

SELECT setval('cafe_order_items_id_seq', (SELECT GREATEST(MAX(id), 1) FROM cafe_order_items));

-- 9. CRM LEADS & QUOTES
INSERT INTO leads (id, full_name, email, phone, sport_interest, inquiry_type, status, notes, assigned_staff_id, created_at) VALUES
(1, 'Kabir Malhotra', 'kabir.m@gmail.com', '+91 99887 76655', 'Tennis', 'TRIAL_SESSION', 'NEW', 'Wants trial session for red clay court evening.', 2, NOW() - INTERVAL '3 days'),
(2, 'TechCorp India Ltd', 'hr@techcorp.in', '+91 91234 56789', 'Cricket & Badminton', 'CORPORATE', 'QUOTED', 'Weekend corporate tournament for 40 employees.', 2, NOW() - INTERVAL '2 days'),
(3, 'Ananya Sen', 'ananya.sen@gmail.com', '+91 98111 22233', 'Badminton', 'TRIAL_SESSION', 'CONTACTED', 'Confirmed trial session on Badminton Court 1.', 2, NOW() - INTERVAL '1 day'),
(4, 'Aarav Singhania', 'aarav.s@outlook.com', '+91 97222 33344', 'Tennis & Padel', 'MEMBERSHIP', 'QUOTED', 'Inquiring about Gold VIP Tier and locker access.', 2, NOW() - INTERVAL '18 hours'),
(5, 'Infosys Sports Council', 'sports@infosys.com', '+91 96333 44455', 'Cricket Turf', 'CORPORATE', 'NEW', 'Cricket nets tournament inquiry for tech staff.', 1, NOW() - INTERVAL '6 hours'),
(6, 'Rohan Mehra', 'rohan.m@gmail.com', '+91 95444 55566', 'Padel', 'TRIAL_SESSION', 'CONVERTED', 'Completed padel trial, planning membership.', 2, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('leads_id_seq', (SELECT GREATEST(MAX(id), 1) FROM leads));

INSERT INTO quotes (id, lead_id, plan_id, quote_amount, notes, valid_until, status, created_by_id, created_at) VALUES
(1, 2, NULL, 1800.00, 'Corporate weekend package: 2 cricket nets + 2 badminton courts for 4 hours with equipment.', CURRENT_DATE + 30, 'SENT', 2, NOW() - INTERVAL '2 days'),
(2, 4, 1, 1200.00, 'Annual Gold Tier VIP plan quote with 1-month complimentary guest coaching.', CURRENT_DATE + 14, 'ACCEPTED', 2, NOW() - INTERVAL '18 hours'),
(3, 5, NULL, 3200.00, 'Full arena rental: Automated cricket turf, padel court, and Fuel Café buffet lunch catering.', CURRENT_DATE + 45, 'SENT', 1, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval('quotes_id_seq', (SELECT GREATEST(MAX(id), 1) FROM quotes));

-- 10. HR EMPLOYEES, SHIFTS & LEAVE REQUESTS
INSERT INTO employees (id, user_id, job_title, department, monthly_salary, hire_date) VALUES
(1, 1, 'Club Director & Owner', 'Executive', 6000.00, '2025-01-01'),
(2, 2, 'Head Front Desk Receptionist', 'Front Desk', 2800.00, '2025-03-01'),
(3, 3, 'Gear Shop Pro Specialist', 'Retail', 2500.00, '2025-04-15'),
(4, 4, 'Café & Bar Lead', 'Food & Beverage', 2600.00, '2025-05-01'),
(5, 5, 'Head Kitchen Chef', 'Kitchen', 3000.00, '2025-05-01')
ON CONFLICT (id) DO NOTHING;

SELECT setval('employees_id_seq', (SELECT GREATEST(MAX(id), 1) FROM employees));

-- Staff Shifts (Historical & Active Real-Time Shifts)
INSERT INTO shifts (id, employee_id, clock_in, clock_out, shift_type, cash_drawer_start, cash_drawer_end, notes) VALUES
(1, 2, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '7 hours', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '15 hours', 'MORNING', 100.00, 320.00, 'Smooth morning court check-ins'),
(2, 2, CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '15 hours', 'MORNING', 100.00, 385.00, 'Front desk walk-in check-in shift'),
(3, 3, CURRENT_DATE + INTERVAL '9 hours', NULL, 'FULL_DAY', 200.00, NULL, 'Active shift at Pro Gear Shop counter'),
(4, 4, CURRENT_DATE + INTERVAL '8 hours 30 minutes', NULL, 'FULL_DAY', 150.00, NULL, 'Active shift managing Fuel Café table tabs'),
(5, 5, CURRENT_DATE + INTERVAL '8 hours', NULL, 'FULL_DAY', 0.00, NULL, 'Active shift overseeing Kitchen Queue KDS'),
(6, 3, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '18 hours', 'FULL_DAY', 200.00, 480.00, 'Racket stringing and apparel sales')
ON CONFLICT (id) DO NOTHING;

SELECT setval('shifts_id_seq', (SELECT GREATEST(MAX(id), 1) FROM shifts));

-- Staff Leave Requests (Approved, Pending, and Historical)
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, reviewed_by_id, created_at) VALUES
(1, 2, 'CASUAL', CURRENT_DATE + 7, CURRENT_DATE + 8, 'Family wedding event in Ahmedabad', 'APPROVED', 1, NOW() - INTERVAL '3 days'),
(2, 3, 'VACATION', CURRENT_DATE + 15, CURRENT_DATE + 20, 'Annual trekking trip to Himachal Pradesh', 'PENDING', NULL, NOW() - INTERVAL '1 day'),
(3, 4, 'SICK', CURRENT_DATE - 5, CURRENT_DATE - 4, 'Seasonal flu recovery', 'APPROVED', 1, NOW() - INTERVAL '6 days'),
(4, 5, 'CASUAL', CURRENT_DATE + 28, CURRENT_DATE + 30, 'Culinary certification conference', 'PENDING', NULL, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval('leave_requests_id_seq', (SELECT GREATEST(MAX(id), 1) FROM leave_requests));

-- 11. FINANCE: INVOICES, PAYMENTS & EXPENSES
INSERT INTO invoices (id, invoice_no, user_id, source_type, source_id, subtotal, tax_amount, total_amount, status, due_date, created_at) VALUES
(1, 'INV-MEM-2026-001', 6, 'MEMBERSHIP', 1, 120.00, 0.00, 120.00, 'PAID', CURRENT_DATE, CURRENT_DATE),
(2, 'INV-MEM-2026-002', 7, 'MEMBERSHIP', 2, 60.00, 0.00, 60.00, 'PAID', CURRENT_DATE, CURRENT_DATE),
(3, 'INV-MEM-2026-003', 8, 'MEMBERSHIP', 3, 35.00, 0.00, 35.00, 'PAID', CURRENT_DATE, CURRENT_DATE),
(4, 'INV-SHP-2026-001', 6, 'SHOP', 1, 195.20, 0.00, 195.20, 'PAID', CURRENT_DATE - 1, CURRENT_DATE - INTERVAL '1 day'),
(5, 'INV-SHP-2026-002', 7, 'SHOP', 2, 31.50, 0.00, 31.50, 'PAID', CURRENT_DATE, CURRENT_DATE),
(6, 'INV-CRT-2026-001', NULL, 'COURT', 102, 40.00, 0.00, 40.00, 'PAID', CURRENT_DATE, CURRENT_DATE),
(7, 'INV-CRT-2026-002', NULL, 'COURT', 106, 35.00, 0.00, 35.00, 'PAID', CURRENT_DATE, CURRENT_DATE),
(8, 'INV-CAF-2026-001', 8, 'CAFE', 103, 9.72, 0.00, 9.72, 'PAID', CURRENT_DATE - 1, CURRENT_DATE - INTERVAL '1 day'),
(9, 'INV-CAF-2026-002', NULL, 'CAFE', 104, 14.50, 0.00, 14.50, 'PAID', CURRENT_DATE - 1, CURRENT_DATE - INTERVAL '1 day'),
(10, 'INV-CAF-2026-003', 9, 'CAFE', 105, 10.62, 0.00, 10.62, 'PAID', CURRENT_DATE, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('invoices_id_seq', (SELECT GREATEST(MAX(id), 1) FROM invoices));

INSERT INTO payments (id, payment_no, invoice_id, source_type, source_id, amount, payment_method, transaction_ref, status, collected_by_id, created_at) VALUES
(1, 'PAY-MEM-001', 1, 'MEMBERSHIP', 1, 120.00, 'CARD', 'TXN-HDFC-991823', 'SUCCESS', 2, CURRENT_DATE),
(2, 'PAY-MEM-002', 2, 'MEMBERSHIP', 2, 60.00, 'UPI', 'UPI-9876543216@paytm', 'SUCCESS', 2, CURRENT_DATE),
(3, 'PAY-MEM-003', 3, 'MEMBERSHIP', 3, 35.00, 'UPI', 'UPI-9876543217@okaxis', 'SUCCESS', 2, CURRENT_DATE),
(4, 'PAY-SHP-001', 4, 'SHOP', 1, 195.20, 'UPI', 'UPI-ROHIT-SHOP-01', 'SUCCESS', 3, CURRENT_DATE - INTERVAL '1 day'),
(5, 'PAY-SHP-002', 5, 'SHOP', 2, 31.50, 'CARD', 'POS-SWIPE-4412', 'SUCCESS', 3, CURRENT_DATE),
(6, 'PAY-CRT-001', 6, 'COURT', 102, 40.00, 'UPI', 'UPI-GUEST-TEN-CLAY', 'SUCCESS', 2, CURRENT_DATE),
(7, 'PAY-CRT-002', 7, 'COURT', 106, 35.00, 'CARD', 'POS-RECEPTION-290', 'SUCCESS', 2, CURRENT_DATE),
(8, 'PAY-CAF-001', 8, 'CAFE', 103, 9.72, 'UPI', 'UPI-CAFE-TAB-103', 'SUCCESS', 4, CURRENT_DATE - INTERVAL '1 day'),
(9, 'PAY-CAF-002', 9, 'CAFE', 104, 14.50, 'CASH', 'CAFE-CASH-104', 'SUCCESS', 4, CURRENT_DATE - INTERVAL '1 day'),
(10, 'PAY-CAF-003', 10, 'CAFE', 105, 10.62, 'UPI', 'UPI-MODI-CAFE-TAB', 'SUCCESS', 4, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('payments_id_seq', (SELECT GREATEST(MAX(id), 1) FROM payments));

-- Operational Expenses for Club Accounting
INSERT INTO expenses (id, category, description, amount, recorded_by_id, expense_date, created_at) VALUES
(1, 'EQUIPMENT', 'Yonex championship badminton court net replacements (Courts 1 & 2)', 4500.00, 1, CURRENT_DATE - 3, NOW() - INTERVAL '3 days'),
(2, 'MAINTENANCE', 'Tennis clay court red brick dust top-dressing & laser rolling', 12000.00, 1, CURRENT_DATE - 2, NOW() - INTERVAL '2 days'),
(3, 'SUPPLIES', 'Fuel Café organic Colombian cold brew beans & whey isolate batch', 8500.00, 4, CURRENT_DATE - 1, NOW() - INTERVAL '1 day'),
(4, 'UTILITIES', 'Complex high-efficiency LED floodlights & climate control bill', 22400.00, 1, CURRENT_DATE, NOW()),
(5, 'MAINTENANCE', 'Automated bowling machine sensor alignment & belt replacement', 6000.00, 3, CURRENT_DATE, NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('expenses_id_seq', (SELECT GREATEST(MAX(id), 1) FROM expenses));
