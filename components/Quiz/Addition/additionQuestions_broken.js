// Addition quiz questions for all levels
// Each question includes: type, prompt, data (objects, numbers, words), correct answer, options (if applicable)

const additionQuestions = {
  easy: [
    // Picture-Based Addition (1-5)
    { type: 'picture-addition', prompt: 'How many apples are there in all?', data: { object: '🍎', left: 2, right: 1 }, answer: 3 },
    { type: 'picture-addition', prompt: 'How many stars are there in all?', data: { object: '⭐', left: 3, right: 2 }, answer: 5 },
    { type: 'picture-addition', prompt: 'How many balls are there in all?', data: { object: '⚽', left: 1, right: 2 }, answer: 3 },
    { type: 'picture-addition', prompt: 'How many flowers are there in all?', data: { object: '🌸', left: 2, right: 2 }, answer: 4 },
    { type: 'picture-addition', prompt: 'How many hearts are there in all?', data: { object: '❤️', left: 1, right: 3 }, answer: 4 },
    { type: 'picture-addition', prompt: 'How many suns are there in all?', data: { object: '☀️', left: 2, right: 2 }, answer: 4 },
    { type: 'picture-addition', prompt: 'How many books are there in all?', data: { object: '📚', left: 3, right: 1 }, answer: 4 },
    // Count and Add
    { type: 'count-add', prompt: 'Count and add. How many items are there in total?', data: { left: { object: '✏️', count: 2 }, right: { object: '🖍️', count: 3 } }, answer: 5 },
    { type: 'count-add', prompt: 'Count and add. How many items?', data: { left: { object: '🍪', count: 1 }, right: { object: '🍩', count: 2 } }, answer: 3 },
    { type: 'count-add', prompt: 'Count and add. Total items?', data: { left: { object: '🦋', count: 2 }, right: { object: '🐞', count: 2 } }, answer: 4 },
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '🚗', count: 1 }, right: { object: '🚕', count: 3 } }, answer: 4 },
    // Fill in the Missing Number
    { type: 'missing-number', prompt: '3 + 2 = ___', data: { left: 3, right: 2, total: null }, answer: 5 },
    { type: 'missing-number', prompt: '___ + 1 = 4', data: { left: null, right: 1, total: 4 }, answer: 3 },
    { type: 'missing-number', prompt: '2 + ___ = 5', data: { left: 2, right: null, total: 5 }, answer: 3 },
    { type: 'missing-number', prompt: '1 + ___ = 3', data: { left: 1, right: null, total: 3 }, answer: 2 },
    // Addition with Numerals and Words
    { type: 'numeral-word', prompt: '2 and 3 make ___', data: { left: 2, right: 3 }, answer: 5 },
    { type: 'numeral-word', prompt: 'One and four make ___', data: { left: 1, right: 4 }, answer: 5 },
    { type: 'numeral-word', prompt: 'Three and two make ___', data: { left: 3, right: 2 }, answer: 5 },
    { type: 'numeral-word', prompt: 'Four and one make ___', data: { left: 4, right: 1 }, answer: 5 },
    // Match Questions
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '2 + 1', total: 3 }, { pair: '3 + 2', total: 5 }, { pair: '1 + 4', total: 5 } ], options: [3, 5, 5], answer: [3, 5, 5] },
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '1 + 2', total: 3 }, { pair: '2 + 2', total: 4 }, { pair: '3 + 1', total: 4 } ], options: [3, 4, 4], answer: [3, 4, 4] }
  ],
  medium: [
    { type: 'picture-addition', prompt: 'How many bananas are there in all?', data: { object: '🍌', left: 4, right: 3 }, answer: 7 },
    { type: 'picture-addition', prompt: 'How many grapes are there in all?', data: { object: '🍇', left: 5, right: 2 }, answer: 7 },
    { type: 'picture-addition', prompt: 'How many cherries are there in all?', data: { object: '🍒', left: 4, right: 4 }, answer: 8 },
    { type: 'picture-addition', prompt: 'How many lemons are there in all?', data: { object: '🍋', left: 3, right: 5 }, answer: 8 },
    { type: 'picture-addition', prompt: 'How many carrots are there in all?', data: { object: '🥕', left: 6, right: 2 }, answer: 8 },
    { type: 'picture-addition', prompt: 'How many strawberries are there in all?', data: { object: '🍓', left: 5, right: 3 }, answer: 8 },
    // Count and Add
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '✏️', count: 4 }, right: { object: '🖍️', count: 3 } }, answer: 7 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🍪', count: 3 }, right: { object: '🍩', count: 4 } }, answer: 7 },
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '🦋', count: 5 }, right: { object: '🐞', count: 2 } }, answer: 7 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🚗', count: 2 }, right: { object: '🚕', count: 5 } }, answer: 7 },
    // Fill in the Missing Number
    { type: 'missing-number', prompt: '6 + 2 = ___', data: { left: 6, right: 2, total: null }, answer: 8 },
    { type: 'missing-number', prompt: '___ + 3 = 8', data: { left: null, right: 3, total: 8 }, answer: 5 },
    { type: 'missing-number', prompt: '4 + ___ = 7', data: { left: 4, right: null, total: 7 }, answer: 3 },
    { type: 'missing-number', prompt: '7 + ___ = 9', data: { left: 7, right: null, total: 9 }, answer: 2 },
    // Addition with Numerals and Words
    { type: 'numeral-word', prompt: 'Four and five make ___', data: { left: 4, right: 5 }, answer: 9 },
    { type: 'numeral-word', prompt: 'Six and three make ___', data: { left: 6, right: 3 }, answer: 9 },
    { type: 'numeral-word', prompt: 'Five and four make ___', data: { left: 5, right: 4 }, answer: 9 },
    { type: 'numeral-word', prompt: 'Seven and two make ___', data: { left: 7, right: 2 }, answer: 9 },
    // Match Questions
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '4 + 3', total: 7 }, { pair: '5 + 2', total: 7 }, { pair: '6 + 2', total: 8 } ], options: [7, 7, 8], answer: [7, 7, 8] },
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '3 + 5', total: 8 }, { pair: '4 + 4', total: 8 }, { pair: '2 + 6', total: 8 } ], options: [8, 8, 8], answer: [8, 8, 8] },
    // More for 20 total
    { type: 'picture-addition', prompt: 'How many eggs are there in all?', data: { object: '🥚', left: 4, right: 4 }, answer: 8 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🧃', count: 5 }, right: { object: '🥤', count: 3 } }, answer: 8 },
    { type: 'missing-number', prompt: '___ + 4 = 8', data: { left: null, right: 4, total: 8 }, answer: 4 },
    { type: 'numeral-word', prompt: 'Eight and zero make ___', data: { left: 8, right: 0 }, answer: 8 },
    { type: 'picture-addition', prompt: 'How many lions are there in all?', data: { object: '🦁', left: 6, right: 2 }, answer: 8 },
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '🐯', count: 5 }, right: { object: '🦁', count: 3 } }, answer: 8 },
    { type: 'missing-number', prompt: '5 + ___ = 9', data: { left: 5, right: null, total: 9 }, answer: 4 },
    { type: 'numeral-word', prompt: 'Seven and one make ___', data: { left: 7, right: 1 }, answer: 8 },
    { type: 'picture-addition', prompt: 'How many tigers are there in all?', data: { object: '🐯', left: 5, right: 3 }, answer: 8 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🍏', count: 4 }, right: { object: '🍎', count: 4 } }, answer: 8 },
    { type: 'missing-number', prompt: '___ + 6 = 8', data: { left: null, right: 6, total: 8 }, answer: 2 },
    { type: 'numeral-word', prompt: 'Six and two make ___', data: { left: 6, right: 2 }, answer: 8 },

  hard: [
    // Word problems, sums to 10, subtraction prep
    { type: 'word-problem', prompt: 'Tom has 7 pencils and gives 2 to Anna. How many pencils does Tom have left?', data: { start: 7, given: 2 }, answer: 5 },
    { type: 'word-problem', prompt: 'Sara has 9 apples. She eats 3. How many apples left?', data: { start: 9, taken: 3 }, answer: 6 },
    { type: 'word-problem', prompt: 'Ben has 6 candies and gets 4 more. How many candies does he have now?', data: { start: 6, added: 4 }, answer: 10 },
    { type: 'word-problem', prompt: 'Lily has 8 balloons. 2 fly away. How many left?', data: { start: 8, taken: 2 }, answer: 6 },
    { type: 'word-problem', prompt: 'Mia has 5 oranges and finds 3 more. How many in total?', data: { start: 5, added: 3 }, answer: 8 },
    { type: 'word-problem', prompt: 'Anna has 10 marbles. She gives 4 to Tom. How many left?', data: { start: 10, given: 4 }, answer: 6 },
    { type: 'word-problem', prompt: 'Sam has 7 cookies. He eats 2. How many left?', data: { start: 7, taken: 2 }, answer: 5 },
    { type: 'word-problem', prompt: 'Eva has 4 pencils and gets 5 more. How many pencils now?', data: { start: 4, added: 5 }, answer: 9 },
    // Fill in the Missing Number (hard)
    { type: 'missing-number', prompt: '___ + 5 = 10', data: { left: null, right: 5, total: 10 }, answer: 5 },
    { type: 'missing-number', prompt: '6 + ___ = 10', data: { left: 6, right: null, total: 10 }, answer: 4 },
    { type: 'missing-number', prompt: '___ + 7 = 9', data: { left: null, right: 7, total: 9 }, answer: 2 },
    { type: 'missing-number', prompt: '8 + ___ = 10', data: { left: 8, right: null, total: 10 }, answer: 2 },
    // Numeral/word (hard)
    { type: 'numeral-word', prompt: 'Nine and one make ___', data: { left: 9, right: 1 }, answer: 10 },
    { type: 'numeral-word', prompt: 'Eight and two make ___', data: { left: 8, right: 2 }, answer: 10 },
    { type: 'numeral-word', prompt: 'Seven and three make ___', data: { left: 7, right: 3 }, answer: 10 },
    { type: 'numeral-word', prompt: 'Ten and zero make ___', data: { left: 10, right: 0 }, answer: 10 },
    // Match (hard)
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '5 + 5', total: 10 }, { pair: '8 + 2', total: 10 }, { pair: '6 + 4', total: 10 } ], options: [10, 10, 10], answer: [10, 10, 10] },
    { type: 'match', prompt: 'Match the sum to the answer', data: [ { pair: '7 + 2', total: 9 }, { pair: '4 + 5', total: 9 }, { pair: '6 + 3', total: 9 } ], options: [9, 9, 9], answer: [9, 9, 9] },
    // Picture-addition (hard)
    { type: 'picture-addition', prompt: 'How many crowns are there in all?', data: { object: '👑', left: 6, right: 4 }, answer: 10 },
    { type: 'picture-addition', prompt: 'How many moons are there in all?', data: { object: '🌙', left: 7, right: 3 }, answer: 10 },
    { type: 'picture-addition', prompt: 'How many stars are there in all?', data: { object: '⭐', left: 8, right: 2 }, answer: 10 },
    { type: 'picture-addition', prompt: 'How many suns are there in all?', data: { object: '☀️', left: 9, right: 1 }, answer: 10 },
    // Count and add (hard)
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '🍕', count: 6 }, right: { object: '🍔', count: 4 } }, answer: 10 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🍟', count: 7 }, right: { object: '🌭', count: 3 } }, answer: 10 },
    { type: 'count-add', prompt: 'Count and add. How many?', data: { left: { object: '🍎', count: 8 }, right: { object: '🍏', count: 2 } }, answer: 10 },
    { type: 'count-add', prompt: 'Count and add. Total?', data: { left: { object: '🍉', count: 5 }, right: { object: '🍇', count: 5 } }, answer: 10 },
  ]
};

export default additionQuestions;
