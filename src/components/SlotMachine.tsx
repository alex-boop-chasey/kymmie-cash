import { useEffect, useMemo, useState } from 'react';
import Reel from './Reel';
import Controls from './Controls';
import Paytable from './Paytable';
import WinOverlay from './WinOverlay';
import HoldAndSpin from './HoldAndSpin';
import JackpotLadder from './JackpotLadder';
import { SymbolIcon } from '../art/symbols';
import { useGame } from '../hooks/useGame';
import { REEL_BANDS, PAYLINES, REELS, ROWS, NUDGE_REEL } from '../game/config';

const BASE_DURATION = 1050;
const STAGGER = 230;
const TURBO_DURATION = 380;
const TURBO_STAGGER = 90;

const fmt = (n: number) => n.toLocaleString('en-US');

export default function SlotMachine() {
  const game = useGame();
  const [showPaytable, setShowPaytable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void document.documentElement.requestFullscreen?.();
  };

  // Which cells (reel,row) are part of a win — for the highlight overlay.
  const winCells = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: REELS }, () =>
      Array.from({ length: ROWS }, () => false)
    );
    if (game.spinId === 0 || game.spinning || game.winThisSpin <= 0) return grid;
    for (const w of game.result.lineWins) {
      const line = PAYLINES[w.lineIndex];
      for (const reel of w.reels) grid[reel][line[reel]] = true;
    }
    if (game.result.freeSpinsAwarded > 0) {
      for (let r = 0; r < REELS; r++)
        for (let row = 0; row < ROWS; row++)
          if (game.result.grid[r][row] === 'scatter') grid[r][row] = true;
    }
    return grid;
  }, [game.spinId, game.spinning, game.winThisSpin, game.result]);

  const showHighlights =
    game.spinId > 0 && !game.spinning && (game.winThisSpin > 0 || game.result.freeSpinsAwarded > 0);

  // Coin values show per column the instant that reel stops.
  const orbBadges =
    game.spinId > 0 && game.phase === 'base'
      ? game.result.orbs.filter((o) => game.settledReels[Math.floor(o.pos / ROWS)])
      : [];

  return (
    <div
      className={`machine ${game.inFreeSpins ? 'free-spins-mode' : ''} ${game.phase === 'hold' ? 'hold-mode' : ''}`}
    >
      <button
        className="fs-btn"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
        title="Full screen"
      >
        {isFullscreen ? '⤡' : '⛶'}
      </button>

      <header className="masthead">
        <div className="logo">
          <span className="logo-kymmie">KYMMIE</span>
          <span className="logo-cash">CASH</span>
        </div>
      </header>

      <div className="play-area">
        <JackpotLadder tiers={['mini', 'minor', 'major']} totalBet={game.totalBet} />

        <div className="reels-frame">
        <div className="reels" aria-hidden="true">
          {Array.from({ length: REELS }, (_, i) => (
            <Reel
              key={i}
              band={REEL_BANDS[i]}
              finalStop={game.result.stops[i]}
              spinId={game.spinId}
              reelIndex={i}
              baseDurationMs={game.turbo ? TURBO_DURATION : BASE_DURATION}
              staggerMs={game.turbo ? TURBO_STAGGER : STAGGER}
              anticipate={game.result.anticipateReels.includes(i)}
              reducedMotion={reducedMotion}
              onSettle={game.notifyReelSettled}
            />
          ))}
        </div>

        {showHighlights && (
          <div className="win-overlay-grid" aria-hidden>
            {Array.from({ length: REELS }, (_, r) =>
              Array.from({ length: ROWS }, (_, row) => (
                <div
                  key={`${r}-${row}`}
                  className={`win-cell ${winCells[r][row] ? 'win-cell-lit' : ''}`}
                  style={{ gridColumn: r + 1, gridRow: row + 1 }}
                />
              ))
            )}
          </div>
        )}

        {/* Money-coin value badges — big numbers filling the coins */}
        {orbBadges.length > 0 && (
          <div className="orb-overlay-grid" aria-hidden>
            {orbBadges.map((o) => (
              <div
                key={o.pos}
                className="orb-number"
                style={{ gridColumn: Math.floor(o.pos / ROWS) + 1, gridRow: (o.pos % ROWS) + 1 }}
              >
                {fmt(o.value)}
              </div>
            ))}
          </div>
        )}

        {/* Stacked mystery symbols reveal one symbol */}
        {!game.spinning && game.spinId > 0 && game.phase === 'base' && game.result.mysterySymbol && (
          <div className="mystery-reveal-grid" aria-hidden>
            {game.result.mysteryPositions.map((pos) => (
              <div
                key={pos}
                className="mystery-reveal-cell"
                style={{ gridColumn: Math.floor(pos / ROWS) + 1, gridRow: (pos % ROWS) + 1 }}
              >
                <SymbolIcon id={game.result.mysterySymbol!} />
              </div>
            ))}
          </div>
        )}

        {/* Nudging multiplier wild fills reel 3 with a multiplier */}
        {!game.spinning && game.spinId > 0 && game.phase === 'base' && game.result.nudgeMultiplier > 1 && (
          <div className="nudge-grid" aria-hidden>
            {[0, 1, 2].map((row) => (
              <div key={row} className="nudge-wild-cell" style={{ gridColumn: NUDGE_REEL + 1, gridRow: row + 1 }}>
                <SymbolIcon id="wild" />
              </div>
            ))}
            <div className="nudge-mult-badge" style={{ gridColumn: NUDGE_REEL + 1, gridRow: 1 }}>
              ×{game.result.nudgeMultiplier}
            </div>
          </div>
        )}

        {/* Kymmie tokens enlarge & pulse when 3+ trigger the free spins */}
        {game.kymmieCelebrate.length > 0 && (
          <div className="kymmie-celebrate-grid" aria-hidden>
            {game.kymmieCelebrate.map((pos) => (
              <div
                key={pos}
                className="kymmie-celebrate-cell"
                style={{ gridColumn: Math.floor(pos / ROWS) + 1, gridRow: (pos % ROWS) + 1 }}
              >
                <SymbolIcon id="scatter" />
              </div>
            ))}
          </div>
        )}

        {/* Prominent free-spins counter overlapping the board */}
        {game.inFreeSpins && (
          <div className="freespin-badge" aria-hidden>
            <span className="fsb-label">FREE SPINS</span>
            <span className="fsb-count">{game.freeSpins}</span>
            <span className="fsb-mult">3× WINS</span>
          </div>
        )}
        </div>

        <JackpotLadder tiers={['maxi', 'super', 'grand']} totalBet={game.totalBet} />
      </div>

      <div className="ticker-bar">{game.message}</div>

      <Controls game={game} onOpenPaytable={() => setShowPaytable(true)} />

      <WinOverlay level={game.winLevel} amount={game.winThisSpin} onDone={game.dismissWin} />

      {game.phase === 'hold' && game.holdResult && (
        <HoldAndSpin holdResult={game.holdResult} totalBet={game.totalBet} onComplete={game.completeHold} />
      )}

      {showPaytable && <Paytable onClose={() => setShowPaytable(false)} />}

      <div className="sr-only" aria-live="polite">
        {game.winThisSpin > 0 ? `Win ${game.winThisSpin} credits` : ''}
      </div>

      <div className="rotate-hint">↔ Rotate to landscape for the full experience</div>

      <footer className="disclaimer">
        For entertainment only · Fake credits, no real money · Credits reset when you reload
      </footer>
    </div>
  );
}
