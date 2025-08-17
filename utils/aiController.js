/**
 * AI Controller - Orchestrates AI-powered learning experience
 * Integrates AI tutor with quiz components for adaptive learning
 */

import { aiTutor } from './aiTutor.js';

class AIController {
  constructor() {
    this.sessionStartTime = Date.now();
    this.questionStartTime = null;
    this.currentTopic = null;
    this.isAIEnabled = true;
  }

  /**
   * Initialize AI session for a quiz topic
   */
  startQuizSession(topic, studentData = null) {
    this.currentTopic = topic;
    this.sessionStartTime = Date.now();
    
    // Import existing student profile if available
    if (studentData) {
      aiTutor.importProfile(studentData);
    }
    
    // Reset session data for fresh accuracy tracking
    aiTutor.resetSession();

    console.log(`🤖 AI Tutor activated for ${topic} - Starting fresh session at difficulty: ${aiTutor.getDifficultyName(aiTutor.currentDifficulty)}`);
  }

  /**
   * AI-powered question preparation
   */
  prepareQuestions(availableQuestions, count = 5) {
    if (!this.isAIEnabled) {
      return this.fallbackQuestionSelection(availableQuestions, count);
    }

    // Let AI select optimal questions
    const aiSelectedQuestions = aiTutor.selectOptimalQuestions(
      availableQuestions, 
      this.currentTopic, 
      count
    );

    // Log AI decision
    console.log(`🎯 AI selected ${aiSelectedQuestions.length} questions at ${aiTutor.getDifficultyName(aiTutor.currentDifficulty)} difficulty`);

    return aiSelectedQuestions;
  }

  /**
   * Track question start for timing analysis
   */
  startQuestion(questionData) {
    this.questionStartTime = Date.now();
    
    // AI could provide question-specific hints or prepare adaptive responses
    return {
      questionId: questionData.id,
      startTime: this.questionStartTime,
      aiDifficulty: aiTutor.currentDifficulty,
      adaptiveHints: this.generateAdaptiveHints(questionData)
    };
  }

  /**
   * Process answer with AI analysis and adaptation
   */
  processAnswer(questionData, isCorrect, userAnswer = null) {
    const responseTime = Date.now() - (this.questionStartTime || Date.now());
    
    // AI analyzes the response
    aiTutor.analyzeResponse(questionData, isCorrect, responseTime, this.currentTopic);
    
    // AI adjusts difficulty for next questions
    const newDifficulty = aiTutor.adjustDifficulty();
    
    // Generate AI feedback
    const aiFeedback = this.generateQuestionFeedback(questionData, isCorrect, responseTime);
    
    // Log AI adaptation
    if (newDifficulty !== aiTutor.currentDifficulty) {
      console.log(`🔄 AI adjusted difficulty: ${aiTutor.getDifficultyName(aiTutor.currentDifficulty)} → ${aiTutor.getDifficultyName(newDifficulty)}`);
    }

    return {
      isCorrect,
      responseTime,
      aiFeedback,
      difficultyAdjustment: newDifficulty !== aiTutor.currentDifficulty,
      newDifficulty: aiTutor.getDifficultyName(newDifficulty),
      aiInsights: this.getQuestionInsights(questionData, isCorrect)
    };
  }

  /**
   * Generate comprehensive AI feedback for quiz completion
   */
  completeQuizSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const aiFeedback = aiTutor.generateAIFeedback(this.currentTopic);
    const analytics = aiTutor.getLearningAnalytics();
    
    // Calculate quiz session accuracy for difficulty progression
    const sessionAccuracy = aiTutor.getSessionAccuracy();
    const currentSessionDifficulty = aiTutor.getDifficultyName(aiTutor.currentDifficulty).toLowerCase();
    
    // Determine next session difficulty based on accuracy
    const nextSessionDifficulty = this.calculateNextSessionDifficulty(currentSessionDifficulty, sessionAccuracy);
    
    // Update AI for next session
    if (nextSessionDifficulty !== currentSessionDifficulty) {
      aiTutor.setDifficultyForNextSession(nextSessionDifficulty);
      console.log(`🔄 Difficulty adjusted: ${currentSessionDifficulty} → ${nextSessionDifficulty} (${sessionAccuracy.toFixed(1)}% accuracy)`);
    }
    
    // Generate session summary
    const sessionSummary = {
      topic: this.currentTopic,
      duration: sessionDuration,
      finalDifficulty: aiTutor.getDifficultyName(aiTutor.currentDifficulty),
      performance: aiTutor.getOverallPerformance(),
      sessionAccuracy: sessionAccuracy,
      questionsAnswered: aiTutor.studentProfile.totalQuestions,
      currentStreak: aiTutor.studentProfile.streakCount,
      aiFeedback,
      analytics,
      nextSession: this.generateNextSessionRecommendations(),
      difficultyProgression: {
        current: currentSessionDifficulty,
        next: nextSessionDifficulty,
        reason: this.getDifficultyProgressionReason(currentSessionDifficulty, sessionAccuracy)
      }
    };

