-- Sample data for AquaDex database
-- This script populates the database with sample data for testing
-- Run this AFTER the main schema migration

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

-- Note: User profiles will be created automatically via trigger when users sign up
-- This is just for reference of what the data might look like

-- ============================================================================
-- SAMPLE AQUARIUMS
-- ============================================================================

-- These will be created after users sign up, but here's the structure:

INSERT INTO public.aquariums (user_id, name, type, size_gallons, size_liters, setup_date, description, equipment, inhabitants, parameters) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid, -- Replace with actual user ID
    'Community Freshwater Tank',
    'freshwater',
    55,
    208,
    '2024-01-15',
    'A peaceful community tank with tetras, corydoras, and live plants',
    '{
        "filter": "Fluval 306 Canister Filter",
        "heater": "Eheim Jager 150W",
        "lighting": "Fluval Plant 3.0 LED",
        "substrate": "Fluval Stratum"
    }'::jsonb,
    '{
        "fish": [
            {"species": "Neon Tetra", "count": 12},
            {"species": "Corydoras Panda", "count": 6},
            {"species": "Dwarf Gourami", "count": 2}
        ],
        "plants": [
            {"species": "Amazon Sword", "count": 3},
            {"species": "Java Fern", "count": 5},
            {"species": "Anubias Nana", "count": 2}
        ]
    }'::jsonb,
    '{
        "temperature": {"min": 24, "max": 26},
        "ph": {"min": 6.5, "max": 7.5},
        "ammonia": {"max": 0},
        "nitrite": {"max": 0},
        "nitrate": {"max": 20}
    }'::jsonb
);

-- ============================================================================
-- SAMPLE WATER TESTS
-- ============================================================================

-- Sample water test results
INSERT INTO public.water_tests (user_id, aquarium_id, test_date, temperature, ph, ammonia, nitrite, nitrate, notes) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM public.aquariums LIMIT 1),
    NOW() - INTERVAL '1 day',
    25.5,
    7.2,
    0.0,
    0.0,
    15.0,
    'Weekly water test - all parameters looking good'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM public.aquariums LIMIT 1),
    NOW() - INTERVAL '1 week',
    25.0,
    7.1,
    0.0,
    0.0,
    20.0,
    'Before water change'
);

-- ============================================================================
-- SAMPLE MARKETPLACE LISTINGS
-- ============================================================================

INSERT INTO public.marketplace_listings (seller_id, title, description, category, condition, price, location, photos, tags) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Fluval 306 Canister Filter - Excellent Condition',
    'Selling my Fluval 306 canister filter. Used for 1 year on a 55-gallon tank. Includes all media and tubing. Works perfectly, just upgrading to a larger system.',
    'equipment',
    'used_like_new',
    120.00,
    'Los Angeles, CA',
    '{"https://example.com/filter1.jpg", "https://example.com/filter2.jpg"}',
    '{"canister filter", "fluval", "55 gallon", "freshwater"}'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Java Fern Bundle - 10 Plants',
    'Healthy java fern plants grown in my aquarium. Perfect for beginners, very hardy and beautiful. Will ship carefully packaged.',
    'plants',
    'new',
    25.00,
    'Portland, OR',
    '{"https://example.com/javafern1.jpg"}',
    '{"java fern", "live plants", "beginner friendly", "low light"}'
);

-- ============================================================================
-- SAMPLE QUESTIONS
-- ============================================================================

INSERT INTO public.questions (user_id, title, content, category, tags) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Help! My aquarium pH keeps dropping',
    'I have a 40-gallon freshwater community tank. The pH was stable at 7.0 for months, but recently it keeps dropping to 6.2. I do weekly 25% water changes. What could be causing this?',
    'water_chemistry',
    '{"ph", "water chemistry", "freshwater", "community tank"}'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Best beginner fish for a 20-gallon tank?',
    'Setting up my first aquarium - a 20-gallon long tank. What would be the best fish combination for a beginner? I want colorful and active fish that are easy to care for.',
    'freshwater',
    '{"beginner", "20 gallon", "community fish", "colorful"}'
);

-- ============================================================================
-- SAMPLE ANSWERS
-- ============================================================================

INSERT INTO public.answers (question_id, user_id, content) VALUES
(
    (SELECT id FROM public.questions WHERE title LIKE '%pH keeps dropping%' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'This is likely due to insufficient buffering capacity (low KH). Test your KH levels - if they are below 3 dKH, your tank lacks buffering. You can raise KH by adding crushed coral to your filter or doing water changes with water that has higher KH.'
),
(
    (SELECT id FROM public.questions WHERE title LIKE '%beginner fish%' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'For a 20-gallon long, I recommend: 8-10 neon tetras, 6 corydoras catfish, and 1 betta or dwarf gourami as a centerpiece fish. This gives you schooling fish, bottom dwellers, and a beautiful focal point. All are hardy and beginner-friendly!'
);

-- ============================================================================
-- SAMPLE REMINDERS
-- ============================================================================

INSERT INTO public.reminders (user_id, aquarium_id, title, description, type, frequency, next_due) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM public.aquariums LIMIT 1),
    'Weekly Water Change',
    '25% water change with gravel vacuum',
    'water_change',
    'weekly',
    NOW() + INTERVAL '3 days'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM public.aquariums LIMIT 1),
    'Feed Fish',
    'Morning feeding - tropical flakes',
    'feeding',
    'daily',
    NOW() + INTERVAL '1 day'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM public.aquariums LIMIT 1),
    'Water Parameter Test',
    'Test ammonia, nitrite, nitrate, and pH',
    'testing',
    'weekly',
    NOW() + INTERVAL '5 days'
);

-- ============================================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================================

INSERT INTO public.notifications (user_id, title, message, type, category) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Welcome to AquaDex!',
    'Thank you for joining AquaDex. Start by adding your first aquarium in the dashboard.',
    'info',
    'system'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Water Change Reminder',
    'Your weekly water change for Community Freshwater Tank is due in 2 days.',
    'warning',
    'aquarium'
);

-- ============================================================================
-- UTILITY QUERIES
-- ============================================================================

-- Query to check all tables have been created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Query to check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Query to list all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Query to check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

SELECT 'Sample data inserted successfully! Remember to replace user IDs with actual values.' as status;