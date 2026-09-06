import { useState } from "react";
import { PinPad } from "./pin-pad";
import { useApp } from "../lib/store";

type Step = "pin" | "confirm" | "name";

export function SetupScreen() {
  const completeSetup = useApp((s) => s.completeSetup);
  const [step, setStep] = useState<Step>("pin");
  const [first, setFirst] = useState("");
  const [name, setName] = useState("");
  const [hint, setHint] = useState<string | undefined>();

  async function finish(childName: string) {
    const result = await completeSetup(first, first, childName);
    if (result !== "ok") setHint("設定失敗，再試一次 / Setup failed, try again");
  }

  if (step === "pin") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-8">
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-terracotta">先做再玩</p>
          <h1 className="mt-2 text-4xl font-black">簽證遊戲</h1>
          <p className="text-lg text-ink/70">Visa Games</p>
          <p className="mt-3 max-w-md text-sm text-ink/80">
            家長先設定 4 位密碼。小朋友之後只用筆。
            <br />
            Parent sets a 4-digit PIN first. The child uses a pen after this.
          </p>
        </div>
        <PinPad
          titleZh="設定密碼"
          titleEn="Set PIN"
          hint={hint}
          onComplete={(pin) => {
            setFirst(pin);
            setHint(undefined);
            setStep("confirm");
          }}
        />
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-8">
        <PinPad
          titleZh="再入一次"
          titleEn="Confirm PIN"
          hint={hint}
          onComplete={(pin) => {
            if (pin !== first) {
              setHint("唔相同，由頭再設 / Mismatch, start again");
              setFirst("");
              setStep("pin");
              return;
            }
            setHint(undefined);
            setStep("name");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">小朋友個名（可選）</h2>
        <p className="text-sm text-ink/70">Child name (optional)</p>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-h-14 w-full max-w-sm rounded-2xl border-2 border-ink bg-paper px-4 text-xl"
        placeholder="名 / name"
        autoComplete="off"
      />
      <div className="flex w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={() => void finish("")}
          className="pressable card-shadow min-h-14 flex-1 rounded-2xl border-2 border-ink bg-paper"
        >
          跳過 / Skip
        </button>
        <button
          type="button"
          onClick={() => void finish(name)}
          className="pressable card-shadow min-h-14 flex-1 rounded-2xl border-2 border-ink bg-terracotta text-paper"
        >
          開始 / Start
        </button>
      </div>
    </div>
  );
}
