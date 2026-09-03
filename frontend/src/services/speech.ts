// Speech Recognition & Web Speech TTS Synthesis helper

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
        this.recognition.lang = 'en-US';
      }
    }
  }

  public speak(text: string, onEnd?: () => void, lang: string = 'en-US') {
    if (!this.synth) return;
    this.synth.cancel(); // cancel active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'Hindi' ? 'hi-IN' : (lang === 'Telugu' ? 'te-IN' : 'en-US');

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public listen(onResult: (text: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (err: any) => {
      if (onError) onError(err);
    };

    this.recognition.start();
  }

  public stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();
