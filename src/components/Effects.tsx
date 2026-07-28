import { useEffect, useRef } from "react";
import type { ReactElement } from "react";

/**
 * Effects.tsx
 * ------------
 * A self-contained, canvas-based particle/effects layer for a premium slot game.
 *
 * - Renders one full-viewport <canvas> (position: fixed; inset: 0; pointer-events: none).
 * - Runs a SINGLE requestAnimationFrame loop that draws every live particle.
 * - Ambient effect: slow-rising warm gold/amber embers with flicker + fade.
 * - Respects prefers-reduced-motion (renders nothing / no animation when set).
 * - Exposes module-level imperative triggers (coinShower / lightningFlash /
 *   emberBurst) that the mounted component wires up on mount and resets to
 *   no-ops on unmount, so ANY code can call them without holding a ref.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ParticleKind = "ember" | "coin" | "spark" | "flash";

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** current life in seconds */
  life: number;
  /** total lifespan in seconds */
  maxLife: number;
  size: number;
  /** base opacity multiplier (0..1) */
  alpha: number;
  /** current rotation (radians) */
  rot: number;
  /** rotation speed (radians / second) */
  spin: number;
  /** flicker phase for embers */
  phase: number;
  /** gravity applied per second (px/s^2), coins/sparks only */
  gravity: number;
  /** hue helper: 0 = amber, 1 = brighter gold — used to vary ember color */
  warm: number;
  /** whether the coin shows a "$" glyph vs a plain shine */
  dollar: boolean;
}

/** Public signatures for the imperative triggers. */
type CoinShowerFn = (count?: number) => void;
type LightningFlashFn = (x?: number, y?: number) => void;
type EmberBurstFn = (x: number, y: number) => void;

/* -------------------------------------------------------------------------- */
/* Module-level singletons (safe no-ops until a component mounts)             */
/* -------------------------------------------------------------------------- */

const noopCoinShower: CoinShowerFn = () => {};
const noopLightningFlash: LightningFlashFn = () => {};
const noopEmberBurst: EmberBurstFn = () => {};

interface Registry {
  coinShower: CoinShowerFn;
  lightningFlash: LightningFlashFn;
  emberBurst: EmberBurstFn;
}

const registry: Registry = {
  coinShower: noopCoinShower,
  lightningFlash: noopLightningFlash,
  emberBurst: noopEmberBurst,
};

/**
 * Trigger a burst of gold coins rising from the bottom-center and falling
 * back down with gravity + spin. Used for big wins / feature collect.
 */
export function coinShower(count = 24): void {
  registry.coinShower(count);
}

/**
 * Trigger a quick electric crackle + white screen-flash bloom at the given
 * viewport coordinates (defaults to screen center). Used when a money orb locks.
 */
export function lightningFlash(x?: number, y?: number): void {
  registry.lightningFlash(x, y);
}

/** Trigger a small burst of fire sparks at a point. */
export function emberBurst(x: number, y: number): void {
  registry.emberBurst(x, y);
}

/* -------------------------------------------------------------------------- */
/* Tunables                                                                   */
/* -------------------------------------------------------------------------- */

