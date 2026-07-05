/*
 * Xplor Hub login flow — landscape-tablet kiosk prototype. Exports window.FlowApp.
 * Built from Figma "Xplor ID Login Flow" (Q4Z4F9j0gmauSlziaUabej). One direction, light theme.
 *
 * Chrome: 4px teal top strip · eyebrow (back-link or service label) · 48px title · account avatar.
 * Three journeys (bottom launchers): Parent/contact attendance · Educator shift · Visitor log.
 * Left rail jumps straight to any of the 8 screens (incl. the two empty/error states).
 */

const SERVICE_NAME = 'Little Bugs ELC';
/* Obviously-fake demo credentials only (public repo) — example.com is RFC-2606 reserved */
const DEMO = { email: 'jessica.c@example.com', password: 'demo-1234' };

/* ── People / data (demo) ── */
/* No external avatar service — PhotoImg renders its initials tile when src is null */
const PHOTO = () => null;
const ROLES = [
  { key: 'parent', name: 'Parent', sub: 'Jessica Jones · James May', tag: 'Casual Session', photo: PHOTO(5) },
  { key: 'contact', name: 'Collection Contact', sub: 'Samuel Weinhandl', tag: 'Casual Session', photo: PHOTO(12) },
];
const CHILDREN_BOOKED = [
  { name: 'Jessica Jones', time: '12.00pm – 2.00pm', tag: 'Booked Session', photo: PHOTO(5) },
  { name: 'James May', time: '12.00pm – 2.00pm', tag: 'Booked Session', photo: PHOTO(13) },
];
const CHILDREN_NOBOOK = [
  { name: 'Tina Tuna', time: '12.00pm – 2.00pm', tag: 'Casual Session', photo: PHOTO(9) },
];
const VISITORS = [
  { name: 'William Walker', initials: 'WW', at: '12:54 PM' },
  { name: 'Sussan Boale', initials: 'SB', at: '12:54 PM' },
  { name: 'James David', initials: 'JD', at: '12:54 PM' },
];

/* every screen the left rail can jump to */
const SCREENS = [
  { step: 'dashboard', label: 'Dashboard', scenario: 'parent' },
  { step: 'signin', label: 'Sign in', scenario: 'parent' },
  { step: 'role', label: 'Role select', scenario: 'parent' },
  { step: 'child', label: 'Child select', scenario: 'parent' },
  { step: 'educator', label: 'Educator — start shift', scenario: 'educator' },
  { step: 'educator-noshift', label: 'Educator — no shift', scenario: 'educator' },
  { step: 'visitor', label: 'Visitor log', scenario: 'visitor' },
  { step: 'newvisitor', label: 'New visitor', scenario: 'visitor' },
];

/* bottom ghost launchers — one per journey, each starts at the Dashboard */
const SCENARIOS = [
  { key: 'parent', label: 'Parent / contact', start: 'dashboard' },
  { key: 'educator', label: 'Educator shift', start: 'dashboard' },
  { key: 'visitor', label: 'Visitor log', start: 'dashboard' },
];

