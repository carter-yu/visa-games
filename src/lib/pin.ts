export const PIN_MAX_FAILS = 5;
export const PIN_LOCKOUT_MS = 30_000;

export function isFourDigitPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function pinsMatch(a: string, b: string): boolean {
  return isFourDigitPin(a) && isFourDigitPin(b) && a === b;
}

export function recordPinAttempt(args: {
  ok: boolean;
  fails: number;
  lockoutUntil: number | null;
  now: number;
  maxFails?: number;
  lockoutMs?: number;
}): {
  ok: boolean;
  fails: number;
  lockoutUntil: number | null;
  lockedOut: boolean;
} {
  const maxFails = args.maxFails ?? PIN_MAX_FAILS;
  const lockoutMs = args.lockoutMs ?? PIN_LOCKOUT_MS;

  if (args.lockoutUntil != null && args.now < args.lockoutUntil) {
    return {
      ok: false,
      fails: args.fails,
      lockoutUntil: args.lockoutUntil,
      lockedOut: true,
    };
  }

  const failsBase =
    args.lockoutUntil != null && args.now >= args.lockoutUntil ? 0 : args.fails;

  if (args.ok) {
    return { ok: true, fails: 0, lockoutUntil: null, lockedOut: false };
  }

  const fails = failsBase + 1;
  if (fails >= maxFails) {
    return {
      ok: false,
      fails,
      lockoutUntil: args.now + lockoutMs,
      lockedOut: true,
    };
  }
  return { ok: false, fails, lockoutUntil: null, lockedOut: false };
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`visa-games/v1:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
