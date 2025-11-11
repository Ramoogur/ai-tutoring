import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

/**
 * Generate matching pairs for a specific topic
 * @param {Object} topic - Topic object with id and name
 * @returns {Array} Array of matching pairs
 */
export const generateMatchingPairs = async (topic) => {
  try {
    const prompt = createPromptForTopic(topic);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant creating educational matching games for Grade 1 students (ages 6-7) in Mauritius. 
          
          CRITICAL INSTRUCTIONS:
          - Generate exactly 6 matching pairs
          - Content must be age-appropriate for 6-7 year olds
          - Use simple language
          - For visual content, use emojis or simple descriptions
          - Respond ONLY with valid JSON
          - Format: {"pairs": [{"left": "item1", "right": "match1"}, ...]}
          
          DO NOT include any explanations, markdown formatting, or backticks.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    
    // Clean up the response - remove any markdown formatting
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const data = JSON.parse(cleanedContent);

    // Validate the response
    if (!data.pairs || !Array.isArray(data.pairs)) {
      console.warn('OpenAI response missing pairs array, using fallback');
      throw new Error('Invalid response format from OpenAI');
    }

    // Use response even if not exactly 6 pairs (take first 6 or use all if less)
    const pairs = data.pairs.slice(0, 6);
    
    if (pairs.length < 3) {
      console.warn('Too few pairs from OpenAI, using fallback');
      throw new Error('Invalid response format from OpenAI');
    }

    return pairs;
  } catch (error) {
    console.error('Error generating matching pairs:', error);
    
    // Fallback to pre-defined pairs if API fails
    return getFallbackPairs(topic);
  }
};

/**
 * Create a detailed prompt for each topic
 */
const createPromptForTopic = (topic) => {
  const prompts = {
    'Numbers & Counting': `Create 6 matching pairs for Numbers & Counting for Grade 1:
    - Match numbers (1-10) with: dot patterns, pictures of objects to count, or number words
    - Example: "5" matches with "⚫⚫⚫⚫⚫" or "five"
    - Use emojis for visual representation
    
    Return ONLY JSON: {"pairs": [{"left": "3", "right": "⚫⚫⚫"}, ...]}`,

    'Addition (within 10)': `Create 6 matching pairs for Addition within 10 for Grade 1:
    - Match addition problems with their answers
    - Example: "2 + 3" matches with "5"
    - Keep sums within 10
    - Use simple format like "2 + 3" or use emojis like "🍎🍎 + 🍎🍎🍎"
    
    Return ONLY JSON: {"pairs": [{"left": "2 + 3", "right": "5"}, ...]}`,

    'Patterns': `Create 6 matching pairs for Patterns for Grade 1:
    - Match pattern beginnings with their correct continuations
    - Example: "🔴🔵🔴🔵" matches with "🔴🔵"
    - Use colorful emojis: 🔴🔵🟡🟢⚫⚪
    - Include shapes and colors
    
    Return ONLY JSON: {"pairs": [{"left": "🔴🔵🔴", "right": "🔵"}, ...]}`,

    'Shapes & Colours': `Create 6 matching pairs for Shapes & Colours for Grade 1:
    - Match shape emojis with their names OR match colored shapes with color names
    - Example: "🔴" matches with "red" OR "🟦" matches with "square"
    - Use: 🔴 (circle), 🟦 (square), 🔺 (triangle), 🟥 (rectangle)
    - Colors: red, blue, yellow, green
    
    Return ONLY JSON: {"pairs": [{"left": "🔴", "right": "circle"}, ...]}`,

    'Time': `Create 6 matching pairs for Time concepts for Grade 1:
    - Match time-related emojis or words with time concepts
    - Example: "☀️" matches with "morning" OR "12 o'clock" matches with "🕐"
    - Include: morning, afternoon, night, day
    - Use clock emojis: 🕐🕑🕒🕓
    
    Return ONLY JSON: {"pairs": [{"left": "☀️", "right": "morning"}, ...]}`,

    'Money': `Create 6 matching pairs for Money (Mauritian Rupees) for Grade 1:
    - Match coin values with their amounts or pictures
    - Use Rs 1, Rs 2, Rs 5, Rs 10
    - Example: "💰 Rs 5" matches with "five rupees"
    - Keep it simple with coin emojis
    
    Return ONLY JSON: {"pairs": [{"left": "💰 Rs 5", "right": "five rupees"}, ...]}`,

    'Ordinal Numbers': `Create 6 matching pairs for Ordinal Numbers for Grade 1:
    - Match positions (1st-5th) with ordinal words or emoji sequences
    - Example: "1st" matches with "first" OR "🥇" matches with "first"
    - Use: first, second, third, fourth, fifth
    - Include position emojis: 🥇🥈🥉
    
    Return ONLY JSON: {"pairs": [{"left": "1st", "right": "first"}, ...]}`,
  };

  return prompts[topic.name] || prompts['Numbers & Counting'];
};

