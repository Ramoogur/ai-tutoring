-- Grade-1 Abacus Game Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table (if not exists)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  profile_meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('free', 'count', 'make', 'add', 'sub')),
  target_number INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  score INTEGER NOT NULL DEFAULT 0,
  total_prompts INTEGER NOT NULL DEFAULT 0,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Attempts table
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  question_index INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('count', 'add', 'sub', 'make')),
  operand_a INTEGER,
  operand_b INTEGER,
  target_number INTEGER,
  answer_number INTEGER,
  is_correct BOOLEAN,
  time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign Key Constraints
ALTER TABLE public.game_sessions
  ADD CONSTRAINT game_sessions_student_fk
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.attempts
  ADD CONSTRAINT attempts_session_fk
  FOREIGN KEY (session_id) REFERENCES public.game_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.events
  ADD CONSTRAINT events_session_fk
  FOREIGN KEY (session_id) REFERENCES public.game_sessions(id) ON DELETE CASCADE;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_student ON public.game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started ON public.game_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_open ON public.game_sessions(ended_at) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attempts_session ON public.attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.events(session_id);

-- Row Level Security Policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Students policies (assuming students.id = auth.uid())
CREATE POLICY "students_owner_select" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "students_owner_insert" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "students_owner_update" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Game sessions policies
CREATE POLICY "sessions_by_owner" ON public.game_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND s.id = auth.uid()
    )
  );

-- Attempts policies
CREATE POLICY "attempts_by_owner" ON public.attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions se 
      WHERE se.id = session_id AND se.student_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "events_by_owner" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions se 
      WHERE se.id = session_id AND se.student_id = auth.uid()
    )
  );

-- Analytics View for Session Summary
CREATE OR REPLACE VIEW public.v_game_sessions AS
SELECT
  gs.*,
  EXTRACT(EPOCH FROM COALESCE(gs.ended_at, NOW()) - gs.started_at)::BIGINT AS duration_seconds,
  COUNT(a.id) AS total_attempts,
  ROUND(AVG(CASE WHEN a.is_correct THEN 1 ELSE 0 END)::NUMERIC, 2) AS accuracy
FROM public.game_sessions gs
LEFT JOIN public.attempts a ON a.session_id = gs.id
GROUP BY gs.id;

-- Function to get skill accuracy by question type
CREATE OR REPLACE FUNCTION get_skill_accuracy(student_id UUID)
RETURNS TABLE (
  question_type TEXT,
  accuracy NUMERIC,
  total_attempts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.question_type,
    ROUND(AVG(CASE WHEN a.is_correct THEN 1 ELSE 0 END)::NUMERIC, 2) AS accuracy,
    COUNT(*) AS total_attempts
  FROM public.attempts a
  JOIN public.game_sessions s ON s.id = a.session_id
  WHERE s.student_id = get_skill_accuracy.student_id
  GROUP BY a.question_type
  ORDER BY a.question_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing (optional)
-- INSERT INTO public.students (id, display_name) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Demo Student');

COMMENT ON TABLE public.game_sessions IS 'Stores abacus game session data with mode, target numbers, and scores';
COMMENT ON TABLE public.attempts IS 'Records individual question attempts with correctness and timing';
COMMENT ON TABLE public.events IS 'Logs detailed game events like moves, hints, and interactions';
