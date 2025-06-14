const QuizQuestion = ({ question, selectedOption, onOptionSelect, feedback, isChecking }) => {
  return (
    <div className="question">
      <h3>{question.question}</h3>
      
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