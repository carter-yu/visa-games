import { useState } from "react";
import { useApp } from "../lib/store";
import type { Stars } from "../lib/types";
import { APP_VERSION, LATEST_DEV, VERSION_LABEL } from "../lib/version";

export function AdminPanel() {
  const settings = useApp((s) => s.settings);
  const history = useApp((s) => s.history);
  const closeAdmin = useApp((s) => s.closeAdmin);
  const lockNow = useApp((s) => s.lockNow);
  const emergencyGrant = useApp((s) => s.emergencyGrant);
  const addYoutube = useApp((s) => s.addYoutube);
  const removeYoutube = useApp((s) => s.removeYoutube);
  const patchSettings = useApp((s) => s.patchSettings);
  const clearHistory = useApp((s) => s.clearHistory);

  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [name, setName] = useState(settings.childName);
  const [ytError, setYtError] = useState<string | null>(null);

  function bump(stars: Stars, delta: number) {
    const next = Math.max(1, settings.durations[stars] + delta);
    patchSettings({
      durations: { ...settings.durations, [stars]: next },
    });
  }

  function addVideo() {
    const id = addYoutube(url, label);
    if (!id) {
      setYtError("網址唔正確 / Invalid YouTube URL");
      return;
    }
    setYtError(null);
    setUrl("");
    setLabel("");
  }

  return (
    <div className="min-h-full overflow-auto px-5 py-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">家長設定 / Parent</h1>
          <p className="text-sm text-ink/70">
            簽證遊戲 Visa Games · {VERSION_LABEL}
          </p>
        </div>
        <button
          type="button"
          onClick={() => closeAdmin()}
          className="min-h-14 rounded-xl border-2 border-ink bg-paper px-4"
        >
          返去 / Back
        </button>
      </header>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-bold">小朋友名 / Child name</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-14 flex-1 rounded-xl border-2 border-ink bg-paper px-3"
          />
          <button
            type="button"
            onClick={() => patchSettings({ childName: name.trim() })}
            className="min-h-14 rounded-xl border-2 border-ink bg-paper px-4"
          >
            儲存 / Save
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-bold">簽證分鐘 / Visa minutes</h2>
        {([1, 2, 3] as Stars[]).map((stars) => (
          <div key={stars} className="flex items-center gap-3">
            <span className="w-16 text-terracotta">{"★".repeat(stars)}</span>
            <button
              type="button"
              className="min-h-14 min-w-14 rounded-xl border-2 border-ink bg-paper text-2xl"
              onClick={() => bump(stars, -1)}
            >
              −
            </button>
            <span className="w-16 text-center text-2xl font-black">
              {settings.durations[stars]}
            </span>
            <button
              type="button"
              className="min-h-14 min-w-14 rounded-xl border-2 border-ink bg-paper text-2xl"
              onClick={() => bump(stars, 1)}
            >
              +
            </button>
          </div>
        ))}
        <p className="text-sm text-ink/70">
          提示扣 {settings.helpPenalty} 分鐘 / Help penalty {settings.helpPenalty}{" "}
          min
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-bold">YouTube 名單 / Allow-list</h2>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=…"
          className="min-h-14 w-full rounded-xl border-2 border-ink bg-paper px-3"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="名 / label"
          className="min-h-14 w-full rounded-xl border-2 border-ink bg-paper px-3"
        />
        {ytError ? <p className="text-sm text-terracotta">{ytError}</p> : null}
        <button
          type="button"
          onClick={addVideo}
          className="min-h-14 w-full rounded-xl border-2 border-ink bg-paper"
        >
          加入 / Add
        </button>
        <ul className="space-y-2">
          {settings.youtube.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-ink/20 bg-paper px-3 py-2"
            >
              <span>{item.label}</span>
              <button
                type="button"
                className="min-h-12 rounded-lg border border-ink/30 px-3"
                onClick={() => removeYoutube(item.id)}
              >
                刪 / Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-bold">緊急簽證 / Emergency grant</h2>
        <div className="flex gap-3">
          {[10, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => emergencyGrant(m)}
              className="pressable card-shadow min-h-16 flex-1 rounded-2xl border-2 border-ink bg-terracotta font-bold text-paper"
            >
              +{m}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => lockNow()}
          className="min-h-16 w-full rounded-2xl border-2 border-ink bg-ink text-paper"
        >
          而家鎖 / Lock now
        </button>
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">紀錄 / History (last 40)</h2>
          <button
            type="button"
            onClick={() => clearHistory()}
            className="min-h-12 rounded-lg border border-ink/30 px-3 text-sm"
          >
            清走紀錄 / Clear
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {history.length === 0 ? (
            <li className="text-ink/60">未有紀錄 / Empty</li>
          ) : (
            history.map((item) => (
              <li key={item.id} className="rounded-xl border border-ink/15 bg-paper px-3 py-2">
                {"★".repeat(item.stars)} · {item.minutes}m · {item.taskTitle}
                {item.help ? " · help" : ""}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-ink bg-paper p-4 text-sm leading-relaxed">
        <h2 className="font-bold">版本 / Version {APP_VERSION}</h2>
        <p className="mt-1 text-ink/60">{LATEST_DEV.date}</p>
        <p className="mt-3">{LATEST_DEV.zh}</p>
        <p className="mt-2 text-ink/80">{LATEST_DEV.en}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-ink/15 bg-paper p-4 text-sm leading-relaxed">
        <h2 className="font-bold">About</h2>
        <p className="mt-2">
          Locked name: Visa Games / 簽證遊戲. Ritual: 先做再玩.
        </p>
        <p className="mt-2">
          Also considered: Ink Visa 墨簽證 · Suit Lock 花色鎖 · Card Country 卡之國
          · Pen Border 筆界
        </p>
        <p className="mt-2">
          Honest limit: a website cannot OS-lock macOS. Use fullscreen + Screen
          Time. Kid-safe cards and visa minutes only.
        </p>
      </section>
    </div>
  );
}
