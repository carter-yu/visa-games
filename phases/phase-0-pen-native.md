# Phase 0 — Pen-native child path

**Time box:** 1–2 hours  
**Goal:** A four-year-old can clear a card using only a stylus. Visa still stamps.  
**Standards:** Constitution `visa-games-grok-build-kick-start.md` §4–§6. Tests follow the cec-vivisystem unit-testing spine (happy path, failure/partial, contract shape, garbage does not crash). Offline, no secrets, no network.

Auth/DB stay **OFF**. Persist is local (`homework-first-v1`).

## Locked tests (written before implementation)

| ID | Case | Expect |
| --- | --- | --- |
| P1 | Trace circle with enough coverage | `hit >= threshold[1]` → success |
| P2 | Empty canvas “完成” | not success; teaching not auto unless 2 fails |
| P3 | Scribble >> path pixels | `scribble` failure, not success |
| P4 | Connect stroke picture→correct word | pair locks |
| P5 | Connect stroke picture→wrong word | pair rejected, attempt +1 |
| P6 | Help used | minutes = duration − penalty, min 1 |
| P7 | `endsAt` in the past | phase lock, play cleared |
| P8 | `parseYoutubeId` garbage | `null`, no throw |
| P9 | PIN 4 digits match / mismatch | boolean; 5 fails set lockout timestamp |

Suite file: `tests/phase0.test.ts`.

## Non-tests this phase

Tilt-as-brush, multi-pen, iPad native app, Wacom driver bugs, Screen Time automation, suit skins (♠♥♦♣), LLM teacher, accounts / cloud sync, extra task types, parent-admin redesign.

## Green bar

All nine locked cases plus contract-shape asserts for `Task`, `PlaySession`, `HistoryItem`. Typecheck + production build.

## Acceptance

- Child path has **zero** text inputs.
- Pointer events: `pen` / `touch` first-class; mouse still works with coach 「用筆畫」.
- Pressure ink (fallback 0.5), palm rejection, connect-by-stroke primary.
- PIN setup, 1/2/3-star cards, teach −3 minutes, play timer, parent admin still work.
- Preview remains the running app.
