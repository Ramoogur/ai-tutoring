import React, { useState } from 'react';

const Dashboard = ({ user, startQuiz }) => {
  // Always use the user's grade from their profile
  const [selectedGrade, setSelectedGrade] = useState(user.grade);
  
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
      description: 'Explore shapes and colours',
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

  // Calculate stats
  const completionRate = user.progress && user.progress.totalQuestions > 0
    ? Math.round((user.progress.completedQuizzes / topics.length) * 100)
    : 0;
  
  const accuracy = user.progress && user.progress.totalQuestions > 0
    ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
    : 0;

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
        <div className="stat-card">
          <p>Completion Rate</p>
          <h2>{completionRate}%</h2>
        </div>
        <div className="stat-card">
          <p>Accuracy</p>
          <h2>{accuracy}%</h2>
        </div>
        <div className="stat-card">
          <p>Current Grade</p>
          <h2>{user.grade}</h2>
        </div>
      </div>

      <div className="grade-info">
        <h2>Your Grade Level: {selectedGrade}</h2>
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
    </div>
  );
};

export default Dashboard;