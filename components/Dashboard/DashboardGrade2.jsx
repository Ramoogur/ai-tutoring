import React, { useState } from 'react';

const DashboardGrade2 = ({ user, startQuiz }) => {
  const [selectedGrade] = useState(user.grade);

  const topics = [
    { id: 1, name: 'Numbers to 100', description: 'Read and write numbers up to 100', icon: '🔢' },
    { id: 2, name: 'Addition & Subtraction (≤100)', description: 'Add and subtract numbers within 100', icon: '➕' },
    { id: 3, name: 'Place Value', description: 'Tens and ones', icon: '🏷️' },
    { id: 4, name: 'Intro to Multiplication', description: 'Multiply using equal groups', icon: '✖️' },
    { id: 5, name: '2D Shapes', description: 'Identify and classify shapes', icon: '🔺' },
    { id: 6, name: 'Measurement', description: 'Measure length, weight & capacity', icon: '📏' },
    { id: 7, name: 'Time (5-minute)', description: 'Tell time to the nearest 5 minutes', icon: '🕔' },
    { id: 8, name: 'Money', description: 'Count coins and bills', icon: '💰' },
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

export default DashboardGrade2;
