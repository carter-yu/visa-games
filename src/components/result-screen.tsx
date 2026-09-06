import { useApp } from "../lib/store";
import { visaMinutes } from "../lib/visa";

export function ResultScreen() {
  const task = useApp((s) => s.task);
  const durations = useApp((s) => s.settings.durations);
  const penalty = useApp((s) => s.settings.helpPenalty);
  const stampVisa = useApp((s) => s.stampVisa);

  if (!task) return null;
  const minutes = visaMinutes(
    durations[task.task.stars],
    task.helpUsed,
    penalty,
    1,
  );

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-8">
      <p className="text-sm tracking-[0.3em] text-terracotta">先做再玩</p>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          stampVisa();
        }}
        className="pressable flex h-64 w-64 flex-col items-center justify-center rounded-full border-[6px] border-terracotta bg-paper text-terracotta shadow-[0_0_0_12px_#f4ead8,0_0_0_18px_#c45c3e]"
      >
        <span className="text-xl font-bold">簽證 / VISA</span>
        <span className="text-6xl font-black">+{minutes}</span>
        <span className="text-lg">分鐘 / min</span>
      </button>
      <p className="text-center text-lg">
        {task.helpUsed ? "用過提示 · Help was used" : "自己完成 · You did it"}
      </p>
      <p className="text-ink/70">撳個印開始玩 / Tap the stamp to play</p>
    </div>
  );
}
