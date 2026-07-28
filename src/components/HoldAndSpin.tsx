import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SymbolIcon } from '../art/symbols';
import type { HoldResult, Orb, JackpotTier } from '../game/types';
import { HOLD_RESPINS, HOLD_CELLS, JACKPOTS, ROWS } from '../game/config';
import * as sfx from '../audio/sound';

const fmt = (n: number) => n.toLocaleString('en-US');

const TIER_LABEL: Record<JackpotTier, string> = {
  mini: 'MINI',
  minor: 'MINOR',
  major: 'MAJOR',
  maxi: 'MAXI',
  super: 'SUPER',
  grand: 'GRAND',
};

type Status = 'ready' | 'spinning' | 'tally' | 'celebrate';

const IDLE_ADVANCE_MS = 4500;
const TALLY_STEP_MS = 240;
const CELEBRATE_MS = 2600;

/**
 * Player-operated Hold & Spin. The round is precomputed for integrity; the
 * player presses SPIN for each respin (empty cells whir with potential orbs).
 * When respins end, every locked orb is counted into a prominent running total
 * with a cash-register ding, finished by a big celebration before collecting.
 */
export default function HoldAndSpin({
  holdResult,
  totalBet,
  onComplete,
}: {
  holdResult: HoldResult;
  totalBet: number;
  onComplete: (total: number) => void;
}) {
  const [revealed, setRevealed] = useState<Orb[]>(holdResult.initial);
  const [respins, setRespins] = useState(HOLD_RESPINS);
  const [status, setStatus] = useState<Status>('ready');
  const [landing, setLanding] = useState<number[]>([]);
  const [tallyTotal, setTallyTotal] = useState(0);
  const [tallyPos, setTallyPos] = useState<number | null>(null);

  const busyRef = useRef(false);
  const stepRef = useRef(0);
  const orbCounterRef = useRef(holdResult.initial.length);
  const completedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    busyRef.current = false;
    completedRef.current = false;
    stepRef.current = 0;
    orbCounterRef.current = holdResult.initial.length;
    setRevealed(holdResult.initial);
    setRespins(HOLD_RESPINS);
    setLanding([]);
    setTallyTotal(0);
    setTallyPos(null);
    setStatus(holdResult.steps.length === 0 ? 'tally' : 'ready');
    return () => {
      mountedRef.current = false;
    };
  }, [holdResult]);

  // Reveal one precomputed respin on a SPIN press.
  const doRespin = useCallback(() => {
    if (busyRef.current) return;
    const idx = stepRef.current;
    if (idx >= holdResult.steps.length) return;
    busyRef.current = true;
    setStatus('spinning');
    sfx.playHoldRespin();

    const step = holdResult.steps[idx];
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (step.newOrbs.length > 0) {
        setLanding(step.newOrbs.map((o) => o.pos));
        setRevealed((prev) => [...prev, ...step.newOrbs]);
        step.newOrbs.forEach((o, i) => {
          if (o.tier !== 'cash') sfx.playJackpotTier(o.tier);
          else sfx.playOrbLand(orbCounterRef.current + i);
        });
        orbCounterRef.current += step.newOrbs.length;
        window.setTimeout(() => mountedRef.current && setLanding([]), 620);
      }
      setRespins(step.respinsLeft);
      const next = idx + 1;
      stepRef.current = next;
      setStatus(next >= holdResult.steps.length ? 'tally' : 'ready');
      busyRef.current = false;
    }, 720);
  }, [holdResult]);

  // Idle auto-advance so the round never stalls.
  useEffect(() => {
    if (status !== 'ready') return;
    const id = window.setTimeout(() => doRespin(), IDLE_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [status, doRespin]);

  // Tally phase: count each orb into the running total with a register ding.
  useEffect(() => {
    if (status !== 'tally') return;
    const orbs = [...holdResult.finalOrbs].sort((a, b) => a.pos - b.pos);
    const grandBonus = holdResult.filledAll ? JACKPOTS.grand * totalBet : 0;
    let running = 0;
    const timers: number[] = [];
    orbs.forEach((o, i) => {
      timers.push(
        window.setTimeout(() => {
          if (!mountedRef.current) return;
          running += o.value;
          setTallyTotal(running);
          setTallyPos(o.pos);
          if (o.tier !== 'cash') sfx.playJackpotTier(o.tier);
          else sfx.playCashRegister(i);
        }, i * TALLY_STEP_MS)
      );
    });
    const afterOrbs = orbs.length * TALLY_STEP_MS;
    if (grandBonus > 0) {
      timers.push(
        window.setTimeout(() => {
          if (!mountedRef.current) return;
          running += grandBonus;
          setTallyTotal(running);
          sfx.playJackpotTier('grand');
        }, afterOrbs + 200)
      );
    }
    timers.push(
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setTallyPos(null);
        setStatus('celebrate');
      }, afterOrbs + (grandBonus > 0 ? 600 : 250))
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [status, holdResult, totalBet]);

  // Celebration, then collect and return to the base game.
  useEffect(() => {
    if (status !== 'celebrate') return;
    sfx.playBigCelebration();
    const id = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete(holdResult.total);
    }, CELEBRATE_MS);
    return () => window.clearTimeout(id);
  }, [status, holdResult, onComplete]);

  const orbByPos = useMemo(() => {
    const m = new Map<number, Orb>();
    revealed.forEach((o) => m.set(o.pos, o));
    return m;
  }, [revealed]);

  const runningCollected = useMemo(() => revealed.reduce((s, o) => s + o.value, 0), [revealed]);
  const spinning = status === 'spinning';
  const tallying = status === 'tally' || status === 'celebrate';
  const bigTotal = tallying ? tallyTotal : runningCollected;

  const cells = Array.from({ length: HOLD_CELLS }, (_, pos) => pos);

  return (
    <div className={`hold-overlay ${status === 'celebrate' ? 'celebrating' : ''}`}>
      <div className="hold-panel">
        <div className="hold-title">HOLD &amp; SPIN</div>

        <div className="jackpot-ladder">
          {(['mini', 'minor', 'major', 'maxi', 'super', 'grand'] as JackpotTier[]).map((tier) => (
            <div
              key={tier}
              className={`jackpot-chip jp-${tier} ${holdResult.jackpotsWon.includes(tier) && tallying ? 'won' : ''}`}
            >
              <span className="jp-name">{TIER_LABEL[tier]}</span>
              <span className="jp-val">{fmt(JACKPOTS[tier] * totalBet)}</span>
            </div>
          ))}
        </div>

        <div className={`hold-grid ${spinning ? 'spinning' : ''}`}>
          {cells.map((pos) => {
            const reel = Math.floor(pos / ROWS);
            const row = pos % ROWS;
            const orb = orbByPos.get(pos);
            const isLanding = landing.includes(pos);
            const isCounting = tallyPos === pos;
            return (
              <div
                key={pos}
                className={`hold-cell ${orb ? 'filled' : 'empty'} ${isLanding ? 'landing' : ''} ${isCounting ? 'counting' : ''} ${orb && orb.tier !== 'cash' ? `jp-${orb.tier}` : ''}`}
                style={{ gridColumn: reel + 1, gridRow: row + 1 }}
              >
                {orb ? (
                  <div className="hold-orb">
                    <SymbolIcon id="orb" />
                    <span className="orb-value">
                      {orb.tier === 'cash' ? fmt(orb.value) : TIER_LABEL[orb.tier]}
                    </span>
                    {orb.tier === 'cash' && orb.mult != null && <span className="orb-mult">{orb.mult}× bet</span>}
                  </div>
                ) : (
                  spinning && (
                    <div className="whir" aria-hidden>
                      <SymbolIcon id="orb" />
                      <SymbolIcon id="orb" />
                      <SymbolIcon id="orb" />
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>

        {tallying ? (
          <div className="tally-box">
            {status === 'celebrate' && holdResult.filledAll && (
              <div className="grand-banner">★ FULL BOARD — GRAND JACKPOT! ★</div>
            )}
            <span className="tally-label">{status === 'celebrate' ? 'YOU WON' : 'COUNTING…'}</span>
            <span className={`tally-amount ${status === 'celebrate' ? 'final' : ''}`}>{fmt(bigTotal)}</span>
          </div>
        ) : (
          <>
            <div className="hold-controls">
              <div className="hold-meter">
                <span className="respins-label">RESPINS</span>
                <span className="respins-value">{respins}</span>
              </div>
              <button className="btn btn-hold-spin" onClick={doRespin} disabled={spinning}>
                {spinning ? '···' : 'SPIN'}
              </button>
              <div className="hold-meter">
                <span className="respins-label">COLLECTED</span>
                <span className="hold-total-amount live">{fmt(runningCollected)}</span>
              </div>
            </div>
            <div className="hold-hint">Press SPIN to lock more orbs</div>
          </>
        )}
      </div>
    </div>
  );
}
