# Atlassian write gate (shared by product-research and product-brief)

How these skills create Confluence pages and Jira issues — **safely**. Atlassian is the system of
record; the repo holds only the skills.

## The gate — always, no exceptions

1. **Draft** the page/card/epic content in the conversation (Guided or Drafted mode).
2. **Review** — the user reads it and edits until satisfied.
3. **Approve** — the user explicitly says to publish/create.
4. **Write** — only now call the write tool. Then report the URL/key back.

Never skip 1–3. A write to shared corporate Jira/Confluence is higher-stakes than a repo edit and
cannot be silently undone.

## Connection

- Site: `myxplorinfo.atlassian.net`
- cloudId: `05ceb7a0-2a4c-45ca-afa0-65cd331381ab`
- Access: read + write to Jira and Confluence (confirmed).

## Targets — CONFIRM BEFORE FIRST WRITE

> **Pending Mason's input (#6):** fill these in once confirmed. Until then, the skill must ask the
> user which space/project to target and **must not guess**.

| Purpose | System | Target | Status |
|---|---|---|---|
| Research reports | Confluence | space key: `<TODO>` | ⛔ confirm |
| Product briefs | Confluence | space key: `<TODO>` | ⛔ confirm |
| Discovery backlog cards | Jira | project key: `<TODO>`, issue type: `<TODO>` | ⛔ confirm |
| Epics (from brief slices) | Jira | project key: `<TODO>`, issue type: `Epic` | ⛔ confirm |

Prefer a **sandbox/test** space and project for any dry-run or verification work.

## Tools (load via ToolSearch at run time)

- Discover targets (read-only): `getConfluenceSpaces`, `getVisibleJiraProjects`,
  `getJiraProjectIssueTypesMetadata`.
- Create: `createConfluencePage` (needs cloudId, spaceId, title, body),
  `createJiraIssue` (needs cloudId, projectKey, issueTypeName, summary, description).
- Link: `createIssueLink` (Jira↔Jira), and add a link/section on the Confluence page back to the
  Jira card and vice versa, so research ↔ discovery card ↔ brief ↔ epics all reference each other.

## Safety rules

- No write without explicit approval (the gate above).
- Scope every write to the **confirmed** space/project — never a default or a guess.
- No secrets or PII in page bodies or issue descriptions.
- If a write fails, surface the error verbatim and stop — do not retry blindly into a different
  space/project.
