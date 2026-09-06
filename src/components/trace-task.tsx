import { useCallback, useEffect, useRef, useState } from "react";
import { CoachMark } from "./coach-mark";
import { TeachOverlay } from "./teach-overlay";
import { inkWidth, shouldIgnorePointer } from "../lib/pen";
import { speak } from "../lib/speech";
import { useApp } from "../lib/store";
import {
  evaluateTrace,
  masksFromRgba,
  TRACE_TOLERANCE_PX,
} from "../lib/trace";
import type { TraceGlyph, TraceTask as TraceTaskType } from "../lib/types";

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: TraceGlyph,
  w: number,
  h: number,
  color: string,
  lineWidth: number,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;
  ctx.beginPath();
  if (glyph.kind === "shape") {
    if (glyph.shape === "circle") {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (glyph.shape === "square") {
      const s = r * 1.65;
      ctx.rect(cx - s / 2, cy - s / 2, s, s);
    } else {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy + r * 0.9);
      ctx.lineTo(cx - r, cy + r * 0.9);
      ctx.closePath();
    }
    ctx.stroke();
  } else {
    ctx.font = `700 ${Math.floor(h * 0.52)}px "PingFang HK", "Noto Sans TC", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(glyph.char, cx, cy);
  }
  ctx.restore();
}

function sizeCanvas(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function TraceTaskView({
  task,
  mouseHint,
}: {
  task: TraceTaskType;
  mouseHint: boolean;
}) {
  const instance = useApp((s) => s.task);
  const penalty = useApp((s) => s.settings.helpPenalty);
  const submitTrace = useApp((s) => s.submitTrace);
  const useHelp = useApp((s) => s.useHelp);
  const dismissTeach = useApp((s) => s.dismissTeach);
  const finishWithHelp = useApp((s) => s.finishWithHelp);

  const wrapRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const penDown = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  const paintGhost = useCallback(() => {
    const wrap = wrapRef.current;
    const ghost = ghostRef.current;
    const hit = hitRef.current;
    const ink = inkRef.current;
    if (!wrap || !ghost || !hit || !ink) return;
    const rect = wrap.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const g = sizeCanvas(ghost, w, h);
    const hi = sizeCanvas(hit, w, h);
    sizeCanvas(ink, w, h);
    if (!g || !hi) return;
    g.clearRect(0, 0, w, h);
    hi.clearRect(0, 0, w, h);
    drawGlyph(g, task.glyph, w, h, "rgba(28,20,16,0.28)", 22);
    drawGlyph(hi, task.glyph, w, h, "rgba(28,20,16,1)", 72);
  }, [task]);

  useEffect(() => {
    paintGhost();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => paintGhost());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [paintGhost]);

  useEffect(() => {
    speak(task.titleZh, task.titleEn);
  }, [task.id, task.titleEn, task.titleZh]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = inkRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (shouldIgnorePointer({ pointerType: e.pointerType, penDown: penDown.current })) {
      return;
    }
    if (e.pointerType === "pen") penDown.current = true;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    setMessage(null);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    if (shouldIgnorePointer({ pointerType: e.pointerType, penDown: penDown.current })) {
      return;
    }
    const canvas = inkRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !last.current) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = "#1c1410";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = inkWidth(e.pressure);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "pen") penDown.current = false;
    drawing.current = false;
    last.current = null;
  }

  function clearInk() {
    const canvas = inkRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    setMessage(null);
  }

  function complete() {
    const ink = inkRef.current;
    const hit = hitRef.current;
    if (!ink || !hit) return;
    const inkCtx = ink.getContext("2d");
    const hitCtx = hit.getContext("2d");
    if (!inkCtx || !hitCtx) return;
    const inkData = inkCtx.getImageData(0, 0, ink.width, ink.height);
    const hitData = hitCtx.getImageData(0, 0, hit.width, hit.height);
    const masks = masksFromRgba(hitData.data, inkData.data);
    if (!masks) {
      submitTrace({ hit: 0, painted: 0, scribble: false, success: false });
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const result = evaluateTrace({
      path: masks.path,
      ink: masks.ink,
      stars: task.stars,
      width: ink.width,
      height: ink.height,
      tolerancePx: Math.round(TRACE_TOLERANCE_PX[task.stars] * dpr),
    });
    submitTrace(result);
    if (!result.success) {
      setMessage(
        result.scribble
          ? "畫出界太多 · Too much scribble"
          : "再畫清楚啲 · Trace more of the line",
      );
    }
  }

  return (
    <div className="relative flex min-h-full flex-col px-4 py-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm tracking-[0.3em] text-terracotta">先做再玩</p>
          <h1 className="text-2xl font-black">{task.titleZh}</h1>
          <p className="text-ink/70">{task.titleEn}</p>
        </div>
        <CoachMark mouseHint={mouseHint} />
      </header>

      <div
        ref={wrapRef}
        className="relative mt-3 min-h-[320px] flex-1 overflow-hidden rounded-3xl border-[3px] border-ink bg-paper"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={hitRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          aria-hidden
        />
        <canvas ref={ghostRef} className="absolute inset-0 h-full w-full" />
        <canvas
          ref={inkRef}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: "none", cursor: "crosshair" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>

      {message ? (
        <p className="mt-2 text-center text-terracotta">{message}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            clearInk();
          }}
          className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-paper text-base font-bold"
        >
          擦走重畫
          <span className="block text-xs font-normal">Clear</span>
        </button>
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
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            complete();
          }}
          className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-terracotta text-base font-bold text-paper"
        >
          完成
          <span className="block text-xs font-normal">Done</span>
        </button>
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
