/*
 * Vacation Care — Office prototype · app shell + screens + state machine
 * Renders inside the desktop browser frame (index.html). Primitives live in helpers.jsx.
 * Screens: calendar · programs · setup (+ contextual Form panel) · forms.
 */
const { Icon, Emblem, Pill, Btn, IconBtn, Field, TextField, SelectField, SelPill, SegSwitch, SearchBar, Toggle, Toast, fieldBoxStyle } = window.VC;

/* Calendar ⇄ List view switch — the segmented phone/tablet-style toggle */
function ViewSwitch({ current, go }) {
  return (
    <SegSwitch value={current} onChange={k => { if (k !== current) go(k); }}
      options={[{ key: 'calendar', label: 'Calendar View', icon: 'calendar' }, { key: 'programs', label: 'List View', icon: 'list' }]} />
  );
}

/* ── static data ──────────────────────────────────────── */
const NAV = [
  { label: 'Parent', icon: 'home' },
  { label: 'Dashboard', icon: 'grid' },
  { label: 'Booking Manager', icon: 'calendarCheck' },
  { label: 'Vacation Care', icon: 'calendar', children: [
      { label: 'Calendar View', screen: 'calendar' },
      { label: 'Program list', screen: 'programs' },
      { label: 'Program Setup', screen: 'setup' },
      { label: 'Program Bulk import', screen: 'bulk' },
  ] },
  { label: 'Master Roll', icon: 'doc' },
  { label: 'Comms Centre', icon: 'chat' },
  { label: 'Profiles', icon: 'user', caret: true },
  { label: 'Financial', icon: 'dollar', caret: true },
  { label: 'Child Care subsidy', icon: 'building', caret: true },
  { label: 'Rostering', icon: 'table', caret: true },
  { label: 'Reports', icon: 'doc', caret: true },
  { label: 'Settings', icon: 'cog', caret: true },
  { label: 'Help & Support', icon: 'help' },
  { label: 'Logout', icon: 'logout' },
];

