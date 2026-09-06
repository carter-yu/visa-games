import { useEffect, useRef, useState } from "react";
import { CoachMark } from "./coach-mark";
import { TeachOverlay } from "./teach-overlay";
import type { HitRect, Point } from "../lib/connect";
import { inkWidth, shouldIgnorePointer } from "../lib/pen";
import { speak } from "../lib/speech";
import { useApp } from "../lib/store";
import type { ConnectTask as ConnectTaskType } from "../lib/types";

type NodeRef = { id: string; pairId: string; el: HTMLButtonElement };

function rectOf(node: NodeRef, root: DOMRect): HitRect {
  const r = node.el.getBoundingClientRect();
  return {
    id: node.id,
    pairId: node.pairId,
    x: r.left - root.left,
    y: r.top - root.top,
    w: r.width,
    h: r.height,
  };
}

function center(r: HitRect): Point {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function ConnectTaskView({
  task,
  mouseHint,
}: {
  task: ConnectTaskType;
  mouseHint: boolean;
}) {
  const instance = useApp((s) => s.task);
  const penalty = useApp((s) => s.settings.helpPenalty);
  const submitConnectStroke = useApp((s) => s.submitConnectStroke);
  const useHelp = useApp((s) => s.useHelp);
  const dismissTeach = useApp((s) => s.dismissTeach);
  const finishWithHelp = useApp((s) => s.finishWithHelp);
  const locked = instance?.lockedPairIds ?? [];

  const rootRef = useRef<HTMLDivElement>(null);
  const picRefs = useRef<NodeRef[]>([]);
  const wordRefs = useRef<NodeRef[]>([]);
  const strokeRef = useRef<Point[]>([]);
  const [stroke, setStroke] = useState<Point[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const drawing = useRef(false);
  const penDown = useRef(false);
  const wordOrder = [...task.pairs].reverse();

  useEffect(() => {
    speak(task.titleZh, task.titleEn);
  }, [task.id, task.titleEn, task.titleZh]);

  function collect() {
    const root = rootRef.current?.getBoundingClientRect();
    if (!root) return { pictures: [] as HitRect[], words: [] as HitRect[] };
    return {
      pictures: picRefs.current
        .filter((n) => n.el.isConnected)
        .map((n) => rectOf(n, root)),
      words: wordRefs.current
        .filter((n) => n.el.isConnected)
        .map((n) => rectOf(n, root)),
    };
  }

  function localPoint(e: React.PointerEvent): Point {
    const root = rootRef.current?.getBoundingClientRect();
    if (!root) return { x: 0, y: 0 };
    return { x: e.clientX - root.left, y: e.clientY - root.top };
  }

  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    if (shouldIgnorePointer({ pointerType: e.pointerType, penDown: penDown.current })) {
      return;
    }
    if (e.pointerType === "pen") penDown.current = true;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = localPoint(e);
    strokeRef.current = [p];
    setStroke([p]);
  }

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drawing.current) return;
    if (shouldIgnorePointer({ pointerType: e.pointerType, penDown: penDown.current })) {
      return;
    }
    e.preventDefault();
    const p = localPoint(e);
    const next = [...strokeRef.current, p];
    strokeRef.current = next.length > 400 ? next.slice(-300) : next;
    setStroke(strokeRef.current);
  }

  function onUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "pen") penDown.current = false;
    if (!drawing.current) return;
    drawing.current = false;
    const { pictures, words } = collect();
    const pts = strokeRef.current;
    const dist =
      pts.length >= 2
        ? Math.hypot(
            pts[pts.length - 1]!.x - pts[0]!.x,
            pts[pts.length - 1]!.y - pts[0]!.y,
          )
        : 0;

    if (dist < 24) {
      const p = pts[0];
      if (p) {
        const pic = pictures.find(
          (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
        );
        const word = words.find(
          (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
        );
        if (pic && !locked.includes(pic.pairId)) {
          if (selected && selected !== pic.pairId) {
            const from = pictures.find((r) => r.pairId === selected);
            if (from) {
              submitConnectStroke([center(from), center(pic)], pictures, words);
            }
            setSelected(null);
          } else {
            setSelected(pic.pairId);
          }
        } else if (word && selected) {
          const from = pictures.find((r) => r.pairId === selected);
          if (from) {
            submitConnectStroke([center(from), center(word)], pictures, words);
          }
          setSelected(null);
        }
      }
    } else {
      submitConnectStroke(pts, pictures, words);
      setSelected(null);
    }
    strokeRef.current = [];
    setStroke([]);
  }

  const lockedLines = (() => {
    const { pictures, words } = collect();
    return locked.flatMap((id) => {
      const a = pictures.find((p) => p.pairId === id);
      const b = words.find((w) => w.pairId === id);
      if (!a || !b) return [];
      return [{ a: center(a), b: center(b) }];
    });
  })();

  return (
    <div className="relative flex min-h-full flex-col px-4 py-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm tracking-[0.3em] text-terracotta">先做再玩</p>
          <h1 className="text-2xl font-black">{task.titleZh}</h1>
          <p className="text-ink/70">{task.titleEn} · 用筆連過去 / Draw a line</p>
        </div>
        <CoachMark mouseHint={mouseHint} />
      </header>

      <div
        ref={rootRef}
        className="relative mt-3 min-h-[320px] flex-1"
        style={{ touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="grid h-full grid-cols-2 gap-8">
          <div className="flex flex-col justify-evenly">
            {task.pairs.map((pair, i) => (
              <button
                key={pair.id}
                type="button"
                ref={(el) => {
                  if (el) picRefs.current[i] = { id: pair.id, pairId: pair.id, el };
                }}
                className={`min-h-20 rounded-3xl border-[3px] text-5xl ${
                  locked.includes(pair.id)
                    ? "border-moss bg-moss/10"
                    : selected === pair.id
                      ? "border-terracotta bg-terracotta/10"
                      : "border-ink bg-paper"
                }`}
              >
                {pair.picture}
              </button>
            ))}
          </div>
          <div className="flex flex-col justify-evenly">
            {wordOrder.map((item, i) => (
              <button
                key={`w-${item.id}`}
                type="button"
                ref={(el) => {
                  if (el) {
                    wordRefs.current[i] = {
                      id: `${item.id}-word`,
                      pairId: item.id,
                      el,
                    };
                  }
                }}
                className={`min-h-20 rounded-3xl border-[3px] px-2 text-2xl font-bold ${
                  locked.includes(item.id)
                    ? "border-moss bg-moss/10"
                    : "border-ink bg-paper"
                }`}
              >
                {item.zh}
                <span className="mt-1 block text-sm font-normal text-ink/60">
                  {item.en}
                </span>
              </button>
            ))}
          </div>
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {lockedLines.map((line, i) => (
            <line
              key={i}
              x1={line.a.x}
              y1={line.a.y}
              x2={line.b.x}
              y2={line.b.y}
              stroke="#4a6b4a"
              strokeWidth={8}
              strokeLinecap="round"
            />
          ))}
          {stroke.length > 1 ? (
            <polyline
              fill="none"
              stroke="#c45c3e"
              strokeWidth={inkWidth(0.5)}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={stroke.map((p) => `${p.x},${p.y}`).join(" ")}
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            useHelp();
          }}
          className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-paper text-base font-bold"
        >
          教我
          <span className="block text-xs font-normal">Teach me</span>
        </button>
        <p className="flex min-h-16 items-center justify-center text-center text-sm text-ink/70">
          畫線連圖同字 / Draw picture to word
        </p>
      </div>

      {instance?.showTeach ? (
        <TeachOverlay
          task={task}
          penalty={penalty}
          onTryAgain={dismissTeach}
          onContinue={finishWithHelp}
        />
      ) : null}
    </div>
  );
}
