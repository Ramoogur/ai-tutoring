import React, { useState } from 'react';
import ttsService from '../../../utils/textToSpeechService';
import './TTSButton.css';

/**
 * Text-to-Speech Button Component
 * Displays a microphone icon that reads question and options aloud
 */
const TTSButton = ({ question, options = [], className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (isPlaying) {
      // Stop if already playing
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      setError(null);
      await ttsService.readQuizQuestion(question, options);
      setIsPlaying(false);
    } catch (err) {
      console.error('TTS Error:', err);
      setError('Unable to play audio');
      setIsPlaying(false);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={`tts-button-container ${className}`}>
      <button
        className={`tts-button ${isPlaying ? 'playing' : ''}`}
        onClick={handleClick}
        title={isPlaying ? 'Stop reading' : 'Read question aloud'}
        aria-label={isPlaying ? 'Stop reading' : 'Read question aloud'}
      >
        {isPlaying ? (
          <svg
            className="tts-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stop icon */}
            <rect x="6" y="6" width="12" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg
            className="tts-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Microphone icon */}
            <path
              d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
              fill="currentColor"
            />
            <path
              d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"
              fill="currentColor"
            />
          </svg>
        )}
        <span className="tts-label">{isPlaying ? 'Stop' : 'Listen'}</span>
      </button>
      {error && <div className="tts-error">{error}</div>}
    </div>
  );
};

export default TTSButton;