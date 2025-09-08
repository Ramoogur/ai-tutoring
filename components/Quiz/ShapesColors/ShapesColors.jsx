import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { shapesColorsQuestions, colors, shapes } from '../../../data/shapesColorsQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import './ShapesColors.css';

const ShapesColors = ({ topic, user, navigateTo }) => {
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
  const [droppedShapes, setDroppedShapes] = useState({}); // Track which shape is dropped in each zone
  const [sortedItems, setSortedItems] = useState([]); // Track all dropped items in sorting questions
  const [textInput, setTextInput] = useState('');
  const [isTracing, setIsTracing] = useState(false);
  const [tracedPath, setTracedPath] = useState([]);
  const [constructedShapes, setConstructedShapes] = useState([]);
  // AI is always enabled - removed toggle functionality
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  
  const canvasRef = useRef(null);
  const tracingRef = useRef(null);

  // Get difficulty from user performance
  const getDifficultyFromAccuracy = (acc) => {
    if (acc >= 0.8) return 'hard';
    if (acc >= 0.5) return 'medium';
    return 'easy';
  };

  const fetchDifficulty = async (studentId, topicId) => {
    const { data, error } = await supabase
      .from('StudentTopicStats')
      .select('total_attempts, correct_answers')
      .eq('student_id', studentId)
      .eq('topic_id', topicId)
      .maybeSingle();
    if (error || !data || data.total_attempts === 0) return 'easy';
    const accuracy = data.correct_answers / data.total_attempts;
    return getDifficultyFromAccuracy(accuracy);
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
      setSortedItems([]);
      setMatchedPairs(new Set());
      setTextInput('');
      
      // Load current difficulty from database
      let savedDifficulty = 'easy'; // Default
      try {
        const { data: studentStats } = await supabase
          .from('StudentTopicStats')
          .select('current_difficulty')
          .eq('student_id', user.id)
          .eq('topic_id', topic.id)
          .single();
        
        if (studentStats?.current_difficulty) {
          savedDifficulty = studentStats.current_difficulty;
          console.log(`💾 Loaded saved difficulty: ${savedDifficulty}`);
        }
      } catch (error) {
        console.log('🆆 No previous progress found, starting at Easy level');
      }
      
      // Initialize AI system for Shapes & Colors with correct difficulty
      console.log(`🤖 Initializing AI Tutor for Shapes & Colors at ${savedDifficulty} difficulty`);
      aiController.startQuizSession('shapes_colors');
      
      // Set AI to the correct difficulty level from database BEFORE starting
      aiTutor.setDifficultyForNextSession(savedDifficulty);
      setAiStatus(aiController.getAIStatus());
      
      // Use the loaded difficulty level and update state
      let difficultyLevel = savedDifficulty;
      setDifficulty(savedDifficulty); // Update React state for UI display
      console.log(`🎯 Starting quiz at difficulty: ${difficultyLevel}`);
      
      // Prepare questions with AI selection
      let selectedQuestions = [];
      
      // Get all available questions across difficulties for AI selection
      const allQuestions = [
        ...(shapesColorsQuestions.easy || []).map(q => ({ ...q, difficulty: 'easy' })),
        ...(shapesColorsQuestions.medium || []).map(q => ({ ...q, difficulty: 'medium' })),
        ...(shapesColorsQuestions.hard || []).map(q => ({ ...q, difficulty: 'hard' }))
      ];
      
      // Let AI select optimal questions based on performance
      if (allQuestions.length > 0) {
        selectedQuestions = aiController.prepareQuestions(allQuestions, 5);
        console.log(`🧠 AI selected ${selectedQuestions.length} personalized questions`);
      } else {
        console.warn('No questions available for AI selection');
        
        // Shuffle questions for variety in traditional mode
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

  // Generate SVG for shapes
  const generateShapeSVG = (shape, color, size = 100, className = '') => {
    const center = size / 2;
    let shapeElement = '';

    switch (shape) {
      case 'circle':
        shapeElement = `<circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="${color}" stroke="#333" stroke-width="2" />`;
        break;
      case 'square':
        const squareSize = size * 0.7;
        const squareOffset = (size - squareSize) / 2;
        shapeElement = `<rect x="${squareOffset}" y="${squareOffset}" width="${squareSize}" height="${squareSize}" fill="${color}" stroke="#333" stroke-width="2" />`;
        break;
      case 'rectangle':
        const rectWidth = size * 0.8;
        const rectHeight = size * 0.5;
        const rectX = (size - rectWidth) / 2;
        const rectY = (size - rectHeight) / 2;
        shapeElement = `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${color}" stroke="#333" stroke-width="2" />`;
        break;
      case 'triangle':
        const points = `${center},${size * 0.1} ${size * 0.1},${size * 0.9} ${size * 0.9},${size * 0.9}`;
        shapeElement = `<polygon points="${points}" fill="${color}" stroke="#333" stroke-width="2" />`;
        break;
      default:
        return null;
    }

    return (
      <svg 
        width={size} 
        height={size} 
        className={className}
        dangerouslySetInnerHTML={{ __html: shapeElement }}
      />
    );
  };

  // Handle different question types
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleTextInput = (value) => {
    setTextInput(value);
  };

  // Drag and drop for matching
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      // Always accept the drop regardless of correctness
      setMatchedPairs(new Set([...matchedPairs, target]));
      setDroppedShapes(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Tracing functionality
  const startTracing = (e) => {
    setIsTracing(true);
    const rect = tracingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracedPath([{ x, y }]);
    
    // Clear any previous drawings
    if (tracingRef.current) {
      const canvas = tracingRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const continueTracing = (e) => {
    if (!isTracing) return;
    const rect = tracingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracedPath(prev => [...prev, { x, y }]);
  };

  const stopTracing = () => {
    setIsTracing(false);
  };

  const clearTrace = () => {
    setTracedPath([]);
    if (tracingRef.current) {
      const canvas = tracingRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Draw tracing path on canvas
  useEffect(() => {
    if (tracingRef.current && tracedPath.length > 0) {
      const canvas = tracingRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing style
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw the path
      if (tracedPath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(tracedPath[0].x, tracedPath[0].y);
        
        for (let i = 1; i < tracedPath.length; i++) {
          ctx.lineTo(tracedPath[i].x, tracedPath[i].y);
        }
        
        ctx.stroke();
      }
    }
  }, [tracedPath]);

  // Smart positioning for robot construction
  const getSuggestedPosition = (shape, existingShapes) => {
    const canvasWidth = 400;
    const canvasHeight = 300;
    const centerX = canvasWidth / 2;
    
    // Count existing shapes of each type
    const shapeCount = {
      triangle: existingShapes.filter(s => s.shape === 'triangle').length,
      square: existingShapes.filter(s => s.shape === 'square').length, 
      rectangle: existingShapes.filter(s => s.shape === 'rectangle').length,
      circle: existingShapes.filter(s => s.shape === 'circle').length
    };
    
    // Robot part positioning:
    // - Square: Body (center)
    // - Rectangle: Arms/Legs (sides/bottom)
    // - Triangle: Head (top)
    // - Circle: Eyes (top of body)
    switch (shape) {
      case 'triangle': // Head (top center)
        return {
          x: centerX - 30 + (shapeCount.triangle * 20),
          y: 20 + (shapeCount.triangle * 10)
        };
      case 'square': // Body (middle)
        return {
          x: centerX - 50 + (shapeCount.square * 25),
          y: 100 + (shapeCount.square * 10)
        };
      case 'rectangle': // Arms/Legs
        // Alternate arms (sides, upper) and legs (sides, lower)
        if (shapeCount.rectangle % 2 === 0) {
          // Arms (left/right, upper)
          return {
            x: centerX - 100 + (shapeCount.rectangle * 60),
            y: 110
          };
        } else {
          // Legs (left/right, lower)
          return {
            x: centerX - 60 + (shapeCount.rectangle * 60),
            y: 200
          };
        }
      case 'circle': // Eyes (on head/body)
        return {
          x: centerX - 20 + (shapeCount.circle * 40),
          y: 50
        };
      default:
        return { x: centerX - 30, y: canvasHeight / 2 };
    }
  };

  // Construction mode for drawing
  const addConstructedShape = (shape, color, position) => {
    const newShape = {
      id: Date.now(),
      shape,
      color,
      x: position.x,
      y: position.y
    };
    setConstructedShapes(prev => [...prev, newShape]);
  };

  // Sorting functionality - Allow ALL items to be dropped (learning from mistakes)
  const handleSortDrop = (e) => {
    e.preventDefault();
    let draggedItemData;
    
    try {
      draggedItemData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch (error) {
      // Fallback to state if JSON parsing fails
      draggedItemData = draggedItem;
    }
    
    if (!draggedItemData) return;
    
    // Always allow the item to be dropped - students learn from trying
    const itemKey = `${draggedItemData.shape}-${draggedItemData.color}`;
    setSortedItems(prev => [...prev, itemKey]);
    
    setDraggedItem(null);
  };

  // Helper function to get color name from hex
  const getColorName = (color) => {
    const colorMap = {
      '#F44336': 'red',
      '#4CAF50': 'green', 
      '#2196F3': 'blue',
      '#FFEB3B': 'yellow',
      '#FF9800': 'orange',
      '#9C27B0': 'purple'
    };
    return colorMap[color] || 'colored';
  };

  const checkAnswer = () => {
    if (isChecking) return;
    setIsChecking(true);

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'identification':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'naming':
        isCorrect = textInput.toLowerCase().trim() === currentQuestion.correct.toLowerCase();
        break;
      case 'matching':
        // Check if each item is correctly placed in its corresponding zone
        let correctMatches = 0;
        currentQuestion.items.forEach(item => {
          const targetName = item.label || item.name;
          const droppedShape = droppedShapes[targetName];
          if (droppedShape && 
              droppedShape.shape === item.shape && 
              droppedShape.color === item.color &&
              (droppedShape.label === targetName || droppedShape.name === targetName)) {
            correctMatches++;
          }
        });
        isCorrect = correctMatches === currentQuestion.items.length;
        break;
      case 'tracing':
        // Simple validation - check if path has minimum points
        isCorrect = tracedPath.length > 10;
        break;
      case 'pattern':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'sorting':
        // Check if correct items were sorted based on the criteria
        const currentQ = questions[currentQuestionIndex];
        let correctSorts = 0;
        
        // Check each sorted item to see if it matches the target criteria
        sortedItems.forEach(itemKey => {
          const [shape, color] = itemKey.split('-');
          
          if (currentQ.targetShape && currentQ.targetColor) {
            if (shape === currentQ.targetShape && color === currentQ.targetColor) {
              correctSorts++;
            }
          } else if (currentQ.targetShape) {
            if (shape === currentQ.targetShape) {
              correctSorts++;
            }
          } else if (currentQ.targetColor) {
            if (color === currentQ.targetColor) {
              correctSorts++;
            }
          }
        });
        
        // Calculate expected correct items
        const expectedMatches = currentQ.items.filter(item => {
          if (currentQ.targetShape && currentQ.targetColor) {
            return item.shape === currentQ.targetShape && item.color === currentQ.targetColor;
          } else if (currentQ.targetShape) {
            return item.shape === currentQ.targetShape;
          } else if (currentQ.targetColor) {
            return item.color === currentQ.targetColor;
          }
          return false;
        }).length;
        
        // Student gets it right if they sorted all correct items (and may have sorted some wrong ones too)
        isCorrect = correctSorts === expectedMatches;
        break;
      case 'construction':
        // Check if at least 3 shapes were used
        isCorrect = constructedShapes.length >= 3;
        break;
      default:
        isCorrect = false;
    }

    // AI Analysis and Adaptive Feedback - AI is always enabled
    // Determine user's answer for AI analysis
    let userAnswer = null;
    switch (currentQuestion.type) {
      case 'identification':
      case 'pattern':
        userAnswer = selectedOption;
        break;
      case 'naming':
        userAnswer = textInput;
        break;
      case 'matching':
        userAnswer = `matched_pairs_${matchedPairs.size}`;
        break;
      case 'sorting':
        userAnswer = `sorted_items_${sortedItems.length}`;
        break;
      case 'tracing':
        userAnswer = `traced_points_${tracedPath.length}`;
        break;
      case 'construction':
        userAnswer = `constructed_shapes_${constructedShapes.length}`;
        break;
    }
    
    let aiAnalysisResult = aiController.processAnswer(currentQuestion, isCorrect, userAnswer);
    console.log(`🔍 AI Analysis: ${isCorrect ? 'Correct' : 'Incorrect'} - ${aiAnalysisResult.aiFeedback.message}`);
    
    // Update AI status
    setAiStatus(aiController.getAIStatus());
    
    // Set AI feedback
    setAiFeedback(aiAnalysisResult.aiFeedback);
    
    // Log difficulty adjustments
    if (aiAnalysisResult.difficultyAdjustment) {
      console.log(`🔄 AI adjusted difficulty to: ${aiAnalysisResult.newDifficulty}`);
      setDifficulty(aiAnalysisResult.newDifficulty.toLowerCase());
    }

    // Set feedback with AI enhancement
    const feedbackMessage = aiAnalysisResult ? 
      aiAnalysisResult.aiFeedback.message : 
      (isCorrect ? '🎉 Excellent! Well done!' : '👍 Good try! Let\'s practice more.');
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ isCorrect: true, message: feedbackMessage });
    } else {
      setFeedback({ isCorrect: false, message: feedbackMessage });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        resetQuestionState();
        
        // Start tracking the next question for AI
        if (questions[nextIndex]) {
          const questionTrackingData = aiController.startQuestion(questions[nextIndex]);
          setQuestionStartTime(questionTrackingData.startTime);
        }
      } else {
        finishQuiz();
      }
    }, 2500); // AI processing delay
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setTextInput('');
    setMatchedPairs(new Set());
    setDroppedShapes({});
    setSortedItems([]);
    setTracedPath([]);
    setConstructedShapes([]);
    setFeedback(null);
    setAiFeedback(null);
    setIsChecking(false);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const accuracy = score / questions.length;
    
    // Complete AI session and get comprehensive feedback
    let aiSessionSummary = aiController.completeQuizSession();
    console.log('🎓 AI Session Summary:', aiSessionSummary);
    
    // Set AI feedback with session summary
    setAiFeedback({
      ...aiSessionSummary.aiFeedback,
      sessionSummary: aiSessionSummary
    });
    
    // Update final AI status
    setAiStatus(aiController.getAIStatus());
    
    // Save comprehensive progress data to database
    try {
      const sessionAccuracy = (score / questions.length) * 100;
      const currentSessionDifficulty = aiSessionSummary?.difficultyProgression?.current || 'easy';
      const nextSessionDifficulty = aiSessionSummary?.difficultyProgression?.next || 'easy';
      
      // 1. Update/Insert StudentTopicStats (overall progress)
      const statsData = {
        student_id: user.id,
        topic_id: topic.id,
        total_attempts: 1, // Will be incremented by database trigger
        correct_answers: score,
        total_questions: questions.length,
        current_difficulty: nextSessionDifficulty, // Next session difficulty
        last_accuracy: sessionAccuracy,
        last_attempted: new Date().toISOString(),
        ai_performance: aiSessionSummary?.performance || sessionAccuracy,
        best_streak: aiSessionSummary?.currentStreak || 0,
        progress_data: JSON.stringify({
          recentAccuracies: [sessionAccuracy], // Array to track trend
          difficultyHistory: aiSessionSummary?.difficultyProgression || {},
          learningInsights: aiSessionSummary?.aiFeedback?.insights || [],
          achievements: aiSessionSummary?.aiFeedback?.achievements || []
        })
      };
      
      await supabase.from('StudentTopicStats').upsert(statsData, { onConflict: 'student_id,topic_id' });
      
      // 2. Insert QuizSession (individual session record for detailed tracking)
      const sessionData = {
        student_id: user.id,
        topic_id: topic.id,
        session_date: new Date().toISOString(),
        difficulty_level: currentSessionDifficulty,
        questions_attempted: questions.length,
        correct_answers: score,
        accuracy_percentage: sessionAccuracy,
        time_spent: Math.round((Date.now() - aiSessionSummary?.duration) / 1000) || 0,
        next_difficulty: nextSessionDifficulty,
        difficulty_changed: currentSessionDifficulty !== nextSessionDifficulty,
        ai_feedback: JSON.stringify({
          encouragement: aiSessionSummary?.aiFeedback?.encouragement,
          suggestions: aiSessionSummary?.aiFeedback?.suggestions,
          progressionReason: aiSessionSummary?.difficultyProgression?.reason
        }),
        question_details: JSON.stringify({
          questionTypes: questions.map(q => q.type),
          responses: questions.map((q, idx) => ({
            questionId: q.id || idx,
            correct: idx < score, // Simplified - you may want more detailed tracking
            questionType: q.type
          }))
        })
      };
      
      await supabase.from('QuizSessions').insert(sessionData);
      
      console.log(`📊 Results saved - Score: ${score}/${questions.length}, Accuracy: ${(accuracy*100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  if (!questions.length) {
    return (
      <div className="shapes-colors-loading">
        <div className="loading-spinner">🎨</div>
        <p>Preparing your shapes and colors quiz...</p>
        <div className="loading-details">
          ✨ Loading questions<br/>
          🎯 Setting up activities<br/>
          🚀 Almost ready!
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="shapes-colors-result ai-enhanced">
        <div className="result-content">
          <h2>🎓 Shapes & Colors Complete!</h2>
          
          <div className="basic-results">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-text">{percentage}%</span>
              </div>
            </div>
            <p><strong>Score:</strong> {score} out of {questions.length} questions correct!</p>
            <p><strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          </div>
          
          {aiFeedback && (
            <div className="ai-session-summary">
              <h3>🤖 AI Tutor Analysis</h3>
              
              {aiStatus && (
                <div className="ai-analytics-grid">
                  <div className="ai-metric">
                    <span className="ai-metric-value">{aiStatus.difficulty}</span>
                    <div className="ai-metric-label">Final Difficulty</div>
                  </div>
                  <div className="ai-metric">
                    <span className="ai-metric-value">{aiStatus.performance.toFixed(1)}%</span>
                    <div className="ai-metric-label">AI Performance</div>
                  </div>
                  <div className="ai-metric">
                    <span className="ai-metric-value">{aiStatus.currentStreak}</span>
                    <div className="ai-metric-label">Current Streak</div>
                  </div>
                  <div className="ai-metric">
                    <span className="ai-metric-value">{aiStatus.questionsCompleted}</span>
                    <div className="ai-metric-label">Total Questions</div>
                  </div>
                </div>
              )}
              
              {aiFeedback.encouragement && (
                <div className="ai-encouragement-section">
                  <h4>🎆 AI Encouragement</h4>
                  <p className="ai-encouragement">{aiFeedback.encouragement}</p>
                </div>
              )}
              
              {aiFeedback.insights && aiFeedback.insights.length > 0 && (
                <div className="ai-insights-section">
                  <h4>💡 Learning Insights</h4>
                  <div className="ai-insights">
                    {aiFeedback.insights.map((insight, idx) => (
                      <div key={idx} className="insight-item">{insight}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {aiFeedback.recommendations && aiFeedback.recommendations.length > 0 && (
                <div className="ai-recommendations-section">
                  <h4>🎯 Next Steps</h4>
                  <div className="ai-recommendations">
                    <ul>
                      {aiFeedback.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {aiFeedback.achievements && aiFeedback.achievements.length > 0 && (
                <div className="achievements-section">
                  <h4>🏆 Achievements</h4>
                  <div className="achievements">
                    {aiFeedback.achievements.map((achievement, idx) => (
                      <span key={idx} className="achievement-badge">{achievement}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {aiFeedback.sessionSummary && aiFeedback.sessionSummary.difficultyProgression && (
                <div className="difficulty-progression-section">
                  <h4>📊 Difficulty Progression</h4>
                  <div className="difficulty-progression">
                    <div className="progression-info">
                      <div className="current-difficulty">
                        <span className="difficulty-label">This Session:</span>
                        <span className={`difficulty-badge difficulty-${aiFeedback.sessionSummary.difficultyProgression.current}`}>
                          {aiFeedback.sessionSummary.difficultyProgression.current.charAt(0).toUpperCase() + aiFeedback.sessionSummary.difficultyProgression.current.slice(1)}
                        </span>
                      </div>
                      
                      <div className="accuracy-info">
                        <span className="accuracy-label">Session Accuracy:</span>
                        <span className="accuracy-value">
                          {(aiFeedback.sessionSummary.sessionAccuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="next-difficulty">
                        <span className="difficulty-label">Next Session:</span>
                        <span className={`difficulty-badge difficulty-${aiFeedback.sessionSummary.difficultyProgression.next}`}>
                          {aiFeedback.sessionSummary.difficultyProgression.next.charAt(0).toUpperCase() + aiFeedback.sessionSummary.difficultyProgression.next.slice(1)}
                          {aiFeedback.sessionSummary.difficultyProgression.current !== aiFeedback.sessionSummary.difficultyProgression.next && (
                            <span className="progression-arrow">
                              {aiFeedback.sessionSummary.difficultyProgression.next === 'hard' ? ' ⬆️' : 
                               aiFeedback.sessionSummary.difficultyProgression.next === 'easy' ? ' ⬇️' : 
                               aiFeedback.sessionSummary.difficultyProgression.next === 'medium' && aiFeedback.sessionSummary.difficultyProgression.current === 'easy' ? ' ⬆️' : ' ⬇️'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="progression-reason">
                      <p className="reason-text">{aiFeedback.sessionSummary.difficultyProgression.reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {false && (
            <div className="encouragement-section">
              {percentage >= 80 ? (
                <div className="great-job">
                  <h3>🌟 Outstanding work!</h3>
                  <p>You have excellent knowledge of shapes and colors!</p>
                </div>
              ) : percentage >= 60 ? (
                <div className="good-job">
                  <h3>👍 Good job!</h3>
                  <p>You're learning well! Keep practicing to improve even more.</p>
                </div>
              ) : (
                <div className="keep-trying">
                  <h3>💪 Keep trying!</h3>
                  <p>Practice makes perfect. You're on the right track!</p>
                </div>
              )}
            </div>
          )}
          
          <div className="result-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => navigateTo('dashboard')}
            >
              🏠 Back to Home
            </button>
            {true && (
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  // Reset for AI-powered retry
                  setShowResult(false);
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  resetQuestionState();
                  console.log('🔄 Starting new AI-powered Shapes & Colors session');
                }}
              >
                🤖 AI Remix Quiz
              </button>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="shapes-colors-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>🎨 Shapes & Colors</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty.toUpperCase()}</span>
            </div>
            {aiStatus && (
              <div className="ai-status">
                <span className="ai-indicator" title="AI Tutor Active">
                  🤖 AI: {aiStatus.difficulty} | Performance: {aiStatus.performance.toFixed(0)}%
                  {aiStatus.currentStreak > 0 && ` | Streak: ${aiStatus.currentStreak}`}
                </span>
              </div>
            )}
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
            {currentQuestion.visual && (
              <div className="shape-display">
                {currentQuestion.shape && generateShapeSVG(currentQuestion.shape, currentQuestion.color, 150)}
                {currentQuestion.shapes && (
                  <div className="shapes-grid">
                    {currentQuestion.shapes.map((item, index) => (
                      <div key={index} className="shape-item">
                        {generateShapeSVG(item.shape, item.color, 80)}
                      </div>
                    ))}
                  </div>
                )}
                {currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 && 
                 typeof currentQuestion.options[0] === 'object' && (
                  <div className="visual-options">
                    {currentQuestion.options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`visual-option ${selectedOption === option.label ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(option.label)}
                      >
                        {generateShapeSVG(option.shape, option.color, 80)}
                        <span className="option-label">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {currentQuestion.options && Array.isArray(currentQuestion.options) && 
             typeof currentQuestion.options[0] === 'string' && (
              <div className="text-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentQuestion.type === 'matching' && (
          <div className="matching-question">
            <div className="drag-items">
              <h4>Drag these shapes:</h4>
              <div className="draggable-items">
                {currentQuestion.items
                  .filter((item) => !matchedPairs.has(item.label || item.name))
                  .length === 0 ? (
                  <div className="no-shapes-left">
                    🎉 All shapes sorted!
                  </div>
                ) : (
                  currentQuestion.items
                    .filter((item) => !matchedPairs.has(item.label || item.name))
                    .map((item, index) => (
                    <div
                      key={item.label || item.name}
                      className="draggable-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      {generateShapeSVG(item.shape, item.color, 80)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="drop-zones">
              <h4>Drop on correct names:</h4>
              <div className="drop-targets">
                {currentQuestion.items.map((item, index) => {
                  const targetName = item.label || item.name;
                  const droppedShape = droppedShapes[targetName];
                  
                  return (
                    <div
                      key={index}
                      className={`drop-zone ${matchedPairs.has(targetName) ? 'filled' : ''}`}
                      onDrop={(e) => handleDrop(e, targetName)}
                      onDragOver={handleDragOver}
                    >
                      {droppedShape ? (
                        <div 
                          className={`dropped-shape ${
                            (droppedShape.label === targetName || droppedShape.name === targetName) ? 'correct-drop' : 'incorrect-drop'
                          }`}
                          draggable
                          onDragStart={(e) => {
                            handleDragStart(e, droppedShape);
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
                          {generateShapeSVG(droppedShape.shape, droppedShape.color, 60)}
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

        {currentQuestion.type === 'sorting' && (
          <div className="sorting-question">
            <div className="sorting-items">
              <h4>Drag to sort:</h4>
              <div className="sortable-items">
                 {currentQuestion.items.map((item, index) => {
                   const itemKey = `${item.shape}-${item.color}`;
                   const isSorted = sortedItems.includes(itemKey);
                   return (
                     <div
                       key={index}
                       className={`sortable-item ${isSorted ? 'sorted' : ''}`}
                       draggable // Always allow dragging for learning from mistakes
                       onDragStart={(e) => handleDragStart(e, item)}
                       style={{ opacity: isSorted ? 0.7 : 1 }}
                     >
                       {generateShapeSVG(item.shape, item.color, 60)}
                     </div>
                   );
                 })}
              </div>
            </div>
            <div className="sort-target">
              <h4>
                {currentQuestion.targetShape && currentQuestion.targetColor ? 
                  `Drop ${currentQuestion.targetShape}s that are ${getColorName(currentQuestion.targetColor)} here:` :
                  currentQuestion.targetShape ? 
                    `Drop all ${currentQuestion.targetShape}s here:` :
                    currentQuestion.targetColor ? 
                      `Drop all ${getColorName(currentQuestion.targetColor)} shapes here:` :
                      'Drop correct items here:'
                }
              </h4>
              <div
                className="sort-drop-zone"
                onDrop={(e) => handleSortDrop(e)}
                onDragOver={handleDragOver}
              >
                <div className="drop-zone-content">
                  {sortedItems.length > 0 ? (
                    <div className="sorted-items-display">
                      <div className="sorted-count">{sortedItems.length} items sorted</div>
                      <div className="sorted-shapes">
                        {sortedItems.map((shapeKey, index) => {
                          const [shape, color] = shapeKey.split('-');
                          return (
                            <div key={index} className="sorted-shape">
                              {generateShapeSVG(shape, color, 40)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    'Drop items here'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentQuestion.type === 'naming' && (
          <div className="naming-question">
            <div className="shape-to-name">
              {generateShapeSVG(currentQuestion.shape, currentQuestion.color, 150)}
            </div>
            <input
              type="text"
              className="name-input"
              placeholder="Type the shape name..."
              value={textInput}
              onChange={(e) => handleTextInput(e.target.value)}
            />
          </div>
        )}

        {currentQuestion.type === 'tracing' && (
          <div className="tracing-question">
            {currentQuestion.shape && (
              <div className="trace-container">
                <div className="trace-template">
                  <div className="template-shape">
                    {generateShapeSVG(currentQuestion.shape, 'transparent', 200, 'trace-template')}
                  </div>
                <canvas
                  ref={tracingRef}
                  className="tracing-canvas"
                  width={200}
                  height={200}
                  onMouseDown={startTracing}
                  onMouseMove={continueTracing}
                  onMouseUp={stopTracing}
                  onMouseLeave={stopTracing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const syntheticEvent = {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    };
                    startTracing(syntheticEvent);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const syntheticEvent = {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    };
                    continueTracing(syntheticEvent);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    stopTracing();
                  }}
                />
                <div className="trace-actions">
                  <button 
                    className="clear-trace-btn"
                    onClick={clearTrace}
                    type="button"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
              </div>
            )}
            {currentQuestion.word && (
              <div className="word-tracing">
                <div className="trace-word">
                  <span className="dotted-text">{currentQuestion.word}</span>
                  <canvas
                    ref={tracingRef}
                    className="word-tracing-canvas"
                    width={300}
                    height={100}
                    onMouseDown={startTracing}
                    onMouseMove={continueTracing}
                    onMouseUp={stopTracing}
                    onMouseLeave={stopTracing}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {currentQuestion.type === 'pattern' && (
          <div className="pattern-question">
            <div className="pattern-sequence">
              {currentQuestion.pattern.map((item, index) => (
                <div key={index} className="pattern-item">
                  {item.shape === '?' ? (
                    <div className="pattern-mystery">?</div>
                  ) : (
                    generateShapeSVG(item.shape, item.color, 80)
                  )}
                </div>
              ))}
            </div>
            <div className="pattern-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`pattern-option ${selectedOption === option.label ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.label)}
                >
                  {generateShapeSVG(option.shape, option.color, 60)}
                  <span className="option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'construction' && (
          <div className="construction-question">
            <div className="construction-instructions">
              <h4>🤖 Build Your Robot!</h4>
              <p>Click the shapes below to add robot parts. Then drag them to the right spot to finish your robot:</p>
              <div className="robot-guide">
                <span>🔺 Triangle = Head (top)</span>
                <span>⬜ Square = Body (middle)</span>
                <span>⬛ Rectangle = Arms & Legs (sides/bottom)</span>
                <span>⚪ Circle = Eyes (on head/body)</span>
              </div>
              <div className="robot-reference">
                <svg width="90" height="140" style={{marginTop: 8}}>
                  <polygon points="45,10 15,50 75,50" fill="#B3E5FC" stroke="#333" strokeWidth="2" />
                  <rect x="20" y="50" width="50" height="50" fill="#90CAF9" stroke="#333" strokeWidth="2" />
                  <rect x="0" y="60" width="20" height="15" fill="#AED581" stroke="#333" strokeWidth="2" />
                  <rect x="70" y="60" width="20" height="15" fill="#AED581" stroke="#333" strokeWidth="2" />
                  <rect x="30" y="100" width="10" height="30" fill="#FFD54F" stroke="#333" strokeWidth="2" />
                  <rect x="50" y="100" width="10" height="30" fill="#FFD54F" stroke="#333" strokeWidth="2" />
                  <circle cx="35" cy="35" r="6" fill="#fff" stroke="#333" strokeWidth="2" />
                  <circle cx="55" cy="35" r="6" fill="#fff" stroke="#333" strokeWidth="2" />
                </svg>
                <div style={{fontSize: '12px', color: '#555', marginTop: 4}}>Robot Example</div>
              </div>
            </div>
            <div className="construction-tools">
              <h4>Choose shapes and colors:</h4>
              <div className="shape-tools">
                {currentQuestion.tools.map((shape, index) => (
                  <div className="shape-tool-container">
                    <button
                      key={index}
                      className="tool-btn"
                      onClick={() => {
                        // Smart positioning for house building
                        const suggestedPosition = getSuggestedPosition(shape, constructedShapes);
                        addConstructedShape(shape, currentQuestion.colors[index % currentQuestion.colors.length], suggestedPosition);
                      }}
                    >
                      {generateShapeSVG(shape, currentQuestion.colors[index % currentQuestion.colors.length], 40)}
                      <span className="shape-label">{shape}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="construction-area">
              <div 
                className="construction-canvas"
                onDragOver={(e) => {
                  e.preventDefault(); // Allow drop
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const shapeId = e.dataTransfer.getData('text/plain');
                  const canvas = e.currentTarget;
                  const rect = canvas.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // Update shape position
                  setConstructedShapes(prev => 
                    prev.map(shape => 
                      shape.id === parseInt(shapeId) 
                        ? { ...shape, x: x - 30, y: y - 30 } // Center the shape
                        : shape
                    )
                  );
                }}
              >
                {constructedShapes.map((shape) => (
                  <div
                    key={shape.id}
                    className="constructed-shape draggable"
                    style={{ 
                      left: shape.x, 
                      top: shape.y, 
                      position: 'absolute',
                      cursor: 'move',
                      userSelect: 'none'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', shape.id);
                      e.target.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.target.style.opacity = '1';
                    }}
                  >
                    {generateShapeSVG(shape.shape, shape.color, 60)}
                  </div>
                ))}
              </div>
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
        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={checkAnswer} 
            disabled={isChecking || (!selectedOption && !textInput && matchedPairs.size === 0 && sortedItems.length === 0 && tracedPath.length === 0 && constructedShapes.length === 0)}
          >
            {isChecking ? 'AI Analyzing...' : 'Check Answer'}
          </button>
        </div>
        
        {/* AI is always enabled - toggle removed */}
      </div>
    </div>
  );
};

export default ShapesColors;
