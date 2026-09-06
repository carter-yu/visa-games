import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { HitRect, Point } from "./connect";
import { evaluateConnectStroke } from "./connect";
import { childNameMeta, log } from "./log";
import {
  initialState,
  PERSIST_KEY,
  reduce,
  type AppState,
} from "./machine";
import { hashPin, pinsMatch, recordPinAttempt } from "./pin";
import { pickTask } from "./tasks";
import type { TraceEval } from "./trace";
import type { Settings, Stars } from "./types";
import { parseYoutubeId } from "./youtube";

export type PinTry = "ok" | "fail" | "lockout" | "mismatch";

type Actions = {
  tick: (now?: number) => void;
  completeSetup: (
    pin: string,
    confirm: string,
    childName: string,
  ) => Promise<PinTry>;
  pickCard: (stars: Stars) => void;
  submitTrace: (result: TraceEval) => void;
  submitConnectStroke: (
    stroke: Point[],
    pictures: HitRect[],
    words: HitRect[],
  ) => void;
  useHelp: () => void;
  dismissTeach: () => void;
  finishWithHelp: () => void;
  stampVisa: () => void;
  lockNow: () => void;
  tryPin: (pin: string) => Promise<PinTry>;
  closeAdmin: () => void;
  emergencyGrant: (minutes: number) => void;
  addYoutube: (raw: string, label?: string) => string | null;
  removeYoutube: (id: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  clearHistory: () => void;
};

export type Store = AppState & Actions;

function dataOf(s: Store): AppState {
  return {
    phase: s.phase,
    settings: s.settings,
    task: s.task,
    play: s.play,
    history: s.history,
    pin: s.pin,
    correlationId: s.correlationId,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeStorage(): StateStorage {
  try {
    const probe = "visa-games-ls-probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (name) => mem.get(name) ?? null,
      setItem: (name, value) => {
        mem.set(name, value);
      },
      removeItem: (name) => {
        mem.delete(name);
      },
    };
  }
}

export const useApp = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      tick: (now = Date.now()) => {
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "tick", now }) }));
      },

      completeSetup: async (pin, confirm, childName) => {
        if (!pinsMatch(pin, confirm)) return "mismatch";
        const pinHash = await hashPin(pin);
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), {
            type: "setup-complete",
            pinHash,
            childName: childName.trim(),
          }),
        }));
        log({
          level: "info",
          component: "setup",
          event: "pin_set",
          outcome: "success",
          child: childNameMeta(childName.trim()),
        });
        return "ok";
      },

      pickCard: (stars) => {
        const task = pickTask(stars);
        const correlationId = newId();
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), {
            type: "pick-card",
            stars,
            task,
            correlationId,
          }),
        }));
        log({
          level: "info",
          component: "card-table",
          event: "pick",
          outcome: "success",
          correlation_id: correlationId,
          stars,
          task_type: task.type,
        });
      },

      submitTrace: (result) => {
        const before = get();
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), { type: "trace-complete", result }),
        }));
        log({
          level: result.success ? "info" : "warn",
          component: "trace",
          event: result.scribble ? "scribble" : "complete",
          outcome: result.success ? "success" : "failure",
          correlation_id: before.correlationId,
          hit: Number(result.hit.toFixed(3)),
          painted: result.painted,
        });
      },

      submitConnectStroke: (stroke, pictures, words) => {
        const before = get();
        const lockedPairIds = before.task?.lockedPairIds ?? [];
        const evalResult = evaluateConnectStroke({
          stroke,
          pictures,
          words,
          lockedPairIds,
        });
        const pairCount =
          before.task?.task.type === "connect" ? before.task.task.pairs.length : 0;
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), {
            type: "connect-stroke",
            locked: evalResult.locked,
            rejected: evalResult.rejected,
            attemptDelta: evalResult.attemptDelta,
            pairCount,
          }),
        }));
        if (evalResult.locked || evalResult.rejected) {
          log({
            level: evalResult.rejected ? "warn" : "info",
            component: "connect",
            event: "stroke",
            outcome: evalResult.rejected ? "failure" : "success",
            correlation_id: before.correlationId,
          });
        }
      },

      useHelp: () => {
        log({
          level: "info",
          component: "teacher",
          event: "help",
          outcome: "success",
          correlation_id: get().correlationId,
        });
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "use-help" }) }));
      },

      dismissTeach: () => {
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "dismiss-teach" }) }));
      },

      finishWithHelp: () => {
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "finish-with-help" }) }));
      },

      stampVisa: () => {
        const now = Date.now();
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), { type: "stamp-visa", now, id: newId() }),
        }));
        const play = get().play;
        log({
          level: "info",
          component: "visa",
          event: "stamp",
          outcome: "success",
          correlation_id: get().correlationId,
          minutes: play?.minutes,
          help: play?.helpUsed,
        });
      },

      lockNow: () => {
        log({
          level: "info",
          component: "parent-gate",
          event: "lock_now",
          outcome: "success",
        });
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "lock-now" }) }));
      },

      tryPin: async (pin) => {
        const now = Date.now();
        const current = get();
        const gated = recordPinAttempt({
          ok: false,
          fails: current.pin.fails,
          lockoutUntil: current.pin.lockoutUntil,
          now,
        });
        if (current.pin.lockoutUntil != null && now < current.pin.lockoutUntil) {
          return "lockout";
        }
        const hash = await hashPin(pin);
        const ok = hash === current.settings.pinHash;
        if (ok) {
          set((s) => ({ ...s, ...reduce(dataOf(s), { type: "pin-success" }) }));
          log({
            level: "info",
            component: "parent-gate",
            event: "pin",
            outcome: "success",
          });
          return "ok";
        }
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "pin-fail", now }) }));
        const after = get();
        log({
          level: "warn",
          component: "parent-gate",
          event: "pin",
          outcome: after.pin.lockoutUntil ? "lockout" : "failure",
          error_type: "pin_mismatch",
        });
        void gated;
        return after.pin.lockoutUntil != null && now < (after.pin.lockoutUntil ?? 0)
          ? "lockout"
          : "fail";
      },

      closeAdmin: () => {
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "close-admin" }) }));
      },

      emergencyGrant: (minutes) => {
        log({
          level: "info",
          component: "parent-gate",
          event: "emergency_grant",
          outcome: "success",
          minutes,
        });
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), {
            type: "emergency-grant",
            minutes,
            now: Date.now(),
            id: newId(),
          }),
        }));
      },

      addYoutube: (raw, label) => {
        const id = parseYoutubeId(raw);
        if (!id) {
          log({
            level: "warn",
            component: "youtube",
            event: "parse",
            outcome: "failure",
            error_type: "invalid_url",
          });
          return null;
        }
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), {
            type: "add-youtube",
            id,
            label: (label ?? "").trim() || id,
          }),
        }));
        return id;
      },

      removeYoutube: (id) => {
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), { type: "remove-youtube", id }),
        }));
      },

      patchSettings: (patch) => {
        set((s) => ({
          ...s,
          ...reduce(dataOf(s), { type: "update-settings", patch }),
        }));
      },

      clearHistory: () => {
        set((s) => ({ ...s, ...reduce(dataOf(s), { type: "clear-history" }) }));
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => safeStorage()),
      partialize: (s) => ({
        settings: s.settings,
        play: s.play,
        history: s.history.slice(0, 40),
        pin: s.pin,
        phase: s.settings.pinHash
          ? s.phase === "play"
            ? "play"
            : "lock"
          : "setup",
        task: null,
        correlationId: "",
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AppState>;
        const merged = { ...currentState, ...persisted };
        try {
          const next = reduce(dataOf(merged as Store), {
            type: "hydrate",
            now: Date.now(),
          });
          return { ...merged, ...next };
        } catch {
          return merged;
        }
      },
    },
  ),
);
