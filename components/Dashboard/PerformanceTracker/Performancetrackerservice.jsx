/**
 * Performance Tracker Service
 * Fetches and analyzes student performance data from Quiz, Abacus, and Matching games
 * Uses OpenAI API for AI-powered insights and recommendations
 */

import { supabase } from '../../../utils/supabaseClient.js';
import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient = null;

const initializeOpenAI = () => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. AI analysis will be disabled.');
      return null;
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    console.log('✅ OpenAI initialized for Performance Tracker');
    return openaiClient;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error);
    return null;
  }
};

/**
 * Fetch comprehensive performance data for a student
 * @param {number} studentId - Student ID
 * @returns {Object} Complete performance data
 */
export const fetchStudentPerformance = async (studentId) => {
  try {
    console.log('📊 Fetching performance data for student:', studentId);

    // Fetch all topics
    const { data: topics, error: topicsError } = await supabase
      .from('Topic')
      .select('id, name')
      .order('id');

    if (topicsError) throw topicsError;

    // Create topic map for easy lookup
    const topicMap = {};
    topics.forEach(topic => {
      topicMap[topic.id] = topic.name;
    });

    // 1. Fetch Quiz Performance
    const quizData = await fetchQuizPerformance(studentId, topicMap);

    // 2. Fetch Abacus Performance
    const abacusData = await fetchAbacusPerformance(studentId);

    // 3. Fetch Matching Game Performance
    const matchingData = await fetchMatchingPerformance(studentId, topicMap);

    // 4. Fetch Student Topic Stats (overall)
    const topicStats = await fetchTopicStats(studentId, topicMap);

    // 5. Calculate overall statistics
    const overallStats = calculateOverallStats(quizData, abacusData, matchingData);

    // 6. Generate AI-powered insights
    const aiInsights = await generateAIInsights({
      studentId,
      quizData,
      abacusData,
      matchingData,
      topicStats,
      overallStats
    });

    return {
      success: true,
      data: {
        topics: topicMap,
        quiz: quizData,
        abacus: abacusData,
        matching: matchingData,
        topicStats: topicStats,
        overall: overallStats,
        aiInsights: aiInsights
      }
    };

  } catch (error) {
    console.error('❌ Error fetching student performance:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch Quiz Performance Data
 */
const fetchQuizPerformance = async (studentId, topicMap) => {
  try {
    const { data: sessions, error } = await supabase
      .from('QuizSessions')
      .select('*')
      .eq('student_id', studentId)
      .order('session_date', { ascending: false });

    if (error) throw error;

    // Calculate quiz statistics
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions_attempted || 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
    const averageAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Group by topic
    const byTopic = {};
    sessions.forEach(session => {
      const topicName = topicMap[session.topic_id] || 'Unknown';
      if (!byTopic[topicName]) {
        byTopic[topicName] = {
          sessions: 0,
          questions: 0,
          correct: 0,
          accuracy: 0
        };
      }
      byTopic[topicName].sessions++;
      byTopic[topicName].questions += session.questions_attempted || 0;
      byTopic[topicName].correct += session.correct_answers || 0;
    });

    // Calculate accuracy for each topic
    Object.keys(byTopic).forEach(topic => {
      byTopic[topic].accuracy = byTopic[topic].questions > 0 
        ? (byTopic[topic].correct / byTopic[topic].questions) * 100 
        : 0;
    });

    // Recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10).map(s => {
      const sessionDate = new Date(s.session_date);
      return {
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: topicMap[s.topic_id] || 'Unknown',
        accuracy: s.accuracy_percentage || 0,
        difficulty: s.difficulty_level || 'easy'
      };
    });

    return {
      totalSessions,
      totalQuestions,
      correctAnswers,
      averageAccuracy: Math.round(averageAccuracy),
      byTopic,
      recentSessions
    };

  } catch (error) {
    console.error('Error fetching quiz performance:', error);
    return {
      totalSessions: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageAccuracy: 0,
      byTopic: {},
      recentSessions: []
    };
  }
};

/**
 * Fetch Abacus Game Performance Data
 */
const fetchAbacusPerformance = async (studentId) => {
  try {
    const { data: sessions, error } = await supabase
      .from('abacus_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    // Calculate abacus statistics
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
    const averageAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / (sessions.length || 1);
    const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.total_time_spent || 0), 0);
    const bestStreak = Math.max(...sessions.map(s => s.best_streak || 0), 0);

    // Group by game mode
    const byMode = {};
    sessions.forEach(session => {
      const mode = session.game_mode || 'unknown';
      if (!byMode[mode]) {
        byMode[mode] = {
          sessions: 0,
          questions: 0,
          correct: 0,
          accuracy: 0
        };
      }
      byMode[mode].sessions++;
      byMode[mode].questions += session.total_questions || 0;
      byMode[mode].correct += session.correct_answers || 0;
    });

    // Calculate accuracy for each mode
    Object.keys(byMode).forEach(mode => {
      byMode[mode].accuracy = byMode[mode].questions > 0 
        ? (byMode[mode].correct / byMode[mode].questions) * 100 
        : 0;
    });

    // Recent sessions
    const recentSessions = sessions.slice(0, 10).map(s => {
      const sessionDate = new Date(s.started_at);
      return {
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: s.game_mode || 'unknown',
        accuracy: s.accuracy_percentage || 0,
        score: s.total_score || 0
      };
    });

    return {
      totalSessions,
      totalQuestions,
      correctAnswers,
      averageAccuracy: Math.round(averageAccuracy),
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      bestStreak,
      byMode,
      recentSessions
    };

  } catch (error) {
    console.error('Error fetching abacus performance:', error);
    return {
      totalSessions: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageAccuracy: 0,
      totalTimeSpent: 0,
      bestStreak: 0,
      byMode: {},
      recentSessions: []
    };
  }
};

