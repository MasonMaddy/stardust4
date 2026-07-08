// Guards the shared-CSS architecture: every component doc page must link
// its shared stylesheet from docs/assets/css/components/, and no page may
// re-declare a ds-* component rule inline. Catches silent reverts of the
// extraction (which have happened twice via concurrent-session git resets).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const PAGES_DIR = 'docs/components';
const SHARED_DIR = 'docs/assets/css/components';
// icons.html is an icon browser, not a ds-* component page
const EXEMPT = new Set(['icons.html']);

// Pages whose components compose others and must link those too
const EXTRA_LINKS = {
  'input.html': ['button.css', 'checkbox.css', 'radio-button.css', 'pill.css', 'title-block.css', 'avatar.css', 'card.css', 'bottom-sheet.css', 'menu.css'],
  'time-picker.html': ['input.css', 'menu.css'],
  'datatable.html': ['menu.css', 'checkbox.css', 'input.css', 'pill.css', 'modal.css', 'message-box.css', 'button.css', 'toggle.css', 'selection-pill.css'],
  'title-block.html': ['avatar.css', 'pill.css'],
  'card.html': ['title-block.css', 'avatar.css', 'pill.css', 'button.css', 'radio-button.css', 'checkbox.css', 'toggle.css'],
  'bottom-sheet.html': ['card.css', 'title-block.css', 'avatar.css', 'pill.css', 'button.css', 'radio-button.css', 'checkbox.css', 'toggle.css', 'fab.css', 'selection-pill.css'],
};

let failures = 0;
const fail = (msg) => { failures++; console.error(msg); };

for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'))) {
  if (EXEMPT.has(file)) continue;
  const path = join(PAGES_DIR, file);
  const html = readFileSync(path, 'utf8');
  const own = basename(file, '.html') + '.css';

  const required = [own, ...(EXTRA_LINKS[file] ?? [])];
  for (const css of required) {
    if (!existsSync(join(SHARED_DIR, css))) {
      fail(`${path}: expected shared stylesheet ${SHARED_DIR}/${css} does not exist`);
      continue;
    }
    if (!html.includes(`assets/css/components/${css}`)) {
      fail(`${path}: missing <link> to assets/css/components/${css} — extraction reverted?`);
    }
  }

  // Inline <style> must not re-declare component rules (top-level ds-* selectors).
  // Demo helpers may *target* ds-* inside compound selectors (e.g. ".slot-parent .ds-avatar"),
  // so only flag selectors that START with .ds- at a rule boundary.
  for (const styleBlock of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    const css = styleBlock[1].replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/(?:^|\}|;)\s*(\.ds-[a-z-]+[^{]*)\{/g)) {
      const selector = m[1].trim();
      fail(`${path}: inline component rule "${selector}" — belongs in ${SHARED_DIR}/`);
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-architecture: ${failures} violation(s).`);
  process.exit(1);
}
console.log('check-architecture: OK — all component pages link their shared CSS, no inline ds-* rules.');
