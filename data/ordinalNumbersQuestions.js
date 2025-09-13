// Ordinal Numbers Questions for Grade 1
// Covers: recognise and use ordinal numbers up to 5th, left/right positioning

export const ordinalNumbersQuestions = {
  easy: [
    {
      id: 1,
      question_type: "select",
      question: "From the LEFT, which animal is 1st?",
      starting_point: "left",
      items: ["🐶", "🐱", "🐰", "🐸", "🐦"],
      item_labels: ["Dog", "Cat", "Rabbit", "Frog", "Bird"],
      correct_answer: "🐶",
      explanation: "The dog is first when counting from the left."
    },
    {
      id: 2,
      question_type: "select",
      question: "From the RIGHT, which child is 2nd?",
      starting_point: "right",
      items: ["Anna", "Ben", "Chen", "Dia", "Eli"],
      correct_answer: "Dia",
      explanation: "When counting from the right, Dia is second."
    },
    {
      id: 3,
      question_type: "coloring_instruction",
      question: "Color the 3rd clown red and circle the 1st clown.",
      items: ["🤡", "🤡", "🤡", "🤡", "🤡"],
      starting_point: "left",
      color_target: 3,
      circle_target: 1,
      color_instruction: "red",
      explanation: "The third clown gets colored red, and the first clown gets circled."
    },
    {
      id: 4,
      question_type: "fill_blank",
      question: "Fill in the missing ordinal number: 1st, 2nd, ____, 4th, 5th",
      sequence: ["1st", "2nd", "", "4th", "5th"],
      blank_position: 2,
      correct_answer: "3rd",
      explanation: "The missing ordinal number is 3rd."
    },
    {
      id: 5,
      question_type: "match_words_symbols",
      question: "Match the ordinal words with their symbols",
      pairs: [
        { word: "first", symbol: "1st" },
        { word: "second", symbol: "2nd" },
        { word: "third", symbol: "3rd" }
      ],
      explanation: "Match each word with its correct symbol."
    }
  ],
  medium: [
    {
      id: 6,
      question_type: "drag_order",
      question: "Rank the race! Drag the runners to their finishing positions.",
      runners: ["Alex", "Maya", "Sam", "Zoe", "Jake"],
      finishing_order: ["Maya", "Jake", "Alex", "Zoe", "Sam"],
      explanation: "Drag each runner to their correct finishing position on the podium."
    },
    {
      id: 7,
      question_type: "select",
      question: "From the LEFT, which car is 4th?",
      starting_point: "left",
      items: ["🚗", "🚙", "🚕", "🚐", "🚘"],
      item_labels: ["Red Car", "Blue SUV", "Yellow Taxi", "Green Van", "White Car"],
      correct_answer: "🚐",
      explanation: "The green van is fourth when counting from the left."
    },
    {
      id: 8,
      question_type: "start_point_challenge",
      question: "Answer both: From LEFT and from RIGHT",
      items: ["🎈", "🎈", "🎈", "🎈", "🎈"],
      item_colors: ["red", "blue", "green", "yellow", "purple"],
      left_question: "From LEFT, which balloon is 3rd?",
      right_question: "From RIGHT, which balloon is 2nd?",
      left_answer: "green",
      right_answer: "yellow",
      explanation: "From left: green is 3rd. From right: yellow is 2nd."
    },
    {
      id: 9,
      question_type: "fill_blank",
      question: "Complete the sequence: 1st, ____, 3rd, 4th, 5th",
      sequence: ["1st", "", "3rd", "4th", "5th"],
      blank_position: 1,
      correct_answer: "2nd",
      explanation: "The missing ordinal number is 2nd."
    },
    {
      id: 10,
      question_type: "coloring_instruction",
      question: "Color the 5th flower blue and circle the 2nd flower.",
      items: ["🌸", "🌸", "🌸", "🌸", "🌸"],
      starting_point: "left",
      color_target: 5,
      circle_target: 2,
      color_instruction: "blue",
      explanation: "The fifth flower gets colored blue, and the second flower gets circled."
    }
  ],
  hard: [
    {
      id: 11,
      question_type: "select",
      question: "From the RIGHT, which shape is 5th?",
      starting_point: "right",
      items: ["⭐", "🔵", "🔺", "⬜", "❤️"],
      item_labels: ["Star", "Circle", "Triangle", "Square", "Heart"],
      correct_answer: "⭐",
      explanation: "The star is fifth when counting from the right."
    },
    {
      id: 12,
      question_type: "drag_order",
      question: "Bus route challenge! Drop ordinal badges onto the 5 stops.",
      stops: ["Park", "School", "Mall", "Hospital", "Home"],
      badges: ["1st", "2nd", "3rd", "4th", "5th"],
      correct_order: ["1st", "2nd", "3rd", "4th", "5th"],
      explanation: "Place the ordinal badges in the correct order on each bus stop."
    },
    {
      id: 13,
      question_type: "start_point_challenge",
      question: "Double challenge: LEFT and RIGHT starting points",
      items: ["🚂", "🚂", "🚂", "🚂", "🚂"],
      item_colors: ["red", "blue", "green", "yellow", "orange"],
      left_question: "From LEFT, which train is 5th?",
      right_question: "From RIGHT, which train is 1st?",
      left_answer: "orange",
      right_answer: "orange",
      explanation: "From left: orange is 5th. From right: orange is 1st."
    },
    {
      id: 14,
      question_type: "match_words_symbols",
      question: "Complete the spelling and match: f__r_h matches with ____",
      word_completion: "f__r_h",
      completed_word: "fourth",
      symbol_match: "4th",
      pairs: [
        { word: "fourth", symbol: "4th" },
        { word: "fifth", symbol: "5th" }
      ],
      explanation: "Complete 'fourth' and match it with '4th'."
    },
    {
      id: 15,
      question_type: "fill_blank",
      question: "Fill the tricky sequence: ____, 2nd, 3rd, ____, 5th",
      sequence: ["", "2nd", "3rd", "", "5th"],
      blank_positions: [0, 3],
      correct_answers: ["1st", "4th"],
      explanation: "The missing ordinal numbers are 1st and 4th."
    }
  ]
};

// Helper data for rendering
export const ordinalWords = {
  "1st": "first",
  "2nd": "second", 
  "3rd": "third",
  "4th": "fourth",
  "5th": "fifth"
};

export const ordinalSymbols = {
  "first": "1st",
  "second": "2nd",
  "third": "3rd", 
  "fourth": "4th",
  "fifth": "5th"
};

export const colors = [
  "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown"
];

export const keypadNumbers = ["1st", "2nd", "3rd", "4th", "5th"];
