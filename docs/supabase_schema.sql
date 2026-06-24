-- Database Schema for TrainerSpace (Idempotent Version)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trainers profile
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  slot_duration INTEGER DEFAULT 60,
  telegram_bot_token TEXT,
  telegram_id TEXT,
  category TEXT, -- Sport, Beauty, Education, Medicine, etc.
  is_master BOOLEAN DEFAULT FALSE,
  is_client BOOLEAN DEFAULT FALSE,
  is_venue BOOLEAN DEFAULT FALSE,
  onboarding_completed_master BOOLEAN DEFAULT FALSE,
  onboarding_completed_client BOOLEAN DEFAULT FALSE,
  onboarding_completed_venue BOOLEAN DEFAULT FALSE,
  moyklass_api_key TEXT,
  moyklass_filial_id INTEGER,
  moyklass_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add onboarding columns if table already exists
-- Add missing columns if table already exists
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT TRUE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS is_client BOOLEAN DEFAULT FALSE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS is_venue BOOLEAN DEFAULT FALSE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS onboarding_completed_master BOOLEAN DEFAULT FALSE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS onboarding_completed_client BOOLEAN DEFAULT FALSE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS onboarding_completed_venue BOOLEAN DEFAULT FALSE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS moyklass_api_key TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS moyklass_filial_id INTEGER;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS moyklass_enabled BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation for trainers
DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can view their own profile" ON trainers;
    CREATE POLICY "Trainers can view their own profile" ON trainers FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can update their own profile" ON trainers;
    CREATE POLICY "Trainers can update their own profile" ON trainers FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  telegram_id TEXT,
  description TEXT,
  telegram_bot_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own venues" ON venues;
    CREATE POLICY "Trainers can manage their own venues" ON venues FOR ALL USING (auth.uid() = trainer_id);
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
        SELECT 1 FROM venues WHERE id = venue_id AND trainer_id = auth.uid()
      )
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  assigned_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if table already exists without them
ALTER TABLE services ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS assigned_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own services" ON services;
    CREATE POLICY "Trainers can manage their own services" ON services FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  telegram_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_bot_state TEXT,
  last_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, telegram_id)
);

-- Ensure unique constraint exists if table was created without it
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'clients_trainer_id_telegram_id_key'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_trainer_id_telegram_id_key UNIQUE (trainer_id, telegram_id);
    END IF;
END $$;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own clients" ON clients;
    CREATE POLICY "Trainers can manage their own clients" ON clients FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add venue_id to sessions if table already exists without it
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own sessions" ON sessions;
    CREATE POLICY "Trainers can manage their own sessions" ON sessions FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Schedule Configuration
CREATE TABLE IF NOT EXISTS schedule_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_hour TEXT DEFAULT '09:00',
  end_hour TEXT DEFAULT '20:00',
  UNIQUE(trainer_id, day_of_week)
);

ALTER TABLE schedule_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own schedule" ON schedule_config;
    CREATE POLICY "Trainers can manage their own schedule" ON schedule_config FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Messages for trainer-client chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'trainer' or 'client'
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own messages" ON messages;
    CREATE POLICY "Trainers can manage their own messages" ON messages FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Events / Activity Log
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can view their own events" ON events;
    CREATE POLICY "Trainers can view their own events" ON events FOR SELECT USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can log their own events" ON events;
    CREATE POLICY "Trainers can log their own events" ON events FOR INSERT WITH CHECK (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Blocked time slots
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_hour TEXT,
  end_hour TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can manage their own blocked slots" ON blocked_slots;
    CREATE POLICY "Trainers can manage their own blocked slots" ON blocked_slots FOR ALL USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add venue_id if table exists
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Trainers can view their own reviews" ON reviews;
    CREATE POLICY "Trainers can view their own reviews" ON reviews FOR SELECT USING (auth.uid() = trainer_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Partnerships
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
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
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, trainer_id)
);

ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Venue owners can manage staff" ON venue_staff;
    CREATE POLICY "Venue owners can manage staff" ON venue_staff FOR ALL USING (
      EXISTS (
        SELECT 1 FROM venues WHERE id = venue_id AND trainer_id = auth.uid()
      )
    );
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Staff can view their venues" ON venue_staff;
    CREATE POLICY "Staff can view their venues" ON venue_staff FOR SELECT USING (trainer_id = auth.uid());
EXCEPTION WHEN others THEN NULL; END $$;

-- Auth Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trainers (id, full_name, email, is_master)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Новый тренер'), new.email, false)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.schedule_config (trainer_id, day_of_week, start_hour, end_hour, is_active)
  VALUES
    (new.id, 1, '09:00', '20:00', true),
    (new.id, 2, '09:00', '20:00', true),
    (new.id, 3, '09:00', '20:00', true),
    (new.id, 4, '09:00', '20:00', true),
    (new.id, 5, '09:00', '20:00', true),
    (new.id, 6, '10:00', '15:00', true),
    (new.id, 0, '09:00', '18:00', false)
  ON CONFLICT (trainer_id, day_of_week) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Idempotent Trigger Creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
