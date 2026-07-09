/*
 * Playground service sign-in — v0.6: Playful tall-scene + travelling-mark motion system.
 *
 * v0.6 merges two prototyped patterns into the main flow:
 *   1. Service-to-Educator sheet reveal (from ../service-to-educator): the service login is
 *      the immersive full-bleed teal screen; on sign-in the educator list arrives on a white
 *      sheet sliding up from the bottom.
 *   2. Travelling logo (from ../motion-lab, Direction D): steps render as self-contained
 *      layers that fade-through (Material-style); exactly ONE shared element — the brand
 *      mark — glides between the [data-mark-anchor] slots each step reserves, crossfading
 *      Playground P ⇄ school crest ⇄ educator photo. See <Flow3Stack>. Phone only; the iPad
 *      path keeps its existing per-step transitions.
 *
 * Forked from the 6-direction comparison prototype (../variants.jsx) once Sam chose the
 * tall-scene direction. The direction switcher is gone — VariantsApp is hard-locked to
 * variant 3 (full-bleed teal hero + sliding white sheet, rendered by the animated <Flow3>).
 * The other five directions' Service / IService login screens were removed; the shared shells
 * (PanelShell etc.) are retained as inert scaffolding. Harness keeps scenario launchers
 * (Service / Educator / Return / Error states), Device (Phone / Tablet) + Layout toggles,
 * and the demo-credentials reference card. Full flow, on the real --sd-* tokens + Inter:
 *
 *   service login → educator selector → PIN → room select → confirm → room hub
 *
 * Demo creds (pre-filled): username LittleBugs · password bugs123 · educator PIN 1234.
 * Wired to the real --sd-* tokens + Inter, reusing ICON2 / phone2 from helpers.jsx.
 * Brand "P" replaced with the supplied Playground logo SVG (PLogo) — blue/cyan product mark.
 *
 * Shared anatomy across all five (the service-login step):
 *   - Service username field: person (user) lead icon + "Username" placeholder
 *   - Service password field: "Password" placeholder + view eye toggle (trailing)
 *   - Full-width Sign in button: teal --sd-colour-action-primary (#00776B), white text
 *   - Playground "P" brand mark in teal
 *   - Fields: 52px tall, radius --sd-radius-lg (16), 1px grey-500 border
 *
 * Link colour: ALL text links normalised to teal text-link (#00776B) — on convention.
 *
 * Exported as window.VariantsBoard.
 */

const { useState, useEffect, useLayoutEffect, useRef } = React;

const V_TEAL = 'var(--sd-colour-action-primary)';   // #00776B
const V_LINK = 'var(--sd-colour-text-link)';          // #00776B — the link convention (all links use this)
const V_HERO_GRAD = 'radial-gradient(120% 70% at 50% 0%, var(--sd-colour-cyan-700), var(--sd-colour-cyan-900))';
const V_IMMERSIVE = 'linear-gradient(165deg, var(--sd-colour-cyan-700), var(--sd-colour-cyan-900))'; // variant 6 full-bleed teal
// translucent-on-teal tokens for the immersive (dark) treatment
const D_FILL = 'rgba(255,255,255,0.10)';
const D_BORDER = 'rgba(255,255,255,0.30)';
const D_SUBTLE = 'rgba(255,255,255,0.75)';
const DEMO_USER = 'LittleBugs';
const DEMO_PASS = 'bugs123';
const DEMO_PIN = '1234';
const SERVICE_NAME = 'Little Bugs OSHC'; // shown in the top nav (beside Back) once the service is signed in
const LOGIN_ERR = "We couldn't sign in to that service, please try again. For password reset please contact the service administrator.";

/* educator roster — `login` = minutes since last sign-in (drives the "Most recent" sort + the row time). */
const C = ['var(--sd-colour-cyan-600)', 'var(--sd-colour-orange-500)', 'var(--sd-colour-purple-500)', 'var(--sd-colour-green-500)', 'var(--sd-colour-cyan-700)'];
// `login` = minutes since last sign-in; spread from 1 minute out to 30 days (the retention cutoff).
// `img` = a stable pravatar.cc id → realistic placeholder portrait (swap for real photos later).
const EDUCATORS = [
  { initials: 'WW', color: C[0], name: 'William Walker', login: 3, img: 12 },
  { initials: 'MJ', color: C[1], name: 'Maya Johnson', login: 18, img: 5 },
  { initials: 'AS', color: C[2], name: 'Alex Smith', login: 240, img: 33 },
  { initials: 'RL', color: C[2], name: 'Rina Lee', login: 52, img: 9 },
  { initials: 'TN', color: C[3], name: 'Thomas Nguyen', login: 1, img: 14 },
  { initials: 'PS', color: C[4], name: 'Priya Sharma', login: 9, img: 16 },
  { initials: 'DO', color: C[1], name: "Daniel O'Brien", login: 75, img: 53 },
  { initials: 'GC', color: C[2], name: 'Grace Chen', login: 6, img: 20 },
  { initials: 'HM', color: C[0], name: 'Hannah Murphy', login: 900, img: 24 },
  { initials: 'OH', color: C[3], name: 'Omar Haddad', login: 2880, img: 59 },
  { initials: 'SK', color: C[3], name: 'Sofia Kovač', login: 28, img: 28 },
  { initials: 'LB', color: C[4], name: 'Liam Brown', login: 5760, img: 51 },
  { initials: 'AO', color: C[1], name: 'Amara Okafor', login: 14, img: 31 },
  { initials: 'JT', color: C[2], name: 'Jack Taylor', login: 11520, img: 60 },
  { initials: 'MR', color: C[0], name: 'Mia Rossi', login: 47, img: 47 },
  { initials: 'NW', color: C[3], name: 'Noah Wilson', login: 20160, img: 68 },
  { initials: 'IS', color: C[3], name: 'Isla Stewart', login: 12, img: 44 },
  { initials: 'KP', color: C[4], name: 'Kai Patel', login: 43200, img: 65 },
  { initials: 'EF', color: C[1], name: 'Ella Fischer', login: 420, img: 36 },
  { initials: 'YT', color: C[2], name: 'Yuki Tanaka', login: 1500, img: 40 },
];
const EDU_PHOTO = (e) => (e && e.img ? `https://i.pravatar.cc/120?img=${e.img}` : null);
// themed placeholder photo per room — keyword = the room's animal/theme (loremflickr), stable via `lock`.
const ROOM_PHOTO = (name) => {
  const kw = (name || 'room').replace(/\s*room$/i, '').trim().toLowerCase().split(/\s+/).join(',') || 'classroom';
  let lock = 0; for (let i = 0; i < (name || '').length; i++) lock = (lock * 31 + name.charCodeAt(i)) % 100000;
  return `https://loremflickr.com/160/160/${kw}?lock=${lock}`;
};
function agoLabel(m) {
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}
function sortedEducators(sort, query) {
  const list = EDUCATORS.slice().sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.login - b.login);
  const q = (query || '').trim().toLowerCase();
  return q ? list.filter((e) => e.name.toLowerCase().includes(q)) : list;
}

/* room pool — `ratio` is kids:educators; `attention` = under-ratio / needs cover; `disabled` = unavailable. */
const ROOM_POOL = [
  { name: 'Koala Room', ratio: '9:1' },
  { name: 'Gum Tree Room', ratio: '11:1' },
  { name: 'Wattle Room', ratio: '8:1' },
  { name: 'Possum Room', ratio: '13:1', attention: true },
  { name: 'Bilby Room', ratio: '10:1' },
  { name: 'Kookaburra Room', ratio: '15:1', attention: true },
  { name: 'Platypus Room', ratio: '7:1' },
  { name: 'Wombat Room', ratio: '12:1', attention: true },
  { name: 'Echidna Room', ratio: '6:1', disabled: true, note: 'Closed today' },
  { name: 'Bandicoot Room', ratio: '10:1', disabled: true, note: 'At capacity' },
];
// pick a random 5–10 rooms for a prototype, guaranteeing ≥1 disabled and ≥1 needs-attention room appear.
function pickRooms() {
  const shuffled = ROOM_POOL.slice().sort(() => Math.random() - 0.5);
  const n = 5 + Math.floor(Math.random() * 6); // 5–10
  const out = shuffled.slice(0, n);
  const ensure = (test) => { if (!out.some(test)) { const extra = shuffled.find((r) => test(r) && !out.includes(r)); if (extra) out[out.length - 1] = extra; } };
  ensure((r) => r.disabled);
  ensure((r) => r.attention);
  return out;
}
const roomByName = (name, rooms) => (rooms || []).find((r) => r.name === name) || ROOM_POOL.find((r) => r.name === name) || {};
// the "remembered" room for the same-day return — first selectable (non-disabled) room in the set.
const firstRoom = (rs) => (rs || []).find((r) => !r.disabled) || (rs && rs[0]) || ROOM_POOL[0];

/* ====================================================================
 * SHARED CONTROLS
 * ==================================================================== */

/* Field — prototype spec: 52px tall, radius-lg, 1px grey-500, optional lead/trail icons.
   `invalid` paints the error border; `error` (string) renders an error message below. */
function VField({ label, type = 'text', placeholder, value, onChange, lead, trail, onTrail, invalid, error, dark, onTeal }) {
  // onTeal = solid white field with a white label (sits on the immersive teal); dark = translucent glass.
  const iconStyle = dark ? { filter: 'brightness(0) invert(1)', opacity: 0.8 } : { opacity: 0.5 };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 13.5, fontWeight: 500, color: dark ? D_SUBTLE : (onTeal ? '#fff' : 'var(--sd-colour-text-secondary)') }}>{label}</span>}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {lead && <img src={ICON2(lead)} alt="" style={{ position: 'absolute', left: 14, width: 20, height: 20, pointerEvents: 'none', ...iconStyle }} />}
        <input
          className={'v-input' + (dark ? ' v-input--dark' : '')} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          style={{
            boxSizing: 'border-box', width: '100%', height: 52, margin: 0,
            padding: `0 ${trail ? 44 : 16}px 0 ${lead ? 44 : 16}px`,
            fontFamily: 'var(--sd-font-family)', fontSize: 16, fontWeight: 500,
            color: dark ? '#fff' : 'var(--sd-colour-text-primary)', background: dark ? D_FILL : 'var(--sd-colour-surface-default)',
            border: invalid ? '1.5px solid var(--sd-colour-border-error)' : `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`,
            borderRadius: 'var(--sd-radius-lg)',
          }}
        />
        {trail && (
          <button type="button" onClick={onTrail} aria-label="Toggle password" style={{ all: 'unset', cursor: 'pointer', position: 'absolute', right: 14, display: 'flex' }}>
            <img src={ICON2(trail)} alt="" style={{ width: 20, height: 20, ...iconStyle }} />
          </button>
        )}
      </span>
      {error && (
        <span style={{ display: 'flex', gap: 6, fontSize: 13, lineHeight: 1.45, color: (dark || onTeal) ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)' }}>
          <img src={ICON2('info-alert')} alt="" style={{ width: 15, height: 15, marginTop: 2, flexShrink: 0, ...((dark || onTeal) ? { filter: 'brightness(0) invert(1)' } : {}) }} />{error}
        </span>
      )}
    </label>
  );
}

/* Spinner — the repo's --loading button glyph (sd-btn-spin animation from button.css). */
function Spinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg className="ds-btn__spinner" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size, color }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 9" />
    </svg>
  );
}

/* Full-width primary button — teal, white text; disabled = action-disabled.
   `loading` shows the Stardust spinner + "Signing in…" and blocks the click (matches .ds-btn--loading).
   `dark` = the immersive inverted button: white fill, teal label (for variant 6 on full teal). */
function VBtn({ children = 'Sign in', disabled, loading, onClick, loadingLabel = 'Signing in…', dark }) {
  const off = disabled || loading;
  const bg = dark ? (disabled && !loading ? 'rgba(255,255,255,0.4)' : '#fff') : (disabled && !loading ? 'var(--sd-colour-action-disabled)' : V_TEAL);
  const fg = dark ? V_TEAL : (disabled && !loading ? 'var(--sd-colour-text-disabled)' : '#fff');
  return (
    <button type="button" className={off ? '' : 'v-btn'} onClick={off ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 52, padding: '0 18px',
      textAlign: 'center', cursor: off ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-lg)',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{loading ? <><Spinner size={18} color={dark ? V_TEAL : '#fff'} />{loadingLabel}</> : children}</button>
  );
}

/* text link — teal (the link convention); `dark` = white on teal (immersive). */
function VLink({ children, align = 'right', onClick, dark }) {
  return (
    <div style={{ textAlign: align }}>
      <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>{children}</button>
    </div>
  );
}

