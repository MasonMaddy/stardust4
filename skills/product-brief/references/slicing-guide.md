# Slicing an initiative into epics

Goal: break an initiative into **small, independently releasable chunks** that deliver customer
value early and let engineering iterate fast — then represent each as an epic in the delivery
project.

## What a good slice is
- **Releasable on its own.** It ships value (or learning) without waiting for later slices. If it
  can't stand alone, it's a task within a slice, not a slice.
- **Thin and vertical.** Prefer a narrow end-to-end path (one user can do one valuable thing) over
  a horizontal layer (e.g. "all the backend") that ships no user value.
- **Lever-moving.** Each slice should connect to a Key Result from the brief. If it doesn't move a
  lever, question whether it's in this initiative.
- **Small.** Roughly weeks, not months. If a slice feels like a quarter, slice it again.

## How to derive slices
1. Start from the brief's **User Stories**, ordered by Importance.
2. Group stories that must ship together to be usable; that group is a candidate slice.
3. Find the **smallest first slice** that proves the hypothesis or unblocks the most value — ship
   that first (a walking skeleton, not a foundation-only release).
4. Sequence the rest by value and dependency. Note dependencies explicitly. **If a slice consumes
   integration-fed data (QikKids/Discover — see the brief's Stardust appendix), give the
   dependency its own spike or dependency epic** rather than burying it inside a feature slice —
   integration unknowns are the classic silent schedule-killer.
5. Pull **stretch / low-importance** stories (e.g. "nice to have" items) into later slices or Out
   of Scope — don't let them bloat slice one.

## Then: the engineering check (a loop, not a gate)
- Share the proposed slices with the eng team **before** creating epics.
- Expect them to reshape boundaries for feasibility/sequencing — that's the point.
- Adjust and re-confirm. Only create/realign epics once there's agreement.

## Slice → epic
- One slice → one epic in the **delivery project** (e.g. `PES` — confirm per initiative; epics do
  not live in `XR`). Use `epic-template.md`.
- Link every epic back to the brief and the initiative so the chain
  initiative → brief → epics is navigable.
