/**
 * Performance Tracker Component
 * Child-friendly performance dashboard for Grade 1 students
 * Shows performance across Quiz, Abacus, and Matching games with AI-powered insights
 */

import React, { useState, useEffect } from 'react';
import { fetchStudentPerformance } from './Performancetrackerservice';
import './Performancetracker.css';

const PerformanceTracker = ({ user, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, quiz, abacus, matching
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPerformanceData();
  }, [user.id]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchStudentPerformance(user.id);
      
      if (result.success) {
        setPerformanceData(result.data);
        console.log('✅ Performance data loaded:', result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading performance:', err);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="performance-tracker-modal">
        <div className="performance-tracker-container loading-container">
          <div className="modern-loading-spinner">
            <div className="loading-animation">
              <div className="spinner-circle">
                <div className="circle-gradient"></div>
              </div>
              <div className="loading-icons">
                <span className="icon-float icon-1">🚀</span>
                <span className="icon-float icon-2">⭐</span>
                <span className="icon-float icon-3">🎯</span>
                <span className="icon-float icon-4">✨</span>
              </div>
            </div>
            <h2 className="loading-title">Loading Your Amazing Progress...</h2>
            <p className="loading-subtitle">Getting ready to show your incredible achievements!</p>
            <div className="progress-bar">
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-tracker-modal">
        <div className="performance-tracker-container error-container">
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="error-message">
            <div className="error-icon">😢</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-btn" onClick={loadPerformanceData}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return null;
  }

  const { overall, quiz, abacus, matching, aiInsights, topicStats } = performanceData;

  return (
    <div className="performance-tracker-modal performance-tracker-fullscreen">
      <div className="performance-tracker-container performance-tracker-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tracker-header">
          <div className="header-content">
            <h1>🌟 {user.fullName || user.username}'s Math Journey 🌟</h1>
            <p>Look at all the amazing things you've learned!</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <div className="ai-insights-section">
            <div className="ai-header">
              <span className="ai-icon">🤖</span>
              <h2>Your AI Teacher Says:</h2>
            </div>
            <div className="ai-summary">
              <p>{aiInsights.summary}</p>
            </div>
            
            <div className="insights-grid">
              {/* Strengths */}
              <div className="insight-card strengths-card">
                <div className="card-header">
                  <span className="card-icon">💪</span>
                  <h3>You're Great At:</h3>
                </div>
                <ul className="insight-list">
                  {aiInsights.strengths.map((strength, idx) => (
                    <li key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <span className="bullet">⭐</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="insight-card improve-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <h3>Let's Practice:</h3>
                </div>
                <ul className="insight-list">
                  {aiInsights.areasToImprove.map((area, idx) => (
                    <li key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <span className="bullet">📚</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="insight-card recommendations-card">
                <div className="card-header">
                  <span className="card-icon">💡</span>
                  <h3>Tips for Parents/Teachers:</h3>
                </div>
                <ul className="insight-list">
                  {aiInsights.recommendations.map((rec, idx) => (
                    <li key={idx} className="fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <span className="bullet">✨</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tracker-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            📝 Quiz
          </button>
          <button 
            className={`tab-btn ${activeTab === 'abacus' ? 'active' : ''}`}
            onClick={() => setActiveTab('abacus')}
          >
            🧮 Abacus
          </button>
          <button 
            className={`tab-btn ${activeTab === 'matching' ? 'active' : ''}`}
            onClick={() => setActiveTab('matching')}
          >
            🔗 Matching
          </button>
        </div>

        {/* Content Area */}
        <div className="tracker-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2 className="section-title">📈 Your Overall Progress</h2>
              
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-box sessions-box">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-value">{overall.totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                
                <div className="stat-box accuracy-box">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{overall.averageAccuracy}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                
                <div className="stat-box time-box">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{overall.totalTimeMinutes}</div>
                  <div className="stat-label">Minutes Learning</div>
                </div>
                
                <div className="stat-box streak-box">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{overall.bestStreak}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
              </div>

              {/* Activities Breakdown */}
              <div className="activities-section">
                <h3 className="subsection-title">🎪 Activities You've Done</h3>
                <div className="activity-bars">
                  <div className="activity-bar">
                    <div className="bar-label">
                      <span>📝 Quiz</span>
                      <span className="bar-value">{overall.activities.quiz} sessions</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill quiz-fill" 
                        style={{ width: `${Math.min((overall.activities.quiz / Math.max(overall.totalSessions, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="activity-bar">
                    <div className="bar-label">
                      <span>🧮 Abacus</span>
                      <span className="bar-value">{overall.activities.abacus} sessions</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill abacus-fill" 
                        style={{ width: `${Math.min((overall.activities.abacus / Math.max(overall.totalSessions, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="activity-bar">
                    <div className="bar-label">
                      <span>🔗 Matching</span>
                      <span className="bar-value">{overall.activities.matching} sessions</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill matching-fill" 
                        style={{ width: `${Math.min((overall.activities.matching / Math.max(overall.totalSessions, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic Performance */}
              <div className="topics-section">
                <h3 className="subsection-title">📚 Your Topics</h3>
                <div className="topics-grid">
                  {Object.keys(topicStats).map((topic, idx) => {
                    const stat = topicStats[topic];
                    return (
                      <div key={idx} className="topic-card-mini" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="topic-name">{topic}</div>
                        <div className="topic-accuracy">
                          <div className="accuracy-circle" style={{ 
                            background: `conic-gradient(#4CAF50 ${stat.lastAccuracy * 3.6}deg, #e0e0e0 0deg)` 
                          }}>
                            <div className="accuracy-value">{Math.round(stat.lastAccuracy)}%</div>
                          </div>
                        </div>
                        <div className="topic-attempts">{stat.totalAttempts} attempts</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="detail-section">
              <h2 className="section-title">📝 Quiz Performance</h2>
              
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{quiz.totalSessions}</div>
                  <div className="stat-label">Quiz Sessions</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">❓</div>
                  <div className="stat-value">{quiz.totalQuestions}</div>
                  <div className="stat-label">Questions Answered</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{quiz.correctAnswers}</div>
                  <div className="stat-label">Correct Answers</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{quiz.averageAccuracy}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
              </div>

              {/* Quiz by Topic */}
              <div className="detail-breakdown">
                <h3 className="subsection-title">📚 Performance by Topic</h3>
                {Object.keys(quiz.byTopic).map((topic, idx) => {
                  const topicData = quiz.byTopic[topic];
                  return (
                    <div key={idx} className="performance-row">
                      <div className="row-header">
                        <span className="row-title">{topic}</span>
                        <span className="row-stats">
                          {topicData.sessions} sessions • {topicData.questions} questions
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${topicData.accuracy}%`,
                            backgroundColor: topicData.accuracy >= 80 ? '#4CAF50' : topicData.accuracy >= 60 ? '#FFC107' : '#FF5722'
                          }}
                        >
                          <span className="progress-label">{Math.round(topicData.accuracy)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Quiz Sessions */}
              {quiz.recentSessions.length > 0 && (
                <div className="recent-activity">
                  <h3 className="subsection-title">🕐 Recent Quiz Sessions</h3>
                  <div className="activity-timeline">
                    {quiz.recentSessions.slice(0, 5).map((session, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-date">{session.date}</div>
                        <div className="timeline-content">
                          <div className="timeline-topic">{session.topic}</div>
                          <div className="timeline-details">
                            <span className="detail-badge accuracy-badge">{session.accuracy}% accuracy</span>
                            <span className="detail-badge difficulty-badge">{session.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Abacus Tab */}
          {activeTab === 'abacus' && (
            <div className="detail-section">
              <h2 className="section-title">🧮 Abacus Performance</h2>
              
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-value">{abacus.totalSessions}</div>
                  <div className="stat-label">Game Sessions</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{abacus.averageAccuracy}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{abacus.bestStreak}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{abacus.totalTimeSpent}</div>
                  <div className="stat-label">Minutes Played</div>
                </div>
              </div>

              {/* Abacus by Mode */}
              <div className="detail-breakdown">
                <h3 className="subsection-title">🎮 Performance by Game Mode</h3>
                {Object.keys(abacus.byMode).map((mode, idx) => {
                  const modeData = abacus.byMode[mode];
                  return (
                    <div key={idx} className="performance-row">
                      <div className="row-header">
                        <span className="row-title">{mode.toUpperCase()} Mode</span>
                        <span className="row-stats">
                          {modeData.sessions} sessions • {modeData.questions} questions
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${modeData.accuracy}%`,
                            backgroundColor: modeData.accuracy >= 80 ? '#4CAF50' : modeData.accuracy >= 60 ? '#FFC107' : '#FF5722'
                          }}
                        >
                          <span className="progress-label">{Math.round(modeData.accuracy)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Abacus Sessions */}
              {abacus.recentSessions.length > 0 && (
                <div className="recent-activity">
                  <h3 className="subsection-title">🕐 Recent Abacus Games</h3>
                  <div className="activity-timeline">
                    {abacus.recentSessions.slice(0, 5).map((session, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-date">{session.date}</div>
                        <div className="timeline-content">
                          <div className="timeline-topic">{session.mode.toUpperCase()} Mode</div>
                          <div className="timeline-details">
                            <span className="detail-badge accuracy-badge">{session.accuracy}% accuracy</span>
                            <span className="detail-badge score-badge">Score: {session.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matching Tab */}
          {activeTab === 'matching' && (
            <div className="detail-section">
              <h2 className="section-title">🔗 Matching Game Performance</h2>
              
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-value">{matching.totalSessions}</div>
                  <div className="stat-label">Game Sessions</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{matching.totalMatches}</div>
                  <div className="stat-label">Correct Matches</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{matching.averageAccuracy}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                
                <div className="stat-box">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{matching.totalTimeSpent}</div>
                  <div className="stat-label">Minutes Played</div>
                </div>
              </div>

              {/* Matching by Topic */}
              <div className="detail-breakdown">
                <h3 className="subsection-title">📚 Performance by Topic</h3>
                {Object.keys(matching.byTopic).map((topic, idx) => {
                  const topicData = matching.byTopic[topic];
                  return (
                    <div key={idx} className="performance-row">
                      <div className="row-header">
                        <span className="row-title">{topic}</span>
                        <span className="row-stats">
                          {topicData.sessions} sessions • {topicData.matches} matches
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${topicData.accuracy}%`,
                            backgroundColor: topicData.accuracy >= 80 ? '#4CAF50' : topicData.accuracy >= 60 ? '#FFC107' : '#FF5722'
                          }}
                        >
                          <span className="progress-label">{Math.round(topicData.accuracy)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Matching Sessions */}
              {matching.recentSessions.length > 0 && (
                <div className="recent-activity">
                  <h3 className="subsection-title">🕐 Recent Matching Games</h3>
                  <div className="activity-timeline">
                    {matching.recentSessions.slice(0, 5).map((session, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-date">{session.date}</div>
                        <div className="timeline-content">
                          <div className="timeline-topic">{session.topic}</div>
                          <div className="timeline-details">
                            <span className="detail-badge accuracy-badge">{session.accuracy}% accuracy</span>
                            <span className="detail-badge match-badge">{session.matches} matches</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tracker-footer">
          <button className="close-footer-btn" onClick={onClose}>
            ✨ Close Performance Tracker ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracker;