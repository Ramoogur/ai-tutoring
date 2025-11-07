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
    }
  
    /**
     * Get voice configuration for child-like voice
     * Using Google's Wavenet voices with high pitch for child-like quality
     */
    getVoiceConfig() {
      return {
        languageCode: 'en-US',
        // Use Wavenet voices for more natural, child-like quality
        // Options: en-US-Wavenet-F (female child-like), en-US-Neural2-E (young female)
        name: 'en-US-Wavenet-F',
        ssmlGender: 'FEMALE'
      };
    }
  
    /**
     * Get audio configuration for child-like voice
     */
    getAudioConfig() {
      return {
        audioEncoding: 'MP3',
        // Higher pitch makes voice sound younger/child-like
        pitch: 4.0,  // Range: -20.0 to 20.0 (positive = higher pitch)
        // Slightly faster speaking rate for energetic child voice
        speakingRate: 1.1,  // Range: 0.25 to 4.0 (1.0 = normal)
        volumeGainDb: 0.0
      };
    }
  
    /**
     * Convert text to speech using Google Cloud TTS API
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
          voice: this.getVoiceConfig(),
          audioConfig: this.getAudioConfig()
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
     * Play text as speech
     * @param {string} text - Text to speak
     */
    async speak(text) {
      if (this.isSpeaking) {
        this.stop(); // Stop current speech before starting new one
      }
  
      try {
        this.isSpeaking = true;
        const audioContent = await this.synthesizeSpeech(text);
        
        // Convert base64 to audio blob
        const audioBlob = this.base64ToBlob(audioContent, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        this.currentAudio = new Audio(audioUrl);
        
        return new Promise((resolve, reject) => {
          this.currentAudio.onended = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          
          this.currentAudio.onerror = (error) => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            reject(error);
          };
          
          this.currentAudio.play();
        });
      } catch (error) {
        this.isSpeaking = false;
        throw error;
      }
    }
  
    /**
     * Stop current speech
     */
    stop() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
      this.isSpeaking = false;
    }
  
    /**
     * Read quiz question and options aloud
     * @param {string} question - Question text
     * @param {Array<string>} options - Array of answer options
     */
    async readQuizQuestion(question, options = []) {
      let fullText = question;
      
      if (options && options.length > 0) {
        fullText += '. The options are: ';
        fullText += options.map((opt, index) => {
          // Handle different option formats
          if (typeof opt === 'object') {
            return `Option ${index + 1}: ${opt.text || opt.label || opt.description || 'option'}`;
          }
          return `Option ${index + 1}: ${opt}`;
        }).join(', ');
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