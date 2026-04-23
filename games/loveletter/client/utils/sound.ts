let sounds: {
  card?: HTMLAudioElement;
} | null = null;

function initSounds() {
  if (typeof window === 'undefined') return;

  if (!sounds) {
    sounds = {
      card: new Audio('/games/loveletter/audio/card.mp3'),
    };
  }
}

export const playSound = (type: 'card') => {
  if (typeof window === 'undefined') return;

  initSounds();

  const sound = sounds?.[type];
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
};
