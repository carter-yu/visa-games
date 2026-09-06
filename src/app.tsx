import { useEffect, useState } from "react";
import { AdminPanel } from "./components/admin-panel";
import { ConnectTaskView } from "./components/connect-task";
import { LockScreen } from "./components/lock-screen";
import { PinPad } from "./components/pin-pad";
import { PlayTime } from "./components/play-time";
import { ResultScreen } from "./components/result-screen";
import { SetupScreen } from "./components/setup-screen";
import { TraceTaskView } from "./components/trace-task";
import { VersionMark } from "./components/version-mark";
import { useApp } from "./lib/store";
import { VERSION_LABEL } from "./lib/version";

export default function App() {
  const phase = useApp((s) => s.phase);
  const task = useApp((s) => s.task);
  const pin = useApp((s) => s.pin);
  const tryPin = useApp((s) => s.tryPin);
  const tick = useApp((s) => s.tick);

  const [parentOpen, setParentOpen] = useState(false);
  const [pinHint, setPinHint] = useState<string | undefined>();
  const [mouseHint, setMouseHint] = useState(false);

  useEffect(() => {
    document.title = `簽證遊戲 Visa Games ${VERSION_LABEL}`;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => tick(Date.now()), 1000);
    const onVis = () => tick(Date.now());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tick]);

  function notePointer(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && (phase === "lock" || phase === "task")) {
      setMouseHint(true);
    }
  }

  async function goFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* honest limit: browser may deny */
    }
  }

  return (
    <div className="min-h-full overflow-auto" onPointerDown={notePointer}>
      {phase === "setup" ? <SetupScreen /> : null}
      {phase === "lock" ? (
        <LockScreen
          mouseHint={mouseHint}
          onParent={() => {
            setPinHint(undefined);
            setParentOpen(true);
          }}
        />
      ) : null}
      {phase === "task" && task?.task.type === "trace" ? (
        <TraceTaskView task={task.task} mouseHint={mouseHint} />
      ) : null}
      {phase === "task" && task?.task.type === "connect" ? (
        <ConnectTaskView task={task.task} mouseHint={mouseHint} />
      ) : null}
      {phase === "result" ? <ResultScreen /> : null}
      {phase === "play" ? (
        <PlayTime
          onParent={() => {
            setPinHint(undefined);
            setParentOpen(true);
          }}
        />
      ) : null}
      {phase === "admin" ? <AdminPanel /> : null}

      {parentOpen && phase !== "admin" && phase !== "setup" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/50 p-4">
          <div className="card-shadow w-full max-w-sm rounded-3xl border-[3px] border-ink bg-paper p-5">
            <PinPad
              titleZh="家長密碼"
              titleEn="Parent PIN"
              hint={
                pinHint ??
                (pin.lockoutUntil && Date.now() < pin.lockoutUntil
                  ? "等一陣 / Wait a moment"
                  : undefined)
              }
              disabled={Boolean(pin.lockoutUntil && Date.now() < pin.lockoutUntil)}
              onComplete={(value) => {
                void tryPin(value).then((result) => {
                  if (result === "ok") {
                    setParentOpen(false);
                    setPinHint(undefined);
                    return;
                  }
                  if (result === "lockout") setPinHint("等一陣 / Wait a moment");
                  else setPinHint("唔啱 / Incorrect");
                });
              }}
            />
            <button
              type="button"
              className="mt-4 min-h-14 w-full rounded-xl border-2 border-ink/30"
              onClick={() => setParentOpen(false)}
            >
              取消 / Cancel
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void goFullscreen()}
        className="fixed bottom-3 left-3 z-10 min-h-12 rounded-lg border border-ink/20 bg-paper/80 px-3 text-xs text-ink/60"
      >
        全螢幕 / Fullscreen
      </button>
      <VersionMark />
    </div>
  );
}
