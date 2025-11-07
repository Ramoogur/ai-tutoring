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

