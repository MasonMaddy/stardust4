/*
 * Playground service sign-in — 5 visual-direction VARIANTS, each a FULL working flow.
 *
 * Single-phone harness (VariantsApp): one direction at a time, with a variant switcher +
 * Restart along the bottom, flow-step navigation on the left, and a demo-credentials reference
 * card on the right. Each variant runs the whole flow in its own visual language
 * (per variants-brief.md), reusing the prototype's flow logic & component patterns:
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

const { useState, useEffect } = React;

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
const LOGIN_ERR = "We couldn't sign in to that service, please try again. For password reset please contact the service administrator.";

/* educator roster — `login` = minutes since last sign-in (drives the "Most recent" sort + the row time). */
const C = ['var(--sd-colour-cyan-600)', 'var(--sd-colour-orange-500)', 'var(--sd-colour-purple-500)', 'var(--sd-colour-green-500)', 'var(--sd-colour-cyan-700)'];
const EDUCATORS = [
  { initials: 'WW', color: C[0], name: 'William Walker', role: 'Responsible Educator', login: 3 },
  { initials: 'MJ', color: C[1], name: 'Maya Johnson', role: 'Lead Curriculum Designer', login: 18 },
  { photo: true, name: 'Alex Smith', role: 'Science Coordinator', login: 240 },
  { initials: 'RL', color: C[2], name: 'Rina Lee', role: 'Mathematics Facilitator', login: 52 },
  { initials: 'TN', color: C[3], name: 'Thomas Nguyen', role: 'Room Leader', login: 1 },
  { initials: 'PS', color: C[4], name: 'Priya Sharma', role: 'Early Years Educator', login: 9 },
  { initials: 'DO', color: C[1], name: "Daniel O'Brien", role: 'Outdoor Play Lead', login: 75 },
  { initials: 'GC', color: C[2], name: 'Grace Chen', role: 'Literacy Specialist', login: 6 },
  { initials: 'HM', color: C[0], name: 'Hannah Murphy', role: 'Assistant Educator', login: 130 },
  { photo: true, name: 'Omar Haddad', role: 'Inclusion Support', login: 410 },
  { initials: 'SK', color: C[3], name: 'Sofia Kovač', role: 'Centre Director', login: 28 },
  { initials: 'LB', color: C[4], name: 'Liam Brown', role: 'Early Years Educator', login: 95 },
  { initials: 'AO', color: C[1], name: 'Amara Okafor', role: 'Creative Arts Lead', login: 14 },
  { initials: 'JT', color: C[2], name: 'Jack Taylor', role: 'Assistant Educator', login: 320 },
  { initials: 'MR', color: C[0], name: 'Mia Rossi', role: 'Wellbeing Coordinator', login: 47 },
  { photo: true, name: 'Noah Wilson', role: 'Room Leader', login: 700 },
  { initials: 'IS', color: C[3], name: 'Isla Stewart', role: 'Early Years Educator', login: 12 },
  { initials: 'KP', color: C[4], name: 'Kai Patel', role: 'STEM Facilitator', login: 1500 },
  { initials: 'EF', color: C[1], name: 'Ella Fischer', role: 'Assistant Educator', login: 185 },
  { initials: 'YT', color: C[2], name: 'Yuki Tanaka', role: 'Music & Movement', login: 2700 },
];
function agoLabel(m) {
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
}
function sortedEducators(sort, query) {
  const list = EDUCATORS.slice().sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.login - b.login);
  const q = (query || '').trim().toLowerCase();
  return q ? list.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) : list;
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

/* ====================================================================
 * SHARED CONTROLS
 * ==================================================================== */

/* Field — prototype spec: 52px tall, radius-lg, 1px grey-500, optional lead/trail icons.
   `invalid` paints the error border; `error` (string) renders an error message below. */
