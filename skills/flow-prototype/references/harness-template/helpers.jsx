/*
 * Shared primitives for the flow prototype. Wired to real --sd-* tokens.
 * `dark` on any primitive = the translucent-on-teal treatment for a full-bleed dark direction.
 * Loaded before flow.jsx; everything here is global to the other text/babel scripts.
 */
const { useState, useEffect } = React;

const TEAL = 'var(--sd-colour-action-primary)';            // #00776B
const LINK = 'var(--sd-colour-text-link)';
const HERO_GRAD = 'radial-gradient(120% 70% at 50% 0%, var(--sd-colour-cyan-700), var(--sd-colour-cyan-900))';
const IMMERSIVE = 'linear-gradient(165deg, var(--sd-colour-cyan-700), var(--sd-colour-cyan-900))';
// translucent-on-teal tokens (the `dark` treatment)
const D_FILL = 'rgba(255,255,255,0.10)';
const D_BORDER = 'rgba(255,255,255,0.30)';
const D_SUBTLE = 'rgba(255,255,255,0.75)';

/* base style for a phone/tablet screen container (single vertical flex column) */
const screenBase = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)',
  display: 'flex', flexDirection: 'column', position: 'relative',
};

/* the repo's button loading spinner glyph (sd-btn-spin from button.css) */
function Spinner({ size = 18, color = 'currentColor' }) {
  return (
    <svg className="ds-btn__spinner" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size, color }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 9" />
    </svg>
  );
}

function Field({ label, type = 'text', placeholder, value, onChange, dark }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={{ fontSize: 13.5, fontWeight: 500, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{label}</span>}
      <input
        className={'fp-input' + (dark ? ' fp-input--dark' : '')} type={type} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          boxSizing: 'border-box', width: '100%', height: 52, margin: 0, padding: '0 16px',
          fontFamily: 'var(--sd-font-family)', fontSize: 16, fontWeight: 500,
          color: dark ? '#fff' : 'var(--sd-colour-text-primary)', background: dark ? D_FILL : 'var(--sd-colour-surface-default)',
          border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`, borderRadius: 'var(--sd-radius-lg)',
        }}
      />
    </label>
  );
}

/* full-width primary button. `dark` = white inverted (teal label); `loading` = spinner + label. */
function Btn({ children = 'Continue', onClick, disabled, loading, dark, loadingLabel = 'Loading…' }) {
  const off = disabled || loading;
  const bg = dark ? (disabled && !loading ? 'rgba(255,255,255,0.4)' : '#fff') : (disabled && !loading ? 'var(--sd-colour-action-disabled)' : TEAL);
  const fg = dark ? TEAL : (disabled && !loading ? 'var(--sd-colour-text-disabled)' : '#fff');
  return (
    <button type="button" className={off ? '' : 'fp-btn'} onClick={off ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 52, padding: '0 18px', textAlign: 'center',
      cursor: off ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-lg)', background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{loading ? <><Spinner size={18} color={dark ? TEAL : '#fff'} />{loadingLabel}</> : children}</button>
  );
}

function Link({ children, onClick, align = 'center', dark }) {
  return (
    <div style={{ textAlign: align }}>
      <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: dark ? '#fff' : LINK }}>{children}</button>
    </div>
  );
}

/* a selectable list row (used in the example "select" step) */
function Row({ title, sub, selected, onClick, dark }) {
  return (
    <button onClick={onClick} className="fp-row" style={{
      all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: dark ? D_FILL : 'transparent', border: selected ? `1.5px solid ${dark ? '#fff' : TEAL}` : `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`,
      borderRadius: 'var(--sd-radius-lg)', padding: '14px 18px', transition: 'border-color .2s',
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{sub}</div>}
      </div>
      <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? (dark ? '#fff' : TEAL) : 'transparent', border: selected ? 'none' : `2px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}` }}>
        {selected && <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={dark ? TEAL : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
    </button>
  );
}
