-- Matching Game Database Schema
-- Run this in your Supabase SQL Editor
-- This creates all necessary tables for the Grade 1 Matching Game

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Table 1: matching_game_sessions
-- ========================================
-- Stores each matching game session
CREATE TABLE IF NOT EXISTS public.matching_game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id INT4 NOT NULL,
    topic_id INT4 NOT NULL,
    difficulty_level TEXT DEFAULT 'easy',
    started_at TIMESTAMP DEFAULT now(),
    ended_at TIMESTAMP,
    total_pairs INT4 DEFAULT 0,
    correct_matches INT4 DEFAULT 0,
    incorrect_attempts INT4 DEFAULT 0,
    total_time_spent INT4 DEFAULT 0, -- in seconds
    accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
    pairs_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Foreign keys (adjust table names based on your schema)
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public."Student"(id) ON DELETE CASCADE,
    CONSTRAINT fk_topic FOREIGN KEY (topic_id) REFERENCES public."Topic"(id) ON DELETE CASCADE
);

-- ========================================
-- Table 2: matching_attempts
-- ========================================
-- Stores individual matching attempts within a session
CREATE TABLE IF NOT EXISTS public.matching_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL,
    attempt_number INT4,
    left_item TEXT NOT NULL,
    right_item TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    time_taken INT4 DEFAULT 0, -- in milliseconds
    created_at TIMESTAMP DEFAULT now(),
    
    -- Foreign key
    CONSTRAINT fk_session FOREIGN KEY (session_id) 
        REFERENCES public.matching_game_sessions(id) ON DELETE CASCADE
);

-- ========================================
-- Table 3: matching_events
-- ========================================
-- Stores detailed game events for analytics
CREATE TABLE IF NOT EXISTS public.matching_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT now(),
    
    -- Foreign key
    CONSTRAINT fk_session_event FOREIGN KEY (session_id) 
        REFERENCES public.matching_game_sessions(id) ON DELETE CASCADE
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_matching_sessions_student 
    ON public.matching_game_sessions(student_id);
    
CREATE INDEX IF NOT EXISTS idx_matching_sessions_topic 
    ON public.matching_game_sessions(topic_id);
    
CREATE INDEX IF NOT EXISTS idx_matching_sessions_created 
    ON public.matching_game_sessions(created_at);
    
CREATE INDEX IF NOT EXISTS idx_matching_attempts_session 
    ON public.matching_attempts(session_id);
    
CREATE INDEX IF NOT EXISTS idx_matching_events_session 
    ON public.matching_events(session_id);
    
CREATE INDEX IF NOT EXISTS idx_matching_events_type 
    ON public.matching_events(event_type);

-- ========================================
-- Row Level Security (RLS)
-- ========================================
ALTER TABLE public.matching_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_events ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies for matching_game_sessions
-- ========================================
-- Allow all operations (adjust based on your auth requirements)
CREATE POLICY "matching_sessions_select" 
    ON public.matching_game_sessions 
    FOR SELECT 
    USING (true);

CREATE POLICY "matching_sessions_insert" 
    ON public.matching_game_sessions 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "matching_sessions_update" 
    ON public.matching_game_sessions 
    FOR UPDATE 
    USING (true);

-- ========================================
-- RLS Policies for matching_attempts
-- ========================================
-- Allow all operations (adjust based on your auth requirements)
CREATE POLICY "matching_attempts_select" 
    ON public.matching_attempts 
    FOR SELECT 
    USING (true);

CREATE POLICY "matching_attempts_insert" 
    ON public.matching_attempts 
    FOR INSERT 
    WITH CHECK (true);

-- ========================================
-- RLS Policies for matching_events
-- ========================================
-- Allow all operations (adjust based on your auth requirements)
CREATE POLICY "matching_events_select" 
    ON public.matching_events 
    FOR SELECT 
    USING (true);

CREATE POLICY "matching_events_insert" 
    ON public.matching_events 
    FOR INSERT 
    WITH CHECK (true);

