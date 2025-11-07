/**
 * Translation Service
 * Provides translation functionality for quiz content between English and French
 * Uses MyMemory Translation API as a free translation service
 */

const translationCache = new Map();

// Fallback dictionary for common quiz terms
const fallbackDictionary = {
  // Numbers
  'zero': 'zéro', 'one': 'un', 'two': 'deux', 'three': 'trois', 'four': 'quatre',
  'five': 'cinq', 'six': 'six', 'seven': 'sept', 'eight': 'huit', 'nine': 'neuf', 'ten': 'dix',
  
  // Common quiz terms
  'count': 'compter', 'how many': 'combien', 'what is': 'quel est', 'which': 'lequel',
  'more': 'plus', 'less': 'moins', 'same': 'pareil', 'equal': 'égal',
  'correct': 'correct', 'incorrect': 'incorrect', 'well done': 'bien joué',
  'try again': 'réessayer', 'next question': 'question suivante',
  'submit answer': 'soumettre la réponse', 'checking': 'vérification',
  'question': 'question', 'answer': 'réponse', 'options': 'options',
  
  // Mathematical terms
  'plus': 'plus', 'minus': 'moins', 'times': 'fois', 'divided by': 'divisé par',
  'equals': 'égale', 'add': 'ajouter', 'subtract': 'soustraire',
  'multiply': 'multiplier', 'divide': 'diviser', 'sum': 'somme',
  'total': 'total', 'difference': 'différence', 'product': 'produit',
  
  // Colors
  'red': 'rouge', 'blue': 'bleu', 'green': 'vert', 'yellow': 'jaune',
  'orange': 'orange', 'purple': 'violet', 'pink': 'rose', 'black': 'noir', 'white': 'blanc',
  
  // Shapes
  'circle': 'cercle', 'square': 'carré', 'triangle': 'triangle', 'rectangle': 'rectangle',
  'star': 'étoile', 'heart': 'cœur', 'diamond': 'diamant',
  
  // Time
  'hour': 'heure', 'minute': 'minute', 'clock': 'horloge', 'time': 'temps',
  'morning': 'matin', 'afternoon': 'après-midi', 'evening': 'soir', 'night': 'nuit',
  
  // Money
  'coin': 'pièce', 'money': 'argent', 'cent': 'centime', 'rupee': 'roupie',
  
  // Measurement
  'long': 'long', 'short': 'court', 'tall': 'grand', 'small': 'petit',
  'big': 'grand', 'little': 'petit',
  
  // UI text
  'quiz complete': 'quiz terminé', 'excellent work': 'excellent travail',
  'good job': 'bon travail', 'keep trying': 'continuez',
  'score': 'score', 'correct': 'correct', 'incorrect': 'incorrect'
};

/**
 * Extract and preserve numbers, mathematical symbols, and special characters
 * @param {string} text - Text to process
 * @returns {Object} Object with text parts, numbers, and symbols
 */
const extractPreservedElements = (text) => {
  // Pattern to match: numbers (including decimals), mathematical operators, and common symbols
  const preservedPattern = /(\d+(?:\.\d+)?|[+\-×÷=<>≤≥≠±%$€£₹¢]|[\u2190-\u21FF]|[\u2200-\u22FF])/g;
  
  const preserved = [];
  const parts = [];
  let lastIndex = 0;
  let match;
  
  // Find all preserved elements (numbers, symbols)
  while ((match = preservedPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: text.substring(lastIndex, match.index),
        index: lastIndex
      });
    }
    
    // Add preserved element
    const preservedItem = {
      type: 'preserved',
      value: match[0],
      index: match.index
    };
    parts.push(preservedItem);
    preserved.push(preservedItem);
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      value: text.substring(lastIndex),
      index: lastIndex
    });
  }
  
  // If no preserved elements found, return the whole text as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      value: text,
      index: 0
    });
  }
  
  return { parts, preserved };
};

/**
 * Reconstruct text with preserved elements
 * @param {Array} parts - Array of parts with type and value
 * @returns {string} Reconstructed text
 */
const reconstructText = (parts) => {
  return parts.map(part => part.value).join('');
};

/**
 * Translate text from English to French, preserving numbers and symbols
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (default: 'fr')
 * @returns {Promise<string>} Translated text with numbers and symbols preserved
 */
