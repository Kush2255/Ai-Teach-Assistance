// Speech Recognition & Web Speech TTS Synthesis helper supporting English, Hindi, Hinglish, and Telugu

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  private getLangCode(lang: string): string {
    switch (lang) {
      case 'Hindi':
        return 'hi-IN';
      case 'Telugu':
        return 'te-IN';
      case 'Hinglish':
        return 'hi-IN';
      case 'English':
      default:
        return 'en-US';
    }
  }

  public speak(text: string, onEnd?: () => void, lang: string = 'English') {
    if (!this.synth) return;
    this.synth.cancel(); // cancel active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const targetCode = this.getLangCode(lang);
    utterance.lang = targetCode;

    // Pick best available voice for language if available in browser
    if (this.synth.getVoices) {
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(targetCode.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public listen(onResult: (text: string) => void, onError?: (err: any) => void, lang: string = 'English') {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    this.recognition.lang = this.getLangCode(lang);

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (err: any) => {
      if (onError) onError(err);
    };

    try {
      this.recognition.start();
    } catch {
      // Ignore if already started
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }
}

export const speechService = new SpeechService();
