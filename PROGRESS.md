# Progress

- 2026-09-05: Named visa-games. GitHub repo created. Kickoff constitution committed.
- 2026-09-06: **Phase 0 — pen-native child path**
  - Rebuilt the §5 kiosk (no app source was on GitHub): first-run 4-digit PIN, optional child name, 1/2/3-star cards (10/18/28 min), trace + connect, teach overlay with −3 minute continue, visa stamp, play timer from `endsAt`, YouTube allow-list, parent admin (emergency 10/20/30, lock now, history last 40).
  - Evolved to pen-native: pressure ink (fallback 0.5), palm rejection (ignore touch while pen is down), connect-by-stroke primary with tap-tap fallback, coach 「用筆畫」 on lock + task. Child path has zero text inputs. PIN is an on-screen pad.
  - Locked tests P1–P9 written first in `tests/phase0.test.ts` — all green (13 tests). Typecheck and production build green.
  - Auth/DB off. Persist key `homework-first-v1`. SPA (ADR 0001), not a cec-vivisystem calendar/Slack copy.
  - Preview left running at http://127.0.0.1:5173/
  - Trace tolerance (same session): 1-star coverage 32% with a ~28px wobble corridor; nearby ink is not scored as scribble. Empty canvas and full-page scribble still fail (P1–P3 green).
  - Version 1.0.1 on every screen (corner + tab title). Admin shows version plus a short latest-dev note. Bump `src/lib/version.ts` and `package.json` together.
  - Constitution ground rule 14: assign a version number on every visible slice (PATCH / MINOR / MAJOR).
  - Next (out of scope): suit skins ♠♥♦♣ only after this pen path is proven in the house; no OS lock, no LLM teacher.
