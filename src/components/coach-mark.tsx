export function CoachMark({ mouseHint }: { mouseHint?: boolean }) {
  return (
    <div
      className={`pointer-events-none rounded-full border-2 border-ink/20 bg-paper/90 px-4 py-2 text-center shadow-sm ${
        mouseHint ? "animate-pulse border-terracotta" : ""
      }`}
    >
      <div className="text-lg font-semibold tracking-wide">用筆畫</div>
      <div className="text-xs text-ink/70">Use the pen</div>
    </div>
  );
}
