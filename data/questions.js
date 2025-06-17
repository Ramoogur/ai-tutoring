// Sample math questions for grades 1-3 with different difficulty levels
const mathQuestions = {
  addition: {
    easy: [
      {
        id: 1,
        question: 'What is 2 + 3?',
        options: ['4', '5', '6', '7'],
        correct: '5',
        visual: '🍎🍎 + 🍎🍎🍎 = ?'
      },
      {
        id: 2,
        question: 'What is 1 + 5?',
        options: ['5', '6', '7', '8'],
        correct: '6',
        visual: '🍎 + 🍎🍎🍎🍎🍎 = ?'
      },
      {
        id: 3,
        question: 'What is 4 + 2?',
        options: ['2', '4', '6', '8'],
        correct: '6',
        visual: '🍎🍎🍎🍎 + 🍎🍎 = ?'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'What is 7 + 5?',
        options: ['10', '11', '12', '13'],
        correct: '12',
        visual: '7️⃣ + 5️⃣ = ?'
      },
      {
        id: 2,
        question: 'What is 8 + 6?',
        options: ['12', '13', '14', '15'],
        correct: '14',
        visual: '8️⃣ + 6️⃣ = ?'
      },
      {
        id: 3,
        question: 'What is 9 + 8?',
        options: ['15', '16', '17', '18'],
        correct: '17',
        visual: '9️⃣ + 8️⃣ = ?'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'What is 12 + 15?',
        options: ['25', '26', '27', '28'],
        correct: '27',
        visual: '1️⃣2️⃣ + 1️⃣5️⃣ = ?'
      },
      {
        id: 2,
        question: 'What is 18 + 7?',
        options: ['23', '24', '25', '26'],
        correct: '25',
        visual: '1️⃣8️⃣ + 7️⃣ = ?'
      },
      {
        id: 3,
        question: 'What is 14 + 19?',
        options: ['31', '32', '33', '34'],
        correct: '33',
        visual: '1️⃣4️⃣ + 1️⃣9️⃣ = ?'
      }
    ]
  },
  
  subtraction: {
    easy: [
      {
        id: 1,
        question: 'What is 5 - 2?',
        options: ['1', '2', '3', '4'],
        correct: '3',
        visual: '🍎🍎🍎🍎🍎 - 🍎🍎 = ?'
      },
      {
        id: 2,
        question: 'What is 8 - 3?',
        options: ['3', '4', '5', '6'],
        correct: '5',
        visual: '🍎🍎🍎🍎🍎🍎🍎🍎 - 🍎🍎🍎 = ?'
      },
      {
        id: 3,
        question: 'What is 6 - 4?',
        options: ['0', '1', '2', '3'],
        correct: '2',
        visual: '🍎🍎🍎🍎🍎🍎 - 🍎🍎🍎🍎 = ?'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'What is 12 - 5?',
        options: ['5', '6', '7', '8'],
        correct: '7',
        visual: '1️⃣2️⃣ - 5️⃣ = ?'
      },
      {
        id: 2,
        question: 'What is 15 - 8?',
        options: ['5', '6', '7', '8'],
        correct: '7',
        visual: '1️⃣5️⃣ - 8️⃣ = ?'
      },
      {
        id: 3,
        question: 'What is 14 - 6?',
        options: ['6', '7', '8', '9'],
        correct: '8',
        visual: '1️⃣4️⃣ - 6️⃣ = ?'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'What is 25 - 13?',
        options: ['10', '11', '12', '13'],
        correct: '12',
        visual: '2️⃣5️⃣ - 1️⃣3️⃣ = ?'
      },
      {
        id: 2,
        question: 'What is 32 - 17?',
        options: ['13', '14', '15', '16'],
        correct: '15',
        visual: '3️⃣2️⃣ - 1️⃣7️⃣ = ?'
      },
      {
        id: 3,
        question: 'What is 27 - 18?',
        options: ['7', '8', '9', '10'],
        correct: '9',
        visual: '2️⃣7️⃣ - 1️⃣8️⃣ = ?'
      },
    ]
  },
  
  counting: {
    easy: [
      {
        id: 1,
        question: 'How many apples are there?',
        options: ['3', '4', '5', '6'],
        correct: '5',
        visual: '🍎 🍎 🍎 🍎 🍎'
      },
      {
        id: 2,
        question: 'How many stars are there?',
        options: ['4', '5', '6', '7'],
        correct: '6',
        visual: '⭐ ⭐ ⭐ ⭐ ⭐ ⭐'
      },
      {
        id: 3,
        question: 'How many balls are there?',
        options: ['2', '3', '4', '5'],
        correct: '4',
        visual: '🏀 🏀 ⚽ 🏈'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'Count by 2s: 2, 4, 6, ___, 10',
        options: ['7', '8', '9', '12'],
        correct: '8',
        visual: '2️⃣ 4️⃣ 6️⃣ ___ 1️⃣0️⃣'
      },
      {
        id: 2,
        question: 'Count by 5s: 5, 10, 15, ____, 25',
        options: ['18', '19', '20', '22'],
        correct: '20',
        visual: '5️⃣ 1️⃣0️⃣ 1️⃣5️⃣ ___ 2️⃣5️⃣'
      },
      {
        id: 3,
        question: 'Count backward: 10, 9, 8, ___, 6',
        options: ['5', '6', '7', '11'],
        correct: '7',
        visual: '1️⃣0️⃣ 9️⃣ 8️⃣ ___ 6️⃣'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'Count by 3s: 3, 6, 9, ___, 15',
        options: ['10', '11', '12', '13'],
        correct: '12',
        visual: '3️⃣ 6️⃣ 9️⃣ ___ 1️⃣5️⃣'
      },
      {
        id: 2,
        question: 'Count backward from 30 by 5s: 30, 25, ___, 15, 10',
        options: ['18', '20', '22', '24'],
        correct: '20',
        visual: '3️⃣0️⃣ 2️⃣5️⃣ ___ 1️⃣5️⃣ 1️⃣0️⃣'
      },
      {
        id: 3,
        question: 'What comes between 45 and 47?',
        options: ['44', '46', '48', '50'],
        correct: '46',
        visual: '4️⃣5️⃣ ___ 4️⃣7️⃣'
      },
    ]
  },
  
  shapes: {
    easy: [
      {
        id: 1,
        question: 'What shape is this: ⭕?',
        options: ['Square', 'Triangle', 'Circle', 'Rectangle'],
        correct: 'Circle',
        visual: '⭕'
      },
      {
        id: 2,
        question: 'What shape has 3 sides?',
        options: ['Circle', 'Triangle', 'Square', 'Rectangle'],
        correct: 'Triangle',
        visual: '📐'
      },
      {
        id: 3,
        question: 'What shape is this: 🟦?',
        options: ['Square', 'Triangle', 'Circle', 'Oval'],
        correct: 'Square',
        visual: '🟦'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'How many sides does a rectangle have?',
        options: ['3', '4', '5', '6'],
        correct: '4',
        visual: '⬜'
      },
      {
        id: 2,
        question: 'Which shape has all sides of equal length?',
        options: ['Rectangle', 'Oval', 'Square', 'Diamond'],
        correct: 'Square',
        visual: '🟦'
      },
      {
        id: 3,
        question: 'What is a shape with 5 sides called?',
        options: ['Triangle', 'Rectangle', 'Hexagon', 'Pentagon'],
        correct: 'Pentagon',
        visual: '🔶'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'How many corners does a cube have?',
        options: ['4', '6', '8', '12'],
        correct: '8',
        visual: '🧊'
      },
      {
        id: 2,
        question: 'What 3D shape is made up of 6 squares?',
        options: ['Sphere', 'Cylinder', 'Cone', 'Cube'],
        correct: 'Cube',
        visual: '🧊'
      },
      {
        id: 3,
        question: 'What shape has 6 sides and 8 corners?',
        options: ['Cube', 'Sphere', 'Cylinder', 'Cone'],
        correct: 'Cube',
        visual: '🧊'
      },
    ]
  },
  
  time: {
    easy: [
      {
        id: 1,
        question: 'What time is shown? 🕓',
        options: ['4:00', '5:00', '6:00', '3:00'],
        correct: '4:00',
        visual: '🕓'
      },
      {
        id: 2,
        question: 'How many hours are in a day?',
        options: ['12', '24', '48', '60'],
        correct: '24',
        visual: '🕛🕛'
      },
      {
        id: 3,
        question: 'What time is shown? 🕘',
        options: ['7:00', '8:00', '9:00', '10:00'],
        correct: '9:00',
        visual: '🕘'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'How many minutes are in an hour?',
        options: ['30', '45', '60', '90'],
        correct: '60',
        visual: '⏰'
      },
      {
        id: 2,
        question: 'What time is 3 hours after 9:00?',
        options: ['11:00', '12:00', '1:00', '3:00'],
        correct: '12:00',
        visual: '9️⃣:0️⃣0️⃣ ➡️ ?'
      },
      {
        id: 3,
        question: 'How many days are in a week?',
        options: ['5', '6', '7', '10'],
        correct: '7',
        visual: '📅'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'If it is 3:15 now, what time will it be in 45 minutes?',
        options: ['3:45', '4:00', '4:15', '4:30'],
        correct: '4:00',
        visual: '3️⃣:1️⃣5️⃣ + 4️⃣5️⃣min = ?'
      },
      {
        id: 2,
        question: 'If it is 7:30 PM, what time was it 3 hours ago?',
        options: ['3:30 PM', '4:30 PM', '10:30 AM', '4:30 AM'],
        correct: '4:30 PM',
        visual: '7️⃣:3️⃣0️⃣ PM - 3️⃣hrs = ?'
      },
      {
        id: 3,
        question: 'How many minutes are in 2 hours and 30 minutes?',
        options: ['130', '145', '150', '180'],
        correct: '150',
        visual: '2️⃣hrs 3️⃣0️⃣min = ?min'
      },
    ]
  },
  
  measurement: {
    easy: [
      {
        id: 1,
        question: 'Which is longer? 📏 or 📏📏',
        options: ['They are the same', '📏', '📏📏', 'Cannot tell'],
        correct: '📏📏',
        visual: '📏 vs 📏📏'
      },
      {
        id: 2,
        question: 'Which is heavier, a feather or a rock?',
        options: ['Feather', 'Rock', 'They weigh the same', 'Cannot tell'],
        correct: 'Rock',
        visual: '🪶 vs 🪨'
      },
      {
        id: 3,
        question: 'Which container holds more liquid? 🥛 or 🏺',
        options: ['🥛', '🏺', 'They hold the same', 'Cannot tell'],
        correct: '🏺',
        visual: '🥛 vs 🏺'
      },
    ],
    medium: [
      {
        id: 1,
        question: 'How many centimeters are in a meter?',
        options: ['10', '100', '1,000', '10,000'],
        correct: '100',
        visual: '1️⃣m = ?cm'
      },
      {
        id: 2,
        question: 'Which unit would you use to measure the weight of an apple?',
        options: ['Meter', 'Liter', 'Gram', 'Second'],
        correct: 'Gram',
        visual: '🍎 = ?'
      },
      {
        id: 3,
        question: 'Which unit would you use to measure the volume of water?',
        options: ['Meter', 'Liter', 'Gram', 'Centimeter'],
        correct: 'Liter',
        visual: '💧 = ?'
      },
    ],
    hard: [
      {
        id: 1,
        question: 'How many milliliters are in 2 liters?',
        options: ['20', '200', '2,000', '20,000'],
        correct: '2,000',
        visual: '2️⃣L = ?mL'
      },
      {
        id: 2,
        question: 'If a ribbon is 50 cm long and you cut off 15 cm, how much is left?',
        options: ['25 cm', '35 cm', '45 cm', '65 cm'],
        correct: '35 cm',
        visual: '5️⃣0️⃣cm - 1️⃣5️⃣cm = ?cm'
      },
      {
        id: 3,
        question: 'If you have a 3 kg bag of apples and use 750 g for a pie, how many grams are left?',
        options: ['1,750 g', '2,250 g', '2,500 g', '3,750 g'],
        correct: '2,250 g',
        visual: '3️⃣kg - 7️⃣5️⃣0️⃣g = ?g'
      },
    ]
  }
};

// Helper function to get questions based on topic and difficulty
export const getQuestions = (topic, difficulty) => {
  const topicName = topic.name.toLowerCase();
  
  if (mathQuestions[topicName] && mathQuestions[topicName][difficulty]) {
    return mathQuestions[topicName][difficulty];
  }
  
  // Fallback to addition easy questions if topic or difficulty not found
  return mathQuestions.addition.easy;
};

export default mathQuestions;