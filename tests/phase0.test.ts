import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateConnectStroke } from "../src/lib/connect";
import {
  initialState,
  reduce,
  type AppState,
} from "../src/lib/machine";
import { PIN_LOCKOUT_MS, pinsMatch, recordPinAttempt } from "../src/lib/pin";
import type { HistoryItem, PlaySession, Task } from "../src/lib/types";
import {
  evaluateTrace,
  rasterizeCircle,
  TRACE_THRESHOLDS,
} from "../src/lib/trace";
import { visaMinutes } from "../src/lib/visa";
import { parseYoutubeId } from "../src/lib/youtube";

const NOW = 1_700_000_000_000;

const traceTask: Task = {
  id: "trace-circle-1",
  type: "trace",
  stars: 1,
  titleZh: "描圓",
  titleEn: "Trace a circle",
  glyph: { kind: "shape", shape: "circle" },
};

const connectTask: Task = {
  id: "connect-fruit-1",
  type: "connect",
  stars: 1,
  titleZh: "連連看",
  titleEn: "Connect",
  pairs: [
    { id: "apple", picture: "🍎", zh: "蘋果", en: "apple" },
    { id: "cat", picture: "🐱", zh: "貓", en: "cat" },
  ],
};

function pickTrace(state: AppState = initialState): AppState {
  return reduce(state, {
    type: "pick-card",
    stars: 1,
    task: traceTask,
    correlationId: "corr-1",
  });
}

function pickConnect(state: AppState = initialState): AppState {
  return reduce(state, {
    type: "pick-card",
    stars: 1,
    task: connectTask,
    correlationId: "corr-2",
  });
}

describe("P1 trace circle with enough coverage", () => {
  it("hit >= threshold[1] → success", () => {
    const path = rasterizeCircle(64, 64, 32, 32, 20, 4);
    const ink = rasterizeCircle(64, 64, 32, 32, 20, 4);
    const result = evaluateTrace({ path, ink, stars: 1 });
    expect(result.hit).toBeGreaterThanOrEqual(TRACE_THRESHOLDS[1]);
    expect(result.scribble).toBe(false);
    expect(result.success).toBe(true);
  });

  it("a wobbly offset stroke still succeeds with kindergarten tolerance", () => {
    const path = rasterizeCircle(64, 64, 32, 32, 20, 3);
    const ink = rasterizeCircle(64, 64, 36, 32, 20, 3);
    const result = evaluateTrace({
      path,
      ink,
      stars: 1,
      width: 64,
      height: 64,
      tolerancePx: 8,
    });
    expect(result.success).toBe(true);
    expect(result.scribble).toBe(false);
  });
});

describe("P2 empty canvas 完成", () => {
  it("is not success and does not auto-teach on the first fail", () => {
    const empty = evaluateTrace({
      path: rasterizeCircle(32, 32, 16, 16, 10, 3),
      ink: new Array(32 * 32).fill(false),
      stars: 1,
    });
    expect(empty.success).toBe(false);
    expect(empty.painted).toBe(0);

    let state = pickTrace();
    state = reduce(state, {
      type: "trace-complete",
      result: empty,
    });
    expect(state.phase).toBe("task");
    expect(state.task?.showTeach).toBe(false);
    expect(state.task?.failCount).toBe(1);

    state = reduce(state, {
      type: "trace-complete",
      result: empty,
    });
    expect(state.phase).toBe("task");
    expect(state.task?.failCount).toBe(2);
    expect(state.task?.showTeach).toBe(true);
  });
});

describe("P3 scribble >> path pixels", () => {
  it("is a scribble failure, not success", () => {
    const path = rasterizeCircle(64, 64, 32, 32, 18, 3);
    const ink = new Array(64 * 64).fill(true);
    const result = evaluateTrace({ path, ink, stars: 1 });
    expect(result.scribble).toBe(true);
    expect(result.success).toBe(false);
  });
});

