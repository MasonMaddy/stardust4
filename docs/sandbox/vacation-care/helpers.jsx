/*
 * Vacation Care — Office prototype · shared primitives
 * Plain text/babel module. Shares one global scope with office.jsx — don't
 * redeclare these top-level consts elsewhere. Everything colours from --sd-* tokens.
 */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ── Icon set ─────────────────────────────────────────────
   Hand-authored 24×24 outline icons, stroke = currentColor, so they tint
   from the surrounding text colour (no hardcoded hex). */
const ICONS = {
  menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  calendar:  <><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/></>,
  calendarCheck: <><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6"/><line x1="16" y1="2.5" x2="16" y2="6"/><polyline points="9 14 11.5 16.5 16 12"/></>,
  list:      <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
  grid:      <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
  bell:      <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  eye:       <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  help:      <><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></>,
  chevronDown:  <polyline points="6 9 12 15 18 9"/>,
  chevronUp:    <polyline points="6 15 12 9 18 15"/>,
  chevronLeft:  <polyline points="15 6 9 12 15 18"/>,
  chevronRight: <polyline points="9 6 15 12 9 18"/>,
  search:    <><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit:      <><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  copy:      <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  kebab:     <><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></>,
  close:     <><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></>,
  check:     <polyline points="4 12.5 9.5 18 20 6"/>,
  warning:   <><path d="M12 3 2.5 20h19L12 3Z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></>,
  mail:      <><rect x="3" y="5" width="18" height="14" rx="2.5"/><polyline points="4 7 12 13 20 7"/></>,
  send:      <><path d="M21 3 10.5 13.5"/><path d="M21 3l-6.5 18-4-8-8-4Z"/></>,
  upload:    <><path d="M12 16V5"/><polyline points="7 9 12 4 17 9"/><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/></>,
  user:      <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></>,
  users:     <><circle cx="9" cy="8" r="3.3"/><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.2a3.3 3.3 0 0 1 0 6.4"/><path d="M17.5 14c2.5.4 4.5 2 4.5 5"/></>,
  dollar:    <><circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.7.8-2.7 2 0 2.8 5.5 1.4 5.5 4.4 0 1.3-1.2 2.1-2.8 2.1-1.4 0-2.5-.6-3-1.6"/><line x1="12" y1="6" x2="12" y2="18"/></>,
  building:  <><rect x="4" y="3" width="16" height="18" rx="1.5"/><line x1="9" y1="7" x2="9" y2="7"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M16 15h.01"/><rect x="10.5" y="15" width="3" height="6"/></>,
  table:     <><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="9.5" y1="9.5" x2="9.5" y2="20"/></>,
  doc:       <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><polyline points="14 3 14 8 19 8"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="8.5" y1="16.5" x2="15.5" y2="16.5"/></>,
  cog:       <><circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 2.6 14H2.4a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 2.6h.1A1.7 1.7 0 0 0 10.3 1H14a2 2 0 0 1 0 0"/></>,
  logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  chat:      <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.7L3 21l1.4-4.2A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></>,
  clock:     <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></>,
  home:      <><path d="M3 11 12 3l9 8"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></>,
  back:      <><line x1="4" y1="12" x2="20" y2="12"/><polyline points="10 6 4 12 10 18"/></>,
};

function Icon({ name, size = 20, sw = 1.7, style }) {
  const p = ICONS[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
         strokeLinejoin="round" style={{ display: 'block', flexShrink: 0, ...style }}
         aria-hidden="true">{p}</svg>
  );
}

/* ── Brand emblem (Stardust sparkle, from favicon.svg) ──── */
function Emblem({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Stardust" style={{ display: 'block' }}>
      <path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13 Z" fill="var(--sd-colour-action-primary)"/>
      <circle cx="26.5" cy="5.5" r="2.4" fill="var(--sd-colour-accent-secondary)"/>
    </svg>
  );
}

/* ── Status pill (real ds-pill, minimal) ───────────────── */
const PILL_TONE = { green: 'ds-pill--green', orange: 'ds-pill--orange', purple: 'ds-pill--purple', grey: 'ds-pill--grey' };
function Pill({ tone = 'grey', icon, children, size = 'sm' }) {
  return (
    <span className={`ds-pill ds-pill--minimal ${PILL_TONE[tone]} ds-pill--${size}`}>
      {icon && <span className="ds-pill__icon"><Icon name={icon} size={size === 'sm' ? 13 : 15} sw={2} /></span>}
      {children}
    </span>
  );
}

/* ── Button wrapper (real ds-btn) ──────────────────────── */
function Btn({ variant = 'solid', icon, trailingIcon, children, onClick, type = 'button', style, disabled }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`ds-btn ds-btn--${variant} fp-btn`} style={style}>
      {icon && <span className="ds-btn__icon"><Icon name={icon} size={16} sw={2} /></span>}
      {children}
      {trailingIcon && <span className="ds-btn__icon"><Icon name={trailingIcon} size={16} sw={2} /></span>}
    </button>
  );
}

/* Small rounded-square icon button (teal outline) — the row-action style in the
   wireframe. Custom (not ds-*) so we don't touch the 48px ds-btn--icon-only. */
