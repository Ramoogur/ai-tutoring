import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { patternsQuestions, patternAssets, patternHelpers } from '../../../data/patternsQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import TTSButton from '../TTSButton';
import TranslationButton from '../TranslationButton';
import translationService from '../../../utils/translationService';
import './Patterns.css';

const Patterns = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]);
  const [createdPattern, setCreatedPattern] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [tracedShapes, setTracedShapes] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [traceData, setTraceData] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  // Translation states
  const [isFrench, setIsFrench] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState([]);
  const [translatedUITexts, setTranslatedUITexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  const canvasRef = useRef(null);
  const tracingRef = useRef(null);

  // Get difficulty from user performance
  const getDifficultyFromAccuracy = (acc) => {
    if (acc >= 0.8) return 'hard';
    if (acc >= 0.5) return 'medium';
    return 'easy';
  };

  // Fetch difficulty based on past performance (same logic as ShapesColors)
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

  // Initialize quiz
  useEffect(() => {
    (async () => {
      if (!topic || !user) return;
      
      // Reset quiz state
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setFeedback(null);

      // Initialize AI session
      aiController.startQuizSession(topic.name, user);
      
      // Determine difficulty based on past performance
      let difficultyLevel = 'easy';
      try {
        const difficultyAuto = await fetchDifficulty(user.id, topic.id);
        difficultyLevel = difficultyAuto;
      } catch (error) {
        console.log('Using default difficulty:', error);
      }
      setDifficulty(difficultyLevel);
      setDroppedItems([]);
      setCreatedPattern([]);
      setTextInput('');
      
      // Get questions based on determined difficulty and shuffle for variety
      const difficultyQuestions = patternsQuestions[difficultyLevel] || patternsQuestions.easy;
      const shuffledQuestions = [...difficultyQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, 5);
      setQuestions(selectedQuestions);
      setQuestionStartTime(Date.now());
      
      console.log(`🧩 Patterns quiz starting at ${difficultyLevel} difficulty with ${selectedQuestions.length} questions`);
    })();
  }, [topic, user]);

  // Generate picture icons for weather/nature patterns
  const generatePictureIcon = (type, color, size = 60) => {
    const iconStyle = {
      fontSize: size,
      color: color,
      display: 'inline-block',
      textAlign: 'center'
    };

    const icons = {
      'sun': '☀️',
      'cloud': '☁️',
      'star': '⭐',
      'moon': '🌙',
      'rain': '🌧️',
      'snow': '❄️'
    };

    return (
      <span style={iconStyle}>
        {icons[type] || '❓'}
      </span>
    );
  };

  // Generate tracing outline for shapes (dotted/dashed)
  const generateTracingOutline = (shape, color, size = 100) => {
    const center = size / 2;
    let shapeElement = '';

    switch (shape) {
      case 'circle':
        shapeElement = `<circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      case 'square':
        const squareSize = size * 0.8;
        const squareStart = (size - squareSize) / 2;
        shapeElement = `<rect x="${squareStart}" y="${squareStart}" width="${squareSize}" height="${squareSize}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      case 'triangle':
        const triangleHeight = size * 0.7;
        const triangleBase = size * 0.8;
        const startX = (size - triangleBase) / 2;
        const startY = (size - triangleHeight) / 2;
        shapeElement = `<polygon points="${center},${startY} ${startX + triangleBase},${startY + triangleHeight} ${startX},${startY + triangleHeight}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      default:
        shapeElement = `<circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
    }

    return (
      <svg width={size} height={size} className="tracing-outline">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g dangerouslySetInnerHTML={{ __html: shapeElement }} filter="url(#glow)" />
      </svg>
    );
  };

  // Generate SVG string for canvas background
  const generateTracingOutlineSVG = (shape, color, size = 100) => {
    const center = size / 2;
    let shapeElement = '';

    switch (shape) {
      case 'circle':
        shapeElement = `<circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      case 'square':
        const squareSize = size * 0.8;
        const squareStart = (size - squareSize) / 2;
        shapeElement = `<rect x="${squareStart}" y="${squareStart}" width="${squareSize}" height="${squareSize}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      case 'triangle':
        const triangleHeight = size * 0.7;
        const triangleBase = size * 0.8;
        const startX = (size - triangleBase) / 2;
        const startY = (size - triangleHeight) / 2;
        shapeElement = `<polygon points="${center},${startY} ${startX + triangleBase},${startY + triangleHeight} ${startX},${startY + triangleHeight}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
        break;
      default:
        shapeElement = `<circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="8,4" />`;
    }

    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${shapeElement}</svg>`;
  };

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

  // Generate picture SVG (sun, cloud, star, animals)
  const generatePictureSVG = (type, color, size = 80) => {
    const assets = patternAssets.pictures[type] || patternAssets.animals[type];
    if (!assets) return null;

    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80"
        dangerouslySetInnerHTML={{ __html: assets.svg }}
      />
    );
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem) {
      if (typeof dropIndex === 'number') {
        // Handle indexed drop zones for picture patterns
        setDroppedItems(prev => {
          const newItems = [...prev];
          newItems[dropIndex] = draggedItem;
          return newItems;
        });
      } else {
        // Handle single drop zone for other patterns
        setDroppedItems(prev => [...prev, draggedItem]);
      }
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Pattern creation handlers
  const addToPattern = (item) => {
    if (createdPattern.length < 6) {
      setCreatedPattern(prev => [...prev, item]);
    }
  };

  // Canvas tracing handlers
  const startTracing = (e, shapeIndex) => {
    setIsTracing(true);
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTraceData(prev => ({
      ...prev,
      [shapeIndex]: {
        points: [{x, y}],
        isComplete: false
      }
    }));
  };

  const continueTracing = (e, shapeIndex) => {
    if (!isTracing) return;
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTraceData(prev => ({
      ...prev,
      [shapeIndex]: {
        ...prev[shapeIndex],
        points: [...(prev[shapeIndex]?.points || []), {x, y}]
      }
    }));
    
    // Draw the trace
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const points = traceData[shapeIndex]?.points || [];
    if (points.length > 1) {
      const lastPoint = points[points.length - 2];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endTracing = (shapeIndex) => {
    setIsTracing(false);
    
    // Check if the shape was traced adequately
    const points = traceData[shapeIndex]?.points || [];
    if (points.length > 10) { // Minimum points for a valid trace
      setTracedShapes(prev => [...prev, shapeIndex]);
      setTraceData(prev => ({
        ...prev,
        [shapeIndex]: {
          ...prev[shapeIndex],
          isComplete: true
        }
      }));
    }
  };

  const stopTracing = () => {
    setIsTracing(false);
  };

  const checkAnswer = () => {
    if (isChecking) return;
    setIsChecking(true);

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'choose-correct-pattern':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'complete-pattern-drag':
        // Check if dropped items match the expected answer
        const expectedDragAnswer = currentQuestion.answer;
        isCorrect = droppedItems.length === expectedDragAnswer.length &&
          droppedItems.every((item, idx) => 
            item.shape === expectedDragAnswer[idx].shape && 
            item.color === expectedDragAnswer[idx].color
          );
        break;
      case 'size-pattern':
      case 'shape-pattern':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'number-pattern-next':
      case 'number-pattern-missing':
      case 'number-pattern-direction':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'complete-pattern-trace':
        // Check if all required shapes were traced
        isCorrect = tracedShapes.length >= currentQuestion.toTrace.length;
        break;
      case 'fix-the-mistake':
        isCorrect = selectedOption === currentQuestion.answer_index;
        break;
      case 'mixed-attribute-pattern':
        // Check if selected option matches the expected answer
        const expectedAnswer = currentQuestion.answer[0]; // First item in answer array
        const selectedItem = currentQuestion.options[selectedOption];
        isCorrect = selectedItem && 
          selectedItem.shape === expectedAnswer.shape && 
          selectedItem.color === expectedAnswer.color;
        break;
      case 'picture-pattern':
        const expectedItems = currentQuestion.answer;
        const validDroppedItems = droppedItems.filter(item => item);
        isCorrect = validDroppedItems.length === expectedItems.length &&
          validDroppedItems.every((item, idx) => 
            JSON.stringify(item) === JSON.stringify(expectedItems[idx])
          );
        break;
      case 'create-your-own':
        // Validate created pattern
        const validation = patternHelpers.validateCreatedPattern(
          createdPattern, 
          currentQuestion.constraints
        );
        isCorrect = validation.valid;
        break;
      case 'describe-rule':
        isCorrect = selectedOption === currentQuestion.correct;
        break;
      case 'scene-pattern':
        const expectedAnimals = currentQuestion.answer;
        isCorrect = droppedItems.length === expectedAnimals.length &&
          droppedItems.every((item, idx) => 
            item.animal === expectedAnimals[idx].animal
          );
        break;
      default:
        isCorrect = false;
    }

    // Set feedback
    const feedbackMessage = isCorrect ? 
      '🎉 Excellent! Well done!' : 
      '👍 Good try! Let\'s practice more.';
    
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
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setTextInput('');
    setDroppedItems([]);
    setCreatedPattern([]);
    setTracedShapes([]);
    setFeedback(null);
    setIsChecking(false);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const accuracy = score / questions.length;
  
    // Complete AI session and get comprehensive feedback (same as ShapesColors)
    let aiSessionSummary = aiController.completeQuizSession();
    console.log(' AI Session Summary:', aiSessionSummary);
      
    // Save comprehensive progress data to database
    try {
      const sessionAccuracy = (score / questions.length) * 100;
      
      // Use AI controller's difficulty progression logic
      const nextDifficulty = aiController.calculateNextSessionDifficulty(difficulty, accuracy);
      
      console.log(`🎯 Patterns Quiz Results: Score=${score}/${questions.length}, Accuracy=${sessionAccuracy.toFixed(1)}%, Current=${difficulty}, Next=${nextDifficulty}`);
      
      // Update or insert student topic stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing stats:', fetchError);
      }
        
      if (existingStats) {
        const { error: updateError } = await supabase
          .from('StudentTopicStats')
          .update({
            total_attempts: existingStats.total_attempts + questions.length,
            correct_answers: existingStats.correct_answers + score,
            current_difficulty: nextDifficulty,
            last_accuracy: sessionAccuracy,
            last_attempted: new Date().toISOString()
          })
          .eq('student_id', user.id)
          .eq('topic_id', topic.id);

        if (updateError) {
          console.error('Error updating StudentTopicStats:', updateError);
        } else {
          console.log(`✅ Updated StudentTopicStats: next difficulty = ${nextDifficulty}`);
        }
      } else {
        const { error: insertError } = await supabase
          .from('StudentTopicStats')
          .insert({
            student_id: user.id,
            topic_id: topic.id,
            total_attempts: questions.length,
            correct_answers: score,
            current_difficulty: nextDifficulty,
            last_accuracy: sessionAccuracy,
            created_at: new Date().toISOString(),
            last_attempted: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting StudentTopicStats:', insertError);
        } else {
          console.log(`✅ Inserted new StudentTopicStats: difficulty = ${nextDifficulty}`);
        }
      }
        
      // Save session data with AI summary
      const sessionData = {
        student_id: user.id,
        topic_id: topic.id,
        session_date: new Date().toISOString(),
        difficulty_level: difficulty,
        questions_attempted: questions.length,
        correct_answers: score,
        accuracy_percentage: sessionAccuracy,
        time_spent: Math.round((Date.now() - questionStartTime) / 1000) || 0,
        next_difficulty: nextDifficulty,
        difficulty_changed: difficulty !== nextDifficulty,
        ai_feedback: aiSessionSummary.aiFeedback || {},
        question_details: {
          questionTypes: questions.map(q => q.type),
          responses: questions.map((q, idx) => ({
            questionId: q.id || idx,
            correct: idx < score,
            questionType: q.type
          }))
        }
      };
        
      const { error: sessionError } = await supabase.from('QuizSessions').insert(sessionData);

      if (sessionError) {
        console.error('Error saving QuizSession:', sessionError);
      } else {
        console.log('✅ QuizSession saved successfully');
      }
        
      console.log(` Results saved - Score: ${score}/${questions.length}, Accuracy: ${(accuracy*100).toFixed(1)}%, Next: ${nextDifficulty}`);
        
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  if (!questions.length) {
    return (
      <div className="patterns-loading">
        <div className="loading-spinner">🔄</div>
        <p>Preparing your patterns quiz...</p>
        <div className="loading-details">
          ✨ Loading pattern questions<br/>
          🎯 Setting up activities<br/>
          🚀 Almost ready!
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="patterns-result">
        <div className="result-content">
          <h2>🎓 Patterns Complete!</h2>
          
          <div className="basic-results">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-text">{percentage}%</span>
              </div>
            </div>
            <p><strong>Score:</strong> {score} out of {questions.length} questions correct!</p>
            <p><strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          </div>
          
          <div className="encouragement-section">
            {percentage >= 80 ? (
              <div className="great-job">
                <h3>🌟 Outstanding work!</h3>
                <p>You have excellent pattern recognition skills!</p>
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
              🏠 Back to Home
            </button>
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
    <div className="patterns-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>🔄 Patterns</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty.toUpperCase()}</span>
            </div>
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
        <div className="question-header">
          <h3 className="question-text">{(isFrench && translatedQuestions[currentQuestionIndex]) ? translatedQuestions[currentQuestionIndex].question : currentQuestion.question}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TTSButton 
              question={(isFrench && translatedQuestions[currentQuestionIndex]) ? translatedQuestions[currentQuestionIndex].question : currentQuestion.question}
              options={(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].options || []) : (currentQuestion.options || [])}
            />
            <TranslationButton 
              onToggle={async () => {
                if (isTranslating) return;
                setIsTranslating(true);
                try {
                  if (isFrench) {
                    setIsFrench(false);
                    setTranslatedQuestions([]);
                    setTranslatedUITexts({});
                  } else {
                    setIsFrench(true);
                    const translated = await Promise.all(questions.map(q => translationService.translateQuestion(q, 'fr')));
                    setTranslatedQuestions(translated);
                    const uiTexts = { 'Patterns Quiz': 'Quiz de Motifs', 'Question': 'Question', 'of': 'de', 'Checking...': 'Vérification...', 'Next Question': 'Question Suivante', 'Quiz Complete!': 'Quiz Terminé!', 'Back to Dashboard': 'Retour au Tableau de Bord' };
                    setTranslatedUITexts(await translationService.translateUITexts(uiTexts, 'fr'));
                  }
                } catch (error) {
                  console.error('Translation error:', error);
                } finally {
                  setIsTranslating(false);
                }
              }}
              isFrench={isFrench}
            />
          </div>
        </div>
        
        {/* Pattern display */}
        
        {/* Render different question types */}
        {currentQuestion.type === 'choose-correct-pattern' && (
          <div className="pattern-strips">
            {(currentQuestion.strips || currentQuestion.options || []).map((strip, stripIndex) => (
              <div 
                key={stripIndex}
                className={`pattern-strip ${selectedOption === stripIndex ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(stripIndex)}
              >
                {strip.map((item, itemIndex) => (
                  <div key={itemIndex} className="pattern-item">
                    {generateShapeSVG(item.shape, item.color, 60)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {currentQuestion.type === 'complete-pattern-drag' && (
          <div className="pattern-completion">
            <div className="given-pattern">
              {currentQuestion.given.map((item, index) => (
                <div key={index} className="pattern-item">
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
              <div 
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {droppedItems.map((item, index) => (
                  <div key={index} className="dropped-item">
                    {generateShapeSVG(item.shape, item.color, 60)}
                  </div>
                ))}
                {droppedItems.length < currentQuestion.needs && (
                  <div className="drop-placeholder">Drop here</div>
                )}
              </div>
            </div>
            
            <div className="pattern-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="draggable-option"
                  draggable
                  onDragStart={(e) => handleDragStart(e, option)}
                >
                  {generateShapeSVG(option.shape, option.color, 60)}
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentQuestion.type === 'size-pattern' || currentQuestion.type === 'shape-pattern') && (
          <div className="pattern-continuation">
            <div className="given-pattern">
              {currentQuestion.given.map((item, index) => (
                <div key={index} className="pattern-item">
                  {currentQuestion.type === 'size-pattern' ? 
                    generateShapeSVG(item.shape, item.color, item.size === 'big' ? 100 : 60) :
                    generateShapeSVG(item.shape, item.color, 60)
                  }
                </div>
              ))}
              <div className="next-placeholder">?</div>
            </div>
            
            <div className="pattern-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`pattern-option ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {currentQuestion.type === 'size-pattern' ? 
                    generateShapeSVG(option.shape, option.color, option.size === 'big' ? 100 : 60) :
                    generateShapeSVG(option.shape, option.color, 60)
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentQuestion.type === 'number-pattern-next' || 
          currentQuestion.type === 'number-pattern-missing' ||
          currentQuestion.type === 'number-pattern-direction') && (
          <div className="number-pattern">
            <div className="number-sequence">
              {currentQuestion.sequence.map((num, index) => (
                <div key={index} className="number-box">
                  {num === null ? '?' : num}
                </div>
              ))}
            </div>
            
            <div className="number-choices">
              {currentQuestion.choices.map((choice, index) => (
                <button
                  key={index}
                  className={`number-choice ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'create-your-own' && (
          <div className="pattern-creation">
            <div className="created-pattern">
              {createdPattern.map((item, index) => (
                <div 
                  key={index} 
                  className="created-item"
                  onClick={() => removeFromPattern(index)}
                >
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
              {Array.from({ length: 6 - createdPattern.length }).map((_, index) => (
                <div key={index} className="empty-slot">+</div>
              ))}
            </div>
            
            <div className="creation-palette">
              {currentQuestion.palette.map((item, index) => (
                <div
                  key={index}
                  className="palette-item"
                  onClick={() => addToPattern(item)}
                >
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle describe-rule and scene-pattern question types */}
        {currentQuestion.type === 'describe-rule' && (
          <div className="pattern-analysis">
            <div className="pattern-display">
              {currentQuestion.pattern.map((item, index) => (
                <div key={index} className="pattern-item">
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
            </div>
            
            <div className="rule-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`rule-option ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'scene-pattern' && (
          <div className="scene-pattern">
            <div className="scene-display">
              <div className="scene-title">Animals on the fence:</div>
              <div className="scene-items">
                {currentQuestion.given.map((item, index) => (
                  <div key={index} className="scene-item">
                    <div className="animal-icon" style={{backgroundColor: item.color}}>
                      {item.animal === 'cat' && '🐱'}
                      {item.animal === 'dog' && '🐶'}
                      {item.animal === 'bird' && '🐦'}
                      {item.animal === 'fish' && '🐠'}
                    </div>
                  </div>
                ))}
                <div className="next-placeholder">?</div>
              </div>
            </div>
            
            <div className="scene-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`scene-option ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  <div className="animal-icon" style={{backgroundColor: option.color}}>
                    {option.animal === 'cat' && '🐱'}
                    {option.animal === 'dog' && '🐶'}
                    {option.animal === 'bird' && '🐦'}
                    {option.animal === 'fish' && '🐠'}
                  </div>
                  <span>{option.animal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle complete-pattern-trace question type */}
        {currentQuestion.type === 'complete-pattern-trace' && (
          <div className="pattern-tracing">
            <div className="given-pattern">
              {currentQuestion.given.map((item, index) => (
                <div key={index} className="pattern-item">
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
            </div>
            
            <div className="trace-area">
              <div className="trace-instruction">
                <strong>✏️ Trace over the dotted shapes with your mouse!</strong>
                <div className="trace-hint">Hold down and drag to trace each shape</div>
              </div>
              <div className="shapes-to-trace">
                {currentQuestion.toTrace.map((item, index) => (
                  <div 
                    key={index} 
                    className={`traceable-shape ${tracedShapes.includes(index) ? 'traced' : 'needs-tracing'}`}
                  >
                    <canvas
                      width={120}
                      height={120}
                      className="tracing-canvas"
                      onMouseDown={(e) => startTracing(e, index)}
                      onMouseMove={(e) => continueTracing(e, index)}
                      onMouseUp={() => endTracing(index)}
                      onMouseLeave={() => endTracing(index)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(generateTracingOutlineSVG(item.shape, item.color, 120))}")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    />
                    {!tracedShapes.includes(index) && (
                      <div className="trace-indicator">✏️ Trace me!</div>
                    )}
                    {tracedShapes.includes(index) && (
                      <div className="traced-indicator">✅ Traced!</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Handle fix-the-mistake question type */}
        {currentQuestion.type === 'fix-the-mistake' && (
          <div className="mistake-finder">
            <div className="pattern-strip">
              {currentQuestion.strip.map((item, index) => (
                <div 
                  key={index}
                  className={`pattern-item clickable ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {currentQuestion.type === 'fix-the-mistake' && item.size ? 
                    generateShapeSVG(item.shape, item.color, item.size === 'big' ? 100 : 60) :
                    generateShapeSVG(item.shape, item.color, 60)
                  }
                </div>
              ))}
            </div>
            <div className="instruction">Tap the shape that doesn't fit the pattern</div>
          </div>
        )}

        {/* Handle mixed-attribute-pattern question type */}
        {currentQuestion.type === 'mixed-attribute-pattern' && (
          <div className="mixed-pattern">
            <div className="given-pattern">
              {currentQuestion.given.map((item, index) => (
                <div key={index} className="pattern-item">
                  {generateShapeSVG(item.shape, item.color, 60)}
                </div>
              ))}
              <div className="next-placeholder">?</div>
            </div>
            
            <div className="pattern-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`pattern-option ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {generateShapeSVG(option.shape, option.color, 60)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle picture-pattern question type */}
        {currentQuestion.type === 'picture-pattern' && (
          <div className="picture-pattern">
            <div className="given-pattern">
              {currentQuestion.given.map((item, index) => (
                <div key={index} className="pattern-item">
                  {generatePictureIcon(item.type, item.color)}
                </div>
              ))}
              {/* Create separate drop zones for each needed item */}
              {Array.from({ length: currentQuestion.needs }, (_, index) => (
                <div 
                  key={index}
                  className="drop-zone picture-drop"
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                >
                  {droppedItems[index] ? (
                    <div className="dropped-item">
                      {generatePictureIcon(droppedItems[index].type, droppedItems[index].color)}
                    </div>
                  ) : (
                    <div className="drop-placeholder">Drop here</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="picture-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="draggable-option picture-option"
                  draggable
                  onDragStart={(e) => handleDragStart(e, option)}
                >
                  {generatePictureIcon(option.type, option.color)}
                  <span className="picture-label">{option.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add more question type renderers as needed */}

        {feedback && (
          <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <p>{feedback.message}</p>
          </div>
        )}

        <div className="question-actions">
          <button 
            className="btn btn-primary check-answer"
            onClick={checkAnswer}
            disabled={
              isChecking || 
              (currentQuestion.type === 'choose-correct-pattern' && selectedOption === null) ||
              (currentQuestion.type === 'complete-pattern-drag' && droppedItems.length < currentQuestion.needs) ||
              ((currentQuestion.type === 'size-pattern' || currentQuestion.type === 'shape-pattern') && selectedOption === null) ||
              ((currentQuestion.type === 'number-pattern-next' || currentQuestion.type === 'number-pattern-missing' || currentQuestion.type === 'number-pattern-direction') && selectedOption === null) ||
              (currentQuestion.type === 'create-your-own' && createdPattern.length < 6) ||
              (currentQuestion.type === 'describe-rule' && selectedOption === null) ||
              (currentQuestion.type === 'scene-pattern' && selectedOption === null) ||
              (currentQuestion.type === 'complete-pattern-trace' && tracedShapes.length < currentQuestion.toTrace.length) ||
              (currentQuestion.type === 'fix-the-mistake' && selectedOption === null) ||
              (currentQuestion.type === 'mixed-attribute-pattern' && selectedOption === null) ||
              (currentQuestion.type === 'picture-pattern' && droppedItems.filter(item => item).length < currentQuestion.needs)
            }
          >
            {isChecking ? 'Checking...' : 'Check Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Patterns;
