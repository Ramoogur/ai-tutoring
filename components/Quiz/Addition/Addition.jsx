import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import additionQuestions from './additionQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import './Addition.css';
import TTSButton from '../TTSButton';
import TranslationButton from '../TranslationButton';
import translationService from '../../../utils/translationService';
import ModernFeedback from '../ModernFeedback';
import ImmediateFeedback from '../ImmediateFeedback';

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
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionDetails, setQuestionDetails] = useState([]);
  
  // Immediate feedback states
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);
  
  // Translation states
  const [isFrench, setIsFrench] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState([]);
  const [translatedUITexts, setTranslatedUITexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

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

  // Restart quiz with updated difficulty and reshuffled questions
  const restartQuiz = async () => {
    console.log('🔄 Restarting Addition quiz...');
    
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setFeedback(null);
    setAiFeedback(null);
    setQuestionDetails([]);
    setTotalTimeSpent(0);
    setSelectedOption(null);
    setIsChecking(false);

    // Fetch updated difficulty from database
    let updatedDifficulty = 'easy';
    try {
      const { data: stats, error } = await supabase
        .from('StudentTopicStats')
        .select('current_difficulty')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .maybeSingle();
      
      if (!error && stats && stats.current_difficulty) {
        updatedDifficulty = stats.current_difficulty;
        console.log(`📊 Fetched updated difficulty: ${updatedDifficulty}`);
      } else {
        console.log('ℹ️ No saved difficulty found, using default: easy');
      }
    } catch (error) {
      console.error('Error fetching difficulty:', error);
    }
    
    setDifficulty(updatedDifficulty);

    // Initialize new AI session
    if (aiController && typeof aiController.startQuizSession === 'function') {
      await aiController.startQuizSession(user.id, topic.id, updatedDifficulty);
      setAiStatus(`AI Active - ${updatedDifficulty.charAt(0).toUpperCase() + updatedDifficulty.slice(1)} Level`);
    }

    // Get and shuffle questions for the updated difficulty
    const selectedQuestions = shuffle(additionQuestions[updatedDifficulty] || additionQuestions.easy).slice(0, 5);
    setQuestions(selectedQuestions);
    setQuestionStartTime(Date.now());
    
    console.log(`✅ Quiz restarted at ${updatedDifficulty} difficulty with ${selectedQuestions.length} new questions`);
  };

  const handleAnswer = async (answer) => {
    if (isChecking) return;
    setIsChecking(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion, answer);
    const responseTime = Date.now() - questionStartTime;
    
    // Track question details
    setQuestionDetails(prev => [...prev, {
      questionType: currentQuestion.type,
      correct: isCorrect,
      timeSpent: responseTime
    }]);
    
    // Record answer with AI if available
    if (user?.id && aiTutor && typeof aiTutor.analyzeResponse === 'function') {
      try {
        aiTutor.analyzeResponse(currentQuestion, isCorrect, responseTime, 2);
      } catch (error) {
        console.log('AI analysis not available:', error);
      }
    }
    
    // Update score
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Show immediate feedback popup
    setCurrentFeedbackData({
      isCorrect,
      question: currentQuestion,
      userAnswer: answer,
      correctAnswer: currentQuestion.answer
    });
    setShowImmediateFeedback(true);
  };

  const handleFeedbackClose = async () => {
    setShowImmediateFeedback(false);
    setCurrentFeedbackData(null);
    
    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback(null);
      setQuestionStartTime(Date.now());
    } else {
      await finishQuiz();
    }
    setIsChecking(false);
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
      const totalTime = Math.floor((Date.now() - questionStartTime) / 1000);
      setTotalTimeSpent(totalTime);
      
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

  // Translation toggle handler
  const handleTranslationToggle = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      if (isFrench) {
        setIsFrench(false);
        setTranslatedQuestions([]);
        setTranslatedUITexts({});
      } else {
        setIsFrench(true);
        
        // Translate all questions
        const translated = await Promise.all(
          questions.map(q => translationService.translateQuestion(q, 'fr'))
        );
        setTranslatedQuestions(translated);
        
        // Translate UI texts
        const uiTexts = {
          'Addition Quiz': 'Quiz d\'Addition',
          'Question': 'Question',
          'of': 'de',
          'Checking...': 'Vérification...',
          'Submit Answer': 'Soumettre la Réponse',
          'Submit Answers': 'Soumettre les Réponses',
          'What is the answer?': 'Quelle est la réponse?',
          'How many in total?': 'Combien au total?',
          'Enter your answer': 'Entrez votre réponse',
          'Quiz Complete!': 'Quiz Terminé!',
          'You got': 'Vous avez obtenu',
          'out of': 'sur',
          'questions correct!': 'questions correctes!',
          'Excellent Work!': 'Excellent Travail!',
          'You\'re mastering addition!': 'Vous maîtrisez l\'addition!',
          'Good Job!': 'Bon Travail!',
          'You\'re doing great! Keep practicing!': 'Vous vous débrouillez bien! Continuez à pratiquer!',
          'Keep Trying!': 'Continuez!',
          'Practice makes perfect! Try again!': 'La pratique rend parfait! Réessayez!',
          'Back to Dashboard': 'Retour au Tableau de Bord',
          'Preparing your addition quiz...': 'Préparation de votre quiz d\'addition...',
          'Loading questions based on your level': 'Chargement des questions selon votre niveau'
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

  const getCurrentQuestion = () => {
    if (isFrench && translatedQuestions[currentQuestionIndex]) {
      return translatedQuestions[currentQuestionIndex];
    }
    return questions[currentQuestionIndex];
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
    if (!q) return <div>{isFrench ? 'Chargement...' : 'Loading...'}</div>;
    const question = getCurrentQuestion();
    
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
            <div className="addition-prompt">{isFrench ? (translatedUITexts['What is the answer?'] || 'Quelle est la réponse?') : 'What is the answer?'}</div>
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
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answer'] || 'Submit Answer')}
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
            <div className="addition-prompt">{isFrench ? (translatedUITexts['How many in total?'] || 'Combien au total?') : 'How many in total?'}</div>
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
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answer'] || 'Submit Answer')}
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
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answer'] || 'Submit Answer')}
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
              placeholder={isFrench ? (translatedUITexts['Enter your answer'] || 'Entrez votre réponse') : 'Enter your answer'}
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answer'] || 'Submit Answer')}
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
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answers'] || 'Submit Answers')}
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
              placeholder={isFrench ? (translatedUITexts['Enter your answer'] || 'Entrez votre réponse') : 'Enter your answer'}
            />
            <div className="quiz-actions">
              <button 
                className="btn btn-primary" 
                disabled={selectedOption === null || isChecking} 
                onClick={() => handleAnswer(selectedOption)}
              >
                {isChecking ? (translatedUITexts['Checking...'] || 'Checking...') : (translatedUITexts['Submit Answer'] || 'Submit Answer')}
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
            {isFrench ? (translatedUITexts['Preparing your addition quiz...'] || 'Préparation de votre quiz d\'addition...') : 'Preparing your addition quiz...'}<br/>
            {isFrench ? (translatedUITexts['Loading questions based on your level'] || 'Chargement des questions selon votre niveau') : 'Loading questions based on your level'}
          </div>
        </div>
      </div>
    );
  }

  // Results and feedback
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
    
    return (
      <ModernFeedback
        topicName="Addition"
        topicIcon="➕"
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        nextDifficulty={nextDifficulty}
        difficultyChanged={difficultyChanged}
        timeSpent={totalTimeSpent}
        questionDetails={questionDetails}
        studentName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
        onBackToDashboard={() => navigateTo && navigateTo('dashboard')}
        onTryAgain={restartQuiz}
      />
    );
  }

  // Main quiz UI
  return (
    <div className="addition-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{isFrench ? (translatedUITexts['Addition Quiz'] || 'Quiz d\'Addition') : 'Addition Quiz'}</h2>
          <div className="progress-info">
            <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty}</span>
            <span>{(translatedUITexts['Question'] || 'Question')} {currentQuestionIndex + 1} {(translatedUITexts['of'] || 'of')} {questions.length}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${((currentQuestionIndex) / questions.length) * 100}%`}}></div>
        </div>
        {aiStatus && <div className="ai-status">{typeof aiStatus === 'string' ? aiStatus : `AI: ${aiStatus.difficulty} Level - ${aiStatus.performance}% Performance`}</div>}
      </div>
      
      <div className="question-content">
        <div className="question-header">
          <div className="question-text">{getCurrentQuestion()?.prompt || getCurrentQuestion()?.question || (isFrench ? 'Chargement de la question...' : 'Loading question...')}</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TTSButton 
              question={getCurrentQuestion()?.prompt || getCurrentQuestion()?.question || ''}
              options={[]}
            />
            <TranslationButton 
              onToggle={handleTranslationToggle}
              isFrench={isFrench}
            />
          </div>
        </div>
        {renderQuestion(getCurrentQuestion(), currentQuestionIndex)}
      </div>
      
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

export default Addition;
