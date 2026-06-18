# Apollo source map

Apollo is Xplor's global design system — a mature, well-crafted system maintained by the
central Apollo team. These are the canonical sources for the `apollo-comparison` skill.
Treat them as a **reference**, never as the authority (see the priority ladder in
`../SKILL.md`).

## Sources

| Source | Platform | Access | Link |
|---|---|---|---|
| Apollo Foundation | Foundations (tokens, type, spacing, a11y principles) | Figma MCP | https://www.figma.com/design/qRzFFgT4Fy8p9GpUmV0g5E/Apollo-Foundation — node `2236-167219` |
| Apollo Web | Web components | Figma MCP | https://www.figma.com/design/MjjYek73MFnHmVNdm45Sd1/Apollo-Web — node `25169-8326` |
| Apollo Storybook | Web docs / guidelines | **Browser only** | https://xplor-apollo.herokuapp.com/?path=/docs/build-with-apollo--docs |
| Apollo iOS | iOS components | Figma MCP | https://www.figma.com/design/ivLdmd4tsxLrdjZRC3MzTW/Apollo-iOS — node `836-23731` |
| Apollo Android (M3) | Android components | Figma MCP | https://www.figma.com/design/yUqMFEkEpuPaono43sFhjo/Apollo-Android-M3 — node `1207-28014` |

## Access notes

- **Figma is the reliable source.** Use `get_metadata` on a file/page node to list
  component nodes, then `get_design_context` / `get_screenshot` on the specific component.
- **The Storybook is JavaScript-rendered** and cannot be fetched with `WebFetch` (it
  returns an empty shell). If web guideline text from Storybook is needed, ask the user to
  paste the relevant section or a screenshot — do not guess its contents.
- **Platform freshness:** Apollo Web + Foundation are the current references. Apollo's iOS
  and Android libraries predate recent platform guidance, so for native patterns defer to
  Apple HIG / Material 3 and note this respectfully (see SKILL tone rules).

## Per-component node map

Apollo component node IDs discovered during reviews can be recorded here for reuse.
(Leave additions to a separate authoring pass — the skill itself is read-only and must not
write during a review.)

| Stardust component | Apollo Web node | Apollo iOS node | Apollo Android node |
|---|---|---|---|
| _(none recorded yet)_ | | | |
