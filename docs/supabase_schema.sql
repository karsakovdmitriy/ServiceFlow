-- Database Schema for TrainerSpace (Optimized)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trainers profile
CREATE TABLE trainers (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  email TEXT UNIQUE NOT NULL,
  slot_duration INTEGER DEFAULT 60,
  telegram_bot_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view their own profile"
  ON trainers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Trainers can update their own profile"
  ON trainers FOR UPDATE
  USING (auth.uid() = id);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own services"
  ON services FOR ALL
  USING (auth.uid() = trainer_id);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  telegram_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own clients"
  ON clients FOR ALL
  USING (auth.uid() = trainer_id);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = trainer_id);

-- Schedule Configuration
CREATE TABLE schedule_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_hour TEXT DEFAULT '09:00',
  end_hour TEXT DEFAULT '20:00',
  UNIQUE(trainer_id, day_of_week)
);

ALTER TABLE schedule_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own schedule"
  ON schedule_config FOR ALL
  USING (auth.uid() = trainer_id);

-- Blocked time slots
CREATE TABLE blocked_slots (
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

CREATE POLICY "Trainers can manage their own blocked slots"
  ON blocked_slots FOR ALL
  USING (auth.uid() = trainer_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trainers (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Новый тренер'), new.email);

  INSERT INTO public.schedule_config (trainer_id, day_of_week, start_hour, end_hour, is_active)
  VALUES
    (new.id, 1, '09:00', '20:00', true),
    (new.id, 2, '09:00', '20:00', true),
    (new.id, 3, '09:00', '20:00', true),
    (new.id, 4, '09:00', '20:00', true),
    (new.id, 5, '09:00', '20:00', true),
    (new.id, 6, '10:00', '15:00', true),
    (new.id, 0, '09:00', '18:00', false);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
