let sounds: {
  card?: HTMLAudioElement;
  bust?: HTMLAudioElement;
  achieve?: HTMLAudioElement;
} | null = null;

function initSounds() {
  if (typeof window === 'undefined') return;

  if (!sounds) {
    sounds = {
      card: new Audio('/games/flip7/audio/card.mp3'),
      bust: new Audio('/games/flip7/audio/bust.mp3'),
      achieve: new Audio('/games/flip7/audio/achieve.mp3'),
    };
  }
}

export const playSound = (type: 'card' | 'bust' | 'achieve') => {
  if (typeof window === 'undefined') return;

  initSounds();

  const sound = sounds?.[type];
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
};
