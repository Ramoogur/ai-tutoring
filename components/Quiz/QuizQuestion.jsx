import React, { useState, useEffect } from 'react';

const QuizQuestion = ({ question, selectedOption, onOptionSelect, feedback, isChecking }) => {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset translation when the question changes
  useEffect(() => {
    setTranslated(null);
    setLoading(false);
  }, [question.id]);

  // Fetch French translation on demand (uses MyMemory open API)
  const translateQuestion = async () => {
    if (translated || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(question.question)}&langpair=en|fr`
      );
      const data = await res.json();
      const french = data?.responseData?.translatedText;
      if (french) setTranslated(french);
    } catch (err) {
      console.error('Translation error', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="question">
      <div className="question-header">
        {translated || question.question}
        <button
          className="translate-btn"
          onClick={translateQuestion}
          disabled={loading}
          title="Translate to French"
        >
          {loading ? '...' : 'FR'}
        </button>
      </div>
      
      {question.visual && (
        <div className="visual-aid">
          <p style={{ fontSize: '24px' }}>{question.visual}</p>
        </div>
      )}

      <div className="options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${selectedOption === option ? 'selected' : ''} ${
              feedback && selectedOption === option ? (feedback.isCorrect ? 'correct' : 'incorrect') : ''
            }`}
            onClick={() => onOptionSelect(option)}
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
  );
};

export default QuizQuestion;