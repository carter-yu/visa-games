# visa-games — Grok Build kickoff (pen-native)

**Project slug:** `visa-games`  
**Display name:** Visa Games / 簽證遊戲  
**Ritual line:** 先做再玩

**How to use this file**

1. Open a **new Grok Build** chat (or continue this app’s Build session).
2. Attach / paste **this whole file**.
3. Add one line at the top: `Build the next weekend slice of visa-games. Do not start from a blank scaffold.`
4. If you have already picked a name, write: `Use the name: <NAME>.`
5. If not, Grok Build must use the **working title** below and keep the other four names in the parent admin “about” note.

This document is the product constitution for the next sessions. It adopts the **cec-vivisystem** foundation ([carter-yu/cec-vivisystem](https://github.com/carter-yu/cec-vivisystem/tree/main)), translated onto this app. Engineering artifacts stay **English**. Child-facing UI stays **Hong Kong Cantonese + English**. Never Simplified Chinese.

---

## Cantonese TL;DR（家長）

做完功課先玩電腦。鎖畫面係啤牌／花色卡。做完一場「遊戲」就蓋一個「簽證」，簽證分鐘數 = 可以睇 YouTube 幾耐。小朋友**只用繪圖筆／手寫板**（或者手指當筆），唔好提早用 keyboard 同 mouse。家長先用密碼同鍵盤。

呢個係瀏覽器全螢幕鎖，**唔能夠喺系統層鎖死 Mac**。Mac mini 全螢幕開住，再配 Screen Time。

---

## 1. Five names (Alice in Borderland — kid-safe)

The Netflix series is **not** to be cloned. Do **not** use character names (Arisu, Usagi, Chishiya, …), the Beach hotel, Joker lore, death games, lasers, or Netflix/manga art. Borrow only the **mechanic** that a four-year-old can feel:

| Series mechanic | This product (softened) |
| --- | --- |
| Playing-card games | Homework tasks printed as cards |
| Number / suit = difficulty | 1 / 2 / 3 star, later mapped to suits |
| **Visa days** after a win | **Visa minutes** of YouTube / play |
| Empty city until you play | Locked computer until a card is cleared |
| Body / wits as the only tool | **Pen / stylus** as the only child tool |

### The five names

| # | English | 中文 | Why it fits | Tone |
| --- | --- | --- | --- | --- |
| 1 | **Visa Games** | 簽證遊戲 | Closest mapping: finish a card game → visa extended. Clear for parents. | **Recommended working title** |
| 2 | **Ink Visa** | 墨簽證 | The visa is stamped in ink. Forces the pen story. | Craft / stationery |
| 3 | **Suit Lock** | 花色鎖 | Spades / hearts / diamonds / clubs as difficulty. Very “card table”. | Graphic, lock-screen |
| 4 | **Card Country** | 卡之國 | A country you enter by drawing on cards. Echoes “country of the edge” without the Japanese title. | Fairy-tale |
| 5 | **Pen Border** | 筆界 | The border between homework and play is crossed only with a pen. | Poetic, stylus-first |

**Chosen name (locked 2026-09-05):** **Visa Games（簽證遊戲）**, slug `visa-games`. Ritual sentence remains `先做再玩`. Do not bikeshed names.

If the family replies with a number 1–5, rename the visible product (title, lock heading, `site.json` title) in that same session. Do not bikeshed.

---

## 2. What this product is

A **kiosk web app** on the family Mac mini.

- Child sits at the desk with a **drawing tablet or stylus**.
- Screen shows three (later four-suit) cards.
- Completing a task **grants a visa** (play minutes). Harder card → longer visa.
- Fail / “teach me” still lets them through, but **minus 3 minutes** (parent-configurable).
- Parent PIN unlocks an admin page (durations, YouTube allow-list, lock now, history).
- Play happens **inside** the app (allow-listed YouTube) so the timer can lock again.

**Honest limit:** a website cannot OS-lock macOS. Fullscreen + Screen Time is the real-world pair. Never pretend otherwise.

**Age:** ~4, kindergarten. Exploratory learning. Short sessions. Large targets. Speak words aloud (`zh-HK` then `zh-TW`).

---

## 3. Pen is the child’s only instrument

Kindergarten and primary homework is **held in a fist with a pencil**, not a mouse and not a keyboard. This is a founding product rule, not a skin.

### Child path (lock, task, teach, result)

Allowed:

- Stylus (`pointerType === "pen"`) — first-class: pressure, tilt if present.
- Finger (`touch`) — treated as a fat pencil. Allowed so a tablet still works.
- Large tap targets (≥ 56px) for choosing a card or a pair.

Forbidden on the child path:

- Keyboard (no character input, no shortcuts required).
- Mouse-only hover states as the only affordance.
- Tiny click-drag that needs a precise cursor.
- Text fields, search boxes, URL bars.
- Multi-key PIN typed on a physical keyboard (PIN is a **big on-screen pad**, stylus-tappable — parent uses this too).

If `pointerType === "mouse"` on the child path: still work (grandparents, preview), but show a calm coach: **「用筆畫」**. Do not block the preview.

### Pen behaviours to implement (next slice)

1. **Trace / write tasks** — already canvas-stroke. Add:
   - stroke width from `pressure` (fallback 0.5)
   - ignore coarse `touch` while a `pen` is down (palm rejection)
   - `touch-action: none`, prevent scroll while drawing
2. **Connect / 連連看** — do **not** rely on tap-tap as the primary. Primary = **draw a stroke from picture to word**. Tap-tap remains a fallback.
3. **Card pick** — one solid stylus tap. No double-click.
4. **No undo stacks.** One fat **擦走重畫** button.
5. Parent path (admin, YouTube URL paste, rename) **may** use keyboard. That is the adult seam.

Hardware assumption: Mac mini + USB/Bluetooth drawing tablet (Wacom / XP-Pen / Huion class) or iPad as sidecar. Design for **pen on a horizontal tablet**, screen in front. Cursor offset is normal; hit targets must be huge.

---

## 4. Foundation adopted from cec-vivisystem

Source of the rules (read if needed, do not copy calendar/Slack code):

- [docs/philosophy.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/philosophy.md)
- [docs/ground-rules.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/ground-rules.md)
- [docs/architecture.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/architecture.md)
- [docs/resilience.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/resilience.md)
- [docs/unit-testing.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/unit-testing.md)
- [docs/logging-and-retention.md](https://github.com/carter-yu/cec-vivisystem/blob/main/docs/logging-and-retention.md)

Kevin Kelly, *Out of Control*: grow from the bottom up, maximize decentralization, honor errors, hive mind, distributed control.

This app is **not** a second copy of cec-vivisystem. It is a **sibling vivisystem**: small replaceable parts, weekend slices, no hidden brain. Calendar/Slack rules do **not** transfer. The spine below does.

### Binding ground rules (this project)

1. **Time reality** — 1–2 hour weekend sessions. Every change leaves a working app.
2. **Bottom-up growth** — add only the next proven capability. No full-system redesign.
3. **Resilience first** — tests, visible failure, no silent swallow.
4. **Unit tests mandatory** — every slice locks a test plan **before** code. Happy path, failure/partial, contract shape, garbage input does not crash. Offline, no secrets, no network in the default suite.
5. **Logging + retention** — structured boundary logs; every store has a purge story. Session history is class **B audit-ish** (90 days cap in UI: keep last 40 is fine; document it). PIN never logged. Child name logged only as length/presence, not the raw string at INFO.
6. **Human confirmation** — anything that **grants visa minutes without a completed task**, changes PIN, or adds YouTube, is a **parent** action behind the PIN. The child cannot grant themselves time.
7. **Source of truth** — local persisted settings + live visa countdown (`endsAt` timestamp, not a ticking `setInterval` as truth). Not Google Calendar.
8. **No hidden orchestrator** — UI phases are a state machine (`setup | lock | task | result | play | admin`). Tasks, tracing, matching, speech, YouTube are separate parts with contracts. Do not grow a god-object “AI teacher”.
9. **Language** — UI: Cantonese + English. Code, comments, commits, phase docs, ADRs: **English only**. Never Simplified Chinese in UI.
10. **Decision records** — non-obvious decisions go in `docs/decisions/` as short ADRs.
11. **Progress visibility** — end of session: update `PROGRESS.md` (create it if missing).
12. **Phase docs inherit standards** — a phase may narrow **scope**, never waive tests or logging/retention.
13. **Secrets stay local** — parent PIN lives in local persistence (family device). Never ship a default PIN in the repo that unlocks production. Never log the PIN.
14. **Assign a version number** — every slice that the family can see after a reload gets a SemVer `MAJOR.MINOR.PATCH` (current start: **1.0.1**). Bump **PATCH** for a fix or small UX change, **MINOR** for a new weekend capability, **MAJOR** only for a breaking persist/shape or a family-visible product change. In the same change: set `src/lib/version.ts` (`APP_VERSION` + bilingual `LATEST_DEV`) and `package.json`; show `v…` on **every** screen; put version + a short latest-dev note on the parent admin page; note it in `PROGRESS.md`. Never ship a visible change without bumping the version — that number is how we know the reload worked.

### Architecture shape (hive, not a brain)

                    ┌─────────────────────────────┐
                    │     External environment     │
                    │  Mac mini · tablet · YouTube │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
 ┌────────────┐            ┌─────────────┐            ┌─────────────┐
 │ Card table │───────────▶│ Task body   │───────────▶│ Visa stamp  │
 │ (lock UI)  │  pick card │ (trace /    │  success / │ (minutes +  │
 └────────────┘            │  connect)   │  teach-3m  │  endsAt)    │
                           └──────┬──────┘            └──────┬──────┘
                                  │                          │
                                  ▼                          ▼
                           ┌─────────────┐            ┌─────────────┐
                           │ Teacher     │            │ Play room   │
                           │ (demo only) │            │ (YouTube    │
                           └────────────┘            │  allow-list)│
                                                     └──────┬──────┘
                                                            │
                                                     ┌──────┴──────┐
                                                     │ Parent gate │
                                                     │ (PIN pad)   │
                                                     └─────────────┘

Speech, pictograms, persistence, and YouTube parse are **libraries**, not a central controller.

**Parser lesson from cec-vivisystem:** keep a stable contract (`pickTask(stars) -> Task`, `evaluateTrace(...) -> { hit, painted }`) so the drawing engine can change (mouse → pen pressure) without rewriting the visa stamp.

### Testing standard (adapted from cec-vivisystem)

Stack here is TypeScript / React, not Python. Default suite must still be **offline and deterministic**.

When a component is born or extended:

| Category | Requirement |
| --- | --- |
| Happy path | Realistic child input (a traced circle, a correct pair stroke) |
| Failure / partial | Too little ink, scribble-everywhere, wrong pair, expired visa |
| Contract / shape | `Task`, `PlaySession`, `HistoryItem` fields asserted |
| Garbage | Empty stroke, nonsense YouTube URL → controlled error, no crash |
| Time | Injectable `now` / `endsAt`; family TZ `Asia/Hong_Kong`; no wall-clock flakes |
| Pen | Tests may inject pointer events with `pointerType: "pen"`; do not require a real tablet |

Phase docs lock named cases **before** implementation. Non-tests must be listed.

### Logging / retention (adapted)

Minimum fields: `timestamp`, `level`, `component`, `event`, `outcome`, `duration_ms` on completion, `error_type` on failure, `correlation_id` per attempt (card pick → task → visa).

| Class | This app | Retention |
| --- | --- | --- |
| A logs | console structured events | session |
| B audit | history of visas granted (stars, task title, help?, minutes) | last 40 in UI; do not grow unbounded |
| C operational | active task, `play.endsAt` | until terminal + refresh |
| F settings | PIN, child name, durations, YouTube list | until parent deletes |

No store without a purge story. PIN is not audit text.

---

## 5. What already exists (do not rewrite)

Working web app, ritual name **先做再玩**:

- First-run parent PIN (4 digits, confirm) + optional child name
- Lock screen: three playing cards — 簡單 10m / 適中 18m / 挑戰 28m
- Tasks: **trace** (shapes, numbers, 口人日月山木…) and **connect** (picture ↔ 中文/English)
- Teach overlay; help deducts 3 minutes
- Result → play timer; YouTube allow-list in admin
- Parent PIN gate, emergency grant 10/20/30, lock now, history
- Persist: `localStorage` via zustand (`homework-first-v1`)
- HK Cantonese copy, `zh-Hant`, cream / ink / terracotta

**Keep this vertical slice working every weekend.** Pen-native is an evolution of trace + connect, not a new product.

### Code map (for the next agent)

| Area | Where |
| --- | --- |
| State machine | `src/lib/store.ts` |
| Task catalog | `src/lib/tasks.ts` |
| Trace engine | `src/lib/trace.ts`, `src/components/trace-task.tsx` |
| Connect | `src/components/connect-task.tsx` |
| Lock cards | `src/components/lock-screen.tsx` |
| Play / YouTube | `src/components/play-time.tsx`, `src/lib/youtube.ts` |
| Parent | `src/components/admin-panel.tsx`, `src/components/pin-pad.tsx` |
| Speech | `src/lib/speech.ts` |

Auth/DB stay **OFF**. No accounts. Family device.

---

## 6. Next weekend slice (Phase 0 of *this* repo)

**Name:** Pen-native child path  
**Time box:** 1–2 hours  
**Goal:** A four-year-old can clear a card using only a stylus. Visa still stamps.

### In scope

- Pointer capture with `pen` / `touch` / mouse coach-mark
- Pressure-aware ink on trace
- Palm rejection (ignore touch while pen is down)
- Connect-by-stroke as primary
- Visible “用筆畫” on lock + task
- Unit tests for trace coverage + connect stroke hit + visa minutes math
- `PROGRESS.md` + this phase checked off

### Out of scope (later phases)

- Real OS lock / kiosk profiles
- Suit skins (♠♥♦♣) replacing stars — only after pen path is proven
- LLM teacher
- Accounts / cloud sync
- Extra task types
- Redesign of parent admin

### Locked tests (write these first)

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

Non-tests this phase: tilt-as-brush, multi-pen, iPad native app, Wacom driver bugs, Screen Time automation.

### Acceptance

- Child path has **zero** text inputs.
- Drawing works with pointer events in a browser (agent can synthesize `pen`).
- Existing PIN setup, cards, teach-3-minutes, play timer, parent admin still work.
- Typecheck + production build + browser smoke still green.
- Preview remains the running app.

---

## 7. Prompt to paste into Grok Build

Copy from the next line to the end of this section:

You are continuing an existing TanStack Start app (homework-first computer lock).
Do NOT scaffold a new blank app. Do NOT switch auth/db on.

Read visa-games.md and follow it as the constitution.

Chosen name (locked): visa-games / Visa Games（簽證遊戲）. Ritual line: 先做再玩.
Foundation: cec-vivisystem ground rules adapted in that file (weekend slices, tests first, no hidden orchestrator, Cantonese+English UI, English-only engineering).

This slice = Phase 0 pen-native child path:
- Stylus / drawing tablet is the child's only instrument (pen + finger). No keyboard/mouse required on lock/task/result.
- Pressure ink, palm rejection, connect-by-stroke, coach mark 「用筆畫」.
- Keep visa minutes, 3-minute teach penalty, parent PIN, YouTube allow-list.
- Lock the test table in visa-games.md §6 before coding; implement until green.
- End with PROGRESS.md.

Kid-safe Alice in Borderland metaphor only (cards + visa minutes). No character names, no death-game imagery.

---

## 8. Family notes for later (not this slice)

- Mac mini on a desk, tablet in the child’s lap or on the desk.
- Parent sets PIN once; child never sees it.
- YouTube is an allow-list, not open search, unless a later ADR says otherwise.
- Name is locked: visa-games / 簽證遊戲. Do not rename again unless the family asks.

---

*Adopted from cec-vivisystem (Kevin Kelly vivisystem spine) on 2026-09-05. Sibling system, not a fork of calendar/Slack.*