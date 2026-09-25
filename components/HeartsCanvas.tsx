"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = ["#E07A95", "#7E9FE0", "#E3A15B", "#C58FD6"]; // rose, blue, amber, lilac

type Heart = {
  x: number;
  y: number;
  size: number;
  speed: number; // px per second
  wobbleAmp: number;
  wobbleFreq: number;
  phase: number;
  baseX: number;
  color: string;
  alpha: number;
  popAt: number; // y at which it pops
  rot: number;
};

type Pop = {
  x: number;
  y: number;
  color: string;
  alpha: number;
  t: number; // 0 → 1
  radius: number;
  particles: { angle: number; dist: number; r: number }[];
};

const POP_DURATION = 0.7; // seconds

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const SPRITE = 64; // px, drawn once per colour and scaled down with drawImage

function heartPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  // 32-unit heart centered on origin
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-2, 8, -16, 0, -16, -8);
  ctx.bezierCurveTo(-16, -14, -11, -17, -7, -17);
  ctx.bezierCurveTo(-3.5, -17, -1, -15, 0, -12);
  ctx.bezierCurveTo(1, -15, 3.5, -17, 7, -17);
  ctx.bezierCurveTo(11, -17, 16, -14, 16, -8);
  ctx.bezierCurveTo(16, 0, 2, 8, 0, 10);
  ctx.closePath();
}

/** Pre-render each heart colour to a small offscreen canvas; blitting is far cheaper than filling paths per frame. */
function makeSprites(): Map<string, HTMLCanvasElement> {
  const sprites = new Map<string, HTMLCanvasElement>();
  for (const color of COLORS) {
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE;
    const g = c.getContext("2d");
    if (!g) continue;
    g.translate(SPRITE / 2, SPRITE / 2 + 3);
    g.scale(SPRITE / 34, SPRITE / 34);
    g.fillStyle = color;
    heartPath(g);
    g.fill();
    sprites.set(color, c);
  }
  return sprites;
}

/**
 * Full-page decorative background of rising heart bubbles that pop.
 * Fixed behind all content, pointer-events: none, hidden from assistive tech,
 * and not rendered at all when the user prefers reduced motion.
 */
export function HeartsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    mq.addEventListener("change", update);

    // Defer the animation until the page has loaded and gone idle, so it never competes with first paint.
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(update, { timeout: 2500 });
      } else {
        timer = window.setTimeout(update, 1200);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprites = makeSprites();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let hearts: Heart[] = [];
    let pops: Pop[] = [];
    let raf = 0;
    let last = performance.now();

    const targetCount = () => (window.innerWidth < 768 ? 16 : 28);

    const spawn = (initial: boolean): Heart => {
      const size = rand(14, 30);
      const x = rand(0, width);
      return {
        x,
        baseX: x,
        y: initial ? rand(height * 0.1, height + size) : height + size + rand(0, 80),
        size,
        speed: rand(18, 40),
        wobbleAmp: rand(6, 18),
        wobbleFreq: rand(0.4, 0.9),
        phase: rand(0, Math.PI * 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: rand(0.35, 0.55),
        popAt: rand(height * 0.05, height * 0.6),
        rot: rand(-0.2, 0.2),
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = targetCount();
      if (hearts.length > n) hearts = hearts.slice(0, n);
      while (hearts.length < n) hearts.push(spawn(true));
      for (const h of hearts) {
        if (h.baseX > width) h.baseX = rand(0, width);
        if (h.popAt > height) h.popAt = rand(height * 0.05, height * 0.6);
      }
    };

    const makePop = (h: Heart): Pop => ({
      x: h.x,
      y: h.y,
      color: h.color,
      alpha: h.alpha,
      t: 0,
      radius: h.size * 0.6,
      particles: Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2 + rand(-0.25, 0.25),
        dist: h.size * rand(0.9, 1.4),
        r: rand(1.2, 2.2),
      })),
    });

    const frame = (now: number) => {
      // clamp dt so a backgrounded tab doesn't teleport everything
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        h.y -= h.speed * dt;
        h.phase += h.wobbleFreq * dt * Math.PI * 2;
        h.x = h.baseX + Math.sin(h.phase) * h.wobbleAmp;

        if (h.y <= h.popAt) {
          pops.push(makePop(h));
          hearts[i] = spawn(false);
          continue;
        }

        const sprite = sprites.get(h.color);
        if (!sprite) continue;
        const rot = h.rot + Math.sin(h.phase) * 0.08;
        ctx.globalAlpha = h.alpha;
        const cos = Math.cos(rot) * dpr;
        const sin = Math.sin(rot) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, dpr * h.x, dpr * h.y);
        ctx.drawImage(sprite, -h.size / 2, -h.size / 2, h.size, h.size);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const p of pops) {
        p.t += dt / POP_DURATION;
        const e = 1 - Math.pow(1 - Math.min(p.t, 1), 3); // easeOutCubic
        const fade = p.alpha * (1 - Math.min(p.t, 1));

        ctx.globalAlpha = fade;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + e * p.radius * 1.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = p.color;
        for (const pt of p.particles) {
          const d = e * pt.dist + p.radius;
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(pt.angle) * d, p.y + Math.sin(pt.angle) * d, pt.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      pops = pops.filter((p) => p.t < 1);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full motion-safe:animate-[fadein_1.2s_ease-out]"
    />
  );
}
