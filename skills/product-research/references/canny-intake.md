# Canny intake (read-only, via MCP)

How `product-research` pulls feature requests from Canny. Read-only — this skill never writes to
Canny.

## Setup (one-time, by the user)

The Canny MCP server is registered per the README "Canny MCP setup" section. It runs in
`readonly` mode and reads `CANNY_API_KEY` / `CANNY_SUBDOMAIN` from the environment — the key is
never committed. If `/mcp` doesn't list `canny`, stop and point the user to the README setup;
do not attempt to fetch Canny another way.

## Pulling requests

1. Load the Canny read tools via ToolSearch (e.g. list boards, list/get posts).
2. List boards, then pull posts from the relevant board(s).
3. For each post capture: title, the underlying **problem** (not just the requested solution),
   vote/score, status, board, and any notable comments.

> **Pending Mason's input (#5):** record which board(s) count as "feature requests" / customer
> opportunities here, so the skill targets the right ones instead of asking every time:
>
> | Board | Use as |
> |---|---|
> | `<TODO>` | `<TODO>` |

## Mapping a Canny post into the report

- A single post → a row in **Sources & evidence** (type: Canny, with the post link).
- A **cluster** of posts about one underlying need → a **theme** in Section 5; cite each post.
- High-vote posts are signal, not proof — weight them, don't treat votes as validation.
- Pull representative **verbatim** comments into **Customer voice**; strip PII.
