import type { SymbolId } from '../art/symbols';

export type { SymbolId };

/** 5 reels, each showing 3 rows (top, middle, bottom). grid[reel][row]. */
export type Grid = SymbolId[][];

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  /** Reel indices (0-based) that form the winning run, for highlighting. */
  reels: number[];
  /** Coins won for this line (already multiplied by bet-per-line). */
  amount: number;
}

/** Jackpot tiers for the Hold & Spin money round (6-tier ladder). */
export type JackpotTier = 'mini' | 'minor' | 'major' | 'maxi' | 'super' | 'grand';

/** A money orb ("cash on reel" token). Either a cash value or a jackpot orb. */
export interface Orb {
  /** Grid position 0..14, where pos = reel * 3 + row. */
  pos: number;
  /** Credit value of this orb (for jackpot orbs, the jackpot amount). */
  value: number;
  /** 'cash' for a plain value, otherwise a jackpot tier. */
  tier: 'cash' | JackpotTier;
  /** For cash orbs, the multiple of TOTAL bet this value represents (for display). */
  mult?: number;
}

export interface SpinResult {
  /** The final visible 5x3 grid. */
  grid: Grid;
  /** The landing index into each reel band (integer stop position). */
  stops: number[];
  /** Winning paylines. */
  lineWins: LineWin[];
  /** Number of scatter (Kymmie) symbols anywhere on the grid. */
  scatterCount: number;
  /** Coins won from scatters (already multiplied by total bet). */
  scatterWin: number;
  /** Free spins awarded by scatters this spin (0 if none). */
  freeSpinsAwarded: number;
  /** Total coins won this spin BEFORE any active free-spin multiplier. */
  baseWin: number;
  /** Reels flagged for a dramatic "anticipation" slow-down (near-miss tension). */
  anticipateReels: number[];
  /** Money orbs visible on the settled grid (with assigned values). */
  orbs: Orb[];
  /** True when 6+ orbs land → the Hold & Spin money round triggers. */
  triggersHold: boolean;
  /** The symbol that stacked-mystery cells revealed as (null if none). */
  mysterySymbol: SymbolId | null;
  /** Grid positions (reel*3+row) that were mystery symbols this spin. */
  mysteryPositions: number[];
  /** Wild-reel multiplier applied to line wins (1 = no nudge this spin). */
  nudgeMultiplier: number;
}

/** One respin during the Hold & Spin round. */
export interface HoldStep {
  /** Orbs that newly locked this respin (empty if none landed). */
  newOrbs: Orb[];
  /** Respins remaining AFTER this step resolves. */
  respinsLeft: number;
  /** Total orbs locked on the board after this step. */
  filled: number;
}

/** Full precomputed result of a Hold & Spin money round. */
export interface HoldResult {
  /** The triggering orbs (6+) that start the round, already locked. */
  initial: Orb[];
  /** The sequence of respins to play back. */
  steps: HoldStep[];
  /** Every orb locked by the end of the round. */
  finalOrbs: Orb[];
  /** True if all 15 positions filled → Grand jackpot. */
  filledAll: boolean;
  /** Jackpot tiers won during the round (for celebration). */
  jackpotsWon: JackpotTier[];
  /** Total credits awarded by the round (orb values + any Grand bonus). */
  total: number;
}
