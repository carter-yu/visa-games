import { useEffect, useState } from "react";
import { useApp } from "../lib/store";
import { formatRemaining, remainingMs } from "../lib/visa";
import { youtubeEmbedUrl } from "../lib/youtube";

export function PlayTime({ onParent }: { onParent: () => void }) {
  const play = useApp((s) => s.play);
  const youtube = useApp((s) => s.settings.youtube);
  const tick = useApp((s) => s.tick);
  const [now, setNow] = useState(() => Date.now());
  const [active, setActive] = useState<string | null>(youtube[0]?.id ?? null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      tick(t);
    }, 250);
    return () => window.clearInterval(id);
  }, [tick]);

  if (!play) return null;
  const left = remainingMs(play.endsAt, now);

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 py-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm tracking-[0.3em] text-terracotta">簽證時間</p>
          <p className="text-4xl font-black tabular-nums">{formatRemaining(left)}</p>
          <p className="text-sm text-ink/70">Visa minutes remaining</p>
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onParent();
          }}
          className="min-h-14 rounded-xl border-2 border-ink/30 bg-paper px-4 text-sm"
        >
          家長 / Parent
        </button>
      </header>

      {youtube.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-ink/30 p-8 text-center text-lg">
          家長未加入影片
          <br />
          Parent has not added videos yet
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {youtube.map((item) => (
              <button
                key={item.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setActive(item.id);
                }}
                className={`min-h-14 rounded-2xl border-2 px-4 text-lg ${
                  active === item.id
                    ? "border-terracotta bg-terracotta text-paper"
                    : "border-ink bg-paper"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {active ? (
            <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border-[3px] border-ink bg-ink">
              <iframe
                title="YouTube"
                src={youtubeEmbedUrl(active)}
                className="h-full min-h-[280px] w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