/**
 * Fallback pairs if OpenAI API fails
 */
const getFallbackPairs = (topic) => {
  const fallbackData = {
    'Numbers & Counting': [
      { left: '1', right: '⚫' },
      { left: '2', right: '⚫⚫' },
      { left: '3', right: '⚫⚫⚫' },
      { left: '4', right: '⚫⚫⚫⚫' },
      { left: '5', right: '⚫⚫⚫⚫⚫' },
      { left: '6', right: '⚫⚫⚫⚫⚫⚫' }
    ],
    'Addition (within 10)': [
      { left: '1 + 1', right: '2' },
      { left: '2 + 2', right: '4' },
      { left: '3 + 2', right: '5' },
      { left: '4 + 1', right: '5' },
      { left: '3 + 3', right: '6' },
      { left: '2 + 3', right: '5' }
    ],
    'Patterns': [
      { left: '🔴🔵🔴', right: '🔵' },
      { left: '⭐🌙⭐', right: '🌙' },
      { left: '🟢🟡🟢', right: '🟡' },
      { left: '🔺🟦🔺', right: '🟦' },
      { left: '🍎🍊🍎', right: '🍊' },
      { left: '🐶🐱🐶', right: '🐱' }
    ],
    'Shapes & Colours': [
      { left: '🔴', right: 'circle' },
      { left: '🟦', right: 'square' },
      { left: '🔺', right: 'triangle' },
      { left: 'red', right: '🔴' },
      { left: 'blue', right: '🔵' },
      { left: 'yellow', right: '🟡' }
    ],
    'Time': [
      { left: '☀️', right: 'morning' },
      { left: '🌙', right: 'night' },
      { left: '🕐', right: '1 o\'clock' },
      { left: '🕑', right: '2 o\'clock' },
      { left: 'day', right: '☀️' },
      { left: 'afternoon', right: '🌤️' }
    ],
    'Money': [
      { left: 'Rs 1', right: 'one rupee' },
      { left: 'Rs 2', right: 'two rupees' },
      { left: 'Rs 5', right: 'five rupees' },
      { left: 'Rs 10', right: 'ten rupees' },
      { left: '💰', right: 'money' },
      { left: '🪙', right: 'coin' }
    ],
    'Ordinal Numbers': [
      { left: '1st', right: 'first' },
      { left: '2nd', right: 'second' },
      { left: '3rd', right: 'third' },
      { left: '4th', right: 'fourth' },
      { left: '5th', right: 'fifth' },
      { left: '🥇', right: 'first' }
    ]
  };

  return fallbackData[topic.name] || fallbackData['Numbers & Counting'];
};

/**
 * Generate personalized AI feedback for student performance
 */
