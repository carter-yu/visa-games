export type Stars = 1 | 2 | 3;

export type Phase = "setup" | "lock" | "task" | "result" | "play" | "admin";

export type TraceGlyph =
  | { kind: "shape"; shape: "circle" | "square" | "triangle" }
  | { kind: "glyph"; char: string };

export type ConnectPair = {
  id: string;
  picture: string;
  zh: string;
  en: string;
};

export type TraceTask = {
  id: string;
  type: "trace";
  stars: Stars;
  titleZh: string;
  titleEn: string;
  glyph: TraceGlyph;
};

export type ConnectTask = {
  id: string;
  type: "connect";
  stars: Stars;
  titleZh: string;
  titleEn: string;
  pairs: ConnectPair[];
};

export type Task = TraceTask | ConnectTask;

export type PlaySession = {
  endsAt: number;
  minutes: number;
  stars: Stars;
  taskId: string;
  helpUsed: boolean;
} | null;

export type HistoryItem = {
  id: string;
  at: number;
  stars: Stars;
  taskTitle: string;
  help: boolean;
  minutes: number;
};

export type YoutubeItem = {
  id: string;
  label: string;
};

export type Settings = {
  pinHash: string;
  childName: string;
  durations: Record<Stars, number>;
  helpPenalty: number;
  youtube: YoutubeItem[];
};

export type PinState = {
  fails: number;
  lockoutUntil: number | null;
};

export type TaskInstance = {
  task: Task;
  failCount: number;
  helpUsed: boolean;
  showTeach: boolean;
  lockedPairIds: string[];
  connectAttempts: number;
};

export type AppState = {
  phase: Phase;
  settings: Settings;
  task: TaskInstance | null;
  play: PlaySession;
  history: HistoryItem[];
  pin: PinState;
  correlationId: string;
};
