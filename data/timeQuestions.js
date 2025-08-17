// Interactive time exercises for Grade 1 students
// Focus on daily activities, day/night recognition, and time concepts

export const timeQuestions = {
  easy: [
    // 1. Identification Questions - Which picture shows daytime?
    {
      id: 1,
      type: 'identification',
      category: 'day_night',
      question: 'Which picture shows daytime?',
      images: [
        { id: 'day', src: 'sun', description: 'Sun in bright blue sky', isCorrect: true },
        { id: 'night', src: 'moon', description: 'Moon and stars in dark sky', isCorrect: false }
      ],
      visual: true,
      correctAnswer: 'day'
    },
    
    // 2. Matching Activities - Match activity to time of day
    {
      id: 2,
      type: 'matching',
      category: 'daily_activities',
      question: 'Drag each activity to the correct time of day',
      items: [
        { activity: 'eating_breakfast', label: 'Eating Breakfast', timeOfDay: 'Morning' },
        { activity: 'sleeping', label: 'Sleeping', timeOfDay: 'Night' },
        { activity: 'playing_outside', label: 'Playing Outside', timeOfDay: 'Afternoon' }
      ],
      visual: true
    },

    // 3. Fill-in-the-blank - I eat breakfast in the ______
    {
      id: 3,
      type: 'fill_blank',
      category: 'daily_routine',
      question: 'I eat breakfast in the ______.',
      options: ['morning', 'afternoon', 'night'],
      correctAnswer: 'morning',
      visual: true
    },

    // 4. True/False - You sleep at night
    {
      id: 4,
      type: 'true_false',
      category: 'day_night',
      question: 'You sleep at night.',
      image: 'sleeping_child',
      correctAnswer: true,
      visual: true
    },

    // 5. Color-Based Interaction - Color the morning scene
    {
      id: 5,
      type: 'coloring',
      category: 'time_scenes',
      question: 'Color the morning scene yellow and the night scene dark blue',
      scenes: [
        { id: 'morning', type: 'sun_scene', targetColor: '#FFEB3B', label: 'Morning Scene' },
        { id: 'night', type: 'moon_scene', targetColor: '#1A237E', label: 'Night Scene' }
      ],
      visual: true
    }
  ],

  medium: [
    // 6. Identification - Is this morning or afternoon?
    {
      id: 6,
      type: 'identification',
      category: 'daily_activities',
      question: 'Is this morning or afternoon?',
      scenario: 'child_eating_lunch',
      options: ['morning', 'afternoon'],
      correctAnswer: 'afternoon',
      visual: true
    },

    // 7. Sequencing - Put daily activities in order
    {
      id: 7,
      type: 'sequencing',
      category: 'daily_routine',
      question: 'Put these activities in order from morning to night',
      activities: [
        { id: 1, activity: 'wake_up', label: 'Wake Up', correctOrder: 1 },
        { id: 2, activity: 'eat_lunch', label: 'Eat Lunch', correctOrder: 3 },
        { id: 3, activity: 'brush_teeth_morning', label: 'Brush Teeth', correctOrder: 2 },
        { id: 4, activity: 'go_to_bed', label: 'Go to Bed', correctOrder: 4 }
      ],
      visual: true
    },

    // 8. Matching - Match picture to label (sunrise/sunset)
    {
      id: 8,
      type: 'matching',
      category: 'time_scenes',
      question: 'Match each picture to the correct time label',
      items: [
        { scene: 'sunrise', label: 'Morning', timeOfDay: 'Morning' },
        { scene: 'sunset', label: 'Afternoon', timeOfDay: 'Afternoon' },
        { scene: 'stars', label: 'Night', timeOfDay: 'Night' }
      ],
      visual: true
    },

    // 9. Fill-in-the-blank - The stars shine at ______
    {
      id: 9,
      type: 'fill_blank',
      category: 'day_night',
      question: 'The stars shine at ______.',
      options: ['day', 'night'],
      correctAnswer: 'night',
      visual: true
    },

    // 10. Interactive - Light up sun for day or moon for night
    {
      id: 10,
      type: 'interactive',
      category: 'day_night',
      question: 'Click to light up the sun for day or the moon for night',
      prompt: 'Make it daytime!',
      targets: [
        { id: 'sun', type: 'sun', isCorrect: true },
        { id: 'moon', type: 'moon', isCorrect: false }
      ],
      visual: true,
      correctTarget: 'sun'
    }
  ],

  hard: [
    // 11. Audio-Visual Recognition - Sound identification
    {
      id: 11,
      type: 'audio_visual',
      category: 'sounds',
      question: 'Listen to the sound and tell me: Is this day or night?',
      sound: 'rooster_crow',
      soundDescription: 'Rooster crowing sound',
      options: ['day', 'night'],
      correctAnswer: 'day',
      visual: true,
      audio: true
    },

    // 12. Complex sequencing - Full day routine
    {
      id: 12,
      type: 'sequencing',
      category: 'daily_routine',
      question: 'Put these activities in the correct order for a full day',
      activities: [
        { id: 1, activity: 'sunrise', label: 'Sun Rises', correctOrder: 1 },
        { id: 2, activity: 'breakfast', label: 'Breakfast', correctOrder: 2 },
        { id: 3, activity: 'school', label: 'Go to School', correctOrder: 3 },
        { id: 4, activity: 'lunch', label: 'Lunch Time', correctOrder: 4 },
        { id: 5, activity: 'play', label: 'Play Time', correctOrder: 5 },
        { id: 6, activity: 'dinner', label: 'Dinner', correctOrder: 6 },
        { id: 7, activity: 'bedtime', label: 'Bedtime', correctOrder: 7 }
      ],
      visual: true
    },

    // 13. Multiple True/False
    {
      id: 13,
      type: 'multiple_choice',
      category: 'daily_knowledge',
      question: 'Which of these things happen at night?',
      options: [
        { text: 'You go to school', isCorrect: false },
        { text: 'You sleep in your bed', isCorrect: true },
        { text: 'You eat breakfast', isCorrect: false },
        { text: 'You see stars in the sky', isCorrect: true }
      ],
      multipleCorrect: true,
      visual: true
    },

    // 14. Advanced Audio-Visual - Cricket sounds
    {
      id: 14,
      type: 'audio_visual',
      category: 'sounds',
      question: 'Listen carefully! When do you usually hear this sound?',
      sound: 'cricket_chirping',
      soundDescription: 'Crickets chirping sound',
      options: ['day', 'night'],
      correctAnswer: 'night',
      visual: true,
      audio: true
    },

    // 15. Complex coloring and interaction
    {
      id: 15,
      type: 'scene_building',
      category: 'time_scenes',
      question: 'Build a nighttime scene by adding the moon, stars, and making the sky dark',
      elements: [
        { id: 'sky', type: 'background', targetColor: '#1A237E', required: true },
        { id: 'moon', type: 'object', position: 'sky', required: true },
        { id: 'stars', type: 'multiple_objects', position: 'sky', required: true, count: 3 }
      ],
      visual: true,
      interactive: true
    }
  ]
};

