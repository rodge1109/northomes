// Web Audio API front-desk bell chime synthesis
let sharedAudioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * Plays a crystalline, 3-tone melodic hotel reception bell chime (Ding-Dong-Chime).
 * @param {number} volume - Volume multiplier between 0 and 1
 */
export const playFrontDeskBell = (volume = 0.8) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playBellTone = (freq, startTime, duration = 1.4, peakGain = 0.6) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell envelope: instant punchy attack, slow natural decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain * volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Ascending melodic front-desk bell chime:
    // 1st chime: C6 (1046.5 Hz) + overtone C7 (2093 Hz)
    playBellTone(1046.5, now, 1.2, 0.6);
    playBellTone(2093, now, 0.8, 0.2);

    // 2nd chime: E6 (1318.5 Hz) + overtone E7 (2637 Hz)
    playBellTone(1318.5, now + 0.22, 1.4, 0.7);
    playBellTone(2637, now + 0.22, 1.0, 0.25);

    // 3rd chime: G6 (1567.98 Hz) - rich sustaining resolution
    playBellTone(1567.98, now + 0.44, 1.8, 0.75);
    playBellTone(3135.96, now + 0.44, 1.2, 0.2);
  } catch (err) {
    console.error('Front-desk chime audio error:', err);
  }
};
