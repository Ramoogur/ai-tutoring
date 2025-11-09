// GPT-4o Question Generator for Numbers and Counting
// Uses official OpenAI SDK for better reliability

import OpenAI from 'openai';

class GPTQuestionGenerator {
  constructor() {
    this.model = 'gpt-4o';
    this.openai = null;
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

  isReady() {
    return this.openai !== null;
  }

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

  buildPrompt(level, count, topic) {
    const basePrompt = `You are an AI tutor creating Grade 1 mathematics questions for numbers and counting (0-10).

IMPORTANT RULES:
- Generate exactly ${count} questions in valid JSON format
- Each question must have: id, type, question, answer, difficulty
- For tracing/drawing questions, provide target/count but NOT actual SVG paths
- Use simple, child-friendly language
- Ensure answers are always strings
- Question types: counting, tracing, drawing, multiple_choice, matching, coloring, sequence, comparison, word_problem, word_completion
- Only use these types. Do NOT generate any other types or custom types. Each question must fit the following UI requirements:
  - For counting: include 'objects' (string) and 'count' (number)
  - For tracing: include 'target' (string/number), 'targetType' (number/word)
  - For drawing: include 'target' (object name) and 'count' (number)
  - For multiple_choice: include 'options' (array of strings)
  - For matching: include 'numbers' (array) and 'objects' (string)
  - For coloring: include 'objects', 'targetCount', 'totalCount', 'targetColor'
  - For sequence: include 'sequence' (array), 'missingIndex' (number)
  - For comparison: include two object groups to compare
  - For word_problem: include initial, added, target, answer
  - For word_completion: include 'word', 'blanks' (array of indices)
- Do NOT generate any question that does not fit these requirements. Respond with JSON only.

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

  parseAndValidateQuestions(response, level) {
    try {
      console.log('🔍 Raw GPT Response:', response);
      let jsonString = response.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
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
      const validatedQuestions = questions.map((q, index) => {
        const validated = this.validateQuestion(q, level, index + 1);
        return validated;
      }).filter(q => q !== null);
      console.log(`✅ ${validatedQuestions.length} questions passed validation`);
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

  validateQuestion(question, level, fallbackId) {
    const requiredFields = ['type', 'question'];
    for (const field of requiredFields) {
      if (!question[field]) {
        console.warn(`Missing ${field} in question:`, question);
        return null;
      }
    }
    if (question.type === 'matching') {
      if (!question.pairs && !question.answer) {
        console.warn(`Missing pairs or answer in matching question:`, question);
        return null;
      }
      if (!question.answer && question.pairs) {
        question.answer = Object.keys(question.pairs)[0];
      }
    } else {
      if (!question.answer) {
        console.warn(`Missing answer in question:`, question);
        return null;
      }
    }
    if (!question.id) {
      question.id = fallbackId;
    }
    question.difficulty = level;
    const validTypes = [
      'counting', 'tracing', 'drawing', 'multiple_choice', 'matching', 
      'coloring', 'sequence', 'comparison', 'word_problem', 'word_completion'
    ];
    if (!validTypes.includes(question.type)) {
      console.warn(`Invalid question type: ${question.type}`);
      question.type = 'counting';
    }
    question.answer = String(question.answer);
    question = this.addTypeSpecificFields(question);
    return question;
  }

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
}

export default GPTQuestionGenerator;