-- ========================================
-- Analytics View
-- ========================================
-- View for session analytics with student info
CREATE OR REPLACE VIEW public.v_matching_analytics AS
SELECT 
    mgs.*,
    s.full_name as student_name,
    s.grade_level,
    t.name as topic_name,
    COUNT(ma.id) as total_attempts_logged,
    AVG(CASE WHEN ma.is_correct THEN 1 ELSE 0 END)::NUMERIC(5,2) as attempt_accuracy
FROM public.matching_game_sessions mgs
LEFT JOIN public."Student" s ON s.id = mgs.student_id
LEFT JOIN public."Topic" t ON t.id = mgs.topic_id
LEFT JOIN public.matching_attempts ma ON ma.session_id = mgs.id
GROUP BY mgs.id, s.full_name, s.grade_level, t.name;

-- ========================================
-- Helper Functions
-- ========================================

-- Function to get student's matching game statistics
CREATE OR REPLACE FUNCTION get_matching_game_stats(student_id_param INTEGER)
RETURNS TABLE (
    total_sessions BIGINT,
    total_pairs_matched BIGINT,
    total_time_minutes NUMERIC,
    average_accuracy NUMERIC,
    topics_played BIGINT,
    best_accuracy NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_sessions,
        SUM(correct_matches)::BIGINT as total_pairs_matched,
        ROUND(SUM(total_time_spent) / 60.0, 2) as total_time_minutes,
        ROUND(AVG(accuracy_percentage), 2) as average_accuracy,
        COUNT(DISTINCT topic_id)::BIGINT as topics_played,
        ROUND(MAX(accuracy_percentage), 2) as best_accuracy
    FROM public.matching_game_sessions
    WHERE student_id = student_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get topic-wise performance
CREATE OR REPLACE FUNCTION get_matching_topic_performance(student_id_param INTEGER)
RETURNS TABLE (
    topic_name TEXT,
    sessions_played BIGINT,
    avg_accuracy NUMERIC,
    total_matches BIGINT,
    best_session_accuracy NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name,
        COUNT(mgs.id)::BIGINT as sessions_played,
        ROUND(AVG(mgs.accuracy_percentage), 2) as avg_accuracy,
        SUM(mgs.correct_matches)::BIGINT as total_matches,
        ROUND(MAX(mgs.accuracy_percentage), 2) as best_session_accuracy
    FROM public.matching_game_sessions mgs
    JOIN public."Topic" t ON t.id = mgs.topic_id
    WHERE mgs.student_id = student_id_param
    GROUP BY t.name
    ORDER BY avg_accuracy DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Triggers
-- ========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matching_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER trigger_update_matching_session_timestamp
    BEFORE UPDATE ON public.matching_game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_matching_session_timestamp();

-- ========================================
-- Comments for Documentation
-- ========================================
COMMENT ON TABLE public.matching_game_sessions IS 
    'Stores matching game sessions with scores, accuracy, and timing for Grade 1 students';

COMMENT ON TABLE public.matching_attempts IS 
    'Records individual matching attempts with correctness and timing details';

COMMENT ON TABLE public.matching_events IS 
    'Logs detailed game events for analytics (game_started, correct_match, incorrect_attempt, game_completed)';

COMMENT ON VIEW public.v_matching_analytics IS 
    'Analytics view combining matching session data with student and topic information';

-- ========================================
-- Sample Query Examples (commented out)
-- ========================================

-- Get all sessions for a student
-- SELECT * FROM matching_game_sessions WHERE student_id = 1;

-- Get student statistics
-- SELECT * FROM get_matching_game_stats(1);

-- Get topic performance
-- SELECT * FROM get_matching_topic_performance(1);

-- Get recent sessions with details
-- SELECT * FROM v_matching_analytics WHERE student_id = 1 ORDER BY created_at DESC LIMIT 10;

-- ========================================
-- DONE! 
-- ========================================
-- All tables, indexes, RLS policies, views, and functions created successfully.
-- The Matching Game is now ready to store and track all game data.

