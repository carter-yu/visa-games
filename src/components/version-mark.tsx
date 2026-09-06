import { VERSION_LABEL } from "../lib/version";

/** Visible on every phase so a hard-reload can be matched to this build. */
export function VersionMark() {
  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-20 rounded-lg border border-ink/20 bg-paper/90 px-2 py-1 text-xs tabular-nums text-ink/70"
      aria-label={`Version ${VERSION_LABEL}`}
    >
      {VERSION_LABEL}
    </div>
  );
}
