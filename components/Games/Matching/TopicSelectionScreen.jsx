import React, { useState, useEffect } from 'react';
import './TopicSelectionScreen.css';

const TOPICS = [
  {
    id: 1,
    name: 'Numbers & Counting',
    icon: '🔢',
    color: '#FF6B6B',
    description: 'Match numbers with pictures!'
  },
  {
    id: 2,
    name: 'Addition (within 10)',
    icon: '➕',
    color: '#4ECDC4',
    description: 'Match addition problems!'
  },
  {
    id: 3,
    name: 'Patterns',
    icon: '🔄',
    color: '#45B7D1',
    description: 'Complete the patterns!'
  },
  {
    id: 4,
    name: 'Shapes & Colours',
    icon: '🟦',
    color: '#FFA07A',
    description: 'Match shapes and colors!'
  },
  {
    id: 5,
    name: 'Measurement & Comparison',
    icon: '📏',
    color: '#98D8C8',
    description: 'Compare sizes and lengths!'
  },
  {
    id: 6,
    name: 'Time',
    icon: '🕐',
    color: '#F7B731',
    description: 'Learn about time!'
  },
  {
    id: 7,
    name: 'Money',
    icon: '💰',
    color: '#5F27CD',
    description: 'Match coins and amounts!'
  },
  {
    id: 8,
    name: 'Ordinal Numbers',
    icon: '🥇',
    color: '#00D2D3',
    description: 'Learn first, second, third!'
  }
];

const TopicSelectionScreen = ({ onTopicSelect, studentId, onBackToHome }) => {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  return (
    <div className="topic-selection-container">
      {/* Back Button */}
      {onBackToHome && (
        <button className="back-to-home-button" onClick={onBackToHome}>
          ← Back
        </button>
      )}
      
      {/* Header Section */}
      <div className="topic-header">
        <h1 className="topic-title">
          🎮 Choose Your Game Topic! 🎮
        </h1>
        <p className="topic-subtitle">
          Pick what you want to practice today!
        </p>
      </div>

      {/* Instructions Section */}
      <div className="instructions-card">
        <h2 className="instructions-title">📖 How to Play:</h2>
        <div className="instructions-list">
          <div className="instruction-item">
            <span className="instruction-number">1</span>
            <span className="instruction-text">Pick a colorful topic box</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-number">2</span>
            <span className="instruction-text">Match the pairs by clicking</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-number">3</span>
            <span className="instruction-text">Get stars for correct matches! ⭐</span>
          </div>
        </div>
      </div>

      {/* Topic Grid */}
      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            className={`topic-card ${hoveredTopic === topic.id ? 'hovered' : ''}`}
            style={{
              backgroundColor: topic.color,
              transform: hoveredTopic === topic.id ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={() => setHoveredTopic(topic.id)}
            onMouseLeave={() => setHoveredTopic(null)}
            onClick={() => onTopicSelect(topic)}
          >
            <div className="topic-icon">{topic.icon}</div>
            <h3 className="topic-name">{topic.name}</h3>
            <p className="topic-description">{topic.description}</p>
            <button className="play-button">
              🎮 Play Now!
            </button>
          </div>
        ))}
      </div>

      {/* Encouragement Section */}
      <div className="encouragement-banner">
        <p>✨ You're doing great! Pick a topic and let's learn together! ✨</p>
      </div>
    </div>
  );
};

export default TopicSelectionScreen;