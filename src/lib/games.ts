// Single source of truth for game name + art, keyed by route. Continue-playing
// resolves cached entries through this so old localStorage entries (which held
// placeholder names like "Poker Stars") can't keep showing the wrong name.
export const GAMES = [
  { name: "Crash", image: "/assets/gamesV2/crash2.png", link: "/games/crash" },
  { name: "Coin Flip", image: "/assets/gamesV2/coinflip2.png", link: "/games/coin" },
  { name: "Dice", image: "/assets/gamesV2/dice2.png", link: "/games/dice" },
  { name: "Glass Bridge", image: "/assets/gamesV2/glass-bridge2.png", link: "/games/glass" },
  { name: "Mines", image: "/assets/gamesV2/mines2.png", link: "/games/mines" },
  { name: "Plinko", image: "/assets/gamesV2/plinko2.png", link: "/games/plinko" },
  { name: "Pump", image: "/assets/gamesV2/pump2.png", link: "/games/pump" },
  { name: "Red Light", image: "/assets/gamesV2/red-light2.png", link: "/games/redlight" },
  { name: "Rock Paper Scissors", image: "/assets/gamesV2/rps2.png", link: "/games/rps" },
  { name: "Wheel", image: "/assets/gamesV2/wheels2.png", link: "/games/wheel" },
] as const;

export const gameByLink = (link: string) => GAMES.find((g) => g.link === link);
