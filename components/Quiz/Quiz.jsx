import React, { useState, useEffect } from 'react';
import { getQuestions } from '../../data/questions';

const Quiz = ({ topic, difficulty, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch questions when component mounts
  useEffect(() => {
    // Show loading state
    setQuestions([]);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      // Convert difficulty number to string for data lookup
      let difficultyLevel = 'easy';
      if (difficulty === '2') difficultyLevel = 'medium';
      if (difficulty === '3') difficultyLevel = 'hard';
      
      // Get questions based on selected topic and difficulty
      const quizQuestions = getQuestions(topic, difficultyLevel);
      setQuestions(quizQuestions);
    }, 1000);
  }, [topic, difficulty]);

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

  const finishQuiz = () => {
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
        <p>Difficulty: Level {difficulty}</p>
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
        <h2>{topic.name} - Level {difficulty}</h2>
        <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question">
        <h3>{currentQuestion.question}</h3>
        {currentQuestion.visual && (
          <div className="visual-aid">
            <p style={{ fontSize: '24px' }}>{currentQuestion.visual}</p>
          </div>
        )}

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
              {option}
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