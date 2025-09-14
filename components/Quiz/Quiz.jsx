import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ShapesColors from './ShapesColors/ShapesColors';
import Time from './Time/Time';
import NumbersCounting from './NumbersCounting/NumbersCounting';
import Addition from './Addition/Addition';
import Measurement from './Measurement/Measurement';
import OrdinalNumbers from './OrdinalNumbers/OrdinalNumbers';
import Patterns from './Patterns/Patterns';
import Money from './Money/Money';
import Abacus from './Abacus/Abacus';
import { aiController } from '../../utils/aiController';
import { aiTutor } from '../../utils/aiTutor';

// `difficulty` is now determined automatically based on past performance
const Quiz = ({ topic, user, navigateTo }) => {
  // Check if this is a shapes and colors topic
  const isShapesColors = topic && (topic.name.toLowerCase().includes('shape') || topic.name.toLowerCase().includes('colour') || topic.name.toLowerCase().includes('color'));
  
  // Check if this is a time topic
  const isTime = topic && topic.name.toLowerCase().includes('time');
  
  // Check if this is an ordinal numbers topic (check FIRST before general numbers)
  const isOrdinalNumbers = topic && (topic.name.toLowerCase().includes('ordinal') || topic.name.toLowerCase().includes('position') || topic.name.toLowerCase().includes('1st') || topic.name.toLowerCase().includes('2nd') || topic.name.toLowerCase().includes('3rd'));
  
  // Check if this is a numbers and counting topic (but NOT ordinal numbers)
  const isNumbersCounting = topic && !isOrdinalNumbers && (topic.name.toLowerCase().includes('number') || topic.name.toLowerCase().includes('count'));
  
  // Check if this is an addition topic
  const isAddition = topic && (topic.name.toLowerCase().includes('addition') || topic.name.toLowerCase().includes('add'));
  
  // Check if this is a measurement topic
  const isMeasurement = topic && (topic.name.toLowerCase().includes('measurement') || topic.name.toLowerCase().includes('comparison') || topic.name.toLowerCase().includes('measure'));
  
  // Check if this is a patterns topic
  const isPatterns = topic && (topic.name.toLowerCase().includes('pattern') || topic.name.toLowerCase().includes('sequence') || topic.name.toLowerCase().includes('repeat'));
  
  // Check if this is a money topic
  const isMoney = topic && (topic.name.toLowerCase().includes('money') || topic.name.toLowerCase().includes('coin') || topic.name.toLowerCase().includes('rupee') || topic.name.toLowerCase().includes('cent'));
  
  // Check if this is an abacus game
  const isAbacus = topic && topic.name.toLowerCase().includes('abacus');
  
  // If it's shapes and colors, use the specialized component
  if (isShapesColors) {
    return <ShapesColors topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's time, use the Time component
  if (isTime) {
    return <Time topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's ordinal numbers, use the OrdinalNumbers component (check BEFORE general numbers)
  if (isOrdinalNumbers) {
    return <OrdinalNumbers topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's numbers and counting, use the NumbersCounting component
  if (isNumbersCounting) {
    return <NumbersCounting topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's addition, use the Addition component
  if (isAddition) {
    return <Addition topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's measurement, use the Measurement component
  if (isMeasurement) {
    return <Measurement topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's patterns, use the Patterns component
  if (isPatterns) {
    return <Patterns topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's money, use the Money component
  if (isMoney) {
    return <Money topic={topic} user={user} navigateTo={navigateTo} />;
  }
  
  // If it's abacus, use the Abacus component
  if (isAbacus) {
    return <Abacus topic={topic} user={user} navigateTo={navigateTo} />;
  }
  const [translated, setTranslated] = useState(null);
  const [transLoading, setTransLoading] = useState(false);
  const [translatedOpts, setTranslatedOpts] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy'); // for display
  const [feedback, setFeedback] = useState(null);
  const [clockUrl, setClockUrl] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingUtteranceRef = useRef(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  // --- Helper functions ---
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

  // Fetch questions + difficulty when topic changes
  // Reset translation when question changes
  useEffect(() => {
    setTranslated(null);
    setTransLoading(false);
    setTranslatedOpts(null);
  }, [currentQuestionIndex]);

  // Fallback French dictionary for common math words
  const fallbackFrDict = {
    'circle': 'Cercle',
    'circular': 'Circulaire',
    'square': 'Carré',
    'triangle': 'Triangle',
    'rectangle': 'Rectangle',
    'oval': 'Ovale',
    'diamond': 'Losange',
    'hexagon': 'Hexagone',
    'pentagon': 'Pentagone',
    'octagon': 'Octogone',
    'red': 'Rouge',
    'blue': 'Bleu',
    'green': 'Vert',
    'yellow': 'Jaune',
    'black': 'Noir',
    'white': 'Blanc',
    'orange': 'Orange',
    'purple': 'Violet',
    'brown': 'Marron',
    'grey': 'Gris',
    'gray': 'Gris',
    'parallelogram': 'Parallélogramme',
    'trapezoid': 'Trapèze',
    'cube': 'Cube',
    'sphere': 'Sphère',
    'cylinder': 'Cylindre',
    'cone': 'Cône',
    'pyramid': 'Pyramide',
    'star': 'Étoile',
    'heart': 'Cœur',
    'plus': 'Plus',
    'minus': 'Moins',
    'add': 'Additionner',
    'subtract': 'Soustraire',
    'multiply': 'Multiplier',
    'divide': 'Diviser',
    // Add more as needed
  };

  // Helper: translate with retry
  async function translateWithRetry(text, langpair, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
        );
        const data = await res.json();
        if (data?.responseData?.translatedText && data.responseData.translatedText.trim() && data.responseData.translatedText.trim().toLowerCase() !== text.trim().toLowerCase()) {
          return data.responseData.translatedText;
        }
        // If translation is identical to input, try dictionary fallback
        const key = text.trim().toLowerCase();
        if (langpair === 'en|fr' && fallbackFrDict[key]) {
          return fallbackFrDict[key];
        }
      } catch (e) {}
      // Wait before retrying
      if (i < retries) await new Promise(res => setTimeout(res, 350));
    }
    return text;
  }

  // Translate current question into French on demand
  const translateQuestion = async () => {
    // Prevent race conditions: snapshot question index
    const thisQuestionIndex = currentQuestionIndex;
    if (transLoading) return;
    if (translated) {
      setTranslated(null);
      setTranslatedOpts(null); // switch back to English for options
      return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    setTransLoading(true);
    try {
      const fr = await translateWithRetry(currentQuestion.question, 'en|fr', 2);
      let frOpts = [];
      if (currentQuestion.options && currentQuestion.options.length) {
        // Translate all options in parallel
        const translations = await Promise.all(
          currentQuestion.options.map(async (opt) => {
            const isNumber = /^-?\d+(?:\.\d+)?$/.test(String(opt).trim());
            if (isNumber) return opt;
            // Always check fallback dict for options
            let frOpt = await translateWithRetry(opt, 'en|fr', 2);
            const key = String(opt).trim().toLowerCase();
            if (frOpt.trim().toLowerCase() === key && fallbackFrDict[key]) {
              frOpt = fallbackFrDict[key];
            }
            return frOpt;
          })
        );
        // Only update state if still on same question
        if (currentQuestionIndex === thisQuestionIndex) {
          if (fr) setTranslated(fr);
          if (translations.length) setTranslatedOpts(translations);
        }
      } else {
        if (fr) setTranslated(fr);
      }
    } catch (err) {
      console.error('translation error', err);
    } finally {
      setTransLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Show loading state
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setFeedback(null);
      setAiFeedback(null);

      // Initialize AI system for this topic
      if (aiEnabled) {
        console.log(`🤖 Initializing AI Tutor for ${topic.name}`);
        aiController.startQuizSession(topic.name);
        setAiStatus(aiController.getAIStatus());
      }

      // Determine difficulty - AI vs traditional method
      let difficultyLevel;
      if (aiEnabled) {
        // AI determines difficulty dynamically
        difficultyLevel = aiTutor.getDifficultyName(aiTutor.currentDifficulty).toLowerCase();
        console.log(`🎯 AI selected difficulty: ${difficultyLevel}`);
      } else {
        // Traditional method using database stats
        const difficultyAuto = await fetchDifficulty(user.id, topic.id);
        difficultyLevel = difficultyAuto;
      }
      setDifficulty(difficultyLevel);

      // Simulate loading delay for better UX
      setTimeout(async () => {
        let quizQuestions = [];

        // Default fallback questions - basicQuestions removed as specialized components handle their own data
        quizQuestions = [
          {
            id: 1,
            question: `Let's practice ${topic.name}!`,
            options: ['Great!', 'Ready!', 'Let\'s go!', 'Awesome!'],
            correct: 'Great!',
            difficulty: 'easy',
            type: 'motivation'
          }
        ];
        
        setQuestions(quizQuestions);
        
        // Start tracking the first question if AI is enabled
        if (aiEnabled && quizQuestions.length > 0) {
          const questionTrackingData = aiController.startQuestion(quizQuestions[0]);
          setQuestionStartTime(questionTrackingData.startTime);
        }
      }, aiEnabled ? 1500 : 1000); // Slightly longer for AI processing
    })();
  }, [topic, aiEnabled]);

  // Generate clock image when current question changes (for Time topic)
  useEffect(() => {
    if (topic.name.toLowerCase().includes('time') && questions.length > 0) {
      const q = questions[currentQuestionIndex];
      const timeMatch = /^\d{1,2}:\d{2}$/.test(q.correct) ? q.correct : null;
      if (timeMatch) {
        // Clock SVG generation removed - handled by Time component
        setClockUrl(null);
      } else {
        setClockUrl(null);
      }
    } else {
      setClockUrl(null);
    }
  }, [topic.name, questions, currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    if (isChecking) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption || isChecking) return;

    setIsChecking(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct;

    // AI Analysis and Feedback
    let aiAnalysisResult = null;
    if (aiEnabled) {
      aiAnalysisResult = aiController.processAnswer(currentQuestion, isCorrect, selectedOption);
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
    }

    // Set standard feedback
    const feedbackMessage = aiEnabled && aiAnalysisResult ? 
      aiAnalysisResult.aiFeedback.message : 
      (isCorrect ? 'Correct! 🎉' : `Incorrect. The correct answer is ${currentQuestion.correct}`);
    
    setFeedback({
      isCorrect,
      message: feedbackMessage
    });

    // Update score if correct
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setSelectedOption(null);
        setFeedback(null);
        setAiFeedback(null);
        
        // Start tracking the next question for AI
        if (aiEnabled && questions[nextIndex]) {
          const questionTrackingData = aiController.startQuestion(questions[nextIndex]);
          setQuestionStartTime(questionTrackingData.startTime);
        }
      } else {
        // Quiz completed
        finishQuiz();
      }
      setIsChecking(false);
    }, aiEnabled ? 2000 : 1500); // Longer delay for AI feedback
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
    // Complete AI session and get comprehensive feedback
    let aiSessionSummary = null;
    if (aiEnabled) {
      aiSessionSummary = aiController.completeQuizSession();
      console.log('🎓 AI Session Summary:', aiSessionSummary);
      setAiFeedback(aiSessionSummary.aiFeedback);
      
      // Update final AI status
      setAiStatus(aiController.getAIStatus());
    }
    
    // Get current date for history
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Update user progress in localStorage
    const updatedUser = { ...user };
    if (!updatedUser.progress) {
      updatedUser.progress = {
        completedQuizzes: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        topicProgress: {},
        quizHistory: []
      };
    }
    
    // Initialize topic progress if it doesn't exist
    if (!updatedUser.progress.topicProgress) {
      updatedUser.progress.topicProgress = {};
    }
    
    // Initialize quiz history if it doesn't exist
    if (!updatedUser.progress.quizHistory) {
      updatedUser.progress.quizHistory = [];
    }
    
    // Update general progress
    updatedUser.progress.completedQuizzes += 1;
    updatedUser.progress.correctAnswers += score;
    updatedUser.progress.totalQuestions += questions.length;
    
    // Update topic-specific progress
    if (!updatedUser.progress.topicProgress[topic.name]) {
      updatedUser.progress.topicProgress[topic.name] = {
        completed: false,
        correctAnswers: 0,
        totalQuestions: 0
      };
    }
    
    updatedUser.progress.topicProgress[topic.name].correctAnswers += score;
    updatedUser.progress.topicProgress[topic.name].totalQuestions += questions.length;
    updatedUser.progress.topicProgress[topic.name].completed = true;
    
    // Add to quiz history with AI analytics
    const historyEntry = {
      topic: topic.name,
      difficulty,
      score,
      totalQuestions: questions.length,
      date: dateString,
      aiEnabled,
      ...(aiSessionSummary && {
        aiAnalytics: {
          finalDifficulty: aiSessionSummary.finalDifficulty,
          performance: aiSessionSummary.performance,
          streak: aiSessionSummary.currentStreak,
          recommendations: aiSessionSummary.nextSession
        }
      })
    };
    updatedUser.progress.quizHistory.unshift(historyEntry);
    
    // Keep history limited to last 10 quizzes
    if (updatedUser.progress.quizHistory.length > 10) {
      updatedUser.progress.quizHistory = updatedUser.progress.quizHistory.slice(0, 10);
    }
    
    // Update both the session user and the registered user data
    localStorage.setItem('mathWhizUser', JSON.stringify(updatedUser));
    
    // Also update the registered user data to persist between logins

    // --- Update stats in Supabase ---
    await supabase.rpc('increment_topic_stats', {
      p_student_id: user.id,
      p_topic_id: topic.id,
      p_attempts_inc: questions.length,
      p_correct_inc: score
    });
    const registeredUserKey = 'mathWhizRegistered_' + user.username;
    const registeredUserData = JSON.parse(localStorage.getItem(registeredUserKey));
    if (registeredUserData) {
      registeredUserData.progress = updatedUser.progress;
      localStorage.setItem(registeredUserKey, JSON.stringify(registeredUserData));
    }
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--primary-color)' }}>
          Preparing your quiz...
        </p>
      </div>
    );
  }

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    
    return (
      <div className={`quiz-container result-container ${aiEnabled ? 'ai-enhanced' : ''}`}>
        <h2>🎓 Quiz Completed!</h2>
        <div className="basic-results">
          <p><strong>Topic:</strong> {topic.name}</p>
          <p><strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          <div className="score">{score} / {questions.length}</div>
          <p><strong>Accuracy:</strong> {accuracy}%</p>
        </div>
        
        {aiEnabled && aiFeedback && (
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
            
            {aiFeedback.nextSteps && aiFeedback.nextSteps.length > 0 && (
              <div className="next-steps-section">
                <h4>📈 Recommended Focus Areas</h4>
                <ul className="next-steps-list">
                  {aiFeedback.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
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
          </div>
        )}
        
        <div className="result-actions">
          <button className="btn primary" onClick={() => navigateTo('dashboard')}>
            🏠 Return to Home
          </button>
          {aiEnabled && (
            <button 
              className="btn secondary" 
              onClick={() => {
                // Reset for another round
                setShowResult(false);
                setCurrentQuestionIndex(0);
                setScore(0);
                setSelectedOption(null);
                setFeedback(null);
                setAiFeedback(null);
                // Let AI prepare new questions
                console.log('🔄 Starting new AI-powered session');
              }}
            >
              🤖 AI Remix Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{topic.name} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
        <div className="quiz-meta">
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          {aiEnabled && aiStatus && (
            <div className="ai-status">
              <span className="ai-indicator" title="AI Tutor Active">
                🤖 AI: {aiStatus.difficulty} | Performance: {aiStatus.performance.toFixed(0)}%
                {aiStatus.currentStreak > 0 && ` | Streak: ${aiStatus.currentStreak}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question">
        <div className="question-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Microphone Button */}
          <button
            className={`mic-btn${isSpeaking ? ' speaking' : ''}`}
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
              }
              // Prepare text to read
              const questionText = translated || currentQuestion.question;
              const optionsText = (translatedOpts || currentQuestion.options).map((opt, idx) => `Option ${idx + 1}: ${opt}`).join('. ');
              const fullText = `${questionText}. ${optionsText}`;
              // Determine language
              const lang = translated ? 'fr-FR' : 'en-US';
              // Stop any ongoing speech
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
              // Create utterance
              const utter = new window.SpeechSynthesisUtterance(fullText);
              utter.lang = lang;
              // Speaking state handlers
              utter.onstart = () => setIsSpeaking(true);
              utter.onend = utter.onerror = () => setIsSpeaking(false);
              speakingUtteranceRef.current = utter;

              // Select appropriate voice
              function speakWithVoice() {
                const voices = window.speechSynthesis.getVoices();
                let selectedVoice = null;
                if (lang === 'fr-FR') {
                  selectedVoice = voices.find(v => v.lang.startsWith('fr'));
                } else {
                  selectedVoice = voices.find(v => v.lang.startsWith('en'));
                }
                if (selectedVoice) utter.voice = selectedVoice;
                window.speechSynthesis.speak(utter);
              }

              // Some browsers load voices asynchronously
              if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = speakWithVoice;
                setTimeout(speakWithVoice, 200);
              } else {
                speakWithVoice();
              }
            }}
            title="Read question and options"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', marginRight: '6px', display: 'flex', alignItems: 'center' }}
            aria-label="Read question and options"
          >
            {/* Classic Microphone SVG Icon (larger, matching provided image) */}
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <rect x="14" y="7" width="12" height="18" rx="6" fill={isSpeaking ? '#4f8cff' : '#222'} stroke={isSpeaking ? '#4f8cff' : '#222'} strokeWidth="1"/>
                <path d="M10 21c0 6 4 9 10 9s10-3 10-9" stroke={isSpeaking ? '#4f8cff' : '#222'} strokeWidth="2" fill="none"/>
                <rect x="18" y="30" width="4" height="5" rx="2" fill={isSpeaking ? '#4f8cff' : '#222'} />
                <rect x="14" y="36" width="12" height="2" rx="1" fill={isSpeaking ? '#4f8cff' : '#222'} />
              </g>
              {isSpeaking && (
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              )}
            </svg>
          </button>
          {translated || currentQuestion.question}
          <button
            className="translate-btn"
            onClick={translateQuestion}
            disabled={transLoading}
            title={translated ? 'Translate to English' : 'Translate to French'}>
            {transLoading ? '...' : translated ? 'EN' : 'FR'}
          </button>
        </div>
        {currentQuestion.image ? (
          <div className="visual-aid">
            <img src={currentQuestion.image} alt="question visual" style={{ maxWidth: '260px', width: '100%', height: 'auto' }} />
          </div>
        ) : clockUrl ? (
          <div className="visual-aid">
            <img src={clockUrl} alt="clock" style={{ maxWidth: '260px', width: '100%', height: 'auto' }} />
          </div>
        ) : currentQuestion.visual ? (
          <div className="visual-aid">
            <p style={{ fontSize: '24px' }}>{currentQuestion.visual}</p>
          </div>
        ) : null}

        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${selectedOption === option ? 'selected' : ''} ${
                feedback && selectedOption === option ? (feedback.isCorrect ? 'correct' : 'incorrect') : ''
              }`}
              onClick={() => handleOptionSelect(option)}
              disabled={isChecking}
            >
              {translatedOpts ? translatedOpts[index] : option}
            </button>
          ))}
        </div>

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
              {aiFeedback.recommendations && aiFeedback.recommendations.length > 0 && (
                <div className="ai-recommendations">
                  <strong>Recommendations:</strong>
                  <ul>
                    {aiFeedback.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <div className="action-buttons">
          <button 
            className="btn primary" 
            onClick={checkAnswer} 
            disabled={!selectedOption || isChecking}
          >
            {isChecking ? (aiEnabled ? 'AI Analyzing...' : 'Checking...') : 'Check Answer'}
          </button>
        </div>
        
        <div className="ai-controls">
          <button 
            className={`ai-toggle ${aiEnabled ? 'ai-enabled' : 'ai-disabled'}`}
            onClick={() => {
              const newAiState = !aiEnabled;
              setAiEnabled(newAiState);
              if (newAiState) {
                aiController.enableAI();
                console.log('🤖 AI Tutor enabled by user');
              } else {
                aiController.disableAI();
                console.log('📚 AI Tutor disabled by user');
              }
            }}
            title={aiEnabled ? 'Disable AI Tutor' : 'Enable AI Tutor'}
          >
            {aiEnabled ? '🤖 AI On' : '📚 AI Off'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;