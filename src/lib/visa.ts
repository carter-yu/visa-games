export function visaMinutes(
  duration: number,
  helpUsed: boolean,
  penalty = 3,
  minMinutes = 1,
): number {
  const raw = helpUsed ? duration - penalty : duration;
  return Math.max(minMinutes, raw);
}

export function remainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
