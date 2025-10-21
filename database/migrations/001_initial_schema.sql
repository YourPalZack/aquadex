-- Migration 001: Initial AquaDex Schema
-- Description: Create all tables, indexes, RLS policies, and functions for AquaDex
-- Date: 2025-10-20
-- Version: 1.0.0

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
-- This table stores extended user profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    full_name TEXT,
    photo_url TEXT,
    location TEXT,
    bio TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    specialties TEXT[] DEFAULT '{}', -- Array of specialties like 'freshwater', 'saltwater', 'planted', 'reef'
    contact_preferences JSONB DEFAULT '{"email_notifications": true, "marketing_emails": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_location": false}'::jsonb,
    is_seller_approved BOOLEAN DEFAULT false,
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aquariums table
-- Stores information about user aquariums/tanks
CREATE TABLE IF NOT EXISTS public.aquariums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('freshwater', 'saltwater', 'brackish', 'pond')),
    size_gallons INTEGER,
    size_liters INTEGER,
    setup_date DATE,
    description TEXT,
    equipment JSONB DEFAULT '{}'::jsonb, -- Store filter, heater, lighting info as JSON
    inhabitants JSONB DEFAULT '{}'::jsonb, -- Store fish, plants, invertebrates as JSON
    parameters JSONB DEFAULT '{}'::jsonb, -- Store ideal parameters for this tank
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    maintenance_schedule JSONB DEFAULT '{}'::jsonb, -- Water changes, feeding schedule
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water tests table
-- Stores all water parameter test results
CREATE TABLE IF NOT EXISTS public.water_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE NOT NULL,
    test_date TIMESTAMPTZ DEFAULT NOW(),
    temperature DECIMAL(4,2), -- In Celsius
    ph DECIMAL(3,2),
    ammonia DECIMAL(4,2), -- In ppm
    nitrite DECIMAL(4,2), -- In ppm
    nitrate DECIMAL(4,2), -- In ppm
    gh INTEGER, -- General hardness in dGH
    kh INTEGER, -- Carbonate hardness in dKH
    tds INTEGER, -- Total dissolved solids in ppm
    salinity DECIMAL(3,2), -- For saltwater tanks
    alkalinity INTEGER, -- In meq/L or dKH
    phosphate DECIMAL(4,2), -- In ppm
    chlorine DECIMAL(4,2), -- In ppm
    copper DECIMAL(4,3), -- In ppm
    iron DECIMAL(4,3), -- In ppm
    calcium INTEGER, -- In ppm, for saltwater/reef tanks
    magnesium INTEGER, -- In ppm, for saltwater/reef tanks
    notes TEXT,
    test_kit_used TEXT,
    photo_url TEXT, -- Photo of test strips/results
    ai_analysis JSONB, -- AI analysis results from test strip image
    recommendations JSONB, -- AI recommendations based on test results
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace listings table
-- Stores all marketplace listings for buying/selling
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fish', 'plants', 'equipment', 'food', 'chemicals', 'decoration', 'other')),
    subcategory TEXT,
    condition TEXT CHECK (condition IN ('new', 'used_like_new', 'used_good', 'used_fair')),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    location TEXT,
    shipping_available BOOLEAN DEFAULT false,
    local_pickup_only BOOLEAN DEFAULT false,
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    tags TEXT[] DEFAULT '{}', -- Array of tags for search
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived', 'draft')),
    featured_until TIMESTAMPTZ, -- For featured listings
    views_count INTEGER DEFAULT 0,
    contact_info JSONB, -- Seller contact preferences
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table for Q&A section
-- Community questions and discussions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'freshwater', 'saltwater', 'planted', 'disease', 'equipment', 'breeding', 'water_chemistry')),
    tags TEXT[] DEFAULT '{}', -- Array of tags
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    views_count INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table for Q&A section
-- Answers to community questions
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    votes_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
-- System and user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
    category TEXT CHECK (category IN ('system', 'marketplace', 'qa', 'aquarium', 'water_test')) DEFAULT 'system',
    data JSONB DEFAULT '{}'::jsonb, -- Additional context data
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders table
-- User-set reminders for aquarium maintenance
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('water_change', 'feeding', 'testing', 'maintenance', 'medication', 'other')) NOT NULL,
    frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')),
    frequency_days INTEGER, -- For custom frequencies
    next_due TIMESTAMPTZ NOT NULL,
    last_completed TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON public.users(experience_level);
CREATE INDEX IF NOT EXISTS idx_users_seller_approved ON public.users(is_seller_approved);

-- Aquariums indexes
CREATE INDEX IF NOT EXISTS idx_aquariums_user_id ON public.aquariums(user_id);
CREATE INDEX IF NOT EXISTS idx_aquariums_type ON public.aquariums(type);
CREATE INDEX IF NOT EXISTS idx_aquariums_active ON public.aquariums(is_active);

