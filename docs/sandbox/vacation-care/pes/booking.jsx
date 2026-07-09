/*
 * Vacation Care — PES · dark mobile booking flow
 * Faithful to the Vacation Care mobile screens (Figma file 3bqlUS6rwOxBhhfFMDVwpP,
 * "Mobile Booking Workflow"). Self-contained text/babel module on Stardust dark
 * primitives (grey-1200/1100/1000, orange-500/600, purple-550, cyan-500).
 */
const { useState } = React;

const C = {
  bg: 'var(--sd-colour-grey-1200)', surface: 'var(--sd-colour-grey-1100)', surface2: 'var(--sd-colour-grey-1050)',
  border: 'var(--sd-colour-grey-1000)', text: 'var(--sd-colour-grey-0)', muted: 'var(--sd-colour-grey-500)',
  faint: 'var(--sd-colour-grey-700)', orange: 'var(--sd-colour-orange-500)', orangeBtn: 'var(--sd-colour-orange-600)',
  purple: 'var(--sd-colour-purple-550)', teal: 'var(--sd-colour-cyan-500)',
};
const FONT = 'var(--sd-font-family)';

const PATHS = {
  back: <polyline points="15 5 8 12 15 19" />,
  right: <polyline points="9 5 16 12 9 19" />,
  close: <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>,
  check: <polyline points="4 12.5 9.5 18 20 6" />,
  info: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" /></>,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.7L3 21l1.4-4.2A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />,
  plusCircle: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2.5" x2="8" y2="6" /><line x1="16" y1="2.5" x2="16" y2="6" /></>,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></>,
  rocket: <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m9.5-13.5C19 7 17 13 12 16l-4-4C11 7 17 5 20.5 5.5ZM9 12l-3 .5L9 9m6 6 .5-3L18 15" />,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3.5" rx="1" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></>,
  pin: <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  dollar: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.7.8-2.7 2 0 2.8 5.5 1.4 5.5 4.4 0 1.3-1.2 2.1-2.8 2.1-1.4 0-2.5-.6-3-1.6" /><line x1="12" y1="6" x2="12" y2="18" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></>,
};
function Icon({ name, size = 22, sw = 1.8, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', color, flexShrink: 0 }} aria-hidden="true">{PATHS[name]}</svg>;
}

function StatusBar({ ampm }) {
  return (
    <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: C.text }}>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{ampm ? '9:41 AM' : '9:41'}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4.5" width="3" height="7.5" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 4.5a10 10 0 0 1 14 0" /><path d="M3.5 7a6.5 6.5 0 0 1 9 0" /><path d="M6 9.3a3 3 0 0 1 4 0" /></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="18" height="9" rx="1.5" fill="currentColor" /><rect x="23.5" y="4" width="1.8" height="5" rx="1" fill="currentColor" opacity="0.5" /></svg>
      </span>
    </div>
  );
}

function Screen({ children, footer }) {
  return (
    <div className="pes-rise" style={{ width: 375, height: 812, background: C.bg, color: C.text, fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
      {footer}
    </div>
  );
}

function NavHeader({ title, onBack, ampm }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface }}>
      <StatusBar ampm={ampm} />
      <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative' }}>
        {onBack && <button type="button" onClick={onBack} aria-label="Back" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', padding: 4, display: 'inline-flex' }}><Icon name="back" size={24} /></button>}
        <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: 600, pointerEvents: 'none' }}>{title}</span>
      </div>
    </div>
  );
}

function LrgHeader({ title, onClose, onBack, right }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface, paddingBottom: 18 }}>
      <StatusBar />
      <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 18px' }}>
        {onBack && <button type="button" onClick={onBack} aria-label="Back" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', padding: 0, display: 'inline-flex' }}><Icon name="back" size={24} /></button>}
        <div style={{ flex: 1 }} />
        {right}
        {onClose && <button type="button" onClick={onClose} aria-label="Close" className="pes-tap" style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', display: 'inline-flex' }}><Icon name="close" size={22} sw={2.2} /></button>}
      </div>
      <h1 style={{ margin: 0, padding: '4px 20px 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</h1>
    </div>
  );
}

const Label = ({ children }) => <div style={{ color: C.orange, fontSize: 12, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 8 }}>{children}</div>;

function FieldBox({ value, placeholder, onClick, onClear }) {
  return (
    <div className="pes-tap" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', width: '100%', height: 56, padding: '0 18px', cursor: 'pointer',
      background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 14, color: value ? C.text : C.muted, boxSizing: 'border-box',
    }}>
      <span style={{ flex: 1, textAlign: 'left', fontSize: 16 }}>{value || placeholder}</span>
      {value && onClear
        ? <button type="button" aria-label="Clear" onClick={(e) => { e.stopPropagation(); onClear(); }} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'inline-flex' }}><Icon name="close" size={20} /></button>
        : <Icon name="right" size={20} color={C.muted} />}
    </div>
  );
}

