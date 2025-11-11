import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { measurementQuestions, measurementAssets, mauritianCoins } from '../../../data/measurementQuestions';
import TTSButton from '../TTSButton';
import TranslationButton from '../TranslationButton';
import translationService from '../../../utils/translationService';
import ModernFeedback from '../ModernFeedback';
import ImmediateFeedback from '../ImmediateFeedback';
import './Measurement.css';

const Measurement = ({ topic, user, navigateTo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [feedback, setFeedback] = useState(null);
  
  // Question-specific states
  const [draggedItem, setDraggedItem] = useState(null);
  const [droppedItems, setDroppedItems] = useState({});
  const [orderedItems, setOrderedItems] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Translation states
  const [isFrench, setIsFrench] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState([]);
  const [translatedUITexts, setTranslatedUITexts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Tracking for ModernFeedback
  const [questionDetails, setQuestionDetails] = useState([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Immediate feedback states
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [currentFeedbackData, setCurrentFeedbackData] = useState(null);

  // Get difficulty from user performance
  const getDifficultyFromAccuracy = (acc) => {
    if (acc >= 0.8) return 'hard';
    if (acc >= 0.5) return 'medium';
    return 'easy';
  };

  // Initialize quiz with adaptive difficulty - ONLY ONCE
  useEffect(() => {
    let isInitialized = false;
    
    (async () => {
      // Prevent re-initialization
      if (!topic || !user || isInitialized || questions.length > 0) {
        if (questions.length > 0) console.log('⚠️ Measurement quiz already initialized, skipping');
        return;
      }
      isInitialized = true;
      
      // Reset quiz state
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setFeedback(null);
      setQuestionDetails([]);
      setQuestionStartTime(Date.now());
      resetQuestionState();
      
      // Load current difficulty from database
      let savedDifficulty = 'easy';
      try {
        const { data: studentStats, error } = await supabase
          .from('StudentTopicStats')
          .select('current_difficulty')
          .eq('student_id', user.id)
          .eq('topic_id', topic.id)
          .maybeSingle();
        
        if (!error && studentStats?.current_difficulty) {
          savedDifficulty = studentStats.current_difficulty;
          console.log(`Loading saved difficulty: ${savedDifficulty}`);
        } else {
          console.log('No previous progress found, starting at Easy level');
        }
      } catch (error) {
        console.log('Error loading difficulty, starting at Easy level:', error);
      }
      
      setDifficulty(savedDifficulty);
      
      // Select questions based on difficulty - SHUFFLE ONLY ONCE
      let selectedQuestions = [];
      const questionsForDifficulty = measurementQuestions[savedDifficulty] || [];
      
      if (questionsForDifficulty.length > 0) {
        // Shuffle and select 5 questions
        const shuffled = [...questionsForDifficulty].sort(() => Math.random() - 0.5);
        selectedQuestions = shuffled.slice(0, 5);
        console.log(`✅ Measurement quiz initialized - Selected ${selectedQuestions.length} questions for ${savedDifficulty} level`);
      }
      
      setQuestions(selectedQuestions);
    })();
  }, []); // Empty dependency array - only run once on mount

  // Restart quiz with updated difficulty and reshuffled questions
  const restartQuiz = async () => {
    console.log('🔄 Restarting Measurement quiz...');
    
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setFeedback(null);
    setQuestionDetails([]);
    setTotalTimeSpent(0);
    setSelectedOption(null);
    setIsChecking(false);

    // Fetch updated difficulty from database
    let updatedDifficulty = 'easy';
    try {
      const { data: stats, error } = await supabase
        .from('StudentTopicStats')
        .select('current_difficulty')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .maybeSingle();
      
      if (!error && stats && stats.current_difficulty) {
        updatedDifficulty = stats.current_difficulty;
        console.log(`📊 Fetched updated difficulty: ${updatedDifficulty}`);
      } else {
        console.log('ℹ️ No saved difficulty found, using default: easy');
      }
    } catch (error) {
      console.error('Error fetching difficulty:', error);
    }
    
    setDifficulty(updatedDifficulty);

    // Get and shuffle questions for the updated difficulty
    const questionsForDifficulty = measurementQuestions[updatedDifficulty] || [];
    const shuffled = [...questionsForDifficulty].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 5);
    
    setQuestions(selectedQuestions);
    setQuestionStartTime(Date.now());
    
    console.log(`✅ Quiz restarted at ${updatedDifficulty} difficulty with ${selectedQuestions.length} new questions`);
  };

  // Generate SVG for measurement objects
  const generateMeasurementSVG = (asset, size = 120, directAssetData = null) => {
    const assetData = directAssetData || measurementAssets[asset] || {};
    const { type, color = '#666', length, height, radius, fullness, species, contents } = assetData;
    
    // Ensure size is valid
    const validSize = Math.max(size || 120, 40);
    
    // Validate and provide fallbacks for dimensions
    const safeLength = Math.max(length || 100, 20);
    const safeHeight = Math.max(height || 100, 20);
    const safeRadius = Math.max(radius || 30, 10);
    
    switch (type) {
      case 'pencil':
        const pencilLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/3} className="measurement-svg">
            <rect 
              x={(validSize - pencilLength) / 2} 
              y={validSize/6} 
              width={pencilLength} 
              height={validSize/6} 
              fill={color} 
              stroke="#333" 
              strokeWidth="2" 
            />
            <polygon 
              points={`${(validSize - pencilLength) / 2 + pencilLength},${validSize/6} ${(validSize - pencilLength) / 2 + pencilLength + 10},${validSize/4} ${(validSize - pencilLength) / 2 + pencilLength},${validSize/3}`}
              fill="#8B4513"
            />
          </svg>
        );
      
      case 'ruler':
        const rulerLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/4} className="measurement-svg">
            <rect 
              x={(validSize - rulerLength) / 2} 
              y={validSize/8} 
              width={rulerLength} 
              height={validSize/8} 
              fill={color} 
              stroke="#333" 
              strokeWidth="2" 
            />
            {/* Ruler markings */}
            {Array.from({length: Math.floor(rulerLength/10)}, (_, i) => (
              <line 
                key={i}
                x1={(validSize - rulerLength) / 2 + i * 10} 
                y1={validSize/8} 
                x2={(validSize - rulerLength) / 2 + i * 10} 
                y2={validSize/4} 
                stroke="#333" 
                strokeWidth="1"
              />
            ))}
          </svg>
        );
      
      case 'stick':
        const stickLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/6} className="measurement-svg">
            <rect 
              x={(validSize - stickLength) / 2} 
              y={validSize/12} 
              width={stickLength} 
              height={validSize/12} 
              fill={color} 
              stroke="#333" 
              strokeWidth="2" 
              rx="3"
            />
          </svg>
        );
      
      case 'rope':
        const ropeLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/8} className="measurement-svg">
            <path 
              d={`M ${(validSize - ropeLength) / 2} ${validSize/16} Q ${validSize/2} ${validSize/8} ${(validSize + ropeLength) / 2} ${validSize/16}`}
              stroke={color} 
              strokeWidth="6" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        );
      
      case 'ribbon':
        const ribbonLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/8} className="measurement-svg">
            <path 
              d={`M ${(validSize - ribbonLength) / 2} ${validSize/16} Q ${validSize/2} ${validSize/12} ${(validSize + ribbonLength) / 2} ${validSize/16}`}
              stroke={color} 
              strokeWidth="8" 
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d={`M ${(validSize - ribbonLength) / 2} ${validSize/16} Q ${validSize/2} ${validSize/20} ${(validSize + ribbonLength) / 2} ${validSize/16}`}
              stroke="#FFF" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
        );
      
      case 'ladder':
        const ladderHeight = (height / 200) * size;
        return (
          <svg width={size/3} height={size} className="measurement-svg">
            {/* Left rail */}
            <rect x={size/12} y={size - ladderHeight} width="8" height={ladderHeight} fill={color} stroke="#333" strokeWidth="2" />
            {/* Right rail */}
            <rect x={size/4} y={size - ladderHeight} width="8" height={ladderHeight} fill={color} stroke="#333" strokeWidth="2" />
            {/* Rungs */}
            {Array.from({length: Math.floor(ladderHeight/20)}, (_, i) => (
              <rect 
                key={i}
                x={size/12} 
                y={size - ladderHeight + i * 20 + 10} 
                width={size/4 + 8 - size/12} 
                height="4" 
                fill={color} 
                stroke="#333" 
                strokeWidth="1"
              />
            ))}
          </svg>
        );
      
      case 'bottle':
        const bottleHeight = (height / 200) * size;
        return (
          <svg width={size/3} height={size} className="measurement-svg">
            {/* Bottle body */}
            <rect x={size/8} y={size - bottleHeight} width={size/6} height={bottleHeight * 0.8} fill={color} stroke="#333" strokeWidth="2" rx="8" />
            {/* Bottle neck */}
            <rect x={size/6 - 6} y={size - bottleHeight} width="12" height={bottleHeight * 0.2} fill={color} stroke="#333" strokeWidth="2" />
            {/* Cap */}
            <rect x={size/6 - 8} y={size - bottleHeight - 8} width="16" height="8" fill="#666" stroke="#333" strokeWidth="2" />
          </svg>
        );
      
      case 'candle':
        const candleHeight = (height / 200) * size;
        return (
          <svg width={size/4} height={size} className="measurement-svg">
            {/* Candle body */}
            <rect x={size/16} y={size - candleHeight} width={size/8} height={candleHeight} fill={color} stroke="#333" strokeWidth="2" />
            {/* Flame */}
            <ellipse cx={size/8} cy={size - candleHeight - 5} rx="4" ry="8" fill="#FF4500" />
            <ellipse cx={size/8} cy={size - candleHeight - 3} rx="2" ry="4" fill="#FFD700" />
          </svg>
        );
      
      case 'fence':
        const fenceHeight = (height / 200) * size;
        return (
          <svg width={size} height={size} className="measurement-svg">
            {/* Fence posts */}
            {Array.from({length: 5}, (_, i) => (
              <rect 
                key={i}
                x={i * (size/5) + size/20} 
                y={size - fenceHeight} 
                width="8" 
                height={fenceHeight} 
                fill={color} 
                stroke="#333" 
                strokeWidth="1"
              />
            ))}
            {/* Horizontal rails */}
            <rect x={0} y={size - fenceHeight + fenceHeight/3} width={size} height="4" fill={color} stroke="#333" strokeWidth="1" />
            <rect x={0} y={size - fenceHeight + 2*fenceHeight/3} width={size} height="4" fill={color} stroke="#333" strokeWidth="1" />
          </svg>
        );
      
      case 'plant':
        const plantHeight = (height / 200) * size;
        return (
          <svg width={size/2} height={size} className="measurement-svg">
            {/* Stem */}
            <rect x={size/4 - 2} y={size - plantHeight} width="4" height={plantHeight * 0.7} fill="#228B22" stroke="#333" strokeWidth="1" />
            {/* Leaves */}
            <ellipse cx={size/4 - 8} cy={size - plantHeight + plantHeight/3} rx="6" ry="12" fill={color} stroke="#333" strokeWidth="1" />
            <ellipse cx={size/4 + 8} cy={size - plantHeight + plantHeight/2} rx="6" ry="12" fill={color} stroke="#333" strokeWidth="1" />
            {/* Flower */}
            <circle cx={size/4} cy={size - plantHeight + 5} r="8" fill="#FF69B4" stroke="#333" strokeWidth="1" />
          </svg>
        );
      
      case 'building':
        const buildingHeight = (height / 200) * size;
        return (
          <svg width={size/2} height={size} className="measurement-svg">
            {/* Building body */}
            <rect x={size/8} y={size - buildingHeight} width={size/4} height={buildingHeight} fill={color} stroke="#333" strokeWidth="2" />
            {/* Windows */}
            {Array.from({length: Math.floor(buildingHeight/30)}, (_, floor) => 
              Array.from({length: 2}, (_, window) => (
                <rect 
                  key={`${floor}-${window}`}
                  x={size/8 + 8 + window * 20} 
                  y={size - buildingHeight + floor * 30 + 8} 
                  width="12" 
                  height="12" 
                  fill="#87CEEB" 
                  stroke="#333" 
                  strokeWidth="1"
                />
              ))
            )}
          </svg>
        );
      
      case 'person':
        const personHeight = (height / 200) * size;
        return (
          <svg width={size/2} height={size} className="measurement-svg">
            {/* Head */}
            <circle cx={size/4} cy={size - personHeight + 15} r="12" fill={color} stroke="#333" strokeWidth="2" />
            {/* Body */}
            <rect x={size/4 - 8} y={size - personHeight + 27} width="16" height={personHeight - 40} fill={color} stroke="#333" strokeWidth="2" />
            {/* Arms */}
            <line x1={size/4 - 8} y1={size - personHeight + 35} x2={size/4 - 20} y2={size - personHeight + 50} stroke="#333" strokeWidth="3" />
            <line x1={size/4 + 8} y1={size - personHeight + 35} x2={size/4 + 20} y2={size - personHeight + 50} stroke="#333" strokeWidth="3" />
            {/* Legs */}
            <line x1={size/4 - 4} y1={size - 13} x2={size/4 - 15} y2={size} stroke="#333" strokeWidth="3" />
            <line x1={size/4 + 4} y1={size - 13} x2={size/4 + 15} y2={size} stroke="#333" strokeWidth="3" />
          </svg>
        );
      
      case 'circle':
        return (
          <svg width={size} height={size} className="measurement-svg">
            <circle cx={size/2} cy={size/2} r={radius} fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );
      
      case 'triangle':
        const triangleSize = (radius || 40);
        return (
          <svg width={size} height={size} className="measurement-svg">
            <polygon 
              points={`${size/2},${size/2 - triangleSize} ${size/2 - triangleSize},${size/2 + triangleSize/2} ${size/2 + triangleSize},${size/2 + triangleSize/2}`}
              fill={color} 
              stroke="#333" 
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'square':
        const squareSize = (radius || 40);
        return (
          <svg width={size} height={size} className="measurement-svg">
            <rect 
              x={size/2 - squareSize/2} 
              y={size/2 - squareSize/2} 
              width={squareSize} 
              height={squareSize} 
              fill={color} 
              stroke="#333" 
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'star':
        const starSize = (radius || 30);
        return (
          <svg width={size} height={size} className="measurement-svg">
            <polygon 
              points={`${size/2},${size/2 - starSize} ${size/2 + starSize*0.3},${size/2 - starSize*0.3} ${size/2 + starSize},${size/2 - starSize*0.3} ${size/2 + starSize*0.5},${size/2 + starSize*0.2} ${size/2 + starSize*0.8},${size/2 + starSize} ${size/2},${size/2 + starSize*0.5} ${size/2 - starSize*0.8},${size/2 + starSize} ${size/2 - starSize*0.5},${size/2 + starSize*0.2} ${size/2 - starSize},${size/2 - starSize*0.3} ${size/2 - starSize*0.3},${size/2 - starSize*0.3}`}
              fill={color} 
              stroke="#333" 
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'heart':
        const heartSize = (radius || 30);
        return (
          <svg width={size} height={size} className="measurement-svg">
            <path 
              d={`M ${size/2} ${size/2 + heartSize*0.3} C ${size/2} ${size/2 - heartSize*0.2}, ${size/2 - heartSize} ${size/2 - heartSize*0.2}, ${size/2 - heartSize} ${size/2} C ${size/2 - heartSize} ${size/2 + heartSize*0.3}, ${size/2} ${size/2 + heartSize*0.6}, ${size/2} ${size/2 + heartSize} C ${size/2} ${size/2 + heartSize*0.6}, ${size/2 + heartSize} ${size/2 + heartSize*0.3}, ${size/2 + heartSize} ${size/2} C ${size/2 + heartSize} ${size/2 - heartSize*0.2}, ${size/2} ${size/2 - heartSize*0.2}, ${size/2} ${size/2 + heartSize*0.3} Z`}
              fill={color} 
              stroke="#333" 
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'basket':
        return (
          <svg width={size} height={size} className="measurement-svg">
            <ellipse cx={size/2} cy={size*0.8} rx={size*0.3} ry={size*0.1} fill="#8B4513" />
            <rect x={size*0.2} y={size*0.4} width={size*0.6} height={size*0.4} fill="#D2691E" stroke="#8B4513" strokeWidth="2" />
            {fullness === 'full' && (
              <>
                <circle cx={size*0.35} cy={size*0.5} r="8" fill="#FF0000" />
                <circle cx={size*0.5} cy={size*0.45} r="8" fill="#00FF00" />
                <circle cx={size*0.65} cy={size*0.5} r="8" fill="#0000FF" />
              </>
            )}
          </svg>
        );
      
      case 'bag':
        return (
          <svg width={size} height={size*0.8} className="measurement-svg">
            <rect x={size*0.2} y={size*0.3} width={size*0.6} height={size*0.4} fill={color} stroke="#333" strokeWidth="2" rx="8" />
            <rect x={size*0.35} y={size*0.2} width={size*0.3} height={size*0.2} fill={color} stroke="#333" strokeWidth="2" />
            {contents === 'books' && (
              <>
                <rect x={size*0.25} y={size*0.35} width="8" height="20" fill="#8B4513" />
                <rect x={size*0.35} y={size*0.35} width="8" height="20" fill="#4169E1" />
                <rect x={size*0.45} y={size*0.35} width="8" height="20" fill="#228B22" />
              </>
            )}
          </svg>
        );
      
      case 'animal':
        if (species === 'elephant') {
          return (
            <svg width={size} height={size*0.8} className="measurement-svg">
              <ellipse cx={size*0.5} cy={size*0.6} rx={size*0.3} ry={size*0.2} fill={color} stroke="#333" strokeWidth="2" />
              <circle cx={size*0.3} cy={size*0.4} r={size*0.15} fill={color} stroke="#333" strokeWidth="2" />
              <path d={`M ${size*0.3} ${size*0.55} Q ${size*0.2} ${size*0.7} ${size*0.15} ${size*0.75}`} stroke={color} strokeWidth="8" fill="none" />
              <circle cx={size*0.25} cy={size*0.35} r="3" fill="#000" />
              <rect x={size*0.45} y={size*0.75} width="8" height={size*0.15} fill={color} />
              <rect x={size*0.55} y={size*0.75} width="8" height={size*0.15} fill={color} />
            </svg>
          );
        } else if (species === 'cat') {
          return (
            <svg width={size*0.6} height={size*0.5} className="measurement-svg">
              <ellipse cx={size*0.3} cy={size*0.35} rx={size*0.15} ry={size*0.08} fill={color} stroke="#333" strokeWidth="2" />
              <circle cx={size*0.2} cy={size*0.25} r={size*0.08} fill={color} stroke="#333" strokeWidth="2" />
              <polygon points={`${size*0.15},${size*0.2} ${size*0.12},${size*0.15} ${size*0.18},${size*0.15}`} fill={color} />
              <polygon points={`${size*0.22},${size*0.2} ${size*0.19},${size*0.15} ${size*0.25},${size*0.15}`} fill={color} />
              <circle cx={size*0.17} cy={size*0.23} r="1" fill="#000" />
              <circle cx={size*0.23} cy={size*0.23} r="1" fill="#000" />
              <path d={`M ${size*0.45} ${size*0.35} Q ${size*0.5} ${size*0.3} ${size*0.55} ${size*0.35}`} stroke={color} strokeWidth="4" fill="none" />
            </svg>
          );
        }
        break;
      
      case 'worm':
        const wormLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/4} className="measurement-svg">
            <path 
              d={`M ${(validSize - wormLength) / 2} ${validSize/8} Q ${validSize/2} ${validSize/16} ${(validSize + wormLength) / 2} ${validSize/8}`}
              stroke={color} 
              strokeWidth="8" 
              fill="none"
              strokeLinecap="round"
            />
            {/* Worm segments */}
            {Array.from({length: Math.floor(wormLength/15)}, (_, i) => (
              <circle 
                key={i}
                cx={(validSize - wormLength) / 2 + i * 15} 
                cy={validSize/8} 
                r="2" 
                fill="#654321"
              />
            ))}
            {/* Head */}
            <circle cx={(validSize + wormLength) / 2} cy={validSize/8} r="4" fill="#654321" />
          </svg>
        );
      
      case 'snake':
        const snakeLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/6} className="measurement-svg">
            <path 
              d={`M ${(validSize - snakeLength) / 2} ${validSize/12} Q ${validSize/2 - snakeLength/4} ${validSize/8} ${validSize/2} ${validSize/12} Q ${validSize/2 + snakeLength/4} ${validSize/16} ${(validSize + snakeLength) / 2} ${validSize/12}`}
              stroke={color} 
              strokeWidth="12" 
              fill="none"
              strokeLinecap="round"
            />
            {/* Snake head */}
            <circle cx={(validSize + snakeLength) / 2} cy={validSize/12} r="8" fill={color} />
            <circle cx={(validSize + snakeLength) / 2 - 3} cy={validSize/12 - 2} r="1" fill="#000" />
            <circle cx={(validSize + snakeLength) / 2 - 3} cy={validSize/12 + 2} r="1" fill="#000" />
          </svg>
        );
      
      case 'train':
        const trainLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/3} className="measurement-svg">
            {/* Train body */}
            <rect x={(validSize - trainLength) / 2} y={validSize/6} width={trainLength} height={validSize/6} fill={color} stroke="#333" strokeWidth="2" rx="4" />
            {/* Engine front */}
            <rect x={(validSize + trainLength) / 2 - 20} y={validSize/8} width="20" height={validSize/4} fill={color} stroke="#333" strokeWidth="2" />
            {/* Wheels */}
            <circle cx={(validSize - trainLength) / 2 + 15} cy={validSize/3} r="8" fill="#333" />
            <circle cx={(validSize - trainLength) / 2 + trainLength - 15} cy={validSize/3} r="8" fill="#333" />
            {/* Smokestack */}
            <rect x={(validSize + trainLength) / 2 - 10} y={validSize/12} width="6" height={validSize/12} fill="#333" />
          </svg>
        );
      
      case 'crayon':
        const crayonLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/4} className="measurement-svg">
            <rect 
              x={(validSize - crayonLength) / 2} 
              y={validSize/8} 
              width={crayonLength * 0.9} 
              height={validSize/8} 
              fill={color} 
              stroke="#333" 
              strokeWidth="2" 
              rx="2"
            />
            {/* Crayon tip */}
            <polygon 
              points={`${(validSize - crayonLength) / 2 + crayonLength * 0.9},${validSize/8} ${(validSize - crayonLength) / 2 + crayonLength},${validSize/6} ${(validSize - crayonLength) / 2 + crayonLength * 0.9},${validSize/4}`}
              fill={color}
            />
          </svg>
        );
      
      case 'bridge':
        const bridgeLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/3} className="measurement-svg">
            {/* Bridge deck */}
            <rect x={(validSize - bridgeLength) / 2} y={validSize/4} width={bridgeLength} height={validSize/12} fill={color} stroke="#333" strokeWidth="2" />
            {/* Support pillars */}
            <rect x={(validSize - bridgeLength) / 2 + bridgeLength/4} y={validSize/4} width="8" height={validSize/6} fill={color} stroke="#333" strokeWidth="1" />
            <rect x={(validSize - bridgeLength) / 2 + 3*bridgeLength/4} y={validSize/4} width="8" height={validSize/6} fill={color} stroke="#333" strokeWidth="1" />
            {/* Cables */}
            <path d={`M ${(validSize - bridgeLength) / 2} ${validSize/4} Q ${validSize/2} ${validSize/6} ${(validSize + bridgeLength) / 2} ${validSize/4}`} stroke="#333" strokeWidth="2" fill="none" />
          </svg>
        );
      
      case 'line':
        const lineLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/8} className="measurement-svg">
            <line 
              x1={(validSize - lineLength) / 2} 
              y1={validSize/16} 
              x2={(validSize + lineLength) / 2} 
              y2={validSize/16} 
              stroke={color} 
              strokeWidth="4" 
              strokeLinecap="round"
            />
          </svg>
        );
      
      case 'tree':
        const treeHeight = (safeHeight / 200) * validSize;
        return (
          <svg width={validSize/2} height={validSize} className="measurement-svg">
            {/* Trunk */}
            <rect x={validSize/4 - 8} y={validSize - treeHeight/3} width="16" height={treeHeight/3} fill="#8B4513" stroke="#333" strokeWidth="2" />
            {/* Leaves */}
            <circle cx={validSize/4} cy={validSize - treeHeight + treeHeight/4} r={treeHeight/4} fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );
      
      case 'flower':
        const flowerHeight = (safeHeight / 200) * validSize;
        return (
          <svg width={validSize/3} height={validSize} className="measurement-svg">
            {/* Stem */}
            <rect x={validSize/6 - 2} y={validSize - flowerHeight} width="4" height={flowerHeight * 0.8} fill="#228B22" stroke="#333" strokeWidth="1" />
            {/* Petals */}
            <circle cx={validSize/6} cy={validSize - flowerHeight + flowerHeight/8} r={flowerHeight/8} fill={color} stroke="#333" strokeWidth="1" />
            <circle cx={validSize/6 - flowerHeight/12} cy={validSize - flowerHeight + flowerHeight/6} r={flowerHeight/12} fill={color} stroke="#333" strokeWidth="1" />
            <circle cx={validSize/6 + flowerHeight/12} cy={validSize - flowerHeight + flowerHeight/6} r={flowerHeight/12} fill={color} stroke="#333" strokeWidth="1" />
            <circle cx={validSize/6} cy={validSize - flowerHeight + flowerHeight/4} r={flowerHeight/12} fill={color} stroke="#333" strokeWidth="1" />
          </svg>
        );
      
      case 'giraffe':
        const giraffeHeight = (safeHeight / 200) * validSize;
        return (
          <svg width={validSize/2} height={validSize} className="measurement-svg">
            {/* Body */}
            <ellipse cx={validSize/4} cy={validSize - giraffeHeight/3} rx={validSize/8} ry={giraffeHeight/6} fill={color} stroke="#333" strokeWidth="2" />
            {/* Neck */}
            <rect x={validSize/4 - 4} y={validSize - giraffeHeight + giraffeHeight/8} width="8" height={giraffeHeight * 0.6} fill={color} stroke="#333" strokeWidth="2" />
            {/* Head */}
            <circle cx={validSize/4} cy={validSize - giraffeHeight + giraffeHeight/12} r={giraffeHeight/12} fill={color} stroke="#333" strokeWidth="2" />
            {/* Legs */}
            <rect x={validSize/4 - 12} y={validSize - giraffeHeight/3} width="4" height={giraffeHeight/4} fill={color} />
            <rect x={validSize/4 + 8} y={validSize - giraffeHeight/3} width="4" height={giraffeHeight/4} fill={color} />
            {/* Spots */}
            <circle cx={validSize/4 - 8} cy={validSize - giraffeHeight/2} r="3" fill="#8B4513" />
            <circle cx={validSize/4 + 6} cy={validSize - giraffeHeight/2.5} r="3" fill="#8B4513" />
          </svg>
        );
      
      case 'rock':
        const rockSize = (safeRadius / 50) * validSize;
        return (
          <svg width={validSize} height={validSize} className="measurement-svg">
            <ellipse cx={validSize/2} cy={validSize*0.7} rx={rockSize} ry={rockSize*0.6} fill={color} stroke="#333" strokeWidth="2" />
            <ellipse cx={validSize/2 - rockSize*0.3} cy={validSize*0.6} rx={rockSize*0.4} ry={rockSize*0.3} fill={color} stroke="#333" strokeWidth="1" />
            <ellipse cx={validSize/2 + rockSize*0.2} cy={validSize*0.65} rx={rockSize*0.3} ry={rockSize*0.25} fill={color} stroke="#333" strokeWidth="1" />
          </svg>
        );
      
      case 'feather':
        const featherLength = (safeLength / 200) * validSize;
        return (
          <svg width={validSize} height={validSize/3} className="measurement-svg">
            {/* Feather shaft */}
            <line x1={(validSize - featherLength) / 2} y1={validSize/6} x2={(validSize + featherLength) / 2} y2={validSize/6} stroke="#8B4513" strokeWidth="2" />
            {/* Feather barbs */}
            <path d={`M ${(validSize - featherLength) / 2 + 10} ${validSize/6} Q ${validSize/2} ${validSize/12} ${(validSize + featherLength) / 2 - 10} ${validSize/6}`} stroke={color} strokeWidth="6" fill="none" opacity="0.8" />
            <path d={`M ${(validSize - featherLength) / 2 + 10} ${validSize/6} Q ${validSize/2} ${validSize/4} ${(validSize + featherLength) / 2 - 10} ${validSize/6}`} stroke={color} strokeWidth="6" fill="none" opacity="0.8" />
          </svg>
        );
      
      case 'box':
        const boxSize = validSize * 0.6;
        return (
          <svg width={validSize} height={validSize} className="measurement-svg">
            {/* Box body */}
            <rect x={(validSize - boxSize) / 2} y={(validSize - boxSize) / 2} width={boxSize} height={boxSize} fill={color} stroke="#333" strokeWidth="2" rx="4" />
            {/* Box top */}
            <rect x={(validSize - boxSize) / 2} y={(validSize - boxSize) / 2} width={boxSize} height={boxSize/6} fill="#654321" stroke="#333" strokeWidth="2" />
            {contents === 'full' && (
              <>
                <rect x={(validSize - boxSize) / 2 + 10} y={(validSize - boxSize) / 2 + 15} width="8" height="15" fill="#FF0000" />
                <rect x={(validSize - boxSize) / 2 + 25} y={(validSize - boxSize) / 2 + 15} width="8" height="15" fill="#00FF00" />
                <rect x={(validSize - boxSize) / 2 + 40} y={(validSize - boxSize) / 2 + 15} width="8" height="15" fill="#0000FF" />
              </>
            )}
          </svg>
        );
      
      case 'tower':
        const towerHeight = (height / 200) * size;
        const towerWidth = size/3;
        return (
          <svg width={towerWidth} height={size} className="measurement-svg">
            {/* Tower base */}
            <rect x={towerWidth/4} y={size - towerHeight} width={towerWidth/2} height={towerHeight} fill={color} stroke="#333" strokeWidth="2" />
            {/* Tower segments/floors */}
            {Array.from({length: Math.floor(towerHeight/25)}, (_, i) => (
              <line 
                key={i}
                x1={towerWidth/4} 
                y1={size - towerHeight + i * 25} 
                x2={towerWidth/4 + towerWidth/2} 
                y2={size - towerHeight + i * 25} 
                stroke="#333" 
                strokeWidth="1"
              />
            ))}
            {/* Windows */}
            {Array.from({length: Math.floor(towerHeight/30)}, (_, floor) => (
              <rect 
                key={floor}
                x={towerWidth/4 + towerWidth/8} 
                y={size - towerHeight + floor * 30 + 10} 
                width="8" 
                height="8" 
                fill="#FFD700" 
                stroke="#333" 
                strokeWidth="1"
              />
            ))}
            {/* Tower top/spire */}
            <polygon 
              points={`${towerWidth/4},${size - towerHeight} ${towerWidth/2},${size - towerHeight - 15} ${towerWidth/4 + towerWidth/2},${size - towerHeight}`}
              fill={color} 
              stroke="#333" 
              strokeWidth="2"
            />
          </svg>
        );
      
      default:
        console.warn(`Missing SVG for asset type: ${type}, asset: ${asset}`);
        return <div className="placeholder-asset" style={{width: validSize, height: validSize/2, border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666'}}>{asset}</div>;
    }
  };

  // Helper function to extract options for TTS
  const getMeasurementOptions = (question) => {
    if (!question) return [];
    if (question.options) {
      return question.options.map(opt => 
        typeof opt === 'object' ? (opt.text || opt.label || opt.id || '') : opt
      );
    }
    return [];
  };

  // Generate scene for time questions
  const generateSceneSVG = (sceneAsset, size = 200) => {
    const scene = measurementAssets[sceneAsset];
    if (!scene) return <div>Scene not found</div>;
    
    return (
      <svg width={size} height={size} className="scene-svg">
        <rect width={size} height={size} fill={scene.timeOfDay === 'night' ? '#001122' : '#87CEEB'} />
        
        {scene.elements.includes('sun') && (
          <circle cx={size*0.8} cy={size*0.2} r="25" fill="#FFD700" />
        )}
        
        {scene.elements.includes('moon') && (
          <circle cx={size*0.8} cy={size*0.2} r="20" fill="#F0F0F0" />
        )}
        
        {scene.elements.includes('stars') && (
          <>
            <text x={size*0.1} y={size*0.15} fontSize="20" fill="#FFF">⭐</text>
            <text x={size*0.3} y={size*0.1} fontSize="15" fill="#FFF">⭐</text>
            <text x={size*0.6} y={size*0.12} fontSize="18" fill="#FFF">⭐</text>
          </>
        )}
        
        {scene.elements.includes('breakfast') && (
          <>
            <rect x={size*0.2} y={size*0.6} width={size*0.6} height={size*0.2} fill="#8B4513" />
            <circle cx={size*0.4} cy={size*0.65} r="8" fill="#FFD700" />
            <rect x={size*0.5} y={size*0.62} width="15" height="6" fill="#FFF" />
          </>
        )}
      </svg>
    );
  };

  // Generate coin SVG - handles both single coins and combinations
  const generateCoinSVG = (coinImage, size = 60) => {
    // Handle coin combinations (e.g., 'coins_Rs1_Rs5')
    if (coinImage.startsWith('coins_')) {
      // Extract coin types from the combination
      const coinTypes = coinImage.replace('coins_', '').split('_');
      
      return (
        <div className="coin-combination" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {coinTypes.map((coinType, index) => {
            const coin = mauritianCoins[coinType];
            if (!coin) return null;
            
            return (
              <svg key={index} width={size} height={size} className="coin-svg">
                <circle cx={size/2} cy={size/2} r={size/2 - 2} fill={coin.color} stroke="#333" strokeWidth="2" />
                <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size/4} fill="#000" fontWeight="bold">
                  {coinType}
                </text>
              </svg>
            );
          })}
        </div>
      );
    }
    
    // Handle single coin (e.g., 'coin_Rs1')
    const coinType = coinImage.replace('coin_', '');
    const coin = mauritianCoins[coinType];
    if (!coin) return <div>Coin not found</div>;
    
    return (
      <svg width={size} height={size} className="coin-svg">
        <circle cx={size/2} cy={size/2} r={size/2 - 2} fill={coin.color} stroke="#333" strokeWidth="2" />
        <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size/4} fill="#000" fontWeight="bold">
          {coinType}
        </text>
      </svg>
    );
  };

  // Handle different question types
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleTextInput = (value) => {
    setTextInput(value);
  };

  const handleItemToggle = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Drag and drop functionality
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (draggedItem) {
      setDroppedItems(prev => ({...prev, [target]: draggedItem}));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove dropped item (undo functionality)
  const removeDroppedItem = (target) => {
    setDroppedItems(prev => {
      const updated = {...prev};
      delete updated[target];
      return updated;
    });
  };

  // Ordering functionality for order_3 questions
  const handleOrderDrop = (e, position) => {
    e.preventDefault();
    if (draggedItem) {
      const newOrdered = [...orderedItems];
      newOrdered[position] = draggedItem;
      setOrderedItems(newOrdered);
      setDraggedItem(null);
    }
  };

  // Remove item from order position (undo functionality)
  const removeOrderedItem = (position) => {
    const newOrdered = [...orderedItems];
    newOrdered[position] = null;
    setOrderedItems(newOrdered);
  };

  // Clear all ordered items
  const clearAllOrdered = () => {
    setOrderedItems([]);
  };

  // Sorting functionality for sort_2 questions
  const handleSortDrop = (e, category) => {
    e.preventDefault();
    if (draggedItem) {
      // Add the item with its sorted category
      const itemWithCategory = { ...draggedItem, sortedCategory: category };
      setSortedItems(prev => [...prev, itemWithCategory]);
      setDraggedItem(null);
    }
  };

  const checkAnswer = () => {
    if (isChecking) return;
    setIsChecking(true);

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'pick_comparison':
        isCorrect = selectedOption && currentQuestion.options.find(opt => opt.id === selectedOption)?.isCorrect;
        break;
      
      case 'order_3':
        // Check if items are in correct order
        isCorrect = orderedItems.length === currentQuestion.items.length &&
          orderedItems.every((item, index) => 
            item && currentQuestion.items.find(q => q.id === item.id)?.correctPosition === index
          );
        break;
      
      case 'complete_sentence':
        isCorrect = textInput.toLowerCase().trim() === currentQuestion.correct.toLowerCase();
        break;
      
      case 'tick_cross':
        const correctItems = currentQuestion.options.filter(opt => opt.isCorrect);
        const selectedCorrect = correctItems.filter(item => selectedItems.has(item.id));
        isCorrect = selectedCorrect.length === correctItems.length && selectedItems.size === correctItems.length;
        break;
      
      case 'match_pairs':
        let correctMatches = 0;
        currentQuestion.pairs.forEach(pair => {
          if (droppedItems[pair.target] && droppedItems[pair.target].id === pair.source) {
            correctMatches++;
          }
        });
        isCorrect = correctMatches === currentQuestion.pairs.length;
        break;
      
      case 'sort_2':
        // Check if all items are sorted and in the correct categories
        isCorrect = sortedItems.length === currentQuestion.items.length &&
          sortedItems.every(sortedItem => {
            // Find the original item to get its correct category
            const originalItem = currentQuestion.items.find(item => item.id === sortedItem.id);
            // Check if the sorted category matches the original category
            return originalItem && sortedItem.sortedCategory === originalItem.category;
          });
        break;
      
      case 'scene_id':
        isCorrect = selectedOption && currentQuestion.options.find(opt => opt.id === selectedOption)?.isCorrect;
        break;
      
      case 'identify_coin':
        isCorrect = selectedOption && currentQuestion.options.find(opt => opt.id === selectedOption)?.isCorrect;
        break;
      
      default:
        isCorrect = false;
    }

    // Track question details
    const timeSpent = Date.now() - questionStartTime;
    setQuestionDetails(prev => [...prev, {
      questionType: currentQuestion.type,
      correct: isCorrect,
      timeSpent: timeSpent
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ isCorrect: true, message: '🎉 Excellent! Well done!' });
    } else {
      setFeedback({ isCorrect: false, message: '👍 Good try! Let\'s practice more.' });
    }

    // Show immediate feedback popup
    setCurrentFeedbackData({
      isCorrect,
      question: currentQuestion,
      userAnswer: selectedOption || textInput || `${selectedItems.size} items`,
      correctAnswer: currentQuestion.correct || currentQuestion.answer || 'See explanation'
    });
    setShowImmediateFeedback(true);
  };

  const handleFeedbackClose = async () => {
    setShowImmediateFeedback(false);
    setCurrentFeedbackData(null);
    setIsChecking(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
      resetQuestionState();
    } else {
      finishQuiz();
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setTextInput('');
    setDroppedItems({});
    setOrderedItems([]);
    setSortedItems([]);
    setSelectedItems(new Set());
    setFeedback(null);
    setIsChecking(false);
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const accuracy = score / questions.length;
    const totalTime = Math.floor((Date.now() - (questionStartTime - (questionDetails.reduce((sum, q) => sum + q.timeSpent, 0)))) / 1000);
    setTotalTimeSpent(totalTime);
    
    // Calculate next difficulty based on performance
    let nextDifficulty = difficulty;
    if (accuracy >= 0.8 && difficulty === 'easy') nextDifficulty = 'medium';
    else if (accuracy >= 0.8 && difficulty === 'medium') nextDifficulty = 'hard';
    else if (accuracy < 0.6 && difficulty === 'hard') nextDifficulty = 'medium';
    else if (accuracy < 0.6 && difficulty === 'medium') nextDifficulty = 'easy';
    
    console.log(`Session completed: ${difficulty} level, accuracy: ${(accuracy * 100).toFixed(1)}%, next difficulty: ${nextDifficulty}`);
    
    // Save results to database
    try {
      const sessionAccuracy = (score / questions.length) * 100;
      
      // First, get existing stats to preserve data
      const { data: existingStats } = await supabase
        .from('StudentTopicStats')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', topic.id)
        .maybeSingle();
      
      // Update StudentTopicStats with proper data preservation
      const statsData = {
        student_id: user.id,
        topic_id: topic.id,
        total_attempts: (existingStats?.total_attempts || 0) + 1,
        correct_answers: score,
        total_questions: questions.length,
        current_difficulty: nextDifficulty,
        last_accuracy: sessionAccuracy,
        last_attempted: new Date().toISOString(),
        ai_performance: sessionAccuracy,
        best_streak: Math.max(score, existingStats?.best_streak || 0),
        progress_data: JSON.stringify({
          recentAccuracies: [...(existingStats?.progress_data ? JSON.parse(existingStats.progress_data).recentAccuracies || [] : []), sessionAccuracy].slice(-10),
          difficultyHistory: { current: difficulty, next: nextDifficulty, timestamp: new Date().toISOString() }
        })
      };
      
      const { error: statsError } = await supabase.from('StudentTopicStats').upsert(statsData, { onConflict: 'student_id,topic_id' });
      
      if (statsError) {
        console.error('Error saving stats:', statsError);
      } else {
        console.log('Successfully saved difficulty progression to database');
      }
      
      // Insert QuizSession
      const sessionData = {
        student_id: user.id,
        topic_id: topic.id,
        session_date: new Date().toISOString(),
        difficulty_level: difficulty,
        questions_attempted: questions.length,
        correct_answers: score,
        accuracy_percentage: sessionAccuracy,
        time_spent: 0,
        next_difficulty: nextDifficulty,
        difficulty_changed: difficulty !== nextDifficulty,
        ai_feedback: JSON.stringify({
          encouragement: accuracy >= 0.8 ? 'Excellent work!' : 'Keep practicing!',
          suggestions: ['Continue with measurement practice']
        }),
        question_details: JSON.stringify({
          questionTypes: questions.map(q => q.type),
          responses: questions.map((q, idx) => ({
            questionId: q.id,
            correct: idx < score,
            questionType: q.type
          }))
        })
      };
      
      await supabase.from('QuizSessions').insert(sessionData);
      
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  if (!questions.length) {
    return (
      <div className="measurement-loading">
        <div className="loading-spinner">📏</div>
        <p>Preparing your measurement quiz...</p>
        <div className="loading-details">
          ✨ Loading questions<br/>
          🎯 Setting up activities<br/>
          🚀 Almost ready!
        </div>
      </div>
    );
  }

  if (showResult) {
    // Calculate next difficulty
    const currentAccuracy = score / questions.length;
    let nextDifficulty = difficulty;
    let difficultyChanged = false;
    
    if (currentAccuracy >= 0.8 && difficulty === 'easy') {
      nextDifficulty = 'medium';
      difficultyChanged = true;
    } else if (currentAccuracy >= 0.8 && difficulty === 'medium') {
      nextDifficulty = 'hard';
      difficultyChanged = true;
    } else if (currentAccuracy < 0.6 && difficulty === 'hard') {
      nextDifficulty = 'medium';
      difficultyChanged = true;
    } else if (currentAccuracy < 0.6 && difficulty === 'medium') {
      nextDifficulty = 'easy';
      difficultyChanged = true;
    }
    
    return (
      <ModernFeedback
        topicName="Measurement & Comparison"
        topicIcon="📏"
        score={score}
        totalQuestions={questions.length}
        difficulty={difficulty}
        nextDifficulty={nextDifficulty}
        difficultyChanged={difficultyChanged}
        timeSpent={totalTimeSpent}
        questionDetails={questionDetails}
        studentName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
        onBackToDashboard={() => navigateTo('dashboard')}
        onTryAgain={restartQuiz}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="measurement-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>📏 Measurement & Comparison</h2>
          <div className="quiz-meta">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className={`difficulty-badge difficulty-${difficulty}`}>{difficulty.toUpperCase()}</span>
            </div>
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
        <div className="question-header">
          <h3 className="question-text">{(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].question || translatedQuestions[currentQuestionIndex].prompt) : (currentQuestion.question || currentQuestion.prompt)}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TTSButton 
              question={(isFrench && translatedQuestions[currentQuestionIndex]) ? (translatedQuestions[currentQuestionIndex].question || translatedQuestions[currentQuestionIndex].prompt) : (currentQuestion.question || currentQuestion.prompt)}
              options={getMeasurementOptions(isFrench && translatedQuestions[currentQuestionIndex] ? translatedQuestions[currentQuestionIndex] : currentQuestion)}
            />
            <TranslationButton 
              onToggle={async () => {
                if (isTranslating) return;
                setIsTranslating(true);
                try {
                  if (isFrench) {
                    setIsFrench(false);
                    setTranslatedQuestions([]);
                    setTranslatedUITexts({});
                  } else {
                    setIsFrench(true);
                    const translated = await Promise.all(questions.map(q => translationService.translateQuestion(q, 'fr')));
                    setTranslatedQuestions(translated);
                    const uiTexts = { 'Measurement Quiz': 'Quiz de Mesure', 'Question': 'Question', 'of': 'de', 'Checking...': 'Vérification...', 'Next Question': 'Question Suivante', 'Quiz Complete!': 'Quiz Terminé!', 'Back to Dashboard': 'Retour au Tableau de Bord' };
                    setTranslatedUITexts(await translationService.translateUITexts(uiTexts, 'fr'));
                  }
                } catch (error) {
                  console.error('Translation error:', error);
                } finally {
                  setIsTranslating(false);
                }
              }}
              isFrench={isFrench}
            />
          </div>
        </div>
        
        {/* Measurement visualization */}
        
        {/* Pick Comparison Questions */}
        {currentQuestion.type === 'pick_comparison' && (
          <div className="pick-comparison-question">
            <div className="comparison-options">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id}
                  className={`comparison-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="option-label">{option.id}</div>
                  {generateMeasurementSVG(option.image)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order 3 Questions */}
        {currentQuestion.type === 'order_3' && (
          <div className="order-question">
            <div className="items-to-order">
              <h4>Drag these items:</h4>
              <div className="draggable-items">
                {currentQuestion.items.map((item) => (
                  <div
                    key={item.id}
                    className="draggable-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {generateMeasurementSVG(item.image)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-zones">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4>Drop in correct order:</h4>
                {orderedItems.some(item => item) && (
                  <button
                    onClick={clearAllOrdered}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Clear all"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="drop-zones">
                {[0, 1, 2].map((position) => (
                  <div
                    key={position}
                    className="order-drop-zone"
                    onDrop={(e) => handleOrderDrop(e, position)}
                    onDragOver={handleDragOver}
                    style={{ position: 'relative' }}
                  >
                    <div className="position-label">{position + 1}</div>
                    {orderedItems[position] ? (
                      <div style={{ position: 'relative' }}>
                        {generateMeasurementSVG(orderedItems[position].image)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOrderedItem(position);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                          }}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Complete Sentence Questions */}
        {currentQuestion.type === 'complete_sentence' && (
          <div className="complete-sentence-question">
            <div className="sentence-context">
              {currentQuestion.context && (() => {
                const ctx = currentQuestion.context;
                const subtopic = currentQuestion.subtopic;
                
                // Determine object type based on subtopic
                let objectType = 'ruler'; // default
                if (subtopic === 'height') objectType = 'tower';
                else if (subtopic === 'length') objectType = 'stick';
                else if (subtopic === 'size') objectType = 'circle';
                
                // Get context keys (could be rulerA/rulerB, left/right, stick1/stick2, etc.)
                const keys = Object.keys(ctx);
                const firstKey = keys[0];
                const secondKey = keys[1];
                
                // Create temporary asset data for rendering
                const firstAsset = {
                  type: objectType,
                  color: '#708090',
                  height: objectType === 'tower' ? ctx[firstKey] * 100 : undefined,
                  length: objectType !== 'tower' ? ctx[firstKey] * 100 : undefined,
                  radius: objectType === 'circle' ? ctx[firstKey] * 30 : undefined
                };
                
                const secondAsset = {
                  type: objectType,
                  color: '#708090',
                  height: objectType === 'tower' ? ctx[secondKey] * 100 : undefined,
                  length: objectType !== 'tower' ? ctx[secondKey] * 100 : undefined,
                  radius: objectType === 'circle' ? ctx[secondKey] * 30 : undefined
                };
                
                return (
                  <div className="context-display" style={{ width: '100%', padding: '20px' }}>
                    <div className="ruler-comparison" style={{ 
                      display: 'flex', 
                      gap: '60px', 
                      justifyContent: 'center', 
                      alignItems: 'flex-end',
                      minHeight: '180px',
                      padding: '20px'
                    }}>
                      <div className="ruler-a" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                      }}>
                        <span style={{ 
                          marginBottom: '15px', 
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {firstKey === 'rulerA' ? 'Ruler A' : 
                           firstKey === 'left' ? 'Left' : 
                           firstKey === 'stick1' ? 'First' : 
                           firstKey.charAt(0).toUpperCase() + firstKey.slice(1)}:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          {generateMeasurementSVG('temp_asset_1', 120, firstAsset)}
                        </div>
                      </div>
                      <div className="ruler-b" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                      }}>
                        <span style={{ 
                          marginBottom: '15px', 
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {secondKey === 'rulerB' ? 'Ruler B' : 
                           secondKey === 'right' ? 'Right' : 
                           secondKey === 'stick2' ? 'Second' : 
                           secondKey.charAt(0).toUpperCase() + secondKey.slice(1)}:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          {generateMeasurementSVG('temp_asset_2', 120, secondAsset)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="sentence-completion">
              <div className="sentence-options">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={`option-btn ${textInput === option ? 'selected' : ''}`}
                    onClick={() => handleTextInput(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tick/Cross Questions */}
        {currentQuestion.type === 'tick_cross' && (
          <div className="tick-cross-question">
            <div className="instruction">
              <p>{currentQuestion.action === 'tick' ? '✓ Tick' : '✗ Cross'} the correct items</p>
            </div>
            <div className="tick-cross-grid">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`tick-cross-item ${selectedItems.has(option.id) ? 'selected' : ''}`}
                  onClick={() => handleItemToggle(option.id)}
                >
                  <div className="item-content">
                    {generateMeasurementSVG(option.image)}
                  </div>
                  <div className="selection-indicator">
                    {selectedItems.has(option.id) && (
                      <span className="selection-mark">
                        {currentQuestion.action === 'tick' ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scene ID Questions */}
        {currentQuestion.type === 'scene_id' && (
          <div className="scene-id-question">
            <div className="scene-display">
              {generateSceneSVG(currentQuestion.sceneImage)}
            </div>
            <div className="scene-options">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  className={`scene-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Identify Coin Questions */}
        {currentQuestion.type === 'identify_coin' && (
          <div className="identify-coin-question">
            <div className="coins-grid">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`coin-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="option-label">{option.id}</div>
                  {generateCoinSVG(option.image)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort 2 Questions - Binary Sorting */}
        {currentQuestion.type === 'sort_2' && (
          <div className="sort-2-question">
            <div className="items-to-sort">
              <h4>Items to sort:</h4>
              <div className="sortable-items">
                {currentQuestion.items
                  .filter(item => !sortedItems.some(sorted => sorted.id === item.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="sortable-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      {generateMeasurementSVG(item.image)}
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="sort-categories">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4>Sort into groups:</h4>
                {sortedItems.length > 0 && (
                  <button
                    onClick={() => setSortedItems([])}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Clear all"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="category-zones" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                {currentQuestion.categories.map((category, index) => {
                  const itemsInCategory = sortedItems.filter(item => item.sortedCategory === category);
                  return (
                    <div
                      key={category}
                      className="category-zone"
                      onDrop={(e) => handleSortDrop(e, category)}
                      onDragOver={handleDragOver}
                      style={{
                        flex: 1,
                        minHeight: '200px',
                        border: '3px dashed #ccc',
                        borderRadius: '12px',
                        padding: '15px',
                        background: '#f8f9fa'
                      }}
                    >
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        marginBottom: '15px',
                        textAlign: 'center',
                        color: '#333'
                      }}>
                        {category}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        alignItems: 'center'
                      }}>
                        {itemsInCategory.map((item) => (
                          <div 
                            key={item.id} 
                            style={{ 
                              position: 'relative',
                              background: 'white',
                              padding: '10px',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {generateMeasurementSVG(item.image, 80)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSortedItems(sortedItems.filter(sorted => sorted.id !== item.id));
                              }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                              }}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <p>{feedback.message}</p>
            {currentQuestion.explanation && (
              <p className="explanation">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* Check Answer Button */}
        {!feedback && (
          <button 
            className="btn btn-primary check-answer-btn" 
            onClick={checkAnswer}
            disabled={isChecking || !canCheckAnswer()}
          >
            {isChecking ? 'Checking...' : 'Check Answer'}
          </button>
        )}
      </div>

      {/* Immediate Feedback Popup */}
      {currentFeedbackData && (
        <ImmediateFeedback
          key={`feedback-q${currentQuestionIndex}`} // Unique key per question to ensure fresh component for each question
          isVisible={showImmediateFeedback}
          isCorrect={currentFeedbackData.isCorrect}
          question={currentFeedbackData.question}
          userAnswer={currentFeedbackData.userAnswer}
          correctAnswer={currentFeedbackData.correctAnswer}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );

  function canCheckAnswer() {
    switch (currentQuestion.type) {
      case 'pick_comparison':
      case 'scene_id':
      case 'identify_coin':
        return selectedOption !== null;
      case 'order_3':
        return orderedItems.filter(item => item).length === currentQuestion.items.length;
      case 'complete_sentence':
        return textInput.trim() !== '';
      case 'tick_cross':
        return selectedItems.size > 0;
      case 'sort_2':
        return sortedItems.length === currentQuestion.items.length;
      default:
        return true;
    }
  }
};

export default Measurement;
