// Interactive patterns exercises for Grade 1 students
// Following Mauritius curriculum: recognise, complete and create patterns (shapes & numbers)

export const patternsQuestions = {
  easy: [
    // 1. Pick the rule (ABAB vs AABB): show 3 short strips; "Tick the correct pattern."
    {
      id: "PAT-001",
      type: "choose-correct-pattern",
      category: "pattern-recognition",
      question: "Tick the strip that follows ABAB pattern",
      prompt: "Look at these patterns. Which one goes: circle, square, circle, square?",
      strips: [
        [
          { shape: "circle", color: "#4CAF50" },
          { shape: "square", color: "#2196F3" },
          { shape: "circle", color: "#4CAF50" },
          { shape: "square", color: "#2196F3" }
        ],
        [
          { shape: "circle", color: "#4CAF50" },
          { shape: "circle", color: "#4CAF50" },
          { shape: "square", color: "#2196F3" },
          { shape: "square", color: "#2196F3" }
        ],
        [
          { shape: "circle", color: "#4CAF50" },
          { shape: "square", color: "#2196F3" },
          { shape: "square", color: "#2196F3" },
          { shape: "circle", color: "#4CAF50" }
        ]
      ],
      correct: 0,
      rule: "ABAB",
      explain_kid: "The pattern goes one circle, one square, and again circle, square.",
      visual: true
    },

    // 2. Continue with 2 more items (ABAB, ABC): drag 2 tiles to finish the strip
    {
      id: "PAT-002", 
      type: "complete-pattern-drag",
      category: "pattern-completion",
      question: "Drag 2 tiles to complete the pattern",
      given: [
        { shape: "triangle", color: "#FF9800" },
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#4CAF50" },
        { shape: "triangle", color: "#FF9800" },
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#4CAF50" }
      ],
      options: [
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#4CAF50" },
        { shape: "square", color: "#2196F3" }
      ],
      needs: 2,
      answer: [
        { shape: "triangle", color: "#FF9800" },
        { shape: "triangle", color: "#FF9800" }
      ],
      rule: "AAB repeats",
      explain_kid: "Two triangles then one circle, then repeat!",
      visual: true
    },

    // 3. Size/color patterns: big–small–big–small (use large images)
    {
      id: "PAT-003",
      type: "size-pattern",
      category: "size-patterns", 
      question: "Continue the big-small pattern",
      given: [
        { shape: "circle", color: "#F44336", size: "big" },
        { shape: "circle", color: "#F44336", size: "small" },
        { shape: "circle", color: "#F44336", size: "big" },
        { shape: "circle", color: "#F44336", size: "small" }
      ],
      options: [
        { shape: "circle", color: "#F44336", size: "big" },
        { shape: "circle", color: "#F44336", size: "small" }
      ],
      needs: 1,
      answer: [{ shape: "circle", color: "#F44336", size: "big" }],
      rule: "big-small repeats",
      explain_kid: "Big circle, small circle, big circle, small circle... what comes next?",
      visual: true
    },

    // 4. Shape patterns with 2D shapes (circle–square–circle–…): aligns with shapes strand
    {
      id: "PAT-004",
      type: "shape-pattern",
      category: "shape-patterns",
      question: "What shape comes next in this pattern?",
      given: [
        { shape: "circle", color: "#2196F3" },
        { shape: "square", color: "#4CAF50" },
        { shape: "circle", color: "#2196F3" },
        { shape: "square", color: "#4CAF50" },
        { shape: "circle", color: "#2196F3" }
      ],
      options: [
        { shape: "square", color: "#4CAF50" },
        { shape: "circle", color: "#2196F3" },
        { shape: "triangle", color: "#FF9800" }
      ],
      correct: 0,
      rule: "circle-square repeats",
      explain_kid: "Circle, square, circle, square... next is square!",
      visual: true
    },

    // 5. Number patterns (forward 0–10): fill the next box (…7, 8, 9, __)
    {
      id: "PAT-005",
      type: "number-pattern-next",
      category: "number-patterns",
      question: "What number comes next?",
      sequence: [6, 7, 8, 9],
      choices: [10, 5, 11],
      correct: 0,
      answer: 10,
      rule: "counting forward",
      explain_kid: "After 9 comes 10 when we count forward!",
      visual: true
    },

    // 6. Color pattern recognition - red, blue, red, blue
    {
      id: "PAT-006E",
      type: "choose-correct-pattern",
      category: "color-patterns",
      question: "Which pattern shows red, blue, red, blue?",
      prompt: "Find the pattern that goes: red circle, blue circle, red circle, blue circle",
      strips: [
        [
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#2196F3" },
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#2196F3" }
        ],
        [
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#2196F3" },
          { shape: "circle", color: "#2196F3" }
        ],
        [
          { shape: "circle", color: "#2196F3" },
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#2196F3" },
          { shape: "circle", color: "#F44336" }
        ]
      ],
      correct: 0,
      rule: "red-blue alternating",
      explain_kid: "Red, blue, red, blue - the colors take turns!",
      visual: true
    },

    // Continue adding 19 more easy questions (7-25)
    {
      id: "PAT-007E",
      type: "complete-pattern-drag",
      category: "pattern-completion",
      question: "Drag 1 tile to complete the ABC pattern",
      given: [
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" },
        { shape: "triangle", color: "#4CAF50" },
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" }
      ],
      options: [
        { shape: "triangle", color: "#4CAF50" },
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" }
      ],
      needs: 1,
      answer: [{ shape: "triangle", color: "#4CAF50" }],
      rule: "circle-square-triangle repeats",
      explain_kid: "Circle, square, triangle, then repeat!",
      visual: true
    },

    {
      id: "PAT-008E",
      type: "size-pattern",
      category: "size-patterns",
      question: "Continue the small-big pattern",
      given: [
        { shape: "square", color: "#4CAF50", size: "small" },
        { shape: "square", color: "#4CAF50", size: "big" },
        { shape: "square", color: "#4CAF50", size: "small" },
        { shape: "square", color: "#4CAF50", size: "big" }
      ],
      options: [
        { shape: "square", color: "#4CAF50", size: "small" },
        { shape: "square", color: "#4CAF50", size: "big" }
      ],
      needs: 1,
      answer: [{ shape: "square", color: "#4CAF50", size: "small" }],
      rule: "small-big repeats",
      explain_kid: "Small square, big square, small square, big square... what's next?",
      visual: true
    },

    {
      id: "PAT-009E",
      type: "shape-pattern",
      category: "shape-patterns",
      question: "What shape comes next?",
      given: [
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#9C27B0" },
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#9C27B0" }
      ],
      options: [
        { shape: "triangle", color: "#FF9800" },
        { shape: "circle", color: "#9C27B0" },
        { shape: "square", color: "#2196F3" }
      ],
      correct: 0,
      rule: "triangle-circle repeats",
      explain_kid: "Triangle, circle, triangle, circle... next is triangle!",
      visual: true
    },

    {
      id: "PAT-010E",
      type: "number-pattern-next",
      category: "number-patterns",
      question: "What number comes next?",
      sequence: [1, 2, 3, 4],
      choices: [5, 0, 3],
      correct: 0,
      answer: 5,
      rule: "counting forward",
      explain_kid: "1, 2, 3, 4... next is 5!",
      visual: true
    }
  ],

  medium: [
    // 6. Complete the pattern with tracing (dotted outline to guide motor skills)
    {
      id: "PAT-006",
      type: "complete-pattern-trace",
      category: "pattern-tracing",
      question: "Trace the dotted shapes to complete the pattern",
      given: [
        { shape: "triangle", color: "#FF9800", traced: false },
        { shape: "square", color: "#2196F3", traced: false },
        { shape: "triangle", color: "#FF9800", traced: false },
        { shape: "square", color: "#2196F3", traced: false }
      ],
      toTrace: [
        { shape: "triangle", color: "#FF9800", traced: true },
        { shape: "square", color: "#2196F3", traced: true }
      ],
      rule: "triangle-square repeats",
      explain_kid: "Trace the dotted shapes to continue: triangle, square, triangle, square...",
      visual: true,
      interactive: true
    },

    // 7. Fix the mistake: one tile breaks the rule—tap the odd one out
    {
      id: "PAT-007",
      type: "fix-the-mistake",
      category: "error-detection",
      question: "Tap the shape that breaks the rule",
      strip: [
        { shape: "circle", color: "#4CAF50", size: "big" },
        { shape: "circle", color: "#4CAF50", size: "small" },
        { shape: "circle", color: "#4CAF50", size: "big" },
        { shape: "circle", color: "#4CAF50", size: "small" },
        { shape: "circle", color: "#4CAF50", size: "small" }
      ],
      answer_index: 4,
      rule: "big, small repeats",
      explain_kid: "It should be big, small, big, small... not small again.",
      visual: true
    },

    // 8. Mixed-attribute patterns: colour + shape (red circle, red circle, blue square, …)
    {
      id: "PAT-008",
      type: "mixed-attribute-pattern",
      category: "complex-patterns",
      question: "Continue this color and shape pattern",
      given: [
        { shape: "circle", color: "#F44336" },
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" },
        { shape: "circle", color: "#F44336" },
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" }
      ],
      options: [
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" },
        { shape: "triangle", color: "#4CAF50" }
      ],
      needs: 1,
      answer: [{ shape: "circle", color: "#F44336" }],
      rule: "red circle, red circle, blue square repeats",
      explain_kid: "Two red circles, then one blue square, then repeat!",
      visual: true
    },

    // 9. Number patterns with one missing in the middle (1, 2, __, 4, 5)
    {
      id: "PAT-009",
      type: "number-pattern-missing",
      category: "number-patterns",
      question: "What number is missing from this pattern?",
      sequence: [1, 2, null, 4, 5],
      choices: [3, 6, 0],
      correct: 0,
      answer: 3,
      rule: "counting 1, 2, 3, 4, 5",
      explain_kid: "After 2 comes 3, then 4, then 5!",
      visual: true
    },

    // 10. Continue the picture pattern (complete the drawings)
    {
      id: "PAT-010",
      type: "picture-pattern",
      category: "picture-patterns",
      question: "Draw the next pictures to complete the pattern",
      given: [
        { type: "sun", color: "#FFEB3B" },
        { type: "cloud", color: "#90A4AE" },
        { type: "sun", color: "#FFEB3B" },
        { type: "cloud", color: "#90A4AE" }
      ],
      options: [
        { type: "sun", color: "#FFEB3B" },
        { type: "cloud", color: "#90A4AE" },
        { type: "star", color: "#FFC107" }
      ],
      needs: 2,
      answer: [
        { type: "sun", color: "#FFEB3B" },
        { type: "cloud", color: "#90A4AE" }
      ],
      rule: "sun, cloud repeats",
      explain_kid: "Sun, cloud, sun, cloud... keep going!",
      visual: true
    }
  ],

  hard: [
    // 11. Build your own pattern: give a tile palette; learner places 6 tiles to show a rule—AAB, ABB, ABC
    {
      id: "PAT-011",
      type: "create-your-own",
      category: "pattern-creation",
      question: "Make your own 6-tile pattern that repeats",
      palette: [
        { shape: "circle", color: "#F44336" },
        { shape: "square", color: "#2196F3" },
        { shape: "triangle", color: "#4CAF50" }
      ],
      constraints: { length: 6, repeatable: true },
      rubric: {
        repeatDetected: true,
        minUnits: 2
      },
      rule: "create repeating pattern",
      explain_kid: "Use the shapes to make a pattern that repeats at least twice!",
      visual: true,
      interactive: true,
      freeform: true
    },

    // 12. Describe the rule: "Tell me in simple words: circle, square, circle, square = ABAB."
    {
      id: "PAT-012",
      type: "describe-rule",
      category: "pattern-analysis",
      question: "Look at this pattern and tell me the rule",
      pattern: [
        { shape: "circle", color: "#4CAF50" },
        { shape: "square", color: "#2196F3" },
        { shape: "circle", color: "#4CAF50" },
        { shape: "square", color: "#2196F3" }
      ],
      options: [
        "circle, square, circle, square",
        "all circles and squares",
        "green and blue shapes",
        "four shapes in a row"
      ],
      correct: 0,
      rule: "ABAB pattern",
      explain_kid: "The pattern goes: circle, square, circle, square - it repeats!",
      visual: true
    },

    // 13. Number patterns forward/backward (counting up to 10; small backward hops like 10, 9, 8)
    {
      id: "PAT-013",
      type: "number-pattern-direction",
      category: "number-patterns",
      question: "Continue this counting pattern",
      sequence: [10, 9, 8, 7],
      choices: [6, 11, 5],
      correct: 0,
      answer: 6,
      direction: "backward",
      rule: "counting backward from 10",
      explain_kid: "We're counting backward: 10, 9, 8, 7... next is 6!",
      visual: true
    },

    // 14. Continue shape patterns embedded in scenes (e.g., animals on a fence)
    {
      id: "PAT-014",
      type: "scene-pattern",
      category: "contextual-patterns",
      question: "What animals come next on the fence?",
      scene: "fence",
      given: [
        { animal: "cat", color: "#FF9800" },
        { animal: "dog", color: "#795548" },
        { animal: "bird", color: "#2196F3" },
        { animal: "cat", color: "#FF9800" },
        { animal: "dog", color: "#795548" },
        { animal: "bird", color: "#2196F3" }
      ],
      options: [
        { animal: "cat", color: "#FF9800" },
        { animal: "dog", color: "#795548" },
        { animal: "bird", color: "#2196F3" },
        { animal: "fish", color: "#00BCD4" }
      ],
      needs: 2,
      answer: [
        { animal: "cat", color: "#FF9800" },
        { animal: "dog", color: "#795548" }
      ],
      rule: "cat, dog, bird repeats",
      explain_kid: "On the fence: cat, dog, bird, cat, dog, bird... what comes next?",
      visual: true,
      contextual: true
    },

    // 15. Complex AABB pattern with mixed attributes
    {
      id: "PAT-015",
      type: "choose-correct-pattern",
      category: "complex-patterns",
      question: "Which pattern follows the AABB rule?",
      options: [
        [
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" },
          { shape: "square", color: "#2196F3" },
          { shape: "circle", color: "#F44336" },
          { shape: "circle", color: "#F44336" }
        ],
        [
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" },
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" },
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" }
        ],
        [
          { shape: "triangle", color: "#4CAF50" },
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" },
          { shape: "triangle", color: "#4CAF50" },
          { shape: "circle", color: "#F44336" },
          { shape: "square", color: "#2196F3" }
        ]
      ],
      correct: 0,
      rule: "AABB pattern - two same, two same",
      explain_kid: "AABB means: same, same, different, different, then repeat!",
      visual: true
    }
  ]
};

