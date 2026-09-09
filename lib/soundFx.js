/**
 * Retro Fantasy Web Audio API Sound Synthesizer
 * Provides crisp 8/16-bit sound effects and ambient generative tones
 */

export class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientPlaying = false;
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.muted && this.ambientPlaying) {
      this.stopAmbient();
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'talk' || type === 'typewriter') {
        osc.type = 'triangle';
        const baseFreq = 340 + Math.random() * 80;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.setValueAtTime(baseFreq + 60, now + 0.03);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'empathy' || type === 'heart') {
        // Ethereal empathy chime: high resonant arpeggio
        const chimeNotes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
        chimeNotes.forEach((freq, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.06);
          o.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.12, now + idx * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
          o.start(now + idx * 0.06);
          o.stop(now + idx * 0.06 + 0.35);
        });
      } else if (type === 'follow') {
        const notes = [440, 554.37, 659.25];
        notes.forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.18, now + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18);
          o.start(now + i * 0.07);
          o.stop(now + i * 0.07 + 0.18);
        });
      } else if (type === 'transform' || type === 'bridge') {
        // Arcane shimmering bridge or transmutation
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.22);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'cutscene') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'key') {
        const notes = [659.25, 880.0, 1046.5];
        notes.forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'square';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.12, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.2);
        });
      } else if (type === 'click' || type === 'switch') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        const chordNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        chordNotes.forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.ctx.destination);
          const st = now + i * 0.09;
          g.gain.setValueAtTime(0.2, st);
          g.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
          o.start(st);
          o.stop(st + 0.35);
        });
      }
    } catch (e) {
      // Audio context might be waiting for user interaction
    }
  }

  stopAmbient() {
    this.ambientNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.ambientNodes = [];
    this.ambientPlaying = false;
  }
}

export const sfx = new SoundFx();
