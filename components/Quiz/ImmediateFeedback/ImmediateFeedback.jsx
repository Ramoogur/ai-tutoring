import React, { useEffect, useState } from 'react';
import { generateImmediateFeedback } from '../../../utils/chatGPTFeedbackService';
import './ImmediateFeedback.css';

const ImmediateFeedback = ({
  isCorrect,
  question,
  userAnswer,
  correctAnswer,
  onClose,
  isVisible
}) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasGeneratedFeedback, setHasGeneratedFeedback] = useState(false);

  useEffect(() => {
    // Only generate feedback ONCE when component becomes visible
    if (isVisible && !hasGeneratedFeedback) {
      loadFeedback();
    }
  }, [isVisible, hasGeneratedFeedback]);

  const loadFeedback = async () => {
    // Prevent multiple generations
    if (hasGeneratedFeedback) {
      console.log('⚠️ Feedback already generated, skipping regeneration');
      return;
    }
    
    setIsLoading(true);
    setHasGeneratedFeedback(true); // Mark as generated immediately to prevent duplicates
    
    try {
      const aiResponse = await generateImmediateFeedback({
        question,
        userAnswer,
        correctAnswer,
        isCorrect
      });
      
      setFeedback(aiResponse);
      console.log('✅ Feedback generated and locked');
    } catch (error) {
      console.error('❌ Error generating feedback:', error);
      setFeedback(isCorrect 
        ? 'Great job! Keep up the good work!' 
        : 'Nice try! Keep practicing and you\'ll get it!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - Click to close */}
      <div className="immediate-feedback-backdrop" onClick={onClose}></div>
      
      {/* Popup */}
      <div className="immediate-feedback-popup">
        <div className={`feedback-popup-content ${isCorrect ? 'correct' : 'incorrect'}`}>
          {/* Close Button (X) */}
          <button 
            className="feedback-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <div className="feedback-popup-header">
            <div className={`feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? '🌟' : '🤔'}
            </div>
            <h2 className="feedback-popup-title">
              {isCorrect ? 'Great Job!' : 'Nice Try!'}
            </h2>
          </div>

          {/* AI Feedback */}
          <div className="feedback-popup-message">
            {isLoading ? (
              <div className="feedback-loading">
                <div className="feedback-loading-spinner"></div>
                <p>Getting feedback...</p>
              </div>
            ) : (
              <p className="feedback-text">{feedback}</p>
            )}
          </div>

          {/* Answer Display */}
          {!isCorrect && (
            <div className="feedback-answer-box">
              <div className="answer-row">
                <span className="answer-label">Your answer:</span>
                <span className="answer-value user-answer">{userAnswer}</span>
              </div>
              <div className="answer-row">
                <span className="answer-label">Correct answer:</span>
                <span className="answer-value correct-answer">{correctAnswer}</span>
              </div>
            </div>
          )}

          {/* Hint text to close */}
          <div className="feedback-hint-text">
            {isLoading ? '' : 'Click anywhere to continue'}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImmediateFeedback;