const FEES = ['Standard — $85', 'Excursion — $110', 'Incursion — $95'];
const ROOMS = ['Kangaroo Room', 'Possum Room', 'Koala Room', 'Wombat Room'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

let _uid = 100;
const uid = () => `a${++_uid}`;

const SEED_WEEK = {
  days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
  activities: {
    Mon: [{ id: uid(), name: 'Zoo Excursion', fee: 'Excursion — $110', room: 'Kangaroo Room',
            form: { name: 'Excursion consent form', file: 'excursion-consent.pdf', mandatory: true } }],
    Tue: [{ id: uid(), name: 'Arts & Crafts', fee: 'Standard — $85', room: 'Possum Room', form: null }],
    Wed: [{ id: uid(), name: 'Swimming', fee: 'Excursion — $110', room: '',
            form: { name: 'Swimming permission', file: 'swimming-permission.pdf', mandatory: false } }],
    Thu: [{ id: uid(), name: '', fee: '', room: '', form: null }],
    Fri: [{ id: uid(), name: '', fee: '', room: '', form: null }],
    Sat: [], Sun: [],
  },
};

const SEED_PROGRAMS = [
  { id: 'jan', name: 'January Vacation 2026', dates: '12 Jan – 16 Jan 2026', dur: '1 week',
    status: 'published', timing: { label: 'Completed', icon: 'check', tone: 'grey' } },
  { id: 'jul', name: 'July Holidays 2026', dates: '14 Jul – 25 Jul 2026', dur: '2 weeks',
    status: 'published', timing: { label: 'Starts in 32 days', tone: 'orange' } },
  { id: 'xmas', name: 'Christmas 2026', dates: '22 Dec – 2 Jan 2027', dur: '2 weeks',
    status: 'draft', timing: { label: 'Starts in 260 days', tone: 'orange' } },
];

const FORMS_ROWS = [
  { first: 'Mia', last: 'Brown', carer: 'Sarah Brown', form: 'Excursion consent form', by: 'Sarah Brown', status: 'received', date: '25/02/2026' },
  { first: 'Liam', last: 'Hayes', carer: 'Shelly Hayes', form: 'Excursion consent form', by: null, status: 'missing', date: '—' },
  { first: 'Ava', last: 'Tran', carer: 'Tracy Tran', form: 'Excursion consent form', by: 'Tracy Tran', status: 'received', date: '25/02/2026' },
  { first: 'Noah', last: 'Singh', carer: 'John Singh', form: 'Excursion consent form', by: null, status: 'missing', date: '—' },
  { first: 'Ivy', last: 'Cole', carer: 'Priya Cole', form: 'Excursion consent form', by: 'Priya Cole', status: 'received', date: '01/12/2025' },
];

/* March 2026 activities, keyed by day-of-month */
const CAL_ACTIVITIES = {
  12: [{ name: 'Zoo Excursion', booked: 43, cap: 50 }, { name: 'Swimming', booked: 10, cap: 20 }],
  13: [{ name: 'Arts & Crafts', booked: 50, cap: 50, missing: 2 }],
  14: [{ name: 'Beach Day', booked: 8, cap: 30 }],
};

/* ════════════════════════════════════════════════════════
   TOP BAR + LEFT NAV
   ════════════════════════════════════════════════════════ */
function TopBar() {
  const tab = (label, active) => (
    <span style={{
      padding: '18px 4px', fontSize: 15, fontWeight: active ? 600 : 500,
      color: active ? 'var(--sd-colour-action-primary)' : 'var(--sd-colour-text-secondary)',
      borderBottom: active ? '2px solid var(--sd-colour-action-primary)' : '2px solid transparent', cursor: 'pointer',
    }}>{label}</span>
  );
  const ic = (n) => <span style={{ color: 'var(--sd-colour-action-primary)', cursor: 'pointer', display: 'inline-flex' }}><Icon name={n} size={20} /></span>;
  return (
    <header style={{
      height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px',
      background: 'var(--sd-colour-surface-default)', borderBottom: '1px solid var(--sd-colour-grey-200)',
    }}>
      <Emblem size={26} />
      <span style={{ color: 'var(--sd-colour-text-secondary)', display: 'inline-flex', cursor: 'pointer' }}><Icon name="menu" size={22} /></span>
      <nav style={{ display: 'flex', gap: 26, alignItems: 'center' }}>{tab('Office', true)}{tab('Playground', false)}</nav>
      <div style={{ flex: 1 }} />
      {ic('eye')}{ic('bell')}{ic('chat')}
      <span style={{ fontSize: 14, color: 'var(--sd-colour-text-primary)' }}>Hi Alex</span>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid var(--sd-colour-action-primary)', color: 'var(--sd-colour-action-primary)', fontSize: 13, fontWeight: 600,
      }}>AB</span>
    </header>
  );
}

function LeftNav({ screen, go }) {
  const isVC = ['calendar', 'programs', 'setup', 'bulk', 'forms'].includes(screen);
  const itemRow = (content, { active, onClick, sub } = {}) => (
    <div onClick={onClick} className="vc-row" style={{
      display: 'flex', alignItems: 'center', gap: 12, height: sub ? 38 : 42, cursor: 'pointer',
      padding: sub ? '0 16px 0 50px' : '0 16px', fontSize: 14,
      color: active ? 'var(--sd-colour-text-primary)' : 'var(--sd-colour-text-secondary)',
      fontWeight: active ? 600 : 400,
      background: active && sub ? 'var(--sd-colour-grey-100)' : 'transparent',
    }}>{content}</div>
  );
  return (
    <aside style={{
      width: 248, flexShrink: 0, background: 'var(--sd-colour-surface-default)',
      borderRight: '1px solid var(--sd-colour-grey-200)', overflowY: 'auto', paddingBottom: 20,
    }}>
      <div style={{ textAlign: 'center', padding: '18px 16px 12px', fontSize: 13, color: 'var(--sd-colour-text-secondary)' }}>Little Bugs ELC</div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ ...fieldBoxStyle, height: 42, justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: 14 }}>Little Bugs</span><Icon name="chevronDown" size={18} style={{ color: 'var(--sd-colour-text-secondary)' }} />
        </div>
      </div>
      {NAV.map(n => (
        <div key={n.label}>
          {itemRow(
            <>
              <Icon name={n.icon} size={19} style={{ color: 'var(--sd-colour-text-secondary)' }} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.children && <Icon name={isVC ? 'chevronUp' : 'chevronDown'} size={16} style={{ color: 'var(--sd-colour-text-secondary)' }} />}
              {n.caret && <Icon name="chevronRight" size={16} style={{ color: 'var(--sd-colour-text-secondary)' }} />}
            </>,
            { active: n.children && isVC }
          )}
          {n.children && isVC && n.children.map(c =>
            <div key={c.label}>{itemRow(<span style={{ flex: 1 }}>{c.label}</span>,
              { sub: true, active: screen === c.screen || (screen === 'forms' && c.screen === 'calendar'), onClick: () => go(c.screen) })}</div>
          )}
        </div>
      ))}
    </aside>
  );
}