export const generatePersonalizedFeedback = async (performanceData) => {
  try {
    const { topicName, correctMatches, incorrectAttempts, totalTime, accuracy, totalPairs } = performanceData;
    
    const prompt = `You are an encouraging AI tutor for Grade 1 students (ages 6-7). 
    
A student just completed a matching game with these results:
- Topic: ${topicName}
- Correct Matches: ${correctMatches} out of ${totalPairs}
- Incorrect Attempts: ${incorrectAttempts}
- Time Taken: ${totalTime} seconds
- Accuracy: ${accuracy}%

Write a short, encouraging, and age-appropriate feedback message (3-4 sentences) that:
1. Celebrates their achievement
2. Mentions what they did well
3. Gives a gentle tip for improvement if needed
4. Encourages them to keep learning

Use simple language, emojis, and be very positive and supportive. Keep it under 100 words.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly, encouraging AI tutor for young children. Use simple language, emojis, and be very positive."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Fallback feedback
    const { accuracy, correctMatches, topicName } = performanceData;
    
    if (accuracy >= 90) {
      return `🌟 Wow! You did an amazing job matching ${correctMatches} pairs in ${topicName}! Your accuracy is outstanding! Keep up the fantastic work! 🎉`;
    } else if (accuracy >= 70) {
      return `👏 Great effort! You matched ${correctMatches} pairs correctly! With a little more practice on ${topicName}, you'll be a matching master! Keep learning! 💪`;
    } else {
      return `🌈 Good job trying! Matching can be tricky, but you're learning! Practice makes perfect. Try ${topicName} again and you'll do even better! You've got this! 🚀`;
    }
  }
};

/**
 * Generate detailed AI feedback explaining mistakes
 */
export const generateDetailedFeedback = async (performanceData) => {
  try {
    const { topicName, correctMatches, incorrectAttempts, totalTime, accuracy, totalPairs, results } = performanceData;
    
    // Build list of incorrect matches for explanation
    const incorrectMatches = results.filter(r => !r.isCorrect);
    const incorrectDetails = incorrectMatches.map(m => 
      `- You matched "${m.leftItem}" with "${m.rightItem}" (correct answer: "${m.correctAnswer}")`
    ).join('\n');
    
    const prompt = `You are an encouraging AI tutor for Grade 1 students (ages 6-7). 
    
A student just completed a matching game with these results:
- Topic: ${topicName}
- Correct Matches: ${correctMatches} out of ${totalPairs}
- Incorrect Matches: ${incorrectAttempts}
- Accuracy: ${accuracy}%
- Time Taken: ${totalTime} seconds

${incorrectMatches.length > 0 ? `Incorrect matches:\n${incorrectDetails}` : 'All matches were correct!'}

Write a detailed but age-appropriate feedback message (5-7 sentences) that:
1. Celebrates what they got right
2. For EACH incorrect match, explains why it was wrong and what the correct answer should be in simple terms
3. Gives helpful tips to remember for next time
4. Encourages them to keep learning

Use simple language, emojis, and be very positive and supportive. Keep it under 200 words.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly, encouraging AI tutor for young children. Explain mistakes gently and positively with simple language and emojis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating detailed feedback:', error);
    
    // Fallback feedback with details
    const { accuracy, correctMatches, totalPairs, results } = performanceData;
    const incorrectMatches = results.filter(r => !r.isCorrect);
    
    let feedback = `🌟 Great job completing the matching game!\n\n`;
    feedback += `You got ${correctMatches} out of ${totalPairs} matches correct! `;
    
    if (accuracy >= 90) {
      feedback += `That's excellent! 🎉\n\n`;
    } else if (accuracy >= 70) {
      feedback += `That's good work! 👏\n\n`;
    } else {
      feedback += `Keep practicing! 💪\n\n`;
    }
    
    if (incorrectMatches.length > 0) {
      feedback += `Let's learn from the mistakes:\n\n`;
      incorrectMatches.forEach((match, index) => {
        feedback += `${index + 1}. "${match.leftItem}" should match with "${match.correctAnswer}", not "${match.rightItem}". `;
      });
      feedback += `\n\nTake your time to think about each match! You'll do better next time! 🚀`;
    } else {
      feedback += `Perfect score! Keep up the amazing work! 🌟`;
    }
    
    return feedback;
  }
};