/* Terms & privacy line (teal links); `dark` = light text + white links on teal. */
function VTerms({ align = 'center', dark }) {
  const linkCol = dark ? '#fff' : V_LINK;
  return (
    <p style={{ fontSize: 12, lineHeight: 1.5, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', textAlign: align, margin: 0 }}>
      By clicking sign in, you agree to our <span style={{ color: linkCol, fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: linkCol, fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</span>
    </p>
  );
}

/* kid-friendly hero doodles (clouds, balloons, sparkles, confetti, paper plane) — drawn inline,
   white/translucent, drifting & twinkling. A cheerful kindergarten/playground scene, not space. */
function FunGlyph({ t }) {
  const c = '#fff';
  const s = { width: '100%', height: '100%', display: 'block' };
  if (t === 'cloud') return <svg viewBox="0 0 100 60" fill={c} style={s}><circle cx="28" cy="38" r="17" /><circle cx="52" cy="28" r="22" /><circle cx="74" cy="40" r="15" /><rect x="26" y="40" width="50" height="17" rx="8.5" /></svg>;
  if (t === 'balloon') return <svg viewBox="0 0 40 58" fill="none" style={s}><ellipse cx="20" cy="18" rx="13" ry="16" fill={c} /><path d="M20 34 q-3 3 0 6 q3 3 0 6 q-3 3 0 6" stroke={c} strokeWidth="1.4" fill="none" /></svg>;
  if (t === 'sparkle') return <svg viewBox="0 0 24 24" fill={c} style={s}><path d="M12 1c1 6.5 4.5 10 11 11-6.5 1-10 4.5-11 11-1-6.5-4.5-10-11-11 6.5-1 10-4.5 11-11z" /></svg>;
  if (t === 'plane') return <svg viewBox="0 0 48 40" fill={c} style={s}><path d="M3 20 L45 3 L30 37 L24 27 Z" /></svg>;
  return <svg viewBox="0 0 12 12" fill={c} style={s}><circle cx="6" cy="6" r="6" /></svg>; // dot / confetti
}

const V_SCENE = [
  // back layer — big, slow, faint (parallax: long durations = far away)
  { t: 'cloud',   top: 0.06, left: 0.52, w: 64, h: 38, o: 0.16, drift: 'vf-a',     dur: 26, tw: 0,   delay: 0.5 },
  { t: 'cloud',   top: 0.12, left: 0.06, w: 50, h: 30, o: 0.30, drift: 'vf-b',     dur: 18, tw: 0,   delay: 0.2 },
  { t: 'cloud',   top: 0.50, left: 0.72, w: 40, h: 24, o: 0.24, drift: 'vf-c',     dur: 16, tw: 0,   delay: 1.0 },
  // sparkles — twinkle + gentle drift
  { t: 'sparkle', top: 0.10, left: 0.84, w: 18, h: 18, o: 0.55, drift: 'vf-a',     dur: 8,  tw: 4.5, delay: 0.4 },
  { t: 'sparkle', top: 0.60, left: 0.16, w: 15, h: 15, o: 0.50, drift: 'vf-c',     dur: 9,  tw: 3.8, delay: 0.7 },
  { t: 'sparkle', top: 0.30, left: 0.48, w: 12, h: 12, o: 0.50, drift: 'vf-a',     dur: 8,  tw: 3.6, delay: 1.2 },
  { t: 'sparkle', top: 0.46, left: 0.63, w: 13, h: 13, o: 0.48, drift: 'vf-b',     dur: 8,  tw: 4.2, delay: 0.5 },
  // floating dots / bubbles
  { t: 'dot',     top: 0.42, left: 0.32, w: 8,  h: 8,  o: 0.50, drift: 'vf-b',     dur: 7,  tw: 2.8, delay: 0.3 },
  { t: 'dot',     top: 0.22, left: 0.40, w: 6,  h: 6,  o: 0.50, drift: 'vf-c',     dur: 8,  tw: 3.1, delay: 0.9 },
  { t: 'dot',     top: 0.66, left: 0.50, w: 7,  h: 7,  o: 0.45, drift: 'vf-bob',   dur: 9,  tw: 3.4, delay: 1.4 },
  // foreground — balloons bob & sway, paper plane glides (front layer = shorter durations)
  { t: 'balloon', top: 0.22, left: 0.80, w: 20, h: 29, o: 0.40, drift: 'vf-bob',   dur: 7,  tw: 0,   delay: 0.2 },
  { t: 'balloon', top: 0.40, left: 0.28, w: 17, h: 25, o: 0.30, drift: 'vf-sway',  dur: 6,  tw: 0,   delay: 0.6 },
  { t: 'plane',   top: 0.55, left: 0.10, w: 24, h: 20, o: 0.32, drift: 'vf-glide', dur: 17, tw: 0,   delay: 1.1 },
];
function VScene({ h = 320 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {V_SCENE.map((c, i) => {
        const anim = [
          `${c.drift} ${c.dur}s ease-in-out ${c.delay}s infinite`,
          c.tw ? `vf-twinkle ${c.tw}s ease-in-out ${c.delay}s infinite` : null,
        ].filter(Boolean).join(', ');
        return (
          <span key={i} className="vf" style={{
            position: 'absolute', top: c.top * h, left: `${c.left * 100}%`, width: c.w, height: c.h,
            opacity: c.o, '--o': c.o, animation: anim, willChange: 'translate, opacity', display: 'block',
          }}>
            <FunGlyph t={c.t} />
          </span>
        );
      })}
    </div>
  );
}

/* bouncing-dots loader (splash) */
function BounceDots({ color = '#fff' }) {
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {[0, 1, 2].map((i) => <span key={i} className="v-bounce-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: color, animationDelay: `${i * 0.15}s` }} />)}
    </div>
  );
}

/* Playground app logo — the updated blue/cyan mark (supplied SVG). Used everywhere the "P"
   emblem appears. Brand colour stays green; this is the product's own logo. */
function PLogo({ size = 60, shadow = true, float = false }) {
  return (
    <div className={float ? 'v-planet' : undefined} style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: shadow ? '0 8px 20px rgba(0,40,34,0.22)' : 'none', animation: float ? 'v-float 6s ease-in-out infinite' : undefined }}>
      <svg viewBox="0 0 67 67" width={size} height={size} fill="none" style={{ display: 'block' }}>
        <path d="M67 33.5C67 52.0015 52.0015 67 33.5 67C14.9985 67 0 52.0015 0 33.5C0 14.9985 14.9985 0 33.5 0C52.0015 0 67 14.9985 67 33.5Z" fill="#E2FDFF" />
        <path d="M33.526 59.1107C47.6516 59.1107 59.1026 47.6597 59.1026 33.5342C59.1026 19.4087 47.6516 7.9577 33.526 7.9577C19.4005 7.9577 7.94952 19.4087 7.94952 33.5342C7.94952 47.6597 19.4005 59.1107 33.526 59.1107Z" fill="#17AFBD" />
        <path d="M29.1946 29.6269C29.1946 29.6276 29.1948 29.6285 29.1948 29.6292C29.1948 31.984 31.1159 33.8999 33.4774 33.8999C35.8381 33.8999 37.7588 31.9853 37.7601 29.6315C37.7613 31.2628 39.0878 32.5849 40.724 32.5849C42.3611 32.5849 43.6882 31.2617 43.6882 29.6292C43.6882 29.6261 43.6881 29.6232 43.6881 29.6201C43.6881 29.6232 43.6883 29.6262 43.6883 29.6292C43.6883 35.2438 39.1078 39.8113 33.4774 39.8113C31.9489 39.8113 30.4978 39.4741 29.1946 38.8712V29.6292V29.6269Z" fill="#E2FDFF" />
        <path d="M29.1946 38.8712V44.7131C29.1946 46.3455 27.8676 47.6687 26.2307 47.6687C24.5935 47.6687 23.2665 46.3455 23.2665 44.7131V29.6292C23.2665 29.6322 23.2667 29.6353 23.2667 29.6383C23.2703 33.7245 25.7004 37.2544 29.1946 38.8712Z" fill="#E2FDFF" />
        <path d="M26.9162 26.7538C28.2218 27.0623 29.1936 28.2308 29.1946 29.6269V29.6292C29.1946 28.2322 28.2226 27.0624 26.9162 26.7538Z" fill="#FF6FC0" />
        <path d="M26.9162 26.7538C28.2218 27.0623 29.1936 28.2308 29.1946 29.6269V29.6292C29.1946 28.2322 28.2226 27.0624 26.9162 26.7538Z" fill="#B692FB" />
        <path d="M26.2307 26.6735C24.5938 26.6735 23.2666 27.9969 23.2666 29.6292C23.2666 27.9969 24.5936 26.6735 26.2307 26.6735Z" fill="#4EBFE6" />
        <path d="M26.2307 26.6735C24.5938 26.6735 23.2666 27.9969 23.2666 29.6292C23.2666 27.9969 24.5936 26.6735 26.2307 26.6735Z" fill="#B692FB" />
        <path d="M23.2668 29.6384C23.2668 29.6354 23.2666 29.6322 23.2666 29.6292C23.2666 27.9967 24.5938 26.6735 26.2307 26.6735C26.4667 26.6735 26.696 26.7018 26.9162 26.7538C28.2225 27.0623 29.1946 28.2322 29.1946 29.6292V38.8712C25.7004 37.2544 23.2704 33.7245 23.2668 29.6384Z" fill="white" />
        <path d="M40.724 32.5849C39.0878 32.5849 37.7611 31.2628 37.7601 29.6315L37.7602 29.6293C37.7602 27.2743 35.8389 25.3586 33.4774 25.3586C31.1165 25.3586 29.1958 27.2731 29.1946 29.6269C29.1936 28.2308 28.2216 27.0621 26.9162 26.7538C26.6958 26.7018 26.4667 26.6735 26.2307 26.6735C24.5936 26.6735 23.2666 27.9967 23.2666 29.6292C23.2666 24.0146 27.847 19.4471 33.4774 19.4471C39.1045 19.4471 43.6829 24.0098 43.688 29.6201C43.688 29.6233 43.6881 29.6261 43.6881 29.6293C43.6881 31.2617 42.3609 32.5849 40.724 32.5849Z" fill="#E2FDFF" />
      </svg>
    </div>
  );
}

function VEmblem({ size = 60 }) {
  return <PLogo size={size} />;
}
function VWordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <PLogo size={34} shadow={false} />
      <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--sd-colour-text-primary)' }}>Playground</span>
    </div>
  );
}

/* image with graceful fallback — if the placeholder photo fails to load (offline / rate-limited),
   render `fallback` instead of a broken image icon. */
function PhotoImg({ src, alt = '', style, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={style} />;
}

/* educator avatar — placeholder photo (pravatar), falling back to initials on a coloured disc */
function VEduAvatar({ e, size = 42 }) {
  if (!e) return null;
  const initials = (
    <div style={{ width: size, height: size, borderRadius: '50%', background: e.color || 'var(--sd-colour-cyan-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>{e.initials || (e.name || '?')[0]}</div>
  );
  return <PhotoImg src={EDU_PHOTO(e)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--sd-colour-grey-200)' }} fallback={initials} />;
}

/* PLACEHOLDER "Little Bugs" service avatar — shown once the service is signed in (swaps in for the
   Playground P). CIRCULAR so the travelling mark morphs cleanly P-logo → service → educator photo
   (all three are circles). Self-contained SVG stand-in for a real service logo. */
function SchoolLogo({ size = 60, shadow = true }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', boxShadow: shadow ? '0 8px 20px rgba(0,40,34,0.22)' : 'none' }}>
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ display: 'block' }}>
        <circle cx="32" cy="32" r="32" fill="#FFFFFF" />
        <circle cx="32" cy="32" r="29.5" fill="none" stroke="var(--sd-colour-cyan-700)" strokeWidth="2.5" />
        {/* leaf */}
        <path d="M16 40 C16 26 30 22 44 22 C44 36 30 42 16 40 Z" fill="var(--sd-colour-cyan-500)" opacity="0.9" />
        <path d="M19 38 C27 33 35 29 42 25" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* ladybug */}
        <circle cx="40" cy="40" r="9" fill="#E5484D" />
        <path d="M40 31 a9 9 0 0 0 0 18 Z" fill="#C2282C" />
        <line x1="40" y1="31" x2="40" y2="49" stroke="#2A1212" strokeWidth="1.4" />
        <circle cx="36" cy="38" r="1.5" fill="#2A1212" /><circle cx="44" cy="38" r="1.5" fill="#2A1212" />
        <circle cx="37" cy="44" r="1.5" fill="#2A1212" /><circle cx="43" cy="44" r="1.5" fill="#2A1212" />
        <circle cx="40" cy="30" r="3" fill="#2A1212" />
      </svg>
    </div>
  );
}

/* educator photo as a brand mark — round portrait with a white ring (shown on PIN/room/same-day
   once an educator is signing in). Falls back to the school crest if the photo is missing. */
function EduPhotoMark({ e, size = 60 }) {
  const [failed, setFailed] = useState(false);
  const photo = EDU_PHOTO(e);
  if (!photo || failed) return <SchoolLogo size={size} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, padding: 3, background: '#fff', boxShadow: '0 8px 20px rgba(0,40,34,0.22)', boxSizing: 'border-box' }}>
      <img src={photo} alt="" onError={() => setFailed(true)} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

/* the hero brand mark swaps as the user progresses:
   service → Playground P · educator-select / add → Little Bugs school crest · pin/room/same-day → the
   signing-in educator's photo. */
function HeroBrand({ step, educator, size, float }) {
  if (step === 'service') return <PLogo size={size} float={float} />;
  if (step === 'pin' || step === 'edupass' || step === 'rooms' || step === 'sameday') return <EduPhotoMark e={educator || EDUCATORS[0]} size={size} />;
  return <SchoolLogo size={size} />; // educator-select / add + any error/blocking step (service signed in)
}
function VRoomAvatar({ name, size = 42 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 'var(--sd-radius-m)', background: 'var(--sd-colour-cyan-100)', color: 'var(--sd-colour-cyan-700)', fontWeight: 700, fontSize: size * 0.42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{(name || 'R')[0]}</div>
  );
}
function VCheckDisc({ dark }) {
  return (
    <span style={{ width: 24, height: 24, borderRadius: '50%', background: dark ? '#fff' : V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src={ICON2('tick')} alt="" style={{ width: 13, height: 13, filter: dark ? 'none' : 'brightness(0) invert(1)' }} />
    </span>
  );
}
function VEduRow({ initials, color, photo, img, name, login, onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '10px 15px' }}>
      <VEduAvatar e={{ initials, color, photo, img }} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{name}</div>
        {login != null && <div style={{ fontSize: 13, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Signed in {agoLabel(login)}</div>}
      </div>
      <img src={ICON2('chevron-right')} alt="" style={{ width: 18, height: 18, opacity: dark ? 0.85 : 0.4, flexShrink: 0, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />
    </button>
  );
}
/* magnifier glyph (no search icon in the asset set) */
function SearchIcon({ color = 'currentColor' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <path d="M20 20l-3.4-3.4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
/* search field — filters the educator list (so you don't scroll the full roster) */
function VSearch({ value, onChange, placeholder = 'Search educators', dark }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 14, display: 'flex', color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', opacity: dark ? 0.9 : 0.55, pointerEvents: 'none' }}><SearchIcon /></span>
      <input className={'v-input' + (dark ? ' v-input--dark' : '')} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
        boxSizing: 'border-box', width: '100%', height: 46, margin: 0, padding: '0 14px 0 42px',
        fontFamily: 'var(--sd-font-family)', fontSize: 15, fontWeight: 500,
        color: dark ? '#fff' : 'var(--sd-colour-text-primary)', background: dark ? D_FILL : 'var(--sd-colour-surface-default)',
        border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`, borderRadius: 'var(--sd-radius-lg)',
      }} />
    </div>
  );
}
/* sort chips — "Recent" (most recent login) / "Name" */
function VSortPills({ value, onChange, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Sort</span>
      {[['recent', 'Recent'], ['name', 'Name']].map(([k, l]) => {
        const sel = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1px solid ${sel ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)')}`,
            background: sel ? (dark ? '#fff' : 'var(--sd-colour-cyan-50)') : 'transparent',
            color: sel ? V_TEAL : (dark ? '#fff' : 'var(--sd-colour-text-secondary)'),
          }}>{l}</button>
        );
      })}
    </div>
  );
}
/* "Add educator profile" row — a clean clickable card (no lead icon), "Sign in" link on the right.
   Opens the add-educator sign-up screen. Matches the educator rows below it. */
function VAddRow({ onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '18px 18px' }}>
      <span style={{ fontSize: 16.5, fontWeight: 600, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>Add educator profile</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>Sign in</span>
    </button>
  );
}

/* Room row — subtitle is the kids:educators ratio. `attention` rooms (under ratio / need cover) get an
   amber accent + label; `disabled` rooms are greyed, show their note, and can't be selected. */
/* room thumbnail — themed placeholder photo (loremflickr), swap for real room photos later */
function VRoomThumb({ name, size = 46, dim }) {
  const base = { width: size, height: size, borderRadius: 'var(--sd-radius-m)', flexShrink: 0, ...(dim ? { filter: 'grayscale(0.5)', opacity: 0.7 } : {}) };
  const letter = <div style={{ ...base, background: 'var(--sd-colour-cyan-100)', color: 'var(--sd-colour-cyan-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.42 }}>{(name || 'R')[0]}</div>;
  return <PhotoImg src={ROOM_PHOTO(name)} style={{ ...base, objectFit: 'cover', background: 'var(--sd-colour-grey-200)' }} fallback={letter} />;
}
function VRoomRow({ name, ratio, attention, disabled, note, selected, onClick, dark }) {
  const amber = 'var(--sd-colour-orange-500)';
  const txt = dark ? '#fff' : 'var(--sd-colour-text-primary)';
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  // explicit longhand borders (no `border` shorthand) so the attention left-accent doesn't
  // trip React's shorthand/longhand mix warning.
  const bc = selected ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)');
  const bw = selected ? 1.5 : 1;
  if (disabled) {
    return (
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, justifyContent: 'space-between', background: dark ? 'rgba(255,255,255,0.04)' : 'var(--sd-colour-grey-100)', border: `1px dashed ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '12px 16px', opacity: 0.75, cursor: 'not-allowed' }}>
        <VRoomThumb name={name} dim />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: sub }}>{name}</div>
          <div style={{ fontSize: 12, color: sub }}>Ratio {ratio}</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: sub, background: dark ? D_FILL : 'var(--sd-colour-grey-200)', borderRadius: 999, padding: '4px 11px', whiteSpace: 'nowrap' }}>{note || 'Unavailable'}</span>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', borderStyle: 'solid', borderTopWidth: bw, borderTopColor: bc, borderRightWidth: bw, borderRightColor: bc, borderBottomWidth: bw, borderBottomColor: bc, borderLeftWidth: attention ? 4 : bw, borderLeftColor: attention ? amber : bc, borderRadius: 'var(--sd-radius-lg)', padding: '12px 16px', transition: 'border-color .2s' }}>
      <VRoomThumb name={name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: txt }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: sub }}>
          <span>Ratio {ratio}</span>
          {attention && <span style={{ color: amber, fontWeight: 700 }}>· Needs attention</span>}
        </div>
      </div>
      {selected ? <VCheckDisc dark={dark} /> : <span style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`, flexShrink: 0 }} />}
    </button>
  );
}
function VSummaryRow({ avatar, title, sub, action, onAction, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '12px 15px' }}>
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{title}</div>
        <div style={{ fontSize: 13, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{sub}</div>
      </div>
      {action && <button onClick={onAction} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>{action}</button>}
    </div>
  );
}

