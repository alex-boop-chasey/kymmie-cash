import type { SymbolId } from '../art/symbols';

export const REELS = 5;
export const ROWS = 3;

/** Coin value of a single bet "level". Total bet = betPerLine * PAYLINES.length. */
export const BET_LEVELS = [1, 2, 5, 10, 25, 50];
export const START_CREDITS = 1000;

/** Wild substitutes for everything except scatter and orb. */
export const WILD: SymbolId = 'wild';
export const SCATTER: SymbolId = 'scatter';
/** The money orb ("cash on reel") that drives the Hold & Spin feature. */
export const ORB: SymbolId = 'orb';
/** Stacked mystery symbol: all mysteries on a spin reveal one random symbol. */
export const MYSTERY: SymbolId = 'mystery';

/** The reel (0-based) on which a Wild "nudges" to fill the reel with a multiplier. */
export const NUDGE_REEL = 2;
/** Possible multipliers applied by the nudging wild reel. */
export const NUDGE_MULTIPLIERS = [2, 3, 5, 8, 10];
/** Cap on total free spins in one feature, so retriggers can't run away. */
export const MAX_FREE_SPINS = 40;
/** Buy the Hold & Spin feature for this multiple of total bet. */
export const BUY_BONUS_COST = 100;

// ---- Hold & Spin money round (Dragon Link style) --------------------------

/** Orbs needed on one base spin to trigger the Hold & Spin money round. */
export const HOLD_TRIGGER = 6;
/** Respins granted; resets to this whenever a new orb locks. */
export const HOLD_RESPINS = 3;
/** Total board positions (5 reels x 3 rows). Filling all → Grand. */
export const HOLD_CELLS = REELS * ROWS;
/** Per empty-cell chance an orb lands on a respin. */
export const HOLD_LAND_P = 0.085;

/** Jackpot amounts, as multiples of TOTAL bet (6-tier ladder). */
export const JACKPOTS: Record<'mini' | 'minor' | 'major' | 'maxi' | 'super' | 'grand', number> = {
  mini: 8,
  minor: 20,
  major: 60,
  maxi: 150,
  super: 400,
  grand: 1000,
};

/**
 * Cash-orb value multipliers (of TOTAL bet) with weights (small = common).
 * Anchoring to total bet keeps orb values consistent with the jackpots (which
 * also scale with total bet) — a plain orb is worth a fraction of a spin up to
 * a few spins, exactly like Dragon Link "cash on reel" values.
 */
export const ORB_CASH_VALUES: { value: number; weight: number }[] = [
  { value: 100, weight: 40 },
  { value: 200, weight: 26 },
  { value: 300, weight: 15 },
  { value: 400, weight: 9 },
  { value: 500, weight: 5 },
  { value: 800, weight: 2.5 },
  { value: 1000, weight: 1.1 },
  { value: 2000, weight: 0.5 },
  { value: 5000, weight: 0.18 },
];

/** During respins, the tier an orb takes when it lands (grand only via full board). */
export const ORB_TIER_WEIGHTS: {
  tier: 'cash' | 'mini' | 'minor' | 'major' | 'maxi' | 'super';
  weight: number;
}[] = [
  { tier: 'cash', weight: 100 },
  { tier: 'mini', weight: 3.5 },
  { tier: 'minor', weight: 1.2 },
  { tier: 'major', weight: 0.35 },
  { tier: 'maxi', weight: 0.12 },
  { tier: 'super', weight: 0.03 },
];

/**
 * Payout table. Values are multipliers of the BET-PER-LINE for line symbols,
 * indexed by match count: [3-of-a-kind, 4-of-a-kind, 5-of-a-kind].
 * Scatter and orb are not line symbols (handled separately).
 */
export const PAYTABLE: Record<Exclude<SymbolId, 'scatter' | 'orb' | 'mystery'>, [number, number, number]> = {
  wild: [75, 300, 1000],
  seven: [40, 150, 500],
  coin: [20, 75, 250],
  cash: [15, 50, 150],
  diamond: [10, 30, 100],
  bell: [8, 20, 60],
  bar: [5, 15, 40],
  cherry: [5, 10, 25],
};

/** What a stacked mystery symbol can reveal as (a normal paying symbol). */
export const MYSTERY_REVEAL_WEIGHTS: { sym: SymbolId; weight: number }[] = [
  { sym: 'cherry', weight: 40 }, // absorbs the retired 'bar' weight
  { sym: 'bell', weight: 14 },
  { sym: 'diamond', weight: 11 },
  { sym: 'cash', weight: 9 },
  { sym: 'coin', weight: 6 },
  { sym: 'seven', weight: 3 },
];

/** Scatter pays a multiple of TOTAL bet for [3, 4, 5] scatters. */
export const SCATTER_PAY: Record<number, number> = { 3: 2, 4: 10, 5: 50 };

/** Free spins awarded for [3, 4, 5] scatters. */
export const SCATTER_FREE_SPINS: Record<number, number> = { 3: 10, 4: 15, 5: 25 };

/** Win multiplier applied during the free-spins feature. */
export const FREE_SPIN_MULTIPLIER = 3;

