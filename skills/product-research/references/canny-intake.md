# Canny intake (read-only, via MCP)

How `product-research` pulls feature requests from Canny. Read-only — this skill never writes to
Canny.

## Setup (one-time, by the user)

Canny is reached via the **official Canny MCP** (remote, OAuth) — see the README "Canny MCP
setup" section. The user authenticates in-browser against the `xplor.canny.io` workspace; there
is no API key in the repo. If `/mcp` doesn't list `canny` as connected, stop and point the user
to the README setup — do not attempt to fetch Canny another way.

## Pulling requests

1. Load the Canny MCP tools via ToolSearch (e.g. list boards, list/get posts).
2. List boards in the `xplor.canny.io` workspace, then pull posts from the relevant board(s).
3. For each post capture: title, the underlying **problem** (not just the requested solution),
   vote/score, status, board, and any notable comments.

> **Board mapping (confirm with the user on first run, then record here):** the `xplor.canny.io`
> workspace's feature-request board(s) weren't enumerated at build time. On first use, list the
> boards and confirm which count as customer feature requests, then note them below so future runs
> target them directly:
>
> | Board | Use as |
> |---|---|
> | _(list on first run)_ | feature requests / opportunities |

## Mapping a Canny post into the report

- A single post → a row in **Sources & evidence** (type: Canny, with the post link).
- A **cluster** of posts about one underlying need → a **theme** in Section 5; cite each post.
- High-vote posts are signal, not proof — weight them, don't treat votes as validation.
- Pull representative **verbatim** comments into **Customer voice**; strip PII.