describe("P4 connect stroke picture → correct word", () => {
  it("locks the pair", () => {
    const pictures = [
      { id: "apple", pairId: "apple", x: 0, y: 0, w: 40, h: 40 },
      { id: "cat", pairId: "cat", x: 0, y: 60, w: 40, h: 40 },
    ];
    const words = [
      { id: "apple-zh", pairId: "apple", x: 120, y: 0, w: 50, h: 40 },
      { id: "cat-zh", pairId: "cat", x: 120, y: 60, w: 50, h: 40 },
    ];
    const stroke = [
      { x: 10, y: 10 },
      { x: 80, y: 10 },
      { x: 140, y: 12 },
    ];
    const evalResult = evaluateConnectStroke({
      stroke,
      pictures,
      words,
      lockedPairIds: [],
    });
    expect(evalResult.locked).toBe("apple");
    expect(evalResult.rejected).toBe(false);

    let state = pickConnect();
    state = reduce(state, {
      type: "connect-stroke",
      locked: evalResult.locked,
      rejected: evalResult.rejected,
      attemptDelta: evalResult.attemptDelta,
      pairCount: 2,
    });
    expect(state.task?.lockedPairIds).toContain("apple");
    expect(state.phase).toBe("task");
  });
});

describe("P5 connect stroke picture → wrong word", () => {
  it("rejects the pair and increments attempt", () => {
    const pictures = [
      { id: "apple", pairId: "apple", x: 0, y: 0, w: 40, h: 40 },
      { id: "cat", pairId: "cat", x: 0, y: 60, w: 40, h: 40 },
    ];
    const words = [
      { id: "apple-zh", pairId: "apple", x: 120, y: 0, w: 50, h: 40 },
      { id: "cat-zh", pairId: "cat", x: 120, y: 60, w: 50, h: 40 },
    ];
    const stroke = [
      { x: 10, y: 10 },
      { x: 140, y: 80 },
    ];
    const evalResult = evaluateConnectStroke({
      stroke,
      pictures,
      words,
      lockedPairIds: [],
    });
    expect(evalResult.locked).toBeNull();
    expect(evalResult.rejected).toBe(true);
    expect(evalResult.attemptDelta).toBe(1);

    let state = pickConnect();
    state = reduce(state, {
      type: "connect-stroke",
      locked: evalResult.locked,
      rejected: evalResult.rejected,
      attemptDelta: evalResult.attemptDelta,
      pairCount: 2,
    });
    expect(state.task?.lockedPairIds).toEqual([]);
    expect(state.task?.connectAttempts).toBe(1);
  });
});

describe("P6 help used", () => {
  it("minutes = duration − penalty, min 1", () => {
    expect(visaMinutes(10, true, 3, 1)).toBe(7);
    expect(visaMinutes(2, true, 3, 1)).toBe(1);
    expect(visaMinutes(10, false, 3, 1)).toBe(10);

    let state = pickTrace();
    state = reduce(state, { type: "use-help" });
    state = reduce(state, { type: "finish-with-help" });
    expect(state.phase).toBe("result");
    expect(state.task?.helpUsed).toBe(true);
    state = reduce(state, { type: "stamp-visa", now: NOW, id: "hist-1" });
    expect(state.play?.minutes).toBe(7);
  });
});

describe("P7 endsAt in the past", () => {
  it("moves phase to lock and clears play", () => {
    const playing: AppState = {
      ...initialState,
      phase: "play",
      settings: { ...initialState.settings, pinHash: "hashed" },
      play: {
        endsAt: NOW - 1,
        minutes: 10,
        stars: 1,
        taskId: "trace-circle-1",
        helpUsed: false,
      },
    };
    const next = reduce(playing, { type: "tick", now: NOW });
    expect(next.phase).toBe("lock");
    expect(next.play).toBeNull();
  });
});

describe("P8 parseYoutubeId garbage", () => {
  it("returns null and does not throw", () => {
    expect(() => parseYoutubeId("")).not.toThrow();
    expect(parseYoutubeId("")).toBeNull();
    expect(parseYoutubeId("not a url")).toBeNull();
    expect(parseYoutubeId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeId("::::")).toBeNull();
    expect(parseYoutubeId("https://example.com/watch?v=nope")).toBeNull();
    expect(parseYoutubeId(null)).toBeNull();
    expect(parseYoutubeId(undefined)).toBeNull();
    expect(parseYoutubeId(42)).toBeNull();
    expect(parseYoutubeId("https://www.youtube.com/watch?v=abcdefghijk")).toBe(
      "abcdefghijk",
    );
  });
});