function VField({ label, type = 'text', placeholder, value, onChange, lead, trail, onTrail, invalid, error, dark }) {
  const iconStyle = dark ? { filter: 'brightness(0) invert(1)', opacity: 0.8 } : { opacity: 0.5 };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 13.5, fontWeight: 500, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{label}</span>}
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
        <span style={{ display: 'flex', gap: 6, fontSize: 13, lineHeight: 1.45, color: dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)' }}>
          <img src={ICON2('info-alert')} alt="" style={{ width: 15, height: 15, marginTop: 2, flexShrink: 0, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />{error}
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
      By signing in you agree to our <span style={{ color: linkCol, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: linkCol, fontWeight: 600 }}>Privacy Policy</span>
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
  { t: 'cloud',   top: 0.12, left: 0.06, w: 50, h: 30, o: 0.30, drift: 'vf-b',     dur: 14, tw: 0,   delay: 0.2 },
  { t: 'cloud',   top: 0.50, left: 0.72, w: 40, h: 24, o: 0.24, drift: 'vf-c',     dur: 16, tw: 0,   delay: 1.0 },
  { t: 'sparkle', top: 0.10, left: 0.84, w: 18, h: 18, o: 0.55, drift: 'vf-a',     dur: 8,  tw: 4.5, delay: 0.4 },
  { t: 'sparkle', top: 0.60, left: 0.16, w: 15, h: 15, o: 0.50, drift: 'vf-c',     dur: 9,  tw: 3.8, delay: 0.7 },
  { t: 'sparkle', top: 0.30, left: 0.48, w: 12, h: 12, o: 0.50, drift: 'vf-a',     dur: 8,  tw: 3.6, delay: 1.2 },
  { t: 'dot',     top: 0.42, left: 0.32, w: 8,  h: 8,  o: 0.50, drift: 'vf-b',     dur: 7,  tw: 2.8, delay: 0.3 },
  { t: 'dot',     top: 0.22, left: 0.40, w: 6,  h: 6,  o: 0.50, drift: 'vf-c',     dur: 8,  tw: 3.1, delay: 0.9 },
  { t: 'balloon', top: 0.24, left: 0.80, w: 20, h: 29, o: 0.36, drift: 'vf-glide', dur: 16, tw: 0,   delay: 0.2 },
  { t: 'plane',   top: 0.55, left: 0.10, w: 24, h: 20, o: 0.30, drift: 'vf-glide', dur: 18, tw: 0,   delay: 1.1 },
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

/* educator avatar — initials on a coloured disc, or a photo placeholder */
function VEduAvatar({ e, size = 42 }) {
  if (!e) return null;
  if (e.photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--sd-colour-grey-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={ICON2('person')} alt="" style={{ width: size * 0.55, height: size * 0.55, opacity: 0.5 }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>{e.initials}</div>
  );
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
function VEduRow({ initials, color, photo, name, role, login, onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '10px 15px' }}>
      <VEduAvatar e={{ initials, color, photo }} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{name}</div>
        <div style={{ fontSize: 13, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{role}</div>
      </div>
      {login != null && <span style={{ fontSize: 12, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{agoLabel(login)}</span>}
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
function VRoomRow({ name, ratio, attention, disabled, note, selected, onClick, dark }) {
  const amber = 'var(--sd-colour-orange-500)';
  const txt = dark ? '#fff' : 'var(--sd-colour-text-primary)';
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  if (disabled) {
    return (
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? 'rgba(255,255,255,0.04)' : 'var(--sd-colour-grey-100)', border: `1px dashed ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '14px 18px', opacity: 0.75, cursor: 'not-allowed' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: sub }}>{name}</div>
          <div style={{ fontSize: 12, color: sub }}>Ratio {ratio}</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: sub, background: dark ? D_FILL : 'var(--sd-colour-grey-200)', borderRadius: 999, padding: '4px 11px', whiteSpace: 'nowrap' }}>{note || 'Unavailable'}</span>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', border: selected ? `1.5px solid ${dark ? '#fff' : V_TEAL}` : `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderLeft: attention ? `4px solid ${amber}` : undefined, borderRadius: 'var(--sd-radius-lg)', padding: '14px 18px', transition: 'border-color .2s' }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: txt }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: sub }}>
          <span>Ratio {ratio}</span>
          {attention && <span style={{ color: amber, fontWeight: 700 }}>· Needs attention</span>}
        </div>
      </div>
      {selected ? <VCheckDisc dark={dark} /> : <span style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}` }} />}
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

const VKEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']];
const keyStyle = { all: 'unset', cursor: 'pointer', height: 50, borderRadius: 12, background: 'var(--sd-colour-grey-200)', border: '1px solid var(--sd-colour-grey-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
function VKeypad({ onPress, onDelete, dark }) {
  const ks = dark ? { ...keyStyle, background: D_FILL, border: `1px solid ${D_BORDER}` } : keyStyle;
  const digit = dark ? '#fff' : 'var(--sd-colour-text-primary)';
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {VKEYS.map(([d, l]) => (
        <button key={d} className="v-key" onClick={() => onPress(d)} style={ks}>
          <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1, color: digit }}>{d}</span>
          {l && <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: sub, marginTop: 2 }}>{l}</span>}
        </button>
      ))}
      <span />
      <button className="v-key" onClick={() => onPress('0')} style={ks}>
        <span style={{ fontSize: 21, fontWeight: 600, color: digit }}>0</span>
      </button>
      <button onClick={onDelete} aria-label="Delete" style={{ all: 'unset', cursor: 'pointer', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ opacity: dark ? 0.9 : 0.6 }}>
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.2 9.2 L14.8 14.8 M14.8 9.2 L9.2 14.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
function VPinDots({ filled, shake, dark }) {
  const onCol = dark ? '#fff' : V_TEAL;
  const offCol = dark ? 'rgba(255,255,255,0.30)' : 'var(--sd-colour-grey-300)';
  return (
    <div className={shake ? 'v-shake' : ''} style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: i < filled ? onCol : offCol, transform: i < filled ? 'scale(1.12)' : 'scale(1)', transition: 'transform .15s, background .15s' }} />
      ))}
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
 * SERVICE-LOGIN SCREENS (one bespoke layout per variant — the comparison)
 * ==================================================================== */

/* 1 — Centred classic: white, centred. Emblem → heading → fields → terms. */
function Service1({ onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...phone2, background: 'var(--sd-colour-surface-default)', alignItems: 'center', justifyContent: 'center', padding: '0 26px' }}>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <VEmblem size={62} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>Sign in to Playground</h1>
          <p style={{ fontSize: 15, lineHeight: 1.45, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>Sign in to your service to get started.</p>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 2 }}>
          <VField label="Service username" {...userProps} invalid={err} />
          <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <VLink align="right">Forgot password?</VLink>
          <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
          <VTerms />
        </div>
      </div>
    </div>
  );
}

/* 2 — Editorial / left-aligned: wordmark top-left, terms pinned to footer. */
function Service2({ onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...phone2, background: 'var(--sd-colour-surface-default)', padding: '64px 28px 24px' }}>
      <VWordmark />
      <div style={{ marginTop: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.015em', lineHeight: 1.15 }}>Sign in to your service</h1>
        <p style={{ fontSize: 15, lineHeight: 1.45, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>Welcome back — let's get started.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        <VField label="Service username" {...userProps} invalid={err} />
        <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
        <VLink align="right">Forgot password?</VLink>
        <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
      </div>
      <div style={{ marginTop: 'auto' }}><VTerms align="left" /></div>
    </div>
  );
}

/* 3 — Playful tall-scene ⭐ is rendered by the animated <Flow3> (persistent hero + sliding bottom
   sheet), defined below — not a static Service component like the others. */

/* 4 — Playful card hero: rounded teal card hero (sun/clouds) on white. Surfaces passcode alt-auth. */
function Service4({ onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const heroH = 250;
  return (
    <div style={{ ...phone2, background: 'var(--sd-colour-surface-default)', padding: '16px 16px 24px' }}>
      <div style={{ height: heroH, position: 'relative', borderRadius: 28, overflow: 'hidden', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 26px', boxSizing: 'border-box', flexShrink: 0 }}>
        <VScene h={heroH} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <PLogo size={78} float />
          <div style={{ width: 250 }}>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 5px', letterSpacing: '-0.01em' }}>Let's get you signed in</h1>
            <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0, lineHeight: 1.4 }}>Your room is ready and waiting.</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24, padding: '0 10px' }}>
        <VField label="Service username" {...userProps} invalid={err} />
        <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
        <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
        <VLink align="center">Sign in with a passcode instead</VLink>
      </div>
    </div>
  );
}

/* 5 — Floating card on tint: mint bg, white card with emblem overlapping its top. */
function Service5({ onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...phone2, background: 'linear-gradient(165deg, var(--sd-colour-cyan-50), var(--sd-colour-cyan-100))', alignItems: 'center', justifyContent: 'center', padding: '0 22px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 320, marginTop: 30 }}>
        <div style={{ position: 'absolute', top: -31, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><VEmblem size={62} /></div>
        <div style={{ background: 'var(--sd-colour-surface-default)', borderRadius: 24, padding: '50px 24px 26px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ textAlign: 'center', marginBottom: 2 }}>
            <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 5px', color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>Welcome back</h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.4, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>Sign in to your service</p>
          </div>
          <VField label="Service username" {...userProps} invalid={err} />
          <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
          <VLink align="center">Forgot password?</VLink>
        </div>
      </div>
    </div>
  );
}

/* 6 — Immersive teal: full-bleed teal, left-aligned, translucent fields, white inverted button. */
function Service6({ onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...phone2, background: V_IMMERSIVE, padding: '64px 28px 28px' }}>
      <VScene h={300} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PLogo size={62} />
        <div style={{ marginTop: 26 }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.08, margin: '0 0 10px', color: '#fff', letterSpacing: '-0.02em' }}>Let's sign<br />you in</h1>
          <p style={{ fontSize: 16, lineHeight: 1.4, margin: 0, color: 'var(--sd-colour-cyan-100)' }}>Welcome back to your service.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 34 }}>
          <VField label="Service username" {...userProps} invalid={err} dark />
          <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} dark />
          <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} dark />
        </div>
        <div style={{ marginTop: 'auto' }}><VLink align="center" dark>Forgot password?</VLink></div>
      </div>
    </div>
  );
}

// variant 3 is handled by the animated <Flow3> (below), so it has no SERVICE entry.
const SERVICE = { 1: Service1, 2: Service2, 4: Service4, 5: Service5, 6: Service6 };

/* ====================================================================
 * THEMED SHELLS for the downstream steps (educator / PIN / room / confirm)
 * Each variant carries its visual language: light panel, floating card, or cosmic hero+sheet.
 * ==================================================================== */

const VARIANT_META = {
  1: { kind: 'panel', align: 'center', brand: 'emblem',   card: false, bg: 'var(--sd-colour-surface-default)' },
  2: { kind: 'panel', align: 'left',   brand: 'wordmark', card: false, bg: 'var(--sd-colour-surface-default)' },
  3: { kind: 'hero',  card: false, heroH: 280 },
  4: { kind: 'hero',  card: true,  heroH: 200 },
  5: { kind: 'panel', align: 'center', brand: 'emblem',   card: true,  bg: 'linear-gradient(165deg, var(--sd-colour-cyan-50), var(--sd-colour-cyan-100))' },
  6: { kind: 'immersive', dark: true },
};

function LightBack({ kind, onNav }) {
  return (
    <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 22, left: 22, zIndex: 3, display: 'flex', alignItems: 'center', gap: 2, color: 'var(--sd-colour-text-secondary)', fontSize: 15, fontWeight: 600 }}>
      <span style={{ fontSize: 20, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
    </button>
  );
}
function HeroNav({ kind, onNav }) {
  return (
    <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 18, left: 18, zIndex: 3, display: 'flex', alignItems: 'center', gap: 2, color: '#fff', fontSize: 15, fontWeight: 600 }}>
      <span style={{ fontSize: 20, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
    </button>
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

/* light variants 1 & 2 — brand + header + scrollable content + pinned footer */
function PanelShell({ meta, title, subtitle, nav, onNav, children, footer }) {
  const center = meta.align === 'center';
  const brand = meta.brand === 'wordmark' ? <VWordmark /> : <VEmblem size={54} />;
  return (
    <div style={{ ...phone2, background: meta.bg, padding: center ? '60px 26px 24px' : '62px 28px 24px', position: 'relative' }}>
      {nav && <LightBack kind={nav} onNav={onNav} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'stretch', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: center ? 'center' : 'flex-start', width: '100%' }}>{brand}</div>
        <VHeader title={title} subtitle={subtitle} align={center ? 'center' : 'left'} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 2 }}>{children}</div>
        {footer && <div style={{ width: '100%' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* variant 5 — floating white card with emblem overlapping its top */
function CardPanelShell({ meta, title, subtitle, nav, onNav, children, footer }) {
  return (
    <div style={{ ...phone2, background: meta.bg, padding: '0 20px', position: 'relative', justifyContent: 'center' }}>
      {nav && <LightBack kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', width: '100%', maxWidth: 330, maxHeight: '84%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><VEmblem size={58} /></div>
        <div style={{ background: 'var(--sd-colour-surface-default)', borderRadius: 24, padding: '46px 22px 24px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'hidden' }}>
          <VHeader title={title} subtitle={subtitle} align="center" />
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}

/* cosmic variants 3 & 4 — hero (full-bleed gradient / rounded card) + white sheet */
function HeroShell({ meta, title, subtitle, nav, onNav, children, footer }) {
  const heroH = meta.heroH || 260;
  const heroInner = (
    <>
      <VScene h={heroH} />
      {nav && <HeroNav kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '0 28px' }}>
        <PLogo size={48} />
        <VHeader title={title} subtitle={subtitle} align="center" light />
      </div>
    </>
  );
  if (meta.card) {
    return (
      <div style={{ ...phone2, background: 'var(--sd-colour-surface-default)', padding: '16px 16px 0' }}>
        <div style={{ height: heroH, position: 'relative', borderRadius: 28, overflow: 'hidden', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>{heroInner}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 10px 22px' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
          {footer}
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...phone2, background: V_HERO_GRAD }}>
      <div style={{ height: heroH, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>{heroInner}</div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 -10px 36px rgba(0,40,34,0.3)', position: 'relative', zIndex: 2, marginTop: -22 }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* variant 6 — immersive full-bleed teal: left-aligned white header + scene, content sits directly
   on the teal as translucent cards (children are built dark via buildStepCfg). */
function ImmersiveShell({ title, subtitle, nav, onNav, children, footer }) {
  return (
    <div style={{ ...phone2, background: V_IMMERSIVE, padding: '64px 26px 24px', position: 'relative' }}>
      <VScene h={240} />
      {nav && <HeroNav kind={nav} onNav={onNav} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18, flex: 1, minHeight: 0 }}>
        <VHeader title={title} subtitle={subtitle} align="left" light />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 2 }}>{children}</div>
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
function VHub({ room, educator, onChangeRoom, onLogout }) {
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
      <div style={{ padding: '12px 20px 22px', background: 'var(--sd-colour-surface-default)', borderTop: '1px solid var(--sd-colour-grey-300)', display: 'flex', gap: 10 }}>
        <button onClick={onChangeRoom} className="v-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', flex: 1, height: 48, borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${V_TEAL}`, color: V_TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600 }}>Change room</button>
        <button onClick={onLogout} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 48, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>Log out</button>
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
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin, dark,
    eduSort, eduQuery, setEduSort, setEduQuery,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  } = ctx;
  const noteCol = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  const errCol = dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)';

  if (step === 'educators') {
    const list = sortedEducators(eduSort, eduQuery);
    return {
      title: 'Select your educator', subtitle: 'Choose your profile to continue', nav: 'logout', onNav: resetFlow,
      children: (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <VSortPills value={eduSort} onChange={setEduSort} dark={dark} />
            <VSearch value={eduQuery} onChange={setEduQuery} dark={dark} />
          </div>
          <VAddRow dark={dark} onClick={() => { setAddEmail(''); setAddPin(''); setStep('addEducator'); }} />
          {list.map((e) => <VEduRow key={e.name} {...e} dark={dark} onClick={() => { setEducator(e); setPin(''); setAttempts(0); setStep('pin'); }} />)}
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
    return {
      title: `Hi ${first}`, subtitle: 'Enter your PIN to continue', nav: 'back', onNav: () => { setPin(''); setStep('educators'); },
      // dots + keypad CENTERED in the available space (no pinned footer), so there's no lopsided
      // gap below the keypad. PIN auto-submits once 4 digits are entered (the [pin] effect).
      children: (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
          <VPinDots filled={pin.length} shake={shake} dark={dark} />
          {attempts > 0 && <p style={{ textAlign: 'center', fontSize: 13, color: errCol, margin: 0 }}>Incorrect PIN — try again</p>}
          <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
            <VKeypad dark={dark} onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
          </div>
        </div>
      ),
    };
  }
  if (step === 'rooms') {
    return {
      title: 'Select your room', subtitle: 'Where are you working today?', nav: 'back', onNav: () => setStep('educators'),
      children: (rooms || []).map((r) => <VRoomRow key={r.name} {...r} dark={dark} selected={room === r.name} onClick={() => setRoom(r.name)} />),
      footer: <VBtn dark={dark} disabled={!room} onClick={() => setStep('confirm')}>{room ? `Continue to ${room}` : 'Select a room'}</VBtn>,
    };
  }
  if (step === 'confirm') {
    const ed = educator || EDUCATORS[0];
    const rn = room || (rooms && rooms[0] && rooms[0].name) || ROOM_POOL[0].name;
    const rr = roomByName(rn, rooms);
    return {
      title: 'Ready to go', subtitle: 'Confirm and enter your room', nav: 'back', onNav: () => setStep('rooms'),
      children: (
        <>
          <VSummaryRow dark={dark} avatar={<VEduAvatar e={ed} size={42} />} title={ed.name} sub={ed.role} action="Change" onAction={() => setStep('educators')} />
          <VSummaryRow dark={dark} avatar={<VRoomAvatar name={rn} size={42} />} title={rn} sub={rr.ratio ? `Ratio ${rr.ratio}` : ''} action="Change" onAction={() => setStep('rooms')} />
          <p style={{ fontSize: 12, lineHeight: 1.5, color: noteCol, textAlign: 'center', margin: '2px 0 0' }}>We'll remember this room for today.</p>
        </>
      ),
      footer: <VBtn dark={dark} onClick={() => setStep('hub')}>Enter {rn}</VBtn>,
    };
  }
  return {};
}

/* ====================================================================
 * FLOW 3 — Playful tall-scene as a DYNAMIC, animated app (not flicker transitions).
 * One persistent teal hero + one persistent white bottom sheet. As the step changes the
 * hero HEIGHT animates (so the sheet slides up/down), and the sheet's content cross-fades.
 * On sign-in the hero shrinks from 338 → 250, pulling the sheet up to the educator-select layout.
 * ==================================================================== */
const FLOW3_HERO = {
  service:     { h: 338, logo: 92, head: ['Rise and shine', 'Sign in to your service and start your day.'], nav: null },
  educators:   { h: 250, logo: 46, head: ['Select your educator', 'Choose your profile to continue'], nav: 'logout' },
  addEducator: { h: 226, logo: 46, head: ['Add educator profile', 'Sign in to your educator profile'], nav: 'back' },
  pin:         { h: 250, logo: 46, head: null, nav: 'back' }, // header comes from the step (Hi <name>)
  rooms:       { h: 250, logo: 46, head: ['Select your room', 'Where are you working today?'], nav: 'back' },
  confirm:     { h: 262, logo: 46, head: ['Ready to go', 'Confirm and enter your room'], nav: 'back' },
};
function Flow3({ step, ctx, onSignIn }) {
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const isService = step === 'service';
  const hero = FLOW3_HERO[step] || FLOW3_HERO.educators;
  const cfg = isService ? null : buildStepCfg(step, ctx);

  // hero heading: service/most steps come from FLOW3_HERO; the PIN step's "Hi <name>" comes from cfg.
  const ed = ctx.educator || EDUCATORS[0];
  const headTitle = hero.head ? hero.head[0] : (cfg ? cfg.title : '');
  const headSub = hero.head ? hero.head[1] : (cfg ? cfg.subtitle : '');
  const navKind = isService ? null : (cfg && cfg.nav);
  const onNav = isService ? null : (cfg && cfg.onNav);

  let body, footer, footerAuto = false;
  if (isService) {
    body = (
      <>
        <VField label="Service username" {...userProps} invalid={err} />
        <VField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
      </>
    );
    footer = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <VBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
        <VLink align="center">Forgot password?</VLink>
      </div>
    );
    footerAuto = true; // push the sign-in block to the bottom of the tall service sheet
  } else {
    body = cfg.children;
    footer = cfg.footer;
  }

  return (
    <div style={{ ...phone2, background: V_HERO_GRAD }}>
      <div className="v3-hero" style={{ height: hero.h, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', boxSizing: 'border-box', flexShrink: 0 }}>
        <VScene h={hero.h} />
        {navKind && <HeroNav kind={navKind} onNav={onNav} />}
        <div key={'h-' + step} className="v3-herocontent" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <PLogo size={hero.logo} float={isService} />
          <div style={{ maxWidth: 290 }}>
            {headTitle && <h1 style={{ color: '#fff', fontSize: isService ? 24 : 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{headTitle}</h1>}
            {headSub && <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0, lineHeight: 1.4 }}>{headSub}</p>}
          </div>
        </div>
      </div>
      <div className="v3-sheet" style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', boxShadow: '0 -10px 36px rgba(0,40,34,0.3)', marginTop: -24, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <div key={step} className="v3-body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{body}</div>
          {footer && <div style={{ marginTop: footerAuto ? 'auto' : 8 }}>{footer}</div>}
        </div>
      </div>
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
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Spinner size={26} color="rgba(255,255,255,0.92)" />
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

function IField({ label, type = 'text', placeholder, value, onChange, lead, trail, onTrail, invalid, error, dark }) {
  const iconStyle = dark ? { filter: 'brightness(0) invert(1)', opacity: 0.8 } : { opacity: 0.5 };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 15, fontWeight: 500, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{label}</span>}
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
        <span style={{ display: 'flex', gap: 7, fontSize: 14, lineHeight: 1.45, color: dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)' }}>
          <img src={ICON2('info-alert')} alt="" style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, ...(dark ? { filter: 'brightness(0) invert(1)' } : {}) }} />{error}
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
      By signing in you agree to our <span style={{ color: linkCol, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: linkCol, fontWeight: 600 }}>Privacy Policy</span>
    </p>
  );
}
function IEduAvatar({ e, size = 50 }) {
  if (!e) return null;
  if (e.photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--sd-colour-grey-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={ICON2('person')} alt="" style={{ width: size * 0.55, height: size * 0.55, opacity: 0.5 }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{e.initials}</div>
  );
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
function IEduCard({ initials, color, photo, name, role, login, onClick, dark }) {
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, background: dark ? D_FILL : 'transparent', border: `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
      <IEduAvatar e={{ initials, color, photo }} size={50} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: dark ? '#fff' : 'var(--sd-colour-text-primary)' }}>{name}</div>
        <div style={{ fontSize: 14, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)' }}>{role}</div>
      </div>
      {login != null && <span style={{ fontSize: 13, color: dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{agoLabel(login)}</span>}
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
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? 'rgba(255,255,255,0.04)' : 'var(--sd-colour-grey-100)', border: `1px dashed ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderRadius: 'var(--sd-radius-lg)', padding: '18px 22px', opacity: 0.75, cursor: 'not-allowed' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: sub }}>{name}</div>
          <div style={{ fontSize: 14, color: sub }}>Ratio {ratio}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: sub, background: dark ? D_FILL : 'var(--sd-colour-grey-200)', borderRadius: 999, padding: '5px 13px', whiteSpace: 'nowrap' }}>{note || 'Unavailable'}</span>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? D_FILL : 'transparent', border: selected ? `1.5px solid ${dark ? '#fff' : V_TEAL}` : `1px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-400)'}`, borderLeft: attention ? `4px solid ${amber}` : undefined, borderRadius: 'var(--sd-radius-lg)', padding: '18px 22px', transition: 'border-color .2s' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: txt }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: sub }}>
          <span>Ratio {ratio}</span>
          {attention && <span style={{ color: amber, fontWeight: 700 }}>· Needs attention</span>}
        </div>
      </div>
      {selected ? <ICheckDisc dark={dark} /> : <span style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${dark ? D_BORDER : 'var(--sd-colour-grey-500)'}` }} />}
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
const ikeyStyle = { all: 'unset', cursor: 'pointer', height: 66, borderRadius: 16, background: 'var(--sd-colour-grey-200)', border: '1px solid var(--sd-colour-grey-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
function IKeypad({ onPress, onDelete, dark }) {
  const ks = dark ? { ...ikeyStyle, background: D_FILL, border: `1px solid ${D_BORDER}` } : ikeyStyle;
  const digit = dark ? '#fff' : 'var(--sd-colour-text-primary)';
  const sub = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%' }}>
      {VKEYS.map(([d, l]) => (
        <button key={d} className="v-key" onClick={() => onPress(d)} style={ks}>
          <span style={{ fontSize: 27, fontWeight: 600, lineHeight: 1, color: digit }}>{d}</span>
          {l && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: sub, marginTop: 3 }}>{l}</span>}
        </button>
      ))}
      <span />
      <button className="v-key" onClick={() => onPress('0')} style={ks}>
        <span style={{ fontSize: 27, fontWeight: 600, color: digit }}>0</span>
      </button>
      <button onClick={onDelete} aria-label="Delete" style={{ all: 'unset', cursor: 'pointer', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: dark ? 0.9 : 0.6 }}>
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.2 9.2 L14.8 14.8 M14.8 9.2 L9.2 14.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
function IPinDots({ filled, shake, dark }) {
  const onCol = dark ? '#fff' : V_TEAL;
  const offCol = dark ? 'rgba(255,255,255,0.30)' : 'var(--sd-colour-grey-300)';
  return (
    <div className={shake ? 'v-shake' : ''} style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < filled ? onCol : offCol, transform: i < filled ? 'scale(1.12)' : 'scale(1)', transition: 'transform .15s, background .15s' }} />
      ))}
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
    <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 36, left: 40, zIndex: 3, display: 'flex', alignItems: 'center', gap: 3, color: light ? '#fff' : 'var(--sd-colour-text-secondary)', fontSize: 17, fontWeight: 600 }}>
      <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
    </button>
  );
}

/* iPad downstream content (educator / addEducator / pin / room / confirm) — shared across directions,
   themed by `dark` (immersive). Returns { title, subtitle, nav, onNav, children, footer }. `land` = landscape. */
function iCfg(step, ctx, dark, land) {
  const {
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin,
    eduSort, eduQuery, setEduSort, setEduQuery,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  } = ctx;
  const gridStyle = { display: 'grid', gridTemplateColumns: land ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 18, maxWidth: land ? 980 : 720, width: '100%', margin: '0 auto' };
  const colStyle = { width: '100%', maxWidth: 460, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 };
  const errCol = dark ? '#FFD9D2' : 'var(--sd-colour-feedback-error-default)';
  const noteCol = dark ? D_SUBTLE : 'var(--sd-colour-text-secondary)';

  if (step === 'educators') {
    const list = sortedEducators(eduSort, eduQuery);
    return {
      title: 'Select your educator', subtitle: 'Choose your profile to continue', nav: 'logout', onNav: resetFlow,
      children: (
        <div style={{ width: '100%', maxWidth: land ? 980 : 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <ISortPills value={eduSort} onChange={setEduSort} dark={dark} />
            <div style={{ flex: 1, minWidth: 240, maxWidth: 360 }}><ISearch value={eduQuery} onChange={setEduQuery} dark={dark} /></div>
          </div>
          <div style={gridStyle}>
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
    const first = (educator || EDUCATORS[0]).name.split(' ')[0];
    return {
      title: `Hi ${first}`, subtitle: 'Enter your PIN to continue', nav: 'back', onNav: () => { setPin(''); setStep('educators'); },
      children: (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 36 }}>
          <IPinDots filled={pin.length} shake={shake} dark={dark} />
          {attempts > 0 && <p style={{ fontSize: 14, color: errCol, margin: 0 }}>Incorrect PIN — try again</p>}
          <div style={{ width: '100%', maxWidth: 360 }}>
            <IKeypad dark={dark} onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
          </div>
        </div>
      ),
    };
  }
  if (step === 'rooms') return {
    title: 'Select your room', subtitle: 'Where are you working today?', nav: 'back', onNav: () => setStep('educators'),
    children: <div style={gridStyle}>{(rooms || []).map((r) => <IRoomCard key={r.name} {...r} dark={dark} selected={room === r.name} onClick={() => setRoom(r.name)} />)}</div>,
    footer: <IBtn dark={dark} disabled={!room} onClick={() => setStep('confirm')}>{room ? `Continue to ${room}` : 'Select a room'}</IBtn>,
  };
  if (step === 'confirm') {
    const ed = educator || EDUCATORS[0];
    const rn = room || (rooms && rooms[0] && rooms[0].name) || ROOM_POOL[0].name;
    const rr = roomByName(rn, rooms);
    return {
      title: 'Ready to go', subtitle: 'Confirm and enter your room', nav: 'back', onNav: () => setStep('rooms'),
      children: (
        <div style={colStyle}>
          <ISummaryRow dark={dark} avatar={<IEduAvatar e={ed} size={50} />} title={ed.name} sub={ed.role} action="Change" onAction={() => setStep('educators')} />
          <ISummaryRow dark={dark} avatar={<IRoomAvatar name={rn} size={50} />} title={rn} sub={rr.ratio ? `Ratio ${rr.ratio}` : ''} action="Change" onAction={() => setStep('rooms')} />
          <p style={{ fontSize: 13, lineHeight: 1.5, color: noteCol, textAlign: 'center', margin: 0 }}>We'll remember this room for today.</p>
        </div>
      ),
      footer: <IBtn dark={dark} onClick={() => setStep('hub')}>Enter {rn}</IBtn>,
    };
  }
  return {};
}

/* iPad downstream chrome — themed per direction (mirrors the phone shells at iPad scale). */
function IShell({ variant, title, subtitle, nav, onNav, children, footer, land }) {
  const meta = VARIANT_META[variant];
  const dark = !!meta.dark;
  const contentStack = (extra) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...extra }}>{children}</div>
  );

  // immersive (6) — full teal, dark content, left heading
  if (meta.kind === 'immersive') {
    return (
      <div style={{ ...ipadScreen, background: V_IMMERSIVE, padding: '76px 64px 56px', position: 'relative' }}>
        <VScene h={320} />
        {nav && <IBack kind={nav} onNav={onNav} light />}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 26, flex: 1, minHeight: 0 }}>
          <IHeading title={title} subtitle={subtitle} align="left" light />
          {contentStack()}
          {footer && <div style={{ width: '100%', maxWidth: 460 }}>{footer}</div>}
        </div>
      </div>
    );
  }
  // hero (3, 4) — teal hero band + white content
  if (meta.kind === 'hero') {
    const bandH = land ? 230 : 300;
    return (
      <div style={{ ...ipadScreen, background: 'var(--sd-colour-surface-default)' }}>
        <div style={{ height: bandH, position: 'relative', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <VScene h={bandH} />
          {nav && <IBack kind={nav} onNav={onNav} light />}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <PLogo size={54} />
            <IHeading title={title} subtitle={subtitle} align="center" light />
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '40px 64px 48px' }}>
          {contentStack()}
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
          {contentStack()}
          {footer && <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>{footer}</div>}
        </div>
      </div>
    );
  }
  // panel (1 centred, 2 editorial)
  const center = meta.align !== 'left';
  return (
    <div style={{ ...ipadScreen, background: meta.bg, padding: '76px 64px 56px', position: 'relative' }}>
      {nav && <IBack kind={nav} onNav={onNav} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start', gap: 24, flex: 1, minHeight: 0 }}>
        {meta.brand === 'wordmark' ? <IWordmark /> : <PLogo size={56} />}
        <IHeading title={title} subtitle={subtitle} align={center ? 'center' : 'left'} />
        {contentStack({ width: '100%' })}
        {footer && <div style={{ maxWidth: 460, width: '100%', margin: center ? '0 auto' : 0 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── iPad SERVICE (login) screens — one bespoke composition per direction ── */
function IService1({ onSignIn }) { // Centred classic
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...ipadScreen, alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <PLogo size={88} />
        <IHeading title="Sign in to Playground" subtitle="Sign in to your service to get started." />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
          <IField label="Service username" {...userProps} invalid={err} />
          <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <ILink align="right">Forgot password?</ILink>
          <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
          <ITerms />
        </div>
      </div>
    </div>
  );
}
function IService2({ onSignIn, land }) { // Editorial — split (landscape) / stacked left (portrait)
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const heading = (
    <div>
      <IWordmark />
      <h1 style={{ fontSize: land ? 46 : 40, fontWeight: 700, margin: '32px 0 10px', lineHeight: 1.12, letterSpacing: '-0.015em', color: 'var(--sd-colour-text-primary)' }}>Sign in to your service</h1>
      <p style={{ fontSize: 18, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>Welcome back — let's get started.</p>
    </div>
  );
  const form = (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <IField label="Service username" {...userProps} invalid={err} />
      <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
      <ILink align="right">Forgot password?</ILink>
      <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
      <ITerms />
    </div>
  );
  if (land) {
    return (
      <div style={{ ...ipadScreen, flexDirection: 'row' }}>
        <div style={{ flex: '0 0 46%', background: 'var(--sd-colour-surface-grey)', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{heading}</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 56px' }}>{form}</div>
      </div>
    );
  }
  return (
    <div style={{ ...ipadScreen, padding: '80px 64px 56px' }}>
      {heading}
      <div style={{ marginTop: 48 }}>{form}</div>
    </div>
  );
}
function IService3({ onSignIn, land }) { // Playful tall-scene — teal hero + white form
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const hero = (
    <div style={{ position: 'relative', flex: land ? '0 0 48%' : '0 0 440px', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', overflow: 'hidden' }}>
      <VScene h={land ? 720 : 440} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <PLogo size={96} float />
        <div>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>Rise and shine</h1>
          <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 18, margin: 0 }}>Sign in to your service and start your day.</p>
        </div>
      </div>
    </div>
  );
  const form = (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <IField label="Service username" {...userProps} invalid={err} />
      <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
      <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
      <ILink align="center">Forgot password?</ILink>
    </div>
  );
  return (
    <div style={{ ...ipadScreen, flexDirection: land ? 'row' : 'column', background: 'var(--sd-colour-surface-default)' }}>
      {hero}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px' }}>{form}</div>
    </div>
  );
}
function IService4({ onSignIn }) { // Playful card — rounded teal card hero on white
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...ipadScreen, background: 'var(--sd-colour-surface-default)', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ position: 'relative', height: 260, borderRadius: 32, overflow: 'hidden', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <VScene h={260} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <PLogo size={84} float />
            <div>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 6px' }}>Let's get you signed in</h1>
              <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 16, margin: 0 }}>Your room is ready and waiting.</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <IField label="Service username" {...userProps} invalid={err} />
          <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
          <ILink align="center">Sign in with a passcode instead</ILink>
        </div>
      </div>
    </div>
  );
}
function IService5({ onSignIn }) { // Floating card — white card on the mint tint, emblem overlapping
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  return (
    <div style={{ ...ipadScreen, background: 'linear-gradient(165deg, var(--sd-colour-cyan-50), var(--sd-colour-cyan-100))', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, marginTop: 42 }}>
        <div style={{ position: 'absolute', top: -42, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><PLogo size={84} /></div>
        <div style={{ background: 'var(--sd-colour-surface-default)', borderRadius: 28, padding: '64px 44px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', color: 'var(--sd-colour-text-primary)' }}>Welcome back</h1>
            <p style={{ fontSize: 16, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>Sign in to your service</p>
          </div>
          <IField label="Service username" {...userProps} invalid={err} />
          <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} />
          <ILink align="center">Forgot password?</ILink>
        </div>
      </div>
    </div>
  );
}
function IService6({ onSignIn, land }) { // Immersive teal — full teal, left, inverted controls
  const { userProps, pwProps, ready, err, loading, submit } = useCreds();
  const heading = (
    <div>
      <PLogo size={72} />
      <h1 style={{ fontSize: land ? 52 : 56, fontWeight: 700, lineHeight: 1.05, margin: '28px 0 12px', color: '#fff', letterSpacing: '-0.02em' }}>Let's sign<br />you in</h1>
      <p style={{ fontSize: 19, margin: 0, color: 'var(--sd-colour-cyan-100)' }}>Welcome back to your service.</p>
    </div>
  );
  const form = (
    <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <IField label="Service username" {...userProps} invalid={err} dark />
      <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} dark />
      <IBtn disabled={!ready} loading={loading} onClick={() => submit(onSignIn)} dark />
      <ILink align="center" dark>Forgot password?</ILink>
    </div>
  );
  if (land) {
    return (
      <div style={{ ...ipadScreen, background: V_IMMERSIVE, flexDirection: 'row', position: 'relative' }}>
        <VScene h={760} />
        <div style={{ position: 'relative', zIndex: 1, flex: 1, padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{heading}</div>
        <div style={{ position: 'relative', zIndex: 1, flex: 1, padding: '0 56px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>{form}</div>
      </div>
    );
  }
  return (
    <div style={{ ...ipadScreen, background: V_IMMERSIVE, padding: '88px 64px 56px', position: 'relative' }}>
      <VScene h={460} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {heading}
        <div style={{ marginTop: 48 }}>{form}</div>
      </div>
    </div>
  );
}
const ISERVICE = { 1: IService1, 2: IService2, 3: IService3, 4: IService4, 5: IService5, 6: IService6 };

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
        <button onClick={ctx.resetFlow} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>Log out</button>
      </div>
    </div>
  );
}

/* iPad renderer — dispatches by direction: bespoke login (ISERVICE) → themed IShell + iCfg → shared hub. */
function IPadFlow({ variant, step, ctx, land, onSignIn }) {
  if (step === 'service') { const S = ISERVICE[variant] || IService1; return <S onSignIn={onSignIn} land={land} />; }
  if (step === 'hub') return <IHub ctx={ctx} land={land} />;
  const cfg = iCfg(step, ctx, !!VARIANT_META[variant].dark, land);
  return <IShell variant={variant} land={land} {...cfg} />;
}

/* ====================================================================
 * HARNESS — one variant at a time, with flow-step nav (left), demo creds (right),
 * and a variant switcher + restart (bottom). All flow state lives here.
 * ==================================================================== */
const VARIANTS = [
  { n: 1, short: 'Centred classic' },
  { n: 2, short: 'Editorial' },
  { n: 3, short: 'Playful tall-scene' },
  { n: 4, short: 'Playful card' },
  { n: 5, short: 'Floating card' },
  { n: 6, short: 'Immersive teal' },
];
const STEPS = [
  { key: 'service',   label: 'Sign in' },
  { key: 'educators', label: 'Educator' },
  { key: 'pin',       label: 'PIN' },
  { key: 'rooms',     label: 'Room' },
  { key: 'confirm',   label: 'Confirm' },
  { key: 'hub',       label: 'Hub' },
];

function CredRow({ label, value }) {
  return (
    <div className="cred-row">
      <span className="cred-label">{label}</span>
      <span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{value}</span>
    </div>
  );
}

function VariantsApp() {
  // URL-addressable state for screenshot capture: ?v=1-5&step=service|educators|pin|rooms|confirm|hub
  const _p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const _v0 = Math.min(6, Math.max(1, parseInt(_p.get('v'), 10) || 1));
  const _s0 = _p.get('step') || 'service';
  const _needEdu = ['pin', 'rooms', 'confirm', 'hub'].includes(_s0);
  const _needRoom = ['confirm', 'hub'].includes(_s0);
  const _bare = !!_p.get('bare'); // capture mode — skip the launch splash so screens grab cleanly
  const _dev0 = _p.get('device') === 'ipad' ? 'ipad' : 'phone';
  const _o0 = _p.get('orient') === 'landscape' ? 'landscape' : 'portrait';

  const [device, setDevice] = useState(_dev0);        // 'phone' (the 5 directions) | 'ipad' (Centred classic)
  const [orientation, setOrientation] = useState(_o0); // iPad only: 'portrait' | 'landscape'
  const _rooms0 = pickRooms(); // a random 5–10 room set for this prototype (re-rolled on restart / direction switch)
  const [variant, setVariant] = useState(_v0);
  const [step, setStep] = useState(_s0);
  const [educator, setEducator] = useState(_needEdu ? EDUCATORS[0] : null);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [rooms, setRooms] = useState(_rooms0);
  const [room, setRoom] = useState(_needRoom ? _rooms0[0].name : null);
  const [eduSort, setEduSort] = useState('recent'); // 'recent' (most recent login) | 'name'
  const [eduQuery, setEduQuery] = useState('');      // educator search filter
  const [addEmail, setAddEmail] = useState('');
  const [addPin, setAddPin] = useState('');
  const [showAddPin, setShowAddPin] = useState(false);
  const [nonce, setNonce] = useState(0); // remounts the screen on restart / variant switch
  // launch splash — shown on first load (at the service step) and on each direction open / restart
  const [splash, setSplash] = useState(!_bare && _s0 === 'service');

  const meta = VARIANT_META[variant];
  const Service = SERVICE[variant];

  const resetFlow = () => { setStep('service'); setEducator(null); setPin(''); setAttempts(0); setRooms(pickRooms()); setRoom(null); setEduSort('recent'); setEduQuery(''); setAddEmail(''); setAddPin(''); setNonce((n) => n + 1); if (!_bare) setSplash(true); };
  const pickVariant = (n) => { setVariant(n); resetFlow(); };

  // left-rail jump — seed sensible defaults so any step is coherent out of order
  const goStep = (target) => {
    if (target !== 'service' && !educator) setEducator(EDUCATORS[0]);
    if ((target === 'confirm' || target === 'hub') && !room) setRoom(rooms[0].name);
    if (target === 'pin') { setPin(''); setAttempts(0); }
    setStep(target);
  };

  // PIN validation — 4 digits; correct → room select, wrong → shake + retry
  useEffect(() => {
    if (pin.length < 4) return;
    const ok = pin === DEMO_PIN;
    const t = setTimeout(() => {
      if (ok) { setStep('rooms'); setPin(''); setAttempts(0); }
      else { setAttempts((a) => a + 1); setShake(true); setTimeout(() => setShake(false), 450); setPin(''); }
    }, 220);
    return () => clearTimeout(t);
  }, [pin]);

  // shared context for buildStepCfg / Flow3 / iCfg. `dark` = immersive (variant 6) treatment.
  const ctx = {
    educator, pin, shake, attempts, room, rooms, addEmail, addPin, showAddPin, dark: variant === 6,
    eduSort, eduQuery, setEduSort, setEduQuery,
    setStep, setEducator, setPin, setAttempts, setRoom, setAddEmail, setAddPin, setShowAddPin, resetFlow,
  };

  // build the current screen. iPad mode renders the SAME direction at iPad scale (bespoke per
  // direction); on phone, variant 3 (Playful tall-scene) runs through the animated Flow3 (persistent
  // hero + sliding sheet), and the others remount per step.
  const isIpad = device === 'ipad';
  const land = orientation === 'landscape';
  const animated = !isIpad && variant === 3 && step !== 'hub';
  let screen;
  if (isIpad) {
    screen = <IPadFlow variant={variant} step={step} ctx={ctx} land={land} onSignIn={() => setStep('educators')} />;
  } else if (animated) {
    screen = <Flow3 step={step} ctx={ctx} onSignIn={() => setStep('educators')} />;
  } else if (step === 'service') {
    screen = <Service onSignIn={() => setStep('educators')} />;
  } else if (step === 'hub') {
    screen = <VHub room={room} educator={educator} onChangeRoom={() => setStep('rooms')} onLogout={resetFlow} />;
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
      {/* device toggle — Phone (the 5 directions) ↔ iPad (Centred classic) */}
      <div className="device-toggle">
        {[['phone', 'Phone'], ['ipad', 'iPad']].map(([k, l]) => (
          <button key={k} className={'ds-selection-pill' + (device === k ? ' ds-selection-pill--selected' : '')} onClick={() => setDevice(k)}>
            <span className="ds-selection-pill__label">{l}</span>
          </button>
        ))}
      </div>

      <div className="stage-row">
        <aside className="rail rail-left">
          <div className="rail-title">Direction</div>
          {VARIANTS.map((v) => railCard(v.n, v.short, variant === v.n, () => pickVariant(v.n)))}
          {/* orientation toggle — separate section below the directions, iPad only */}
          {isIpad && (
            <div className="rail-sub">
              <div className="rail-title">Layout</div>
              {railCard('portrait', 'Vertical', !land, () => setOrientation('portrait'))}
              {railCard('landscape', 'Horizontal', land, () => setOrientation('landscape'))}
            </div>
          )}
        </aside>

        <div className={'device' + (isIpad ? ' is-ipad' : '') + (isIpad && land ? ' is-landscape' : '')}>
          <div className="device-screen">
            {/* animated variant 3 keeps a stable key across steps so its hero+sheet persist & animate;
                everything else remounts per step with the rise-in entrance. */}
            <div key={deviceKey} className={(noRise ? '' : 'v-rise ') + 'screen-fill'}>{screen}</div>
            {splash && <VSplash key={`splash-${device}-${variant}-${nonce}`} variant={variant} onDone={() => setSplash(false)} />}
          </div>
        </div>

        <aside className="rail rail-right">
          <div className="rail-title">Reference</div>
          <div className="creds">
            <div className="creds-title">Demo details</div>
            <CredRow label="Service username" value={DEMO_USER} />
            <CredRow label="Service password" value={DEMO_PASS} />
            <CredRow label="Educator PIN" value={DEMO_PIN} />
            <p className="creds-note">Username &amp; password are pre-filled — just tap <b>Sign in</b>.</p>
          </div>
        </aside>
      </div>

      <div className="controls">
        <div className="flow-pills">
          {STEPS.map((s, i) => (
            <button key={s.key} className={'ds-selection-pill' + (step === s.key ? ' ds-selection-pill--selected' : '')} onClick={() => goStep(s.key)}>
              <span className="ds-selection-pill__label">{i + 1} · {s.label}</span>
            </button>
          ))}
        </div>
        <button className="ds-btn ds-btn--ghost" onClick={resetFlow}>↺ Restart flow</button>
      </div>
    </div>
  );
}

window.VariantsApp = VariantsApp;
