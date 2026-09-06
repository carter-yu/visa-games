import { useState } from "react";

type Props = {
  titleZh: string;
  titleEn: string;
  hint?: string;
  disabled?: boolean;
  onComplete: (pin: string) => void;
};

export function PinPad({ titleZh, titleEn, hint, disabled, onComplete }: Props) {
  const [digits, setDigits] = useState("");

  function press(d: string) {
    if (disabled) return;
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    if (next.length === 4) {
      onComplete(next);
      setDigits("");
    }
  }

  function back() {
    if (disabled) return;
    setDigits((d) => d.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", ""];

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{titleZh}</h2>
        <p className="text-sm text-ink/70">{titleEn}</p>
        {hint ? <p className="mt-2 text-sm text-terracotta">{hint}</p> : null}
      </div>
      <div className="flex gap-3" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-ink ${
              digits.length > i ? "bg-ink" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {keys.map((key, i) => {
          if (key === "") return <div key={i} />;
          const isBack = key === "⌫";
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (isBack) back();
                else press(key);
              }}
              className="pressable card-shadow min-h-16 rounded-2xl border-2 border-ink bg-paper text-3xl font-bold disabled:opacity-40"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
