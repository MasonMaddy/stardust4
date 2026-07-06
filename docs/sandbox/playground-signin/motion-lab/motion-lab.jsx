/*
 * Playground Sign-in — MOTION LAB (Direction D: travelling logo)
 *
 * Purpose: isolate the SERVICE ⇄ EDUCATOR transition and test one motion direction across
 * phone / tablet portrait / tablet landscape, with a Replay control.
 *
 * The motion recipe (what devs would build):
 *   1. Screens are self-contained navigation destinations. The transition between them is a
 *      Material-style FADE-THROUGH: outgoing fades out fast; incoming fades in slightly
 *      delayed and rises 16px. No screen geometry morphs.
 *   2. Exactly ONE shared element crosses screens: the brand mark. Each screen reserves an
 *      empty anchor slot ([data-mark-anchor]) where its mark should sit; the mark itself is
 *      drawn ONCE in an overlay (TravelMark) and glides between the measured anchor
 *      positions, crossfading Playground P ⇄ school crest mid-flight.
 *      → SwiftUI: matchedGeometryEffect on one small view · Compose: sharedElement on one
 *        view inside SharedTransitionLayout · graceful fallback: crossfade in place.
 *   3. List content staggers in AFTER the layer lands (v-stagger), so the educator list
 *      "arrives" rather than pops.
 *
 * Visual components (VField/VBtn/VScene/PLogo/SchoolLogo/educator rows) are copied from the
 * flow prototype (../service-to-educator/variants.jsx) so screens stay pixel-faithful.
 */

const { useState, useEffect, useLayoutEffect, useRef } = React;

const ICON = (n) => `./assets/icons/${n}.svg`;
const V_TEAL = 'var(--sd-colour-action-primary)';
const V_LINK = 'var(--sd-colour-text-link)';
const V_HERO_GRAD = 'radial-gradient(120% 70% at 50% 0%, var(--sd-colour-cyan-700), var(--sd-colour-cyan-900))';
const SERVICE_NAME = 'Little Bugs OSHC';
const DEMO_USER = 'LittleBugs';
const DEMO_PASS = 'bugs123';

/* educator roster — `login` = minutes since last sign-in; `img` = stable pravatar id. */
const C = ['var(--sd-colour-cyan-600)', 'var(--sd-colour-orange-500)', 'var(--sd-colour-purple-500)', 'var(--sd-colour-green-500)', 'var(--sd-colour-cyan-700)'];
const EDUCATORS = [
  { initials: 'TN', color: C[3], name: 'Thomas Nguyen', login: 1, img: 14 },
  { initials: 'WW', color: C[0], name: 'William Walker', login: 3, img: 12 },
  { initials: 'GC', color: C[2], name: 'Grace Chen', login: 6, img: 20 },
  { initials: 'PS', color: C[4], name: 'Priya Sharma', login: 9, img: 16 },
  { initials: 'IS', color: C[3], name: 'Isla Stewart', login: 12, img: 44 },
  { initials: 'AO', color: C[1], name: 'Amara Okafor', login: 14, img: 31 },
  { initials: 'MJ', color: C[1], name: 'Maya Johnson', login: 18, img: 5 },
  { initials: 'SK', color: C[3], name: 'Sofia Kovač', login: 28, img: 28 },
  { initials: 'MR', color: C[0], name: 'Mia Rossi', login: 47, img: 47 },
  { initials: 'RL', color: C[2], name: 'Rina Lee', login: 52, img: 9 },
  { initials: 'DO', color: C[1], name: "Daniel O'Brien", login: 75, img: 53 },
  { initials: 'AS', color: C[2], name: 'Alex Smith', login: 240, img: 33 },
  { initials: 'EF', color: C[1], name: 'Ella Fischer', login: 420, img: 36 },
  { initials: 'HM', color: C[0], name: 'Hannah Murphy', login: 900, img: 24 },
];
const EDU_PHOTO = (e) => (e && e.img ? `https://i.pravatar.cc/120?img=${e.img}` : null);
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

/* ====================================================================
 * SHARED VISUALS (copied from the flow prototype so screens match 1:1)
 * ==================================================================== */