describe("P9 PIN 4 digits match / mismatch and lockout", () => {
  it("returns boolean match and sets lockout on the 5th fail", () => {
    expect(pinsMatch("1234", "1234")).toBe(true);
    expect(pinsMatch("1234", "0000")).toBe(false);
    expect(pinsMatch("12", "12")).toBe(false);
    expect(pinsMatch("12345", "12345")).toBe(false);
    expect(pinsMatch("12ab", "12ab")).toBe(false);

    let pin = recordPinAttempt({
      ok: false,
      fails: 0,
      lockoutUntil: null,
      now: NOW,
    });
    expect(pin.lockoutUntil).toBeNull();
    expect(pin.ok).toBe(false);
    for (let i = 0; i < 3; i += 1) {
      pin = recordPinAttempt({
        ok: false,
        fails: pin.fails,
        lockoutUntil: pin.lockoutUntil,
        now: NOW,
      });
      expect(pin.lockoutUntil).toBeNull();
      expect(pin.ok).toBe(false);
    }
    pin = recordPinAttempt({
      ok: false,
      fails: pin.fails,
      lockoutUntil: pin.lockoutUntil,
      now: NOW,
    });
    expect(pin.fails).toBe(5);
    expect(pin.lockoutUntil).toBe(NOW + PIN_LOCKOUT_MS);
  });
});

describe("contracts", () => {
  it("Task, PlaySession, HistoryItem expose documented fields", () => {
    const task: Task = traceTask;
    expect(task).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        type: expect.any(String),
        stars: expect.any(Number),
        titleZh: expect.any(String),
        titleEn: expect.any(String),
      }),
    );

    const play: PlaySession = {
      endsAt: NOW + 60_000,
      minutes: 10,
      stars: 1,
      taskId: task.id,
      helpUsed: false,
    };
    expect(play).toEqual(
      expect.objectContaining({
        endsAt: expect.any(Number),
        minutes: expect.any(Number),
        stars: expect.any(Number),
        taskId: expect.any(String),
        helpUsed: expect.any(Boolean),
      }),
    );

    const history: HistoryItem = {
      id: "h1",
      at: NOW,
      stars: 1,
      taskTitle: `${task.titleZh} / ${task.titleEn}`,
      help: false,
      minutes: 10,
    };
    expect(history).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        at: expect.any(Number),
        stars: expect.any(Number),
        taskTitle: expect.any(String),
        help: expect.any(Boolean),
        minutes: expect.any(Number),
      }),
    );
  });
});

describe("child path has zero text inputs", () => {
  it("lock, task, result, play, pin pad, coach, teach have no input/textarea", () => {
    const files = [
      "src/components/lock-screen.tsx",
      "src/components/trace-task.tsx",
      "src/components/connect-task.tsx",
      "src/components/result-screen.tsx",
      "src/components/play-time.tsx",
      "src/components/teach-overlay.tsx",
      "src/components/coach-mark.tsx",
      "src/components/pin-pad.tsx",
    ];
    for (const file of files) {
      const src = readFileSync(resolve(file), "utf8");
      expect(src, file).not.toMatch(/<input[\s>]/);
      expect(src, file).not.toMatch(/<textarea[\s>]/);
    }
  });
});

describe("garbage input does not crash", () => {
  it("empty connect stroke is a no-op", () => {
    const result = evaluateConnectStroke({
      stroke: [],
      pictures: [],
      words: [],
      lockedPairIds: [],
    });
    expect(result.locked).toBeNull();
    expect(result.rejected).toBe(false);
    expect(result.attemptDelta).toBe(0);
  });

  it("mismatched trace masks return controlled failure", () => {
    const result = evaluateTrace({
      path: [true],
      ink: [],
      stars: 1,
    });
    expect(result.success).toBe(false);
    expect(result.hit).toBe(0);
  });
});
