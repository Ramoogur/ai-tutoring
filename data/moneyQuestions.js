// Mauritian coins for Grade 1: 1c, 5c, Rs1, Rs5, Rs10
export const mauritianCoins = {
  '1c': { value: 0.01, display: '1c', type: 'cent', image: '1c-coin' },
  '5c': { value: 0.05, display: '5c', type: 'cent', image: '5c-coin' },
  'Rs1': { value: 1.00, display: 'Rs 1', type: 'rupee', image: 'rs1-coin' },
  'Rs5': { value: 5.00, display: 'Rs 5', type: 'rupee', image: 'rs5-coin' },
  'Rs10': { value: 10.00, display: 'Rs 10', type: 'rupee', image: 'rs10-coin' }
};

export const coinNames = {
  '1c': '1-cent coin',
  '5c': '5-cent coin', 
  'Rs1': '1-rupee coin',
  'Rs5': '5-rupee coin',
  'Rs10': '10-rupee coin'
};

export const moneyQuestions = [
  // EASY LEVEL (12 questions)
  {
    "id": "money-easy-001",
    "level": "easy",
    "type": "coin_select",
    "prompt_en": "Tap the 5-cent coin.",
    "prompt_fr": "Tape sur la pièce de 5 sous.",
    "choices": ["1c", "5c", "Rs1", "Rs5"],
    "answer": ["5c"]
  },
  {
    "id": "money-easy-002", 
    "level": "easy",
    "type": "coin_select",
    "prompt_en": "Circle the 1-rupee coin.",
    "prompt_fr": "Entoure la pièce de 1 roupie.",
    "choices": ["Rs1", "5c", "1c", "Rs5"],
    "answer": ["Rs1"]
  },
  {
    "id": "money-easy-003",
    "level": "easy",
    "type": "coin_select", 
    "prompt_en": "Tick the 10-rupee coin.",
    "prompt_fr": "Coche la pièce de 10 roupies.",
    "choices": ["Rs10", "Rs5", "Rs1", "5c"],
    "answer": ["Rs10"]
  },
  {
    "id": "money-easy-004",
    "level": "easy",
    "type": "coin_select",
    "prompt_en": "Cross the 1-cent coin.",
    "prompt_fr": "Barre la pièce de 1 sou.",
    "choices": ["1c", "5c", "Rs1", "Rs5"],
    "answer": ["1c"]
  },
  {
    "id": "money-easy-005",
    "level": "easy",
    "type": "match",
    "prompt_en": "Match each coin to its name.",
    "prompt_fr": "Relie chaque pièce à son nom.",
    "left": ["1c", "5c", "Rs1"],
    "right": ["1-cent coin", "5-cent coin", "1-rupee coin"],
    "pairs": [["1c", "1-cent coin"], ["5c", "5-cent coin"], ["Rs1", "1-rupee coin"]]
  },
  {
    "id": "money-easy-006",
    "level": "easy",
    "type": "match",
    "prompt_en": "Match each coin to its name.",
    "prompt_fr": "Relie chaque pièce à son nom.",
    "left": ["Rs5", "Rs10", "1c"],
    "right": ["5-rupee coin", "10-rupee coin", "1-cent coin"],
    "pairs": [["Rs5", "5-rupee coin"], ["Rs10", "10-rupee coin"], ["1c", "1-cent coin"]]
  },
  {
    "id": "money-easy-007",
    "level": "easy",
    "type": "odd_one_out",
    "prompt_en": "Which one is NOT a 1-rupee coin?",
    "prompt_fr": "Laquelle n'est PAS une pièce de 1 roupie?",
    "choices": ["Rs1", "Rs1", "Rs5"],
    "answer": ["Rs5"]
  },
  {
    "id": "money-easy-008",
    "level": "easy",
    "type": "odd_one_out", 
    "prompt_en": "Which one is NOT a 5-cent coin?",
    "prompt_fr": "Laquelle n'est PAS une pièce de 5 sous?",
    "choices": ["5c", "5c", "1c"],
    "answer": ["1c"]
  },
  {
    "id": "money-easy-009",
    "level": "easy",
    "type": "name_coin",
    "prompt_en": "What is the name of this coin?",
    "prompt_fr": "Quel est le nom de cette pièce?",
    "coin": "Rs5",
    "choices": ["1-rupee coin", "5-rupee coin", "10-rupee coin", "5-cent coin"],
    "answer": "5-rupee coin"
  },
  {
    "id": "money-easy-010",
    "level": "easy",
    "type": "name_coin",
    "prompt_en": "What is the name of this coin?",
    "prompt_fr": "Quel est le nom de cette pièce?",
    "coin": "1c",
    "choices": ["1-cent coin", "5-cent coin", "1-rupee coin", "5-rupee coin"],
    "answer": "1-cent coin"
  },
  {
    "id": "money-easy-011",
    "level": "easy",
    "type": "coin_select",
    "prompt_en": "Find the 5-rupee coin.",
    "prompt_fr": "Trouve la pièce de 5 roupies.",
    "choices": ["Rs5", "Rs1", "Rs10", "5c"],
    "answer": ["Rs5"]
  },
  {
    "id": "money-easy-012",
    "level": "easy",
    "type": "coin_select",
    "prompt_en": "Point to the 5-cent coin.",
    "prompt_fr": "Montre la pièce de 5 sous.",
    "choices": ["5c", "1c", "Rs1", "Rs5"],
    "answer": ["5c"]
  },

  // MEDIUM LEVEL (12 questions)
  {
    "id": "money-medium-001",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 7.",
    "prompt_fr": "Choisis des pièces pour faire Rs 7.",
    "allowed_coins": ["Rs1", "Rs5", "1c", "5c"],
    "target": {"rupees": 7, "cents": 0},
    "valid_sets": [["Rs5", "Rs1", "Rs1"]]
  },
  {
    "id": "money-medium-002",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Drag the coins to pay Rs 10.",
    "prompt_fr": "Glisse les pièces pour payer Rs 10.",
    "allowed_coins": ["Rs5", "Rs10", "Rs1"],
    "target": {"rupees": 10, "cents": 0},
    "valid_sets": [["Rs10"], ["Rs5", "Rs5"]]
  },
  {
    "id": "money-medium-003",
    "level": "medium",
    "type": "fill_sum",
    "prompt_en": "5 c + 1 c = __",
    "prompt_fr": "5 c + 1 c = __",
    "answer_text": "6 c",
    "choices": ["6 c", "4 c", "5 c", "7 c"]
  },
  {
    "id": "money-medium-004",
    "level": "medium",
    "type": "fill_sum",
    "prompt_en": "Rs 5 + Rs 1 = __",
    "prompt_fr": "Rs 5 + Rs 1 = __",
    "answer_text": "Rs 6",
    "choices": ["Rs 6", "Rs 4", "Rs 5", "Rs 7"]
  },
  {
    "id": "money-medium-005",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 6.",
    "prompt_fr": "Choisis des pièces pour faire Rs 6.",
    "allowed_coins": ["Rs1", "Rs5"],
    "target": {"rupees": 6, "cents": 0},
    "valid_sets": [["Rs5", "Rs1"], ["Rs1", "Rs1", "Rs1", "Rs1", "Rs1", "Rs1"]]
  },
  {
    "id": "money-medium-006",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Make 6 cents using coins.",
    "prompt_fr": "Fais 6 sous avec des pièces.",
    "allowed_coins": ["1c", "5c"],
    "target": {"rupees": 0, "cents": 6},
    "valid_sets": [["5c", "1c"], ["1c", "1c", "1c", "1c", "1c", "1c"]]
  },
  {
    "id": "money-medium-007",
    "level": "medium",
    "type": "fill_sum",
    "prompt_en": "Rs 1 + Rs 1 + Rs 1 = __",
    "prompt_fr": "Rs 1 + Rs 1 + Rs 1 = __",
    "answer_text": "Rs 3",
    "choices": ["Rs 3", "Rs 2", "Rs 4", "Rs 1"]
  },
  {
    "id": "money-medium-008",
    "level": "medium",
    "type": "missing_coin",
    "prompt_en": "Which coin is missing? Rs 5 + __ = Rs 6",
    "prompt_fr": "Quelle pièce manque ? Rs 5 + __ = Rs 6",
    "choices": ["Rs1", "Rs5", "1c", "5c"],
    "answer": ["Rs1"]
  },
  {
    "id": "money-medium-009",
    "level": "medium",
    "type": "missing_coin",
    "prompt_en": "Which coin is missing? 5 c + __ = 6 c",
    "prompt_fr": "Quelle pièce manque ? 5 c + __ = 6 c",
    "choices": ["1c", "5c", "Rs1", "Rs5"],
    "answer": ["1c"]
  },
  {
    "id": "money-medium-010",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 3.",
    "prompt_fr": "Choisis des pièces pour faire Rs 3.",
    "allowed_coins": ["Rs1", "Rs5"],
    "target": {"rupees": 3, "cents": 0},
    "valid_sets": [["Rs1", "Rs1", "Rs1"]]
  },
  {
    "id": "money-medium-011",
    "level": "medium",
    "type": "fill_sum",
    "prompt_en": "Rs 5 + Rs 5 = __",
    "prompt_fr": "Rs 5 + Rs 5 = __",
    "answer_text": "Rs 10",
    "choices": ["Rs 10", "Rs 5", "Rs 15", "Rs 0"]
  },
  {
    "id": "money-medium-012",
    "level": "medium",
    "type": "make_amount",
    "prompt_en": "Make 4 cents using coins.",
    "prompt_fr": "Fais 4 sous avec des pièces.",
    "allowed_coins": ["1c", "5c"],
    "target": {"rupees": 0, "cents": 4},
    "valid_sets": [["1c", "1c", "1c", "1c"]]
  },

  // HARD LEVEL (12 questions)
  {
    "id": "money-hard-001",
    "level": "hard",
    "type": "coin_select",
    "prompt_en": "Ring the correct coin to pay for the sticker (Rs 1).",
    "prompt_fr": "Entoure la pièce correcte pour payer l'autocollant (Rs 1).",
    "choices": ["1c", "5c", "Rs1", "Rs5"],
    "answer": ["Rs1"]
  },
  {
    "id": "money-hard-002",
    "level": "hard",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 4.",
    "prompt_fr": "Choisis des pièces pour faire Rs 4.",
    "allowed_coins": ["Rs1", "Rs5"],
    "target": {"rupees": 4, "cents": 0},
    "valid_sets": [["Rs1", "Rs1", "Rs1", "Rs1"]]
  },
  {
    "id": "money-hard-003",
    "level": "hard",
    "type": "missing_coin",
    "prompt_en": "Which coin is missing? Rs 5 + __ = Rs 10",
    "prompt_fr": "Quelle pièce manque ? Rs 5 + __ = Rs 10",
    "choices": ["Rs1", "Rs5", "1c", "5c"],
    "answer": ["Rs5"]
  },
  {
    "id": "money-hard-004",
    "level": "hard",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 8.",
    "prompt_fr": "Choisis des pièces pour faire Rs 8.",
    "allowed_coins": ["Rs1", "Rs5", "Rs10"],
    "target": {"rupees": 8, "cents": 0},
    "valid_sets": [["Rs5", "Rs1", "Rs1", "Rs1"]]
  },
  {
    "id": "money-hard-005",
    "level": "hard",
    "type": "fill_sum",
    "prompt_en": "Rs 1 + Rs 1 + Rs 1 + Rs 1 = __",
    "prompt_fr": "Rs 1 + Rs 1 + Rs 1 + Rs 1 = __",
    "answer_text": "Rs 4",
    "choices": ["Rs 4", "Rs 3", "Rs 5", "Rs 2"]
  },
  {
    "id": "money-hard-006",
    "level": "hard",
    "type": "coin_select",
    "prompt_en": "Ring the correct coin to pay for the toy (Rs 5).",
    "prompt_fr": "Entoure la pièce correcte pour payer le jouet (Rs 5).",
    "choices": ["Rs1", "Rs5", "Rs10", "5c"],
    "answer": ["Rs5"]
  },
  {
    "id": "money-hard-007",
    "level": "hard",
    "type": "make_amount",
    "prompt_en": "Choose coins to make Rs 9.",
    "prompt_fr": "Choisis des pièces pour faire Rs 9.",
    "allowed_coins": ["Rs1", "Rs5"],
    "target": {"rupees": 9, "cents": 0},
    "valid_sets": [["Rs5", "Rs1", "Rs1", "Rs1", "Rs1"]]
  },
  {
    "id": "money-hard-008",
    "level": "hard",
    "type": "missing_coin",
    "prompt_en": "Which coin is missing? Rs 1 + Rs 1 + __ = Rs 4",
    "prompt_fr": "Quelle pièce manque ? Rs 1 + Rs 1 + __ = Rs 4",
    "choices": ["Rs1", "Rs2", "Rs5", "1c"],
    "answer": ["Rs1", "Rs1"]
  },
  {
    "id": "money-hard-009",
    "level": "hard",
    "type": "fill_sum",
    "prompt_en": "Rs 10 - Rs 5 = __",
    "prompt_fr": "Rs 10 - Rs 5 = __",
    "answer_text": "Rs 5",
    "choices": ["Rs 5", "Rs 15", "Rs 0", "Rs 10"]
  },
  {
    "id": "money-hard-010",
    "level": "hard",
    "type": "make_amount",
    "prompt_en": "Make 7 cents using coins.",
    "prompt_fr": "Fais 7 sous avec des pièces.",
    "allowed_coins": ["1c", "5c"],
    "target": {"rupees": 0, "cents": 7},
    "valid_sets": [["5c", "1c", "1c"]]
  },
  {
    "id": "money-hard-011",
    "level": "hard",
    "type": "coin_select",
    "prompt_en": "Ring the correct coin to pay for the book (Rs 10).",
    "prompt_fr": "Entoure la pièce correcte pour payer le livre (Rs 10).",
    "choices": ["Rs5", "Rs10", "Rs1", "5c"],
    "answer": ["Rs10"]
  },
  {
    "id": "money-hard-012",
    "level": "hard",
    "type": "missing_coin",
    "prompt_en": "Which coin is missing? __ + Rs 1 + Rs 1 = Rs 7",
    "prompt_fr": "Quelle pièce manque ? __ + Rs 1 + Rs 1 = Rs 7",
    "choices": ["Rs5", "Rs1", "Rs10", "5c"],
    "answer": ["Rs5"]
  }
];

// Helper function to get questions by difficulty
export const getQuestionsByDifficulty = (difficulty) => {
  return moneyQuestions.filter(q => q.level === difficulty);
};

// Helper function to get coin value
export const getCoinValue = (coinType) => {
  return mauritianCoins[coinType]?.value || 0;
};

// Helper function to calculate coin total
export const calculateCoinTotal = (coins) => {
  return coins.reduce((total, coin) => {
    const value = getCoinValue(coin);
    return total + value;
  }, 0);
};

export const calculateCoinTotalFromCounts = (counts) => {
  return Object.entries(counts).reduce((total, [coin, count]) => {
    const value = getCoinValue(coin);
    return total + (value * count);
  }, 0);
};

// Helper function to format money display
export const formatMoney = (amount) => {
  if (amount >= 1) {
    return `Rs ${amount}`;
  } else {
    return `${Math.round(amount * 100)} c`;
  }
};
