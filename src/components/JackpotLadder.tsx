import { useEffect, useState } from 'react';
import { JACKPOTS } from '../game/config';
import type { JackpotTier } from '../game/types';

const LABELS: Record<JackpotTier, string> = {
  mini: 'MINI',
  minor: 'MINOR',
  major: 'MAJOR',
  maxi: 'MAXI',
  super: 'SUPER',
  grand: 'GRAND',
};

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * A vertical column of jackpot tiers, styled after premium hold-&-win cabinets.
 * Rendered twice (left = MINI/MINOR/MAJOR, right = MAXI/SUPER/GRAND) so it flanks
 * the reels and keeps the whole machine locked to the screen. Top tiers tick up.
 */
export default function JackpotLadder({
  tiers,
  totalBet,
  wonTier = null,
  dimUnwon = false,
}: {
  tiers: JackpotTier[];
  totalBet: number;
  wonTier?: JackpotTier | null;
  dimUnwon?: boolean;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 360);
    return () => window.clearInterval(id);
  }, []);

  const value = (tier: JackpotTier): number => {
    const base = JACKPOTS[tier] * totalBet;
    if (tier === 'grand') return base + tick * (totalBet * 0.041);
    if (tier === 'super') return base + tick * (totalBet * 0.017);
    if (tier === 'maxi') return base + tick * (totalBet * 0.006);
    return base;
  };

  return (
    <div className="jp-ladder">
      {tiers.map((tier) => {
        const won = wonTier === tier;
        const dim = dimUnwon && wonTier != null && !won;
        return (
          <div key={tier} className={`jp-tier jp-${tier} ${won ? 'won' : ''} ${dim ? 'dim' : ''}`}>
            <span className="jp-tier-name">{LABELS[tier]}</span>
            <span className="jp-tier-value">{fmt(value(tier))}</span>
          </div>
        );
      })}
    </div>
  );
}
