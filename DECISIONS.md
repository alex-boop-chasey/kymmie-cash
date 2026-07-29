# Kymmie Cash — Build Decisions

Autonomous build. Locked choices (from owner):
- Theme: **Kymmie Cash** — Vegas money/gold aesthetic (gold, emerald, ruby, royal navy).
- Credits: **reset to 1000 on every page load** (load-URL-and-play-once). No persistence.
- Deploy target: **Cloudflare Workers static assets**; verified on local dev server. No live deploy.
- Stack: **React + Vite + TypeScript**.

## Design Contest — Reel Animation Architecture (3 agents)

**Problem:** Spin reels with authentic motion + sequential settle, but land exactly on an
RNG grid that is predetermined at spin-start (visual must never disagree with the result).

- **Agent 1 (tried-and-true):** CSS `translateY` strip + CSS transitions; hard-pixel endpoint
  forces exact landing; `transitionend` fires settle.
- **Agent 2 (divergent):** single `requestAnimationFrame` loop, reels as physics bodies on a
  **modulo virtual strip** (only ~4 DOM cells/reel), imperative refs, exact landing by snapping
  to an integer stop congruent to the target index.
- **Agent 3 (critic):** `transitionend` is unreliable (backgrounded tabs, interrupts, per-property)
  and P1's hard-pixel endpoints drift on resize/zoom; P1's mid-spin re-spin and blur are painful.
  P2's spring tuning is an open-ended time sink and a giant `dt` on tab-resume explodes the physics.
  Verdict: **P2 architecture is lower total risk**; graft P1's simplicity by replacing the spring
  with a precomputed easing curve.

**Orchestrator synthesis (final):** P2's virtual-strip + rAF + integer-congruent exact landing,
with a **precomputed cubic easing curve** instead of a spring (deterministic, no tuning), plus a
`dt` clamp and `visibilitychange` guard so backgrounded tabs never explode or leave a stuck reel.
Loop-based settle detection (no `transitionend`). Motion blur is CSS filter gated by live velocity,
disabled under `prefers-reduced-motion`.

---

## Dragon Link rescale (autonomous, multi-agent)

Owner asked for a full rescale to mimic a real Aristocrat **Dragon Link** machine. A
4-agent research team studied real DL base game, Hold & Spin, audio/jackpots and
polish; findings synthesized here and implemented.

**Core feature — Hold & Spin money round (Dragon Link "Cash on Reel"):**
- Money **orbs** ("cash on reel"): land 6+ on a base spin → Hold & Spin. Values are
  multiples of TOTAL bet (`ORB_CASH_MULTS`), shown as a big number **filling the coin**,
  revealed the instant each column stops.
- Round is **player-operated**: press SPIN for each respin (3 respins, reset on any new
  orb); empty cells **whir** with potential coins; idle auto-advance so it never stalls.
- Ends on 0 respins or full board (→ GRAND). Then each coin is **counted into a running
  total** with a cash-register ding, finishing with a big celebration before collecting.
- Precomputed round (`runHoldAndSpin`) for integrity; playback is StrictMode-safe
  (`completedRef`, no auto-run credit path) — this also fixed an earlier double-playback.
- Jackpots MINI/MINOR/MAJOR/GRAND = ×total bet, shown on a persistent **jackpot ladder**
  (GRAND purple, MAJOR red, MINOR green, MINI blue) with ticking progressives.

**Presentation:** full-width immersive cabinet, marquee-bulb frame, big board sized to
fill the viewport, reel **anticipation glow** on near-feature reels, prominent free-spins
counter overlapping the board, LED-style meters, fullscreen button, mobile-landscape layout.

**Audio (synth, no assets):** 4-tier triumphant win **horns**, rising **win-ticker**,
per-orb electric **zap** + harsh **smack** per column, escalating **Kymmie explosion**
build-up (with a distinct crowd **boo** on exactly 2), free-spins **fanfare + winner's
bell**, escalating jackpot fanfares, cash-register tally, big celebration, and looping
base/feature **music beds**.

**Math:** reel bands are now **deterministic** (seeded mulberry32) so RTP is stable across
loads. Verified with `scripts/rtp-sim.ts` (Monte Carlo). This is a for-fun demo (credits reset
to 1000 each load, no real money) and is deliberately tuned very "hot".

## Kymmie/coin retune (autonomous)

Owner: "the 3 Kymmies come up way too often — especially in the free-spins round — dial it back;
and the money-coin amounts must scale with the bet."

- **Kymmie (scatter) frequency dialled back.** Base-game scatter weight cut `5 → 3` on every reel.
  Free spins now draw from a **separate reduced-scatter band set** (`FREE_REEL_WEIGHTS`,
  `scatter: 1` → `FREE_REEL_BANDS`); `spin(betPerLine, free)` selects it, so 3-Kymmie
  **retriggers** during the feature are a rare bonus instead of firing at the full base rate.
- **Money coins now scale with total bet.** `ORB_CASH_VALUES` (absolute credits, only floored to
  the bet) replaced by `ORB_CASH_MULTS` — weighted **multiples of total bet**; a coin's value is
  `mult × totalBet`, so higher bet → higher numbers on the coins (matching how jackpots already
  scale). Multipliers were tuned so the average coin value at the default bet is unchanged, so the
  money-round balance is preserved and RTP is now bet-independent.
- Measured **RTP ≈ 2630%** (1M-spin Monte Carlo) with the free-spin trigger rate cut from
  **1 in 7 → 1 in 22**; free-spins return alone dropped ~9× (fewer triggers + far rarer
  retriggers). The machine is still deliberately very hot (for-fun demo). Coin scaling is
  RTP-neutral per event (~5050 credits per Hold & Spin trigger, unchanged). Re-verify with
  `npx tsx scripts/rtp-sim.ts`.
