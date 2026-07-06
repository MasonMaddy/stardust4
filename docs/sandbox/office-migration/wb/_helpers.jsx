/*
 * Office Migration Board — shared workbench helpers (window.WB).
 *
 * Loaded (type="text/babel") BEFORE the wb/<family>.jsx files. Exposes React
 * helpers built from REAL Stardust components (dogfooding) — markup verified
 * against the component doc pages in docs/components/. No innerHTML anywhere.
 *
 * CONTRACT for wave agents (wb/<family>.jsx):
 *   - Wrap your whole file in an IIFE — Babel-standalone scripts share one
 *     global lexical scope, so top-level const/let collide across files.
 *   - Destructure what you need:  const { Card, Controls, Stage, VariantPills,
 *     Toggle, ShowAll, Cell, StateNote, Stub, icons, cx } = window.WB;
 *   - End with a guarded mount:
 *       const el = document.getElementById('wb-<family>');
 *       if (el) ReactDOM.createRoot(el).render(<FamilyWorkbench />);
 *   - New (not-yet-in-library) ds-* classes belong in wip/<family>.css only,
 *     --sd-* tokens only. Never re-declare a ds-* rule that already ships in
 *     docs/assets/css/components/.
 *
 * API:
 *   WB.Card({ legacy, ds, status, note, children })
 *       Large workbench card. `legacy` = string or array of legacy Vue names,
 *       `ds` = Stardust target, `status` ∈ Built | Partial | Missing | Out.
 *   WB.Controls({ children })          — controls row (put pills/toggles here)
 *   WB.Stage({ stack, form, room, scroll, children }) — the demo stage
 *   WB.VariantPills({ label, options, value, onChange })
 *       ds-selection-pill radio-style switcher. options: strings or {value,label}.
 *   WB.Toggle({ label, on, onChange, disabled }) — ds-toggle boolean control
 *   WB.ShowAll({ children })           — grid wrapper for all-states display
 *   WB.Cell({ tag, children })         — one labelled cell inside ShowAll
 *   WB.StateNote({ text })             — live-behaviour hint under a stage
 *   WB.Stub({ text })                  — "wave being built" note for stub files
 *   WB.icons                           — shared inline SVGs (plus, chevron,
 *                                        search, clear, close, person, check)
 *   WB.cx(...parts)                    — classnames join
 */

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ── Shared inline SVG icons (currentColor) ─────────────────────────────── */
const icons = {
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  /* the Input component's chevron glyph */
  chevron: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M4 6.18365C4 6.00936 4.12839 5.94813 4.28452 6.04791L7.71441 8.22103C7.88905 8.32083 8.11096 8.32083 8.28559 8.22103L11.7155 6.04791C11.8727 5.94813 12 6.00936 12 6.18365L12 7.25272C11.9883 7.44826 11.8846 7.62971 11.7155 7.75064L8.28666 9.92539C8.11193 10.0249 7.89021 10.0249 7.71548 9.92539L4.28559 7.75194C4.11649 7.631 4.01281 7.44956 4.00107 7.25401L4 6.18365Z" fill="currentColor" />
    </svg>
  ),
  search: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.4924 1.45819C7.40664 0.219715 10.7733 1.57829 12.0119 4.49237C12.8858 6.54853 12.4655 8.82875 11.1194 10.4289L14.8576 14.1672C15.0479 14.3579 15.0481 14.667 14.8576 14.8576C14.6669 15.0483 14.3569 15.0483 14.1662 14.8576L10.4299 11.1203C10.0035 11.4793 9.51751 11.7825 8.97776 12.0119C6.06354 13.2503 2.69678 11.8918 1.45823 8.97772C0.219705 6.06359 1.57822 2.69674 4.4924 1.45819ZM11.1135 4.87421C10.0859 2.45651 7.29207 1.33009 4.87424 2.35761C2.45672 3.38532 1.33014 6.17827 2.35764 8.59589C3.38536 11.0134 6.17819 12.14 8.59592 11.1125C11.0137 10.0849 12.141 7.29193 11.1135 4.87421Z" fill="currentColor" />
    </svg>
  ),
  /* the Input component's clear glyph (circle-x) */
  clear: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8ZM8 1.875C4.61726 1.875 1.875 4.61726 1.875 8C1.875 11.3827 4.61726 14.125 8 14.125C11.3827 14.125 14.125 11.3827 14.125 8C14.125 4.61726 11.3827 1.875 8 1.875Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10.9338 5.06562C11.1046 5.23647 11.1046 5.51348 10.9338 5.68434L5.68438 10.9343C5.51353 11.1052 5.23652 11.1052 5.06566 10.9344C4.89479 10.7635 4.89478 10.4865 5.06562 10.3157L10.315 5.06566C10.4859 4.89479 10.7629 4.89478 10.9338 5.06562Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M5.06504 5.06566C5.23589 4.89479 5.51289 4.89478 5.68376 5.06562L10.9343 10.3156C11.1052 10.4865 11.1052 10.7635 10.9344 10.9343C10.7635 11.1052 10.4865 11.1052 10.3157 10.9344L5.06507 5.68438C4.89421 5.51353 4.8942 5.23652 5.06504 5.06566Z" fill="currentColor" />
    </svg>
  ),
  close: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  /* avatar photo-placeholder person glyph */
  person: () => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.99999 7.64062C9.40997 7.63942 10.5509 6.56917 10.5509 5.24912C10.5509 3.92834 9.40883 2.85763 7.99999 2.85763C6.59115 2.85763 5.44906 3.92834 5.44906 5.24912C5.44906 6.56991 6.59115 7.64062 7.99999 7.64062ZM7.99999 8.49552C6.68971 8.49552 5.43309 8.9835 4.50659 9.8521C3.72822 10.5818 3.2364 11.53 3.09902 12.5428C3.06483 12.795 2.85137 12.9865 2.60362 12.9865C2.34723 12.9865 2.15371 12.794 2.17745 12.5742C2.4937 10.9836 3.04435 10.0139 3.86177 9.24759C4.428 8.71675 5.0983 8.30593 5.82772 8.03257L6.06877 7.94224L5.86491 7.79156C5.06298 7.19882 4.5486 6.28033 4.5486 5.24912C4.5486 3.46211 6.09384 2.01344 7.99999 2.01344C9.90614 2.01344 11.4514 3.46211 11.4514 5.24912C11.4514 6.28033 10.937 7.19882 10.1351 7.79156L9.93121 7.94224L10.1723 8.03257C10.9017 8.30593 11.572 8.71675 12.1382 9.24759C12.9556 10.0139 13.5063 10.9836 13.7341 12.0299C13.7732 12.2093 13.8027 12.3909 13.8225 12.5742C13.8463 12.794 13.6527 12.9865 13.3964 12.9865C13.1486 12.9865 12.9351 12.795 12.901 12.5428C12.7636 11.53 12.2718 10.5818 11.4934 9.8521C10.5669 8.9835 9.31027 8.49552 7.99999 8.49552Z" fill="currentColor" />
    </svg>
  ),
  /* selection-pill selected indicator (filled square + check) */
  check: () => (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect width="18" height="18" rx="4" fill="currentColor" />
      <path d="M4 9l3 3 7-7" stroke="var(--sd-colour-surface-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* checkbox glyph pair — every ds-checkbox box carries both icons */
function CheckboxGlyphs() {
  return (
    <React.Fragment>
      <svg className="ds-checkbox__icon ds-checkbox__icon--check" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="ds-checkbox__icon ds-checkbox__icon--dash" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </React.Fragment>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */
const STATUS_CLASS = {
  Built: 'mb-pill--built',
  Partial: 'mb-pill--partial',
  Missing: 'mb-pill--missing',
  Out: 'mb-pill--out',
};

function Card({ legacy, ds, status, note, children }) {
  const names = Array.isArray(legacy) ? legacy : [legacy];
  return (
    <article className="mb-wb-card">
      <div className="mb-wb-card__head">
        <h3 className="mb-wb-card__map">
          {names.map((n) => (
            <span key={n} className="mb-legacy">{n}</span>
          ))}
          <span className="mb-arrow" aria-hidden="true">→</span>
          <span className="mb-target">{ds}</span>
        </h3>
        <span className={cx('mb-pill', STATUS_CLASS[status] || 'mb-pill--partial')}>{status}</span>
      </div>
      {note ? <p className="mb-wb-card__note">{note}</p> : null}
      {children}
    </article>
  );
}

/* ── Layout wrappers ────────────────────────────────────────────────────── */
function Controls({ children }) {
  return <div className="mb-controls">{children}</div>;
}

function Stage({ stack, form, room, scroll, children }) {
  return (
    <div
      className={cx(
        'mb-stage',
        stack && 'mb-stage--stack',
        form && 'mb-stage--form',
        room && 'mb-stage--room',
        scroll && 'mb-stage--scroll'
      )}
    >
      {children}
    </div>
  );
}

/* ── VariantPills — ds-selection-pill radio-style switcher ─────────────── */
function VariantPills({ label, options, value, onChange }) {
  return (
    <div className="mb-control" role="group" aria-label={label || 'Variant'}>
      {label ? <span className="mb-control__label">{label}</span> : null}
      <div className="mb-pillrow">
        {options.map((opt) => {
          const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              className={cx('ds-selection-pill', selected && 'ds-selection-pill--selected')}
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
            >
              <span className="ds-selection-pill__label">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Toggle — ds-toggle boolean control ─────────────────────────────────── */
function Toggle({ label, on, onChange, disabled }) {
  const flip = () => { if (!disabled) onChange(!on); };
  return (
    <span className="mb-toggle-field" onClick={flip}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        className={cx('ds-toggle', on && 'ds-toggle--on', disabled && 'ds-toggle--disabled')}
        onClick={(e) => { e.stopPropagation(); flip(); }}
      >
        <span className="ds-toggle__rail"></span>
        <span className="ds-toggle__knob-wrap"><span className="ds-toggle__thumb"></span></span>
      </button>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

/* ── Show-all grid + labelled cell ──────────────────────────────────────── */
function ShowAll({ children }) {
  return <div className="mb-showall">{children}</div>;
}

function Cell({ tag, children }) {
  return (
    <div className="mb-cell">
      <span className="mb-cell__tag">{tag}</span>
      {children}
    </div>
  );
}

/* ── State note ─────────────────────────────────────────────────────────── */
function StateNote({ text }) {
  return <p className="mb-state-note">{text}</p>;
}

/* ── Stub — "this wave is being built" note ─────────────────────────────── */
function Stub({ text }) {
  return (
    <div className="mb-wb-stub" role="status">
      <span aria-hidden="true">🚧</span> {text}
    </div>
  );
}

window.WB = {
  cx,
  icons,
  CheckboxGlyphs,
  Card,
  Controls,
  Stage,
  VariantPills,
  Toggle,
  ShowAll,
  Cell,
  StateNote,
  Stub,
};
