-- ====================================================================
-- Champions Club Management System — Realistic Seed Data
-- ====================================================================

-- 1. USERS & PASSWORDS
-- All demo passwords are: "Password123!"
-- BCrypt hash for "Password123!" with 10 salt rounds:
-- $2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti

INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
(1, 'owner@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Rajesh Sharma (Owner)', '+91 98765 43210', 'admin'),
(2, 'desk@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Pooja Patel (Front Desk)', '+91 98765 43211', 'front_desk'),
(3, 'shop@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Vikram Singh (Gear Shop)', '+91 98765 43212', 'staff'),
(4, 'cafe@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Anil Mehta (Café Bar)', '+91 98765 43213', 'staff'),
(5, 'kitchen@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Chef Ramesh (Kitchen)', '+91 98765 43214', 'staff'),
(6, 'gold.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Rohit Verma (Gold Member)', '+91 98765 43215', 'member'),
(7, 'silver.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Sneha Roy (Silver Member)', '+91 98765 43216', 'member'),
(8, 'junior.member@championsclub.com', '$2a$10$9r6EhzGfM/q7YJkFz7y6bexu8rZgCkg3o3.uYwz79WbIqg2jC4Gti', 'Arjun Kapoor (Junior Member)', '+91 98765 43217', 'member')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Staff Profiles
INSERT INTO staff_profiles (user_id, department, can_access_pos, can_access_kitchen, hourly_wage) VALUES
(2, 'front_desk', TRUE, FALSE, 25.00),
(3, 'shop', TRUE, FALSE, 22.00),
(4, 'cafe', TRUE, FALSE, 22.00),
(5, 'kitchen', FALSE, TRUE, 26.00)
ON CONFLICT (user_id) DO NOTHING;

-- Member Profiles
INSERT INTO member_profiles (user_id, member_code, date_of_birth, emergency_contact, emergency_phone) VALUES
(6, 'CC-GOLD-001', '1988-04-12', 'Priya Verma', '+91 98765 00001'),
(7, 'CC-SLVR-002', '1995-09-23', 'Karan Roy', '+91 98765 00002'),
(8, 'CC-JUNR-003', '2008-01-15', 'Sunita Kapoor', '+91 98765 00003')
ON CONFLICT (user_id) DO NOTHING;

