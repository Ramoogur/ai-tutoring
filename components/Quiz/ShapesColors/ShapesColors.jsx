import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { shapesColorsQuestions, colors, shapes } from '../../../data/shapesColorsQuestions';
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

  // Initialize questions based on difficulty
  useEffect(() => {
    (async () => {
      if (!topic || !user) return;
      
      // Get user's difficulty level from database
      const dbDifficulty = await fetchDifficulty(user.id, topic.id);
      setDifficulty(dbDifficulty);
      
      // Select questions based on difficulty level
      let selectedQuestions = [];
      
      switch (dbDifficulty) {
        case 'easy':
          selectedQuestions = shapesColorsQuestions.easy.slice(0, 5);
          break;
        case 'medium':
          selectedQuestions = [...shapesColorsQuestions.easy.slice(0, 2), ...shapesColorsQuestions.medium.slice(0, 3)];
          break;
        case 'hard':
          selectedQuestions = [...shapesColorsQuestions.medium.slice(0, 2), ...shapesColorsQuestions.hard.slice(0, 3)];
          break;
        default:
          selectedQuestions = shapesColorsQuestions.easy.slice(0, 5);
      }
      
      // Shuffle questions for variety
      const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
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

    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ isCorrect: true, message: '🎉 Excellent! Well done!' });
    } else {
      setFeedback({ isCorrect: false, message: '👍 Good try! Let\'s practice more.' });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestionState();
      } else {
        finishQuiz();
      }
    }, 2000);
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
    setIsChecking(false);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const accuracy = score / questions.length;
    
    // Save results to database
    try {
      await supabase.from('StudentTopicStats').upsert({
        student_id: user.id,
        topic_id: topic.id,
        total_attempts: 1,
        correct_answers: score,
        last_attempted: new Date().toISOString()
      }, { onConflict: 'student_id,topic_id' });
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
      <div className="shapes-colors-result">
        <div className="result-content">
          <h2>🌟 Amazing Work!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-text">{percentage}%</span>
            </div>
          </div>
          <p>You got {score} out of {questions.length} questions right!</p>
          
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
          <div className="result-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => navigateTo('dashboard')}
            >
              Back to Dashboard
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              Try Again
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
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="difficulty-badge difficulty-{difficulty}">{difficulty}</span>
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
            <div className="construction-tools">
              <h4>Choose shapes and colors:</h4>
              <div className="shape-tools">
                {currentQuestion.tools.map((shape, index) => (
                  <button
                    key={index}
                    className="tool-btn"
                    onClick={() => {
                      const canvas = document.querySelector('.construction-canvas');
                      const rect = canvas.getBoundingClientRect();
                      addConstructedShape(shape, currentQuestion.colors[0], {
                        x: Math.random() * 200,
                        y: Math.random() * 200
                      });
                    }}
                  >
                    {generateShapeSVG(shape, '#ccc', 40)}
                  </button>
                ))}
              </div>
            </div>
            <div className="construction-area">
              <div className="construction-canvas">
                {constructedShapes.map((shape) => (
                  <div
                    key={shape.id}
                    className="constructed-shape"
                    style={{ left: shape.x, top: shape.y, position: 'absolute' }}
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
      </div>

      <div className="quiz-actions">
        <button 
          className="btn btn-primary" 
          onClick={checkAnswer} 
          disabled={isChecking || (!selectedOption && !textInput && matchedPairs.size === 0 && sortedItems.length === 0 && tracedPath.length === 0 && constructedShapes.length === 0)}
        >
          {isChecking ? 'Checking...' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default ShapesColors;
