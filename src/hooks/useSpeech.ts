import { useState, useCallback, useEffect } from 'react';

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event: any) => {
      let message = 'An error occurred with voice recognition.';
      
      switch (event.error) {
        case 'no-speech':
          message = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          message = 'Microphone not found or not working. Please check your settings.';
          break;
        case 'not-allowed':
          message = 'Microphone permission was denied. Please allow access to use voice commands.';
          break;
        case 'network':
          message = 'A network error occurred during voice recognition.';
          break;
        case 'service-not-allowed':
          message = 'Voice recognition is not allowed by your browser or device.';
          break;
        default:
          message = `Voice recognition error: ${event.error}`;
      }
      
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptValue = event.results[current][0].transcript;
      setTranscript(transcriptValue);
    };

    recognition.start();
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text: remove markdown syntax and raw URLs that shouldn't be spoken
    const cleanedText = text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/https?:\/\/\S+/g, '') // Remove raw URLs
      .replace(/[*_#~`]/g, '') // Remove other markdown symbols
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Attempt to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('google us english') || // Often female
      voice.name.toLowerCase().includes('microsoft zira') // Windows female
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1.1; // Slightly higher pitch for a more natural female tone if default is used
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { isListening, transcript, error, startListening, speak, setTranscript, clearError };
};
