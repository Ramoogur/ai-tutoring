// Numbers and Counting Questions for Grade 1
// Covers: number recognition 0-10, counting objects, tracing numbers, drawing, matching
// Each level contains 20 questions with various interactive question types

const numbersCountingQuestions = {
  easy: [
    // Basic Counting (1-5)
    {
      id: 1,
      type: 'counting',
      question: 'Count the apples. How many are there?',
      objects: 'apple',
      count: 3,
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 2,
      type: 'counting',
      question: 'Count the stars. How many stars do you see?',
      objects: 'star',
      count: 2,
      answer: '2',
      difficulty: 'easy'
    },
    {
      id: 3,
      type: 'counting',
      question: 'Count the hearts. Type the number.',
      objects: 'heart',
      count: 4,
      answer: '4',
      difficulty: 'easy'
    },
    {
      id: 4,
      type: 'counting',
      question: 'How many circles are there?',
      objects: 'circle',
      count: 5,
      answer: '5',
      difficulty: 'easy'
    },
    {
      id: 5,
      type: 'counting',
      question: 'Count the flowers. How many?',
      objects: 'flower',
      count: 1,
      answer: '1',
      difficulty: 'easy'
    },
    // Tracing Numbers (1-5)
    {
      id: 6,
      type: 'tracing',
      question: 'Trace the number 1',
      target: '1',
      targetType: 'number',
      answer: '1',
      difficulty: 'easy'
    },
    {
      id: 7,
      type: 'tracing',
      question: 'Trace the number 2',
      target: '2',
      targetType: 'number',
      answer: '2',
      difficulty: 'easy'
    },
    {
      id: 8,
      type: 'tracing',
      question: 'Trace the number 3',
      target: '3',
      targetType: 'number',
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 9,
      type: 'tracing',
      question: 'Trace the number 4',
      target: '4',
      targetType: 'number',
      answer: '4',
      difficulty: 'easy'
    },
    {
      id: 10,
      type: 'tracing',
      question: 'Trace the number 5',
      target: '5',
      targetType: 'number',
      answer: '5',
      difficulty: 'easy'
    },
    // Drawing Objects (1-5)
    {
      id: 11,
      type: 'drawing',
      question: 'Draw 2 stars in the box',
      target: 'star',
      count: 2,
      answer: '2',
      difficulty: 'easy'
    },
    {
      id: 12,
      type: 'drawing',
      question: 'Draw 3 hearts in the box',
      target: 'heart',
      count: 3,
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 13,
      type: 'drawing',
      question: 'Draw 4 circles in the box',
      target: 'circle',
      count: 4,
      answer: '4',
      difficulty: 'easy'
    },
    {
      id: 14,
      type: 'drawing',
      question: 'Draw 1 apple in the box',
      target: 'apple',
      count: 1,
      answer: '1',
      difficulty: 'easy'
    },
    // Multiple Choice
    {
      id: 15,
      type: 'multiple_choice',
      question: 'Which number comes after 2?',
      options: ['1', '3', '4', '5'],
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 16,
      type: 'multiple_choice',
      question: 'Which number comes before 4?',
      options: ['2', '3', '5', '6'],
      answer: '3',
      difficulty: 'easy'
    },
    // Matching
    {
      id: 17,
      type: 'matching',
      question: 'Count the triangles and choose the correct number',
      objects: 'triangle',
      numbers: ['2', '3', '4'],
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 18,
      type: 'matching',
      question: 'Count the squares and choose the correct number',
      objects: 'square',
      numbers: ['3', '4', '5'],
      answer: '4',
      difficulty: 'easy'
    },
    // Coloring
    {
      id: 19,
      type: 'coloring',
      question: 'Color exactly 3 hearts',
      objects: 'heart',
      count: 3,
      answer: '3',
      difficulty: 'easy'
    },
    {
      id: 20,
      type: 'coloring',
      question: 'Color exactly 5 stars',
      objects: 'star',
      count: 5,
      answer: '5',
      difficulty: 'easy'
    }
  ],

  medium: [
    // Counting (6-10 and 0)
    {
      id: 21,
      type: 'counting',
      question: 'Count the diamonds. How many are there?',
      objects: 'diamond',
      count: 6,
      answer: '6',
      difficulty: 'medium'
    },
    {
      id: 22,
      type: 'counting',
      question: 'Count the flowers. Type the number.',
      objects: 'flower',
      count: 7,
      answer: '7',
      difficulty: 'medium'
    },
    {
      id: 23,
      type: 'counting',
      question: 'How many apples do you see?',
      objects: 'apple',
      count: 8,
      answer: '8',
      difficulty: 'medium'
    },
    {
      id: 24,
      type: 'counting',
      question: 'Count the stars. How many stars?',
      objects: 'star',
      count: 9,
      answer: '9',
      difficulty: 'medium'
    },
    {
      id: 25,
      type: 'counting',
      question: 'Count the circles. How many?',
      objects: 'circle',
      count: 10,
      answer: '10',
      difficulty: 'medium'
    },
    {
      id: 26,
      type: 'counting',
      question: 'How many hearts are in the box? (Zero concept)',
      objects: 'heart',
      count: 0,
      answer: '0',
      difficulty: 'medium'
    },
    // Tracing (6-10 and words)
    {
      id: 27,
      type: 'tracing',
      question: 'Trace the number 6',
      target: '6',
      targetType: 'number',
      answer: '6',
      difficulty: 'medium'
    },
    {
      id: 28,
      type: 'tracing',
      question: 'Trace the number 7',
      target: '7',
      targetType: 'number',
      answer: '7',
      difficulty: 'medium'
    },
    {
      id: 29,
      type: 'tracing',
      question: 'Trace the word "five"',
      target: 'five',
      targetType: 'word',
      answer: 'five',
      difficulty: 'medium'
    },
    {
      id: 30,
      type: 'tracing',
      question: 'Trace the word "six"',
      target: 'six',
      targetType: 'word',
      answer: 'six',
      difficulty: 'medium'
    },
    // Drawing
    {
      id: 31,
      type: 'drawing',
      question: 'Draw 6 triangles in the box',
      target: 'triangle',
      count: 6,
      answer: '6',
      difficulty: 'medium'
    },
    {
      id: 32,
      type: 'drawing',
      question: 'Draw 7 squares in the box',
      target: 'square',
      count: 7,
      answer: '7',
      difficulty: 'medium'
    },
    {
      id: 33,
      type: 'drawing',
      question: 'Draw 8 hearts in the box',
      target: 'heart',
      count: 8,
      answer: '8',
      difficulty: 'medium'
    },
    // Sequence
    {
      id: 34,
      type: 'sequence',
      question: 'Fill in the missing number: 5, 6, ___, 8, 9',
      sequence: ['5', '6', '', '8', '9'],
      missingIndex: 2,
      answer: '7',
      difficulty: 'medium'
    },
    {
      id: 35,
      type: 'sequence',
      question: 'Fill in the missing number: 7, 8, ___, 10',
      sequence: ['7', '8', '', '10'],
      missingIndex: 2,
      answer: '9',
      difficulty: 'medium'
    },
    // Multiple Choice
    {
      id: 36,
      type: 'multiple_choice',
      question: 'What number comes between 6 and 8?',
      options: ['5', '7', '9', '10'],
      answer: '7',
      difficulty: 'medium'
    },
    {
      id: 37,
      type: 'multiple_choice',
      question: 'What number is one more than 8?',
      options: ['7', '8', '9', '10'],
      answer: '9',
      difficulty: 'medium'
    },
    // Matching
    {
      id: 38,
      type: 'matching',
      question: 'Count the apples and choose the correct number',
      objects: 'apple',
      numbers: ['7', '8', '9'],
      answer: '8',
      difficulty: 'medium'
    },
    // Word Completion
    {
      id: 39,
      type: 'word_completion',
      question: 'Complete the word: s_v_n',
      word: 'seven',
      blanks: [1, 3],
      answer: 'seven',
      difficulty: 'medium'
    },
    {
      id: 40,
      type: 'word_completion',
      question: 'Complete the word: e_g_t',
      word: 'eight',
      blanks: [1, 3],
      answer: 'eight',
      difficulty: 'medium'
    }
  ],

  hard: [
    // Advanced Counting and Comparison
    {
      id: 41,
      type: 'counting',
      question: 'Count all the objects and type the total number',
      objects: 'diamond',
      count: 10,
      answer: '10',
      difficulty: 'hard'
    },
    {
      id: 42,
      type: 'counting',
      question: 'How many objects are there? (Empty set - zero)',
      objects: 'circle',
      count: 0,
      answer: '0',
      difficulty: 'hard'
    },
    // Word Problems
    {
      id: 43,
      type: 'word_problem',
      question: 'Maya has 3 apples. She gets 2 more. Draw all the apples and count them.',
      initial: 3,
      added: 2,
      target: 'apple',
      answer: '5',
      difficulty: 'hard'
    },
    {
      id: 44,
      type: 'word_problem',
      question: 'Tom has 4 stars. He finds 3 more. Draw all the stars and count them.',
      initial: 4,
      added: 3,
      target: 'star',
      answer: '7',
      difficulty: 'hard'
    },
    {
      id: 45,
      type: 'word_problem',
      question: 'Sara has 5 flowers. She gets 4 more. Draw all the flowers and count them.',
      initial: 5,
      added: 4,
      target: 'flower',
      answer: '9',
      difficulty: 'hard'
    },
    // Tracing (advanced numbers and words)
    {
      id: 46,
      type: 'tracing',
      question: 'Trace the number 8',
      target: '8',
      targetType: 'number',
      answer: '8',
      difficulty: 'hard'
    },
    {
      id: 47,
      type: 'tracing',
      question: 'Trace the number 9',
      target: '9',
      targetType: 'number',
      answer: '9',
      difficulty: 'hard'
    },
    {
      id: 48,
      type: 'tracing',
      question: 'Trace the number 10',
      target: '10',
      targetType: 'number',
      answer: '10',
      difficulty: 'hard'
    },
    {
      id: 49,
      type: 'tracing',
      question: 'Trace the word "nine"',
      target: 'nine',
      targetType: 'word',
      answer: 'nine',
      difficulty: 'hard'
    },
    {
      id: 50,
      type: 'tracing',
      question: 'Trace the word "ten"',
      target: 'ten',
      targetType: 'word',
      answer: 'ten',
      difficulty: 'hard'
    },
    // Advanced Sequences
    {
      id: 51,
      type: 'sequence',
      question: 'Fill in the missing numbers: 8, ___, 10',
      sequence: ['8', '', '10'],
      missingIndex: 1,
      answer: '9',
      difficulty: 'hard'
    },
    {
      id: 52,
      type: 'sequence',
      question: 'Fill in the missing number: 0, 1, ___, 3, 4',
      sequence: ['0', '1', '', '3', '4'],
      missingIndex: 2,
      answer: '2',
      difficulty: 'hard'
    },
    {
      id: 53,
      type: 'sequence',
      question: 'Complete the backward sequence: 10, 9, ___, 7, 6',
      sequence: ['10', '9', '', '7', '6'],
      missingIndex: 2,
      answer: '8',
      difficulty: 'hard'
    },
    // Word Completion (Advanced)
    {
      id: 54,
      type: 'word_completion',
      question: 'Complete the word: t_n',
      word: 'ten',
      blanks: [1],
      answer: 'ten',
      difficulty: 'hard'
    },
    {
      id: 55,
      type: 'word_completion',
      question: 'Complete the word: n_n_',
      word: 'nine',
      blanks: [1, 3],
      answer: 'nine',
      difficulty: 'hard'
    },
    {
      id: 56,
      type: 'word_completion',
      question: 'Complete the word: z_r_',
      word: 'zero',
      blanks: [1, 3],
      answer: 'zero',
      difficulty: 'hard'
    },
    // Odd One Out
    {
      id: 57,
      type: 'odd_one_out',
      question: 'Which number does not belong? (Even numbers: 2, 4, 6, 7)',
      items: ['2', '4', '6', '7'],
      answer: '7',
      difficulty: 'hard'
    },
    {
      id: 58,
      type: 'odd_one_out',
      question: 'Which number does not belong? (Numbers less than 5: 1, 3, 4, 8)',
      items: ['1', '3', '4', '8'],
      answer: '8',
      difficulty: 'hard'
    },
    // Drawing (Advanced)
    {
      id: 59,
      type: 'drawing',
      question: 'Draw 9 circles in the box',
      target: 'circle',
      count: 9,
      answer: '9',
      difficulty: 'hard'
    },
    {
      id: 60,
      type: 'drawing',
      question: 'Draw 10 stars in the box',
      target: 'star',
      count: 10,
      answer: '10',
      difficulty: 'hard'
    }
  ]
};

// Helper function to shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to get questions by difficulty
export const getQuestionsByDifficulty = (difficulty, count = 20) => {
  const questions = numbersCountingQuestions[difficulty] || numbersCountingQuestions.easy;
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
};

// Helper function to get questions by type
export const getQuestionsByType = (difficulty, types = [], count = 20) => {
  const allQuestions = numbersCountingQuestions[difficulty] || numbersCountingQuestions.easy;
  const filtered = allQuestions.filter(q => types.includes(q.type));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
};

export default numbersCountingQuestions;

