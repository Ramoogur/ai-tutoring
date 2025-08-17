/**
 * AI Tutor System - Adaptive Learning Engine
 * Controls difficulty levels, analyzes performance, and provides intelligent recommendations
 */

class AITutor {
  constructor() {
    this.studentProfile = {
      totalQuestions: 0,
      correctAnswers: 0,
      streakCount: 0,
      maxStreak: 0,
      averageResponseTime: 0,
      topicPerformance: {},
      learningPatterns: {},
      difficultyHistory: []
    };
    
    this.difficultyLevels = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3
    };
    
    this.currentDifficulty = this.difficultyLevels.EASY;
    this.performanceWindow = []; // Last 10 responses for moving average
    this.weaknessAreas = new Set();
    this.strengthAreas = new Set();
  }

  /**
   * Analyzes student response and updates performance metrics
   */
  analyzeResponse(questionData, isCorrect, responseTime, topic) {
    // Update basic metrics
    this.studentProfile.totalQuestions++;
    if (isCorrect) {
      this.studentProfile.correctAnswers++;
      this.studentProfile.streakCount++;
      this.studentProfile.maxStreak = Math.max(this.studentProfile.maxStreak, this.studentProfile.streakCount);
    } else {
      this.studentProfile.streakCount = 0;
    }

    // Update response time average
    const totalTime = this.studentProfile.averageResponseTime * (this.studentProfile.totalQuestions - 1) + responseTime;
    this.studentProfile.averageResponseTime = totalTime / this.studentProfile.totalQuestions;

    // Track topic-specific performance
    if (!this.studentProfile.topicPerformance[topic]) {
      this.studentProfile.topicPerformance[topic] = {
        attempted: 0,
        correct: 0,
        averageTime: 0,
        difficultyProgression: []
      };
    }
    
    const topicData = this.studentProfile.topicPerformance[topic];
    topicData.attempted++;
    if (isCorrect) topicData.correct++;
    topicData.averageTime = (topicData.averageTime * (topicData.attempted - 1) + responseTime) / topicData.attempted;
    topicData.difficultyProgression.push(this.currentDifficulty);

    // Update performance window for adaptive difficulty
    this.performanceWindow.push({ correct: isCorrect, time: responseTime, difficulty: this.currentDifficulty });
    if (this.performanceWindow.length > 10) {
      this.performanceWindow.shift();
    }

    // Analyze learning patterns
    this.analyzeLearningPatterns(questionData, isCorrect, responseTime, topic);
  }

  /**
   * AI-powered difficulty adjustment based on performance analysis
   */
  adjustDifficulty() {
    if (this.performanceWindow.length < 3) return this.currentDifficulty;

    // Calculate recent performance metrics
    const recentPerformance = this.performanceWindow.slice(-5);
    const accuracyRate = recentPerformance.filter(r => r.correct).length / recentPerformance.length;
    const averageTime = recentPerformance.reduce((sum, r) => sum + r.time, 0) / recentPerformance.length;
    
    // AI decision matrix for difficulty adjustment
    let difficultyChange = 0;
    
    // Performance-based adjustment
    if (accuracyRate >= 0.9 && averageTime < this.studentProfile.averageResponseTime * 0.8) {
      difficultyChange = 2; // High accuracy + Fast response = Increase significantly
    } else if (accuracyRate >= 0.8) {
      difficultyChange = 1; // Good accuracy = Increase difficulty
    } else if (accuracyRate <= 0.4) {
      difficultyChange = -2; // Low accuracy = Decrease significantly
    } else if (accuracyRate <= 0.6) {
      difficultyChange = -1; // Below average = Decrease difficulty
    }

    // Streak bonus/penalty
    if (this.studentProfile.streakCount >= 5) {
      difficultyChange += 1;
    } else if (this.studentProfile.streakCount === 0 && recentPerformance.length >= 3) {
      difficultyChange -= 1;
    }

    // Apply difficulty change with bounds
    const newDifficulty = Math.max(
      this.difficultyLevels.EASY,
      Math.min(this.difficultyLevels.HARD, this.currentDifficulty + difficultyChange)
    );

    // Store difficulty history for analysis
    this.studentProfile.difficultyHistory.push({
      from: this.currentDifficulty,
      to: newDifficulty,
      reason: this.getDifficultyChangeReason(accuracyRate, averageTime, difficultyChange),
      timestamp: Date.now()
    });

    this.currentDifficulty = newDifficulty;
    return this.currentDifficulty;
  }

  /**
   * Intelligent question selection based on learning analytics
   */
  selectOptimalQuestions(availableQuestions, topic, count = 5) {
    const selectedQuestions = [];
    const topicPerformance = this.studentProfile.topicPerformance[topic] || { correct: 0, attempted: 1 };
    const topicAccuracy = topicPerformance.correct / topicPerformance.attempted;

    // AI question selection strategy
    const strategy = this.getQuestionSelectionStrategy(topicAccuracy);
    
    // Filter questions by difficulty level - prioritize current difficulty
    const currentDifficultyName = this.getDifficultyName(this.currentDifficulty);
  
    // Debug logging
    console.log(`🔍 AI Debug: currentDifficulty level = ${this.currentDifficulty}`);
    console.log(`🔍 AI Debug: currentDifficultyName = ${currentDifficultyName}`);
    console.log(`🔍 AI Debug: available questions count = ${availableQuestions.length}`);
    console.log(`🔍 AI Debug: available difficulties:`, availableQuestions.map(q => q.difficulty));

    // First try to get questions at exact difficulty level
    let questionsForDifficulty = availableQuestions.filter(q => 
      q.difficulty === currentDifficultyName
    );
  
    console.log(`🔍 AI Debug: questions at ${currentDifficultyName} level = ${questionsForDifficulty.length}`);

    // If not enough questions at current level, take what we have + selective fallback
    if (questionsForDifficulty.length < count) {
      console.log(`🔍 AI Debug: Not enough ${currentDifficultyName} questions (${questionsForDifficulty.length}/${count})`);
      
      // Calculate how many more questions we need
      const needed = count - questionsForDifficulty.length;
      
      // Get fallback questions from one level below only
      const oneLevelBelow = this.currentDifficulty - 1;
      const fallbackQuestions = availableQuestions.filter(q =>
        this.mapDifficultyToLevel(q.difficulty) === oneLevelBelow
      ).slice(0, needed); // Take only what we need
      
      console.log(`🔍 AI Debug: Adding ${fallbackQuestions.length} fallback questions from level ${oneLevelBelow}`);
      questionsForDifficulty = [...questionsForDifficulty, ...fallbackQuestions];
    }

    // Sort questions by AI priority
    const prioritizedQuestions = this.prioritizeQuestions(questionsForDifficulty, strategy);

    // Select questions based on AI recommendations
    for (let i = 0; i < count && i < prioritizedQuestions.length; i++) {
      selectedQuestions.push(prioritizedQuestions[i]);
    }

    return selectedQuestions;
  }

  /**
   * Generate AI-powered feedback and recommendations
   */
  generateAIFeedback(topic) {
    const performance = this.getOverallPerformance();
    const topicData = this.studentProfile.topicPerformance[topic];
    const feedback = {
      encouragement: this.generateEncouragement(performance),
      insights: this.generateInsights(topicData, topic),
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(topic),
      achievements: this.identifyAchievements()
    };

    return feedback;
  }

  /**
   * Advanced learning pattern analysis
   */
  analyzeLearningPatterns(questionData, isCorrect, responseTime, topic) {
    const pattern = {
      questionType: questionData.type,
      difficulty: this.currentDifficulty,
      success: isCorrect,
      timeToComplete: responseTime,
      topic: topic,
      timestamp: Date.now()
    };

    if (!this.studentProfile.learningPatterns[topic]) {
      this.studentProfile.learningPatterns[topic] = [];
    }
    
    this.studentProfile.learningPatterns[topic].push(pattern);

    // Identify weakness and strength areas
    if (isCorrect) {
      this.strengthAreas.add(`${topic}-${questionData.type}`);
    } else {
      this.weaknessAreas.add(`${topic}-${questionData.type}`);
    }

    // Remove strengths that become weaknesses
    if (!isCorrect && this.strengthAreas.has(`${topic}-${questionData.type}`)) {
      this.strengthAreas.delete(`${topic}-${questionData.type}`);
    }
  }

  /**
   * Get current learning analytics
   */
  getLearningAnalytics() {
    return {
      overallPerformance: this.getOverallPerformance(),
      currentDifficulty: this.getDifficultyName(this.currentDifficulty),
      strengths: Array.from(this.strengthAreas),
      weaknesses: Array.from(this.weaknessAreas),
      topicBreakdown: this.getTopicBreakdown(),
      learningTrends: this.getLearningTrends(),
      recommendations: this.getSmartRecommendations()
    };
  }

  // Helper Methods

  getOverallPerformance() {
    return this.studentProfile.totalQuestions > 0 
      ? (this.studentProfile.correctAnswers / this.studentProfile.totalQuestions) * 100 
      : 0;
  }

  getDifficultyName(level) {
    const names = ['', 'easy', 'medium', 'hard'];
    return names[level] || 'easy';
  }

  mapDifficultyToLevel(difficulty) {
    const mapping = {
      'easy': this.difficultyLevels.EASY,
      'medium': this.difficultyLevels.MEDIUM,
      'hard': this.difficultyLevels.HARD
    };
    return mapping[difficulty] || this.difficultyLevels.EASY;
  }

  getQuestionSelectionStrategy(accuracy) {
    if (accuracy < 0.5) return 'remedial'; // Focus on easier questions
    if (accuracy > 0.8) return 'challenge'; // Push boundaries
    return 'balanced'; // Mix of review and new concepts
  }

  prioritizeQuestions(questions, strategy) {
    switch (strategy) {
      case 'remedial':
        return questions.sort((a, b) => 
          this.mapDifficultyToLevel(a.difficulty) - this.mapDifficultyToLevel(b.difficulty)
        );
      case 'challenge':
        return questions.sort((a, b) => 
          this.mapDifficultyToLevel(b.difficulty) - this.mapDifficultyToLevel(a.difficulty)
        );
      default:
        return this.shuffleArray([...questions]);
    }
  }

  generateEncouragement(performance) {
    const encouragements = {
      excellent: [
        "Outstanding work! 🌟 You're mastering these concepts brilliantly!",
        "Incredible progress! Your learning skills are truly impressive! 🚀",
        "You're on fire! Keep up this amazing momentum! 🔥"
      ],
      good: [
        "Great job! You're making solid progress! 👏",
        "Nice work! You're getting stronger with each question! 💪",
        "Well done! Your understanding is clearly improving! ✨"
      ],
      improving: [
        "You're learning and growing! Every mistake is a step forward! 🌱",
        "Keep going! Practice makes perfect, and you're doing great! 🎯",
        "Good effort! Learning takes time, and you're on the right path! 🛤️"
      ]
    };

    const category = performance >= 80 ? 'excellent' : performance >= 60 ? 'good' : 'improving';
    const messages = encouragements[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  generateInsights(topicData, topic) {
    if (!topicData) return [];
    
    const accuracy = (topicData.correct / topicData.attempted) * 100;
    const insights = [];

    if (accuracy >= 85) {
      insights.push(`🎯 You've mastered ${topic}! Your accuracy is ${accuracy.toFixed(1)}%`);
    } else if (accuracy >= 70) {
      insights.push(`📈 You're doing well with ${topic}! ${accuracy.toFixed(1)}% accuracy`);
    } else {
      insights.push(`🎯 ${topic} needs more practice. Current accuracy: ${accuracy.toFixed(1)}%`);
    }

    return insights;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.weaknessAreas.size > 0) {
      recommendations.push(`Focus on: ${Array.from(this.weaknessAreas).join(', ')}`);
    }
    
    if (this.studentProfile.streakCount >= 3) {
      recommendations.push("You're on a winning streak! Try a harder challenge!");
    }
    
    return recommendations;
  }

  generateNextSteps(topic) {
    const nextSteps = [];
    const topicData = this.studentProfile.topicPerformance[topic];
    
    if (topicData && topicData.correct / topicData.attempted > 0.8) {
      nextSteps.push(`Ready for advanced ${topic} challenges!`);
    } else {
      nextSteps.push(`Continue practicing ${topic} fundamentals`);
    }
    
    return nextSteps;
  }

  identifyAchievements() {
    const achievements = [];
    
    if (this.studentProfile.maxStreak >= 5) {
      achievements.push("🔥 Streak Master!");
    }
    
    if (this.studentProfile.totalQuestions >= 50) {
      achievements.push("📚 Dedicated Learner!");
    }
    
    if (this.getOverallPerformance() >= 90) {
      achievements.push("⭐ Excellence Award!");
    }
    
    return achievements;
  }

  getDifficultyChangeReason(accuracy, avgTime, change) {
    if (change > 0) {
      return `High performance (${(accuracy * 100).toFixed(1)}% accuracy) - increasing difficulty`;
    } else if (change < 0) {
      return `Need support (${(accuracy * 100).toFixed(1)}% accuracy) - providing easier questions`;
    }
    return 'Performance stable - maintaining current level';
  }

  getTopicBreakdown() {
    const breakdown = {};
    for (const [topic, data] of Object.entries(this.studentProfile.topicPerformance)) {
      breakdown[topic] = {
        accuracy: (data.correct / data.attempted * 100).toFixed(1),
        questionsAttempted: data.attempted,
        averageTime: data.averageTime.toFixed(1)
      };
    }
    return breakdown;
  }

  getLearningTrends() {
    return {
      difficultyProgression: this.studentProfile.difficultyHistory,
      performanceImprovement: this.calculatePerformanceTrend(),
      timeEfficiency: this.calculateTimeEfficiency()
    };
  }

  calculatePerformanceTrend() {
    if (this.performanceWindow.length < 5) return 'insufficient_data';
    
    const first = this.performanceWindow.slice(0, 3);
    const last = this.performanceWindow.slice(-3);
    
    const firstAccuracy = first.filter(r => r.correct).length / first.length;
    const lastAccuracy = last.filter(r => r.correct).length / last.length;
    
    if (lastAccuracy > firstAccuracy + 0.1) return 'improving';
    if (lastAccuracy < firstAccuracy - 0.1) return 'declining';
    return 'stable';
  }

  calculateTimeEfficiency() {
    if (this.performanceWindow.length < 5) return 'measuring';
    
    const avgTime = this.performanceWindow.reduce((sum, r) => sum + r.time, 0) / this.performanceWindow.length;
    
    if (avgTime < 15000) return 'very_fast';
    if (avgTime < 30000) return 'fast';
    if (avgTime < 60000) return 'normal';
    return 'thorough';
  }

  getSmartRecommendations() {
    const recommendations = [];
    const performance = this.getOverallPerformance();
    
    if (performance < 60) {
      recommendations.push({
        type: 'difficulty',
        message: 'Consider easier questions to build confidence',
        priority: 'high'
      });
    }
    
    if (this.weaknessAreas.size > 3) {
      recommendations.push({
        type: 'focus',
        message: 'Focus on one topic at a time for better learning',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Reset methods
  resetProfile() {
    this.studentProfile = {
      totalQuestions: 0,
      correctAnswers: 0,
      streakCount: 0,
      maxStreak: 0,
      averageResponseTime: 0,
      topicPerformance: {},
      learningPatterns: {},
      difficultyHistory: []
    };
    this.currentDifficulty = this.difficultyLevels.EASY;
    this.performanceWindow = [];
    this.weaknessAreas.clear();
    this.strengthAreas.clear();
  }

  // Session-based accuracy tracking methods
  
  /**
   * Get accuracy for current quiz session (not overall performance)
   */
  getSessionAccuracy() {
    if (this.performanceWindow.length === 0) return 0;
    
    // Calculate accuracy based on current session responses
    const sessionResponses = this.performanceWindow; // All responses in current quiz
    const correctResponses = sessionResponses.filter(response => response.correct).length;
    const sessionAccuracy = correctResponses / sessionResponses.length;
    
    console.log(`📊 Session Stats: ${correctResponses}/${sessionResponses.length} correct = ${(sessionAccuracy * 100).toFixed(1)}% accuracy`);
    
    return sessionAccuracy;
  }
  
  /**
   * Set difficulty level for next session
   */
  setDifficultyForNextSession(difficultyName) {
    const difficultyMap = {
      'easy': this.difficultyLevels.EASY,
      'medium': this.difficultyLevels.MEDIUM, 
      'hard': this.difficultyLevels.HARD
    };
    
    if (difficultyMap[difficultyName]) {
      this.currentDifficulty = difficultyMap[difficultyName];
      console.log(`🎯 Next session difficulty set to: ${difficultyName} (level ${this.currentDifficulty})`);
      
      // Clear performance window for fresh start in next session
      this.performanceWindow = [];
      
      // Reset streak for new difficulty level
      this.studentProfile.streakCount = 0;
    } else {
      console.warn(`⚠️ Unknown difficulty name: ${difficultyName}`);
    }
  }
  
  /**
   * Reset session data while preserving student profile
   */
  resetSession() {
    this.performanceWindow = [];
    this.studentProfile.streakCount = 0;
    console.log('🔄 AI session data reset for new quiz');  
  }

  // Export/Import for persistence
  exportProfile() {
    return {
      studentProfile: this.studentProfile,
      currentDifficulty: this.currentDifficulty,
      performanceWindow: this.performanceWindow,
      weaknessAreas: Array.from(this.weaknessAreas),
      strengthAreas: Array.from(this.strengthAreas)
    };
  }

  importProfile(data) {
    this.studentProfile = data.studentProfile || this.studentProfile;
    this.currentDifficulty = data.currentDifficulty || this.difficultyLevels.EASY;
    this.performanceWindow = data.performanceWindow || [];
    this.weaknessAreas = new Set(data.weaknessAreas || []);
    this.strengthAreas = new Set(data.strengthAreas || []);
  }
}

// Create singleton instance
const aiTutor = new AITutor();

export { aiTutor, AITutor };
