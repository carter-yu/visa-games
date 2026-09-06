import type { Stars } from "./types";

export const TRACE_THRESHOLDS: Record<Stars, number> = {
  1: 0.32,
  2: 0.42,
  3: 0.52,
};

/** CSS-pixel corridor around the ghost line. A four-year-old wobble still counts. */
export const TRACE_TOLERANCE_PX: Record<Stars, number> = {
  1: 28,
  2: 20,
  3: 16,
};

export const SCRIBBLE_RATIO: Record<Stars, number> = {
  1: 6,
  2: 4,
  3: 3,
};

export type TraceEval = {
  hit: number;
  painted: number;
  scribble: boolean;
  success: boolean;
};

export function rasterizeCircle(
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  thickness: number,
): boolean[] {
  const mask = new Array<boolean>(width * height).fill(false);
  const inner = Math.max(0, radius - thickness / 2);
  const outer = radius + thickness / 2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d >= inner && d <= outer) {
        mask[y * width + x] = true;
      }
    }
  }
  return mask;
}

export function masksFromRgba(
  pathData: Uint8ClampedArray,
  inkData: Uint8ClampedArray,
  alphaThreshold = 12,
): { path: boolean[]; ink: boolean[] } | null {
  if (pathData.length !== inkData.length || pathData.length % 4 !== 0) {
    return null;
  }
  const n = pathData.length / 4;
  const path = new Array<boolean>(n);
  const ink = new Array<boolean>(n);
  for (let i = 0; i < n; i += 1) {
    path[i] = pathData[i * 4 + 3] > alphaThreshold;
    ink[i] = inkData[i * 4 + 3] > alphaThreshold;
  }
  return { path, ink };
}

function inkNearPathPixel(
  ink: boolean[],
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
): boolean {
  const r2 = radius * radius;
  const y0 = Math.max(0, y - radius);
  const y1 = Math.min(height - 1, y + radius);
  const x0 = Math.max(0, x - radius);
  const x1 = Math.min(width - 1, x + radius);
  for (let yy = y0; yy <= y1; yy += 1) {
    const dy = yy - y;
    for (let xx = x0; xx <= x1; xx += 1) {
      const dx = xx - x;
      if (dx * dx + dy * dy <= r2 && ink[yy * width + xx]) return true;
    }
  }
  return false;
}

export function evaluateTrace(args: {
  path: boolean[];
  ink: boolean[];
  stars: Stars;
  width?: number;
  height?: number;
  tolerancePx?: number;
  scribbleRatio?: number;
}): TraceEval {
  const fail: TraceEval = { hit: 0, painted: 0, scribble: false, success: false };
  if (!args.path.length || args.path.length !== args.ink.length) {
    return fail;
  }

  const width = args.width;
  const height =
    args.height ??
    (width && width > 0 && args.path.length % width === 0
      ? args.path.length / width
      : undefined);
  const radius = Math.max(
    0,
    Math.round(args.tolerancePx ?? (width ? TRACE_TOLERANCE_PX[args.stars] : 0)),
  );
  const useNeighborhood =
    Boolean(width && height && width * height === args.path.length && radius > 0);

  let pathCount = 0;
  let hitCount = 0;
  let paintedCount = 0;
  let offPath = 0;

  for (let i = 0; i < args.path.length; i += 1) {
    if (args.ink[i]) paintedCount += 1;
    if (!args.path[i]) continue;
    pathCount += 1;
    if (!useNeighborhood) {
      if (args.ink[i]) hitCount += 1;
      continue;
    }
    const x = i % width!;
    const y = Math.floor(i / width!);
    if (inkNearPathPixel(args.ink, width!, height!, x, y, radius)) {
      hitCount += 1;
    }
  }

  if (!useNeighborhood) {
    for (let i = 0; i < args.path.length; i += 1) {
      if (args.ink[i] && !args.path[i]) offPath += 1;
    }
  } else {
    const corridor = radius + Math.ceil(radius * 0.35);
    for (let i = 0; i < args.ink.length; i += 1) {
      if (!args.ink[i]) continue;
      const x = i % width!;
      const y = Math.floor(i / width!);
      if (!inkNearPathPixel(args.path, width!, height!, x, y, corridor)) {
        offPath += 1;
      }
    }
  }

  const hit = pathCount === 0 ? 0 : hitCount / pathCount;
  const ratio = args.scribbleRatio ?? SCRIBBLE_RATIO[args.stars];
  const scribble = pathCount > 0 && offPath > pathCount * ratio;
  const threshold = TRACE_THRESHOLDS[args.stars];
  const success = !scribble && hit >= threshold;
  return { hit, painted: paintedCount, scribble, success };
}
