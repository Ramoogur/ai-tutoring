import { supabase } from '../../../utils/supabaseClient';

/**
 * Create a new matching game session
 */
export const createMatchingSession = async (sessionData) => {
  try {
    const { data, error } = await supabase
      .from('matching_game_sessions')
      .insert([
        {
          student_id: sessionData.student_id,
          topic_id: sessionData.topic_id,
          difficulty_level: sessionData.difficulty_level || 'easy',
          total_pairs: sessionData.total_pairs,
          pairs_data: sessionData.pairs_data,
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating matching session:', error);
    throw error;
  }
};

/**
 * Update an existing matching game session
 */
export const updateMatchingSession = async (sessionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('matching_game_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating matching session:', error);
    throw error;
  }
};

/**
 * Add a matching attempt to the database
 */
export const addMatchingAttempt = async (sessionId, attemptData) => {
  try {
    const { data, error } = await supabase
      .from('matching_attempts')
      .insert([
        {
          session_id: sessionId,
          attempt_number: attemptData.attempt_number,
          left_item: attemptData.left_item,
          right_item: attemptData.right_item,
          is_correct: attemptData.is_correct,
          time_taken: attemptData.time_taken
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding matching attempt:', error);
    throw error;
  }
};

/**
 * Add a matching event to the database
 */
export const addMatchingEvent = async (sessionId, eventType, eventData) => {
  try {
    const { data, error } = await supabase
      .from('matching_events')
      .insert([
        {
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding matching event:', error);
    throw error;
  }
};

/**
 * Get all sessions for a student
 */
export const getStudentMatchingSessions = async (studentId, topicId = null) => {
  try {
    let query = supabase
      .from('matching_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching matching sessions:', error);
    throw error;
  }
};

/**
 * Get detailed session with attempts
 */
export const getSessionWithAttempts = async (sessionId) => {
  try {
    const { data: session, error: sessionError } = await supabase
      .from('matching_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const { data: attempts, error: attemptsError } = await supabase
      .from('matching_attempts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (attemptsError) throw attemptsError;

    const { data: events, error: eventsError } = await supabase
      .from('matching_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (eventsError) throw eventsError;

    return {
      session,
      attempts,
      events
    };
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error;
  }
};

/**
 * Calculate student statistics for matching game
 */
export const calculateMatchingStats = async (studentId) => {
  try {
    const { data: sessions, error } = await supabase
      .from('matching_game_sessions')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    const stats = {
      total_sessions: sessions.length,
      total_pairs_matched: sessions.reduce((sum, s) => sum + s.correct_matches, 0),
      total_time_spent: sessions.reduce((sum, s) => sum + s.total_time_spent, 0),
      average_accuracy: sessions.length > 0
        ? (sessions.reduce((sum, s) => sum + parseFloat(s.accuracy_percentage), 0) / sessions.length).toFixed(2)
        : 0,
      topics_played: [...new Set(sessions.map(s => s.topic_id))].length,
      best_session: sessions.reduce((best, current) => 
        parseFloat(current.accuracy_percentage) > parseFloat(best.accuracy_percentage) ? current : best
      , sessions[0] || {})
    };

    return stats;
  } catch (error) {
    console.error('Error calculating matching stats:', error);
    throw error;
  }
};

/**
 * Update StudentTopicStats after completing a matching game
 */
export const updateStudentTopicStats = async (studentId, topicId, sessionResults) => {
  try {
    // Get existing stats - without .single() to avoid 406 error
    const { data: existingStats, error: fetchError } = await supabase
      .from('StudentTopicStats')
      .select('*')
      .eq('student_id', studentId)
      .eq('topic_id', topicId);

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching stats:', fetchError);
      // Don't throw - just log and continue
      return null;
    }

    const existingStat = existingStats && existingStats.length > 0 ? existingStats[0] : null;
    
    if (existingStat) {
      // Update existing stats
      const { data, error } = await supabase
        .from('StudentTopicStats')
        .update({
          total_attempts: existingStat.total_attempts + 1,
          correct_answers: existingStat.correct_answers + sessionResults.correct_matches,
          total_questions: existingStat.total_questions + sessionResults.total_pairs,
          last_accuracy: sessionResults.accuracy_percentage,
          last_attempted: new Date().toISOString()
        })
        .eq('student_id', studentId)
        .eq('topic_id', topicId);

      if (error) {
        console.error('Error updating stats:', error);
        return null;
      }
      return data;
    } else {
      // Create new stats entry
      const { data, error } = await supabase
        .from('StudentTopicStats')
        .insert([
          {
            student_id: studentId,
            topic_id: topicId,
            total_attempts: 1,
            correct_answers: sessionResults.correct_matches,
            total_questions: sessionResults.total_pairs,
            last_accuracy: sessionResults.accuracy_percentage,
            last_attempted: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error creating stats:', error);
        return null;
      }
      return data;
    }
  } catch (error) {
    console.error('Error updating student topic stats:', error);
    // Don't throw - game should complete even if stats fail
    return null;
  }
};