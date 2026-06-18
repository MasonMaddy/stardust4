/*
 * Playground sign-in — iPad version of the CENTRED CLASSIC direction (portrait, full flow).
 *
 * Standalone first cut in its own /ipad folder so it can be merged back into the phone
 * prototype later. Self-contained: own ICON2 (../assets/icons), iPad-scaled components,
 * the shared Playground PLogo, and the same flow as the phone Centred-classic:
 *   service login → educator selector → PIN → room select → confirm → room hub
 *
 * Demo creds (pre-filled): username LittleBugs · password bugs123 · educator PIN 1234.
 * URL-addressable for capture: ?step=service|educators|pin|rooms|confirm|hub&bare=1
 * Exported as window.IPadApp.
 */

const { useState, useEffect } = React;

const ICON2 = (n) => `../assets/icons/${n}.svg`;
const TEAL = 'var(--sd-colour-action-primary)';
const LINK = 'var(--sd-colour-text-link)';
const DEMO_USER = 'LittleBugs';
const DEMO_PASS = 'bugs123';
const DEMO_PIN = '1234';
const LOGIN_ERR = "We couldn't sign in to that service, please try again. For password reset please contact the service administrator.";

const EDUCATORS = [
  { initials: 'WW', color: 'var(--sd-colour-cyan-600)', name: 'William Walker', role: 'Responsible Educator' },
  { initials: 'MJ', color: 'var(--sd-colour-orange-500)', name: 'Maya Johnson', role: 'Lead Curriculum Designer' },
  { photo: true, name: 'Alex Smith', role: 'Science Coordinator' },
  { initials: 'RL', color: 'var(--sd-colour-purple-500)', name: 'Rina Lee', role: 'Mathematics Facilitator' },
];
const ROOMS = [
  { name: 'Koala Room', subtitle: 'Ages 5–8' },
  { name: 'Gum Tree Room', subtitle: 'Ages 8–10' },
  { name: 'Wattle Room', subtitle: 'Ages 10–12' },
];
const roomSub = (name) => (ROOMS.find((r) => r.name === name) || {}).subtitle || '';

const screen = {
  width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
  fontFamily: 'var(--sd-font-family)', color: 'var(--sd-colour-text-primary)',
  display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--sd-colour-surface-default)',
};

/* Playground app logo (supplied SVG) */
function PLogo({ size = 88, shadow = true }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: shadow ? '0 10px 26px rgba(0,40,34,0.20)' : 'none' }}>
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

/* ── iPad-scaled controls ───────────────────────────────── */
function IField({ label, type = 'text', placeholder, value, onChange, lead, trail, onTrail, invalid, error }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      {label && <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--sd-colour-text-secondary)' }}>{label}</span>}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {lead && <img src={ICON2(lead)} alt="" style={{ position: 'absolute', left: 18, width: 22, height: 22, opacity: 0.5, pointerEvents: 'none' }} />}
        <input
          className="i-input" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          style={{
            boxSizing: 'border-box', width: '100%', height: 58, margin: 0,
            padding: `0 ${trail ? 50 : 18}px 0 ${lead ? 50 : 18}px`,
            fontFamily: 'var(--sd-font-family)', fontSize: 17, fontWeight: 500,
            color: 'var(--sd-colour-text-primary)', background: 'var(--sd-colour-surface-default)',
            border: invalid ? '1.5px solid var(--sd-colour-border-error)' : '1px solid var(--sd-colour-grey-500)',
            borderRadius: 'var(--sd-radius-lg)',
          }}
        />
        {trail && (
          <button type="button" onClick={onTrail} aria-label="Toggle password" style={{ all: 'unset', cursor: 'pointer', position: 'absolute', right: 18, display: 'flex' }}>
            <img src={ICON2(trail)} alt="" style={{ width: 22, height: 22, opacity: 0.5 }} />
          </button>
        )}
      </span>
      {error && (
        <span style={{ display: 'flex', gap: 7, fontSize: 14, lineHeight: 1.45, color: 'var(--sd-colour-feedback-error-default)' }}>
          <img src={ICON2('info-alert')} alt="" style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />{error}
        </span>
      )}
    </label>
  );
}