/**
 * Fetch Matching Game Performance Data
 */
const fetchMatchingPerformance = async (studentId, topicMap) => {
  try {
    const { data: sessions, error } = await supabase
      .from('matching_game_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    // Calculate matching statistics
    const totalSessions = sessions.length;
    const totalMatches = sessions.reduce((sum, s) => sum + (s.correct_matches || 0), 0);
    const incorrectAttempts = sessions.reduce((sum, s) => sum + (s.incorrect_attempts || 0), 0);
    const averageAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / (sessions.length || 1);
    const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.total_time_spent || 0), 0);

    // Group by topic
    const byTopic = {};
    sessions.forEach(session => {
      const topicName = topicMap[session.topic_id] || 'Unknown';
      if (!byTopic[topicName]) {
        byTopic[topicName] = {
          sessions: 0,
          matches: 0,
          incorrect: 0,
          accuracy: 0
        };
      }
      byTopic[topicName].sessions++;
      byTopic[topicName].matches += session.correct_matches || 0;
      byTopic[topicName].incorrect += session.incorrect_attempts || 0;
    });

    // Calculate accuracy for each topic
    Object.keys(byTopic).forEach(topic => {
      const totalAttempts = byTopic[topic].matches + byTopic[topic].incorrect;
      byTopic[topic].accuracy = totalAttempts > 0 
        ? (byTopic[topic].matches / totalAttempts) * 100 
        : 0;
    });

    // Recent sessions
    const recentSessions = sessions.slice(0, 10).map(s => {
      const sessionDate = new Date(s.started_at);
      return {
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: topicMap[s.topic_id] || 'Unknown',
        accuracy: s.accuracy_percentage || 0,
        matches: s.correct_matches || 0
      };
    });

    return {
      totalSessions,
      totalMatches,
      incorrectAttempts,
      averageAccuracy: Math.round(averageAccuracy),
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      byTopic,
      recentSessions
    };

  } catch (error) {
    console.error('Error fetching matching performance:', error);
    return {
      totalSessions: 0,
      totalMatches: 0,
      incorrectAttempts: 0,
      averageAccuracy: 0,
      totalTimeSpent: 0,
      byTopic: {},
      recentSessions: []
    };
  }
};

/**
 * Fetch Topic-level Statistics
 */
