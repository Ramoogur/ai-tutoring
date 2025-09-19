import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { timeQuestions, timeColors, timeAssets } from './timeQuestions';
import { aiController } from '../../../utils/aiController';
import { aiTutor } from '../../../utils/aiTutor';
import './Time.css';

const Time = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [droppedShapes, setDroppedShapes] = useState({}); // Track which item is dropped in each zone
  const [sequencedItems, setSequencedItems] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [sceneElements, setSceneElements] = useState({});
  const [coloredScenes, setColoredScenes] = useState(new Set());
  const [selectedColor, setSelectedColor] = useState(null);
  const [litTargets, setLitTargets] = useState(new Set());
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [sessionData, setSessionData] = useState({ correct: 0, total: 0 });
  const [hasAnswered, setHasAnswered] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Normalize AI difficulty names to quiz difficulty names
  const normalizeDifficultyName = (aiDifficulty) => {
    const difficultyMap = {
      'Beginner': 'easy',
      'Easy': 'easy', 
      'Medium': 'medium',
      'Hard': 'hard',
      'Expert': 'hard'
    };
    return difficultyMap[aiDifficulty] || aiDifficulty.toLowerCase();
  };

  // AI-Enhanced initialization with adaptive difficulty
  useEffect(() => {
    (async () => {
      if (!topic || !user) return;
      
      // Reset quiz state
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setFeedback(null);
      setAiFeedback(null);
      setMatchedPairs(new Set());
      setDroppedShapes({});
      setSequencedItems([]);
      setColoredScenes(new Set());
      setSelectedColor(null);
      setLitTargets(new Set());
      setSessionData({ correct: 0, total: 0 });
      
      // Load current difficulty from database
      let savedDifficulty = 'easy'; // Default
      try {
        const { data: studentStats, error } = await supabase
          .from('StudentTopicStats')
          .select('current_difficulty')
          .eq('student_id', user.id)
          .eq('topic_id', topic.id)
          .maybeSingle();
        
        if (error) {
          console.log('🆆 Database query error:', error);
        } else if (studentStats?.current_difficulty) {
          savedDifficulty = studentStats.current_difficulty;
          console.log(`💾 Loaded saved difficulty: ${savedDifficulty}`);
        } else {
          console.log('🆆 No previous progress found, starting at Easy level');
        }
      } catch (error) {
        console.log('🆆 No previous progress found, starting at Easy level');
      }
      
      // Initialize AI system for Time with correct difficulty
      console.log(`🤖 Initializing AI Tutor for Time at ${savedDifficulty} difficulty`);
      aiController.startQuizSession('time');
      
      // Set AI to the correct difficulty level from database BEFORE starting
      aiTutor.setDifficultyForNextSession(savedDifficulty);
      setAiStatus(aiController.getAIStatus());
      
      // Use the loaded difficulty level and update state
      let difficultyLevel = savedDifficulty;
      setDifficulty(savedDifficulty); // Update React state for UI display
      console.log(`🎯 Starting quiz at difficulty: ${difficultyLevel}`);
      
      // Get all available questions across difficulties for AI selection
      const allQuestions = [
        ...(timeQuestions.easy || []).map(q => ({ ...q, difficulty: 'easy' })),
        ...(timeQuestions.medium || []).map(q => ({ ...q, difficulty: 'medium' })),
        ...(timeQuestions.hard || []).map(q => ({ ...q, difficulty: 'hard' }))
      ];
      
      // Let AI select optimal questions based on performance
      let selectedQuestions = [];
      if (allQuestions.length > 0) {
        selectedQuestions = aiController.prepareQuestions(allQuestions, 5);
        console.log(`🧠 AI selected ${selectedQuestions.length} personalized questions`);
      } else {
        console.warn('No questions available for AI selection');
        // Fallback to traditional difficulty-based selection
        switch (difficultyLevel) {
          case 'easy':
            selectedQuestions = timeQuestions.easy.slice(0, 5);
            break;
          case 'medium':
            selectedQuestions = [...timeQuestions.easy.slice(0, 2), ...timeQuestions.medium.slice(0, 3)];
            break;
          case 'hard':
            selectedQuestions = [...timeQuestions.medium.slice(0, 2), ...timeQuestions.hard.slice(0, 3)];
            break;
          default:
            selectedQuestions = timeQuestions.easy.slice(0, 5);
        }
        // Shuffle questions for variety
        selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
      }
      
      setQuestions(selectedQuestions);
      
      // Start tracking the first question with AI
      if (selectedQuestions.length > 0) {
        const questionTrackingData = aiController.startQuestion(selectedQuestions[0]);
        setQuestionStartTime(questionTrackingData.startTime);
      }
      
    })();
  }, [topic, user]);

  // Generate SVG for time elements
  const generateTimeSVG = (element, color = '#FFD700', size = 100) => {
    const center = size / 2;
    let svgElement = '';

    switch (element) {
      case 'sun':
        svgElement = `
          <circle cx="${center}" cy="${center}" r="${size * 0.3}" fill="${color}" stroke="#FF9800" stroke-width="2" />
          ${Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = center + Math.cos(angle) * (size * 0.4);
            const y1 = center + Math.sin(angle) * (size * 0.4);
            const x2 = center + Math.cos(angle) * (size * 0.5);
            const y2 = center + Math.sin(angle) * (size * 0.5);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round" />`;
          }).join('')}
        `;
        break;
      case 'moon':
        svgElement = `
          <path d="M ${center + 10} ${center - 30} A 30 30 0 1 0 ${center + 10} ${center + 30} A 25 25 0 1 1 ${center + 10} ${center - 30} Z" 
                fill="${color}" stroke="#90CAF9" stroke-width="2" />
        `;
        break;
      case 'stars':
        svgElement = Array.from({ length: 5 }, (_, i) => {
          const x = center + (Math.random() - 0.5) * size * 0.8;
          const y = center + (Math.random() - 0.5) * size * 0.8;
          return `<polygon points="${x},${y-8} ${x+3},${y-3} ${x+8},${y-3} ${x+4},${y+1} ${x+6},${y+8} ${x},${y+4} ${x-6},${y+8} ${x-4},${y+1} ${x-8},${y-3} ${x-3},${y-3}" fill="${color}" />`;
        }).join('');
        break;
      default:
        svgElement = `<circle cx="${center}" cy="${center}" r="${size * 0.3}" fill="${color}" />`;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="time-svg">
        <rect width="${size}" height="${size}" fill="${element === 'sun' ? '#87CEEB' : '#1a1a2e'}" rx="10" />
        ${svgElement}
      </svg>
    `;
  };

  const generateScenarioSVG = (scenario) => {
    const size = 200;
    const center = size / 2;
    
    switch (scenario) {
      case 'child_eating_lunch':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="scenario-svg">
            <!-- Background - afternoon sky -->
            <rect width="${size}" height="${size}" fill="#87CEEB" rx="10" />
            <!-- Sun positioned for afternoon -->
            <circle cx="160" cy="40" r="25" fill="#FFD700" stroke="#FF9800" stroke-width="2" />
            <!-- Table -->
            <rect x="50" y="120" width="100" height="60" fill="#8B4513" rx="5" />
            <!-- Plate -->
            <ellipse cx="100" cy="140" rx="20" ry="15" fill="#FFFFFF" stroke="#DDD" stroke-width="2" />
            <!-- Food on plate -->
            <circle cx="95" cy="135" r="5" fill="#FF6B6B" />
            <circle cx="105" cy="135" r="5" fill="#4ECDC4" />
            <rect x="97" y="142" width="6" height="8" fill="#95E1D3" />
            <!-- Child figure -->
            <circle cx="100" cy="90" r="15" fill="#FDBCB4" />
            <rect x="90" y="105" width="20" height="25" fill="#74B9FF" rx="3" />
            <!-- Arms reaching for food -->
            <rect x="85" y="110" width="8" height="15" fill="#FDBCB4" rx="4" />
            <rect x="107" y="110" width="8" height="15" fill="#FDBCB4" rx="4" />
            <!-- Clock showing 12:00 (lunch time) -->
            <circle cx="30" cy="30" r="20" fill="#FFFFFF" stroke="#333" stroke-width="2" />
            <line x1="30" y1="15" x2="30" y2="30" stroke="#333" stroke-width="2" />
            <line x1="30" y1="30" x2="30" y2="45" stroke="#333" stroke-width="2" />
            <text x="25" y="55" font-size="10" fill="#333">12:00</text>
          </svg>
        `;
      default:
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="scenario-svg">
            <rect width="${size}" height="${size}" fill="#f0f0f0" rx="10" />
            <text x="${center}" y="${center}" text-anchor="middle" font-size="14" fill="#666">Scenario Image</text>
          </svg>
        `;
    }
  };

  const getScenarioDescription = (scenario) => {
    switch (scenario) {
      case 'child_eating_lunch':
        return 'A child is eating lunch at the table';
      default:
        return 'Daily activity scene';
    }
  };

  const generateImageSVG = (imageName) => {
    const size = 150;
    const center = size / 2;
    
    switch (imageName) {
      case 'sleeping_child':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Night sky background -->
            <rect width="${size}" height="${size}" fill="#1a1a2e" rx="10" />
            <!-- Moon -->
            <circle cx="120" cy="30" r="15" fill="#FFF8DC" />
            <!-- Stars -->
            <circle cx="30" cy="25" r="2" fill="#FFFF00" />
            <circle cx="50" cy="15" r="2" fill="#FFFF00" />
            <circle cx="100" cy="20" r="2" fill="#FFFF00" />
            <!-- Bed -->
            <rect x="30" y="80" width="90" height="50" fill="#8B4513" rx="5" />
            <rect x="25" y="75" width="100" height="10" fill="#FFFFFF" rx="5" />
            <!-- Child sleeping -->
            <circle cx="75" cy="90" r="12" fill="#FDBCB4" />
            <rect x="65" y="100" width="20" height="25" fill="#87CEEB" rx="3" />
            <!-- Pillow -->
            <ellipse cx="75" cy="85" rx="18" ry="8" fill="#FFFFFF" />
            <!-- Zzz -->
            <text x="95" y="70" font-size="12" fill="#FFFFFF">Z</text>
            <text x="105" y="60" font-size="10" fill="#FFFFFF">z</text>
            <text x="110" y="50" font-size="8" fill="#FFFFFF">z</text>
          </svg>
        `;
      case 'bright_sun':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Day sky background -->
            <rect width="${size}" height="${size}" fill="#87CEEB" rx="10" />
            <!-- Sun with rays -->
            <circle cx="${center}" cy="${center}" r="30" fill="#FFD700" stroke="#FF9800" stroke-width="3" />
            ${Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const x1 = center + Math.cos(angle) * 40;
              const y1 = center + Math.sin(angle) * 40;
              const x2 = center + Math.cos(angle) * 55;
              const y2 = center + Math.sin(angle) * 55;
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />`;
            }).join('')}
            <!-- Clouds -->
            <ellipse cx="30" cy="30" rx="15" ry="8" fill="#FFFFFF" opacity="0.8" />
            <ellipse cx="120" cy="40" rx="12" ry="6" fill="#FFFFFF" opacity="0.8" />
          </svg>
        `;
      case 'daytime_sky':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Bright day sky -->
            <rect width="${size}" height="${size}" fill="#87CEEB" rx="10" />
            <!-- Sun -->
            <circle cx="120" cy="30" r="20" fill="#FFD700" />
            <!-- White clouds -->
            <ellipse cx="40" cy="40" rx="20" ry="12" fill="#FFFFFF" />
            <ellipse cx="80" cy="50" rx="25" ry="15" fill="#FFFFFF" />
            <ellipse cx="30" cy="100" rx="18" ry="10" fill="#FFFFFF" />
            <!-- Ground -->
            <rect x="0" y="120" width="${size}" height="30" fill="#90EE90" />
            <!-- Note: No visible stars during day -->
            <text x="${center}" y="${center + 20}" text-anchor="middle" font-size="12" fill="#333">Daytime Sky</text>
          </svg>
        `;
      case 'moon_phases':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Dark sky background -->
            <rect width="${size}" height="${size}" fill="#1a1a2e" rx="10" />
            <!-- Full moon (visible during day sometimes) -->
            <circle cx="${center}" cy="${center}" r="25" fill="#FFF8DC" stroke="#F0E68C" stroke-width="2" />
            <!-- Moon craters -->
            <circle cx="${center - 8}" cy="${center - 5}" r="3" fill="#E6E6FA" opacity="0.7" />
            <circle cx="${center + 5}" cy="${center + 8}" r="4" fill="#E6E6FA" opacity="0.7" />
            <circle cx="${center + 10}" cy="${center - 10}" r="2" fill="#E6E6FA" opacity="0.7" />
            <!-- Faint stars -->
            <circle cx="30" cy="30" r="1" fill="#FFFF00" opacity="0.6" />
            <circle cx="120" cy="25" r="1" fill="#FFFF00" opacity="0.6" />
            <circle cx="100" cy="120" r="1" fill="#FFFF00" opacity="0.6" />
          </svg>
        `;
      case 'bedtime_story':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Night scene background -->
            <rect width="${size}" height="${size}" fill="#2c2c54" rx="10" />
            <!-- Bed -->
            <rect x="20" y="90" width="110" height="40" fill="#8B4513" rx="5" />
            <rect x="15" y="85" width="120" height="10" fill="#FFFFFF" rx="5" />
            <!-- Parent sitting -->
            <circle cx="40" cy="75" r="15" fill="#FDBCB4" />
            <rect x="30" y="90" width="20" height="35" fill="#4169E1" rx="3" />
            <!-- Child in bed -->
            <circle cx="90" cy="85" r="10" fill="#FDBCB4" />
            <rect x="80" y="95" width="20" height="20" fill="#87CEEB" rx="3" />
            <!-- Book -->
            <rect x="35" y="70" width="12" height="8" fill="#FF6347" rx="1" />
            <!-- Moon through window -->
            <rect x="110" y="20" width="30" height="40" fill="#1a1a2e" rx="5" />
            <circle cx="125" cy="35" r="8" fill="#FFF8DC" />
            <!-- Stars -->
            <circle cx="115" cy="25" r="1" fill="#FFFF00" />
            <circle cx="135" cy="30" r="1" fill="#FFFF00" />
            <text x="${center}" y="140" text-anchor="middle" font-size="10" fill="#FFFFFF">Bedtime Story</text>
          </svg>
        `;
      case 'eating_lunch':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Day background -->
            <rect width="${size}" height="${size}" fill="#87CEEB" rx="10" />
            <!-- Sun -->
            <circle cx="120" cy="30" r="15" fill="#FFD700" />
            <!-- Table -->
            <rect x="30" y="80" width="90" height="50" fill="#8B4513" rx="5" />
            <!-- Child sitting -->
            <circle cx="75" cy="65" r="12" fill="#FDBCB4" />
            <rect x="65" y="77" width="20" height="25" fill="#FF69B4" rx="3" />
            <!-- Plate -->
            <circle cx="75" cy="90" r="12" fill="#FFFFFF" stroke="#DDD" stroke-width="2" />
            <!-- Food on plate -->
            <circle cx="70" cy="87" r="3" fill="#FF6347" />
            <circle cx="80" cy="87" r="3" fill="#32CD32" />
            <rect x="72" y="92" width="6" height="3" fill="#FFD700" />
            <!-- Fork -->
            <rect x="85" y="88" width="8" height="2" fill="#C0C0C0" />
            <text x="${center}" y="140" text-anchor="middle" font-size="10" fill="#333">Eating Lunch</text>
          </svg>
        `;
      case 'eating_breakfast':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Morning background -->
            <rect width="${size}" height="${size}" fill="#FFF8DC" rx="10" />
            <!-- Sun rising -->
            <circle cx="130" cy="40" r="18" fill="#FFD700" />
            <!-- Table -->
            <rect x="25" y="75" width="100" height="55" fill="#8B4513" rx="5" />
            <!-- Child sitting -->
            <circle cx="75" cy="60" r="12" fill="#FDBCB4" />
            <rect x="65" y="72" width="20" height="25" fill="#00CED1" rx="3" />
            <!-- Bowl -->
            <ellipse cx="75" cy="85" rx="15" ry="8" fill="#FFFFFF" stroke="#DDD" stroke-width="2" />
            <!-- Cereal -->
            <circle cx="70" cy="83" r="2" fill="#D2691E" />
            <circle cx="80" cy="83" r="2" fill="#D2691E" />
            <circle cx="75" cy="87" r="2" fill="#D2691E" />
            <!-- Spoon -->
            <rect x="90" y="83" width="8" height="2" fill="#C0C0C0" />
            <!-- Milk glass -->
            <rect x="95" y="75" width="8" height="15" fill="#FFFFFF" stroke="#DDD" stroke-width="1" rx="1" />
            <text x="${center}" y="140" text-anchor="middle" font-size="10" fill="#333">Eating Breakfast</text>
          </svg>
        `;
      case 'eating_dinner':
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <!-- Evening background -->
            <rect width="${size}" height="${size}" fill="#4B0082" rx="10" />
            <!-- Window with evening sky -->
            <rect x="100" y="20" width="40" height="30" fill="#2F4F4F" rx="3" />
            <!-- Table -->
            <rect x="20" y="80" width="110" height="50" fill="#8B4513" rx="5" />
            <!-- Family members -->
            <circle cx="50" cy="65" r="10" fill="#FDBCB4" />
            <circle cx="100" cy="65" r="10" fill="#FDBCB4" />
            <rect x="45" y="75" width="15" height="20" fill="#FF1493" rx="2" />
            <rect x="95" y="75" width="15" height="20" fill="#4169E1" rx="2" />
            <!-- Plates -->
            <circle cx="50" cy="90" r="10" fill="#FFFFFF" stroke="#DDD" stroke-width="2" />
            <circle cx="100" cy="90" r="10" fill="#FFFFFF" stroke="#DDD" stroke-width="2" />
            <!-- Food -->
            <rect x="45" y="87" width="10" height="6" fill="#8B4513" />
            <circle cx="100" cy="88" r="3" fill="#FF6347" />
            <text x="${center}" y="140" text-anchor="middle" font-size="10" fill="#FFFFFF">Family Dinner</text>
          </svg>
        `;
      default:
        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="image-svg">
            <rect width="${size}" height="${size}" fill="#f0f0f0" rx="10" />
            <text x="${center}" y="${center}" text-anchor="middle" font-size="14" fill="#666">Image</text>
          </svg>
        `;
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      // Always accept the drop regardless of correctness (like ShapesColors)
      setMatchedPairs(new Set([...matchedPairs, target]));
      setDroppedShapes(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSceneClick = (sceneId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'coloring' && selectedColor) {
      const scene = currentQuestion.scenes.find(s => s.id === sceneId);
      if (scene && selectedColor === scene.targetColor) {
        setColoredScenes(prev => new Set([...prev, sceneId]));
      }
    }
  };

  const handleSceneElementClick = (elementId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'scene_building') {
      const element = currentQuestion.elements?.find(el => el.id === elementId);
      if (element) {
        setSceneElements(prev => {
          const newElements = { ...prev };
          if (element.type === 'background') {
            newElements[elementId] = element.targetColor;
          } else if (element.type === 'multiple_objects') {
            newElements.stars = true;
            newElements.starCount = (newElements.starCount || 0) + 1;
            if (newElements.starCount > (element.count || 3)) {
              newElements.starCount = element.count || 3;
            }
          } else {
            newElements[elementId] = !newElements[elementId];
          }
          return newElements;
        });
      }
    }
  };

  const handleInteractiveClick = (targetId) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'interactive') {
      setLitTargets(new Set([targetId]));
      setSelectedOption(targetId);
    }
  };

  const playAudioSound = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion.type !== 'audio_visual') return;
    
    setAudioPlaying(true);
    
    try {
      // Create audio based on the sound type
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (currentQuestion.sound === 'rooster_crow') {
        // Generate rooster crow sound simulation
        playRoosterSound(audioContext);
      } else if (currentQuestion.sound === 'cricket_chirping') {
        // Generate cricket chirping sound simulation
        playCricketSound(audioContext);
      } else {
        // Default notification sound
        playDefaultSound(audioContext);
      }
      
    } catch (error) {
      console.warn('Audio playback not supported:', error);
      // Fallback: just show visual feedback
      setTimeout(() => setAudioPlaying(false), 2000);
    }
  };
  
  const playRoosterSound = (audioContext) => {
    // Realistic rooster crow - distinctive "Cock-a-doodle-doo!" pattern
    const createRoosterSyllable = (startTime, frequency, duration, volume = 0.2) => {
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Mix two oscillators for richer rooster sound
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Primary frequency
      oscillator1.frequency.setValueAtTime(frequency, startTime);
      oscillator1.type = 'sawtooth';
      
      // Harmonic for richness
      oscillator2.frequency.setValueAtTime(frequency * 0.5, startTime);
      oscillator2.type = 'triangle';
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator1.start(startTime);
      oscillator1.stop(startTime + duration);
      oscillator2.start(startTime);
      oscillator2.stop(startTime + duration);
    };
    
    const baseTime = audioContext.currentTime;
    
    // "COCK" - sharp, high start
    createRoosterSyllable(baseTime, 600, 0.3, 0.25);
    
    // "A" - quick transition
    createRoosterSyllable(baseTime + 0.35, 400, 0.15, 0.15);
    
    // "DOO" - sustained middle note
    createRoosterSyllable(baseTime + 0.55, 500, 0.4, 0.2);
    
    // "DLE" - quick dip
    createRoosterSyllable(baseTime + 1.0, 350, 0.2, 0.15);
    
    // "DOO" - final flourish, higher pitch
    createRoosterSyllable(baseTime + 1.25, 650, 0.5, 0.22);
    
    setTimeout(() => setAudioPlaying(false), 2000);
  };
  
  const playCricketSound = (audioContext) => {
    // Child-friendly cricket chirping - gentle nighttime sounds
    const createChirp = (startTime, pitch) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Softer cricket frequency - not too high-pitched for children
      oscillator.frequency.setValueAtTime(pitch, startTime);
      oscillator.frequency.linearRampToValueAtTime(pitch * 1.1, startTime + 0.05);
      oscillator.type = 'sine';
      
      // Very gentle volume for bedtime association
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.02); // Much quieter
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    };
    
    // Create gentle cricket chorus with varying pitches
    const basePitch = 1800; // Lower than before
    for (let i = 0; i < 6; i++) {
      const pitch = basePitch + (Math.random() * 400 - 200); // Vary pitch slightly
      createChirp(audioContext.currentTime + i * 0.3, pitch);
    }
    
    // Add a second layer of softer chirps
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        const pitch = basePitch + (Math.random() * 300 - 150);
        createChirp(audioContext.currentTime + i * 0.4, pitch);
      }
    }, 800);
    
    setTimeout(() => setAudioPlaying(false), 2500);
  };
  
  const playDefaultSound = (audioContext) => {
    // Simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    setTimeout(() => setAudioPlaying(false), 500);
  };

  const checkAnswer = async () => {
    if (isChecking) return;
    setIsChecking(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let feedbackMessage = '';

    switch (currentQuestion.type) {
      case 'identification':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'matching':
        // Count correct matches in dropped shapes
        let correctMatches = 0;
        Object.entries(droppedShapes).forEach(([target, item]) => {
          if (item.timeOfDay === target) {
            correctMatches++;
          }
        });
        isCorrect = correctMatches === currentQuestion.items.length;
        break;
      case 'fill_blank':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'true_false':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'coloring':
        isCorrect = coloredScenes.size === currentQuestion.scenes.length;
        break;
      case 'sequencing':
        isCorrect = sequencedItems.every((item, index) => item && item.correctOrder === index + 1);
        break;
      case 'interactive':
        isCorrect = selectedOption === currentQuestion.correctTarget;
        break;
      case 'audio_visual':
        isCorrect = selectedOption === currentQuestion.correctAnswer;
        break;
      case 'multiple_choice':
        if (currentQuestion.multipleCorrect) {
          const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect);
          const selectedCorrectOptions = selectedOptions.filter(opt => opt.isCorrect);
          isCorrect = correctOptions.length === selectedCorrectOptions.length && 
                     selectedCorrectOptions.every(opt => correctOptions.includes(opt));
        } else {
          isCorrect = selectedOption?.isCorrect;
        }
        break;
      case 'scene_building':
        const requiredElements = currentQuestion.elements?.filter(el => el.required) || [];
        isCorrect = requiredElements.every(element => {
          if (element.type === 'background') {
            return sceneElements[element.id] === element.targetColor;
          } else if (element.type === 'multiple_objects') {
            return sceneElements.starCount >= (element.count || 1);
          } else {
            return sceneElements[element.id] === true;
          }
        });
        break;
      case 'text_input':
        // Validate text input against multiple correct answers (case-insensitive)
        const userInput = textInput?.trim().toLowerCase();
        const correctAnswers = currentQuestion.correctAnswers.map(answer => answer.toLowerCase());
        isCorrect = correctAnswers.includes(userInput);
        break;
      default:
        isCorrect = false;
    }

    setFeedback({ message: feedbackMessage, isCorrect });
    setScore(prevScore => isCorrect ? prevScore + 1 : prevScore);
    setSessionData(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setHasAnswered(true);

    // AI Analysis with performance tracking
    let aiAnalysisResult = aiController.processAnswer(
      currentQuestion,
      isCorrect,
      selectedOption || droppedShapes || coloredScenes || sequencedItems
    );
    
    console.log(` AI Analysis: ${isCorrect ? 'Correct' : 'Incorrect'} - ${aiAnalysisResult.aiFeedback.message}`);
    
    // Update AI status
    setAiStatus(aiController.getAIStatus());
    
    // Set AI feedback
    setAiFeedback(aiAnalysisResult.aiFeedback);

    // Save individual question result to database (optional - for detailed tracking)
    if (user && topic) {
      try {
        // Note: We're not saving individual questions to avoid 404 errors
        // All data will be saved comprehensively in finishQuiz()
        console.log(` Question ${currentQuestionIndex + 1} completed: ${isCorrect ? 'Correct' : 'Incorrect'}`);
      } catch (error) {
        console.warn('Individual question save skipped:', error);
      }
    }

    setTimeout(() => {
      setIsChecking(false);
      if (currentQuestionIndex + 1 < questions.length) {
        // Next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetQuestionState();
        
        // Start tracking next question
        const nextQuestion = questions[currentQuestionIndex + 1];
        const questionTrackingData = aiController.startQuestion(nextQuestion);
        setQuestionStartTime(questionTrackingData.startTime);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setSelectedOption(null);
    setTextInput('');
    setMatchedPairs(new Set());
    setDroppedShapes({});
    setSequencedItems([]);
    setSelectedOptions([]);
    setSceneElements({});
    setColoredScenes(new Set());
    setSelectedColor(null);
    setLitTargets(new Set());
    setFeedback(null);
    setAiFeedback(null);
    setHasAnswered(false);
    setQuestionStartTime(Date.now());
  };

  const finishQuiz = async () => {
    // Complete the quiz session with AI analysis
    const sessionSummary = await aiController.completeQuizSession({
      totalQuestions: questions.length,
      correctAnswers: score,
      topic: 'time',
      difficulty: difficulty,
      sessionData: sessionData
    });

    console.log('📊 Session Summary:', sessionSummary);

    // Calculate session accuracy for difficulty progression
    const sessionAccuracy = sessionData.total > 0 ? sessionData.correct / sessionData.total : 0;
    console.log(`📈 Session accuracy: ${(sessionAccuracy * 100).toFixed(1)}%`);

    // Determine next difficulty based on session performance
    let nextDifficulty = difficulty;
    let difficultyChanged = false;
    let progressionReason = '';

    if (sessionAccuracy >= 0.8) {
      // 80%+ accuracy - move up or stay at hard
      if (difficulty === 'easy') {
        nextDifficulty = 'medium';
        difficultyChanged = true;
        progressionReason = 'Excellent work! Moving to Medium level.';
      } else if (difficulty === 'medium') {
        nextDifficulty = 'hard';
        difficultyChanged = true;
        progressionReason = 'Outstanding performance! Moving to Hard level.';
      } else {
        progressionReason = 'Perfect! Staying at Hard level with new challenges.';
      }
    } else if (sessionAccuracy >= 0.6) {
      // 60-79% accuracy - stay at current level
      progressionReason = 'Good progress! Staying at current level to build confidence.';
    } else {
      // <60% accuracy - move down
      if (difficulty === 'hard') {
        nextDifficulty = 'medium';
        difficultyChanged = true;
        progressionReason = 'Let\'s practice more at Medium level.';
      } else if (difficulty === 'medium') {
        nextDifficulty = 'easy';
        difficultyChanged = true;
        progressionReason = 'Let\'s build stronger foundations at Easy level.';
      } else {
        progressionReason = 'Keep practicing! You\'re building important skills.';
      }
    }

    console.log(`🎯 Difficulty progression: ${difficulty} → ${nextDifficulty} (${progressionReason})`);

    // Save comprehensive session data to database
    if (user && topic) {
      try {
        console.log(`💾 Saving progress for student_id: ${user.id}, topic_id: ${topic.id}`);
        
        // Save to StudentTopicStats (overall progress)
        const { error: statsError } = await supabase
          .from('StudentTopicStats')
          .upsert({
            student_id: user.id,
            topic_id: topic.id,
            current_difficulty: nextDifficulty,
            last_accuracy: sessionAccuracy,
            total_attempts: sessionData.total,
            correct_answers: sessionData.correct,
            last_attempted: new Date().toISOString(),
            progress_data: {
              session_accuracy: sessionAccuracy,
              difficulty_progression: {
                from: difficulty,
                to: nextDifficulty,
                reason: progressionReason,
                changed: difficultyChanged
              },
              ai_insights: sessionSummary.insights || []
            }
          }, {
            onConflict: 'student_id,topic_id'
          });

        if (statsError) {
          console.error('Error saving student stats:', statsError);
        } else {
          console.log('✅ Student progress saved successfully');
        }

        // Save to QuizSessions (detailed session record)
        const { error: sessionError } = await supabase
          .from('QuizSessions')
          .insert({
            student_id: user.id,
            topic_id: topic.id,
            session_date: new Date().toISOString(),
            difficulty_level: difficulty,
            questions_attempted: sessionData.total,
            correct_answers: sessionData.correct,
            accuracy_percentage: sessionAccuracy * 100,
            time_spent: Math.floor((Date.now() - (questionStartTime || Date.now())) / 1000),
            next_difficulty: nextDifficulty,
            difficulty_changed: difficultyChanged,
            ai_feedback: sessionSummary,
            question_details: questions.map((q, index) => ({
              question_id: q.id,
              question_type: q.type,
              difficulty: q.difficulty || difficulty,
              correct: index < score // Simple approximation
            }))
          });

        if (sessionError) {
          console.error('Error saving session:', sessionError);
        } else {
          console.log('✅ Session details saved successfully');
        }

      } catch (error) {
        console.error('Database save error:', error);
      }
    }

    // Store progression info for results display
    setAiFeedback(prev => ({
      ...prev,
      difficultyProgression: {
        currentLevel: difficulty,
        nextLevel: nextDifficulty,
        sessionAccuracy: sessionAccuracy,
        reason: progressionReason,
        changed: difficultyChanged
      },
      sessionSummary
    }));

    setShowResult(true);
  };

  if (!questions.length) {
    return (
      <div className="time-quiz-container">
        <div className="time-quiz-loading">
          <div className="loading-spinner">⏰</div>
          <h2>Preparing your time quiz...</h2>
          <div className="loading-details">
            Loading interactive time activities...<br/>
            Getting ready for learning about day and night!<br/>
            Almost there! ⭐
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    let encouragement = '';
    let scoreClass = '';
    
    if (percentage >= 80) {
      encouragement = 'Excellent work! You really understand time concepts! ⭐';
      scoreClass = 'excellent-score';
    } else if (percentage >= 60) {
      encouragement = 'Good job! You\'re learning about time well! 👍';
      scoreClass = 'good-score';
    } else {
      encouragement = 'Keep practicing! You\'re getting better at understanding time! 💪';
      scoreClass = 'needs-practice';
    }

    return (
      <div className="time-quiz-container">
        <div className="time-quiz-result">
          <div className="result-content">
            <h2>Quiz Complete! 🎉</h2>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-text">{score}/{questions.length}</span>
              </div>
            </div>
            <div className={`results-encouragement ${scoreClass}`}>
              {encouragement}
            </div>
            
            {/* Difficulty Progression Display */}
            {aiFeedback?.difficultyProgression && (
              <div className="difficulty-progression-section">
                <h3>📈 Your Progress</h3>
                <div className="progression-display">
                  <div className="current-level">
                    <span className="level-label">Current Level:</span>
                    <span className={`level-badge level-${aiFeedback.difficultyProgression.currentLevel}`}>
                      {aiFeedback.difficultyProgression.currentLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="accuracy-display">
                    <span className="accuracy-label">Session Accuracy:</span>
                    <span className="accuracy-value">
                      {Math.round(aiFeedback.difficultyProgression.sessionAccuracy * 100)}%
                    </span>
                  </div>
                  
                  <div className="progression-arrow">
                    {aiFeedback.difficultyProgression.changed ? '⬆️' : '➡️'}
                  </div>
                  
                  <div className="next-level">
                    <span className="level-label">Next Level:</span>
                    <span className={`level-badge level-${aiFeedback.difficultyProgression.nextLevel}`}>
                      {aiFeedback.difficultyProgression.nextLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="progression-reason">
                  <p>{aiFeedback.difficultyProgression.reason}</p>
                </div>
              </div>
            )}
            
            {/* AI Feedback Display */}
            {aiFeedback?.sessionSummary && (
              <div className="ai-session-summary">
                <h3>🧠 AI Tutor Insights</h3>
                {aiFeedback.sessionSummary.insights && aiFeedback.sessionSummary.insights.length > 0 && (
                  <div className="ai-insights">
                    {aiFeedback.sessionSummary.insights.map((insight, idx) => (
                      <p key={idx} className="insight-item">💡 {insight}</p>
                    ))}
                  </div>
                )}
                {aiFeedback.sessionSummary.recommendations && (
                  <div className="ai-recommendations">
                    <p className="recommendation">🎯 {aiFeedback.sessionSummary.recommendations}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigateTo('topics')}>
                Back to Topics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="time-quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>⏰ Time</h2>
          <div className="progress-info">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-text">{currentQuestion.question}</h3>

        {/* Render different question types */}
        {currentQuestion.type === 'identification' && (
            <div className="identification-question">
              {/* Display scenario image if present */}
              {currentQuestion.scenario && (
                <div className="scenario-image">
                  <div 
                    className="scenario-visual"
                    dangerouslySetInnerHTML={{ __html: generateScenarioSVG(currentQuestion.scenario) }}
                  />
                  <div className="scenario-description">
                    {getScenarioDescription(currentQuestion.scenario)}
                  </div>
                </div>
              )}
              
              <div className="identification-options">
                {currentQuestion.images?.map((image, index) => (
                  <div
                    key={index}
                    className={`identification-option ${selectedOption === image.id ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(image.id)}
                  >
                    <div 
                      className="time-image"
                      dangerouslySetInnerHTML={{ __html: generateTimeSVG(image.src, image.id === 'day' ? timeColors.morning : timeColors.night, 120) }}
                    />
                    <div className="time-image-label">{image.description}</div>
                  </div>
                ))}
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`identification-option ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="time-image-label">{option}</div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Matching Activities */}
        {currentQuestion.type === 'matching' && (
            <div className="matching-question">
              <div className="drag-items">
                <h4>Drag these activities:</h4>
                <div className="draggable-items">
                  {currentQuestion.items
                    .filter((item) => !matchedPairs.has(item.label))
                    .length === 0 ? (
                    <div className="no-shapes-left">
                      🎉 All activities sorted!
                    </div>
                  ) : (
                    currentQuestion.items
                      .filter((item) => !matchedPairs.has(item.label))
                      .map((item, index) => (
                      <div
                        key={item.label}
                        className="draggable-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
                        {item.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="drop-zones">
                <h4>Drop on correct time:</h4>
                <div className="drop-targets">
                  {currentQuestion.items.map((item, index) => {
                    const targetName = item.timeOfDay;
                    const droppedItem = droppedShapes[targetName];
                    
                    return (
                      <div
                        key={index}
                        className={`drop-zone ${matchedPairs.has(targetName) ? 'filled' : ''}`}
                        onDrop={(e) => handleDrop(e, targetName)}
                        onDragOver={handleDragOver}
                      >
                        {droppedItem ? (
                          <div 
                            className={`dropped-shape ${
                              (droppedItem.timeOfDay === targetName) ? 'correct-drop' : 'incorrect-drop'
                            }`}
                            draggable
                            onDragStart={(e) => {
                              handleDragStart(e, droppedItem);
                              // Remove from current position when re-dragging
                              setDroppedShapes(prev => {
                                const updated = {...prev};
                                delete updated[targetName];
                                return updated;
                              });
                              setMatchedPairs(prev => {
                                const updated = new Set(prev);
                                updated.delete(targetName);
                                return updated;
                              });
                            }}
                          >
                            {droppedItem.label}
                            <span className="shape-label">{targetName}</span>
                          </div>
                        ) : (
                          <div className="empty-zone">{targetName}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        )}

        {/* Fill in the Blank */}
        {currentQuestion.type === 'fill_blank' && (
            <div className="fill-blank-question">
              <div className="fill-blank-sentence">
                {currentQuestion.question.replace('______', '')}
                <span className="blank-space">
                  {selectedOption && <span className="blank-answer">{selectedOption}</span>}
                </span>
              </div>
              <div className="fill-blank-options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`fill-blank-option ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
        )}

        {/* True/False */}
        {currentQuestion.type === 'true_false' && (
            <div className="true-false-question">
              {/* Display image if present */}
              {currentQuestion.image && (
                <div className="true-false-image">
                  <div 
                    className="true-false-visual"
                    dangerouslySetInnerHTML={{ __html: generateImageSVG(currentQuestion.image) }}
                  />
                </div>
              )}
              
              <div className="true-false-statement">
                {currentQuestion.question}
              </div>
              <div className="true-false-options">
                <div
                  className={`true-false-option ${selectedOption === true ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(true)}
                >
                  True
                </div>
                <div
                  className={`true-false-option ${selectedOption === false ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(false)}
                >
                  False
                </div>
              </div>
            </div>
        )}

        {/* Coloring Activities */}
        {currentQuestion.type === 'coloring' && (
            <div className="coloring-question">
              <div className="color-palette">
                {Object.entries(timeColors).map(([name, color]) => (
                  <div
                    key={name}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              <div className="coloring-scenes">
                {currentQuestion.scenes?.map((scene, index) => (
                  <div
                    key={index}
                    className={`coloring-scene ${coloredScenes.has(scene.id) ? 'colored' : ''}`}
                    style={{ backgroundColor: coloredScenes.has(scene.id) ? scene.targetColor : '#f8f9fa' }}
                    onClick={() => handleSceneClick(scene.id)}
                  >
                    <div 
                      className="time-image"
                      dangerouslySetInnerHTML={{ 
                        __html: generateTimeSVG(
                          scene.type.includes('sun') ? 'sun' : 'moon', 
                          coloredScenes.has(scene.id) ? '#FFFFFF' : timeColors.morning, 
                          100
                        ) 
                      }}
                    />
                    <div className="time-image-label">{scene.label}</div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Interactive Elements */}
        {currentQuestion.type === 'interactive' && (
            <div className="interactive-question">
              <div className="interactive-targets">
                {currentQuestion.targets?.map((target, index) => (
                  <div
                    key={index}
                    className={`interactive-target ${litTargets.has(target.id) ? 'lit' : ''}`}
                    onClick={() => handleInteractiveClick(target.id)}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: generateTimeSVG(
                          target.type, 
                          target.type === 'sun' ? timeColors.morning : timeColors.night, 
                          120
                        ) 
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Audio Visual */}
        {currentQuestion.type === 'audio_visual' && (
          <div className="audio-visual-question">
            <div className="audio-instruction">
              <p>🎧 Put on your headphones and listen carefully!</p>
            </div>
            <button 
              className="audio-control"
              onClick={playAudioSound}
              disabled={audioPlaying}
            >
              {audioPlaying ? '🔊 Playing...' : '🔊 Play Sound'}
            </button>
            <div className="audio-description">
              <strong>Sound:</strong> {currentQuestion.sound?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            {audioPlaying && (
              <div className="audio-visualization">
                <div className="sound-waves">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              </div>
            )}
            <div className="audio-options">
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className={`audio-option ${selectedOption === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sequencing Questions */}
        {currentQuestion.type === 'sequencing' && (
          <div className="sequencing-question">
            <div className="sequencing-instructions">
              <p>Drag the activities to put them in the correct order:</p>
            </div>
            <div className="sequencing-container">
              <div className="sequence-items">
                {currentQuestion.activities?.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`sequence-item ${sequencedItems[index] === activity ? 'placed' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify(activity));
                    }}
                  >
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-label">{activity.label}</div>
                  </div>
                ))}
              </div>
              <div className="sequence-slots">
                {Array.from({ length: currentQuestion.activities?.length || 0 }, (_, index) => (
                  <div
                    key={index}
                    className={`sequence-slot ${sequencedItems[index] ? 'filled' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const activity = JSON.parse(e.dataTransfer.getData('text/plain'));
                      const newSequencedItems = [...sequencedItems];
                      newSequencedItems[index] = activity;
                      setSequencedItems(newSequencedItems);
                    }}
                  >
                    {sequencedItems[index] ? (
                      <div className="placed-activity">
                        <div className="activity-icon">{sequencedItems[index].icon}</div>
                        <div className="activity-label">{sequencedItems[index].label}</div>
                      </div>
                    ) : (
                      <div className="slot-placeholder">Drop here</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice Questions */}
        {currentQuestion.type === 'multiple_choice' && (
          <div className="multiple-choice-question">
            <div className="multiple-choice-options">
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className={`multiple-choice-option ${
                    currentQuestion.multipleCorrect
                      ? (selectedOptions.includes(option) ? 'selected' : '')
                      : (selectedOption === option ? 'selected' : '')
                  }`}
                  onClick={() => {
                    if (currentQuestion.multipleCorrect) {
                      setSelectedOptions(prev => 
                        prev.includes(option)
                          ? prev.filter(opt => opt !== option)
                          : [...prev, option]
                      );
                    } else {
                      setSelectedOption(option);
                    }
                  }}
                >
                  <div className="option-checkbox">
                    {currentQuestion.multipleCorrect ? (
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option)}
                        readOnly
                      />
                    ) : (
                      <input
                        type="radio"
                        checked={selectedOption === option}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="option-content">
                    {option.image && (
                      <div className="option-image">
                        <div 
                          className="option-visual"
                          dangerouslySetInnerHTML={{ __html: generateImageSVG(option.image) }}
                        />
                      </div>
                    )}
                    <div className="option-text">{option.text}</div>
                  </div>
                </div>
              ))}
            </div>
            {currentQuestion.multipleCorrect && (
              <div className="multiple-choice-hint">
                💡 Select all correct answers
              </div>
            )}
          </div>
        )}

        {/* Scene Building Questions */}
        {currentQuestion.type === 'scene_building' && (
          <div className="scene-building-question">
            <div className="scene-canvas">
              <svg className="scene-svg" viewBox="0 0 400 300">
                {/* Background */}
                <rect
                  x="0" y="0" width="400" height="300"
                  fill={sceneElements.sky || '#87CEEB'}
                  className="scene-background"
                  onClick={() => handleSceneElementClick('sky')}
                />
                
                {/* Moon */}
                {sceneElements.moon && (
                  <circle
                    cx="320" cy="60" r="25"
                    fill="#FFF8DC"
                    stroke="#F0E68C"
                    strokeWidth="2"
                    className="scene-moon"
                  />
                )}
                
                {/* Stars */}
                {sceneElements.stars && Array.from({ length: sceneElements.starCount || 0 }, (_, i) => (
                  <polygon
                    key={i}
                    points={`${50 + i * 60},${40 + (i % 2) * 20} ${55 + i * 60},${50 + (i % 2) * 20} ${60 + i * 60},${50 + (i % 2) * 20} ${57 + i * 60},${55 + (i % 2) * 20} ${62 + i * 60},${65 + (i % 2) * 20} ${50 + i * 60},${60 + (i % 2) * 20} ${48 + i * 60},${65 + (i % 2) * 20} ${53 + i * 60},${55 + (i % 2) * 20}`}
                    fill="#FFFF00"
                    className="scene-star"
                  />
                ))}
              </svg>
            </div>
            <div className="scene-controls">
              <div className="element-buttons">
                {currentQuestion.elements?.map((element, index) => (
                  <button
                    key={element.id}
                    className={`element-button ${
                      element.id === 'sky' ? (sceneElements.sky === element.targetColor ? 'active' : '') :
                      sceneElements[element.id] ? 'active' : ''
                    }`}
                    onClick={() => handleSceneElementClick(element.id)}
                  >
                    {element.id === 'sky' && '🌌'}
                    {element.id === 'moon' && '🌙'}
                    {element.id === 'stars' && '⭐'}
                    {element.type === 'background' ? 'Change Sky' : `Add ${element.id}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Input Questions */}
        {currentQuestion.type === 'text_input' && (
          <div className="text-input-question">
            <div className="text-input-container">
              <input
                type="text"
                className="text-input-field"
                placeholder={currentQuestion.placeholder}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    checkAnswer();
                  }
                }}
              />
              {currentQuestion.hint && (
                <div className="text-input-hint">
                  💡 {currentQuestion.hint}
                </div>
              )}
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${feedback.isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {feedback.message}
          </div>
        )}
        
        {aiFeedback && (
          <div className="ai-feedback">
            <div className="ai-feedback-header">
              <span className="ai-icon">🧠</span>
              <strong>AI Tutor Feedback</strong>
            </div>
            <div className="ai-feedback-content">
              {aiFeedback.aiInsight && (
                <p className="ai-insight">{aiFeedback.aiInsight}</p>
              )}
              {aiFeedback.suggestion && (
                <p className="ai-suggestion">💡 <em>{aiFeedback.suggestion}</em></p>
              )}
              {aiFeedback.encouragement && (
                <p className="ai-encouragement">{aiFeedback.encouragement}</p>
              )}
              {aiFeedback.insights && aiFeedback.insights.length > 0 && (
                <div className="ai-insights">
                  {aiFeedback.insights.map((insight, idx) => (
                    <p key={idx} className="insight-item">{insight}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-actions">
        {!hasAnswered ? (
          <button 
            className="btn btn-primary" 
            onClick={checkAnswer} 
            disabled={isChecking || (
              !selectedOption && 
              !textInput?.trim() && 
              matchedPairs.size === 0 && 
              coloredScenes.size === 0 && 
              litTargets.size === 0 && 
              sequencedItems.filter(item => item).length === 0 && 
              selectedOptions.length === 0 && 
              Object.keys(sceneElements).filter(key => sceneElements[key]).length === 0
            )}
          >
            {isChecking ? 'AI Analyzing...' : 'Next Question'}
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setHasAnswered(false);
                setSelectedOption(null);
                setTextInput('');
                setMatchedPairs(new Set());
                setDroppedShapes({});
                setSequencedItems([]);
                setSelectedOptions([]);
                setSceneElements({});
                setColoredScenes(new Set());
                setSelectedColor(null);
                setLitTargets(new Set());
                setFeedback(null);
                setAiFeedback(null);
                setQuestionStartTime(Date.now());
              } else {
                setShowResult(true);
              }
            }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Time;