/* inline alert banner (offline / closed-room warning). `dark` = light-on-teal (immersive);
   `big` = iPad scale. Shared by the phone (buildStepCfg) and iPad (iCfg) error states. */
function VAlert({ text, action, onAction, dark, big }) {
  const col = dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)';
  const bg = dark ? 'rgba(255,120,100,0.18)' : 'var(--sd-colour-red-20)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: bg, borderRadius: 'var(--sd-radius-m)', padding: big ? '14px 16px' : '10px 12px', fontSize: big ? 15 : 13, fontWeight: 500, color: col }}>
      <img src={ICON2('info-alert')} alt="" style={{ width: big ? 18 : 16, height: big ? 18 : 16, flexShrink: 0, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />
      <span style={{ flex: 1, lineHeight: 1.4 }}>{text}</span>
      {action && <button type="button" onClick={onAction} style={{ all: 'unset', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', color: col }}>{action}</button>}
    </div>
  );
}

/* centred blocking / empty state (app disabled, no access, list failed, no rooms, PIN locked,
   bootstrap failed). Rendered as a step's `children` with center:true so the shell vertically
   centres it. `tone="error"` = red glyph; `dark` = white-on-teal; `big` = iPad scale.
   Provide a `glyph` (text), `iconName` (asset), or `node` (custom SVG inheriting currentColor). */
function VStatePanel({ tone = 'neutral', glyph, iconName, node, title, body, secondary, onSecondary, dark, big }) {
  const isErr = tone === 'error';
  const circleBg = dark ? 'rgba(255,255,255,0.16)' : (isErr ? 'var(--sd-colour-red-20)' : 'var(--sd-colour-grey-200)');
  const fg = dark ? '#fff' : (isErr ? 'var(--sd-colour-feedback-error-default)' : 'var(--sd-colour-text-secondary)');
  const sz = big ? 84 : 66;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 14px' }}>
      <div style={{ width: sz, height: sz, borderRadius: '50%', background: circleBg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: big ? 22 : 18 }}>
        {iconName ? <img src={ICON2(iconName)} alt="" style={{ width: big ? 34 : 28, height: big ? 34 : 28, opacity: 0.5, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />
          : node ? node
          : <span style={{ fontSize: big ? 34 : 27, fontWeight: 600, lineHeight: 1 }}>{glyph}</span>}
      </div>
      <h2 style={{ fontSize: big ? 26 : 20, fontWeight: 700, margin: '0 0 8px', color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{title}</h2>
      <p style={{ fontSize: big ? 16 : 14, lineHeight: 1.5, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', margin: 0, maxWidth: big ? 360 : 250 }}>{body}</p>
      {secondary && <button type="button" onClick={onSecondary} style={{ all: 'unset', cursor: 'pointer', marginTop: big ? 16 : 14, fontSize: big ? 16 : 14, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>{secondary}</button>}
    </div>
  );
}

/* small lock glyph for the PIN-locked state (inherits the circle's currentColor) */
function LockGlyph({ big }) {
  const s = big ? 34 : 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/* Redesigned keypad — clean circular keys (no letter sub-labels), larger touch targets. */
const VKEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
function VKey({ children, onClick, label, dark }) {
  const ks = {
    all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: 66, height: 66, borderRadius: '50%',
    background: dark ? D_FILL : 'var(--sd-colour-grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, fontWeight: 600, color: dark ? '#fff' : 'var(--sd-colour-text-primary)', margin: '0 auto',
  };
  return <button className="v-key" onClick={onClick} aria-label={label} style={ks}>{children}</button>;
}
function VKeypad({ onPress, onDelete, dark }) {
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
      {VKEYS.map((d) => <VKey key={d} dark={dark} onClick={() => onPress(d)}>{d}</VKey>)}
      <span />
      <VKey dark={dark} onClick={() => onPress('0')}>0</VKey>
      <button onClick={onDelete} aria-label="Delete" className="v-key" style={{ all: 'unset', cursor: 'pointer', width: 66, height: 66, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, margin: '0 auto' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity: dark ? 0.9 : 0.65 }}>
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 9.5 L17 14.5 M17 9.5 L13 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
function VPinDots({ filled, shake, dark }) {
  const onCol = dark ? '#fff' : V_TEAL;
  const offBorder = dark ? 'rgba(255,255,255,0.35)' : 'var(--sd-colour-grey-400)';
  return (
    <div className={shake ? 'v-shake' : ''} style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) => {
        const on = i < filled;
        // key flips when the dot fills → it remounts and plays the pop once
        return <span key={`${i}-${on}`} className={on ? 'v-pop' : ''} style={{ width: 16, height: 16, borderRadius: '50%', boxSizing: 'border-box', background: on ? onCol : 'transparent', border: on ? `2px solid ${onCol}` : `2px solid ${offBorder}`, transition: 'background .15s, border-color .15s' }} />;
      })}
    </div>
  );
}

/* a per-variant credentials hook — pre-filled with the demo creds (see right-rail reference card).
   submit(onOk) validates against the demo creds; wrong username/password trips the error state. */
function useCreds() {
  const [username, setUsername] = useState(DEMO_USER);
  const [password, setPassword] = useState(DEMO_PASS);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const changeUser = (v) => { setUsername(v); setErr(false); };
  const changePass = (v) => { setPassword(v); setErr(false); };
  const pwProps = {
    type: showPw ? 'text' : 'password', placeholder: 'Password', value: password, onChange: changePass,
    trail: showPw ? 'view-hide' : 'view', onTrail: () => setShowPw((s) => !s),
  };
  const userProps = { placeholder: 'Username', value: username, onChange: changeUser, lead: 'user' };
  // valid creds → ~1.15s "Signing in…" loading phase (the repo's button loading state) before advancing.
  const submit = (onOk) => {
    if (username === DEMO_USER && password === DEMO_PASS) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onOk(); }, 1150);
    } else setErr(true);
  };
  return { userProps, pwProps, ready: !!(username && password), err, loading, submit };
}

/* ====================================================================
 * SERVICE-LOGIN SCREEN
 * v0.1 is locked to the Playful tall-scene direction, whose service login is
 * rendered by the animated <Flow3> (persistent hero + sliding bottom sheet),
 * defined below — NOT a static Service component. The other directions'
 * Service1/2/4/5/6 screens were removed when this direction was isolated.
 * ==================================================================== */

// variant 3 (the only direction here) is handled by <Flow3>, so there are no static SERVICE entries.
const SERVICE = {};

/* ====================================================================
 * THEMED SHELLS for the downstream steps (educator / PIN / room / confirm)
 * Each variant carries its visual language: light panel, floating card, or cosmic hero+sheet.
 * ==================================================================== */

const VARIANT_META = {
  3: { kind: 'hero',  card: false, heroH: 280 }, // Playful tall-scene — the only direction in v0.1
};

function LightBack({ kind, onNav }) {
  return (
    <>
      <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 22, left: 22, zIndex: 3, display: 'flex', alignItems: 'center', gap: 2, color: 'var(--sd-colour-text-secondary)', fontSize: 15, fontWeight: 600 }}>
        <span style={{ fontSize: 20, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
      </button>
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', zIndex: 2, fontSize: 15, fontWeight: 700, color: 'var(--sd-colour-text-primary)', pointerEvents: 'none' }}>{SERVICE_NAME}</div>
    </>
  );
}
function HeroNav({ kind, onNav }) {
  return (
    <>
      <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 18, left: 18, zIndex: 3, display: 'flex', alignItems: 'center', gap: 2, color: '#fff', fontSize: 15, fontWeight: 600 }}>
        <span style={{ fontSize: 20, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
      </button>
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', zIndex: 2, fontSize: 15, fontWeight: 700, color: '#fff', pointerEvents: 'none' }}>{SERVICE_NAME}</div>
    </>
  );
}

function VHeader({ title, subtitle, align, light }) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ textAlign: align, width: '100%' }}>
      {title && <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 5px', color: light ? '#fff' : 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: 14.5, margin: 0, color: light ? 'var(--sd-colour-cyan-100)' : 'var(--sd-colour-text-secondary)', lineHeight: 1.4 }}>{subtitle}</p>}
    </div>
  );
}

/* light variants 1 & 2 — brand + header + scrollable content + pinned footer.
   `center` (same-day) vertically centres the brand+header+content group above the footer. */
function PanelShell({ meta, title, subtitle, nav, onNav, children, footer, center: centerY, noBrand }) {
  const center = meta.align === 'center';
  const brand = meta.brand === 'wordmark' ? <VWordmark /> : <VEmblem size={54} />;
  const body = (
    <>
      {!noBrand && <div style={{ display: 'flex', justifyContent: center ? 'center' : 'flex-start', width: '100%' }}>{brand}</div>}
      <VHeader title={title} subtitle={subtitle} align={center ? 'center' : 'left'} />
      <div style={{ ...(centerY ? {} : { flex: 1, minHeight: 0, overflowY: 'auto' }), width: '100%', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 2 }}>{children}</div>
    </>
  );
  return (
    <div style={{ ...phone2, background: meta.bg, padding: center ? '60px 26px 24px' : '62px 28px 24px', position: 'relative' }}>
      {nav && <LightBack kind={nav} onNav={onNav} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'stretch', gap: 16, flex: 1, minHeight: 0 }}>
        {centerY ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'stretch', justifyContent: 'center', gap: 16, width: '100%' }}>{body}</div> : body}
        {footer && <div style={{ width: '100%' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* variant 5 — floating white card with emblem overlapping its top */
function CardPanelShell({ meta, title, subtitle, nav, onNav, children, footer, noBrand }) {
  return (
    <div style={{ ...phone2, background: meta.bg, padding: '0 20px', position: 'relative', justifyContent: 'center' }}>
      {nav && <LightBack kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', width: '100%', maxWidth: 330, maxHeight: '84%', display: 'flex', flexDirection: 'column' }}>
        {!noBrand && <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><VEmblem size={58} /></div>}
        <div style={{ background: 'var(--sd-colour-surface-default)', borderRadius: 24, padding: noBrand ? '24px 22px' : '46px 22px 24px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'hidden' }}>
          <VHeader title={title} subtitle={subtitle} align="center" />
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}

/* cosmic variants 3 & 4 — hero (full-bleed gradient / rounded card) + white sheet */
function HeroShell({ meta, title, subtitle, nav, onNav, children, footer, center: centerY, noBrand }) {
  const heroH = meta.heroH || 260;
  const bodyJustify = centerY ? { justifyContent: 'center' } : {};
  const heroInner = (
    <>
      <VScene h={heroH} />
      {nav && <HeroNav kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '0 28px' }}>
        {!noBrand && <PLogo size={48} />}
        <VHeader title={title} subtitle={subtitle} align="center" light />
      </div>
    </>
  );
  if (meta.card) {
    return (
      <div style={{ ...phone2, background: 'var(--sd-colour-surface-default)', padding: '16px 16px 0' }}>
        <div style={{ height: heroH, position: 'relative', borderRadius: 28, overflow: 'hidden', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>{heroInner}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 10px 22px' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, ...bodyJustify }}>{children}</div>
          {footer}
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...phone2, background: V_HERO_GRAD }}>
      <div style={{ height: heroH, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>{heroInner}</div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 -10px 36px rgba(0,40,34,0.3)', position: 'relative', zIndex: 2, marginTop: -22 }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, ...bodyJustify }}>{children}</div>
        {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* variant 6 — immersive full-bleed teal: left-aligned white header + scene, content sits directly
   on the teal as translucent cards (children are built dark via buildStepCfg). */
function ImmersiveShell({ title, subtitle, nav, onNav, children, footer, center: centerY }) {
  const body = (
    <>
      <VHeader title={title} subtitle={subtitle} align="left" light />
      <div style={{ ...(centerY ? {} : { flex: 1, minHeight: 0, overflowY: 'auto' }), display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 2 }}>{children}</div>
    </>
  );
  return (
    <div style={{ ...phone2, background: V_IMMERSIVE, padding: '64px 26px 24px', position: 'relative' }}>
      <VScene h={240} />
      {nav && <HeroNav kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18, flex: 1, minHeight: 0 }}>
        {centerY ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>{body}</div> : body}
        {footer && <div style={{ width: '100%' }}>{footer}</div>}
      </div>
    </div>
  );
}

function Shell(props) {
  if (props.meta.kind === 'immersive') return <ImmersiveShell {...props} />;
  if (props.meta.kind === 'hero') return <HeroShell {...props} />;
  if (props.meta.card) return <CardPanelShell {...props} />;
  return <PanelShell {...props} />;
}

/* themed room-hub landing (the post-login destination — neutral app shell) */
function VHub({ room, educator, onChangeRoom, onSwitch, onLogout }) {
  const ed = educator || EDUCATORS[0];
  const rn = room || ROOM_POOL[0].name;
  return (
    <div style={{ ...phone2, background: 'var(--sd-colour-grey-100)' }}>
      <div style={{ background: 'var(--sd-colour-surface-default)', padding: '52px 20px 16px', borderBottom: '1px solid var(--sd-colour-grey-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--sd-colour-text-secondary)' }}>Room hub</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>{rn}</div>
        </div>
        <VEduAvatar e={ed} size={36} />
      </div>
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sd-colour-text-secondary)' }}>Roster · loading…</div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--sd-colour-surface-default)', borderRadius: 'var(--sd-radius-lg)', padding: '12px 15px' }}>
            <div className="v-skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div className="v-skeleton" style={{ height: 11, width: `${62 - i * 7}%`, borderRadius: 6 }} />
              <div className="v-skeleton" style={{ height: 9, width: `${42 - i * 4}%`, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px 22px', background: 'var(--sd-colour-surface-default)', borderTop: '1px solid var(--sd-colour-grey-300)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onChangeRoom} className="v-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flex: 1, height: 48, borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${V_TEAL}`, color: V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600 }}>Change room</button>
          <button onClick={onSwitch} className="v-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flex: 1, height: 48, borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${V_TEAL}`, color: V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600 }}>Switch educator</button>
        </div>
        <button onClick={onLogout} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>Log out of {SERVICE_NAME}</button>
      </div>
    </div>
  );
}

/* Idle auto-lock — on a SHARED room tablet, the session is re-protected after inactivity so the
   next person can't act as the signed-in educator. Re-auth with the educator's PIN, or switch / log out. */
function LockOverlay({ educator, onUnlock, onSwitch, onLogout }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (pin.length < 4) return;
    const t = setTimeout(() => {
      if (pin === DEMO_PIN) onUnlock();
      else { setShake(true); setTimeout(() => setShake(false), 450); setPin(''); }
    }, 200);
    return () => clearTimeout(t);
  }, [pin]);
  const ed = educator || EDUCATORS[0];
  const first = ed.name.split(' ')[0];
  const link = { all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'underline' };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
      <VScene h={320} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
        <EduPhotoMark e={ed} size={72} />
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Screen locked</h1>
          <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0 }}>Enter {first}’s PIN to continue</p>
        </div>
        <VPinDots filled={pin.length} shake={shake} dark />
        <div style={{ width: '100%', maxWidth: 280, marginTop: 4 }}>
          <VKeypad dark onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 4 }}>
          <button type="button" onClick={onSwitch} style={link}>Not {first}?</button>
          <button type="button" onClick={onLogout} style={link}>Log out</button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
 * ERROR & EMPTY STATES (scenario 4) — the PRD §9 matrix. Each opens from the
 * gallery as its own step (e-*), rendered through the SAME themed Shell/IShell
 * path as the happy-path steps, so every state re-themes across all 6 directions.
 * ==================================================================== */
const ERROR_STATES = [
  { step: 'e-creds',     label: 'Wrong credentials',       sub: 'Service login · inline error' },
  { step: 'e-offline',   label: 'Offline / no network',    sub: 'Service login · banner + retry' },
  { step: 'e-disabled',  label: 'App disabled',            sub: 'Blocking state' },
  { step: 'e-noaccess',  label: 'No access / forbidden',   sub: 'Blocking state' },
  { step: 'e-edulist',   label: 'Educator list failed',    sub: 'Error + retry' },
  { step: 'e-locked',    label: 'PIN locked',              sub: 'Lockout · blocking' },
  { step: 'e-norooms',   label: 'No rooms available',      sub: 'Empty state' },
  /* e-closed removed — closed rooms are hard-disabled per spec, no enter-anyway path */
  { step: 'e-password',  label: 'Educator password login', sub: 'Password auth branch (mirrors S7)' },
  { step: 'e-bootstrap', label: 'Bootstrap failed',        sub: 'Error + retry' },
  { step: 'e-lock',      label: 'Auto screen-lock',        sub: 'After 30s idle · PIN re-auth' },
];
const ERROR_STEPS = ERROR_STATES.map((e) => e.step);
const isErrorView = (step) => step === 'gallery' || ERROR_STEPS.includes(step);

/* neutral picker for the error states (matches the original edge-case gallery). Device-agnostic:
   `big` scales it for iPad and lays the tiles out in a 2-column grid. onPick(step) opens a state. */
function ErrorGallery({ onPick, big }) {
  const listStyle = big
    ? { padding: '24px 56px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start', flex: 1, minHeight: 0, overflowY: 'auto' }
    : { padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, overflowY: 'auto' };
  return (
    <div style={{ ...(big ? ipadScreen : phone2), background: 'var(--sd-colour-grey-100)' }}>
      <div style={{ background: 'var(--sd-colour-surface-default)', padding: big ? '56px 56px 22px' : '52px 24px 16px', borderBottom: '1px solid var(--sd-colour-grey-300)', flexShrink: 0 }}>
        <div style={{ fontSize: big ? 14 : 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--sd-colour-text-secondary)' }}>Error states</div>
        <div style={{ fontSize: big ? 30 : 22, fontWeight: 700, color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>Error &amp; empty states</div>
      </div>
      <div style={listStyle}>
        {ERROR_STATES.map((e) => (
          <button key={e.step} type="button" onClick={() => onPick(e.step)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: big ? '16px 20px' : '12px 16px' }}>
            <div>
              <div style={{ fontSize: big ? 17 : 15, fontWeight: 700, color: 'var(--sd-colour-text-primary)' }}>{e.label}</div>
              <div style={{ fontSize: big ? 13 : 12, color: 'var(--sd-colour-text-secondary)' }}>{e.sub}</div>
            </div>
            <img src={ICON2('chevron-right')} alt="" style={{ width: big ? 20 : 18, height: big ? 20 : 18, opacity: 0.4 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
 * STEP CONTENT — shared between the static Shell path (variants 1/2/4/5)
 * and the animated Flow3 (variant 3). Given the step + a context object of
 * the harness's state & setters, returns { title, subtitle, nav, onNav, children, footer }.
 * ==================================================================== */
function buildStepCfg(step, ctx) {
  const {
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin, dark, scenario,
    eduSort, eduQuery, setEduSort, setEduQuery, roomsContinue, samedayContinue, switchEducator,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  } = ctx;
  const noteCol = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  const errCol = dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)';

  if (step === 'educators') {
    const list = sortedEducators(eduSort, eduQuery);
    return {
      title: `Welcome to ${SERVICE_NAME}`, subtitle: 'Please sign into your Educator Profile', nav: 'logout', onNav: resetFlow,
      children: (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <VSortPills value={eduSort} onChange={setEduSort} dark={dark} />
            <VSearch value={eduQuery} onChange={setEduQuery} dark={dark} />
          </div>
          <div className="v-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <VAddRow dark={dark} onClick={() => { setAddEmail(''); setAddPin(''); setStep('addEducator'); }} />
            {list.map((e) => <VEduRow key={e.name} {...e} dark={dark} onClick={() => { setEducator(e); setPin(''); setAttempts(0); setStep('pin'); }} />)}
          </div>
          {list.length === 0 && <p style={{ textAlign: 'center', fontSize: 13, color: noteCol, margin: '8px 0' }}>No educators match “{eduQuery}”.</p>}
        </>
      ),
    };
  }
  if (step === 'addEducator') {
    const ready2 = addEmail && addPin;
    return {
      title: 'Add Educator Profile', subtitle: 'Please sign into your Educator Profile', nav: 'back', onNav: () => setStep('educators'),
      children: (
        <>
          <VField label="Educator email or phone" placeholder="Email or phone number" value={addEmail} onChange={setAddEmail} dark={dark} />
          <VField label="Password or access PIN" type={showAddPin ? 'text' : 'password'} placeholder="Password or Pin" value={addPin} onChange={setAddPin} trail={showAddPin ? 'view-hide' : 'view'} onTrail={() => setShowAddPin((s) => !s)} dark={dark} />
          <VTerms dark={dark} />
        </>
      ),
      footer: <VBtn dark={dark} disabled={!ready2} onClick={() => { setEducator({ initials: 'NE', color: 'var(--sd-colour-cyan-600)', name: 'New educator', role: 'Educator' }); setAddEmail(''); setAddPin(''); setStep('rooms'); }}>Sign in</VBtn>,
    };
  }
  if (step === 'pin') {
    const ed = educator || EDUCATORS[0];
    const first = ed.name.split(' ')[0];
    const MAX = 5;
    // lockout after MAX wrong attempts (the real-flow version of the gallery's PIN-locked state)
    if (attempts >= MAX) {
      return {
        title: null, subtitle: null, nav: 'back', onNav: () => { setAttempts(0); setPin(''); setStep(scenario === 'return' ? 'sameday' : 'educators'); }, center: true,
        children: <VStatePanel dark={dark} tone="error" node={<LockGlyph />} title="PIN locked" body={`Too many incorrect attempts for ${first}. Try again in 5 minutes, or switch educator.`} secondary="Switch educator" onSecondary={switchEducator} />,
      };
    }
    const left = MAX - attempts;
    return {
      title: `Hi ${first}`, subtitle: 'Enter your PIN to continue', nav: 'back', onNav: () => { setPin(''); setStep(scenario === 'return' ? 'sameday' : 'educators'); }, center: true,
      // PIN auto-submits once 4 digits are entered (the [pin] effect).
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <VPinDots filled={pin.length} shake={shake} dark={dark} />
          {attempts > 0 && <p style={{ textAlign: 'center', fontSize: 13, color: errCol, margin: 0 }}>Incorrect PIN — {left} {left === 1 ? 'try' : 'tries'} left</p>}
          <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
            <VKeypad dark={dark} onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
          </div>
          <VLink align="center" dark={dark} onClick={() => { setPin(''); setAttempts(0); setAddPin(''); setStep('edupass'); }}>Forgot PIN? Use password</VLink>
        </div>
      ),
    };
  }
  if (step === 'edupass') {
    const ed = educator || EDUCATORS[0];
    return {
      title: 'Enter your password', subtitle: `Signing in as ${ed.name}`, nav: 'back', onNav: () => setStep('pin'), center: true,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <VField label="Password" type={showAddPin ? 'text' : 'password'} placeholder="Your password" value={addPin} onChange={setAddPin} trail={showAddPin ? 'view-hide' : 'view'} onTrail={() => setShowAddPin((s) => !s)} dark={dark} />
        </div>
      ),
      footer: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VBtn dark={dark} disabled={!addPin} onClick={() => { setAddPin(''); setRoom((rm) => rm || firstRoom(rooms).name); setStep(scenario === 'return' ? 'hub' : 'rooms'); }}>Sign in</VBtn>
          <VLink align="center" dark={dark} onClick={() => setStep('pin')}>Use PIN instead</VLink>
        </div>
      ),
    };
  }
  if (step === 'rooms') {
    return {
      title: 'Select your room', subtitle: 'Where are you working today?', nav: 'back', onNav: () => setStep(scenario === 'return' ? 'sameday' : 'educators'),
      children: (
        <div className="v-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(rooms || []).map((r) => <VRoomRow key={r.name} {...r} dark={dark} selected={room === r.name} onClick={() => setRoom(r.name)} />)}
        </div>
      ),
      footer: <VBtn dark={dark} disabled={!room} onClick={roomsContinue}>{room ? `Continue to ${room}` : 'Select a room'}</VBtn>,
    };
  }
  if (step === 'sameday') {
    const ed = educator || EDUCATORS[0];
    const rn = room || firstRoom(rooms).name;
    const rr = roomByName(rn, rooms);
    const first = ed.name.split(' ')[0];
    return {
      // top-left reads "Log out" (full sign-out → service); content sits just under the header (no big gap).
      title: <>Welcome Back<br />{ed.name}</>, subtitle: 'Your room for today', nav: 'logout', onNav: resetFlow,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          {/* same-day remembered room is a clean selected (green) card — no needs-attention accent here;
              that treatment lives only on the room-select list. */}
          <VRoomRow name={rn} ratio={rr.ratio} dark={dark} selected onClick={() => {}} />
          <p style={{ fontSize: 12.5, fontWeight: 600, textAlign: 'center', color: dark ? '#fff' : V_LINK, margin: '4px 0 0' }}>Remembered from your last session</p>
          <VLink align="center" dark={dark} onClick={() => setStep('rooms')}>Change room</VLink>
          {/* shared-device safety net: not the remembered educator? switch to a different one. */}
          <div style={{ marginTop: 8, paddingTop: 14, borderTop: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-200)'}`, textAlign: 'center' }}>
            <span style={{ fontSize: 13.5, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Not {first}? </span>
            <button type="button" onClick={switchEducator} style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: dark ? '#fff' : V_LINK }}>Switch educator</button>
          </div>
        </div>
      ),
      footer: <VBtn dark={dark} onClick={samedayContinue}>Continue to {rn}</VBtn>,
    };
  }

  // ── error & empty states (scenario 4). Back / primary actions all return to the gallery. ──
  if (isErrorView(step) && step !== 'gallery') {
    const toGallery = () => setStep('gallery');
    const back = { nav: 'back', onNav: toGallery };
    if (step === 'e-creds') return {
      /* mirrors the real S1 error (v0.6 immersive service screen, no Terms line) */
      title: "Let's sign you in", subtitle: 'Welcome back to your service.', ...back,
      children: (
        <>
          <VField label="Service username" value="LittleBugs" onChange={() => {}} lead="user" dark={dark} />
          <VField label="Service password" type="password" value="wrongpass123" onChange={() => {}} invalid error={LOGIN_ERR} dark={dark} />
        </>
      ),
      footer: <VBtn dark={dark} onClick={toGallery}>Sign in</VBtn>,
    };
    if (step === 'e-offline') return {
      title: 'Sign in to Playground', subtitle: 'Please sign in to your service', ...back,
      children: (
        <>
          <VAlert dark={dark} text="No internet connection." action="Retry" onAction={toGallery} />
          <VField label="Service username" placeholder="Username" value="" onChange={() => {}} lead="user" dark={dark} />
          <VField label="Service password" type="password" placeholder="Password" value="" onChange={() => {}} dark={dark} />
          <VTerms dark={dark} />
        </>
      ),
      footer: <VBtn dark={dark} disabled>Sign in</VBtn>,
    };
    if (step === 'e-disabled') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} tone="error" glyph="⊘" title="App disabled" body="This app has been disabled for your service. Please contact your service administrator." />,
      footer: <VBtn dark={dark} onClick={toGallery}>Back to sign in</VBtn>,
    };
    if (step === 'e-noaccess') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} tone="error" glyph="✕" title="No access" body="Your account doesn't have access to this app. Contact your service administrator to request access." />,
      footer: <VBtn dark={dark} onClick={toGallery}>Back to sign in</VBtn>,
    };
    if (step === 'e-edulist') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} tone="error" glyph="!" title="Couldn't load educators" body="Something went wrong loading the educator list. Check your connection and try again." />,
      footer: <VBtn dark={dark} onClick={toGallery}>Retry</VBtn>,
    };
    if (step === 'e-locked') {
      /* mirrors the real in-flow lockout (S4 at 5 attempts): first-name copy + Switch educator */
      const first = (educator || EDUCATORS[0]).name.split(' ')[0];
      return {
        ...back, center: true, noBrand: true,
        children: <VStatePanel dark={dark} tone="error" node={<LockGlyph />} title="PIN locked" body={`Too many incorrect attempts for ${first}. Try again in 5 minutes, or switch educator.`} secondary="Switch educator" onSecondary={toGallery} />,
      };
    }
    if (step === 'e-norooms') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} iconName="image" title="No rooms available" body="There are no rooms set up for this service yet. Contact your service administrator." secondary="Refresh" onSecondary={toGallery} />,
    };
    if (step === 'e-password') {
      /* mirrors the real S7 (edupass): one password field, Use PIN instead, Sign in */
      const ed = educator || EDUCATORS[0];
      return {
        title: 'Enter your password', subtitle: `Signing in as ${ed.name}`, ...back, center: true,
        children: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <VField label="Password" type="password" placeholder="Your password" value="" onChange={() => {}} trail="view" dark={dark} />
          </div>
        ),
        footer: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <VBtn dark={dark} disabled>Sign in</VBtn>
            <VLink align="center" dark={dark} onClick={toGallery}>Use PIN instead</VLink>
          </div>
        ),
      };
    }
    if (step === 'e-bootstrap') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} tone="error" glyph="!" title="Couldn't start the app" body="Something went wrong while loading. Please try again." />,
      footer: <VBtn dark={dark} onClick={toGallery}>Retry</VBtn>,
    };
  }
  return {};
}

