"use client";

import { useRef, useCallback } from "react";
import { Ball, Bucket, Difficulty, DIFFICULTY_BIAS, Peg } from "../interfaces/interface";

const GRAVITY = 0.35;
const DAMPING = 0.58;
const FRICTION = 0.995;
const BALL_RADIUS = 5;
const PEG_RADIUS = 4;

/** App primary purple (`--color-primary`) */
const BALL_COLOR = "#c8a2ff";

/** Padding under bucket row; must match canvas draw (`plinko-board`). */
export const PLINKO_BUCKET_BOTTOM_PAD_RATIO = 0.02;

/** Buckets are square (height === width). Shared layout for draw + hit testing. */
export function getBucketBand(canvasHeight: number, bucketWidth: number) {
  const size = bucketWidth;
  const top = canvasHeight - size - canvasHeight * PLINKO_BUCKET_BOTTOM_PAD_RATIO;
  return { top, size };
}

export function usePlinkoPhysics() {
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const bucketsRef = useRef<Bucket[]>([]);

  const buildBoard = useCallback((rows: number, canvasWidth: number, canvasHeight: number, multipliers: number[]) => {
    const pegs: Peg[] = [];
    const topPadding = canvasHeight * 0.06;
    const bottomPadding = canvasHeight * 0.14;
    const usableHeight = canvasHeight - topPadding - bottomPadding;
    const rowSpacing = usableHeight / rows;

    for (let row = 0; row < rows; row++) {
      const cols = row + 3;
      const spacing = Math.min(canvasWidth / (cols + 1), rowSpacing * 1.1);
      const totalWidth = (cols - 1) * spacing;
      const startX = (canvasWidth - totalWidth) / 2;
      const y = topPadding + row * rowSpacing + rowSpacing / 2;

      for (let col = 0; col < cols; col++) {
        pegs.push({
          x: startX + col * spacing,
          y,
          radius: PEG_RADIUS,
          lit: false,
          litTimer: 0,
        });
      }
    }

    // Buckets align to gaps between pegs on the bottom row (same geometry as last peg row).
    const lastRowIndex = rows - 1;
    const colsLast = lastRowIndex + 3;
    const spacingLast = Math.min(canvasWidth / (colsLast + 1), rowSpacing * 1.1);
    const totalWidthLast = (colsLast - 1) * spacingLast;
    const startXLast = (canvasWidth - totalWidthLast) / 2;

    const buckets: Bucket[] = multipliers.map((mult, i) => {
      const centerX = startXLast + (i + 0.5) * spacingLast;
      const bucketWidth = spacingLast;
      return {
        x: centerX - bucketWidth / 2,
        width: bucketWidth,
        multiplier: mult,
        color: getBucketColor(mult),
      };
    });

    pegsRef.current = pegs;
    bucketsRef.current = buckets;
    ballsRef.current = [];

    return { pegs, buckets };
  }, []);

  const dropBall = useCallback(
    (canvasWidth: number, difficulty: Difficulty, onLand: (bucketIndex: number, multiplier: number) => void) => {
      const id = `ball-${Date.now()}-${Math.random()}`;

      const ball: Ball = {
        id,
        x: canvasWidth / 2 + (Math.random() - 0.5) * 4,
        y: 8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 1,
        radius: BALL_RADIUS,
        active: true,
        trail: [],
        color: BALL_COLOR,
        landed: false,
      };

      ball._onLand = onLand;
      ball._difficulty = difficulty;

      ballsRef.current.push(ball);
      return id;
    },
    [],
  );

  const step = useCallback((canvasHeight: number, multipliers: number[]) => {
    const pegs = pegsRef.current;
    const buckets = bucketsRef.current;
    const balls = ballsRef.current;

    for (const peg of pegs) {
      if (peg.lit) {
        peg.litTimer--;
        if (peg.litTimer <= 0) peg.lit = false;
      }
    }

    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const ball = balls[bi];
      if (!ball.active || ball.landed) continue;

      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) ball.trail.shift();

      ball.vy += GRAVITY;
      ball.vx *= FRICTION;
      ball.x += ball.vx;
      ball.y += ball.vy;

      for (const peg of pegs) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + peg.radius;

        if (dist < minDist) {
          peg.lit = true;
          peg.litTimer = 8;

          const nx = dx / dist;
          const ny = dy / dist;
          const dot = ball.vx * nx + ball.vy * ny;

          ball.vx = (ball.vx - 2 * dot * nx) * DAMPING;
          ball.vy = (ball.vy - 2 * dot * ny) * DAMPING;

          const bias = DIFFICULTY_BIAS[ball._difficulty || "medium"];
          ball.vx += (Math.random() - 0.5) * bias * 4;
          if (ball.vy < 0.5) ball.vy = 0.5;

          const overlap = minDist - dist + 0.5;
          ball.x += nx * overlap;
          ball.y += ny * overlap;
        }
      }

      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * DAMPING;
      }
      if (ball.x + ball.radius > bucketsRef.current.reduce((acc, b) => Math.max(acc, b.x + b.width), 0)) {
        const maxX = bucketsRef.current.reduce((acc, b) => Math.max(acc, b.x + b.width), 800);
        ball.x = maxX - ball.radius;
        ball.vx = -Math.abs(ball.vx) * DAMPING;
      }

      const band = buckets.length > 0 ? getBucketBand(canvasHeight, buckets[0].width) : null;
      if (
        band &&
        ball.y >= band.top &&
        ball.y <= band.top + band.size &&
        buckets.length > 0
      ) {
        for (let i = 0; i < buckets.length; i++) {
          const b = buckets[i];
          if (ball.x >= b.x && ball.x <= b.x + b.width) {
            ball.landed = true;
            ball.bucketIndex = i;
            ball.active = false;
            if (ball._onLand) {
              ball._onLand(i, multipliers[i]);
            }
            balls.splice(bi, 1);
            break;
          }
        }
      } else if (buckets.length > 0 && ball.y > canvasHeight) {
        let closest = 0;
        let minDist2 = Infinity;
        for (let i = 0; i < buckets.length; i++) {
          const cx = buckets[i].x + buckets[i].width / 2;
          const d = Math.abs(ball.x - cx);
          if (d < minDist2) {
            minDist2 = d;
            closest = i;
          }
        }
        ball.landed = true;
        ball.bucketIndex = closest;
        ball.active = false;
        if (ball._onLand) ball._onLand(closest, multipliers[closest]);
        balls.splice(bi, 1);
      }
    }
  }, []);

  return { ballsRef, pegsRef, bucketsRef, buildBoard, dropBall, step };
}

function getBucketColor(mult: number): string {
  if (mult >= 50) return "#ff2d2d";
  if (mult >= 10) return "#ff6b1a";
  if (mult >= 5) return "#ffa500";
  if (mult >= 2) return "#c8e645";
  if (mult >= 1) return "#7ec832";
  if (mult >= 0.5) return "#4caf50";
  return "#2d8c4e";
}

