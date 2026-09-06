import type { Task } from "../lib/types";

export function TeachOverlay({
  task,
  penalty,
  onTryAgain,
  onContinue,
}: {
  task: Task;
  penalty: number;
  onTryAgain: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/45 p-4">
      <div className="card-shadow max-h-full w-full max-w-lg overflow-auto rounded-3xl border-[3px] border-ink bg-paper p-5">
        <h2 className="text-2xl font-black">睇下點做</h2>
        <p className="text-sm text-ink/70">Watch how · then try, or continue</p>

        {task.type === "trace" ? (
          <p className="mt-4 text-lg">
            跟住淡淡嘅線畫。{task.titleZh} / Follow the pale line. {task.titleEn}.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-xl">
            {task.pairs.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="text-3xl">{p.picture}</span>
                <span>→</span>
                <span className="font-bold">{p.zh}</span>
                <span className="text-ink/60">/ {p.en}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-sm text-terracotta">
          用提示會扣 {penalty} 分鐘 / Help subtracts {penalty} minutes
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onTryAgain();
            }}
            className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-paper text-lg font-bold"
          >
            我再試 / Try again
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onContinue();
            }}
            className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-terracotta text-lg font-bold text-paper"
          >
            扣 {penalty} 分鐘繼續 / Continue (−{penalty} min)
          </button>
        </div>
      </div>
    </div>
  );
}