/* ====================================================================
 * FLOW 3 — Playful tall-scene, v0.6 motion system.
 *
 * Each step is a SELF-CONTAINED screen (no persistent morphing hero any more). <Flow3>
 * renders one step; <Flow3Stack> below layers the outgoing + incoming step and runs the
 * fade-through + travelling-mark transition between them (ported from ../motion-lab).
 *
 * "Service to Educator" reveal (from ../service-to-educator): the service-login step is the
 * Immersive teal direction (full-bleed, left-aligned, translucent fields — variants.jsx
 * Service6) rendered full-height; on sign-in the educator step enters with its white sheet
 * sliding up from the bottom (the .v4-sheetup entrance), so the moment still reads as the
 * sheet reveal — now over a fade-through instead of a height morph.
 * ==================================================================== */
const FLOW3_HERO = {
  educators:   { h: 250, logo: 46, head: [`Welcome to ${SERVICE_NAME}`, 'Please sign into your Educator Profile'], nav: 'logout' },
  addEducator: { h: 226, logo: 46, head: ['Add Educator Profile', 'Please sign into your Educator Profile'], nav: 'back' }, /* spec copy — matches HANDOFF S3 + iPad */
  pin:         { h: 250, logo: 46, head: null, nav: 'back' }, // header comes from the step (Hi <name>)
  edupass:     { h: 250, logo: 46, head: null, nav: 'back' }, // educator password fallback (from PIN)
  rooms:       { h: 250, logo: 46, head: ['Select your room', 'Where are you working today?'], nav: 'back' },
  sameday:     { h: 250, logo: 46, head: null, nav: 'back' }, // header from the step (Welcome back, <name>)
};
/* the hero brand slot — reserves the mark's box ([data-mark-anchor]) for the travelling-mark
   overlay to target; the inline mark renders at rest and hides while the overlay is in
   flight (.v4-flying), then takes over the instant the overlay lands (same position/size). */
