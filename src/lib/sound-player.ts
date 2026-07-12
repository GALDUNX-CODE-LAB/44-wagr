export const playCoinFlipSound = () => {
  const audio = new Audio("/sounds/coin-flip-wosh.mp3");
  audio.play();
};

export const playCoinFlipWin = () => {
  const audio = new Audio("/sounds/win3.mp3");
  audio.play();
};

export const playDiceRoll = () => {
  const audio = new Audio("/sounds/dice-move.mp3");
  audio.play();
};

export const playDiceRollWin = () => {
  const audio = new Audio("/sounds/win.mp3");
  audio.play();
};

export const playWheelsSound = () => {
  const audio = new Audio("/sounds/wheels.mp3");
  audio.play();
};

export const playWheelsWins = () => {
  const audio = new Audio("/sounds/win3.mp3");
  audio.play();
};

// ponytail: generic SFX for the 6 newer games (Plinko/Mines/Pump/Red Light/RPS/Glass),
// reusing the existing /public/sounds files. Swap for per-game assets
// (e.g. mine-boom, plinko-drop, balloon-pop) when real sound design lands.
const play = (file: string, volume = 1) => {
  try {
    const audio = new Audio(`/sounds/${file}`);
    audio.volume = volume;
    audio.play().catch(() => {}); // ignore autoplay-block / interruption, don't crash the game
  } catch {
    /* no Audio (SSR) — no-op */
  }
};

// Per-move feedback (tile reveal, pump, pick, ball drop, red-light warning)
export const playGameAction = () => play("coin-flip-wosh.mp3", 0.5);
// Terminal outcomes
export const playGameWin = () => play("win.mp3");
export const playGameLose = () => play("dice-move.mp3", 0.7);
