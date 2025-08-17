/**
 * Parent Dashboard Utilities
 * Functions to fetch and format student progress data for parent viewing
 */

import { supabase } from './supabaseClient.js';

/**
 * Get comprehensive progress summary for a student
 */
export async function getStudentProgressSummary(studentId) {
  try {
    const { data, error } = await supabase.rpc('get_student_progress_summary', {
      p_student_id: studentId
    });

    if (error) throw error;
    
    return {
      success: true,
      data: data || [],
      summary: {
        totalTopics: data?.length || 0,
        averageAccuracy: data?.length ? 
          Math.round(data.reduce((sum, topic) => sum + topic.average_accuracy, 0) / data.length) : 0,
        activeDays: data?.filter(topic => topic.last_session > new Date(Date.now() - 7*24*60*60*1000)).length || 0
      }
    };
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get detailed session history for a student
 */
export async function getSessionHistory(studentId, topicId = null, days = 30) {
  try {
    const { data, error } = await supabase.rpc('get_session_history', {
      p_student_id: studentId,
      p_topic_id: topicId,
      p_days: days
    });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      stats: {
        totalSessions: data?.length || 0,
        averageAccuracy: data?.length ? 
          Math.round(data.reduce((sum, session) => sum + session.accuracy_percentage, 0) / data.length) : 0,
        totalTimeSpent: data?.reduce((sum, session) => sum + session.time_spent, 0) || 0,
        difficultyProgression: calculateDifficultyProgression(data)
      }
    };
  } catch (error) {
    console.error('Error fetching session history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get accuracy trends for charts
 */
export async function getAccuracyTrends(studentId, topicId, days = 30) {
  try {
    const { data, error } = await supabase.rpc('get_accuracy_trends', {
      p_student_id: studentId,
      p_topic_id: topicId,
      p_days: days
    });

    if (error) throw error;

    // Format data for chart libraries
    const chartData = formatTrendsForChart(data);

    return {
      success: true,
      data: data || [],
      chartData,
      insights: generateTrendInsights(data)
    };
  } catch (error) {
    console.error('Error fetching accuracy trends:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get real-time student statistics (without database functions for compatibility)
 */
export async function getStudentStats(studentId) {
  try {
    // Get overall topic statistics
    const { data: topicStats, error: topicError } = await supabase
      .from('StudentTopicStats')
      .select(`
        *,
        Topic:topic_id (
          id,
          name
        )
      `)
      .eq('student_id', studentId);

    if (topicError) throw topicError;

    // Get recent session data
    const { data: recentSessions, error: sessionError } = await supabase
      .from('QuizSessions')
      .select('*')
      .eq('student_id', studentId)
      .gte('session_date', new Date(Date.now() - 30*24*60*60*1000).toISOString())
      .order('session_date', { ascending: false });

    if (sessionError) throw sessionError;

    // Calculate comprehensive statistics
    const stats = {
      totalTopics: topicStats?.length || 0,
      completedSessions: recentSessions?.length || 0,
      averageAccuracy: calculateAverageAccuracy(recentSessions),
      currentStreak: calculateCurrentStreak(recentSessions),
      topicProgress: formatTopicProgress(topicStats),
      recentActivity: formatRecentActivity(recentSessions),
      difficultyDistribution: calculateDifficultyDistribution(topicStats),
      improvementTrend: calculateImprovementTrend(recentSessions)
    };

    return {
      success: true,
      stats,
      topicStats: topicStats || [],
      recentSessions: recentSessions || []
    };

  } catch (error) {
    console.error('Error fetching student stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get achievement summary for motivational display
 */
export async function getAchievements(studentId) {
  try {
    const { data: sessions, error } = await supabase
      .from('QuizSessions')
      .select('*')
      .eq('student_id', studentId)
      .order('session_date', { ascending: false });

    if (error) throw error;

    const achievements = calculateAchievements(sessions);
    
    return {
      success: true,
      achievements,
      totalAchievements: achievements.length
    };

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return { success: false, error: error.message };
  }
}

// Helper Functions

function calculateDifficultyProgression(sessions) {
  if (!sessions || sessions.length === 0) return null;
  
  const difficultyLevels = { easy: 1, medium: 2, hard: 3 };
  const firstSession = sessions[sessions.length - 1];
  const lastSession = sessions[0];
  
  return {
    started: firstSession.difficulty_level,
    current: lastSession.next_difficulty || lastSession.difficulty_level,
    progressions: sessions.filter(s => s.difficulty_changed).length,
    trend: difficultyLevels[lastSession.difficulty_level] > difficultyLevels[firstSession.difficulty_level] ? 'improving' : 'stable'
  };
}

function formatTrendsForChart(data) {
  if (!data || data.length === 0) return { labels: [], datasets: [] };
  
  return {
    labels: data.map(d => d.session_date),
    datasets: [{
      label: 'Accuracy %',
      data: data.map(d => d.accuracy_percentage),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };
}

function generateTrendInsights(data) {
  if (!data || data.length < 2) return [];
  
  const insights = [];
  const recentAccuracy = data.slice(0, 3).reduce((sum, d) => sum + d.accuracy_percentage, 0) / 3;
  const olderAccuracy = data.slice(-3).reduce((sum, d) => sum + d.accuracy_percentage, 0) / 3;
  
  if (recentAccuracy > olderAccuracy + 10) {
    insights.push('📈 Accuracy is improving significantly!');
  } else if (recentAccuracy < olderAccuracy - 10) {
    insights.push('📉 May need additional support in this area');
  } else {
    insights.push('📊 Maintaining consistent performance');
  }
  
  return insights;
}

function calculateAverageAccuracy(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  return Math.round(sessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / sessions.length);
}

function calculateCurrentStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  
  let streak = 0;
  for (const session of sessions) {
    if (session.accuracy_percentage >= 80) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function formatTopicProgress(topicStats) {
  return topicStats?.map(topic => ({
    topicId: topic.topic_id,
    topicName: topic.Topic?.name || 'Unknown Topic',
    currentDifficulty: topic.current_difficulty,
    lastAccuracy: topic.last_accuracy,
    totalAttempts: topic.total_attempts,
    bestStreak: topic.best_streak,
    lastAttempted: topic.last_attempted,
    status: getTopicStatus(topic)
  })) || [];
}

function getTopicStatus(topic) {
  const daysSinceLastAttempt = Math.floor((Date.now() - new Date(topic.last_attempted)) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastAttempt > 7) return 'inactive';
  if (topic.last_accuracy >= 80) return 'mastered';
  if (topic.last_accuracy >= 60) return 'progressing';
  return 'needs_attention';
}

function formatRecentActivity(sessions) {
  return sessions?.slice(0, 10).map(session => ({
    date: session.session_date,
    topicId: session.topic_id,
    difficulty: session.difficulty_level,
    accuracy: session.accuracy_percentage,
    improved: session.difficulty_changed && session.next_difficulty !== session.difficulty_level
  })) || [];
}

function calculateDifficultyDistribution(topicStats) {
  const distribution = { easy: 0, medium: 0, hard: 0 };
  topicStats?.forEach(topic => {
    distribution[topic.current_difficulty] = (distribution[topic.current_difficulty] || 0) + 1;
  });
  return distribution;
}

function calculateImprovementTrend(sessions) {
  if (!sessions || sessions.length < 5) return 'insufficient_data';
  
  const recent = sessions.slice(0, Math.floor(sessions.length / 2));
  const older = sessions.slice(Math.floor(sessions.length / 2));
  
  const recentAvg = recent.reduce((sum, s) => sum + s.accuracy_percentage, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.accuracy_percentage, 0) / older.length;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
}

function calculateAchievements(sessions) {
  const achievements = [];
  
  if (!sessions || sessions.length === 0) return achievements;
  
  // Perfect Score Achievement
  const perfectSessions = sessions.filter(s => s.accuracy_percentage === 100);
  if (perfectSessions.length >= 1) {
    achievements.push({
      id: 'perfect_score',
      title: 'Perfect Score!',
      description: `Achieved 100% accuracy ${perfectSessions.length} time(s)`,
      icon: '🎯',
      date: perfectSessions[0].session_date
    });
  }
  
  // Consistency Achievement
  const recentSessions = sessions.slice(0, 5);
  const consistentPerformance = recentSessions.every(s => s.accuracy_percentage >= 80);
  if (recentSessions.length >= 5 && consistentPerformance) {
    achievements.push({
      id: 'consistent_excellence',
      title: 'Consistent Excellence',
      description: 'Maintained 80%+ accuracy for 5 sessions',
      icon: '⭐',
      date: recentSessions[0].session_date
    });
  }
  
  // Difficulty Progression Achievement
  const progressions = sessions.filter(s => s.difficulty_changed);
  if (progressions.length >= 1) {
    achievements.push({
      id: 'level_up',
      title: 'Level Up!',
      description: `Advanced difficulty level ${progressions.length} time(s)`,
      icon: '🚀',
      date: progressions[0].session_date
    });
  }
  
  // Dedication Achievement
  const uniqueDays = new Set(sessions.map(s => s.session_date.split('T')[0])).size;
  if (uniqueDays >= 7) {
    achievements.push({
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: `Practiced on ${uniqueDays} different days`,
      icon: '📚',
      date: sessions[0].session_date
    });
  }
  
  return achievements;
}

export default {
  getStudentProgressSummary,
  getSessionHistory,
  getAccuracyTrends,
  getStudentStats,
  getAchievements
};
