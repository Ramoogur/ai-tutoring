/**
 * Abacus Game Database Service
 * Handles all database operations for the Abacus game
 * Tables: abacus_game_sessions, abacus_attempts, abacus_events
 */

import { supabase } from '../../../utils/supabaseClient';

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Start a new abacus game session
 * @param {number} studentId - The ID of the student
 * @param {string} gameMode - Game mode: 'free', 'count', 'make', 'add', 'sub'
 * @param {number|null} targetNumber - Target number for the game (null for free mode)
 * @param {number} level - Difficulty level (1-5)
 * @returns {Promise<Object>} Created session object
 */
export async function startSession(studentId, gameMode = 'free', targetNumber = null, level = 1) {
  try {
    console.log('🎮 Starting new abacus session:', { studentId, gameMode, targetNumber, level });
    
    // Validate inputs
    if (!studentId || studentId <= 0) {
      throw new Error('Invalid student ID');
    }
    
    const validModes = ['free', 'count', 'make', 'add', 'sub'];
    if (!validModes.includes(gameMode)) {
      throw new Error(`Invalid game mode. Must be one of: ${validModes.join(', ')}`);
    }
    
    if (level < 1 || level > 5) {
      throw new Error('Level must be between 1 and 5');
    }
    
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .insert([
        {
          student_id: studentId,
          game_mode: gameMode,
          target_number: targetNumber,
          level: level,
          started_at: new Date().toISOString(),
          total_score: 0,
          total_questions: 0,
          correct_answers: 0,
          accuracy_percentage: 0,
          total_time_spent: 0,
          best_streak: 0
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error starting session:', error);
      throw error;
    }
    
    console.log('✅ Session started successfully:', data);
    
    // Log session start event
    await logEvent(data.id, 'session_started', {
      gameMode,
      targetNumber,
      level
    });
    
    return data;
  } catch (error) {
    console.error('❌ Failed to start session:', error);
    throw error;
  }
}

/**
 * End an abacus game session
 * @param {string} sessionId - UUID of the session
 * @param {Object} sessionStats - Final session statistics
 * @returns {Promise<Object>} Updated session object
 */
export async function endSession(sessionId, sessionStats = {}) {
  try {
    console.log('🏁 Ending abacus session:', sessionId, sessionStats);
    
    if (!sessionId) {
      throw new Error('Invalid session ID');
    }
    
    const updateData = {
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add provided stats
    if (sessionStats.totalScore !== undefined) {
      updateData.total_score = sessionStats.totalScore;
    }
    if (sessionStats.totalQuestions !== undefined) {
      updateData.total_questions = sessionStats.totalQuestions;
    }
    if (sessionStats.correctAnswers !== undefined) {
      updateData.correct_answers = sessionStats.correctAnswers;
    }
    if (sessionStats.timeSpent !== undefined) {
      updateData.total_time_spent = sessionStats.timeSpent;
    }
    if (sessionStats.bestStreak !== undefined) {
      updateData.best_streak = sessionStats.bestStreak;
    }
    
    // Calculate accuracy if we have the data
    if (updateData.total_questions > 0) {
      updateData.accuracy_percentage = 
        ((updateData.correct_answers / updateData.total_questions) * 100).toFixed(2);
    }
    
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error ending session:', error);
      throw error;
    }
    
    console.log('✅ Session ended successfully:', data);
    
    // Log session end event
    await logEvent(sessionId, 'session_ended', sessionStats);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to end session:', error);
    throw error;
  }
}

/**
 * Update session statistics in real-time
 * @param {string} sessionId - UUID of the session
 * @param {Object} updates - Statistics to update
 * @returns {Promise<Object>} Updated session object
 */
export async function updateSessionStats(sessionId, updates) {
  try {
    if (!sessionId) {
      throw new Error('Invalid session ID');
    }
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Calculate accuracy if we have the data
    if (updates.total_questions > 0 && updates.correct_answers !== undefined) {
      updateData.accuracy_percentage = 
        ((updates.correct_answers / updates.total_questions) * 100).toFixed(2);
    }
    
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('❌ Failed to update session stats:', error);
    throw error;
  }
}

/**
 * Get session details
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Object>} Session object
 */
export async function getSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Failed to get session:', error);
    throw error;
  }
}

