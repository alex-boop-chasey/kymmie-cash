import type { SymbolId } from '../art/symbols';
import type { Grid, LineWin, SpinResult, Orb, HoldResult, HoldStep, JackpotTier } from './types';
import {
  REELS,
  ROWS,
  PAYLINES,
  PAYTABLE,
  SCATTER_PAY,
  SCATTER_FREE_SPINS,
  REEL_BANDS,
  WILD,
  SCATTER,
  ORB,
  MYSTERY,
  NUDGE_REEL,
  NUDGE_MULTIPLIERS,
  MYSTERY_REVEAL_WEIGHTS,
  HOLD_TRIGGER,
  HOLD_RESPINS,
  HOLD_CELLS,
  HOLD_LAND_P,
  JACKPOTS,
  ORB_CASH_VALUES,
  ORB_TIER_WEIGHTS,
} from './config';

/** Read the 3 visible symbols on a reel band starting at `stop` (wraps around). */
function visibleColumn(band: SymbolId[], stop: number): SymbolId[] {
  const col: SymbolId[] = [];
  for (let r = 0; r < ROWS; r++) col.push(band[(stop + r) % band.length]);
  return col;
}

/** Weighted random pick from a list of items carrying a `weight`. */
function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight;
    if (r < 0) return it;
  }
  return items[items.length - 1];
}

/**
 * Evaluate one payline left-to-right. Wilds substitute for any line symbol.
 * Scatter and orb are not line symbols — they break the run. Returns the
 * best-paying interpretation, or null if no win.
 */
function evaluateLine(lineSymbols: SymbolId[], betPerLine: number): Omit<LineWin, 'lineIndex'> | null {
  const isNonLine = (s: SymbolId) => s === SCATTER || s === ORB || s === MYSTERY;

  // Candidate base symbols: wild itself, plus the first ordinary line symbol.
  const candidates: SymbolId[] = [];
  if (lineSymbols[0] === WILD) candidates.push(WILD);
  const firstReal = lineSymbols.find((s) => s !== WILD && !isNonLine(s));
  if (firstReal) candidates.push(firstReal);

  let best: Omit<LineWin, 'lineIndex'> | null = null;

  for (const base of candidates) {
    if (isNonLine(base)) continue;
    let count = 0;
    for (let reel = 0; reel < lineSymbols.length; reel++) {
      const s = lineSymbols[reel];
      if (s === base || s === WILD) count++;
      else break;
    }
    if (count < 3) continue;
    const table = PAYTABLE[base as Exclude<SymbolId, 'scatter' | 'orb' | 'mystery'>];
    const amount = table[count - 3] * betPerLine;
    if (!best || amount > best.amount) {
      best = {
        symbol: base,
        count,
        reels: Array.from({ length: count }, (_, i) => i),
        amount,
      };
    }
  }
  return best;
}

/**
 * Build a cash orb. Values are clean multiples of 100 credits and never less
 * than the current total bet.
 */
function makeCashOrb(pos: number, totalBet: number): Orb {
  const pick = weightedPick(ORB_CASH_VALUES).value;
  const minVal = Math.max(100, Math.ceil(totalBet / 100) * 100);
  const value = Math.max(pick, minVal);
  return { pos, value, tier: 'cash', mult: Math.round((value / totalBet) * 10) / 10 };
}

/** Build a feature orb (cash or a jackpot tier) landing during a respin. */
function makeFeatureOrb(pos: number, totalBet: number): Orb {
  const tier = weightedPick(ORB_TIER_WEIGHTS).tier;
  if (tier === 'cash') return makeCashOrb(pos, totalBet);
  return { pos, value: JACKPOTS[tier] * totalBet, tier };
}

/**
 * Run a full base spin. RNG picks a stop per reel, the grid is derived, and all
 * wins are evaluated up front — the animation is pure eye-candy that lands on
 * this predetermined result.
 */
