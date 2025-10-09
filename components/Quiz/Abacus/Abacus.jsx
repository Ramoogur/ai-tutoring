import React, { useState, useEffect, useRef } from 'react';
import './Abacus.css';
import { startGameSession, endGameSession, logAttempt, logEvent } from '../../../utils/abacusApi';

// Voice synthesis function
const speak = (text, options = {}) => {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = options.rate || 0.9;
  utter.pitch = options.pitch || 1.1;
  utter.volume = options.volume || 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

const Abacus = ({ topic, user, navigateTo }) => {
  const [gameMode, setGameMode] = useState('freePlay'); // 'freePlay', 'challenge', 'practice'
  const [targetNumber, setTargetNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [beadPositions, setBeadPositions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // New Grade-1 features
  const [session, setSession] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const boardRef = useRef(null);

  // Calculate total from tens and ones
  const userAnswer = tens * 10 + ones;
  
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

  // Initialize session for data capture
  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          // Map game modes to valid modes for database constraint
          const modeMap = {
            'freePlay': 'free',
            'practice': 'count', 
            'challenge': 'make'
          };
          
          const s = await startGameSession({ 
            studentId: user.id, 
            mode: modeMap[gameMode] || 'free',
            targetNumber: null 
          });
          setSession(s);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        // Continue without session for demo
      }
    })();
  }, [user?.id, gameMode]); // Add gameMode dependency

  // Generate new target number based on level
  const generateNewTarget = () => {
    const maxNumber = Math.min(3 + level, 10);
    const newTarget = Math.floor(Math.random() * maxNumber) + 1;
    setTargetNumber(newTarget);
    setShowHint(false);
    setFeedback('');
    setTens(0);
    setOnes(0);
    setQIndex(prev => prev + 1);
    
    // Voice instruction
    const phrase = `Make ${newTarget} on the abacus.`;
    if (voiceEnabled) speak(phrase);
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
    
    // Log bead move event
    const bead = beadPositions.find(b => b.id === beadId);
    if (bead) {
      logEvent({ 
        sessionId: session?.id, 
        eventType: 'bead_move', 
        eventData: { 
          beadId, 
          row: bead.row, 
          value: bead.value, 
          action: bead.active ? 'deactivate' : 'activate'
        } 
      });
    }
    
    // Play sound effect (simulated)
    setTimeout(() => setIsAnimating(false), 200);
  };

  const calculateTotal = () => {
    return beadPositions.reduce((total, bead) => 
      bead.active ? total + bead.value : total, 0
    );
  };

  const resetAbacus = () => {
    setTens(0);
    setOnes(0);
    setBeadPositions(prev => 
      prev.map(bead => ({ ...bead, active: false }))
    );
  };

  const showHintHelper = () => {
    if (!targetNumber) return;
    
    setShowHint(true);
    const hintText = `Try using ${Math.floor(targetNumber / 5)} big beads (5s) and ${targetNumber % 5} small beads (1s)!`;
    setFeedback(`💡 Hint: ${hintText}`);
    
    // Voice hint
    if (voiceEnabled) speak(hintText);
    
    // Log hint event
    logEvent({ 
      sessionId: session?.id, 
      eventType: 'hint_used', 
      eventData: { targetNumber, hintText } 
    });
  };

  useEffect(() => {
    // Auto-check in challenge/practice mode
    if ((gameMode === 'challenge' || gameMode === 'practice') && targetNumber && userAnswer > 0) {
      checkAnswer(userAnswer);
    }
  }, [tens, ones, gameMode, targetNumber]);

  const checkAnswer = async (answer = userAnswer) => {
    if (!targetNumber || answer === 0) return;
    
    const isCorrect = answer === targetNumber;
    
    // Log attempt
    if (session && session.id !== '00000000-0000-0000-0000-000000000001') {
      // Map game modes to valid question types for database constraint
      const questionTypeMap = {
        'freePlay': 'count',
        'practice': 'count', 
        'challenge': 'make'
      };
      
      console.log('🎯 Logging attempt with session:', session.id, 'gameMode:', gameMode, 'questionType:', questionTypeMap[gameMode] || 'count');
      
      await logAttempt({
        sessionId: session.id,
        questionIndex: qIndex,
        questionType: questionTypeMap[gameMode] || 'count',
        targetNumber: targetNumber,
        studentAnswer: answer,
        tensUsed: tens,
        onesUsed: ones,
        isCorrect: isCorrect,
        timeTaken: 0,
        hintsUsed: showHint ? 1 : 0
      });
    } else if (session && session.id === '00000000-0000-0000-0000-000000000001') {
      console.log('⚠️ Skipping attempt logging - using mock session ID');
    } else {
      console.log('⚠️ No session available for attempt logging');
    }
    
    if (isCorrect) {
      // Correct answer celebration
      setScore(score + 10 * level);
      setStreak(streak + 1);
      setTotalCorrect(totalCorrect + 1);
      
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      
      setShowCelebration(true);
      const successMessage = `Perfect! ${targetNumber} is correct!`;
      setFeedback(`🎉 ${successMessage} +${10 * level} points`);
      
      // Voice feedback
      if (voiceEnabled) speak('Great job!');
      
      // Level up every 5 correct answers
      if ((totalCorrect + 1) % 5 === 0 && level < 5) {
        setLevel(level + 1);
        setFeedback(`🌟 Level Up! You're now at Level ${level + 1}! +${10 * level} points`);
        if (voiceEnabled) speak(`Level up! You're now at Level ${level + 1}!`);
      }
      
      setTimeout(() => {
        setShowCelebration(false);
        resetAbacus();
        generateNewTarget();
      }, 2000);
      
    } else if (answer > targetNumber) {
      const message = `Too high! Try ${targetNumber}, not ${answer}`;
      setFeedback(`📉 ${message}`);
      if (voiceEnabled) speak(message);
      setStreak(0);
    } else {
      const message = `Too low! Try ${targetNumber}, not ${answer}`;
      setFeedback(`📈 ${message}`);
      if (voiceEnabled) speak(message);
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
    setTens(0);
    setOnes(0);
    resetAbacus();
    
    // Log mode change
    logEvent({ 
      sessionId: session?.id, 
      eventType: 'mode_change', 
      eventData: { mode } 
    });
    
    if (mode === 'freePlay') {
      setTargetNumber(null);
      const message = 'Free Play Mode: Create any number you want on the abacus!';
      setFeedback(`🎨 ${message}`);
      if (voiceEnabled) speak(message);
    } else {
      generateNewTarget();
    }
  };

  const getEncouragement = () => {
    if (streak >= 10) return "🔥 You're on fire! Amazing streak!";
    if (streak >= 5) return "⭐ Great streak! Keep it up!";
    if (totalCorrect >= 20) return "🏆 Abacus Champion!";
    if (totalCorrect >= 10) return "🎯 Getting really good!";
    return "🌟 You're doing great!";
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (session) {
      endGameSession(session.id, { 
        score, 
        totalPrompts: qIndex,
        correctAnswers: Math.floor(score / 10),
        level,
        bestStreak,
        timeSpent: 0 // You can track actual time if needed
      });
    }
  }, [session, score, qIndex, level, bestStreak]);

  return (
    <div className="modern-abacus-game" ref={boardRef}>
      {/* Header */}
      <div className="modern-header">
        <div className="header-left">
          <h1 className="game-title">Math Whiz</h1>
        </div>
        <div className="header-right">
          <div className="header-nav">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Logout</a>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <button 
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`voice-btn ${voiceEnabled ? 'enabled' : 'disabled'}`}
          aria-label={`Voice ${voiceEnabled ? 'enabled' : 'disabled'}`}
        >
          {voiceEnabled ? '🔊' : '🔇'}
        </button>
        <button 
          onClick={checkAnswer}
          className="check-btn"
          aria-label="Check Answer"
        >
          ✓
        </button>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${gameMode === 'freePlay' ? 'active' : ''}`}
          onClick={() => switchMode('freePlay')}
        >
          🎨 Free
        </button>
        <button 
          className={`mode-btn ${gameMode === 'practice' ? 'active' : ''}`}
          onClick={() => switchMode('practice')}
        >
          📚 Count
        </button>
        <button 
          className={`mode-btn ${gameMode === 'challenge' ? 'active' : ''}`}
          onClick={() => switchMode('challenge')}
        >
          🏆 Make
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Target Display */}
        {targetNumber && (
          <div className="target-display">
            <div className="target-label">Make this number:</div>
            <div className="target-number">{targetNumber}</div>
            <div className="target-actions">
              <button onClick={showHintHelper} className="action-btn" aria-label="Get Hint">
                💡 Hint
              </button>
              <button onClick={resetAbacus} className="action-btn" aria-label="Clear Abacus">
                🔄 Clear
              </button>
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="encouragement">
          <span className="encouragement-icon">⭐</span>
          <span>You're doing great!</span>
        </div>

        {/* Place Value Container */}
        <div className={`place-value-container ${showCelebration ? 'celebrating' : ''}`}>
          {/* Place Value Sections */}
          <div className="place-value-sections">
            {/* Tens Section */}
            <div className="place-value-section">
              <div className="section-header">
                <div className="section-label">Tens</div>
                <div className="value-display">{tens}</div>
              </div>
              <div className="bead-grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={`tens-${i}`}
                    className={`bead tens-bead ${i < tens ? 'active' : ''}`}
                    onClick={() => setTens(i + 1)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setTens(Math.max(0, i));
                    }}
                    aria-label={`Set tens to ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="control-buttons">
                <button onClick={() => setTens(Math.max(0, tens - 1))} className="control-btn minus">-</button>
                <button onClick={() => setTens(Math.min(9, tens + 1))} className="control-btn plus">+</button>
              </div>
            </div>
            
            {/* Ones Section */}
            <div className="place-value-section">
              <div className="section-header">
                <div className="section-label">Ones</div>
                <div className="value-display">{ones}</div>
              </div>
              <div className="bead-grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={`ones-${i}`}
                    className={`bead ones-bead ${i < ones ? 'active' : ''}`}
                    onClick={() => setOnes(i + 1)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setOnes(Math.max(0, i));
                    }}
                    aria-label={`Set ones to ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="control-buttons">
                <button onClick={() => setOnes(Math.max(0, ones - 1))} className="control-btn minus">-</button>
                <button onClick={() => setOnes(Math.min(9, ones + 1))} className="control-btn plus">+</button>
              </div>
            </div>
          </div>
          
          {/* Total Display */}
          <div className="total-display">
            <div className="total-label">Total:</div>
            <div className={`total-number ${userAnswer === targetNumber && targetNumber ? 'correct' : ''}`}>
              {userAnswer}
            </div>
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`feedback-message ${showCelebration ? 'celebration' : ''}`}>
            {feedback}
          </div>
        )}
      </div>

      <button onClick={() => navigateTo('dashboard')} className="back-btn">
        🏠 Back to Dashboard
      </button>
    </div>
  );
};

export default Abacus;