// Time-related images and assets
export const timeAssets = {
  // Day/Night scenes
  sun: {
    type: 'svg',
    element: 'sun',
    color: '#FFEB3B',
    description: 'Bright yellow sun'
  },
  moon: {
    type: 'svg', 
    element: 'moon',
    color: '#E3F2FD',
    description: 'White/silver moon'
  },
  stars: {
    type: 'svg',
    element: 'stars',
    color: '#FFFFFF',
    description: 'Twinkling white stars'
  },
  
  // Daily activities
  eating_breakfast: {
    type: 'icon',
    element: 'breakfast',
    description: 'Child eating breakfast'
  },
  sleeping: {
    type: 'icon',
    element: 'bed',
    description: 'Child sleeping in bed'
  },
  playing_outside: {
    type: 'icon', 
    element: 'playground',
    description: 'Child playing outside'
  },
  
  // Time scenes
  sunrise: {
    type: 'scene',
    elements: ['sun', 'horizon'],
    colors: ['#FFEB3B', '#FF9800'],
    description: 'Sunrise scene'
  },
  sunset: {
    type: 'scene',
    elements: ['sun', 'horizon'],
    colors: ['#FF5722', '#FF9800'],
    description: 'Sunset scene'  
  }
};

// Color definitions for time scenes
export const timeColors = {
  morning: '#FFEB3B',    // Bright yellow
  afternoon: '#FF9800',   // Orange
  evening: '#FF5722',     // Red-orange
  night: '#1A237E',       // Dark blue
  stars: '#FFFFFF',       // White
  moon: '#E3F2FD'        // Light blue-white
};

// Sound definitions (for audio-visual questions)
export const timeSounds = {
  rooster_crow: {
    description: 'Rooster crowing - morning sound',
    timeOfDay: 'morning',
    file: 'rooster.mp3' // Would be actual audio file
  },
  cricket_chirping: {
    description: 'Crickets chirping - night sound', 
    timeOfDay: 'night',
    file: 'crickets.mp3' // Would be actual audio file
  }
};
