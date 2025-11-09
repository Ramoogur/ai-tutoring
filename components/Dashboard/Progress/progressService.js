import { supabase } from '../../../utils/supabaseClient.js';
import OpenAI from 'openai';

/**
 * Fetches dynamic progress data for a student from Supabase database
 * @param {number} studentId - The student's ID
 * @returns {Object} Progress data formatted for MathJourney component
 */
export const getStudentProgressData = async (studentId) => {
  try {
    // Fetch all topics
    const { data: topics, error: topicsError } = await supabase
      .from('Topic')
      .select('id, name');

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return {};
    }

    // Fetch student's topic stats
    const { data: stats, error: statsError } = await supabase
      .from('StudentTopicStats')
      .select('topic_id, total_attempts, correct_answers, total_questions, current_difficulty, last_accuracy')
      .eq('student_id', studentId);

    if (statsError) {
      console.error('Error fetching student stats:', statsError);
      return {};
    }

    // Create a map of topic stats by topic_id
    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat.topic_id] = stat;
    });

    // Format progress data for each topic
    const progressData = {};
    
    topics.forEach(topic => {
      const stat = statsMap[topic.id];
      
      if (stat && stat.total_attempts > 0) {
        // Calculate completion based on attempts and accuracy
        const accuracy = stat.total_questions > 0 ? Math.round((stat.correct_answers / stat.total_questions) * 100) : 0;
        
        // Estimate completion based on attempts and current difficulty
        let estimatedTotal = 15; // Base assumption: 15 questions per topic mastery
        let completed = Math.min(stat.total_attempts, estimatedTotal);
        
        // Adjust completion based on accuracy and difficulty
        if (stat.current_difficulty === 'hard' && accuracy >= 80) {
          completed = Math.min(estimatedTotal, stat.total_attempts);
        } else if (stat.current_difficulty === 'medium' && accuracy >= 70) {
          completed = Math.min(Math.floor(estimatedTotal * 0.7), stat.total_attempts);
        } else if (stat.current_difficulty === 'easy') {
          completed = Math.min(Math.floor(estimatedTotal * 0.4), stat.total_attempts);
        }

        progressData[topic.name] = {
          completed: completed,
          total: estimatedTotal,
          percent: Math.round((completed / estimatedTotal) * 100)
        };
      } else {
        // No attempts yet
        progressData[topic.name] = {
          completed: 0,
          total: 15,
          percent: 0
        };
      }
    });

    return progressData;

  } catch (error) {
    console.error('Error in getStudentProgressData:', error);
    return {};
  }
};

/**
 * Gets detailed session history for a student
 * @param {number} studentId - The student's ID
 * @param {number} limit - Number of recent sessions to fetch
 * @returns {Array} Array of recent quiz sessions
 */
export const getRecentSessions = async (studentId, limit = 10) => {
  try {
    const { data: sessions, error } = await supabase
      .from('QuizSessions')
      .select(`
        id,
        topic_id,
        session_date,
        difficulty_level,
        questions_attempted,
        correct_answers,
        accuracy_percentage,
        time_spent,
        Topic (name)
      `)
      .eq('student_id', studentId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent sessions:', error);
      return [];
    }

    return sessions || [];
  } catch (error) {
    console.error('Error in getRecentSessions:', error);
    return [];
  }
};

/**
 * Gets child-friendly learning insights
 * @param {number} studentId - The student's ID
 * @returns {Object} Child-focused learning data
 */
export const getChildLearningInsights = async (studentId) => {
  try {
    // Get topic stats first
    const { data: stats, error: statsError } = await supabase
      .from('StudentTopicStats')
      .select('topic_id, total_attempts, correct_answers, total_questions, last_accuracy, best_streak, current_difficulty')
      .eq('student_id', studentId);

    if (statsError) {
      console.error('Error fetching student stats:', statsError);
      return { goodAt: [], practiceNext: [], todaysLearning: [] };
    }

    // Get all topics separately
    const { data: topics, error: topicsError } = await supabase
      .from('Topic')
      .select('id, name');

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return { goodAt: [], practiceNext: [], todaysLearning: [] };
    }

    // Create a map of topics by ID
    const topicsMap = {};
    topics?.forEach(topic => {
      topicsMap[topic.id] = topic.name;
    });

    // Get today's sessions
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions, error: sessionsError } = await supabase
      .from('QuizSessions')
      .select('topic_id, correct_answers, questions_attempted, accuracy_percentage, session_date')
      .eq('student_id', studentId)
      .gte('session_date', today)
      .order('session_date', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching today sessions:', sessionsError);
    }

    // Process data for child-friendly insights
    const goodAt = [];
    const practiceNext = [];

    stats?.forEach(stat => {
      const accuracy = stat.last_accuracy || 0;
      const topicName = topicsMap[stat.topic_id] || 'Unknown Topic';
      
      if (accuracy >= 80) {
        goodAt.push({
          topic: topicName,
          accuracy: Math.round(accuracy),
          streak: stat.best_streak || 0,
          attempts: stat.total_attempts || 0
        });
      } else if (accuracy < 60 && stat.total_attempts > 0) {
        practiceNext.push({
          topic: topicName,
          accuracy: Math.round(accuracy),
          attempts: stat.total_attempts || 0,
          needsWork: true
        });
      }
    });

    // Process today's learning
    const todaysLearning = todaySessions?.map(session => ({
      topic: topicsMap[session.topic_id] || 'Unknown Topic',
      correct: session.correct_answers || 0,
      total: session.questions_attempted || 0,
      accuracy: Math.round(session.accuracy_percentage || 0),
      time: new Date(session.session_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    })) || [];

    return {
      goodAt: goodAt.slice(0, 3), // Top 3 strengths
      practiceNext: practiceNext.slice(0, 2), // Top 2 to practice
      todaysLearning: todaysLearning.slice(0, 5) // Last 5 today's sessions
    };

  } catch (error) {
    console.error('Error fetching learning insights:', error);
    return { goodAt: [], practiceNext: [], todaysLearning: [] };
  }
};