function MarkSlot({ step, educator, size }) {
  return (
    <div data-mark-anchor style={{ width: size, height: size, flexShrink: 0 }}>
      <div className="v4-inlinemark" style={{ width: '100%', height: '100%' }}>
        <HeroBrand step={step} educator={educator} size={size} />
      </div>
    </div>
  );
}

function Flow3({ step, ctx, onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const ed = ctx.educator || EDUCATORS[0];

  // service login — the Immersive teal direction (variant 6), full-bleed at 100% height.
  // The sign-in fields live directly on the teal; there is no sheet on this step, so the
  // educator step's white sheet can slide up over it (the Service-to-Educator reveal).
  if (step === 'service') {
    // full-bleed immersive teal, whole sign-in group centred vertically + horizontally
    return (
      <div style={{ ...phone2, background: V_IMMERSIVE }}>
        <div className="v3-hero" style={{ height: '100%', position: 'relative', flexShrink: 0, boxSizing: 'border-box' }}>
          <VScene h={640} />
          <div className="v3-herocontent" style={{ position: 'relative', zIndex: 1, height: '100%', boxSizing: 'border-box', padding: '24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MarkSlot step="service" educator={ed} size={54} />
              <h1 style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.15, margin: '18px 0 4px', color: '#fff', textAlign: 'center', letterSpacing: '-0.01em' }}>Sign in to Playground</h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.4, margin: 0, color: 'var(--sd-colour-cyan-100)', textAlign: 'center' }}>Please sign into your service</p>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
                <VField label="Service username" {...userProps} invalid={err} onTeal />
                <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} onTeal />
                <VTerms dark />
                <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} dark />
              </div>
              <div style={{ marginTop: 14 }}><VLink align="center" dark>Forgot Password</VLink></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hero = FLOW3_HERO[step] || FLOW3_HERO.educators;
  const cfg = buildStepCfg(step, ctx);

  // hero heading: most steps come from FLOW3_HERO; the PIN step's "Hi <name>" comes from cfg.
  const headTitle = hero.head ? hero.head[0] : cfg.title;
  const headSub = hero.head ? hero.head[1] : cfg.subtitle;
  const body = cfg.children;
  const footer = cfg.footer;

  // educator & room are long lists → the whole page scrolls (hero is NOT pinned, it scrolls away);
  // the primary footer (room "Continue") stays pinned at the bottom.
  const scrolls = step === 'educators' || step === 'rooms';

  const heroEl = (
    <div className="v3-hero" style={{ height: hero.h, background: V_IMMERSIVE, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', boxSizing: 'border-box', flexShrink: 0 }}>
      <VScene h={hero.h} />
      {cfg.nav && <HeroNav kind={cfg.nav} onNav={cfg.onNav} />}
      <div className="v3-herocontent" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <MarkSlot step={step} educator={ed} size={hero.logo} />
        <div style={{ maxWidth: 290 }}>
          {headTitle && <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{headTitle}</h1>}
          {headSub && <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0, lineHeight: 1.4 }}>{headSub}</p>}
        </div>
      </div>
    </div>
  );

  if (scrolls) {
    // teal root (same immersive canvas as the service screen) so the reveal reads as ONE canvas
    // with the white card sliding up over it — not two teal screens crossfading.
    return (
      <div style={{ ...phone2, background: V_IMMERSIVE }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {heroEl}
          <div className="v3-sheet" style={{ flex: '1 0 auto', background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', boxShadow: '0 -10px 36px rgba(0,40,34,0.3)', marginTop: -24, position: 'relative', zIndex: 2 }}>
            <div className="v3-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{body}</div>
          </div>
        </div>
        {footer && <div style={{ flexShrink: 0, background: 'var(--sd-colour-surface-default)', borderTop: '1px solid var(--sd-colour-grey-200)', padding: '12px 24px 22px' }}>{footer}</div>}
      </div>
    );
  }

  return (
    <div style={{ ...phone2, background: V_IMMERSIVE }}>
      {heroEl}
      <div className="v3-sheet" style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', boxShadow: '0 -10px 36px rgba(0,40,34,0.3)', marginTop: -24, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <div className="v3-body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, ...(step === 'pin' ? { justifyContent: 'center' } : {}) }}>{body}</div>
          {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
 * FLOW3 STACK — the v0.6 transition engine (ported from ../motion-lab, Direction D).
 *
 * Steps render as self-contained layers that FADE-THROUGH (Material-style): the outgoing
 * layer only fades (fast); the incoming layer fades in slightly delayed and rises 16px.
 * Exactly ONE shared element crosses steps — the brand mark — drawn once in the .v4-mark
 * overlay, gliding between the [data-mark-anchor] slots and crossfading
 * Playground P ⇄ school crest ⇄ educator photo mid-flight. At rest the overlay is unmounted
 * and each screen's inline mark shows (so it scrolls with the educator/room lists).
 *
 * Measurement: the FROM position is rect-based against the stack (unscaled by the harness
 * fit() transform), so it matches what's on screen including any scroll; the TO position is
 * offset-accumulated pure layout coordinates — immune to the incoming layer's enter
 * transform (the motion lab's trick). service → educators adds .v4-sheetup: the white sheet
 * slides up from the bottom (the Service-to-Educator reveal).
 *
 * → SwiftUI: matchedGeometryEffect on one small view · Compose: sharedElement on one view
 *   inside SharedTransitionLayout · prefers-reduced-motion: no travel/stagger/rise — the
 *   mark crossfades in place (see the v4 CSS block).
 * ==================================================================== */
const markKind = (step) =>
  step === 'service' ? 'p'
  : (step === 'pin' || step === 'edupass' || step === 'rooms' || step === 'sameday') ? 'edu'
  : 'crest';

/* the ONE shared element — glides between anchors; its three faces crossfade in flight */
function TravelMark({ pos, educator }) {
  return (
    <div className={'v4-mark' + (pos.snap ? ' v4-mark--snap' : '')} aria-hidden="true" style={{ width: pos.size, height: pos.size, transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <div className="v4-mark__face" style={{ opacity: pos.kind === 'p' ? 1 : 0 }}><PLogo size="100%" /></div>
      <div className="v4-mark__face" style={{ opacity: pos.kind === 'crest' ? 1 : 0 }}><SchoolLogo size="100%" /></div>
      <div className="v4-mark__face" style={{ opacity: pos.kind === 'edu' ? 1 : 0 }}><EduPhotoMark e={educator || EDUCATORS[0]} size="100%" /></div>
    </div>
  );
}

function Flow3Stack({ step, ctx, onSignIn }) {
  const stackRef = useRef(null);
  const [cur, setCur] = useState(step);   // the active (incoming/at-rest) layer
  const [out, setOut] = useState(null);   // the outgoing layer while a transition runs
  const [overlay, setOverlay] = useState(null); // { x, y, size, kind, snap } — the flying mark
  const fromRef = useRef(null);
  const timersRef = useRef([]);
  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  useEffect(() => clearTimers, []);

  // 1) step changed → capture the mark's on-screen FROM position before the new layer paints.
  //    Prefer the in-flight overlay (interrupted transition); otherwise the resting inline
  //    anchor. Rect-based relative to the stack, divided by the harness fit() scale.
  useLayoutEffect(() => {
    if (step === cur) return;
    clearTimers();
    const stack = stackRef.current;
    let from = null;
    if (stack) {
      const src = stack.querySelector('.v4-mark') || stack.querySelector(`[data-layer="${cur}"] [data-mark-anchor]`);
      if (src) {
        const sr = stack.getBoundingClientRect();
        const r = src.getBoundingClientRect();
        const scale = stack.offsetWidth ? sr.width / stack.offsetWidth : 1;
        from = { x: (r.left - sr.left) / scale, y: (r.top - sr.top) / scale, size: r.width / scale, kind: markKind(cur) };
      }
    }
    fromRef.current = from;
    setOut(cur);
    setCur(step);
  }, [step, cur]);

  // 2) both layers committed → measure the incoming anchor in pure LAYOUT coordinates
  //    (offset accumulation up to the stack — immune to the enter transform), snap the
  //    overlay onto the old spot, then glide it to the new one. Timeout-chained (not rAF)
  //    so the flight still completes if the tab is backgrounded.
  useLayoutEffect(() => {
    if (!out) return;
    const stack = stackRef.current;
    const anchor = stack && stack.querySelector(`[data-layer="${cur}"] [data-mark-anchor]`);
    const from = fromRef.current;
    const T = (fn, ms) => timersRef.current.push(setTimeout(fn, ms));
    // service → educator reveal: a bottom-sheet slide-up (per Sam's Figma motion). The educator's
    // avatar rides up WITH the sheet, so there is NO travelling mark — skip the overlay and just
    // clear the outgoing (form-out) layer once the slide finishes.
    if (out === 'service' && cur === 'educators') { T(() => setOut(null), 700); return; }
    if (anchor && from) {
      let x = 0, y = 0, el = anchor;
      while (el && el !== stack) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      const to = { x, y, size: anchor.offsetWidth, kind: markKind(cur) };
      setOverlay({ ...from, snap: true });                      // pre-flight: park on the old spot
      T(() => setOverlay({ ...to, snap: false }), 40);          // glide + face crossfade
      T(() => { setOut(null); setOverlay(null); }, 700);        // land → hand off to the inline mark
    } else {
      T(() => setOut(null), 480);                               // no mark on one side — plain fade-through
    }
  }, [cur, out]);

  const sheetUp = out === 'service' && cur === 'educators'; // the Service-to-Educator reveal
  // one keyed ARRAY (not fixed slots) so React MOVES the outgoing node instead of remounting
  // it — the fading layer keeps its scroll position and transient state (e.g. the loading button).
  const layers = [];
  if (out) layers.push(<div key={out} data-layer={out} className={'v4-layer is-out' + (sheetUp ? ' v4-formout' : '')}><Flow3 step={out} ctx={ctx} onSignIn={onSignIn} /></div>);
  layers.push(<div key={cur} data-layer={cur} className={'v4-layer is-in' + (sheetUp ? ' v4-sheetup' : '')}><Flow3 step={cur} ctx={ctx} onSignIn={onSignIn} /></div>);
  return (
    <div ref={stackRef} className={'v4-stack' + (overlay ? ' v4-flying' : '')}>
      {layers}
      {overlay && <TravelMark pos={overlay} educator={ctx.educator} />}
    </div>
  );
}

/* ====================================================================
 * SPLASH — the app-launch screen shown when a direction is opened/restarted.
 * TAILORED PER DIRECTION so the launch reads as the same design language as that variant:
 *   1 Centred classic → white, centred emblem · 2 Editorial → white, left wordmark ·
 *   3 Playful tall-scene → full-bleed teal hero + scene · 4 Playful card → teal card hero on white ·
 *   5 Floating card → white card floating on the mint tint.
 * Self-dismisses (~1.9s), fading out to reveal the sign-in screen behind it.
 * ==================================================================== */
function VSplash({ variant, onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 600);
    const t2 = setTimeout(onDone, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const base = { position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', opacity: leaving ? 0 : 1 };
  // loader for light backgrounds (teal spinner, secondary label) vs the teal hero (white)
  const loaderDark = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <Spinner size={24} color={V_TEAL} />
      <p style={{ color: 'var(--sd-colour-text-secondary)', fontSize: 15, fontWeight: 500, margin: 0 }}>Getting things ready…</p>
    </div>
  );

  // 3 — Playful tall-scene: full-bleed teal hero + drifting kid scene
  if (variant === 3) {
    return (
      <div className="v-splash" style={{ ...base, background: V_HERO_GRAD, alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <VScene h={460} />
        <div className="v-splash-logo" style={{ position: 'relative', zIndex: 1 }}><PLogo size={92} float /></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <BounceDots color="rgba(255,255,255,0.95)" />
          <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 15, fontWeight: 500, margin: 0 }}>Getting things ready…</p>
        </div>
      </div>
    );
  }

  // 4 — Playful card: rounded teal card hero (scene + logo) on white, loader below
  if (variant === 4) {
    return (
      <div className="v-splash" style={{ ...base, background: 'var(--sd-colour-surface-default)', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 320, height: 230, borderRadius: 28, overflow: 'hidden', background: V_HERO_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <VScene h={230} />
          <div className="v-splash-logo" style={{ position: 'relative', zIndex: 1 }}><PLogo size={84} float /></div>
        </div>
        {loaderDark}
      </div>
    );
  }

  // 5 — Floating card: white card floating on the mint tint, emblem overlapping its top
  if (variant === 5) {
    return (
      <div className="v-splash" style={{ ...base, background: 'linear-gradient(165deg, var(--sd-colour-cyan-50), var(--sd-colour-cyan-100))', alignItems: 'center', justifyContent: 'center', padding: '0 22px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <div className="v-splash-logo" style={{ position: 'absolute', top: -31, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><VEmblem size={62} /></div>
          <div style={{ background: 'var(--sd-colour-surface-default)', borderRadius: 24, padding: '58px 24px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {loaderDark}
          </div>
        </div>
      </div>
    );
  }

  // 6 — Immersive teal: full-bleed teal, left-aligned emblem + inline loader
  if (variant === 6) {
    return (
      <div className="v-splash" style={{ ...base, background: V_IMMERSIVE, alignItems: 'flex-start', justifyContent: 'center', gap: 30, padding: '0 28px' }}>
        <VScene h={420} />
        <div className="v-splash-logo" style={{ position: 'relative', zIndex: 1 }}><PLogo size={72} /></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Spinner size={24} color="rgba(255,255,255,0.92)" />
          <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 15, fontWeight: 500, margin: 0 }}>Getting things ready…</p>
        </div>
      </div>
    );
  }

  // 2 — Editorial: white, left-aligned wordmark + inline loader
  if (variant === 2) {
    return (
      <div className="v-splash" style={{ ...base, background: 'var(--sd-colour-surface-default)', alignItems: 'flex-start', justifyContent: 'center', gap: 30, padding: '0 32px' }}>
        <div className="v-splash-logo"><VWordmark /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Spinner size={22} color={V_TEAL} />
          <p style={{ color: 'var(--sd-colour-text-secondary)', fontSize: 15, fontWeight: 500, margin: 0 }}>Getting things ready…</p>
        </div>
      </div>
    );
  }

  // 1 — Centred classic: white, centred emblem + loader
  return (
    <div className="v-splash" style={{ ...base, background: 'var(--sd-colour-surface-default)', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div className="v-splash-logo"><PLogo size={84} /></div>
      {loaderDark}
    </div>
  );
}

/* ====================================================================
 * iPad mode — the CENTRED-CLASSIC flow scaled for iPad (merged in from the /ipad cut).
 * Reuses the shared data, PLogo, useCreds, ICON2 and tokens above; only the iPad-scaled
 * I* components + the IPadFlow renderer are bespoke. Uses the same v-* interaction classes.
 * ==================================================================== */
const ipadScreen = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)',
  display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--sd-colour-surface-default)',
};

function IField({ label, type = 'text', placeholder, value, onChange, lead, trail, onTrail, invalid, error, dark, onTeal }) {
  // onTeal = solid white field with a white label (sits on the immersive teal); dark = translucent glass.
  const iconStyle = dark ? { filter: 'brightness(0) invert(1)', opacity: 0.8 } : { opacity: 0.5 };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 15, fontWeight: 500, color: dark ? D_SUBTLE : (onTeal ? '#fff' : 'var(--sd-colour-text-secondary)') }}>{label}</span>}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {lead && <img src={ICON2(lead)} alt="" style={{ position: 'absolute', left: 18, width: 22, height: 22, pointerEvents: 'none', ...iconStyle }} />}
        <input
          className={'v-input' + (dark ? ' v-input--dark' : '')} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          style={{
            boxSizing: 'border-box', width: '100%', height: 58, margin: 0,
            padding: `0 ${trail ? 50 : 18}px 0 ${lead ? 50 : 18}px`,
            fontFamily: 'var(--sd-font-family)', fontSize: 17, fontWeight: 500,
            color: dark ? '#fff' : 'var(--sd-colour-text-primary)', background: dark ? D_FILL : 'var(--sd-colour-surface-default)',
            border: invalid ? '1.5px solid var(--sd-colour-border-error)' : `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`,
            borderRadius: 'var(--sd-radius-lg)',
          }}
        />
        {trail && (
          <button type="button" onClick={onTrail} aria-label="Toggle password" style={{ all: 'unset', cursor: 'pointer', position: 'absolute', right: 18, display: 'flex' }}>
            <img src={ICON2(trail)} alt="" style={{ width: 22, height: 22, ...iconStyle }} />
          </button>
        )}
      </span>
      {error && (
        <span style={{ display: 'flex', gap: 7, fontSize: 14, lineHeight: 1.45, color: (dark || onTeal) ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)' }}>
          <img src={ICON2('info-alert')} alt="" style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, ...((dark || onTeal) ? { filter: 'brightness(0) invert(1)' } : {}) }} />{error}
        </span>
      )}
    </label>
  );
}
function IBtn({ children = 'Sign in', disabled, loading, onClick, loadingLabel = 'Signing in…', dark }) {
  const off = disabled || loading;
  const bg = dark ? (disabled && !loading ? 'rgba(255,255,255,0.4)' : '#fff') : (disabled && !loading ? 'var(--sd-colour-action-disabled)' : V_TEAL);
  const fg = dark ? V_TEAL : (disabled && !loading ? 'var(--sd-colour-text-disabled)' : '#fff');
  return (
    <button type="button" className={off ? '' : 'v-btn'} onClick={off ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 58, padding: '0 20px',
      textAlign: 'center', cursor: off ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-lg)',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{loading ? <><Spinner size={20} color={dark ? V_TEAL : '#fff'} />{loadingLabel}</> : children}</button>
  );
}
function ILink({ children, align = 'right', onClick, dark }) {
  return (
    <div style={{ textAlign: align }}>
      <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>{children}</button>
    </div>
  );
}
function ITerms({ dark }) {
  const linkCol = dark ? '#fff' : V_LINK;
  return (
    <p style={{ fontSize: 13, lineHeight: 1.5, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', textAlign: 'center', margin: 0 }}>
      By clicking sign in, you agree to our <span style={{ color: linkCol, fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: linkCol, fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</span>
    </p>
  );
}
function IEduAvatar({ e, size = 50 }) {
  if (!e) return null;
  const initials = (
    <div style={{ width: size, height: size, borderRadius: '50%', background: e.color || 'var(--sd-colour-cyan-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{e.initials || (e.name || '?')[0]}</div>
  );
  return <PhotoImg src={EDU_PHOTO(e)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--sd-colour-grey-200)' }} fallback={initials} />;
}
function IRoomAvatar({ name, size = 50 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 'var(--sd-radius-m)', background: 'var(--sd-colour-cyan-100)', color: 'var(--sd-colour-cyan-700)', fontWeight: 700, fontSize: size * 0.42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{(name || 'R')[0]}</div>
  );
}
function ICheckDisc({ dark }) {
  return (
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: dark ? '#fff' : V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src={ICON2('tick')} alt="" style={{ width: 15, height: 15, filter: dark ? 'none' : 'brightness(0) invert(1)' }} />
    </span>
  );
}
function IEduCard({ initials, color, photo, img, name, login, onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
      <IEduAvatar e={{ initials, color, photo, img }} size={50} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{name}</div>
        {login != null && <div style={{ fontSize: 14, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Signed in {agoLabel(login)}</div>}
      </div>
      <img src={ICON2('chevron-right')} alt="" style={{ width: 20, height: 20, opacity: dark ? 0.85 : 0.4, flexShrink: 0, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />
    </button>
  );
}
/* iPad search field + sort chips (filter/sort the educator grid) */
function ISearch({ value, onChange, placeholder = 'Search educators', dark }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      <span style={{ position: 'absolute', left: 18, display: 'flex', color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', opacity: dark ? 0.9 : 0.55, pointerEvents: 'none' }}><SearchIcon /></span>
      <input className={'v-input' + (dark ? ' v-input--dark' : '')} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
        boxSizing: 'border-box', width: '100%', height: 54, margin: 0, padding: '0 18px 0 48px',
        fontFamily: 'var(--sd-font-family)', fontSize: 16, fontWeight: 500,
        color: dark ? '#fff' : 'var(--sd-colour-text-primary)', background: dark ? D_FILL : 'var(--sd-colour-surface-default)',
        border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`, borderRadius: 'var(--sd-radius-lg)',
      }} />
    </div>
  );
}
function ISortPills({ value, onChange, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Sort</span>
      {[['recent', 'Recent'], ['name', 'Name']].map(([k, l]) => {
        const sel = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '7px 16px', borderRadius: 999,
            border: `1px solid ${sel ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)')}`,
            background: sel ? (dark ? '#fff' : 'var(--sd-colour-cyan-50)') : 'transparent',
            color: sel ? V_TEAL : (dark ? '#fff' : 'var(--sd-colour-text-secondary)'),
          }}>{l}</button>
        );
      })}
    </div>
  );
}
/* iPad "Add educator profile" — clean clickable card, no lead icon, "Sign in" link (matches phone). */
function IAddCard({ onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '22px 24px' }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>Add educator profile</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>Sign in</span>
    </button>
  );
}
function IRoomCard({ name, ratio, attention, disabled, note, selected, onClick, dark }) {
  const amber = 'var(--sd-colour-orange-500)';
  const txt = dark ? '#fff' : 'var(--sd-colour-text-primary)';
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  if (disabled) {
    return (
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', background: dark ? 'rgba(255,255,255,0.04)' : 'var(--sd-colour-grey-100)', border: `1px dashed ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '14px 20px', opacity: 0.75, cursor: 'not-allowed' }}>
        <VRoomThumb name={name} size={56} dim />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: sub }}>{name}</div>
          <div style={{ fontSize: 14, color: sub }}>Ratio {ratio}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: sub, background: dark ? D_FILL : 'var(--sd-colour-grey-200)', borderRadius: 999, padding: '5px 13px', whiteSpace: 'nowrap' }}>{note || 'Unavailable'}</span>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', borderStyle: 'solid', borderTopWidth: selected ? 1.5 : 1, borderRightWidth: selected ? 1.5 : 1, borderBottomWidth: selected ? 1.5 : 1, borderLeftWidth: attention ? 4 : (selected ? 1.5 : 1), borderTopColor: selected ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)'), borderRightColor: selected ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)'), borderBottomColor: selected ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)'), borderLeftColor: attention ? amber : (selected ? (dark ? '#fff' : V_TEAL) : (dark ? D_BORDER : 'var(--sd-colour-grey-400)')), borderRadius: 'var(--sd-radius-lg)', padding: '14px 20px', transition: 'border-color .2s' }}>
      <VRoomThumb name={name} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: txt }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: sub }}>
          <span>Ratio {ratio}</span>
          {attention && <span style={{ color: amber, fontWeight: 700 }}>· Needs attention</span>}
        </div>
      </div>
      {selected ? <ICheckDisc dark={dark} /> : <span style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}`, flexShrink: 0 }} />}
    </button>
  );
}
function ISummaryRow({ avatar, title, sub, action, onAction, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{title}</div>
        <div style={{ fontSize: 14, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{sub}</div>
      </div>
      {action && <button onClick={onAction} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: dark ? '#fff' : V_LINK }}>{action}</button>}
    </div>
  );
}
/* iPad keypad — clean circular keys (parity with the phone redesign), larger touch targets. */
function IKey({ children, onClick, label, dark }) {
  const ks = {
    all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: 84, height: 84, borderRadius: '50%',
    background: dark ? D_FILL : 'var(--sd-colour-grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 600, color: dark ? '#fff' : 'var(--sd-colour-text-primary)', margin: '0 auto',
  };
  return <button className="v-key" onClick={onClick} aria-label={label} style={ks}>{children}</button>;
}
function IKeypad({ onPress, onDelete, dark }) {
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, justifyItems: 'center', width: '100%' }}>
      {VKEYS.map((d) => <IKey key={d} dark={dark} onClick={() => onPress(d)}>{d}</IKey>)}
      <span />
      <IKey dark={dark} onClick={() => onPress('0')}>0</IKey>
      <button onClick={onDelete} aria-label="Delete" className="v-key" style={{ all: 'unset', cursor: 'pointer', width: 84, height: 84, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, margin: '0 auto' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" style={{ opacity: dark ? 0.9 : 0.65 }}>
          <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 9.5 L17 14.5 M17 9.5 L13 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
function IPinDots({ filled, shake, dark }) {
  const onCol = dark ? '#fff' : V_TEAL;
  const offBorder = dark ? 'rgba(255,255,255,0.35)' : 'var(--sd-colour-grey-400)';
  return (
    <div className={shake ? 'v-shake' : ''} style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) => {
        const on = i < filled;
        return <span key={`${i}-${on}`} className={on ? 'v-pop' : ''} style={{ width: 18, height: 18, borderRadius: '50%', boxSizing: 'border-box', background: on ? onCol : 'transparent', border: on ? `2px solid ${onCol}` : `2px solid ${offBorder}`, transition: 'background .15s, border-color .15s' }} />;
      })}
    </div>
  );
}
function IWordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <PLogo size={42} shadow={false} />
      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--sd-colour-text-primary)' }}>Playground</span>
    </div>
  );
}
function IHeading({ title, subtitle, align = 'center', light }) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ textAlign: align, width: '100%' }}>
      {title && <h1 style={{ fontSize: 30, fontWeight: 700, margin: '0 0 8px', color: light ? '#fff' : 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: 17, lineHeight: 1.45, margin: 0, color: light ? 'var(--sd-colour-cyan-100)' : 'var(--sd-colour-text-secondary)' }}>{subtitle}</p>}
    </div>
  );
}
function IBack({ kind, onNav, light }) {
  return (
    <>
      <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 36, left: 40, zIndex: 3, display: 'flex', alignItems: 'center', gap: 3, color: light ? '#fff' : 'var(--sd-colour-text-secondary)', fontSize: 17, fontWeight: 600 }}>
        <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
      </button>
      <div style={{ position: 'absolute', top: 38, left: 0, right: 0, textAlign: 'center', zIndex: 2, fontSize: 17, fontWeight: 700, color: light ? '#fff' : 'var(--sd-colour-text-primary)', pointerEvents: 'none' }}>{SERVICE_NAME}</div>
    </>
  );
}

/* iPad downstream content (educator / addEducator / pin / room / confirm) — shared across directions,
   themed by `dark` (immersive). Returns { title, subtitle, nav, onNav, children, footer }. `land` = landscape. */
function iCfg(step, ctx, dark, land) {
  const {
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin, scenario,
    eduSort, eduQuery, setEduSort, setEduQuery, roomsContinue, samedayContinue, switchEducator,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  } = ctx;
  const gridStyle = { display: 'grid', gridTemplateColumns: land ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 18, maxWidth: land ? 980 : 720, width: '100%', margin: '0 auto' };
  const colStyle = { width: '100%', maxWidth: 460, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 };
  const errCol = dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)';
  const noteCol = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';

  if (step === 'educators') {
    const list = sortedEducators(eduSort, eduQuery);
    return {
      title: `Welcome to ${SERVICE_NAME}`, subtitle: 'Please sign into your Educator Profile', nav: 'logout', onNav: resetFlow,
      children: (
        <div style={{ width: '100%', maxWidth: land ? 980 : 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <ISortPills value={eduSort} onChange={setEduSort} dark={dark} />
            <div style={{ flex: 1, minWidth: 240, maxWidth: 360 }}><ISearch value={eduQuery} onChange={setEduQuery} dark={dark} /></div>
          </div>
          <div className="v-stagger" style={gridStyle}>
            <IAddCard dark={dark} onClick={() => { setAddEmail(''); setAddPin(''); setStep('addEducator'); }} />
            {list.map((e) => <IEduCard key={e.name} {...e} dark={dark} onClick={() => { setEducator(e); setPin(''); setAttempts(0); setStep('pin'); }} />)}
          </div>
          {list.length === 0 && <p style={{ textAlign: 'center', fontSize: 14, color: noteCol, margin: '4px 0' }}>No educators match “{eduQuery}”.</p>}
        </div>
      ),
    };
  }
  if (step === 'addEducator') {
    const ready2 = addEmail && addPin;
    return {
      title: 'Add Educator Profile', subtitle: 'Please sign into your Educator Profile', nav: 'back', onNav: () => setStep('educators'),
      children: (
        <div style={colStyle}>
          <IField label="Educator email or phone" placeholder="Email or phone number" value={addEmail} onChange={setAddEmail} dark={dark} />
          <IField label="Password or access PIN" type={showAddPin ? 'text' : 'password'} placeholder="Password or Pin" value={addPin} onChange={setAddPin} trail={showAddPin ? 'view-hide' : 'view'} onTrail={() => setShowAddPin((s) => !s)} dark={dark} />
          <ITerms dark={dark} />
        </div>
      ),
      footer: <IBtn dark={dark} disabled={!ready2} onClick={() => { setEducator({ initials: 'NE', color: 'var(--sd-colour-cyan-600)', name: 'New educator', role: 'Educator' }); setAddEmail(''); setAddPin(''); setStep('rooms'); }}>Sign in</IBtn>,
    };
  }
  if (step === 'pin') {
    const ed = educator || EDUCATORS[0];
    const first = ed.name.split(' ')[0];
    const MAX = 5;
    if (attempts >= MAX) {
      return {
        title: null, subtitle: null, nav: 'back', onNav: () => { setAttempts(0); setPin(''); setStep(scenario === 'return' ? 'sameday' : 'educators'); }, center: true,
        children: <VStatePanel big dark={dark} tone="error" node={<LockGlyph big />} title="PIN locked" body={`Too many incorrect attempts for ${first}. Try again in 5 minutes, or switch educator.`} secondary="Switch educator" onSecondary={switchEducator} />,
      };
    }
    const left = MAX - attempts;
    return {
      title: `Hi ${first}`, subtitle: 'Enter your PIN to continue', nav: 'back', onNav: () => { setPin(''); setStep(scenario === 'return' ? 'sameday' : 'educators'); }, center: true,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <IPinDots filled={pin.length} shake={shake} dark={dark} />
          {attempts > 0 && <p style={{ fontSize: 14, color: errCol, margin: 0 }}>Incorrect PIN — {left} {left === 1 ? 'try' : 'tries'} left</p>}
          <div style={{ width: '100%', maxWidth: 360 }}>
            <IKeypad dark={dark} onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
          </div>
          <ILink align="center" dark={dark} onClick={() => { setPin(''); setAttempts(0); setAddPin(''); setStep('edupass'); }}>Forgot PIN? Use password</ILink>
        </div>
      ),
    };
  }
  if (step === 'edupass') {
    const ed = educator || EDUCATORS[0];
    return {
      title: 'Enter your password', subtitle: `Signing in as ${ed.name}`, nav: 'back', onNav: () => setStep('pin'), center: true,
      children: (
        <div style={colStyle}>
          <IField label="Password" type={showAddPin ? 'text' : 'password'} placeholder="Your password" value={addPin} onChange={setAddPin} trail={showAddPin ? 'view-hide' : 'view'} onTrail={() => setShowAddPin((s) => !s)} dark={dark} />
        </div>
      ),
      footer: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <IBtn dark={dark} disabled={!addPin} onClick={() => { setAddPin(''); setRoom((rm) => rm || firstRoom(rooms).name); setStep(scenario === 'return' ? 'hub' : 'rooms'); }}>Sign in</IBtn>
          <ILink align="center" dark={dark} onClick={() => setStep('pin')}>Use PIN instead</ILink>
        </div>
      ),
    };
  }
  if (step === 'rooms') return {
    title: 'Select your room', subtitle: 'Where are you working today?', nav: 'back', onNav: () => setStep(scenario === 'return' ? 'sameday' : 'educators'),
    children: <div style={gridStyle}>{(rooms || []).map((r) => <IRoomCard key={r.name} {...r} dark={dark} selected={room === r.name} onClick={() => setRoom(r.name)} />)}</div>,
    footer: <IBtn dark={dark} disabled={!room} onClick={roomsContinue}>{room ? `Continue to ${room}` : 'Select a room'}</IBtn>,
  };
  if (step === 'sameday') {
    const ed = educator || EDUCATORS[0];
    const rn = room || firstRoom(rooms).name;
    const rr = roomByName(rn, rooms);
    const first = ed.name.split(' ')[0];
    return {
      title: <>Welcome Back<br />{ed.name}</>, subtitle: 'Your room for today', nav: 'logout', onNav: resetFlow, center: land,
      children: (
        <div style={colStyle}>
          <IRoomCard name={rn} ratio={rr.ratio} dark={dark} selected onClick={() => {}} />
          <p style={{ fontSize: 13.5, fontWeight: 600, textAlign: 'center', color: dark ? '#fff' : V_LINK, margin: '4px 0 0' }}>Remembered from your last session</p>
          <ILink align="center" dark={dark} onClick={() => setStep('rooms')}>Change room</ILink>
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-200)'}`, textAlign: 'center' }}>
            <span style={{ fontSize: 15, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>Not {first}? </span>
            <button type="button" onClick={switchEducator} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: dark ? '#fff' : V_LINK }}>Switch educator</button>
          </div>
        </div>
      ),
      footer: <IBtn dark={dark} onClick={samedayContinue}>Continue to {rn}</IBtn>,
    };
  }

  // ── error & empty states (scenario 4), iPad scale. Reuses the device-neutral VStatePanel/VAlert. ──
  if (isErrorView(step) && step !== 'gallery') {
    const toGallery = () => setStep('gallery');
    const back = { nav: 'back', onNav: toGallery };
    if (step === 'e-creds') return {
      /* mirrors the real S1 error (v0.6 immersive service screen, no Terms line) */
      title: "Let's sign you in", subtitle: 'Welcome back to your service.', ...back,
      children: (
        <div style={colStyle}>
          <IField label="Service username" value="LittleBugs" onChange={() => {}} lead="user" dark={dark} />
          <IField label="Service password" type="password" value="wrongpass123" onChange={() => {}} invalid error={LOGIN_ERR} dark={dark} />
        </div>
      ),
      footer: <IBtn dark={dark} onClick={toGallery}>Sign in</IBtn>,
    };
    if (step === 'e-offline') return {
      title: 'Sign in to Playground', subtitle: 'Please sign in to your service', ...back,
      children: (
        <div style={colStyle}>
          <VAlert dark={dark} big text="No internet connection." action="Retry" onAction={toGallery} />
          <IField label="Service username" placeholder="Username" value="" onChange={() => {}} lead="user" dark={dark} />
          <IField label="Service password" type="password" placeholder="Password" value="" onChange={() => {}} dark={dark} />
          <ITerms dark={dark} />
        </div>
      ),
      footer: <IBtn dark={dark} disabled>Sign in</IBtn>,
    };
    if (step === 'e-disabled') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} big tone="error" glyph="⊘" title="App disabled" body="This app has been disabled for your service. Please contact your service administrator." />,
      footer: <IBtn dark={dark} onClick={toGallery}>Back to sign in</IBtn>,
    };
    if (step === 'e-noaccess') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} big tone="error" glyph="✕" title="No access" body="Your account doesn't have access to this app. Contact your service administrator to request access." />,
      footer: <IBtn dark={dark} onClick={toGallery}>Back to sign in</IBtn>,
    };
    if (step === 'e-edulist') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} big tone="error" glyph="!" title="Couldn't load educators" body="Something went wrong loading the educator list. Check your connection and try again." />,
      footer: <IBtn dark={dark} onClick={toGallery}>Retry</IBtn>,
    };
    if (step === 'e-locked') {
      /* mirrors the real in-flow lockout (S4 at 5 attempts): first-name copy + Switch educator */
      const first = (educator || EDUCATORS[0]).name.split(' ')[0];
      return {
        ...back, center: true, noBrand: true,
        children: <VStatePanel dark={dark} big tone="error" node={<LockGlyph big />} title="PIN locked" body={`Too many incorrect attempts for ${first}. Try again in 5 minutes, or switch educator.`} secondary="Switch educator" onSecondary={toGallery} />,
      };
    }
    if (step === 'e-norooms') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} big iconName="image" title="No rooms available" body="There are no rooms set up for this service yet. Contact your service administrator." secondary="Refresh" onSecondary={toGallery} />,
    };
    if (step === 'e-password') {
      /* mirrors the real S7 (edupass): one password field, Use PIN instead, Sign in */
      const ed = educator || EDUCATORS[0];
      return {
        title: 'Enter your password', subtitle: `Signing in as ${ed.name}`, ...back, center: true,
        children: (
          <div style={colStyle}>
            <IField label="Password" type="password" placeholder="Your password" value="" onChange={() => {}} dark={dark} />
          </div>
        ),
        footer: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <IBtn dark={dark} disabled>Sign in</IBtn>
            <ILink align="center" dark={dark} onClick={toGallery}>Use PIN instead</ILink>
          </div>
        ),
      };
    }
    if (step === 'e-bootstrap') return {
      ...back, center: true, noBrand: true,
      children: <VStatePanel dark={dark} big tone="error" glyph="!" title="Couldn't start the app" body="Something went wrong while loading. Please try again." />,
      footer: <IBtn dark={dark} onClick={toGallery}>Retry</IBtn>,
    };
  }
  return {};
}

