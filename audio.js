/**
 * Romantic Christian Wedding Audio Synthesizer
 * Uses Web Audio API to create a warm, rich polyphonic acoustic piano
 * and soft strings pad playing Canon in D / Romantic Wedding Progression.
 * Fully standalone - requires no external audio downloads or network requests!
 */

class WeddingMusicPlayer {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.timer = null;
        this.tempo = 66; // Gentle romantic BPM
        this.masterGain = null;
        this.isMuted = false;
        this.externalAudio = null;

        // Note frequencies (Hz)
        this.notes = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'D6': 1174.66
        };

        // Romantic Pachelbel Canon & Hymn Progression chords (Bass, Harmony, Melody)
        this.sequence = [
            // Measure 1: D Major
            { bass: 'D3', chords: ['F#4', 'A4', 'D5'], melody: ['F#5', null, 'E5', null] },
            // Measure 2: A Major
            { bass: 'A3', chords: ['E4', 'A4', 'C#5'], melody: ['D5', null, 'C#5', null] },
            // Measure 3: B Minor
            { bass: 'B3', chords: ['D4', 'F#4', 'B4'], melody: ['B4', null, 'A4', null] },
            // Measure 4: F# Minor
            { bass: 'F#3', chords: ['C#4', 'F#4', 'A4'], melody: ['A4', null, 'G4', null] },
            // Measure 5: G Major
            { bass: 'G3', chords: ['D4', 'G4', 'B4'], melody: ['G4', null, 'F#4', null] },
            // Measure 6: D Major
            { bass: 'D3', chords: ['D4', 'F#4', 'A4'], melody: ['F#4', null, 'E4', null] },
            // Measure 7: G Major / A
            { bass: 'G3', chords: ['D4', 'G4', 'B4'], melody: ['D4', null, 'E4', null] },
            // Measure 8: A7
            { bass: 'A3', chords: ['C#4', 'E4', 'A4'], melody: ['F#4', null, 'A4', null] },

            // Variation with rising soaring melody
            // Measure 9: D Major
            { bass: 'D3', chords: ['F#4', 'A4', 'D5'], melody: ['A5', 'F#5', 'G5', 'A5'] },
            // Measure 10: A Major
            { bass: 'A3', chords: ['E4', 'A4', 'C#5'], melody: ['F#5', 'E5', 'F#5', 'E5'] },
            // Measure 11: B Minor
            { bass: 'B3', chords: ['D4', 'F#4', 'B4'], melody: ['D5', 'C#5', 'D5', 'B4'] },
            // Measure 12: F# Minor
            { bass: 'F#3', chords: ['C#4', 'F#4', 'A4'], melody: ['C#5', 'B4', 'C#5', 'A4'] },
            // Measure 13: G Major
            { bass: 'G3', chords: ['D4', 'G4', 'B4'], melody: ['B4', 'A4', 'B4', 'G4'] },
            // Measure 14: D Major
            { bass: 'D3', chords: ['D4', 'F#4', 'A4'], melody: ['A4', 'G4', 'A4', 'F#4'] },
            // Measure 15: G Major
            { bass: 'G3', chords: ['D4', 'G4', 'B4'], melody: ['G4', 'F#4', 'G4', 'E4'] },
            // Measure 16: A Major resolving
            { bass: 'A3', chords: ['C#4', 'E4', 'A4'], melody: ['F#4', 'G4', 'A4', 'C#5'] }
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play an acoustic-style piano note with gentle warmth and decay
    playPianoNote(freq, time, duration = 2.0, velocity = 0.5) {
        if (!freq || !this.ctx) return;

        // Fundamental oscillator (Warm triangle/sine blend)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();

        const noteGain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, time);

        // Subtle detune for natural chorus warmth
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time); // 2nd harmonic
        osc2.detune.setValueAtTime(4, time);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, time); // 3rd subtle harmonic

        // Low pass filter for soft felt piano timbre
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(freq * 4, 3200), time);
        filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.5, 800), time + duration);

        // Envelope: soft attack, realistic exponential piano decay
        const attack = 0.02;
        noteGain.gain.setValueAtTime(0.0001, time);
        noteGain.gain.linearRampToValueAtTime(velocity * 0.45, time + attack);
        noteGain.gain.exponentialRampToValueAtTime(velocity * 0.08, time + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        const gain1 = this.ctx.createGain();
        gain1.gain.value = 0.7;
        const gain2 = this.ctx.createGain();
        gain2.gain.value = 0.2;
        const gain3 = this.ctx.createGain();
        gain3.gain.value = 0.05;

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(filter);
        gain2.connect(filter);
        gain3.connect(filter);

        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc1.start(time);
        osc2.start(time);
        osc3.start(time);

        osc1.stop(time + duration);
        osc2.stop(time + duration);
        osc3.stop(time + duration);
    }

    // Ethereal church string pad chord
    playStringsChord(chordFreqs, time, duration = 3.5) {
        if (!this.ctx || !chordFreqs) return;

        chordFreqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime((Math.random() - 0.5) * 8, time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(650, time);

            // Soft lush swell
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.linearRampToValueAtTime(0.06, time + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(time);
            osc.stop(time + duration);
        });
    }

    playMeasure(measureIndex) {
        if (!this.isPlaying) return;

        const measure = this.sequence[measureIndex % this.sequence.length];
        const now = this.ctx.currentTime;
        const beatDuration = 60 / this.tempo; // Duration of a quarter note

        // Play bass note
        if (measure.bass && this.notes[measure.bass]) {
            this.playPianoNote(this.notes[measure.bass], now, beatDuration * 3.8, 0.6);
        }

        // Play chord arpeggios & strings
        const chordNotes = measure.chords.map(n => this.notes[n]).filter(Boolean);
        this.playStringsChord(chordNotes, now, beatDuration * 4);

        // Arpeggiated chord accompaniment
        chordNotes.forEach((freq, idx) => {
            this.playPianoNote(freq, now + (idx * 0.15), beatDuration * 2.5, 0.35);
            // Repeat on beat 3
            this.playPianoNote(freq, now + beatDuration * 2 + (idx * 0.12), beatDuration * 1.8, 0.28);
        });

        // Melody notes across 4 beats
        measure.melody.forEach((noteName, beatIdx) => {
            if (noteName && this.notes[noteName]) {
                const noteTime = now + (beatIdx * beatDuration);
                this.playPianoNote(this.notes[noteName], noteTime, beatDuration * 1.8, 0.7);
            }
        });

        // Schedule next measure
        const nextMeasureTime = beatDuration * 4 * 1000;
        this.timer = setTimeout(() => {
            if (this.isPlaying) {
                this.currentStep = (this.currentStep + 1) % this.sequence.length;
                this.playMeasure(this.currentStep);
            }
        }, nextMeasureTime);
    }

    play() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;
        this.playMeasure(0);
        this.notifyStateChange(true);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.notifyStateChange(false);
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    setMute(mute) {
        this.isMuted = mute;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(mute ? 0 : 0.35, this.ctx.currentTime);
        }
    }

    notifyStateChange(playing) {
        window.dispatchEvent(new CustomEvent('wedding-music-status', {
            detail: { isPlaying: playing }
        }));
    }
}

// Global player instance
window.weddingMusic = new WeddingMusicPlayer();