/* page heading helper */
function PageHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h1>
        {sub && <div style={{ marginTop: 4, fontSize: 15, color: 'var(--sd-colour-text-secondary)' }}>{sub}</div>}
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CALENDAR
   ════════════════════════════════════════════════════════ */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MIN_IDX = 2025 * 12 + 0;   // Jan 2025
const MAX_IDX = 2027 * 12 + 11;  // Dec 2027
const DATA_YM = { y: 2026, m: 2 }; // March 2026 holds the demo activities

function CalendarScreen({ go }) {
  const [ym, setYm] = useState(DATA_YM);
  const first = new Date(ym.y, ym.m, 1).getDay();      // 0=Sun … 6=Sat
  const lead = (first + 6) % 7;                          // Monday-start offset
  const total = new Date(ym.y, ym.m + 1, 0).getDate();  // days in month
  const cells = [...Array(lead).fill(null), ...Array(total).fill(0).map((_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const idx = ym.y * 12 + ym.m;
  const step = (d) => { const n = Math.max(MIN_IDX, Math.min(MAX_IDX, idx + d)); setYm({ y: Math.floor(n / 12), m: n % 12 }); };
  const isDataMonth = ym.y === DATA_YM.y && ym.m === DATA_YM.m;

  return (
    <div>
      <PageHead title="Vacation Care Calendar" right={<ViewSwitch current="calendar" go={go} />} />
      <div style={{ background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-200)', borderRadius: 'var(--sd-radius-lg)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <button type="button" onClick={() => step(-1)} disabled={idx <= MIN_IDX} className="vc-iconbtn fp-btn" style={{ ...navBtn, opacity: idx <= MIN_IDX ? 0.4 : 1 }}><Icon name="chevronLeft" size={18} /></button>
          <div style={{ fontSize: 20, fontWeight: 700, minWidth: 168, textAlign: 'center' }}>{MONTHS[ym.m]} {ym.y}</div>
          <button type="button" onClick={() => step(1)} disabled={idx >= MAX_IDX} className="vc-iconbtn fp-btn" style={{ ...navBtn, opacity: idx >= MAX_IDX ? 0.4 : 1 }}><Icon name="chevronRight" size={18} /></button>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={() => setYm(DATA_YM)} className="ds-btn ds-btn--ghost fp-btn" style={{ height: 40 }}>Today</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {DAYS.map(d => <div key={d} style={{ fontSize: 13, color: 'var(--sd-colour-text-secondary)', padding: '0 4px 6px' }}>{d}</div>)}
          {cells.map((day, i) => {
            const acts = (isDataMonth && day) ? CAL_ACTIVITIES[day] : null;
            const inProgram = isDataMonth && day >= 12 && day <= 18;
            return (
              <div key={i} style={{
                minHeight: 96, borderRadius: 10, padding: 8, border: '1px solid var(--sd-colour-grey-200)',
                background: day ? (inProgram ? 'var(--sd-colour-surface-cyan)' : 'var(--sd-colour-surface-default)') : 'transparent',
                borderColor: day ? 'var(--sd-colour-grey-200)' : 'transparent',
              }}>
                {day && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{day}</div>}
                {acts && acts.map((a, j) => (
                  <button type="button" key={j} onClick={() => go('forms', { activity: a.name })}
                    className="fp-btn" style={{
                      display: 'block', width: '100%', textAlign: 'left', marginBottom: 5, padding: '5px 7px', cursor: 'pointer',
                      background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-300)', borderRadius: 7,
                    }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sd-colour-text-primary)' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--sd-colour-text-secondary)' }}>{a.booked}/{a.cap} booked</div>
                    {a.missing && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sd-colour-feedback-error-default)' }}>{a.missing} forms missing</div>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const navBtn = { width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid var(--sd-colour-action-primary)', background: 'transparent', color: 'var(--sd-colour-action-primary)', cursor: 'pointer' };

/* ════════════════════════════════════════════════════════
   PROGRAMS (List View)
   ════════════════════════════════════════════════════════ */
function ProgramsScreen({ go, programs, onDuplicate, onAskDelete }) {
  const [filter, setFilter] = useState('all');
  const counts = {
    all: programs.length,
    published: programs.filter(p => p.status === 'published').length,
    draft: programs.filter(p => p.status === 'draft').length,
    completed: programs.filter(p => p.timing.label === 'Completed').length,
  };
  const shown = programs.filter(p =>
    filter === 'all' ? true :
    filter === 'completed' ? p.timing.label === 'Completed' : p.status === filter);

  const fpill = (key, label) => (
    <SelPill key={key} selected={filter === key} onClick={() => setFilter(key)}>{label} ({counts[key]})</SelPill>
  );

  return (
    <div>
      <PageHead title="Vacation Care Programs" right={<ViewSwitch current="programs" go={go} />} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <SearchBar placeholder="Search" />
        {fpill('all', 'All')}{fpill('published', 'Published')}{fpill('draft', 'Draft')}{fpill('completed', 'Completed')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shown.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
            background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-200)', borderRadius: 'var(--sd-radius-lg)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: 'var(--sd-colour-text-secondary)', marginBottom: 8 }}>{p.dates} · {p.dur}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Pill tone={p.status === 'published' ? 'green' : 'purple'}>{p.status === 'published' ? 'Published' : 'Draft'}</Pill>
                <Pill tone={p.timing.tone} icon={p.timing.icon}>{p.timing.label}</Pill>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {(p.status === 'published') && <IconBtn icon="eye" label="View program" size={52} radius="var(--sd-radius-lg)" iconSize={22} onClick={() => go('setup', { name: p.name, readonly: true })} />}
              <IconBtn icon="edit" label="Edit program" size={52} radius="var(--sd-radius-lg)" iconSize={22} onClick={() => go('setup', { name: p.name })} />
              <IconBtn icon="copy" label="Duplicate program" size={52} radius="var(--sd-radius-lg)" iconSize={22} onClick={() => onDuplicate(p)} />
              <IconBtn icon="trash" label="Delete program" size={52} radius="var(--sd-radius-lg)" iconSize={22} onClick={() => onAskDelete(p)} />
            </div>
          </div>
        ))}
        {!shown.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--sd-colour-text-secondary)' }}>No programs in this view.</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <Btn variant="solid" icon="plus" onClick={() => go('setup', { name: '' })}>Add</Btn>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PROGRAM SETUP  (activity rows + contextual ⋯ menu)
   ════════════════════════════════════════════════════════ */
function SetupScreen({ ctx }) {
  const { week, setWeek, openForm, dupActivity, delActivity, removeForm, openMenu, setOpenMenu, programName, setProgramName, readonly } = ctx;

  const toggleDay = (d) => setWeek(w => ({ ...w, days: { ...w.days, [d]: !w.days[d] } }));
  const setField = (day, id, key, val) => setWeek(w => ({
    ...w, activities: { ...w.activities, [day]: w.activities[day].map(a => a.id === id ? { ...a, [key]: val } : a) },
  }));
  const addActivity = (day) => setWeek(w => ({
    ...w, activities: { ...w.activities, [day]: [...w.activities[day], { id: uid(), name: '', fee: '', room: '', form: null }] },
  }));

  const activeDays = DAYS.filter(d => week.days[d]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <a onClick={() => ctx.go('programs')} style={{ fontSize: 14, color: 'var(--sd-colour-text-link)', cursor: 'pointer' }}>‹ Back to all Programs</a>
      </div>
      <PageHead title="Program Setup"
        right={<Btn variant="solid" onClick={() => ctx.save()}>{readonly ? 'Done' : 'Save'}</Btn>} />

      {/* Program details */}
      <Section title="Program Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <TextField label="Program Name" placeholder="Name of Holiday Program" value={programName} onChange={setProgramName} />
          <SelectField label="Number of weeks" placeholder="Enter the number of weeks" value="2 weeks" options={['1 week', '2 weeks', '3 weeks']} onChange={() => {}} />
          <TextField label="Holiday start date" placeholder="Enter the start date" />
          <TextField label="Parent booking opens" placeholder="Enter the date booking opens" />
        </div>
      </Section>

      {/* Week 1 */}
      <Section title="Week 1" headRight={<span style={{ fontSize: 13, color: 'var(--sd-colour-text-secondary)' }}>9 March 2026 – 13 March 2026</span>}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {DAYS.map(d => (
            <SelPill key={d} selected={week.days[d]} onClick={() => toggleDay(d)}
              style={{ width: 44, height: 44, justifyContent: 'center', padding: 0, borderRadius: 'var(--sd-radius-m)' }}>{d[0]}</SelPill>
          ))}
          <div style={{ flex: 1 }} />
          <button type="button" className="ds-btn ds-btn--minimal fp-btn" style={{ height: 40 }}>Clear days</button>
        </div>

        {activeDays.map(day => (
          <div key={day} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{DAY_FULL[day]}</span>
              {/* form indicator(s) — sit alongside the day title */}
              {week.activities[day].filter(a => a.form).map(a => (
                <span key={a.id} title={`${a.name || 'Activity'}: ${a.form.name}${a.form.mandatory ? ' (mandatory)' : ''}`}>
                  <Pill tone={a.form.mandatory ? 'green' : 'grey'} icon="doc">{a.form.mandatory ? 'Form · required' : 'Form'}</Pill></span>
              ))}
            </div>
            {week.activities[day].map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <TextField label="Name" placeholder="Name of Activity" value={a.name} onChange={v => setField(day, a.id, 'name', v)} style={{ flex: 1.4 }} />
                <SelectField label="Fee" placeholder="Select a fee" value={a.fee} options={FEES} onChange={v => setField(day, a.id, 'fee', v)} style={{ flex: 1 }} />
                <SelectField label="Room" placeholder="Select a room" value={a.room} options={ROOMS} onChange={v => setField(day, a.id, 'room', v)} style={{ flex: 1 }} />
                {/* ⋯ menu */}
                <div style={{ position: 'relative', marginLeft: 4 }} onClick={e => e.stopPropagation()}>
                  <IconBtn icon="kebab" label="Activity options" tone="ghost" size={48} radius="var(--sd-radius-lg)" iconSize={22} onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)} />
                  {openMenu === a.id && (
                    <RowMenu activity={a} day={day}
                      onAddEdit={() => { openForm(day, a); setOpenMenu(null); }}
                      onRemoveForm={() => { removeForm(day, a.id); setOpenMenu(null); }}
                      onDup={() => { dupActivity(day, a.id); setOpenMenu(null); }}
                      onDel={() => { delActivity(day, a.id); setOpenMenu(null); }} />
                  )}
                </div>
              </div>
            ))}
            <a onClick={() => addActivity(day)} style={{ fontSize: 13, color: 'var(--sd-colour-text-link)', cursor: 'pointer' }}>+ Add activity</a>
          </div>
        ))}
      </Section>
    </div>
  );
}

/* contextual row menu — the answer to the Manage Form question:
   no form  → Add form · Duplicate · Delete
   has form → Edit form · Remove form · Duplicate · Delete  */
function RowMenu({ activity, onAddEdit, onRemoveForm, onDup, onDel }) {
  const hasForm = !!activity.form;
  const item = (label, onClick, danger) => (
    <button type="button" onClick={onClick} className="vc-row fp-btn" style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 14, cursor: 'pointer',
      background: 'transparent', border: 'none', color: danger ? 'var(--sd-colour-feedback-error-default)' : 'var(--sd-colour-text-primary)',
    }}>{label}</button>
  );
  return (
    <div style={{
      position: 'absolute', top: 56, right: 0, zIndex: 40, width: 184,
      background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-200)',
      borderRadius: 'var(--sd-radius-m)', boxShadow: '0 12px 32px rgba(0,0,0,0.16)', overflow: 'hidden',
    }}>
      {item(hasForm ? 'Edit form' : 'Add form', onAddEdit)}
      {hasForm && item('Remove form', onRemoveForm, true)}
      <div style={{ borderTop: '1px solid var(--sd-colour-grey-200)' }} />
      {item('Duplicate', onDup)}
      {item('Delete', onDel, true)}
    </div>
  );
}

