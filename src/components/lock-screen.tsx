import { CoachMark } from "./coach-mark";
import { useApp } from "../lib/store";
import { speak } from "../lib/speech";
import type { Stars } from "../lib/types";

const CARDS: {
  stars: Stars;
  zh: string;
  en: string;
}[] = [
  { stars: 1, zh: "簡單", en: "Easy" },
  { stars: 2, zh: "適中", en: "Medium" },
  { stars: 3, zh: "挑戰", en: "Challenge" },
];

export function LockScreen({
  onParent,
  mouseHint,
}: {
  onParent: () => void;
  mouseHint: boolean;
}) {
  const pickCard = useApp((s) => s.pickCard);
  const durations = useApp((s) => s.settings.durations);
  const childName = useApp((s) => s.settings.childName);

  function pick(stars: Stars, zh: string, en: string) {
    speak(`${zh}。${durations[stars]} 分鐘`, `${en}. ${durations[stars]} minutes`);
    pickCard(stars);
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.3em] text-terracotta">先做再玩</p>
          <h1 className="mt-1 text-4xl font-black">簽證遊戲</h1>
          <p className="text-lg text-ink/70">Visa Games</p>
          <p className="mt-2 text-base">
            {childName ? `你好，${childName}` : "你好，小朋友"} / Hello
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <CoachMark mouseHint={mouseHint} />
          <button
            type="button"
            onClick={() => onParent()}
            className="min-h-14 rounded-xl border-2 border-ink/30 bg-paper px-4 text-sm"
          >
            家長 / Parent
          </button>
        </div>
      </header>

      <p className="mt-6 text-center text-lg">揀一張卡 · Pick a card</p>

      <div className="mt-6 flex flex-1 flex-wrap items-stretch justify-center gap-6">
        {CARDS.map((card) => (
          <button
            key={card.stars}
            type="button"
            onClick={() => pick(card.stars, card.zh, card.en)}
            className="pressable card-shadow flex min-h-[280px] w-[200px] flex-col items-center justify-between rounded-[22px] border-[3px] border-ink bg-paper px-4 py-6"
          >
            <span className="text-terracotta">
              {"★".repeat(card.stars)}
              <span className="text-ink/20">{"★".repeat(3 - card.stars)}</span>
            </span>
            <span className="text-3xl font-black">{card.zh}</span>
            <span className="text-ink/70">{card.en}</span>
            <span className="text-4xl font-black text-terracotta">
              {durations[card.stars]}
            </span>
            <span className="text-sm">分鐘 / min</span>
          </button>
        ))}
      </div>
    </div>
  );
}