-- 2. MEMBERSHIP PLANS
INSERT INTO membership_plans (id, name, tier, monthly_fee, court_discount_pct, shop_discount_pct, cafe_discount_pct, free_court_hours_per_month, description) VALUES
(1, 'Gold Tier (All Access VIP)', 'GOLD', 120.00, 100.00, 20.00, 15.00, 10, 'Full unrestricted access to all courts, free court bookings, 20% shop discount, 15% cafe discount.'),
(2, 'Silver Tier (Standard)', 'SILVER', 60.00, 25.00, 10.00, 10.00, 2, 'Standard club access, 25% off court rates, 10% off shop and cafe.'),
(3, 'Junior Tier (Under 18)', 'JUNIOR', 35.00, 50.00, 15.00, 10.00, 4, 'Special tier for youth players under 18 with 50% court discount.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('membership_plans_id_seq', (SELECT MAX(id) FROM membership_plans));

-- Memberships for Demo Users (Valid through 2027)
INSERT INTO memberships (id, user_id, plan_id, start_date, end_date, status, auto_renew) VALUES
(1, 6, 1, '2026-01-01', '2027-01-01', 'ACTIVE', TRUE),
(2, 7, 2, '2026-06-01', '2027-06-01', 'ACTIVE', TRUE),
(3, 8, 3, '2026-09-01', '2027-09-01', 'ACTIVE', FALSE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('memberships_id_seq', (SELECT MAX(id) FROM memberships));

-- 3. SPORTS & COURTS
INSERT INTO sports (id, name, slug, description, icon_name) VALUES
(1, 'Tennis', 'tennis', 'Grand-slam standard clay and synthetic hard courts.', 'Activity'),
(2, 'Cricket', 'cricket', 'Professional indoor bowling machines and turf batting nets.', 'Shield'),
(3, 'Padel', 'padel', 'Enclosed panoramic glass padel court with night floodlights.', 'Zap'),
(4, 'Badminton', 'badminton', 'BWF-approved anti-skid synthetic badminton courts.', 'Feather')
ON CONFLICT (id) DO NOTHING;

SELECT setval('sports_id_seq', (SELECT MAX(id) FROM sports));

INSERT INTO courts (id, sport_id, name, surface_type, hourly_rate_member, hourly_rate_guest) VALUES
(1, 1, 'Tennis Court 1 (Clay)', 'Red Clay', 0.00, 40.00),
(2, 1, 'Tennis Court 2 (Hard)', 'Acrylic Hard Court', 0.00, 35.00),
(3, 2, 'Cricket Turf Net A', 'Synthetic Turf', 15.00, 50.00),
(4, 2, 'Cricket Turf Net B', 'Synthetic Turf', 15.00, 50.00),
(5, 3, 'Padel Court 1 (Glass)', 'Supercourt Turf', 10.00, 45.00),
(6, 4, 'Badminton Court 1', 'Vinyl Wood Pattern', 5.00, 25.00),
(7, 4, 'Badminton Court 2', 'Vinyl Wood Pattern', 5.00, 25.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('courts_id_seq', (SELECT MAX(id) FROM courts));

-- 4. GEAR SHOP CATEGORIES & PRODUCTS
INSERT INTO product_categories (id, name, slug) VALUES
(1, 'Rackets & Bats', 'rackets-bats'),
(2, 'Balls & Shuttlecocks', 'balls-shuttlecocks'),
(3, 'Footwear', 'footwear'),
(4, 'Apparel & Accessories', 'apparel-accessories')
ON CONFLICT (id) DO NOTHING;

SELECT setval('product_categories_id_seq', (SELECT MAX(id) FROM product_categories));

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

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Seed Inventory Levels
INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES
(1, 12, 4),
(2, 8, 3),
(3, 5, 2), -- Low stock alert demonstration
(4, 80, 20),
(5, 30, 10),
(6, 25, 8),
(7, 15, 5),
(8, 60, 15)
ON CONFLICT (product_id) DO NOTHING;

-- 5. CAFÉ & BAR MENU & TABLES
INSERT INTO cafe_categories (id, name, sort_order) VALUES
(1, 'Post-Match Hydration & Drinks', 1),
(2, 'Protein Shakes & Smoothies', 2),
(3, 'Quick Bites & Sandwiches', 3),
(4, 'Main Meals', 4)
ON CONFLICT (id) DO NOTHING;

SELECT setval('cafe_categories_id_seq', (SELECT MAX(id) FROM cafe_categories));

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

SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));

-- 8 Dining Tables
INSERT INTO dining_tables (id, table_number, capacity, status) VALUES
(1, 'T-01', 4, 'AVAILABLE'),
(2, 'T-02', 4, 'AVAILABLE'),
(3, 'T-03', 2, 'AVAILABLE'),
(4, 'T-04', 6, 'AVAILABLE'),
(5, 'T-05', 4, 'AVAILABLE'),
(6, 'T-06', 4, 'AVAILABLE'),
(7, 'Bar-01', 1, 'AVAILABLE'),
(8, 'Bar-02', 1, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('dining_tables_id_seq', (SELECT MAX(id) FROM dining_tables));

-- 6. EMPLOYEES & HR
INSERT INTO employees (id, user_id, job_title, department, monthly_salary, hire_date) VALUES
(1, 1, 'Club Director & Owner', 'Executive', 6000.00, '2025-01-01'),
(2, 2, 'Head Front Desk Receptionist', 'Front Desk', 2800.00, '2025-03-01'),
(3, 3, 'Gear Shop Pro Specialist', 'Retail', 2500.00, '2025-04-15'),
(4, 4, 'Café & Bar Lead', 'Food & Beverage', 2600.00, '2025-05-01'),
(5, 5, 'Head Kitchen Chef', 'Kitchen', 3000.00, '2025-05-01')
ON CONFLICT (id) DO NOTHING;

SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- 7. DEMO LEADS (CRM)
INSERT INTO leads (id, full_name, email, phone, sport_interest, inquiry_type, status, notes) VALUES
(1, 'Kabir Malhotra', 'kabir.m@gmail.com', '+91 99887 76655', 'Tennis', 'TRIAL_SESSION', 'NEW', 'Wants a trial session this Saturday evening for tennis.'),
(2, 'TechCorp India Ltd', 'hr@techcorp.in', '+91 91234 56789', 'Cricket & Badminton', 'CORPORATE', 'QUOTED', 'Looking for weekend team tournament booking for 40 employees.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('leads_id_seq', (SELECT MAX(id) FROM leads));