function VField({ label, type = 'text', value, onChange, lead, trail, onTrail }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--sd-colour-text-secondary)' }}>{label}</span>}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {lead && <img src={ICON(lead)} alt="" style={{ position: 'absolute', left: 14, width: 20, height: 20, pointerEvents: 'none', opacity: 0.5 }} />}
        <input
          className="v-input" type={type} value={value} onChange={(e) => onChange(e.target.value)}
          style={{
            boxSizing: 'border-box', width: '100%', height: 52, margin: 0,
            padding: `0 ${trail ? 44 : 16}px 0 ${lead ? 44 : 16}px`,
            fontFamily: 'var(--sd-font-family)', fontSize: 16, fontWeight: 500,
            color: 'var(--sd-colour-text-primary)', background: 'var(--sd-colour-surface-default)',
            border: '1px solid var(--sd-colour-grey-500)', borderRadius: 'var(--sd-radius-lg)',
          }}
        />
        {trail && (
          <button type="button" onClick={onTrail} aria-label="Toggle password" style={{ all: 'unset', cursor: 'pointer', position: 'absolute', right: 14, display: 'flex' }}>
            <img src={ICON(trail)} alt="" style={{ width: 20, height: 20, opacity: 0.5 }} />
          </button>
        )}
      </span>
    </label>
  );
}

function Spinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg className="ds-btn__spinner" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size, color }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 9" />
    </svg>
  );
}

function VBtn({ children = 'Sign in', loading, onClick, loadingLabel = 'Signing in…' }) {
  return (
    <button type="button" className={loading ? '' : 'v-btn'} onClick={loading ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 52, padding: '0 18px',
      textAlign: 'center', cursor: loading ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-lg)',
      background: V_TEAL, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{loading ? <><Spinner size={18} color="#fff" />{loadingLabel}</> : children}</button>
  );
}

function VLink({ children, align = 'center' }) {
  return (
    <div style={{ textAlign: align }}>
      <button type="button" style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: V_LINK }}>{children}</button>
    </div>
  );
}

/* kid-friendly hero doodles — clouds, balloons, sparkles, paper plane */
function FunGlyph({ t }) {
  const c = '#fff';
  const s = { width: '100%', height: '100%', display: 'block' };
  if (t === 'cloud') return <svg viewBox="0 0 100 60" fill={c} style={s}><circle cx="28" cy="38" r="17" /><circle cx="52" cy="28" r="22" /><circle cx="74" cy="40" r="15" /><rect x="26" y="40" width="50" height="17" rx="8.5" /></svg>;
  if (t === 'balloon') return <svg viewBox="0 0 40 58" fill="none" style={s}><ellipse cx="20" cy="18" rx="13" ry="16" fill={c} /><path d="M20 34 q-3 3 0 6 q3 3 0 6 q-3 3 0 6" stroke={c} strokeWidth="1.4" fill="none" /></svg>;
  if (t === 'sparkle') return <svg viewBox="0 0 24 24" fill={c} style={s}><path d="M12 1c1 6.5 4.5 10 11 11-6.5 1-10 4.5-11 11-1-6.5-4.5-10-11-11 6.5-1 10-4.5 11-11z" /></svg>;
  if (t === 'plane') return <svg viewBox="0 0 48 40" fill={c} style={s}><path d="M3 20 L45 3 L30 37 L24 27 Z" /></svg>;
  return <svg viewBox="0 0 12 12" fill={c} style={s}><circle cx="6" cy="6" r="6" /></svg>;
}
const V_SCENE = [
  { t: 'cloud',   top: 0.06, left: 0.52, w: 64, h: 38, o: 0.16, drift: 'vf-a',     dur: 26, tw: 0,   delay: 0.5 },
  { t: 'cloud',   top: 0.12, left: 0.06, w: 50, h: 30, o: 0.30, drift: 'vf-b',     dur: 18, tw: 0,   delay: 0.2 },
  { t: 'cloud',   top: 0.50, left: 0.72, w: 40, h: 24, o: 0.24, drift: 'vf-c',     dur: 16, tw: 0,   delay: 1.0 },
  { t: 'sparkle', top: 0.10, left: 0.84, w: 18, h: 18, o: 0.55, drift: 'vf-a',     dur: 8,  tw: 4.5, delay: 0.4 },
  { t: 'sparkle', top: 0.60, left: 0.16, w: 15, h: 15, o: 0.50, drift: 'vf-c',     dur: 9,  tw: 3.8, delay: 0.7 },
  { t: 'sparkle', top: 0.30, left: 0.48, w: 12, h: 12, o: 0.50, drift: 'vf-a',     dur: 8,  tw: 3.6, delay: 1.2 },
  { t: 'sparkle', top: 0.46, left: 0.63, w: 13, h: 13, o: 0.48, drift: 'vf-b',     dur: 8,  tw: 4.2, delay: 0.5 },
  { t: 'dot',     top: 0.42, left: 0.32, w: 8,  h: 8,  o: 0.50, drift: 'vf-b',     dur: 7,  tw: 2.8, delay: 0.3 },
  { t: 'dot',     top: 0.22, left: 0.40, w: 6,  h: 6,  o: 0.50, drift: 'vf-c',     dur: 8,  tw: 3.1, delay: 0.9 },
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

/* the two faces of the travelling mark — sized to FILL their box (the overlay animates the box) */
function PLogoFace() {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '50%', boxShadow: '0 8px 20px rgba(0,40,34,0.22)' }}>
      <svg viewBox="0 0 67 67" width="100%" height="100%" fill="none" style={{ display: 'block' }}>
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
function CrestFace() {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '24%', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,40,34,0.22)' }}>
      <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: 'block' }}>
        <rect width="64" height="64" rx="15" fill="#FFFFFF" />
        <rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="var(--sd-colour-cyan-700)" strokeWidth="2.5" />
        <path d="M16 40 C16 26 30 22 44 22 C44 36 30 42 16 40 Z" fill="var(--sd-colour-cyan-500)" opacity="0.9" />
        <path d="M19 38 C27 33 35 29 42 25" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
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

