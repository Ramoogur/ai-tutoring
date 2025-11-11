import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import numbersCountingQuestions, { getQuestionsByDifficulty, getQuestionsByType } from '../../../data/numbersCountingQuestions';
import TTSButton from '../TTSButton';
import TranslationButton from '../TranslationButton';
import translationService from '../../../utils/translationService';
import ModernFeedback from '../ModernFeedback';
import ImmediateFeedback from '../ImmediateFeedback';
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
  4: 'M70,20 L70,60 M30,60 L90,60 M70,30 L70,90',
  5: 'M80,20 L30,20 L30,50 L70,50 L70,80 L30,80',
  6: 'M70,20 L30,20 L30,80 L70,80 L70,50 L30,50',
  7: 'M20,20 L80,20 L50,80',
  8: 'M50,20 L30,35 L30,50 L50,65 L70,50 L70,35 L50,20 M50,65 L30,80 L70,80 L50,65',
  9: 'M70,20 L30,20 L30,50 L70,50 L70,80',
  10: 'M30,20 L30,80 M60,20 L50,20 L50,50 L80,50 L80,80 L50,80',
  0: 'M50,20 L30,30 L30,70 L50,80 L70,70 L70,30 L50,20'
};

const wordPaths = {
  one: 'M20,50 L80,50',
  two: 'M20,20 L80,20 L50,50 L20,80 L80,80',
  three: 'M20,20 L70,20 L50,50 L70,80 L20,80',
  four: 'M30,20 L30,50 L70,50 M70,20 L70,80',
  five: 'M70,20 L30,20 L30,50 L60,50 L60,80 L30,80',
  six: 'M60,20 L30,20 L30,80 L60,80 L60,50 L30,50',
  seven: 'M20,20 L70,20 L40,80',
  eight: 'M40,20 L25,35 L25,50 L40,65 L60,50 L60,35 L40,20 M40,65 L25,80 L60,80 L40,65',
  nine: 'M60,20 L30,20 L30,50 L60,50 L60,80',
  ten: 'M25,20 L25,80 M45,20 L45,50 L75,50 L75,80 L45,80',
  zero: 'M40,20 L25,30 L25,70 L40,80 L60,70 L60,30 L40,20'
};

// Parse SVG path to key points for validation
const parseSVGPath = (pathString) => {
  const points = [];
  const commands = pathString.match(/[ML][^ML]*/g) || [];
  
  commands.forEach(cmd => {
    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    if (coords.length >= 2) {
      points.push({ x: coords[0], y: coords[1] });
    }
  });
  
  return points;
};

// Normalize points to a 0-100 scale
const normalizePoints = (points, canvasWidth, canvasHeight) => {
  if (points.length === 0) return [];
  
  return points.map(p => ({
    x: (p.x / canvasWidth) * 100,
    y: (p.y / canvasHeight) * 100
  }));
};

