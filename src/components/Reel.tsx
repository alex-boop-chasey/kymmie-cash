import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { SymbolId } from '../art/symbols';
import { SymbolIcon } from '../art/symbols';

/**
 * A single reel. Renders its symbol band plus its first two cells (a modulo
 * virtual strip of L+2 cells) so the 3-row window is always filled, and drives
 * a `pos` offset with one requestAnimationFrame loop using a time-based
 * easeOutReel curve.
 *
 * Because the easing is time-based (progress = elapsed / duration, clamped to
 * [0,1]), a backgrounded/throttled tab can never explode the animation — on
 * resume it simply snaps toward the exact target. Landing is exact by integer
 * congruence: the final `pos` satisfies `pos % band.length === finalStop`, so
 * the three visible symbols equal the predetermined result grid.
 */
export interface ReelProps {
  band: SymbolId[];
  finalStop: number;
  /** Bumps once per spin to trigger this reel's animation. */
  spinId: number;
  reelIndex: number;
  baseDurationMs: number;
  staggerMs: number;
  anticipate: boolean;
  reducedMotion: boolean;
  onSettle: (reelIndex: number) => void;
}

function easeOutReel(t: number): number {
  return 1 - Math.pow(1 - t, 2.2);
}

function Reel({
  band,
  finalStop,
  spinId,
  reelIndex,
  baseDurationMs,
  staggerMs,
  anticipate,
  reducedMotion,
  onSettle,
}: ReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef<number>(finalStop); // start resting on the initial grid
  const L = band.length;

  // Keep a stable ref to onSettle so the effect doesn't re-run on each render.
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;

  const applyTransform = (cell: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    const p = ((posRef.current % L) + L) % L;
    strip.style.transform = `translateY(${-p * cell}px)`;
  };

  // Paint the initial resting position before first paint.
  useLayoutEffect(() => {
    const cell = cellRef.current?.offsetHeight ?? 92;
    applyTransform(cell);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (spinId === 0) return; // 0 = initial mount, no spin
    const strip = stripRef.current;
    if (!strip) return;
    const cell = cellRef.current?.offsetHeight ?? 92;

    // Normalize accumulated position to avoid unbounded float growth over long
    // sessions (target % L is unchanged, so landing stays exact).
    const startPos = ((posRef.current % L) + L) % L;
    posRef.current = startPos;
    // Travel several full loops, then land so that pos % L === finalStop.
    const minTravel = (4 + reelIndex) * L;
    let target = startPos + minTravel;
    const rem = (((finalStop - (target % L)) % L) + L) % L;
    target += rem;

    const duration = reducedMotion
      ? 220 + reelIndex * 60
      : baseDurationMs + reelIndex * staggerMs + (anticipate ? 1300 : 0);

    if (anticipate) reelRef.current?.classList.add('reel-anticipate');
    let startTime: number | null = null;
    let lastPos = startPos;
    let settled = false;
    let lastBlurBucket = -1;

    const finish = () => {
      posRef.current = target;
      applyTransform(cell);
      strip.style.filter = 'none';
      reelRef.current?.classList.remove('reel-anticipate');
      // decoupled settle bounce
      if (!reducedMotion) {
        strip.classList.remove('reel-bounce');
        // force reflow so the animation can restart
        void strip.offsetWidth;
        strip.classList.add('reel-bounce');
      }
      settleRef.current(reelIndex);
    };

    const frame = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutReel(t);
      const pos = startPos + (target - startPos) * eased;
      posRef.current = pos;
      applyTransform(cell);

      // velocity-gated motion blur (skip under reduced motion).
      // Quantize to 0.5px buckets and only write when the bucket changes, so we
      // don't rebuild the blurred layer every single frame.
      if (!reducedMotion) {
        const v = Math.abs(pos - lastPos);
        const bucket = Math.round(Math.min(3.2, v * 0.9) * 2);
        if (bucket !== lastBlurBucket) {
          strip.style.filter = bucket > 0 ? `blur(${bucket / 2}px)` : 'none';
          lastBlurBucket = bucket;
        }
      }
      lastPos = pos;

      if (t >= 1) {
        if (!settled) {
          settled = true;
          finish();
        }
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId]);

  // Re-measure and re-apply the resting transform on resize/rotate, but only
  // while not mid-spin (the rAF loop owns the transform during a spin).
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const el = cellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (rafRef.current !== null) return; // mid-spin: leave it to the loop
      const cell = cellRef.current?.offsetHeight ?? 92;
      applyTransform(cell);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The strip: one band plus its first two cells so the 3-row window is always
  // covered (indices 0..L+1 cover any resting stop in [0, L-1] plus +1/+2 wrap).
  const strip = useMemo(() => [...band, band[0], band[1]], [band]);

  return (
    <div className="reel" ref={reelRef}>
      <div className="reel-strip" ref={stripRef}>
        {strip.map((sym, i) => (
          <div className={`reel-cell tile-${sym}`} ref={i === 0 ? cellRef : undefined} key={i}>
            <SymbolIcon id={sym} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Reel);
