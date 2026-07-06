/*
 * Office Migration Board — Calendar workbench (wb-calendar).
 *
 * ds-calendar — ONE component replacing the legacy pair that shipped on two
 * different foundations: Calendar (a Vue Cal wrapper) and CalendarMonthly (an
 * undocumented, heavily modified Vuetify calendar). Flagged as a genuine
 * design moment, so this wave is a DESIGN EXPLORATION: the same month view in
 * three visual directions (Operational / Clean / Soft) for review — identical
 * data, month logic, keyboard model and class contract; direction is a pure
 * CSS modifier. The extraction decision picks ONE direction as the default.
 *
 * Real month rendering (system month, Monday-first, outside days), prev/next/
 * today nav ≥44px, WAI-ARIA grid semantics with roving tabindex (same approach
 * as wb/datetime.jsx — this calendar is the date picker's bigger sibling).
 * Day detail: side panel on wide; the shipped ds-sheet in the phone frame.
 * Phone presentation collapses the month to a day-grouped agenda list (sticky
 * day headers, month nav retained) instead of shrinking the grid.
 *
 * New ds-* classes live in wip/calendar.css (--sd- tokens only); shipped
 * classes (ds-sheet, ds-btn) are reused verbatim. No innerHTML anywhere.
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useEffect, useMemo, useRef } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, StateNote, icons, cx } = window.WB;

  /* ── local inline SVGs (currentColor, aria-hidden) ─────────────────────── */
  const ChevronLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  /* tiny category glyphs for the Soft direction's event pills */
  const CatIcon = ({ cat }) => {
    if (cat === 'bookings') {
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.2 5.2 4.5 6.4 6.9 3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (cat === 'staffing') {
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="3.4" r="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1.5 9c.6-2 1.9-3 3.5-3s2.9 1 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.2 7.8 7.8 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  /* ── date helpers (real logic, no library — mirrors wb/datetime.jsx) ───── */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Monday-first
  const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const pad2 = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const fromIso = (iso) => { const [y, m, day] = iso.split('-').map(Number); return new Date(y, m - 1, day); };
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);
  const TODAY_ISO = isoOf(TODAY);

  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const addMonthsClamped = (d, n) => {
    const y = d.getFullYear();
    const m = d.getMonth() + n;
    const last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(d.getDate(), last));
  };
  const mondayIndex = (d) => (d.getDay() + 6) % 7; // 0 = Monday

  /* full weeks covering a month — leading/trailing cells from the
     neighbouring months (rendered as --outside) */
  function monthWeeks(year, month) {
    const offset = mondayIndex(new Date(year, month, 1));
    const total = offset + new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil(total / 7);
    const weeks = [];
    for (let r = 0; r < rows; r++) {
      const week = [];
      for (let c = 0; c < 7; c++) week.push(new Date(year, month, r * 7 + c + 1 - offset));
      weeks.push(week);
    }
    return weeks;
  }

  const dayTitle = (d) => `${WEEKDAYS_LONG[mondayIndex(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

  /* ── sample events (fictional; BMS-shaped: bookings / staffing / closures).
     Generated for whatever month is in view so month nav stays alive; day 17
     is deliberately overloaded (6 entries) to expose each direction's
     overflow answer. Day numbers clamp to short months. ─────────────────── */
  const CATS = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'staffing', label: 'Staffing' },
    { id: 'closures', label: 'Closures' },
  ];
  const CAT_LABEL = { bookings: 'Bookings', staffing: 'Staffing', closures: 'Closures' };

  function monthEvents(y, m) {
    const last = new Date(y, m + 1, 0).getDate();
    const iso = (n) => isoOf(new Date(y, m, Math.min(n, last)));
    const E = (day, cat, label) => ({ iso: iso(day), cat, label });
    return [
      E(2, 'staffing', 'Roster published'),
      E(3, 'bookings', 'Kinder excursion — City Farm'),
      E(5, 'bookings', '36 casual bookings'),
      E(6, 'closures', 'Kitchen closed — maintenance'),
      E(9, 'staffing', 'Staff PD day — child safety'),
      E(11, 'bookings', 'Vacation care bookings open'),
      E(13, 'staffing', 'Relief educator — Sam T'),
      /* the overloaded day */
      E(17, 'bookings', 'Kinder excursion — Zoo'),
      E(17, 'bookings', '41 casual bookings'),
      E(17, 'staffing', 'Staff PD — first-aid renewal'),
      E(17, 'staffing', 'Relief educator — Priya K'),
      E(17, 'closures', 'Toddler room closed — carpet works'),
      E(17, 'staffing', 'Parent committee meeting'),
      E(20, 'bookings', 'Billing week starts'),
      E(22, 'closures', 'Centre closed — public holiday'),
      E(24, 'bookings', 'Photo day'),
      E(26, 'staffing', 'Educator appraisals'),
      E(28, 'bookings', '29 casual bookings'),
    ];
  }

  /* ── shared head: month label + Today / prev / next (all ≥44px) ────────── */
  function CalendarHead({ view, setView, monthId }) {
    return (
      <div className="ds-calendar__head">
        <h4 className="ds-calendar__month" id={monthId} aria-live="polite">
          {MONTHS[view.m]} {view.y}
        </h4>
        <button
          type="button"
          className="ds-calendar__nav ds-calendar__nav--today"
          onClick={() => setView({ y: TODAY.getFullYear(), m: TODAY.getMonth() })}
        >
          Today
        </button>
        <button
          type="button"
          className="ds-calendar__nav"
          aria-label="Previous month"
          onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))}
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          className="ds-calendar__nav"
          aria-label="Next month"
          onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))}
        >
          <ChevronRightIcon />
        </button>
      </div>
    );
  }

  /* ── per-direction event rendering inside a day cell ───────────────────── */
  function DayEvents({ direction, events, dense }) {
    if (!events.length) return null;
    if (direction === 'clean') {
      // dot markers: one per category present; >3 events adds a quiet count
      const present = CATS.filter((c) => events.some((e) => e.cat === c.id));
      return (
        <span className="ds-calendar__events" aria-hidden="true">
          <span className="ds-calendar__dots">
            {present.map((c) => (
              <span key={c.id} className={cx('ds-calendar__dot', `ds-calendar__dot--${c.id}`)}></span>
            ))}
          </span>
          {events.length > 3 && <span className="ds-calendar__more">{events.length}</span>}
        </span>
      );
    }
    // operational: chips (+N badge). soft: icon pills (+N pill).
    const max = direction === 'soft' ? 2 : (dense ? 2 : 3);
    return (
      <span className="ds-calendar__events" aria-hidden="true">
        {events.slice(0, max).map((ev, i) => (
          <span key={i} className={cx('ds-calendar__event', `ds-calendar__event--${ev.cat}`)}>
            {direction === 'soft' && <CatIcon cat={ev.cat} />}
            <span className="ds-calendar__event-label">{ev.label}</span>
          </span>
        ))}
        {events.length > max && <span className="ds-calendar__more">+{events.length - max}</span>}
      </span>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     MonthGrid — WAI-ARIA grid: role=grid / row / columnheader / gridcell,
     roving tabindex; arrows move a day/week, PageUp/Down a month, Home/End
     week bounds, Enter/Space select (native button activation). Same model
     as the ds-date-picker month grid in wb/datetime.jsx.
     ══════════════════════════════════════════════════════════════════════ */
  function MonthGrid({ direction, dense, view, setView, eventsByIso, selectedIso, onSelectDay, monthId }) {
    const [focusIso, setFocusIso] = useState(TODAY_ISO);
    const gridRef = useRef(null);
    const pendingFocus = useRef(false);

    const weeks = monthWeeks(view.y, view.m);
    const rendered = new Set();
    weeks.forEach((w) => w.forEach((d) => rendered.add(isoOf(d))));
    // roving-tabindex anchor: last focused day if visible, else 1st of month
    const activeIso = rendered.has(focusIso) ? focusIso : isoOf(new Date(view.y, view.m, 1));

    const showDate = (d) => {
      if (d.getMonth() !== view.m || d.getFullYear() !== view.y) {
        setView({ y: d.getFullYear(), m: d.getMonth() });
      }
      setFocusIso(isoOf(d));
    };

    const onGridKey = (e) => {
      const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      const cur = fromIso(activeIso);
      let target = null;
      if (e.key in deltas) target = addDays(cur, deltas[e.key]);
      else if (e.key === 'PageUp') target = addMonthsClamped(cur, -1);
      else if (e.key === 'PageDown') target = addMonthsClamped(cur, 1);
      else if (e.key === 'Home') target = addDays(cur, -mondayIndex(cur));
      else if (e.key === 'End') target = addDays(cur, 6 - mondayIndex(cur));
      if (!target) return;
      e.preventDefault();
      showDate(target);
      pendingFocus.current = true;
    };

    // after a keyboard move (possibly across months), focus follows the cell
    useEffect(() => {
      if (!pendingFocus.current || !gridRef.current) return;
      pendingFocus.current = false;
      const btn = gridRef.current.querySelector(`[data-iso="${focusIso}"]`);
      if (btn) btn.focus();
    });

    return (
      <div className="ds-calendar__grid" role="grid" aria-labelledby={monthId} ref={gridRef} onKeyDown={onGridKey}>
        <div className="ds-calendar__weekdays" role="row">
          {WEEKDAYS_SHORT.map((w, i) => (
            <span key={w} role="columnheader" aria-label={WEEKDAYS_LONG[i]} className="ds-calendar__weekday">{w}</span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={isoOf(week[0])} className="ds-calendar__row" role="row">
            {week.map((d) => {
              const dIso = isoOf(d);
              const outside = d.getMonth() !== view.m;
              const weekend = mondayIndex(d) >= 5;
              const isSel = dIso === selectedIso;
              const dayEvents = eventsByIso.get(dIso) || [];
              const label = `${dayTitle(d)} ${d.getFullYear()}`
                + (dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : '');
              return (
                <div key={dIso} className="ds-calendar__cell" role="gridcell" aria-selected={isSel}>
                  <button
                    type="button"
                    className={cx(
                      'ds-calendar__day',
                      outside && 'ds-calendar__day--outside',
                      weekend && 'ds-calendar__day--weekend',
                      dIso === TODAY_ISO && 'ds-calendar__day--today',
                      isSel && 'ds-calendar__day--selected'
                    )}
                    data-iso={dIso}
                    tabIndex={dIso === activeIso ? 0 : -1}
                    aria-label={label}
                    aria-current={dIso === TODAY_ISO ? 'date' : undefined}
                    onFocus={() => setFocusIso(dIso)}
                    onClick={() => {
                      showDate(d); // outside days also flip the view to their month
                      onSelectDay(dIso);
                    }}
                  >
                    <span className="ds-calendar__daynum">{d.getDate()}</span>
                    {!outside && <DayEvents direction={direction} events={dayEvents} dense={dense} />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  /* ── shared event row (side panel, agenda list, sheet) ─────────────────── */
  function EventRow({ ev }) {
    return (
      <div className={cx('ds-calendar__agenda-item', `ds-calendar__agenda-item--${ev.cat}`)}>
        <span className={cx('ds-calendar__dot', `ds-calendar__dot--${ev.cat}`)} aria-hidden="true"></span>
        <span className="ds-calendar__agenda-label">{ev.label}</span>
        <span className="ds-calendar__agenda-cat">{CAT_LABEL[ev.cat]}</span>
      </div>
    );
  }

  /* ── wide day detail: side panel ───────────────────────────────────────── */
  function DayPanel({ iso, events, onClose }) {
    const d = fromIso(iso);
    return (
      <aside className="ds-calendar__panel" aria-label={`Events on ${dayTitle(d)}`}>
        <div className="ds-calendar__panel-head">
          <h4 className="ds-calendar__panel-title">{dayTitle(d)}</h4>
          <button type="button" className="ds-calendar__panel-close" aria-label="Close day details" onClick={onClose}>
            {icons.close()}
          </button>
        </div>
        {events.length === 0
          ? <p className="ds-calendar__empty">Nothing scheduled on this day.</p>
          : events.map((ev, i) => <EventRow key={i} ev={ev} />)}
      </aside>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     Phone frame — the responsive answer: the month grid is never shrunk.
     A ~375px frame renders a day-grouped agenda list (sticky day headers,
     month nav retained); tapping a day opens the shipped ds-sheet.
     ══════════════════════════════════════════════════════════════════════ */
  function PhoneCalendar({ direction, view, setView, eventsByIso, selectedIso, onSelectDay, sheetOpen, setSheetOpen }) {
    const returnRef = useRef(null);
    const doneRef = useRef(null);

    const close = () => {
      setSheetOpen(false);
      if (returnRef.current) returnRef.current.focus();
    };
    // move focus into the sheet dialog on open
    useEffect(() => {
      if (sheetOpen && doneRef.current) doneRef.current.focus();
    }, [sheetOpen]);

    // demo phone frame chrome only (inline, mb-level) — transform creates a
    // containing block so the fixed ds-sheet-overlay stays inside the frame
    const frameStyle = {
      position: 'relative', width: 375, maxWidth: '100%', height: 640,
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      border: '1px solid var(--sd-colour-border-strong)', borderRadius: 24,
      background: 'var(--sd-colour-surface-default)', overflow: 'hidden',
      transform: 'translateZ(0)',
    };

    // day-grouped agenda: every day of the view month that has events
    const days = [];
    const lastDay = new Date(view.y, view.m + 1, 0).getDate();
    for (let n = 1; n <= lastDay; n++) {
      const d = new Date(view.y, view.m, n);
      const events = eventsByIso.get(isoOf(d)) || [];
      if (events.length) days.push({ d, iso: isoOf(d), events });
    }
    const selEvents = selectedIso ? (eventsByIso.get(selectedIso) || []) : [];

    return (
      <div style={frameStyle} onKeyDown={(e) => { if (e.key === 'Escape' && sheetOpen) close(); }}>
        <div className={cx('ds-calendar', `ds-calendar--${direction}`, 'ds-calendar--agenda')}>
          <CalendarHead view={view} setView={setView} monthId="wb-cal-phone-month" />
          <div className="ds-calendar__agenda" aria-labelledby="wb-cal-phone-month">
            {days.length === 0 && (
              <p className="ds-calendar__empty">
                Nothing scheduled in {MONTHS[view.m]} — bookings, roster changes and closures will appear here as they&rsquo;re added.
              </p>
            )}
            {days.map(({ d, iso, events }) => (
              <React.Fragment key={iso}>
                <button
                  type="button"
                  className={cx('ds-calendar__agenda-day', iso === TODAY_ISO && 'ds-calendar__agenda-day--today')}
                  aria-haspopup="dialog"
                  aria-expanded={sheetOpen && selectedIso === iso}
                  onClick={(e) => {
                    returnRef.current = e.currentTarget;
                    onSelectDay(iso);
                    setSheetOpen(true);
                  }}
                >
                  <span>{dayTitle(d)}</span>
                  <span className="ds-calendar__more">{events.length} event{events.length > 1 ? 's' : ''}</span>
                </button>
                <div className="ds-calendar__agenda-items">
                  {events.map((ev, i) => <EventRow key={i} ev={ev} />)}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        {sheetOpen && selectedIso && (
          <div className="ds-sheet-overlay is-open">
            <div className="ds-sheet__scrim" onClick={close}></div>
            <div className="ds-sheet" role="dialog" aria-modal="true" aria-label={dayTitle(fromIso(selectedIso))}>
              <div className="ds-sheet__grabber" aria-hidden="true"></div>
              <div className="ds-sheet__header">
                <h3 className="ds-sheet__title">{dayTitle(fromIso(selectedIso))}</h3>
              </div>
              <div className={cx('ds-sheet__list', 'ds-calendar', `ds-calendar--${direction}`)}>
                {selEvents.length === 0
                  ? <p className="ds-sheet__empty">Nothing scheduled on this day.</p>
                  : selEvents.map((ev, i) => <EventRow key={i} ev={ev} />)}
              </div>
              <div className="ds-sheet__footer">
                <button type="button" ref={doneRef} className="ds-btn ds-btn--solid ds-btn--full" onClick={close}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     The workbench card — direction board for review
     ══════════════════════════════════════════════════════════════════════ */
  function CalendarCard() {
    const [direction, setDirection] = useState('operational');
    const [frame, setFrame] = useState('wide');
    const [dense, setDense] = useState(false);
    const [cats, setCats] = useState({ bookings: true, staffing: true, closures: true });
    const [emptyMonth, setEmptyMonth] = useState(false);
    const [view, setView] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
    const [selectedIso, setSelectedIso] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const eventsByIso = useMemo(() => {
      const map = new Map();
      if (emptyMonth) return map;
      for (const ev of monthEvents(view.y, view.m)) {
        if (!cats[ev.cat]) continue;
        if (!map.has(ev.iso)) map.set(ev.iso, []);
        map.get(ev.iso).push(ev);
      }
      return map;
    }, [view.y, view.m, emptyMonth, cats]);

    const setCat = (id) => (on) => setCats((c) => ({ ...c, [id]: on }));
    const selEvents = selectedIso ? (eventsByIso.get(selectedIso) || []) : [];

    const closePanel = () => {
      // best-effort: hand focus back to the selected day cell before clearing
      const btn = document.querySelector(`#wb-calendar [data-iso="${selectedIso}"]`);
      setSelectedIso(null);
      if (btn) btn.focus();
    };

    return (
      <Card
        legacy={['Calendar', 'CalendarMonthly']}
        ds="ds-calendar"
        status="WIP"
        note="Design exploration — the same month view in three visual directions for review (same data, logic, keyboard model and class contract; direction is a CSS modifier). One component replaces the legacy split across two calendar foundations. On phones the month collapses to an agenda list; day detail uses the shipped ds-sheet."
      >
        <Controls>
          <VariantPills
            label="Direction"
            options={[
              { value: 'operational', label: 'Operational' },
              { value: 'clean', label: 'Clean' },
              { value: 'soft', label: 'Soft' },
            ]}
            value={direction}
            onChange={setDirection}
          />
          <VariantPills
            label="Frame"
            options={[
              { value: 'wide', label: 'Wide' },
              { value: 'phone', label: 'Phone (375px)' },
            ]}
            value={frame}
            onChange={(v) => { setFrame(v); setSheetOpen(false); }}
          />
          {direction === 'operational' && frame === 'wide' && (
            <VariantPills
              label="Density"
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
              value={dense ? 'compact' : 'comfortable'}
              onChange={(v) => setDense(v === 'compact')}
            />
          )}
          {CATS.map((c) => (
            <Toggle key={c.id} label={c.label} on={cats[c.id]} onChange={setCat(c.id)} />
          ))}
          <Toggle label="Empty month" on={emptyMonth} onChange={setEmptyMonth} />
        </Controls>
        <Stage stack>
          {frame === 'wide' && (
            <div
              className={cx(
                'ds-calendar',
                `ds-calendar--${direction}`,
                direction === 'operational' && dense && 'ds-calendar--dense'
              )}
            >
              <CalendarHead view={view} setView={setView} monthId="wb-cal-wide-month" />
              <div className="ds-calendar__body">
                <MonthGrid
                  direction={direction}
                  dense={dense}
                  view={view}
                  setView={setView}
                  eventsByIso={eventsByIso}
                  selectedIso={selectedIso}
                  onSelectDay={setSelectedIso}
                  monthId="wb-cal-wide-month"
                />
                {selectedIso && <DayPanel iso={selectedIso} events={selEvents} onClose={closePanel} />}
              </div>
              {eventsByIso.size === 0 && (
                <p className="ds-calendar__empty">
                  Nothing scheduled in {MONTHS[view.m]} — bookings, roster changes and closures will appear here as they&rsquo;re added.
                </p>
              )}
            </div>
          )}
          {frame === 'phone' && (
            <PhoneCalendar
              direction={direction}
              view={view}
              setView={setView}
              eventsByIso={eventsByIso}
              selectedIso={selectedIso}
              onSelectDay={setSelectedIso}
              sheetOpen={sheetOpen}
              setSheetOpen={setSheetOpen}
            />
          )}
        </Stage>
        <StateNote text={
          'One ds-calendar replaces the legacy two-foundation split: Calendar (a Vue Cal wrapper) and CalendarMonthly (an undocumented, heavily modified Vuetify calendar) did the same job on different foundations. This card is the design exploration for that replacement — the direction choice is explicitly for Mason’s review. All three directions run identical data, month logic, keyboard model and class contract; direction is a pure CSS modifier, and extraction picks ONE as the shipped default. '
          + 'Operational optimises at-a-glance density for a provider admin scanning a whole service month: bordered grid, titled category chips, a "+N" badge on overflow, weekend shading, optional compact density — trade-off: the busiest surface, long titles truncate, and it reads as work. '
          + 'Clean optimises legibility and misread-resistance for a service admin: big quiet cells, category dots, details one click away in the side panel — trade-off: the least information per glance; every detail costs a select. '
          + 'Soft optimises warmth and personality: card-per-week rows, rounded cells, icon pills, gentle depth — trade-off: the heaviest chrome, the least vertical economy, and the depth cues sit furthest from the flat language of the shipped components. '
          + 'Phones never get a shrunken grid: the month collapses to a day-grouped agenda list (sticky day headers, month nav retained) and selecting a day opens the shipped ds-sheet. On wide, selecting a day opens the side panel; the selection survives direction and frame switches. '
          + 'Keyboard on the grid: arrows move a day/week, PageUp/PageDown a month, Home/End jump to week bounds, Enter/Space select — roving tabindex over real ARIA grid semantics; month nav, day cells and agenda day rows are all ≥44px. '
          + 'The 17th is deliberately overloaded (6 entries) to expose each direction’s overflow answer; category toggles filter everywhere at once, and the empty-month toggle shows the friendly zero state.'
        } />
      </Card>
    );
  }

  function CalendarWorkbench() {
    return <CalendarCard />;
  }

  const el = document.getElementById('wb-calendar');
  if (el) ReactDOM.createRoot(el).render(<CalendarWorkbench />);
})();
