/**
 * Text-to-Speech Service using Google Cloud Text-to-Speech API
 * Configured with child-like voice for grade 1 students
 */

class TextToSpeechService {
    constructor() {
      this.apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      this.endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
      this.audioCache = new Map(); // Cache for audio to avoid repeated API calls
      this.isSpeaking = false;
      this.currentAudio = null;
      this.currentAudioUrl = null;
      this.currentSpeechToken = 0;
    }
  
    /**
     * Detect if text is in French
     * @param {string} text - Text to analyze
     * @returns {boolean} - True if text appears to be French
     */
    isFrenchText(text) {
      if (!text) return false;
      
      // Common French words and patterns
      const frenchIndicators = [
        // Articles
        /\b(le|la|les|un|une|des|du|de la|de l')\b/i,
        // Common verbs
        /\b(est|sont|être|avoir|fait|fait|être)\b/i,
        // Common words
        /\b(avec|dans|pour|sur|sous|entre|chez|par)\b/i,
        // French accented characters
        /[àâäæçéèêëïîôùûüÿœ]/i,
        // Common French question words
        /\b(quel|quelle|quels|quelles|combien|comment|pourquoi|où)\b/i,
        // Common French phrases
        /\b(qu'est-ce|c'est|il y a|voici|voilà)\b/i
      ];
      
      // Check if text contains French indicators
      return frenchIndicators.some(pattern => pattern.test(text));
    }

    /**
     * Get voice configuration for child-like voice
     * Using Google's Wavenet voices with high pitch for child-like quality
     * Optimized for Grade 1 students (ages 6-7)
     * @param {string} text - Text to determine language
     */
    getVoiceConfig(text = '') {
      const isFrench = this.isFrenchText(text);
      
      if (isFrench) {
        // French child-friendly voice
        return {
          languageCode: 'fr-FR',
          // Use Wavenet-A for warm, friendly female child-like French voice
          // Other options: fr-FR-Wavenet-C (female), fr-FR-Neural2-A (young female)
          name: 'fr-FR-Wavenet-A',
          ssmlGender: 'FEMALE'
        };
      } else {
        // English child-friendly voice
        return {
          languageCode: 'en-US',
          // Use Wavenet-F for warm, friendly female child-like voice
          // Other child-friendly options: en-US-Wavenet-H (female), en-US-Neural2-F (young female)
          name: 'en-US-Wavenet-F',
          ssmlGender: 'FEMALE'
        };
      }
    }
  
    /**
     * Get audio configuration for child-like voice
     * Optimized for Grade 1 students - slower pace for comprehension
     * @param {string} text - Text to determine language for optimal speed
     */
    getAudioConfig(text = '') {
      const isFrench = this.isFrenchText(text);
      
      return {
        audioEncoding: 'MP3',
        // Higher pitch makes voice sound younger/child-like (sweet, friendly tone)
        pitch: 5.0,  // Range: -20.0 to 20.0 (increased for more child-like quality)
        // Much slower speaking rate for Grade 1 students (ages 6-7)
        // French needs to be even slower due to more complex pronunciation
        speakingRate: isFrench ? 0.55 : 0.60,  // Further reduced speed for better comprehension
        volumeGainDb: 1.0  // Slightly louder for clarity
      };
    }
  
    /**
     * Convert text to speech using Google Cloud TTS API
     * Automatically detects language (English or French)
     * @param {string} text - Text to convert to speech
     * @returns {Promise<string>} - Base64 encoded audio content
     */
    async synthesizeSpeech(text) {
      if (!this.apiKey) {
        console.error('Google Cloud API key not found. Please add VITE_GOOGLE_CLOUD_API_KEY to your .env file.');
        throw new Error('Google Cloud API key not configured');
      }
  
      // Check cache first
      if (this.audioCache.has(text)) {
        return this.audioCache.get(text);
      }
  
      try {
        const requestBody = {
          input: { text },
          voice: this.getVoiceConfig(text),  // Pass text for language detection
          audioConfig: this.getAudioConfig(text)  // Pass text for language-specific audio config
        };

        const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`TTS API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const audioContent = data.audioContent;

        // Cache the audio
        this.audioCache.set(text, audioContent);

        return audioContent;
      } catch (error) {
        console.error('Text-to-Speech Error:', error);
        throw error;
      }
    }
  
    /**
     * Fallback to browser's built-in Web Speech API
     * @param {string} text - Text to speak
     * @param {string} lang - Language code (en-US or fr-FR)
     */
    speakWithBrowserAPI(text, lang = 'en-US', speechToken) {
      return new Promise((resolve, reject) => {
        // Check if browser supports speech synthesis
        if (!('speechSynthesis' in window)) {
          reject(new Error('Browser does not support speech synthesis'));
          return;
        }

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language
        utterance.lang = lang;
        
        // Configure voice settings for child-friendly speech
        const isFrench = lang.startsWith('fr');
        utterance.rate = isFrench ? 0.70 : 0.75; // Slower for Grade 1 students
        utterance.pitch = 1.5; // Higher pitch for child-like voice
        utterance.volume = 1.0; // Full volume
        
        utterance.onend = () => {
          if (this.currentSpeechToken === speechToken) {
            this.isSpeaking = false;
          }
          resolve();
        };
        
        utterance.onerror = (error) => {
          this.isSpeaking = false;
          console.error('Browser TTS Error:', error);
          reject(error);
        };
        
        this.isSpeaking = true;
        window.speechSynthesis.speak(utterance);
      });
    }

    /**
     * Play text as speech
     * Uses Google Cloud TTS with fallback to browser's built-in API
     * @param {string} text - Text to speak
     */
    async speak(text) {
      const speechToken = ++this.currentSpeechToken;
      this.stopActivePlayback();
  
      // Try Google Cloud TTS first
      if (this.apiKey) {
        try {
          this.isSpeaking = true;
          const audioContent = await this.synthesizeSpeech(text);

          if (this.currentSpeechToken !== speechToken) {
            this.isSpeaking = false;
            return;
          }
          
          // Convert base64 to audio blob
          const audioBlob = this.base64ToBlob(audioContent, 'audio/mp3');
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Create and play audio
          this.currentAudio = new Audio(audioUrl);
          this.currentAudioUrl = audioUrl;
          
          return new Promise((resolve, reject) => {
            this.currentAudio.onended = () => {
              if (this.currentSpeechToken === speechToken) {
                this.isSpeaking = false;
              }
              URL.revokeObjectURL(audioUrl);
              if (this.currentAudioUrl === audioUrl) {
                this.currentAudioUrl = null;
              }
              resolve();
            };
            
            this.currentAudio.onerror = (error) => {
              this.isSpeaking = false;
              URL.revokeObjectURL(audioUrl);
              if (this.currentAudioUrl === audioUrl) {
                this.currentAudioUrl = null;
              }
              reject(error);
            };
            
            this.currentAudio.play();
          });
        } catch (error) {
          this.isSpeaking = false;
          console.warn('⚠️ Google Cloud TTS failed, falling back to browser TTS:', error.message);
          // Fall through to browser API
        }
      }
      
      // Fallback to browser's built-in speech synthesis
      try {
        const isFrench = this.isFrenchText(text);
        const lang = isFrench ? 'fr-FR' : 'en-US';
        console.log(`🔊 Using browser TTS with language: ${lang}`);
        this.isSpeaking = true;
        await this.speakWithBrowserAPI(text, lang, speechToken);
      } catch (error) {
        this.isSpeaking = false;
        throw error;
      }
    }
  
    /**
     * Stop current speech
     */
    stop() {
      this.currentSpeechToken += 1;
      this.stopActivePlayback();
    }

    stopActivePlayback() {
      // Stop Google Cloud TTS audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }

      if (this.currentAudioUrl) {
        URL.revokeObjectURL(this.currentAudioUrl);
        this.currentAudioUrl = null;
      }
      
      // Stop browser speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      this.isSpeaking = false;
    }
  
    /**
     * Clean text for speech by removing visual placeholders
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     */
    cleanTextForSpeech(text) {
      if (!text) return '';
      
      return text
        // Remove underscores (used as blanks/placeholders)
        .replace(/_+/g, '')
        // Remove standalone question marks used as placeholders (but keep those at the end of questions)
        .replace(/\s+\?\s+/g, ' ')
        // Remove box drawing characters and empty boxes (□, ▢, etc.)
        .replace(/[□▢▣▤▥▦▧▨▩⬜⬛◻◼◽◾▫▪]/g, '')
        // Remove multiple consecutive spaces and trim
        .replace(/\s+/g, ' ')
        .trim();
    }

    /**
     * Read quiz question and options aloud
     * Automatically detects language (English or French)
     * @param {string} question - Question text
     * @param {Array<string>} options - Array of answer options
     */
    async readQuizQuestion(question, options = []) {
      // Clean the question text to remove visual placeholders like underscores
      let fullText = this.cleanTextForSpeech(question);
      
      // Detect if the text is in French
      const isFrench = this.isFrenchText(fullText);
      
      // Only read options if they are text-based (not just numbers in an input field)
      if (options && options.length > 0) {
        // Filter out empty options and numeric-only options that are likely input values
        const validOptions = options.filter(opt => {
          if (!opt) return false;
          // If it's an object, check if it has meaningful text
          if (typeof opt === 'object') {
            const text = opt.text || opt.label || opt.description || '';
            return text.length > 0;
          }
          // If it's a string, check if it's not just a number or empty
          const optStr = String(opt).trim();
          return optStr.length > 0 && !/^\d+$/.test(optStr);
        });

        if (validOptions.length > 0) {
          // Use appropriate language for "The options are"
          if (isFrench) {
            fullText += '. Les options sont: ';
          } else {
            fullText += '. The options are: ';
          }
          
          fullText += validOptions.map((opt, index) => {
            // Handle different option formats
            if (typeof opt === 'object') {
              const optionText = opt.text || opt.label || opt.description || 'option';
              return isFrench ? `Option ${index + 1}: ${optionText}` : `Option ${index + 1}: ${optionText}`;
            }
            return isFrench ? `Option ${index + 1}: ${opt}` : `Option ${index + 1}: ${opt}`;
          }).join(', ');
        }
      }

      await this.speak(fullText);
    }
  
    /**
     * Convert base64 string to Blob
     * @param {string} base64 - Base64 encoded string
     * @param {string} contentType - MIME type
     * @returns {Blob}
     */
    base64ToBlob(base64, contentType) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    }
  
    /**
     * Clear audio cache
     */
    clearCache() {
      this.audioCache.clear();
    }
  
    /**
     * Check if TTS is currently speaking
     */
    get isActive() {
      return this.isSpeaking;
    }
  }
  
  // Export singleton instance
  export const ttsService = new TextToSpeechService();
  export default ttsService;