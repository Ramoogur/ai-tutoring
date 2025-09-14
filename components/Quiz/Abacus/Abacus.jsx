import React, { useState, useEffect } from 'react';
import './Abacus.css';

const Abacus = ({ topic, user, navigateTo }) => {
  const [gameMode, setGameMode] = useState('freePlay'); // 'freePlay', 'challenge', 'practice'
  const [targetNumber, setTargetNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userAnswer, setUserAnswer] = useState(0);
  const [beadPositions, setBeadPositions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Initialize abacus with 10 beads (2 rows of 5)
  useEffect(() => {
    const initialBeads = [];
    for (let row = 0; row < 2; row++) {
      for (let bead = 0; bead < 5; bead++) {
        initialBeads.push({
          id: `${row}-${bead}`,
          row: row,
          position: bead,
          active: false,
          value: row === 0 ? 5 : 1 // Top row = 5, bottom row = 1
        });
      }
    }
    setBeadPositions(initialBeads);
  }, []);

  // Generate new target number based on level
  const generateNewTarget = () => {
    const maxNumber = Math.min(3 + level, 10);
    const newTarget = Math.floor(Math.random() * maxNumber) + 1;
    setTargetNumber(newTarget);
    setShowHint(false);
    setFeedback('');
  };

  // Start a new game
  useEffect(() => {
    if (gameMode === 'challenge' || gameMode === 'practice') {
      generateNewTarget();
    }
  }, [gameMode, level]);

  const toggleBead = (beadId) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setBeadPositions(prev => 
      prev.map(bead => 
        bead.id === beadId 
          ? { ...bead, active: !bead.active }
          : bead
      )
    );
    
    // Play sound effect (simulated)
    setTimeout(() => setIsAnimating(false), 200);
  };

  const calculateTotal = () => {
    return beadPositions.reduce((total, bead) => 
      bead.active ? total + bead.value : total, 0
    );
  };

  const resetAbacus = () => {
    setBeadPositions(prev => 
      prev.map(bead => ({ ...bead, active: false }))
    );
  };

  const showHintHelper = () => {
    if (!targetNumber) return;
    
    setShowHint(true);
    setFeedback(`💡 Hint: Try using ${Math.floor(targetNumber / 5)} big beads (5s) and ${targetNumber % 5} small beads (1s)!`);
  };

  useEffect(() => {
    const newAnswer = calculateTotal();
    setUserAnswer(newAnswer);
    
    // Auto-check in challenge/practice mode
    if ((gameMode === 'challenge' || gameMode === 'practice') && targetNumber && newAnswer > 0) {
      checkAnswer(newAnswer);
    }
  }, [beadPositions, gameMode, targetNumber]);

  const checkAnswer = (answer = userAnswer) => {
    if (!targetNumber || answer === 0) return;
    
    const isCorrect = answer === targetNumber;
    
    if (isCorrect) {
      // Correct answer celebration
      setScore(score + 10 * level);
      setStreak(streak + 1);
      setTotalCorrect(totalCorrect + 1);
      
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      
      setShowCelebration(true);
      setFeedback(`🎉 Perfect! ${targetNumber} is correct! +${10 * level} points`);
      
      // Level up every 5 correct answers
      if ((totalCorrect + 1) % 5 === 0 && level < 5) {
        setLevel(level + 1);
        setFeedback(`🌟 Level Up! You're now at Level ${level + 1}! +${10 * level} points`);
      }
      
      setTimeout(() => {
        setShowCelebration(false);
        resetAbacus();
        generateNewTarget();
      }, 2000);
      
    } else if (answer > targetNumber) {
      setFeedback(`📉 Too high! Try ${targetNumber}, not ${answer}`);
      setStreak(0);
    } else {
      setFeedback(`📈 Too low! Try ${targetNumber}, not ${answer}`);
      setStreak(0);
    }
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    setScore(0);
    setStreak(0);
    setLevel(1);
    setTotalCorrect(0);
    setFeedback('');
    resetAbacus();
    
    if (mode === 'freePlay') {
      setTargetNumber(null);
      setFeedback('🎨 Free Play Mode: Create any number you want on the abacus!');
    }
  };

  const getEncouragement = () => {
    if (streak >= 10) return "🔥 You're on fire! Amazing streak!";
    if (streak >= 5) return "⭐ Great streak! Keep it up!";
    if (totalCorrect >= 20) return "🏆 Abacus Champion!";
    if (totalCorrect >= 10) return "🎯 Getting really good!";
    return "🌟 You're doing great!";
  };

  return (
    <div className="abacus-container">
      <div className="abacus-layout">
        {/* Main Game Content */}
        <div className="abacus-main">
          {/* Game Header */}
          <div className="abacus-header">
        <h1>🧮 Abacus Game</h1>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value">{streak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Best</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="game-modes">
        <button 
          className={`mode-btn ${gameMode === 'freePlay' ? 'active' : ''}`}
          onClick={() => switchMode('freePlay')}
        >
          🎨 Free Play
        </button>
        <button 
          className={`mode-btn ${gameMode === 'practice' ? 'active' : ''}`}
          onClick={() => switchMode('practice')}
        >
          📚 Practice
        </button>
        <button 
          className={`mode-btn ${gameMode === 'challenge' ? 'active' : ''}`}
          onClick={() => switchMode('challenge')}
        >
          🏆 Challenge
        </button>
      </div>

      {/* Target Section */}
      {targetNumber && (
        <div className="target-section">
          <h2>Make this number: <span className="target-number">{targetNumber}</span></h2>
          <div className="target-helpers">
            <button onClick={showHintHelper} className="hint-btn">
              💡 Hint
            </button>
            <button onClick={resetAbacus} className="reset-btn">
              🔄 Clear
            </button>
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="encouragement">
        {getEncouragement()}
      </div>

      {/* Abacus */}
      <div className={`abacus-frame ${showCelebration ? 'celebrating' : ''}`}>
        <div className="abacus-title">Your Abacus</div>
        
        {/* Top row - 5s */}
        <div className="abacus-row top-row">
          <span className="row-label">5s</span>
          <div className="beads-container">
            {beadPositions
              .filter(bead => bead.row === 0)
              .map(bead => (
                <div
                  key={bead.id}
                  className={`bead top-bead ${bead.active ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
                  onClick={() => toggleBead(bead.id)}
                >
                  <span className="bead-number">5</span>
                  <div className="bead-glow"></div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="abacus-divider">
          <div className="divider-decoration"></div>
        </div>

        {/* Bottom row - 1s */}
        <div className="abacus-row bottom-row">
          <span className="row-label">1s</span>
          <div className="beads-container">
            {beadPositions
              .filter(bead => bead.row === 1)
              .map(bead => (
                <div
                  key={bead.id}
                  className={`bead bottom-bead ${bead.active ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
                  onClick={() => toggleBead(bead.id)}
                >
                  <span className="bead-number">1</span>
                  <div className="bead-glow"></div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Answer Display */}
      <div className="answer-section">
        <div className="current-total">
          <span className="total-label">Your Number:</span>
          <span className={`total-display ${userAnswer === targetNumber && targetNumber ? 'correct' : ''}`}>
            {userAnswer}
          </span>
        </div>
        
        {feedback && (
          <div className={`feedback-message ${showCelebration ? 'celebration' : ''}`}>
            {feedback}
          </div>
        )}
      </div>

        {/* Back Button */}
      </div>
      {/* Instructions Sidebar */}
      <aside className="abacus-sidebar">
        <div className="instructions">
          <h3>🎯 How to Play:</h3>
          <div className="instruction-grid">
            <div className="instruction-item">
              <span className="instruction-icon">🔴</span>
              <span>Red beads = 5 points</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🔵</span>
              <span>Blue beads = 1 point</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">👆</span>
              <span>Click to move beads</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🎯</span>
              <span>Match the target number</span>
            </div>
          </div>
        </div>
      </aside>
      </div>
      <button onClick={() => navigateTo('dashboard')} className="back-btn fixed-dashboard-btn">
        🏠 Back to Dashboard
      </button>
    </div>
  );
};

export default Abacus;
