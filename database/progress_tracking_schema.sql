-- Progress Tracking Database Schema for AI Tutor
-- This schema supports comprehensive progress tracking for parent dashboard views

-- 1. Enhanced StudentTopicStats table (overall progress per topic)
-- Drop existing table if you need to recreate it
-- DROP TABLE IF EXISTS "StudentTopicStats";

CREATE TABLE IF NOT EXISTS "StudentTopicStats" (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    
    -- Core Progress Metrics
    total_attempts INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    current_difficulty TEXT DEFAULT 'easy' CHECK (current_difficulty IN ('easy', 'medium', 'hard')),
    last_accuracy DECIMAL(5,2) DEFAULT 0.00, -- Percentage 0-100
    
    -- Timestamps
    last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI Analytics
    ai_performance DECIMAL(5,2) DEFAULT 0.00, -- Overall AI performance score
    best_streak INTEGER DEFAULT 0,
    
    -- JSON data for detailed tracking
    progress_data JSONB DEFAULT '{}'::jsonb, -- Stores arrays, objects for trends
    
    -- Constraints
    UNIQUE(student_id, topic_id)
);

-- 2. QuizSessions table (individual session records)
CREATE TABLE IF NOT EXISTS "QuizSessions" (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    
    -- Session Details
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    
    -- Performance Metrics
    questions_attempted INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2) NOT NULL, -- 0-100
    time_spent INTEGER DEFAULT 0, -- seconds
    
    -- Difficulty Progression
    next_difficulty TEXT CHECK (next_difficulty IN ('easy', 'medium', 'hard')),
    difficulty_changed BOOLEAN DEFAULT FALSE,
    
    -- AI Data
    ai_feedback JSONB DEFAULT '{}'::jsonb,
    question_details JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes for parent dashboard queries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_student_topic_stats_student_topic ON "StudentTopicStats"(student_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student ON "QuizSessions"(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_topic ON "QuizSessions"(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_date ON "QuizSessions"(session_date);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student_topic ON "QuizSessions"(student_id, topic_id);

-- 4. Functions for Parent Dashboard Analytics

-- Function to get student progress summary
CREATE OR REPLACE FUNCTION get_student_progress_summary(p_student_id INTEGER)
RETURNS TABLE (
    topic_id INTEGER,
    topic_name TEXT,
    current_difficulty TEXT,
    total_sessions INTEGER,
    average_accuracy DECIMAL,
    recent_accuracy DECIMAL,
    last_session DATE,
    difficulty_trend TEXT,
    total_time_spent INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sts.topic_id,
        t.name as topic_name,
        sts.current_difficulty,
        sts.total_attempts as total_sessions,
        ROUND(AVG(qs.accuracy_percentage), 1) as average_accuracy,
        sts.last_accuracy as recent_accuracy,
        DATE(sts.last_attempted) as last_session,
        CASE 
            WHEN COUNT(qs.id) FILTER (WHERE qs.difficulty_changed AND qs.session_date > NOW() - INTERVAL '7 days') > 0 
            THEN 'improving'
            ELSE 'stable'
        END as difficulty_trend,
        COALESCE(SUM(qs.time_spent), 0) as total_time_spent
    FROM "StudentTopicStats" sts
    LEFT JOIN "Topic" t ON sts.topic_id = t.id  
    LEFT JOIN "QuizSessions" qs ON sts.student_id = qs.student_id AND sts.topic_id = qs.topic_id
    WHERE sts.student_id = p_student_id
    GROUP BY sts.topic_id, t.name, sts.current_difficulty, sts.total_attempts, sts.last_accuracy, sts.last_attempted;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed session history
CREATE OR REPLACE FUNCTION get_session_history(p_student_id INTEGER, p_topic_id INTEGER DEFAULT NULL, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    session_id INTEGER,
    session_date TIMESTAMP WITH TIME ZONE,
    topic_id INTEGER,
    difficulty_level TEXT,
    accuracy_percentage DECIMAL,
    questions_attempted INTEGER,
    correct_answers INTEGER,
    time_spent INTEGER,
    difficulty_changed BOOLEAN,
    next_difficulty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qs.id as session_id,
        qs.session_date,
        qs.topic_id,
        qs.difficulty_level,
        qs.accuracy_percentage,
        qs.questions_attempted,
        qs.correct_answers,
        qs.time_spent,
        qs.difficulty_changed,
        qs.next_difficulty
    FROM "QuizSessions" qs
    WHERE qs.student_id = p_student_id
        AND (p_topic_id IS NULL OR qs.topic_id = p_topic_id)
        AND qs.session_date > NOW() - INTERVAL '1 day' * p_days
    ORDER BY qs.session_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get accuracy trends (for charts)
CREATE OR REPLACE FUNCTION get_accuracy_trends(p_student_id INTEGER, p_topic_id INTEGER, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    session_date DATE,
    accuracy_percentage DECIMAL,
    difficulty_level TEXT,
    session_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(qs.session_date) as session_date,
        ROUND(AVG(qs.accuracy_percentage), 1) as accuracy_percentage,
        qs.difficulty_level,
        COUNT(*)::INTEGER as session_count
    FROM "QuizSessions" qs
    WHERE qs.student_id = p_student_id
        AND qs.topic_id = p_topic_id
        AND qs.session_date > NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(qs.session_date), qs.difficulty_level
    ORDER BY session_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Triggers to maintain data consistency

-- Update total_attempts when new session is added
CREATE OR REPLACE FUNCTION update_total_attempts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "StudentTopicStats" 
    SET total_attempts = total_attempts + 1
    WHERE student_id = NEW.student_id AND topic_id = NEW.topic_id;
    
    -- Create record if it doesn't exist
    INSERT INTO "StudentTopicStats" (student_id, topic_id, total_attempts)
    VALUES (NEW.student_id, NEW.topic_id, 1)
    ON CONFLICT (student_id, topic_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attempts
    AFTER INSERT ON "QuizSessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_total_attempts();

-- 6. Sample queries for parent dashboard

/*
-- Get overall progress for a student
SELECT * FROM get_student_progress_summary(1);

-- Get recent session history
SELECT * FROM get_session_history(1, NULL, 7); -- Last 7 days

-- Get accuracy trends for charts
SELECT * FROM get_accuracy_trends(1, 4, 14); -- Shapes & Colors for last 14 days

-- Get students who improved difficulty recently
SELECT DISTINCT s.student_id, s.full_name
FROM "Student" s
JOIN "QuizSessions" qs ON s.id = qs.student_id
WHERE qs.difficulty_changed = true 
    AND qs.session_date > NOW() - INTERVAL '7 days'
    AND qs.next_difficulty > qs.difficulty_level;
*/

-- 7. Sample Data for Testing (Optional)
/*
-- Insert sample data
INSERT INTO "QuizSessions" (student_id, topic_id, difficulty_level, questions_attempted, correct_answers, accuracy_percentage, next_difficulty, difficulty_changed)
VALUES 
    (1, 4, 'easy', 5, 5, 100.00, 'medium', true),
    (1, 4, 'medium', 5, 4, 80.00, 'medium', false),
    (1, 4, 'medium', 5, 3, 60.00, 'easy', true);
*/
