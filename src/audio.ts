/**
 * Web Audio API procedural sound engine for Win95 Zombie Shooter
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public masterVolume: number = 0.7;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.initContext();
    if (this.musicEnabled && !this.bgmInterval) {
      this.startMusic();
    }
  }

  // Shotgun boom + crunch
  public playShotgun() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.8 * this.masterVolume, t);
    master.connect(this.ctx.destination);

    // Punch oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);
    oscGain.gain.setValueAtTime(1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(t);
    osc.stop(t + 0.22);

    // Noise blast
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.25);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(t);
    noise.stop(t + 0.26);

    // Pump sound delayed
    setTimeout(() => {
      this.playPumpReload();
    }, 180);
  }

  // Shell insert / reload start
  public playReloadStart() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);
    gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Shell chambered / reload complete
  public playReloadComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.07);
    osc.frequency.setValueAtTime(380, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.16);

    gain.gain.setValueAtTime(0.45 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playPumpReload() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.05);
    osc.frequency.setValueAtTime(450, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.12);

    gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Melee shotgun butt swing & bash
  public playMeleeSwing() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playMeleeHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    gain.gain.setValueAtTime(0.7 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Slide attack whoosh
  public playSlide() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.22);
    gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Jump sound
  public playJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);
    gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Zombie hit / splat
  public playZombieHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Zombie death splat
  public playZombieDie() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    gain.gain.setValueAtTime(0.45 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Missile Launch
  public playMissileLaunch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.35);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Explosion (Missile or Boss hit)
  public playExplosion() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.42);
  }

  // Player hurt
  public playPlayerHurt() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
    gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Zombie Crow screech / caw (Filtered to avoid harsh shrieking)
  public playCrowCaw() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
    osc.frequency.setValueAtTime(550, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.5, t);

    gain.gain.setValueAtTime(0.24 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Win Fanfare (Pleasant & balanced volume)
  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.14 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      }, i * 90);
    });
  }

  // Powerup / Combo Bomb Award Chime
  public playPowerup() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.22 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      }, i * 60);
    });
  }

  // Giant Mech Evil Laugh Sound
  public playMechLaugh(pitchMultiplier: number = 1.0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140 * pitchMultiplier, t);
    osc.frequency.linearRampToValueAtTime(190 * pitchMultiplier, t + 0.08);
    osc.frequency.linearRampToValueAtTime(110 * pitchMultiplier, t + 0.2);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Colossal Shadow Zombie Boss Deep Roar
  public playBossRoar() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.linearRampToValueAtTime(140, t + 0.25);
    osc1.frequency.linearRampToValueAtTime(45, t + 0.65);
    gain1.gain.setValueAtTime(0.35 * this.masterVolume, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(55, t);
    osc2.frequency.linearRampToValueAtTime(90, t + 0.3);
    osc2.frequency.linearRampToValueAtTime(30, t + 0.7);
    gain2.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.75);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.72);
    osc2.start(t);
    osc2.stop(t + 0.77);
  }

  // Heavy Car Throw Whoosh Sound
  public playCarThrow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Laser Beam Zap Sound (Softened and filtered)
  public playLaser() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);

    gain.gain.setValueAtTime(0.14 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Ticket Card Throw Shuriken Sound
  public playCardThrow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    gain.gain.setValueAtTime(0.12 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Metal Clang / Shield Deflect Sound (Warm filtered ring)
  public playMetalHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Touhou-style Procedural BGM Engine: Inspired by LoLK Junko's Theme "Pure Furies ~ Whereabouts of the Heart"
  // Re-engineered for crystal-clear, high-definition fidelity with zero hollow echo or boxy resonance
  public startMusic() {
    if (this.bgmInterval) return;

    // Frequencies in Hz (D minor / D Dorian / Harmonic minor scale)
    const D2 = 73.42, E2 = 82.41, F2 = 87.31, G2 = 98.0, A2 = 110.0, Bb2 = 116.54, C3 = 130.81, Cs3 = 138.59;
    const D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.0, A3 = 220.0, Bb3 = 233.08, C4 = 261.63, Cs4 = 277.18;
    const D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.0, A4 = 440.0, Bb4 = 466.16, C5 = 523.25, Cs5 = 554.37;
    const D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.0, Bb5 = 932.33, C6 = 1046.5, Cs6 = 1108.73, D6 = 1174.66;

    // 128-step arrangement of "Pure Furies ~ Whereabouts of the Heart" (ZUN / Touhou 15 Junko's Theme)
    // Section 1 (0-31): Iconic Driving Intro & Main Melodic Theme
    // Section 2 (32-63): Soaring Ascend & Emotional Fury Climax
    // Section 3 (64-95): ZUN Melodic Runs & Tragic Counterpoint
    // Section 4 (96-127): Grand Cadence Cascade & Loop Turnaround
    const melody: number[] = [
      // Section 1: Main Driving Lead (0 - 31)
      D5, 0, E5, F5, G5, 0, A5, 0, Bb5, 0, A5, G5, A5, 0, F5, 0,
      G5, 0, F5, E5, F5, 0, D5, 0, E5, F5, G5, A5, Bb5, 0, A5, 0,
      // Section 2: Soaring Ascend (32 - 63)
      F5, 0, G5, A5, Bb5, 0, C6, 0, D6, 0, C6, Bb5, C6, 0, A5, 0,
      Bb5, 0, A5, G5, A5, 0, F5, 0, G5, A5, Bb5, C6, D6, 0, Cs6, 0,
      // Section 3: ZUN Tragic Melodic Run (64 - 95)
      D5, F5, A5, D6, C6, 0, Bb5, A5, Bb5, 0, A5, G5, A5, 0, F5, 0,
      G5, Bb5, D6, C6, Bb5, 0, A5, G5, A5, 0, G5, F5, E5, F5, G5, A5,
      // Section 4: Pure Furies Grand Resolution (96 - 127)
      F5, 0, E5, D5, E5, 0, F5, G5, A5, Bb5, A5, G5, F5, 0, E5, 0,
      D5, 0, A4, 0, F4, 0, D4, 0, E4, F4, G4, A4, Cs4, E4, D4, 0,
    ];

    // Counterpoint Harmony Layer (Rich Polyphonic String / Brass Counterpart)
    const harmony: number[] = [
      // Section 1
      A4, 0, C5, D5, E5, 0, F5, 0, G5, 0, F5, E5, F5, 0, D5, 0,
      E5, 0, D5, C5, D5, 0, Bb4, 0, C5, D5, E5, F5, G5, 0, F5, 0,
      // Section 2
      D5, 0, E5, F5, G5, 0, A5, 0, Bb5, 0, A5, G5, A5, 0, F5, 0,
      G5, 0, F5, E5, F5, 0, D5, 0, E5, F5, G5, A5, Bb5, 0, A5, 0,
      // Section 3
      A4, D5, F5, A5, G5, 0, F5, E5, G5, 0, F5, E5, F5, 0, D5, 0,
      E5, G5, Bb5, A5, G5, 0, F5, E5, F5, 0, E5, D5, Cs5, D5, E5, F5,
      // Section 4
      D5, 0, C5, Bb4, C5, 0, D5, E5, F5, G5, F5, E5, D5, 0, C5, 0,
      Bb4, 0, F4, 0, D4, 0, Bb3, 0, C4, D4, E4, F4, A3, Cs4, D4, 0,
    ];

    // 128-step Relentless Driving 16th Synth Bassline (Dm - Bb - C - F - Gm - Bb - A7 - Dm)
    const bassChords: number[] = [
      // Bars 0-1 (Dm -> Bb)
      D2, D3, D2, D3, D2, D3, D2, F2, Bb2, Bb3, Bb2, Bb3, Bb2, Bb3, Bb2, D3,
      // Bars 2-3 (C -> Dm)
      C3, C4, C3, C4, C3, C4, C3, E3, D2, D3, D2, D3, D2, D3, D2, F2,
      // Bars 4-5 (Gm -> Bb)
      G2, G3, G2, G3, G2, G3, G2, Bb2, Bb2, Bb3, Bb2, Bb3, Bb2, Bb3, Bb2, D3,
      // Bars 6-7 (A7 -> Dm)
      A2, A3, A2, A3, A2, A3, Cs3, E3, D2, D3, D2, D3, D2, D3, D2, A2,
      // Bars 8-9 (F -> C)
      F2, F3, F2, F3, F2, F3, F2, A2, C3, C4, C3, C4, C3, C4, C3, E3,
      // Bars 10-11 (Bb -> F)
      Bb2, Bb3, Bb2, Bb3, Bb2, Bb3, Bb2, D3, F2, F3, F2, F3, F2, F3, F2, A2,
      // Bars 12-13 (Gm -> A7)
      G2, G3, G2, G3, G2, G3, G2, Bb2, A2, A3, A2, A3, A2, A3, Cs3, E3,
      // Bars 14-15 (Dm turnaround)
      D2, D3, D2, D3, D2, F2, G2, A2, D2, D3, A2, A3, D2, 0, D2, 0,
    ];

    // Sparkling Harpsichord / Piano Arpeggios (Clear, crisp harmonic sparkle)
    const arpSets: number[][] = [
      [D4, F4, A4], [Bb3, D4, F4], [C4, E4, G4], [D4, F4, A4],
      [G3, Bb3, D4], [Bb3, D4, F4], [A3, Cs4, E4], [D4, F4, A4],
      [F3, A3, C4], [C4, E4, G4], [Bb3, D4, F4], [F3, A3, C4],
      [G3, Bb3, D4], [A3, Cs4, E4], [D4, F4, A4], [A3, Cs4, E4],
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.soundEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const step = this.bgmStep % 128;
      const bar = Math.floor(step / 8);

      // --- 1. PUNCHY & TIGHT 16th SYNTH BASS (Crisp FM/Sub Bass with clear transient punch) ---
      const bassFreq = bassChords[step] || D2;
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        // Open filter with snappy decay gives crisp definition without muffled boom
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(1400, t);
        bassFilter.frequency.exponentialRampToValueAtTime(320, t + 0.09);
        bassFilter.Q.setValueAtTime(0.7, t); // Smooth Butterworth response, no boxy resonance

        bassGain.gain.setValueAtTime(0.065 * this.masterVolume, t);
        bassGain.gain.exponentialRampToValueAtTime(0.003, t + 0.1);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.11);
      }

      // --- 2. LEAD MELODY: "PURE FURIES" ZUN TRUMPET (Crisp, High-Clarity Tone, No Muffled Filter or Hollow Echo) ---
      const leadFreq = melody[step];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadFilter = this.ctx.createBiquadFilter();
        const leadGain = this.ctx.createGain();

        // Authentic bright & clear ZUN lead with subtle micro-vibrato
        leadOsc.type = 'sawtooth';
        leadOsc.frequency.setValueAtTime(leadFreq, t);
        leadOsc.frequency.linearRampToValueAtTime(leadFreq * 1.003, t + 0.06);
        leadOsc.frequency.linearRampToValueAtTime(leadFreq * 0.998, t + 0.14);

        // Broad transparent lowpass filter at 5500Hz removes harsh digital grain while preserving full acoustic brilliance and clarity
        leadFilter.type = 'lowpass';
        leadFilter.frequency.setValueAtTime(5500, t);
        leadFilter.Q.setValueAtTime(0.5, t); // Zero resonant peak, transparent clear response

        leadGain.gain.setValueAtTime(0.048 * this.masterVolume, t);
        leadGain.gain.exponentialRampToValueAtTime(0.003, t + 0.2);

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(t);
        leadOsc.stop(t + 0.22);
      }

      // --- 3. COUNTERPOINT HARMONY LAYER (Clear Brass & String Polyphony) ---
      const harmFreq = harmony[step];
      if (harmFreq > 0 && (step % 2 === 0 || step > 64)) {
        const harmOsc = this.ctx.createOscillator();
        const harmFilter = this.ctx.createBiquadFilter();
        const harmGain = this.ctx.createGain();

        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(harmFreq, t);

        harmFilter.type = 'lowpass';
        harmFilter.frequency.setValueAtTime(3800, t);
        harmFilter.Q.setValueAtTime(0.5, t);

        harmGain.gain.setValueAtTime(0.024 * this.masterVolume, t);
        harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        harmOsc.connect(harmFilter);
        harmFilter.connect(harmGain);
        harmGain.connect(this.ctx.destination);

        harmOsc.start(t);
        harmOsc.stop(t + 0.19);
      }

      // --- 4. FAST 16TH SPARKLE HARP/PIANO (Clear Bell Chime) ---
      const curArp = arpSets[bar % arpSets.length];
      const arpNote = curArp[step % curArp.length];
      if (arpNote) {
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();

        arpOsc.type = 'sine';
        arpOsc.frequency.setValueAtTime(arpNote * 1.5, t);

        arpGain.gain.setValueAtTime(0.014 * this.masterVolume, t);
        arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        arpOsc.connect(arpGain);
        arpGain.connect(this.ctx.destination);

        arpOsc.start(t);
        arpOsc.stop(t + 0.085);
      }

      // --- 5. STUDIO-QUALITY CRISP DRUMS (Crisp Kick, Snappy Snare, Clear Hats) ---
      // Crisp 4-on-the-Floor Kick Drum with fast click transient
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(160, t);
        kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.08);
        kickGain.gain.setValueAtTime(0.10 * this.masterVolume, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(t);
        kickOsc.stop(t + 0.1);
      }

      // Crisp Snare on Backbeats (Crisp noise burst + body punch)
      if (step % 8 === 4) {
        // Snare Tone Body
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, t);
        snareOsc.frequency.exponentialRampToValueAtTime(65, t + 0.08);
        snareGain.gain.setValueAtTime(0.055 * this.masterVolume, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        snareOsc.connect(snareGain);
        snareGain.connect(this.ctx.destination);
        snareOsc.start(t);
        snareOsc.stop(t + 0.095);

        // Snare Snappy Noise Crack
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.025));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1400, t);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.045 * this.masterVolume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        noise.stop(t + 0.085);
      }

      // Clear Crisp 16th Hi-Hat (Short noise tick with high-definition clarity)
      if (step % 2 === 0 || step % 4 === 2) {
        const hatBufferSize = Math.floor(this.ctx.sampleRate * 0.035);
        const hatBuffer = this.ctx.createBuffer(1, hatBufferSize, this.ctx.sampleRate);
        const hatData = hatBuffer.getChannelData(0);
        for (let i = 0; i < hatBufferSize; i++) {
          hatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
        }
        const hatNoise = this.ctx.createBufferSource();
        hatNoise.buffer = hatBuffer;
        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(5000, t);
        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime((step % 4 === 2 ? 0.022 : 0.014) * this.masterVolume, t);
        hatGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.035);
        hatNoise.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.ctx.destination);
        hatNoise.start(t);
        hatNoise.stop(t + 0.04);
      }

      // Clean Airy Crash splash on major bar transitions (steps 0, 64)
      if (step % 64 === 0) {
        const crashSize = Math.floor(this.ctx.sampleRate * 0.28);
        const crashBuffer = this.ctx.createBuffer(1, crashSize, this.ctx.sampleRate);
        const crashData = crashBuffer.getChannelData(0);
        for (let i = 0; i < crashSize; i++) {
          crashData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
        }
        const crashNoise = this.ctx.createBufferSource();
        crashNoise.buffer = crashBuffer;
        const crashFilter = this.ctx.createBiquadFilter();
        crashFilter.type = 'highpass';
        crashFilter.frequency.setValueAtTime(3200, t);
        const crashGain = this.ctx.createGain();
        crashGain.gain.setValueAtTime(0.04 * this.masterVolume, t);
        crashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        crashNoise.connect(crashFilter);
        crashFilter.connect(crashGain);
        crashGain.connect(this.ctx.destination);
        crashNoise.start(t);
        crashNoise.stop(t + 0.29);
      }

      this.bgmStep++;
    }, 112); // ~134 BPM driving Touhou battle pace
  }

  public stopMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicEnabled;
  }
}

export const sound = new SoundEngine();