// Initialize OpenAI client
let openaiClient = null;

const initializeOpenAI = () => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. AI feedback will be disabled.');
      return null;
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('✅ OpenAI initialized for progress feedback');
    return openaiClient;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error);
    return null;
  }
};

/**
 * Generate AI-powered personalized feedback for student performance
 * @param {Object} topicData - Topic performance data
 * @param {string} feedbackType - Type of feedback: 'strength' or 'practice'
 * @returns {Promise<string>} AI-generated feedback message
 */
export const generateAIFeedback = async (topicData, feedbackType = 'strength') => {
  if (!openaiClient) {
    openaiClient = initializeOpenAI();
  }
  
  if (!openaiClient) {
    // Fallback to static messages if OpenAI is not available
    return getFallbackFeedback(topicData, feedbackType);
  }

  try {
    const prompt = buildFeedbackPrompt(topicData, feedbackType);
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly AI tutor for Grade 1 students. Generate encouraging, child-friendly feedback about their math progress. Keep responses short (1-2 sentences), positive, and age-appropriate. Use simple words and include emojis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const feedback = response.choices[0].message.content.trim();
    console.log(`🤖 Generated AI feedback for ${topicData.topic}:`, feedback);
    return feedback;

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return getFallbackFeedback(topicData, feedbackType);
  }
};

/**
 * Build prompt for AI feedback generation
 */
const buildFeedbackPrompt = (topicData, feedbackType) => {
  const { topic, accuracy, attempts, streak } = topicData;
  
  if (feedbackType === 'strength') {
    return `A Grade 1 student is doing great at ${topic} with ${accuracy}% accuracy after ${attempts} attempts and a best streak of ${streak}. Write an encouraging message celebrating their strength in this topic. Keep it short and child-friendly with emojis.`;
  } else {
    return `A Grade 1 student needs practice with ${topic}. They have ${accuracy}% accuracy after ${attempts} attempts. Write an encouraging message that motivates them to keep practicing this topic. Keep it short, positive, and child-friendly with emojis.`;
  }
};

/**
 * Fallback feedback when AI is not available
 */
const getFallbackFeedback = (topicData, feedbackType) => {
  const { topic, accuracy } = topicData;
  
  const strengthMessages = [
    `You're amazing at ${topic}! Keep up the great work! ⭐`,
    `${topic} is your superpower! You're doing fantastic! 🌟`,
    `Wow! You're a ${topic} champion! 🏆`,
  ];
  
  const practiceMessages = [
    `Let's practice ${topic} together! You're getting better! 💪`,
    `${topic} is fun to learn! Keep trying, you've got this! 🎯`,
    `Every practice makes you stronger at ${topic}! 🚀`,
  ];
  
  const messages = feedbackType === 'strength' ? strengthMessages : practiceMessages;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Gets overall student statistics
 * @param {number} studentId - The student's ID
 * @returns {Object} Overall stats including total accuracy, completion rate, etc.
 */
export const getOverallStats = async (studentId) => {
  try {
    // Get aggregated stats across all topics
    const { data: stats, error } = await supabase
      .from('StudentTopicStats')
      .select('total_attempts, correct_answers, total_questions')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching overall stats:', error);
      return { totalAttempts: 0, overallAccuracy: 0, topicsStarted: 0 };
    }

    if (!stats || stats.length === 0) {
      return { totalAttempts: 0, overallAccuracy: 0, topicsStarted: 0 };
    }

    // Calculate totals
    const totalAttempts = stats.reduce((sum, stat) => sum + (stat.total_attempts || 0), 0);
    const totalCorrect = stats.reduce((sum, stat) => sum + (stat.correct_answers || 0), 0);
    const totalQuestions = stats.reduce((sum, stat) => sum + (stat.total_questions || 0), 0);
    const topicsStarted = stats.filter(stat => stat.total_attempts > 0).length;

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalAttempts,
      overallAccuracy,
      topicsStarted
    };

  } catch (error) {
    console.error('Error in getOverallStats:', error);
    return { totalAttempts: 0, overallAccuracy: 0, topicsStarted: 0 };
  }
};
