import React, { useState, useEffect } from 'react';
import { generateMatchingPairs } from './openaiService';
import { 
  createMatchingSession, 
  updateMatchingSession, 
  addMatchingAttempt, 
  addMatchingEvent 
} from './matchingGameService';
import './MatchingGame.css';

const MatchingGame = ({ topic, studentId, onComplete, onBack }) => {
  const [pairs, setPairs] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [userMatches, setUserMatches] = useState({}); // {leftPairId: rightPairId}
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchLines, setMatchLines] = useState([]);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [aiFeedback, setAIFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [results, setResults] = useState([]);

  // Initialize game and generate pairs
  useEffect(() => {
    initializeGame();
  }, [topic]);

  const initializeGame = async () => {
    setLoading(true);
    try {
      // Generate matching pairs using OpenAI
      const generatedPairs = await generateMatchingPairs(topic);
      setPairs(generatedPairs);

      // Separate and shuffle items
      const left = generatedPairs.map((pair, index) => ({
        id: `left-${index}`,
        content: pair.left,
        pairId: index
      }));

      const right = shuffleArray(
        generatedPairs.map((pair, index) => ({
          id: `right-${index}`,
          content: pair.right,
          pairId: index
        }))
      );

      setLeftItems(left);
      setRightItems(right);

      // Create session in database
      const session = await createMatchingSession({
        student_id: studentId,
        topic_id: topic.id,
        difficulty_level: 'easy',
        total_pairs: generatedPairs.length,
        pairs_data: generatedPairs
      });

      setSessionId(session.id);
      setGameStartTime(Date.now());

      // Log game start event
      await addMatchingEvent(session.id, 'game_started', {
        topic: topic.name,
        total_pairs: generatedPairs.length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleLeftClick = (item) => {
    // If already matched, undo it
    if (userMatches[item.pairId] !== undefined) {
      handleUndo(item.pairId);
      return;
    }
    
    setSelectedLeft(item);
    
    // If right item already selected, create match
    if (selectedRight) {
      createMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item) => {
    // Allow selection even if already matched (for duplicate answers)
    // But if clicking a matched item, show it's already selected
    const matchedLeftPairIds = Object.keys(userMatches).filter(key => userMatches[key] === item.pairId);
    
    // If this right item is matched and we're clicking it again without a left selection,
    // allow undoing one of the matches
    if (matchedLeftPairIds.length > 0 && !selectedLeft) {
      // Undo the most recent match to this right item
      const lastMatchedLeftPairId = matchedLeftPairIds[matchedLeftPairIds.length - 1];
      handleUndo(parseInt(lastMatchedLeftPairId));
      return;
    }
    
    setSelectedRight(item);
    
    // If left item already selected, create match
    if (selectedLeft) {
      createMatch(selectedLeft, item);
    }
  };

  const createMatch = (leftItem, rightItem) => {
    // Store the match (don't check if correct yet)
    setUserMatches(prev => ({
      ...prev,
      [leftItem.pairId]: rightItem.pairId
    }));
    
    // Add line connecting the matched items
    addMatchLine(leftItem, rightItem);
    
    // Reset selections
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleUndo = (leftPairId) => {
    // Remove the match
    setUserMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[leftPairId];
      return newMatches;
    });
    
    // Remove the line
    setMatchLines(prev => prev.filter(line => line.id !== leftPairId));
    
    // Clear selections
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const addMatchLine = (leftItem, rightItem) => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      const leftEl = document.getElementById(`left-${leftItem.pairId}`);
      const rightEl = document.getElementById(`right-${rightItem.pairId}`);
      const gridEl = document.querySelector('.matching-grid');
      
      if (leftEl && rightEl && gridEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        const gridRect = gridEl.getBoundingClientRect();
        
        const line = {
          id: leftItem.pairId,
          x1: leftRect.right - gridRect.left,
          y1: leftRect.top + leftRect.height / 2 - gridRect.top,
          x2: rightRect.left - gridRect.left,
          y2: rightRect.top + rightRect.height / 2 - gridRect.top
        };
        
        setMatchLines(prev => [...prev, line]);
      }
    }, 50);
  };

  const handleSubmit = async () => {
    const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    // Check all matches
    const matchResults = [];
    let correctCount = 0;
    
    Object.keys(userMatches).forEach(leftPairId => {
      const rightPairId = userMatches[leftPairId];
      const leftItem = leftItems.find(item => item.pairId === parseInt(leftPairId));
      const rightItem = rightItems.find(item => item.pairId === rightPairId);
      
      // Check if the selected right item's content matches the correct answer
      // This allows multiple left items to match the same right answer
      const correctAnswer = pairs[parseInt(leftPairId)].right;
      const isCorrect = rightItem.content === correctAnswer;
      
      if (isCorrect) correctCount++;
      
      matchResults.push({
        leftItem: leftItem.content,
        rightItem: rightItem.content,
        isCorrect,
        correctAnswer: correctAnswer
      });
    });
    
    const accuracy = ((correctCount / pairs.length) * 100).toFixed(2);
    const incorrectCount = pairs.length - correctCount;
    
    // Store results
    setResults(matchResults);
    setGameStats({
      totalTime,
      accuracy,
      correctMatches: correctCount,
      incorrectAttempts: incorrectCount,
      totalPairs: pairs.length
    });

    try {
      // Update session in database
      await updateMatchingSession(sessionId, {
        ended_at: new Date().toISOString(),
        correct_matches: correctCount,
        incorrect_attempts: incorrectCount,
        total_time_spent: totalTime,
        accuracy_percentage: accuracy
      });

      // Log attempts
      for (const result of matchResults) {
        await addMatchingAttempt(sessionId, {
          attempt_number: matchResults.indexOf(result) + 1,
          left_item: result.leftItem,
          right_item: result.rightItem,
          is_correct: result.isCorrect,
          time_taken: 0
        });
      }

      // Log game completion event
      await addMatchingEvent(sessionId, 'game_completed', {
        total_time: totalTime,
        accuracy: accuracy,
        total_attempts: pairs.length
      });
    } catch (error) {
      console.error('Error updating game completion:', error);
    }

    // Show results first
    setShowResults(true);
  };

  const generateAIFeedback = async () => {
    setLoadingFeedback(true);
    setShowAIFeedback(true);

    try {
      const { generateDetailedFeedback } = await import('./openaiService');
      
      const feedback = await generateDetailedFeedback({
        topicName: topic.name,
        correctMatches: gameStats.correctMatches,
        incorrectAttempts: gameStats.incorrectAttempts,
        totalTime: gameStats.totalTime,
        accuracy: gameStats.accuracy,
        totalPairs: pairs.length,
        results: results
      });

      setAIFeedback(feedback);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      setAIFeedback('Great job completing the matching game! Keep practicing to improve your skills. 🌟');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleContinue = () => {
    onComplete({
      accuracy: gameStats.accuracy,
      totalTime: gameStats.totalTime,
      correctMatches: gameStats.correctMatches,
      incorrectAttempts: gameStats.incorrectAttempts
    });
  };


  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>🎮 Getting your game ready...</h2>
        <p>Creating fun matching pairs for {topic.name}!</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="results-screen">
        <div className="results-content">
          <button className="back-button-results" onClick={onBack}>
            ← Back to Topics
          </button>
          
          <h1 className="results-title">📊 Your Results</h1>
          
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-icon">✅</span>
              <span className="summary-value">{gameStats.correctMatches}/{gameStats.totalPairs}</span>
              <span className="summary-label">Correct</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">📈</span>
              <span className="summary-value">{gameStats.accuracy}%</span>
              <span className="summary-label">Accuracy</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏱️</span>
              <span className="summary-value">{gameStats.totalTime}s</span>
              <span className="summary-label">Time</span>
            </div>
          </div>

          <div className="results-list">
            <h3 className="results-list-title">Detailed Results:</h3>
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.isCorrect ? 'correct-result' : 'incorrect-result'}`}>
                <div className="result-match">
                  <span className="result-left">{result.leftItem}</span>
                  <span className="result-arrow">→</span>
                  <span className="result-right">{result.rightItem}</span>
                </div>
                <div className="result-status">
                  {result.isCorrect ? (
                    <span className="status-badge correct-badge">✓ Correct</span>
                  ) : (
                    <span className="status-badge incorrect-badge">
                      ✗ Wrong (Should be: {result.correctAnswer})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="ai-feedback-button" onClick={generateAIFeedback}>
              🤖 Get Detailed AI Feedback
            </button>
            <button className="continue-button" onClick={handleContinue}>
              Continue →
            </button>
          </div>
        </div>

        {/* AI Feedback Modal */}
        {showAIFeedback && (
          <div className="feedback-modal-overlay" onClick={() => setShowAIFeedback(false)}>
            <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowAIFeedback(false)}>
                ✕
              </button>
              <h2 className="feedback-title">🤖 Your Personalized Feedback</h2>
              
              {loadingFeedback ? (
                <div className="feedback-loading">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your answers and generating feedback...</p>
                </div>
              ) : (
                <div className="feedback-content">
                  <div className="feedback-text">{aiFeedback}</div>
                  <button className="feedback-close-btn" onClick={() => setShowAIFeedback(false)}>
                    Got it! 👍
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="matching-game-container" id="matching-container">
      {/* Header */}
      <div className="game-header">
        <button className="back-button" onClick={onBack} title="Back to Topics">
          ← Back
        </button>
        <h1 className="game-title">{topic.icon} {topic.name}</h1>
        <div className="game-stats">
          <div className="stat-badge">
            <span className="stat-icon">✅</span>
            <span>{Object.keys(userMatches).length} / {pairs.length}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="game-instructions">
        <p>👆 Click one item from each column to match them! Multiple problems can have the same answer. Click a matched pair to undo it.</p>
      </div>

      {/* Matching Grid */}
      <div className="matching-grid">
        {/* SVG Canvas for Lines */}
        <svg className="match-lines-svg" preserveAspectRatio="none">
          {matchLines.map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="match-line"
            />
          ))}
        </svg>

        {/* Left Column */}
        <div className="matching-column left-column">
          <h3 className="column-title">Match These:</h3>
          {leftItems.map((item) => (
            <div
              key={item.id}
              id={`left-${item.pairId}`}
              className={`matching-item ${
                selectedLeft?.id === item.id ? 'selected' : ''
              } ${
                userMatches[item.pairId] !== undefined ? 'matched' : ''
              }`}
              onClick={() => handleLeftClick(item)}
            >
              <span className="item-content">{item.content}</span>
              {userMatches[item.pairId] !== undefined && (
                <span className="match-checkmark">🔗</span>
              )}
            </div>
          ))}
        </div>

        {/* Center Arrow */}
        <div className="center-arrow">
          <div className="arrow-icon">↔️</div>
        </div>

        {/* Right Column */}
        <div className="matching-column right-column">
          <h3 className="column-title">With These:</h3>
          {rightItems.map((item) => {
            // Count how many times this right item has been matched
            const matchCount = Object.values(userMatches).filter(pairId => pairId === item.pairId).length;
            const isMatched = matchCount > 0;
            
            return (
              <div
                key={item.id}
                id={`right-${item.pairId}`}
                className={`matching-item ${
                  selectedRight?.id === item.id ? 'selected' : ''
                } ${
                  isMatched ? 'matched' : ''
                }`}
                onClick={() => handleRightClick(item)}
              >
                <span className="item-content">{item.content}</span>
                {isMatched && (
                  <span className="match-checkmark">
                    🔗{matchCount > 1 ? ` ×${matchCount}` : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-label">Your Progress:</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(Object.keys(userMatches).length / pairs.length) * 100}%`
            }}
          ></div>
        </div>
        <div className="progress-text">
          {Object.keys(userMatches).length} out of {pairs.length} matched! 🎯
        </div>
        
        {/* Submit Button - shows when all pairs are matched */}
        {Object.keys(userMatches).length === pairs.length && (
          <button className="submit-button" onClick={handleSubmit}>
            ✓ Submit Answers
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchingGame;