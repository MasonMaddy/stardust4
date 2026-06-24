/*
 * Vacation Care — PES (Simplify Bookings) · dark mobile booking flow
 * Faithful to the Figma "Request a space" flow. Self-contained text/babel module.
 * Colours reference Stardust dark primitives (grey-1200/1100/1000, orange-500/600,
 * purple-550, cyan-500) — the same tokens the Figma uses.
 */
const { useState } = React;

const C = {
  bg: 'var(--sd-colour-grey-1200)', surface: 'var(--sd-colour-grey-1100)', surface2: 'var(--sd-colour-grey-1050)',
  border: 'var(--sd-colour-grey-1000)', text: 'var(--sd-colour-grey-0)', muted: 'var(--sd-colour-grey-500)',
  faint: 'var(--sd-colour-grey-700)', orange: 'var(--sd-colour-orange-500)', orangeBtn: 'var(--sd-colour-orange-600)',
  purple: 'var(--sd-colour-purple-550)', teal: 'var(--sd-colour-cyan-500)',
};
const FONT = 'var(--sd-font-family)';

/* ── icons (currentColor) ─────────────────────────────── */
const PATHS = {
  back: <polyline points="15 5 8 12 15 19" />,
  right: <polyline points="9 5 16 12 9 19" />,
  down: <polyline points="6 9 12 15 18 9" />,
  left: <polyline points="15 6 9 12 15 18" />,
  close: <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>,
  check: <polyline points="4 12.5 9.5 18 20 6" />,
  info: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" /></>,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.7L3 21l1.4-4.2A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />,
};
function Icon({ name, size = 22, sw = 1.8, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', color, flexShrink: 0 }} aria-hidden="true">{PATHS[name]}</svg>;
}

/* ── iOS status bar ───────────────────────────────────── */
function StatusBar() {
  return (
    <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: C.text }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>9:41</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4.5a10 10 0 0 1 14 0"/><path d="M3.5 7a6.5 6.5 0 0 1 9 0"/><path d="M6 9.3a3 3 0 0 1 4 0"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor"/><rect x="23.5" y="4" width="1.8" height="5" rx="1" fill="currentColor" opacity="0.5"/></svg>
      </span>
    </div>
  );
}

/* ── screen scaffold (fixed header + scroll body + pinned footer) ── */
function Screen({ children, footer }) {
  return (
    <div className="pes-rise" style={{ width: 375, height: 812, background: C.bg, color: C.text, fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
      {footer}
    </div>
  );
}

function NavHeader({ title, onBack }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface }}>
      <StatusBar />
      <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative' }}>
        {onBack && <button type="button" onClick={onBack} aria-label="Back" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', padding: 4, display: 'inline-flex' }}><Icon name="back" size={24} /></button>}
        <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: 600, pointerEvents: 'none' }}>{title}</span>
      </div>
    </div>
  );
}

function LrgHeader({ title, onClose, onBack }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface, paddingBottom: 18 }}>
      <StatusBar />
      <div style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        {onBack && <button type="button" onClick={onBack} aria-label="Back" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', display: 'inline-flex', padding: 0 }}><Icon name="back" size={24} /></button>}
        <div style={{ flex: 1 }} />
        {onClose && <button type="button" onClick={onClose} aria-label="Close" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', display: 'inline-flex' }}><Icon name="close" size={22} sw={2.2} /></button>}
      </div>
      <h1 style={{ margin: 0, padding: '6px 20px 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h1>
    </div>
  );
}

const Label = ({ children }) => <div style={{ color: C.orange, fontSize: 12, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 8 }}>{children}</div>;

function FieldBox({ value, placeholder, onClick }) {
  return (
    <button type="button" onClick={onClick} className="pes-tap" style={{
      display: 'flex', alignItems: 'center', width: '100%', height: 56, padding: '0 18px', cursor: 'pointer',
      background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 14, color: value ? C.text : C.muted, fontFamily: FONT,
    }}>
      <span style={{ flex: 1, textAlign: 'left', fontSize: 16 }}>{value || placeholder}</span>
      <Icon name="right" size={20} color={C.muted} />
    </button>
  );
}

function CTA({ label, disabled, onClick, sub }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface, padding: '16px 20px 28px' }}>
      {sub && <div style={{ fontSize: 14, color: C.muted, marginBottom: 12 }}>{sub}</div>}
      <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled} className="pes-tap" style={{
        width: '100%', height: 48, borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
        fontSize: 16, fontWeight: 600, fontFamily: FONT,
        background: disabled ? C.surface2 : C.orangeBtn, color: disabled ? C.muted : C.text,
      }}>{label}</button>
    </div>
  );
}

