/*
 * Office Migration Board — Date & time workbench (wb-datetime).
 *
 * ds-date-picker  — ONE component replacing InputDatePicker + CustomDatePicker
 *                   + InlineDatePicker: inline and input are modes of the same
 *                   calendar surface; on phones the popup becomes the shipped
 *                   ds-sheet (bottom-sheet.css — real classes, not restyled).
 * ds-time-picker  — replaces InputTimePicker: keyboard-first segmented field
 *                   inside the shipped ds-input box; NO auto-prefill by default
 *                   (the legacy auto-fill on focus surprised users) — prefill is
 *                   an explicit opt-in toggle so reviewers can compare.
 * ds-calendar     — placeholder only: full calendar views get a dedicated
 *                   design exploration (deliberate, see the card).
 *
 * Real date logic (current month, correct weekday offsets, today from the
 * system clock), WAI-ARIA grid semantics with roving tabindex, 44px touch
 * targets throughout. New ds-* classes live in wip/datetime.css (--sd- tokens
 * only); shipped classes (ds-input, ds-menu, ds-btn, ds-sheet) are reused
 * verbatim. No innerHTML anywhere. Wrapped in an IIFE: Babel-standalone
 * scripts share one global scope.
 */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, icons, cx } = window.WB;

  /* ── local inline SVGs (currentColor, aria-hidden) ─────────────────────── */
  const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="2.75" width="12.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.75 6.25h12.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

  /* ── date helpers (real logic, no library) ─────────────────────────────── */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Monday-first
  const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const pad2 = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const addMonthsClamped = (d, n) => {
    const y = d.getFullYear();
    const m = d.getMonth() + n;
    const last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(d.getDate(), last));
  };
  const mondayIndex = (d) => (d.getDay() + 6) % 7; // 0 = Monday

  /* full weeks covering a month — leading/trailing cells come from the
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

  const formatDisplay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  const dayAria = (d, hasEvent, disabled) =>
    `${WEEKDAYS_LONG[mondayIndex(d)]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    + (hasEvent ? ', has events' : '') + (disabled ? ', unavailable' : '');

  /* forgiving date parsing — day-first numerics, ISO, and month names.
     Returns { empty } | { date } | { invalid } and rejects impossible dates
     (e.g. 31/2) by round-tripping the components. */
  const monthFromName = (s) => (s.length < 3 ? -1
    : MONTHS.findIndex((mn) => mn.toLowerCase().startsWith(s.slice(0, 3))));
  const makeDate = (y, m, day) => {
    if (y < 100) y += 2000;
    const dt = new Date(y, m, day);
    return (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === day) ? dt : null;
  };
  function parseDateInput(raw) {
    const s = raw.trim().toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');
    if (!s) return { empty: true };
    let m;
    if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) {
      const d = makeDate(+m[1], +m[2] - 1, +m[3]);
      return d ? { date: d } : { invalid: true };
    }
    if ((m = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{2}|\d{4})$/))) {
      const d = makeDate(+m[3], +m[2] - 1, +m[1]); // day-first
      return d ? { date: d } : { invalid: true };
    }
    if ((m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?(?:\s+(\d{2}|\d{4}))?$/))) {
      const mo = monthFromName(m[2]);
      if (mo >= 0) {
        const d = makeDate(m[3] ? +m[3] : TODAY.getFullYear(), mo, +m[1]);
        return d ? { date: d } : { invalid: true };
      }
    }
    if ((m = s.match(/^([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{2}|\d{4}))?$/))) {
      const mo = monthFromName(m[1]);
      if (mo >= 0) {
        const d = makeDate(m[3] ? +m[3] : TODAY.getFullYear(), mo, +m[2]);
        return d ? { date: d } : { invalid: true };
      }
    }
    return { invalid: true };
  }

  /* close an open popup when pointer goes down anywhere outside `ref` */
  function useOutsideClose(ref, open, close) {
    useEffect(() => {
      if (!open) return undefined;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
  }

  /* ══════════════════════════════════════════════════════════════════════
     CalendarGrid — the shared ds-datepicker surface (inline, popup, sheet)
     WAI-ARIA grid: role=grid / row / columnheader / gridcell, roving
     tabindex, arrows move a day/week, PageUp/Down a month, Home/End week
     bounds, Enter/Space select (native button activation).
     ══════════════════════════════════════════════════════════════════════ */
  function CalendarGrid({ selected, onSelect, isDisabled, events, inline, fluid, idBase, autoFocusGrid }) {
    const base = selected || TODAY;
    const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
    const [focusIso, setFocusIso] = useState(isoOf(base));
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
      const [y, m, day] = activeIso.split('-').map(Number);
      const cur = new Date(y, m - 1, day);
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

    // popup / sheet presentations move focus into the grid on open
    useEffect(() => {
      if (!autoFocusGrid || !gridRef.current) return;
      const btn = gridRef.current.querySelector(`[data-iso="${activeIso}"]`);
      if (btn) btn.focus();
    }, []);

    const monthId = `${idBase}-month`;
    return (
      <div className={cx('ds-datepicker', inline && 'ds-datepicker--inline', fluid && 'ds-datepicker--fluid')}>
        <div className="ds-datepicker__head">
          <button
            type="button"
            className="ds-datepicker__nav"
            aria-label="Previous month"
            onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))}
          >
            <ChevronLeftIcon />
          </button>
          <span className="ds-datepicker__month" id={monthId} aria-live="polite">
            {MONTHS[view.m]} {view.y}
          </span>
          <button
            type="button"
            className="ds-datepicker__nav"
            aria-label="Next month"
            onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))}
          >
            <ChevronRightIcon />
          </button>
        </div>
        <div className="ds-datepicker__grid" role="grid" aria-labelledby={monthId} ref={gridRef} onKeyDown={onGridKey}>
          <div className="ds-datepicker__weekdays" role="row">
            {WEEKDAYS_SHORT.map((w, i) => (
              <span key={w} role="columnheader" aria-label={WEEKDAYS_LONG[i]} className="ds-datepicker__weekday">{w}</span>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={isoOf(week[0])} className="ds-datepicker__row" role="row">
              {week.map((d) => {
                const dIso = isoOf(d);
                const outside = d.getMonth() !== view.m;
                const disabled = !!(isDisabled && isDisabled(d));
                const isToday = sameDay(d, TODAY);
                const isSel = sameDay(d, selected);
                const hasEvent = !!(events && events.has(dIso));
                return (
                  <div key={dIso} className="ds-datepicker__cell" role="gridcell" aria-selected={isSel}>
                    <button
                      type="button"
                      className={cx(
                        'ds-datepicker__day',
                        outside && 'ds-datepicker__day--outside',
                        isToday && 'ds-datepicker__day--today',
                        isSel && 'ds-datepicker__day--selected',
                        disabled && 'ds-datepicker__day--disabled'
                      )}
                      data-iso={dIso}
                      tabIndex={dIso === activeIso ? 0 : -1}
                      aria-label={dayAria(d, hasEvent, disabled)}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      onFocus={() => setFocusIso(dIso)}
                      onClick={() => {
                        if (disabled) return;
                        showDate(d); // outside days also flip the view to their month
                        onSelect(d);
                      }}
                    >
                      {d.getDate()}
                      {hasEvent && <span className="ds-datepicker__dot" aria-hidden="true"></span>}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── input mode: shipped ds-input box + typed parsing + anchored popup ── */
  function DateInputField({ selected, onSelect, isDisabled, events, closeOnSelect }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(selected ? formatDisplay(selected) : '');
    const [error, setError] = useState(null);
    const rootRef = useRef(null);
    const toggleRef = useRef(null);
    useOutsideClose(rootRef, open, () => setOpen(false));

    // grid picks (and external changes) write back the canonical format
    useEffect(() => {
      setText(selected ? formatDisplay(selected) : '');
    }, [selected ? isoOf(selected) : '']);

    const commit = () => {
      const r = parseDateInput(text);
      if (r.empty) { setError(null); onSelect(null); return; }
      if (r.invalid) { setError('Unrecognised date — try 6/7/2026 or 6 Jul 2026.'); return; }
      if (isDisabled && isDisabled(r.date)) { setError('That date is unavailable — it falls outside the allowed range.'); return; }
      setError(null);
      onSelect(r.date);
    };

    const onRootKey = (e) => {
      if (e.key === 'Escape' && open) {
        e.stopPropagation();
        setOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    };

    return (
      <div className={cx('ds-input', error && 'ds-input--error')} ref={rootRef} onKeyDown={onRootKey}>
        <label className="ds-input__label" htmlFor="wb-dt-date-input">Start date</label>
        <div className="ds-input__box">
          <input
            className="ds-input__field"
            type="text"
            id="wb-dt-date-input"
            placeholder="e.g. 6/7/2026"
            autoComplete="off"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { commit(); setOpen(false); }
              if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); }
            }}
            onBlur={(e) => {
              // commit typed text only when focus leaves the whole component
              if (!rootRef.current || !rootRef.current.contains(e.relatedTarget)) commit();
            }}
          />
          <button
            type="button"
            ref={toggleRef}
            className="ds-datepicker__toggle"
            aria-label={open ? 'Close calendar' : 'Open calendar'}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <CalendarIcon />
          </button>
        </div>
        {open && (
          <div className="ds-datepicker-popup" role="dialog" aria-label="Choose date">
            <CalendarGrid
              selected={selected}
              isDisabled={isDisabled}
              events={events}
              idBase="wb-dt-dp-popup"
              autoFocusGrid
              onSelect={(d) => {
                setError(null);
                onSelect(d);
                if (closeOnSelect) {
                  setOpen(false);
                  if (toggleRef.current) toggleRef.current.focus();
                }
              }}
            />
          </div>
        )}
        <span className="ds-input__helper">
          {error || 'Type a date (day first) or pick from the calendar — ArrowDown opens it.'}
        </span>
      </div>
    );
  }

  /* ── phone frame: the same picker presenting in the shipped ds-sheet ──── */
  function PhoneSheetDatePicker({ selected, onSelect, isDisabled, events, closeOnSelect }) {
    const [open, setOpen] = useState(false);
    const fieldRef = useRef(null);
    const close = () => {
      setOpen(false);
      if (fieldRef.current) fieldRef.current.focus();
    };

    // demo phone frame chrome only (inline, mb-level) — transform creates a
    // containing block so the fixed ds-sheet-overlay stays inside the frame
    const frameStyle = {
      position: 'relative', width: 360, maxWidth: '100%', height: 600,
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      border: '1px solid var(--sd-colour-border-strong)', borderRadius: 24,
      background: 'var(--sd-colour-surface-default)', overflow: 'hidden',
      transform: 'translateZ(0)',
    };

    return (
      <div style={frameStyle} onKeyDown={(e) => { if (e.key === 'Escape' && open) close(); }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--sd-colour-border-default)',
          fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-medium)',
        }}>
          New booking
        </div>
        <div style={{ padding: 16 }}>
          <div className="ds-input">
            <span className="ds-input__label" id="wb-dt-phone-label">Start date</span>
            <div
              className="ds-input__box ds-input__box--select"
              role="button"
              tabIndex={0}
              ref={fieldRef}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-labelledby="wb-dt-phone-label"
              onClick={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); }
              }}
            >
              <span className={cx('ds-input__display', selected && 'has-value')}>
                {selected ? formatDisplay(selected) : 'Select a date'}
              </span>
              <span className="ds-input__trailing" aria-hidden="true"><CalendarIcon /></span>
            </div>
          </div>
        </div>
        {open && (
          <div className="ds-sheet-overlay is-open">
            <div className="ds-sheet__scrim" onClick={close}></div>
            <div className="ds-sheet" role="dialog" aria-modal="true" aria-label="Choose date">
              <div className="ds-sheet__grabber" aria-hidden="true"></div>
              <div className="ds-sheet__header">
                <h3 className="ds-sheet__title">Choose date</h3>
              </div>
              <div className="ds-sheet__list">
                <CalendarGrid
                  selected={selected}
                  isDisabled={isDisabled}
                  events={events}
                  fluid
                  idBase="wb-dt-dp-sheet"
                  autoFocusGrid
                  onSelect={(d) => { onSelect(d); if (closeOnSelect) close(); }}
                />
              </div>
              <div className="ds-sheet__footer">
                <button type="button" className="ds-btn ds-btn--solid ds-btn--full" onClick={close}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Card 1: ds-date-picker ─────────────────────────────────────────────── */
  const SAMPLE_EVENTS = new Set([-3, 0, 2, 6, 11].map((n) => isoOf(addDays(TODAY, n))));
  const RANGE_MIN = addDays(TODAY, -7);
  const RANGE_MAX = addDays(TODAY, 14);

  function DatePickerCard() {
    const [mode, setMode] = useState('inline');
    const [selected, setSelected] = useState(null);
    const [events, setEvents] = useState(true);
    const [range, setRange] = useState(false);
    const [past, setPast] = useState(false);
    const [closeOnSelect, setCloseOnSelect] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const isDisabled = (range || past)
      ? (d) => (range && (d < RANGE_MIN || d > RANGE_MAX)) || (past && d < TODAY)
      : null;
    const eventSet = events ? SAMPLE_EVENTS : null;

    const staticDay = (tag, classes, { dot } = {}) => (
      <Cell key={tag} tag={tag}>
        <button type="button" className={cx('ds-datepicker__day', classes)} disabled aria-hidden="true" tabIndex={-1}>
          15
          {dot && <span className="ds-datepicker__dot" aria-hidden="true"></span>}
        </button>
      </Cell>
    );

    return (
      <Card
        legacy={['InputDatePicker', 'CustomDatePicker', 'InlineDatePicker']}
        ds="ds-date-picker"
        status="WIP"
        note="One component, two modes, three presentations: an always-visible inline calendar, an input with typed entry plus an anchored popup, and the same grid inside the shipped ds-sheet on phones. The three legacy pickers collapse into this single surface."
      >
        <Controls>
          <VariantPills
            label="Mode"
            options={[
              { value: 'inline', label: 'Inline' },
              { value: 'input', label: 'Input + popup' },
              { value: 'sheet', label: 'Phone (sheet)' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Toggle label="Event dots" on={events} onChange={setEvents} />
          <Toggle label="Min/max range" on={range} onChange={setRange} />
          <Toggle label="Disable past" on={past} onChange={setPast} />
          {mode !== 'inline' && <Toggle label="Close on select" on={closeOnSelect} onChange={setCloseOnSelect} />}
          <Toggle label="Show all day states" on={showAll} onChange={setShowAll} />
        </Controls>
        <Stage room={mode === 'input'} form={mode === 'input'}>
          {mode === 'inline' && (
            <CalendarGrid
              selected={selected}
              onSelect={setSelected}
              isDisabled={isDisabled}
              events={eventSet}
              inline
              idBase="wb-dt-dp-inline"
            />
          )}
          {mode === 'input' && (
            <DateInputField
              selected={selected}
              onSelect={setSelected}
              isDisabled={isDisabled}
              events={eventSet}
              closeOnSelect={closeOnSelect}
            />
          )}
          {mode === 'sheet' && (
            <PhoneSheetDatePicker
              selected={selected}
              onSelect={setSelected}
              isDisabled={isDisabled}
              events={eventSet}
              closeOnSelect={closeOnSelect}
            />
          )}
        </Stage>
        {showAll && (
          <Stage scroll>
            <ShowAll>
              {staticDay('Default', null)}
              {staticDay('Today', 'ds-datepicker__day--today')}
              {staticDay('Selected', 'ds-datepicker__day--selected')}
              {staticDay('Today + selected', 'ds-datepicker__day--today ds-datepicker__day--selected')}
              {staticDay('Event dot', null, { dot: true })}
              {staticDay('Event + selected', 'ds-datepicker__day--selected', { dot: true })}
              {staticDay('Outside month', 'ds-datepicker__day--outside')}
              {staticDay('Disabled', 'ds-datepicker__day--disabled')}
              {staticDay('Disabled + event', 'ds-datepicker__day--disabled', { dot: true })}
            </ShowAll>
          </Stage>
        )}
        <StateNote text={
          `One ds-date-picker replaces the legacy trio — inline and input are modes of the same component, and on phones the popup becomes the shipped ds-sheet. `
          + `Min/max semantics, stated once (the legacy docs contradicted themselves): min and max are INCLUSIVE — min ${formatDisplay(RANGE_MIN)} and max ${formatDisplay(RANGE_MAX)} stay selectable; only days before min or after max disable. "Disable past" keeps today selectable. `
          + `Keyboard: arrows move a day/week, PageUp/PageDown a month, Home/End jump to week bounds, Enter selects, Escape closes; focus rides a roving tabindex across real ARIA grid semantics. Typing parses forgiving formats (6/7/2026, 2026-07-06, 6 jul, Jul 6) day-first; impossible dates get the shipped error state. `
          + `Day cells, month nav and the calendar toggle are all ≥44px. Weeks start Monday (AU/UK/EU convention; locale-configurable at spec time). Selection carries across the three presentations — switch modes to compare.`
        } />
      </Card>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     Card 2: ds-time-picker — keyboard-first segmented field
     ══════════════════════════════════════════════════════════════════════ */
  function TimeField({ prefill, seconds, granularity }) {
    const [hh, setHh] = useState('');
    const [mm, setMm] = useState('');
    const [ss, setSs] = useState('');
    const [mer, setMer] = useState(null);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const hhRef = useRef(null);
    const mmRef = useRef(null);
    const ssRef = useRef(null);
    const amRef = useRef(null);
    const toggleRef = useRef(null);
    useOutsideClose(rootRef, open, () => setOpen(false));

    const segRefs = () => [hhRef, mmRef, ...(seconds ? [ssRef] : []), amRef];
    const focusAfter = (ref, dir) => {
      const list = segRefs();
      const i = list.findIndex((r) => r === ref);
      const next = list[i + dir];
      if (next && next.current) next.current.focus();
    };

    /* overtype digit entry with auto-advance */
    const typeHh = (d) => {
      if (hh.length === 1) {
        const n = +(hh + d);
        if (n >= 1 && n <= 12) { setHh(pad2(n)); focusAfter(hhRef, 1); return; }
      }
      if (d === '0' || d === '1') setHh(d); // ambiguous first digit — wait
      else { setHh('0' + d); focusAfter(hhRef, 1); }
    };
    const typeMinSec = (val, setVal, ref) => (d) => {
      if (val.length === 1) { setVal(val + d); focusAfter(ref, 1); return; }
      if (+d <= 5) setVal(d); // 0–5 could start a two-digit minute — wait
      else { setVal('0' + d); focusAfter(ref, 1); }
    };
    /* arrow stepping with correct wrap */
    const stepHh = (dir) => setHh(hh === '' ? '12' : pad2(((+hh - 1 + dir + 12) % 12) + 1));
    const stepWrap60 = (val, setVal) => (dir) => setVal(val === '' ? '00' : pad2((+val + dir + 60) % 60));

    const segKey = ({ value, setValue, typeDigit, step, ref }) => (e) => {
      if (/^\d$/.test(e.key)) { e.preventDefault(); typeDigit(e.key); setError(null); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); step(1); setError(null); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); setError(null); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); focusAfter(ref, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); focusAfter(ref, -1); }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        if (value) setValue('');
        else focusAfter(ref, -1);
      } else if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setMer('AM'); }
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setMer('PM'); }
      else if (e.key === 'Escape' && open) { setOpen(false); }
      else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) e.preventDefault(); // overtype field: no stray characters
    };

    /* single digits normalise on segment blur where unambiguous (9 → 09) */
    const padOnBlur = (val, setVal) => () => { if (val.length === 1 && val !== '0') setVal(pad2(+val)); };

    const validate = () => {
      const parts = [hh, mm, ...(seconds ? [ss] : [])];
      const any = parts.some(Boolean) || !!mer;
      if (!any) { setError(null); return; }
      if (!parts.every((v) => v.length > 0) || !mer) { setError('Incomplete time — set hours, minutes and AM/PM.'); return; }
      if (+hh < 1 || +hh > 12) { setError('Impossible time — hours run 1–12 on a 12-hour clock.'); return; }
      if (+mm > 59 || (seconds && +ss > 59)) { setError('Impossible time — minutes and seconds run 00–59.'); return; }
      setError(null);
    };

    // legacy comparison only: explicit opt-in prefill of the current time
    const maybePrefill = () => {
      if (!prefill || hh || mm || mer) return;
      const now = new Date();
      const h = now.getHours();
      setHh(pad2(h % 12 === 0 ? 12 : h % 12));
      setMm(pad2(now.getMinutes()));
      if (seconds) setSs(pad2(now.getSeconds()));
      setMer(h < 12 ? 'AM' : 'PM');
    };

    const times = [];
    for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += granularity) times.push({ h, m });
    const pickTime = ({ h, m }) => {
      setHh(pad2(h % 12 === 0 ? 12 : h % 12));
      setMm(pad2(m));
      if (seconds) setSs('00');
      setMer(h < 12 ? 'AM' : 'PM');
      setError(null);
      setOpen(false);
      if (toggleRef.current) toggleRef.current.focus();
    };
    const optionLabel = ({ h, m }) => `${h % 12 === 0 ? 12 : h % 12}:${pad2(m)} ${h < 12 ? 'AM' : 'PM'}`;
    const optionSelected = ({ h, m }) =>
      +hh === (h % 12 === 0 ? 12 : h % 12) && +mm === m && mer === (h < 12 ? 'AM' : 'PM');

    const seg = (props) => (
      <input
        ref={props.ref}
        className="ds-timepicker__seg"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={props.placeholder}
        aria-label={props.label}
        value={props.value}
        onKeyDown={segKey(props)}
        onBlur={padOnBlur(props.value, props.setValue)}
        onChange={(e) => {
          // fallback for paste / soft keyboards that skip keydown
          const digits = e.target.value.replace(/\D/g, '').slice(-2);
          props.setValue(digits === '' ? '' : (props.clamp(digits) ? digits : props.value));
        }}
      />
    );

    return (
      <div
        className={cx('ds-input', 'ds-select', 'ds-timepicker', open && 'is-open', error && 'ds-input--error')}
        ref={rootRef}
        onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) validate(); }}
      >
        <span className="ds-input__label" id="wb-dt-time-label">Pick-up time</span>
        <div className="ds-input__box">
          <div className="ds-timepicker__field" role="group" aria-labelledby="wb-dt-time-label" onFocus={maybePrefill}>
            {seg({ ref: hhRef, value: hh, setValue: setHh, typeDigit: typeHh, step: stepHh, placeholder: 'hh', label: 'Hours', clamp: (d) => +d >= 1 && +d <= 12 })}
            <span className="ds-timepicker__sep" aria-hidden="true">:</span>
            {seg({ ref: mmRef, value: mm, setValue: setMm, typeDigit: typeMinSec(mm, setMm, mmRef), step: stepWrap60(mm, setMm), placeholder: 'mm', label: 'Minutes', clamp: (d) => +d <= 59 })}
            {seconds && <span className="ds-timepicker__sep" aria-hidden="true">:</span>}
            {seconds && seg({ ref: ssRef, value: ss, setValue: setSs, typeDigit: typeMinSec(ss, setSs, ssRef), step: stepWrap60(ss, setSs), placeholder: 'ss', label: 'Seconds', clamp: (d) => +d <= 59 })}
            <div className="ds-timepicker__ampm" role="group" aria-label="AM or PM">
              <button type="button" ref={amRef} className="ds-timepicker__ampm-btn" aria-pressed={mer === 'AM'} onClick={() => { setMer('AM'); setError(null); }}>AM</button>
              <button type="button" className="ds-timepicker__ampm-btn" aria-pressed={mer === 'PM'} onClick={() => { setMer('PM'); setError(null); }}>PM</button>
            </div>
          </div>
          <button
            type="button"
            ref={toggleRef}
            className="ds-timepicker__toggle"
            aria-label={open ? 'Close time list' : 'Open time list'}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <ClockIcon />
          </button>
        </div>
        <div className="ds-menu ds-timepicker__popup" role="listbox" aria-label="Pick a common time">
          {times.map((t) => (
            <button
              key={`${t.h}-${t.m}`}
              type="button"
              role="option"
              aria-selected={optionSelected(t)}
              className="ds-menu__item"
              onClick={() => pickTime(t)}
            >
              {optionLabel(t)}
            </button>
          ))}
        </div>
        <span className="ds-input__helper">
          {error || 'Type digits (auto-advances), ArrowUp/Down to step, A/P for AM/PM — or open the list.'}
        </span>
      </div>
    );
  }

  /* static all-states rendering for the ShowAll grid */
  function StaticTimeField({ hh, mm, ss, mer, seconds, wrapClass, helper }) {
    const stSeg = (v, ph) => (
      <input className="ds-timepicker__seg" type="text" readOnly tabIndex={-1} value={v} placeholder={ph} aria-hidden="true" />
    );
    return (
      <div className={cx('ds-input', 'ds-timepicker', wrapClass)} aria-hidden="true" style={{ maxWidth: 300 }}>
        <div className="ds-input__box">
          <div className="ds-timepicker__field">
            {stSeg(hh, 'hh')}
            <span className="ds-timepicker__sep">:</span>
            {stSeg(mm, 'mm')}
            {seconds && <span className="ds-timepicker__sep">:</span>}
            {seconds && stSeg(ss, 'ss')}
            <div className="ds-timepicker__ampm">
              <button type="button" className="ds-timepicker__ampm-btn" aria-pressed={mer === 'AM'} tabIndex={-1} disabled={wrapClass === 'ds-input--disabled'}>AM</button>
              <button type="button" className="ds-timepicker__ampm-btn" aria-pressed={mer === 'PM'} tabIndex={-1} disabled={wrapClass === 'ds-input--disabled'}>PM</button>
            </div>
          </div>
        </div>
        {helper && <span className="ds-input__helper">{helper}</span>}
      </div>
    );
  }

  function TimePickerCard() {
    const [prefill, setPrefill] = useState(false);
    const [seconds, setSeconds] = useState(false);
    const [granularity, setGranularity] = useState(30);
    const [showAll, setShowAll] = useState(false);

    return (
      <Card
        legacy="InputTimePicker"
        ds="ds-time-picker"
        status="WIP"
        note="Keyboard-first segmented field in the shipped ds-input box: overtype hh/mm segments, an AM/PM toggle and an optional tap-assist list of common times (reusing the shipped ds-menu). Remount note: switching “Show seconds” resets the field."
      >
        <Controls>
          <Toggle label="Prefill current time on focus (legacy behaviour)" on={prefill} onChange={setPrefill} />
          <Toggle label="Show seconds" on={seconds} onChange={setSeconds} />
          <VariantPills
            label="List granularity"
            options={[{ value: 15, label: '15 min' }, { value: 30, label: '30 min' }]}
            value={granularity}
            onChange={setGranularity}
          />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>
        <Stage form room>
          <TimeField key={`tf-${seconds}`} prefill={prefill} seconds={seconds} granularity={granularity} />
        </Stage>
        {showAll && (
          <Stage scroll>
            <ShowAll>
              <Cell tag="Empty (no prefill)"><StaticTimeField hh="" mm="" ss="" mer={null} seconds={seconds} /></Cell>
              <Cell tag="Filled"><StaticTimeField hh="09" mm="30" ss="00" mer="AM" seconds={seconds} /></Cell>
              <Cell tag="Focus ring"><StaticTimeField hh="09" mm="30" ss="00" mer="AM" seconds={seconds} wrapClass="is-demo--focus" /></Cell>
              <Cell tag="Error"><StaticTimeField hh="00" mm="30" ss="00" mer="PM" seconds={seconds} wrapClass="ds-input--error" helper="Impossible time — hours run 1–12." /></Cell>
              <Cell tag="Disabled"><StaticTimeField hh="09" mm="30" ss="00" mer="AM" seconds={seconds} wrapClass="ds-input--disabled" /></Cell>
            </ShowAll>
          </Stage>
        )}
        <StateNote text={
          'No auto-prefill by default — a deliberate reversal of the legacy InputTimePicker, which silently filled in the current time on focus and surprised users; prefill is the explicit opt-in toggle above so reviewers can compare both behaviours. '
          + 'Segments are 44px-tall overtype fields: digits auto-advance (type 9 → 09 and jump to minutes), ArrowUp/Down step with correct wrap (12→1, 59→00), A/P set the meridiem, Backspace clears then walks left. '
          + 'The clock button opens a tap-assist list at 15- or 30-minute granularity; picking fills the segments. Impossible or incomplete times surface the shipped ds-input error state on blur — empty is valid (the field is optional until a form says otherwise).'
        } />
      </Card>
    );
  }

  /* ── Card 3: ds-calendar — placeholder by design ───────────────────────── */
  function CalendarPlaceholderCard() {
    return (
      <Card
        legacy={['Calendar', 'CalendarMonthly']}
        ds="ds-calendar"
        status="Missing"
        note="Placeholder card — no demo or CSS in this wave, by design."
      >
        <StateNote text="Full calendar views (legacy Calendar + CalendarMonthly, which sat on two different foundations) get a dedicated design exploration — month grid → agenda-list on phone. Not built in this wave by design." />
      </Card>
    );
  }

  function DatetimeWorkbench() {
    return (
      <React.Fragment>
        <DatePickerCard />
        <TimePickerCard />
        <CalendarPlaceholderCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-datetime');
  if (el) ReactDOM.createRoot(el).render(<DatetimeWorkbench />);
})();
