// Measurement & Comparison Questions for Grade 1
// Following Mauritius curriculum with 25+ questions per level

export const measurementQuestions = {
  easy: [
    // Length & Height - Pick Comparison (Clear 1.8x gap)
    {
      id: 'length_easy_1',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which pencil is longer?',
      options: [
        { id: 'A', image: 'pencil_long', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'pencil_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'Long means it reaches further.'
    },
    {
      id: 'length_easy_2', 
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which ruler is shorter?',
      options: [
        { id: 'A', image: 'ruler_long', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'ruler_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'Short means it does not reach as far.'
    },
    {
      id: 'length_easy_3',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which snake is longer?',
      options: [
        { id: 'A', image: 'snake_short', sizeRatio: 1.0, isCorrect: false },
        { id: 'B', image: 'snake_long', sizeRatio: 1.8, isCorrect: true }
      ],
      explanation: 'The long snake stretches further.'
    },
    {
      id: 'length_easy_4',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which rope is shorter?',
      options: [
        { id: 'A', image: 'rope_long', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'rope_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The short rope does not stretch as far.'
    },
    {
      id: 'length_easy_5',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which train is longer?',
      options: [
        { id: 'A', image: 'train_long', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'train_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The long train has more carriages.'
    },
    {
      id: 'height_easy_1',
      type: 'pick_comparison', 
      subtopic: 'height',
      prompt: 'Who is taller?',
      options: [
        { id: 'A', image: 'boy_tall', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'boy_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'Tall means higher up.'
    },
    {
      id: 'height_easy_2',
      type: 'pick_comparison',
      subtopic: 'height', 
      prompt: 'Which tree is shorter?',
      options: [
        { id: 'A', image: 'tree_tall', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'tree_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The shorter tree is not as high.'
    },
    {
      id: 'height_easy_3',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which building is taller?',
      options: [
        { id: 'A', image: 'building_tall', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'building_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The tall building reaches higher into the sky.'
    },
    {
      id: 'height_easy_4',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which flower is shorter?',
      options: [
        { id: 'A', image: 'flower_tall', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'flower_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The short flower is closer to the ground.'
    },
    {
      id: 'height_easy_5',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which giraffe is taller?',
      options: [
        { id: 'A', image: 'giraffe_tall', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'giraffe_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The tall giraffe can reach higher leaves.'
    },
    
    // Size - Tick/Cross
    {
      id: 'size_easy_1',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Tick the big circle',
      action: 'tick',
      options: [
        { id: 'A', image: 'circle_big', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'circle_small', sizeRatio: 1.0, isCorrect: false },
        { id: 'C', image: 'circle_medium', sizeRatio: 1.3, isCorrect: false },
        { id: 'D', image: 'circle_tiny', sizeRatio: 0.7, isCorrect: false }
      ],
      explanation: 'The big circle takes up more space.'
    },
    {
      id: 'size_easy_2',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Cross the small triangle',
      action: 'cross',
      options: [
        { id: 'A', image: 'triangle_big', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'triangle_small', sizeRatio: 1.0, isCorrect: true },
        { id: 'C', image: 'triangle_medium', sizeRatio: 1.4, isCorrect: false },
        { id: 'D', image: 'triangle_large', sizeRatio: 2.0, isCorrect: false }
      ],
      explanation: 'The small triangle is the tiniest one.'
    },
    {
      id: 'size_easy_3',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Tick the big square',
      action: 'tick',
      options: [
        { id: 'A', image: 'square_big', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'square_small', sizeRatio: 1.0, isCorrect: false },
        { id: 'C', image: 'square_medium', sizeRatio: 1.4, isCorrect: false }
      ],
      explanation: 'The big square covers more area.'
    },
    {
      id: 'size_easy_4',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Cross the small star',
      action: 'cross',
      options: [
        { id: 'A', image: 'star_big', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'star_small', sizeRatio: 1.0, isCorrect: true },
        { id: 'C', image: 'star_medium', sizeRatio: 1.4, isCorrect: false }
      ],
      explanation: 'The small star is the littlest one.'
    },
    {
      id: 'size_easy_5',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Tick the big heart',
      action: 'tick',
      options: [
        { id: 'A', image: 'heart_big', sizeRatio: 1.8, isCorrect: true },
        { id: 'B', image: 'heart_small', sizeRatio: 1.0, isCorrect: false },
        { id: 'C', image: 'heart_medium', sizeRatio: 1.3, isCorrect: false }
      ],
      explanation: 'The big heart is the largest shape.'
    },
    
    // Mass - Pick Comparison
    {
      id: 'mass_easy_1',
      type: 'pick_comparison',
      subtopic: 'mass',
      prompt: 'Which basket is heavier?',
      options: [
        { id: 'A', image: 'basket_full', sizeRatio: 1.0, isCorrect: true },
        { id: 'B', image: 'basket_empty', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The full basket has more things inside.'
    },
    {
      id: 'mass_easy_2',
      type: 'pick_comparison',
      subtopic: 'mass',
      prompt: 'Which animal is lighter?',
      options: [
        { id: 'A', image: 'elephant_big', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'cat_small', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The cat weighs much less than the elephant.'
    },
    {
      id: 'mass_easy_3',
      type: 'pick_comparison',
      subtopic: 'mass',
      prompt: 'Which bag is heavier?',
      options: [
        { id: 'A', image: 'bag_full', sizeRatio: 1.0, isCorrect: true },
        { id: 'B', image: 'bag_light', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The full bag weighs more than the empty bag.'
    },
    {
      id: 'mass_easy_4',
      type: 'pick_comparison',
      subtopic: 'mass',
      prompt: 'Which is lighter?',
      options: [
        { id: 'A', image: 'rock_heavy', sizeRatio: 1.8, isCorrect: false },
        { id: 'B', image: 'feather_light', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'A feather is very light compared to a rock.'
    },
    {
      id: 'mass_easy_5',
      type: 'pick_comparison',
      subtopic: 'mass',
      prompt: 'Which box is heavier?',
      options: [
        { id: 'A', image: 'box_heavy', sizeRatio: 1.0, isCorrect: true },
        { id: 'B', image: 'box_light', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The full box has things inside making it heavier.'
    },
    
    // Time - Scene ID
    {
      id: 'time_easy_1',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'Is this day or night?',
      options: [
        { id: 'day', image: 'scene_sun_bright', isCorrect: true },
        { id: 'night', image: 'scene_sun_bright', isCorrect: false }
      ],
      sceneImage: 'scene_sun_bright',
      explanation: 'The bright sun means it is day time.'
    },
    {
      id: 'time_easy_2',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'Is this day or night?',
      options: [
        { id: 'day', image: 'scene_moon_stars', isCorrect: false },
        { id: 'night', image: 'scene_moon_stars', isCorrect: true }
      ],
      sceneImage: 'scene_moon_stars',
      explanation: 'The moon and stars show it is night time.'
    },
    {
      id: 'time_easy_3',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'Is this morning or afternoon?',
      options: [
        { id: 'morning', image: 'scene_breakfast', isCorrect: true },
        { id: 'afternoon', image: 'scene_breakfast', isCorrect: false }
      ],
      sceneImage: 'scene_breakfast',
      explanation: 'Breakfast happens in the morning.'
    },
    {
      id: 'time_easy_4',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'Is this morning or evening?',
      options: [
        { id: 'morning', image: 'scene_sunset', isCorrect: false },
        { id: 'evening', image: 'scene_sunset', isCorrect: true }
      ],
      sceneImage: 'scene_sunset',
      explanation: 'The sunset happens in the evening.'
    },
    {
      id: 'time_easy_5',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'Is this day or night?',
      options: [
        { id: 'day', image: 'scene_playground', isCorrect: true },
        { id: 'night', image: 'scene_playground', isCorrect: false }
      ],
      sceneImage: 'scene_playground',
      explanation: 'Children play outside during the day.'
    },
    
    // Coins - Identify
    {
      id: 'coins_easy_1',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Tick the Rs 10 coin',
      options: [
        { id: 'A', image: 'coin_Rs1', value: 1, isCorrect: false },
        { id: 'B', image: 'coin_Rs5', value: 5, isCorrect: false },
        { id: 'C', image: 'coin_Rs10', value: 10, isCorrect: true },
        { id: 'D', image: 'coin_5c', value: 0.05, isCorrect: false }
      ],
      explanation: 'The Rs 10 coin is golden colored.'
    },
    {
      id: 'coins_easy_2',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Cross the Rs 1 coin',
      options: [
        { id: 'A', image: 'coin_Rs1', value: 1, isCorrect: true },
        { id: 'B', image: 'coin_Rs5', value: 5, isCorrect: false },
        { id: 'C', image: 'coin_Rs10', value: 10, isCorrect: false },
        { id: 'D', image: 'coin_1c', value: 0.01, isCorrect: false }
      ],
      explanation: 'The Rs 1 coin is silver colored and medium sized.'
    },
    {
      id: 'coins_easy_3',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Tick the Rs 5 coin',
      options: [
        { id: 'A', image: 'coin_Rs1', value: 1, isCorrect: false },
        { id: 'B', image: 'coin_Rs5', value: 5, isCorrect: true },
        { id: 'C', image: 'coin_Rs10', value: 10, isCorrect: false },
        { id: 'D', image: 'coin_5c', value: 0.05, isCorrect: false }
      ],
      explanation: 'The Rs 5 coin is silver and larger than Rs 1.'
    }
  ],
  
  medium: [
    // Length - Pick Comparison (1.4x ratio)
    {
      id: 'length_medium_1',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which stick is longer?',
      options: [
        { id: 'A', image: 'stick_medium', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'stick_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'Look carefully at the ends to see which reaches further.'
    },
    {
      id: 'length_medium_2',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which ribbon is shorter?',
      options: [
        { id: 'A', image: 'ribbon_long', sizeRatio: 1.4, isCorrect: false },
        { id: 'B', image: 'ribbon_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The shorter ribbon does not extend as far.'
    },
    {
      id: 'length_medium_3',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which worm is longer?',
      options: [
        { id: 'A', image: 'worm_long', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'worm_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The long worm stretches further across.'
    },
    {
      id: 'length_medium_4',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which crayon is shorter?',
      options: [
        { id: 'A', image: 'crayon_long', sizeRatio: 1.4, isCorrect: false },
        { id: 'B', image: 'crayon_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The short crayon has been used more.'
    },
    {
      id: 'length_medium_5',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which bridge is longer?',
      options: [
        { id: 'A', image: 'bridge_long', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'bridge_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The long bridge crosses a wider river.'
    },
    
    // Height - Pick Comparison
    {
      id: 'height_medium_1',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which ladder is taller?',
      options: [
        { id: 'A', image: 'ladder_tall', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'ladder_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The tall ladder can reach higher places.'
    },
    {
      id: 'height_medium_2',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which bottle is shorter?',
      options: [
        { id: 'A', image: 'bottle_tall', sizeRatio: 1.4, isCorrect: false },
        { id: 'B', image: 'bottle_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The short bottle is not as high.'
    },
    {
      id: 'height_medium_3',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which candle is taller?',
      options: [
        { id: 'A', image: 'candle_tall', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'candle_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The tall candle reaches higher up.'
    },
    {
      id: 'height_medium_4',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which fence is shorter?',
      options: [
        { id: 'A', image: 'fence_tall', sizeRatio: 1.4, isCorrect: false },
        { id: 'B', image: 'fence_short', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The short fence is easier to see over.'
    },
    {
      id: 'height_medium_5',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which plant is taller?',
      options: [
        { id: 'A', image: 'plant_tall', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'plant_short', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The tall plant has grown more.'
    },
    
    // Order 3 - Sequencing
    {
      id: 'length_medium_order_1',
      type: 'order_3',
      subtopic: 'length',
      prompt: 'Put these pencils in order from shortest to longest',
      items: [
        { id: 'pencil1', image: 'pencil_6units', length: 6, correctPosition: 0 },
        { id: 'pencil2', image: 'pencil_8units', length: 8, correctPosition: 1 },
        { id: 'pencil3', image: 'pencil_11units', length: 11, correctPosition: 2 }
      ],
      explanation: 'Start with the shortest and end with the longest.'
    },
    {
      id: 'height_medium_order_1',
      type: 'order_3',
      subtopic: 'height',
      prompt: 'Put these bottles in order from shortest to tallest',
      items: [
        { id: 'bottle1', image: 'bottle_5units', height: 5, correctPosition: 0 },
        { id: 'bottle2', image: 'bottle_7units', height: 7, correctPosition: 1 },
        { id: 'bottle3', image: 'bottle_10units', height: 10, correctPosition: 2 }
      ],
      explanation: 'Arrange from the lowest to the highest.'
    },
    {
      id: 'size_medium_order_1',
      type: 'order_3',
      subtopic: 'size',
      prompt: 'Put these circles in order from smallest to biggest',
      items: [
        { id: 'circle1', image: 'circle_4units', size: 4, correctPosition: 0 },
        { id: 'circle2', image: 'circle_6units', size: 6, correctPosition: 1 },
        { id: 'circle3', image: 'circle_8units', size: 8, correctPosition: 2 }
      ],
      explanation: 'Start with the tiniest and end with the biggest.'
    },
    
    // Complete Sentence
    {
      id: 'complete_sentence_1',
      type: 'complete_sentence',
      subtopic: 'length',
      prompt: 'Ruler A is ___ than Ruler B.',
      options: ['longer', 'shorter'],
      correct: 'longer',
      context: { rulerA: 1.4, rulerB: 1.0 },
      explanation: 'Ruler A reaches further than Ruler B.'
    },
    {
      id: 'complete_sentence_2',
      type: 'complete_sentence',
      subtopic: 'height',
      prompt: 'The tree is ___ than the bush.',
      options: ['taller', 'shorter'],
      correct: 'taller',
      context: { tree: 1.4, bush: 1.0 },
      explanation: 'Trees grow higher than bushes.'
    },
    {
      id: 'complete_sentence_3',
      type: 'complete_sentence',
      subtopic: 'size',
      prompt: 'The elephant is ___ than the cat.',
      options: ['bigger', 'smaller'],
      correct: 'bigger',
      context: { elephant: 1.4, mouse: 1.0 },
      explanation: 'Elephants are much larger than mice.'
    },
    {
      id: 'complete_sentence_4',
      type: 'complete_sentence',
      subtopic: 'mass',
      prompt: 'The full bag is ___ than the empty bag.',
      options: ['heavier', 'lighter'],
      correct: 'heavier',
      context: { full: 1.0, empty: 1.0 },
      explanation: 'Full bags weigh more because they have things inside.'
    },
    
    // Match Pairs
    {
      id: 'match_pairs_1',
      type: 'match_pairs',
      subtopic: 'length',
      prompt: 'Match the objects with their lengths',
      pairs: [
        { left: 'short_pencil', right: 'short', leftImage: 'pencil_3units', rightText: 'Short' },
        { left: 'medium_pencil', right: 'medium', leftImage: 'pencil_4units', rightText: 'Medium' },
        { left: 'long_pencil', right: 'long', leftImage: 'pencil_6units', rightText: 'Long' }
      ],
      explanation: 'Match each pencil with its correct length description.'
    },
    {
      id: 'match_pairs_2',
      type: 'match_pairs',
      subtopic: 'height',
      prompt: 'Match the objects with their heights',
      pairs: [
        { left: 'short_tree', right: 'short', leftImage: 'tree_4units', rightText: 'Short' },
        { left: 'tall_tree', right: 'tall', leftImage: 'tree_6units', rightText: 'Tall' },
        { left: 'very_tall_tree', right: 'very_tall', leftImage: 'tree_8units', rightText: 'Very Tall' }
      ],
      explanation: 'Match each tree with its correct height description.'
    },
    {
      id: 'match_pairs_3',
      type: 'pick_comparison',
      subtopic: 'size',
      prompt: 'Which circle is bigger?',
      options: [
        { id: 'A', image: 'circle_big', sizeRatio: 1.4, isCorrect: true },
        { id: 'B', image: 'circle_small', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The bigger circle takes up more space.'
    },
    
    // Sort 2 - Binary sorting
    {
      id: 'sort_2_length_1',
      type: 'sort_2',
      subtopic: 'length',
      prompt: 'Sort these into Long and Short groups',
      items: [
        { id: 'rope1', image: 'rope_7units', length: 7, category: 'long' },
        { id: 'rope2', image: 'rope_3units', length: 3, category: 'short' },
        { id: 'rope3', image: 'rope_8units', length: 8, category: 'long' },
        { id: 'rope4', image: 'rope_2units', length: 2, category: 'short' }
      ],
      categories: ['Long', 'Short'],
      explanation: 'Put the longer ropes in Long group and shorter ropes in Short group.'
    },
    {
      id: 'sort_2_height_1',
      type: 'sort_2',
      subtopic: 'height',
      prompt: 'Sort these into Tall and Short groups',
      items: [
        { id: 'building1', image: 'building_6units', height: 6, category: 'tall' },
        { id: 'building2', image: 'building_3units', height: 3, category: 'short' },
        { id: 'building3', image: 'building_7units', height: 7, category: 'tall' },
        { id: 'building4', image: 'building_2units', height: 2, category: 'short' }
      ],
      categories: ['Tall', 'Short'],
      explanation: 'Put the taller buildings in Tall group and shorter ones in Short group.'
    },
    {
      id: 'sort_2_size_1',
      type: 'sort_2',
      subtopic: 'size',
      prompt: 'Sort these into Big and Small groups',
      items: [
        { id: 'ball1', image: 'ball_6units', size: 6, category: 'big' },
        { id: 'ball2', image: 'ball_3units', size: 3, category: 'small' },
        { id: 'ball3', image: 'ball_7units', size: 7, category: 'big' },
        { id: 'ball4', image: 'ball_2units', size: 2, category: 'small' }
      ],
      categories: ['Big', 'Small'],
      explanation: 'Put the bigger balls in Big group and smaller balls in Small group.'
    },
    
    // Time and Coins
    {
      id: 'time_medium_1',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'What time of day is this?',
      options: [
        { id: 'morning', image: 'scene_sunrise', isCorrect: true },
        { id: 'evening', image: 'scene_sunrise', isCorrect: false },
        { id: 'night', image: 'scene_sunrise', isCorrect: false }
      ],
      sceneImage: 'scene_sunrise',
      explanation: 'The sunrise happens in the morning.'
    },
    {
      id: 'coins_medium_1',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Which coin is worth more?',
      options: [
        { id: 'A', image: 'coin_Rs1', value: 1, isCorrect: false },
        { id: 'B', image: 'coin_Rs5', value: 5, isCorrect: true }
      ],
      explanation: 'Rs 5 is worth more than Rs 1.'
    },
    {
      id: 'coins_medium_2',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Which coin is worth less?',
      options: [
        { id: 'A', image: 'coin_Rs10', value: 10, isCorrect: false },
        { id: 'B', image: 'coin_Rs1', value: 1, isCorrect: true }
      ],
      explanation: 'Rs 1 is worth less than Rs 10.'
    }
  ],
  
  hard: [
    // Length - Pick Comparison (1.2x ratio - very close)
    {
      id: 'length_hard_1',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which pencil is longer?',
      options: [
        { id: 'A', image: 'pencil_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'pencil_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'Look very carefully - they are almost the same size!'
    },
    {
      id: 'length_hard_2',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which line is shorter?',
      options: [
        { id: 'A', image: 'line_close1', sizeRatio: 1.2, isCorrect: false },
        { id: 'B', image: 'line_close2', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The difference is very small - look at both ends carefully.'
    },
    {
      id: 'length_hard_3',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which stick is longer?',
      options: [
        { id: 'A', image: 'stick_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'stick_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'These sticks are nearly the same length - check the tips.'
    },
    {
      id: 'length_hard_4',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which ribbon is shorter?',
      options: [
        { id: 'A', image: 'ribbon_close1', sizeRatio: 1.2, isCorrect: false },
        { id: 'B', image: 'ribbon_close2', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The ribbons are very similar - look closely at the ends.'
    },
    {
      id: 'length_hard_5',
      type: 'pick_comparison',
      subtopic: 'length',
      prompt: 'Which rope is longer?',
      options: [
        { id: 'A', image: 'rope_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'rope_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'This is tricky - the ropes are almost identical in length.'
    },
    
    // Height - Pick Comparison (1.2x ratio)
    {
      id: 'height_hard_1',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which bottle is taller?',
      options: [
        { id: 'A', image: 'bottle_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'bottle_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'Look at the tops - one is just slightly higher.'
    },
    {
      id: 'height_hard_2',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which candle is shorter?',
      options: [
        { id: 'A', image: 'candle_close1', sizeRatio: 1.2, isCorrect: false },
        { id: 'B', image: 'candle_close2', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The candles are very close in height - check carefully.'
    },
    {
      id: 'height_hard_3',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which tower is taller?',
      options: [
        { id: 'A', image: 'tower_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'tower_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'These towers are almost the same height - look at the very top.'
    },
    {
      id: 'height_hard_4',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which plant is shorter?',
      options: [
        { id: 'A', image: 'plant_close1', sizeRatio: 1.2, isCorrect: false },
        { id: 'B', image: 'plant_close2', sizeRatio: 1.0, isCorrect: true }
      ],
      explanation: 'The plants have grown to nearly the same height.'
    },
    {
      id: 'height_hard_5',
      type: 'pick_comparison',
      subtopic: 'height',
      prompt: 'Which fence is taller?',
      options: [
        { id: 'A', image: 'fence_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'fence_close2', sizeRatio: 1.0, isCorrect: false }
      ],
      explanation: 'The fences are built to similar heights - check the top edge.'
    },
    
    // Order 3 - Very close measurements
    {
      id: 'height_hard_order_1',
      type: 'order_3',
      subtopic: 'height',
      prompt: 'Put these children in order from shortest to tallest',
      items: [
        { id: 'child1', image: 'child_7units', height: 7, correctPosition: 0 },
        { id: 'child2', image: 'child_8units', height: 8, correctPosition: 1 },
        { id: 'child3', image: 'child_9units', height: 9, correctPosition: 2 }
      ],
      explanation: 'These heights are very close - look at the tops of their heads.'
    },
    {
      id: 'length_hard_order_1',
      type: 'order_3',
      subtopic: 'length',
      prompt: 'Put these pencils in order from shortest to longest',
      items: [
        { id: 'pencil1', image: 'pencil_9units', length: 9, correctPosition: 0 },
        { id: 'pencil2', image: 'pencil_10units', length: 10, correctPosition: 1 },
        { id: 'pencil3', image: 'pencil_12units', length: 12, correctPosition: 2 }
      ],
      explanation: 'These pencils are very similar - compare the tips carefully.'
    },
    {
      id: 'size_hard_order_1',
      type: 'order_3',
      subtopic: 'size',
      prompt: 'Put these circles in order from smallest to biggest',
      items: [
        { id: 'circle1', image: 'circle_8units', size: 8, correctPosition: 0 },
        { id: 'circle2', image: 'circle_9units', size: 9, correctPosition: 1 },
        { id: 'circle3', image: 'circle_11units', size: 11, correctPosition: 2 }
      ],
      explanation: 'The circles are almost the same size - look very carefully.'
    },
    
    // Size - Tick/Cross with close ratios
    {
      id: 'size_hard_1',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Tick the bigger square',
      action: 'tick',
      options: [
        { id: 'A', image: 'square_close1', sizeRatio: 1.2, isCorrect: true },
        { id: 'B', image: 'square_close2', sizeRatio: 1.0, isCorrect: false },
        { id: 'C', image: 'square_close3', sizeRatio: 1.1, isCorrect: false }
      ],
      explanation: 'These squares are very close in size - compare the edges.'
    },
    {
      id: 'size_hard_2',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Cross the smaller triangle',
      action: 'cross',
      options: [
        { id: 'A', image: 'triangle_close1', sizeRatio: 1.2, isCorrect: false },
        { id: 'B', image: 'triangle_close2', sizeRatio: 1.0, isCorrect: true },
        { id: 'C', image: 'triangle_close3', sizeRatio: 1.1, isCorrect: false }
      ],
      explanation: 'The triangles are nearly identical - check the corners.'
    },
    {
      id: 'size_hard_3',
      type: 'tick_cross',
      subtopic: 'size',
      prompt: 'Tick the bigger circle',
      action: 'tick',
      options: [
        { id: 'A', image: 'circle_close1', sizeRatio: 1.0, isCorrect: false },
        { id: 'B', image: 'circle_close2', sizeRatio: 1.2, isCorrect: true },
        { id: 'C', image: 'circle_close3', sizeRatio: 1.1, isCorrect: false }
      ],
      explanation: 'These circles are very similar - look at the diameter.'
    },
    
    // Complete Sentence - Advanced comparisons
    {
      id: 'complete_sentence_hard_1',
      type: 'complete_sentence',
      subtopic: 'length',
      prompt: 'The first stick is ___ than the second stick.',
      options: ['slightly longer', 'much longer', 'shorter'],
      correct: 'slightly longer',
      context: { stick1: 1.2, stick2: 1.0 },
      explanation: 'When things are close in size, we say "slightly" longer.'
    },
    {
      id: 'complete_sentence_hard_2',
      type: 'complete_sentence',
      subtopic: 'height',
      prompt: 'The left tower is ___ than the right tower.',
      options: ['a little taller', 'much taller', 'shorter'],
      correct: 'a little taller',
      context: { left: 1.2, right: 1.0 },
      explanation: 'Small differences need words like "a little" or "slightly".'
    },
    {
      id: 'complete_sentence_hard_3',
      type: 'complete_sentence',
      subtopic: 'size',
      prompt: 'The blue shape is ___ than the red shape.',
      options: ['barely bigger', 'much bigger', 'smaller'],
      correct: 'barely bigger',
      context: { blue: 1.2, red: 1.0 },
      explanation: '"Barely" means just a tiny bit bigger.'
    },
    
    // Match Pairs - Precise measurements
    {
      id: 'match_pairs_hard_1',
      type: 'match_pairs',
      subtopic: 'length',
      prompt: 'Match the objects with their precise lengths',
      pairs: [
        { left: 'pencil_9cm', right: '9cm', leftImage: 'pencil_9units', rightText: '9 cm' },
        { left: 'pencil_10cm', right: '10cm', leftImage: 'pencil_10units', rightText: '10 cm' },
        { left: 'pencil_11cm', right: '11cm', leftImage: 'pencil_11units', rightText: '11 cm' }
      ],
      explanation: 'Match each pencil with its exact measurement.'
    },
    {
      id: 'match_pairs_hard_2',
      type: 'match_pairs',
      subtopic: 'height',
      prompt: 'Match the bottles with their heights',
      pairs: [
        { left: 'bottle_12cm', right: '12cm', leftImage: 'bottle_12units', rightText: '12 cm' },
        { left: 'bottle_14cm', right: '14cm', leftImage: 'bottle_14units', rightText: '14 cm' }
      ],
      explanation: 'These bottles are very close in height - measure carefully.'
    },
    
    // Sort 2 - Fine distinctions
    {
      id: 'sort_2_hard_1',
      type: 'sort_2',
      subtopic: 'length',
      prompt: 'Sort these into Longer and Shorter groups (compared to 10 cm)',
      items: [
        { id: 'stick1', image: 'stick_12units', length: 12, category: 'longer' },
        { id: 'stick2', image: 'stick_9units', length: 9, category: 'shorter' },
        { id: 'stick3', image: 'stick_11units', length: 11, category: 'longer' },
        { id: 'stick4', image: 'stick_8units', length: 8, category: 'shorter' }
      ],
      categories: ['Longer than 10cm', 'Shorter than 10cm'],
      explanation: 'Compare each stick to 10 cm to decide which group.'
    },
    {
      id: 'sort_2_hard_2',
      type: 'sort_2',
      subtopic: 'height',
      prompt: 'Sort these into Taller and Shorter groups (compared to 15 cm)',
      items: [
        { id: 'bottle1', image: 'bottle_16units', height: 16, category: 'taller' },
        { id: 'bottle2', image: 'bottle_14units', height: 14, category: 'shorter' },
        { id: 'bottle3', image: 'bottle_17units', height: 17, category: 'taller' },
        { id: 'bottle4', image: 'bottle_13units', height: 13, category: 'shorter' }
      ],
      categories: ['Taller than 15cm', 'Shorter than 15cm'],
      explanation: 'Compare each bottle height to 15 cm.'
    },
    
    // Advanced Time and Coins
    {
      id: 'time_hard_1',
      type: 'scene_id',
      subtopic: 'time',
      prompt: 'What time of day is this?',
      options: [
        { id: 'early_morning', image: 'scene_dawn', isCorrect: true },
        { id: 'late_morning', image: 'scene_dawn', isCorrect: false },
        { id: 'afternoon', image: 'scene_dawn', isCorrect: false }
      ],
      sceneImage: 'scene_dawn',
      explanation: 'Dawn is very early morning when the sun just starts to rise.'
    },
    {
      id: 'coins_hard_1',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Which combination is worth exactly Rs 6?',
      options: [
        { id: 'A', image: 'coins_Rs1_Rs5', value: 6, isCorrect: true },
        { id: 'B', image: 'coins_Rs5_Rs5', value: 10, isCorrect: false },
        { id: 'C', image: 'coins_Rs1_Rs1', value: 2, isCorrect: false }
      ],
      explanation: 'Rs 1 + Rs 5 = Rs 6 exactly.'
    },
    {
      id: 'coins_hard_2',
      type: 'identify_coin',
      subtopic: 'coins',
      prompt: 'Which is the smallest value coin?',
      options: [
        { id: 'A', image: 'coin_1c', value: 0.01, isCorrect: true },
        { id: 'B', image: 'coin_5c', value: 0.05, isCorrect: false },
        { id: 'C', image: 'coin_Rs1', value: 1, isCorrect: false }
      ],
      explanation: '1 cent is the smallest value Mauritian coin.'
    }
  ]
};

// Image assets for measurement questions
export const measurementAssets = {
  // Length objects - Easy level (1.8x ratio)
  pencil_long: { type: 'pencil', color: '#FFD700', length: 180 },
  pencil_short: { type: 'pencil', color: '#FFD700', length: 100 },
  ruler_long: { type: 'ruler', color: '#8B4513', length: 200 },
  ruler_short: { type: 'ruler', color: '#8B4513', length: 110 },
  snake_long: { type: 'snake', color: '#228B22', length: 220 },
  snake_short: { type: 'snake', color: '#228B22', length: 120 },
  rope_long: { type: 'rope', color: '#8B4513', length: 216 },
  rope_short: { type: 'rope', color: '#8B4513', length: 120 },
  train_long: { type: 'train', color: '#4169E1', length: 270 },
  train_short: { type: 'train', color: '#4169E1', length: 150 },
  
  // Length objects - Medium level (1.4x ratio)
  stick_medium: { type: 'stick', color: '#8B4513', length: 140 },
  stick_short: { type: 'stick', color: '#8B4513', length: 100 },
  ribbon_long: { type: 'ribbon', color: '#FF69B4', length: 168 },
  ribbon_short: { type: 'ribbon', color: '#FF69B4', length: 120 },
  worm_long: { type: 'worm', color: '#8B4513', length: 154 },
  worm_short: { type: 'worm', color: '#8B4513', length: 110 },
  crayon_long: { type: 'crayon', color: '#FF6347', length: 126 },
  crayon_short: { type: 'crayon', color: '#FF6347', length: 90 },
  bridge_long: { type: 'bridge', color: '#696969', length: 210 },
  bridge_short: { type: 'bridge', color: '#696969', length: 150 },
  
  // Length objects - Hard level (1.2x ratio)
  pencil_close1: { type: 'pencil', color: '#FFD700', length: 120 },
  pencil_close2: { type: 'pencil', color: '#FFD700', length: 100 },
  line_close1: { type: 'line', color: '#000000', length: 132 },
  line_close2: { type: 'line', color: '#000000', length: 110 },
  stick_close1: { type: 'stick', color: '#8B4513', length: 144 },
  stick_close2: { type: 'stick', color: '#8B4513', length: 120 },
  ribbon_close1: { type: 'ribbon', color: '#FF69B4', length: 108 },
  ribbon_close2: { type: 'ribbon', color: '#FF69B4', length: 90 },
  rope_close1: { type: 'rope', color: '#8B4513', length: 156 },
  rope_close2: { type: 'rope', color: '#8B4513', length: 130 },
  
  // Height objects - Easy level (1.8x ratio)
  boy_tall: { type: 'person', color: '#87CEEB', height: 180 },
  boy_short: { type: 'person', color: '#87CEEB', height: 100 },
  tree_tall: { type: 'tree', color: '#228B22', height: 200 },
  tree_short: { type: 'tree', color: '#228B22', height: 110 },
  building_tall: { type: 'building', color: '#708090', height: 216 },
  building_short: { type: 'building', color: '#708090', height: 120 },
  flower_tall: { type: 'flower', color: '#FF1493', height: 162 },
  flower_short: { type: 'flower', color: '#FF1493', height: 90 },
  giraffe_tall: { type: 'giraffe', color: '#DAA520', height: 270 },
  giraffe_short: { type: 'giraffe', color: '#DAA520', height: 150 },
  
  // Height objects - Medium level (1.4x ratio)
  ladder_tall: { type: 'ladder', color: '#8B4513', height: 168 },
  ladder_short: { type: 'ladder', color: '#8B4513', height: 120 },
  bottle_tall: { type: 'bottle', color: '#4169E1', height: 140 },
  bottle_short: { type: 'bottle', color: '#4169E1', height: 100 },
  candle_tall: { type: 'candle', color: '#FFFF00', height: 126 },
  candle_short: { type: 'candle', color: '#FFFF00', height: 90 },
  fence_tall: { type: 'fence', color: '#8B4513', height: 154 },
  fence_short: { type: 'fence', color: '#8B4513', height: 110 },
  plant_tall: { type: 'plant', color: '#228B22', height: 182 },
  plant_short: { type: 'plant', color: '#228B22', height: 130 },
  
  // Height objects - Hard level (1.2x ratio)
  bottle_close1: { type: 'bottle', color: '#4169E1', height: 120 },
  bottle_close2: { type: 'bottle', color: '#4169E1', height: 100 },
  candle_close1: { type: 'candle', color: '#FFFF00', height: 132 },
  candle_close2: { type: 'candle', color: '#FFFF00', height: 110 },
  tower_close1: { type: 'tower', color: '#708090', height: 144 },
  tower_close2: { type: 'tower', color: '#708090', height: 120 },
  plant_close1: { type: 'plant', color: '#228B22', height: 108 },
  plant_close2: { type: 'plant', color: '#228B22', height: 90 },
  fence_close1: { type: 'fence', color: '#8B4513', height: 156 },
  fence_close2: { type: 'fence', color: '#8B4513', height: 130 },
  
  // Size objects - Easy level (1.8x ratio)
  circle_big: { type: 'circle', color: '#FF6B6B', radius: 60 },
  circle_small: { type: 'circle', color: '#FF6B6B', radius: 30 },
  circle_medium: { type: 'circle', color: '#FF6B6B', radius: 45 },
  circle_tiny: { type: 'circle', color: '#FF6B6B', radius: 25 },
  triangle_big: { type: 'triangle', color: '#4ECDC4', size: 80 },
  triangle_small: { type: 'triangle', color: '#4ECDC4', size: 45 },
  triangle_medium: { type: 'triangle', color: '#4ECDC4', size: 60 },
  triangle_large: { type: 'triangle', color: '#4ECDC4', size: 90 },
  square_big: { type: 'square', color: '#32CD32', size: 72 },
  square_small: { type: 'square', color: '#32CD32', size: 40 },
  square_medium: { type: 'square', color: '#32CD32', size: 56 },
  star_big: { type: 'star', color: '#FFD700', size: 54 },
  star_small: { type: 'star', color: '#FFD700', size: 30 },
  star_medium: { type: 'star', color: '#FFD700', size: 42 },
  heart_big: { type: 'heart', color: '#FF1493', size: 63 },
  heart_small: { type: 'heart', color: '#FF1493', size: 35 },
  heart_medium: { type: 'heart', color: '#FF1493', size: 49 },
  
  // Size objects - Hard level (1.2x ratio)
  square_close1: { type: 'square', color: '#32CD32', size: 48 },
  square_close2: { type: 'square', color: '#32CD32', size: 40 },
  square_close3: { type: 'square', color: '#32CD32', size: 44 },
  triangle_close1: { type: 'triangle', color: '#4ECDC4', size: 60 },
  triangle_close2: { type: 'triangle', color: '#4ECDC4', size: 50 },
  triangle_close3: { type: 'triangle', color: '#4ECDC4', size: 55 },
  circle_close1: { type: 'circle', color: '#FF6B6B', radius: 40 },
  circle_close2: { type: 'circle', color: '#FF6B6B', radius: 48 },
  circle_close3: { type: 'circle', color: '#FF6B6B', radius: 44 },
  
  // Mass objects
  basket_full: { type: 'basket', color: '#D2691E', fullness: 'full' },
  basket_empty: { type: 'basket', color: '#D2691E', fullness: 'empty' },
  elephant_big: { type: 'animal', color: '#808080', species: 'elephant', radius: 80 },
  cat_small: { type: 'animal', color: '#FFA500', species: 'cat', radius: 30 },
  bag_full: { type: 'bag', color: '#4169E1', contents: 'books' },
  bag_light: { type: 'bag', color: '#4169E1', contents: 'empty' },
  rock_heavy: { type: 'rock', color: '#696969', radius: 60 },
  feather_light: { type: 'feather', color: '#FFFFFF', length: 40 },
  box_heavy: { type: 'box', color: '#8B4513', contents: 'full' },
  box_light: { type: 'box', color: '#8B4513', contents: 'empty' },
  circle_big: { type: 'circle', color: '#FF6347', radius: 50 },
  circle_small: { type: 'circle', color: '#FF6347', radius: 30 },
  
  // Precise measurement objects for ordering
  pencil_6units: { type: 'pencil', color: '#FFD700', length: 60, units: 6 },
  pencil_8units: { type: 'pencil', color: '#FFD700', length: 80, units: 8 },
  pencil_11units: { type: 'pencil', color: '#FFD700', length: 110, units: 11 },
  pencil_9units: { type: 'pencil', color: '#FFD700', length: 90, units: 9 },
  pencil_10units: { type: 'pencil', color: '#FFD700', length: 100, units: 10 },
  pencil_12units: { type: 'pencil', color: '#FFD700', length: 120, units: 12 },
  pencil_3units: { type: 'pencil', color: '#FFD700', length: 30, units: 3 },
  pencil_4units: { type: 'pencil', color: '#FFD700', length: 40, units: 4 },
  
  bottle_5units: { type: 'bottle', color: '#4169E1', height: 50, units: 5 },
  bottle_7units: { type: 'bottle', color: '#4169E1', height: 70, units: 7 },
  bottle_10units: { type: 'bottle', color: '#4169E1', height: 100, units: 10 },
  bottle_12units: { type: 'bottle', color: '#4169E1', height: 120, units: 12 },
  bottle_14units: { type: 'bottle', color: '#4169E1', height: 140, units: 14 },
  bottle_16units: { type: 'bottle', color: '#4169E1', height: 160, units: 16 },
  bottle_17units: { type: 'bottle', color: '#4169E1', height: 170, units: 17 },
  bottle_13units: { type: 'bottle', color: '#4169E1', height: 130, units: 13 },
  
  circle_4units: { type: 'circle', color: '#FF6B6B', radius: 20, units: 4 },
  circle_6units: { type: 'circle', color: '#FF6B6B', radius: 30, units: 6 },
  circle_8units: { type: 'circle', color: '#FF6B6B', radius: 40, units: 8 },
  circle_9units: { type: 'circle', color: '#FF6B6B', radius: 45, units: 9 },
  circle_11units: { type: 'circle', color: '#FF6B6B', radius: 55, units: 11 },
  circle_3units: { type: 'circle', color: '#FF6B6B', radius: 15, units: 3 },
  circle_5units: { type: 'circle', color: '#FF6B6B', radius: 25, units: 5 },
  
  child_7units: { type: 'person', color: '#87CEEB', height: 70, units: 7 },
  child_8units: { type: 'person', color: '#87CEEB', height: 80, units: 8 },
  child_9units: { type: 'person', color: '#87CEEB', height: 90, units: 9 },
  
  tree_4units: { type: 'tree', color: '#228B22', height: 40, units: 4 },
  tree_6units: { type: 'tree', color: '#228B22', height: 60, units: 6 },
  tree_8units: { type: 'tree', color: '#228B22', height: 80, units: 8 },
  
  // Sorting objects
  rope_7units: { type: 'rope', color: '#8B4513', length: 70, units: 7 },
  rope_3units: { type: 'rope', color: '#8B4513', length: 30, units: 3 },
  rope_8units: { type: 'rope', color: '#8B4513', length: 80, units: 8 },
  rope_2units: { type: 'rope', color: '#8B4513', length: 20, units: 2 },
  
  building_6units: { type: 'building', color: '#708090', height: 60, units: 6 },
  building_3units: { type: 'building', color: '#708090', height: 30, units: 3 },
  building_7units: { type: 'building', color: '#708090', height: 70, units: 7 },
  building_2units: { type: 'building', color: '#708090', height: 20, units: 2 },
  
  ball_6units: { type: 'ball', color: '#FF4500', radius: 30, units: 6 },
  ball_3units: { type: 'ball', color: '#FF4500', radius: 15, units: 3 },
  ball_7units: { type: 'ball', color: '#FF4500', radius: 35, units: 7 },
  ball_2units: { type: 'ball', color: '#FF4500', radius: 10, units: 2 },
  
  stick_12units: { type: 'stick', color: '#8B4513', length: 120, units: 12 },
  stick_9units: { type: 'stick', color: '#8B4513', length: 90, units: 9 },
  stick_11units: { type: 'stick', color: '#8B4513', length: 110, units: 11 },
  stick_8units: { type: 'stick', color: '#8B4513', length: 80, units: 8 },
  
  // Time scenes
  scene_sun_bright: { type: 'scene', timeOfDay: 'day', elements: ['sun', 'clouds'] },
  scene_moon_stars: { type: 'scene', timeOfDay: 'night', elements: ['moon', 'stars'] },
  scene_breakfast: { type: 'scene', timeOfDay: 'morning', elements: ['table', 'breakfast'] },
  scene_sunset: { type: 'scene', timeOfDay: 'evening', elements: ['sun', 'orange_sky'] },
  scene_playground: { type: 'scene', timeOfDay: 'day', elements: ['children', 'swings'] },
  scene_sunrise: { type: 'scene', timeOfDay: 'morning', elements: ['sun', 'pink_sky'] },
  scene_dawn: { type: 'scene', timeOfDay: 'early_morning', elements: ['dim_sun', 'mist'] },
  
  // Coin combinations
  coins_Rs1_Rs5: { type: 'coin_combo', coins: ['Rs1', 'Rs5'], total: 6 },
  coins_Rs5_Rs5: { type: 'coin_combo', coins: ['Rs5', 'Rs5'], total: 10 },
  coins_Rs1_Rs1: { type: 'coin_combo', coins: ['Rs1', 'Rs1'], total: 2 }
};

// Mauritian coins for money questions
export const mauritianCoins = {
  '1c': { value: 0.01, color: '#CD7F32', size: 20 },
  '5c': { value: 0.05, color: '#CD7F32', size: 22 },
  'Rs1': { value: 1, color: '#C0C0C0', size: 24 },
  'Rs5': { value: 5, color: '#C0C0C0', size: 26 },
  'Rs10': { value: 10, color: '#FFD700', size: 28 }
};
