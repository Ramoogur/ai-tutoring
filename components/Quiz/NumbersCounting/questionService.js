// Question Service - Handles dynamic question generation only
import GPTQuestionGenerator from './gptQuestionGenerator.js';

class QuestionService {
  constructor() {
    this.gptGenerator = new GPTQuestionGenerator();
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Main method to get questions (GPT generation only)
  async getQuestions(topic, level = 'easy', count = 5, useGPT = true) {
    const cacheKey = `${topic}_${level}_${count}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('📦 Using cached questions');
        return cached.questions;
      }
    }

    let questions = [];

    // Generate questions with GPT
    if (useGPT && this.gptGenerator.isReady()) {
      try {
        console.log('🤖 Generating questions with GPT-4o...');
        questions = await this.gptGenerator.generateQuestions(level, count, topic);
        
        if (questions && questions.length > 0) {
          console.log(`✅ GPT generated ${questions.length} questions`);
          this.cacheQuestions(cacheKey, questions);
          return questions;
        }
      } catch (error) {
        console.error('❌ GPT generation failed:', error.message);
        throw new Error(`Failed to generate questions: ${error.message}`);
      }
    } else {
      throw new Error('GPT is disabled or API key not found');
    }

    return questions;
  }

  // Generate basic fallback questions if GPT fails
  generateBasicQuestions(level, count) {
    const basicQuestions = [];
    const numbers = level === 'easy' ? [1,2,3,4,5] : level === 'medium' ? [0,6,7,8,9,10] : [0,1,2,3,4,5,6,7,8,9,10];
    
    for (let i = 0; i < count; i++) {
      const num = numbers[i % numbers.length];
      basicQuestions.push({
        id: i + 1,
        type: 'counting',
        question: `Count the objects and type the number`,
        objects: '🍎'.repeat(num),
        count: num,
        answer: num.toString(),
        difficulty: level
      });
    }
    
    return basicQuestions;
  }

  // Generate topic-specific questions
  async getTopicQuestions(topic, subtopic, level = 'easy', count = 5) {
    const cacheKey = `${topic}_${subtopic}_${level}_${count}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.questions;
      }
    }

    try {
      const questions = await this.gptGenerator.generateTopicQuestions(subtopic, level, count);
      this.cacheQuestions(cacheKey, questions);
      return questions;
    } catch (error) {
      console.warn('Topic question generation failed:', error);
      return this.generateBasicQuestions(level, count);
    }
  }

  // Generate adaptive questions based on student performance
  async getAdaptiveQuestions(studentProfile, level, count = 5) {
    const weakAreas = this.identifyWeakAreas(studentProfile);
    const questionTypes = this.selectQuestionTypes(weakAreas, level);
    
    try {
      // Create custom prompt for adaptive questions
      const adaptivePrompt = this.buildAdaptivePrompt(questionTypes, level, count);
      const response = await this.gptGenerator.callGPT(adaptivePrompt);
      const questions = this.gptGenerator.parseAndValidateQuestions(response, level);
      
      return questions.length > 0 ? questions : this.generateBasicQuestions(level, count);
    } catch (error) {
      console.warn('Adaptive question generation failed:', error);
      return this.generateBasicQuestions(level, count);
    }
  }

  // Identify weak areas from student performance
  identifyWeakAreas(studentProfile) {
    const weakAreas = [];
    
    if (studentProfile.tracingAccuracy < 0.7) weakAreas.push('tracing');
    if (studentProfile.countingAccuracy < 0.7) weakAreas.push('counting');
    if (studentProfile.sequenceAccuracy < 0.7) weakAreas.push('sequence');
    if (studentProfile.wordProblemAccuracy < 0.7) weakAreas.push('word_problem');
    
    return weakAreas.length > 0 ? weakAreas : ['counting', 'tracing']; // Default focus
  }

  // Select question types based on weak areas
  selectQuestionTypes(weakAreas, level) {
    const typeMapping = {
      easy: {
        tracing: ['tracing'],
        counting: ['counting', 'drawing'],
        sequence: ['sequence'],
        word_problem: ['drawing', 'counting']
      },
      medium: {
        tracing: ['tracing', 'word_completion'],
        counting: ['counting', 'comparison'],
        sequence: ['sequence', 'multiple_choice'],
        word_problem: ['word_problem', 'drawing']
      },
      hard: {
        tracing: ['hybrid', 'word_completion'],
        counting: ['word_problem', 'odd_one_out'],
        sequence: ['sequence'],
        word_problem: ['word_problem', 'hybrid']
      }
    };

    const levelTypes = typeMapping[level] || typeMapping.easy;
    const selectedTypes = [];

    weakAreas.forEach(area => {
      if (levelTypes[area]) {
        selectedTypes.push(...levelTypes[area]);
      }
    });

    return [...new Set(selectedTypes)]; // Remove duplicates
  }

  // Build adaptive prompt for specific question types
  buildAdaptivePrompt(questionTypes, level, count) {
    return `You are an AI tutor creating personalized Grade 1 mathematics questions for numbers and counting.

FOCUS AREAS: The student needs practice with: ${questionTypes.join(', ')}

Generate ${count} questions specifically targeting these question types.
Difficulty level: ${level.toUpperCase()}

REQUIRED QUESTION TYPES: ${questionTypes.join(', ')}

Follow the same JSON format as before, ensuring each question targets the specified weak areas.

RESPOND WITH ONLY THE JSON ARRAY, NO OTHER TEXT.`;
  }

  // Cache questions with timestamp
  cacheQuestions(key, questions) {
    this.cache.set(key, {
      questions,
      timestamp: Date.now()
    });
  }

  // Utility method to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Set GPT API key
  setGPTApiKey(apiKey) {
    this.gptGenerator.apiKey = apiKey;
  }

  // Check if GPT is available
  isGPTAvailable() {
    return !!this.gptGenerator.apiKey;
  }

  // Generate questions for specific learning objectives
  async generateLearningObjectiveQuestions(objective, level, count = 5) {
    const objectivePrompts = {
      'number_recognition': 'Focus on recognizing and identifying numbers 0-10 in different contexts',
      'counting_skills': 'Focus on counting objects accurately and understanding quantity',
      'number_writing': 'Focus on tracing and writing numbers and number words',
      'number_sequences': 'Focus on understanding number order and patterns',
      'basic_addition': 'Focus on simple addition concepts through drawing and counting',
      'zero_concept': 'Focus on understanding zero as an empty set or nothing',
      'number_comparison': 'Focus on comparing quantities and understanding more/less'
    };

    const prompt = objectivePrompts[objective] || objectivePrompts['counting_skills'];
    
    try {
      const questions = await this.gptGenerator.generateTopicQuestions(objective, level, count);
      return questions;
    } catch (error) {
      console.warn(`Learning objective question generation failed for ${objective}:`, error);
      return this.generateBasicQuestions(level, count);
    }
  }
}

// Create singleton instance
const questionService = new QuestionService();

export default questionService;
