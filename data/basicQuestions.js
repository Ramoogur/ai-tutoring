// Basic questions for non-shapes topics
export const basicQuestions = {
  'Numbers & Counting': {
    easy: [
      {
        id: 1,
        question: 'How many apples are there?',
        options: ['2', '3', '4', '5'],
        correct: '3',
        visual: '🍎🍎🍎'
      },
      {
        id: 2,
        question: 'What comes after 5?',
        options: ['4', '6', '7', '8'],
        correct: '6'
      },
      {
        id: 3,
        question: 'Count the stars: ⭐⭐⭐⭐',
        options: ['3', '4', '5', '6'],
        correct: '4'
      }
    ],
    medium: [
      {
        id: 4,
        question: 'What number comes before 10?',
        options: ['8', '9', '11', '12'],
        correct: '9'
      },
      {
        id: 5,
        question: 'How many dots? ••••••••',
        options: ['6', '7', '8', '9'],
        correct: '8'
      }
    ],
    hard: [
      {
        id: 6,
        question: 'What is the missing number: 1, 2, ?, 4, 5',
        options: ['0', '3', '6', '7'],
        correct: '3'
      }
    ]
  },
  'Addition (within 10)': {
    easy: [
      {
        id: 1,
        question: 'What is 2 + 1?',
        options: ['2', '3', '4', '5'],
        correct: '3',
        visual: '🍎🍎 + 🍎 = ?'
      },
      {
        id: 2,
        question: 'What is 3 + 2?',
        options: ['4', '5', '6', '7'],
        correct: '5',
        visual: '🍎🍎🍎 + 🍎🍎 = ?'
      }
    ],
    medium: [
      {
        id: 3,
        question: 'What is 4 + 3?',
        options: ['6', '7', '8', '9'],
        correct: '7'
      },
      {
        id: 4,
        question: 'What is 5 + 4?',
        options: ['8', '9', '10', '11'],
        correct: '9'
      }
    ],
    hard: [
      {
        id: 5,
        question: 'What is 6 + 4?',
        options: ['9', '10', '11', '12'],
        correct: '10'
      }
    ]
  },
  'Patterns': {
    easy: [
      {
        id: 1,
        question: 'What comes next: 🔴🔵🔴🔵?',
        options: ['🔴', '🔵', '🟡', '🟢'],
        correct: '🔴'
      },
      {
        id: 2,
        question: 'Complete the pattern: 1, 2, 1, 2, ?',
        options: ['1', '2', '3', '4'],
        correct: '1'
      }
    ],
    medium: [
      {
        id: 3,
        question: 'What comes next: ⭐⭐🌙⭐⭐🌙?',
        options: ['⭐', '🌙', '☀️', '🔥'],
        correct: '⭐'
      }
    ],
    hard: [
      {
        id: 4,
        question: 'Complete: 1, 3, 5, 7, ?',
        options: ['8', '9', '10', '11'],
        correct: '9'
      }
    ]
  },
  'Time': {
    easy: [
      {
        id: 1,
        question: 'What time is shown on the clock?',
        options: ['3:00', '6:00', '9:00', '12:00'],
        correct: '3:00'
      }
    ],
    medium: [
      {
        id: 2,
        question: 'What time is 30 minutes after 2:00?',
        options: ['2:30', '2:15', '3:00', '1:30'],
        correct: '2:30'
      }
    ],
    hard: [
      {
        id: 3,
        question: 'How many minutes are in 1 hour?',
        options: ['30', '45', '60', '90'],
        correct: '60'
      }
    ]
  },
  'Money': {
    easy: [
      {
        id: 1,
        question: 'How much is 1 penny worth?',
        options: ['1¢', '5¢', '10¢', '25¢'],
        correct: '1¢'
      }
    ],
    medium: [
      {
        id: 2,
        question: 'How much is 2 nickels?',
        options: ['5¢', '10¢', '15¢', '20¢'],
        correct: '10¢'
      }
    ],
    hard: [
      {
        id: 3,
        question: 'How many pennies equal 1 dime?',
        options: ['5', '10', '15', '20'],
        correct: '10'
      }
    ]
  },
  'Ordinal Numbers': {
    easy: [
      {
        id: 1,
        question: 'Which position is the red car? 🚗🔴🚗🚗',
        options: ['1st', '2nd', '3rd', '4th'],
        correct: '2nd'
      }
    ],
    medium: [
      {
        id: 2,
        question: 'What comes after 3rd?',
        options: ['2nd', '4th', '5th', '6th'],
        correct: '4th'
      }
    ],
    hard: [
      {
        id: 3,
        question: 'Which ordinal number represents the 7th position?',
        options: ['sixth', 'seventh', 'eighth', 'ninth'],
        correct: 'seventh'
      }
    ]
  },
  'Measurement & Comparison': {
    easy: [
      {
        id: 1,
        question: 'Which is longer? 📏📏 or 📏',
        options: ['First one', 'Second one', 'Same length', 'Cannot tell'],
        correct: 'First one'
      }
    ],
    medium: [
      {
        id: 2,
        question: 'Which container holds more water?',
        options: ['Tall thin glass', 'Short wide glass', 'Same amount', 'Cannot tell'],
        correct: 'Cannot tell'
      }
    ],
    hard: [
      {
        id: 3,
        question: 'Order from shortest to tallest: A=🌲, B=🌳, C=🌱',
        options: ['A, B, C', 'C, A, B', 'B, C, A', 'C, B, A'],
        correct: 'C, A, B'
      }
    ]
  }
};
