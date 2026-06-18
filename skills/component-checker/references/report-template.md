# Audit Report Template

Produce the audit in this shape. Lead with the verdict so the designer sees the headline first.

---

```markdown
# Component Checker — <File / Page name>

**Target:** <figma url>  ·  **Checked:** <date>  ·  **Against:** Stardust Components (`a7JnfZ0Nd8df1TBPaMQ5Tj`)

## Verdict
<one line: e.g. "🔴 Not on-system — 6 of 11 elements are detached or off-token" or
"🟢 Fully aligned — all 14 elements are Stardust instances on mapped tokens">

| | Count |
|---|---|
| ✅ On-system | n |
| 🟡 Minor | n |
| 🟠 Major | n |
| 🔴 Critical | n |
| ❓ Unverified | n |
| **Total elements** | n |

## Findings (severity-ranked)

| Sev | Element (node) | Issue | Fix |
|---|---|---|---|
| 🔴 | Button-shaped frame `1:1611` | Detached — not a `Stardust/Button` instance; fill is raw `#00776B` | Replace with `Stardust/Button` (type=solid); fill inherits `colour/action/primary` |
| 🟠 | Avatar `18:275` | Real instance, but border bound to `colour/cyan/700` (base) | Rebind stroke to `colour/border/focus` (mapped) |
| 🟡 | NavBar title `367:721` | Uses `Subtitle/Medium`; spec expects `Subtitle/Regular` | Swap text style |

## Provenance summary
- Library instances confirmed from `a7JnfZ0Nd8df1TBPaMQ5Tj`: <list>
- Off-system / detached: <list>
- From a non-Stardust library: <list>
- Unverified (tools couldn't confirm): <list>

## Token summary
- Bound to `mapped`: n  ·  bound to `base` primitive: n  ·  raw/detached: n  ·  greenfield palette: n

## Live-alignment notes
<any element that is a correct instance but whose value diverges from docs/ or the live site>

## Coverage
<state the scope checked and anything skipped/capped — never imply full coverage if it wasn't>
```

---

Rules:
- Every 🔴/🟠 finding must name the **node id** and give a **concrete, single fix** — which
  component to swap to, or which exact `mapped` token to rebind.
- Sort findings 🔴 → 🟠 → 🟡.
- If everything passes, still print the table and the per-element provenance so the
  designer can see it was actually checked, not assumed.