/* the anchor slot — each screen reserves the mark's box; the overlay draws the actual mark */
function MarkAnchor({ size }) {
  return <div data-mark-anchor style={{ width: size, height: size, flexShrink: 0 }} />;
}

/* the ONE shared element — glides between anchors, crossfading P ⇄ crest */
function TravelMark({ pos, kind }) {
  return (
    <div className="ml-mark" style={{ width: pos.size, height: pos.size, transform: `translate(${pos.x}px, ${pos.y}px)` }} aria-hidden="true">
      <div className="ml-mark__face" style={{ opacity: kind === 'p' ? 1 : 0 }}><PLogoFace /></div>
      <div className="ml-mark__face" style={{ opacity: kind === 'crest' ? 1 : 0 }}><CrestFace /></div>
    </div>
  );
}

/* educator bits */
function PhotoImg({ src, alt = '', style, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={style} />;
}
function VEduAvatar({ e, size = 42 }) {
  if (!e) return null;
  const initials = (
    <div style={{ width: size, height: size, borderRadius: '50%', background: e.color || 'var(--sd-colour-cyan-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.33, flexShrink: 0 }}>{e.initials || (e.name || '?')[0]}</div>
  );
  return <PhotoImg src={EDU_PHOTO(e)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--sd-colour-grey-200)' }} fallback={initials} />;
}
function VEduRow({ e, big }) {
  return (
    <button type="button" className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: big ? '12px 16px' : '10px 15px' }}>
      <VEduAvatar e={e} size={big ? 46 : 42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sd-colour-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
        <div style={{ fontSize: 13, color: 'var(--sd-colour-text-secondary)' }}>Signed in {agoLabel(e.login)}</div>
      </div>
      <img src={ICON('chevron-right')} alt="" style={{ width: 18, height: 18, opacity: 0.4, flexShrink: 0 }} />
    </button>
  );
}
function VAddRow({ big }) {
  return (
    <button type="button" className="v-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: big ? '12px 16px' : '18px 18px', minHeight: big ? 46 : undefined }}>
      <span style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--sd-colour-text-primary)' }}>Add educator profile</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: V_LINK }}>Sign in</span>
    </button>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.4-3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function VSearch({ value, onChange, small }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      <span style={{ position: 'absolute', left: 14, display: 'flex', color: 'var(--sd-colour-text-secondary)', opacity: 0.55, pointerEvents: 'none' }}><SearchIcon /></span>
      <input className="v-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search educators" style={{
        boxSizing: 'border-box', width: '100%', height: small ? 42 : 46, margin: 0, padding: '0 14px 0 42px',
        fontFamily: 'var(--sd-font-family)', fontSize: 15, fontWeight: 500,
        color: 'var(--sd-colour-text-primary)', background: 'var(--sd-colour-surface-default)',
        border: '1px solid var(--sd-colour-grey-500)', borderRadius: 'var(--sd-radius-lg)',
      }} />
    </div>
  );
}
function VSortPills({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--sd-colour-text-secondary)' }}>Sort</span>
      {[['recent', 'Recent'], ['name', 'Name']].map(([k, l]) => {
        const sel = value === k;
        return (
          <button type="button" key={k} onClick={() => onChange(k)} style={{
            all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1px solid ${sel ? V_TEAL : 'var(--sd-colour-grey-400)'}`,
            background: sel ? 'var(--sd-colour-cyan-50)' : 'transparent',
            color: sel ? V_TEAL : 'var(--sd-colour-text-secondary)',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

/* "‹ Log out" + centred service name — the post-sign-in hero nav */
function HeroNav({ onBack }) {
  return (
    <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button type="button" onClick={onBack} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', left: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 15, fontWeight: 600 }}>
        <img src={ICON('chevron-left')} alt="" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />Log out
      </button>
      <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{SERVICE_NAME}</span>
    </div>
  );
}

/* ====================================================================
 * SCREENS — self-contained per device mode; each reserves a MarkAnchor
 * ==================================================================== */

function useSignIn(onDone) {
  const [user, setUser] = useState(DEMO_USER);
  const [pw, setPw] = useState(DEMO_PASS);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = () => { setLoading(true); setTimeout(() => { setLoading(false); onDone(); }, 700); };
  const fields = (
    <React.Fragment>
      <VField label="Service username" lead="person" value={user} onChange={setUser} />
      <VField label="Service password" type={show ? 'text' : 'password'} value={pw} onChange={setPw} trail={show ? 'view-hide' : 'view'} onTrail={() => setShow(!show)} />
    </React.Fragment>
  );
  return { fields, loading, submit };
}

const screenBase = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)',
  display: 'flex', flexDirection: 'column', position: 'relative',
};

/* — phone — */
function PhoneService({ onSignIn }) {
  const { fields, loading, submit } = useSignIn(onSignIn);
  return (
    <div style={{ ...screenBase, background: 'var(--sd-colour-surface-default)' }}>
      <div className="ml-hero" style={{ height: 372, flexShrink: 0, background: V_HERO_GRAD, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', boxSizing: 'border-box' }}>
        <VScene h={372} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <MarkAnchor size={96} />
          <div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 7px', letterSpacing: '-0.01em' }}>Rise and shine</h1>
            <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0, lineHeight: 1.4 }}>Sign in to your service and start your day.</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24, position: 'relative', zIndex: 2, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' }}>
        {fields}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <VBtn loading={loading} onClick={submit} />
          <VLink>Forgot password?</VLink>
        </div>
      </div>
    </div>
  );
}
function PhoneEducators({ onBack, sort, setSort, query, setQuery }) {
  const list = sortedEducators(sort, query);
  return (
    <div style={{ ...screenBase, background: 'var(--sd-colour-surface-default)' }}>
      <div className="ml-hero" style={{ height: 258, flexShrink: 0, background: V_HERO_GRAD, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 28px 0', boxSizing: 'border-box' }}>
        <VScene h={258} />
        <HeroNav onBack={onBack} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 }}>
          <MarkAnchor size={54} />
          <div style={{ maxWidth: 290 }}>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Select your educator</h1>
            <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 14.5, margin: 0, lineHeight: 1.4 }}>Choose your profile to continue</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24, position: 'relative', zIndex: 2, padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box' }}>
        <VSortPills value={sort} onChange={setSort} />
        <VSearch value={query} onChange={setQuery} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 22 }}>
          <div className="v-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <VAddRow />
            {list.map((e) => <VEduRow key={e.name} e={e} />)}
            {list.length === 0 && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sd-colour-text-secondary)', margin: '8px 0' }}>No educators match “{query}”.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* — tablet (portrait: hero band top · landscape: hero panel left) — */
function TabletService({ onSignIn, land }) {
  const { fields, loading, submit } = useSignIn(onSignIn);
  const heroInner = (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
      <MarkAnchor size={96} />
      <div>
        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>Rise and shine</h1>
        <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 18, margin: 0 }}>Sign in to your service and start your day.</p>
      </div>
    </div>
  );
  const actions = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <VBtn loading={loading} onClick={submit} />
      <VLink>Forgot password?</VLink>
    </div>
  );
  if (land) {
    return (
      <div style={{ ...screenBase, flexDirection: 'row', background: 'var(--sd-colour-surface-default)' }}>
        <div className="ml-hero" style={{ position: 'relative', flex: '0 0 48%', background: V_HERO_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', overflow: 'hidden', boxSizing: 'border-box' }}>
          <VScene h={720} />
          {heroInner}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>{fields}{actions}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...screenBase, background: 'var(--sd-colour-surface-default)' }}>
      <div className="ml-hero" style={{ position: 'relative', flex: '0 0 440px', background: V_HERO_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <VScene h={440} />
        {heroInner}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '52px 56px 64px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>{fields}</div>
        <div style={{ width: '100%', maxWidth: 440, margin: 'auto auto 0', paddingTop: 28 }}>{actions}</div>
      </div>
    </div>
  );
}
function TabletEducators({ onBack, land, sort, setSort, query, setQuery }) {
  const list = sortedEducators(sort, query);
  const bandH = land ? 250 : 300;
  return (
    <div style={{ ...screenBase, background: 'var(--sd-colour-surface-default)' }}>
      <div className="ml-hero" style={{ height: bandH, flexShrink: 0, position: 'relative', background: V_HERO_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, boxSizing: 'border-box' }}>
        <VScene h={bandH} />
        <HeroNav onBack={onBack} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <MarkAnchor size={56} />
          <div>
            <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 5px' }}>Select your educator</h1>
            <p style={{ color: 'var(--sd-colour-cyan-100)', fontSize: 15.5, margin: 0 }}>Choose your profile to continue</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 18, padding: land ? '28px 56px 0' : '36px 56px 0', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <VSortPills value={sort} onChange={setSort} />
          <div style={{ width: land ? 380 : 320 }}><VSearch value={query} onChange={setQuery} small /></div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 40 }}>
          <div className="v-stagger" style={{ display: 'grid', gridTemplateColumns: `repeat(${land ? 3 : 2}, 1fr)`, gap: 14 }}>
            <VAddRow big />
            {list.map((e) => <VEduRow key={e.name} e={e} big />)}
          </div>
          {list.length === 0 && <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sd-colour-text-secondary)', margin: '12px 0' }}>No educators match “{query}”.</p>}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
 * HARNESS — device stage, travelling-mark overlay, rails, replay
 * ==================================================================== */

const ICON_PHONE = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3" /><line x1="10.5" y1="18.5" x2="13.5" y2="18.5" /></svg>;
const ICON_TABLET = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5" /><line x1="10.5" y1="17.5" x2="13.5" y2="17.5" /></svg>;

function TabToggle({ opts, current, onChange }) {
  const idx = Math.max(0, opts.findIndex((o) => o.value === current));
  return (
    <div className="tab-toggle" style={{ gridTemplateColumns: `repeat(${opts.length}, 1fr)` }}>
      <span className="tab-toggle__ind" style={{ width: `calc((100% - 10px) / ${opts.length})`, transform: `translateX(${idx * 100}%)` }} />
      {opts.map((o) => (
        <button type="button" key={o.value} className={'tab-seg' + (o.value === current ? ' tab-seg--selected' : '')} onClick={() => onChange(o.value)}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

function MotionLabApp() {
  const params = new URLSearchParams(window.location.search);
  const [device, setDevice] = useState(params.get('device') === 'ipad' ? 'ipad' : 'phone');
  const [orient, setOrient] = useState(params.get('orient') === 'landscape' ? 'landscape' : 'portrait');
  const [screen, setScreen] = useState(params.get('step') === 'educators' ? 'educators' : 'service');
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');

  // travelling-mark overlay position (device layout units) + snap control
  const stackRef = useRef(null);
  const [mark, setMark] = useState({ x: 0, y: 0, size: 96 });
  const [noAnim, setNoAnim] = useState(true);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  const measure = () => {
    const stack = stackRef.current;
    if (!stack) return;
    const anchor = stack.querySelector(`[data-layer="${screenRef.current}"] [data-mark-anchor]`);
    if (!anchor) return;
    // accumulate offsetTop/offsetLeft up to the stack (which is position:relative, so it
    // terminates the offsetParent chain). Offsets are pure LAYOUT coordinates — immune to
    // the harness fit() scale, the layers' enter-animation transforms, and viewport
    // resizes, unlike getBoundingClientRect. Exactly the "at rest" target the mark needs.
    let x = 0, y = 0, el = anchor;
    while (el && el !== stack) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    setMark({ x, y, size: anchor.offsetWidth });
  };

  // screen change → glide (animated); device/orientation change or mount → snap.
  // setTimeout (not rAF) so the re-enable still runs if the tab is backgrounded.
  useLayoutEffect(() => { measure(); }, [screen]);
  useLayoutEffect(() => {
    setNoAnim(true);
    measure();
    const id = setTimeout(() => setNoAnim(false), 80);
    return () => clearTimeout(id);
  }, [device, orient]);
  // fonts settle text metrics slightly after first paint — re-measure once, still snapped
  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure());
  }, []);

  const lastRef = useRef({ from: 'service', to: 'educators' });
  const go = (to) => {
    if (to === screenRef.current) return;
    lastRef.current = { from: screenRef.current, to };
    setScreen(to);
  };
  // replay = snap back to the transition's start, re-enable animation, then re-run it.
  // Three separate commits (timeout-chained) so the snap never paints animated and the
  // re-run always transitions — and it still completes if the tab is backgrounded (no rAF).
  const replay = () => {
    const { from, to } = lastRef.current;
    setNoAnim(true);
    setScreen(from);
    setTimeout(() => {
      setNoAnim(false);
      setTimeout(() => setScreen(to), 40);
    }, 80);
  };

  const isTab = device === 'ipad';
  const land = isTab && orient === 'landscape';

  const serviceScreen = isTab ? <TabletService land={land} onSignIn={() => go('educators')} /> : <PhoneService onSignIn={() => go('educators')} />;
  const eduProps = { sort, setSort, query, setQuery, onBack: () => go('service') };
  const educatorScreen = isTab ? <TabletEducators land={land} {...eduProps} /> : <PhoneEducators {...eduProps} />;

  return (
    <div className="harness">
      <div className="stage-row">
        <div className="rail rail-left">
          <p className="rail-title">Device</p>
          <TabToggle
            opts={[{ value: 'phone', label: 'Phone', icon: ICON_PHONE }, { value: 'ipad', label: 'Tablet', icon: ICON_TABLET }]}
            current={device} onChange={setDevice}
          />
          {isTab && (
            <div className="rail-sub">
              <p className="rail-title">Layout</p>
              <TabToggle
                opts={[{ value: 'portrait', label: 'Vertical' }, { value: 'landscape', label: 'Horizontal' }]}
                current={orient} onChange={setOrient}
              />
            </div>
          )}
        </div>

        <div className={'device' + (isTab ? ' is-ipad' : '') + (land ? ' is-landscape' : '')}>
          <div className="device-screen">
            <div className="screen-fill">
              <div ref={stackRef} className={noAnim ? 'ml-noanim' : undefined} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div data-layer="service" className={'ml-layer' + (screen === 'service' ? ' is-active' : '')}>{serviceScreen}</div>
                <div data-layer="educators" className={'ml-layer' + (screen === 'educators' ? ' is-active' : '')}>{educatorScreen}</div>
                <TravelMark pos={mark} kind={screen === 'service' ? 'p' : 'crest'} />
              </div>
            </div>
          </div>
        </div>

        <div className="rail">
          <div className="notes">
            <p className="notes-title">Direction D — recipe</p>
            <ul>
              <li><b>One shared element</b> — the brand mark (P&nbsp;logo&nbsp;⇄&nbsp;school crest) glides between screens and crossfades mid-flight. 560ms, ease-in-out.</li>
              <li><b>Everything else fades through</b> — outgoing fades 200ms; incoming fades in +16px rise, 320ms delayed 120ms. No geometry morphs.</li>
              <li><b>List staggers in</b> after the layer lands.</li>
            </ul>
          </div>
          <div className="notes" style={{ marginTop: 12 }}>
            <p className="notes-title">Dev mapping</p>
            <ul>
              <li><b>iOS</b> — matchedGeometryEffect on the single mark view; screens use standard opacity/offset transitions.</li>
              <li><b>Android</b> — SharedTransitionLayout with one sharedElement modifier.</li>
              <li><b>Fallback</b> — if the shared element fights the nav stack, the mark crossfades in place; the rest is unchanged.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="controls-row">
          <button type="button" className="ds-btn ds-btn--ghost" onClick={replay}>↺ Replay transition</button>
        </div>
        <p className="controls-hint">Sign in / ‹ Log out inside the device drive the transition — Replay re-runs the last one.</p>
      </div>
    </div>
  );
}

window.MotionLabApp = MotionLabApp;