/* iPad downstream chrome — themed per direction (mirrors the phone shells at iPad scale).
   `center` (same-day) vertically centres the header+content group above the footer. */
function IShell({ variant, step, educator, title, subtitle, nav, onNav, children, footer, land, center: centerY, noBrand }) {
  const meta = VARIANT_META[variant];
  const dark = !!meta.dark;
  const stack = (extra, grow = true) => (
    <div style={{ ...(grow ? { flex: 1, minHeight: 0 } : {}), display: 'flex', flexDirection: 'column', ...extra }}>{children}</div>
  );

  // immersive (6) — full teal, dark content, left heading
  if (meta.kind === 'immersive') {
    const head = <IHeading title={title} subtitle={subtitle} align="left" light />;
    return (
      <div style={{ ...ipadScreen, background: V_IMMERSIVE, padding: '76px 64px 56px', position: 'relative' }}>
        <VScene h={320} />
        {nav && <IBack kind={nav} onNav={onNav} light />}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 26, flex: 1, minHeight: 0 }}>
          {centerY
            ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>{head}{stack({}, false)}</div>
            : <>{head}{stack()}</>}
          {footer && <div style={{ width: '100%', maxWidth: 460, margin: '0 auto' }}>{footer}</div>}
        </div>
      </div>
    );
  }
  // hero (3, 4) — ONE immersive teal canvas (same as the service screen) with the hero content
  // up top and a rounded-top white card laid over the lower portion (matches the phone sheet), so
  // the service→educator reveal reads as one canvas with the card sliding up over it.
  if (meta.kind === 'hero') {
    const bandH = land ? 276 : 300;
    return (
      <div style={{ ...ipadScreen, background: V_IMMERSIVE }}>
        <VScene h={land ? 620 : 900} />
        {nav && <IBack kind={nav} onNav={onNav} light />}
        <div style={{ position: 'relative', zIndex: 1, height: bandH, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', paddingTop: 64, boxSizing: 'border-box' }}>
          {!noBrand && <HeroBrand step={step} educator={educator} size={56} />}
          <IHeading title={title} subtitle={subtitle} align="center" light />
        </div>
        <div style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0, marginTop: -24, display: 'flex', flexDirection: 'column', background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, boxShadow: '0 -12px 40px rgba(0,40,34,0.26)', padding: '40px 64px 48px' }}>
          {stack(centerY ? { justifyContent: 'center' } : {})}
          {footer && <div style={{ maxWidth: 460, width: '100%', margin: '28px auto 0' }}>{footer}</div>}
        </div>
      </div>
    );
  }
  // floating card (5) — mint bg + centred white card
  if (meta.card) {
    return (
      <div style={{ ...ipadScreen, background: meta.bg, alignItems: 'center', justifyContent: 'center', padding: '48px', position: 'relative' }}>
        {nav && <IBack kind={nav} onNav={onNav} />}
        <div style={{ width: '100%', maxWidth: 660, maxHeight: '88%', background: 'var(--sd-colour-surface-default)', borderRadius: 28, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
          <IHeading title={title} subtitle={subtitle} align="center" />
          {stack(centerY ? { justifyContent: 'center' } : {})}
          {footer && <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>{footer}</div>}
        </div>
      </div>
    );
  }
  // panel (1 centred, 2 editorial)
  const center = meta.align !== 'left';
  const head = (<>{!noBrand && (meta.brand === 'wordmark' ? <IWordmark /> : <PLogo size={56} />)}<IHeading title={title} subtitle={subtitle} align={center ? 'center' : 'left'} /></>);
  return (
    <div style={{ ...ipadScreen, background: meta.bg, padding: '76px 64px 56px', position: 'relative' }}>
      {nav && <IBack kind={nav} onNav={onNav} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start', gap: 24, flex: 1, minHeight: 0 }}>
        {centerY
          ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start', justifyContent: 'center', gap: 24, width: '100%' }}>{head}{stack({ width: '100%' }, false)}</div>
          : <>{head}{stack({ width: '100%' })}</>}
        {footer && <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── iPad SERVICE (login) screens — one bespoke composition per direction ── */
function IService3({ onSignIn, land }) { // Playful tall-scene — full-bleed immersive teal, centred (matches phone)
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...ipadScreen, background: V_IMMERSIVE }}>
      <VScene h={land ? 640 : 940} />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <PLogo size={72} float />
          <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15, margin: '20px 0 6px', color: '#fff', textAlign: 'center', letterSpacing: '-0.01em' }}>Sign in to Playground</h1>
          <p style={{ fontSize: 17, lineHeight: 1.4, margin: 0, color: 'var(--sd-colour-cyan-100)', textAlign: 'center' }}>Please sign into your service</p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 30 }}>
            <IField label="Service username" {...userProps} invalid={err} onTeal />
            <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} onTeal />
            <ITerms dark />
            <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} dark />
          </div>
          <div style={{ marginTop: 18 }}><ILink align="center" dark>Forgot Password</ILink></div>
        </div>
      </div>
    </div>
  );
}
const ISERVICE = { 3: IService3 }; // v0.1 — only the Playful tall-scene iPad login

