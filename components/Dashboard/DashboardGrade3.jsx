import React, { useState } from 'react';

const DashboardGrade3 = ({ user, startQuiz }) => {
  const [selectedGrade] = useState(user.grade);

  const topics = [
    { id: 1, name: 'Multiplication (≤10×10)', description: 'Learn multiplication facts', icon: '✖️' },
    { id: 2, name: 'Division (≤100)', description: 'Basic division strategies', icon: '➗' },
    { id: 3, name: 'Fractions', description: 'Understand halves, thirds, quarters', icon: '🧮' },
    { id: 4, name: 'Area & Perimeter', description: 'Calculate area and perimeter', icon: '📐' },
    { id: 5, name: 'Place Value (Thousands)', description: 'Understand hundreds and thousands', icon: '🏷️' },
    { id: 6, name: 'Graphs & Data', description: 'Read bar and pictographs', icon: '📊' },
    { id: 7, name: 'Time (Minute)', description: 'Tell and calculate time to the minute', icon: '🕘' },
    { id: 8, name: 'Money (Making Change)', description: 'Make change up to $10', icon: '💵' },
  ];

  const completionRate = user.progress && user.progress.totalQuestions > 0 ?
    Math.round((user.progress.completedQuizzes / topics.length) * 100) : 0;

  const accuracy = user.progress && user.progress.totalQuestions > 0 ?
    Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100) : 0;

  const handleStartQuiz = (topic) => {
    const difficulty = prompt('Select difficulty: 1 (Easy), 2 (Medium), or 3 (Hard)');
    if (difficulty && ['1', '2', '3'].includes(difficulty)) {
      startQuiz(topic, difficulty);
    }
  };

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <h1>Welcome, {user.username}!</h1>
        <p>Let\'s continue learning math today</p>
      </div>

      <div className="stats-container">
        <div className="stat-card"><p>Completion Rate</p><h2>{completionRate}%</h2></div>
        <div className="stat-card"><p>Accuracy</p><h2>{accuracy}%</h2></div>
        <div className="stat-card"><p>Current Grade</p><h2>{user.grade}</h2></div>
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

export default DashboardGrade3;
