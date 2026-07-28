import { useEffect, useRef, useState } from 'react';
import type { WinLevel } from '../hooks/useGame';

const TITLES: Record<Exclude<WinLevel, 'none'>, string> = {
  win: 'NICE WIN!',
  big: 'BIG WIN!',
  mega: 'MEGA WIN!!!',
};

const DURATIONS: Record<Exclude<WinLevel, 'none'>, number> = {
  win: 1400,
  big: 2600,
  mega: 3800,
};

/** Celebratory overlay with a coin shower and a counting-up amount. */
export default function WinOverlay({
  level,
  amount,
  onDone,
}: {
  level: WinLevel;
  amount: number;
  onDone: () => void;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (level === 'none' || amount <= 0) return;
    const dur = DURATIONS[level];

    if (reduced) {
      setDisplay(amount);
      const done = window.setTimeout(onDone, dur);
      return () => {
        window.clearTimeout(done);
      };
    }

    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / Math.min(1200, dur * 0.6));
      setDisplay(Math.floor(amount * (1 - Math.pow(1 - t, 3))));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const done = window.setTimeout(onDone, dur);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(done);
    };
  }, [level, amount, onDone, reduced]);

  if (level === 'none' || amount <= 0) return null;

  const coinCount = level === 'mega' ? 40 : level === 'big' ? 24 : 12;

  return (
    <div
      className={`win-burst win-burst-${level}`}
      onClick={onDone}
      role="button"
      tabIndex={0}
      aria-label="Dismiss win"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') onDone();
      }}
    >
      <div className="coin-shower" aria-hidden>
        {Array.from({ length: coinCount }, (_, i) => (
          <span
            key={i}
            className="falling-coin"
            style={{
              left: `${(i * 97) % 100}%`,
              animationDelay: `${(i % 10) * 0.12}s`,
              animationDuration: `${1.4 + ((i * 7) % 10) * 0.12}s`,
            }}
          >
            🪙
          </span>
        ))}
      </div>
      <div className="win-burst-inner">
        <div className="win-burst-title">{TITLES[level]}</div>
        <div className="win-burst-amount">{display.toLocaleString('en-US')}</div>
        <div className="win-burst-sub">credits</div>
      </div>
    </div>
  );
}
