/**
 * Dashboard Component - UPDATED WITH PERFORMANCE TRACKER
 * This is the updated version with Performance Tracker integration
 */

import React, { useState } from 'react';
import PerformanceTracker from './PerformanceTracker/Performancetracker';

const Dashboard = ({ user, startQuiz, navigateToProgress }) => {
  // Always use the user's grade from their profile
  const [selectedGrade, setSelectedGrade] = useState(user.grade);
  const [showPerformanceTracker, setShowPerformanceTracker] = useState(false);
  
  const topics = [
    {
      id: 1,
      name: 'Numbers & Counting',
      description: 'Recognize numbers and practice counting',
      icon: '🔢',
    },
    {
      id: 2,
      name: 'Addition (within 10)',
      description: 'Add numbers up to 10',
      icon: '➕',
    },
    {
      id: 3,
      name: 'Patterns',
      description: 'Identify and complete patterns',
      icon: '🧩',
    },
    {
      id: 4,
      name: 'Shapes & Colours',
      description: 'Interactive shapes and colors exercises',
      icon: '🎨',
    },
    {
      id: 5,
      name: 'Measurement & Comparison',
      description: 'Measure, compare and order objects',
      icon: '📏',
    },
    {
      id: 6,
      name: 'Time',
      description: 'Learn to tell and understand time',
      icon: '🕒',
    },
    {
      id: 7,
      name: 'Money',
      description: 'Understand coins and money values',
      icon: '💰',
    },
    {
      id: 8,
      name: 'Ordinal Numbers',
      description: 'Learn about position and order',
      icon: '1️⃣',
    },
  ];

  const handleStartQuiz = (topic) => {
    // Directly start quiz; difficulty will be determined automatically
    startQuiz(topic);
  };

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <h1>Welcome, {user.username}!</h1>
        <p>Let's continue learning math today</p>
      </div>

      <div className="stats-container">
        <div className="stat-card journey-card" onClick={navigateToProgress}>
          <p>🚀 My Math Journey</p>
          <h2>View Progress</h2>
        </div>
        <div 
          className="stat-card performance-card" 
          onClick={() => setShowPerformanceTracker(true)}
        >
          <p>📊 Performance Tracker</p>
          <h2>View Analytics</h2>
        </div>
      </div>

      <div className="grade-info">
        <h2>Your Grade Level: 1</h2>
        <p>All content is tailored to your grade level</p>
      </div>

      <h2>Math Topics</h2>
      <div className="topic-grid">
        {topics.map(topic => (
          <div key={topic.id} className="topic-card" onClick={() => handleStartQuiz(topic)}>
            <div className="topic-icon" style={{ fontSize: '32px' }}>{topic.icon}</div>
            <h3>{topic.name}</h3>
            <p>{topic.description}</p>
          </div>
        ))}
      </div>

      <div className="games-section">
        <h2>Games</h2>
        <div className="topic-grid">
          <div className="topic-card" onClick={() => handleStartQuiz({ name: 'Abacus', description: 'Interactive counting with abacus' })}>
            <div className="topic-icon">🧮</div>
            <h3>Abacus</h3>
            <p>Interactive counting with abacus</p>
          </div>
          <div className="topic-card" onClick={() => handleStartQuiz({ name: 'Matching', description: 'Match numbers, shapes, and patterns' })}>
            <div className="topic-icon">🔗</div>
            <h3>Matching</h3>
            <p>Match numbers, shapes, and patterns</p>
          </div>
        </div>
      </div>

      {/* Performance Tracker Modal */}
      {showPerformanceTracker && (
        <PerformanceTracker 
          user={user} 
          onClose={() => setShowPerformanceTracker(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;