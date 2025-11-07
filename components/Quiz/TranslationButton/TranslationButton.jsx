import React, { useState } from 'react';
import './TranslationButton.css';

/**
 * Translation Button Component
 * Toggles between English and French for quiz content
 * Suitable for grade 1 students with clear visual indicators
 */
const TranslationButton = ({ onToggle, isFrench = false, className = '' }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleClick = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      await onToggle();
    } catch (err) {
      console.error('Translation toggle error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`translation-button-container ${className}`}>
      <button
        className={`translation-button ${isFrench ? 'french' : 'english'} ${isTranslating ? 'translating' : ''}`}
        onClick={handleClick}
        disabled={isTranslating}
        title={isFrench ? 'Switch to English' : 'Switch to French'}
        aria-label={isFrench ? 'Switch to English' : 'Switch to French'}
      >
        <svg
          className="translation-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe/Translation icon */}
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        <span className="translation-label">
          {isTranslating ? '...' : isFrench ? 'EN' : 'FR'}
        </span>
      </button>
    </div>
  );
};

export default TranslationButton;

