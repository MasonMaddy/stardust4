# Xplor Design System — HTML Doc Page Template

## Overview

Every component doc page is a single self-contained HTML file.
No external dependencies except Google Fonts (Sora + Inter).
All Xplor brand tokens are defined as CSS custom properties at the top of the file.

The page has two visual zones:
- **Left sidebar** — navigation (component name, status, sections)
- **Main content** — all 10 documentation sections
- **Engineering tab** — toggled section engineers write into

---

## CSS Variables (always include these — do not change)

```css
:root {
  /* Xplor Brand */
  --xp-coral: #FF5A35;
  --xp-coral-hover: #E04D2C;
  --xp-navy: #1A2B4A;
  --xp-navy-light: #243556;
  --xp-white: #FFFFFF;
  --xp-off-white: #F7F8FA;
  --xp-light-grey: #ECEEF2;
  --xp-mid-grey: #8A9BAE;
  --xp-text-body: #3D5068;
  --xp-success: #00A878;
  --xp-warning: #F5A623;
  --xp-error: #D94035;

  /* Typography */
  --font-heading: 'Sora', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Layout */
  --sidebar-width: 240px;
  --content-max: 860px;
}
```

---

## Status Badge Colours

```css
.status-wip        { background: #FEF3C7; color: #92400E; }
.status-beta       { background: #DBEAFE; color: #1E40AF; }
.status-stable     { background: #D1FAE5; color: #065F46; }
.status-deprecated { background: #FEE2E2; color: #991B1B; }
```

---

## Full Page Structure

Use this exact structure. Sections map 1:1 to the documentation standard.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[ComponentName] — Xplor Design System</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* === PASTE CSS VARIABLES BLOCK HERE === */
    /* === THEN PASTE BASE STYLES BELOW === */

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--xp-off-white); color: var(--xp-navy); display: flex; min-height: 100vh; }

    /* Sidebar */
    .sidebar { width: var(--sidebar-width); background: var(--xp-white); border-right: 1px solid var(--xp-light-grey); padding: var(--space-8) var(--space-6); position: fixed; top: 0; left: 0; height: 100vh; overflow-y: auto; }
    .sidebar-logo { font-family: var(--font-heading); font-size: 13px; font-weight: 700; color: var(--xp-coral); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: var(--space-8); }
    .sidebar-component-name { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--xp-navy); margin-bottom: var(--space-2); }
    .sidebar-nav { list-style: none; margin-top: var(--space-6); }
    .sidebar-nav li a { display: block; padding: var(--space-2) var(--space-3); font-size: 13px; color: var(--xp-text-body); text-decoration: none; border-radius: var(--radius-sm); transition: background 0.15s; }
    .sidebar-nav li a:hover { background: var(--xp-light-grey); color: var(--xp-navy); }
    .sidebar-nav li a.active { background: #FFF0EC; color: var(--xp-coral); font-weight: 600; }

    /* Main */
    .main { margin-left: var(--sidebar-width); flex: 1; padding: var(--space-12); max-width: calc(var(--sidebar-width) + var(--content-max)); }
    .main-inner { max-width: var(--content-max); }

    /* Header */
    .component-header { margin-bottom: var(--space-12); padding-bottom: var(--space-8); border-bottom: 2px solid var(--xp-light-grey); }
    .component-header h1 { font-family: var(--font-heading); font-size: 32px; font-weight: 700; color: var(--xp-navy); margin-bottom: var(--space-3); }
    .component-header .meta { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4); }
    .component-header p { font-size: 16px; color: var(--xp-text-body); line-height: 1.6; max-width: 640px; }

    /* Status badge */
    .status { display: inline-flex; align-items: center; gap: var(--space-1); padding: 3px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }
    .status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    /* Meta tags */
    .meta-tag { font-size: 12px; color: var(--xp-mid-grey); }

    /* Sections */
    .section { margin-bottom: var(--space-12); scroll-margin-top: var(--space-8); }
    .section h2 { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--xp-navy); margin-bottom: var(--space-6); padding-bottom: var(--space-3); border-bottom: 1px solid var(--xp-light-grey); display: flex; align-items: center; gap: var(--space-3); }
    .section h2 .section-num { font-size: 12px; font-weight: 600; color: var(--xp-coral); background: #FFF0EC; padding: 2px 8px; border-radius: var(--radius-full); }
    .section h3 { font-family: var(--font-heading); font-size: 15px; font-weight: 600; color: var(--xp-navy); margin: var(--space-6) 0 var(--space-3); }
    .section p { font-size: 14px; color: var(--xp-text-body); line-height: 1.7; margin-bottom: var(--space-4); }

    /* Tables */
    .ds-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: var(--space-6); }
    .ds-table th { background: var(--xp-light-grey); color: var(--xp-navy); font-weight: 600; text-align: left; padding: var(--space-3) var(--space-4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .ds-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--xp-light-grey); color: var(--xp-text-body); vertical-align: top; }
    .ds-table tr:last-child td { border-bottom: none; }
    .ds-table code { background: var(--xp-light-grey); padding: 1px 6px; border-radius: var(--radius-sm); font-family: 'Courier New', monospace; font-size: 12px; color: var(--xp-navy); }

    /* Token pill */
    .token { display: inline-block; background: #EEF2FF; color: #3730A3; padding: 2px 8px; border-radius: var(--radius-sm); font-family: monospace; font-size: 12px; }

    /* Code blocks */
    .code-block { background: var(--xp-navy); border-radius: var(--radius-md); padding: var(--space-6); margin-bottom: var(--space-6); overflow-x: auto; position: relative; }
    .code-block pre { font-family: 'Courier New', monospace; font-size: 13px; color: #E2E8F0; line-height: 1.6; white-space: pre; }
    .code-block .code-lang { position: absolute; top: var(--space-3); right: var(--space-3); font-size: 11px; color: var(--xp-mid-grey); font-family: monospace; }
    .code-block .copy-btn { position: absolute; top: var(--space-3); right: var(--space-8); background: var(--xp-navy-light); border: none; color: var(--xp-mid-grey); font-size: 11px; padding: 3px 8px; border-radius: var(--radius-sm); cursor: pointer; }
    .code-block .copy-btn:hover { color: var(--xp-white); }

    /* TODO placeholder */
    .todo { background: #FFFBEB; border: 1px dashed var(--xp-warning); border-radius: var(--radius-md); padding: var(--space-4); font-size: 13px; color: #92400E; margin-bottom: var(--space-4); }
    .todo::before { content: '⚠ TODO: '; font-weight: 600; }

    /* Engineering section */
    .eng-section { background: var(--xp-white); border: 1px solid var(--xp-light-grey); border-radius: var(--radius-lg); padding: var(--space-8); margin-top: var(--space-4); }
    .eng-section .eng-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); }
    .eng-section .eng-badge { background: var(--xp-navy); color: var(--xp-white); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: var(--radius-sm); letter-spacing: 0.04em; }
    .eng-section p.eng-note { font-size: 13px; color: var(--xp-mid-grey); font-style: italic; margin-top: var(--space-4); }

    /* States grid */
    .states-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6); }
    .state-card { background: var(--xp-white); border: 1px solid var(--xp-light-grey); border-radius: var(--radius-md); padding: var(--space-4); }
    .state-card .state-name { font-size: 11px; font-weight: 600; color: var(--xp-mid-grey); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-3); }
    .state-card .state-preview { min-height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-3); }
    .state-card .state-tokens { font-size: 11px; color: var(--xp-text-body); }

    /* Do/don't */
    .do-dont { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
    .do-card, .dont-card { border-radius: var(--radius-md); padding: var(--space-4); }
    .do-card { border: 1.5px solid var(--xp-success); background: #F0FDF9; }
    .dont-card { border: 1.5px solid var(--xp-error); background: #FEF2F2; }
    .do-card .label { color: var(--xp-success); font-size: 12px; font-weight: 700; margin-bottom: var(--space-2); }
    .dont-card .label { color: var(--xp-error); font-size: 12px; font-weight: 700; margin-bottom: var(--space-2); }
    .do-card p, .dont-card p { font-size: 13px; color: var(--xp-text-body); }

    /* Accessibility */
    .a11y-row { display: flex; gap: var(--space-4); padding: var(--space-4); border-bottom: 1px solid var(--xp-light-grey); align-items: flex-start; }
    .a11y-row:last-child { border-bottom: none; }
    .a11y-label { font-size: 12px; font-weight: 600; color: var(--xp-navy); min-width: 120px; flex-shrink: 0; }
    .a11y-value { font-size: 13px; color: var(--xp-text-body); }
    .a11y-pass { color: var(--xp-success); font-weight: 600; }
    .a11y-warn { color: var(--xp-warning); font-weight: 600; }

    /* Changelog */
    .changelog { font-size: 13px; }
    .changelog-entry { display: grid; grid-template-columns: 80px 80px 120px 1fr; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--xp-light-grey); }
    .changelog-entry:last-child { border-bottom: none; }
    .version-pill { background: var(--xp-light-grey); color: var(--xp-navy); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); display: inline-block; font-family: monospace; }

    /* Callout */
    .callout { border-left: 3px solid var(--xp-coral); background: #FFF7F5; padding: var(--space-4); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: var(--space-4); font-size: 13px; color: var(--xp-text-body); }
    .callout strong { color: var(--xp-navy); }
  </style>
</head>
<body>

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-logo">Xplor DS</div>
    <div class="sidebar-component-name">[ComponentName]</div>
    <nav>
      <ul class="sidebar-nav">
        <li><a href="#anatomy" class="active">Anatomy</a></li>
        <li><a href="#variants">Variants</a></li>
        <li><a href="#states">States</a></li>
        <li><a href="#usage">Usage guidelines</a></li>
        <li><a href="#tokens">Token references</a></li>
        <li><a href="#accessibility">Accessibility</a></li>
        <li><a href="#motion">Motion</a></li>
        <li><a href="#engineering">Engineering</a></li>
        <li><a href="#changelog">Changelog</a></li>
      </ul>
    </nav>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="main">
    <div class="main-inner">

      <!-- HEADER -->
      <div class="component-header">
        <h1>[ComponentName]</h1>
        <div class="meta">
          <span class="status status-wip">WIP</span>
          <span class="meta-tag">v1.0.0</span>
          <span class="meta-tag">Updated: [DATE]</span>
          <span class="meta-tag">DRI: [DESIGNER NAME]</span>
        </div>
        <p>[One or two sentences describing what this component is and what problem it solves.]</p>
      </div>

      <!-- SECTION 2: ANATOMY -->
      <section class="section" id="anatomy">
        <h2><span class="section-num">01</span> Anatomy</h2>
        <div class="todo">[Insert labelled anatomy diagram — screenshot from Figma with all parts named, or use the table below as the written equivalent]</div>
        <table class="ds-table">
          <thead><tr><th>Part</th><th>Description</th><th>Required</th><th>Tokens</th></tr></thead>
          <tbody>
            <tr><td>[Part name]</td><td>[What it does]</td><td>Yes</td><td><code>[token.name]</code></td></tr>
            <tr><td>[Part name]</td><td>[What it does]</td><td>No</td><td><code>[token.name]</code></td></tr>
          </tbody>
        </table>
      </section>

      <!-- SECTION 3: VARIANTS -->
      <section class="section" id="variants">
        <h2><span class="section-num">02</span> Variants</h2>
        <table class="ds-table">
          <thead><tr><th>Prop</th><th>Values</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td>variant</td><td>[primary, secondary, ghost]</td><td>primary</td></tr>
            <tr><td>size</td><td>[sm, md, lg]</td><td>md</td></tr>
          </tbody>
        </table>
        <div class="callout"><strong>Unsupported combinations:</strong> [List any explicitly unsupported variant combinations here]</div>
      </section>

      <!-- SECTION 4: STATES -->
      <section class="section" id="states">
        <h2><span class="section-num">03</span> States</h2>
        <div class="states-grid">
          <div class="state-card">
            <div class="state-name">Default</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">bg: <span class="token">color.action.primary</span></div>
          </div>
          <div class="state-card">
            <div class="state-name">Hover</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">bg: <span class="token">color.action.primary-hover</span></div>
          </div>
          <div class="state-card">
            <div class="state-name">Pressed</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">scale: 0.97</div>
          </div>
          <div class="state-card">
            <div class="state-name">Focused</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">ring: <span class="token">color.focus.ring</span></div>
          </div>
          <div class="state-card">
            <div class="state-name">Disabled</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">bg: <span class="token">color.action.disabled</span></div>
          </div>
          <div class="state-card">
            <div class="state-name">Loading</div>
            <div class="state-preview"><div class="todo" style="font-size:11px;padding:8px">Preview</div></div>
            <div class="state-tokens">[spinner token]</div>
          </div>
        </div>
      </section>

      <!-- SECTION 5: USAGE -->
      <section class="section" id="usage">
        <h2><span class="section-num">04</span> Usage guidelines</h2>
        <h3>Use this component when</h3>
        <p>[Describe the specific jobs this component is the right tool for]</p>
        <h3>Don't use this component when</h3>
        <p>[Explicit anti-patterns — name the alternative to use instead]</p>
        <h3>Do / Don't</h3>
        <div class="do-dont">
          <div class="do-card">
            <div class="label">✓ Do</div>
            <p>[Describe correct usage]</p>
          </div>
          <div class="dont-card">
            <div class="label">✕ Don't</div>
            <p>[Describe incorrect usage and why]</p>
          </div>
        </div>
      </section>

      <!-- SECTION 6: TOKENS -->
      <section class="section" id="tokens">
        <h2><span class="section-num">05</span> Token references</h2>
        <table class="ds-table">
          <thead><tr><th>Property</th><th>Token</th><th>Current value</th></tr></thead>
          <tbody>
            <tr><td>Background (default)</td><td><code>color.action.primary</code></td><td>#FF5A35</td></tr>
            <tr><td>Background (hover)</td><td><code>color.action.primary-hover</code></td><td>#E04D2C</td></tr>
            <tr><td>Background (disabled)</td><td><code>color.action.disabled</code></td><td>#C5C5C5</td></tr>
            <tr><td>Label text</td><td><code>color.text.on-action</code></td><td>#FFFFFF</td></tr>
            <tr><td>Border radius</td><td><code>radius.md</code></td><td>8px</td></tr>
            <tr><td>Focus ring</td><td><code>color.focus.ring</code></td><td>#1A2B4A</td></tr>
          </tbody>
        </table>
      </section>

      <!-- SECTION 7: ACCESSIBILITY -->
      <section class="section" id="accessibility">
        <h2><span class="section-num">06</span> Accessibility</h2>
        <div style="background: var(--xp-white); border: 1px solid var(--xp-light-grey); border-radius: var(--radius-md); overflow: hidden;">
          <div class="a11y-row">
            <span class="a11y-label">Touch target</span>
            <span class="a11y-value">[e.g. 44×44pt minimum — sm: 44×44, md: 48×48, lg: 56×56]</span>
          </div>
          <div class="a11y-row">
            <span class="a11y-label">Contrast</span>
            <span class="a11y-value"><span class="a11y-pass">✓ Passes AA</span> — #FFFFFF on #FF5A35 = [ratio]:1 <span class="todo" style="display:inline;padding:2px 6px;font-size:11px">Verify ratio</span></span>
          </div>
          <div class="a11y-row">
            <span class="a11y-label">ARIA role</span>
            <span class="a11y-value"><code>role="button"</code> — label via <code>aria-label</code> or visible text</span>
          </div>
          <div class="a11y-row">
            <span class="a11y-label">Keyboard</span>
            <span class="a11y-value">Tab to focus · Enter or Space to activate · [any other keys]</span>
          </div>
          <div class="a11y-row">
            <span class="a11y-label">Reduced motion</span>
            <span class="a11y-value">[Describe what happens — e.g. transitions disabled, spinner remains static]</span>
          </div>
          <div class="a11y-row">
            <span class="a11y-label">Screen reader</span>
            <span class="a11y-value">[Describe VoiceOver/TalkBack announcement — e.g. "[Label], button, double tap to activate"]</span>
          </div>
        </div>
      </section>

      <!-- SECTION 8: MOTION -->
      <section class="section" id="motion">
        <h2><span class="section-num">07</span> Motion &amp; interaction</h2>
        <table class="ds-table">
          <thead><tr><th>Trigger</th><th>Property</th><th>Duration token</th><th>Easing token</th><th>Reduced-motion</th></tr></thead>
          <tbody>
            <tr>
              <td>Hover</td>
              <td>background-color</td>
              <td><code>motion.duration.fast</code> (150ms)</td>
              <td><code>motion.easing.standard</code></td>
              <td>Instant</td>
            </tr>
            <tr>
              <td>Press</td>
              <td>scale</td>
              <td><code>motion.duration.fast</code> (150ms)</td>
              <td><code>motion.easing.standard</code></td>
              <td>Instant</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- SECTION 9: ENGINEERING -->
      <section class="section" id="engineering">
        <h2><span class="section-num">08</span> Engineering</h2>

        <div class="callout">
          <strong>For engineers:</strong> The sections below are your responsibility to complete.
          Design has filled in the props interface and acceptance criteria.
          Add your code snippet, Storybook link, and any implementation notes.
        </div>

        <!-- Props — pre-filled by design -->
        <h3>Props interface</h3>
        <div class="code-block">
          <span class="code-lang">TypeScript</span>
          <pre>interface [ComponentName]Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  iconPosition?: 'leading' | 'trailing' | 'none'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onPress: () => void
  children: React.ReactNode
}</pre>
        </div>

        <!-- Code snippet — engineer fills in -->
        <div class="eng-section">
          <div class="eng-header">
            <span class="eng-badge">ENGINEER</span>
            <h3 style="margin: 0; font-size: 14px;">Vue implementation</h3>
          </div>
          <div class="code-block">
            <span class="code-lang">Vue</span>
            <pre><!-- TODO: Engineer to add Vue component code here --></pre>
          </div>
          <p class="eng-note">Add your implementation once the component is built. Include any edge case handling or platform-specific notes.</p>
        </div>

        <div class="eng-section">
          <div class="eng-header">
            <span class="eng-badge">ENGINEER</span>
            <h3 style="margin: 0; font-size: 14px;">React Native implementation</h3>
          </div>
          <div class="code-block">
            <span class="code-lang">React Native</span>
            <pre><!-- TODO: Engineer to add React Native component code here --></pre>
          </div>
          <p class="eng-note">Add your implementation once the component is built.</p>
        </div>

        <!-- Storybook link -->
        <div class="eng-section">
          <div class="eng-header">
            <span class="eng-badge">ENGINEER</span>
            <h3 style="margin: 0; font-size: 14px;">Storybook</h3>
          </div>
          <div class="todo">Add Storybook link once the component is published</div>
        </div>

        <!-- Acceptance criteria — pre-filled by design -->
        <h3>Acceptance criteria</h3>
        <table class="ds-table">
          <thead><tr><th>#</th><th>Criterion</th><th>Verified by</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>All variants render correctly at all sizes</td><td>QA</td></tr>
            <tr><td>2</td><td>All states match token spec — no hardcoded values</td><td>Engineering</td></tr>
            <tr><td>3</td><td>Touch target meets 44×44pt minimum on mobile</td><td>QA</td></tr>
            <tr><td>4</td><td>Focus ring visible on keyboard navigation</td><td>QA</td></tr>
            <tr><td>5</td><td>Disabled state not focusable or pressable</td><td>QA</td></tr>
            <tr><td>6</td><td>Screen reader announces label and role correctly</td><td>QA</td></tr>
            <tr><td>7</td><td>Reduced motion: all transitions disabled</td><td>QA</td></tr>
            <tr><td>8</td><td>Component name in code matches Figma name exactly</td><td>Engineering</td></tr>
          </tbody>
        </table>
      </section>

      <!-- SECTION 10: CHANGELOG -->
      <section class="section" id="changelog">
        <h2><span class="section-num">09</span> Changelog</h2>
        <div class="changelog">
          <div class="changelog-entry" style="font-size:12px;font-weight:600;color:var(--xp-mid-grey);text-transform:uppercase;letter-spacing:0.04em;padding-bottom:8px;">
            <span>Version</span><span>Date</span><span>Author</span><span>Change</span>
          </div>
          <div class="changelog-entry">
            <span><span class="version-pill">1.0.0</span></span>
            <span>[DATE]</span>
            <span>Mason</span>
            <span>Initial spec — status: WIP</span>
          </div>
        </div>
      </section>

    </div><!-- /main-inner -->
  </main>

  <script>
    // Sidebar active state on scroll
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => observer.observe(s));

    // Copy code buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.code-block').querySelector('pre').textContent;
        navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    });
  </script>
</body>
</html>
```

---

## File naming

- One file per component
- Kebab-case: `button-primary.html`, `list-cell.html`, `modal-bottom-sheet.html`
- Lives in: `/design-system/docs/components/`
- An `index.html` in `/design-system/docs/` lists all components with their status badges

## When generating a doc page

1. Copy the full HTML structure above
2. Replace every `[ComponentName]` placeholder
3. Fill all sections you have data for
4. Mark all gaps with `<div class="todo">[what's needed]</div>`
5. Output as a single `.html` file