/**
 * 20 paylines on a 5x3 grid. Each entry lists the row (0=top,1=mid,2=bottom)
 * that the line passes through on each of the 5 reels.
 */
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 1
  [0, 0, 0, 0, 0], // 2
  [2, 2, 2, 2, 2], // 3
  [0, 1, 2, 1, 0], // 4  V
  [2, 1, 0, 1, 2], // 5  ^
  [0, 0, 1, 0, 0], // 6
  [2, 2, 1, 2, 2], // 7
  [1, 0, 0, 0, 1], // 8
  [1, 2, 2, 2, 1], // 9
  [1, 0, 1, 0, 1], // 10
  [1, 2, 1, 2, 1], // 11
  [0, 1, 1, 1, 0], // 12
  [2, 1, 1, 1, 2], // 13
  [1, 1, 0, 1, 1], // 14
  [1, 1, 2, 1, 1], // 15
  [0, 1, 0, 1, 0], // 16
  [2, 1, 2, 1, 2], // 17
  [0, 0, 2, 0, 0], // 18
  [2, 2, 0, 2, 2], // 19
  [0, 2, 0, 2, 0], // 20
  [2, 0, 2, 0, 2], // 21
  [0, 1, 2, 2, 2], // 22
  [2, 1, 0, 0, 0], // 23
  [1, 2, 1, 0, 1], // 24
  [1, 0, 1, 2, 1], // 25
  [0, 0, 1, 2, 2], // 26
  [2, 2, 1, 0, 0], // 27
  [0, 2, 2, 2, 0], // 28
  [2, 0, 0, 0, 2], // 29
  [1, 1, 2, 2, 2], // 30
  [1, 1, 0, 0, 0], // 31
  [0, 1, 1, 1, 2], // 32
  [2, 1, 1, 1, 0], // 33
  [0, 1, 0, 0, 0], // 34
  [2, 1, 2, 2, 2], // 35
  [1, 1, 1, 0, 0], // 36
  [1, 1, 1, 2, 2], // 37
  [0, 0, 1, 1, 1], // 38
  [2, 2, 1, 1, 1], // 39
  [1, 0, 1, 1, 1], // 40
];

/**
 * Per-reel weighted symbol pools. Rarer/high-value symbols appear less often.
 * Wild appears only on the 3 middle reels (classic pokie design); scatter on all.
 * Bands are generated once at module load from these weights.
 */
type Weight = Partial<Record<SymbolId, number>>;

const REEL_WEIGHTS: Weight[] = [
  // Reel 1 (rare wild so the top jackpot is reachable) — bar folded into orb (money)
  { cherry: 8, bell: 6, diamond: 6, cash: 5, coin: 4, seven: 2, wild: 1, scatter: 5, mystery: 3, orb: 15 },
  // Reel 2 (wild) — bar folded into orb (money)
  { cherry: 7, bell: 6, diamond: 5, cash: 5, coin: 4, seven: 2, wild: 2, scatter: 5, mystery: 3, orb: 14 },
  // Reel 3 (wild) — the "money" reel, a touch richer — bar folded into orb (money)
  { cherry: 6, bell: 5, diamond: 5, cash: 5, coin: 5, seven: 3, wild: 3, scatter: 5, mystery: 3, orb: 14 },
  // Reel 4 (wild) — bar folded into orb (money)
  { cherry: 7, bell: 6, diamond: 5, cash: 5, coin: 4, seven: 2, wild: 2, scatter: 5, mystery: 3, orb: 14 },
  // Reel 5 (rare wild so the top jackpot is reachable) — bar folded into orb (money)
  { cherry: 8, bell: 6, diamond: 6, cash: 5, coin: 4, seven: 2, wild: 1, scatter: 5, mystery: 3, orb: 15 },
];

/**
 * Deterministic PRNG (mulberry32). The reel BAND LAYOUT is generated once with
 * a FIXED seed so every page load — and every RTP simulation — sees the exact
 * same bands, giving a stable, tunable return. (Per-spin randomness still uses
 * Math.random for the reel stops.)
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBand(weights: Weight, rand: () => number): SymbolId[] {
  const band: SymbolId[] = [];
  (Object.entries(weights) as [SymbolId, number][]).forEach(([sym, n]) => {
    for (let i = 0; i < n; i++) band.push(sym);
  });
  // Seeded Fisher–Yates shuffle so identical symbols aren't clustered.
  for (let i = band.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [band[i], band[j]] = [band[j], band[i]];
  }
  // Spread out adjacent duplicate scatters/orbs so 3-row windows aren't stacked.
  const declump = (sym: SymbolId) => {
    for (let i = 0; i < band.length; i++) {
      if (band[i] === sym && band[(i + 1) % band.length] === sym) {
        const swap = band.findIndex((s) => s !== sym);
        if (swap >= 0) [band[(i + 1) % band.length], band[swap]] = [band[swap], band[(i + 1) % band.length]];
      }
    }
  };
  declump('scatter');
  declump('orb');
  return band;
}

export const REEL_BANDS: SymbolId[][] = REEL_WEIGHTS.map((w, i) =>
  buildBand(w, mulberry32(0x9e3779b9 ^ (i * 0x85ebca6b)))
);
