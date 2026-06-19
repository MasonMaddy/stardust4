/*
 * Flow prototype harness (TEMPLATE) — exports window.FlowApp.
 *
 * Replace the example flow (login → select → done) and the two example DIRECTIONS with the real
 * flow. The patterns to keep: VARIANT_META + shells, one shared buildStep(), the scenario state
 * machine + goScenario(), the launch splash, and the ?v=&step=&device=&orient=&bare=1 capture params.
 * Wired to real --sd-* tokens; harness chrome uses real ds-* component CSS (see index.html).
 */

const SERVICE_NAME = 'Demo Service';
const DEMO = { username: 'demo.user', password: 'demo123' };

// ── Directions: visual treatments of the SAME flow. kind: panel | hero (extend: card | immersive) ──
const DIRECTIONS = [
  { n: 1, short: 'Centred' },
  { n: 2, short: 'Hero' },
];
const VARIANT_META = {
  1: { kind: 'panel', align: 'center', bg: 'var(--sd-colour-surface-default)' },
  2: { kind: 'hero', heroH: 280 },
  // example of a full-bleed dark direction: { kind: 'immersive', dark: true }
};

// ── Scenarios: each bottom ghost button launches a flow from its start screen ──
const SCENARIOS = [
  { key: 'full', label: 'New sign-in', start: 'login' },
  { key: 'returning', label: 'Returning', start: 'select' },
];

const ITEMS = [
  { name: 'Option A', sub: 'First choice' },
  { name: 'Option B', sub: 'Second choice' },
  { name: 'Option C', sub: 'Third choice' },
];

/* ── Shells: one per direction kind. `center` vertically centres the brand+header+content group. ── */
function Emblem({ size = 52 }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, var(--sd-colour-cyan-400), var(--sd-colour-cyan-700))', flexShrink: 0 }} />;
}
function Nav({ kind, onNav, light }) {
  if (!kind) return null;
  return (
    <>
      <button onClick={onNav} style={{ all: 'unset', cursor: 'pointer', position: 'absolute', top: 20, left: 20, zIndex: 3, fontSize: 15, fontWeight: 600, color: light ? '#fff' : 'var(--sd-colour-text-secondary)' }}>
        ‹ {kind === 'back' ? 'Back' : 'Log out'}
      </button>
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', zIndex: 2, fontSize: 15, fontWeight: 700, color: light ? '#fff' : 'var(--sd-colour-text-primary)', pointerEvents: 'none' }}>{SERVICE_NAME}</div>
    </>
  );
}
function Header({ title, subtitle, align, light }) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ textAlign: align, width: '100%' }}>
      {title && <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 5px', letterSpacing: '-0.01em', color: light ? '#fff' : 'var(--sd-colour-text-primary)' }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: 15, margin: 0, lineHeight: 1.4, color: light ? 'var(--sd-colour-cyan-100)' : 'var(--sd-colour-text-secondary)' }}>{subtitle}</p>}
    </div>
  );
}

function PanelShell({ meta, title, subtitle, nav, onNav, children, footer, center }) {
  const c = meta.align === 'center';
  const body = (
    <>
      <div style={{ display: 'flex', justifyContent: c ? 'center' : 'flex-start', width: '100%' }}><Emblem /></div>
      <Header title={title} subtitle={subtitle} align={c ? 'center' : 'left'} />
      <div style={{ ...(center ? {} : { flex: 1, minHeight: 0, overflowY: 'auto' }), width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </>
  );
  return (
    <div style={{ ...screenBase, background: meta.bg, padding: '64px 26px 24px' }}>
      <Nav kind={nav} onNav={onNav} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'stretch', gap: 16, flex: 1, minHeight: 0 }}>
        {center ? <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'stretch', justifyContent: 'center', gap: 16, width: '100%' }}>{body}</div> : body}
        {footer && <div style={{ width: '100%' }}>{footer}</div>}
      </div>
    </div>
  );
}