const fetchTopicStats = async (studentId, topicMap) => {
  try {
    const { data: stats, error } = await supabase
      .from('StudentTopicStats')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    const topicStats = {};
    
    stats.forEach(stat => {
      const topicName = topicMap[stat.topic_id] || 'Unknown';
      topicStats[topicName] = {
        totalAttempts: stat.total_attempts || 0,
        correctAnswers: stat.correct_answers || 0,
        totalQuestions: stat.total_questions || 0,
        currentDifficulty: stat.current_difficulty || 'easy',
        lastAccuracy: stat.last_accuracy || 0,
        bestStreak: stat.best_streak || 0,
        aiPerformance: stat.ai_performance || 0
      };
    });

    return topicStats;

  } catch (error) {
    console.error('Error fetching topic stats:', error);
    return {};
  }
};

/**
 * Calculate Overall Statistics
 */
const calculateOverallStats = (quizData, abacusData, matchingData) => {
  const totalSessions = quizData.totalSessions + abacusData.totalSessions + matchingData.totalSessions;
  const totalTimeMinutes = quizData.totalQuestions * 0.5 + abacusData.totalTimeSpent + matchingData.totalTimeSpent; // Estimate for quiz
  
  // Calculate weighted average accuracy
  const quizWeight = quizData.totalSessions || 0;
  const abacusWeight = abacusData.totalSessions || 0;
  const matchingWeight = matchingData.totalSessions || 0;
  const totalWeight = quizWeight + abacusWeight + matchingWeight || 1;

  const averageAccuracy = Math.round(
    (quizData.averageAccuracy * quizWeight + 
     abacusData.averageAccuracy * abacusWeight + 
     matchingData.averageAccuracy * matchingWeight) / totalWeight
  );

  return {
    totalSessions,
    totalTimeMinutes: Math.round(totalTimeMinutes),
    averageAccuracy,
    bestStreak: Math.max(abacusData.bestStreak, 0),
    activities: {
      quiz: quizData.totalSessions,
      abacus: abacusData.totalSessions,
      matching: matchingData.totalSessions
    }
  };
};

/**
 * Generate AI-powered insights using OpenAI
 */
