import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import additionQuestions from './additionQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import './Addition.css';

// Utility to shuffle questions
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Main Addition Quiz Component
const Addition = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  // Get difficulty from user performance
  const getDifficultyFromAccuracy = (acc) => {
    if (acc >= 0.8) return 'hard';
    if (acc >= 0.5) return 'medium';
    return 'easy';
  };

  const fetchDifficulty = async (studentId, topicId) => {
    const { data, error } = await supabase
      .from('StudentTopicStats')
      .select('current_difficulty')
      .eq('student_id', studentId)
      .eq('topic_id', topicId)
      .maybeSingle();
    if (error || !data) return 'easy';
    return data.current_difficulty || 'easy';
  };

  // Initialize quiz with AI and database integration
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!user?.id) {
        // Fallback for no user - use easy questions
        const selectedQuestions = shuffle(additionQuestions.easy).slice(0, 5);
        setQuestions(selectedQuestions);
        setQuestionStartTime(Date.now());
        return;
      }
      
      try {
        // Get current difficulty from database
        const currentDifficulty = await fetchDifficulty(user.id, 2);
        setDifficulty(currentDifficulty);
        
        // Initialize AI controller if available
        if (aiController && typeof aiController.startQuizSession === 'function') {
          await aiController.startQuizSession(user.id, 2, currentDifficulty);
          setAiStatus(`AI Active - ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level`);
        }
        
        // Get questions for current difficulty
        const selectedQuestions = shuffle(additionQuestions[currentDifficulty]).slice(0, 5);
        setQuestions(selectedQuestions);
        setQuestionStartTime(Date.now());
        
      } catch (error) {
        console.error('Error initializing quiz:', error);
        // Fallback to easy mode
        const selectedQuestions = shuffle(additionQuestions.easy).slice(0, 5);
        setQuestions(selectedQuestions);
        setQuestionStartTime(Date.now());
        setDifficulty('easy');
      }
    };
    
    initializeQuiz();
  }, [user]);

  const handleAnswer = async (answer) => {
    if (isChecking) return;
    setIsChecking(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion, answer);
    const responseTime = Date.now() - questionStartTime;
    
    // Record answer with AI if available
    if (user?.id && aiTutor && typeof aiTutor.analyzeResponse === 'function') {
      try {
        aiTutor.analyzeResponse(currentQuestion, isCorrect, responseTime, 2);
      } catch (error) {
        console.log('AI analysis not available:', error);
      }
    }
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ type: 'correct', message: 'Correct! Well done!' });
    } else {
      setFeedback({ type: 'incorrect', message: `Not quite. The answer is ${currentQuestion.answer}.` });
    }
    
    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setFeedback(null);
        setQuestionStartTime(Date.now());
      } else {
        await finishQuiz();
      }
      setIsChecking(false);
    }, 2000);
  };

  const checkAnswer = (question, answer) => {
    if (question.type === 'match') {
      return Array.isArray(answer) && answer.every((v, idx) => v === question.data[idx].total);
    }
    return parseInt(answer) === question.answer;
  };

  const finishQuiz = async () => {
    try {
      const accuracy = score / questions.length;
      
      // Complete AI session and get comprehensive feedback
      let aiSessionSummary = null;
      if (aiController && typeof aiController.completeQuizSession === 'function') {
        aiSessionSummary = aiController.completeQuizSession();
        console.log('🎓 AI Session Summary:', aiSessionSummary);
        console.log('🔍 Difficulty Progression:', aiSessionSummary?.difficultyProgression);
        
        // Set AI feedback with session summary
        setAiFeedback({
          ...aiSessionSummary.aiFeedback,
          sessionSummary: aiSessionSummary
        });
        
        // Update final AI status
        setAiStatus(aiController.getAIStatus());
      }
      
      // Save to database if user exists
      if (user?.id) {
        await saveQuizSession(aiSessionSummary);
      }
      
      setShowResult(true);
    } catch (error) {
      console.error('Error finishing quiz:', error);
      setShowResult(true);
    }
  };

  const saveQuizSession = async (aiSessionSummary = null) => {
    if (!user?.id) return;
    
    const sessionAccuracy = (score / questions.length) * 100;
    const currentSessionDifficulty = aiSessionSummary?.difficultyProgression?.current || difficulty;
    let nextSessionDifficulty = aiSessionSummary?.difficultyProgression?.next || difficulty;
    
    // Manual difficulty progression if AI doesn't provide it
    if (!aiSessionSummary?.difficultyProgression?.next) {
      if (sessionAccuracy >= 80) {
        if (difficulty === 'easy') nextSessionDifficulty = 'medium';
        else if (difficulty === 'medium') nextSessionDifficulty = 'hard';
        else nextSessionDifficulty = 'hard'; // Stay at hard
      } else if (sessionAccuracy >= 60) {
        nextSessionDifficulty = difficulty; // Stay same
      } else {
        if (difficulty === 'hard') nextSessionDifficulty = 'medium';
        else if (difficulty === 'medium') nextSessionDifficulty = 'easy';
        else nextSessionDifficulty = 'easy'; // Stay at easy
      }
    }
    
    console.log(`📊 Difficulty Logic: ${sessionAccuracy}% accuracy, ${difficulty} → ${nextSessionDifficulty}`);
    
    const sessionData = {
      student_id: user.id,
      topic_id: 2,
      difficulty_level: currentSessionDifficulty,
      questions_attempted: questions.length,
      correct_answers: score,
      accuracy_percentage: sessionAccuracy,
      session_date: new Date().toISOString(),
      time_spent: Math.floor((Date.now() - questionStartTime) / 1000),
      next_difficulty: nextSessionDifficulty,
      difficulty_changed: currentSessionDifficulty !== nextSessionDifficulty,
      ai_feedback: JSON.stringify({
        encouragement: aiSessionSummary?.aiFeedback?.encouragement,
        suggestions: aiSessionSummary?.aiFeedback?.suggestions,
        progressionReason: aiSessionSummary?.difficultyProgression?.reason
      }),
      question_details: JSON.stringify({
        questionTypes: questions.map(q => q.type),
        averageResponseTime: Math.floor((Date.now() - questionStartTime) / questions.length / 1000)
      })
    };
    
    try {
      await supabase.from('QuizSessions').insert([sessionData]);
      
      // Update or insert student topic stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', 2)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching existing stats:', fetchError);
      }
      
      if (existingStats) {
        console.log('Updating existing stats:', existingStats);
        const updateData = {
          total_attempts: existingStats.total_attempts + 1,
          correct_answers: existingStats.correct_answers + score,
          total_questions: existingStats.total_questions + questions.length,
          current_difficulty: nextSessionDifficulty,
          last_accuracy: sessionAccuracy,
          last_attempted: new Date().toISOString(),
          ai_performance: aiSessionSummary?.performance || sessionAccuracy,
          best_streak: Math.max(existingStats.best_streak || 0, aiSessionSummary?.currentStreak || 0),
          progress_data: JSON.stringify({
            recentAccuracies: [sessionAccuracy],
            difficultyHistory: aiSessionSummary?.difficultyProgression || {},
            learningInsights: aiSessionSummary?.aiFeedback?.insights || [],
            achievements: aiSessionSummary?.aiFeedback?.achievements || []
          })
        };
        console.log('Update data:', updateData);
        
        const { error: updateError } = await supabase
          .from('StudentTopicStats')
          .update(updateData)
          .eq('student_id', user.id)
          .eq('topic_id', 2);
          
        if (updateError) {
          console.error('Update error:', updateError);
        }
      } else {
        console.log('Creating new stats record');
        const insertData = {
          student_id: user.id,
          topic_id: 2,
          total_attempts: 1,
          correct_answers: score,
          total_questions: questions.length,
          current_difficulty: nextSessionDifficulty,
          last_accuracy: sessionAccuracy,
          last_attempted: new Date().toISOString(),
          ai_performance: aiSessionSummary?.performance || sessionAccuracy,
          best_streak: aiSessionSummary?.currentStreak || 0,
          progress_data: JSON.stringify({
            recentAccuracies: [sessionAccuracy],
            difficultyHistory: aiSessionSummary?.difficultyProgression || {},
            learningInsights: aiSessionSummary?.aiFeedback?.insights || [],
            achievements: aiSessionSummary?.aiFeedback?.achievements || []
          })
        };
        console.log('Insert data:', insertData);
        
        const { error: insertError } = await supabase
          .from('StudentTopicStats')
          .upsert(insertData);
          
        if (insertError) {
          console.error('Insert error:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving quiz session:', error);
    }
  };

  const renderQuestion = (q, idx) => {
    if (!q) return <div>Loading...</div>;
    
    switch (q.type) {
      case 'picture-addition':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-display">
              <div className="addition-pics">
                {Array(q.data.left).fill(0).map((_, i) => <span key={'l'+i}>{q.data.object}</span>)}
                <span className="plus">+</span>
                {Array(q.data.right).fill(0).map((_, i) => <span key={'r'+i}>{q.data.object}</span>)}
                <span className="equals">=</span>
                <span>?</span>
              </div>
            </div>
            <div className="addition-prompt">What is the answer?</div>
            <input 
              type="number" 
              className="addition-input"
              value={selectedOption === null ? '' : selectedOption} 
              min="0" 
              max="10" 
              onChange={e => setSelectedOption(Number(e.target.value))} 
              placeholder="?"
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        );
      case 'count-add':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-display">
              <div className="addition-pics">
                {Array(q.data.left.count).fill(0).map((_, i) => <span key={'l'+i}>{q.data.left.object}</span>)}
                <span className="plus">+</span>
                {Array(q.data.right.count).fill(0).map((_, i) => <span key={'r'+i}>{q.data.right.object}</span>)}
                <span className="equals">=</span>
                <span>?</span>
              </div>
            </div>
            <div className="addition-prompt">How many in total?</div>
            <input 
              type="number" 
              className="addition-input"
              value={selectedOption === null ? '' : selectedOption} 
              min="0" 
              max="10" 
              onChange={e => setSelectedOption(Number(e.target.value))} 
              placeholder="?"
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        );
      case 'missing-number':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-display">
              <div className="addition-pics" style={{fontSize: '32px'}}>
                {q.data.left !== null ? q.data.left : <input type="number" className="addition-input" style={{width: '80px', fontSize: '24px'}} value={selectedOption === null ? '' : selectedOption} min="0" max="10" onChange={e => setSelectedOption(Number(e.target.value))} />} 
                <span className="plus">+</span> 
                {q.data.right !== null ? q.data.right : <input type="number" className="addition-input" style={{width: '80px', fontSize: '24px'}} value={selectedOption === null ? '' : selectedOption} min="0" max="10" onChange={e => setSelectedOption(Number(e.target.value))} />} 
                <span className="equals">=</span> 
                {q.data.total !== null ? q.data.total : <input type="number" className="addition-input" style={{width: '80px', fontSize: '24px'}} value={selectedOption === null ? '' : selectedOption} min="0" max="10" onChange={e => setSelectedOption(Number(e.target.value))} />}
              </div>
            </div>
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        );
      case 'numeral-word':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-prompt">{q.prompt}</div>
            <input 
              type="number" 
              className="addition-input"
              value={selectedOption === null ? '' : selectedOption} 
              min="0" 
              max="10" 
              onChange={e => setSelectedOption(Number(e.target.value))} 
              placeholder="Enter your answer"
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        );
      case 'match':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-match">
              {q.data.map((pair, i) => (
                <div key={i} className="addition-match-row">
                  <div className="match-equation">{pair.pair}</div>
                  <div className="match-options">
                    <input 
                      type="number" 
                      className="addition-input" 
                      style={{width: '100px'}}
                      value={selectedOption && selectedOption[i] !== undefined ? selectedOption[i] : ''} 
                      min="0" 
                      max="10"
                      placeholder="?"
                      onChange={e => {
                        const arr = selectedOption ? [...selectedOption] : Array(q.data.length).fill(null);
                        arr[i] = Number(e.target.value);
                        setSelectedOption(arr);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={!selectedOption || selectedOption.some(v => v === null || v === undefined) || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        );
      case 'word-problem':
        return (
          <div className="addition-question" key={idx}>
            <div className="addition-prompt">{q.prompt}</div>
            <input 
              type="number" 
              className="addition-input"
              value={selectedOption === null ? '' : selectedOption} 
              min="0" 
              max="10" 
              onChange={e => setSelectedOption(Number(e.target.value))} 
              placeholder="Enter your answer"
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="addition-container">
        <div className="addition-loading">
          <div className="loading-spinner">🧮</div>
          <div className="loading-details">
            Preparing your addition quiz...<br/>
            Loading questions based on your level
          </div>
        </div>
      </div>
    );
  }

  // Results and feedback
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="addition-container">
        <div className="addition-result">
          <div className="result-content">
            <h2>Quiz Complete!</h2>
            <div className="score-display">
              <div className="score-circle">
                <div className="score-text">{percentage}%</div>
              </div>
            </div>
            <p>You got {score} out of {questions.length} questions correct!</p>
            
            <div className="encouragement-section">
              <div className={percentage >= 80 ? 'great-job' : percentage >= 60 ? 'good-job' : 'keep-trying'}>
                <h3>{percentage >= 80 ? '🌟 Excellent Work!' : percentage >= 60 ? '👍 Good Job!' : '💪 Keep Trying!'}</h3>
                <p>{percentage >= 80 ? 'You\'re mastering addition!' : percentage >= 60 ? 'You\'re doing great! Keep practicing!' : 'Practice makes perfect! Try again!'}</p>
              </div>
            </div>
            
            {aiFeedback && (
              <div className="ai-feedback">
                <h3>AI Tutor Feedback:</h3>
                {aiFeedback.encouragement && <p><strong>Encouragement:</strong> {aiFeedback.encouragement}</p>}
                {aiFeedback.insights && <p><strong>Insights:</strong> {aiFeedback.insights}</p>}
                {aiFeedback.recommendations && <p><strong>Recommendations:</strong> {aiFeedback.recommendations}</p>}
                {aiFeedback.nextSteps && <p><strong>Next Steps:</strong> {aiFeedback.nextSteps}</p>}
                {aiFeedback.achievements && <p><strong>Achievements:</strong> {aiFeedback.achievements}</p>}
              </div>
            )}
            
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigateTo && navigateTo('dashboard')}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz UI
  return (
    <div className="addition-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>Addition Quiz</h2>
          <div className="progress-info">
            <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty}</span>
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${((currentQuestionIndex) / questions.length) * 100}%`}}></div>
        </div>
        {aiStatus && <div className="ai-status">{typeof aiStatus === 'string' ? aiStatus : `AI: ${aiStatus.difficulty} Level - ${aiStatus.performance}% Performance`}</div>}
      </div>
      
      <div className="question-content">
        <div className="question-text">{questions[currentQuestionIndex]?.prompt || 'Loading question...'}</div>
        {renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)}
      </div>
      
      {feedback && (
        <div className={`feedback ${feedback.type === 'correct' ? 'correct-feedback' : 'incorrect-feedback'}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default Addition;
