import React, { useEffect, useState } from 'react';
import { generateSkillFeedback, analyzeMistakes } from '../../../utils/chatGPTFeedbackService';
import './ModernFeedback.css';

const ModernFeedback = ({
  topicName,
  topicIcon = '📚',
  score,
  totalQuestions,
  difficulty,
  nextDifficulty,
  difficultyChanged,
  timeSpent = 0,
  questionDetails = [],
  studentName = 'Student',
  onBackToDashboard,
  onTryAgain,
  sessionData = {}
}) => {
  const [chatGPTFeedback, setChatGPTFeedback] = useState('');
  const [mistakeAnalysis, setMistakeAnalysis] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  const accuracy = Math.round((score / totalQuestions) * 100);
  const incorrectQuestions = questionDetails.filter(q => !q.correct);
  
  // Determine performance level
  let performanceLevel = 'needs-practice';
  let performanceEmoji = '💪';
  let performanceTitle = 'Keep Trying!';
  let performanceColor = '#FF9800';
  
  if (accuracy >= 80) {
    performanceLevel = 'excellent';
    performanceEmoji = '🌟';
    performanceTitle = 'Excellent Work!';
    performanceColor = '#4CAF50';
  } else if (accuracy >= 60) {
    performanceLevel = 'good';
    performanceEmoji = '👍';
    performanceTitle = 'Good Job!';
    performanceColor = '#2196F3';
  }

  useEffect(() => {
    const loadFeedback = async () => {
      setIsLoadingFeedback(true);
      
      // Generate main skill feedback
      const feedback = await generateSkillFeedback({
        studentName,
        topicName,
        score,
        totalQuestions,
        accuracy,
        difficulty,
        questionDetails,
        timeSpent
      });
      setChatGPTFeedback(feedback);

      // If there are mistakes, analyze them
      if (incorrectQuestions.length > 0) {
        const analysis = await analyzeMistakes({
          topicName,
          incorrectQuestions,
          difficulty
        });
        setMistakeAnalysis(analysis);
      }
      
      setIsLoadingFeedback(false);
    };

    loadFeedback();
  }, [score, totalQuestions, accuracy]);

  // Format time spent
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${secs} sec`;
  };

  return (
    <div className="modern-feedback-container">
      <div className="modern-feedback-content">
        {/* Header Section */}
        <div className="feedback-header">
          <div className="topic-badge">
            <span className="topic-icon">{topicIcon}</span>
            <span className="topic-name">{topicName}</span>
          </div>
          <h1 className="completion-title">Quiz Complete! 🎉</h1>
        </div>

        {/* Main Score Display */}
        <div className="score-showcase" style={{ borderColor: performanceColor }}>
          <div className="score-circle" style={{ background: `conic-gradient(${performanceColor} ${accuracy * 3.6}deg, #E0E0E0 0deg)` }}>
            <div className="score-inner">
              <div className="score-percentage">{accuracy}%</div>
              <div className="score-fraction">{score}/{totalQuestions}</div>
            </div>
          </div>
          
          <div className="performance-badge" style={{ backgroundColor: performanceColor }}>
            <span className="performance-emoji">{performanceEmoji}</span>
            <span className="performance-text">{performanceTitle}</span>
          </div>
        </div>

        {/* ChatGPT Skill Feedback Section */}
        <div className="skill-feedback-section">
          <div className="section-header">
            <span className="section-icon">🤖</span>
            <h2>Your Teacher's Message</h2>
          </div>
          {isLoadingFeedback ? (
            <div className="loading-feedback">
              <div className="loading-spinner"></div>
              <p>Preparing your feedback...</p>
            </div>
          ) : (
            <div className="chatgpt-feedback-box">
              <p className="feedback-text">{chatGPTFeedback}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(timeSpent)}</div>
            <div className="stat-label">Time Spent</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{difficulty}</div>
            <div className="stat-label">Difficulty Level</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{score}</div>
            <div className="stat-label">Correct Answers</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{totalQuestions - score}</div>
            <div className="stat-label">To Practice</div>
          </div>
        </div>

        {/* Difficulty Progression */}
        {difficultyChanged && (
          <div className="difficulty-progression-card">
            <div className="section-header">
              <span className="section-icon">📈</span>
              <h2>Your Progress Path</h2>
            </div>
            <div className="progression-visual">
              <div className="progression-step">
                <div className={`difficulty-badge difficulty-${difficulty}`}>
                  {difficulty}
                </div>
                <div className="step-label">This Quiz</div>
              </div>
              
              <div className="progression-arrow">
                {nextDifficulty > difficulty ? '⬆️' : nextDifficulty < difficulty ? '⬇️' : '➡️'}
              </div>
              
              <div className="progression-step">
                <div className={`difficulty-badge difficulty-${nextDifficulty}`}>
                  {nextDifficulty}
                </div>
                <div className="step-label">Next Quiz</div>
              </div>
            </div>
            <p className="progression-message">
              {accuracy >= 80 ? 
                `🎯 Great job! You're ready for ${nextDifficulty} level!` :
                accuracy >= 60 ?
                  `👍 Keep practicing at ${nextDifficulty} level!` :
                  `💪 Let's build your skills at ${nextDifficulty} level!`
              }
            </p>
          </div>
        )}

        {/* Mistake Analysis */}
        {incorrectQuestions.length > 0 && mistakeAnalysis && (
          <div className="mistake-analysis-section">
            <div className="section-header">
              <span className="section-icon">💡</span>
              <h2>What to Practice Next</h2>
            </div>
            <div className="analysis-box">
              <p className="analysis-text">{mistakeAnalysis}</p>
              <div className="mistakes-count">
                {incorrectQuestions.length} question{incorrectQuestions.length > 1 ? 's' : ''} to review
              </div>
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        <div className="question-breakdown">
          <div className="section-header">
            <span className="section-icon">📝</span>
            <h2>Question by Question</h2>
          </div>
          <div className="questions-list">
            {questionDetails.map((question, index) => (
              <div 
                key={index} 
                className={`question-item ${question.correct ? 'correct' : 'incorrect'}`}
              >
                <div className="question-number">Q{index + 1}</div>
                <div className="question-status">
                  {question.correct ? '✅' : '❌'}
                </div>
                <div className="question-type">{question.questionType}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          <button 
            className="action-btn primary-btn"
            onClick={onBackToDashboard}
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </button>
          <button 
            className="action-btn secondary-btn"
            onClick={onTryAgain}
          >
            <span>🔄</span>
            <span>Practice Again</span>
          </button>
        </div>

        {/* Encouragement Footer */}
        <div className="encouragement-footer">
          <p className="encouragement-text">
            {accuracy >= 90 ? 
              "🌟 You're a superstar! Keep shining!" :
              accuracy >= 70 ?
                "⭐ You're doing amazing! Keep going!" :
                "🌈 Every practice makes you better! You've got this!"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernFeedback;