// Calculate distance between two points
const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Optional: Validate tracing using ChatGPT Vision API (for more accurate validation)
const validateTracingWithChatGPT = async (canvasElement, targetNumber, targetType = 'number') => {
  try {
    // Convert canvas to base64 image
    const imageData = canvasElement.toDataURL('image/png');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this handwriting tracing attempt. The student was asked to trace the ${targetType} "${targetNumber}". 
                
Rate the tracing on a scale of 0-100 based on:
1. Completeness (did they trace the full shape?)
2. Accuracy (how closely did they follow the guide?)
3. Recognizability (can you identify what they traced?)

Respond ONLY with a JSON object in this format:
{
  "isCorrect": true/false,
  "accuracy": 0-100,
  "reason": "brief feedback message for a 6-year-old student"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if API fails
    return null;
  } catch (error) {
    console.error('ChatGPT tracing validation error:', error);
    return null;
  }
};

// Validate tracing by comparing with expected path
const validateTracing = (tracedPath, expectedPathString, canvasWidth = 200, canvasHeight = 120) => {
  // Must have minimum points
  if (tracedPath.length < 10) {
    return {
      isCorrect: false,
      accuracy: 0,
      reason: 'Not enough tracing - trace the complete shape'
    };
  }
  
  // Parse expected path
  const expectedPoints = parseSVGPath(expectedPathString);
  if (expectedPoints.length === 0) {
    // Fallback if no expected path defined
    return {
      isCorrect: tracedPath.length > 15,
      accuracy: tracedPath.length > 15 ? 0.7 : 0.3,
      reason: tracedPath.length > 15 ? 'Good effort' : 'Try tracing more carefully'
    };
  }
  
  // Normalize both paths
  const normalizedTraced = normalizePoints(tracedPath, canvasWidth, canvasHeight);
  const normalizedExpected = expectedPoints.map(p => ({ x: p.x, y: p.y }));
  
  // Sample points from traced path to compare (take every 5th point to reduce computation)
  const sampledTraced = normalizedTraced.filter((_, i) => i % 5 === 0);
  
  // Calculate how close the traced path is to the expected path
  let totalDistance = 0;
  let pointsChecked = 0;
  
  sampledTraced.forEach(tracedPoint => {
    // Find closest expected point
    let minDist = Infinity;
    normalizedExpected.forEach(expectedPoint => {
      const dist = distance(tracedPoint, expectedPoint);
      if (dist < minDist) {
        minDist = dist;
      }
    });
    totalDistance += minDist;
    pointsChecked++;
  });
  
  const averageDistance = totalDistance / pointsChecked;
  
  // Calculate coverage - did they trace near all key points?
  let coverage = 0;
  normalizedExpected.forEach(expectedPoint => {
    const hasNearbyTraced = sampledTraced.some(tracedPoint => 
      distance(tracedPoint, expectedPoint) < 20 // Within 20 units
    );
    if (hasNearbyTraced) coverage++;
  });
  const coverageRatio = coverage / normalizedExpected.length;
  
  // Calculate accuracy score (0-1)
  // Lower average distance = better accuracy
  const distanceScore = Math.max(0, 1 - (averageDistance / 50));
  const accuracy = (distanceScore * 0.6) + (coverageRatio * 0.4);
  
  // Consider it correct if accuracy > 0.55 (55%)
  const isCorrect = accuracy > 0.55;
  
  let reason = '';
  if (!isCorrect) {
    if (coverageRatio < 0.5) {
      reason = 'You missed some parts - try tracing the complete shape';
    } else if (distanceScore < 0.4) {
      reason = 'Try to follow the dotted lines more carefully';
    } else {
      reason = 'Good try! Trace more slowly and carefully';
    }
  } else {
    if (accuracy > 0.8) {
      reason = 'Excellent tracing!';
    } else if (accuracy > 0.65) {
      reason = 'Good job!';
    } else {
      reason = 'Nice effort!';
    }
  }
  
  return {
    isCorrect,
    accuracy: Math.round(accuracy * 100),
    reason
  };
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
  
  // Adaptive practice: track question types to focus on
  const [focusedQuestionTypes, setFocusedQuestionTypes] = useState([]);
  const [calculatedNextDifficulty, setCalculatedNextDifficulty] = useState(null);
  
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
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionDetails, setQuestionDetails] = useState([]);
  
  // Translation states
  const [isFrench, setIsFrench] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState([]);
  const [translatedUITexts, setTranslatedUITexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Canvas and drawing refs
  const canvasRef = useRef(null);
  const tracingCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  
  // Immediate feedback states
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);

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
    // Only run once on mount - use a flag to prevent re-initialization
    let isInitialized = false;
    
    (async () => {
      if (!topic || !user || isInitialized) return;
      isInitialized = true;
      
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
      
      // Prepare questions with AI selection - ONLY ONCE
      initializeQuiz(difficultyLevel);
      
    })();
  }, []); // Empty dependency array - only run once on mount

  const initializeQuiz = async (difficultyLevel = difficulty, focusTypes = []) => {
    // Prevent re-initialization if questions are already loaded
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      console.log('⚠️ Questions already loaded, skipping re-initialization');
      return;
    }
    
    setIsLoading(true);
    
    let selectedQuestions = [];
    
    try {
      // Check if we should create a focused practice quiz
      if (focusTypes && focusTypes.length > 0) {
        console.log(`🎯 Creating focused practice quiz for types: ${focusTypes.join(', ')}`);
        
        // Get questions specifically for the weak areas
        selectedQuestions = getQuestionsByType(difficultyLevel, focusTypes, 5);
        
        if (selectedQuestions.length > 0) {
          console.log(`✅ Selected ${selectedQuestions.length} focused practice questions`);
        } else {
          // Fallback to regular questions if no focused questions available
          console.log('⚠️ No focused questions found, using regular questions');
          selectedQuestions = getQuestionsByDifficulty(difficultyLevel, 5);
        }
      } else {
        console.log(`📚 Loading static questions for ${difficultyLevel} level...`);
        
        // Get regular shuffled questions from static pool
        selectedQuestions = getQuestionsByDifficulty(difficultyLevel, 5);
        
        if (selectedQuestions.length > 0) {
          console.log(`✅ Selected ${selectedQuestions.length} static questions`);
        } else {
          throw new Error('No questions available for this difficulty level');
        }
      }
    } catch (error) {
      console.error('❌ Question loading failed:', error.message);
      
      // Show error message to user
      setFeedback({
        type: 'error',
        message: 'Unable to load questions. Please try again.',
        details: error.message
      });
      
      selectedQuestions = [];
      setIsLoading(false);
      return;
    }
    
    setQuestions(selectedQuestions);
    
    // Start tracking the first question with AI
    if (selectedQuestions.length > 0) {
      const questionTrackingData = aiController.startQuestion(selectedQuestions[0]);
      setQuestionStartTime(questionTrackingData.startTime);
    }
    
    setTimeout(() => setIsLoading(false), 500);
  };

  // Get student performance profile for adaptive questions
  const getStudentProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', 1)
        .maybeSingle();

      if (error) {
        console.log('No previous performance data found');
      } else if (data) {
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

  const getCurrentQuestion = () => {
    if (isFrench && translatedQuestions[currentQuestionIndex]) {
      return translatedQuestions[currentQuestionIndex];
    }
    return questions[currentQuestionIndex];
  };

  // Translation toggle handler
  const handleTranslationToggle = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      if (isFrench) {
        // Switch back to English
        setIsFrench(false);
        setTranslatedQuestions([]);
        setTranslatedUITexts({});
      } else {
        // Translate to French
        setIsFrench(true);
        
        // Translate all questions
        const translated = await Promise.all(
          questions.map(q => translationService.translateQuestion(q, 'fr'))
        );
        setTranslatedQuestions(translated);
        
        // Translate UI texts
        const uiTexts = {
          'Numbers & Counting Quiz': 'Quiz de Nombres et Comptage',
          'Question': 'Question',
          'of': 'de',
          'Checking...': 'Vérification...',
          'Next Question': 'Question Suivante',
          'Numbers & Counting Complete!': 'Nombres et Comptage Terminé!',
          'Return to Home': 'Retour à l\'Accueil',
          'AI Remix Quiz': 'Quiz AI Remix',
          'Preparing Numbers & Counting Quiz': 'Préparation du Quiz de Nombres et Comptage',
          'GPT-4o is generating personalized questions...': 'GPT-4o génère des questions personnalisées...',
          'AI is selecting personalized questions for you...': 'L\'IA sélectionne des questions personnalisées pour vous...',
          'Dynamic Questions': 'Questions Dynamiques',
          'Static Questions': 'Questions Statiques',
          'Enter your answer below:': 'Entrez votre réponse ci-dessous:',
          'Count the': 'Comptez les',
          's above and type the number': 's ci-dessus et tapez le nombre',
          'Click on the canvas to draw': 'Cliquez sur le canevas pour dessiner',
          'Objects drawn:': 'Objets dessinés:',
          'Clear': 'Effacer',
          'Instructions:': 'Instructions:',
          'Count these': 'Comptez ces',
          's:': 's:',
          'Choose the correct number:': 'Choisissez le bon nombre:',
          'Color exactly': 'Colorez exactement',
          's. Click to color/uncolor.': 's. Cliquez pour colorier/décolorier.',
          'Colored:': 'Coloré:',
          'Too many!': 'Trop!',
          'Perfect!': 'Parfait!',
          'Which group has more': 'Quel groupe a plus de',
          's?': 's?',
          'Click on the item that doesn\'t belong with the others.': 'Cliquez sur l\'élément qui n\'appartient pas aux autres.',
          'Type the missing letters': 'Tapez les lettres manquantes',
          'Enter number here (0-10)': 'Entrez le nombre ici (0-10)',
          'Enter total number (0-10)': 'Entrez le nombre total (0-10)'
        };
        
        const translatedUI = await translationService.translateUITexts(uiTexts, 'fr');
        setTranslatedUITexts(translatedUI);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

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
    if (!canvas) return;
    
    const question = getCurrentQuestion();
    const targetCount = question.count || parseInt(question.answer) || 0;
    
    // Allow users to draw more or less than required (they'll get feedback after submitting)
    // Set a reasonable maximum limit to prevent abuse (3x the target or max 20)
    const maxAllowed = Math.min(targetCount * 3, 20);
    if (drawnObjects.length >= maxAllowed) {
      console.log(`Maximum ${maxAllowed} objects reached. Clear to draw more.`);
      return;
    }
    
    // Get canvas position and calculate grid-based placement
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate grid layout based on maximum possible objects for better spacing
    const layoutCount = Math.max(targetCount, drawnObjects.length + 1);
    const cols = Math.ceil(Math.sqrt(layoutCount * 1.5)); // Extra space for overflow
    const rows = Math.ceil(layoutCount / cols);
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;
    
    // Determine which grid cell this object goes in
    const currentIndex = drawnObjects.length;
    const row = Math.floor(currentIndex / cols);
    const col = currentIndex % cols;
    
    // Center the object in its grid cell
    const x = (col * cellWidth) + (cellWidth / 2);
    const y = (row * cellHeight) + (cellHeight / 2);
    
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
  const checkAnswer = async () => {
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
        // Get the expected path for this tracing question
        const expectedPath = question.targetType === 'number' 
          ? numberPaths[question.target] 
          : wordPaths[question.target];
        
        let tracingValidation;
        
        // Try ChatGPT validation first if API key is available
        const useChatGPTValidation = import.meta.env.VITE_OPENAI_API_KEY && 
                                     import.meta.env.VITE_USE_CHATGPT_TRACING_VALIDATION === 'true';
        
        if (useChatGPTValidation && tracingCanvasRef.current) {
          console.log('🤖 Using ChatGPT Vision API for tracing validation...');
          try {
            const chatGPTResult = await validateTracingWithChatGPT(
              tracingCanvasRef.current, 
              question.target, 
              question.targetType
            );
            
            if (chatGPTResult) {
              tracingValidation = chatGPTResult;
              console.log('✅ ChatGPT validation successful:', chatGPTResult);
            } else {
              // Fallback to algorithm validation
              console.log('⚠️ ChatGPT validation failed, using algorithm...');
              tracingValidation = validateTracing(tracedPath, expectedPath, 200, 120);
            }
          } catch (error) {
            console.error('❌ ChatGPT validation error:', error);
            tracingValidation = validateTracing(tracedPath, expectedPath, 200, 120);
          }
        } else {
          // Use algorithm-based validation
          tracingValidation = validateTracing(tracedPath, expectedPath, 200, 120);
        }
        
        isCorrect = tracingValidation.isCorrect;
        userResponse = `traced with ${tracingValidation.accuracy}% accuracy`;
        
        if (!isCorrect) {
          errorType = 'poor_tracing';
          detailedFeedback = tracingValidation.reason;
        } else {
          detailedFeedback = tracingValidation.reason;
        }
        
        console.log(`📝 Tracing validation: ${isCorrect ? 'Correct' : 'Incorrect'} - Accuracy: ${tracingValidation.accuracy}% - ${tracingValidation.reason}`);
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
        
      case 'coloring':
        const coloredCount = coloredObjects.length;
        const targetColorCount = parseInt(question.answer);
        isCorrect = coloredCount === targetColorCount;
        userResponse = `colored ${coloredCount} objects`;
        
        if (!isCorrect) {
          if (coloredCount > targetColorCount) {
            errorType = 'too_many_colored';
            detailedFeedback = `You colored ${coloredCount}, but need exactly ${targetColorCount}`;
          } else if (coloredCount < targetColorCount) {
            errorType = 'too_few_colored';
            detailedFeedback = `You colored ${coloredCount}, but need ${targetColorCount}`;
          }
        }
        break;
        
      case 'sequence':
        // Find the missing index and check if user filled it correctly
        const missingIdx = question.missingIndex;
        const userSequenceAnswer = sequenceAnswers[missingIdx];
        isCorrect = userSequenceAnswer === question.answer;
        userResponse = `filled in ${userSequenceAnswer || 'nothing'}`;
        
        if (!isCorrect) {
          if (!userSequenceAnswer || userSequenceAnswer === '') {
            errorType = 'no_sequence_answer';
            detailedFeedback = 'Please fill in the missing number';
          } else {
            errorType = 'wrong_sequence';
            detailedFeedback = `You wrote ${userSequenceAnswer}, but the correct answer is ${question.answer}`;
          }
        }
        break;
        
      case 'comparison':
        isCorrect = selectedGroup === question.answer;
        userResponse = selectedGroup || 'no selection';
        
        if (!isCorrect) {
          errorType = selectedGroup ? 'wrong_comparison' : 'no_selection';
          detailedFeedback = selectedGroup 
            ? `You selected ${selectedGroup}, but the correct answer is ${question.answer}` 
            : 'Please make a selection';
        }
        break;
        
      case 'odd_one_out':
        isCorrect = selectedOption === question.answer;
        userResponse = selectedOption || 'no selection';
        
        if (!isCorrect) {
          errorType = selectedOption ? 'wrong_odd_one_out' : 'no_selection';
          detailedFeedback = selectedOption 
            ? `You selected ${selectedOption}, but the correct answer is ${question.answer}` 
            : 'Please select the number that doesn\'t belong';
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
    
    // Track for ModernFeedback component
    setQuestionDetails(prev => [...prev, {
      questionType: question.type,
      correct: isCorrect,
      timeSpent: Date.now() - questionStartTime
    }]);
    
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
    if (aiAnalysisResult.difficultyAdjustment && aiAnalysisResult.newDifficulty) {
      const suggestedDifficulty = aiAnalysisResult.newDifficulty.toLowerCase();
      console.log(`🔄 AI suggested difficulty change to: ${suggestedDifficulty}`);
      setCalculatedNextDifficulty(prev => prev || suggestedDifficulty);
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
    
    // Show immediate feedback popup
    setCurrentFeedbackData({
      isCorrect,
      question: question,
      userAnswer: userResponse,
      correctAnswer: question.answer
    });
    setShowImmediateFeedback(true);
  };

  const handleFeedbackClose = async () => {
    setShowImmediateFeedback(false);
    setCurrentFeedbackData(null);
    setIsChecking(false);
    
    // Auto-advance to next question or finish quiz
    if (currentQuestionIndex >= questions.length - 1) {
      finishQuiz();
    } else {
      nextQuestion();
    }
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

  // Handle Practice Again with adaptive focus
  const handlePracticeAgain = async () => {
    console.log('🔄 Starting adaptive practice session...');
    
    // Analyze which question types the student got wrong
    const incorrectQuestions = questionDetails.filter(q => !q.correct);
    const incorrectTypes = [...new Set(incorrectQuestions.map(q => q.questionType))];
    
    console.log(`📊 Student struggled with: ${incorrectTypes.join(', ')}`);
    console.log(`📝 Incorrect questions: ${incorrectQuestions.length} / ${questionDetails.length}`);
    
    // Fetch updated difficulty from database to ensure consistency
    let practiceLevel = difficulty;
    try {
      const { data: stats, error } = await supabase
        .from('StudentTopicStats')
        .select('current_difficulty')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .maybeSingle();
      
      if (!error && stats && stats.current_difficulty) {
        practiceLevel = stats.current_difficulty;
        console.log(`📊 Fetched updated difficulty from database: ${practiceLevel}`);
      } else {
        // Fallback to calculated difficulty or current
        practiceLevel = calculatedNextDifficulty || difficulty;
        console.log(`ℹ️ Using fallback difficulty: ${practiceLevel}`);
      }
    } catch (error) {
      console.error('Error fetching difficulty:', error);
      practiceLevel = calculatedNextDifficulty || difficulty;
    }
    
    const difficultyChanged = practiceLevel !== difficulty;
    
    if (difficultyChanged) {
      console.log(`📈 Level change! Moving from ${difficulty} → ${practiceLevel}`);
      setDifficulty(practiceLevel); // Update difficulty state
    } else {
      console.log(`📊 Continuing at ${practiceLevel} level`);
    }
    
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setFeedback(null);
    setAiFeedback(null);
    setQuestionDetails([]);
    setAnswerHistory([]);
    setTotalTimeSpent(0);
    setCalculatedNextDifficulty(null); // Reset for next session
    resetAnswerStates();
    
    // Initialize new AI session
    aiController.startQuizSession(topic.name, user);
    
    // If student made mistakes, create focused practice with reshuffled questions
    if (incorrectTypes.length > 0) {
      setFocusedQuestionTypes(incorrectTypes);
      await initializeQuiz(practiceLevel, incorrectTypes); // Use new difficulty with focused types
      console.log(`🎯 Created focused practice quiz at ${practiceLevel} level for: ${incorrectTypes.join(', ')}`);
    } else {
      // Perfect score - continue with regular quiz with reshuffled questions
      setFocusedQuestionTypes([]);
      await initializeQuiz(practiceLevel); // Use new difficulty
      console.log(`⭐ Perfect score! Creating regular practice quiz at ${practiceLevel} level with reshuffled questions`);
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
    const questionTimeElapsed = questionStartTime ? (Date.now() - questionStartTime) : 0;
    const totalTime = Math.floor(questionTimeElapsed / 1000);
    setTotalTimeSpent(totalTime);
    
    const sessionAccuracy = (score / Math.max(questions.length, 1)) * 100;
    const manualDifficultyProgression = {
      current: difficulty,
      next: calculateNextSessionDifficulty(sessionAccuracy, difficulty),
      reason: `Accuracy ${sessionAccuracy.toFixed(1)}%`
    };
    setCalculatedNextDifficulty(manualDifficultyProgression.next);
    
    // Complete AI session and get comprehensive feedback
    let aiSessionSummary = aiController.completeQuizSession();
    console.log('🎓 AI Session Summary:', aiSessionSummary);
    
    if (!aiSessionSummary || typeof aiSessionSummary !== 'object') {
      aiSessionSummary = {
        aiFeedback: {},
        difficultyProgression: manualDifficultyProgression,
        performance: sessionAccuracy,
        currentStreak: 0,
        duration: questionTimeElapsed
      };
    } else {
      aiSessionSummary = {
        ...aiSessionSummary,
        difficultyProgression: manualDifficultyProgression
      };
      aiSessionSummary.aiFeedback = aiSessionSummary.aiFeedback || {};
    }
    
    // Set AI feedback with session summary
    setAiFeedback({
      ...aiSessionSummary.aiFeedback,
      sessionSummary: aiSessionSummary
    });
    
    // Update final AI status
    setAiStatus(aiController.getAIStatus());
    
    // Save comprehensive progress data to database
    try {
      const currentSessionDifficulty = manualDifficultyProgression.current;
      const nextSessionDifficulty = manualDifficultyProgression.next;
      
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
          difficultyHistory: manualDifficultyProgression,
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
        time_spent: totalTime,
        next_difficulty: nextSessionDifficulty,
        difficulty_changed: currentSessionDifficulty !== nextSessionDifficulty,
        ai_feedback: JSON.stringify({
          encouragement: aiSessionSummary?.aiFeedback?.encouragement,
          suggestions: aiSessionSummary?.aiFeedback?.suggestions,
          progressionReason: manualDifficultyProgression.reason
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
      
      console.log(`📊 Results saved - Score: ${score}/${questions.length}, Accuracy: ${sessionAccuracy.toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Error saving results:', error);
      console.error('❌ Database save failed with data:', { sessionAccuracy, questions: questions.length, score });
    }
  };

  // Helper function to extract options for TTS
  const getNumbersCountingOptions = (question) => {
    if (!question) return [];
    if (question.options) {
      return question.options.map(opt => 
        typeof opt === 'object' ? (opt.text || opt.label || opt.id || '') : opt
      );
    }
    if (question.choices) return question.choices;
    return [];
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
      <button onClick={clearTracing} className="clear-btn">{isFrench ? (translatedUITexts['Clear'] || 'Effacer') : 'Clear'}</button>
    </div>
  );

  const renderCountingQuestion = (question) => (
    <div className="counting-container">
      <div className="objects-grid">
        {Array.from({ length: question.count }, (_, i) => (
          <div key={i} className="counting-object">
            {countingObjects[question.objects]}
          </div>
        ))}
      </div>
      <div className="input-instruction">
        <p>{isFrench ? 'Tapez votre réponse dans la boîte ci-dessous' : 'Type your answer in the box below'}</p>
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder={isFrench ? (translatedUITexts['Enter number here (0-10)'] || 'Entrez le nombre ici (0-10)') : 'Enter number here (0-10)'}
        className="number-input"
        min="0"
        max="10"
      />
    </div>
  );

  const renderDrawingQuestion = (question) => {
    const targetCount = question.count || parseInt(question.answer) || 0;
    const isComplete = drawnObjects.length === targetCount;
    const isTooMany = drawnObjects.length > targetCount;
    
    return (
      <div className="drawing-container">
        <div className="input-instruction">
          <p>
            {isFrench 
              ? `Cliquez dans la boîte verte pour dessiner ${targetCount} ${question.target || question.objects}` 
              : `Click inside the green box to draw ${targetCount} ${question.target || question.objects}`}
          </p>
        </div>
        
        <div className="drawing-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className={isComplete ? 'complete' : isTooMany ? 'too-many' : ''}>
            {isFrench ? `${translatedUITexts['Objects drawn:'] || 'Objets dessinés:'} ${drawnObjects.length} / ${targetCount}` : `Objects drawn: ${drawnObjects.length} / ${targetCount}`}
            {isComplete && <span className="success-icon"> ✓</span>}
            {isTooMany && <span className="warning-icon"> ⚠</span>}
          </p>
          {drawnObjects.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDrawnObjects([]);
                // Clear canvas
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Clear all objects"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
        
        <div className="canvas-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          <canvas
            ref={canvasRef}
            width="400"
            height="200"
            className="drawing-canvas"
            onClick={addDrawnObject}
            style={{ 
              cursor: drawnObjects.length >= targetCount ? 'not-allowed' : 'pointer',
              opacity: drawnObjects.length >= targetCount ? 0.7 : 1
            }}
          />
          <div className="drawing-objects" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '400px',
            height: '200px',
            pointerEvents: 'none'
          }}>
            {drawnObjects.map((obj, index) => (
              <span 
                key={obj.id} 
                className="drawn-object" 
                style={{ 
                  position: 'absolute',
                  left: `${obj.x}px`, 
                  top: `${obj.y}px`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '32px',
                  animation: 'drawPop 0.3s ease'
                }}
              >
                {countingObjects[obj.type] || '⭕'}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <button onClick={clearDrawing} className="clear-btn">
            {isFrench ? (translatedUITexts['Clear'] || 'Effacer') : 'Clear'}
          </button>
        </div>
        
        {question.type === 'word_problem' && (
          <div>
            <div className="input-instruction" style={{ marginTop: '20px' }}>
              <p>{isFrench ? 'Tapez votre réponse dans la boîte ci-dessous' : 'Type your answer in the box below'}</p>
            </div>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={isFrench ? (translatedUITexts['Enter total number (0-10)'] || 'Entrez le nombre total (0-10)') : 'Enter total number (0-10)'}
              className="number-input"
              min="0"
              max="10"
            />
          </div>
        )}
      </div>
    );
  };

  const renderMultipleChoiceQuestion = (question) => (
    <div className="multiple-choice-container">
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
        <div className="matching-area">
          {/* Show the objects to count */}
          <div className="objects-to-count">
            <h4>{isFrench ? `${translatedUITexts['Count these'] || 'Comptez ces'} ${objectType}s${translatedUITexts['s:'] || ':'}` : `Count these ${objectType}s:`}</h4>
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
            <h4>{isFrench ? (translatedUITexts['Choose the correct number:'] || 'Choisissez le bon nombre:') : 'Choose the correct number:'}</h4>
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
    
    const isCorrect = coloredObjects.length === targetCount;
    const isTooMany = coloredObjects.length > targetCount;
    const isTooFew = coloredObjects.length < targetCount && coloredObjects.length > 0;
    
    return (
      <div className="coloring-container">
        <div className="coloring-instruction">
          <p>{isFrench ? 'Cliquez pour colorier ou décolorier' : 'Click to color or uncolor'}</p>
        </div>
        <div className="coloring-grid">
          {Array.from({ length: totalObjects }, (_, i) => (
            <div
              key={i}
              className={`colorable-object ${coloredObjects.includes(i) ? 'colored' : ''}`}
              onClick={() => {
                if (coloredObjects.includes(i)) {
                  // Always allow uncoloring
                  setColoredObjects(prev => prev.filter(idx => idx !== i));
                } else {
                  // Allow coloring any object (removed the restriction)
                  setColoredObjects(prev => [...prev, i]);
                }
              }}
              style={{
                backgroundColor: coloredObjects.includes(i) ? '#FFD700' : 'transparent',
                border: '2px solid #ccc',
                cursor: 'pointer',
                opacity: 1
              }}
            >
              {objectEmoji}
            </div>
          ))}
        </div>
        <div className="coloring-status">
          <p className={isCorrect ? 'correct' : isTooMany ? 'over-limit' : isTooFew ? 'under-limit' : ''}>
            {isFrench ? `${translatedUITexts['Colored:'] || 'Coloré:'} ${coloredObjects.length} / ${targetCount}` : `Colored: ${coloredObjects.length} / ${targetCount}`}
            {isTooMany && <span className="warning"> ⚠ {isFrench ? (translatedUITexts['Too many!'] || 'Trop!') : 'Too many!'}</span>}
            {isCorrect && <span className="success"> ✓ {isFrench ? (translatedUITexts['Perfect!'] || 'Parfait!') : 'Perfect!'}</span>}
            {isTooFew && <span className="info"> 💡 {isFrench ? (translatedUITexts['Need more'] || 'Plus nécessaire') : 'Need more'}</span>}
          </p>
        </div>
      </div>
    );
  };

  const renderSequenceQuestion = (question) => (
    <div className="sequence-container">
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
          <p>{isFrench ? `${translatedUITexts['Which group has more'] || 'Quel groupe a plus de'} ${objectType}s${translatedUITexts['s?'] || '?'}` : `Which group has more ${objectType}s?`}</p>
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
          placeholder={isFrench ? (translatedUITexts['Type the missing letters'] || 'Tapez les lettres manquantes') : 'Type the complete word'}
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
      case 'matching':
      case 'odd_one_out':
        return selectedOption !== '';
      case 'coloring':
        return coloredObjects.length > 0;
      case 'sequence':
        return sequenceAnswers.some(answer => answer !== '');
      case 'comparison':
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
            <h2>{isFrench ? (translatedUITexts['Preparing Numbers & Counting Quiz'] || 'Préparation du Quiz de Nombres et Comptage') : 'Preparing Numbers & Counting Quiz'}</h2>
            <p>{isFrench ? 'L\'IA sélectionne des questions personnalisées pour vous...' : 'AI is selecting personalized questions for you...'}</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    // Get next difficulty
    const currentAccuracy = score / questions.length;
    let nextDifficulty = difficulty;
    let difficultyChanged = false;
    
    if (currentAccuracy >= 0.8 && difficulty === 'easy') {
      nextDifficulty = 'medium';
      difficultyChanged = true;
    } else if (currentAccuracy >= 0.8 && difficulty === 'medium') {
      nextDifficulty = 'hard';
      difficultyChanged = true;
    } else if (currentAccuracy < 0.6 && difficulty === 'hard') {
      nextDifficulty = 'medium';
      difficultyChanged = true;
    } else if (currentAccuracy < 0.6 && difficulty === 'medium') {
      nextDifficulty = 'easy';
      difficultyChanged = true;
    }
    
    // Store the calculated next difficulty for Practice Again
    if (calculatedNextDifficulty !== nextDifficulty) {
      setCalculatedNextDifficulty(nextDifficulty);
    }
    
    return (
      <ModernFeedback
        topicName="Numbers & Counting"
        topicIcon="🔢"
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        nextDifficulty={nextDifficulty}
        difficultyChanged={difficultyChanged}
        timeSpent={totalTimeSpent}
        questionDetails={questionDetails}
        studentName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
        onBackToDashboard={() => navigateTo('dashboard')}
        onTryAgain={handlePracticeAgain}
      />
    );
  }

  // Main quiz interface
  return (
    <div className="numbers-counting-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>🔢 {isFrench ? (translatedUITexts['Numbers & Counting Quiz'] || 'Quiz de Nombres et Comptage') : 'Numbers & Counting Quiz'}</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>{(translatedUITexts['Question'] || 'Question')} {currentQuestionIndex + 1} {(translatedUITexts['of'] || 'of')} {questions.length}</span>
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
        <div className="question-content">
          {(() => {
            const question = getCurrentQuestion();
            if (!question) return null;
            return (
              <div className="question-header">
                <h3 className="question-text">{question.question}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <TTSButton 
                    question={question.question}
                    options={getNumbersCountingOptions(question)}
                  />
                  <TranslationButton 
                    onToggle={handleTranslationToggle}
                    isFrench={isFrench}
                  />
                </div>
              </div>
            );
          })()}
          {renderQuestion()}
        </div>
      </div>

      <div className="check-answer-section">
        <button 
          onClick={checkAnswer} 
          disabled={isChecking}
          className="check-answer-btn"
        >
          {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Next Question'] || 'Next Question')}
        </button>
      </div>

      {/* Immediate Feedback Popup */}
      {currentFeedbackData && (
        <ImmediateFeedback
          key={`feedback-q${currentQuestionIndex}`} // Unique key per question to ensure fresh component for each question
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

export default NumbersCounting;