export function spin(betPerLine: number): SpinResult {
  const totalBet = betPerLine * PAYLINES.length;

  const stops: number[] = [];
  const columns: SymbolId[][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    const band = REEL_BANDS[reel];
    const stop = Math.floor(Math.random() * band.length);
    stops.push(stop);
    columns.push(visibleColumn(band, stop));
  }

  // grid[reel][row] — the DISPLAY grid (may contain mystery/wild).
  const grid: Grid = columns;

  // Stacked mystery symbols: all mystery cells reveal ONE random symbol. Wins
  // are evaluated on a copy with mysteries revealed (and the nudging wild).
  const evalGrid: Grid = grid.map((col) => [...col]);
  const mysteryPositions: number[] = [];
  for (let reel = 0; reel < REELS; reel++)
    for (let row = 0; row < ROWS; row++)
      if (grid[reel][row] === MYSTERY) mysteryPositions.push(reel * ROWS + row);
  let mysterySymbol: SymbolId | null = null;
  if (mysteryPositions.length > 0) {
    mysterySymbol = weightedPick(MYSTERY_REVEAL_WEIGHTS.map((m) => ({ ...m }))).sym;
    for (const pos of mysteryPositions) evalGrid[Math.floor(pos / ROWS)][pos % ROWS] = mysterySymbol;
  }

  // Nudging multiplier wild: if a wild shows on the nudge reel, it fills that
  // whole reel and a random multiplier applies to line wins.
  let nudgeMultiplier = 1;
  if (evalGrid[NUDGE_REEL].includes(WILD)) {
    for (let row = 0; row < ROWS; row++) evalGrid[NUDGE_REEL][row] = WILD;
    nudgeMultiplier = NUDGE_MULTIPLIERS[Math.floor(Math.random() * NUDGE_MULTIPLIERS.length)];
  }

  // Line wins (evaluated on the revealed/nudged grid), scaled by the nudge mult.
  const lineWins: LineWin[] = [];
  PAYLINES.forEach((line, lineIndex) => {
    const lineSymbols = line.map((row, reel) => evalGrid[reel][row]);
    const win = evaluateLine(lineSymbols, betPerLine);
    if (win) lineWins.push({ lineIndex, ...win, amount: win.amount * nudgeMultiplier });
  });

  // Scatter wins (anywhere on the grid)
  let scatterCount = 0;
  for (let reel = 0; reel < REELS; reel++)
    for (let row = 0; row < ROWS; row++) if (grid[reel][row] === SCATTER) scatterCount++;

  // Two scatters can appear within one reel's 3-row window, so scatterCount can
  // exceed 5. Clamp for the payout/free-spin lookups (tables only key 3/4/5).
  const sc = Math.min(scatterCount, 5);
  const scatterWin = (SCATTER_PAY[sc] ?? 0) * totalBet;
  const freeSpinsAwarded = SCATTER_FREE_SPINS[sc] ?? 0;

  // Money orbs: assign each visible orb a cash value. 6+ triggers Hold & Spin.
  const orbs: Orb[] = [];
  for (let reel = 0; reel < REELS; reel++)
    for (let row = 0; row < ROWS; row++)
      if (grid[reel][row] === ORB) orbs.push(makeCashOrb(reel * ROWS + row, totalBet));
  const triggersHold = orbs.length >= HOLD_TRIGGER;

  const baseWin = lineWins.reduce((sum, w) => sum + w.amount, 0) + scatterWin;

  // Anticipation: flag late reels when 2+ scatters are already showing (a 3rd
  // would trigger free spins) OR when 4-5 orbs are showing (a 6th triggers Hold
  // & Spin) — both build tension on the final reels.
  const anticipateReels: number[] = [];
  let scatterSoFar = 0;
  let orbSoFar = 0;
  for (let reel = 0; reel < REELS; reel++) {
    const nearScatter = reel >= 2 && scatterSoFar >= 2;
    const nearOrb = reel >= 2 && orbSoFar >= 4;
    if (nearScatter || nearOrb) anticipateReels.push(reel);
    if (grid[reel].includes(SCATTER)) scatterSoFar++;
    orbSoFar += grid[reel].filter((s) => s === ORB).length;
  }

  return {
    grid,
    stops,
    lineWins,
    scatterCount,
    scatterWin,
    freeSpinsAwarded,
    baseWin,
    anticipateReels,
    orbs,
    triggersHold,
    mysterySymbol,
    mysteryPositions,
    nudgeMultiplier,
  };
}

/**
 * Build a forced Hold & Spin trigger (for the Buy Bonus feature): place exactly
 * HOLD_TRIGGER cash orbs at random positions with values, ready to run the round.
 */
export function forceHoldOrbs(totalBet: number): Orb[] {
  const positions = Array.from({ length: HOLD_CELLS }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions.slice(0, HOLD_TRIGGER).map((pos) => makeCashOrb(pos, totalBet));
}

/**
 * Simulate a full Hold & Spin money round up front (deterministic playback for
 * the UI). The triggering orbs lock; each respin, empty cells may land new orbs
 * which lock and reset the respin counter. The round ends when respins run out
 * or all positions fill (→ Grand jackpot). Returns the whole event sequence.
 */
export function runHoldAndSpin(totalBet: number, initial: Orb[]): HoldResult {
  const board: (Orb | null)[] = Array(HOLD_CELLS).fill(null);
  initial.forEach((o) => (board[o.pos] = o));
  let filled = initial.length;
  let respins = HOLD_RESPINS;
  const steps: HoldStep[] = [];
  const jackpotsWon: JackpotTier[] = [];

  while (respins > 0 && filled < HOLD_CELLS) {
    const newOrbs: Orb[] = [];
    for (let pos = 0; pos < HOLD_CELLS; pos++) {
      if (board[pos]) continue;
      if (Math.random() < HOLD_LAND_P) {
        const orb = makeFeatureOrb(pos, totalBet);
        board[pos] = orb;
        newOrbs.push(orb);
        filled++;
        if (orb.tier !== 'cash') jackpotsWon.push(orb.tier);
        if (filled >= HOLD_CELLS) break;
      }
    }
    if (newOrbs.length > 0) respins = HOLD_RESPINS;
    else respins -= 1;
    steps.push({ newOrbs, respinsLeft: respins, filled });
  }

  const filledAll = filled >= HOLD_CELLS;
  const finalOrbs = board.filter((o): o is Orb => o !== null);
  let total = finalOrbs.reduce((s, o) => s + o.value, 0);
  if (filledAll) {
    total += JACKPOTS.grand * totalBet;
    jackpotsWon.push('grand');
  }

  return { initial, steps, finalOrbs, filledAll, jackpotsWon, total };
}
