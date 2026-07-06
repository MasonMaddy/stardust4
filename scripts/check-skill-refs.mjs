// Verifies that every agent-layer path a skill names actually exists on disk.
// Scans skills/*/SKILL.md for backticked references to `references/...`,
// `context/...`, `scripts/...`, and cross-skill `../<skill>/...` paths, and
// fails if any target is missing — broken skill references have shipped
// before (a SKILL.md pointing at a reference file that was never created),
// and this guard keeps the skill layer honest.
// Out of scope: template placeholders (<...>, [...]), `docs/...` mentions
// (often illustrative examples; real pages are covered by check-links), and
// `../` paths whose first segment is not a skill directory (those are
// page-relative HTML examples quoted in prose).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const SKILLS = 'skills';
const PATH_RE = /`((?:references|context|scripts)\/[^`\s]+|\.\.\/[A-Za-z0-9._-]+\/[^`\s]+)`/g;
const skillDirs = new Set(readdirSync(SKILLS).filter((d) => statSync(join(SKILLS, d)).isDirectory()));

let failures = 0;
let checked = 0;
let files = 0;

for (const skill of readdirSync(SKILLS)) {
  const skillMd = join(SKILLS, skill, 'SKILL.md');
  if (!statSync(join(SKILLS, skill)).isDirectory() || !existsSync(skillMd)) continue;
  files++;
  const text = readFileSync(skillMd, 'utf8');
  for (const match of text.matchAll(PATH_RE)) {
    const ref = match[1];
    if (/[<>[\]*]|\.\.\.$/.test(ref)) continue; // placeholder ([component], <flow>) or ellipsis
    if (ref.startsWith('../') && !skillDirs.has(ref.split('/')[1])) continue; // not a cross-skill path
    const target = ref.startsWith('references/') || ref.startsWith('../')
      ? resolve(SKILLS, skill, ref)
      : resolve(ref); // context/ and scripts/ are repo-root-relative
    checked++;
    if (!existsSync(target)) {
      failures++;
      console.error(`${skillMd}: broken reference \`${ref}\` → ${target.split(sep).join('/')}`);
    }
  }
}

if (failures) {
  console.error(`check-skill-refs: FAIL — ${failures} broken reference(s).`);
  process.exit(1);
}
console.log(`check-skill-refs: OK — ${checked} path references across ${files} skills all resolve.`);
