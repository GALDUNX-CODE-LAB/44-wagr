"use client";

import { useRef, useCallback } from "react";
import { Ball, Bucket, Difficulty, DIFFICULTY_BIAS, Peg } from "../interfaces/interface";

const GRAVITY = 0.45;
const DAMPING = 0.58;
const FRICTION = 0.995;
const BALL_RADIUS_BASE = 5;
const PEG_RADIUS_BASE = 4;
const PASSAGE_EDGE_CLEARANCE_PX = 2;

const BALL_COLOR = "#c8a2ff";

export const PLINKO_BUCKET_BOTTOM_PAD_RATIO = 0.02;

export function getBucketBand(canvasHeight: number, bucketWidth: number) {
  const size = bucketWidth;
  const top = canvasHeight - size - canvasHeight * PLINKO_BUCKET_BOTTOM_PAD_RATIO;
  return { top, size };
}

/**
 * Generates a valid left/right path (true = right) that sums to exactly
 * `bucketIndex` right-turns across `rows` rows. Uses a weighted-random
 * approach so every run looks different while always landing in the same bucket.
 */
function generatePath(bucketIndex: number, rows: number): boolean[] {
  const path: boolean[] = [];
  let rightsLeft = bucketIndex;
  for (let i = 0; i < rows; i++) {
    const stepsLeft = rows - i;
    const goRight = Math.random() < rightsLeft / stepsLeft;
    path.push(goRight);
    if (goRight) rightsLeft--;
  }
  return path;
}

