/*
 * Office Migration Board — Form controls workbench (wb-forms).
 * Fully interactive demos: typing, clearing, opening selects, picking options,
 * removing chips and toggling checkboxes are all real React state.
 * Class hooks used (.is-open, .has-value, --error, --disabled, is-disabled,
 * is-error) are verified against docs/assets/css/components/input.css and
 * checkbox.css. Hover/focus are pseudo-class states — experienced live.
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, StateNote, CheckboxGlyphs, icons, cx } = window.WB;

  /* close an open popup when clicking anywhere outside `ref` */
  function useOutsideClose(ref, open, close) {
    useEffect(() => {
      if (!open) return undefined;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
  }

  /* ── InputText → ds-input ────────────────────────────────────────────── */
  function TextInputCard() {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [helper, setHelper] = useState(true);

    return (
      <Card
        legacy="InputText"
        ds="ds-input"
        status="Built"
        note="Labelled text field with helper, error and disabled states. Type into it — the clear button appears once a value exists."
      >
        <Controls>
          <Toggle label="Error" on={error} onChange={setError} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
          <Toggle label="Helper text" on={helper} onChange={setHelper} />
        </Controls>
        <Stage form>
          <div className={cx('ds-input', error && 'ds-input--error', disabled && 'ds-input--disabled')}>
            <label className="ds-input__label" htmlFor="wb-inp-text">Email address</label>
            <div className="ds-input__box">
              <input
                className="ds-input__field"
                type="email"
                id="wb-inp-text"
                placeholder="name@example.com"
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
              />
              {value !== '' && !disabled && (
                <button type="button" className="ds-input__clear" aria-label="Clear email address" onClick={() => setValue('')}>
                  <icons.clear />
                </button>
              )}
            </div>
            {helper && (
              <span className="ds-input__helper">
                {error ? 'Enter a valid email address.' : 'We’ll never share your email address.'}
              </span>
            )}
          </div>
        </Stage>
        <StateNote text="The focus ring is :focus-within — click into the live field to see it. Error + focus keeps the error ring by design." />
      </Card>
    );
  }

  /* ── InputTextarea → ds-input--textarea ──────────────────────────────── */
  function TextareaCard() {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
    const [disabled, setDisabled] = useState(false);

    return (
      <Card
        legacy="InputTextarea"
        ds="ds-input--textarea"
        status="Built"
        note="Multi-line variant of the same Input component — same label, helper, error and disabled anatomy, vertical resize."
      >
        <Controls>
          <Toggle label="Error" on={error} onChange={setError} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
        </Controls>
        <Stage form>
          <div className={cx('ds-input', 'ds-input--textarea', error && 'ds-input--error', disabled && 'ds-input--disabled')}>
            <label className="ds-input__label" htmlFor="wb-inp-ta">Notes</label>
            <div className="ds-input__box">
              <textarea
                className="ds-input__field"
                id="wb-inp-ta"
                placeholder="Add a note…"
                rows={3}
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            {error && <span className="ds-input__helper">Notes are required for this booking.</span>}
          </div>
        </Stage>
        <StateNote text={`${value.length} character${value.length === 1 ? '' : 's'} typed. Drag the bottom edge — resize is vertical only.`} />
      </Card>
    );
  }

  /* ── InputSelect → ds-select + ds-menu (single + multi) ──────────────── */
  const ROOMS = ['Possums', 'Koalas', 'Joeys', 'Wombats'];
  const DIETARY = ['Dairy free', 'Gluten free', 'Nut allergy', 'Vegetarian'];

  function SingleSelect() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const ref = useRef(null);
    useOutsideClose(ref, open, () => setOpen(false));

    const onBoxKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };

    return (
      <div className={cx('ds-input', 'ds-select', open && 'is-open')} ref={ref}>
        <span className="ds-input__label" id="wb-sel1-label">Room</span>
        <div
          className="ds-input__box ds-input__box--select"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="wb-sel1-menu"
          aria-labelledby="wb-sel1-label"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onBoxKey}
        >
          <span className={cx('ds-input__display', value && 'has-value')}>{value || 'Select a room'}</span>
          <span className="ds-input__chevron" aria-hidden="true"><icons.chevron /></span>
        </div>
        <div className="ds-menu" role="listbox" id="wb-sel1-menu" aria-labelledby="wb-sel1-label">
          {ROOMS.map((room) => (
            <button
              key={room}
              type="button"
              role="option"
              aria-selected={value === room}
              className="ds-menu__item"
              onClick={() => { setValue(room); setOpen(false); }}
            >
              {room}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function MultiSelect() {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState(['Dairy free']);
    const ref = useRef(null);
    useOutsideClose(ref, open, () => setOpen(false));

    const toggleValue = (v) =>
      setValues((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

    const onBoxKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };

    return (
      <div className={cx('ds-input', 'ds-select', 'ds-input--pills', open && 'is-open')} ref={ref}>
        <span className="ds-input__label" id="wb-sel2-label">Dietary requirements</span>
        <div
          className="ds-input__box ds-input__box--select"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="wb-sel2-menu"
          aria-labelledby="wb-sel2-label"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onBoxKey}
        >
          {values.length > 0 ? (
            <span style={{ display: 'contents' }}>
              {values.map((v) => (
                <span key={v} className="ds-pill ds-pill--sm ds-pill--green ds-pill--minimal">
                  {v}
                  <button
                    type="button"
                    className="ds-input__chip-remove"
                    aria-label={`Remove ${v}`}
                    onClick={(e) => { e.stopPropagation(); toggleValue(v); }}
                  >
                    <icons.close />
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className="ds-input__display">Select all that apply</span>
          )}
          <span className="ds-input__chevron" aria-hidden="true"><icons.chevron /></span>
        </div>
        <div className="ds-menu" role="listbox" aria-multiselectable="true" id="wb-sel2-menu" aria-labelledby="wb-sel2-label">
          {DIETARY.map((v) => {
            const selected = values.includes(v);
            return (
              <button
                key={v}
                type="button"
                role="option"
                aria-selected={selected}
                className="ds-menu__item ds-menu__item--multi"
                onClick={() => toggleValue(v)}
              >
                {v}
                <span className={cx('ds-checkbox', selected ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked')} aria-hidden="true">
                  <span className="ds-checkbox__box"><CheckboxGlyphs /></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function SelectCard() {
    const [mode, setMode] = useState('single');
    return (
      <Card
        legacy="InputSelect"
        ds="ds-select + ds-menu"
        status="Built"
        note="Single and multi select with chips shipped — open/close, picking and chip removal all work below. Legacy summary-chip / select-all / truncate variants: drop confirmed (Mason, 2026-07-06) — any can return as an additive variant if real Office usage proves demand."
      >
        <Controls>
          <VariantPills
            label="Mode"
            options={[{ value: 'single', label: 'Single' }, { value: 'multi', label: 'Multi (chips)' }]}
            value={mode}
            onChange={setMode}
          />
        </Controls>
        <Stage form room>
          {mode === 'single' ? <SingleSelect /> : <MultiSelect />}
        </Stage>
        <StateNote text="Click the field (or focus it and press Enter/Space) to open; Escape or an outside click closes. In multi mode, chips in the field remove on click and the menu keeps the checkbox on the right, per the Vue 3 reference pattern." />
      </Card>
    );
  }

  /* ── InputSearch → ds-input (leading icon + clear) ───────────────────── */
  const ROSTER = ['Aisha Patel', 'Ben Carter', 'Chloe Nguyen', 'Daniel O’Brien', 'Jamie Anderson'];

  function SearchCard() {
    const [query, setQuery] = useState('');
    const matches = ROSTER.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase()));

    return (
      <Card
        legacy="InputSearch"
        ds="ds-input (leading icon + clear)"
        status="Built"
        note="Search pattern on the Input: leading search icon, clear button once a value exists, optional trailing action button."
      >
        <Stage form>
          <div className="ds-input">
            <label className="ds-input__label" htmlFor="wb-inp-search">Search children</label>
            <div className="ds-input__box">
              <span className="ds-input__leading" aria-hidden="true"><icons.search /></span>
              <input
                className="ds-input__field"
                type="search"
                id="wb-inp-search"
                placeholder="Start typing a name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query !== '' && (
                <button type="button" className="ds-input__clear" aria-label="Clear search" onClick={() => setQuery('')}>
                  <icons.clear />
                </button>
              )}
            </div>
          </div>
        </Stage>
        <StateNote text={query.trim() === ''
          ? `Live search over a sample roster of ${ROSTER.length} names — type to filter.`
          : (matches.length ? `${matches.length} match${matches.length === 1 ? '' : 'es'}: ${matches.join(', ')}` : 'No matches — the clear button resets instantly.')} />
      </Card>
    );
  }

  /* ── InputSend → ds-input + ds-btn (pattern) ─────────────────────────── */
  function SendCard() {
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(null);
    const canSend = message.trim() !== '';
    const send = () => { if (canSend) { setSent(message.trim()); setMessage(''); } };

    return (
      <Card
        legacy="InputSend"
        ds="ds-input + ds-btn"
        status="Built"
        note="Input with a trailing action button — the button is the primary act (no Enter-only assumption on mobile). The Send button enables only once the field is non-empty: the InputSend behaviour."
      >
        <Stage form>
          <div className="inp-action-row" style={{ width: '100%' }}>
            <div className="ds-input">
              <label className="ds-input__label" htmlFor="wb-inp-send">Message</label>
              <div className="ds-input__box">
                <input
                  className="ds-input__field"
                  type="text"
                  id="wb-inp-send"
                  placeholder="Type a message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                />
              </div>
            </div>
            <button type="button" className="ds-btn ds-btn--solid" disabled={!canSend} onClick={send}>
              Send
            </button>
          </div>
        </Stage>
        <StateNote text={sent ? `Sent: “${sent}” — the field cleared and the button disabled again.` : 'The button sits disabled until you type something.'} />
      </Card>
    );
  }

  /* ── InputCheckbox + InlineCheckbox → ds-checkbox ────────────────────── */
  function CheckboxCard() {
    const [updates, setUpdates] = useState(true);
    const [weekly, setWeekly] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(false);

    const allOn = updates && weekly;
    const someOn = updates || weekly;
    const setAll = (on) => { setUpdates(on); setWeekly(on); };

    const field = (label, checked, onChange) => (
      <label className={cx('ds-checkbox-field', disabled && 'is-disabled', error && 'is-error')}>
        <span className={cx(
          'ds-checkbox', 'ds-checkbox--interactive',
          checked ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked',
          disabled && 'is-disabled', error && 'is-error'
        )}>
          <input
            type="checkbox"
            className="ds-checkbox__native"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="ds-checkbox__box" aria-hidden="true"><CheckboxGlyphs /></span>
        </span>
        <span className="ds-checkbox-field__text">{label}</span>
      </label>
    );

    return (
      <Card
        legacy={['InputCheckbox', 'InlineCheckbox']}
        ds="ds-checkbox / ds-checkbox-field"
        status="Built"
        note="Checkbox control with the labelled field composition, indeterminate and error states. InlineCheckbox maps to the compact, label-less form — the 44px hit area is preserved even without a label. Everything below really toggles."
      >
        <Controls>
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
          <Toggle label="Error" on={error} onChange={setError} />
        </Controls>
        <Stage stack>
          {field('Email me product updates', updates, setUpdates)}
          {field('Send me a weekly summary', weekly, setWeekly)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className={cx(
              'ds-checkbox', 'ds-checkbox--interactive',
              allOn ? 'ds-checkbox--checked' : (someOn ? 'ds-checkbox--indeterminate' : 'ds-checkbox--unchecked'),
              disabled && 'is-disabled', error && 'is-error'
            )}>
              <input
                type="checkbox"
                className="ds-checkbox__native"
                aria-label="Select all notifications"
                checked={allOn}
                disabled={disabled}
                onChange={(e) => setAll(e.target.checked)}
              />
              <span className="ds-checkbox__box" aria-hidden="true"><CheckboxGlyphs /></span>
            </span>
            <span className="mb-state-note" style={{ width: 'auto' }}>
              ← compact (label-less) checkbox as “select all”: indeterminate when the two above disagree
            </span>
          </div>
        </Stage>
        <StateNote text="Hover halo, focus ring and the press squeeze are pseudo-class states (MD3 motion) — interact with a live checkbox to see them." />
      </Card>
    );
  }

  /* ── Searchable select — shared machinery for the two WIP cards below ──
     InputAutocomplete → ds-select searchable; InputCombobox is the same
     machine with allowCustom. Combobox pattern: the trigger hosts a REAL
     text field, DOM focus stays in it and aria-activedescendant tracks the
     active menu row. Match highlighting is a styled <span> built from text
     nodes — no innerHTML anywhere (query text is never parsed as markup). */

  /* wrap the first case-insensitive occurrence of `q` in a highlight span */
  function highlight(label, q) {
    const query = q.trim();
    if (!query) return label;
    const idx = label.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return label;
    return (
      <React.Fragment>
        {label.slice(0, idx)}
        <span className="ds-menu__match">{label.slice(idx, idx + query.length)}</span>
        {label.slice(idx + query.length)}
      </React.Fragment>
    );
  }

  function SearchableSelect({ idBase, label, placeholder, options, multi, allowCustom, noun }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [single, setSingle] = useState(null);   // single-mode value
    const [values, setValues] = useState([]);     // multi-mode values (chips)
    const [customs, setCustoms] = useState([]);   // user-created options (allowCustom)
    const [active, setActive] = useState(0);      // active row in the FILTERED list
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    const close = () => { setOpen(false); setQuery(''); };
    useOutsideClose(rootRef, open, close);

    /* filtering is case-insensitive over base + created options; the
       duplicate guard (allowCustom) is a case-insensitive exact match */
    const q = query.trim();
    const all = [
      ...options.map((o) => ({ label: o, custom: false })),
      ...customs.map((o) => ({ label: o, custom: true })),
    ];
    const filtered = q ? all.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : all;
    const duplicate = all.some((o) => o.label.toLowerCase() === q.toLowerCase());
    const canAdd = Boolean(allowCustom && q && !duplicate);
    const rowCount = filtered.length + (canAdd ? 1 : 0); // Add-row is pinned last
    const activeIdx = Math.min(active, Math.max(rowCount - 1, 0));

    useEffect(() => { setActive(0); }, [query]);
    useEffect(() => {
      if (!open || !menuRef.current) return;
      const el = menuRef.current.querySelector('.is-active');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, [open, activeIdx, query]);
    /* after a single-mode pick focus stays in the field showing the chosen
       label — select it so the next keystroke starts a fresh query instead
       of appending to the label (standard editable-combobox behaviour) */
    useEffect(() => {
      if (!multi && single && inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.select();
      }
    }, [single]);

    const isSelected = (v) => (multi ? values.includes(v) : single === v);
    const choose = (v) => {
      if (multi) {
        setValues((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
        setQuery(''); // reset the filter, stay open for further picks
      } else {
        setSingle(v);
        close();
      }
    };
    const createCustom = () => { const v = q; setCustoms((cur) => [...cur, v]); choose(v); };
    const pickRow = (i) => {
      if (canAdd && i === filtered.length) createCustom();
      else if (filtered[i]) choose(filtered[i].label);
    };

    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        if (rowCount === 0) return;
        setActive(e.key === 'ArrowDown' ? (activeIdx + 1) % rowCount : (activeIdx - 1 + rowCount) % rowCount);
      } else if (e.key === 'Home' && open && rowCount > 0) {
        e.preventDefault(); setActive(0);
      } else if (e.key === 'End' && open && rowCount > 0) {
        e.preventDefault(); setActive(rowCount - 1);
      } else if (e.key === 'Enter') {
        if (open && rowCount > 0) { e.preventDefault(); pickRow(activeIdx); }
      } else if (e.key === 'Escape') {
        /* clears-then-closes: first press resets the filter, second closes */
        if (query !== '') setQuery(''); else close();
      } else if (e.key === 'Backspace' && multi && query === '' && values.length > 0) {
        setValues((cur) => cur.slice(0, -1)); // chip removal from the keyboard
      } else if (e.key === 'Tab') {
        close(); // let focus move on naturally
      }
    };

    /* clicking box chrome (chevron, padding, chip row) keeps focus in the
       field and toggles the menu; chip-remove / clear buttons are exempt */
    const onBoxMouseDown = (e) => {
      /* clicking the field itself always opens (a focus event won't re-fire
         when the field kept focus across a single-mode pick) */
      if (e.target === inputRef.current) { setOpen(true); return; }
      if (e.target.closest && e.target.closest('.ds-input__chip-remove, .ds-input__clear')) return;
      e.preventDefault();
      if (inputRef.current) inputRef.current.focus();
      setOpen((o) => !o);
    };
    const onBlur = (e) => {
      if (rootRef.current && e.relatedTarget && rootRef.current.contains(e.relatedTarget)) return;
      if (open) close();
    };

    const showClear = open ? query !== '' : (!multi && Boolean(single));
    const clear = () => {
      if (open && query !== '') setQuery('');
      else if (!multi) setSingle(null);
      if (inputRef.current) inputRef.current.focus();
    };

    const rowId = (i) => `${idBase}-opt-${i}`;
    /* polite live announcement of filter results for screen readers */
    const status = !open ? '' : (rowCount === 0
      ? `No matching ${noun}`
      : `${filtered.length} of ${all.length} ${noun} shown${canAdd ? `, plus add “${q}”` : ''}`);

    return (
      <div className={cx('ds-input', 'ds-select', 'ds-select--searchable', multi && 'ds-input--pills', open && 'is-open')} ref={rootRef}>
        <label className="ds-input__label" id={`${idBase}-label`} htmlFor={`${idBase}-field`}>{label}</label>
        <div className="ds-input__box" onMouseDown={onBoxMouseDown}>
          {multi && values.map((v) => (
            <span key={v} className="ds-pill ds-pill--sm ds-pill--green ds-pill--minimal">
              {v}
              <button
                type="button"
                className="ds-input__chip-remove"
                aria-label={`Remove ${v}`}
                onClick={() => choose(v)}
              >
                <icons.close />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className="ds-input__field"
            type="text"
            id={`${idBase}-field`}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${idBase}-menu`}
            aria-autocomplete="list"
            aria-activedescendant={open && rowCount > 0 ? rowId(activeIdx) : undefined}
            autoComplete="off"
            placeholder={multi && values.length > 0 ? '' : (!multi && single ? single : placeholder)}
            value={open || multi ? query : (single || '')}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={onKey}
            onBlur={onBlur}
          />
          {showClear && (
            <button type="button" className="ds-input__clear" aria-label={open ? 'Clear search' : `Clear ${label}`} onClick={clear}>
              <icons.clear />
            </button>
          )}
          <span className="ds-input__chevron" aria-hidden="true"><icons.chevron /></span>
        </div>
        <div className="ds-menu" role="listbox" id={`${idBase}-menu`} aria-labelledby={`${idBase}-label`} aria-multiselectable={multi || undefined} ref={menuRef}>
          {filtered.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              role="option"
              id={rowId(i)}
              tabIndex={-1}
              aria-selected={isSelected(opt.label)}
              className={cx('ds-menu__item', multi && 'ds-menu__item--multi', open && i === activeIdx && 'is-active')}
              onMouseDown={(e) => e.preventDefault()} /* keep focus in the field */
              onMouseMove={() => setActive(i)}
              onClick={() => pickRow(i)}
            >
              <span className="ds-menu__text">{highlight(opt.label, query)}</span>
              {opt.custom && <span className="ds-menu__affix">custom</span>}
              {multi && (
                <span className={cx('ds-checkbox', isSelected(opt.label) ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked')} aria-hidden="true">
                  <span className="ds-checkbox__box"><CheckboxGlyphs /></span>
                </span>
              )}
            </button>
          ))}
          {canAdd && (
            <button
              type="button"
              role="option"
              id={rowId(filtered.length)}
              tabIndex={-1}
              aria-selected={false}
              className={cx('ds-menu__item', 'ds-menu__item--add', open && activeIdx === filtered.length && 'is-active')}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(filtered.length)}
              onClick={() => pickRow(filtered.length)}
            >
              <span className="ds-menu__add-icon" aria-hidden="true"><icons.plus /></span>
              Add “{q}”
            </button>
          )}
          {/* shipped empty state — display toggled inline, as on the input doc page */}
          <div className="ds-menu__empty" style={{ display: rowCount === 0 ? 'block' : 'none' }}>
            No matching {noun} for “{q}”
          </div>
        </div>
        <span className="ds-sr-only" role="status">{status}</span>
      </div>
    );
  }

  const EDUCATORS = ['Aisha Patel', 'Ben Carter', 'Chloe Nguyen', 'Daniel O’Brien', 'Emily Sato', 'Fatima Hassan', 'Grace Kim', 'Hannah Wright'];
  const TAG_OPTIONS = ['Allergy', 'Behaviour', 'Excursion', 'Incident', 'Medication', 'Sun safety'];

  function AutocompleteCard() {
    const [mode, setMode] = useState('single');
    return (
      <Card
        legacy="InputAutocomplete"
        ds="ds-select + searchable"
        status="WIP"
        note="Type-to-filter select on the shipped ds-select foundations: the trigger hosts a real search field, typing filters the menu live with the matched text highlighted, and the arrow keys walk the filtered results. Works in single and multi (chips) modes."
      >
        <Controls>
          <VariantPills
            label="Mode"
            options={[{ value: 'single', label: 'Single' }, { value: 'multi', label: 'Multi (chips)' }]}
            value={mode}
            onChange={setMode}
          />
        </Controls>
        <Stage form room>
          {mode === 'single'
            ? <SearchableSelect key="single" idBase="wb-ac-s" label="Educator" placeholder="Search educators" options={EDUCATORS} noun="educators" />
            : <SearchableSelect key="multi" idBase="wb-ac-m" label="Educators" placeholder="Search educators" options={EDUCATORS} multi noun="educators" />}
        </Stage>
        <StateNote text="Replaces legacy InputAutocomplete. Typing filters case-insensitively; ↑/↓ move through the filtered results, Enter selects, Escape clears the query first and closes on a second press; a query with no hits shows the empty state with the query echoed. In multi mode Backspace in an empty field removes the last chip. Open point for the eng conversation: the async/loading (remote options) pattern is not designed yet — this demo filters a local list." />
      </Card>
    );
  }

  function ComboboxCard() {
    const [mode, setMode] = useState('single');
    return (
      <Card
        legacy="InputCombobox"
        ds="ds-select + allow-custom"
        status="WIP"
        note="The searchable select plus free-text creation: when the query isn’t an existing option, a pinned “Add …” row creates it — the created value appears selected (a chip in multi mode) and carries a subtle custom affix in the menu. The duplicate guard is case-insensitive."
      >
        <Controls>
          <VariantPills
            label="Mode"
            options={[{ value: 'single', label: 'Single' }, { value: 'multi', label: 'Multi (chips)' }]}
            value={mode}
            onChange={setMode}
          />
        </Controls>
        <Stage form room>
          {mode === 'single'
            ? <SearchableSelect key="single" idBase="wb-cc-s" label="Tag" placeholder="Choose or type a tag" options={TAG_OPTIONS} allowCustom noun="tags" />
            : <SearchableSelect key="multi" idBase="wb-cc-m" label="Tags" placeholder="Choose or type tags" options={TAG_OPTIONS} multi allowCustom noun="tags" />}
        </Stage>
        <StateNote text="Replaces legacy InputCombobox. Type a value that isn’t in the list and pick the “Add …” row (click, or End/↓ then Enter) to create it; created values are marked custom in the menu and remove like any chip. Contract note: validation of custom values (format, length, allowed characters) is the consumer’s job — the component only guards case-insensitive duplicates." />
      </Card>
    );
  }

  function FormsWorkbench() {
    return (
      <React.Fragment>
        <TextInputCard />
        <TextareaCard />
        <SelectCard />
        <SearchCard />
        <SendCard />
        <CheckboxCard />
        <AutocompleteCard />
        <ComboboxCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-forms');
  if (el) ReactDOM.createRoot(el).render(<FormsWorkbench />);
})();