/* ── The single Hub shell — chrome shared by every screen ── */
function HubShell({ eyebrow, back, onBack, title, center, children }) {
  return (
    <div style={screenBase}>
      <div style={{ height: 4, background: TEAL, flexShrink: 0 }} />
      <div style={{ padding: '56px 80px 8px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          {back
            ? <button type="button" onClick={onBack} className="fp-link" style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2, color: LINK, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{Icon.chevronLeft(18)} {back}</button>
            : <div style={{ color: LINK, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{eyebrow}</div>}
          <h1 style={{ fontSize: 48, lineHeight: '56px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: INK }}>{title}</h1>
        </div>
        <Avatar />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 80px 40px', display: 'flex', flexDirection: 'column', ...(center ? { justifyContent: 'center' } : {}) }}>
        {children}
      </div>
    </div>
  );
}

/* ── Composite rows/cards ── */
/* the big tappable action cards (Sign in with email, Visitor log, New visitor, End/Resume shift) */
function ActionCard({ icon, tileBg = CYAN_50, tileFg = TEAL, title, sub, onClick, trailing, style }) {
  return (
    <button type="button" onClick={onClick} className="fp-row" style={{
      all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 20,
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 'var(--sd-radius-lg)', padding: '20px 24px', ...style,
    }}>
      <span style={{ width: 64, height: 64, borderRadius: 'var(--sd-radius-lg)', background: tileBg, color: tileFg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 22, fontWeight: 600, color: TEAL }}>{title}</span>
        {sub && <span style={{ display: 'block', fontSize: 15, color: SUB, marginTop: 2 }}>{sub}</span>}
      </span>
      <span style={{ color: SUB, display: 'flex', flexShrink: 0 }}>{trailing !== undefined ? trailing : Icon.chevronRight(25)}</span>
    </button>
  );
}

/* role / child selection card (avatar photo + name + sub + pill + trailing) */
function PersonCard({ photo, name, sub, tag, tagTone = 'cyan', trailing, onClick }) {
  // a <div> (not <button>) so an interactive trailing link (Sign In) can nest legally
  return (
    <div onClick={onClick} className={onClick ? 'fp-row' : undefined} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} style={{
      cursor: onClick ? 'pointer' : 'default', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 16,
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 'var(--sd-radius-lg)', padding: 20,
    }}>
      <PhotoImg src={photo} name={name} size={64} radius={12} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: INK }}>{name}</div>
        {sub && <div style={{ fontSize: 15, color: SUB, margin: '2px 0 6px' }}>{sub}</div>}
        <Pill tone={tagTone}>{tag}</Pill>
      </div>
      <span style={{ color: TEAL, display: 'flex', flexShrink: 0, alignItems: 'center' }}>{trailing}</span>
    </div>
  );
}

/* visitor row (initials avatar + name + signed-in time + Sign out) */
function VisitorRow({ v, onSignOut }) {
  return (
    <div style={{ boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 16, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 'var(--sd-radius-lg)', padding: '18px 24px' }}>
      <span style={{ width: 48, height: 48, borderRadius: 'var(--sd-radius-m)', background: CYAN_50, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{v.initials}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: INK }}>{v.name}</span>
        <span style={{ display: 'block', fontSize: 14, color: SUB }}>Signed in {v.at}</span>
      </span>
      <TextLink onClick={onSignOut}>Sign out</TextLink>
    </div>
  );
}

/* ── Login card (sign-in screen) ── */
function LoginCard({ ctx }) {
  const { email, setEmail, password, setPassword, err, loading, doLogin } = ctx;
  const [show, setShow] = useState(false);
  return (
    <Panel pad={40} style={{ width: 464, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', color: INK, marginBottom: 6 }}>XPLOR</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: INK, marginBottom: 22 }}>Little Bugs Login</div>
      <div style={{ textAlign: 'right', marginBottom: 4 }}><TextLink style={{ fontSize: 14 }}>Forgot email?</TextLink></div>
      <Field label="Email" placeholder="you@service.edu.au" value={email} onChange={setEmail} invalid={err && !email} style={{ marginBottom: 8 }} />
      <div style={{ textAlign: 'right', marginBottom: 4 }}><TextLink style={{ fontSize: 14 }}>Forgot password?</TextLink></div>
      <Field label="Password" type={show ? 'text' : 'password'} placeholder="Password" value={password} onChange={setPassword} invalid={err && !password}
        trailing={<button type="button" onClick={() => setShow((s) => !s)} style={{ all: 'unset', cursor: 'pointer', color: err && !password ? DANGER : TEAL, display: 'flex' }}>{show ? Icon.eyeOff() : Icon.eye()}</button>} />
      {err && <div style={{ color: DANGER, fontSize: 14, fontWeight: 500, margin: '12px 0 0' }}>{err}</div>}
      <Btn loading={loading} onClick={doLogin} style={{ margin: '20px 0 16px' }}>Login</Btn>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: SUB, textAlign: 'center', margin: 0 }}>
        Your centre username is also used to login to Playground and can be found under Service Settings on Xplor Office.
      </p>
    </Panel>
  );
}

/* ── One shared step builder — returns the chrome props + body for each screen ── */
function buildStep(step, ctx) {
  const { scenario, go, back, signInChild } = ctx;

  if (step === 'dashboard') {
    return {
      eyebrow: SERVICE_NAME, title: 'Good Morning', center: true,
      children: (
        <Panel pad={32} style={{ maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', gap: 28, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <QRCode size={196} />
            <div style={{ color: TEAL, fontWeight: 700, fontSize: 17 }}>Scan with Xplor Home</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <ActionCard icon={Icon.login(26)} title="Sign in with email" sub="Parents and educators" onClick={() => go('signin')} />
            <ActionCard icon={Icon.plus(28)} title="Visitor log" sub="Sign your name in or out" onClick={() => go('visitor', 'visitor')} />
          </div>
        </Panel>
      ),
    };
  }

  if (step === 'signin') {
    return { back: 'Dashboard', onBack: () => go('dashboard'), title: 'Good Morning', center: true, children: <LoginCard ctx={ctx} /> };
  }

  if (step === 'role') {
    return {
      back: 'Dashboard', onBack: () => go('dashboard'), title: 'Attendance',
      children: (<>
        <SectionLabel>Role select</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {ROLES.map((r) => <PersonCard key={r.key} photo={r.photo} name={r.name} sub={r.sub} tag={r.tag} trailing={Icon.chevronRight(25)} onClick={() => go('child')} />)}
        </div>
      </>),
    };
  }

  if (step === 'child') {
    return {
      back: 'Dashboard', onBack: () => go('role'), title: 'Attendance',
      children: (<>
        <SectionLabel>Bookings today</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {CHILDREN_BOOKED.map((c) => <PersonCard key={c.name} photo={c.photo} name={c.name} sub={c.time} tag={c.tag} trailing={<TextLink onClick={(e) => { e.stopPropagation(); signInChild(c.name); }}>Sign In</TextLink>} />)}
        </div>
        <SectionLabel>No bookings</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {CHILDREN_NOBOOK.map((c) => <PersonCard key={c.name} photo={c.photo} name={c.name} sub={c.time} tag={c.tag} tagTone="orange" trailing={<TextLink onClick={(e) => { e.stopPropagation(); signInChild(c.name); }}>Casual Session</TextLink>} />)}
        </div>
      </>),
    };
  }

  if (step === 'educator') {
    return {
      back: 'Dashboard', onBack: () => go('dashboard'), title: 'Welcome Educator', center: true,
      children: (
        <Panel pad={40} style={{ maxWidth: 810, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', color: SUB, fontSize: 20, marginBottom: 2 }}>Friday, 1 May</div>
          <div style={{ textAlign: 'center', color: TEAL, fontSize: 40, fontWeight: 700, marginBottom: 24 }}>10:48 AM</div>
          <ShiftBar />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 30 }}>
            <ActionCard icon={Icon.stop(30)} tileBg="var(--sd-colour-surface-orange)" tileFg={DANGER} title="End Shift" sub="+All day" onClick={() => go('dashboard')} />
            <ActionCard icon={Icon.play(30)} tileBg={TEAL} tileFg="#fff" title="Resume Shift" sub="7h 12m till end of shift" onClick={() => go('dashboard')} />
          </div>
        </Panel>
      ),
    };
  }

  if (step === 'educator-noshift') {
    return {
      back: 'Dashboard', onBack: () => go('dashboard'), title: 'Welcome Educator', center: true,
      children: (
        <Panel pad={48} style={{ width: 464, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: INK, marginBottom: 28 }}>No shifts to begin</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <svg width="120" height="96" viewBox="0 0 120 96" fill="none">
              <rect x="8" y="8" width="104" height="80" rx="14" fill="var(--sd-colour-grey-200)" stroke="var(--sd-colour-grey-1000)" strokeWidth="4" />
              <circle cx="40" cy="40" r="12" fill="var(--sd-colour-orange-100)" />
              <path d="M24 70c0-9 7.2-16 16-16s16 7 16 16z" fill="var(--sd-colour-cyan-500)" />
              <rect x="66" y="30" width="34" height="5" rx="2.5" fill="var(--sd-colour-grey-600)" />
              <rect x="66" y="44" width="34" height="5" rx="2.5" fill="var(--sd-colour-grey-600)" />
              <rect x="66" y="58" width="22" height="5" rx="2.5" fill="var(--sd-colour-grey-600)" />
            </svg>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: SUB, margin: 0 }}>To start a shift, make sure your centre administrator has one configured in the rostering.</p>
        </Panel>
      ),
    };
  }

  if (step === 'visitor') {
    return {
      back: 'Dashboard', onBack: () => go('dashboard'), title: 'Visitor Log',
      children: (<>
        <ActionCard icon={Icon.plus(30)} tileBg={TEAL} tileFg="#fff" title="Sign in" sub="New visitor" onClick={() => go('newvisitor')} style={{ marginBottom: 28 }} />
        <SectionLabel>Afternoon</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ctx.visitors.map((v) => <VisitorRow key={v.name} v={v} onSignOut={() => ctx.signOutVisitor(v.name)} />)}
        </div>
      </>),
    };
  }

  // newvisitor
  return {
    back: 'Dashboard', onBack: () => go('visitor'), title: 'New Visitor',
    children: (
      <Panel pad={40} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="First Name" placeholder="Please enter first name" value={ctx.nv.first} onChange={(v) => ctx.setNv({ ...ctx.nv, first: v })} />
          <Field label="Last Name" placeholder="Please enter last name" value={ctx.nv.last} onChange={(v) => ctx.setNv({ ...ctx.nv, last: v })} />
        </div>
        <Field label="Phone Number" placeholder="Please enter phone number" value={ctx.nv.phone} onChange={(v) => ctx.setNv({ ...ctx.nv, phone: v })} />
        <Field label="Address" placeholder="Where you live?" value={ctx.nv.address} onChange={(v) => ctx.setNv({ ...ctx.nv, address: v })} />
        <Field label="Reason for Visit" placeholder="Why you here?" textarea value={ctx.nv.reason} onChange={(v) => ctx.setNv({ ...ctx.nv, reason: v })} />
        <Btn onClick={() => go('visitor')} loadingLabel="Signing in…">Sign in</Btn>
      </Panel>
    ),
  };
}

/* QR placeholder (decorative) */
function QRCode({ size = 196 }) {
  const cells = 11, gap = size / cells;
  const on = (x, y) => {
    if ((x < 3 && y < 3) || (x > cells - 4 && y < 3) || (x < 3 && y > cells - 4)) return (x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1)) ? 1 : ((x >= cells - 3 && (x === cells - 3 || x === cells - 1)) ? 1 : 0);
    return ((x * 7 + y * 13 + x * y) % 3 === 0) ? 1 : 0;
  };
  const rects = [];
  for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) if (on(x, y)) rects.push(<rect key={x + '-' + y} x={x * gap} y={y * gap} width={gap} height={gap} fill={TEAL} />);
  return <div style={{ background: '#fff', borderRadius: 12, padding: 10 }}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{rects}</svg></div>;
}

