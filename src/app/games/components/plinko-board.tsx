"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Difficulty, MULTIPLIERS } from "../../../interfaces/interface";
import { usePlinkoPhysics, getBucketBand } from "../../../hooks/usePlinkoPhysics";
import { useGameLoop } from "../../../hooks/useGameLoop";

export interface PlinkoBoardHandle {
  dropBall: (targetBucketIndex?: number) => void;
}

interface PlinkoBoardProps {
  rows: number;
  difficulty: Difficulty;
  betAmount: number;
  onBallLand: (bucketIndex: number, multiplier: number, payout: number) => void;
  activeBucketIndex: number | null;
}

const CANVAS_FONT = '"poppins", ui-sans-serif, system-ui, sans-serif';

/** Compact labels (many buckets × narrow canvas on mobile). */
function formatMultiplierLabel(mult: number): string {
  if (mult >= 1000) return `${Math.round(mult / 1000)}k`;
  if (mult >= 100) return String(Math.round(mult));
  if (mult % 1 === 0) return String(mult);
  return String(mult);
}

/** Keep text inside bucket; very small caps for dense rows. */
function fillBucketLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
) {
  let fontPx = Math.max(7, Math.min(Math.floor(maxWidth * 0.42), 13));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 6 && fontPx >= 7; i++) {
    ctx.font = `700 ${fontPx}px ${CANVAS_FONT}`;
    if (ctx.measureText(text).width <= maxWidth * 0.88) break;
    fontPx -= 1;
  }
  ctx.fillText(text, cx, cy);
}

const PlinkoBoard = forwardRef<PlinkoBoardHandle, PlinkoBoardProps>(
  ({ rows, difficulty, betAmount, onBallLand, activeBucketIndex }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const configRef = useRef({ rows, difficulty });
    const { ballsRef, pegsRef, bucketsRef, buildBoard, dropBall, step } = usePlinkoPhysics();
    const multipliers = MULTIPLIERS[difficulty][rows];

    configRef.current = { rows, difficulty };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      buildBoard(rows, canvas.width / dpr, canvas.height / dpr, multipliers);
    }, [rows, difficulty, buildBoard, multipliers]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      function applySize(cssW: number, cssH: number) {
        const dpr = window.devicePixelRatio || 1;
        canvas!.width = Math.round(cssW * dpr);
        canvas!.height = Math.round(cssH * dpr);
        canvas!.style.width = cssW + "px";
        canvas!.style.height = cssH + "px";
        buildBoard(
          configRef.current.rows,
          cssW,
          cssH,
          MULTIPLIERS[configRef.current.difficulty][configRef.current.rows],
        );
      }

      const resizeObserver = new ResizeObserver(() => {
        const parent = canvas.parentElement;
        if (!parent) return;
        applySize(parent.clientWidth, parent.clientHeight);
      });
      resizeObserver.observe(canvas.parentElement!);
      const parent = canvas.parentElement;
      if (parent) applySize(parent.clientWidth, parent.clientHeight);
      return () => resizeObserver.disconnect();
    }, [buildBoard, rows, multipliers]);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      // CSS dimensions (game coordinates live here)
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#1c1c1c";
      ctx.fillRect(0, 0, W, H);

      for (const peg of pegsRef.current) {
        if (peg.lit) {
          // Soft glow ring — no shadowBlur (too expensive on retina displays)
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, peg.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(200,162,255,0.18)";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fillStyle = peg.lit ? "#f5e9ff" : "rgba(200,162,255,0.35)";
        ctx.fill();
      }

      const buckets = bucketsRef.current;
      if (buckets.length > 0) {
        const first = buckets[0];
        const { top: bucketTop, size } = getBucketBand(H, first.width);
        const innerPad = 1;
        const innerSize = Math.max(0, size - innerPad * 2);
        const corner = Math.min(4, innerSize * 0.12);

        for (let i = 0; i < buckets.length; i++) {
          const b = buckets[i];
          const isActive = activeBucketIndex === i;
          const mult = multipliers[i];

          ctx.fillStyle = isActive ? lighten(getBucketColor(mult), 35) : getBucketColor(mult);
          roundRect(ctx, b.x + innerPad, bucketTop + innerPad, innerSize, innerSize, corner);
          ctx.fill();

          ctx.fillStyle = "#131212";
          fillBucketLabel(
            ctx,
            formatMultiplierLabel(mult),
            b.x + b.width / 2,
            bucketTop + innerPad + innerSize / 2,
            innerSize - 3,
          );
        }
      }

      for (const ball of ballsRef.current) {
        for (let t = 0; t < ball.trail.length; t++) {
          const alpha = (t / ball.trail.length) * 0.35;
          const r = ball.radius * (t / ball.trail.length) * 0.65;
          ctx.beginPath();
          ctx.arc(ball.trail[t].x, ball.trail[t].y, r, 0, Math.PI * 2);
          ctx.fillStyle =
            ball.color +
            Math.round(alpha * 255)
              .toString(16)
              .padStart(2, "0");
          ctx.fill();
        }

        const gradient = ctx.createRadialGradient(
          ball.x - ball.radius * 0.3,
          ball.y - ball.radius * 0.3,
          0,
          ball.x,
          ball.y,
          ball.radius,
        );
        gradient.addColorStop(0, "#f5e9ff");
        gradient.addColorStop(0.45, ball.color);
        gradient.addColorStop(1, darken(ball.color, 45));

        // Glow ring without shadowBlur
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,162,255,0.12)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.restore();
    }, [pegsRef, bucketsRef, ballsRef, multipliers, activeBucketIndex]);

    const tick = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      step(canvas.height / dpr, multipliers);
      draw();
    }, [step, draw, multipliers]);

    useGameLoop(tick, true);

    // One-shot redraw when bucket highlight changes (loop may be paused at that point)
    useEffect(() => { draw(); }, [activeBucketIndex, draw]);

    useImperativeHandle(
      ref,
      () => ({
        dropBall: (targetBucketIndex?: number) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const dpr = window.devicePixelRatio || 1;
          dropBall(canvas.width / dpr, configRef.current.difficulty, (bucketIdx, mult) => {
            const payout = betAmount * mult;
            onBallLand(bucketIdx, mult, payout);
          }, targetBucketIndex);
        },
      }),
      [dropBall, betAmount, onBallLand],
    );

    return <canvas ref={canvasRef} className="w-full h-full max-h-full block min-h-0" style={{ display: "block" }} />;
  },
);

PlinkoBoard.displayName = "PlinkoBoard";
export default PlinkoBoard;

function getBucketColor(mult: number): string {
  if (mult >= 50) return "#ff2020";
  if (mult >= 10) return "#ff6a00";
  if (mult >= 5) return "#ffa500";
  if (mult >= 2) return "#c8e645";
  if (mult >= 1) return "#7ec832";
  if (mult >= 0.5) return "#4caf50";
  return "#2d8c4e";
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
