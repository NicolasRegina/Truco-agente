class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public voicesEnabled: boolean = true;
  public musicEnabled: boolean = false;
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

        const spanishVoices = voices.filter(
          v => v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().includes('es-')
        );

        if (spanishVoices.length === 0) return;

        // Score voices to prioritize authentic Argentine / Rioplatense or high-quality Latin American voices,
        // and deprioritize robotic or peninsular (Spain) voices that sound like Loquendo.
        const getVoiceScore = (v: SpeechSynthesisVoice): number => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase().replace('_', '-');
          let score = 0;

          // 1. Argentine / Uruguayan voices (Top priority)
          if (lang === 'es-ar' || lang === 'es-uy') score += 100;
          if (name.includes('argentin') || name.includes('tomas') || name.includes('elena') || name.includes('mateo')) score += 60;

          // 2. High-quality neural / natural / online voices
          if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 40;

          // 3. High-quality Google Latin voices (es-US, es-419)
          if (lang === 'es-us' || lang === 'es-419') score += 35;
          if (name.includes('google') && !lang.includes('es-es')) score += 30;

          // 4. Other Latin American regional voices (Mexico, Colombia, Chile)
          if (lang.includes('es-mx') || lang.includes('es-co') || lang.includes('es-cl')) score += 15;

          // 5. Heavy penalty for peninsular Spain voices (ceceo/lisp sounds completely unnatural for Truco)
          if (lang === 'es-es' || name.includes('spain') || name.includes('españa') || name.includes('castilian') || name.includes('helena') || name.includes('laura')) {
            score -= 50;
          }

          // 6. Penalty for old legacy desktop synthesizers
          if (name.includes('desktop') || name.includes('sapi')) score -= 15;

          return score;
        };

        const sortedVoices = [...spanishVoices].sort((a, b) => getVoiceScore(b) - getVoiceScore(a));
        this.selectedVoice = sortedVoices[0] || null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  // Voice clips library (supports real recordings / celebrity clips like Messi)
  private voiceClips: { pattern: RegExp; file: string }[] = [
    { pattern: /and[aá]\s+pa['\s]*all[aá]\s+bobo/i, file: '/audio/messi_anda_pa_alla.mp3' },
    { pattern: /mir[aá]\s+que\s+te\s+como/i, file: '/audio/dibu_mira_que_te_como.mp3' },
    { pattern: /\btruco\b/i, file: '/audio/canto_truco.mp3' },
    { pattern: /\bretruco\b/i, file: '/audio/canto_retruco.mp3' },
    { pattern: /\bvale\s+cuatro\b/i, file: '/audio/canto_vale_cuatro.mp3' },
    { pattern: /\b(falta\s+envido)\b/i, file: '/audio/canto_falta_envido.mp3' },
    { pattern: /\b(real\s+envido)\b/i, file: '/audio/canto_real_envido.mp3' },
    { pattern: /\benvido\b/i, file: '/audio/canto_envido.mp3' },
    { pattern: /\bquiero\b/i, file: '/audio/canto_quiero.mp3' },
    { pattern: /\bno\s+quiero\b/i, file: '/audio/canto_no_quiero.mp3' },
  ];

  private playAudioClip(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        audio.volume = 0.95;
        let resolved = false;

        audio.onplay = () => {
          if (!resolved) {
            resolved = true;
            resolve(true);
          }
        };

        audio.onerror = () => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!resolved) {
                resolved = true;
                resolve(true);
              }
            })
            .catch(() => {
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            });
        }
      } catch {
        resolve(false);
      }
    });
  }

  public async speakCanto(phrase: string) {
    if (!this.enabled || !this.voicesEnabled) return;

    try {
      // 1. Remove player sender prefix if present (e.g. "Nicolás Regina: " or "Bot Canchero: ")
      let cleanText = phrase.replace(/^[^:]+:\s*/, '');

      // 2. Strip all Unicode emojis and pictograms so nothing ever reads "mate", "naipe", etc.
      cleanText = cleanText
        .replace(/\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?/gu, '')
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        .replace(/[🧉🃏⚡🤔🔥🎯💪🤫👉👈👀😏🤦‍♂️🤦✨😠🥰]/gu, '')
        .replace(/[*#_~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      // 3. Check if there is an authentic recorded audio clip (e.g. Messi or Dibu)
      const matchedClip = this.voiceClips.find(c => c.pattern.test(cleanText));
      if (matchedClip) {
        const played = await this.playAudioClip(matchedClip.file);
        if (played) return; // Successfully played authentic voice recording!
      }

      // 4. Fallback to browser SpeechSynthesis if no custom audio clip is available
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      // Phonetic tuning:
      // In Spanish, 'h' is completely silent. Some synth engines (like US or Mexican voices)
      // mistakenly aspirate initial 'h' like in English (pronouncing "jagas").
      // Replacing "hagas/hagás" with "agas/agás" guarantees 100% proper silent-h pronunciation.
      let synthText = cleanText
        .replace(/\bmira que te como hermano\b/gi, '¡Mirá que te como, hermano!')
        .replace(/\bno te hag[aá]s el vivo\b/gi, '¡No te agás el vivo!')
        .replace(/\bno te hag[aá]s el boludo\b/gi, '¡No te agás el boludo!')
        .replace(/\banda pa alla bobo\b/gi, "¡Andá pa' allá, bobo!")
        .replace(/\bay que lindo\b/gi, '¡Ay, qué lindo!')
        .replace(/\bque lindo que est[aá] el d[ií]a\b/gi, '¡Qué lindo que está el día!')
        .replace(/\bhag[aá]s\b/gi, 'agás')
        .replace(/\bhagas\b/gi, 'agas');

      const utterance = new SpeechSynthesisUtterance(synthText);
      // Normal speech speed (1.0) and natural pitch
      utterance.rate = 1.0;
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
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.14);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playCardSlam() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([40, 20, 60]);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub-bass table thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playMateSlurp() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([30, 40, 80]);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Liquid bubbling slurp noise simulation
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 400, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(600 + Math.random() * 200, now + i * 0.08 + 0.06);

      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.06);
    }
  }

  public playTensionPulse() {
    if (!this.enabled) return;
    this.init();
    this.vibrate([100, 50, 150]);
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
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
