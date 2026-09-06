# visa-games

Visa Games（簽證遊戲）. Ritual line: 先做再玩.

A family kiosk on the Mac mini: the child finishes a card-game task
with a pen, then earns visa minutes of YouTube. Sibling of
[cec-vivisystem](https://github.com/carter-yu/cec-vivisystem), not a fork.

Honest limit: a website cannot OS-lock macOS. Fullscreen + Screen Time.

## Language policy

- User interaction: Cantonese + English
- Code, documentation, design, comments, commits: English only
- Never Simplified Chinese in the UI

## Run

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:5173 — first-run parent PIN, then three cards.

```bash
npm run typecheck
npm run build
```

Auth/DB stay off. Settings persist in localStorage key `homework-first-v1`.

## Version numbers

Ground rule 14 in the constitution: every family-visible slice gets a SemVer
number. After reload, the corner badge and the admin “版本 / Version” block
must match `src/lib/version.ts`. Bump that file and `package.json` together.

## Current status

See [PROGRESS.md](PROGRESS.md). Constitution is in
[visa-games-grok-build-kick-start.md](visa-games-grok-build-kick-start.md).
Phase 0 tests: `tests/phase0.test.ts` (P1–P9).

## Core documents

- Kickoff / constitution: visa-games-grok-build-kick-start.md
- cec-vivisystem spine (do not copy calendar/Slack code):
  philosophy, ground-rules, architecture, resilience, unit-testing,
  logging-and-retention