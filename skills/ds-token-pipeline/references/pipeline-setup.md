# Xplor Design System — Token Pipeline Setup

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Source of truth | Figma Variables | Where tokens are defined and maintained |
| Export | Tokens Studio (Figma plugin) | Syncs Figma Variables → GitHub as DTCG JSON |
| Transform | Style Dictionary v4 | DTCG JSON → CSS vars + Tailwind + React Native |
| Automation | GitHub Actions | Runs Style Dictionary on every merge to main |
| Consumption (web) | Tailwind v4 `@theme` | CSS custom properties → utility classes (Vue/Office) |
| Consumption (mobile) | NativeWind v4 + RN StyleSheet | Token values consumed in React Native |

---

## Step 1 — Figma Variables setup

### Collection structure

Create three variable collections in Figma:

| Collection | Modes | Contains |
|---|---|---|
| `Primitives` | (none — single mode) | All raw values: coral.500, navy.900, etc. |
| `Semantic` | Light, Dark | Intent aliases referencing Primitives |
| `Component` | (none) | Component-scoped tokens referencing Semantic |

### Variable naming in Figma

Figma uses `/` as the path separator — this maps to `.` in DTCG.

In Figma → In DTCG token:
- `color/action/primary` → `color.action.primary`
- `spacing/4` → `spacing.4`
- `radius/md` → `radius.md`

Name variables in Figma exactly as the token should be named in code.
This is the most important consistency decision — don't change it after components are built.

### Variable descriptions

Fill in the description field for every semantic token. This becomes the
`$description` field in the DTCG export and surfaces in the token reference page.

---

## Step 2 — Export via Tokens Studio

### Plugin setup

1. Install Tokens Studio for Figma
2. In Settings → Token Format → select **W3C DTCG**
3. In Sync → connect to GitHub repository
4. Set the sync path: `/tokens/` (root of the tokens directory)
5. Set branch: `main` (or a dedicated `tokens` branch if preferred)

### File structure after export

```
/tokens/
  primitives.tokens.json
  semantic.tokens.json
  component.tokens.json
```

### Exporting

Tokens Studio exports on demand (push button) or on every save.
For Xplor, export on demand — review the diff in GitHub before merging.
This prevents accidental token changes going straight to production.

---

## Step 3 — Style Dictionary v4 config

### Install

```bash
npm install -D style-dictionary@4
```

### Config file: `sd.config.js`

```js
import StyleDictionary from 'style-dictionary'

const sd = new StyleDictionary({
  source: ['tokens/**/*.tokens.json'],

  platforms: {
    // CSS custom properties (web — Vue + Xplor Office)
    css: {
      transformGroup: 'css',
      prefix: 'xp',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root'
          }
        },
        {
          destination: 'tokens-dark.css',
          format: 'css/variables',
          filter: token => token.filePath.includes('semantic'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        }
      ]
    },

    // Tailwind v4 @theme block (web)
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/tailwind/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: '@theme'
          }
        }
      ]
    },

    // React Native (Playground mobile)
    reactNative: {
      transformGroup: 'react-native',
      buildPath: 'dist/react-native/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
          options: { outputReferences: false }
        }
      ]
    }
  }
})

await sd.buildAllPlatforms()
```

### Output files

After running Style Dictionary:

```
dist/
  css/
    tokens.css          ← :root { --xp-color-action-primary: #FF5A35; ... }
    tokens-dark.css     ← [data-theme="dark"] { ... }
  tailwind/
    tokens.css          ← @theme { --color-action-primary: #FF5A35; ... }
  react-native/
    tokens.ts           ← export const colorActionPrimary = '#FF5A35'
```

---

## Step 4 — GitHub Actions automation

### File: `.github/workflows/tokens.yml`

```yaml
name: Build design tokens

on:
  push:
    branches: [main]
    paths:
      - 'tokens/**'

jobs:
  build-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Style Dictionary
        run: node sd.config.js

      - name: Commit built tokens
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: rebuild tokens from DTCG source'
          file_pattern: 'dist/**'
```

This runs automatically whenever any file in `/tokens/` changes on main.
Engineers never need to manually run the transform.

---

## Step 5 — Consuming tokens in Vue + Tailwind

### Import in main CSS

```css
/* main.css */
@import '../../../design-system/dist/tailwind/tokens.css';
@import 'tailwindcss';
```

### Using tokens in Vue components

```vue
<template>
  <button class="bg-[--xp-color-action-primary] text-[--xp-color-text-on-action] rounded-[--xp-radius-md]">
    Submit
  </button>
</template>
```

Or via Tailwind utilities if tokens are mapped to the `@theme` block:

```vue
<button class="bg-action-primary text-on-action rounded-md">
  Submit
</button>
```

---

## Step 6 — Consuming tokens in React Native / NativeWind

### Import tokens

```ts
// In your component or theme provider
import tokens from '@xplor/design-system/dist/react-native/tokens'

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.colorActionPrimary,
    borderRadius: tokens.radiusMd,
  }
})
```

### With NativeWind v4

NativeWind v4 supports CSS variables via a custom CSS file.
Map Xplor tokens to Tailwind utilities in your NativeWind config:

```js
// tailwind.config.js (React Native)
module.exports = {
  theme: {
    extend: {
      colors: {
        'action-primary': 'var(--xp-color-action-primary)',
        'surface-default': 'var(--xp-color-surface-default)',
      },
      borderRadius: {
        'md': 'var(--xp-radius-md)',
      }
    }
  }
}
```

Then in components:
```tsx
<Pressable className="bg-action-primary rounded-md px-6 py-3">
  <Text className="text-on-action font-semibold">Submit</Text>
</Pressable>
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Token shows raw value instead of alias | `outputReferences: true` not set | Add to Style Dictionary file config |
| Dark mode not applying | Selector not matching | Check `[data-theme="dark"]` is set on `<html>` |
| RN tokens are undefined | Import path wrong | Check dist output path and tsconfig paths |
| Figma and code are out of sync | Export not triggered after change | Push export in Tokens Studio, check GitHub PR |
| Token name has hyphens in code | Style Dictionary transform | Use `name/cti/camel` transform for JS targets |
| NativeWind class not resolving | CSS var not in NativeWind CSS file | Import `tokens.css` in your NativeWind entry file |