function HeroShell({ meta, title, subtitle, nav, onNav, children, footer, center }) {
  const heroH = meta.heroH || 260;
  return (
    <div style={{ ...screenBase, background: HERO_GRAD }}>
      <div style={{ height: heroH, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', flexShrink: 0, padding: '0 28px' }}>
        <Nav kind={nav} onNav={onNav} light />
        <Emblem size={56} />
        <Header title={title} subtitle={subtitle} align="center" light />
      </div>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--sd-colour-surface-default)', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: -22, position: 'relative', zIndex: 2, boxShadow: '0 -10px 36px rgba(0,40,34,0.3)' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, ...(center ? { justifyContent: 'center' } : {}) }}>{children}</div>
        {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

function Shell(props) {
  if (props.meta.kind === 'hero') return <HeroShell {...props} />;
  return <PanelShell {...props} />;
}

/* ── One shared step-content builder — themed by whichever shell renders it ── */
function buildStep(step, ctx) {
  const { scenario, selected, loading, dark, username, setUsername, setSelected, signIn, selectContinue, setStep, resetFlow } = ctx;
  if (step === 'login') {
    return {
      title: 'Welcome', subtitle: 'Sign in to your service', nav: null, onNav: null,
      children: <Field label="Username" placeholder="Username" value={username} onChange={setUsername} dark={dark} />,
      footer: <Btn dark={dark} loading={loading} loadingLabel="Signing in…" onClick={signIn}>Sign in</Btn>,
    };
  }
  if (step === 'select') {
    return {
      title: 'Choose an option', subtitle: 'Pick where to go', nav: 'back', onNav: () => setStep(scenario === 'returning' ? 'login' : 'login'),
      children: ITEMS.map((it) => <Row key={it.name} title={it.name} sub={it.sub} dark={dark} selected={selected === it.name} onClick={() => setSelected(it.name)} />),
      footer: <Btn dark={dark} disabled={!selected} onClick={selectContinue}>{selected ? `Continue to ${selected}` : 'Select an option'}</Btn>,
    };
  }
  // done
  return {
    title: 'All set', subtitle: `You're in${selected ? ` — ${selected}` : ''}`, nav: 'back', onNav: () => setStep('select'), center: true,
    children: <Row title={selected || ITEMS[0].name} sub="Confirmed" selected dark={dark} onClick={() => {}} />,
    footer: <Btn dark={dark} onClick={resetFlow}>Finish</Btn>,
  };
}

/* ── Launch splash — replays on scenario launch / direction switch; skipped in ?bare=1 ── */
function Splash({ dark, onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 600);
    const t2 = setTimeout(onDone, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="fp-splash" style={{ position: 'absolute', inset: 0, zIndex: 20, background: dark ? IMMERSIVE : 'var(--sd-colour-surface-default)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: leaving ? 0 : 1 }}>
      <Emblem size={72} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Spinner size={24} color={dark ? 'rgba(255,255,255,0.9)' : TEAL} />
        <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: dark ? 'var(--sd-colour-cyan-100)' : 'var(--sd-colour-text-secondary)' }}>Getting things ready…</p>
      </div>
    </div>
  );
}

/* ── Harness ── */
function FlowApp() {
  const _p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const _v0 = Math.min(DIRECTIONS.length, Math.max(1, parseInt(_p.get('v'), 10) || 1));
  const _s0 = _p.get('step') || 'login';
  const _bare = !!_p.get('bare');
  const _dev0 = _p.get('device') === 'ipad' ? 'ipad' : 'phone';
  const _o0 = _p.get('orient') === 'landscape' ? 'landscape' : 'portrait';

  const [variant, setVariant] = useState(_v0);
  const [device, setDevice] = useState(_dev0);
  const [orientation, setOrientation] = useState(_o0);
  const [scenario, setScenario] = useState('full');
  const [step, setStep] = useState(_s0);
  const [username, setUsername] = useState(DEMO.username);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [splash, setSplash] = useState(!_bare && _s0 === 'login');
  const [splashId, setSplashId] = useState(0);

  const meta = VARIANT_META[variant];
  const dark = !!meta.dark;
  const isIpad = device === 'ipad';
  const land = orientation === 'landscape';

  const launch = () => { if (_bare) return; setSplashId((n) => n + 1); setSplash(true); };
  const goScenario = (sc) => {
    const def = SCENARIOS.find((s) => s.key === sc) || SCENARIOS[0];
    setScenario(sc); setSelected(null); setLoading(false); setUsername(DEMO.username);
    setStep(def.start); setNonce((n) => n + 1); launch();
  };
  const resetFlow = () => goScenario('full');
  const pickVariant = (n) => { setVariant(n); goScenario(scenario); };

  const signIn = () => { setLoading(true); setTimeout(() => { setLoading(false); setStep('select'); }, 1000); };
  const selectContinue = () => setStep('done');

  const ctx = { scenario, selected, loading, dark, username, setUsername, setSelected, signIn, selectContinue, setStep, resetFlow };
  const screen = <Shell meta={meta} {...buildStep(step, ctx)} />;

  const railCard = (key, label, sel, on) => (
    <div key={key} className="ds-card ds-card--selectable ds-card--compact" role="radio" aria-checked={sel} tabIndex={sel ? 0 : -1} onClick={on}>
      <div className="ds-title-block"><div className="ds-title-block__content"><p className="ds-title-block__title ds-title-block__title--medium">{label}</p></div></div>
      <span className="ds-card__trailing"><span className={'ds-radio ' + (sel ? 'ds-radio--selected' : 'ds-radio--unchecked')} aria-hidden="true"><svg className="ds-radio__svg" viewBox="0 0 20 20" fill="none"><circle className="ds-radio__ring" cx="10" cy="10" r="8" strokeWidth="2" /><circle className="ds-radio__dot" cx="10" cy="10" r="4.5" /></svg></span></span>
    </div>
  );
  const pillToggle = (opts, current, on) => (
    <div className="rail-toggle">
      {opts.map(([k, l]) => (
        <button key={k} className={'ds-selection-pill' + (current === k ? ' ds-selection-pill--selected' : '')} onClick={() => on(k)}>
          <span className="ds-selection-pill__label">{l}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="harness">
      <div className="stage-row">
        <aside className="rail rail-left">
          <div className="rail-title">Direction</div>
          {DIRECTIONS.map((v) => railCard(v.n, v.short, variant === v.n, () => pickVariant(v.n)))}
          <div className="rail-sub">
            <div className="rail-title">Device</div>
            {pillToggle([['phone', 'Phone'], ['ipad', 'Tablet']], device, setDevice)}
            {isIpad && (<><div className="rail-title" style={{ marginTop: 16 }}>Layout</div>{pillToggle([['portrait', 'Vertical'], ['landscape', 'Horizontal']], orientation, setOrientation)}</>)}
          </div>
        </aside>

        <div className={'device' + (isIpad ? ' is-ipad' : '') + (isIpad && land ? ' is-landscape' : '')}>
          <div className="device-screen">
            <div key={`${variant}-${step}-${nonce}`} className="screen-rise screen-fill">{screen}</div>
            {splash && <Splash key={`splash-${splashId}`} dark={dark} onDone={() => setSplash(false)} />}
          </div>
        </div>

        <aside className="rail rail-right">
          <div className="rail-title">Reference</div>
          <div className="creds">
            <div className="creds-title">Demo details</div>
            <div className="cred-row"><span className="cred-label">Username</span><span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{DEMO.username}</span></div>
            <div className="cred-row"><span className="cred-label">Password</span><span className="ds-pill ds-pill--md ds-pill--grey ds-pill--minimal">{DEMO.password}</span></div>
            <p className="creds-note">Pre-filled — just tap <b>Sign in</b>.</p>
          </div>
        </aside>
      </div>

      <div className="controls">
        <div className="scenario-buttons">
          {SCENARIOS.map((s) => (
            <button key={s.key} type="button" className="ds-btn ds-btn--ghost" onClick={() => goScenario(s.key)}>{s.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.FlowApp = FlowApp;