function Section({ title, headRight, children }) {
  return (
    <div style={{ background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-200)', borderRadius: 'var(--sd-radius-lg)', padding: 22, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2><div style={{ flex: 1 }} />{headRight}
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FORM PANEL (slide-over) — add / edit / remove an attached form
   ════════════════════════════════════════════════════════ */
function FormPanel({ state, onClose, onSave, onRemove }) {
  const editing = state.mode === 'edit';
  const [name, setName] = useState(state.draft.name || '');
  const [file, setFile] = useState(state.draft.file || null);
  const [mandatory, setMandatory] = useState(!!state.draft.mandatory);

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(37,37,37,0.4)', zIndex: 80 }} />
      <div role="dialog" aria-label={editing ? 'Edit form' : 'Add form'} style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, maxHeight: '86%',
        zIndex: 90, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--sd-colour-surface-default)', borderRadius: 'var(--sd-radius-lg)', boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 24px 12px' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{editing ? 'Edit form' : 'Add form'}</h2>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} aria-label="Close" className="vc-iconbtn fp-btn"
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--sd-colour-surface-cyan)', color: 'var(--sd-colour-action-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '0 24px', fontSize: 13, color: 'var(--sd-colour-text-secondary)', marginBottom: 18 }}>
          Attached to <b style={{ color: 'var(--sd-colour-text-primary)' }}>{state.activityName || 'this activity'}</b>
        </div>

        <div style={{ padding: '12px 24px 0', overflowY: 'auto', flex: 1 }}>
          <TextField label="Form name" placeholder="e.g. Excursion consent form" value={name} onChange={setName} style={{ marginBottom: 20 }} />

          <div style={{ fontSize: 13, color: 'var(--sd-colour-text-secondary)', marginBottom: 6 }}>Form upload</div>
          {!file ? (
            <div style={{
              border: '1.5px dashed var(--sd-colour-action-primary)', borderRadius: 'var(--sd-radius-lg)',
              background: 'var(--sd-colour-feedback-success-subtle)', padding: '26px 20px', textAlign: 'center',
            }}>
              <div style={{ color: 'var(--sd-colour-action-primary)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icon name="upload" size={28} /></div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Drag and drop a document here</div>
              <div style={{ fontSize: 12, color: 'var(--sd-colour-text-secondary)', marginBottom: 14 }}>Accepted: PDF, DOC, DOCX · max 10 MB</div>
              <Btn variant="solid" onClick={() => setFile('excursion-consent.pdf')}>Browse</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--sd-colour-grey-300)', borderRadius: 'var(--sd-radius-lg)' }}>
              <Icon name="doc" size={22} style={{ color: 'var(--sd-colour-action-primary)' }} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</div>
              <button type="button" onClick={() => setFile(null)} aria-label="Replace file" title="Remove file"
                className="fp-btn" style={{ border: 'none', background: 'transparent', color: 'var(--sd-colour-text-secondary)', cursor: 'pointer', display: 'inline-flex' }}><Icon name="close" size={18} /></button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 22 }}>
            <Toggle on={mandatory} onChange={setMandatory} label="Mandatory form" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Mandatory form</div>
              <div style={{ fontSize: 12, color: 'var(--sd-colour-text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
                Parents must complete this form before their booking for the activity is confirmed.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 22, borderTop: '1px solid var(--sd-colour-grey-200)' }}>
          {editing && <button type="button" onClick={onRemove} className="ds-btn ds-btn--minimal fp-btn"
            style={{ color: 'var(--sd-colour-feedback-error-default)', paddingLeft: 0 }}>Remove form</button>}
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" disabled={!name} onClick={() => onSave({ name, file, mandatory })}>Save</Btn>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   FORMS TRACKING TABLE
   ════════════════════════════════════════════════════════ */
function FormsScreen({ ctx }) {
  const { activity, notify } = ctx;
  const [statusFilter, setStatusFilter] = useState('all');
  const [sel, setSel] = useState({});

  const rows = FORMS_ROWS.filter(r => statusFilter === 'all' ? true : r.status === statusFilter);
  const missingCount = FORMS_ROWS.filter(r => r.status === 'missing').length;
  const allSel = rows.length && rows.every((_, i) => sel[i]);
  const cols = ['Child’s first name', 'Child’s last name', 'Primary carer', 'Form name', 'Attached by', 'Status', 'Upload date'];

  return (
    <div>
      <a onClick={() => ctx.go('calendar')} style={{ fontSize: 14, color: 'var(--sd-colour-text-link)', cursor: 'pointer' }}>‹ Back to Calendar View</a>
      <div style={{ marginTop: 8 }}>
        <PageHead title={activity || 'Arts & Crafts'} sub="13th March 2026"
          right={<Btn variant="ghost" icon="send" onClick={() => notify(missingCount)}>Notify missing forms ({missingCount})</Btn>} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <SearchBar placeholder="Search children" />
        {[['all', 'All'], ['received', 'Received'], ['missing', 'Missing']].map(([k, l]) => (
          <SelPill key={k} selected={statusFilter === k} onClick={() => setStatusFilter(k)}>{l}</SelPill>
        ))}
      </div>

      <div style={{ background: 'var(--sd-colour-surface-default)', border: '1px solid var(--sd-colour-grey-200)', borderRadius: 'var(--sd-radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--sd-colour-grey-50)', textAlign: 'left' }}>
              <th style={{ ...thStyle, width: 44 }}>
                <input type="checkbox" checked={!!allSel} onChange={e => { const v = e.target.checked; const n = {}; rows.forEach((_, i) => n[i] = v); setSel(n); }} />
              </th>
              <th style={{ ...thStyle, width: 90 }}>Actions</th>
              {cols.map(c => <th key={c} style={thStyle}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="vc-row" style={{ borderTop: '1px solid var(--sd-colour-grey-200)' }}>
                <td style={tdStyle}><input type="checkbox" checked={!!sel[i]} onChange={e => setSel(s => ({ ...s, [i]: e.target.checked }))} /></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconBtn icon="eye" label="View form" size={32} />
                    <IconBtn icon="mail" label="Send reminder" size={32} />
                  </div>
                </td>
                <td style={tdStyle}>{r.first}</td>
                <td style={tdStyle}>{r.last}</td>
                <td style={tdStyle}>{r.carer}</td>
                <td style={tdStyle}>{r.form}</td>
                <td style={{ ...tdStyle, color: r.by ? 'inherit' : 'var(--sd-colour-text-secondary)' }}>{r.by || '—'}</td>
                <td style={tdStyle}><Pill tone={r.status === 'received' ? 'green' : 'orange'}>{r.status === 'received' ? 'Received' : 'Missing'}</Pill></td>
                <td style={{ ...tdStyle, color: r.status === 'missing' ? 'var(--sd-colour-text-secondary)' : 'inherit' }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const thStyle = { padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--sd-colour-text-secondary)', textTransform: 'none' };
const tdStyle = { padding: '14px 16px', color: 'var(--sd-colour-text-primary)', verticalAlign: 'middle' };

/* ════════════════════════════════════════════════════════
   BULK (placeholder — out of v1 scope)
   ════════════════════════════════════════════════════════ */
function BulkScreen() {
  return (
    <div>
      <PageHead title="Vacation Care — Bulk Import" />
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--sd-colour-text-secondary)', background: 'var(--sd-colour-surface-default)', border: '1px dashed var(--sd-colour-grey-300)', borderRadius: 'var(--sd-radius-lg)' }}>
        Bulk import wizard is out of scope for this prototype (v1).
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DELETE CONFIRM
   ════════════════════════════════════════════════════════ */
function ConfirmDialog({ program, onCancel, onConfirm }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(37,37,37,0.4)', zIndex: 80 }} />
      <div role="alertdialog" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 90, width: 420,
        background: 'var(--sd-colour-surface-default)', borderRadius: 'var(--sd-radius-lg)', padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{ color: 'var(--sd-colour-feedback-error-default)' }}><Icon name="warning" size={26} /></span>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Delete this program?</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--sd-colour-text-secondary)', lineHeight: 1.5 }}>
              <b>{program.name}</b> will be permanently deleted.{program.status === 'published' ? ' It is published and may have live bookings.' : ''} This can’t be undone.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="destructive" onClick={onConfirm}>Delete program</Btn>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   APP / STATE MACHINE
   ════════════════════════════════════════════════════════ */
function FlowApp() {
  const params = new URLSearchParams(window.location.search);
  // accept ?screen= or ?step= (the dev-handoff deep-link param) as the entry screen
  const [screen, setScreen] = useState(params.get('screen') || params.get('step') || 'calendar');
  const [nav, setNav] = useState({});                 // per-screen entry args
  const [programs, setPrograms] = useState(SEED_PROGRAMS);
  const [week, setWeek] = useState(SEED_WEEK);
  const [programName, setProgramName] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [formPanel, setFormPanel] = useState(null);   // {mode, day, activityId, activityName, draft}
  const [confirm, setConfirm] = useState(null);       // program pending delete
  const [toast, setToast] = useState(null);

  const go = (s, args = {}) => { setScreen(s); setNav(args); setOpenMenu(null); if (s === 'setup') setProgramName(args.name || ''); };
  const flash = (msg, icon) => { setToast({ msg, icon }); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2600); };

  // setup helpers
  const openForm = (day, a) => setFormPanel({
    mode: a.form ? 'edit' : 'add', day, activityId: a.id, activityName: a.name,
    draft: a.form || { name: '', file: null, mandatory: false },
  });
  const saveForm = (data) => {
    setWeek(w => ({ ...w, activities: { ...w.activities,
      [formPanel.day]: w.activities[formPanel.day].map(a => a.id === formPanel.activityId ? { ...a, form: data } : a) } }));
    flash(formPanel.mode === 'edit' ? 'Form updated' : 'Form attached');
    setFormPanel(null);
  };
  const removeFormFromPanel = () => {
    setWeek(w => ({ ...w, activities: { ...w.activities,
      [formPanel.day]: w.activities[formPanel.day].map(a => a.id === formPanel.activityId ? { ...a, form: null } : a) } }));
    flash('Form removed', 'trash'); setFormPanel(null);
  };
  const removeForm = (day, id) => { setWeek(w => ({ ...w, activities: { ...w.activities, [day]: w.activities[day].map(a => a.id === id ? { ...a, form: null } : a) } })); flash('Form removed', 'trash'); };
  const dupActivity = (day, id) => setWeek(w => { const a = w.activities[day].find(x => x.id === id); return { ...w, activities: { ...w.activities, [day]: [...w.activities[day], { ...a, id: uid() }] } }; });
  const delActivity = (day, id) => setWeek(w => ({ ...w, activities: { ...w.activities, [day]: w.activities[day].filter(a => a.id !== id) } }));

  // programs helpers
  const onDuplicate = (p) => { setPrograms(ps => [...ps, { ...p, id: p.id + '-c' + (_uid++), name: p.name + ' (copy)', status: 'draft', timing: { label: 'Draft copy', tone: 'purple' } }]); flash('Program duplicated'); };
  const onAskDelete = (p) => setConfirm(p);
  const doDelete = () => { setPrograms(ps => ps.filter(x => x.id !== confirm.id)); flash('Program deleted', 'trash'); setConfirm(null); };

  const setupCtx = { go, week, setWeek, programName, setProgramName, readonly: nav.readonly,
    openForm, dupActivity, delActivity, removeForm, openMenu, setOpenMenu,
    save: () => { go('programs'); flash(nav.readonly ? 'Closed' : 'Program saved'); } };
  const formsCtx = { go, activity: nav.activity, notify: (n) => flash(`Reminder sent to ${n} ${n === 1 ? 'family' : 'families'}`, 'send') };

  return (
    <div className="browser">
      <div className="browser-bar">
        <span className="traffic"><i /><i /><i /></span>
        <span className="url">app.xplor.io/office/vacation-care/{screen}</span>
      </div>
      <div className="browser-screen" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <LeftNav screen={screen} go={go} />
          <main onClick={() => openMenu && setOpenMenu(null)} style={{ flex: 1, overflowY: 'auto', background: 'var(--sd-colour-surface-grey)', padding: '28px 32px' }}>
            <div style={{ maxWidth: 1080, margin: '0 auto' }}>
              {screen === 'calendar' && <CalendarScreen go={go} />}
              {screen === 'programs' && <ProgramsScreen go={go} programs={programs} onDuplicate={onDuplicate} onAskDelete={onAskDelete} />}
              {screen === 'setup' && <SetupScreen ctx={setupCtx} />}
              {screen === 'forms' && <FormsScreen ctx={formsCtx} />}
              {screen === 'bulk' && <BulkScreen />}
            </div>
          </main>
        </div>
        {formPanel && <FormPanel state={formPanel} onClose={() => setFormPanel(null)} onSave={saveForm} onRemove={removeFormFromPanel} />}
        {confirm && <ConfirmDialog program={confirm} onCancel={() => setConfirm(null)} onConfirm={doDelete} />}
        <Toast toast={toast} />
      </div>
    </div>
  );
}

window.FlowApp = FlowApp;
