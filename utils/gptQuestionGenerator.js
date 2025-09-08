// GPT-3.5 Question Generator for Numbers and Counting
// Uses official OpenAI SDK for better reliability

import OpenAI from 'openai';

class GPTQuestionGenerator {
  constructor() {
    this.model = 'gpt-3.5-turbo';
    this.openai = null;
    
    // Initialize with API key
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found in environment variables. Please add VITE_OPENAI_API_KEY to your .env file.');
      }
      
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      
      console.log('✅ OpenAI SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI SDK:', error.message);
    }
  }

  // Check if OpenAI is ready
  isReady() {
    return this.openai !== null;
  }

  // Main method to generate questions for Numbers & Counting
  async generateQuestions(level = 'easy', count = 5, topic = 'numbers_counting') {
    if (!this.isReady()) {
      throw new Error('OpenAI SDK not initialized');
    }

    console.log(`🎯 Generating ${count} ${level} questions for ${topic}`);
    const prompt = this.buildPrompt(level, count, topic);
    console.log('📝 Generated prompt length:', prompt.length);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI tutor creating Grade 1 mathematics questions for numbers and counting. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content;
      console.log('🤖 Raw GPT response length:', content.length);
      console.log('🤖 Raw GPT response preview:', content.substring(0, 200) + '...');
      
      const questions = this.parseAndValidateQuestions(content, level);
      console.log(`✅ Successfully generated ${questions.length} questions`);
      console.log('📊 Question types:', questions.map(q => q.type).join(', '));
      
      return questions;
    } catch (error) {
      console.error('GPT Question Generation Error:', error);
      console.log('🔄 Using fallback questions...');
      return this.getFallbackQuestions(level, count);
    }
  }

  // Generate topic-specific questions
  async generateTopicQuestions(subtopic, level = 'easy', count = 5) {
    if (!this.isReady()) {
      throw new Error('OpenAI SDK not initialized');
    }

    const prompt = `Create ${count} Grade 1 mathematics questions focused on: ${subtopic}
    
Difficulty: ${level.toUpperCase()}
Topic: Numbers and Counting (0-10)

Generate questions that help students practice ${subtopic} specifically.

${this.getFormatInstructions()}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI tutor creating Grade 1 mathematics questions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content;
      return this.parseAndValidateQuestions(content, level);
    } catch (error) {
      console.error('Topic Question Generation Error:', error);
      return this.getFallbackQuestions(level, count);
    }
  }

  // Build structured prompt based on difficulty level
  buildPrompt(level, count, topic) {
    const basePrompt = `You are an AI tutor creating Grade 1 mathematics questions for numbers and counting (0-10).

IMPORTANT RULES:
- Generate exactly ${count} questions in valid JSON format
- Each question must have: id, type, question, answer, difficulty
- For tracing/drawing questions, provide target/count but NOT actual SVG paths
- Use simple, child-friendly language
- Ensure answers are always strings
- Question types: counting, tracing, drawing, multiple_choice, matching, coloring, sequence, comparison, word_problem, word_completion, odd_one_out, hybrid

DIFFICULTY SPECIFICATIONS:`;

    const difficultySpecs = {
      easy: `
EASY LEVEL (Numbers 1-8):
- Focus on basic recognition and counting 1-8
- Simple tracing of numbers 1-8 and words (one, two, three, etc.)
- Count objects and type number
- Draw specified number of simple objects
- Basic matching numbers to object groups
- Color specified number of objects
Examples: "Count the stars", "Trace the number 3", "Draw 5 circles"`,

      medium: `
MEDIUM LEVEL (Numbers 0-10):
- Include zero concept and numbers up to 10
- Missing number sequences (6, 7, __, 9, 10)
- Draw objects then count them
- Trace and write number words
- Compare groups (which has more?)
- Multiple choice number recognition
Examples: "Fill the missing number", "Which group has more apples?", "Trace 'seven'"`,

      hard: `
HARD LEVEL (Advanced 0-10):
- Backward counting and complex sequences
- Word problems with drawing ("Tom has 3 cats, gets 2 more")
- Word completion with missing letters
- Identify odd-one-out in groups
- Hybrid tasks (trace number + write word)
- Zero counting in empty groups
Examples: "Complete: 10, 9, __, 7", "Draw all Tom's cats and count", "Fill: n_n_"`
    };

    const objectsList = ['apple', 'star', 'circle', 'heart', 'triangle', 'square', 'cat', 'flower', 'ball', 'pencil'];
    const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    return `${basePrompt}

${difficultySpecs[level]}

AVAILABLE OBJECTS: ${objectsList.join(', ')}
NUMBER WORDS: ${numberWords.join(', ')}

Generate EXACTLY ${count} questions for ${level.toUpperCase()} level. Do not generate fewer than ${count} questions.

REQUIRED JSON FORMAT:
[
  {
    "id": 1,
    "type": "counting",
    "question": "Count the apples and type the number",
    "objects": "apple",
    "count": 4,
    "answer": "4",
    "difficulty": "${level}"
  },
  {
    "id": 2,
    "type": "tracing",
    "question": "Trace the number 7",
    "target": "7",
    "targetType": "number",
    "answer": "7",
    "difficulty": "${level}"
  }
]

You must generate exactly ${count} questions. Each question should be different and test various skills.

RESPOND WITH ONLY THE JSON ARRAY OF ${count} QUESTIONS, NO OTHER TEXT.`;
  }

  // Call GPT-3.5 API
  async callGPT(prompt) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Grade 1 mathematics tutor. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`GPT API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Parse and validate GPT response
  parseAndValidateQuestions(response, level) {
    try {
      console.log('🔍 Raw GPT Response:', response);
      
      // Clean response (remove any non-JSON text)
      let jsonString = response.trim();
      
      // Remove markdown code blocks if present
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Extract JSON array
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      console.log('🔍 Cleaned JSON String:', jsonString);
      
      const questions = JSON.parse(jsonString);
      
      if (!Array.isArray(questions)) {
        console.error('❌ Response is not an array:', questions);
        throw new Error('Response is not an array');
      }

      console.log(`🔍 Parsed ${questions.length} questions from GPT`);

      // Validate each question
      const validatedQuestions = questions.map((q, index) => {
        const validated = this.validateQuestion(q, level, index + 1);
        return validated;
      }).filter(q => q !== null);
      
      console.log(`✅ ${validatedQuestions.length} questions passed validation`);
      
      // If we don't have enough questions, generate fallback questions
      if (validatedQuestions.length < 5) {
        console.warn(`⚠️ Only ${validatedQuestions.length} questions validated, generating fallback questions`);
        const fallbackQuestions = this.getFallbackQuestions(level, 5 - validatedQuestions.length);
        validatedQuestions.push(...fallbackQuestions);
      }
      
      return validatedQuestions;
      
    } catch (error) {
      console.error('❌ JSON Parse Error:', error);
      console.error('❌ Raw response was:', response);
      throw new Error(`Invalid JSON response from GPT: ${error.message}`);
    }
  }

  // Validate individual question structure
  validateQuestion(question, level, fallbackId) {
    const requiredFields = ['type', 'question'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!question[field]) {
        console.warn(`Missing ${field} in question:`, question);
        return null;
      }
    }

    // Special handling for matching questions - they use pairs instead of answer
    if (question.type === 'matching') {
      if (!question.pairs && !question.answer) {
        console.warn(`Missing pairs or answer in matching question:`, question);
        return null;
      }
      // Generate answer from pairs if missing
      if (!question.answer && question.pairs) {
        question.answer = Object.keys(question.pairs)[0]; // Use first pair as answer
      }
    } else {
      // For non-matching questions, answer is required
      if (!question.answer) {
        console.warn(`Missing answer in question:`, question);
        return null;
      }
    }

    // Ensure ID exists
    if (!question.id) {
      question.id = fallbackId;
    }

    // Ensure difficulty matches
    question.difficulty = level;

    // Validate question types
    const validTypes = [
      'counting', 'tracing', 'drawing', 'multiple_choice', 'matching', 
      'coloring', 'sequence', 'comparison', 'word_problem', 'word_completion', 
      'odd_one_out', 'hybrid'
    ];

    if (!validTypes.includes(question.type)) {
      console.warn(`Invalid question type: ${question.type}`);
      question.type = 'counting'; // Default fallback
    }

    // Ensure answer is string
    question.answer = String(question.answer);

    // Add missing fields based on question type
    question = this.addTypeSpecificFields(question);

    return question;
  }

  // Add type-specific fields that might be missing
  addTypeSpecificFields(question) {
    switch (question.type) {
      case 'counting':
        if (!question.objects) question.objects = 'star';
        if (!question.count) question.count = parseInt(question.answer) || 3;
        break;
        
      case 'tracing':
        if (!question.target) question.target = question.answer;
        if (!question.targetType) {
          question.targetType = /^\d+$/.test(question.target) ? 'number' : 'word';
        }
        break;
        
      case 'drawing':
        if (!question.target) question.target = 'circle';
        if (!question.count) question.count = parseInt(question.answer) || 2;
        break;
        
      case 'multiple_choice':
        if (!question.options) {
          const answer = parseInt(question.answer);
          question.options = [
            String(answer),
            String(answer + 1),
            String(answer - 1),
            String(answer + 2)
          ].filter(opt => parseInt(opt) >= 0 && parseInt(opt) <= 10)
           .sort(() => Math.random() - 0.5);
        }
        break;
        
      case 'coloring':
        if (!question.objects) question.objects = 'circle';
        if (!question.targetCount) question.targetCount = parseInt(question.answer) || 3;
        if (!question.totalCount) question.totalCount = question.targetCount + 2;
        if (!question.targetColor) question.targetColor = 'red';
        break;
        
      case 'sequence':
        if (!question.sequence) {
          const missing = parseInt(question.answer);
          question.sequence = [String(missing-1), String(missing), '', String(missing+1), String(missing+2)];
          question.missingIndex = 2;
        }
        break;
    }
    
    return question;
  }

  // Get fallback questions if GPT fails
  getFallbackQuestions(level, count) {
    const fallbackQuestions = [];
    const numbers = level === 'easy' ? [1,2,3,4,5] : level === 'medium' ? [6,7,8,9,10] : [0,1,2,3,4,5,6,7,8,9,10];
    const objects = ['star', 'apple', 'heart', 'circle', 'triangle'];
    const questionTypes = ['counting', 'tracing', 'drawing'];
    
    for (let i = 0; i < count; i++) {
      const num = numbers[i % numbers.length];
      const obj = objects[i % objects.length];
      const type = questionTypes[i % questionTypes.length];
      
      let question;
      switch (type) {
        case 'counting':
          question = {
            id: i + 1,
            type: 'counting',
            question: `Count the ${obj}s and type the number`,
            objects: obj,
            count: num,
            answer: num.toString(),
            difficulty: level
          };
          break;
        case 'tracing':
          question = {
            id: i + 1,
            type: 'tracing',
            question: `Trace the number ${num}`,
            target: num.toString(),
            targetType: 'number',
            answer: num.toString(),
            difficulty: level
          };
          break;
        case 'drawing':
          question = {
            id: i + 1,
            type: 'drawing',
            question: `Draw ${num} ${obj}s`,
            target: obj,
            count: num,
            answer: num.toString(),
            difficulty: level
          };
          break;
      }
      
      fallbackQuestions.push(question);
    }
    
    return fallbackQuestions;
  }

  // Generate questions for specific topic areas
  async generateTopicQuestions(topic, level = 'easy', count = 5) {
    const topicPrompts = {
      number_recognition: 'Focus on recognizing and identifying numbers 0-10',
      counting_objects: 'Focus on counting physical objects and typing the number',
      number_tracing: 'Focus on tracing numbers and number words',
      number_sequences: 'Focus on number patterns and missing numbers',
      word_problems: 'Focus on simple addition word problems with drawing'
    };

    const specificPrompt = topicPrompts[topic] || 'General numbers and counting practice';
    
    // Modify the base prompt to include topic focus
    const originalPrompt = this.buildPrompt(level, count, 'numbers_counting');
    const topicPrompt = originalPrompt.replace(
      'DIFFICULTY SPECIFICATIONS:',
      `TOPIC FOCUS: ${specificPrompt}\n\nDIFFICULTY SPECIFICATIONS:`
    );

    try {
      const response = await this.callGPT(topicPrompt);
      const questions = this.parseAndValidateQuestions(response, level);
      return questions;
    } catch (error) {
      console.error('Topic Question Generation Error:', error);
      return this.getFallbackQuestions(level, count);
    }
  }
}

// Export for use in other modules
export default GPTQuestionGenerator;

// Example usage:
/*
const generator = new GPTQuestionGenerator('your-openai-api-key');

// Generate 5 easy questions
const easyQuestions = await generator.generateQuestions('easy', 5);

// Generate topic-specific questions
const countingQuestions = await generator.generateTopicQuestions('counting_objects', 'medium', 3);
*/