const translateText = async (text, targetLang = 'fr') => {
  if (!text || typeof text !== 'string') return text;
  
  // Check cache first
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  // Check fallback dictionary for exact matches
  const lowerText = text.toLowerCase().trim();
  if (fallbackDictionary[lowerText]) {
    const translated = fallbackDictionary[lowerText];
    translationCache.set(cacheKey, translated);
    return translated;
  }
  
  // For pure numbers, return as is
  if (/^-?\d+(?:\.\d+)?$/.test(text.trim())) {
    return text;
  }
  
  // Extract preserved elements (numbers, symbols)
  const { parts } = extractPreservedElements(text);
  
  // If text contains no words (only numbers/symbols), return as is
  const hasText = parts.some(part => part.type === 'text' && part.value.trim().length > 0);
  if (!hasText) {
    return text;
  }
  
  try {
    // Extract only text parts for translation
    const textParts = parts.filter(part => part.type === 'text' && part.value.trim().length > 0);
    
    if (textParts.length === 0) {
      return text;
    }
    
    // Translate each text part separately
    const translatedParts = await Promise.all(
      parts.map(async (part) => {
        if (part.type === 'preserved') {
          // Keep numbers and symbols as-is
          return part;
        } else {
          // Translate text parts
          const originalValue = part.value;
          const textToTranslate = originalValue.trim();
          
          // If only whitespace, keep as-is
          if (!textToTranslate) {
            return part;
          }
          
          // Check cache for this text part
          const partCacheKey = `${textToTranslate}_${targetLang}`;
          if (translationCache.has(partCacheKey)) {
            const translated = translationCache.get(partCacheKey);
            return {
              ...part,
              value: originalValue.replace(textToTranslate, translated)
            };
          }
          
          // Check fallback dictionary
          const lowerPart = textToTranslate.toLowerCase();
          if (fallbackDictionary[lowerPart]) {
            const translated = fallbackDictionary[lowerPart];
            translationCache.set(partCacheKey, translated);
            return {
              ...part,
              value: originalValue.replace(textToTranslate, translated)
            };
          }
          
          // Use translation API
          let translatedText = textToTranslate;
          try {
            const response = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
                translatedText = data.responseData.translatedText;
                translationCache.set(partCacheKey, translatedText);
              }
            }
          } catch (error) {
            console.warn('Translation API error for part:', textToTranslate, error);
            // Use dictionary fallback
            translatedText = fallbackDictionary[lowerPart] || textToTranslate;
          }
          
          // Replace the trimmed text with translated version, preserving whitespace
          return {
            ...part,
            value: originalValue.replace(textToTranslate, translatedText)
          };
        }
      })
    );
    
    // Reconstruct the full text
    const result = reconstructText(translatedParts);
    translationCache.set(cacheKey, result);
    return result;
    
  } catch (error) {
    console.warn('Translation error:', error);
    // Fallback: return original text
    return text;
  }
};

/**
 * Translate multiple texts in parallel
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} Array of translated texts
 */
const translateMultiple = async (texts, targetLang = 'fr') => {
  if (!Array.isArray(texts)) return texts;
  
  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLang))
    );
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
};

/**
 * Translate a question object
 * @param {Object} question - Question object with question, options, answer, etc.
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Translated question object
 */
const translateQuestion = async (question, targetLang = 'fr') => {
  if (!question) return question;
  
  const translated = { ...question };
  
  // Translate question text
  if (question.question) {
    translated.question = await translateText(question.question, targetLang);
  }
  
  if (question.prompt) {
    translated.prompt = await translateText(question.prompt, targetLang);
  }
  
  // Translate options
  if (question.options && Array.isArray(question.options)) {
    translated.options = await translateMultiple(question.options, targetLang);
  }
  
  if (question.choices && Array.isArray(question.choices)) {
    translated.choices = await translateMultiple(question.choices, targetLang);
  }
  
  // Translate answer (if it's text, not a number)
  if (question.answer && typeof question.answer === 'string') {
    const answerText = question.answer.trim();
    if (!/^-?\d+(?:\.\d+)?$/.test(answerText)) {
      translated.answer = await translateText(question.answer, targetLang);
    }
  }
  
  // Translate feedback messages
  if (question.feedback) {
    if (typeof question.feedback === 'string') {
      translated.feedback = await translateText(question.feedback, targetLang);
    } else if (typeof question.feedback === 'object') {
      translated.feedback = { ...question.feedback };
      if (question.feedback.correct) {
        translated.feedback.correct = await translateText(question.feedback.correct, targetLang);
      }
      if (question.feedback.incorrect) {
        translated.feedback.incorrect = await translateText(question.feedback.incorrect, targetLang);
      }
    }
  }
  
  return translated;
};

/**
 * Translate UI text strings
 * @param {Object} uiTexts - Object with UI text strings
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Translated UI texts
 */
const translateUITexts = async (uiTexts, targetLang = 'fr') => {
  if (!uiTexts || typeof uiTexts !== 'object') return uiTexts;
  
  const translated = {};
  
  for (const [key, value] of Object.entries(uiTexts)) {
    if (typeof value === 'string') {
      translated[key] = await translateText(value, targetLang);
    } else if (Array.isArray(value)) {
      translated[key] = await translateMultiple(value, targetLang);
    } else {
      translated[key] = value;
    }
  }
  
  return translated;
};

/**
 * Clear translation cache
 */
const clearCache = () => {
  translationCache.clear();
};

export default {
  translateText,
  translateMultiple,
  translateQuestion,
  translateUITexts,
  clearCache,
  fallbackDictionary
};