// Pattern assets for rendering
export const patternAssets = {
  shapes: {
    circle: { type: 'circle' },
    square: { type: 'rect', isSquare: true },
    rectangle: { type: 'rect', isSquare: false },
    triangle: { type: 'polygon' }
  },
  
  sizes: {
    small: 60,
    medium: 80,
    big: 120,
    large: 120
  },
  
  colors: {
    red: '#F44336',
    blue: '#2196F3', 
    green: '#4CAF50',
    yellow: '#FFEB3B',
    orange: '#FF9800',
    purple: '#9C27B0',
    grey: '#90A4AE',
    brown: '#795548'
  },
  
  pictures: {
    sun: {
      svg: `<circle cx="40" cy="40" r="25" fill="#FFEB3B" stroke="#FFA000" stroke-width="2"/>
            <path d="M40 5 L40 15 M75 40 L65 40 M40 75 L40 65 M5 40 L15 40 
                     M65 15 L58 22 M65 65 L58 58 M15 65 L22 58 M15 15 L22 22" 
                  stroke="#FFA000" stroke-width="3" stroke-linecap="round"/>`
    },
    cloud: {
      svg: `<path d="M20 50 Q10 40 20 30 Q30 20 50 30 Q70 20 80 30 Q90 40 80 50 Q90 60 70 60 L30 60 Q10 60 20 50" 
                  fill="#90A4AE" stroke="#607D8B" stroke-width="2"/>`
    },
    star: {
      svg: `<path d="M40 10 L45 25 L60 25 L48 35 L53 50 L40 40 L27 50 L32 35 L20 25 L35 25 Z" 
                  fill="#FFC107" stroke="#FF8F00" stroke-width="2"/>`
    }
  },
  
  animals: {
    cat: {
      svg: `<ellipse cx="40" cy="50" rx="25" ry="20" fill="#FF9800"/>
            <circle cx="30" cy="45" r="3" fill="#000"/>
            <circle cx="50" cy="45" r="3" fill="#000"/>
            <path d="M25 35 L30 25 L35 35 M45 35 L50 25 L55 35" stroke="#000" stroke-width="2" fill="none"/>
            <path d="M40 50 L40 55 M35 58 Q40 60 45 58" stroke="#000" stroke-width="2" fill="none"/>`
    },
    dog: {
      svg: `<ellipse cx="40" cy="50" rx="28" ry="22" fill="#795548"/>
            <circle cx="32" cy="45" r="3" fill="#000"/>
            <circle cx="48" cy="45" r="3" fill="#000"/>
            <ellipse cx="20" cy="40" rx="8" ry="15" fill="#795548"/>
            <ellipse cx="60" cy="40" rx="8" ry="15" fill="#795548"/>
            <circle cx="40" cy="55" r="2" fill="#000"/>
            <path d="M40 57 L40 62" stroke="#000" stroke-width="2"/>`
    },
    bird: {
      svg: `<ellipse cx="40" cy="45" rx="20" ry="15" fill="#2196F3"/>
            <circle cx="35" cy="40" r="2" fill="#000"/>
            <path d="M25 45 Q15 40 10 45 Q15 50 25 45" fill="#1976D2"/>
            <path d="M50 42 L60 40 L58 45 L50 47 Z" fill="#FF9800"/>
            <path d="M40 55 L38 65 M42 55 L44 65" stroke="#FF9800" stroke-width="2"/>`
    }
  }
};

