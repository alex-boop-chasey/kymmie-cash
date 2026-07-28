import { useCallback, useEffect, useRef, useState } from 'react';
import { spin as engineSpin, runHoldAndSpin, forceHoldOrbs } from '../game/engine';
import type { SpinResult, HoldResult } from '../game/types';
import {
  BET_LEVELS,
  START_CREDITS,
  PAYLINES,
  FREE_SPIN_MULTIPLIER,
  REELS,
  ROWS,
  MAX_FREE_SPINS,
  BUY_BONUS_COST,
} from '../game/config';
import * as sfx from '../audio/sound';
import { coinShower } from '../components/Effects';

export type WinLevel = 'none' | 'win' | 'big' | 'mega';
export type Phase = 'base' | 'hold';

const NUM_LINES = PAYLINES.length;

export function useGame() {
  const [credits, setCredits] = useState(START_CREDITS);
  const [betLevelIndex, setBetLevelIndex] = useState(0); // default bet = 2/line
  const [spinning, setSpinning] = useState(false);
  // Seed an initial idle board so the reels show symbols before the first spin.
  const [result, setResult] = useState<SpinResult>(() => engineSpin(BET_LEVELS[1]));
  const [spinId, setSpinId] = useState(0);
  const [winThisSpin, setWinThisSpin] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [winLevel, setWinLevel] = useState<WinLevel>('none');
  const [freeSpins, setFreeSpins] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [message, setMessage] = useState('SPIN TO WIN');
  // Hold & Spin money round.
  const [phase, setPhase] = useState<Phase>('base');
  const [holdResult, setHoldResult] = useState<HoldResult | null>(null);
  // Which reels have stopped this spin (so coin values can show per column).
  const [settledReels, setSettledReels] = useState<boolean[]>(() => Array(REELS).fill(false));
  // Grid positions of Kymmies to enlarge & pulse when the free-spins feature hits.
  const [kymmieCelebrate, setKymmieCelebrate] = useState<number[]>([]);

  const betPerLine = BET_LEVELS[betLevelIndex];
  const totalBet = betPerLine * NUM_LINES;

  // Refs for values needed inside async settle callbacks.
  const resultRef = useRef<SpinResult | null>(null);
  const settledCount = useRef(0);
  const inFreeSpinsRef = useRef(false);
  inFreeSpinsRef.current = inFreeSpins;
  const freeSpinsRef = useRef(0);
  freeSpinsRef.current = freeSpins;
  const featureTotalRef = useRef(0); // total free spins awarded this feature (hard cap)
  const inFlightRef = useRef(false);
  const scatterSeenRef = useRef(0);
  const musicStartedRef = useRef(false);
  const phaseRef = useRef<Phase>('base');
  phaseRef.current = phase;

  const changeBet = useCallback(
    (delta: number) => {
      if (spinning || inFreeSpins) return;
      setBetLevelIndex((i) => Math.max(0, Math.min(BET_LEVELS.length - 1, i + delta)));
      sfx.playButton();
    },
    [spinning, inFreeSpins]
  );

  const maxBet = useCallback(() => {
    if (spinning || inFreeSpins) return;
    setBetLevelIndex(BET_LEVELS.length - 1);
    sfx.playButton();
  }, [spinning, inFreeSpins]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      sfx.setMuted(!m);
      return !m;
    });
  }, []);

  const toggleAutoplay = useCallback(() => {
    sfx.unlockAudio();
    sfx.playButton();
    setAutoplay((a) => !a);
  }, []);

  const toggleTurbo = useCallback(() => {
    sfx.playButton();
    setTurbo((t) => !t);
  }, []);

  // Buy the Hold & Spin feature outright.
  const buyBonus = useCallback(() => {
    if (spinning || phaseRef.current !== 'base') return;
    const cost = BUY_BONUS_COST * totalBet;
    if (credits < cost) return;
    sfx.unlockAudio();
    if (!musicStartedRef.current) {
      musicStartedRef.current = true;
      sfx.startBaseMusic();
    }
    setCredits((c) => c - cost);
    const hold = runHoldAndSpin(totalBet, forceHoldOrbs(totalBet));
    setHoldResult(hold);
    setPhase('hold');
    setMessage('💰 BONUS BOUGHT — HOLD & SPIN! 💰');
    sfx.playHoldStart();
  }, [spinning, credits, totalBet]);

  const doSpin = useCallback(() => {
    if (spinning || phaseRef.current !== 'base') return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    sfx.unlockAudio();
    if (!musicStartedRef.current) {
      musicStartedRef.current = true;
      sfx.startBaseMusic();
    }

    const free = inFreeSpinsRef.current;
    if (!free) {
      if (credits < totalBet) {
        inFlightRef.current = false;
        return;
      }
      setCredits((c) => c - totalBet);
    }

    const res = engineSpin(betPerLine);
    resultRef.current = res;
    settledCount.current = 0;
    scatterSeenRef.current = 0;
    setSettledReels(Array(REELS).fill(false));

    setResult(res);
    setWinThisSpin(0);
    setWinLevel('none');
    setSpinning(true);
    setSpinId((n) => n + 1);
    setMessage('GOOD LUCK!');
    sfx.playSpin();
    // Build tension when a feature is one symbol away on the final reels.
    if (res.anticipateReels.length > 0) sfx.playAnticipation();
  }, [spinning, credits, totalBet, betPerLine]);

  // Called by each reel when it lands. When all reels are in, resolve payouts.
  const notifyReelSettled = useCallback((reelIndex: number) => {
    sfx.playReelStop(reelIndex);
    // Reveal this column's coin values the instant it stops.
    setSettledReels((prev) => {
      if (prev[reelIndex]) return prev;
      const next = [...prev];
      next[reelIndex] = true;
      return next;
    });

    // As each reel lands, fire an escalating explosive build-up for every
    // Kymmie (scatter) revealed on it.
    const settling = resultRef.current;
    if (settling) {
      // Harsh smack when money coins appear in this column.
      const orbsOnReel = settling.grid[reelIndex].filter((s) => s === 'orb').length;
      if (orbsOnReel > 0) sfx.playOrbSmack(orbsOnReel);
      // Escalating explosive build-up for every Kymmie revealed on this column.
      const kymmiesOnReel = settling.grid[reelIndex].filter((s) => s === 'scatter').length;
      for (let k = 0; k < kymmiesOnReel; k++) {
        scatterSeenRef.current += 1;
        sfx.playKymmieHit(scatterSeenRef.current);
      }
    }

    settledCount.current += 1;
    if (settledCount.current < REELS) return;

    const res = resultRef.current;
    if (!res) return;

    const wasFree = inFreeSpinsRef.current;
    const multiplier = wasFree ? FREE_SPIN_MULTIPLIER : 1;
    const win = res.baseWin * multiplier;

    if (win > 0) {
      setCredits((c) => c + win);
      setWinThisSpin(win);
      setLastWin(win);
    }

    // Determine win presentation level (relative to total bet).
    const ratio = totalBet > 0 ? win / totalBet : 0;
    let level: WinLevel = 'none';
    if (win > 0) {
      if (ratio >= 50) level = 'mega';
      else if (ratio >= 10) level = 'big';
      else level = 'win';
    }
    setWinLevel(level);
    // Triumphant horns on every win, escalating through 4 amount tiers, plus the
    // signature rising win-ticker as the WIN meter counts up.
    if (win > 0) {
      const hornTier = ratio >= 40 ? 4 : ratio >= 15 ? 3 : ratio >= 5 ? 2 : 1;
      sfx.playWinHorns(hornTier);
      sfx.playWinTickup(Math.min(1, ratio / 40), Math.min(2200, 500 + win * 2));
      sfx.playCashRegister(); // ka-ching on every win
      if (level === 'mega') coinShower(44);
      else if (level === 'big') coinShower(26);
    }

    // Free-spins bookkeeping.
    // Consume the current spin if it was a free spin, then add any newly awarded
    // spins. These are decoupled so a retriggering free spin still consumes itself.
    let delta = wasFree ? -1 : 0;
    if (res.freeSpinsAwarded > 0) {
      if (!wasFree) featureTotalRef.current = 0; // fresh feature — reset the total
      const room = MAX_FREE_SPINS - featureTotalRef.current;
      const add = Math.max(0, Math.min(res.freeSpinsAwarded, room));
      if (add > 0) {
        featureTotalRef.current += add;
        delta += add;
        // 3+ Kymmies: lengthy triumphant tune, fanfare and the winner's bell, and
        // the Kymmie tokens enlarge & pulse while it plays out.
        sfx.playFreeSpinsFanfare();
        const positions: number[] = [];
        for (let reel = 0; reel < REELS; reel++)
          for (let row = 0; row < ROWS; row++)
            if (res.grid[reel][row] === 'scatter') positions.push(reel * ROWS + row);
        setKymmieCelebrate(positions);
        setInFreeSpins(true);
      }
    }
    setFreeSpins((f) => Math.max(0, f + delta));

    // Exit the feature when pending free spins reach 0 (whether the last spin
    // added a capped-out retrigger or not). Computed from the ref.
    const willExit = wasFree && freeSpinsRef.current + delta <= 0;
    if (willExit) setInFreeSpins(false);

    // Hold & Spin money round: 6+ orbs trigger the feature. Precompute the whole
    // round now; the HoldAndSpin overlay plays it back and calls completeHold().
    if (res.triggersHold) {
      const hold = runHoldAndSpin(totalBet, res.orbs);
      setHoldResult(hold);
      setPhase('hold');
      sfx.playHoldStart();
    }

    // Crowd reaction. Exactly 2 Kymmies is the classic near-miss tease → a very
    // distinct crowd boo. Otherwise cheer a win, or boo a plain losing spin
    // (never boo when a feature just triggered — that's exciting).
    if (res.scatterCount === 2) sfx.playBoo();
    else if (win > 0) sfx.playCheer();
    else if (!res.triggersHold && res.freeSpinsAwarded === 0) sfx.playBoo();

    // Dynamic status message (like a real cabinet's ticker).
    if (res.triggersHold) setMessage('💰 HOLD & SPIN TRIGGERED! 💰');
    else if (res.freeSpinsAwarded > 0) setMessage(`🎉 ${res.freeSpinsAwarded} FREE SPINS WON! 🎉`);
    else if (res.mysterySymbol) setMessage('✨ STACKED MYSTERY SYMBOLS! ✨');
    else if (res.nudgeMultiplier > 1) setMessage(`🐉 WILD MULTIPLIER ×${res.nudgeMultiplier}! 🐉`);
    else if (win > 0) setMessage(`WIN ${win.toLocaleString('en-US')}`);
    else setMessage(wasFree ? 'FREE SPIN' : 'SPIN TO WIN');

    inFlightRef.current = false;
    setSpinning(false);
  }, [totalBet, betPerLine]);

  // Called by the HoldAndSpin overlay when the money round finishes.
  const completeHold = useCallback((amount: number) => {
    if (amount > 0) {
      setCredits((c) => c + amount);
      setWinThisSpin(amount);
      setLastWin(amount);
      coinShower(46);
    }
    setHoldResult(null);
    setPhase('base');
  }, []);

  // Clear the Kymmie celebration after the triumphant tune plays out.
  useEffect(() => {
    if (kymmieCelebrate.length === 0) return;
    const id = window.setTimeout(() => setKymmieCelebrate([]), 4600);
    return () => window.clearTimeout(id);
  }, [kymmieCelebrate]);

  // Auto-advance during free spins, and honour manual autoplay. Never while the
  // Hold & Spin money round is active.
  useEffect(() => {
    if (spinning || phase !== 'base') return;
    const canAfford = credits >= totalBet;
    const shouldFreeSpin = inFreeSpins && freeSpins > 0;
    const shouldAuto = autoplay && canAfford;
    if (!shouldFreeSpin && !shouldAuto) return;
    const delay = shouldFreeSpin ? 1100 : 900;
    const id = window.setTimeout(() => doSpin(), delay);
    return () => window.clearTimeout(id);
  }, [spinning, phase, inFreeSpins, freeSpins, autoplay, credits, totalBet, doSpin]);

  // Stop autoplay if the player runs dry.
  useEffect(() => {
    if (autoplay && !inFreeSpins && credits < totalBet) setAutoplay(false);
  }, [autoplay, inFreeSpins, credits, totalBet]);

  // Swap music beds: calm Chinese base tune during normal play, lively Chinese
  // festival tune during BOTH the free-spins feature and the Hold & Spin round.
  useEffect(() => {
    if (!musicStartedRef.current) return;
    if (phase === 'hold' || inFreeSpins) sfx.startFeatureMusic();
    else sfx.startBaseMusic();
  }, [phase, inFreeSpins]);

  const dismissWin = useCallback(() => setWinLevel('none'), []);

  return {
    credits,
    betPerLine,
    totalBet,
    betLevelIndex,
    numLines: NUM_LINES,
    canBetUp: betLevelIndex < BET_LEVELS.length - 1,
    canBetDown: betLevelIndex > 0,
    spinning,
    result,
    spinId,
    settledReels,
    kymmieCelebrate,
    winThisSpin,
    lastWin,
    winLevel,
    freeSpins,
    inFreeSpins,
    autoplay,
    muted,
    turbo,
    message,
    phase,
    holdResult,
    canSpin: !spinning && phase === 'base' && (inFreeSpins || credits >= totalBet),
    canBuyBonus: !spinning && phase === 'base' && !inFreeSpins && credits >= BUY_BONUS_COST * totalBet,
    buyBonusCost: BUY_BONUS_COST * totalBet,
    changeBet,
    maxBet,
    doSpin,
    buyBonus,
    notifyReelSettled,
    completeHold,
    toggleMute,
    toggleAutoplay,
    toggleTurbo,
    dismissWin,
  };
}
