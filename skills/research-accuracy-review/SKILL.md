---
name: research-accuracy-review
description: >
  Use this skill AFTER `product-research` has produced a research report, to fact-check it. It acts
  as a senior UX researcher reviewing a junior's work: it verifies every data point against its
  source of truth (Canny posts, web citations, the report's own internal logic), confirms each cited
  item actually exists, catches hallucinations and misquotes, checks vote/status accuracy, and flags
  biased or over-claimed framing. Triggers: "fact-check this research report", "QA the research",
  "verify the data points", "check for hallucinations / accuracy", "is this research accurate and
  unbiased", "accuracy review". It appends a *Research accuracy findings* section to the report. It
  is READ-ONLY on sources and does NOT rewrite the author's content, synthesise new research
  (`product-research`), or write a brief (`product-brief`).
---

# research-accuracy-review

A **senior UX researcher's accuracy pass** over a finished research report. The report's author
(`product-research`, AI- or human-drafted) did the synthesis; this skill independently checks that
**every data point is true, sourced, and fairly framed** — then appends a *Research accuracy
findings* section so reviewers can trust (or challenge) the report before it informs a decision.

**Where this sits:**
`product-research → research report (.md) → ` **research-accuracy-review** ` → product-brief`

**Operating principle (non-negotiable):** AI does the manual, exhausting part — re-pulling every
cited post, diffing quotes character-by-character, re-checking counts — so the human keeps judgement
and the final call. This skill **verifies; it does not author**. It never silently edits the report
body, never invents corrections, and never publishes findings without approval.

## 1. Orient — load the report and find its sources

1. Read the target report in full — the local `.md` draft
   (`session-notes/<date>-<slug>-research-report.md`) and/or the Confluence page if already
   published (read-only via the Atlassian fetch tool).
2. Build a **claim inventory**: enumerate every checkable assertion —
   - each **Sources & evidence** row (post exists, URL resolves, type/date right);
   - each **vote count / status / comment count** stated anywhere;
   - each **verbatim quote** in Customer voice (and any quote elsewhere);
   - each **theme**'s "backed by N sources" claim and its source IDs;
   - each **hypothesis** (is it correctly labelled belief, not evidence?);
   - each **web-cited fact** (does the cited URL actually support it?);
   - the **recommendation** (does it follow from the verified evidence?).
3. Confirm the Canny MCP is connected (`/mcp`) and load its read tools, plus `WebSearch`/`WebFetch`
   via ToolSearch. If Canny is not connected, stop and point the user to the README setup — do not
   guess whether a post exists.

## 2. Adopt the stance — skeptical, independent, unbiased

- **Default to "Unverified" until proven**, exactly as an adversarial reviewer would. A claim is not
  "true" because it's plausible or because the author is usually right.
- **Verify against the source, not the report.** Re-pull the primary source; don't confirm a quote
  by re-reading the report that contains it.
- **Separate two failure modes:** *inaccuracy* (the claim is wrong vs source) and *bias* (the claim
  is technically sourced but framed to mislead). Report both.
- **You are checking the author's work, not redoing the research.** If you find a *gap* (a strong
  contradicting signal the author missed), note it as a finding — don't go synthesise a new report.

## 3. Verify each data point against source of truth

Work the claim inventory item by item using `references/accuracy-review-checklist.md`. In short:

- **Canny posts** — re-pull each cited post (`retrieve_idea` by urlName/portalURL, or `list_ideas`
  search; `list_comments` for quoted comments). Confirm: the post **exists**; title and URL match;
  it's on the board the report implies; **vote/comment counts** match (treat small vote drift since
  the report date as *drift*, noted — not an error; flag large or impossible gaps); status matches.
- **Quotes** — every verbatim quote must appear **word-for-word** in the post body or a comment.
  A quote that can't be located is a **hallucination** — flag it hard. Check attribution (segment,
  board) and that **PII was stripped** (names, emails, child/family identifiers).
