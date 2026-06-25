-- Database Schema for TrainerSpace (Architecturally Separated)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (Can be Master, Client, or Venue Owner)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_master BOOLEAN DEFAULT FALSE,
  is_client BOOLEAN DEFAULT FALSE,
  is_venue BOOLEAN DEFAULT FALSE,
  onboarding_completed_master BOOLEAN DEFAULT FALSE,
  onboarding_completed_client BOOLEAN DEFAULT FALSE,
  onboarding_completed_venue BOOLEAN DEFAULT FALSE,
  moyklass_api_key TEXT,
  moyklass_filial_id INTEGER,
  moyklass_enabled BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'business'
  subscription_status TEXT DEFAULT 'active',
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans Definition
CREATE TABLE IF NOT EXISTS subscription_plans (
  tier TEXT PRIMARY KEY,
  max_venues INTEGER,
  max_masters INTEGER,
  max_services INTEGER,
  has_analytics BOOLEAN DEFAULT FALSE,
  has_custom_bot BOOLEAN DEFAULT FALSE
);

-- Insert default plans
INSERT INTO subscription_plans (tier, max_venues, max_masters, max_services, has_analytics, has_custom_bot)
VALUES
  ('free', 1, 1, 5, FALSE, FALSE),
  ('pro', 3, 3, 100, TRUE, TRUE),
  ('business', 1000, 1000, 1000, TRUE, TRUE)
ON CONFLICT (tier) DO UPDATE SET
  max_venues = EXCLUDED.max_venues,
  max_masters = EXCLUDED.max_masters,
  max_services = EXCLUDED.max_services,
  has_analytics = EXCLUDED.has_analytics,
  has_custom_bot = EXCLUDED.has_custom_bot;

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Masters (Entity that performs the service)
-- Can be linked to a user profile or be a standalone entry created by a venue
CREATE TABLE IF NOT EXISTS masters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  avatar_url TEXT,
  phone TEXT,
  slot_duration INTEGER DEFAULT 60,
  telegram_id TEXT,
  max_id TEXT,
  telegram_bot_token TEXT,
  category TEXT, -- Sport, Beauty, Education, Medicine, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE masters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can view their own record" ON masters;
    CREATE POLICY "Masters can view their own record" ON masters FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view/update/delete masters they created" ON masters;
    CREATE POLICY "Users can view/update/delete masters they created" ON masters
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can create masters within subscription limit" ON masters;
    CREATE POLICY "Users can create masters within subscription limit" ON masters
    FOR INSERT WITH CHECK (auth.uid() = user_id AND check_subscription_limit(auth.uid(), 'masters'));
EXCEPTION WHEN others THEN NULL; END $$;

-- Venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  telegram_id TEXT,
  max_id TEXT,
  description TEXT,
  telegram_bot_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Owners can view/update/delete their own venues" ON venues;
    CREATE POLICY "Owners can view/update/delete their own venues" ON venues
    FOR ALL USING (auth.uid() = owner_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Owners can create venues within subscription limit" ON venues;
    CREATE POLICY "Owners can create venues within subscription limit" ON venues
    FOR INSERT WITH CHECK (auth.uid() = owner_id AND check_subscription_limit(auth.uid(), 'venues'));
EXCEPTION WHEN others THEN NULL; END $$;

-- Venue Schedule Configuration
CREATE TABLE IF NOT EXISTS venue_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_hour TEXT DEFAULT '09:00',
  end_hour TEXT DEFAULT '20:00',
  UNIQUE(venue_id, day_of_week)
);

