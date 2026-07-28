/* Monte Carlo RTP simulation for Kymmie Cash. Run: npx tsx scripts/rtp-sim.ts */
import { spin, runHoldAndSpin } from '../src/game/engine';
import { BET_LEVELS, PAYLINES, FREE_SPIN_MULTIPLIER, HOLD_TRIGGER, MAX_FREE_SPINS } from '../src/game/config';
import type { SpinResult } from '../src/game/types';

const NUM_LINES = PAYLINES.length;
const betPerLine = BET_LEVELS[1];
const totalBet = betPerLine * NUM_LINES;

const SPINS = Number(process.argv[2] ?? 1_000_000);

let wagered = 0;
let ret = 0;
let baseReturn = 0;
let fsReturn = 0;
let holdReturn = 0;
let holdTriggers = 0;
let fsTriggers = 0;
let orbHistogram = new Array(16).fill(0);

function playHold(res: SpinResult): number {
  if (!res.triggersHold) return 0;
  holdTriggers++;
  return runHoldAndSpin(totalBet, res.orbs).total;
}

for (let i = 0; i < SPINS; i++) {
  wagered += totalBet;
  const res = spin(betPerLine);
  orbHistogram[Math.min(15, res.orbs.length)]++;

  ret += res.baseWin;
  baseReturn += res.baseWin;

  const h = playHold(res);
  ret += h;
  holdReturn += h;

  if (res.freeSpinsAwarded > 0) {
    fsTriggers++;
    let total = Math.min(MAX_FREE_SPINS, res.freeSpinsAwarded);
    let fs = total;
    while (fs > 0) {
      fs--;
      const f = spin(betPerLine);
      const w = f.baseWin * FREE_SPIN_MULTIPLIER;
      ret += w;
      fsReturn += w;
      const h2 = playHold(f);
      ret += h2;
      holdReturn += h2;
      if (f.freeSpinsAwarded > 0) {
        const add = Math.min(f.freeSpinsAwarded, MAX_FREE_SPINS - total);
        total += add;
        fs += add;
      }
    }
  }
}

const pct = (n: number) => ((n / wagered) * 100).toFixed(2) + '%';
console.log('=== Kymmie Cash RTP simulation ===');
console.log('spins:', SPINS.toLocaleString(), '| betPerLine:', betPerLine, '| totalBet:', totalBet);
console.log('TOTAL RTP:        ', pct(ret));
console.log('  base game:      ', pct(baseReturn));
console.log('  free spins:     ', pct(fsReturn));
console.log('  hold & spin:    ', pct(holdReturn));
console.log('hold triggers:    ', holdTriggers, `(1 in ${Math.round(SPINS / Math.max(1, holdTriggers))})`);
console.log('free-spin triggers:', fsTriggers, `(1 in ${Math.round(SPINS / Math.max(1, fsTriggers))})`);
console.log('orb-count histogram (0..15 on a base spin):');
orbHistogram.forEach((c, n) => {
  if (c > 0) console.log(`  ${n} orbs: ${((c / SPINS) * 100).toFixed(3)}%${n >= HOLD_TRIGGER ? '  <- triggers' : ''}`);
});
