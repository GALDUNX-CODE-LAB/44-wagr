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
