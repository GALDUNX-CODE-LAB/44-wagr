// node scripts/check-assets.mjs
// Guards the two tables that silently rot: game name/art/route (this is how
// "Plinko" ended up labelled "Craps Champion") and the preloaded sound list.
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const has = (p) => existsSync(new URL(p, import.meta.url));

const games = [...read("../src/lib/games.ts").matchAll(
  /name: "(.+?)", image: "(.+?)", link: "\/games\/(.+?)"/g,
)];
assert.equal(games.length, 10, "games.ts entries not parsed");

const slugs = [...read("../src/app/games/[slug]/page.tsx").matchAll(/^ {2}(\w+): dynamic/gm)].map((m) => m[1]);

for (const [, name, image, slug] of games) {
  assert.ok(slugs.includes(slug), `no route for /games/${slug} (${name})`);
  assert.ok(has(`../public${image}`), `missing art ${image} (${name})`);
}
assert.equal(new Set(games.map((g) => g[3])).size, games.length, "duplicate game link");

const sounds = [...read("../src/lib/sound-player.ts").matchAll(/"([\w-]+\.mp3)"/g)].map((m) => m[1]);
for (const f of new Set(sounds)) assert.ok(has(`../public/sounds/${f}`), `missing sound ${f}`);

console.log(`ok — ${games.length} games, ${new Set(sounds).size} sounds`);
