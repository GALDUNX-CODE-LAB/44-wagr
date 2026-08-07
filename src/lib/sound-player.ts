// Web Audio, not `new Audio()`. Every call used to construct an element, fetch
// + decode the mp3, then play — 100-300ms of lag, so SFX landed after the
// animation they belonged to. Here each file is fetched and decoded once at
// module load; playing is then a sample-accurate BufferSource start.

const FILES = [
  "coin-flip-wosh.mp3",
  "dice-move.mp3",
  "glass-break.mp3",
  "mines-gem.mp3",
  "mines-lose.mp3",
  "pump-pop.mp3",
  "pump-puff.mp3",
  "redlight-danger.mp3",
  "redlight-green.mp3",
  "redlight-warning.mp3",
  "rps-lose.mp3",
  "wheels.mp3",
  "win.mp3",
  "win2.mp3",
  "win3.mp3",
] as const;

const buffers = new Map<string, AudioBuffer>();
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // Browsers start the context suspended until a user gesture; decoding still
    // works while suspended, so only the resume needs a gesture.
    const unlock = () => ctx?.resume();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
  return ctx;
}

async function load(file: string): Promise<AudioBuffer | null> {
  const c = getCtx();
  if (!c) return null;
  const cached = buffers.get(file);
  if (cached) return cached;
  try {
    const res = await fetch(`/sounds/${file}`);
    const buf = await c.decodeAudioData(await res.arrayBuffer());
    buffers.set(file, buf);
    return buf;
  } catch {
    return null;
  }
}

function start(buf: AudioBuffer, volume: number) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(gain).connect(c.destination);
  src.start();
}

const play = (file: string, volume = 1) => {
  const buf = buffers.get(file);
  if (buf) {
    start(buf, volume);
    return;
  }
  // Not preloaded yet (very first seconds of a session) — decode then play.
  load(file).then((b) => b && start(b, volume));
};

// Warm the cache as soon as the module is imported on the client.
if (typeof window !== "undefined") {
  FILES.forEach((f) => void load(f));
}

export const playCoinFlipSound = () => play("coin-flip-wosh.mp3");
export const playCoinFlipWin = () => play("win3.mp3");
export const playDiceRoll = () => play("dice-move.mp3");
export const playDiceRollWin = () => play("win.mp3");
export const playWheelsSound = () => play("wheels.mp3");
export const playWheelsWins = () => play("win3.mp3");

// ponytail: generic SFX for the 6 newer games (Plinko/Mines/Pump/Red Light/RPS/Glass),
// reusing the existing /public/sounds files. Swap for per-game assets when real
// sound design lands.

// Per-move feedback (tile reveal, pick, ball drop)
export const playGameAction = () => play("coin-flip-wosh.mp3", 0.5);
// Terminal outcomes
export const playGameWin = () => play("win.mp3");
export const playGameLose = () => play("dice-move.mp3", 0.7);

// Plinko: ball drop / win. No loss sound by design.
export const playPlinkoDrop = () => play("wheels.mp3", 0.5);
export const playPlinkoWin = () => play("win3.mp3");

// Mines: short blip per gem (the 4s win2 fanfare was firing on every tile and
// stacking), fanfare only on the terminal win. Loss trimmed to 0.1s (Mixkit
// "System beep buzzer fail").
export const playMinesGem = () => play("mines-gem.mp3", 0.8);
export const playMinesWin = () => play("win2.mp3");
export const playMinesLose = () => play("mines-lose.mp3");

// Pump: air puff on each pump (synthesised noise burst), balloon pop on bust
// (Mixkit "Game balloon or bubble pop", gained +6dB — the original was inaudible).
export const playPumpPuff = () => play("pump-puff.mp3", 0.9);
export const playPumpPop = () => play("pump-pop.mp3");

// Red Light Green Light: chime on green, alert blip when the light turns red
// (Mixkit "Emergency alert alarm"), harsher alarm on elimination (Mixkit "Critical alarm").
export const playRedLightGreen = () => play("redlight-green.mp3", 0.7);
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
