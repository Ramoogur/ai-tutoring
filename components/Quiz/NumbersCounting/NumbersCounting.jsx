import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import questionService from './questionService';
import './NumbersCounting.css';

// Static data for rendering (no longer importing from external file)
const numberWords = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
  5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
};

const countingObjects = {
  apple: '🍎', star: '⭐', circle: '⭕', heart: '❤️',
  triangle: '🔺', square: '⬜', diamond: '💎', flower: '🌸'
};

const numberPaths = {
  1: 'M50,20 L50,80',
  2: 'M20,20 L80,20 L80,50 L20,80 L80,80',
  3: 'M20,20 L80,20 L50,50 L80,80 L20,80',
  // Add more as needed
};

const wordPaths = {
  one: 'M20,50 L80,50',
  two: 'M20,20 L80,20 L20,80 L80,80',
  // Add more as needed
};

const NumbersCounting = ({ topic, user, navigateTo }) => {
  // Core quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  
  // Answer states for different question types
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [tracedPath, setTracedPath] = useState([]);
  const [drawnObjects, setDrawnObjects] = useState([]);
  const [coloredObjects, setColoredObjects] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sequenceAnswers, setSequenceAnswers] = useState([]);
  
  // Detailed answer tracking for AI analysis
  const [answerHistory, setAnswerHistory] = useState([]);
  
  // AI integration states
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  
  // GPT integration states
  const [useGPTQuestions, setUseGPTQuestions] = useState(true);
  const [gptGenerating, setGptGenerating] = useState(false);
  const [questionSource, setQuestionSource] = useState('static'); // 'gpt' or 'static'
  
  // Canvas and drawing refs
  const canvasRef = useRef(null);
  const tracingCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTracing, setIsTracing] = useState(false);

  // Get difficulty from user performance - same as ShapesColors
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
      resetAnswerStates();
      
      // Load current difficulty from database
      let savedDifficulty = 'easy'; // Default
      try {
        const { data: studentStats } = await supabase
          .from('StudentTopicStats')
          .select('current_difficulty')
          .eq('student_id', user.id)
          .eq('topic_id', 1)
          .maybeSingle();
        
        if (studentStats?.current_difficulty) {
          savedDifficulty = studentStats.current_difficulty;
          console.log(`💾 Loaded saved difficulty: ${savedDifficulty}`);
        }
      } catch (error) {
        console.log('🆆 No previous progress found, starting at Easy level');
      }
      
      // Initialize AI system for Numbers & Counting with correct difficulty
      console.log(`🤖 Initializing AI Tutor for Numbers & Counting at ${savedDifficulty} difficulty`);
      aiController.startQuizSession('numbers_counting');
      
      // Set AI to the correct difficulty level from database BEFORE starting
      aiTutor.setDifficultyForNextSession(savedDifficulty);
      setAiStatus(aiController.getAIStatus());
      
      // Use the loaded difficulty level and update state
      let difficultyLevel = savedDifficulty;
      setDifficulty(savedDifficulty); // Update React state for UI display
      console.log(`🎯 Starting quiz at difficulty: ${difficultyLevel}`);
      
      // Prepare questions with AI selection
      initializeQuiz(difficultyLevel);
      
    })();
  }, [topic, user]);

  const initializeQuiz = async (difficultyLevel = difficulty) => {
    setIsLoading(true);
    setGptGenerating(useGPTQuestions);
    
    let selectedQuestions = [];
    
    try {
      console.log('🤖 Generating dynamic questions with GPT-3.5...');
      
      // Generate questions using GPT service only - force GPT generation
      selectedQuestions = await questionService.getQuestions(
        'numbers_counting', 
        difficultyLevel, 
        5, 
        true // Always use GPT
      );
      
      if (selectedQuestions.length > 0) {
        setQuestionSource('gpt');
        console.log(`✅ GPT generated ${selectedQuestions.length} dynamic questions`);
      } else {
        throw new Error('GPT returned no questions');
      }
    } catch (error) {
      console.error('❌ Question generation failed:', error.message);
      setQuestionSource('error');
      
      // Show error message to user - no fallback to static questions
      setFeedback({
        type: 'error',
        message: 'Unable to generate questions with GPT. Please check your internet connection and API key.',
        details: error.message
      });
      
      // Return empty to prevent quiz from starting with static questions
      selectedQuestions = [];
      setIsLoading(false);
      return;
    }
    
    setQuestions(selectedQuestions);
    setGptGenerating(false);
    
    // Start tracking the first question with AI
    if (selectedQuestions.length > 0) {
      const questionTrackingData = aiController.startQuestion(selectedQuestions[0]);
      setQuestionStartTime(questionTrackingData.startTime);
    }
    
    setTimeout(() => setIsLoading(false), 1500);
  };

  // Get student performance profile for adaptive questions
  const getStudentProfile = async () => {
    try {
      const { data } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', 1)
        .single();
      
      if (data) {
        return {
          tracingAccuracy: data.tracing_accuracy || 0.5,
          countingAccuracy: data.counting_accuracy || 0.5,
          sequenceAccuracy: data.sequence_accuracy || 0.5,
          wordProblemAccuracy: data.word_problem_accuracy || 0.5,
          overallAccuracy: data.correct_answers / Math.max(data.total_attempts, 1)
        };
      }
    } catch (error) {
      console.log('No previous performance data found');
    }
    
    // Default profile for new students
    return {
      tracingAccuracy: 0.5,
      countingAccuracy: 0.5,
      sequenceAccuracy: 0.5,
      wordProblemAccuracy: 0.5,
      overallAccuracy: 0.5
    };
  };


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const resetAnswerStates = () => {
    setUserAnswer('');
    setSelectedOption('');
    setTracedPath([]);
    setDrawnObjects([]);
    setColoredObjects([]);
    setMatchedPairs([]);
    setSelectedGroup('');
    setSequenceAnswers([]);
    setShowResult(false);
  };

  // Analyze error patterns for AI insights
  const analyzeErrorPatterns = (history) => {
    const errorTypes = {};
    const questionTypeErrors = {};
    let totalErrors = 0;
    
    history.forEach(answer => {
      if (!answer.isCorrect) {
        totalErrors++;
        
        // Count error types
        if (answer.errorType) {
          errorTypes[answer.errorType] = (errorTypes[answer.errorType] || 0) + 1;
        }
        
        // Count errors by question type
        questionTypeErrors[answer.questionType] = (questionTypeErrors[answer.questionType] || 0) + 1;
      }
    });
    
    return {
      totalErrors,
      errorRate: totalErrors / history.length,
      commonErrorTypes: Object.entries(errorTypes).sort((a, b) => b[1] - a[1]),
      difficultQuestionTypes: Object.entries(questionTypeErrors).sort((a, b) => b[1] - a[1]),
      needsHelp: totalErrors > history.length * 0.4 // More than 40% errors
    };
  };

  const getCurrentQuestion = () => questions[currentQuestionIndex];

  // Tracing functionality
  const startTracing = (e) => {
    setIsTracing(true);
    const canvas = tracingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracedPath([{ x, y }]);
  };

  const continueTracing = (e) => {
    if (!isTracing) return;
    const canvas = tracingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTracedPath(prev => [...prev, { x, y }]);
    
    // Draw on canvas
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    if (tracedPath.length > 0) {
      const lastPoint = tracedPath[tracedPath.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopTracing = () => {
    setIsTracing(false);
  };

  // Drawing functionality
  const startDrawing = (e) => {
    setIsDrawing(true);
    addDrawnObject(e);
  };

  const addDrawnObject = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const question = getCurrentQuestion();
    const newObject = {
      id: Date.now() + Math.random(),
      x,
      y,
      type: question.target || question.objects
    };
    
    setDrawnObjects(prev => [...prev, newObject]);
  };

  const clearDrawing = () => {
    setDrawnObjects([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const clearTracing = () => {
    setTracedPath([]);
    const canvas = tracingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Answer checking with AI integration
  const checkAnswer = () => {
    if (isChecking) return;
    setIsChecking(true);
    
    const question = getCurrentQuestion();
    let isCorrect = false;
    let userResponse = '';
    
    // Enhanced answer validation with detailed error analysis
    let errorType = null;
    let detailedFeedback = '';
    
    switch (question.type) {
      case 'tracing':
        isCorrect = tracedPath.length > 10;
        userResponse = `traced ${tracedPath.length} points`;
        if (!isCorrect) {
          errorType = 'incomplete_tracing';
          detailedFeedback = 'Try to trace the complete shape or number';
        }
        break;
        
      case 'counting':
        const userCount = parseInt(userAnswer.trim());
        const correctCount = parseInt(question.answer);
        isCorrect = userCount === correctCount;
        userResponse = `counted ${userAnswer.trim()}`;
        
        if (!isCorrect) {
          if (isNaN(userCount)) {
            errorType = 'invalid_number';
            detailedFeedback = 'Please enter a valid number';
          } else if (userCount > correctCount) {
            const difference = userCount - correctCount;
            errorType = 'overcount';
            detailedFeedback = `You counted ${userCount}, but there are only ${correctCount}. You counted ${difference} too many.`;
          } else {
            const difference = correctCount - userCount;
            errorType = 'undercount';
            detailedFeedback = `You counted ${userCount}, but there are ${correctCount}. You missed ${difference} objects.`;
          }
        }
        break;
        
      case 'drawing':
        const drawnCount = drawnObjects.length;
        const expectedCount = parseInt(question.answer);
        isCorrect = drawnCount === expectedCount;
        userResponse = `drew ${drawnCount} objects`;
        
        if (!isCorrect) {
          if (drawnCount > expectedCount) {
            errorType = 'too_many_drawn';
            detailedFeedback = `You drew ${drawnCount}, but need ${expectedCount}`;
          } else {
            errorType = 'too_few_drawn';
            detailedFeedback = `You drew ${drawnCount}, but need ${expectedCount}`;
          }
        }
        break;
        
      case 'multiple_choice':
      case 'matching':
        isCorrect = selectedOption === question.answer;
        userResponse = selectedOption || 'no selection';
        
        if (!isCorrect) {
          errorType = selectedOption ? 'wrong_choice' : 'no_selection';
          if (selectedOption) {
            // Provide more specific feedback for matching/multiple choice
            const userNum = parseInt(selectedOption);
            const correctNum = parseInt(question.answer);
            if (!isNaN(userNum) && !isNaN(correctNum)) {
              const difference = Math.abs(userNum - correctNum);
              detailedFeedback = `You selected ${selectedOption}, but the correct answer is ${question.answer}. You were off by ${difference}.`;
            } else {
              detailedFeedback = `You selected ${selectedOption}, but the correct answer is ${question.answer}`;
            }
          } else {
            detailedFeedback = 'Please make a selection';
          }
        }
        break;
        
      case 'word_completion':
        const userWord = userAnswer.toLowerCase().trim();
        const correctAnswer = question.answer.toLowerCase();
        isCorrect = userWord === correctAnswer;
        userResponse = userAnswer.trim();
        
        if (!isCorrect) {
          // More specific error types for word completion
          if (userWord === '') {
            errorType = 'no_answer';
            detailedFeedback = 'Please type your answer';
          } else if (userWord.length !== correctAnswer.length) {
            errorType = 'wrong_length';
            detailedFeedback = `You wrote "${userAnswer}" (${userWord.length} letters), but the correct answer "${question.answer}" has ${correctAnswer.length} letters`;
          } else {
            // Check for common number word confusions
            const numberWords = {
              'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 
              'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
            };
            
            if (numberWords[userWord] && numberWords[correctAnswer]) {
              errorType = 'wrong_number_word';
              detailedFeedback = `You wrote "${userAnswer}" (${numberWords[userWord]}), but the correct answer is "${question.answer}" (${numberWords[correctAnswer]})`;
            } else {
              errorType = 'wrong_letters';
              detailedFeedback = `You wrote "${userAnswer}", but the correct answer is "${question.answer}"`;
            }
          }
        }
        break;
        
      case 'word_problem':
        const problemAnswer = parseInt(userAnswer.trim());
        const correctProblemAnswer = parseInt(question.answer);
        isCorrect = problemAnswer === correctProblemAnswer;
        userResponse = `answered ${userAnswer.trim()}`;
        
        if (!isCorrect) {
          if (isNaN(problemAnswer)) {
            errorType = 'invalid_math_answer';
            detailedFeedback = 'Please enter a number for your answer';
          } else {
            errorType = 'wrong_calculation';
            detailedFeedback = `You answered ${problemAnswer}, but the correct answer is ${correctProblemAnswer}`;
          }
        }
        break;
        
      default:
        isCorrect = false;
        userResponse = 'unknown question type';
        errorType = 'unsupported_question';
        detailedFeedback = 'This question type is not supported yet';
    }

    // Record detailed answer for tracking
    const answerRecord = {
      questionId: question.id,
      questionType: question.type,
      question: question.question,
      correctAnswer: question.answer,
      userResponse,
      isCorrect,
      errorType,
      detailedFeedback,
      timeSpent: Date.now() - questionStartTime,
      timestamp: new Date().toISOString()
    };
    
    setAnswerHistory(prev => [...prev, answerRecord]);
    
    // AI Analysis and Feedback (using standard parameters to avoid breaking)
    const aiAnalysisResult = aiController.processAnswer(question, isCorrect, userResponse);
    
    console.log(`🔍 AI Analysis: ${isCorrect ? 'Correct' : 'Incorrect'} - ${aiAnalysisResult.aiFeedback.message}`);
    if (errorType) {
      console.log(`❌ Error Type: ${errorType} - ${detailedFeedback}`);
    }
    
    // Update AI status
    setAiStatus(aiController.getAIStatus());
    
    // Set comprehensive feedback combining AI and detailed analysis
    setAiFeedback({
      ...aiAnalysisResult.aiFeedback,
      detailedFeedback,
      errorType
    });
    
    // Log difficulty adjustments
    if (aiAnalysisResult.difficultyAdjustment) {
      console.log(`🔄 AI adjusted difficulty to: ${aiAnalysisResult.newDifficulty}`);
      setDifficulty(aiAnalysisResult.newDifficulty.toLowerCase());
    }

    // Set enhanced feedback with detailed error information
    const feedbackMessage = isCorrect ? 
      aiAnalysisResult.aiFeedback.message : 
      `${aiAnalysisResult.aiFeedback.message}\n${detailedFeedback}`;
    
    setFeedback({
      isCorrect,
      message: feedbackMessage,
      errorType,
      detailedFeedback
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Auto-advance to next question or finish quiz
    if (currentQuestionIndex >= questions.length - 1) {
      finishQuiz();
    } else {
      // Move to next question immediately
      setTimeout(() => {
        nextQuestion();
      }, 500); // Brief delay to register the answer
    }
    
    setIsChecking(false);
  };

  const nextQuestion = () => {
    console.log(`🔄 Moving to next question. Current: ${currentQuestionIndex}, Total: ${questions.length}`);
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setShowResult(false); // Hide result to show next question
      resetAnswerStates();
      
      // Start tracking the next question for AI
      if (questions[nextIndex]) {
        const questionTrackingData = aiController.startQuestion(questions[nextIndex]);
        setQuestionStartTime(questionTrackingData.startTime);
      }
      
      console.log(`✅ Moved to question ${nextIndex + 1} of ${questions.length}`);
    } else {
      console.log('🏁 Quiz completed, finishing...');
      finishQuiz();
    }
  };


  // Calculate next session difficulty based on performance
  const calculateNextSessionDifficulty = (accuracy, currentDiff) => {
    if (currentDiff === 'easy') {
      return accuracy > 80 ? 'medium' : 'easy';
    } else if (currentDiff === 'medium') {
      if (accuracy > 80) return 'hard';
      if (accuracy < 60) return 'easy';
      return 'medium';
    } else { // hard
      if (accuracy < 60) return 'easy';
      if (accuracy < 80) return 'medium';
      return 'hard';
    }
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
      const currentSessionDifficulty = aiSessionSummary?.difficultyProgression?.current || difficulty;
      const nextSessionDifficulty = aiSessionSummary?.difficultyProgression?.next || difficulty;
      
      // 1. Update/Insert StudentTopicStats (overall progress)
      const statsData = {
        student_id: user.id,
        topic_id: 1, // Numbers & Counting topic ID
        total_attempts: 1, // Will be incremented by database trigger if exists
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
          achievements: aiSessionSummary?.aiFeedback?.achievements || [],
          errorPatterns: analyzeErrorPatterns(answerHistory),
          detailedAnswerHistory: answerHistory
        })
      };
      
      const { data: statsResult, error: statsError } = await supabase
        .from('StudentTopicStats')
        .upsert(statsData, { onConflict: 'student_id,topic_id' });
      
      if (statsError) {
        console.error('❌ StudentTopicStats upsert error:', statsError);
      } else {
        console.log('✅ StudentTopicStats upsert successful:', statsResult);
      }
      
      // 2. Insert QuizSession record (detailed session data)
      const sessionData = {
        student_id: user.id,
        topic_id: 1, // Numbers & Counting topic ID
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
          detailedAnswers: answerHistory,
          errorAnalysis: analyzeErrorPatterns(answerHistory),
          responses: answerHistory.map(answer => ({
            questionId: answer.questionId,
            questionType: answer.questionType,
            correct: answer.isCorrect,
            userResponse: answer.userResponse,
            correctAnswer: answer.correctAnswer,
            errorType: answer.errorType,
            timeSpent: answer.timeSpent
          }))
        })
      };
      
      const { data: sessionResult, error: sessionError } = await supabase.from('QuizSessions').insert(sessionData);
      
      if (sessionError) {
        console.error('❌ QuizSessions insert error:', sessionError);
      } else {
        console.log('✅ QuizSessions insert successful:', sessionResult);
      }
      
      console.log(`📊 Results saved - Score: ${score}/${questions.length}, Accuracy: ${(accuracy*100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Error saving results:', error);
      console.error('❌ Database save failed with data:', { sessionAccuracy, questions: questions.length, score });
    }
  };

  // Render different question types
  const renderQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    switch (question.type) {
      case 'tracing':
        return renderTracingQuestion(question);
      case 'counting':
        return renderCountingQuestion(question);
      case 'drawing':
        return renderDrawingQuestion(question);
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question);
      case 'matching':
        return renderMatchingQuestion(question);
      case 'coloring':
        return renderColoringQuestion(question);
      case 'sequence':
        return renderSequenceQuestion(question);
      case 'comparison':
        return renderComparisonQuestion(question);
      case 'word_problem':
        return renderWordProblemQuestion(question);
      case 'word_completion':
        return renderWordCompletionQuestion(question);
      case 'odd_one_out':
        return renderOddOneOutQuestion(question);
      case 'hybrid':
        return renderHybridQuestion(question);
      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderTracingQuestion = (question) => (
    <div className="tracing-container">
      <h3>{question.question}</h3>
      <div className="tracing-area">
        <svg width="200" height="120" className="tracing-guide">
          <path
            d={question.targetType === 'number' ? numberPaths[question.target] : wordPaths[question.target]}
            stroke="#ddd"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>
        <canvas
          ref={tracingCanvasRef}
          width="200"
          height="120"
          className="tracing-canvas"
          onMouseDown={startTracing}
          onMouseMove={continueTracing}
          onMouseUp={stopTracing}
          onMouseLeave={stopTracing}
        />
      </div>
      <button onClick={clearTracing} className="clear-btn">Clear</button>
    </div>
  );

  const renderCountingQuestion = (question) => (
    <div className="counting-container">
      <h3>{question.question}</h3>
      <div className="objects-grid">
        {Array.from({ length: question.count }, (_, i) => (
          <div key={i} className="counting-object">
            {countingObjects[question.objects]}
          </div>
        ))}
      </div>
      <div className="input-instruction">
        <p><strong>Enter your answer below:</strong></p>
        <p>Count the {question.objects}s above and type the number</p>
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Enter number here (0-10)"
        className="number-input"
        min="0"
        max="10"
      />
    </div>
  );

  const renderDrawingQuestion = (question) => (
    <div className="drawing-container">
      <h3>{question.question}</h3>
      <div className="drawing-info">
        <p>Click on the canvas to draw {question.count} {question.target}s</p>
        <p>Objects drawn: {drawnObjects.length}</p>
      </div>
      <canvas
        ref={canvasRef}
        width="400"
        height="200"
        className="drawing-canvas"
        onClick={addDrawnObject}
      />
      <div className="drawing-objects">
        {drawnObjects.map((obj, index) => (
          <span key={obj.id} className="drawn-object" style={{ left: obj.x, top: obj.y }}>
            {countingObjects[obj.type] || '⭕'}
          </span>
        ))}
      </div>
      <button onClick={clearDrawing} className="clear-btn">Clear</button>
      {question.type === 'word_problem' && (
        <div>
          <div className="input-instruction">
            <p><strong>Enter your answer:</strong></p>
            <p>Type the total number after solving the problem</p>
          </div>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter total number (0-10)"
            className="number-input"
            min="0"
            max="10"
          />
        </div>
      )}
    </div>
  );

  const renderMultipleChoiceQuestion = (question) => (
    <div className="multiple-choice-container">
      <h3>{question.question}</h3>
      <div className="options-grid">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderMatchingQuestion = (question) => {
    // Handle GPT-generated matching questions that have different structure
    const numbers = question.numbers || question.choices || ['1', '2', '3'];
    const objectType = question.objects || question.object || 'cat';
    const objectEmoji = countingObjects[objectType] || '🐱';
    
    // Create specific groups to match - show one group with the correct answer
    const correctAnswer = question.answer || numbers[0];
    const correctCount = parseInt(correctAnswer);
    
    return (
      <div className="matching-container">
        <h3>{question.question}</h3>
        
        <div className="matching-instruction">
          <p><strong>Instructions:</strong> Count the {objectType}s below and click the correct number</p>
        </div>
        
        <div className="matching-area">
          {/* Show the objects to count */}
          <div className="objects-to-count">
            <h4>Count these {objectType}s:</h4>
            <div className="objects-display" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '20px',
              border: '2px dashed #ccc',
              borderRadius: '10px',
              backgroundColor: '#f9f9f9',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {Array.from({ length: correctCount }, (_, i) => (
                <span key={i} className="counting-object" style={{
                  fontSize: '2em',
                  margin: '5px'
                }}>{objectEmoji}</span>
              ))}
            </div>
          </div>
          
          {/* Show number choices */}
          <div className="numbers-section">
            <h4>Choose the correct number:</h4>
            <div className="numbers-row" style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              {numbers.map((num, index) => (
                <button
                  key={index}
                  className={`number-option ${selectedOption === num ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(num)}
                  style={{
                    padding: '15px 25px',
                    fontSize: '1.5em',
                    border: '2px solid #ccc',
                    borderRadius: '10px',
                    backgroundColor: selectedOption === num ? '#4CAF50' : 'white',
                    color: selectedOption === num ? 'white' : 'black',
                    cursor: 'pointer',
                    minWidth: '60px'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderColoringQuestion = (question) => {
    // Handle GPT-generated coloring questions
    const targetCount = question.count || parseInt(question.answer) || 5;
    const objectType = question.objects || question.object || 'heart';
    const objectEmoji = countingObjects[objectType] || '❤️';
    const totalObjects = Math.max(targetCount + 2, 8); // Show more objects than needed
    
    return (
      <div className="coloring-container">
        <h3>{question.question}</h3>
        <div className="coloring-instruction">
          <p>Color exactly <strong>{targetCount}</strong> {objectType}s. Click to color/uncolor.</p>
        </div>
        <div className="coloring-grid">
          {Array.from({ length: totalObjects }, (_, i) => (
            <div
              key={i}
              className={`colorable-object ${coloredObjects.includes(i) ? 'colored' : ''} ${
                coloredObjects.length >= targetCount && !coloredObjects.includes(i) ? 'disabled' : ''
              }`}
              onClick={() => {
                if (coloredObjects.includes(i)) {
                  // Always allow uncoloring
                  setColoredObjects(prev => prev.filter(idx => idx !== i));
                } else if (coloredObjects.length < targetCount) {
                  // Only allow coloring if under the limit
                  setColoredObjects(prev => [...prev, i]);
                }
              }}
              style={{
                backgroundColor: coloredObjects.includes(i) ? 'red' : 'transparent',
                border: '2px solid #ccc',
                cursor: coloredObjects.length >= targetCount && !coloredObjects.includes(i) ? 'not-allowed' : 'pointer',
                opacity: coloredObjects.length >= targetCount && !coloredObjects.includes(i) ? 0.5 : 1
              }}
            >
              {objectEmoji}
            </div>
          ))}
        </div>
        <div className="coloring-status">
          <p className={coloredObjects.length === targetCount ? 'correct' : coloredObjects.length > targetCount ? 'over-limit' : ''}>
            Colored: {coloredObjects.length} / {targetCount}
            {coloredObjects.length > targetCount && <span className="warning"> (Too many!)</span>}
            {coloredObjects.length === targetCount && <span className="success"> ✓ Perfect!</span>}
          </p>
        </div>
      </div>
    );
  };

  const renderSequenceQuestion = (question) => (
    <div className="sequence-container">
      <h3>{question.question}</h3>
      <div className="sequence-grid">
        {question.sequence.map((num, index) => (
          <div key={index} className="sequence-item">
            {num === '' ? (
              <input
                type="number"
                value={sequenceAnswers[index] || ''}
                onChange={(e) => {
                  const newAnswers = [...sequenceAnswers];
                  newAnswers[index] = e.target.value;
                  setSequenceAnswers(newAnswers);
                }}
                className="sequence-input"
                min="0"
                max="10"
              />
            ) : (
              <span className="sequence-number">{num}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparisonQuestion = (question) => {
    // Handle GPT-generated comparison questions
    const objectType = question.objects || question.object || 'circle';
    const objectEmoji = countingObjects[objectType] || '⭕';
    const choices = question.choices || question.options || ['more', 'less', 'same'];
    
    return (
      <div className="comparison-container">
        <h3>{question.question}</h3>
        <div className="comparison-groups">
          <div className="group-a">
            <h4>Group A</h4>
            <div className="group-objects">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className="counting-object">{objectEmoji}</span>
              ))}
            </div>
          </div>
          <div className="group-b">
            <h4>Group B</h4>
            <div className="group-objects">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="counting-object">{objectEmoji}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="comparison-choices">
          <p>Which group has more {objectType}s?</p>
          {choices.map((choice, index) => (
            <button
              key={index}
              className={`choice-btn ${selectedOption === choice ? 'selected' : ''}`}
              onClick={() => setSelectedOption(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderOddOneOutQuestion = (question) => {
    // Handle GPT-generated odd one out questions
    const items = question.items || question.choices || ['2', '4', '6', '7'];
    
    return (
      <div className="odd-one-out-container">
        <h3>{question.question}</h3>
        <div className="items-grid">
          {items.map((item, index) => (
            <button
              key={index}
              className={`item-btn ${selectedOption === item ? 'selected' : ''}`}
              onClick={() => setSelectedOption(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p>Click on the item that doesn't belong with the others.</p>
      </div>
    );
  };

  const renderHybridQuestion = (question) => {
    // Handle hybrid questions by detecting the primary type
    if (question.question.toLowerCase().includes('count')) {
      return renderCountingQuestion(question);
    } else if (question.question.toLowerCase().includes('color')) {
      return renderColoringQuestion(question);
    } else if (question.question.toLowerCase().includes('match')) {
      return renderMatchingQuestion(question);
    } else if (question.choices || question.options) {
      return renderMultipleChoiceQuestion(question);
    } else {
      return renderCountingQuestion(question); // Default fallback
    }
  };

  const renderWordProblemQuestion = (question) => (
    <div className="word-problem-container">
      <h3>{question.question}</h3>
      <div className="problem-breakdown">
        <p>Started with: {question.initial} {question.target}s</p>
        <p>Got {question.added} more</p>
        <p>Draw all the {question.target}s below:</p>
      </div>
      {renderDrawingQuestion(question)}
    </div>
  );

  const renderWordCompletionQuestion = (question) => {
    // Check if question.word exists, if not provide fallback
    if (!question.word) {
      console.warn('Word completion question missing word property:', question);
      return (
        <div className="word-completion-container">
          <h3>{question.question}</h3>
          <p>Error: This question is missing required data. Please try another question.</p>
        </div>
      );
    }

    // Generate blanks array from the question pattern if not provided
    const blanks = question.blanks || [];
    if (blanks.length === 0) {
      // Extract blank positions from question text pattern like "f__e"
      const questionText = question.question.toLowerCase();
      const wordInQuestion = questionText.match(/[a-z_]+/g)?.find(w => w.includes('_'));
      if (wordInQuestion) {
        wordInQuestion.split('').forEach((char, index) => {
          if (char === '_') blanks.push(index);
        });
      }
    }
    
    return (
      <div className="word-completion-container">
        <h3>{question.question}</h3>
        <div className="word-display">
          {question.word.split('').map((letter, index) => (
            <span key={index} className={`letter ${blanks.includes(index) ? 'blank' : ''}`}>
              {blanks.includes(index) ? '_' : letter}
            </span>
          ))}
        </div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type the missing letters"
          className="word-input"
        />
      </div>
    );
  };

  // Check if answer can be submitted
  const canSubmitAnswer = () => {
    const question = getCurrentQuestion();
    if (!question) return false;

    switch (question.type) {
      case 'tracing':
        return tracedPath.length > 5;
      case 'counting':
      case 'word_completion':
        return userAnswer.trim() !== '';
      case 'drawing':
        return drawnObjects.length > 0;
      case 'multiple_choice':
        return selectedOption !== '';
      case 'matching':
        return matchedPairs.length > 0;
      case 'coloring':
        return coloredObjects.length > 0;
      case 'sequence':
        return sequenceAnswers.some(answer => answer !== '');
      case 'comparison':
      case 'odd_one_out':
        return selectedGroup !== '';
      case 'word_problem':
        return drawnObjects.length > 0 && userAnswer.trim() !== '';
      case 'hybrid':
        return tracedPath.length > 5 && userAnswer.trim() !== '';
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="numbers-counting-container">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2> Preparing Numbers & Counting Quiz</h2>
            {gptGenerating ? (
              <p> GPT-3.5 is generating personalized questions...</p>
            ) : (
              <p> AI is selecting personalized questions for you...</p>
            )}
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
            <div className="question-source-indicator">
              {questionSource === 'gpt' ? ' Dynamic Questions' : ' Static Questions'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const accuracy = (score / questions.length) * 100;
    return (
      <div className="results-screen">
        <div className="results-content">
          <h2> Numbers & Counting Complete!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}/{questions.length}</span>
              <span className="score-percentage">{accuracy.toFixed(0)}%</span>
            </div>
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
                  <h4>🎆 Encouragement</h4>
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
            </div>
          )}
          
          {/* Error Analysis Section */}
          {answerHistory.length > 0 && (
            <div className="error-analysis-section">
              <h3>📊 Learning Analysis</h3>
              {(() => {
                const errorAnalysis = analyzeErrorPatterns(answerHistory);
                const incorrectAnswers = answerHistory.filter(a => !a.isCorrect);
                
                return (
                  <div className="analysis-details">
                    <div className="score-breakdown">
                      <p><strong>Correct:</strong> {score}/{questions.length} ({Math.round(accuracy)}%)</p>
                      <p><strong>Incorrect:</strong> {incorrectAnswers.length}/{questions.length}</p>
                    </div>
                    
                    {incorrectAnswers.length > 0 && (
                      <div className="mistakes-review">
                        <h4>🔍 Let's Review Your Mistakes:</h4>
                        {incorrectAnswers.map((answer, idx) => (
                          <div key={idx} className="mistake-item">
                            <p><strong>Question {idx + 1}:</strong> {answer.question}</p>
                            <p><strong>Your Answer:</strong> {answer.userResponse}</p>
                            <p><strong>Correct Answer:</strong> {answer.correctAnswer}</p>
                            <p className="mistake-feedback"><strong>Help:</strong> {answer.detailedFeedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errorAnalysis.commonErrorTypes.length > 0 && (
                      <div className="error-patterns">
                        <h4>📈 Areas to Focus On:</h4>
                        {errorAnalysis.commonErrorTypes.map(([errorType, count], idx) => (
                          <p key={idx}>• {errorType.replace('_', ' ')}: {count} time{count > 1 ? 's' : ''}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div className="encouragement-message">
            {accuracy >= 80 ? (
              <div className="excellent-feedback">
                <h3>🌟 Excellent Work!</h3>
                <p>You're really good with numbers and counting!</p>
              </div>
            ) : accuracy >= 60 ? (
              <div className="good-feedback">
                <h3>👍 Good Job!</h3>
                <p>Keep practicing and you'll get even better!</p>
              </div>
            ) : (
              <div className="encouragement-feedback">
                <h3>🌈 Keep Learning!</h3>
                <p>Every mistake helps you learn. Try again!</p>
              </div>
            )}
          </div>

          <div className="results-actions">
            <button onClick={() => navigateTo('dashboard')} className="back-btn">
              🏠 Return to Home
            </button>
            <button onClick={() => {
              setShowResult(false);
              setCurrentQuestionIndex(0);
              setScore(0);
              resetAnswerStates();
              setFeedback(null);
              setAiFeedback(null);
              initializeQuiz();
            }} className="try-again-btn">
              🤖 AI Remix Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="numbers-counting-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>🔢 Numbers & Counting Quiz</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className={`difficulty-badge difficulty-${aiStatus?.difficulty || 'easy'}`}>
                {(aiStatus?.difficulty || 'easy').toUpperCase()}
              </span>
            </div>
            {aiStatus && (
              <div className="ai-status">
                <span className="ai-indicator" title="AI Tutor Active">
                  🤖 AI: {aiStatus.difficulty} | Performance: {aiStatus.performance?.toFixed(0) || 0}%
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

      <div className="quiz-content">
        {renderQuestion()}
      </div>

      <div className="check-answer-section">
        <button 
          onClick={checkAnswer} 
          disabled={isChecking}
          className="check-answer-btn"
        >
          {isChecking ? 'Checking...' : 'Next Question'}
        </button>
      </div>
    </div>
  );

  const question = getCurrentQuestion();
  
  // Main quiz interface
  return (
    <div className="numbers-counting-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>🔢 Numbers & Counting Quiz</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className={`difficulty-badge difficulty-${aiStatus?.difficulty || 'easy'}`}>
                {(aiStatus?.difficulty || 'easy').toUpperCase()}
              </span>
            </div>
            {aiStatus && (
              <div className="ai-status">
                <span className="ai-indicator" title="AI Tutor Active">
                  🤖 AI: {aiStatus.difficulty} | Performance: {aiStatus.performance?.toFixed(0) || 0}%
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

      <div className="quiz-content">
        {renderQuestion()}
      </div>

      <div className="check-answer-section">
        <button 
          onClick={checkAnswer} 
          disabled={isChecking}
          className="check-answer-btn"
        >
          {isChecking ? 'Checking...' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default NumbersCounting;
