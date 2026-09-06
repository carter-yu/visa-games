export function inkWidth(
  pressure: number | null | undefined,
  base = 16,
): number {
  const p = pressure == null || pressure === 0 ? 0.5 : pressure;
  return Math.max(10, base * (0.45 + p * 1.2));
}

export function shouldIgnorePointer(args: {
  pointerType: string;
  penDown: boolean;
}): boolean {
  return args.penDown && args.pointerType === "touch";
}

export function isPenLike(pointerType: string): boolean {
  return pointerType === "pen" || pointerType === "touch";
}
