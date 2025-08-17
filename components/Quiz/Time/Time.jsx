import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { timeQuestions, timeColors, timeAssets } from '../../../data/timeQuestions';
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
      
      const dbDifficulty = await fetchDifficulty(user.id, topic.id);
      setDifficulty(dbDifficulty);
      
      let selectedQuestions = [];
      
      switch (dbDifficulty) {
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
      
      const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
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
        isCorrect = matchedPairs.size === currentQuestion.items.length;
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

    if (isCorrect) {
      setScore(score + 1);
      feedbackMessage = 'Great job! That\'s correct! 🌟';
    } else {
      feedbackMessage = 'Not quite right. Try again next time! 💪';
    }

    setFeedback({ isCorrect, message: feedbackMessage });

    // Save to database
    if (user && topic) {
      await supabase.from('QuizResults').insert({
        user_id: user.id,
        topic_id: topic.id,
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        difficulty: difficulty
      });
    }

    setTimeout(() => {
      setIsChecking(false);
      if (currentQuestionIndex + 1 < questions.length) {
        // Next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestionState();
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setFeedback(null);
    setMatchedPairs(new Set());
    setDroppedShapes({});
    setSequencedItems([]);
    setColoredScenes(new Set());
    setSelectedColor(null);
    setLitTargets(new Set());
    setDraggedItem(null);
  };

  const finishQuiz = () => {
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
      </div>

      <div className="quiz-actions">
        <button 
          className="btn btn-primary" 
          onClick={checkAnswer} 
          disabled={isChecking || (!selectedOption && matchedPairs.size === 0 && coloredScenes.size === 0 && litTargets.size === 0)}
        >
          {isChecking ? 'Checking...' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default Time;
