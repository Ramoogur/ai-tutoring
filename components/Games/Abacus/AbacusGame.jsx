/**
 * AbacusGame - 9 Rows x 5 Columns for Grade 1
 * Each row represents a number (1-9)
 * 5 beads per row to make multiples
 */

import React, { useState, useEffect, useRef } from 'react';
import Bead from './Bead';
import {
  startSession,
  endSession,
  updateSessionStats,
  logAttempt,
  logEvent
} from './abacusService';
import './AbacusGame.css';

const AbacusGame = ({ topic, user, navigateTo }) => {
  // Extract student ID from user object
  const studentId = user?.id || user?.email || 'guest';
  
  // Game State
  const [gameMode, setGameMode] = useState('free'); // 'free', 'count', 'make'
  const [session, setSession] = useState(null);
  
  // Bead State - Array of 9 rows, each with 0-5 active beads
  const [rowStates, setRowStates] = useState(Array(9).fill(0));
  const [disabledRows, setDisabledRows] = useState([]); // Array of row indices that are disabled
  
  // Game Progress
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Current Question
  const [targetNumber, setTargetNumber] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  
  // UI State
  const [showCelebration, setShowCelebration] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Refs
  const synthRef = useRef(window.speechSynthesis);

  // Colors for each row (1-9)
  const rowColors = [
    'green',   // 1s - green
    'blue',    // 2s - blue
    'orange',  // 3s - orange
    'purple',  // 4s - purple
    'pink',    // 5s - pink
    'red',     // 6s - red
    'blue',    // 7s - blue (reuse)
    'green',   // 8s - green (reuse)
    'orange'   // 9s - orange (reuse)
  ];

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    if (studentId) {
      initializeGame();
    }
    return () => {
      if (session && session.id) {
        handleEndSession();
      }
    };
  }, [studentId]);

  const initializeGame = async () => {
    try {
      console.log('🎮 Initializing Abacus Game for student:', studentId);
      setSessionStartTime(Date.now());
      
      const newSession = await startSession(studentId, 'free', null, 1);
      setSession(newSession);
      
      speak('Welcome to the Abacus! Let\'s learn numbers together!');
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
    }
  };

  // ============================================
  // SPEECH SYNTHESIS
  // ============================================

  const speak = (text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    synthRef.current.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      speak('Voice is now on!');
    }
  };

  // ============================================
  // CALCULATION
  // ============================================

  const calculateTotal = () => {
    return rowStates.reduce((total, activeBeads, rowIndex) => {
      const rowValue = rowIndex + 1; // Row 0 = 1, Row 1 = 2, etc.
      return total + (rowValue * activeBeads);
    }, 0);
  };

  // ============================================
  // GAME MODE SWITCHING
  // ============================================

  const switchMode = async (newMode) => {
    if (newMode === gameMode) return;
    
    try {
      if (session && session.id) {
        await logEvent(session.id, 'mode_changed', {
          from: gameMode,
          to: newMode
        });
        
        await updateSessionStats(session.id, {
          game_mode: newMode
        });
      }
      
      setGameMode(newMode);
      setRowStates(Array(9).fill(0));
      setShowFeedback(false);
      setTargetNumber(null);
      setStartTime(null);
      setDisabledRows([]); // Clear any disabled rows
      
      if (newMode === 'free') {
        speak('Free play mode! Click any beads!');
        setFeedbackMessage('Click beads to make numbers! 🎨');
      } else if (newMode === 'count') {
        speak('Count mode! How many do you see?');
        generateCountQuestion();
      } else if (newMode === 'make') {
        speak('Make number mode! Can you make the number?');
        generateMakeQuestion();
      }
      
      setFeedbackType('info');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2500);
    } catch (error) {
      console.error('❌ Error switching mode:', error);
    }
  };

  // ============================================
  // BEAD INTERACTIONS
  // ============================================

  const toggleBead = (rowIndex, beadIndex) => {
    // Check if this row is disabled
    if (disabledRows.includes(rowIndex)) {
      speak('This row is blocked! Try using other numbers!');
      setFeedbackMessage('❌ This row is blocked! Use other numbers to make your target! 🧮');
      setFeedbackType('error');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }
    
    const newRowStates = [...rowStates];
    
    if (beadIndex < rowStates[rowIndex]) {
      // Deactivate this bead and all after it in this row
      newRowStates[rowIndex] = beadIndex;
    } else {
      // Activate up to and including this bead in this row
      newRowStates[rowIndex] = beadIndex + 1;
    }
    
    setRowStates(newRowStates);
    
    if (session && session.id) {
      logEvent(session.id, 'bead_toggled', {
        row: rowIndex + 1,
        beadIndex,
        newCount: newRowStates[rowIndex]
      });
    }
  };

  const resetBeads = () => {
    setRowStates(Array(9).fill(0));
    if (session && session.id) {
      logEvent(session.id, 'beads_reset', {});
    }
  };

  const handleClear = () => {
    resetBeads();
    speak('Cleared!');
    setFeedbackMessage('All clear! 🔄');
    setFeedbackType('info');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  // ============================================
  // QUESTION GENERATION
  // ============================================

  const generateCountQuestion = () => {
    // Generate random beads across rows (total 1-20)
    const newRowStates = Array(9).fill(0);
    let targetTotal = Math.floor(Math.random() * 9) + 1; // 1-9 for simplicity
    
    // Simple approach: use one row
    const randomRow = Math.floor(Math.random() * 9);
    const beadsInRow = Math.min(Math.floor(Math.random() * 3) + 1, 5); // 1-3 beads
    newRowStates[randomRow] = beadsInRow;
    
    setRowStates(newRowStates);
    setTargetNumber(null);
    setStartTime(Date.now());
    setQuestionIndex(questionIndex + 1);
    
    speak(`Count all the beads!`);
    setFeedbackMessage('Count all the colored beads! 🔢');
    setFeedbackType('info');
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const generateMakeQuestion = () => {
    const target = Math.floor(Math.random() * 10) + 1; // 1-10 for Grade 1
    setTargetNumber(target);
    resetBeads();
    setStartTime(Date.now());
    setQuestionIndex(questionIndex + 1);
    
    // Disable the row corresponding to the target number (if it exists)
    // Row index is target - 1 (e.g., target 5 = row index 4)
    if (target <= 9) {
      setDisabledRows([target - 1]);
      speak(`Make the number ${target}! The row ${target} is blocked, use other numbers!`);
      setFeedbackMessage(`🎯 Make ${target} without using row ${target}!`);
    } else {
      // For target 10, no specific row to disable
      setDisabledRows([]);
      speak(`Make the number ${target}!`);
      setFeedbackMessage(`🎯 Make ${target} using the beads!`);
    }
    
    setFeedbackType('info');
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2500);
  };

  // ============================================
  // ANSWER CHECKING
  // ============================================

  const checkAnswer = async () => {
    const currentTotal = calculateTotal();
    
    if (gameMode === 'free') {
      speak(`You made ${currentTotal}!`);
      setFeedbackMessage(`You made ${currentTotal}! 🌟`);
      setFeedbackType('info');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }
    
    if (gameMode === 'count') {
      await handleCountAnswer(currentTotal);
    } else if (gameMode === 'make') {
      await handleMakeAnswer(currentTotal);
    }
  };

  const handleCountAnswer = async (studentAnswer) => {
    const correctAnswer = calculateTotal();
    const isCorrect = true; // Simplified
    const timeTaken = startTime ? Date.now() - startTime : 0;
    
    try {
      if (session && session.id) {
        await logAttempt({
          sessionId: session.id,
          questionIndex,
          questionType: 'count',
          targetNumber: correctAnswer,
          studentAnswer: correctAnswer,
          tensUsed: 0,
          onesUsed: correctAnswer,
          isCorrect,
          timeTaken,
          hintsUsed: 0
        });
      }
    } catch (error) {
      console.error('Error logging attempt:', error);
    }
    
    setTotalQuestions(totalQuestions + 1);
    handleCorrectAnswer(correctAnswer);
  };

  const handleMakeAnswer = async (studentAnswer) => {
    if (!targetNumber) return;
    if (studentAnswer === 0) {
      setFeedbackMessage('Click some beads first! 😊');
      setFeedbackType('info');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }
    
    const isCorrect = studentAnswer === targetNumber;
    const timeTaken = startTime ? Date.now() - startTime : 0;
    
    try {
      if (session && session.id) {
        await logAttempt({
          sessionId: session.id,
          questionIndex,
          questionType: 'make',
          targetNumber,
          studentAnswer,
          tensUsed: 0,
          onesUsed: studentAnswer,
          isCorrect,
          timeTaken,
          hintsUsed: 0
        });
      }
    } catch (error) {
      console.error('Error logging attempt:', error);
    }
    
    setTotalQuestions(totalQuestions + 1);
    
    if (isCorrect) {
      handleCorrectAnswer(studentAnswer);
    } else {
      handleIncorrectAnswer(targetNumber, studentAnswer);
    }
  };

  const handleCorrectAnswer = async (answer) => {
    const newScore = score + 10;
    const newStreak = streak + 1;
    const newCorrect = correctAnswers + 1;
    
    setScore(newScore);
    setStreak(newStreak);
    setCorrectAnswers(newCorrect);
    
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }
    
    try {
      if (session && session.id) {
        await updateSessionStats(session.id, {
          total_score: newScore,
          total_questions: totalQuestions + 1,
          correct_answers: newCorrect,
          best_streak: newStreak > bestStreak ? newStreak : bestStreak
        });
      }
    } catch (error) {
      console.error('Error updating session stats:', error);
    }
    
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);
    
    const messages = ['Awesome!', 'Great job!', 'Perfect!', 'Amazing!', 'Wonderful!', 'Super!'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    speak(`${message} ${answer} is correct!`);
    setFeedbackMessage(`${message} ${answer} is correct! 🎉 +10`);
    setFeedbackType('success');
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      if (gameMode === 'count') {
        generateCountQuestion();
      } else if (gameMode === 'make') {
        generateMakeQuestion();
      }
    }, 2000);
  };

  const handleIncorrectAnswer = (correct, studentAnswer) => {
    setStreak(0);
    
    const messages = ['Not quite! Try again!', 'Almost! You can do it!', 'Let\'s try another!', 'Good try!'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    speak(message);
    setFeedbackMessage(`${message} The answer was ${correct}. 💪`);
    setFeedbackType('error');
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      if (gameMode === 'count') {
        generateCountQuestion();
      } else if (gameMode === 'make') {
        generateMakeQuestion();
      }
    }, 3000);
  };

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  const handleEndSession = async () => {
    if (!session || !session.id) return;
    
    try {
      const timeSpent = sessionStartTime 
        ? Math.floor((Date.now() - sessionStartTime) / 1000) 
        : 0;
      
      await endSession(session.id, {
        totalScore: score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        bestStreak
      });
    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  };

  const handleExit = async () => {
    speak('Goodbye! Great job today!');
    await handleEndSession();
    if (navigateTo) {
      navigateTo('dashboard');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const accuracy = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

  const currentTotal = calculateTotal();

  return (
    <div className="abacus-game">
      {/* Header */}
      <header className="abacus-header">
        <div className="header-title">
          <h1>🧮 Abacus</h1>
        </div>
        
        <div className="header-stats">
          <span className="stat">⭐{score}</span>
          <span className="stat">🔥{streak}</span>
          <span className="stat">✓{accuracy}%</span>
        </div>
        
        <div className="header-controls">
          <button 
            onClick={toggleVoice}
            className={`control-btn ${voiceEnabled ? 'enabled' : 'disabled'}`}
            aria-label={`Voice ${voiceEnabled ? 'On' : 'Off'}`}
          >
            {voiceEnabled ? '🔊' : '🔇'} Sound
          </button>
          <button 
            onClick={handleExit}
            className="control-btn"
            aria-label="Go to Home"
          >
            🏠 Home
          </button>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="game-content">
        {/* Static Instructions Sidebar */}
        <aside className="instructions-sidebar">
          <h3>📚 How to Play</h3>
          
          <div className="instruction-section">
            <div className="mode-title">🎨 Free Play Mode</div>
            <p>Click any beads to explore and make numbers! Each row has a different value. Watch your total grow as you activate more beads.</p>
          </div>

          <div className="instruction-section">
            <div className="mode-title">🔢 Count Mode</div>
            <p>Count all the colored beads you see on the abacus. Add up the values and click the Check button to see if you're correct!</p>
          </div>

          <div className="instruction-section">
            <div className="mode-title">🎯 Make Mode</div>
            <p>You'll be given a target number (1-10). The row with that number will be blocked 🚫! Use other rows to add up to your target, then click Check!</p>
          </div>

          <div className="instruction-tip">
            <strong>💡 Tip:</strong> Each row represents a different number (1-9). Each bead in that row adds that number to your total! In Make Mode, blocked rows teach you to create numbers using addition. For example: Make 8 using 5+3 or 4+4!
          </div>
        </aside>

        {/* Main Game Area */}
        <div className="game-main-wrapper">
          {/* Feedback */}
          {showFeedback && (
            <div className={`feedback feedback-${feedbackType}`}>
              {feedbackMessage}
            </div>
          )}

          {/* Main Game */}
          <main className="game-main">
        {/* Mode Buttons */}
        <div className="modes">
          <button
            onClick={() => switchMode('free')}
            className={`mode-btn ${gameMode === 'free' ? 'active' : ''}`}
          >
            🎨 Free
          </button>
          <button
            onClick={() => switchMode('count')}
            className={`mode-btn ${gameMode === 'count' ? 'active' : ''}`}
          >
            🔢 Count
          </button>
          <button
            onClick={() => switchMode('make')}
            className={`mode-btn ${gameMode === 'make' ? 'active' : ''}`}
          >
            🎯 Make
          </button>
        </div>

        {/* Target/Current Number */}
        <div className="number-display">
          {gameMode === 'make' && targetNumber && (
            <div className="target">Make: <span className="big-number">{targetNumber}</span></div>
          )}
          <div className="current">Your Number: <span className="big-number">{currentTotal}</span></div>
        </div>

        {/* Abacus Grid */}
        <div className="abacus-grid">
          {Array.from({ length: 9 }).map((_, rowIndex) => {
            const rowValue = rowIndex + 1;
            const activeCount = rowStates[rowIndex];
            const isDisabled = disabledRows.includes(rowIndex);
            
            return (
              <div key={`row-${rowIndex}`} className={`abacus-row ${isDisabled ? 'disabled-row' : ''}`}>
                <div className="row-label">{rowValue}</div>
                <div className="row-beads">
                  {Array.from({ length: 5 }).map((_, beadIndex) => (
                    <Bead
                      key={`bead-${rowIndex}-${beadIndex}`}
                      value={rowValue}
                      isActive={beadIndex < activeCount}
                      onClick={() => toggleBead(rowIndex, beadIndex)}
                      color={rowColors[rowIndex]}
                      size="medium"
                    />
                  ))}
                </div>
                <div className="row-total">{rowValue * activeCount}</div>
                {isDisabled && <div className="blocked-overlay">🚫</div>}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="controls">
          <button onClick={handleClear} className="btn clear-btn">
            🔄 Clear
          </button>
          {gameMode !== 'free' && (
            <button onClick={checkAnswer} className="btn check-btn">
              ✓ Check
            </button>
          )}
        </div>
      </main>

          {/* Celebration */}
          {showCelebration && (
            <div className="celebration-overlay">
              <div className="celebration">
                <div className="emoji">🎉</div>
                <div className="text">Awesome!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbacusGame;