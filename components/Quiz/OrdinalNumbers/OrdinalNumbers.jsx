import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { ordinalNumbersQuestions, ordinalWords, ordinalSymbols, colors, keypadNumbers } from '../../../data/ordinalNumbersQuestions';
import './OrdinalNumbers.css';

const OrdinalNumbers = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  const [startingPoint, setStartingPoint] = useState('left');
  
  // Question-specific states
  const [draggedItem, setDraggedItem] = useState(null);
  const [droppedItems, setDroppedItems] = useState({});
  const [matchedPairs, setMatchedPairs] = useState({});
  const [textInput, setTextInput] = useState('');
  const [multipleInputs, setMultipleInputs] = useState({});
  const [coloredItems, setColoredItems] = useState({});
  const [circledItems, setCircledItems] = useState({});
  const [raceOrder, setRaceOrder] = useState([]);
  const [podiumSlots, setPodiumSlots] = useState({});
  
  // AI feedback states
  const [aiFeedback, setAiFeedback] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Get difficulty from user performance
  const getDifficultyFromAccuracy = (acc) => {
    if (acc >= 0.8) return 'hard';
    if (acc >= 0.6) return 'medium';
    return 'easy';
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
      setAiFeedback(null);
      setSelectedOption(null);
      setDraggedItem(null);
      setDroppedItems({});
      setMatchedPairs({});
      setTextInput('');
      setMultipleInputs({});
      setColoredItems({});
      setCircledItems({});
      setRaceOrder([]);
      setPodiumSlots({});
      
      // Load current difficulty from database
      let savedDifficulty = 'easy';
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
      
      setDifficulty(savedDifficulty);
      
      // Select questions based on difficulty
      let selectedQuestions = [];
      const questionPool = ordinalNumbersQuestions[savedDifficulty] || ordinalNumbersQuestions.easy;
      
      if (savedDifficulty === 'easy') {
        selectedQuestions = questionPool.slice(0, 5);
      } else if (savedDifficulty === 'medium') {
        selectedQuestions = [
          ...ordinalNumbersQuestions.easy.slice(0, 2),
          ...ordinalNumbersQuestions.medium.slice(0, 3)
        ];
      } else {
        selectedQuestions = [
          ...ordinalNumbersQuestions.medium.slice(0, 2),
          ...ordinalNumbersQuestions.hard.slice(0, 3)
        ];
      }
      
      // Shuffle for variety
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(selectedQuestions);
      
      // Set starting point for first question
      if (selectedQuestions.length > 0) {
        setStartingPoint(selectedQuestions[0].starting_point || 'left');
        setQuestionStartTime(Date.now());
      }
      
    })();
  }, [topic, user]);

  // ChatGPT feedback integration
  const getChatGPTFeedback = async (question, userAnswer, correctAnswer, startingPoint) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You teach Grade 1 maths. Be brief, warm, and concrete.' },
            { 
              role: 'user', 
              content: `You are a friendly Grade 1 maths tutor.
Topic: Ordinal numbers up to fifth (1st..5th). Start point: ${startingPoint}.

QUESTION: ${question}
CHILD'S ANSWER: ${userAnswer}
CORRECT ANSWER: ${correctAnswer}

Rules:
- If correct: say one short praise line + restate why it's correct (e.g., "From the LEFT, the dog is 1st.")
- If wrong: one gentle hint that teaches LEFT vs RIGHT or ordinal endings ("2nd uses 'nd'").
- Keep to 1-2 short sentences. Age-appropriate language.`
            }
          ]
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() ?? "Great job working on ordinal numbers!";
    } catch (error) {
      console.error('ChatGPT feedback error:', error);
      return "Great job working on ordinal numbers!";
    }
  };

  // Handle different question types
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleStartingPointToggle = () => {
    setStartingPoint(prev => prev === 'left' ? 'right' : 'left');
  };

  // Drag and drop functionality
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      setDroppedItems(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Race ranking functionality
  const handlePodiumDrop = (e, position) => {
    e.preventDefault();
    if (draggedItem) {
      setPodiumSlots(prev => ({...prev, [position]: draggedItem}));
      setDraggedItem(null);
    }
  };

  // Matching functionality
  const handleMatchDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      setMatchedPairs(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  // Text input handling
  const handleTextInput = (value) => {
    setTextInput(value);
  };

  const handleMultipleInput = (index, value) => {
    setMultipleInputs(prev => ({...prev, [index]: value}));
  };

  // Coloring and circling functionality
  const handleColorItem = (index, color) => {
    setColoredItems(prev => ({...prev, [index]: color}));
  };

  const handleCircleItem = (index) => {
    setCircledItems(prev => ({...prev, [index]: !prev[index]}));
  };

  // Check answer logic
  const checkAnswer = async () => {
    if (!questions[currentQuestionIndex]) return;
    
    setIsChecking(true);
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let userAnswer = '';

    switch (currentQuestion.question_type) {
      case 'select':
        isCorrect = selectedOption === currentQuestion.correct_answer;
        userAnswer = selectedOption || 'No answer';
        break;
        
      case 'drag_order':
        const expectedOrder = currentQuestion.finishing_order || currentQuestion.correct_order;
        const actualOrder = Object.keys(podiumSlots).sort().map(key => podiumSlots[key]);
        isCorrect = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
        userAnswer = actualOrder.join(', ');
        break;
        
      case 'fill_blank':
        if (currentQuestion.blank_positions) {
          // Multiple blanks
          const correctAnswers = currentQuestion.correct_answers;
          isCorrect = currentQuestion.blank_positions.every((pos, idx) => 
            multipleInputs[pos] === correctAnswers[idx]
          );
          userAnswer = Object.values(multipleInputs).join(', ');
        } else {
          // Single blank
          isCorrect = textInput === currentQuestion.correct_answer;
          userAnswer = textInput;
        }
        break;
        
      case 'coloring_instruction':
        const colorCorrect = coloredItems[currentQuestion.color_target] === currentQuestion.color_instruction;
        const circleCorrect = circledItems[currentQuestion.circle_target] === true;
        isCorrect = colorCorrect && circleCorrect;
        userAnswer = `Colored: ${coloredItems[currentQuestion.color_target] || 'none'}, Circled: ${circledItems[currentQuestion.circle_target] ? 'yes' : 'no'}`;
        break;
        
      case 'match_words_symbols':
        const expectedPairs = currentQuestion.pairs.reduce((acc, pair) => {
          acc[pair.symbol] = pair.word;
          return acc;
        }, {});
        isCorrect = Object.keys(expectedPairs).every(symbol => 
          matchedPairs[symbol] === expectedPairs[symbol]
        );
        userAnswer = Object.entries(matchedPairs).map(([k, v]) => `${k}→${v}`).join(', ');
        break;
        
      case 'start_point_challenge':
        const leftCorrect = droppedItems['left'] === currentQuestion.left_answer;
        const rightCorrect = droppedItems['right'] === currentQuestion.right_answer;
        isCorrect = leftCorrect && rightCorrect;
        userAnswer = `Left: ${droppedItems['left'] || 'none'}, Right: ${droppedItems['right'] || 'none'}`;
        break;
        
      default:
        isCorrect = false;
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Get ChatGPT feedback
    const chatGPTFeedback = await getChatGPTFeedback(
      currentQuestion.question,
      userAnswer,
      currentQuestion.correct_answer || currentQuestion.explanation,
      startingPoint
    );
    
    setAiFeedback(chatGPTFeedback);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
    
    setIsChecking(false);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
      
      // Set starting point for next question
      const nextQ = questions[currentQuestionIndex + 1];
      if (nextQ) {
        setStartingPoint(nextQ.starting_point || 'left');
        setQuestionStartTime(Date.now());
      }
    } else {
      finishQuiz();
    }
  };

  // Reset question-specific state
  const resetQuestionState = () => {
    setSelectedOption(null);
    setDraggedItem(null);
    setDroppedItems({});
    setMatchedPairs({});
    setTextInput('');
    setMultipleInputs({});
    setColoredItems({});
    setCircledItems({});
    setRaceOrder([]);
    setPodiumSlots({});
    setFeedback(null);
    setAiFeedback(null);
  };

  // Finish quiz and save results
  const finishQuiz = async () => {
    const accuracy = (score / questions.length) * 100;
    const sessionData = {
      student_id: user.id,
      topic_id: topic.id,
      session_date: new Date().toISOString(),
      difficulty_level: difficulty,
      questions_attempted: questions.length,
      correct_answers: score,
      accuracy_percentage: accuracy,
      time_spent: Math.round((Date.now() - questionStartTime) / 1000),
      ai_feedback: aiFeedback,
      question_details: JSON.stringify(questions.map(q => ({ id: q.id, type: q.question_type })))
    };

    // Determine next difficulty
    let nextDifficulty = difficulty;
    if (accuracy >= 80 && difficulty === 'easy') nextDifficulty = 'medium';
    else if (accuracy >= 80 && difficulty === 'medium') nextDifficulty = 'hard';
    else if (accuracy < 60 && difficulty === 'medium') nextDifficulty = 'easy';
    else if (accuracy < 60 && difficulty === 'hard') nextDifficulty = 'medium';

    // Save session
    try {
      await supabase.from('QuizSessions').insert(sessionData);
      
      // Update student stats
      const { data: existingStats } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .single();

      if (existingStats) {
        await supabase
          .from('StudentTopicStats')
          .update({
            total_attempts: existingStats.total_attempts + 1,
            correct_answers: existingStats.correct_answers + score,
            total_questions: existingStats.total_questions + questions.length,
            current_difficulty: nextDifficulty,
            last_accuracy: accuracy,
            last_attempted: new Date().toISOString(),
            best_streak: Math.max(existingStats.best_streak || 0, score)
          })
          .eq('student_id', user.id)
          .eq('topic_id', topic.id);
      } else {
        await supabase
          .from('StudentTopicStats')
          .insert({
            student_id: user.id,
            topic_id: topic.id,
            total_attempts: 1,
            correct_answers: score,
            total_questions: questions.length,
            current_difficulty: nextDifficulty,
            last_accuracy: accuracy,
            last_attempted: new Date().toISOString(),
            best_streak: score
          });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }

    setShowResult(true);
  };

  // Render different question types
  const renderQuestion = () => {
    if (!questions[currentQuestionIndex]) return null;
    
    const currentQuestion = questions[currentQuestionIndex];

    switch (currentQuestion.question_type) {
      case 'select':
        return renderSelectQuestion(currentQuestion);
      case 'drag_order':
        return renderDragOrderQuestion(currentQuestion);
      case 'fill_blank':
        return renderFillBlankQuestion(currentQuestion);
      case 'coloring_instruction':
        return renderColoringQuestion(currentQuestion);
      case 'match_words_symbols':
        return renderMatchingQuestion(currentQuestion);
      case 'start_point_challenge':
        return renderStartPointChallenge(currentQuestion);
      default:
        return <div>Question type not supported</div>;
    }
  };

  const renderSelectQuestion = (question) => (
    <div className="ordinal-select-question">
      <div className="starting-point-toggle">
        <button 
          className={`toggle-btn ${startingPoint === 'left' ? 'active' : ''}`}
          onClick={() => setStartingPoint('left')}
        >
          Start from: Left
        </button>
        <button 
          className={`toggle-btn ${startingPoint === 'right' ? 'active' : ''}`}
          onClick={() => setStartingPoint('right')}
        >
          Start from: Right
        </button>
      </div>
      
      <div className={`items-row ${startingPoint === 'right' ? 'reverse' : ''}`}>
        {question.items.map((item, index) => (
          <div 
            key={index}
            className={`ordinal-item ${selectedOption === item ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(item)}
          >
            <div className="item-display">{item}</div>
            {question.item_labels && (
              <div className="item-label">{question.item_labels[index]}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="position-indicators">
        {startingPoint === 'left' ? 
          ['1st', '2nd', '3rd', '4th', '5th'].map((pos, idx) => (
            <div key={idx} className="position-label">{pos}</div>
          )) :
          ['5th', '4th', '3rd', '2nd', '1st'].map((pos, idx) => (
            <div key={idx} className="position-label">{pos}</div>
          ))
        }
      </div>
    </div>
  );

  const renderDragOrderQuestion = (question) => (
    <div className="ordinal-drag-order">
      <div className="runners-pool">
        <h4>Drag runners to podium:</h4>
        {question.runners?.map((runner, index) => (
          <div
            key={index}
            className="runner-card"
            draggable
            onDragStart={(e) => handleDragStart(e, runner)}
          >
            {runner}
          </div>
        ))}
      </div>
      
      <div className="podium">
        {['1st', '2nd', '3rd', '4th', '5th'].map((position, index) => (
          <div
            key={position}
            className="podium-slot"
            onDrop={(e) => handlePodiumDrop(e, position)}
            onDragOver={handleDragOver}
          >
            <div className="position-label">{position}</div>
            <div className="slot-content">
              {podiumSlots[position] || 'Drop here'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFillBlankQuestion = (question) => (
    <div className="ordinal-fill-blank">
      <div className="sequence-display">
        {question.sequence.map((item, index) => (
          <div key={index} className="sequence-item">
            {item === '' ? (
              question.blank_positions ? (
                <input
                  type="text"
                  className="blank-input"
                  value={multipleInputs[index] || ''}
                  onChange={(e) => handleMultipleInput(index, e.target.value)}
                  placeholder="?"
                />
              ) : (
                <input
                  type="text"
                  className="blank-input"
                  value={textInput}
                  onChange={(e) => handleTextInput(e.target.value)}
                  placeholder="?"
                />
              )
            ) : (
              <span className="sequence-text">{item}</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="keypad">
        {keypadNumbers.map((num) => (
          <button
            key={num}
            className="keypad-btn"
            onClick={() => {
              if (question.blank_positions) {
                const firstEmpty = question.blank_positions.find(pos => !multipleInputs[pos]);
                if (firstEmpty !== undefined) {
                  handleMultipleInput(firstEmpty, num);
                }
              } else {
                handleTextInput(num);
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  const renderColoringQuestion = (question) => (
    <div className="ordinal-coloring">
      <div className="coloring-instructions">
        <p>Color the {ordinalWords[`${question.color_target}${getOrdinalSuffix(question.color_target)}`]} item {question.color_instruction}</p>
        <p>Circle the {ordinalWords[`${question.circle_target}${getOrdinalSuffix(question.circle_target)}`]} item</p>
      </div>
      
      <div className="items-to-color">
        {question.items.map((item, index) => (
          <div
            key={index}
            className={`colorable-item ${circledItems[index + 1] ? 'circled' : ''}`}
            style={{ 
              backgroundColor: coloredItems[index + 1] || 'white',
              border: circledItems[index + 1] ? '3px solid #000' : '1px solid #ccc'
            }}
            onClick={() => handleCircleItem(index + 1)}
          >
            <div className="item-content">{item}</div>
            <div className="position-number">{index + 1}{getOrdinalSuffix(index + 1)}</div>
          </div>
        ))}
      </div>
      
      <div className="color-palette">
        {colors.slice(0, 6).map((color) => (
          <button
            key={color}
            className="color-btn"
            style={{ backgroundColor: color }}
            onClick={() => handleColorItem(question.color_target, color)}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );

  const renderMatchingQuestion = (question) => (
    <div className="ordinal-matching">
      <div className="matching-pairs">
        <div className="words-column">
          <h4>Words</h4>
          {question.pairs.map((pair, index) => (
            <div
              key={index}
              className="match-item word-item"
              draggable
              onDragStart={(e) => handleDragStart(e, pair.word)}
            >
              {pair.word}
            </div>
          ))}
        </div>
        
        <div className="symbols-column">
          <h4>Symbols</h4>
          {question.pairs.map((pair, index) => (
            <div
              key={index}
              className="match-target"
              onDrop={(e) => handleMatchDrop(e, pair.symbol)}
              onDragOver={handleDragOver}
            >
              <div className="symbol">{pair.symbol}</div>
              <div className="matched-word">
                {matchedPairs[pair.symbol] || 'Drop word here'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStartPointChallenge = (question) => (
    <div className="ordinal-start-point-challenge">
      <div className="items-display">
        {question.items.map((item, index) => (
          <div key={index} className="challenge-item" style={{ color: question.item_colors[index] }}>
            {item}
          </div>
        ))}
      </div>
      
      <div className="challenge-questions">
        <div className="challenge-row">
          <p>{question.left_question}</p>
          <div
            className="drop-zone"
            onDrop={(e) => handleDrop(e, 'left')}
            onDragOver={handleDragOver}
          >
            {droppedItems['left'] || 'Drop answer'}
          </div>
        </div>
        
        <div className="challenge-row">
          <p>{question.right_question}</p>
          <div
            className="drop-zone"
            onDrop={(e) => handleDrop(e, 'right')}
            onDragOver={handleDragOver}
          >
            {droppedItems['right'] || 'Drop answer'}
          </div>
        </div>
      </div>
      
      <div className="answer-options">
        {question.item_colors.map((color, index) => (
          <div
            key={index}
            className="answer-option"
            draggable
            onDragStart={(e) => handleDragStart(e, color)}
          >
            {color}
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num) => {
    if (num === 1) return 'st';
    if (num === 2) return 'nd';
    if (num === 3) return 'rd';
    return 'th';
  };

  // Results screen
  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="ordinal-results">
        <div className="results-header">
          <h2>🎉 Great Job on Ordinal Numbers!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{questions.length}</span>
            </div>
            <div className="accuracy-text">{accuracy}% Correct</div>
          </div>
        </div>
        
        <div className="results-feedback">
          {accuracy >= 80 && <p className="excellent">🌟 Excellent work! You really understand ordinal numbers!</p>}
          {accuracy >= 60 && accuracy < 80 && <p className="good">👍 Good job! Keep practicing left and right positions!</p>}
          {accuracy < 60 && <p className="encourage">💪 Keep trying! Remember: 1st, 2nd, 3rd, 4th, 5th!</p>}
        </div>
        
        <div className="results-actions">
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Practice Again
          </button>
          <button className="btn-secondary" onClick={() => navigateTo('dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (questions.length === 0) {
    return (
      <div className="ordinal-loading">
        <div className="loading-spinner"></div>
        <p>Preparing your ordinal numbers quiz...</p>
      </div>
    );
  }

  return (
    <div className="ordinal-numbers-quiz">
      <div className="quiz-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="difficulty-badge">{difficulty.toUpperCase()}</div>
      </div>

      <div className="question-container">
        <h3 className="question-text">
          {questions[currentQuestionIndex]?.question}
        </h3>
        
        {renderQuestion()}
        
        {feedback && (
          <div className={`feedback ${feedback}`}>
            <div className="feedback-text">
              {feedback === 'correct' ? '✅ Correct!' : '❌ Try again!'}
            </div>
            {aiFeedback && (
              <div className="ai-feedback">
                <div className="ai-icon">🤖</div>
                <div className="ai-message">{aiFeedback}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <button 
          className="check-answer-btn"
          onClick={checkAnswer}
          disabled={isChecking || feedback}
        >
          {isChecking ? 'Checking...' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default OrdinalNumbers;
