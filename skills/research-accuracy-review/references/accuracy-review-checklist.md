# Accuracy review checklist

The method `research-accuracy-review` works through. Two passes: **accuracy** (is each claim true vs
its source?) and **bias/integrity** (is it framed fairly?). Default every claim to *Unverified* and
promote it only on evidence. Re-pull the **primary source** — never confirm a claim by re-reading
the report that makes it.

---

## A. Accuracy pass — per data-point

### A1. Canny posts (each Sources & evidence row)
- [ ] **Exists** — re-pull via `retrieve_idea` (urlName or portalURL from the cited link) or
      `list_ideas` search. A post that can't be found → **🚫 Hallucinated**.
- [ ] **Title** matches the report (allow trivial casing/whitespace).
- [ ] **URL** resolves to that post and to the board the report implies.
- [ ] **Board** is right (e.g. report says "feature request" but it's on an `INTERNAL` board → note).
- [ ] **Vote count** matches. Votes change over time: a small increase since the report date is
      **drift** (note it, still ✅/🟡); a large gap, a decrease, or a wildly different number →
      **❌ Inaccurate**.
- [ ] **Status** (open/complete/closed/in-progress) matches — especially where the report leans on it.
- [ ] **Comment count** matches if cited.
- [ ] **Date** (created) matches the report's date column.

### A2. Quotes (Customer voice and any quote elsewhere)
- [ ] Quote appears **word-for-word** in the post body or a comment (`list_comments`). Paraphrase
      presented inside quotation marks → at least 🟡, often 🎭. A quote found nowhere → **🚫**.
- [ ] **Attribution** (segment / board / region) is supported by the source, not assumed.
- [ ] **PII stripped** — no personal names, emails, phone numbers, child/family identifiers, or
      named individual staff. Leaked PII → **🚫 hard stop**; flag location, do **not** reproduce it.

### A3. Web citations
- [ ] Open the cited URL (`WebFetch`/`WebSearch`). The page **actually supports** the specific claim.
- [ ] Claim isn't **overstated** beyond what the source says (e.g. "required" vs "recommended").
- [ ] **Jurisdiction** is correct and caveated where the report generalises (AU ≠ NZ/US/UK/EU).
- [ ] Source is **authoritative** for the claim (regulator/standard vs blog) — note weak sourcing.

### A4. Internal logic
- [ ] Each theme's **"backed by N sources"** count matches the source IDs it lists.
- [ ] Each **hypothesis** is labelled belief, not stated as evidence; has a confirm/kill test.
- [ ] **Recommendation** follows from *verified* evidence only — not from claims that failed above.
- [ ] No claim in Summary/Themes lacks a traceable row in Sources & evidence.

## B. Bias & integrity pass

- [ ] **Cherry-picking** — spot-check the relevant board(s) for **counter-signal**: posts that
      contradict or complicate the headline themes. Missing strong counter-evidence → 🎭 + a gap note.
- [ ] **Votes-as-proof** — report must treat votes as *demand signal*, not validation/proof.
- [ ] **Leading interpretation** — a takeaway/theme claiming more than its post says → 🎭.
- [ ] **Recency/staleness** — `complete`/`closed` posts cited as current unmet demand → 🎭/🟡.
- [ ] **Representativeness** — a single post framed as "a pattern"; sample scope (board/region/
      segment) not caveated.
- [ ] **Balance** — open questions / risks present, or is the report uniformly bullish?
- [ ] **Attribution accuracy** — segments inferred vs evidenced (see A2).

## Verdicts
✅ Verified · 🟡 Partly verified (note correction) · ⚠️ Unverified · ❌ Inaccurate · 🚫 Hallucinated
(or PII leak) · 🎭 Biased framing.

> **Vote-drift tolerance:** votes/counts that moved only modestly since the report's date are
> expected. Record the current number, mark as drift, keep the verdict ✅/🟡. Reserve ❌ for genuine
> mismatches (wrong post, wrong magnitude, status flipped).