function CTA({ label, disabled, onClick }) {
  return (
    <div style={{ flexShrink: 0, background: C.surface, padding: '16px 20px 28px' }}>
      <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled} className="pes-tap" style={{
        width: '100%', height: 48, borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer', fontSize: 16, fontWeight: 600, fontFamily: FONT,
        background: disabled ? C.surface2 : C.orangeBtn, color: disabled ? C.muted : C.text }}>{label}</button>
    </div>
  );
}

const Alert = ({ children }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${C.teal}`, borderRadius: 14, padding: '14px 16px', color: C.teal }}>
    <Icon name="chat" size={18} /><span style={{ fontSize: 13, lineHeight: 1.5 }}>{children}</span>
  </div>
);
const WaitPill = () => <span style={{ background: C.purple, color: '#1b1b1b', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999 }}>Waitlist Only</span>;
const Avatar = ({ name }) => (
  <span style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: C.surface2, color: C.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
    {name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
);

/* ── data ─────────────────────────────────────────────── */
const CHILDREN = [
  { name: 'Gemma Santiago', service: 'Little Seeds OSHC' },
  { name: 'Aneta Santiago', service: 'Little Seeds OSHC' },
];
const SESSIONS = [
  { id: 's1', date: 'Mon, 17 May 2026', activity: 'Swimming 1', loc: 'Aquatic', fee: 15, room: 'Aquatic Centre' },
  { id: 's2', date: 'Tues, 18 May 2026', activity: 'Trip to Zoo', loc: 'Zoo', fee: 50, room: 'Melbourne Zoo', waitlist: true },
  { id: 's3', date: 'Tues, 18 May 2026', activity: 'DisneyLand', loc: 'DisneyLand', fee: 500, room: 'DisneyLand', waitlist: true },
  { id: 's4', date: 'Wed, 19 May 2026', activity: 'Movie day', loc: 'Village Cinemas', fee: 15.99, room: 'Village Cinemas' },
  { id: 's5', date: 'Thur, 20 May 2026', activity: 'Arts & Crafts', loc: 'St Albans School', fee: 10, room: 'Art Room' },
  { id: 's6', date: 'Fri, 21 May 2026', activity: 'Cooking Class', loc: 'Main Hall', fee: 12, room: 'Main Hall' },
];
const groupByDate = (list) => { const g = {}; list.forEach(s => { (g[s.date] = g[s.date] || []).push(s); }); return Object.entries(g); };
const money = (n) => `$${n.toFixed(2)}`;
// July 2026 landing calendar: dots on these days, today = 16
const JULY_DOTS = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 19, 20, 26];

/* ════════════════════════════════════════════════════════
   BOOKINGS LANDING
   ════════════════════════════════════════════════════════ */
function TabBar() {
  const tab = (icon, label, active) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active ? C.orange : C.muted }}>
      <Icon name={icon} size={20} sw={1.6} /><span style={{ fontSize: 10 }}>{label}</span>
    </div>
  );
  return (
    <div style={{ flexShrink: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '10px 8px 24px' }}>
      {tab('rocket', 'Care')}{tab('clipboard', 'Bookings', true)}{tab('pin', 'Sign In')}{tab('dollar', 'Finance')}{tab('person', 'Account')}
    </div>
  );
}

function Bookings({ ctx }) {
  const [bannerOpen, setBannerOpen] = useState(true);
  const first = new Date(2026, 6, 1).getDay();   // Jul 1 2026 = Wed; Sunday-start
  const cells = [...Array(first).fill(null), ...Array(31).fill(0).map((_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <Screen footer={<TabBar />}>
      <div style={{ flexShrink: 0, background: C.surface, paddingBottom: 14 }}>
        <StatusBar ampm />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 0' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, flex: 1 }}>Bookings</h1>
          <button type="button" onClick={() => ctx.go('form')} className="pes-tap" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.orange, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
            <Icon name="plusCircle" size={22} />New</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 8px' }}>
        {bannerOpen && <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.teal, color: '#0c2b29', borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
          <Icon name="calendar" size={20} /><span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>July Holiday Program Now Open</span>
          <button type="button" onClick={() => setBannerOpen(false)} aria-label="Dismiss" className="pes-tap" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 2, display: 'inline-flex' }}><Icon name="close" size={18} /></button>
        </div>}
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>July 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', rowGap: 8 }}>
          {WD.map(w => <div key={w} style={{ fontSize: 12, color: C.muted, paddingBottom: 4 }}>{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const today = d === 16;
            return (
              <div key={i} style={{ position: 'relative', padding: '4px 0' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', fontSize: 15, fontWeight: 600, background: today ? C.orange : 'transparent', color: today ? '#1b1b1b' : C.text }}>{d}</span>
                {!today && JULY_DOTS.includes(d) && <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.orange }} />}
              </div>
            );
          })}
        </div>
      </div>
      <button type="button" onClick={() => ctx.openDetail(SESSIONS[1])} className="pes-tap" style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer',
        background: C.surface, border: 'none', borderTop: `1px solid ${C.border}`, padding: '16px 20px', color: C.text }}>
        <span style={{ width: 40, height: 40, borderRadius: 8, background: C.surface2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.orange }}><Icon name="calendar" size={20} /></span>
        <span style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600 }}>Vacation Care Booking <span style={{ color: C.muted, fontWeight: 400 }}>• Joey</span></div><div style={{ fontSize: 13, color: C.muted }}>Little Bugs ELC</div></span>
        <span style={{ textAlign: 'right', fontSize: 13, color: C.muted }}><div>7:00am</div><div>12:00pm</div></span>
      </button>
    </Screen>
  );
}

/* ════════════════════════════════════════════════════════
   NEW VACATION CARE BOOKING (form)
   ════════════════════════════════════════════════════════ */
function BookingForm({ ctx }) {
  const { child, sessions, bookingType, setBookingType, go, clearSessions } = ctx;
  const ready = child && sessions.length > 0;
  return (
    <Screen footer={<CTA label="Review" disabled={!ready} onClick={() => go('review')} />}>
      <LrgHeader title="New Vacation Care Booking" onClose={() => ctx.go('bookings')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px 24px' }}>
        <Label>Child's name</Label>
        <FieldBox value={child && child.name} placeholder="Select child" onClick={() => go('selectChild')} />
        {child && <div style={{ fontSize: 13, color: C.muted, margin: '-44px 0 0 19px', position: 'relative', pointerEvents: 'none' }}>{child.service}</div>}

        <div style={{ height: 28 }} />
        <Label>Booking type</Label>
        <button type="button" onClick={() => setBookingType(bookingType === 'Casual' ? 'Recurring' : 'Casual')} className="pes-tap" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{bookingType}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13, marginTop: 4 }}>
            <Icon name="info" size={15} sw={2} />{bookingType === 'Casual' ? 'For one-off sessions' : 'For repeating weekly sessions'}</div>
        </button>

        <div style={{ height: 28 }} />
        <Label>Session(s)</Label>
        <FieldBox value={sessions.length ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} selected` : ''} placeholder="Select session" onClick={() => go('selectSession')} onClear={clearSessions} />
      </div>
    </Screen>
  );
}