    console.log(`🎓 AI Session Complete - Performance: ${sessionSummary.performance.toFixed(1)}%`);
    
    return sessionSummary;
  }

  /**
   * Get real-time AI recommendations during quiz
   */
  getRealTimeRecommendations() {
    if (!this.isAIEnabled) return null;

    return {
      shouldOfferHint: this.shouldOfferHint(),
      difficultyStatus: this.getDifficultyStatus(),
      encouragementLevel: this.getEncouragementLevel(),
      nextQuestionPreview: this.getNextQuestionRecommendation()
    };
  }

  /**
   * AI-powered hint generation
   */
  generateAdaptiveHints(questionData) {
    const hints = [];
    const performance = aiTutor.getOverallPerformance();
    
    // Generate hints based on question type and student performance
    switch (questionData.type) {
      case 'sorting':
        if (performance < 60) {
          hints.push("💡 Look for common properties like color or shape");
          hints.push("🎯 Drag items that look similar together");
        }
        break;
      case 'matching':
        if (performance < 60) {
          hints.push("💡 Think about which items belong together");
          hints.push("🎯 Look for patterns or relationships");
        }
        break;
      case 'identification':
        hints.push("🔍 Take your time to look carefully");
        break;
    }

    return hints;
  }

  /**
   * Generate AI feedback for individual questions
   */
  generateQuestionFeedback(questionData, isCorrect, responseTime) {
    const feedback = {
      message: "",
      type: isCorrect ? "success" : "learning",
      aiInsight: "",
      suggestion: ""
    };

    if (isCorrect) {
      const speedFeedback = responseTime < 15000 ? "quickly" : "thoughtfully";
      feedback.message = `Great job! You answered ${speedFeedback} and correctly! 🌟`;
      
      if (responseTime < 10000) {
        feedback.aiInsight = "🚀 You're getting faster and more confident!";
      }
    } else {
      feedback.message = "Not quite right, but learning from mistakes makes us stronger! 💪";
      feedback.suggestion = this.generateLearningSuggestion(questionData);
      feedback.aiInsight = "🎯 Every wrong answer teaches us something new!";
    }

    return feedback;
  }

  /**
   * Generate learning suggestions based on question analysis
   */
  generateLearningSuggestion(questionData) {
    const suggestions = {
      'sorting': [
        "Try grouping by one property first (like color), then practice with shapes",
        "Look for what makes items similar - color, shape, or size",
        "Start with obvious differences, then work on subtle ones"
      ],
      'matching': [
        "Think about which items naturally go together",
        "Consider the relationships between different objects",
        "Take time to understand the connection pattern"
      ],
      'identification': [
        "Look carefully at the details in each option",
        "Compare the key features you're looking for",
        "Take your time - accuracy is more important than speed"
      ]
    };

    const typeSuggestions = suggestions[questionData.type] || ["Keep practicing - you're learning!"];
    return typeSuggestions[Math.floor(Math.random() * typeSuggestions.length)];
  }

  /**
   * AI-powered next session recommendations
   */
  generateNextSessionRecommendations() {
    const analytics = aiTutor.getLearningAnalytics();
    const recommendations = [];

    // Topic-specific recommendations
    if (analytics.weaknesses.length > 0) {
      recommendations.push({
        type: 'weakness_focus',
        message: `Practice these areas: ${analytics.weaknesses.join(', ')}`,
        priority: 'high'
      });
    }

    // Difficulty recommendations
    if (analytics.overallPerformance > 85) {
      recommendations.push({
        type: 'challenge',
        message: 'Ready for more challenging questions!',
        priority: 'medium'
      });
    }

    // Learning style recommendations
    const trend = analytics.learningTrends.performanceImprovement;
    if (trend === 'improving') {
      recommendations.push({
        type: 'motivation',
        message: 'You\'re improving! Keep up the great work!',
        priority: 'low'
      });
    }

    return recommendations;
  }

  // Helper methods for real-time recommendations

  shouldOfferHint() {
    const recentPerformance = aiTutor.performanceWindow.slice(-3);
    const recentFailures = recentPerformance.filter(r => !r.correct).length;
    return recentFailures >= 2; // Offer hint after 2 recent mistakes
  }

  getDifficultyStatus() {
    const status = {
      current: aiTutor.getDifficultyName(aiTutor.currentDifficulty),
      trend: 'stable'
    };

    const recentHistory = aiTutor.studentProfile.difficultyHistory.slice(-3);
    if (recentHistory.length > 0) {
      const lastChange = recentHistory[recentHistory.length - 1];
      status.trend = lastChange.to > lastChange.from ? 'increasing' : 
                    lastChange.to < lastChange.from ? 'decreasing' : 'stable';
    }

    return status;
  }

  getEncouragementLevel() {
    const performance = aiTutor.getOverallPerformance();
    const streak = aiTutor.studentProfile.streakCount;
    
    if (streak >= 5) return 'high'; // Celebration mode
    if (performance < 50) return 'supportive'; // Need encouragement
    if (performance > 80) return 'congratulatory'; // Doing great
    return 'motivational'; // Keep going
  }

  getNextQuestionRecommendation() {
    const currentDiff = aiTutor.currentDifficulty;
    const performance = aiTutor.getOverallPerformance();
    
    return {
      difficulty: aiTutor.getDifficultyName(currentDiff),
      reasoning: performance > 80 ? 
        "Based on your excellent performance" :
        "Adjusted to help you learn better",
      confidence: performance > 70 ? "high" : "building"
    };
  }

  getQuestionInsights(questionData, isCorrect) {
    const insights = [];
    
    if (isCorrect && aiTutor.studentProfile.streakCount >= 3) {
      insights.push("🔥 You're on a roll!");
    }
    
    if (!isCorrect && questionData.difficulty === 'hard') {
      insights.push("🎯 Challenging questions help you grow!");
    }
    
    return insights;
  }

  // Fallback for when AI is disabled
  fallbackQuestionSelection(availableQuestions, count) {
    // Simple difficulty-based selection
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Configuration methods
  enableAI() {
    this.isAIEnabled = true;
    console.log("🤖 AI Tutor enabled");
  }

  disableAI() {
    this.isAIEnabled = false;
    console.log("📚 AI Tutor disabled - using standard mode");
  }

  // Session-to-Session Difficulty Progression Methods
  
  /**
   * Calculate next session difficulty based on current level and accuracy
   * Your specific progression rules:
   * Easy: >80% → Medium, 60-80% → Easy, <60% → Easy
   * Medium: >80% → Hard, 60-80% → Medium, <60% → Easy
   * Hard: >80% → Hard, 60-80% → Medium, <60% → Easy
   */
  calculateNextSessionDifficulty(currentDifficulty, accuracy) {
  const accuracyPercent = accuracy * 100;
  
  // Current difficulty is already normalized to our 3-level system
  const normalizedCurrent = currentDifficulty.toLowerCase();
    
    console.log(`📊 Calculating next difficulty: Current=${currentDifficulty} (normalized: ${normalizedCurrent}), Accuracy=${accuracyPercent.toFixed(1)}%`);
    
    switch (normalizedCurrent) {
      case 'easy':
        if (accuracyPercent > 80) {
          return 'medium';
        }
        return 'easy'; // Stay on easy for 60-80% and <60%
        
      case 'medium':
        if (accuracyPercent > 80) {
          return 'hard';
        } else if (accuracyPercent >= 60) {
          return 'medium'; // Stay on medium
        } else {
          return 'easy'; // Downgrade to easy
        }
        
      case 'hard':
        if (accuracyPercent > 80) {
          return 'hard'; // Stay on hard, provide different questions
        } else if (accuracyPercent >= 60) {
          return 'medium'; // Downgrade to medium
        } else {
          return 'easy'; // Downgrade to easy
        }
        
      default:
        return 'easy'; // Fallback
    }
  }
  

  
  /**
   * Get reason for difficulty progression
   */
  getDifficultyProgressionReason(currentDifficulty, accuracy) {
    const accuracyPercent = accuracy * 100;
    
    if (accuracyPercent > 80) {
      if (currentDifficulty === 'hard') {
        return 'Excellent performance! Staying at Hard level with new challenges.';
      } else {
        return `Great job! Moving up from ${currentDifficulty} level due to ${accuracyPercent.toFixed(1)}% accuracy.`;
      }
    } else if (accuracyPercent >= 60) {
      if (currentDifficulty === 'medium') {
        return 'Good progress! Continuing at Medium level to build confidence.';
      } else {
        return `Solid performance! Adjusting difficulty for optimal learning.`;
      }
    } else {
      return `Let's take it step by step. Moving to an easier level to build your foundation.`;
    }
  }

  // Export student data for persistence
  exportStudentData() {
    return aiTutor.exportProfile();
  }

  // Get current AI status
  getAIStatus() {
    return {
      enabled: this.isAIEnabled,
      currentTopic: this.currentTopic,
      difficulty: aiTutor.getDifficultyName(aiTutor.currentDifficulty),
      performance: aiTutor.getOverallPerformance(),
      questionsCompleted: aiTutor.studentProfile.totalQuestions,
      currentStreak: aiTutor.studentProfile.streakCount
    };
  }
}

// Create singleton instance
const aiController = new AIController();

export { aiController, AIController };