function IconBtn({ icon, label, onClick, tone = 'ghost', size = 38, radius = 'var(--sd-radius-m)', iconSize = 18 }) {
  const teal = tone !== 'plain';
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="vc-iconbtn fp-btn"
      style={{
        width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: radius, cursor: 'pointer',
        border: `1px solid ${teal ? 'var(--sd-colour-action-primary)' : 'transparent'}`,
        background: 'transparent', color: teal ? 'var(--sd-colour-action-primary)' : 'var(--sd-colour-text-secondary)',
      }}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

/* ── Field shell — Stardust "outside label" (label above the box) ──
   Matches the ds-input spec: 14px text-secondary label, 4px gap, then the box. */
function Field({ label, children, style }) {
  return (
    <label className="vc-field" style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <span style={{ fontSize: 14, lineHeight: '20px', color: 'var(--sd-colour-text-secondary)' }}>{label}</span>
      {children}
    </label>
  );
}

const fieldBoxStyle = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%', boxSizing: 'border-box',
  height: 48, padding: '0 14px', border: '1px solid var(--sd-colour-border-strong)',
  borderRadius: 'var(--sd-radius-lg)', background: 'var(--sd-colour-surface-default)',
  fontSize: 14, color: 'var(--sd-colour-text-primary)', fontFamily: 'var(--sd-font-family)',
};

function TextField({ label, value, onChange, placeholder, style }) {
  return (
    <Field label={label} style={style}>
      <input className="fp-input" value={value || ''} placeholder={placeholder}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ ...fieldBoxStyle, outline: 'none' }} />
    </Field>
  );
}

function SelectField({ label, value, placeholder, options = [], onChange, style }) {
  return (
    <Field label={label} style={style}>
      <div style={{ position: 'relative' }}>
        <select className="fp-input vc-select" value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          style={{ ...fieldBoxStyle, appearance: 'none', cursor: 'pointer', paddingRight: 38,
                   color: value ? 'var(--sd-colour-text-primary)' : 'var(--sd-colour-text-secondary)' }}>
          <option value="" disabled>{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--sd-colour-text-secondary)' }}>
          <Icon name="chevronDown" size={18} />
        </span>
      </div>
    </Field>
  );
}

/* ── Selection pill (real ds-selection-pill) ───────────────
   Same component the sign-in prototype uses for its phone/tablet switch.
   Used for the Calendar/List view switch, status filters, and day toggles. */
function SelPill({ selected, icon, children, onClick, style }) {
  // Vacation Care uses a solid primary-green selected state (per Figma), not the
  // component default mint fill — override bg/border/text inline when selected.
  const selStyle = selected ? {
    background: 'var(--sd-colour-action-primary)',
    borderColor: 'var(--sd-colour-action-primary)',
    color: 'var(--sd-colour-text-inverse)',
  } : {};
  return (
    <button type="button" onClick={onClick} style={{ ...selStyle, ...style }}
      className={`ds-selection-pill fp-btn ${selected ? 'ds-selection-pill--selected' : ''}`}>
      {icon && <span className="ds-selection-pill__icon"><Icon name={icon} size={18} /></span>}
      <span className="ds-selection-pill__label">{children}</span>
    </button>
  );
}

/* ── Segmented switch (the phone/tablet-style track toggle) ──
   A grey track holding 2+ segments; the selected segment raises to white
   with a teal border. Used for the Calendar/List view switch. */
function SearchBar({ placeholder = 'Search', value, onChange, style }) {
  // Uncontrolled unless a value/onChange pair is passed (Forms table wires a live query).
  const wired = onChange ? { value: value || '', onChange: (e) => onChange(e.target.value) } : {};
  return (
    <div style={{ ...fieldBoxStyle, height: 52, flex: 1, minWidth: 0, paddingRight: 6, ...style }}>
      <input className="fp-input" placeholder={placeholder} {...wired}
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 0, fontSize: 14, background: 'transparent',
                 fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)' }} />
      <button type="button" aria-label="Search" className="fp-btn" style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none',
        background: 'var(--sd-colour-action-primary)', color: 'var(--sd-colour-text-inverse)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="search" size={18} />
      </button>
    </div>
  );
}

function SegSwitch({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--sd-colour-grey-100)', borderRadius: 'var(--sd-radius-full)' }}>
      {options.map(o => {
        const sel = value === o.key;
        return (
          <button type="button" key={o.key} onClick={() => onChange(o.key)} className="fp-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px',
              borderRadius: 'var(--sd-radius-full)', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 14,
              fontFamily: 'var(--sd-font-family)', fontWeight: sel ? 600 : 500,
              background: sel ? 'var(--sd-colour-surface-default)' : 'transparent',
              border: sel ? '1px solid var(--sd-colour-action-primary)' : '1px solid transparent',
              color: sel ? 'var(--sd-colour-action-primary)' : 'var(--sd-colour-text-secondary)',
              boxShadow: sel ? '0 1px 2px rgba(37,37,37,0.10)' : 'none',
            }}>
            {o.icon && <Icon name={o.icon} size={18} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Real ds-toggle ────────────────────────────────────── */
function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label}
      onClick={() => onChange && onChange(!on)}
      className={`ds-toggle ${on ? 'ds-toggle--on' : ''}`}>
      <span className="ds-toggle__rail" />
      <span className="ds-toggle__knob-wrap"><span className="ds-toggle__thumb" /></span>
    </button>
  );
}

/* ── Toast (transient confirmation) ────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="vc-toast" role="status" style={{
      position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
      background: 'var(--sd-colour-surface-inverse)', color: 'var(--sd-colour-text-inverse)',
      borderRadius: 'var(--sd-radius-lg)', boxShadow: '0 12px 32px rgba(0,0,0,0.22)', fontSize: 14, fontWeight: 500,
    }}>
      <Icon name={toast.icon || 'check'} size={18} sw={2.2} />{toast.msg}
    </div>
  );
}

window.VC = { Icon, Emblem, Pill, Btn, IconBtn, Field, TextField, SelectField, SelPill, SegSwitch, SearchBar, Toggle, Toast, fieldBoxStyle };