/* educator shift progress bar (6am → 6pm, ~40% elapsed) */
function ShiftBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontSize: 15, color: SUB, flexShrink: 0 }}>6:00am</span>
      <div style={{ flex: 1, height: 11, borderRadius: 999, background: 'var(--sd-colour-grey-300)', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', borderRadius: 999, background: TEAL }} />
        <div style={{ position: 'absolute', left: '40%', top: '50%', width: 15, height: 15, borderRadius: '50%', background: '#fff', border: `3px solid ${TEAL}`, transform: 'translate(-50%,-50%)' }} />
      </div>
      <span style={{ fontSize: 15, color: SUB, flexShrink: 0 }}>6:00pm</span>
    </div>
  );
}

/* ── Launch splash — replays on scenario launch; skipped in ?bare=1 ── */
function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 550);
    const t2 = setTimeout(onDone, 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="fp-splash" style={{ position: 'absolute', inset: 0, zIndex: 20, background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: leaving ? 0 : 1 }}>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.28em', color: INK }}>XPLOR</div>
      <Spinner size={26} color={TEAL} />
      <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: SUB }}>Getting things ready…</p>
    </div>
  );
}

/* ── Harness ── */
function FlowApp() {
  const _p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const _s0 = _p.get('step') || 'dashboard';
  const _bare = !!_p.get('bare');
  const _scOf = (SCREENS.find((s) => s.step === _s0) || {}).scenario || 'parent';

  const [scenario, setScenario] = useState(_scOf);
  const [step, setStep] = useState(_s0);
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [nv, setNv] = useState({ first: '', last: '', phone: '', address: '', reason: '' });
  const [visitors, setVisitors] = useState(VISITORS);
  const [toast, setToast] = useState(null);
  const [splash, setSplash] = useState(!_bare && _s0 === 'dashboard');
  const [splashId, setSplashId] = useState(0);

  const launch = () => { if (_bare) return; setSplashId((n) => n + 1); setSplash(true); };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1600); };

  const go = (next, sc) => { if (sc) setScenario(sc); setErr(null); setStep(next); setNonce((n) => n + 1); };
  const goScenario = (sc) => {
    setScenario(sc); setErr(null); setLoading(false); setEmail(DEMO.email); setPassword(DEMO.password);
    setNv({ first: '', last: '', phone: '', address: '', reason: '' }); setVisitors(VISITORS);
    setStep('dashboard'); setNonce((n) => n + 1); launch();
  };
  const jumpTo = (sc) => { setScenario(sc.scenario); setErr(null); setStep(sc.step); setNonce((n) => n + 1); };

  const doLogin = () => {
    if (!email || !password) { setErr('Required'); return; }
    setErr(null); setLoading(true);
    setTimeout(() => { setLoading(false); go(scenario === 'educator' ? 'educator' : 'role'); }, 1000);
  };
  const signInChild = (name) => flash(`${name} signed in`);
  const signOutVisitor = (name) => { setVisitors((vs) => vs.filter((v) => v.name !== name)); flash(`${name} signed out`); };

  const ctx = { scenario, go, email, setEmail, password, setPassword, err, loading, doLogin, signInChild, visitors, signOutVisitor, nv, setNv };
  const screen = <HubShell {...buildStep(step, ctx)} />;

  return (
    <div className="harness">
      <div className="stage-row">
        <aside className="rail rail-left">
          <div className="rail-title">Jump to screen</div>
          <div className="jump-list">
            {SCREENS.map((s) => (
              <button key={s.step} type="button" className={'jump-item' + (step === s.step ? ' jump-item--active' : '')} onClick={() => jumpTo(s)}>{s.label}</button>
            ))}
          </div>
        </aside>

        <div className="device is-hub">
          <div className="device-screen">
            <div key={`${step}-${nonce}`} className="screen-rise screen-fill">{screen}</div>
            {toast && <div className="hub-toast">{toast}</div>}
            {splash && <Splash key={`splash-${splashId}`} onDone={() => setSplash(false)} />}
          </div>
        </div>

        <aside className="rail rail-right">
          <div className="rail-title">Reference</div>
          <div className="creds">
            <div className="creds-title">Demo login</div>
            <div className="cred-row"><span className="cred-label">Email</span><span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{DEMO.email}</span></div>
            <div className="cred-row"><span className="cred-label">Password</span><span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{DEMO.password}</span></div>
            <p className="creds-note">Pre-filled — just tap <b>Login</b>. Clear a field to see the <b>Required</b> error.</p>
          </div>
        </aside>
      </div>

      <div className="controls">
        <div className="scenario-buttons">
          {SCENARIOS.map((s) => (
            <button key={s.key} type="button" className={'ds-btn ds-btn--ghost' + (scenario === s.key ? ' is-current' : '')} onClick={() => goScenario(s.key)}>{s.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.FlowApp = FlowApp;
