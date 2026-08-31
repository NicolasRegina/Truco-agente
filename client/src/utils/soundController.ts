class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public voicesEnabled: boolean = true;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initVoice();
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // Prioritize natural / neural Argentine, Latin American, or Spanish voices
        const spanishVoices = voices.filter(v => v.lang.startsWith('es') || v.lang.includes('ES') || v.lang.includes('AR'));

        // Rank by best natural sound
        const bestVoice =
          spanishVoices.find(v => v.lang === 'es-AR' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) ||
          spanishVoices.find(v => v.lang === 'es-AR') ||
          spanishVoices.find(v => v.lang === 'es-419' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) ||
          spanishVoices.find(v => v.lang === 'es-419') ||
          spanishVoices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Tomas') || v.name.includes('Diego'))) ||
          spanishVoices[0] ||
          null;

        this.selectedVoice = bestVoice;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public speakCanto(phrase: string) {
    if (!this.enabled || !this.voicesEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech immediately

      // Robust emoji and special character remover regex
      const cleanText = phrase
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/gu, '')
        .replace(/[¡!¿?*#_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1; // Balanced quick conversational speed
      utterance.pitch = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang;
      } else {
        utterance.lang = 'es-AR';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  }

  public vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore restriction
      }
    }
  }

  public playCardFlick() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(20);
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playCardSnap() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(35);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playScoreTally() {
    if (!this.enabled) return;
    this.init();
    this.vibrate(40);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCanto(spokenPhrase?: string) {
    if (!this.enabled) return;
    this.init();
    this.vibrate([60, 40, 60]);

    if (spokenPhrase && this.voicesEnabled) {
      this.speakCanto(spokenPhrase);
    }

    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [330, 440, 554];

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.25);
    });
  }

  public playWinFanfare() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([150, 80, 150, 80, 300]);
    if (!this.ctx) return;

    const notes = [440, 554, 659, 880];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  }
}

export const soundFx = new SoundController();