function SelectChild({ ctx }) {
  return (
    <Screen>
      <NavHeader title="Select Child" onBack={() => ctx.go('form')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {CHILDREN.map((c, i) => (
          <button type="button" key={i} onClick={() => ctx.pickChild(c)} className="pes-tap" style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.surface}`, color: C.text, textAlign: 'left' }}>
            <Avatar name={c.name} />
            <span><div style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 13, color: C.muted }}>{c.service}</div></span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

/* ── Select Session: multi-select grouped by date ─────── */
function SelectSession({ ctx }) {
  const { draftSel, toggleDraft, commitSessions, go } = ctx;
  return (
    <Screen footer={
      <div style={{ flexShrink: 0, background: C.surface, padding: '14px 20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ flex: 1, fontSize: 15, color: draftSel.length ? C.text : C.muted }}>{draftSel.length} selected</span>
        <button type="button" onClick={draftSel.length ? commitSessions : undefined} disabled={!draftSel.length} className="pes-tap" style={{ minWidth: 120, height: 48, borderRadius: 12, border: 'none', cursor: draftSel.length ? 'pointer' : 'default', fontSize: 16, fontWeight: 600, fontFamily: FONT, background: draftSel.length ? C.orangeBtn : C.surface2, color: draftSel.length ? C.text : C.muted }}>Save</button>
      </div>
    }>
      <NavHeader title="Select Session" onBack={() => go('form')} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {groupByDate(SESSIONS).map(([date, items]) => (
          <div key={date}>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '20px 20px 6px' }}>{date}</div>
            {items.map(s => {
              const on = draftSel.includes(s.id);
              return (
                <button type="button" key={s.id} onClick={() => toggleDraft(s.id)} className="pes-tap" style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `1px solid ${C.surface}`, color: C.text, textAlign: 'left' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, border: `2px solid ${on ? C.orange : C.border}`, background: on ? C.orange : 'transparent', color: '#1b1b1b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={15} sw={3} />}</span>
                  <span style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>{s.activity}{s.waitlist && <WaitPill />}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{money(s.fee)} · {s.loc}</div>
                  </span>
                  <span style={{ textAlign: 'right', fontSize: 14, color: C.muted }}><div>00:00</div><div>00:00</div></span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ── Review Booking: line items + promo + totals ──────── */
function Review({ ctx }) {
  const { child, sessions, removeSession, go } = ctx;
  const chosen = SESSIONS.filter(s => sessions.includes(s.id));
  const available = chosen.filter(s => !s.waitlist);
  const subtotal = available.reduce((n, s) => n + s.fee, 0);
  const discount = subtotal * 0.10;
  const total = subtotal - discount;
  return (
    <Screen footer={<CTA label="Confirm" onClick={() => go('detail')} />}>
      <LrgHeader title="Review Booking" onBack={() => go('form')} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', padding: '16px 20px', borderBottom: `1px solid ${C.surface}` }}>
          <div style={{ color: C.muted, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', flex: 1 }}>Child</div>
          <div style={{ textAlign: 'right' }}>{child.name}<div style={{ fontSize: 13, color: C.muted }}>{child.service}</div></div>
        </div>
        {chosen.map(s => (
          <div key={s.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.surface}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
              <Icon name="calendar" size={15} sw={2} />{s.date}<div style={{ flex: 1 }} />
              <button type="button" onClick={() => removeSession(s.id)} aria-label="Remove" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'inline-flex' }}><Icon name="close" size={18} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>{s.activity}{s.waitlist && <WaitPill />}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{s.room}</div>
              </div>
              {!s.waitlist && <div style={{ fontWeight: 700 }}>{money(s.fee)}</div>}
            </div>
          </div>
        ))}
        <div style={{ padding: 20 }}><Alert>Pricing details only apply to confirmed dates. Waitlisted bookings will have their pricing information attached if confirmed.</Alert></div>
        <div style={{ padding: '0 20px 8px', color: C.orange, fontSize: 13, fontWeight: 600 }}>Price details for available sessions</div>
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${C.teal}`, borderRadius: 12, padding: '12px 14px', color: C.teal, marginBottom: 6 }}>
            <Icon name="tag" size={18} /><span style={{ flex: 1, fontWeight: 600, letterSpacing: '1px' }}>PROMOCODE10</span>
            <span style={{ color: C.orange, fontWeight: 600 }}>Remove</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Promo code applied</div>
        </div>
        <div style={{ padding: '0 20px' }}>
          <Row label={`Available • ${available.length} session${available.length !== 1 ? 's' : ''}`} value={money(subtotal)} />
          <Row label="Promo code applied • 10%" value={`-${money(discount)}`} valueColor={C.purple} />
          <div style={{ display: 'flex', padding: '14px 0', borderTop: `1px solid ${C.surface}` }}>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL NOW</span>
            <span style={{ fontWeight: 700 }}>{money(total)}</span>
          </div>
        </div>
      </div>
    </Screen>
  );
}
const Row = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', padding: '8px 0', fontSize: 14 }}><span style={{ flex: 1, color: C.muted }}>{label}</span><span style={{ color: valueColor || C.text }}>{value}</span></div>
);

