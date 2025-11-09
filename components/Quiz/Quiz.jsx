// Quiz.jsx - ROUTER COMPONENT ONLY
// This file routes to specialized topic components
// Translation is handled in EACH individual topic component

import React from 'react';
import ShapesColors from './ShapesColors/ShapesColors';
import Time from './Time/Time';
import NumbersCounting from './NumbersCounting/NumbersCounting';
import Addition from './Addition/Addition';
import Measurement from './Measurement/Measurement';
import OrdinalNumbers from './OrdinalNumbers/OrdinalNumbers';
import Patterns from './Patterns/Patterns';
import Money from './Money/Money';
import Abacus from '../Games/Abacus';
import Matching from '../Games/Matching';

const Quiz = ({ topic, user, navigateTo }) => {
  if (!topic) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h2>No topic selected</h2>
          <button onClick={() => navigateTo ? navigateTo('dashboard') : window.location.href = '/dashboard'}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate component based on topic name
  const topicName = topic.name.toLowerCase();

  // Shapes & Colors
  if (topicName.includes('shape') || topicName.includes('colour') || topicName.includes('color')) {
    return <ShapesColors topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Time
  if (topicName.includes('time') || topicName.includes('clock')) {
    return <Time topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Ordinal Numbers (check BEFORE general numbers)
  if (topicName.includes('ordinal') || topicName.includes('position') || 
      topicName.includes('1st') || topicName.includes('2nd') || topicName.includes('3rd')) {
    return <OrdinalNumbers topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Numbers & Counting (but NOT ordinal)
  if (topicName.includes('number') || topicName.includes('count')) {
    return <NumbersCounting topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Addition
  if (topicName.includes('addition') || topicName.includes('add')) {
    return <Addition topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Measurement
  if (topicName.includes('measurement') || topicName.includes('comparison') || topicName.includes('measure')) {
    return <Measurement topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Patterns
  if (topicName.includes('pattern') || topicName.includes('sequence') || topicName.includes('repeat')) {
    return <Patterns topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Money
  if (topicName.includes('money') || topicName.includes('coin') || 
      topicName.includes('rupee') || topicName.includes('cent')) {
    return <Money topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Abacus
  if (topicName.includes('abacus')) {
    return <Abacus topic={topic} user={user} navigateTo={navigateTo} />;
  }

  // Matching Game
  if (topicName.includes('matching') || topicName.includes('match')) {
    return <Matching studentId={user.id} navigateTo={navigateTo} />;
  }

  // Default fallback
  return (
    <div className="quiz-container">
      <div className="error-message">
        <h2>Topic not supported yet</h2>
        <p>The topic "{topic.name}" doesn't have a quiz component yet.</p>
        <button onClick={() => navigateTo ? navigateTo('dashboard') : window.location.href = '/dashboard'}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Quiz;