import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { moneyQuestions, mauritianCoins, coinNames, calculateCoinTotal, calculateCoinTotalFromCounts, formatMoney } from '../../../data/moneyQuestions';
import TTSButton from '../TTSButton';
import TranslationButton from '../TranslationButton';
import translationService from '../../../utils/translationService';
import ModernFeedback from '../ModernFeedback';
import ImmediateFeedback from '../ImmediateFeedback';
import './Money.css';

const Money = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  
  // Question-specific states
  const [selectedCoins, setSelectedCoins] = useState([]);
  const [coinCounts, setCoinCounts] = useState({});
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedChoices, setSelectedChoices] = useState([]);
  
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [gptFeedback, setGptFeedback] = useState(null);
  
  // Immediate feedback states
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);
  const [difficultyProgression, setDifficultyProgression] = useState(null);
  const [shouldValidate, setShouldValidate] = useState(false);
  
  // Translation states
  const [isFrench, setIsFrench] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState([]);
  const [translatedUITexts, setTranslatedUITexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Tracking for ModernFeedback
  const [questionDetails, setQuestionDetails] = useState([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

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

  const loadQuestions = async () => {
    try {
      const userDifficulty = await fetchDifficulty(user.id, topic.id);
      setDifficulty(userDifficulty);
      
      let selectedQuestions = [];
      const easyQuestions = moneyQuestions.filter(q => q.level === 'easy');
      const mediumQuestions = moneyQuestions.filter(q => q.level === 'medium');
      const hardQuestions = moneyQuestions.filter(q => q.level === 'hard');

      if (userDifficulty === 'easy') {
        selectedQuestions = easyQuestions.slice(0, 5);
      } else if (userDifficulty === 'medium') {
        selectedQuestions = [
          ...easyQuestions.slice(0, 2),
          ...mediumQuestions.slice(0, 3)
        ];
      } else {
        selectedQuestions = [
          ...mediumQuestions.slice(0, 2),
          ...hardQuestions.slice(0, 3)
        ];
      }

      // Shuffle questions for variety
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(selectedQuestions);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Auto-validation effect - triggers when answers are complete
  useEffect(() => {
    if (questions.length === 0 || feedback) return; // Don't validate if no questions or already showing feedback
    
    const question = questions[currentQuestionIndex];
    if (!question) return;

    let isComplete = false;

    switch (question.type) {
      case 'coin_select':
      case 'missing_coin':
      case 'odd_one_out':
      case 'name_coin':
        // Check if question needs multiple selections
        const needsMultiple = Array.isArray(question.answer) && question.answer.length > 1;
        if (needsMultiple) {
          const totalSelected = Object.values(coinCounts).reduce((sum, count) => sum + count, 0);
          isComplete = totalSelected === question.answer.length;
        } else {
          isComplete = selectedChoices.length > 0;
        }
        break;
      case 'match':
        isComplete = matchedPairs.length === question.pairs.length;
        break;
      case 'make_amount':
        if (Object.keys(coinCounts).length > 0) {
          const total = calculateCoinTotalFromCounts(coinCounts);
          const target = question.target.rupees + (question.target.cents / 100);
          isComplete = Math.abs(total - target) < 0.01;
        }
        break;
      case 'fill_sum':
        isComplete = question.choices ? 
          selectedChoices.length > 0 : 
          textInput.trim().length > 0;
        break;
    }

    if (isComplete && shouldValidate) {
      setShouldValidate(false);
      handleAnswerComplete();
    }
  }, [selectedChoices, matchedPairs, selectedCoins, textInput, shouldValidate, questions, currentQuestionIndex, feedback]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setSelectedCoins([]);
    setCoinCounts({});
    setMatchedPairs([]);
    setTextInput('');
    setSelectedChoices([]);
    setFeedback(null);
    setGptFeedback(null);
    setShouldValidate(false);
    setQuestionStartTime(Date.now());
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
    } else {
      finishQuiz();
    }
  };

  const validateAnswer = async (question, studentAnswer) => {
    let isCorrect = false;

    switch (question.type) {
      case 'coin_select':
        // Check if question needs multiple selections
        const needsMultipleSelect = Array.isArray(question.answer) && question.answer.length > 1;
        if (needsMultipleSelect) {
          // Validate using coin counts for multiple selection
          const selectedCoinsList = [];
          Object.entries(coinCounts).forEach(([coin, count]) => {
            for (let i = 0; i < count; i++) {
              selectedCoinsList.push(coin);
            }
          });
          
          // Check if selected coins match the required answer exactly
          const sortedSelected = selectedCoinsList.sort();
          const sortedAnswer = [...question.answer].sort();
          isCorrect = sortedSelected.length === sortedAnswer.length && 
                     sortedSelected.every((coin, index) => coin === sortedAnswer[index]);
        } else {
          // Single selection validation
          isCorrect = selectedChoices.length === 1 && question.answer.includes(selectedChoices[0]);
        }
        break;

      case 'match':
        isCorrect = matchedPairs.length === question.pairs.length &&
          question.pairs.every(pair => 
            matchedPairs.some(matched => 
              matched[0] === pair[0] && matched[1] === pair[1]
            )
          );
        break;

      case 'make_amount':
        const total = calculateCoinTotalFromCounts(coinCounts);
        const target = question.target.rupees + (question.target.cents / 100);
        isCorrect = Math.abs(total - target) < 0.01;
        break;

      case 'fill_sum':
        isCorrect = selectedChoices.length > 0 && 
          (question.choices ? 
            selectedChoices[0] === question.answer_text :
            textInput.trim().toLowerCase() === question.answer_text.toLowerCase());
        break;

      case 'missing_coin':
        isCorrect = selectedChoices.length > 0 && question.answer.includes(selectedChoices[0]);
        break;

      case 'odd_one_out':
        isCorrect = selectedChoices.length === 1 && question.answer.includes(selectedChoices[0]);
        break;

      case 'name_coin':
        isCorrect = selectedChoices.length === 1 && selectedChoices[0] === question.answer;
        break;

      default:
        isCorrect = false;
    }

    return isCorrect;
  };

  const handleAnswerComplete = async () => {
    const question = questions[currentQuestionIndex];
    const isCorrect = await validateAnswer(question);
    
    // Track question details for ModernFeedback
    const timeSpent = Date.now() - questionStartTime;
    setQuestionDetails(prev => [...prev, {
      questionType: question.type,
      correct: isCorrect,
      timeSpent: timeSpent
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    // Show immediate feedback popup
    setCurrentFeedbackData({
      isCorrect,
      question: question,
      userAnswer: selectedOption || textInput || selectedCoins.length || 'Your answer',
      correctAnswer: question.correct || question.answer || 'See explanation'
    });
    setShowImmediateFeedback(true);
  };

  const handleFeedbackClose = async () => {
    setShowImmediateFeedback(false);
    setCurrentFeedbackData(null);
    
    if (currentFeedbackData?.isCorrect) {
      nextQuestion();
    } else {
      // Allow retry for incorrect answers
      setFeedback(null);
      setGptFeedback(null);
    }
  };

  const getGPTFeedback = async (question, studentAnswer, isCorrect) => {
    // Generate encouraging feedback without API call for now
    const feedbackMessages = {
      correct: {
        praise: [
          "Excellent work! 🎉",
          "Perfect! Well done! ⭐",
          "Great job with the coins! 🪙",
          "You're getting good at money! 👏",
          "Fantastic! Keep it up! 🌟"
        ],
        explain: [
          "You chose the right coin!",
          "That's the correct amount!",
          "Perfect match!",
          "You understand money well!",
          "Great counting skills!"
        ]
      },
      incorrect: {
        praise: [
          "Good try! Keep practicing! 💪",
          "Nice effort! Try again! 🌈",
          "You're learning! Don't give up! 🚀",
          "Keep going! You can do it! ⭐",
          "Good attempt! Practice makes perfect! 📚"
        ],
        hint: [
          "Look carefully at the coin values.",
          "Count the money step by step.",
          "Check which coin matches the name.",
          "Add up the coins slowly.",
          "Think about the coin colors and sizes."
        ]
      }
    };

    const category = isCorrect ? 'correct' : 'incorrect';
    const randomPraise = feedbackMessages[category].praise[Math.floor(Math.random() * feedbackMessages[category].praise.length)];
    const randomExplain = isCorrect ? 
      feedbackMessages.correct.explain[Math.floor(Math.random() * feedbackMessages.correct.explain.length)] :
      feedbackMessages.incorrect.hint[Math.floor(Math.random() * feedbackMessages.incorrect.hint.length)];

    setGptFeedback({
      correct: isCorrect,
      praise: randomPraise,
      hint: isCorrect ? "" : randomExplain,
      explain: isCorrect ? randomExplain : ""
    });
  };

  const calculateNextSessionDifficulty = (currentDifficulty, sessionAccuracy) => {
    const accuracyPercent = sessionAccuracy * 100;
    
    if (currentDifficulty === 'easy') {
      if (accuracyPercent > 80) return 'medium';
      return 'easy'; // Stay easy for 60-80% and <60%
    } else if (currentDifficulty === 'medium') {
      if (accuracyPercent > 80) return 'hard';
      if (accuracyPercent < 60) return 'easy';
      return 'medium'; // Stay medium for 60-80%
    } else { // hard
      if (accuracyPercent < 60) return 'easy';
      if (accuracyPercent < 80) return 'medium';
      return 'hard'; // Stay hard for >80%
    }
  };

  const getDifficultyProgressionReason = (currentDiff, nextDiff, accuracy) => {
    const accuracyPercent = Math.round(accuracy * 100);
    
    if (nextDiff === currentDiff) {
      return `Great progress! Continue practicing at ${currentDiff} level.`;
    } else if (nextDiff === 'medium' && currentDiff === 'easy') {
      return `Excellent! ${accuracyPercent}% accuracy earned you a promotion to Medium level!`;
    } else if (nextDiff === 'hard' && currentDiff === 'medium') {
      return `Outstanding! ${accuracyPercent}% accuracy earned you a promotion to Hard level!`;
    } else if (nextDiff === 'easy') {
      return `Let's practice more at Easy level to build confidence. You've got this!`;
    } else if (nextDiff === 'medium') {
      return `Moving to Medium level for more balanced practice.`;
    }
    return `Next session: ${nextDiff} level`;
  };

  const finishQuiz = async () => {
    try {
      const accuracy = score / questions.length;
      const nextDifficulty = calculateNextSessionDifficulty(difficulty, accuracy);
      const progressionReason = getDifficultyProgressionReason(difficulty, nextDifficulty, accuracy);
      const totalTime = Math.floor(questionDetails.reduce((sum, q) => sum + q.timeSpent, 0) / 1000);
      setTotalTimeSpent(totalTime);
      
      const sessionData = {
        student_id: user.id,
        topic_id: topic.id,
        session_date: new Date().toISOString(),
        difficulty_level: difficulty,
        questions_attempted: questions.length,
        correct_answers: score,
        accuracy_percentage: Math.round(accuracy * 100) / 100, // Store as decimal like ShapesColors
        time_spent: Math.round((Date.now() - questionStartTime) / 1000),
        difficulty_changed: nextDifficulty !== difficulty,
        next_difficulty: nextDifficulty,
        ai_feedback: JSON.stringify({
          encouragement: "Great work on money concepts!",
          suggestions: progressionReason
        }),
        question_details: JSON.stringify({
          questionTypes: questions.map(q => q.type),
          responses: questions.map((q, idx) => ({
            questionId: q.id || idx,
            correct: idx < score,
            questionType: q.type
          }))
        })
      };

      await supabase.from('QuizSessions').insert(sessionData);

      // Update or create student topic stats
      const { data: existingStats } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .maybeSingle();

      // Use upsert like ShapesColors for cleaner database operations
      const statsData = {
        student_id: user.id,
        topic_id: topic.id,
        total_attempts: (existingStats?.total_attempts || 0) + 1,
        correct_answers: (existingStats?.correct_answers || 0) + score,
        total_questions: (existingStats?.total_questions || 0) + questions.length,
        current_difficulty: nextDifficulty,
        last_accuracy: accuracy,
        last_attempted: new Date().toISOString(),
        ai_performance: accuracy,
        best_streak: Math.max(existingStats?.best_streak || 0, score),
        progress_data: JSON.stringify({
          recentAccuracies: [accuracy],
          difficultyHistory: { [difficulty]: nextDifficulty },
          learningInsights: [`Completed ${questions.length} money questions`],
          achievements: accuracy >= 0.8 ? ['High Accuracy'] : []
        })
      };
      
      await supabase.from('StudentTopicStats').upsert(statsData, { onConflict: 'student_id,topic_id' });

      setDifficultyProgression({
        current: difficulty,
        next: nextDifficulty,
        reason: progressionReason,
        accuracy: Math.round(accuracy * 100)
      });

      setShowResult(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      setShowResult(true);
    }
  };

  const renderCoin = (coinType, isSelected = false, onClick = null, className = '') => {
    const coin = mauritianCoins[coinType];
    return (
      <div 
        className={`coin ${coinType} ${isSelected ? 'selected' : ''} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="coin-inner">
          <div className="coin-value">{coin.display}</div>
          <div className="coin-type">{coin.type}</div>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (questions.length === 0) return <div>Loading questions...</div>;
    
    const question = questions[currentQuestionIndex];

    switch (question.type) {
      case 'coin_select':
        // Check if this question needs multiple selections (answer array has multiple items)
        const needsMultipleSelection = Array.isArray(question.answer) && question.answer.length > 1;
        
        if (needsMultipleSelection) {
          return (
            <div className="question-container">
              <div className="coin-counters">
                <h4>Select Coins:</h4>
                <div className="counter-grid">
                  {question.choices.map((coin, index) => {
                    const count = coinCounts[coin] || 0;
                    const requiredCount = question.answer.filter(ans => ans === coin).length;
                    return (
                      <div key={index} className="coin-counter">
                        {renderCoin(coin)}
                        <div className="counter-controls">
                          <button 
                            className="counter-btn minus"
                            onClick={() => {
                              const newCounts = { ...coinCounts };
                              if (newCounts[coin] > 0) {
                                newCounts[coin]--;
                                if (newCounts[coin] === 0) {
                                  delete newCounts[coin];
                                }
                              }
                              setCoinCounts(newCounts);
                              
                              // Check if selection matches answer
                              const totalSelected = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
                              const totalRequired = question.answer.length;
                              if (totalSelected === totalRequired) {
                                setShouldValidate(true);
                              }
                            }}
                            disabled={count === 0}
                          >
                            −
                          </button>
                          <span className="count">{count}</span>
                          <button 
                            className="counter-btn plus"
                            onClick={() => {
                              const newCounts = { ...coinCounts };
                              newCounts[coin] = (newCounts[coin] || 0) + 1;
                              setCoinCounts(newCounts);
                              
                              // Check if selection matches answer
                              const totalSelected = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
                              const totalRequired = question.answer.length;
                              if (totalSelected === totalRequired) {
                                setShouldValidate(true);
                              }
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        } else {
          // Single selection (original behavior)
          return (
            <div className="question-container">
              <div className="coins-grid">
                {question.choices.map((coin, index) => (
                  <div key={index} onClick={() => {
                    setSelectedChoices([coin]);
                    setShouldValidate(true);
                  }}>
                    {renderCoin(coin, selectedChoices.includes(coin), null, 'selectable')}
                  </div>
                ))}
              </div>
            </div>
          );
        }

      case 'match':
        return (
          <div className="question-container">
            <div className="matching-container">
              <div className="left-column">
                {question.left.map((item, index) => (
                  <div 
                    key={index}
                    className={`match-item ${draggedItem === item ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => setDraggedItem(item)}
                  >
                    {item.startsWith('image:') ? renderCoin(item.replace('image:', '')) : item}
                  </div>
                ))}
              </div>
              <div className="right-column">
                {question.right.map((item, index) => (
                  <div 
                    key={index}
                    className={`match-target ${matchedPairs.some(pair => pair[1] === item) ? 'matched' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedItem) {
                        const newPair = [draggedItem, item];
                        const updatedPairs = [...matchedPairs.filter(p => p[0] !== draggedItem && p[1] !== item), newPair];
                        setMatchedPairs(updatedPairs);
                        setDraggedItem(null);
                        
                        // Trigger validation when all pairs are matched
                        if (updatedPairs.length === question.pairs.length) {
                          setShouldValidate(true);
                        }
                      }
                    }}
                  >
                    {item}
                    {matchedPairs.find(pair => pair[1] === item) && (
                      <div className="matched-coin">
                        {renderCoin(matchedPairs.find(pair => pair[1] === item)[0].replace('image:', ''))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'make_amount':
        const targetAmount = question.target.rupees + (question.target.cents / 100);
        const currentTotal = calculateCoinTotalFromCounts(coinCounts);
        return (
          <div className="question-container">
            <div className="target-amount">
              Target: {formatMoney(targetAmount)}
            </div>
            <div className="current-total">
              Current: {formatMoney(currentTotal)}
            </div>
            <div className="coin-counters">
              <h4>Choose Coins:</h4>
              <div className="counter-grid">
                {question.allowed_coins.map((coin, index) => {
                  const count = coinCounts[coin] || 0;
                  return (
                    <div key={index} className="coin-counter">
                      {renderCoin(coin)}
                      <div className="counter-controls">
                        <button 
                          className="counter-btn minus"
                          onClick={() => {
                            const newCounts = { ...coinCounts };
                            if (newCounts[coin] > 0) {
                              newCounts[coin]--;
                              if (newCounts[coin] === 0) {
                                delete newCounts[coin];
                              }
                            }
                            setCoinCounts(newCounts);
                            
                            // Check if target reached
                            const total = calculateCoinTotalFromCounts(newCounts);
                            const target = question.target.rupees + (question.target.cents / 100);
                            if (Math.abs(total - target) < 0.01) {
                              setShouldValidate(true);
                            }
                          }}
                          disabled={count === 0}
                        >
                          −
                        </button>
                        <span className="count">{count}</span>
                        <button 
                          className="counter-btn plus"
                          onClick={() => {
                            const newCounts = { ...coinCounts };
                            newCounts[coin] = (newCounts[coin] || 0) + 1;
                            setCoinCounts(newCounts);
                            
                            // Check if target reached
                            const total = calculateCoinTotalFromCounts(newCounts);
                            const target = question.target.rupees + (question.target.cents / 100);
                            if (Math.abs(total - target) < 0.01) {
                              setShouldValidate(true);
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'fill_sum':
        return (
          <div className="question-container">
            {question.choices ? (
              <div className="multiple-choice">
                {question.choices.map((choice, index) => (
                  <button
                    key={index}
                    className={`choice-btn ${selectedChoices.includes(choice) ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedChoices([choice]);
                      setShouldValidate(true);
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setShouldValidate(true);
                  }
                }}
                placeholder="Enter your answer"
                className="text-input"
              />
            )}
          </div>
        );

      case 'missing_coin':
        return (
          <div className="question-container">
            <div className="coins-grid">
              {question.choices.map((coin, index) => (
                <div key={index} onClick={() => {
                  setSelectedChoices([coin]);
                  setShouldValidate(true);
                }}>
                  {renderCoin(coin, selectedChoices.includes(coin), null, 'selectable')}
                </div>
              ))}
            </div>
          </div>
        );

      case 'odd_one_out':
        return (
          <div className="question-container">
            <div className="coins-grid">
              {question.choices.map((coin, index) => (
                <div key={index} onClick={() => {
                  setSelectedChoices([coin]);
                  setShouldValidate(true);
                }}>
                  {renderCoin(coin, selectedChoices.includes(coin), null, 'selectable')}
                </div>
              ))}
            </div>
          </div>
        );

      case 'name_coin':
        return (
          <div className="question-container">
            <div className="coin-display">
              {renderCoin(question.coin)}
            </div>
            <div className="multiple-choice">
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  className={`choice-btn ${selectedChoices.includes(choice) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedChoices([choice]);
                    // Auto-validate immediately after selection
                    setTimeout(() => handleAnswerComplete(), 300);
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  // Removed canCheckAnswer - no longer needed with automatic validation

  if (questions.length === 0) {
    return (
      <div className="money-quiz loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Preparing your money quiz...</h2>
          <p>Learning about Mauritian coins!</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    // Calculate next difficulty
    const currentAccuracy = score / questions.length;
    const nextDifficulty = calculateNextSessionDifficulty(difficulty, currentAccuracy);
    const difficultyChanged = difficulty !== nextDifficulty;
    
    return (
      <ModernFeedback
        topicName="Money & Coins"
        topicIcon="🪙"
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        nextDifficulty={nextDifficulty}
        difficultyChanged={difficultyChanged}
        timeSpent={totalTimeSpent}
        questionDetails={questionDetails}
        studentName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
        onBackToDashboard={() => navigateTo('dashboard')}
        onTryAgain={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="money-quiz">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>💰 Money</h2>
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-content">
          <div className="question-header">
            <h3 className="question-text">
              {(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].question || translatedQuestions[currentQuestionIndex].prompt_en) : (questions[currentQuestionIndex]?.question || questions[currentQuestionIndex]?.prompt_en)}
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <TTSButton 
                question={(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].question || translatedQuestions[currentQuestionIndex].prompt_en) : (questions[currentQuestionIndex]?.question || questions[currentQuestionIndex]?.prompt_en)}
                options={(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].options || translatedQuestions[currentQuestionIndex].choices || []) : (questions[currentQuestionIndex]?.options || questions[currentQuestionIndex]?.choices || [])}
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
                      const uiTexts = { 'Money Quiz': 'Quiz d\'Argent', 'Question': 'Question', 'of': 'de', 'Checking...': 'Vérification...', 'Next Question': 'Question Suivante', 'Quiz Complete!': 'Quiz Terminé!', 'Back to Dashboard': 'Retour au Tableau de Bord' };
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
          
          {/* Money/coin display */}
          {renderQuestion()}
        </div>
        
        {feedback && (
          <div className={`feedback ${feedback}`}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Try again!'}
            {gptFeedback && (
              <div className="gpt-feedback">
                <p>{gptFeedback.praise}</p>
                {gptFeedback.hint && <p className="hint">{gptFeedback.hint}</p>}
                {gptFeedback.explain && <p className="explain">{gptFeedback.explain}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Removed quiz actions - automatic validation now */}

      {/* Immediate Feedback Popup */}
      {currentFeedbackData && (
        <ImmediateFeedback
          isVisible={showImmediateFeedback}
          isCorrect={currentFeedbackData.isCorrect}
          question={currentFeedbackData.question}
          userAnswer={currentFeedbackData.userAnswer}
          correctAnswer={currentFeedbackData.correctAnswer}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
};

export default Money;
