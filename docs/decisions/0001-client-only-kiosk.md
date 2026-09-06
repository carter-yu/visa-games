# ADR 0001 — Client-only kiosk, auth/DB off

**Date:** 2026-09-06  
**Status:** Accepted

## Context

GitHub `carter-yu/visa-games` shipped constitution only. The kickoff describes a TanStack Start app with auth/DB available but **off**. This is a family-device kiosk: PIN and settings live on the Mac mini.

## Decision

Phase 0 is a Vite + React SPA. No server, no accounts, no database. Persist with zustand `localStorage` key `homework-first-v1` as named in the constitution.

## Consequences

- Default test suite stays offline.
- Parent PIN never leaves the device and is stored hashed.
- A later phase may add a shell (fullscreen helper, Screen Time notes) without changing the visa state machine.