function IBtn({ children = 'Sign in', disabled, onClick }) {
  return (
    <button type="button" className={disabled ? '' : 'i-btn'} onClick={disabled ? undefined : onClick} style={{
      all: 'unset', boxSizing: 'border-box', width: '100%', height: 58, padding: '0 20px',
      textAlign: 'center', cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--sd-radius-lg)',
      background: disabled ? 'var(--sd-colour-action-disabled)' : TEAL,
      color: disabled ? 'var(--sd-colour-text-disabled)' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

function ILink({ children, align = 'right', onClick }) {
  return (
    <div style={{ textAlign: align }}>
      <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: LINK }}>{children}</button>
    </div>
  );
}

function ITerms() {
  return (
    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--sd-colour-text-secondary)', textAlign: 'center', margin: 0 }}>
      By signing in you agree to our <span style={{ color: LINK, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: LINK, fontWeight: 600 }}>Privacy Policy</span>
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
function ICheckDisc() {
  return (
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src={ICON2('tick')} alt="" style={{ width: 15, height: 15, filter: 'brightness(0) invert(1)' }} />
    </span>
  );
}

/* grid cards (iPad uses 2-up grids for lists) */
function IEduCard({ initials, color, photo, name, role, onClick }) {
  return (
    <button onClick={onClick} className="i-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
      <IEduAvatar e={{ initials, color, photo }} size={50} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sd-colour-text-primary)' }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--sd-colour-text-secondary)' }}>{role}</div>
      </div>
      <img src={ICON2('chevron-right')} alt="" style={{ width: 20, height: 20, opacity: 0.4 }} />
    </button>
  );
}
/* "Add educator profile" — a clean clickable card (no lead icon), "Sign in" link on the right.
   Matches the educator cards beside it (grey-400 border). */
function IAddCard({ onClick }) {
  return (
    <button onClick={onClick} className="i-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: '22px 24px' }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--sd-colour-text-primary)' }}>Add educator profile</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: LINK }}>Sign in</span>
    </button>
  );
}
function IRoomCard({ name, subtitle, selected, onClick }) {
  return (
    <button onClick={onClick} className="i-row" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: selected ? `1.5px solid ${TEAL}` : '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: '18px 22px', transition: 'border-color .2s' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sd-colour-text-primary)' }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--sd-colour-text-secondary)' }}>{subtitle}</div>
      </div>
      {selected ? <ICheckDisc /> : <span style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--sd-colour-grey-500)' }} />}
    </button>
  );
}
function ISummaryRow({ avatar, title, sub, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--sd-colour-grey-400)', borderRadius: 'var(--sd-radius-lg)', padding: '16px 20px' }}>
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sd-colour-text-primary)' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--sd-colour-text-secondary)' }}>{sub}</div>
      </div>
      {action && <button onClick={onAction} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: LINK }}>{action}</button>}
    </div>
  );
}

const IKEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']];
const ikeyStyle = { all: 'unset', cursor: 'pointer', height: 66, borderRadius: 16, background: 'var(--sd-colour-grey-200)', border: '1px solid var(--sd-colour-grey-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
function IKeypad({ onPress, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%' }}>
      {IKEYS.map(([d, l]) => (
        <button key={d} className="i-key" onClick={() => onPress(d)} style={ikeyStyle}>
          <span style={{ fontSize: 27, fontWeight: 600, lineHeight: 1, color: 'var(--sd-colour-text-primary)' }}>{d}</span>
          {l && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--sd-colour-text-secondary)', marginTop: 3 }}>{l}</span>}
        </button>
      ))}
      <span />
      <button className="i-key" onClick={() => onPress('0')} style={ikeyStyle}>
        <span style={{ fontSize: 27, fontWeight: 600, color: 'var(--sd-colour-text-primary)' }}>0</span>
      </button>
      <button onClick={onDelete} aria-label="Delete" style={{ all: 'unset', cursor: 'pointer', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sd-colour-text-secondary)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.2 9.2 L14.8 14.8 M14.8 9.2 L9.2 14.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
function IPinDots({ filled, shake }) {
  return (
    <div className={shake ? 'i-shake' : ''} style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < filled ? TEAL : 'var(--sd-colour-grey-300)', transform: i < filled ? 'scale(1.12)' : 'scale(1)', transition: 'transform .15s, background .15s' }} />
      ))}
    </div>
  );
}

