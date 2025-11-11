const DEFAULT_REQUEST = {
  voice: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-C',
    ssmlGender: 'FEMALE'
  },
  audioConfig: {
    audioEncoding: 'MP3',
    speakingRate: 0.95,
    pitch: 0
  }
};

export const synthesizeSpeech = async (text, options = {}) => {
  if (!text) {
    throw new Error('No text provided for speech synthesis.');
  }

  const apiKey = process.env.REACT_APP_GOOGLE_SPEECH_API_KEY || process.env.GOOGLE_SPEECH_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Google Speech API key. Please set REACT_APP_GOOGLE_SPEECH_API_KEY.');
  }

  const requestBody = {
    input: { text },
    voice: {
      ...DEFAULT_REQUEST.voice,
      ...(options.voice || {})
    },
    audioConfig: {
      ...DEFAULT_REQUEST.audioConfig,
      ...(options.audioConfig || {})
    }
  };

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Google Text-to-Speech request failed');
  }

  if (!data?.audioContent) {
    throw new Error('Google Text-to-Speech response missing audio content');
  }

  return data.audioContent;
};