/**
 * Get student's session history
 * @param {number} studentId - The ID of the student
 * @param {number} limit - Number of sessions to retrieve
 * @returns {Promise<Array>} Array of session objects
 */
export async function getStudentSessions(studentId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Failed to get student sessions:', error);
    return [];
  }
}

// ============================================
// ATTEMPT MANAGEMENT
// ============================================

/**
 * Log a question attempt
 * @param {Object} attemptData - Attempt details
 * @returns {Promise<Object>} Created attempt object
 */
export async function logAttempt(attemptData) {
  try {
    const {
      sessionId,
      questionIndex,
      questionType,
      targetNumber,
      studentAnswer,
      tensUsed = 0,
      onesUsed = 0,
      isCorrect,
      timeTaken = 0,
      hintsUsed = 0
    } = attemptData;
    
    console.log('📝 Logging attempt:', attemptData);
    
    // Validate required fields
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    if (questionIndex === undefined) {
      throw new Error('Question index is required');
    }
    
    const validTypes = ['count', 'add', 'sub', 'make'];
    if (!validTypes.includes(questionType)) {
      throw new Error(`Invalid question type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (isCorrect === undefined || isCorrect === null) {
      throw new Error('isCorrect field is required');
    }
    
    const { data, error } = await supabase
      .from('abacus_attempts')
      .insert([
        {
          session_id: sessionId,
          question_index: questionIndex,
          question_type: questionType,
          target_number: targetNumber,
          student_answer: studentAnswer,
          tens_used: tensUsed,
          ones_used: onesUsed,
          is_correct: isCorrect,
          time_taken: timeTaken,
          hints_used: hintsUsed,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error logging attempt:', error);
      throw error;
    }
    
    console.log('✅ Attempt logged successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to log attempt:', error);
    throw error;
  }
}

/**
 * Get all attempts for a session
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Array>} Array of attempt objects
 */
export async function getSessionAttempts(sessionId) {
  try {
    const { data, error } = await supabase
      .from('abacus_attempts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Failed to get session attempts:', error);
    return [];
  }
}

/**
 * Get student's attempt history
 * @param {number} studentId - The ID of the student
 * @param {number} limit - Number of attempts to retrieve
 * @returns {Promise<Array>} Array of attempt objects with session info
 */
export async function getStudentAttempts(studentId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('abacus_attempts')
      .select(`
        *,
        abacus_game_sessions!inner(student_id, game_mode, level)
      `)
      .eq('abacus_game_sessions.student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Failed to get student attempts:', error);
    return [];
  }
}

// ============================================
// EVENT LOGGING
// ============================================

/**
 * Log a game event
 * @param {string} sessionId - UUID of the session
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event details
 * @returns {Promise<Object>} Created event object
 */
export async function logEvent(sessionId, eventType, eventData = {}) {
  try {
    if (!sessionId) {
      console.warn('⚠️ Cannot log event without session ID');
      return null;
    }
    
    if (!eventType) {
      throw new Error('Event type is required');
    }
    
    const { data, error } = await supabase
      .from('abacus_events')
      .insert([
        {
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error logging event:', error);
      // Don't throw - event logging should not break the game
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to log event:', error);
    return null;
  }
}

/**
 * Get all events for a session
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Array>} Array of event objects
 */
export async function getSessionEvents(sessionId) {
  try {
    const { data, error } = await supabase
      .from('abacus_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Failed to get session events:', error);
    return [];
  }
}

// ============================================
// ANALYTICS & STATISTICS
// ============================================

/**
 * Get student's performance statistics
 * @param {number} studentId - The ID of the student
 * @returns {Promise<Object>} Performance statistics
 */
export async function getStudentStats(studentId) {
  try {
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .not('ended_at', 'is', null); // Only completed sessions
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageAccuracy: 0,
        bestStreak: 0,
        totalScore: 0,
        averageScore: 0,
        totalTimePlayed: 0,
        favoriteMode: null
      };
    }
    
    // Calculate statistics
    const totalSessions = data.length;
    const totalQuestions = data.reduce((sum, s) => sum + (s.total_questions || 0), 0);
    const totalCorrect = data.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
    const totalScore = data.reduce((sum, s) => sum + (s.total_score || 0), 0);
    const totalTimePlayed = data.reduce((sum, s) => sum + (s.total_time_spent || 0), 0);
    const bestStreak = Math.max(...data.map(s => s.best_streak || 0));
    
    // Calculate average accuracy
    const accuracies = data.filter(s => s.accuracy_percentage > 0).map(s => s.accuracy_percentage);
    const averageAccuracy = accuracies.length > 0 
      ? (accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length).toFixed(2)
      : 0;
    
    // Find favorite game mode
    const modeCounts = data.reduce((acc, s) => {
      acc[s.game_mode] = (acc[s.game_mode] || 0) + 1;
      return acc;
    }, {});
    const favoriteMode = Object.keys(modeCounts).reduce((a, b) => 
      modeCounts[a] > modeCounts[b] ? a : b
    );
    
    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      averageAccuracy: parseFloat(averageAccuracy),
      bestStreak,
      totalScore,
      averageScore: totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0,
      totalTimePlayed,
      favoriteMode
    };
  } catch (error) {
    console.error('❌ Failed to get student stats:', error);
    return {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      totalScore: 0,
      averageScore: 0,
      totalTimePlayed: 0,
      favoriteMode: null
    };
  }
}

/**
 * Get performance by game mode
 * @param {number} studentId - The ID of the student
 * @returns {Promise<Object>} Performance by mode
 */
export async function getPerformanceByMode(studentId) {
  try {
    const { data, error } = await supabase
      .from('abacus_game_sessions')
      .select('game_mode, accuracy_percentage, total_score, total_questions')
      .eq('student_id', studentId)
      .not('ended_at', 'is', null);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {};
    }
    
    // Group by game mode
    const grouped = data.reduce((acc, session) => {
      const mode = session.game_mode;
      if (!acc[mode]) {
        acc[mode] = {
          sessions: 0,
          totalQuestions: 0,
          totalScore: 0,
          accuracies: []
        };
      }
      acc[mode].sessions++;
      acc[mode].totalQuestions += session.total_questions || 0;
      acc[mode].totalScore += session.total_score || 0;
      if (session.accuracy_percentage > 0) {
        acc[mode].accuracies.push(session.accuracy_percentage);
      }
      return acc;
    }, {});
    
    // Calculate averages
    Object.keys(grouped).forEach(mode => {
      const modeData = grouped[mode];
      modeData.averageAccuracy = modeData.accuracies.length > 0
        ? (modeData.accuracies.reduce((sum, a) => sum + a, 0) / modeData.accuracies.length).toFixed(2)
        : 0;
      modeData.averageScore = modeData.sessions > 0
        ? Math.round(modeData.totalScore / modeData.sessions)
        : 0;
      delete modeData.accuracies; // Remove temporary array
    });
    
    return grouped;
  } catch (error) {
    console.error('❌ Failed to get performance by mode:', error);
    return {};
  }
}

export default {
  startSession,
  endSession,
  updateSessionStats,
  getSession,
  getStudentSessions,
  logAttempt,
  getSessionAttempts,
  getStudentAttempts,
  logEvent,
  getSessionEvents,
  getStudentStats,
  getPerformanceByMode
};