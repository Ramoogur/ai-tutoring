const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateSkillFeedback = async ({ 
  studentName,
  topicName,
  score,
  totalQuestions,
  accuracy,
  difficulty,
  questionDetails,
  timeSpent,
  strengths = [],
  weaknesses = []
}) => {
  try {
    const prompt = `You are a friendly and encouraging Grade 1 teacher. A student named ${studentName || 'Student'} just completed a ${topicName} quiz.

Results:
- Score: ${score} out of ${totalQuestions} questions correct
- Accuracy: ${accuracy}%
- Difficulty Level: ${difficulty}
- Time Spent: ${timeSpent} seconds
${strengths.length > 0 ? `- Strengths: ${strengths.join(', ')}` : ''}
${weaknesses.length > 0 ? `- Areas to improve: ${weaknesses.join(', ')}` : ''}

Generate a short, simple, and encouraging feedback message (2-3 sentences max) that:
1. Celebrates what they did well
2. Gently suggests one thing to practice more (if accuracy < 80%)
3. Uses simple words a 6-7 year old can understand
4. Includes one emoji that fits the message

Keep it under 50 words total. Be very positive and encouraging!`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a kind, supportive Grade 1 teacher who gives short, simple feedback to young students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating ChatGPT feedback:', error);
    // Fallback feedback
    if (accuracy >= 80) {
      return "🌟 Amazing work! You're doing great with " + topicName + "!";
    } else if (accuracy >= 60) {
      return "👍 Good job! Keep practicing and you'll get even better!";
    } else {
      return "💪 Great effort! Practice makes perfect. Try again!";
    }
  }
};

export const analyzeMistakes = async ({
  topicName,
  incorrectQuestions,
  difficulty
}) => {
  try {
    const mistakesDescription = incorrectQuestions.map((q, index) => 
      `Question ${index + 1}: ${q.questionType} - ${q.errorType || 'incorrect'}`
    ).join('\n');

    const prompt = `A Grade 1 student made these mistakes in ${topicName}:
${mistakesDescription}

Difficulty: ${difficulty}

In 1-2 simple sentences (under 30 words), suggest what skill they should practice. Use words a 6-year-old understands.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Grade 1 teacher giving simple learning tips.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 60,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error analyzing mistakes:', error);
    return "Let's practice more to get even better!";
  }
};

export const generateImmediateFeedback = async ({
  question,
  userAnswer,
  correctAnswer,
  isCorrect
}) => {
  try {
    // Build question description
    let questionDescription = '';
    
    if (question.type === 'picture-addition') {
      questionDescription = `Picture addition: ${question.data.left} ${question.data.object} + ${question.data.right} ${question.data.object}`;
    } else if (question.type === 'count-add') {
      questionDescription = `Count and add: ${question.data.left.count} ${question.data.left.object} + ${question.data.right.count} ${question.data.right.object}`;
    } else if (question.type === 'missing-number') {
      questionDescription = `Missing number problem: Fill in the missing number`;
    } else if (question.type === 'word-problem') {
      questionDescription = `Word problem: ${question.prompt}`;
    } else if (question.type === 'numeral-word') {
      questionDescription = `Number word problem: ${question.prompt}`;
    } else {
      questionDescription = question.prompt || question.question || 'Math question';
    }

    const prompt = isCorrect 
      ? `A Grade 1 student just answered this question CORRECTLY:
${questionDescription}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Write a short response (2-3 sentences, under 40 words) that:
1. Celebrates their success with enthusiasm
2. Briefly explains WHY their answer is correct in very simple terms
3. Uses words a 6-year-old can understand
Include one fun emoji. Be encouraging and clear!

Example: "Great job! You got it right! ⭐ When we add 2 + 3, we count 2 and then 3 more. That gives us 5!"`
      : `A Grade 1 student just answered this question INCORRECTLY:
${questionDescription}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Write a short response (2-3 sentences, under 40 words) that:
1. Says it's okay to make mistakes (gentle and kind)
2. Briefly explains WHY the correct answer is right in very simple terms
3. Encourages them to keep trying
Use words a 6-year-old understands. Include one encouraging emoji.

Example: "That's okay! Let me help you understand. 💡 When we add 2 + 3, we start with 2 and count 3 more: 3, 4, 5. So the answer is 5!"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a kind, patient Grade 1 teacher who gives immediate, simple feedback to young students after each question.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 120,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating immediate feedback:', error);
    
    // Fallback feedback with explanations
    if (isCorrect) {
      return `🌟 Great job! You got it right! Your answer of ${userAnswer} is correct. Keep up the great work!`;
    } else {
      return `💪 That's okay! The correct answer is ${correctAnswer}. Let's practice more together and you'll get it next time!`;
    }
  }
};

