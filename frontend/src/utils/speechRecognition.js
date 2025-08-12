// utils/speechRecognition.js
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    
    // Check for browser support
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.isSupported = true;
    } else if ('SpeechRecognition' in window) {
      this.recognition = new window.SpeechRecognition();
      this.isSupported = true;
    }
    
    if (this.isSupported) {
      this.setupRecognition();
    }
  }

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  async startListening(onResult, onEnd, onError) {
    if (!this.isSupported) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    // Request microphone permission
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      onError('Microphone permission required for voice input');
      return;
    }

    this.isListening = true;
    let finalTranscript = '';
    let interimTranscript = '';
    
    this.recognition.onresult = (event) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      onResult(finalTranscript, interimTranscript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error occurred';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      onError(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd(finalTranscript);
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError('Failed to start speech recognition');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isRecognitionSupported() {
    return this.isSupported;
  }

  getCurrentLanguage() {
    return this.recognition ? this.recognition.lang : 'en-US';
  }

  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}