// Helper functions for pattern validation
export const patternHelpers = {
  // Detect if a sequence has a repeating pattern
  detectPattern: (sequence) => {
    if (sequence.length < 2) return null;
    
    for (let patternLength = 1; patternLength <= Math.floor(sequence.length / 2); patternLength++) {
      let isPattern = true;
      const pattern = sequence.slice(0, patternLength);
      
      for (let i = patternLength; i < sequence.length; i++) {
        if (JSON.stringify(sequence[i]) !== JSON.stringify(pattern[i % patternLength])) {
          isPattern = false;
          break;
        }
      }
      
      if (isPattern) {
        return {
          length: patternLength,
          pattern: pattern,
          type: patternLength === 1 ? 'A' : patternLength === 2 ? 'AB' : 'ABC+'
        };
      }
    }
    
    return null;
  },
  
  // Validate if user's created pattern is valid
  validateCreatedPattern: (userPattern, constraints) => {
    if (userPattern.length !== constraints.length) {
      return { valid: false, reason: 'Wrong length' };
    }
    
    const detected = patternHelpers.detectPattern(userPattern);
    if (!detected) {
      return { valid: false, reason: 'No repeating pattern found' };
    }
    
    if (constraints.minUnits && userPattern.length / detected.length < constraints.minUnits) {
      return { valid: false, reason: 'Pattern needs to repeat more times' };
    }
    
    return { valid: true, pattern: detected };
  },
  
  // Get next item in a pattern sequence
  getNextInPattern: (sequence) => {
    const detected = patternHelpers.detectPattern(sequence);
    if (!detected) return null;
    
    const nextIndex = sequence.length % detected.length;
    return detected.pattern[nextIndex];
  }
};
