-- Database Schema for TrainerSpace

-- Trainers profile
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  specialization TEXT,
  email TEXT UNIQUE NOT NULL,
  slot_duration INTEGER DEFAULT 60, -- in minutes
  telegram_bot_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients list
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id),
  full_name TEXT NOT NULL,
  email TEXT,
  telegram_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions (bookings)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id),
  client_id UUID REFERENCES clients(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule Configuration
CREATE TABLE schedule_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id),
  day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
  is_active BOOLEAN DEFAULT TRUE,
  start_hour TEXT, -- e.g., '09:00'
  end_hour TEXT,   -- e.g., '20:00'
  UNIQUE(trainer_id, day_of_week)
);

-- Blocked time slots
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES trainers(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