/* ── data ─────────────────────────────────────────────── */
const CHILDREN = [
  { name: 'Gemma Santiago', service: 'Little Bugs' },
  { name: 'Aneta Santiago', service: 'Little Bugs' },
];
const SESSION_GROUPS = [
  { group: 'Before School Care', items: [{ name: 'BC', price: '£17.50', time: ['7:00am', '9:00am'] }] },
  { group: 'After School Care', items: [{ name: 'AC', price: '£17.50', time: ['3:00pm', '7:00pm'] }, { name: 'AC', price: '£17.50', time: ['2:30pm', '6:30pm'] }] },
  { group: 'Vacation Care', items: [
    { name: 'Swimming 1', price: '£15.00', time: ['9:00am', '10:00am'] },
    { name: 'Swimming 2', price: '£15.00', time: ['10:00am', '11:00am'] },
    { name: 'Excursion', price: '£25.00', time: ['9:00am', '3:00pm'] },
  ] },
  { group: 'Other', items: [{ name: 'Request a space', sub: 'Billing determined by admin', waitlist: true }] },
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WAITLIST_DAYS = [9, 30];            // purple "waitlist only" days
const DISABLED_DAYS = [23];               // explicitly blocked weekday (the "disable dates" edge state)
const fmtDate = (d) => { const dt = new Date(2025, 0, d); return `${WEEKDAYS[dt.getDay()]}, ${d} Jan 25`; };
const priceNum = (s) => s ? parseFloat(s.replace('£', '')) : 0;

/* ── avatar (initials, no real photos) ────────────────── */
const Avatar = ({ name }) => (
  <span style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: C.surface2, color: C.muted,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
    {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
  </span>
);

/* ── teal alert ───────────────────────────────────────── */
const Alert = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${C.teal}`, borderRadius: 14, padding: '14px 16px', color: C.teal }}>
    <Icon name="chat" size={18} /><span style={{ fontSize: 13, lineHeight: 1.5 }}>{children}</span>
  </div>
);
const WaitPill = () => <span style={{ background: C.purple, color: '#1b1b1b', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>Waitlist only</span>;

/* ════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════ */
function BookingForm({ ctx }) {
  const { child, session, dates, bookingType, setBookingType, go } = ctx;
  const ready = child && session && dates.length > 0;
  return (
    <Screen footer={<CTA label="Review" disabled={!ready} onClick={() => go('review')} />}>
      <LrgHeader title="New Booking" onClose={() => ctx.reset()} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px 24px' }}>
        <Label>Child's name</Label>
        <FieldBox value={child && child.name} placeholder="Select child" onClick={() => go('selectChild')} />

        <div style={{ height: 28 }} />
        <Label>Booking type</Label>
        <button type="button" onClick={() => setBookingType(bookingType === 'Casual' ? 'Recurring' : 'Casual')} className="pes-tap"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{bookingType}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13, marginTop: 4 }}>
            <Icon name="info" size={15} sw={2} />{bookingType === 'Casual' ? 'For one-off sessions' : 'For repeating weekly sessions'}
          </div>
        </button>

        <div style={{ height: 28 }} />
        <Label>Session(s)</Label>
        <FieldBox value={session && (session.name + (session.time ? ` · ${session.time[0]}–${session.time[1]}` : ''))} placeholder="Select session" onClick={() => go('selectSession')} />

        {session && <>
          <div style={{ height: 28 }} />
          <Label>Dates</Label>
          <FieldBox value={dates.length ? `${dates.length} date${dates.length > 1 ? 's' : ''} selected` : ''} placeholder="Select dates" onClick={() => go('selectDates')} />
        </>}
      </div>
    </Screen>
  );
}

function SelectChild({ ctx }) {
  return (
    <Screen>
      <NavHeader title="Select Child" onBack={() => ctx.go('booking')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {CHILDREN.map((c, i) => (
          <button type="button" key={i} onClick={() => ctx.pickChild(c)} className="pes-tap" style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', cursor: 'pointer',
            background: 'transparent', border: 'none', borderBottom: `1px solid ${C.surface}`, color: C.text, textAlign: 'left',
          }}>
            <Avatar name={c.name} />
            <span><div style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 13, color: C.muted }}>{c.service}</div></span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

function SelectSession({ ctx }) {
  return (
    <Screen>
      <NavHeader title="Select Session" onBack={() => ctx.go('booking')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 24px' }}>
        {SESSION_GROUPS.map((g, gi) => (
          <div key={gi}>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '20px 20px 8px' }}>{g.group}</div>
            {g.items.map((s, si) => (
              <button type="button" key={si} onClick={() => ctx.pickSession(s)} className="pes-tap" style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', cursor: 'pointer',
                background: 'transparent', border: 'none', borderBottom: `1px solid ${C.surface}`, color: C.text, textAlign: 'left',
              }}>
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{s.price || s.sub}</div>
                </span>
                {s.time && <span style={{ textAlign: 'right', fontSize: 15 }}><div>{s.time[0]}</div><div>{s.time[1]}</div></span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Screen>
  );
}

function SelectDates({ ctx }) {
  const { session, dates, toggleDate } = ctx;
  const first = new Date(2025, 0, 1).getDay();   // Jan 1 2025 = Wed (3); Sunday-start grid
  const total = 31;
  const lead = first;
  const cells = [...Array(lead).fill(null), ...Array(total).fill(0).map((_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const dayState = (d) => {
    if (DISABLED_DAYS.includes(d)) return 'disabled';
    const wd = new Date(2025, 0, d).getDay();
    if (wd === 0 || wd === 6) return 'disabled';        // weekends closed
    return WAITLIST_DAYS.includes(d) ? 'waitlist' : 'available';
  };

  return (
    <Screen footer={
      <div style={{ flexShrink: 0, background: C.surface, padding: '14px 20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ flex: 1, fontSize: 15, color: dates.length ? C.text : C.muted }}>{dates.length} selected</span>
        <button type="button" onClick={dates.length ? () => ctx.go('booking') : undefined} disabled={!dates.length} className="pes-tap" style={{
          minWidth: 120, height: 48, borderRadius: 12, border: 'none', cursor: dates.length ? 'pointer' : 'default', fontSize: 16, fontWeight: 600, fontFamily: FONT,
          background: dates.length ? C.orangeBtn : C.surface2, color: dates.length ? C.text : C.muted }}>Save</button>
      </div>
    }>
      <NavHeader title="Select date(s)" onBack={() => ctx.go('booking')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, marginBottom: 20 }}>
          Select one or more dates you would like to book for <b style={{ color: C.text }}>{session ? session.name : 'this session'}{session && session.time ? '' : ''}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 22, fontWeight: 700 }}>January 2025</div>
          <span style={{ display: 'flex', gap: 14, color: C.orange }}><Icon name="left" size={20} /><Icon name="right" size={20} /></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', rowGap: 10 }}>
          {WEEKDAYS.map(w => <div key={w} style={{ fontSize: 13, color: C.muted, paddingBottom: 6 }}>{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ color: C.faint, fontSize: 16, padding: '6px 0', textDecoration: 'line-through' }}>{'·'}</div>;
            const st = dayState(d);
            const sel = dates.includes(d);
            const base = { fontSize: 16, fontWeight: 600, width: 36, height: 36, lineHeight: '36px', margin: '0 auto', borderRadius: '50%' };
            if (st === 'disabled') return <div key={i} style={{ ...base, color: C.faint, textDecoration: 'line-through' }}>{d}</div>;
            const fill = st === 'waitlist' ? C.purple : C.orange;
            return (
              <button type="button" key={i} onClick={() => toggleDate(d)} className="pes-tap" style={{
                ...base, cursor: 'pointer', border: 'none', fontFamily: FONT, fontWeight: 600,
                background: sel ? fill : 'transparent', color: sel ? '#1b1b1b' : C.text }}>{d}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <span style={{ background: C.orange, color: '#1b1b1b', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>Available</span>
          <span style={{ background: C.purple, color: '#1b1b1b', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>Waitlist Only</span>
        </div>
      </div>
    </Screen>
  );
}

/* shared booking-summary rows for review + confirmed */
function SummaryRow({ label, children }) {
  return (
    <div style={{ display: 'flex', padding: '16px 20px', borderBottom: `1px solid ${C.surface}` }}>
      <div style={{ color: C.muted, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', width: 96, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, textAlign: 'right', fontSize: 16, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function DatesBlock({ ctx }) {
  const { session, dates } = ctx;
  const waitlist = session && session.waitlist;
  return (
    <div style={{ display: 'flex', padding: '16px 20px', borderBottom: `1px solid ${C.surface}` }}>
      <div style={{ width: 96, flexShrink: 0 }}>{waitlist && <WaitPill />}</div>
      <div style={{ flex: 1, textAlign: 'right', fontSize: 16, lineHeight: 1.7 }}>
        {dates.map(d => <div key={d}>{fmtDate(d)}</div>)}
      </div>
    </div>
  );
}

function Review({ ctx }) {
  const { child, session, dates } = ctx;
  const waitlist = session && session.waitlist;
  const total = waitlist ? 0 : priceNum(session && session.price) * dates.length;
  return (
    <Screen footer={<CTA label="Confirm" onClick={() => ctx.go('confirmed')} />}>
      <LrgHeader title="Review request" onBack={() => ctx.go('booking')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px 4px', color: C.orange, fontSize: 13, fontWeight: 600 }}>Your booking</div>
        <SummaryRow label="Child">{child.name}<div style={{ fontSize: 14, color: C.muted }}>{child.service}</div></SummaryRow>
        <SummaryRow label="Session">{session.name}<div style={{ fontSize: 14, color: C.muted }}>{session.time ? `${session.time[0]} – ${session.time[1]}` : 'All day / any time'}</div></SummaryRow>
        <DatesBlock ctx={ctx} />
        <div style={{ padding: '20px' }}><Alert>Pricing details only apply to available dates. Waitlisted bookings will have their pricing information attached if confirmed.</Alert></div>
        <div style={{ padding: '0 20px 4px', color: C.orange, fontSize: 13, fontWeight: 600 }}>Price details</div>
        <div style={{ display: 'flex', padding: '14px 20px', borderTop: `1px solid ${C.surface}` }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>TOTAL</span>
          <span style={{ fontWeight: 700 }}>£{total.toFixed(2)}</span>
        </div>
      </div>
    </Screen>
  );
}

function Confirmed({ ctx }) {
  const { child, session, dates } = ctx;
  const waitlist = session && session.waitlist;
  const total = waitlist ? 0 : priceNum(session && session.price) * dates.length;
  return (
    <Screen footer={<CTA label="Done" onClick={() => ctx.reset()} />}>
      <LrgHeader title="Request confirmed" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '26px 0 18px' }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: C.teal, color: '#0c2b29', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} sw={2.6} /></span>
        </div>
        <div style={{ padding: '0 20px 18px' }}><Alert>You will receive an email shortly for all confirmed booking details.</Alert></div>
        <SummaryRow label="Child">{child.name}<div style={{ fontSize: 14, color: C.muted }}>{child.service}</div></SummaryRow>
        <SummaryRow label="Session">{session.name}<div style={{ fontSize: 14, color: C.muted }}>{session.time ? `${session.time[0]} – ${session.time[1]}` : 'All day / any time'}</div></SummaryRow>
        <DatesBlock ctx={ctx} />
        <div style={{ padding: '20px' }}><Alert>Pricing details only apply to available dates. Waitlisted bookings will have their pricing information attached if confirmed.</Alert></div>
        <div style={{ display: 'flex', padding: '14px 20px', borderTop: `1px solid ${C.surface}` }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, letterSpacing: '1px' }}>TOTAL FEE</span>
          <span style={{ fontWeight: 700 }}>£{total.toFixed(2)}</span>
        </div>
      </div>
    </Screen>
  );
}

/* ════════════════════════════════════════════════════════
   APP / STATE MACHINE
   ════════════════════════════════════════════════════════ */
function PesApp() {
  const params = new URLSearchParams(window.location.search);
  const [screen, setScreen] = useState(params.get('screen') || params.get('step') || 'booking');
  const [child, setChild] = useState(null);
  const [session, setSession] = useState(null);
  const [dates, setDates] = useState([]);
  const [bookingType, setBookingType] = useState('Casual');

  const go = (s) => setScreen(s);
  const reset = () => { setChild(null); setSession(null); setDates([]); setBookingType('Casual'); setScreen('booking'); };
  const pickChild = (c) => { setChild(c); setScreen('booking'); };
  const pickSession = (s) => { setSession(s); setDates([]); setScreen('booking'); };
  const toggleDate = (d) => setDates(ds => ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d].sort((a, b) => a - b));

  const ctx = { child, session, dates, bookingType, setBookingType, go, reset, pickChild, pickSession, toggleDate };

  const SCREENS = { booking: BookingForm, selectChild: SelectChild, selectSession: SelectSession, selectDates: SelectDates, review: Review, confirmed: Confirmed };
  const Active = SCREENS[screen] || BookingForm;

  return (
    <div className="device">
      <div className="device-screen" style={{ position: 'relative' }}>
        <Active key={screen} ctx={ctx} />
      </div>
    </div>
  );
}

window.PesApp = PesApp;