const generateAIInsights = async (performanceData) => {
  try {
    // Initialize OpenAI if not already done
    if (!openaiClient) {
      openaiClient = initializeOpenAI();
    }

    // If OpenAI is not available, return fallback insights
    if (!openaiClient) {
      return generateFallbackInsights(performanceData);
    }

    const { quizData, abacusData, matchingData, topicStats, overallStats } = performanceData;

    // Prepare data summary for AI
    const dataSummary = `
Student Performance Summary:

OVERALL STATS:
- Total Sessions: ${overallStats.totalSessions}
- Average Accuracy: ${overallStats.averageAccuracy}%
- Total Time Spent: ${overallStats.totalTimeMinutes} minutes
- Best Streak: ${overallStats.bestStreak}

QUIZ PERFORMANCE:
- Sessions: ${quizData.totalSessions}
- Questions Answered: ${quizData.totalQuestions}
- Accuracy: ${quizData.averageAccuracy}%
- Topics: ${Object.keys(quizData.byTopic).map(topic => 
  `${topic} (${Math.round(quizData.byTopic[topic].accuracy)}%)`).join(', ')}

ABACUS PERFORMANCE:
- Sessions: ${abacusData.totalSessions}
- Questions: ${abacusData.totalQuestions}
- Accuracy: ${abacusData.averageAccuracy}%
- Best Streak: ${abacusData.bestStreak}
- Game Modes: ${Object.keys(abacusData.byMode).map(mode => 
  `${mode} (${Math.round(abacusData.byMode[mode].accuracy)}%)`).join(', ')}

MATCHING GAME PERFORMANCE:
- Sessions: ${matchingData.totalSessions}
- Correct Matches: ${matchingData.totalMatches}
- Accuracy: ${matchingData.averageAccuracy}%
- Topics: ${Object.keys(matchingData.byTopic).map(topic => 
  `${topic} (${Math.round(matchingData.byTopic[topic].accuracy)}%)`).join(', ')}

TOPIC STATS:
${Object.keys(topicStats).map(topic => 
  `- ${topic}: ${topicStats[topic].totalAttempts} attempts, ${Math.round(topicStats[topic].lastAccuracy)}% accuracy, ${topicStats[topic].currentDifficulty} difficulty`
).join('\n')}
`;

    // Call OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a friendly AI tutor analyzing performance data for a Grade 1 student (age 6-7). 
Your task is to provide:
1. A warm, encouraging summary (2-3 sentences, child-friendly language)
2. 3-4 strengths the student is showing (specific topics or skills)
3. 2-3 areas where the student can improve (specific, actionable)
4. 2-3 personalized recommendations for the teacher/parent (specific activities)

Keep language simple, positive, and encouraging. Use emojis appropriately. Focus on growth mindset.

Respond in JSON format:
{
  "summary": "warm encouraging summary here",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`
        },
        {
          role: 'user',
          content: dataSummary
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    
    // Parse JSON response (handle markdown code blocks)
    let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiInsights = JSON.parse(cleanedContent);

    console.log('✅ AI Insights generated successfully');
    return aiInsights;

  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    return generateFallbackInsights(performanceData);
  }
};

/**
 * Generate fallback insights when AI is not available
 */
const generateFallbackInsights = (performanceData) => {
  const { quizData, abacusData, matchingData, overallStats } = performanceData;

  // Find strongest topics
  const strengths = [];
  
  // Check quiz topics
  Object.keys(quizData.byTopic).forEach(topic => {
    if (quizData.byTopic[topic].accuracy >= 80) {
      strengths.push(`${topic} (${Math.round(quizData.byTopic[topic].accuracy)}% accuracy) 🌟`);
    }
  });

  // Check abacus modes
  Object.keys(abacusData.byMode).forEach(mode => {
    if (abacusData.byMode[mode].accuracy >= 80) {
      strengths.push(`Abacus ${mode} mode (${Math.round(abacusData.byMode[mode].accuracy)}% accuracy) 🧮`);
    }
  });

  // Find areas to improve
  const areasToImprove = [];
  
  // Check quiz topics
  Object.keys(quizData.byTopic).forEach(topic => {
    if (quizData.byTopic[topic].accuracy < 60 && quizData.byTopic[topic].sessions > 0) {
      areasToImprove.push(`${topic} - Practice more to improve accuracy`);
    }
  });

  // Check matching topics
  Object.keys(matchingData.byTopic).forEach(topic => {
    if (matchingData.byTopic[topic].accuracy < 60 && matchingData.byTopic[topic].sessions > 0) {
      areasToImprove.push(`Matching: ${topic} - Try the matching game for this topic`);
    }
  });

  // Generate recommendations
  const recommendations = [
    `Practice ${overallStats.activities.quiz < 5 ? 'more quizzes' : 'challenging topics'} to build confidence 📚`,
    `The Abacus game helps with number sense - try it ${abacusData.totalSessions < 3 ? 'more often' : 'at higher levels'}! 🧮`,
    `Matching games make learning fun - ${matchingData.totalSessions < 3 ? 'give them a try' : 'keep up the great work'}! 🎮`
  ];

  return {
    summary: overallStats.averageAccuracy >= 80 
      ? `Amazing work! You're doing fantastic in math and showing great progress across all activities! 🌟✨` 
      : overallStats.averageAccuracy >= 60
      ? `Great effort! You're learning well and improving. Keep practicing and you'll master everything! 🌟`
      : `You're working hard and that's wonderful! With more practice, you'll see amazing improvements! Keep going! 💪`,
    strengths: strengths.length > 0 ? strengths.slice(0, 3) : ['Showing great effort in learning! 🌟', 'Participating in activities regularly 📚', 'Making progress every day! 🚀'],
    areasToImprove: areasToImprove.length > 0 ? areasToImprove.slice(0, 2) : ['Keep practicing all topics to build confidence', 'Try different game modes for variety'],
    recommendations: recommendations
  };
};

export default {
  fetchStudentPerformance,
  generateAIInsights
};