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
    },

    // 6. Text Input - Type the time when you wake up
    {
      id: 6,
      type: 'text_input',
      category: 'daily_routine',
      question: 'When do you wake up? Type your answer.',
      placeholder: 'Type morning, afternoon, or night',
      correctAnswers: ['morning', 'Morning', 'MORNING'],
      hint: 'Think about when the sun comes up!',
      visual: true
    },

    // 7. Identification - Which shows nighttime?
    {
      id: 7,
      type: 'identification',
      category: 'day_night',
      question: 'Which picture shows nighttime?',
      images: [
        { id: 'stars', src: 'stars', description: 'Stars twinkling in dark sky', isCorrect: true },
        { id: 'sun', src: 'sun', description: 'Bright sun in blue sky', isCorrect: false }
      ],
      visual: true,
      correctAnswer: 'stars'
    },

    // 8. Text Input - What do you see in the sky at night?
    {
      id: 8,
      type: 'text_input',
      category: 'day_night',
      question: 'What do you see in the sky at night? Type your answer.',
      placeholder: 'Type what shines at night',
      correctAnswers: ['moon', 'Moon', 'MOON', 'stars', 'Stars', 'STARS', 'moon and stars', 'stars and moon'],
      hint: 'Look up at the dark sky!',
      visual: true
    },

    // 9. True/False - The sun shines during the day
    {
      id: 9,
      type: 'true_false',
      category: 'day_night',
      question: 'The sun shines during the day.',
      image: 'bright_sun',
      correctAnswer: true,
      visual: true
    },

    // 10. Text Input - When do you eat lunch?
    {
      id: 10,
      type: 'text_input',
      category: 'daily_routine',
      question: 'When do you eat lunch? Type your answer.',
      placeholder: 'Type the time of day',
      correctAnswers: ['afternoon', 'Afternoon', 'AFTERNOON', 'midday', 'Midday', 'MIDDAY'],
      hint: 'It\'s in the middle of the day!',
      visual: true
    }
  ],

  medium: [
    // 11. Identification - Is this morning or afternoon?
    {
      id: 11,
      type: 'identification',
      category: 'daily_activities',
      question: 'Is this morning or afternoon?',
      scenario: 'child_eating_lunch',
      options: ['morning', 'afternoon'],
      correctAnswer: 'afternoon',
      visual: true
    },

    // 12. Sequencing - Put daily activities in order
    {
      id: 12,
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

    // 13. Matching - Match picture to label (sunrise/sunset)
    {
      id: 13,
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

    // 14. Fill-in-the-blank - The stars shine at ______
    {
      id: 14,
      type: 'fill_blank',
      category: 'day_night',
      question: 'The stars shine at ______.',
      options: ['day', 'night'],
      correctAnswer: 'night',
      visual: true
    },

    // 15. Interactive - Light up sun for day or moon for night
    {
      id: 15,
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
    },

    // 16. Text Input - What time do you go to school?
    {
      id: 16,
      type: 'text_input',
      category: 'daily_routine',
      question: 'What time of day do you go to school? Type your answer.',
      placeholder: 'Type morning, afternoon, or evening',
      correctAnswers: ['morning', 'Morning', 'MORNING'],
      hint: 'School usually starts early in the day!',
      visual: true
    },

    // 17. True/False - You can see stars during the day
    {
      id: 17,
      type: 'true_false',
      category: 'day_night',
      question: 'You can see stars during the day.',
      image: 'daytime_sky',
      correctAnswer: false,
      visual: true
    },

    // 18. Text Input - When is it dark outside?
    {
      id: 18,
      type: 'text_input',
      category: 'day_night',
      question: 'When is it dark outside? Type your answer.',
      placeholder: 'Type the time when it gets dark',
      correctAnswers: ['night', 'Night', 'NIGHT', 'evening', 'Evening', 'EVENING'],
      hint: 'Think about when you can\'t see the sun!',
      visual: true
    },

    // 19. Identification - What do you do in the evening?
    {
      id: 19,
      type: 'identification',
      category: 'daily_activities',
      question: 'What do you usually do in the evening?',
      images: [
        { id: 'dinner', src: 'eating_dinner', description: 'Family eating dinner', isCorrect: true },
        { id: 'breakfast', src: 'eating_breakfast', description: 'Child eating breakfast', isCorrect: false }
      ],
      visual: true,
      correctAnswer: 'dinner'
    },

    // 20. Text Input - Complete the sentence
    {
      id: 20,
      type: 'text_input',
      category: 'daily_routine',
      question: 'I brush my teeth in the ______ and before bed. Type your answer.',
      placeholder: 'Type when you brush teeth',
      correctAnswers: ['morning', 'Morning', 'MORNING'],
      hint: 'When do you first brush your teeth each day?',
      visual: true
    }
  ],

  hard: [
    // 21. Audio-Visual Recognition - Morning rooster sound
    {
      id: 21,
      type: 'audio_visual',
      category: 'sounds',
      question: '🐓 Listen to this friendly farm sound! When do you hear roosters say "Cock-a-doodle-doo"?',
      sound: 'rooster_crow',
      soundDescription: 'Rooster Crow',
      options: ['Morning', 'Night'],
      correctAnswer: 'Morning',
      visual: true,
      audio: true,
      hint: 'Roosters wake up early to greet the sunrise!'
    },

    // 22. Complex sequencing - Full day routine
    {
      id: 22,
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

    // 23. Multiple True/False
    {
      id: 23,
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

    // 24. Advanced Audio-Visual - Gentle cricket sounds
    {
      id: 24,
      type: 'audio_visual',
      category: 'sounds',
      question: '🦗 Listen to these gentle nature sounds! When do crickets sing their lullaby?',
      sound: 'cricket_chirping',
      soundDescription: 'Cricket Chirping',
      options: ['Day', 'Night'],
      correctAnswer: 'Night',
      visual: true,
      audio: true,
      hint: 'Crickets make peaceful sounds when it\'s time to sleep!'
    },

    // 25. Text Input - Advanced time concepts
    {
      id: 25,
      type: 'text_input',
      category: 'time_concepts',
      question: 'What comes after morning but before evening? Type your answer.',
      placeholder: 'Type the time of day',
      correctAnswers: ['afternoon', 'Afternoon', 'AFTERNOON'],
      hint: 'It\'s when you eat lunch!',
      visual: true
    },

    // 26. Complex coloring and interaction
    {
      id: 26,
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
    },

    // 27. Text Input - Time sequence understanding
    {
      id: 27,
      type: 'text_input',
      category: 'time_sequence',
      question: 'If you wake up in the morning, what time comes next? Type your answer.',
      placeholder: 'Type the next time of day',
      correctAnswers: ['afternoon', 'Afternoon', 'AFTERNOON', 'midday', 'Midday', 'MIDDAY'],
      hint: 'Think about the order of the day!',
      visual: true
    },

    // 28. Advanced identification - Time-based activities
    {
      id: 28,
      type: 'identification',
      category: 'advanced_activities',
      question: 'Which activity happens at bedtime?',
      images: [
        { id: 'story', src: 'reading_bedtime_story', description: 'Parent reading bedtime story', isCorrect: true },
        { id: 'lunch', src: 'eating_lunch', description: 'Child eating lunch', isCorrect: false }
      ],
      visual: true,
      correctAnswer: 'story'
    },

    // 29. Text Input - Complete the time pattern
    {
      id: 29,
      type: 'text_input',
      category: 'time_patterns',
      question: 'Complete the pattern: Morning, Afternoon, ______. Type your answer.',
      placeholder: 'Type what comes next',
      correctAnswers: ['night', 'Night', 'NIGHT', 'evening', 'Evening', 'EVENING'],
      hint: 'What time comes after afternoon?',
      visual: true
    },

    // 30. Advanced True/False - Complex time concepts
    {
      id: 30,
      type: 'true_false',
      category: 'advanced_concepts',
      question: 'The moon is visible only at night.',
      image: 'moon_phases',
      correctAnswer: false,
      visual: true,
      explanation: 'Sometimes you can see the moon during the day too!'
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
