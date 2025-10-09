import { supabase } from './supabaseClient';

// Game session management - try abacus_game_sessions first, fallback to game_sessions
export async function startGameSession({ studentId, mode, targetNumber = null, meta = {} }) {
  console.log('🚀 startGameSession called with:', { studentId, mode, targetNumber });
  
  try {
    // First try the dedicated abacus_game_sessions table
    const { data, error } = await supabase
      .from("abacus_game_sessions")
      .insert({ 
        student_id: studentId, 
        game_mode: mode,
        target_number: targetNumber,
        total_score: 0,
        total_questions: 0,
        correct_answers: 0,
        accuracy_percentage: 0.00,
        total_time_spent: 0,
        level: 1,
        best_streak: 0
      })
      .select()
      .single();
    
    if (!error) {
      console.log('✅ Successfully created session in abacus_game_sessions:', data);
      return data;
    }
    
    console.warn('❌ abacus_game_sessions insert failed:', error.message);
    
    // If abacus_game_sessions doesn't exist, try game_sessions
    console.warn('abacus_game_sessions table not found, trying game_sessions...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("game_sessions")
      .insert({ 
        student_id: studentId, 
        mode: mode,
        target_number: targetNumber,
        score: 0,
        total_prompts: 0,
        meta: meta
      })
      .select()
      .single();
    
    if (!fallbackError) {
      console.log('✅ Successfully created session in game_sessions (fallback):', fallbackData);
      return fallbackData;
    }
    
    console.warn('❌ game_sessions insert also failed:', fallbackError.message);
    console.warn('Database tables not created yet. Running in demo mode.');
    // Return a mock session for demo purposes with proper UUID format
    const mockSession = { id: '00000000-0000-0000-0000-000000000001', student_id: studentId };
    console.log('🔄 Returning mock session:', mockSession);
    return mockSession;
  } catch (error) {
    console.warn('Database connection failed. Running in demo mode.', error);
    // Return a mock session for demo purposes with proper UUID format
    const mockSession = { id: '00000000-0000-0000-0000-000000000001', student_id: studentId };
    console.log('🔄 Returning mock session (catch):', mockSession);
    return mockSession;
  }
}

export async function endGameSession(sessionId, { score, totalPrompts, correctAnswers = 0, level = 1, bestStreak = 0, timeSpent = 0 }) {
  try {
    const accuracy = totalPrompts > 0 ? (correctAnswers / totalPrompts) * 100 : 0;
    
    // First try the dedicated abacus_game_sessions table
    const { data, error } = await supabase
      .from("abacus_game_sessions")
      .update({ 
        ended_at: new Date().toISOString(),
        total_score: score,
        total_questions: totalPrompts,
        correct_answers: correctAnswers,
        accuracy_percentage: Math.round(accuracy * 100) / 100,
        total_time_spent: timeSpent,
        level: level,
        best_streak: bestStreak
      })
      .eq("id", sessionId)
      .select()
      .single();
    
    if (!error) {
      return data;
    }
    
    // If abacus_game_sessions doesn't exist, try game_sessions
    console.warn('abacus_game_sessions table not found, trying game_sessions...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("game_sessions")
      .update({ 
        ended_at: new Date().toISOString(),
        score: score,
        total_prompts: totalPrompts,
        meta: {
          correct_answers: correctAnswers,
          accuracy_percentage: Math.round(accuracy * 100) / 100,
          level: level,
          best_streak: bestStreak,
          time_spent: timeSpent
        }
      })
      .eq("id", sessionId)
      .select()
      .single();
    
    if (!fallbackError) {
      return fallbackData;
    }
    
    console.warn('Could not end session in database:', fallbackError.message);
    return { id: sessionId };
  } catch (error) {
    console.warn('Database connection failed during session end.');
    return { id: sessionId };
  }
}

// Log individual attempts - try abacus_attempts first, fallback to attempts
export async function logAttempt({
  sessionId,
  questionIndex,
  questionType,
  targetNumber,
  studentAnswer,
  tensUsed = 0,
  onesUsed = 0,
  isCorrect,
  timeTaken,
  hintsUsed = 0
}) {
  // Skip logging if using mock session ID
  if (sessionId === '00000000-0000-0000-0000-000000000001') {
    console.log('⚠️ Skipping attempt logging - mock session ID detected');
    return;
  }
  
  // Debug logging to help identify the issue
  console.log('🔍 logAttempt called with:', {
    sessionId,
    questionIndex,
    questionType,
    targetNumber,
    studentAnswer,
    isCorrect
  });
  
  try {
    // First try the dedicated abacus_attempts table
    const { error } = await supabase
      .from('abacus_attempts')
      .insert({
        session_id: sessionId,
        question_index: questionIndex,
        question_type: questionType,
        target_number: targetNumber,
        student_answer: studentAnswer,
        tens_used: tensUsed,
        ones_used: onesUsed,
        is_correct: isCorrect,
        time_taken: timeTaken,
        hints_used: hintsUsed
      });
    
    if (!error) {
      console.log('✅ Successfully logged attempt to abacus_attempts');
      return; // Success
    }
    
    console.warn('❌ abacus_attempts insert failed:', error.message);
    
    // If abacus_attempts doesn't exist, try attempts
    console.warn('abacus_attempts table not found, trying attempts...');
    const { error: fallbackError } = await supabase
      .from('attempts')
      .insert({
        session_id: sessionId,
        question_index: questionIndex,
        question_type: questionType,
        target_number: targetNumber,
        answer_number: studentAnswer,
        is_correct: isCorrect,
        time_ms: timeTaken,
        operand_a: tensUsed,
        operand_b: onesUsed
      });
    
    if (fallbackError) {
      console.warn('Could not log attempt to database:', fallbackError.message);
    } else {
      console.log('✅ Successfully logged attempt to attempts (fallback)');
    }
  } catch (error) {
    console.warn('Database connection failed during attempt logging.');
  }
}

// Log game events (moves, hints, etc.) - try abacus_events first, fallback to events
export async function logEvent({ sessionId, eventType, eventData = {} }) {
  try {
    // First try the dedicated abacus_events table
    const { error } = await supabase
      .from('abacus_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString()
        }
      });
    
    if (!error) {
      return; // Success
    }
    
    // If abacus_events doesn't exist, try events
    console.warn('abacus_events table not found, trying events...');
    const { error: fallbackError } = await supabase
      .from('events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        payload: {
          ...eventData,
          timestamp: new Date().toISOString()
        }
      });
    
    if (fallbackError) {
      console.warn('Could not log event to database:', fallbackError.message);
    }
  } catch (error) {
    console.warn('Database connection failed during event logging.');
  }
}

