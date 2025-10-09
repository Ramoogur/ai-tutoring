-- Abacus Game Dedicated Table
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Abacus Game Sessions table
CREATE TABLE IF NOT EXISTS public.abacus_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id INTEGER NOT NULL, -- References your existing Student table
  game_mode TEXT NOT NULL CHECK (game_mode IN ('free', 'count', 'make', 'add', 'sub')),
  target_number INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  level INTEGER DEFAULT 1,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abacus Game Attempts table
CREATE TABLE IF NOT EXISTS public.abacus_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  question_index INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('count', 'add', 'sub', 'make')),
  target_number INTEGER,
  student_answer INTEGER,
  tens_used INTEGER DEFAULT 0,
  ones_used INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  time_taken INTEGER, -- in milliseconds
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abacus Game Events table (for detailed tracking)
CREATE TABLE IF NOT EXISTS public.abacus_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign Key Constraints
ALTER TABLE public.abacus_game_sessions
  ADD CONSTRAINT abacus_sessions_student_fk
  FOREIGN KEY (student_id) REFERENCES public."Student"(id) ON DELETE CASCADE;

ALTER TABLE public.abacus_attempts
  ADD CONSTRAINT abacus_attempts_session_fk
  FOREIGN KEY (session_id) REFERENCES public.abacus_game_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.abacus_events
  ADD CONSTRAINT abacus_events_session_fk
  FOREIGN KEY (session_id) REFERENCES public.abacus_game_sessions(id) ON DELETE CASCADE;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_abacus_sessions_student ON public.abacus_game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_abacus_sessions_started ON public.abacus_game_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_abacus_sessions_mode ON public.abacus_game_sessions(game_mode);
CREATE INDEX IF NOT EXISTS idx_abacus_attempts_session ON public.abacus_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_abacus_events_session ON public.abacus_events(session_id);

-- Row Level Security Policies
ALTER TABLE public.abacus_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abacus_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abacus_events ENABLE ROW LEVEL SECURITY;

-- Policies for abacus_game_sessions
CREATE POLICY "abacus_sessions_select" ON public.abacus_game_sessions
  FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY "abacus_sessions_insert" ON public.abacus_game_sessions
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

CREATE POLICY "abacus_sessions_update" ON public.abacus_game_sessions
  FOR UPDATE USING (true); -- Adjust based on your auth requirements

-- Policies for abacus_attempts
CREATE POLICY "abacus_attempts_select" ON public.abacus_attempts
  FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY "abacus_attempts_insert" ON public.abacus_attempts
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

-- Policies for abacus_events
CREATE POLICY "abacus_events_select" ON public.abacus_events
  FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY "abacus_events_insert" ON public.abacus_events
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

-- Function to update accuracy and time when session ends
CREATE OR REPLACE FUNCTION update_abacus_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate accuracy percentage
  NEW.accuracy_percentage = CASE 
    WHEN NEW.total_questions > 0 THEN 
      ROUND((NEW.correct_answers::NUMERIC / NEW.total_questions::NUMERIC) * 100, 2)
    ELSE 0.00
  END;
  
  -- Update timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats
CREATE TRIGGER trigger_update_abacus_session_stats
  BEFORE UPDATE ON public.abacus_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_abacus_session_stats();

-- View for session analytics
CREATE OR REPLACE VIEW public.v_abacus_analytics AS
SELECT 
  ags.*,
  s.full_name as student_name,
  s.grade_level,
  EXTRACT(EPOCH FROM COALESCE(ags.ended_at, NOW()) - ags.started_at)::INTEGER as session_duration,
  COUNT(aa.id) as total_attempts,
  AVG(CASE WHEN aa.is_correct THEN 1 ELSE 0 END)::NUMERIC(5,2) as attempt_accuracy
FROM public.abacus_game_sessions ags
LEFT JOIN public."Student" s ON s.id = ags.student_id
LEFT JOIN public.abacus_attempts aa ON aa.session_id = ags.id
GROUP BY ags.id, s.full_name, s.grade_level;

-- Function to get student progress
CREATE OR REPLACE FUNCTION get_abacus_student_progress(student_id_param INTEGER)
RETURNS TABLE (
  game_mode TEXT,
  total_sessions BIGINT,
  avg_accuracy NUMERIC,
  best_score INTEGER,
  total_time BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ags.game_mode,
    COUNT(*) as total_sessions,
    ROUND(AVG(ags.accuracy_percentage), 2) as avg_accuracy,
    MAX(ags.total_score) as best_score,
    SUM(ags.total_time_spent) as total_time
  FROM public.abacus_game_sessions ags
  WHERE ags.student_id = student_id_param
  GROUP BY ags.game_mode
  ORDER BY ags.game_mode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.abacus_game_sessions IS 'Stores abacus game session data with scores, accuracy, and timing';
COMMENT ON TABLE public.abacus_attempts IS 'Records individual question attempts with detailed bead usage';
COMMENT ON TABLE public.abacus_events IS 'Logs detailed game events like moves, hints, and interactions';
COMMENT ON VIEW public.v_abacus_analytics IS 'Analytics view combining session data with student information';