-- Water tests indexes
CREATE INDEX IF NOT EXISTS idx_water_tests_user_id ON public.water_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_water_tests_aquarium_id ON public.water_tests(aquarium_id);
CREATE INDEX IF NOT EXISTS idx_water_tests_test_date ON public.water_tests(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_tests_aquarium_date ON public.water_tests(aquarium_id, test_date DESC);

-- Marketplace listings indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(featured_until DESC) WHERE featured_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location ON public.marketplace_listings(location) WHERE location IS NOT NULL;

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes ON public.questions(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_solved ON public.questions(is_solved);

-- Answers indexes
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON public.answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_votes ON public.answers(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_answers_accepted ON public.answers(is_accepted);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_aquarium_id ON public.reminders(aquarium_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_due ON public.reminders(next_due) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reminders_type ON public.reminders(type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Users
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.users;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profiles are viewable by everyone (for marketplace, Q&A)
CREATE POLICY "Public profiles are viewable" ON public.users
    FOR SELECT USING (
        privacy_settings->>'profile_visibility' = 'public' OR 
        auth.uid() = id
    );

-- ============================================================================
-- RLS POLICIES - Aquariums
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own aquariums" ON public.aquariums;

CREATE POLICY "Users can manage their own aquariums" ON public.aquariums
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - Water Tests
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own water tests" ON public.water_tests;

CREATE POLICY "Users can manage their own water tests" ON public.water_tests
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - Marketplace
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can manage their own listings" ON public.marketplace_listings;

CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own listings" ON public.marketplace_listings
    FOR ALL USING (auth.uid() = seller_id);

-- ============================================================================
-- RLS POLICIES - Questions
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can create questions" ON public.questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON public.questions;

CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON public.questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON public.questions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - Answers
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;
DROP POLICY IF EXISTS "Authenticated users can create answers" ON public.answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON public.answers;
DROP POLICY IF EXISTS "Users can delete their own answers" ON public.answers;

CREATE POLICY "Anyone can view answers" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON public.answers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers" ON public.answers
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - Notifications
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - Reminders
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;

CREATE POLICY "Users can manage their own reminders" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment question views
CREATE OR REPLACE FUNCTION public.increment_question_views(question_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.questions 
    SET views_count = views_count + 1
    WHERE id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment listing views
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.marketplace_listings 
    SET views_count = views_count + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update answer count when answers are added/removed
CREATE OR REPLACE FUNCTION public.update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.questions 
        SET answers_count = answers_count + 1
        WHERE id = NEW.question_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.questions 
        SET answers_count = answers_count - 1
        WHERE id = OLD.question_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate next reminder due date
CREATE OR REPLACE FUNCTION public.calculate_next_reminder_date(
    current_date TIMESTAMPTZ,
    frequency TEXT,
    frequency_days INTEGER DEFAULT NULL
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
    CASE frequency
        WHEN 'daily' THEN
            RETURN current_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            RETURN current_date + INTERVAL '1 week';
        WHEN 'biweekly' THEN
            RETURN current_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN
            RETURN current_date + INTERVAL '1 month';
        WHEN 'custom' THEN
            IF frequency_days IS NOT NULL THEN
                RETURN current_date + (frequency_days || ' days')::INTERVAL;
            ELSE
                RETURN current_date + INTERVAL '1 week'; -- Default fallback
            END IF;
        ELSE
            RETURN NULL; -- For 'once' frequency
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.aquariums;
DROP TRIGGER IF EXISTS handle_updated_at ON public.water_tests;
DROP TRIGGER IF EXISTS handle_updated_at ON public.marketplace_listings;
DROP TRIGGER IF EXISTS handle_updated_at ON public.questions;
DROP TRIGGER IF EXISTS handle_updated_at ON public.answers;
DROP TRIGGER IF EXISTS handle_updated_at ON public.reminders;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_question_answer_count_trigger ON public.answers;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.aquariums
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.water_tests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.reminders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update answer count
CREATE TRIGGER update_question_answer_count_trigger
    AFTER INSERT OR DELETE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION public.update_question_answer_count();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample categories and tags for marketplace
-- This can be useful for dropdown menus and search functionality

-- Note: You may want to create separate tables for categories and tags
-- for better normalization, but for simplicity we're using text arrays

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Migration completed successfully
-- Version: 1.0.0
-- Tables created: 8
-- Indexes created: 20+
-- RLS policies created: 15+
-- Functions created: 6
-- Triggers created: 8

SELECT 'AquaDex database schema migration completed successfully!' as status;