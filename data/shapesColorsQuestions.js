// Interactive shapes and colors exercises for Grade 1 students
// Focus on drag-and-drop, matching, and cursor-based interactions

export const shapesColorsQuestions = {
  easy: [
    // Shape matching - drag shapes to correct labels
    {
      id: 1,
      type: 'matching',
      category: 'shapes',
      question: 'Drag each shape to its correct name',
      items: [
        { shape: 'circle', color: '#4CAF50', label: 'Circle' },
        { shape: 'square', color: '#2196F3', label: 'Square' },
        { shape: 'triangle', color: '#FF9800', label: 'Triangle' }
      ],
      visual: true
    },
    // Color matching
    {
      id: 2,
      type: 'matching',
      category: 'colors',
      question: 'Match the colors to their names',
      items: [
        { shape: 'circle', color: '#F44336', label: 'Red' },
        { shape: 'circle', color: '#4CAF50', label: 'Green' },
        { shape: 'circle', color: '#2196F3', label: 'Blue' }
      ],
      visual: true
    },
    // Shape sorting - drag shapes into correct groups
    {
      id: 3,
      type: 'sorting',
      category: 'shapes',
      question: 'Drag all the circles into the circle box',
      targetShape: 'circle',
      items: [
        { shape: 'circle', color: '#4CAF50' },
        { shape: 'square', color: '#2196F3' },
        { shape: 'circle', color: '#FF9800' },
        { shape: 'triangle', color: '#9C27B0' },
        { shape: 'circle', color: '#F44336' }
      ],
      visual: true
    },
    // Shape tracing
    {
      id: 4,
      type: 'tracing',
      category: 'shapes',
      question: 'Trace the circle with your cursor',
      shape: 'circle',
      color: '#4CAF50',
      visual: true
    },
    // Color sorting
    {
      id: 5,
      type: 'sorting',
      category: 'colors',
      question: 'Drag all the red shapes into the red box',
      targetColor: '#F44336',
      items: [
        { shape: 'circle', color: '#F44336' },
        { shape: 'square', color: '#4CAF50' },
        { shape: 'triangle', color: '#F44336' },
        { shape: 'rectangle', color: '#2196F3' },
        { shape: 'square', color: '#F44336' }
      ],
      visual: true
    }
  ],
  medium: [
    // Complex shape matching
    {
      id: 6,
      type: 'matching',
      category: 'shapes',
      question: 'Match each shape to its correct name',
      items: [
        { shape: 'circle', color: '#4CAF50', label: 'Circle' },
        { shape: 'square', color: '#2196F3', label: 'Square' },
        { shape: 'triangle', color: '#FF9800', label: 'Triangle' },
        { shape: 'rectangle', color: '#9C27B0', label: 'Rectangle' }
      ],
      visual: true
    },
    // Rectangle tracing
    {
      id: 7,
      type: 'tracing',
      category: 'shapes',
      question: 'Trace around this rectangle with your cursor',
      shape: 'rectangle',
      color: '#4CAF50',
      visual: true
    },
    // Color and shape sorting
    {
      id: 8,
      type: 'sorting',
      category: 'both',
      question: 'Drag all the blue squares into the target box',
      targetShape: 'square',
      targetColor: '#2196F3',
      items: [
        { shape: 'square', color: '#2196F3' },
        { shape: 'circle', color: '#2196F3' },
        { shape: 'square', color: '#F44336' },
        { shape: 'square', color: '#2196F3' },
        { shape: 'triangle', color: '#2196F3' }
      ],
      visual: true
    },
    // Advanced color matching
    {
      id: 9,
      type: 'matching',
      category: 'colors',
      question: 'Match all the colors to their correct names',
      items: [
        { shape: 'circle', color: '#F44336', label: 'Red' },
        { shape: 'circle', color: '#4CAF50', label: 'Green' },
        { shape: 'circle', color: '#2196F3', label: 'Blue' },
        { shape: 'circle', color: '#FFEB3B', label: 'Yellow' }
      ],
      visual: true
    },
    // Triangle tracing
    {
      id: 10,
      type: 'tracing',
      category: 'shapes',
      question: 'Trace this triangle carefully with your cursor',
      shape: 'triangle',
      color: '#FF9800',
      visual: true
    }
  ],
  hard: [
    // Advanced sorting - single target
    {
      id: 11,
      type: 'sorting',
      category: 'shapes',
      question: 'Drag all the circles into the circle box',
      targetShape: 'circle',
      items: [
        { shape: 'circle', color: '#4CAF50' },
        { shape: 'square', color: '#2196F3' },
        { shape: 'circle', color: '#F44336' },
        { shape: 'triangle', color: '#FF9800' },
        { shape: 'circle', color: '#9C27B0' },
        { shape: 'square', color: '#795548' },
        { shape: 'circle', color: '#FFEB3B' }
      ],
      visual: true
    },
    // Advanced matching with all shapes
    {
      id: 12,
      type: 'matching',
      category: 'shapes',
      question: 'Match all shapes to their correct names',
      items: [
        { shape: 'circle', color: '#4CAF50', label: 'Circle' },
        { shape: 'square', color: '#2196F3', label: 'Square' },
        { shape: 'triangle', color: '#FF9800', label: 'Triangle' },
        { shape: 'rectangle', color: '#9C27B0', label: 'Rectangle' }
      ],
      visual: true
    },
    // Complex tracing
    {
      id: 13,
      type: 'tracing',
      category: 'shapes',
      question: 'Trace this rectangle very carefully',
      shape: 'rectangle',
      color: '#607D8B',
      visual: true,
      precision: 'high'
    },
    // Multi-step sorting
    {
      id: 14,
      type: 'construction',
      category: 'shapes',
      question: 'Draw a robot using these shapes: triangle, square, rectangle, circle',
      tools: ['triangle', 'square', 'rectangle', 'circle'],
      colors: ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B'],
      visual: true,
      interactive: true,
      freeform: true
    }
  ]
};

// Color definitions
export const colors = {
  red: '#F44336',
  blue: '#2196F3',
  yellow: '#FFEB3B',
  green: '#4CAF50'
};

// Shape definitions for SVG generation
export const shapes = {
  circle: { type: 'circle' },
  square: { type: 'rect', isSquare: true },
  rectangle: { type: 'rect', isSquare: false },
  triangle: { type: 'polygon' }
};
