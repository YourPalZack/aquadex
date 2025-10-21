-- AquaDex Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    full_name TEXT,
    photo_url TEXT,
    location TEXT,
    bio TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    specialties TEXT[], -- Array of specialties like 'freshwater', 'saltwater', 'planted', 'reef'
    contact_preferences JSONB DEFAULT '{"email_notifications": true, "marketing_emails": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_location": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aquariums table
CREATE TABLE public.aquariums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('freshwater', 'saltwater', 'brackish', 'pond')),
    size_gallons INTEGER,
    size_liters INTEGER,
    setup_date DATE,
    description TEXT,
    equipment JSONB, -- Store filter, heater, lighting info as JSON
    inhabitants JSONB, -- Store fish, plants, invertebrates as JSON
    parameters JSONB, -- Store ideal parameters for this tank
    photos TEXT[], -- Array of photo URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water tests table
CREATE TABLE public.water_tests (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
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
    photos TEXT[], -- Array of photo URLs
    tags TEXT[], -- Array of tags for search
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived', 'draft')),
    featured_until TIMESTAMPTZ, -- For featured listings
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table for Q&A section
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'freshwater', 'saltwater', 'planted', 'disease', 'equipment', 'breeding', 'water_chemistry')),
    tags TEXT[], -- Array of tags
    views_count INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table for Q&A section
CREATE TABLE public.answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_aquariums_user_id ON public.aquariums(user_id);
CREATE INDEX idx_aquariums_type ON public.aquariums(type);

CREATE INDEX idx_water_tests_user_id ON public.water_tests(user_id);
CREATE INDEX idx_water_tests_aquarium_id ON public.water_tests(aquarium_id);
CREATE INDEX idx_water_tests_test_date ON public.water_tests(test_date DESC);

CREATE INDEX idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);

CREATE INDEX idx_questions_user_id ON public.questions(user_id);
CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);

CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_answers_user_id ON public.answers(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

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

-- Aquariums policies
CREATE POLICY "Users can manage their own aquariums" ON public.aquariums
    FOR ALL USING (auth.uid() = user_id);

-- Water tests policies
CREATE POLICY "Users can manage their own water tests" ON public.water_tests
    FOR ALL USING (auth.uid() = user_id);

-- Marketplace policies
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own listings" ON public.marketplace_listings
    FOR ALL USING (auth.uid() = seller_id);

-- Questions policies
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON public.questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON public.questions
    FOR DELETE USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Anyone can view answers" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON public.answers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers" ON public.answers
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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