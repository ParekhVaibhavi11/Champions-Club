-- Champions Club Seed Data
-- Passwords: All accounts use password: Password123!
-- Bcrypt hash for 'Password123!' (cost 10): $2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty

INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
(1, 'System Administrator', 'admin@championsclub.com', '$2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty', '+91 98765 00001', 'admin'),
(2, 'Front Desk Lead', 'desk@championsclub.com', '$2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty', '+91 98765 00002', 'front_desk'),
(3, 'Club Staff Counter', 'staff@championsclub.com', '$2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty', '+91 98765 00003', 'staff'),
(4, 'Alex Morgan (Gold)', 'alex@example.com', '$2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty', '+91 98765 11111', 'member'),
(5, 'Rohan Sharma (Silver)', 'rohan@example.com', '$2b$10$wE47P9jXf0oR5fR3WvQGZ.a1XWjMsnR65T2lEwZq0uV0rGsk90Pty', '+91 98765 22222', 'member');

SELECT setval('users_id_seq', 5);

INSERT INTO member_profiles (user_id, member_code, emergency_contact, preferred_sport) VALUES
(4, 'CC-GOLD-004', '+91 98765 99991', 'Tennis'),
(5, 'CC-SLVR-005', '+91 98765 99992', 'Badminton');

-- Membership Plans
INSERT INTO membership_plans (id, name, price_annual, price_monthly, discount_shop_pct, discount_cafe_pct, max_daily_bookings, description) VALUES
(1, 'Gold Member', 50000.00, 4800.00, 15, 15, 2, 'All access: Tennis, Padel, Cricket & Badminton. 15% discount across Shop & Café.'),
(2, 'Silver Member', 30000.00, 3000.00, 10, 10, 2, 'Standard access: Badminton & Tennis off-peak. 10% discount across Shop & Café.'),
(3, 'Junior Academy', 20000.00, 2000.00, 5, 5, 1, 'Under 18 coaching & designated practice slots.');

SELECT setval('membership_plans_id_seq', 3);

INSERT INTO memberships (user_id, plan_id, status, start_date, end_date) VALUES
(4, 1, 'ACTIVE', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days'),
(5, 2, 'ACTIVE', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '350 days');

-- Sports
INSERT INTO sports (id, name, slug, description, icon_name) VALUES
(1, 'Tennis', 'tennis', 'Championship clay and hard courts with tournament lighting.', 'tennis'),
(2, 'Cricket', 'cricket', 'Professional indoor bowling lanes and pitch nets.', 'cricket'),
(3, 'Padel', 'padel', 'Panoramic glass enclosed standard Padel courts.', 'padel'),
(4, 'Badminton', 'badminton', 'BWF-approved synthetic shock-absorbing flooring courts.', 'badminton');

SELECT setval('sports_id_seq', 4);

-- Courts
INSERT INTO courts (id, sport_id, name, hourly_rate, is_active) VALUES
(1, 1, 'Tennis Court 1 (Clay)', 600.00, TRUE),
(2, 1, 'Tennis Court 2 (Hard)', 500.00, TRUE),
(3, 2, 'Cricket Net 1 (Bowling Machine)', 750.00, TRUE),
(4, 2, 'Cricket Net 2 (Pitch)', 500.00, TRUE),
(5, 3, 'Padel Court A (Panoramic)', 800.00, TRUE),
(6, 3, 'Padel Court B (Panoramic)', 800.00, TRUE),
(7, 4, 'Badminton Court 1 (BWF Pro)', 400.00, TRUE),
(8, 4, 'Badminton Court 2 (BWF Pro)', 400.00, TRUE);

SELECT setval('courts_id_seq', 8);

-- Gear Shop Categories & Products
INSERT INTO product_categories (id, name, slug) VALUES
(1, 'Rackets & Bats', 'rackets-bats'),
(2, 'Footwear & Apparel', 'apparel'),
(3, 'Balls & Shuttlecocks', 'balls-shuttles'),
(4, 'Accessories', 'accessories');

SELECT setval('product_categories_id_seq', 4);

INSERT INTO products (id, category_id, sku, name, description, retail_price, member_price, image_url) VALUES
(1, 1, 'PRO-TEN-001', 'Wilson Pro Staff V14 Tennis Racket', 'Precision racket for aggressive offensive tennis play.', 19999.00, 16999.00, 'https://images.unsplash.com/photo-1617083934555-ac7d4efe0f46?auto=format&fit=crop&w=600&q=80'),
(2, 1, 'PRO-PAD-002', 'Babolat Technical Viper Padel Racket', 'Explosive power and extreme spin precision.', 15499.00, 13174.00, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80'),
(3, 3, 'ACC-BAL-003', 'Wilson US Open Tennis Balls (Can of 4)', 'Extra duty felt tournament grade yellow balls.', 650.00, 550.00, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80'),
(4, 3, 'ACC-SHT-004', 'Yonex Aerosensa 30 Feather Shuttles (Tube)', 'Tournament feather shuttlecocks for true flight curve.', 1850.00, 1572.00, 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=600&q=80'),
(5, 4, 'ACC-GRP-005', 'Tourna Grip Original Overgrip (Pack of 3)', 'Famous sweat absorbent dry feel tennis grip.', 450.00, 380.00, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80');

SELECT setval('products_id_seq', 5);

INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES
(1, 8, 3),
(2, 4, 2),
(3, 35, 10),
(4, 22, 5),
(5, 50, 15);

-- Café Categories & Menu Items
INSERT INTO cafe_categories (id, name, slug) VALUES
(1, 'Healthy Shakes & Protein', 'shakes'),
(2, 'Energy Snacks & Bowls', 'snacks'),
(3, 'Hot Beverages & Coffee', 'coffee'),
(4, 'Electrolytes & Hydration', 'hydration');

SELECT setval('cafe_categories_id_seq', 4);

INSERT INTO cafe_menu_items (id, category_id, name, description, price) VALUES
(1, 1, 'Champion Whey Protein Shake (Chocolate)', '30g grass-fed whey isolate with almond milk & banana', 240.00),
(2, 1, 'Berry Recovery Smoothie', 'Blueberries, strawberries, Greek yogurt, chia seeds', 220.00),
(3, 2, 'Grilled Chicken Avocado Sourdough', 'Roasted chicken breast, hass avocado, sourdough bread', 280.00),
(4, 3, 'Double Espresso Shot', 'Fresh roasted single-origin espresso', 140.00),
(5, 4, 'Tender Coconut Water (Fresh)', 'Natural pure hydration', 90.00);

SELECT setval('cafe_menu_items_id_seq', 5);

-- Dining Tables
INSERT INTO dining_tables (id, table_number, capacity, status) VALUES
(1, 'Table 1', 4, 'AVAILABLE'),
(2, 'Table 2', 4, 'AVAILABLE'),
(3, 'Table 3', 2, 'AVAILABLE'),
(4, 'Table 4', 6, 'AVAILABLE'),
(5, 'Courtside Lounge 1', 4, 'AVAILABLE');

SELECT setval('dining_tables_id_seq', 5);

-- CRM Leads
INSERT INTO leads (name, email, phone, interested_sport, preferred_plan, status, notes) VALUES
( 'Vikram Mehta', 'vikram@example.com', '+91 98220 33445', 'Padel', 'Gold Member', 'NEW', 'Requested a trial weekend session with coach.'),
( 'Sneha Patel', 'sneha.p@example.com', '+91 98110 55667', 'Tennis', 'Silver Member', 'CONTACTED', 'Looking for evening slot after 7 PM.');