- **Web citations** — open the cited URL; confirm it **supports** the specific claim. Flag claims
  that overstate, misread, or aren't on the page. Note jurisdiction (e.g. AU-only) where the report
  generalises.
- **Internal logic** — recount each theme's "N sources"; confirm hypotheses are flagged as
  hypotheses (not stated as fact); confirm the recommendation rests on *verified* evidence only.

## 4. Bias & integrity checks (the senior-researcher lens)

Beyond "is it true", ask "is it fair" — see the bias checklist in
`references/accuracy-review-checklist.md`:

- **Cherry-picking** — were contradicting or negative posts ignored? Spot-check the board for
  counter-signal on the headline themes.
- **Votes-as-proof** — does the report treat vote counts as validation rather than as demand signal?
- **Leading interpretation** — does a takeaway claim more than its post actually says?
- **Recency/staleness** — are `complete`/`closed` posts cited as current unmet demand?
- **Representativeness** — is a single voice presented as a pattern? Is the sample's scope
  (board, region, segment) caveated?
- **Quote integrity & PII** — see §3; misattribution is a bias finding, leaked PII is a hard stop.

## 5. Score and assemble findings

Give every inventoried claim one verdict:

| Verdict | Meaning |
|---|---|
| ✅ Verified | Matches source exactly (or within noted vote-drift tolerance). |
| 🟡 Partly verified | Core is right; a detail (date, count, label) is off — note the correction. |
| ⚠️ Unverified | Could not confirm against any source — treat as unproven. |
| ❌ Inaccurate | Contradicts the source (wrong count/status/claim). |
| 🚫 Hallucinated | Post/quote/fact does not exist in any source. |
| 🎭 Biased framing | Sourced but framed misleadingly (cherry-pick, over-claim, votes-as-proof). |

Assemble per `references/findings-template.md`: a **headline verdict** (e.g. "Sound — 2 corrections,
0 hallucinations"), a **findings table** (claim · verdict · evidence/where-checked · recommended
fix), and an **integrity statement** (what was checked, what couldn't be, reviewer + date).

## 6. Review → Approve → Append (never silently edit)

1. Present the findings in the conversation.
2. The user reviews; agree which corrections the author should make. **This skill does not rewrite
   the report body** — it surfaces findings; the author (or the user) fixes the source claims.
3. On approval, **append** the assembled section as `## 9. Research accuracy findings` to the local
   `.md`. If the report is already on Confluence, append there too — via the gate in
   `../product-research/references/atlassian-write.md` (`updateConfluencePage`, appending only;
   never delete or overwrite the author's content).
4. If any 🚫 hallucination or 🚫 PII leak was found, say so plainly at the top of the findings and
   recommend the report **not** advance to `product-brief` until fixed.

## Hard rules

- **Read-only on all sources.** Canny and web access is for verification only; never write to Canny.
- **Verify, don't author.** Append findings; never rewrite, reword, or "improve" the report body.
- **No invented corrections or sources.** If you can't confirm it, it's ⚠️ Unverified — say so.
- **Independent of the author's framing.** Re-pull primary sources; don't trust the report's own
  restatement of them.
- **Vote counts drift** — note small post-dated changes as drift, not as errors; flag only material
  or impossible discrepancies.
- **No PII, no secrets** in findings; flag (don't reproduce) any PII the report leaked.
- **Append only, with approval** — the findings section is additive and human-gated, like every
  external write in this pipeline.

## Reference files

- `references/accuracy-review-checklist.md` — the per-data-point verification checklist + the bias
  & integrity checklist (the method).
- `references/findings-template.md` — the *Research accuracy findings* section format (the output).
- `../product-research/references/canny-intake.md` — how Canny posts are pulled (read-only); the
  board mapping to verify cited posts against.
- `../product-research/references/atlassian-write.md` — the shared draft→approve→write gate, used
  here only to **append** findings to an already-published page.
