import type {
  AppState,
  HistoryItem,
  Settings,
  Stars,
  Task,
} from "./types";
import { recordPinAttempt } from "./pin";
import { visaMinutes } from "./visa";

export type { AppState } from "./types";

export const PERSIST_KEY = "homework-first-v1";
export const HISTORY_CAP = 40;

export const defaultSettings: Settings = {
  pinHash: "",
  childName: "",
  durations: { 1: 10, 2: 18, 3: 28 },
  helpPenalty: 3,
  youtube: [],
};

export const initialState: AppState = {
  phase: "setup",
  settings: defaultSettings,
  task: null,
  play: null,
  history: [],
  pin: { fails: 0, lockoutUntil: null },
  correlationId: "",
};

export type Action =
  | { type: "hydrate"; now: number }
  | { type: "setup-complete"; pinHash: string; childName: string }
  | { type: "pick-card"; stars: Stars; task: Task; correlationId: string }
  | {
      type: "trace-complete";
      result: { hit: number; painted: number; scribble: boolean; success: boolean };
    }
  | {
      type: "connect-stroke";
      locked: string | null;
      rejected: boolean;
      attemptDelta: number;
      pairCount: number;
    }
  | { type: "use-help" }
  | { type: "dismiss-teach" }
  | { type: "finish-with-help" }
  | { type: "stamp-visa"; now: number; id: string }
  | { type: "lock-now" }
  | { type: "open-admin" }
  | { type: "close-admin" }
  | { type: "emergency-grant"; minutes: number; now: number; id: string }
  | { type: "pin-fail"; now: number }
  | { type: "pin-success" }
  | { type: "update-settings"; patch: Partial<Settings> }
  | { type: "add-youtube"; id: string; label: string }
  | { type: "remove-youtube"; id: string }
  | { type: "clear-history" }
  | { type: "tick"; now: number };

function expirePlay(state: AppState, now: number): AppState {
  if (state.play && state.play.endsAt <= now) {
    return { ...state, phase: "lock", play: null };
  }
  return state;
}

function withHistory(state: AppState, item: HistoryItem): HistoryItem[] {
  return [item, ...state.history].slice(0, HISTORY_CAP);
}

export function reduce(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
    case "tick":
      return expirePlay(state, action.now);

    case "setup-complete":
      return {
        ...state,
        phase: "lock",
        settings: {
          ...state.settings,
          pinHash: action.pinHash,
          childName: action.childName,
        },
      };

    case "pick-card":
      return {
        ...state,
        phase: "task",
        correlationId: action.correlationId,
        task: {
          task: action.task,
          failCount: 0,
          helpUsed: false,
          showTeach: false,
          lockedPairIds: [],
          connectAttempts: 0,
        },
      };

    case "trace-complete": {
      if (!state.task || state.task.task.type !== "trace") return state;
      if (action.result.success) {
        return {
          ...state,
          phase: "result",
          task: { ...state.task, showTeach: false },
        };
      }
      const failCount = state.task.failCount + 1;
      return {
        ...state,
        task: {
          ...state.task,
          failCount,
          showTeach: failCount >= 2,
        },
      };
    }

    case "connect-stroke": {
      if (!state.task || state.task.task.type !== "connect") return state;
      const locked = new Set(state.task.lockedPairIds);
      if (action.locked) locked.add(action.locked);
      const lockedPairIds = [...locked];
      const connectAttempts = state.task.connectAttempts + action.attemptDelta;
      const failCount = action.rejected
        ? state.task.failCount + 1
        : state.task.failCount;
      const showTeach = failCount >= 2 ? true : state.task.showTeach;
      const allLocked =
        action.pairCount > 0 && lockedPairIds.length >= action.pairCount;
      const nextTask = {
        ...state.task,
        lockedPairIds,
        connectAttempts,
        failCount,
        showTeach,
      };
      if (allLocked) {
        return { ...state, phase: "result", task: { ...nextTask, showTeach: false } };
      }
      return { ...state, task: nextTask };
    }

    case "use-help": {
      if (!state.task) return state;
      return {
        ...state,
        task: { ...state.task, helpUsed: true, showTeach: true },
      };
    }

    case "dismiss-teach": {
      if (!state.task) return state;
      return { ...state, task: { ...state.task, showTeach: false } };
    }

    case "finish-with-help": {
      if (!state.task) return state;
      return {
        ...state,
        phase: "result",
        task: { ...state.task, helpUsed: true, showTeach: false },
      };
    }

    case "stamp-visa": {
      const task = state.task;
      if (!task) return state;
      const stars = task.task.stars;
      const minutes = visaMinutes(
        state.settings.durations[stars],
        task.helpUsed,
        state.settings.helpPenalty,
        1,
      );
      const item: HistoryItem = {
        id: action.id,
        at: action.now,
        stars,
        taskTitle: `${task.task.titleZh} / ${task.task.titleEn}`,
        help: task.helpUsed,
        minutes,
      };
      return {
        ...state,
        phase: "play",
        play: {
          endsAt: action.now + minutes * 60_000,
          minutes,
          stars,
          taskId: task.task.id,
          helpUsed: task.helpUsed,
        },
        history: withHistory(state, item),
        task: null,
      };
    }

    case "lock-now":
      return { ...state, phase: "lock", play: null, task: null };

    case "open-admin":
      return { ...state, phase: "admin", pin: { fails: 0, lockoutUntil: null } };

    case "close-admin":
      return { ...state, phase: state.play ? "play" : "lock" };

    case "emergency-grant": {
      const item: HistoryItem = {
        id: action.id,
        at: action.now,
        stars: 1,
        taskTitle: "Parent grant",
        help: false,
        minutes: action.minutes,
      };
      return {
        ...state,
        phase: "play",
        play: {
          endsAt: action.now + action.minutes * 60_000,
          minutes: action.minutes,
          stars: 1,
          taskId: "parent-grant",
          helpUsed: false,
        },
        history: withHistory(state, item),
        task: null,
      };
    }

    case "pin-fail": {
      const next = recordPinAttempt({
        ok: false,
        fails: state.pin.fails,
        lockoutUntil: state.pin.lockoutUntil,
        now: action.now,
      });
      return {
        ...state,
        pin: { fails: next.fails, lockoutUntil: next.lockoutUntil },
      };
    }

    case "pin-success":
      return {
        ...state,
        phase: "admin",
        pin: { fails: 0, lockoutUntil: null },
      };

    case "update-settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "add-youtube": {
      if (state.settings.youtube.some((v) => v.id === action.id)) return state;
      return {
        ...state,
        settings: {
          ...state.settings,
          youtube: [
            ...state.settings.youtube,
            { id: action.id, label: action.label },
          ],
        },
      };
    }

    case "remove-youtube":
      return {
        ...state,
        settings: {
          ...state.settings,
          youtube: state.settings.youtube.filter((v) => v.id !== action.id),
        },
      };

    case "clear-history":
      return { ...state, history: [] };

    default:
      return state;
  }
}