export function usePlinkoPhysics() {
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const bucketsRef = useRef<Bucket[]>([]);
  const ballRadiusRef = useRef(BALL_RADIUS_BASE);

  const buildBoard = useCallback((rows: number, canvasWidth: number, canvasHeight: number, multipliers: number[]) => {
    const pegs: Peg[] = [];
    const topPadding = canvasHeight * 0.06;
    const bottomPadding = canvasHeight * 0.14;
    const usableHeight = canvasHeight - topPadding - bottomPadding;
    const rowSpacing = usableHeight / rows;

    let minCenterSpacing = Infinity;
    for (let row = 0; row < rows; row++) {
      const cols = row + 3;
      const spacing = Math.min(canvasWidth / (cols + 1), rowSpacing * 1.1);
      minCenterSpacing = Math.min(minCenterSpacing, spacing);
    }

    const minCenterForPassage = 2 * PEG_RADIUS_BASE + 2 * BALL_RADIUS_BASE + PASSAGE_EDGE_CLEARANCE_PX;
    const physicsScale = Math.min(1, minCenterSpacing / minCenterForPassage);
    const pegRadius = PEG_RADIUS_BASE * physicsScale;
    const ballRadius = BALL_RADIUS_BASE * physicsScale;
    ballRadiusRef.current = ballRadius;

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
          radius: pegRadius,
          lit: false,
          litTimer: 0,
          row,        // ← row index used for path lookup
        });
      }
    }

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
    (
      canvasWidth: number,
      difficulty: Difficulty,
      onLand: (bucketIndex: number, multiplier: number) => void,
      targetBucketIndex?: number,
    ) => {
      const id = `ball-${Date.now()}-${Math.random()}`;

      // Derive total rows from peg structure (last peg row = max row value)
      const rows = pegsRef.current.length > 0
        ? pegsRef.current[pegsRef.current.length - 1].row + 1
        : 16;

      const ball: Ball = {
        id,
        x: canvasWidth / 2 + (Math.random() - 0.5) * 4,
        y: 8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 1,
        radius: ballRadiusRef.current,
        active: true,
        trail: [],
        color: BALL_COLOR,
        landed: false,
      };

      ball._onLand = onLand;
      ball._difficulty = difficulty;
      ball._targetBucketIndex = targetBucketIndex;

      // Pre-compute the path so each peg collision goes in the right direction
      if (targetBucketIndex !== undefined) {
        ball._path = generatePath(targetBucketIndex, rows);
        ball._lastRow = -1;
      }

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

      // Sub-visual safety drift only — kinematic targeting does the real work
      if (ball._targetBucketIndex !== undefined && buckets[ball._targetBucketIndex]) {
        const tb = buckets[ball._targetBucketIndex];
        ball.vx += (tb.x + tb.width / 2 - ball.x) * 0.0015;
      }

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
          const preVy = ball.vy; // capture before reflection changes it

          ball.vx = (ball.vx - 2 * dot * nx) * DAMPING;
          ball.vy = (ball.vy - 2 * dot * ny) * DAMPING;

          if (ball._path && peg.row > (ball._lastRow ?? -1) && preVy > 0) {
            ball._lastRow = peg.row;
            const goRight = ball._path[peg.row];

            const nextRowPegs = pegs
              .filter(p => p.row === peg.row + 1)
              .sort((a, b) => a.x - b.x);
            const targetPeg = goRight
              ? nextRowPegs.find(p => p.x > peg.x)
              : [...nextRowPegs].reverse().find(p => p.x < peg.x);

            if (targetPeg) {
              // Compute exact vx needed to reach targetPeg under gravity + friction.
              // Solve: 0 = 0.5*G*t^2 + vy0*t - tdy  →  t = (-vy0 + sqrt(vy0²+2G·tdy)) / G
              const tdx = targetPeg.x - ball.x;
              const tdy = Math.max(6, targetPeg.y - ball.y);
              const vy0 = Math.max(0, ball.vy); // post-reflection; 0 if bounced upward
              const disc = vy0 * vy0 + 2 * GRAVITY * tdy;
              const tFrames = Math.max(4, (-vy0 + Math.sqrt(disc)) / GRAVITY);
              // x-displacement with friction: dx = vx0 * (1 - FRICTION^n) / (1 - FRICTION)
              const fSum = Math.max(1, (1 - Math.pow(FRICTION, tFrames)) / (1 - FRICTION));
              ball.vx = tdx / fSum + (Math.random() - 0.5) * 0.12;
            } else {
              // Last peg row — aim kinematically at the target bucket centre
              const tb = ball._targetBucketIndex !== undefined ? buckets[ball._targetBucketIndex] : null;
              if (tb) {
                const tdx = (tb.x + tb.width / 2) - ball.x;
                const tdy = Math.max(6, canvasHeight - peg.y);
                const vy0 = Math.max(0, ball.vy);
                const disc = vy0 * vy0 + 2 * GRAVITY * tdy;
                const tFrames = Math.max(4, (-vy0 + Math.sqrt(disc)) / GRAVITY);
                const fSum = Math.max(1, (1 - Math.pow(FRICTION, tFrames)) / (1 - FRICTION));
                ball.vx = tdx / fSum + (Math.random() - 0.5) * 0.12;
              } else {
                ball.vx = (goRight ? 1 : -1) * 1.2;
              }
            }
          } else if (!ball._path) {
            const bias = DIFFICULTY_BIAS[ball._difficulty || "medium"];
            ball.vx += (Math.random() - 0.5) * bias * 4;
          }

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

      if (band && ball.y >= band.top && ball.y <= band.top + band.size && buckets.length > 0) {
        let landIndex = -1;
        for (let i = 0; i < buckets.length; i++) {
          const b = buckets[i];
          if (ball.x >= b.x && ball.x <= b.x + b.width) {
            landIndex = i;
            break;
          }
        }
        if (landIndex >= 0) {
          ball.landed = true;
          ball.active = false;
          if (ball._onLand) ball._onLand(landIndex, multipliers[landIndex]);
          balls.splice(bi, 1);
        } else if (ball._targetBucketIndex !== undefined) {
          // Ball in bucket zone but x didn't align — force the server-correct bucket
          ball.landed = true;
          ball.active = false;
          if (ball._onLand) ball._onLand(ball._targetBucketIndex, multipliers[ball._targetBucketIndex]);
          balls.splice(bi, 1);
        }
      } else if (buckets.length > 0 && ball.y > canvasHeight) {
        // Off-canvas fallback — use target if available, else closest by x
        let fallback = ball._targetBucketIndex ?? 0;
        if (ball._targetBucketIndex === undefined) {
          let minD = Infinity;
          for (let i = 0; i < buckets.length; i++) {
            const cx = buckets[i].x + buckets[i].width / 2;
            const d = Math.abs(ball.x - cx);
            if (d < minD) { minD = d; fallback = i; }
          }
        }
        ball.landed = true;
        ball.active = false;
        if (ball._onLand) ball._onLand(fallback, multipliers[fallback]);
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
