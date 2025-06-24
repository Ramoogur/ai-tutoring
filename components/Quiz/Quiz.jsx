import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { getQuestions } from '../../data/questions';
import { generateOpenAIQuestions } from '../../utils/openaiQuiz';
import { makeClockSvg } from '../../utils/graphics';

// `difficulty` is now determined automatically based on past performance
const Quiz = ({ topic, user, navigateTo }) => {
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

  // Translate current question into French on demand
  const translateQuestion = async () => {
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
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(currentQuestion.question)}&langpair=en|fr`
      );
      const data = await res.json();
      const fr = data?.responseData?.translatedText;
      let frOpts = [];
      if (currentQuestion.options && currentQuestion.options.length) {
        frOpts = await Promise.all(
          currentQuestion.options.map(async (opt) => {
          const isNumber = /^-?\d+(?:\.\d+)?$/.test(String(opt).trim());
          if (isNumber) return opt;
            const r = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(opt)}&langpair=en|fr`
            );
            const d = await r.json();
            return d?.responseData?.translatedText || opt;
          })
        );
      }
      if (fr) setTranslated(fr);
      if (frOpts.length) setTranslatedOpts(frOpts);
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

        if (user.grade === 1) {
          // Try generating via OpenAI; if it fails, fall back to static bank
          quizQuestions = await generateOpenAIQuestions(topic.name, difficultyLevel);
        }
        if (!quizQuestions || quizQuestions.length === 0) {
          quizQuestions = getQuestions(topic, difficultyLevel);
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
        <div className="question-header">
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