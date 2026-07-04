/*
 * Shared primitives for the Xplor Hub login prototype. Wired to real --sd-* tokens.
 * The Hub is a fixed landscape-tablet kiosk (1103×768) — one visual direction, light theme.
 * Loaded before xplor-hub-login.jsx; everything here is global to the other text/babel scripts.
 *
 * Token map (from the Figma "Xplor ID Login Flow" variables):
 *   Color/primary  #00776B → --sd-colour-action-primary (cyan-700)
 *   Color/success  #01A39D → --sd-colour-feedback-success-default (cyan-500)
 *   Color/border   #D0C7E5 → --sd-colour-border-default (purple-200)
 *   Color/bg-cyan  #DFF2F1 → --sd-colour-surface-cyan (cyan-50)
 *   Color/text     #252525 → --sd-colour-text-primary
 */
const { useState, useEffect, useRef } = React;

const TEAL = 'var(--sd-colour-action-primary)';        // #00776B
const LINK = 'var(--sd-colour-text-link)';             // #00776B
const CYAN_50 = 'var(--sd-colour-surface-cyan)';       // #DFF2F1
const BORDER = 'var(--sd-colour-border-default)';      // #D0C7E5
const INK = 'var(--sd-colour-text-primary)';           // #252525
const SUB = 'var(--sd-colour-text-secondary)';         // #838383
const SURFACE = 'var(--sd-colour-surface-default)';    // #FFFFFF
const DANGER = 'var(--sd-colour-orange-900)';          // #DB3B03 (end-shift / errors)

/* base style for one full Hub screen (fills the landscape device) */
const screenBase = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: INK, position: 'relative',
  display: 'flex', flexDirection: 'column', background: 'var(--sd-colour-surface-grey)',
};

/* ── Icons (inline SVG, stroke = currentColor) ── */
const Icon = {
  chevronRight: (s = 25) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chevronLeft: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  plus: (s = 30) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  eye: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>,
  eyeOff: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.4 5.2A9.6 9.6 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.3 6.3A17 17 0 002 12s3.5 7 10 7a9.6 9.6 0 003-.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  login: (s = 26) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l-5-5 5-5M5 12h11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  play: (s = 30) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.9" /><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" /></svg>,
  stop: (s = 30) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.9" /><rect x="8.5" y="8.5" width="7" height="7" rx="1.6" fill="currentColor" /></svg>,
};

/* the repo's button loading spinner glyph (sd-btn-spin from button.css) */
function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg className="ds-btn__spinner" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size, color }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 9" />
    </svg>
  );
}

/* top-right account avatar with a teal presence dot */
function Avatar({ size = 48 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--sd-colour-grey-400)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" fill="var(--sd-colour-grey-700)"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" /></svg>
      </div>
      <span style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: TEAL, border: '2px solid var(--sd-colour-surface-grey)' }} />
    </div>
  );
}

/* graceful image with an initials fallback tile (network photos can flake) */
function PhotoImg({ src, name, size = 64, radius = 12 }) {
  const [err, setErr] = useState(false);
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (err || !src) {
    return <div style={{ width: size, height: size, borderRadius: radius, background: CYAN_50, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.32, flexShrink: 0 }}>{initials}</div>;
  }
  return <img src={src} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }} />;
}

/* uppercase section label ("ROLE SELECT", "BOOKINGS TODAY", "AFTERNOON") */
function SectionLabel({ children, style }) {
  return <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: SUB, margin: '0 0 8px 2px', ...style }}>{children}</div>;
}

/* white panel container (the big "Rectangle 28" cards) */
function Panel({ children, style, pad = 30 }) {
  return <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: pad, boxSizing: 'border-box', ...style }}>{children}</div>;
}

/* session/status pill. tone: 'cyan' (booked/default) | 'orange' (casual highlight) */
function Pill({ children, tone = 'cyan' }) {
  const map = {
    cyan: { bg: CYAN_50, fg: TEAL },
    orange: { bg: 'var(--sd-colour-surface-orange)', fg: 'var(--sd-colour-feedback-warning-default)' },
  };
  const c = map[tone] || map.cyan;
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 'var(--sd-radius-full)', background: c.bg, color: c.fg, fontSize: 13, fontWeight: 600 }}>{children}</span>;
}

/* text link button (Forgot password, Sign out, Sign In, Casual Session, Change room …) */
function TextLink({ children, onClick, style }) {
  return <button type="button" onClick={onClick} className="fp-link" style={{ all: 'unset', cursor: 'pointer', color: LINK, fontWeight: 600, fontSize: 16, ...style }}>{children}</button>;
}

/* full-width primary button (Login / Sign in) */
function Btn({ children = 'Continue', onClick, disabled, loading, loadingLabel = 'Signing in…', style }) {
  const off = disabled || loading;
  return (
    <button type="button" className={off ? '' : 'fp-btn'} onClick={off ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 48, padding: '0 20px', textAlign: 'center',
      cursor: off ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-full)',
      background: disabled && !loading ? 'var(--sd-colour-action-disabled)' : TEAL,
      color: disabled && !loading ? 'var(--sd-colour-text-disabled)' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', ...style,
    }}>{loading ? <><Spinner size={18} color="#fff" />{loadingLabel}</> : children}</button>
  );
}

/*
 * Outlined text field with a notched floating label (matches the Figma "InputTextSelect" —
 * Material-style outlined input). `invalid` paints the border + label danger red.
 */
function Field({ label, type = 'text', placeholder, value, onChange, trailing, invalid, textarea, style }) {
  const [focus, setFocus] = useState(false);
  const border = invalid ? DANGER : (focus ? TEAL : 'var(--sd-colour-grey-500)');
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label style={{ position: 'relative', display: 'block', ...style }}>
      <span style={{
        position: 'absolute', top: -8, left: 12, padding: '0 6px', background: SURFACE, zIndex: 1,
        fontSize: 12, fontWeight: 500, color: invalid ? DANGER : (focus ? TEAL : SUB),
      }}>{label}</span>
      <Tag
        className="fp-input" type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        rows={textarea ? 3 : undefined}
        style={{
          boxSizing: 'border-box', width: '100%', margin: 0, padding: textarea ? '16px 46px 16px 16px' : '0 46px 0 16px',
          height: textarea ? 'auto' : 56, minHeight: textarea ? 96 : undefined, resize: textarea ? 'none' : undefined,
          fontFamily: 'var(--sd-font-family)', fontSize: 16, fontWeight: 400, lineHeight: textarea ? '1.5' : '56px',
          color: INK, background: SURFACE, border: `1.5px solid ${border}`, borderRadius: 'var(--sd-radius-lg)', outline: 'none',
        }}
      />
      {trailing && <span style={{ position: 'absolute', right: 14, top: 17, color: SUB, display: 'flex' }}>{trailing}</span>}
    </label>
  );
}
