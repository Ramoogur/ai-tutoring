import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { timeQuestions, timeColors, timeAssets } from '../../../data/timeQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import './Time.css';

const Time = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [droppedShapes, setDroppedShapes] = useState({}); // Track which item is dropped in each zone
  const [sequencedItems, setSequencedItems] = useState([]);
  const [coloredScenes, setColoredScenes] = useState(new Set());
  const [selectedColor, setSelectedColor] = useState(null);
  const [litTargets, setLitTargets] = useState(new Set());
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [sessionData, setSessionData] = useState({ correct: 0, total: 0 });

  // Normalize AI difficulty names to quiz difficulty names
  const normalizeDifficultyName = (aiDifficulty) => {
    const difficultyMap = {
      'Beginner': 'easy',
      'Easy': 'easy', 
      'Medium': 'medium',
      'Hard': 'hard',
      'Expert': 'hard'
    };
    return difficultyMap[aiDifficulty] || aiDifficulty.toLowerCase();
  };

  // AI-Enhanced initialization with adaptive difficulty
  useEffect(() => {
    (async () => {
      if (!topic || !user) return;
      
      // Reset quiz state
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setFeedback(null);
      setAiFeedback(null);
      setMatchedPairs(new Set());
      setDroppedShapes({});
      setSequencedItems([]);
      setColoredScenes(new Set());
      setSelectedColor(null);
      setLitTargets(new Set());
      setSessionData({ correct: 0, total: 0 });
      
      // Load current difficulty from database
      let savedDifficulty = 'easy'; // Default
      try {
        // Convert user.id to UUID string if it's an integer
        const studentId = typeof user.id === 'number' ? user.id.toString() : user.id;
        console.log(`🔍 Looking for student_id: ${studentId} (type: ${typeof studentId}), topic_id: ${topic.id}`);
        
        const { data: studentStats } = await supabase
          .from('StudentTopicStats')
          .select('current_difficulty')
          .eq('student_id', studentId)
          .eq('topic_id', topic.id)
          .single();
        
        if (studentStats?.current_difficulty) {
          savedDifficulty = studentStats.current_difficulty;
          console.log(`💾 Loaded saved difficulty: ${savedDifficulty}`);
        }
      } catch (error) {
        console.log('🆆 No previous progress found, starting at Easy level');
      }
      
      // Initialize AI system for Time with correct difficulty
      console.log(`🤖 Initializing AI Tutor for Time at ${savedDifficulty} difficulty`);
      aiController.startQuizSession('time');
      
      // Set AI to the correct difficulty level from database BEFORE starting
      aiTutor.setDifficultyForNextSession(savedDifficulty);
      setAiStatus(aiController.getAIStatus());
      
      // Use the loaded difficulty level and update state
      let difficultyLevel = savedDifficulty;
      setDifficulty(savedDifficulty); // Update React state for UI display
      console.log(`🎯 Starting quiz at difficulty: ${difficultyLevel}`);
      
      // Get all available questions across difficulties for AI selection
      const allQuestions = [
        ...(timeQuestions.easy || []).map(q => ({ ...q, difficulty: 'easy' })),
        ...(timeQuestions.medium || []).map(q => ({ ...q, difficulty: 'medium' })),
        ...(timeQuestions.hard || []).map(q => ({ ...q, difficulty: 'hard' }))
      ];
      
      // Let AI select optimal questions based on performance
      let selectedQuestions = [];
      if (allQuestions.length > 0) {
        selectedQuestions = aiController.prepareQuestions(allQuestions, 5);
        console.log(`🧠 AI selected ${selectedQuestions.length} personalized questions`);
      } else {
        console.warn('No questions available for AI selection');
        // Fallback to traditional difficulty-based selection
        switch (difficultyLevel) {
          case 'easy':
            selectedQuestions = timeQuestions.easy.slice(0, 5);
            break;
          case 'medium':
            selectedQuestions = [...timeQuestions.easy.slice(0, 2), ...timeQuestions.medium.slice(0, 3)];
            break;
          case 'hard':
            selectedQuestions = [...timeQuestions.medium.slice(0, 2), ...timeQuestions.hard.slice(0, 3)];
            break;
          default:
            selectedQuestions = timeQuestions.easy.slice(0, 5);
        }
        // Shuffle questions for variety
        selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      }
      
      setQuestions(selectedQuestions);
      
      // Start tracking the first question with AI
      if (selectedQuestions.length > 0) {
        const questionTrackingData = aiController.startQuestion(selectedQuestions[0]);
        setQuestionStartTime(questionTrackingData.startTime);
      }
      
    })();
  }, [topic, user]);

  // Generate SVG for time elements
  const generateTimeSVG = (element, color, size = 100) => {
    const center = size / 2;
    let svgElement = '';

    switch (element) {
      case 'sun':
        svgElement = `
          <circle cx="${center}" cy="${center}" r="${size * 0.3}" fill="${color}" stroke="#FF9800" stroke-width="2" />
          ${Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = center + Math.cos(angle) * (size * 0.4);
            const y1 = center + Math.sin(angle) * (size * 0.4);
            const x2 = center + Math.cos(angle) * (size * 0.5);
            const y2 = center + Math.sin(angle) * (size * 0.5);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round" />`;
          }).join('')}
        `;
        break;
      case 'moon':
        svgElement = `
          <path d="M ${center + 10} ${center - 30} A 30 30 0 1 0 ${center + 10} ${center + 30} A 25 25 0 1 1 ${center + 10} ${center - 30} Z" 
                fill="${color}" stroke="#90CAF9" stroke-width="2" />
        `;
        break;
      case 'stars':
        svgElement = Array.from({ length: 5 }, (_, i) => {
          const x = center + (Math.random() - 0.5) * size * 0.8;
          const y = center + (Math.random() - 0.5) * size * 0.8;
          return `<polygon points="${x},${y-8} ${x+3},${y-3} ${x+8},${y} ${x+3},${y+3} ${x},${y+8} ${x-3},${y+3} ${x-8},${y} ${x-3},${y-3}" 
                           fill="${color}" stroke="#FFC107" stroke-width="1" />`;
        }).join('');
        break;
      default:
        svgElement = `<circle cx="${center}" cy="${center}" r="${size * 0.3}" fill="${color}" />`;
    }

    return `
      <svg width="${size}" height="${size}" className="time-svg">
        ${svgElement}
      </svg>
    `;
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      // Always accept the drop regardless of correctness (like ShapesColors)
      setMatchedPairs(new Set([...matchedPairs, target]));
      setDroppedShapes(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSceneClick = (sceneId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'coloring' && selectedColor) {
      const scene = currentQuestion.scenes.find(s => s.id === sceneId);
      if (scene && selectedColor === scene.targetColor) {
        setColoredScenes(prev => new Set([...prev, sceneId]));
      }
    }
  };

  const handleInteractiveClick = (targetId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'interactive') {
      setLitTargets(new Set([targetId]));
      setSelectedOption(targetId);
    }
  };

  const playAudioSound = () => {
    setAudioPlaying(true);
    // In a real implementation, this would play the actual audio file
    setTimeout(() => setAudioPlaying(false), 2000);
  };

  const checkAnswer = async () => {
    if (isChecking) return;
    setIsChecking(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let feedbackMessage = '';

    switch (currentQuestion.type) {
      case 'identification':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'matching':
        // Count correct matches in dropped shapes
        let correctMatches = 0;
        Object.entries(droppedShapes).forEach(([target, item]) => {
          if (item.timeOfDay === target) {
            correctMatches++;
          }
        });
        isCorrect = correctMatches === currentQuestion.items.length;
        break;
      case 'fill_blank':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'true_false':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'coloring':
        isCorrect = coloredScenes.size === currentQuestion.scenes.length;
        break;
      case 'sequencing':
        isCorrect = sequencedItems.every((item, index) => item && item.correctOrder === index + 1);
        break;
      case 'interactive':
        isCorrect = selectedOption === currentQuestion.correctTarget;
        break;
      case 'audio_visual':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'multiple_choice':
        if (currentQuestion.multipleCorrect) {
          const selectedCorrect = currentQuestion.options.filter(opt => opt.isCorrect);
          isCorrect = selectedCorrect.length === (selectedOption?.length || 0);
        } else {
          isCorrect = selectedOption?.isCorrect;
        }
        break;
      default:
        isCorrect = false;
    }

    // Update session data for difficulty progression
    setSessionData(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      setScore(score + 1);
      feedbackMessage = 'Great job! That\'s correct! 🌟';
    } else {
      feedbackMessage = 'Not quite right. Try again next time! 💪';
    }

    setFeedback({ isCorrect, message: feedbackMessage });

    // AI Analysis with performance tracking
    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0;
    const analysisResult = aiController.analyzeResponse({
      question: currentQuestion,
      userAnswer: selectedOption || droppedShapes || coloredScenes || sequencedItems,
      isCorrect,
      responseTime,
      difficulty: currentQuestion.difficulty || difficulty
    });

    // Generate AI feedback
    const aiFeedbackResult = await aiController.generateFeedback({
      question: currentQuestion,
      isCorrect,
      analysisResult,
      studentProfile: aiTutor.getStudentProfile()
    });

    setAiFeedback(aiFeedbackResult);
    setAiStatus(aiController.getAIStatus());

    // Save individual question result to database (optional - for detailed tracking)
    if (user && topic) {
      try {
        // Note: We're not saving individual questions to avoid 404 errors
        // All data will be saved comprehensively in finishQuiz()
        console.log(`✅ Question ${currentQuestionIndex + 1} completed: ${isCorrect ? 'Correct' : 'Incorrect'}`);
      } catch (error) {
        console.warn('Individual question save skipped:', error);
      }
    }

    setTimeout(() => {
      setIsChecking(false);
      if (currentQuestionIndex + 1 < questions.length) {
        // Next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestionState();
        
        // Start tracking next question
        const nextQuestion = questions[currentQuestionIndex + 1];
        const questionTrackingData = aiController.startQuestion(nextQuestion);
        setQuestionStartTime(questionTrackingData.startTime);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setFeedback(null);
    setAiFeedback(null);
    setMatchedPairs(new Set());
    setDroppedShapes({});
    setSequencedItems([]);
    setColoredScenes(new Set());
    setSelectedColor(null);
    setLitTargets(new Set());
    setDraggedItem(null);
  };

  const finishQuiz = async () => {
    // Complete the quiz session with AI analysis
    const sessionSummary = await aiController.completeQuizSession({
      totalQuestions: questions.length,
      correctAnswers: score,
      topic: 'time',
      difficulty: difficulty,
      sessionData: sessionData
    });

    console.log('📊 Session Summary:', sessionSummary);

    // Calculate session accuracy for difficulty progression
    const sessionAccuracy = sessionData.total > 0 ? sessionData.correct / sessionData.total : 0;
    console.log(`📈 Session accuracy: ${(sessionAccuracy * 100).toFixed(1)}%`);

    // Determine next difficulty based on session performance
    let nextDifficulty = difficulty;
    let difficultyChanged = false;
    let progressionReason = '';

    if (sessionAccuracy >= 0.8) {
      // 80%+ accuracy - move up or stay at hard
      if (difficulty === 'easy') {
        nextDifficulty = 'medium';
        difficultyChanged = true;
        progressionReason = 'Excellent work! Moving to Medium level.';
      } else if (difficulty === 'medium') {
        nextDifficulty = 'hard';
        difficultyChanged = true;
        progressionReason = 'Outstanding performance! Moving to Hard level.';
      } else {
        progressionReason = 'Perfect! Staying at Hard level with new challenges.';
      }
    } else if (sessionAccuracy >= 0.6) {
      // 60-79% accuracy - stay at current level
      progressionReason = 'Good progress! Staying at current level to build confidence.';
    } else {
      // <60% accuracy - move down
      if (difficulty === 'hard') {
        nextDifficulty = 'medium';
        difficultyChanged = true;
        progressionReason = 'Let\'s practice more at Medium level.';
      } else if (difficulty === 'medium') {
        nextDifficulty = 'easy';
        difficultyChanged = true;
        progressionReason = 'Let\'s build stronger foundations at Easy level.';
      } else {
        progressionReason = 'Keep practicing! You\'re building important skills.';
      }
    }

    console.log(`🎯 Difficulty progression: ${difficulty} → ${nextDifficulty} (${progressionReason})`);

    // Save comprehensive session data to database
    if (user && topic) {
      try {
        // Convert user.id to UUID string if it's an integer
        const studentId = typeof user.id === 'number' ? user.id.toString() : user.id;
        console.log(`💾 Saving progress for student_id: ${studentId}, topic_id: ${topic.id}`);
        
        // Save to StudentTopicStats (overall progress)
        const { error: statsError } = await supabase
          .from('StudentTopicStats')
          .upsert({
            student_id: studentId,
            topic_id: topic.id,
            current_difficulty: nextDifficulty,
            last_accuracy: sessionAccuracy,
            total_attempts: sessionData.total,
            correct_answers: sessionData.correct,
            last_attempted: new Date().toISOString(),
            progress_data: {
              session_accuracy: sessionAccuracy,
              difficulty_progression: {
                from: difficulty,
                to: nextDifficulty,
                reason: progressionReason,
                changed: difficultyChanged
              },
              ai_insights: sessionSummary.insights || []
            }
          }, {
            onConflict: 'student_id,topic_id'
          });

        if (statsError) {
          console.error('Error saving student stats:', statsError);
        } else {
          console.log('✅ Student progress saved successfully');
        }

        // Save to QuizSessions (detailed session record)
        const { error: sessionError } = await supabase
          .from('QuizSessions')
          .insert({
            student_id: studentId,
            topic_id: topic.id,
            session_date: new Date().toISOString(),
            difficulty_level: difficulty,
            questions_attempted: sessionData.total,
            correct_answers: sessionData.correct,
            accuracy_percentage: sessionAccuracy * 100,
            time_spent: Math.floor((Date.now() - (questionStartTime || Date.now())) / 1000),
            next_difficulty: nextDifficulty,
            difficulty_changed: difficultyChanged,
            ai_feedback: sessionSummary,
            question_details: questions.map((q, index) => ({
              question_id: q.id,
              question_type: q.type,
              difficulty: q.difficulty || difficulty,
              correct: index < score // Simple approximation
            }))
          });

        if (sessionError) {
          console.error('Error saving session:', sessionError);
        } else {
          console.log('✅ Session details saved successfully');
        }

      } catch (error) {
        console.error('Database save error:', error);
      }
    }

    // Store progression info for results display
    setAiFeedback(prev => ({
      ...prev,
      difficultyProgression: {
        currentLevel: difficulty,
        nextLevel: nextDifficulty,
        sessionAccuracy: sessionAccuracy,
        reason: progressionReason,
        changed: difficultyChanged
      },
      sessionSummary
    }));

    setShowResult(true);
  };

  if (!questions.length) {
    return (
      <div className="time-quiz-container">
        <div className="time-quiz-loading">
          <div className="loading-spinner">⏰</div>
          <h2>Preparing your time quiz...</h2>
          <div className="loading-details">
            Loading interactive time activities...<br/>
            Getting ready for learning about day and night!<br/>
            Almost there! ⭐
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    let encouragement = '';
    let scoreClass = '';
    
    if (percentage >= 80) {
      encouragement = 'Excellent work! You really understand time concepts! ⭐';
      scoreClass = 'excellent-score';
    } else if (percentage >= 60) {
      encouragement = 'Good job! You\'re learning about time well! 👍';
      scoreClass = 'good-score';
    } else {
      encouragement = 'Keep practicing! You\'re getting better at understanding time! 💪';
      scoreClass = 'needs-practice';
    }

    return (
      <div className="time-quiz-container">
        <div className="time-quiz-result">
          <div className="result-content">
            <h2>Quiz Complete! 🎉</h2>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-text">{score}/{questions.length}</span>
              </div>
            </div>
            <div className={`results-encouragement ${scoreClass}`}>
              {encouragement}
            </div>
            
            {/* Difficulty Progression Display */}
            {aiFeedback?.difficultyProgression && (
              <div className="difficulty-progression-section">
                <h3>📈 Your Progress</h3>
                <div className="progression-display">
                  <div className="current-level">
                    <span className="level-label">Current Level:</span>
                    <span className={`level-badge level-${aiFeedback.difficultyProgression.currentLevel}`}>
                      {aiFeedback.difficultyProgression.currentLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="accuracy-display">
                    <span className="accuracy-label">Session Accuracy:</span>
                    <span className="accuracy-value">
                      {Math.round(aiFeedback.difficultyProgression.sessionAccuracy * 100)}%
                    </span>
                  </div>
                  
                  <div className="progression-arrow">
                    {aiFeedback.difficultyProgression.changed ? '⬆️' : '➡️'}
                  </div>
                  
                  <div className="next-level">
                    <span className="level-label">Next Level:</span>
                    <span className={`level-badge level-${aiFeedback.difficultyProgression.nextLevel}`}>
                      {aiFeedback.difficultyProgression.nextLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="progression-reason">
                  <p>{aiFeedback.difficultyProgression.reason}</p>
                </div>
              </div>
            )}
            
            {/* AI Feedback Display */}
            {aiFeedback?.sessionSummary && (
              <div className="ai-session-summary">
                <h3>🧠 AI Tutor Insights</h3>
                {aiFeedback.sessionSummary.insights && aiFeedback.sessionSummary.insights.length > 0 && (
                  <div className="ai-insights">
                    {aiFeedback.sessionSummary.insights.map((insight, idx) => (
                      <p key={idx} className="insight-item">💡 {insight}</p>
                    ))}
                  </div>
                )}
                {aiFeedback.sessionSummary.recommendations && (
                  <div className="ai-recommendations">
                    <p className="recommendation">🎯 {aiFeedback.sessionSummary.recommendations}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigateTo('topics')}>
                Back to Topics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="time-quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>⏰ Time</h2>
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-text">{currentQuestion.question}</h3>

        {/* Render different question types */}
        {currentQuestion.type === 'identification' && (
            <div className="identification-question">
              <div className="identification-options">
                {currentQuestion.images?.map((image, index) => (
                  <div
                    key={index}
                    className={`identification-option ${selectedOption === image.id ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(image.id)}
                  >
                    <div 
                      className="time-image"
                      dangerouslySetInnerHTML={{ __html: generateTimeSVG(image.src, image.id === 'day' ? timeColors.morning : timeColors.night, 120) }}
                    />
                    <div className="time-image-label">{image.description}</div>
                  </div>
                ))}
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`identification-option ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="time-image-label">{option}</div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Matching Activities */}
        {currentQuestion.type === 'matching' && (
            <div className="matching-question">
              <div className="drag-items">
                <h4>Drag these activities:</h4>
                <div className="draggable-items">
                  {currentQuestion.items
                    .filter((item) => !matchedPairs.has(item.label))
                    .length === 0 ? (
                    <div className="no-shapes-left">
                      🎉 All activities sorted!
                    </div>
                  ) : (
                    currentQuestion.items
                      .filter((item) => !matchedPairs.has(item.label))
                      .map((item, index) => (
                      <div
                        key={item.label}
                        className="draggable-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
                        {item.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="drop-zones">
                <h4>Drop on correct time:</h4>
                <div className="drop-targets">
                  {currentQuestion.items.map((item, index) => {
                    const targetName = item.timeOfDay;
                    const droppedItem = droppedShapes[targetName];
                    
                    return (
                      <div
                        key={index}
                        className={`drop-zone ${matchedPairs.has(targetName) ? 'filled' : ''}`}
                        onDrop={(e) => handleDrop(e, targetName)}
                        onDragOver={handleDragOver}
                      >
                        {droppedItem ? (
                          <div 
                            className={`dropped-shape ${
                              (droppedItem.timeOfDay === targetName) ? 'correct-drop' : 'incorrect-drop'
                            }`}
                            draggable
                            onDragStart={(e) => {
                              handleDragStart(e, droppedItem);
                              // Remove from current position when re-dragging
                              setDroppedShapes(prev => {
                                const updated = {...prev};
                                delete updated[targetName];
                                return updated;
                              });
                              setMatchedPairs(prev => {
                                const updated = new Set(prev);
                                updated.delete(targetName);
                                return updated;
                              });
                            }}
                          >
                            {droppedItem.label}
                            <span className="shape-label">{targetName}</span>
                          </div>
                        ) : (
                          <div className="empty-zone">{targetName}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        )}

        {/* Fill in the Blank */}
        {currentQuestion.type === 'fill_blank' && (
            <div className="fill-blank-question">
              <div className="fill-blank-sentence">
                {currentQuestion.question.replace('______', '')}
                <span className="blank-space">
                  {selectedOption && <span className="blank-answer">{selectedOption}</span>}
                </span>
              </div>
              <div className="fill-blank-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`fill-blank-option ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
        )}

        {/* True/False */}
        {currentQuestion.type === 'true_false' && (
            <div className="true-false-question">
              <div className="true-false-statement">
                {currentQuestion.question}
              </div>
              <div className="true-false-options">
                <button
                  className={`true-false-option true-option ${selectedOption === true ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(true)}
                >
                  True
                </button>
                <button
                  className={`true-false-option false-option ${selectedOption === false ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(false)}
                >
                  False
                </button>
              </div>
            </div>
        )}

        {/* Coloring Activities */}
        {currentQuestion.type === 'coloring' && (
            <div className="coloring-question">
              <div className="color-palette">
                {Object.entries(timeColors).map(([name, color]) => (
                  <div
                    key={name}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              <div className="coloring-scenes">
                {currentQuestion.scenes?.map((scene, index) => (
                  <div
                    key={index}
                    className={`coloring-scene ${coloredScenes.has(scene.id) ? 'colored' : ''}`}
                    style={{ backgroundColor: coloredScenes.has(scene.id) ? scene.targetColor : '#f8f9fa' }}
                    onClick={() => handleSceneClick(scene.id)}
                  >
                    <div 
                      className="time-image"
                      dangerouslySetInnerHTML={{ 
                        __html: generateTimeSVG(
                          scene.type.includes('sun') ? 'sun' : 'moon', 
                          coloredScenes.has(scene.id) ? '#FFFFFF' : timeColors.morning, 
                          100
                        ) 
                      }}
                    />
                    <div className="time-image-label">{scene.label}</div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Interactive Elements */}
        {currentQuestion.type === 'interactive' && (
            <div className="interactive-question">
              <div className="interactive-targets">
                {currentQuestion.targets?.map((target, index) => (
                  <div
                    key={index}
                    className={`interactive-target ${litTargets.has(target.id) ? 'lit' : ''}`}
                    onClick={() => handleInteractiveClick(target.id)}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: generateTimeSVG(
                          target.type, 
                          target.type === 'sun' ? timeColors.morning : timeColors.night, 
                          120
                        ) 
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Audio Visual */}
        {currentQuestion.type === 'audio_visual' && (
          <div className="audio-visual-question">
            <button 
              className="audio-control"
              onClick={playAudioSound}
              disabled={audioPlaying}
            >
              {audioPlaying ? '🔊 Playing...' : '🔊 Play Sound'}
            </button>
            <p>Sound: {currentQuestion.soundDescription}</p>
            <div className="audio-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`audio-option ${selectedOption === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {feedback.message}
          </div>
        )}
        
        {aiFeedback && (
          <div className="ai-feedback">
            <div className="ai-feedback-header">
              <span className="ai-icon">🧠</span>
              <strong>AI Tutor Feedback</strong>
            </div>
            <div className="ai-feedback-content">
              {aiFeedback.aiInsight && (
                <p className="ai-insight">{aiFeedback.aiInsight}</p>
              )}
              {aiFeedback.suggestion && (
                <p className="ai-suggestion">💡 <em>{aiFeedback.suggestion}</em></p>
              )}
              {aiFeedback.encouragement && (
                <p className="ai-encouragement">{aiFeedback.encouragement}</p>
              )}
              {aiFeedback.insights && aiFeedback.insights.length > 0 && (
                <div className="ai-insights">
                  {aiFeedback.insights.map((insight, idx) => (
                    <p key={idx} className="insight-item">{insight}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <button 
          className="btn btn-primary" 
          onClick={checkAnswer} 
          disabled={isChecking || (!selectedOption && matchedPairs.size === 0 && coloredScenes.size === 0 && litTargets.size === 0)}
        >
          {isChecking ? 'AI Analyzing...' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default Time;