// Get session analytics - try abacus_game_sessions first, fallback to game_sessions
export async function getSessionAnalytics(studentId, limit = 20) {
  try {
    // First try the dedicated abacus_game_sessions table
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (!error) {
      return data;
    }
    
    // If abacus_game_sessions doesn't exist, try game_sessions
    console.warn('abacus_game_sessions table not found, trying game_sessions...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (fallbackError) throw fallbackError;
    return fallbackData;
  } catch (error) {
    console.warn('Could not fetch session analytics:', error.message);
    return [];
  }
}

// Get skill accuracy by question type - try abacus_game_sessions first, fallback to game_sessions
export async function getSkillAccuracy(studentId) {
  try {
    // First try the dedicated abacus_game_sessions table
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('game_mode, accuracy_percentage, total_questions')
      .eq('student_id', studentId);
    
    if (!error && data) {
      // Group by game mode and calculate averages
      const grouped = data.reduce((acc, session) => {
        const mode = session.game_mode;
        if (!acc[mode]) {
          acc[mode] = { total_accuracy: 0, total_sessions: 0, total_questions: 0 };
        }
        acc[mode].total_accuracy += session.accuracy_percentage || 0;
        acc[mode].total_sessions += 1;
        acc[mode].total_questions += session.total_questions || 0;
        return acc;
      }, {});
      
      return Object.entries(grouped).map(([mode, stats]) => ({
        question_type: mode,
        accuracy: stats.total_sessions > 0 ? Math.round((stats.total_accuracy / stats.total_sessions) * 100) / 100 : 0,
        total_attempts: stats.total_questions
      }));
    }
    
    // If abacus_game_sessions doesn't exist, try game_sessions
    console.warn('abacus_game_sessions table not found, trying game_sessions...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('game_sessions')
      .select('mode, meta')
      .eq('student_id', studentId);
    
    if (fallbackError) throw fallbackError;
    
    // Group by game mode and calculate averages for fallback schema
    const grouped = fallbackData.reduce((acc, session) => {
      const mode = session.mode;
      const accuracy = session.meta?.accuracy_percentage || 0;
      const questions = session.meta?.total_prompts || 0;
      
      if (!acc[mode]) {
        acc[mode] = { total_accuracy: 0, total_sessions: 0, total_questions: 0 };
      }
      acc[mode].total_accuracy += accuracy;
      acc[mode].total_sessions += 1;
      acc[mode].total_questions += questions;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([mode, stats]) => ({
      question_type: mode,
      accuracy: stats.total_sessions > 0 ? Math.round((stats.total_accuracy / stats.total_sessions) * 100) / 100 : 0,
      total_attempts: stats.total_questions
    }));
  } catch (error) {
    console.warn('Could not fetch skill accuracy:', error.message);
    return [];
  }
}

// Get detailed analytics using the analytics view - try v_abacus_analytics first, fallback to v_game_sessions
export async function getDetailedAnalytics(studentId) {
  try {
    // First try the dedicated v_abacus_analytics view
    const { data, error } = await supabase
      .from('v_abacus_analytics')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });
    
    if (!error) {
      return data;
    }
    
    // If v_abacus_analytics doesn't exist, try v_game_sessions
    console.warn('v_abacus_analytics view not found, trying v_game_sessions...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('v_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });
    
    if (fallbackError) throw fallbackError;
    return fallbackData;
  } catch (error) {
    console.warn('Could not fetch detailed analytics:', error.message);
    return [];
  }
}

// Get student progress summary - try abacus function first, fallback to basic query
export async function getStudentProgress(studentId) {
  try {
    // First try the dedicated abacus function
    const { data, error } = await supabase
      .rpc('get_abacus_student_progress', { student_id_param: studentId });
    
    if (!error) {
      return data;
    }
    
    // If function doesn't exist, try basic query
    console.warn('get_abacus_student_progress function not found, trying basic query...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('game_sessions')
      .select('mode, score, total_prompts, meta')
      .eq('student_id', studentId);
    
    if (fallbackError) throw fallbackError;
    
    // Group by mode and calculate basic stats
    const grouped = fallbackData.reduce((acc, session) => {
      const mode = session.mode;
      if (!acc[mode]) {
        acc[mode] = { total_sessions: 0, avg_accuracy: 0, best_score: 0, total_time: 0 };
      }
      acc[mode].total_sessions += 1;
      acc[mode].best_score = Math.max(acc[mode].best_score, session.score || 0);
      acc[mode].total_time += session.meta?.time_spent || 0;
      acc[mode].avg_accuracy += session.meta?.accuracy_percentage || 0;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([mode, stats]) => ({
      game_mode: mode,
      total_sessions: stats.total_sessions,
      avg_accuracy: stats.total_sessions > 0 ? stats.avg_accuracy / stats.total_sessions : 0,
      best_score: stats.best_score,
      total_time: stats.total_time
    }));
  } catch (error) {
    console.warn('Could not fetch student progress:', error.message);
    return [];
  }
}
