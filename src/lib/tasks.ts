import type { ConnectTask, Stars, Task, TraceTask } from "./types";

const TRACE: TraceTask[] = [
  {
    id: "trace-circle-1",
    type: "trace",
    stars: 1,
    titleZh: "描個圓",
    titleEn: "Trace a circle",
    glyph: { kind: "shape", shape: "circle" },
  },
  {
    id: "trace-one-1",
    type: "trace",
    stars: 1,
    titleZh: "寫 1",
    titleEn: "Write 1",
    glyph: { kind: "glyph", char: "1" },
  },
  {
    id: "trace-kou-1",
    type: "trace",
    stars: 1,
    titleZh: "寫 口",
    titleEn: "Write 口",
    glyph: { kind: "glyph", char: "口" },
  },
  {
    id: "trace-square-2",
    type: "trace",
    stars: 2,
    titleZh: "描個正方形",
    titleEn: "Trace a square",
    glyph: { kind: "shape", shape: "square" },
  },
  {
    id: "trace-ren-2",
    type: "trace",
    stars: 2,
    titleZh: "寫 人",
    titleEn: "Write 人",
    glyph: { kind: "glyph", char: "人" },
  },
  {
    id: "trace-ri-2",
    type: "trace",
    stars: 2,
    titleZh: "寫 日",
    titleEn: "Write 日",
    glyph: { kind: "glyph", char: "日" },
  },
  {
    id: "trace-triangle-3",
    type: "trace",
    stars: 3,
    titleZh: "描個三角形",
    titleEn: "Trace a triangle",
    glyph: { kind: "shape", shape: "triangle" },
  },
  {
    id: "trace-yue-3",
    type: "trace",
    stars: 3,
    titleZh: "寫 月",
    titleEn: "Write 月",
    glyph: { kind: "glyph", char: "月" },
  },
  {
    id: "trace-shan-3",
    type: "trace",
    stars: 3,
    titleZh: "寫 山",
    titleEn: "Write 山",
    glyph: { kind: "glyph", char: "山" },
  },
  {
    id: "trace-mu-3",
    type: "trace",
    stars: 3,
    titleZh: "寫 木",
    titleEn: "Write 木",
    glyph: { kind: "glyph", char: "木" },
  },
];

const CONNECT: ConnectTask[] = [
  {
    id: "connect-easy-1",
    type: "connect",
    stars: 1,
    titleZh: "連連看",
    titleEn: "Connect",
    pairs: [
      { id: "apple", picture: "🍎", zh: "蘋果", en: "apple" },
      { id: "sun", picture: "☀️", zh: "太陽", en: "sun" },
    ],
  },
  {
    id: "connect-mid-2",
    type: "connect",
    stars: 2,
    titleZh: "連連看",
    titleEn: "Connect",
    pairs: [
      { id: "cat", picture: "🐱", zh: "貓", en: "cat" },
      { id: "fish", picture: "🐟", zh: "魚", en: "fish" },
      { id: "moon", picture: "🌙", zh: "月亮", en: "moon" },
    ],
  },
  {
    id: "connect-hard-3",
    type: "connect",
    stars: 3,
    titleZh: "連連看",
    titleEn: "Connect",
    pairs: [
      { id: "tree", picture: "🌳", zh: "樹", en: "tree" },
      { id: "water", picture: "💧", zh: "水", en: "water" },
      { id: "flower", picture: "🌸", zh: "花", en: "flower" },
      { id: "bird", picture: "🐦", zh: "雀", en: "bird" },
    ],
  },
];

export const TASKS: Task[] = [...TRACE, ...CONNECT];

export function pickTask(stars: Stars, rng: () => number = Math.random): Task {
  const pool = TASKS.filter((t) => t.stars === stars);
  if (pool.length === 0) {
    return TRACE[0]!;
  }
  const index = Math.floor(rng() * pool.length) % pool.length;
  return pool[index]!;
}
