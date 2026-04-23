let sounds: {
  card?: HTMLAudioElement;
  token?: HTMLAudioElement;
} | null = null;

function initSounds() {
  if (typeof window === 'undefined') return;

  if (!sounds) {
    sounds = {
      card: new Audio('/games/gem_game/audio/card.mp3'),
      token: new Audio('/games/gem_game/audio/token.mp3'),
    };
  }
}

export const playSound = (type: 'card' | 'token') => {
  if (typeof window === 'undefined') return;

  initSounds();

  const sound = sounds?.[type];
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
};