const MAX_PARTICLES = 400;
const AMBIENT_TARGET = 42; // steady ambient ember count (~30-50)

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Effects(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Respect reduced motion: register no-ops, draw nothing, run no loop.
    if (reduceMotion) {
      registry.coinShower = noopCoinShower;
      registry.lightningFlash = noopLightningFlash;
      registry.emberBurst = noopEmberBurst;
      return () => {
        registry.coinShower = noopCoinShower;
        registry.lightningFlash = noopLightningFlash;
        registry.emberBurst = noopEmberBurst;
      };
    }

    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    const particles: Particle[] = [];

    // Logical (CSS-pixel) dimensions of the viewport.
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize(): void {
      if (canvas === null || ctx === null) {
        return;
      }
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Draw in CSS pixels; the transform scales up to device pixels.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    /* --------------------------- spawners ------------------------------- */

    function spawnAmbientEmber(atBottom: boolean): void {
      if (particles.length >= MAX_PARTICLES) {
        return;
      }
      const maxLife = rand(4, 8);
      particles.push({
        kind: "ember",
        x: rand(0, width),
        // when seeding the initial field, scatter through full height
        y: atBottom ? height + rand(0, 30) : rand(0, height),
        vx: rand(-8, 8),
        vy: rand(-26, -12),
        life: 0,
        maxLife,
        size: rand(1.2, 3.2),
        alpha: rand(0.35, 0.9),
        rot: 0,
        spin: 0,
        phase: rand(0, Math.PI * 2),
        gravity: 0,
        warm: Math.random(),
        dollar: false,
      });
    }

    function doCoinShower(count = 24): void {
      const n = Math.max(1, Math.floor(count));
      const cx = width / 2;
      for (let i = 0; i < n; i += 1) {
        if (particles.length >= MAX_PARTICLES) {
          break;
        }
        const spread = rand(-1, 1);
        particles.push({
          kind: "coin",
          x: cx + spread * width * 0.16,
          y: height + rand(0, 24),
          vx: spread * rand(60, 220),
          vy: rand(-820, -520),
          life: 0,
          maxLife: rand(1.6, 2.6),
          size: rand(11, 18),
          alpha: 1,
          rot: rand(0, Math.PI * 2),
          spin: rand(-9, 9),
          phase: 0,
          gravity: rand(900, 1150),
          warm: Math.random(),
          dollar: Math.random() < 0.55,
        });
      }
    }

    function doEmberBurst(x: number, y: number): void {
      const n = 14;
      for (let i = 0; i < n; i += 1) {
        if (particles.length >= MAX_PARTICLES) {
          break;
        }
        const ang = rand(0, Math.PI * 2);
        const speed = rand(40, 170);
        particles.push({
          kind: "spark",
          x,
          y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - rand(20, 70),
          life: 0,
          maxLife: rand(0.5, 1.1),
          size: rand(1.4, 3.4),
          alpha: 1,
          rot: 0,
          spin: 0,
          phase: rand(0, Math.PI * 2),
          gravity: rand(120, 260),
          warm: Math.random(),
          dollar: false,
        });
      }
    }

    function doLightningFlash(x?: number, y?: number): void {
      const px = x ?? width / 2;
      const py = y ?? height / 2;
      // The bloom particle carries the full-screen flash + local crackle.
      particles.push({
        kind: "flash",
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.25,
        size: rand(120, 180),
        alpha: 1,
        rot: rand(0, Math.PI * 2),
        spin: 0,
        phase: Math.random() * 1000, // seed for deterministic-ish bolt shape
        gravity: 0,
        warm: 0,
        dollar: false,
      });
      // A few accompanying electric-white sparks.
      for (let i = 0; i < 10; i += 1) {
        if (particles.length >= MAX_PARTICLES) {
          break;
        }
        const ang = rand(0, Math.PI * 2);
        const speed = rand(120, 320);
        particles.push({
          kind: "spark",
          x: px,
          y: py,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 0,
          maxLife: rand(0.18, 0.34),
          size: rand(1.2, 2.6),
          alpha: 1,
          rot: 0,
          spin: 0,
          phase: 1, // marks a "cold" (white/blue) spark
          gravity: 0,
          warm: 1,
          dollar: false,
        });
      }
    }

    // Wire the module singletons to the live implementations.
    registry.coinShower = doCoinShower;
    registry.lightningFlash = doLightningFlash;
    registry.emberBurst = doEmberBurst;

    // Seed an initial ambient field so the screen isn't empty on mount.
    for (let i = 0; i < AMBIENT_TARGET; i += 1) {
      spawnAmbientEmber(false);
    }

    /* ---------------------------- drawing ------------------------------- */

    function drawEmber(p: Particle, t: number): void {
      if (ctx === null) {
        return;
      }
      const flicker = 0.65 + 0.35 * Math.sin(p.phase + t * 6);
      // Fade in over first 15%, fade out over final 40%.
      const inFade = Math.min(1, t / 0.15);
      const outFade = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      const a = p.alpha * flicker * inFade * outFade;
      if (a <= 0.01) {
        return;
      }
      const r = p.size * (0.85 + 0.15 * flicker);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      // amber core -> gold -> transparent
      const core = p.warm < 0.5 ? "255, 210, 120" : "255, 178, 70";
      g.addColorStop(0, `rgba(255, 244, 214, ${a})`);
      g.addColorStop(0.35, `rgba(${core}, ${a * 0.9})`);
      g.addColorStop(1, `rgba(${core}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSpark(p: Particle, t: number): void {
      if (ctx === null) {
        return;
      }
      const a = p.alpha * (1 - t);
      if (a <= 0.01) {
        return;
      }
      const cold = p.phase === 1;
      const color = cold ? "220, 236, 255" : "255, 196, 96";
      const r = p.size;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
      g.addColorStop(0, `rgba(255, 255, 255, ${a})`);
      g.addColorStop(0.4, `rgba(${color}, ${a})`);
      g.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawCoin(p: Particle, t: number): void {
      if (ctx === null) {
        return;
      }
      const outFade = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      const a = p.alpha * outFade;
      if (a <= 0.01) {
        return;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      // Simulate spin by squashing horizontally (edge-on when |cos| small).
      const face = Math.cos(p.rot);
      const sx = Math.max(0.12, Math.abs(face));
      ctx.scale(sx, 1);
      ctx.globalAlpha = a;

      // Disc body with a soft radial gold gradient.
      const grad = ctx.createRadialGradient(
        -p.size * 0.3,
        -p.size * 0.3,
        p.size * 0.1,
        0,
        0,
        p.size,
      );
      grad.addColorStop(0, "#fff6cf");
      grad.addColorStop(0.5, "#ffcf4d");
      grad.addColorStop(1, "#c8860f");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Rim.
      ctx.lineWidth = Math.max(1, p.size * 0.14);
      ctx.strokeStyle = "rgba(180, 120, 15, 0.9)";
      ctx.stroke();

      // Face glyph — "$" or a simple shine mark — only when reasonably front-on.
      if (sx > 0.45) {
        ctx.globalAlpha = a * Math.min(1, (sx - 0.45) / 0.4);
        if (p.dollar) {
          ctx.fillStyle = "#8a5a06";
          ctx.font = `bold ${Math.round(p.size * 1.3)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("$", 0, p.size * 0.06);
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = Math.max(1, p.size * 0.12);
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, -Math.PI * 0.85, -Math.PI * 0.15);
          ctx.stroke();
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function drawFlash(p: Particle, t: number): void {
      if (ctx === null) {
        return;
      }
      // Full-screen white bloom: fast punch-in, quick decay.
      const punch = t < 0.25 ? t / 0.25 : 1;
      const decay = 1 - t;
      const screenA = 0.55 * punch * decay;
      if (screenA > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${screenA})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Local electric bloom at the point.
      const r = p.size * (0.6 + t * 1.4);
      const localA = (1 - t) * 0.9;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `rgba(255, 255, 255, ${localA})`);
      g.addColorStop(0.4, `rgba(190, 220, 255, ${localA * 0.7})`);
      g.addColorStop(1, "rgba(150, 190, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Jagged lightning bolts radiating from the point.
      const boltA = (1 - t) * 0.85;
      if (boltA > 0.02) {
        ctx.strokeStyle = `rgba(226, 240, 255, ${boltA})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        const bolts = 4;
        for (let b = 0; b < bolts; b += 1) {
          const baseAng =
            (b / bolts) * Math.PI * 2 + p.phase * 0.017 + t * 1.5;
          const len = p.size * (1.1 + t * 0.6);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          let cx = p.x;
          let cy = p.y;
          const segs = 5;
          for (let s = 1; s <= segs; s += 1) {
            const frac = s / segs;
            const jitter = ((s * 928 + b * 337 + p.phase) % 40) - 20;
            const perpAng = baseAng + Math.PI / 2;
            cx =
              p.x +
              Math.cos(baseAng) * len * frac +
              Math.cos(perpAng) * jitter * (1 - frac);
            cy =
              p.y +
              Math.sin(baseAng) * len * frac +
              Math.sin(perpAng) * jitter * (1 - frac);
            ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        }
      }
    }

    /* ------------------------------ loop -------------------------------- */

    let rafId = 0;
    let last = performance.now();
    let ambientAccumulator = 0;

    function frame(now: number): void {
      if (ctx === null) {
        return;
      }
      let dt = (now - last) / 1000;
      last = now;
      // Clamp dt to avoid huge jumps after tab is backgrounded.
      if (dt > 0.05) {
        dt = 0.05;
      }

      // Top up ambient embers toward the target count over time.
      let ambientCount = 0;
      for (let i = 0; i < particles.length; i += 1) {
        if (particles[i].kind === "ember") {
          ambientCount += 1;
        }
      }
      ambientAccumulator += dt;
      const spawnInterval = 0.12;
      while (
        ambientAccumulator >= spawnInterval &&
        ambientCount < AMBIENT_TARGET
      ) {
        ambientAccumulator -= spawnInterval;
        spawnAmbientEmber(true);
        ambientCount += 1;
      }
      if (ambientAccumulator > spawnInterval) {
        ambientAccumulator = 0;
      }

      // Clear with additive-friendly compositing for glow.
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life += dt;
        const t = p.life / p.maxLife;
        if (t >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Integrate motion.
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;

        // Embers wobble sideways a touch as they rise.
        if (p.kind === "ember") {
          p.x += Math.sin(p.phase + p.life * 2) * 6 * dt;
        }

        // Coins draw with normal compositing so faces/glyphs read cleanly.
        if (p.kind === "coin") {
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.globalCompositeOperation = "lighter";
        }

        switch (p.kind) {
          case "ember":
            drawEmber(p, t);
            break;
          case "spark":
            drawSpark(p, t);
            break;
          case "coin":
            drawCoin(p, t);
            break;
          case "flash":
            drawFlash(p, t);
            break;
          default:
            break;
        }
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = window.requestAnimationFrame(frame);
    }

    rafId = window.requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      registry.coinShower = noopCoinShower;
      registry.lightningFlash = noopLightningFlash;
      registry.emberBurst = noopEmberBurst;
      particles.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