function useCreds() {
  const [username, setUsername] = useState(DEMO_USER);
  const [password, setPassword] = useState(DEMO_PASS);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(false);
  const changeUser = (v) => { setUsername(v); setErr(false); };
  const changePass = (v) => { setPassword(v); setErr(false); };
  const userProps = { placeholder: 'Username', value: username, onChange: changeUser, lead: 'user' };
  const pwProps = { type: showPw ? 'text' : 'password', placeholder: 'Password', value: password, onChange: changePass, trail: showPw ? 'view-hide' : 'view', onTrail: () => setShowPw((s) => !s) };
  const submit = (onOk) => { if (username === DEMO_USER && password === DEMO_PASS) onOk(); else setErr(true); };
  return { userProps, pwProps, ready: !!(username && password), err, submit };
}

/* a vertically + horizontally centred column */
function ICenter({ maxWidth = 440, gap = 24, children }) {
  return (
    <div style={{ ...screen, alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
      <div style={{ width: '100%', maxWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', gap }}>{children}</div>
    </div>
  );
}
function IHeading({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '0 0 8px', color: 'var(--sd-colour-text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 17, lineHeight: 1.45, margin: 0, color: 'var(--sd-colour-text-secondary)' }}>{subtitle}</p>}
    </div>
  );
}
function IBack({ kind, onNav }) {
  return (
    <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 36, left: 40, zIndex: 3, display: 'flex', alignItems: 'center', gap: 3, color: 'var(--sd-colour-text-secondary)', fontSize: 17, fontWeight: 600 }}>
      <span style={{ fontSize: 24, lineHeight: 1, marginTop: -2 }}>‹</span>{kind === 'back' ? 'Back' : 'Log out'}
    </button>
  );
}

/* demo-credentials reference row (right rail) */
function CredRow({ label, value }) {
  return (
    <div className="cred-row">
      <span className="cred-label">{label}</span>
      <span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{value}</span>
    </div>
  );
}

const STEPS = [
  { key: 'service', label: '1 · Sign in' },
  { key: 'educators', label: '2 · Educator' },
  { key: 'pin', label: '3 · PIN' },
  { key: 'rooms', label: '4 · Room' },
  { key: 'confirm', label: '5 · Confirm' },
  { key: 'hub', label: '6 · Hub' },
];

/* ── App ───────────────────────────────────────────────── */
function IPadApp() {
  const _p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const _s0 = _p.get('step') || 'service';
  const _needEdu = ['pin', 'rooms', 'confirm', 'hub'].includes(_s0);
  const _needRoom = ['confirm', 'hub'].includes(_s0);
  const _o0 = _p.get('orient') === 'landscape' ? 'landscape' : 'portrait';

  const [step, setStep] = useState(_s0);
  const [orientation, setOrientation] = useState(_o0);
  const [educator, setEducator] = useState(_needEdu ? EDUCATORS[0] : null);
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [room, setRoom] = useState(_needRoom ? ROOMS[0].name : null);
  const [addEmail, setAddEmail] = useState('');
  const [addPin, setAddPin] = useState('');
  const [showAddPin, setShowAddPin] = useState(false);
  const creds = useCreds(); // service login username/password (pre-filled)

  const reset = () => { setStep('service'); setEducator(null); setPin(''); setAttempts(0); setRoom(null); setAddEmail(''); setAddPin(''); };
  const goStep = (t) => {
    if (t !== 'service' && !educator) setEducator(EDUCATORS[0]);
    if ((t === 'confirm' || t === 'hub') && !room) setRoom(ROOMS[0].name);
    if (t === 'pin') { setPin(''); setAttempts(0); }
    setStep(t);
  };

  useEffect(() => {
    if (pin.length < 4) return;
    const ok = pin === DEMO_PIN;
    const t = setTimeout(() => {
      if (ok) { setStep('rooms'); setPin(''); setAttempts(0); }
      else { setAttempts((a) => a + 1); setShake(true); setTimeout(() => setShake(false), 450); setPin(''); }
    }, 220);
    return () => clearTimeout(t);
  }, [pin]);

  const ed = educator || EDUCATORS[0];
  const rn = room || ROOMS[0].name;
  const land = orientation === 'landscape';
  let scr;

  if (step === 'service') {
    const { userProps, pwProps, ready, err, submit } = creds;
    scr = (
      <ICenter maxWidth={430} gap={26}>
        <PLogo size={88} />
        <IHeading title="Sign in to Playground" subtitle="Sign in to your service to get started." />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
          <IField label="Service username" {...userProps} invalid={err} />
          <IField label="Service password" {...pwProps} invalid={err} error={err ? LOGIN_ERR : null} />
          <ILink align="right">Forgot password?</ILink>
          <IBtn disabled={!ready} onClick={() => submit(() => setStep('educators'))} />
          <ITerms />
        </div>
      </ICenter>
    );
  } else if (step === 'educators') {
    scr = (
      <div style={{ ...screen, padding: '88px 64px 56px' }}>
        <IBack kind="logout" onNav={reset} />
        <IHeading title="Select your educator" subtitle="Choose your profile to continue" />
        <div style={{ display: 'grid', gridTemplateColumns: land ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 18, maxWidth: land ? 1000 : 720, width: '100%', margin: '40px auto 0' }}>
          <IAddCard onClick={() => { setAddEmail(''); setAddPin(''); setStep('addEducator'); }} />
          {EDUCATORS.map((e, i) => <IEduCard key={i} {...e} onClick={() => { setEducator(e); setPin(''); setAttempts(0); setStep('pin'); }} />)}
        </div>
      </div>
    );
  } else if (step === 'addEducator') {
    const ready2 = addEmail && addPin;
    scr = (
      <div style={{ ...screen, alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <IBack kind="back" onNav={() => setStep('educators')} />
        <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <PLogo size={76} />
          <IHeading title="Add Educator Profile" subtitle="Please sign into your Educator Profile" />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
            <IField label="Educator email or phone" placeholder="Email or phone number" value={addEmail} onChange={setAddEmail} />
            <IField label="Password or access PIN" type={showAddPin ? 'text' : 'password'} placeholder="Password or Pin" value={addPin} onChange={setAddPin} trail={showAddPin ? 'view-hide' : 'view'} onTrail={() => setShowAddPin((s) => !s)} />
            <ITerms />
            <IBtn disabled={!ready2} onClick={() => { setEducator({ initials: 'NE', color: 'var(--sd-colour-cyan-600)', name: 'New educator', role: 'Educator' }); setAddEmail(''); setAddPin(''); setStep('rooms'); }}>Sign in</IBtn>
          </div>
        </div>
      </div>
    );
  } else if (step === 'pin') {
    const first = ed.name.split(' ')[0];
    scr = (
      <div style={{ ...screen, alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <IBack kind="back" onNav={() => { setPin(''); setStep('educators'); }} />
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <PLogo size={80} />
          <IHeading title={`Hi ${first}`} subtitle="Enter your PIN to continue" />
          <IPinDots filled={pin.length} shake={shake} />
          {attempts > 0 && <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sd-colour-feedback-error-default)', margin: 0 }}>Incorrect PIN — try again</p>}
          <IKeypad onPress={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onDelete={() => setPin((p) => p.slice(0, -1))} />
        </div>
      </div>
    );
  } else if (step === 'rooms') {
    scr = (
      <div style={{ ...screen, padding: '88px 64px 48px' }}>
        <IBack kind="back" onNav={() => setStep('educators')} />
        <IHeading title="Select your room" subtitle="Where are you working today?" />
        <div style={{ display: 'grid', gridTemplateColumns: land ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 18, maxWidth: land ? 1000 : 720, width: '100%', margin: '40px auto 0' }}>
          {ROOMS.map((r) => <IRoomCard key={r.name} {...r} selected={room === r.name} onClick={() => setRoom(r.name)} />)}
        </div>
        <div style={{ maxWidth: 430, width: '100%', margin: '36px auto 0' }}>
          <IBtn disabled={!room} onClick={() => setStep('confirm')}>{room ? `Continue to ${room}` : 'Select a room'}</IBtn>
        </div>
      </div>
    );
  } else if (step === 'confirm') {
    scr = (
      <div style={{ ...screen, alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <IBack kind="back" onNav={() => setStep('rooms')} />
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ textAlign: 'center', marginBottom: 6 }}><IHeading title="Ready to go" subtitle="Confirm and enter your room" /></div>
          <ISummaryRow avatar={<IEduAvatar e={ed} size={50} />} title={ed.name} sub={ed.role} action="Change" onAction={() => setStep('educators')} />
          <ISummaryRow avatar={<IRoomAvatar name={rn} size={50} />} title={rn} sub={roomSub(rn)} action="Change" onAction={() => setStep('rooms')} />
          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--sd-colour-text-secondary)', textAlign: 'center', margin: '2px 0 4px' }}>We'll remember this room for today.</p>
          <IBtn onClick={() => setStep('hub')}>Enter {rn}</IBtn>
        </div>
      </div>
    );
  } else {
    // hub
    scr = (
      <div style={{ ...screen, background: 'var(--sd-colour-grey-100)' }}>
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
                <div className="i-skeleton" style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div className="i-skeleton" style={{ height: 13, width: `${66 - i * 5}%`, borderRadius: 7 }} />
                  <div className="i-skeleton" style={{ height: 11, width: `${44 - i * 3}%`, borderRadius: 7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px 48px 40px', background: 'var(--sd-colour-surface-default)', borderTop: '1px solid var(--sd-colour-grey-300)', display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
          <button onClick={() => setStep('rooms')} className="i-btn" style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 28px', borderRadius: 'var(--sd-radius-lg)', border: `1.5px solid ${TEAL}`, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>Change room</button>
          <button onClick={reset} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 54, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>Log out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="harness">
      <div className="stage-row">
        <aside className="rail rail-left">
          <div className="rail-title">Layout</div>
          {[['portrait', 'Vertical'], ['landscape', 'Horizontal']].map(([key, label]) => {
            const sel = orientation === key;
            return (
              <div key={key} className="ds-card ds-card--selectable ds-card--compact" role="radio" aria-checked={sel} tabIndex={sel ? 0 : -1} onClick={() => setOrientation(key)}>
                <div className="ds-title-block"><div className="ds-title-block__content"><p className="ds-title-block__title ds-title-block__title--medium">{label}</p></div></div>
                <span className="ds-card__trailing"><span className={'ds-radio ' + (sel ? 'ds-radio--selected' : 'ds-radio--unchecked')} aria-hidden="true"><svg className="ds-radio__svg" viewBox="0 0 20 20" fill="none"><circle className="ds-radio__ring" cx="10" cy="10" r="8" strokeWidth="2" /><circle className="ds-radio__dot" cx="10" cy="10" r="4.5" /></svg></span></span>
              </div>
            );
          })}
        </aside>
        <div className={'device' + (land ? ' is-landscape' : '')}><div className="device-screen"><div key={step} className="i-rise screen-fill">{scr}</div></div></div>
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
          {STEPS.map((s) => (
            <button key={s.key} className={'ds-selection-pill' + (step === s.key ? ' ds-selection-pill--selected' : '')} onClick={() => goStep(s.key)}>
              <span className="ds-selection-pill__label">{s.label}</span>
            </button>
          ))}
        </div>
        <button className="ds-btn ds-btn--ghost" onClick={reset}>↺ Restart flow</button>
      </div>
    </div>
  );
}

window.IPadApp = IPadApp;
