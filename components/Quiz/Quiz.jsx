import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { makeClockSvg } from '../../utils/graphics';
import ShapesColors from './ShapesColors/ShapesColors';
import { basicQuestions } from '../../data/basicQuestions';

// `difficulty` is now determined automatically based on past performance
const Quiz = ({ topic, user, navigateTo }) => {
  // Check if this is a shapes and colors topic
  const isShapesColors = topic && (topic.name.toLowerCase().includes('shape') || topic.name.toLowerCase().includes('colour') || topic.name.toLowerCase().includes('color'));
  
  // If it's shapes and colors, use the specialized component
  if (isShapesColors) {
    return <ShapesColors topic={topic} user={user} navigateTo={navigateTo} />;
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

      // Determine difficulty based on previous stats
      const difficultyAuto = await fetchDifficulty(user.id, topic.id);
      setDifficulty(difficultyAuto);

      // Simulate loading delay for better UX
      setTimeout(async () => {
        const difficultyLevel = difficultyAuto;
        let quizQuestions = [];

        // Use basic questions for non-shapes topics
        const topicQuestions = basicQuestions[topic.name];
        if (topicQuestions && topicQuestions[difficultyLevel]) {
          quizQuestions = topicQuestions[difficultyLevel].slice(0, 5);
        } else {
          // Default fallback questions
          quizQuestions = [
            {
              id: 1,
              question: `Let's practice ${topic.name}!`,
              options: ['Great!', 'Ready!', 'Let\'s go!', 'Awesome!'],
              correct: 'Great!'
            }
          ];
        }
        setQuestions(quizQuestions);
      }, 1000);
    })();
  }, [topic]);

  // Generate clock image when current question changes (for Time topic)
  useEffect(() => {
    if (topic.name.toLowerCase().includes('time') && questions.length > 0) {
      const q = questions[currentQuestionIndex];
      const timeMatch = /^\d{1,2}:\d{2}$/.test(q.correct) ? q.correct : null;
      if (timeMatch) {
        const url = makeClockSvg(timeMatch, 220);
        setClockUrl(url);
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

    // Set feedback
    setFeedback({
      isCorrect,
      message: isCorrect ? 'Correct! 🎉' : `Incorrect. The correct answer is ${currentQuestion.correct}`
    });

    // Update score if correct
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        // Quiz completed
        finishQuiz();
      }
      setIsChecking(false);
    }, 1500);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
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
    
    // Add to quiz history
    updatedUser.progress.quizHistory.unshift({
      topic: topic.name,
      difficulty,
      score,
      totalQuestions: questions.length,
      date: dateString
    });
    
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
    return (
      <div className="quiz-container result-container">
        <h2>Quiz Completed!</h2>
        <p>Topic: {topic.name}</p>
        <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        <div className="score">{score} / {questions.length}</div>
        <p>Accuracy: {Math.round((score / questions.length) * 100)}%</p>
        
        <button className="btn" onClick={() => navigateTo('dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{topic.name} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
        <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
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
      </div>

      <div className="quiz-actions">
        <button 
          className="btn" 
          onClick={checkAnswer} 
          disabled={!selectedOption || isChecking}
        >
          {isChecking ? 'Checking...' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;