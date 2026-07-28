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

// Plinko: ball drop / win. No loss sound by design.
export const playPlinkoDrop = () => play("wheels.mp3", 0.5);
export const playPlinkoWin = () => play("win3.mp3");

// Mines: win / open a mine. Loss sound trimmed to 0.1s (Mixkit "System beep buzzer fail").
export const playMinesWin = () => play("win2.mp3");
export const playMinesLose = () => play("mines-lose.mp3");

// Pump: balloon pop on bust (Mixkit "Game balloon or bubble pop").
export const playPumpPop = () => play("pump-pop.mp3");

// Red Light Green Light: alert blip when the light turns red (Mixkit "Emergency alert alarm"),
// harsher alarm on elimination (Mixkit "Critical alarm").
export const playRedLightWarning = () => play("redlight-warning.mp3", 0.6);
export const playRedLightDanger = () => play("redlight-danger.mp3");

// RPS: round win uses win3, overall win/cashout stays on the shared playGameWin (win.mp3).
// Loss trimmed from Mixkit "Player losing or failing".
export const playRpsRoundWin = () => play("win3.mp3");
export const playRpsLose = () => play("rps-lose.mp3");

// Glass Bridge: clearing the whole bridge vs manual cashout get distinct wins;
// loss is a real glass shatter (Mixkit "Glass break with hammer thud").
export const playGlassWin = () => play("win3.mp3");
export const playGlassCashout = () => play("win2.mp3");
export const playGlassBreak = () => play("glass-break.mp3");