ALTER TABLE venue_schedule ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Venue owners can manage their schedule" ON venue_schedule;
    CREATE POLICY "Venue owners can manage their schedule" ON venue_schedule FOR ALL USING (
      EXISTS (
        SELECT 1 FROM venues WHERE id = venue_id AND owner_id = auth.uid()
      )
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  master_id UUID REFERENCES masters(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Owners can view/update/delete their own services" ON services;
    CREATE POLICY "Owners can view/update/delete their own services" ON services
    FOR ALL USING (auth.uid() = owner_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Owners can create services within subscription limit" ON services;
    CREATE POLICY "Owners can create services within subscription limit" ON services
    FOR INSERT WITH CHECK (auth.uid() = owner_id AND check_subscription_limit(auth.uid(), 'services'));
EXCEPTION WHEN others THEN NULL; END $$;

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  telegram_id TEXT,
  max_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_bot_state TEXT,
  last_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, telegram_id),
  UNIQUE(owner_id, max_id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Owners can manage their own clients" ON clients;
    CREATE POLICY "Owners can manage their own clients" ON clients FOR ALL USING (auth.uid() = owner_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can manage their sessions" ON sessions;
    CREATE POLICY "Masters can manage their sessions" ON sessions FOR ALL USING (
        EXISTS (SELECT 1 FROM masters WHERE id = master_id AND user_id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Schedule Configuration for Masters
CREATE TABLE IF NOT EXISTS schedule_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_hour TEXT DEFAULT '09:00',
  end_hour TEXT DEFAULT '20:00',
  UNIQUE(master_id, day_of_week)
);

ALTER TABLE schedule_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can manage their own schedule" ON schedule_config;
    CREATE POLICY "Masters can manage their own schedule" ON schedule_config FOR ALL USING (
        EXISTS (SELECT 1 FROM masters WHERE id = master_id AND user_id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'trainer' or 'client'
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage their messages" ON messages;
    CREATE POLICY "Users can manage their messages" ON messages FOR ALL USING (auth.uid() = profile_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Events / Activity Log
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own events" ON events;
    CREATE POLICY "Users can view their own events" ON events
    FOR SELECT USING (
      auth.uid() = profile_id
      AND (
        type != 'analytics'
        OR check_subscription_feature(auth.uid(), 'analytics')
      )
    );
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can log their own events" ON events;
    CREATE POLICY "Users can log their own events" ON events FOR INSERT WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Blocked time slots for Masters
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_hour TEXT,
  end_hour TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can manage their own blocked slots" ON blocked_slots;
    CREATE POLICY "Masters can manage their own blocked slots" ON blocked_slots FOR ALL USING (
        EXISTS (SELECT 1 FROM masters WHERE id = master_id AND user_id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can view their own reviews" ON reviews;
    CREATE POLICY "Masters can view their own reviews" ON reviews FOR SELECT USING (
        EXISTS (SELECT 1 FROM masters WHERE id = master_id AND user_id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Partnerships
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage their own partnerships" ON partnerships;
    CREATE POLICY "Users can manage their own partnerships" ON partnerships FOR ALL USING (auth.uid() = user_id OR auth.uid() = partner_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Venue Staff
CREATE TABLE IF NOT EXISTS venue_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, master_id)
);

ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Venue owners can manage staff" ON venue_staff;
    CREATE POLICY "Venue owners can manage staff" ON venue_staff FOR ALL USING (
      EXISTS (
        SELECT 1 FROM venues WHERE id = venue_id AND owner_id = auth.uid()
      )
    );
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Masters can view their venues" ON venue_staff;
    CREATE POLICY "Masters can view their venues" ON venue_staff FOR SELECT USING (
        EXISTS (SELECT 1 FROM masters WHERE id = master_id AND user_id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Subscription Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_subscription_plan(user_id UUID)
RETURNS SETOF subscription_plans AS $$
BEGIN
  RETURN QUERY
  SELECT sp.*
  FROM subscription_plans sp
  JOIN profiles p ON p.subscription_tier = sp.tier
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_subscription_limit(u_id UUID, entity_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
  user_tier TEXT;
BEGIN
  SELECT subscription_tier INTO user_tier FROM profiles WHERE id = u_id;

  IF entity_type = 'venues' THEN
    SELECT COUNT(*) INTO current_count FROM venues WHERE owner_id = u_id;
    SELECT max_venues INTO max_allowed FROM subscription_plans WHERE tier = user_tier;
  ELSIF entity_type = 'masters' THEN
    SELECT COUNT(*) INTO current_count FROM masters WHERE user_id = u_id;
    SELECT max_masters INTO max_allowed FROM subscription_plans WHERE tier = user_tier;
  ELSIF entity_type = 'services' THEN
    SELECT COUNT(*) INTO current_count FROM services WHERE owner_id = u_id;
    SELECT max_services INTO max_allowed FROM subscription_plans WHERE tier = user_tier;
  ELSE
    RETURN TRUE;
  END IF;

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_subscription_feature(u_id UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  allowed BOOLEAN;
BEGIN
  SELECT subscription_tier INTO user_tier FROM profiles WHERE id = u_id;

  IF feature_name = 'analytics' THEN
    SELECT has_analytics INTO allowed FROM subscription_plans WHERE tier = user_tier;
  ELSIF feature_name = 'custom_bot' THEN
    SELECT has_custom_bot INTO allowed FROM subscription_plans WHERE tier = user_tier;
  ELSE
    RETURN FALSE;
  END IF;

  RETURN allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_master)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Новый пользователь'), new.email, false)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Idempotent Trigger Creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
