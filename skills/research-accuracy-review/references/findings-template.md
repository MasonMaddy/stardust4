# Research accuracy findings — template

The section `research-accuracy-review` **appends** to a report (as `## 9. Research accuracy
findings`). Append only — never edit the author's content above it. Keep it tight: a verdict, a
table, an integrity statement.

---

## 9. Research accuracy findings

- **Reviewer:** <name / "research-accuracy-review"> · **Date:** <YYYY-MM-DD>
- **Report reviewed:** <title> (<local .md path> / <Confluence URL>), report date <YYYY-MM-DD>
- **Headline verdict:** <one line — e.g. "Sound to proceed — 2 corrections, 1 framing note, 0
  hallucinations" — or "Do not advance: 1 hallucinated source, 1 PII leak. Fix first.">
- **Sources re-pulled:** <N Canny posts, M web citations> · **Checked against:** Canny
  (`xplor.canny.io`, read-only) + cited URLs.

### Findings

| # | Claim checked | Verdict | Checked against | Recommended fix |
|---|---------------|---------|-----------------|-----------------|
| 1 | <e.g. "Checklists for Rooms/Educators — 271 votes"> | ✅ Verified | Re-pulled post; 271 votes, open | — |
| 2 | <e.g. "Cleaning Checklist — open"> | ❌ Inaccurate | Post status is `closed` | Change status to closed in row 11 |
| 3 | <e.g. quote attributed to "QLD service"> | 🟡 Partly verified | Quote verbatim; region not in source | Drop "QLD" or cite the source for it |
| 4 | <e.g. "votes prove willingness to pay"> | 🎭 Biased framing | Votes = demand, not validation | Reframe as demand signal; keep as hypothesis H3 |
| … | | | | |

_Verdict key:_ ✅ Verified · 🟡 Partly verified · ⚠️ Unverified · ❌ Inaccurate · 🚫 Hallucinated /
PII leak · 🎭 Biased framing.

### Counter-signal checked
<Boards/queries spot-checked for contradicting evidence, and what (if anything) was found that the
report omitted. "None found" is a valid, useful result.>

### Integrity statement
- **Verified:** <what was confirmed against source>.
- **Could not verify:** <claims left ⚠️ and why — e.g. comment threads not exposed via MCP>.
- **PII / secrets:** <"none found" or flagged location — never reproduce the PII here>.
- **Recommendation:** <proceed to `product-brief` / proceed after fixes #2,#3 / do not proceed until
  #N resolved>.
