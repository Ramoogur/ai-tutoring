import React, { useState, useEffect } from 'react';
import { getChildLearningInsights, generateAIFeedback } from './progressService.js';
import './MathJourney.css';

// Icons for each topic
const topicIcons = {
  'Numbers & Counting': '🔢',
  'Addition (within 10)': '➕',
  'Patterns': '🧩',
  'Shapes & Colours': '🎨',
  'Measurement & Comparison': '📏',
  'Time': '🕒',
  'Money': '💰',
  'Ordinal Numbers': '1️⃣',
};

const friendlyNames = {
  'Numbers & Counting': 'Counting',
  'Addition (within 10)': 'Adding',
  'Patterns': 'Patterns',
  'Shapes & Colours': 'Shapes & Colors',
  'Measurement & Comparison': 'Measuring',
  'Time': 'Time',
  'Money': 'Money',
  'Ordinal Numbers': 'Order',
};

const MathJourney = ({ progressData, onBack, studentId }) => {
  const [childInsights, setChildInsights] = useState({ goodAt: [], practiceNext: [], todaysLearning: [] });
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState({});

  useEffect(() => {
    const fetchInsights = async () => {
      console.log('MathJourney: studentId received:', studentId);
      if (studentId) {
        console.log('Fetching child insights for student:', studentId);
        const insights = await getChildLearningInsights(studentId);
        console.log('Child insights received:', insights);
        setChildInsights(insights);
        
        // Generate AI feedback for each topic
        const feedbackPromises = [];
        
        // Generate feedback for strengths
        insights.goodAt.forEach(topic => {
          feedbackPromises.push(
            generateAIFeedback(topic, 'strength').then(feedback => ({
              topic: topic.topic,
              type: 'strength',
              feedback
            }))
          );
        });
        
        // Generate feedback for practice areas
        insights.practiceNext.forEach(topic => {
          feedbackPromises.push(
            generateAIFeedback(topic, 'practice').then(feedback => ({
              topic: topic.topic,
              type: 'practice',
              feedback
            }))
          );
        });
        
        // Wait for all AI feedback to be generated
        const allFeedback = await Promise.all(feedbackPromises);
        const feedbackMap = {};
        allFeedback.forEach(item => {
          feedbackMap[`${item.topic}_${item.type}`] = item.feedback;
        });
        
        setAiFeedback(feedbackMap);
      }
      setLoading(false);
    };

    fetchInsights();
  }, [studentId]);

  return (
    <div className="math-journey-container">
      <div className="math-journey-header">
        <button className="back-btn" onClick={onBack} aria-label="Go Back">⏪ Back</button>
        <h1>My Math Journey</h1>
      </div>

      {/* What I'm Good At Section */}
      {childInsights.goodAt.length > 0 && (
        <div className="insights-section good-at-section">
          <h2 className="insights-title">⭐ What I'm Good At!</h2>
          <div className="good-at-grid">
            {childInsights.goodAt.map((topic, index) => (
              <div key={index} className="good-at-card">
                <div className="topic-icon">{topicIcons[topic.topic] || '📚'}</div>
                <div className="good-at-content">
                  <h4>You're a star at {friendlyNames[topic.topic] || topic.topic}!</h4>
                  <div className="accuracy-badge">{topic.accuracy}% correct!</div>
                  <div className="streak-info">🔥 {topic.streak} in a row!</div>
                  <div className="ai-feedback">
                    {aiFeedback[`${topic.topic}_strength`] || `Amazing work on ${friendlyNames[topic.topic] || topic.topic}! 🌟`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What to Practice Next Section */}
      {childInsights.practiceNext.length > 0 && (
        <div className="insights-section practice-section">
          <h2 className="insights-title">🎯 Let's Practice Together!</h2>
          <div className="practice-grid">
            {childInsights.practiceNext.map((item, index) => (
              <div key={index} className="practice-card">
                <div className="practice-icon">{topicIcons[item.topic] || '📚'}</div>
                <div className="practice-content">
                  <h3>Time to explore {friendlyNames[item.topic] || item.topic}!</h3>
                  <p className="practice-encouragement">
                    You've tried {item.attempts} times. Let's make it even better! 💪
                  </p>
                  <div className="ai-feedback">
                    {aiFeedback[`${item.topic}_practice`] || `Keep practicing ${friendlyNames[item.topic] || item.topic}! You're getting stronger! 🚀`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Learning Section */}
      {childInsights.todaysLearning.length > 0 && (
        <div className="insights-section todays-section">
          <h2 className="insights-title">📅 Today's Learning Adventure!</h2>
          <div className="todays-grid">
            {childInsights.todaysLearning.map((session, index) => (
              <div key={index} className="todays-card">
                <div className="todays-icon">{topicIcons[session.topic] || '📚'}</div>
                <div className="todays-content">
                  <h4>{friendlyNames[session.topic] || session.topic}</h4>
                  <p>You got {session.correct} out of {session.total} right!</p>
                  <span className="todays-time">at {session.time}</span>
                </div>
                <div className="todays-celebration">
                  {session.accuracy >= 80 ? '🎉' : session.accuracy >= 60 ? '👍' : '💪'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Grid */}
      <div className="insights-section">
        <h2 className="insights-title">📊 My Progress in All Topics</h2>
        <div className="topics-progress-grid">
          {Object.keys(topicIcons).map(topic => {
            const data = progressData[topic] || { completed: 0, total: 0, percent: 0 };
            return (
              <div className="topic-progress-card" key={topic}>
                <div className="topic-progress-icon bounce-anim">{topicIcons[topic]}</div>
                <div className="topic-progress-title">{friendlyNames[topic]}</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${data.percent}%` }}>
                    <span className="progress-bar-label">{data.percent}%</span>
                  </div>
                </div>
                <div className="progress-numbers">
                  {data.completed} / {data.total} done
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="math-journey-footer">
        <span role="img" aria-label="star">🌟</span> Keep going! Every step counts!
      </div>
    </div>
  );
};

export default MathJourney;
