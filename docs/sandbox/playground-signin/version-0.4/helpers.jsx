/*
 * Shared helpers for the Playground sign-in variants (variants.jsx uses ICON2 + phone2).
 *
 * ICON2 resolves icons from this folder's local assets/. V2Mark (the old plain "P" circle)
 * is no longer used by the variants — they use the supplied PLogo SVG — but it's kept here
 * for the archived original prototype (~/Downloads/playground-signin-old-prototype/) in case
 * it's ever restored into this folder.
 */
const ICON2 = (n) => `./assets/icons/${n}.svg`;

/* The Playground "P" mark — a circular emblem. */
function V2Mark({ size = 56, bg = 'radial-gradient(circle at 32% 28%, var(--sd-colour-cyan-400), var(--sd-colour-cyan-700))', shadow = '0 6px 18px rgba(0,119,107,0.30)', color = '#fff' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: shadow, flexShrink: 0,
    }}>
      <span style={{ color, fontWeight: 700, fontSize: size * 0.5, lineHeight: 1 }}>P</span>
    </div>
  );
}

/* Base style for the phone-screen container (single vertical flex column). */
const phone2 = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)',
  display: 'flex', flexDirection: 'column', position: 'relative',
};