/* ── Booking detail (cosmic hero) ─────────────────────── */
function Detail({ ctx }) {
  const s = ctx.detailSession || SESSIONS[1];
  return (
    <Screen footer={
      <div style={{ flexShrink: 0, background: C.bg, padding: '12px 20px 28px' }}>
        <button type="button" onClick={() => ctx.reset()} className="pes-tap" style={{ width: '100%', height: 48, borderRadius: 12, background: 'transparent', border: `1px solid ${C.orange}`, color: C.orange, fontSize: 16, fontWeight: 600, fontFamily: FONT, cursor: 'pointer' }}>Cancel Booking</button>
      </div>
    }>
      <NavHeader title="Booking request" onBack={() => ctx.go('bookings')} ampm />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* cosmic hero */}
        <div style={{ height: 150, position: 'relative', overflow: 'hidden', background: 'radial-gradient(120% 100% at 80% 30%, #16404a 0%, #0c1830 55%, #0a0f1f 100%)' }}>
          <span style={{ position: 'absolute', top: 22, right: 34, width: 78, height: 78, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #8fe6dd, #18a89c 55%, #0c5f59)' , boxShadow: '0 0 28px rgba(24,168,156,0.6)' }} />
          {[[30, 40], [70, 90], [120, 30], [180, 70], [230, 50], [300, 100], [60, 120]].map(([x, y], i) => <span key={i} style={{ position: 'absolute', left: x, top: y, width: 2, height: 2, borderRadius: '50%', background: '#fff', opacity: 0.7 }} />)}
        </div>
        <div style={{ padding: '20px 20px 8px' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Vacation Care Booking</h1>
          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <div><div style={{ fontSize: 13, color: C.muted }}>Start</div><div style={{ fontSize: 20, fontWeight: 600 }}>7:15am</div></div>
            <div style={{ alignSelf: 'center', color: C.muted }}>–</div>
            <div><div style={{ fontSize: 13, color: C.muted }}>End</div><div style={{ fontSize: 20, fontWeight: 600 }}>6:00pm</div></div>
          </div>
        </div>
        <div style={{ padding: '8px 20px' }}>
          <DRow label="Child">{ctx.child ? ctx.child.name : 'Joey Jo-Jo Junior Shabadoo'}</DRow>
          <DRow label="Centre">Little Bugs ELC</DRow>
          <DRow label="Activity">{s.activity}</DRow>
          <DRow label="Fee">{money(s.fee)}</DRow>
          <DRow label="Phone">1234 5678</DRow>
          <DRow label="Comment" stacked>Looking forward to it — please apply sunscreen before the excursion.</DRow>
        </div>
      </div>
    </Screen>
  );
}
const DRow = ({ label, children, stacked }) => (
  <div style={{ padding: '14px 0', borderBottom: `1px solid ${C.surface}` }}>
    {stacked
      ? <><div style={{ color: C.muted, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div><div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{children}</div></>
      : <div style={{ display: 'flex' }}><span style={{ color: C.muted, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', flex: 1 }}>{label}</span><span style={{ fontSize: 16 }}>{children}</span></div>}
  </div>
);

/* ════════════════════════════════════════════════════════
   APP / STATE MACHINE
   ════════════════════════════════════════════════════════ */
function PesApp() {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('screen') || params.get('step') || 'bookings';
  const seed = ['review', 'detail', 'form'].includes(initial);
  const [screen, setScreen] = useState(initial);
  const [child, setChild] = useState(seed ? CHILDREN[0] : null);
  const [sessions, setSessions] = useState(seed ? ['s1', 's2', 's4', 's5'] : []);
  const [draftSel, setDraftSel] = useState([]);
  const [bookingType, setBookingType] = useState('Casual');
  const [detailSession, setDetailSession] = useState(null);

  const go = (s) => { if (s === 'selectSession') setDraftSel(sessions); setScreen(s); };
  const reset = () => { setChild(null); setSessions([]); setDraftSel([]); setBookingType('Casual'); setScreen('bookings'); };
  const pickChild = (c) => { setChild(c); setScreen('form'); };
  const toggleDraft = (id) => setDraftSel(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  const commitSessions = () => { setSessions(draftSel); setScreen('form'); };
  const clearSessions = () => setSessions([]);
  const removeSession = (id) => setSessions(s => s.filter(x => x !== id));
  const openDetail = (s) => { setDetailSession(s); setScreen('detail'); };

  const ctx = { child, sessions, draftSel, bookingType, detailSession, setBookingType, go, reset, pickChild, toggleDraft, commitSessions, clearSessions, removeSession, openDetail };
  const SCREENS = { bookings: Bookings, form: BookingForm, selectChild: SelectChild, selectSession: SelectSession, review: Review, detail: Detail };
  const Active = SCREENS[screen] || Bookings;

  return (
    <div className="device">
      <div className="device-screen" style={{ position: 'relative' }}>
        <Active key={screen} ctx={ctx} />
      </div>
    </div>
  );
}

window.PesApp = PesApp;
