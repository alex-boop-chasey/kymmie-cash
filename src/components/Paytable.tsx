import { useEffect, useRef } from 'react';
import { SymbolIcon } from '../art/symbols';
import type { SymbolId } from '../art/symbols';
import {
  PAYTABLE,
  SCATTER_PAY,
  SCATTER_FREE_SPINS,
  PAYLINES,
  FREE_SPIN_MULTIPLIER,
  HOLD_TRIGGER,
  HOLD_RESPINS,
  JACKPOTS,
} from '../game/config';

// High-to-low display order.
const ORDER: (keyof typeof PAYTABLE)[] = [
  'wild',
  'seven',
  'coin',
  'cash',
  'diamond',
  'bell',
  'bar',
  'cherry',
];

const NAMES: Record<SymbolId, string> = {
  wild: 'WILD',
  seven: 'Lucky 7',
  scatter: 'Kymmie',
  coin: 'Gold Ingot',
  orb: 'Money Orb',
  mystery: 'Mystery',
  cash: 'Cash Stack',
  diamond: 'Diamond',
  bell: 'Bell',
  bar: 'Bar',
  cherry: 'Cherry',
};

export default function Paytable({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Paytable"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close" ref={closeRef}>
          ✕
        </button>
        <h2 className="modal-title">Paytable</h2>
        <p className="modal-sub">Pays shown as multiples of your bet-per-line ({PAYLINES.length} lines).</p>

        <div className="pay-grid">
          {ORDER.map((sym) => (
            <div className="pay-row" key={sym}>
              <div className="pay-icon">
                <SymbolIcon id={sym} size={52} />
              </div>
              <div className="pay-name">{NAMES[sym]}</div>
              <div className="pay-values">
                <span>×3 → {PAYTABLE[sym][0]}</span>
                <span>×4 → {PAYTABLE[sym][1]}</span>
                <span>×5 → {PAYTABLE[sym][2]}</span>
              </div>
            </div>
          ))}

          <div className="pay-row special">
            <div className="pay-icon">
              <SymbolIcon id="wild" size={52} />
            </div>
            <div className="pay-name">WILD</div>
            <div className="pay-values full">Substitutes for every symbol except Kymmie and Money Orbs.</div>
          </div>

          <div className="pay-row special">
            <div className="pay-icon">
              <SymbolIcon id="scatter" size={52} />
            </div>
            <div className="pay-name">Kymmie (Scatter)</div>
            <div className="pay-values full">
              Pays anywhere ×total bet: 3 → {SCATTER_PAY[3]}, 4 → {SCATTER_PAY[4]}, 5 → {SCATTER_PAY[5]}. Lands{' '}
              {SCATTER_FREE_SPINS[3]}/{SCATTER_FREE_SPINS[4]}/{SCATTER_FREE_SPINS[5]} FREE SPINS for 3/4/5, with{' '}
              {FREE_SPIN_MULTIPLIER}× wins!
            </div>
          </div>

          <div className="pay-row special">
            <div className="pay-icon">
              <SymbolIcon id="orb" size={52} />
            </div>
            <div className="pay-name">Money Orb</div>
            <div className="pay-values full">
              Land {HOLD_TRIGGER}+ orbs to trigger HOLD &amp; SPIN. Orbs lock and you get {HOLD_RESPINS} respins
              (reset by each new orb). Collect every orb's cash value. Fill all 15 for the GRAND! Jackpots
              (×total bet): Mini {JACKPOTS.mini}, Minor {JACKPOTS.minor}, Major {JACKPOTS.major}, Grand{' '}
              {JACKPOTS.grand}.
            </div>
          </div>
        </div>

        <p className="modal-foot">All wins pay left-to-right on adjacent reels. Entertainment only.</p>
      </div>
    </div>
  );
}