/* iPad room hub — shared neutral app shell (post-login destination), same for every direction. */
function IHub({ ctx, land }) {
  const ed = ctx.educator || EDUCATORS[0];
  const rn = ctx.room || ROOM_POOL[0].name;
  return (
    <div style={{ ...ipadScreen, background: 'var(--sd-colour-grey-100)' }}>
      <div style={{ background: 'var(--sd-colour-surface-default)', padding: '40px 48px 28px', borderBottom: '1px solid var(--sd-colour-grey-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--sd-colour-text-secondary)' }}>Room hub</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>{rn}</div>
        </div>
        <IEduAvatar e={ed} size={48} />
      </div>
      <div style={{ padding: '28px 48px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--sd-colour-text-secondary)', marginBottom: 18 }}>Roster · loading…</div>
        <div style={{ display: 'grid', gridTemplateColumns: land ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--sd-colour-surface-default)', borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
              <div className="v-skeleton" style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div className="v-skeleton" style={{ height: 13, width: `${66 - i * 5}%`, borderRadius: 7 }} />
                <div className="v-skeleton" style={{ height: 11, width: `${44 - i * 3}%`, borderRadius: 7 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 48px 40px', background: 'var(--sd-colour-surface-default)', borderTop: '1px solid var(--sd-colour-grey-300)', display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
        <button onClick={() => ctx.setStep('rooms')} className="v-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 28px', borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${V_TEAL}`, color: V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>Change room</button>
        <button onClick={ctx.switchEducator} className="v-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 28px', borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${V_TEAL}`, color: V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>Switch educator</button>
        <button onClick={ctx.resetFlow} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>Log out</button>
      </div>
    </div>
  );
}

/* iPad renderer — dispatches by direction: bespoke login (ISERVICE) → themed IShell + iCfg → shared hub. */
function IPadFlow({ variant, step, ctx, land, onSignIn }) {
  if (step === 'service') { const S = ISERVICE[variant] || IService3; return <S onSignIn={onSignIn} land={land} />; }
  if (step === 'hub') return <IHub ctx={ctx} land={land} />;
  if (step === 'e-lock') return <LockOverlay educator={ctx.educator} onUnlock={() => ctx.setStep('gallery')} onSwitch={ctx.switchEducator} onLogout={ctx.resetFlow} />;
  if (step === 'gallery') return <ErrorGallery onPick={ctx.setStep} big />;
  const cfg = iCfg(step, ctx, !!VARIANT_META[variant].dark, land);
  return <IShell variant={variant} step={step} educator={ctx.educator} land={land} {...cfg} />;
}

/* iPad transition wrapper — layers the outgoing + incoming step ONLY for the service→educator
   reveal (bottom-sheet slide-up + form-out, matching Sam's Figma motion + the phone Flow3Stack).
   Every other step change swaps instantly, matching the pre-transition iPad behaviour. */
function IPadStack(props) {
  const { step } = props;
  const [cur, setCur] = useState(step);
  const [out, setOut] = useState(null);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  useLayoutEffect(() => {
    if (step === cur) return;
    clear();
    if (cur === 'service' && step === 'educators') {
      setOut(cur); setCur(step);                                   // run the reveal
      timers.current.push(setTimeout(() => setOut(null), 720));    // clear the outgoing form once it lands
    } else {
      setOut(null); setCur(step);                                  // any other change → instant swap
    }
  }, [step, cur]);
  const sheet = out === 'service' && cur === 'educators';
  return (
    <div className="ipad-stack">
      {out && <div className={'ipad-layer is-out' + (sheet ? ' ipad-formout' : '')}><IPadFlow {...props} step={out} /></div>}
      <div className={'ipad-layer is-in' + (sheet ? ' ipad-sheetup' : '')}><IPadFlow {...props} step={cur} /></div>
    </div>
  );
}

/* ====================================================================
 * HARNESS — v0.1 is locked to the Playful tall-scene direction. The left rail
 * no longer switches direction (just Device / Layout); scenario launchers +
 * demo creds are unchanged. All flow state lives here.
 * ==================================================================== */
const DIRECTION_NAME = 'Playful tall-scene';
function CredRow({ label, value }) {
  return (
    <div className="cred-row">
      <span className="cred-label">{label}</span>
      <span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{value}</span>
    </div>
  );
}

/* segmented tab-toggle (Stardust component) — replaces the old selection-pills for Device/Layout.
   opts = [[key, label, iconNode?], …]. */
const ICON_PHONE = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3" /><line x1="10.5" y1="18.5" x2="13.5" y2="18.5" /></svg>;
const ICON_TABLET = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5" /><line x1="10.5" y1="17.5" x2="13.5" y2="17.5" /></svg>;
function TabToggle({ opts, current, onChange }) {
  const n = opts.length;
  const idx = Math.max(0, opts.findIndex(([k]) => k === current));
  return (
    <div className="tab-toggle" role="tablist" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      {/* the selected pill — one indicator that slides between options */}
      <span className="tab-toggle__ind" aria-hidden="true" style={{ width: `calc((100% - 10px) / ${n})`, transform: `translateX(${idx * 100}%)` }} />
      {opts.map(([k, label, icon]) => (
        <button key={k} type="button" role="tab" aria-selected={current === k} className={'tab-seg' + (current === k ? ' tab-seg--selected' : '')} onClick={() => onChange(k)}>
          {icon || null}{label}
        </button>
      ))}
    </div>
  );
}

/* collapsible reference card (right rail) — same surface as Demo details. */
function Collapsible({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="creds">
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span className="creds-title" style={{ marginBottom: 0 }}>{title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sd-colour-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}

/* prototype changelog (shown in the right rail) — brief, two versions. Update as the proto evolves. */
const CHANGELOG = [
  { v: '0.4', date: 'Today', items: ['Immersive teal service login; educator list arrives on a white sheet sliding up (Service-to-Educator reveal)', 'Travelling brand mark — one shared element glides between screens, crossfading P → crest → educator photo (motion lab Direction D)', 'Steps fade-through as self-contained layers; reduced motion falls back to a crossfade in place'] },
  { v: '0.3', date: 'Jul 4', items: ['“Anatomy” inspector — hover the phone for box-model + Stardust token mapping', 'Flags off-token values (no --sd-* match) to support component alignment'] },
  { v: '0.2', date: 'Jun 23', items: ['Switch educator + idle auto-lock (shared-device safety)', 'PIN: “tries left”, lockout after 5, password fallback', 'iPad parity: photos, room thumbnails, circular keypad', 'Image fallbacks, keyboard focus rings, sliding tab-toggle'] },
  { v: '0.1', date: 'Jun 22', items: ['Isolated the Playful tall-scene as v0.1', 'Placeholder images + logo swap (school → educator)', 'Redesigned PIN screen; non-sticky hero scroll', 'Removed confetti celebration'] },
];
function Changelog() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {CHANGELOG.map((rel) => (
        <div key={rel.v}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sd-colour-action-primary)' }}>v{rel.v}</span>
            <span style={{ fontSize: 11.5, color: 'var(--sd-colour-text-secondary)' }}>· {rel.date}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rel.items.map((it, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.45, color: 'var(--sd-colour-text-secondary)' }}>{it}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function VariantsApp() {
  // URL-addressable state for screenshot capture: ?v=1-5&step=service|educators|pin|rooms|confirm|hub
  const _p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const _v0 = 3; // v0.1 — locked to the single chosen direction (Playful tall-scene); ?v is ignored
  const _s0 = _p.get('step') || 'service';
  const _needEdu = ['pin', 'rooms', 'sameday', 'hub'].includes(_s0);
  const _needRoom = ['sameday', 'hub'].includes(_s0);
  const _bare = !!_p.get('bare'); // capture mode — skip the launch splash so screens grab cleanly
  const _dev0 = _p.get('device') === 'ipad' ? 'ipad' : 'phone';
  const _o0 = _p.get('orient') === 'landscape' ? 'landscape' : 'portrait';
  // "Backup web build" responsive mode — standalone.html sets window.__SD_FIT_VIEWPORT__ (or ?fit=viewport).
  // When on, the live viewport drives the device so the un-framed page reflows; manual rail toggles are ignored.
  const _fitViewport = (typeof window !== 'undefined') && (window.__SD_FIT_VIEWPORT__ || _p.get('fit') === 'viewport');

  const _sc0 = _s0 === 'sameday' ? 'return' : 'service';
  const [device, setDevice] = useState(_dev0);        // 'phone' | 'ipad' (= Tablet)
  const [orientation, setOrientation] = useState(_o0); // tablet only: 'portrait' | 'landscape'
  const _rooms0 = pickRooms(); // a random 5–10 room set for this prototype (re-rolled on each scenario launch)
  const [variant] = useState(_v0); // fixed at 3 — no direction switching in v0.1
  const [scenario, setScenario] = useState(_sc0); // 'service' (cold start) | 'educator' (service signed in) | 'return' (same-day)
  const [step, setStep] = useState(_s0);
  const [educator, setEducator] = useState(_needEdu ? EDUCATORS[0] : null);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [rooms, setRooms] = useState(_rooms0);
  const [room, setRoom] = useState(_needRoom ? firstRoom(_rooms0).name : null);
  const [eduSort, setEduSort] = useState('recent'); // 'recent' (most recent login) | 'name'
  const [eduQuery, setEduQuery] = useState('');      // educator search filter
  const [addEmail, setAddEmail] = useState('');
  const [addPin, setAddPin] = useState('');
  const [showAddPin, setShowAddPin] = useState(false);
  const [nonce, setNonce] = useState(0); // remounts the screen on scenario launch / variant switch
  // launch splash — plays on first load and on every scenario launch / direction switch.
  const [splash, setSplash] = useState(!_bare && _s0 === 'service');
  const [splashId, setSplashId] = useState(0); // bumped on each launch so the splash always replays
  const [locked, setLocked] = useState(false); // idle auto-lock (shared-device safeguard)

  const meta = VARIANT_META[variant];
  const Service = SERVICE[variant];

  // replay the launch splash (skipped in bare capture mode)
  const launch = () => { if (_bare) return; setSplashId((n) => n + 1); setSplash(true); };

  // launch a scenario from its starting screen:
  //   service  → service login → educator → PIN → room select → hub  (cold start)
  //   educator → educator → PIN → room select → hub                  (service already signed in)
  //   return   → welcome-back → PIN → hub                            (same-day return; room remembered)
  const goScenario = (sc) => {
    const r = pickRooms();
    setScenario(sc); setRooms(r);
    setPin(''); setAttempts(0); setEduSort('recent'); setEduQuery(''); setAddEmail(''); setAddPin('');
    if (sc === 'return') { setEducator(EDUCATORS[0]); setRoom(firstRoom(r).name); setStep('sameday'); }
    else if (sc === 'educator') { setEducator(null); setRoom(null); setStep('educators'); }
    else if (sc === 'errors') { setEducator(null); setRoom(null); setStep('gallery'); }
    else { setEducator(null); setRoom(null); setStep('service'); }
    setNonce((n) => n + 1); if (sc !== 'errors') launch(); // the error gallery isn't a sign-in flow → no splash
  };
  const resetFlow = () => goScenario('service');                 // log-out / exit → back to cold-start service login

  // scenario-aware transitions used by the room-select + same-day screens
  const roomsContinue = () => setStep(scenario === 'return' ? 'sameday' : 'hub');
  const samedayContinue = () => { setPin(''); setAttempts(0); setStep('pin'); }; // return flow: confirm room → re-auth PIN
  // "this isn't me" on a shared device → drop the remembered educator and pick a different one
  // (switches the return flow into the educator sign-in flow). The service stays signed in.
  const switchEducator = () => { setScenario('educator'); setEducator(null); setRoom(null); setPin(''); setAttempts(0); setStep('educators'); setNonce((n) => n + 1); };

  // Trailing glyphs for the scenario cards: chevron = "opens a flow"; list/lock = utilities.
  const CHEVRON = (
    <span className="ds-card__chevron"><svg viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M6.18365 12C6.00936 12 5.94813 11.8716 6.04791 11.7155L8.22103 8.28559C8.32083 8.11095 8.32083 7.88904 8.22103 7.71441L6.04791 4.28452C5.94813 4.12732 6.00936 4 6.18365 4L7.25272 4C7.44826 4.01174 7.62971 4.11542 7.75064 4.28452L9.92539 7.71334C10.0249 7.88807 10.0249 8.10979 9.92539 8.28452L7.75194 11.7144C7.631 11.8835 7.44956 11.9872 7.25401 11.9989L6.18365 12Z" fill="currentColor" /></svg></span>
  );
  const LIST_GLYPH = (
    <span className="scenario-card__glyph"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
  );
  const LOCK_GLYPH = (
    <span className="scenario-card__glyph"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3.25" y="7" width="9.5" height="6.25" rx="1.4" stroke="currentColor" strokeWidth="1.4" /><path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
  );
  const SCENARIO_CARDS = [
    { k: 'service', label: 'Service Sign In', glyph: CHEVRON, onClick: () => goScenario('service') },
    { k: 'educator', label: 'Educator Sign In', glyph: CHEVRON, onClick: () => goScenario('educator') },
    { k: 'return', label: 'Educator Return', glyph: CHEVRON, onClick: () => goScenario('return') },
    { k: 'errors', label: 'Error States', glyph: LIST_GLYPH, onClick: () => goScenario('errors') },
    // demo trigger for the idle screen-lock (normally fires after ~30s on the hub)
    { k: 'lock', label: 'Screen Lock', glyph: LOCK_GLYPH, onClick: () => setLocked(true) },
  ];

  // PIN validation — 4 digits; correct → next screen (return → hub, else → room select), wrong → shake + retry
  useEffect(() => {
    if (pin.length < 4) return;
    const ok = pin === DEMO_PIN;
    const t = setTimeout(() => {
      if (ok) { setRoom((rm) => rm || firstRoom(rooms).name); setStep(scenario === 'return' ? 'hub' : 'rooms'); setPin(''); setAttempts(0); }
      else { setAttempts((a) => a + 1); setShake(true); setTimeout(() => setShake(false), 450); setPin(''); }
    }, 220);
    return () => clearTimeout(t);
  }, [pin]);

  // idle auto-lock — only on the hub (the signed-in "working" screen a tablet is left on). After
  // ~30s of no interaction it locks; any activity resets the timer. Skipped in capture mode.
  const IDLE_MS = 30000;
  useEffect(() => {
    if (_bare || step !== 'hub') return;
    let timer;
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => setLocked(true), IDLE_MS); };
    const evts = ['pointerdown', 'pointermove', 'keydown'];
    evts.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(timer); evts.forEach((e) => window.removeEventListener(e, reset)); };
  }, [step, _bare]);

  // responsive backup-build mode — map the live viewport to a device/orientation so the un-framed
  // standalone reflows: ≥1100px → tablet landscape · 700–1099px → tablet portrait · <700px → phone.
  useEffect(() => {
    if (!_fitViewport) return;
    const apply = () => {
      const w = window.innerWidth;
      if (w >= 1100) { setDevice('ipad'); setOrientation('landscape'); }
      else if (w >= 700) { setDevice('ipad'); setOrientation('portrait'); }
      else { setDevice('phone'); }
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [_fitViewport]);

  // shared context for buildStepCfg / Flow3 / iCfg. `dark` = immersive (variant 6) treatment.
  const ctx = {
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin, dark: variant === 6, scenario,
    eduSort, eduQuery, setEduSort, setEduQuery, roomsContinue, samedayContinue, switchEducator,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  };

  // build the current screen. iPad mode renders the SAME direction at iPad scale (bespoke per
  // direction); on phone, variant 3 (Playful tall-scene) runs through Flow3Stack (fade-through
  // layers + travelling mark), and the others remount per step.
  const isIpad = device === 'ipad';
  const land = orientation === 'landscape';
  const animated = !isIpad && variant === 3 && step !== 'hub' && !isErrorView(step); // error views are static (no Flow3)
  let screen;
  if (isIpad) {
    screen = <IPadStack variant={variant} step={step} ctx={ctx} land={land} onSignIn={() => setStep('educators')} />;
  } else if (animated) {
    screen = <Flow3Stack step={step} ctx={ctx} onSignIn={() => setStep('educators')} />;
  } else if (step === 'gallery') {
    screen = <ErrorGallery onPick={setStep} />;
  } else if (step === 'service') {
    screen = <Service onSignIn={() => setStep('educators')} />;
  } else if (step === 'hub') {
    screen = <VHub room={room} educator={educator} onChangeRoom={() => setStep('rooms')} onSwitch={switchEducator} onLogout={resetFlow} />;
  } else if (step === 'e-lock') {
    // browsable demo of the idle screen-lock (also fires automatically after 30s on the hub)
    screen = <LockOverlay educator={educator} onUnlock={() => setStep('gallery')} onSwitch={switchEducator} onLogout={resetFlow} />;
  } else {
    screen = <Shell meta={meta} {...buildStepCfg(step, ctx)} />;
  }

  // left-rail options depend on device: phone → the 5 directions; iPad → orientation (Vertical/Horizontal)
  // a Stardust selectable card (used by both the direction list and the orientation toggle)
  const railCard = (key, label, sel, on) => (
    <div key={key} className="ds-card ds-card--selectable ds-card--compact" role="radio" aria-checked={sel} tabIndex={sel ? 0 : -1} onClick={on}>
      <div className="ds-title-block"><div className="ds-title-block__content"><p className="ds-title-block__title ds-title-block__title--medium">{label}</p></div></div>
      <span className="ds-card__trailing">
        <span className={'ds-radio ' + (sel ? 'ds-radio--selected' : 'ds-radio--unchecked')} aria-hidden="true">
          <svg className="ds-radio__svg" viewBox="0 0 20 20" fill="none"><circle className="ds-radio__ring" cx="10" cy="10" r="8" strokeWidth="2" /><circle className="ds-radio__dot" cx="10" cy="10" r="4.5" /></svg>
        </span>
      </span>
    </div>
  );

  const deviceKey = isIpad ? `ipad-${orientation}-${step}-${nonce}` : (animated ? `v3-${nonce}` : `${variant}-${step}-${nonce}`);
  const noRise = animated; // animated Flow3 self-animates; everything else gets the rise-in

  return (
    <div className="harness">
      <div className="stage-row">
        <aside className="rail rail-left">
          {/* Direction is locked in (Playful tall-scene) — the switcher/label is gone. Left rail
              now only carries the Device (Phone / Tablet) + Layout (iPad) tab-toggles. */}
          <div className="rail-title">Device</div>
          <TabToggle opts={[['phone', 'Phone', ICON_PHONE], ['ipad', 'Tablet', ICON_TABLET]]} current={device} onChange={setDevice} />
          {isIpad && (
            <>
              <div className="rail-title" style={{ marginTop: 16 }}>Layout</div>
              <TabToggle opts={[['portrait', 'Vertical'], ['landscape', 'Horizontal']]} current={orientation} onChange={setOrientation} />
            </>
          )}
          <div style={{ marginTop: 18 }}><Collapsible title="Changelog"><Changelog /></Collapsible></div>
        </aside>

        <div className={'device' + (isIpad ? ' is-ipad' : '') + (isIpad && land ? ' is-landscape' : '')}>
          <div className="device-screen">
            {/* animated variant 3 keeps a stable key across steps so its hero+sheet persist & animate;
                everything else remounts per step with the rise-in entrance. */}
            <div key={deviceKey} className={(noRise ? '' : 'v-rise ') + 'screen-fill'}>{screen}</div>
            {locked && <LockOverlay educator={educator} onUnlock={() => setLocked(false)} onSwitch={() => { setLocked(false); switchEducator(); }} onLogout={() => { setLocked(false); resetFlow(); }} />}
            {splash && <VSplash key={`splash-${splashId}`} variant={variant} onDone={() => setSplash(false)} />}
          </div>
        </div>

        <aside className="rail rail-right">
          <div className="rail-title">Reference</div>
          <div className="creds">
            <div className="creds-title">Demo details</div>
            <CredRow label="Service username" value={DEMO_USER} />
            <CredRow label="Service password" value={DEMO_PASS} />
            <CredRow label="Educator PIN" value={DEMO_PIN} />
            <p className="creds-note">Username &amp; password are<br />pre-filled, just tap <b>Sign in</b>.</p>
          </div>
        </aside>
      </div>

      {/* scenario launchers — Stardust clickable cards. The three flows carry a chevron
          affordance (they open a journey); the two utilities carry a distinguishing glyph. */}
      <div className="controls">
        <div className="rail-title controls-title">Scenarios</div>
        <div className="scenario-cards">
          {SCENARIO_CARDS.map(({ k, label, glyph, onClick }) => (
            <button key={k} type="button" className="ds-card ds-card--clickable scenario-card" onClick={onClick}>
              <span className="ds-title-block">
                <span className="ds-title-block__content">
                  <span className="ds-title-block__title ds-title-block__title--medium">{label}</span>
                </span>
              </span>
              <span className="ds-card__trailing">{glyph}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.VariantsApp = VariantsApp;
