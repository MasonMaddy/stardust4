/*
 * Office Migration Board — Datatable programme workbench (wb-datatable).
 *
 * The legacy Datatable/Spreadsheet family rebuilt in three reviewable phases,
 * one workbench card each — plus a design-exploration card:
 *   1. ds-datatable foundations — sort, selection, density, states, pagination
 *   2. ds-datatable-toolbar     — search, filter chips, column editing
 *   3. ds-datatable--cards      — responsive card-collapse (the mobile answer)
 *   4. Wide tables — 10+ columns: four approaches (Scroll+ · priority + row
 *      expand · named views · stacked cells) over one 12-column dataset,
 *      switchable side by side for review. Horizontal scroll is NOT discounted
 *      — approach 1 is the current pattern done properly.
 *
 * Decisions honoured: spreadsheet inline editing is NOT built (documented
 * pattern later); right-click context menus become visible row-action kebabs;
 * mobile overflow is card-collapse, not the legacy's mouse-only drag-scroll.
 *
 * New WIP classes live in wip/datatable.css (--sd-* tokens only). Shipped
 * classes composed as-is: ds-checkbox, ds-pill, ds-input/ds-select/ds-menu,
 * ds-btn, ds-message-box — plus the overlays wave's ds-menu-anchor
 * (wip/overlays.css, linked page-wide) anchoring the kebab menus.
 * No innerHTML anywhere. Wrapped in an IIFE: Babel-standalone scripts share
 * one global scope.
 */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, CheckboxGlyphs, icons, cx } = window.WB;

  /* close an open popup when clicking anywhere outside `ref` */
  function useOutsideClose(ref, open, close) {
    useEffect(() => {
      if (!open) return undefined;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
  }

  /* ── Local SVG glyphs (currentColor) ─────────────────────────────────── */
  const IconKebab = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="1.4" fill="currentColor" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="13" r="1.4" fill="currentColor" />
    </svg>
  );
  const IconSortBoth = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconSortAsc = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconSortDesc = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconChevLeft = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconChevRight = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconFilter = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 3.5h11L9.3 8.6v3.4l-2.6 1.5V8.6L2.5 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconColumns = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 3v10M9.8 3v10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
  const IconPencil = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11.3 2.6l2.1 2.1L5.2 12.9 2.5 13.5l.6-2.7 8.2-8.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
  const IconCopy = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 3.5v-1h-8v8h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  const IconArchive = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 6.5V12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6.5M6.5 9h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  const IconAlert = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 22 20H2L12 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );

  /* ── Fictional sample data — 30 children/enrolments ──────────────────── */
  const ROOMS = ['Possums', 'Koalas', 'Joeys', 'Wombats'];
  const STATUSES = ['Active', 'Waitlisted', 'Overdue', 'Inactive'];
  const STATUS_PILL = {
    Active: 'ds-pill--green',
    Waitlisted: 'ds-pill--purple',
    Overdue: 'ds-pill--orange',
    Inactive: 'ds-pill--grey',
  };

  const ROWS = [
    { id: 1, name: 'Zoe Nakamura', room: 'Possums', status: 'Active', start: '2024-03-11', balance: 0 },
    { id: 2, name: 'Archie Whitfield', room: 'Koalas', status: 'Active', start: '2023-07-24', balance: 145 },
    /* deliberately long name — the data-stability check */
    { id: 3, name: 'Alexandrina Featherstonehaugh-Cholmondeley', room: 'Wombats', status: 'Waitlisted', start: '2026-01-19', balance: 0 },
    { id: 4, name: 'Billie Okafor', room: 'Joeys', status: 'Active', start: '2024-11-03', balance: 62.5 },
    { id: 5, name: 'Charlie Tran', room: 'Possums', status: 'Overdue', start: '2023-02-14', balance: 812.4 },
    { id: 6, name: 'Delilah Marchetti', room: 'Koalas', status: 'Active', start: '2025-05-06', balance: 38 },
    { id: 7, name: 'Elias Papadopoulos-Berg', room: 'Wombats', status: 'Active', start: '2024-08-19', balance: 220.1 },
    { id: 8, name: 'Freya Lindqvist', room: 'Joeys', status: 'Inactive', start: '2022-10-31', balance: 0 },
    { id: 9, name: 'Gus Abernathy', room: 'Possums', status: 'Active', start: '2025-02-09', balance: 74.25 },
    { id: 10, name: 'Harriet O’Loughlin', room: 'Koalas', status: 'Overdue', start: '2023-04-17', balance: 1204 },
    { id: 11, name: 'Ismail Haddad', room: 'Wombats', status: 'Active', start: '2024-01-29', balance: 96.8 },
    { id: 12, name: 'Juniper Vance', room: 'Joeys', status: 'Waitlisted', start: '2026-03-02', balance: 0 },
    { id: 13, name: 'Kai Mackenzie', room: 'Possums', status: 'Active', start: '2023-09-12', balance: 51 },
    /* negative balance = account in credit — the numeric-sort edge */
    { id: 14, name: 'Luna Petrova', room: 'Koalas', status: 'Active', start: '2025-07-21', balance: -45 },
    { id: 15, name: 'Mateo Fernandez', room: 'Wombats', status: 'Inactive', start: '2021-06-15', balance: 0 },
    { id: 16, name: 'Nia Adeyemi', room: 'Joeys', status: 'Active', start: '2024-05-27', balance: 130.45 },
    { id: 17, name: 'Oscar Brennan', room: 'Possums', status: 'Overdue', start: '2022-12-05', balance: 458.9 },
    { id: 18, name: 'Priya Raghunathan', room: 'Koalas', status: 'Active', start: '2025-09-15', balance: 88.6 },
    { id: 19, name: 'Quinn Ashworth', room: 'Wombats', status: 'Active', start: '2023-11-20', balance: 42.15 },
    { id: 20, name: 'Rosie Delacroix-Hammersley', room: 'Joeys', status: 'Waitlisted', start: '2026-02-11', balance: 0 },
    { id: 21, name: 'Sam Woodley', room: 'Possums', status: 'Active', start: '2024-04-08', balance: 19.9 },
    { id: 22, name: 'Tilly Nakagawa', room: 'Koalas', status: 'Inactive', start: '2022-03-23', balance: 0 },
    { id: 23, name: 'Uma Castellanos', room: 'Wombats', status: 'Active', start: '2025-01-13', balance: 240 },
    { id: 24, name: 'Vincent Achterberg', room: 'Joeys', status: 'Active', start: '2023-05-30', balance: 66.35 },
    { id: 25, name: 'Willow Fitzgerald', room: 'Possums', status: 'Overdue', start: '2024-09-02', balance: 375.2 },
    { id: 26, name: 'Xavier Lindqvist-Munro', room: 'Koalas', status: 'Active', start: '2025-11-24', balance: 5 },
    { id: 27, name: 'Yasmin El-Sayed', room: 'Wombats', status: 'Active', start: '2024-06-16', balance: 154.75 },
    { id: 28, name: 'Zachary Pemberton', room: 'Joeys', status: 'Inactive', start: '2021-08-09', balance: 0 },
    { id: 29, name: 'Aroha Ngata-Williams', room: 'Possums', status: 'Active', start: '2025-04-01', balance: 27.6 },
    { id: 30, name: 'Bodhi Sanderson', room: 'Koalas', status: 'Waitlisted', start: '2026-04-27', balance: 0 },
  ];

  const COLUMNS = [
    { key: 'name', label: 'Child', type: 'text', primary: true },
    { key: 'room', label: 'Room', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'start', label: 'Start date', type: 'date' },
    { key: 'balance', label: 'Balance', type: 'number', num: true },
  ];

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
  };
  const fmtMoney = (n) => {
    const s = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${n < 0 ? '-' : ''}$${s}`;
  };

  /* real value-typed sorting — dates and money sort by value, not display text */
  const compareBy = (col) => (a, b) => {
    if (col.type === 'number') return a[col.key] - b[col.key];
    if (col.type === 'date') return a[col.key] < b[col.key] ? -1 : a[col.key] > b[col.key] ? 1 : 0;
    return String(a[col.key]).localeCompare(String(b[col.key]));
  };
  const sortRows = (rows, sort) => {
    if (!sort) return rows;
    const col = COLUMNS.find((c) => c.key === sort.key);
    const out = [...rows].sort(compareBy(col));
    return sort.dir === 'desc' ? out.reverse() : out;
  };

  /* click-to-sort cycle: none → ascending → descending → none */
  function useSort() {
    const [sort, setSort] = useState(null);
    const cycle = (key) =>
      setSort((cur) => {
        if (!cur || cur.key !== key) return { key, dir: 'asc' };
        if (cur.dir === 'asc') return { key, dir: 'desc' };
        return null;
      });
    return { sort, cycle, setSort };
  }

  /* ── Shipped ds-checkbox with a REAL indeterminate native input ──────── */
  function DsCheckbox({ checked, indeterminate = false, disabled = false, label, onChange }) {
    const ref = useRef(null);
    useEffect(() => {
      if (ref.current) ref.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const stateClass = indeterminate
      ? 'ds-checkbox--indeterminate'
      : checked ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked';
    return (
      <span className={cx('ds-checkbox', 'ds-checkbox--interactive', stateClass, disabled && 'is-disabled')}>
        <input
          ref={ref}
          type="checkbox"
          className="ds-checkbox__native"
          checked={checked}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="ds-checkbox__box" aria-hidden="true"><CheckboxGlyphs /></span>
      </span>
    );
  }

  /* nearest scroll container's bottom edge (else the viewport's) — used to
     flip menus upward instead of letting a scroll wrap clip them */
  const scrollBottom = (el) => {
    let p = el.parentElement;
    while (p) {
      const s = window.getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY)) return p.getBoundingClientRect().bottom;
      p = p.parentElement;
    }
    return window.innerHeight;
  };

  /* ── Row-actions kebab — the visible replacement for right-click menus ── */
  const ROW_ACTIONS = [
    { id: 'edit', label: 'Edit', Icon: IconPencil },
    { id: 'duplicate', label: 'Duplicate', Icon: IconCopy },
    { id: 'archive', label: 'Archive', Icon: IconArchive },
  ];

  function RowMenu({ rowName, onAction }) {
    const [open, setOpen] = useState(false);
    const [up, setUp] = useState(false);
    const [pendingFocus, setPendingFocus] = useState(null);
    const rootRef = useRef(null);
    const anchorRef = useRef(null);
    const itemRefs = useRef({});
    useOutsideClose(rootRef, open, () => setOpen(false));

    const openMenu = (focusTarget) => {
      const a = anchorRef.current;
      /* ~168px ≈ three 44px items + menu padding */
      if (a) setUp(a.getBoundingClientRect().bottom + 168 > scrollBottom(a));
      setOpen(true);
      if (focusTarget) setPendingFocus(focusTarget);
    };
    const close = (refocus) => {
      setOpen(false);
      if (refocus && anchorRef.current) anchorRef.current.focus();
    };

    useEffect(() => {
      if (open && pendingFocus) {
        const idx = pendingFocus === 'last' ? ROW_ACTIONS.length - 1 : 0;
        const node = itemRefs.current[ROW_ACTIONS[idx].id];
        if (node) node.focus();
        setPendingFocus(null);
      }
    }, [open, pendingFocus]);

    const focusStep = (delta) => {
      const i = ROW_ACTIONS.findIndex((it) => itemRefs.current[it.id] === document.activeElement);
      const next = ROW_ACTIONS[(i + delta + ROW_ACTIONS.length) % ROW_ACTIONS.length];
      const node = itemRefs.current[next.id];
      if (node) node.focus();
    };
    const onMenuKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); focusStep(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusStep(-1); }
      else if (e.key === 'Home') { e.preventDefault(); itemRefs.current[ROW_ACTIONS[0].id].focus(); }
      else if (e.key === 'End') { e.preventDefault(); itemRefs.current[ROW_ACTIONS[ROW_ACTIONS.length - 1].id].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    };
    const onAnchorClick = (e) => {
      if (open) { setOpen(false); return; }
      /* e.detail === 0 → keyboard click (Enter/Space): focus the first item */
      openMenu(e.detail === 0 ? 'first' : null);
    };
    const onAnchorKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); openMenu('first'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); openMenu('last'); }
    };

    return (
      <div
        ref={rootRef}
        className={cx('ds-menu-anchor', 'ds-menu-anchor--end', up && 'ds-datatable__menu-up', open && 'is-open')}
      >
        <button
          type="button"
          className="ds-datatable__kebab"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Actions for ${rowName}`}
          ref={anchorRef}
          onClick={onAnchorClick}
          onKeyDown={onAnchorKey}
        >
          <IconKebab />
        </button>
        <div className="ds-menu" role="menu" aria-label={`Actions for ${rowName}`} onKeyDown={onMenuKey}>
          {ROW_ACTIONS.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className="ds-menu__item"
              ref={(node) => { itemRefs.current[it.id] = node; }}
              onClick={() => { onAction(`${it.label} — ${rowName}`); close(true); }}
            >
              <span className="ds-menu__icon" aria-hidden="true"><it.Icon /></span>
              {it.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── ds-datatable — the shared table renderer ────────────────────────── */
  function DsDatatable({
    label, rows, columns = COLUMNS, sort, onSort,
    density = 'comfortable', zebra = false, sticky = false,
    selected, onToggleRow, onToggleAll,
    onAction,
    status = 'data', empty, onRetry,
    responsive = false, forceCards = false,
  }) {
    const selectable = !!selected;
    const actions = !!onAction;
    /* zero data rows in the data state presents the empty state (data-stable) */
    const effStatus = status === 'data' && rows.length === 0 ? 'empty' : status;
    const colCount = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);
    const allSelected = selectable && rows.length > 0 && rows.every((r) => selected.has(r.id));
    const someSelected = selectable && !allSelected && rows.some((r) => selected.has(r.id));

    const cellContent = (row, col) => {
      if (col.type === 'status') {
        return (
          <span className={cx('ds-pill', 'ds-pill--sm', 'ds-pill--minimal', STATUS_PILL[row.status])}>
            {row.status}
          </span>
        );
      }
      if (col.type === 'date') return fmtDate(row[col.key]);
      if (col.type === 'number') return fmtMoney(row[col.key]);
      return row[col.key];
    };

    const emptyBlock = (
      <div className="ds-datatable__empty">
        <span className="ds-datatable__empty-icon" aria-hidden="true"><icons.search /></span>
        <p className="ds-datatable__empty-title">{empty ? empty.title : 'Nothing here yet'}</p>
        <p className="ds-datatable__empty-body">{empty ? empty.body : 'Rows you add will appear here.'}</p>
        {empty && empty.actionLabel && (
          <button type="button" className="ds-btn ds-btn--ghost" onClick={empty.onAction}>
            {empty.actionLabel}
          </button>
        )}
      </div>
    );

    const errorBlock = (
      <div className="ds-datatable__error">
        <div className="ds-message-box ds-message-box--red">
          <div className="ds-message-box__row">
            <span className="ds-message-box__icon" aria-hidden="true"><IconAlert /></span>
            <div className="ds-message-box__text">
              <div className="ds-message-box__title-row">
                <p className="ds-message-box__title">Couldn’t load children</p>
              </div>
              <p className="ds-message-box__body">
                The enrolments service didn’t respond. Your sorting and selection are preserved — try again.
              </p>
              <button type="button" className="ds-message-box__action" onClick={onRetry}>Try again</button>
            </div>
          </div>
        </div>
      </div>
    );

    /* card-collapse derives its anatomy from the same column config */
    const titleCol = columns.find((c) => c.primary) || columns[0];
    const subCol = columns.find((c) => c !== titleCol && c.key === 'room') || columns.find((c) => c !== titleCol);
    const cardCols = columns.filter((c) => c !== titleCol && c !== subCol);

    return (
      <div
        className={cx(
          'ds-datatable',
          density === 'compact' ? 'ds-datatable--compact' : 'ds-datatable--comfortable',
          zebra && 'ds-datatable--zebra',
          responsive && 'ds-datatable--responsive',
          forceCards && 'ds-datatable--cards'
        )}
      >
        <span className="ds-datatable__sr" role="status">
          {effStatus === 'loading' ? 'Loading children…' : ''}
        </span>
        <div className={cx('ds-datatable__wrap', sticky && 'ds-datatable__wrap--sticky')}>
          <table className="ds-datatable__table">
            <caption className="ds-datatable__sr">{label}</caption>
            <thead>
              <tr>
                {selectable && (
                  <th scope="col" className="ds-datatable__th ds-datatable__select">
                    <DsCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      disabled={effStatus !== 'data'}
                      label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                      onChange={() => onToggleAll(rows)}
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const active = onSort && sort && sort.key === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={onSort ? (active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                      className={cx('ds-datatable__th', col.num && 'ds-datatable__th--num')}
                    >
                      {onSort ? (
                        <button
                          type="button"
                          className={cx('ds-datatable__sort', active && 'ds-datatable__sort--active')}
                          onClick={() => onSort(col.key)}
                        >
                          {col.label}
                          <span className="ds-datatable__sort-icon" aria-hidden="true">
                            {active ? (sort.dir === 'asc' ? <IconSortAsc /> : <IconSortDesc />) : <IconSortBoth />}
                          </span>
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
                {actions && (
                  <th scope="col" className="ds-datatable__th ds-datatable__actions">
                    <span className="ds-datatable__sr">Row actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {effStatus === 'loading' &&
                [0, 1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="ds-datatable__row ds-datatable__skeleton" aria-hidden="true">
                    {selectable && (
                      <td className="ds-datatable__td ds-datatable__select">
                        <span className="ds-datatable__skeleton-bar" style={{ width: 18 }}></span>
                      </td>
                    )}
                    {columns.map((col, j) => (
                      <td key={col.key} className={cx('ds-datatable__td', col.num && 'ds-datatable__td--num')}>
                        <span className="ds-datatable__skeleton-bar" style={{ width: `${[75, 55, 45, 60, 40][j % 5]}%` }}></span>
                      </td>
                    ))}
                    {actions && (
                      <td className="ds-datatable__td ds-datatable__actions">
                        <span className="ds-datatable__skeleton-bar" style={{ width: 18 }}></span>
                      </td>
                    )}
                  </tr>
                ))}
              {effStatus === 'empty' && (
                <tr className="ds-datatable__row ds-datatable__row--static">
                  <td colSpan={colCount} className="ds-datatable__td">{emptyBlock}</td>
                </tr>
              )}
              {effStatus === 'error' && (
                <tr className="ds-datatable__row ds-datatable__row--static">
                  <td colSpan={colCount} className="ds-datatable__td">{errorBlock}</td>
                </tr>
              )}
              {effStatus === 'data' &&
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cx('ds-datatable__row', selectable && selected.has(row.id) && 'ds-datatable__row--selected')}
                  >
                    {selectable && (
                      <td className="ds-datatable__td ds-datatable__select">
                        <DsCheckbox
                          checked={selected.has(row.id)}
                          label={`Select ${row.name}`}
                          onChange={() => onToggleRow(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cx('ds-datatable__td', col.num && 'ds-datatable__td--num', col.primary && 'ds-datatable__td--primary')}
                      >
                        {cellContent(row, col)}
                      </td>
                    ))}
                    {actions && (
                      <td className="ds-datatable__td ds-datatable__actions">
                        <RowMenu rowName={row.name} onAction={onAction} />
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* card-collapse presentation — same data, same state, CSS picks one */}
        {responsive && (
          <ul className="ds-datatable__cards">
            {rows.map((row) => {
              const isSel = selectable && selected.has(row.id);
              return (
                <li key={row.id} className={cx('ds-datatable__card', isSel && 'ds-datatable__card--selected')}>
                  <div className="ds-datatable__card-head">
                    {selectable && (
                      <DsCheckbox
                        checked={selected.has(row.id)}
                        label={`Select ${row.name}`}
                        onChange={() => onToggleRow(row.id)}
                      />
                    )}
                    <div className="ds-datatable__card-id">
                      <p className="ds-datatable__card-title">{cellContent(row, titleCol)}</p>
                      {subCol && <p className="ds-datatable__card-sub">{cellContent(row, subCol)}</p>}
                    </div>
                    {actions && <RowMenu rowName={row.name} onAction={onAction} />}
                  </div>
                  {cardCols.map((col) => (
                    <div key={col.key} className="ds-datatable__card-row">
                      <span className="ds-datatable__card-label">{col.label}</span>
                      <span>{cellContent(row, col)}</span>
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  /* ── Rows-per-page select — shipped ds-select/ds-menu pattern ────────── */
  function PageSizeSelect({ idBase, value, onChange, options = [10, 20, 30] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClose(ref, open, () => setOpen(false));
    const labelId = `${idBase}-pp-label`;
    const menuId = `${idBase}-pp-menu`;

    const onBoxKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };

    return (
      <div className="ds-datatable__pagesize-field">
        <span className="ds-input__label" id={labelId}>Rows per page</span>
        <div className={cx('ds-input', 'ds-select', 'ds-datatable__pagesize', open && 'is-open')} ref={ref}>
          <div
            className="ds-input__box ds-input__box--select"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={menuId}
            aria-labelledby={labelId}
            tabIndex={0}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={onBoxKey}
          >
            <span className="ds-input__display has-value">{value}</span>
            <span className="ds-input__chevron" aria-hidden="true"><icons.chevron /></span>
          </div>
          <div className="ds-menu" role="listbox" id={menuId} aria-labelledby={labelId}>
            {options.map((n) => (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={value === n}
                className="ds-menu__item"
                onClick={() => { onChange(n); setOpen(false); }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Pagination footer — lives OUTSIDE the scroll region ─────────────── */
  function Pagination({ idBase, total, page, perPage, onPage, onPerPage }) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const first = total === 0 ? 0 : (page - 1) * perPage + 1;
    const last = Math.min(total, page * perPage);
    return (
      <nav className="ds-datatable__footer" aria-label="Pagination">
        <PageSizeSelect idBase={idBase} value={perPage} onChange={onPerPage} />
        <span className="ds-datatable__range" aria-live="polite">{first}–{last} of {total}</span>
        <div className="ds-datatable__pager">
          <button
            type="button"
            className="ds-datatable__page"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            <IconChevLeft />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className="ds-datatable__page"
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="ds-datatable__page"
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            <IconChevRight />
          </button>
        </div>
      </nav>
    );
  }

  /* ── Multi-check menu (Filter · Edit columns) — shipped menu pattern ─── */
  function MultiMenu({ buttonLabel, ButtonIcon, menuLabel, groups, onToggle }) {
    const [open, setOpen] = useState(false);
    const [pendingFocus, setPendingFocus] = useState(false);
    const rootRef = useRef(null);
    const anchorRef = useRef(null);
    const listRef = useRef(null);
    useOutsideClose(rootRef, open, () => setOpen(false));

    const items = () => Array.from(listRef.current ? listRef.current.querySelectorAll('.ds-menu__item') : []);

    useEffect(() => {
      if (open && pendingFocus) {
        const first = items()[0];
        if (first) first.focus();
        setPendingFocus(false);
      }
    }, [open, pendingFocus]);

    const close = (refocus) => {
      setOpen(false);
      if (refocus && anchorRef.current) anchorRef.current.focus();
    };
    const onMenuKey = (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    };
    const onAnchorClick = (e) => {
      if (open) { setOpen(false); return; }
      setOpen(true);
      if (e.detail === 0) setPendingFocus(true);
    };
    const onAnchorKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setPendingFocus(true); }
    };

    return (
      <div className={cx('ds-menu-anchor', open && 'is-open')} ref={rootRef}>
        <button
          type="button"
          className="ds-btn ds-btn--ghost"
          aria-haspopup="listbox"
          aria-expanded={open}
          ref={anchorRef}
          onClick={onAnchorClick}
          onKeyDown={onAnchorKey}
        >
          <span className="ds-btn__icon" aria-hidden="true"><ButtonIcon /></span>
          {buttonLabel}
          <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>
        </button>
        <div
          className="ds-menu"
          role="listbox"
          aria-multiselectable="true"
          aria-label={menuLabel}
          ref={listRef}
          onKeyDown={onMenuKey}
        >
          {groups.map((g, gi) => (
            <React.Fragment key={g.key}>
              {gi > 0 && <div className="ds-menu__divider" role="presentation"></div>}
              {g.name && <span className="ds-datatable-toolbar__menu-label" role="presentation">{g.name}</span>}
              {g.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={o.checked}
                  aria-disabled={o.disabled || undefined}
                  className="ds-menu__item ds-menu__item--multi"
                  onClick={() => { if (!o.disabled) onToggle(g.key, o.value); }}
                >
                  {o.label}
                  <span
                    className={cx('ds-checkbox', o.checked ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked')}
                    aria-hidden="true"
                  >
                    <span className="ds-checkbox__box"><CheckboxGlyphs /></span>
                  </span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * Card 1 — ds-datatable foundations
   * ══════════════════════════════════════════════════════════ */
  function FoundationsCard() {
    const [tableState, setTableState] = useState('data');
    const [density, setDensity] = useState('comfortable');
    const [zebra, setZebra] = useState(false);
    const [sticky, setSticky] = useState(false);
    const [selectable, setSelectable] = useState(true);
    const { sort, cycle } = useSort();
    const [selected, setSelected] = useState(() => new Set());
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [lastAction, setLastAction] = useState(null);

    const sorted = useMemo(() => sortRows(ROWS, sort), [sort]);
    const pages = Math.max(1, Math.ceil(ROWS.length / perPage));
    const safePage = Math.min(page, pages);
    const pageRows = sorted.slice((safePage - 1) * perPage, safePage * perPage);

    const toggleRow = (id) =>
      setSelected((cur) => {
        const next = new Set(cur);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    const toggleAll = (rows) =>
      setSelected((cur) => {
        const next = new Set(cur);
        const all = rows.every((r) => next.has(r.id));
        rows.forEach((r) => { if (all) next.delete(r.id); else next.add(r.id); });
        return next;
      });

    return (
      <Card
        legacy={['Datatable', 'Spreadsheet']}
        ds="ds-datatable — foundations"
        status="wip"
        note="Phase 1 of the datatable programme — the table shell. Real value-typed column sorting (text, date, money), row selection with a true indeterminate select-all, density and zebra options, loading/empty/error states and a pagination footer. Right-click context menus from the legacy become a visible row-actions kebab (decision); spreadsheet inline editing is deliberately absent — it returns later as a documented pattern, not a component."
      >
        <Controls>
          <VariantPills
            label="State"
            options={[
              { value: 'data', label: 'Data' },
              { value: 'loading', label: 'Loading' },
              { value: 'empty', label: 'Empty' },
              { value: 'error', label: 'Error' },
            ]}
            value={tableState}
            onChange={setTableState}
          />
          <VariantPills
            label="Density"
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
            value={density}
            onChange={setDensity}
          />
          <Toggle label="Zebra" on={zebra} onChange={setZebra} />
          <Toggle label="Sticky header" on={sticky} onChange={setSticky} />
          <Toggle label="Row selection" on={selectable} onChange={setSelectable} />
        </Controls>
        <Stage stack>
          <DsDatatable
            label="Children and enrolments"
            rows={tableState === 'data' ? pageRows : []}
            sort={sort}
            onSort={cycle}
            density={density}
            zebra={zebra}
            sticky={sticky}
            selected={selectable ? selected : undefined}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onAction={(a) => setLastAction(a)}
            status={tableState}
            empty={{
              title: 'No children yet',
              body: 'Enrolments you add will appear here — nothing is hiding behind a filter.',
              actionLabel: 'Add a child',
              onAction: () => setTableState('data'),
            }}
            onRetry={() => setTableState('data')}
          />
          {tableState === 'data' && (
            <Pagination
              idBase="wb-dt1"
              total={ROWS.length}
              page={safePage}
              perPage={perPage}
              onPage={setPage}
              onPerPage={(n) => { setPerPage(n); setPage(1); }}
            />
          )}
          <p className="mb-state-note" role="status">
            {selectable ? `Selection: ${selected.size} of ${ROWS.length}.` : 'Selection off.'}{' '}
            {lastAction ? `Last row action: ${lastAction}.` : 'No row action yet — try a kebab menu.'}
          </p>
        </Stage>
        <StateNote text="Sort headers are real buttons cycling none → ascending → descending, with aria-sort on the column header — dates and balances sort by value, not display text. Select-all is a genuine indeterminate checkbox (the native indeterminate property, not a styled lookalike); select one row and watch it. The kebab replaces the legacy right-click context menu — fully keyboard operable (Enter/Arrows open, ↑/↓ wrap, Home/End, Escape returns focus) and it flips upward when the sticky wrap would clip it. Comfortable density keeps 44px rows; compact drops text rows to 36px but the shipped 44px checkbox keeps its touch floor while selection is on. The pagination footer sits outside the scroll region so it never scrolls away — the legacy's sticky footer without position hacks. Single-column sort is deliberate here; the legacy's server multi-sort stays an API concern for the build phase." />
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * Card 2 — toolbar & filter chips
   * ══════════════════════════════════════════════════════════ */
  function ToolbarCard() {
    const [query, setQuery] = useState('');
    const [roomF, setRoomF] = useState(() => new Set());
    const [statusF, setStatusF] = useState(() => new Set());
    const [visibleCols, setVisibleCols] = useState(() => new Set(COLUMNS.map((c) => c.key)));
    const { sort, cycle, setSort } = useSort();

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return ROWS.filter(
        (r) =>
          (!q || r.name.toLowerCase().includes(q)) &&
          (roomF.size === 0 || roomF.has(r.room)) &&
          (statusF.size === 0 || statusF.has(r.status))
      );
    }, [query, roomF, statusF]);
    const rows = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
    const cols = COLUMNS.filter((c) => visibleCols.has(c.key));

    const toggleIn = (set) => (value) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    };
    const onFilterToggle = (groupKey, value) => {
      if (groupKey === 'room') setRoomF((cur) => toggleIn(cur)(value));
      else setStatusF((cur) => toggleIn(cur)(value));
    };
    const onColumnToggle = (_groupKey, key) => {
      setVisibleCols((cur) => {
        const next = toggleIn(cur)(key);
        /* hiding the sorted column clears its sort — no invisible ordering */
        if (!next.has(key) && sort && sort.key === key) setSort(null);
        return next;
      });
    };
    const removeChip = (groupKey, value) => onFilterToggle(groupKey, value);
    const clearAll = () => { setQuery(''); setRoomF(new Set()); setStatusF(new Set()); };
    const anyFilter = query.trim() !== '' || roomF.size > 0 || statusF.size > 0;

    const chips = [
      ...[...roomF].map((v) => ({ group: 'room', name: 'Room', value: v })),
      ...[...statusF].map((v) => ({ group: 'status', name: 'Status', value: v })),
    ];

    return (
      <Card
        legacy="Datatable"
        ds="ds-datatable-toolbar — search & filter chips"
        status="wip"
        note="Phase 2 — the toolbar that lived in the legacy sticky header. A shipped ds-input search live-filters rows, the Filter menu adds removable chips (shipped ds-pill), Edit columns toggles column visibility through the same checkbox-menu pattern, and a live result count keeps the state honest. The legacy's dynamic filter-chip templates survive conceptually: chips are generated from filter state — any column can drive one — not hand-authored markup."
      >
        <Stage stack>
          <div className="ds-datatable-toolbar">
            <div className="ds-input ds-datatable-toolbar__search">
              <label className="ds-datatable__sr" htmlFor="wb-dt2-search">Search children</label>
              <div className="ds-input__box">
                <span className="ds-input__leading" aria-hidden="true"><icons.search /></span>
                <input
                  className="ds-input__field"
                  type="search"
                  id="wb-dt2-search"
                  placeholder="Search children"
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
            <div className="ds-datatable-toolbar__filters">
              <MultiMenu
                buttonLabel="Filter"
                ButtonIcon={IconFilter}
                menuLabel="Filter children"
                groups={[
                  { key: 'room', name: 'Room', options: ROOMS.map((v) => ({ value: v, label: v, checked: roomF.has(v) })) },
                  { key: 'status', name: 'Status', options: STATUSES.map((v) => ({ value: v, label: v, checked: statusF.has(v) })) },
                ]}
                onToggle={onFilterToggle}
              />
              <MultiMenu
                buttonLabel="Edit columns"
                ButtonIcon={IconColumns}
                menuLabel="Show or hide columns"
                groups={[{
                  key: 'cols',
                  name: null,
                  options: COLUMNS.map((c) => ({
                    value: c.key,
                    label: c.key === 'name' ? `${c.label} (always shown)` : c.label,
                    checked: visibleCols.has(c.key),
                    disabled: c.key === 'name',
                  })),
                }]}
                onToggle={onColumnToggle}
              />
            </div>
            <div className="ds-datatable-toolbar__actions">
              {anyFilter && (
                <button type="button" className="ds-btn ds-btn--minimal" onClick={clearAll}>Clear all</button>
              )}
            </div>
            <div className="ds-datatable-toolbar__chips">
              {chips.map((c) => (
                <span key={`${c.group}-${c.value}`} className="ds-pill ds-pill--sm ds-pill--green ds-pill--minimal">
                  {c.name}: {c.value}
                  <button
                    type="button"
                    className="ds-input__chip-remove"
                    aria-label={`Remove filter ${c.name} ${c.value}`}
                    onClick={() => removeChip(c.group, c.value)}
                  >
                    <icons.close />
                  </button>
                </span>
              ))}
              <p className="ds-datatable-toolbar__count" role="status">
                {rows.length} of {ROWS.length} children
              </p>
            </div>
          </div>
          <DsDatatable
            label="Children and enrolments — filtered"
            rows={rows}
            columns={cols}
            sort={sort}
            onSort={cycle}
            sticky
            empty={{
              title: 'No children match',
              body: 'Try removing a filter chip or clearing the search — the data is still there.',
              actionLabel: 'Clear search & filters',
              onAction: clearAll,
            }}
          />
        </Stage>
        <StateNote text="Everything re-filters live: type in the search, add chips from the Filter menu, remove a chip and its rows return, and the result count announces the change politely. Chips are the legacy's dynamic filter-chip templates reborn as data — one removable ds-pill per active filter value, with a one-tap Clear all. Edit columns drives column visibility through the same shipped checkbox-menu pattern; Child stays locked on as the row anchor, and hiding a sorted column clears its sort so nothing orders by an invisible field. Zero results get the friendly empty state with a one-click way back. The table scrolls under a sticky header, so the toolbar + header story matches the legacy without its position hacks." />
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * Card 3 — responsive card-collapse
   * ══════════════════════════════════════════════════════════ */
  function CardsCard() {
    const [forceCards, setForceCards] = useState(false);
    const [selectedWide, setSelectedWide] = useState(() => new Set());
    const [selectedPhone, setSelectedPhone] = useState(() => new Set());
    const { sort, cycle } = useSort();
    const [lastAction, setLastAction] = useState(null);

    const subset = useMemo(() => ROWS.slice(0, 12), []);

    const makeToggles = (setter) => ({
      row: (id) =>
        setter((cur) => {
          const next = new Set(cur);
          if (next.has(id)) next.delete(id); else next.add(id);
          return next;
        }),
      all: (rows) =>
        setter((cur) => {
          const next = new Set(cur);
          const all = rows.every((r) => next.has(r.id));
          rows.forEach((r) => { if (all) next.delete(r.id); else next.add(r.id); });
          return next;
        }),
    });
    const wide = makeToggles(setSelectedWide);
    const phone = makeToggles(setSelectedPhone);

    const phoneFrame = {
      width: 375,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: '20px 14px',
      background: 'var(--sd-colour-surface-default)',
      border: '1px solid var(--sd-colour-border-strong)',
      borderRadius: 28,
    };

    return (
      <Card
        legacy={['Datatable', 'Spreadsheet']}
        ds="ds-datatable--cards — responsive collapse"
        status="wip"
        note="Phase 3 — the mobile answer. The legacy handled overflow with mouse-only drag-scroll (decision: dropped — it had no touch or keyboard story). ds-datatable instead collapses to a card list below the breakpoint: the priority columns become the card title and subtitle, the rest become label/value rows, and selection + row actions survive on every card."
      >
        <Controls>
          <Toggle label="Card presentation" on={forceCards} onChange={setForceCards} />
        </Controls>
        <Stage stack>
          <DsDatatable
            label="Children and enrolments — responsive demo (first 12 of 30)"
            rows={subset}
            sort={sort}
            onSort={cycle}
            selected={selectedWide}
            onToggleRow={wide.row}
            onToggleAll={wide.all}
            onAction={(a) => setLastAction(a)}
            responsive
            forceCards={forceCards}
          />
          <p className="mb-state-note" role="status">
            {`Selection: ${selectedWide.size} of ${subset.length} — it survives flipping between the presentations. `}
            {lastAction ? `Last row action: ${lastAction}.` : ''}
          </p>
        </Stage>
        <StateNote text="One dataset, one component, two presentations — CSS picks which one shows. Flip Card presentation to compare at full width; the same swap happens automatically below 640px via the real media query in wip/datatable.css (resize the window on the demo above). Selection state and the kebab actions are shared across both, so nothing is lost in the collapse." />
        <Stage>
          <Cell tag="Phone · 375px — forced card presentation">
            <div style={phoneFrame}>
              <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
                <DsDatatable
                  label="Children and enrolments — phone demo"
                  rows={subset}
                  selected={selectedPhone}
                  onToggleRow={phone.row}
                  onToggleAll={phone.all}
                  onAction={(a) => setLastAction(a)}
                  responsive
                  forceCards
                />
              </div>
            </div>
          </Cell>
        </Stage>
        <StateNote text="The phone frame forces the card modifier because viewport media queries can't see a 375px frame — a real phone hits the media query and gets this for free. Child is the card title, Room the subtitle; Status, Start date and Balance become label/value rows. Checkboxes keep their 44px targets, kebab menus flip upward near the bottom of the scroll area, and long names wrap inside the card instead of forcing a sideways drag — the exact failure the legacy's drag-scroll papered over." />
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * Card 4 — Wide tables (10+ columns) — design exploration
   *
   * Office tables routinely carry 5–10+ columns. Four approaches over the
   * SAME 12-column dataset, switchable for side-by-side judgement:
   *   scroll   — "Scroll+": horizontal scroll done properly (pinned columns,
   *              visible scrollbar, 44px buttons, edge fades, arrow keys)
   *   expand   — 5 priority columns + a per-row expander for the other 7
   *   views    — named column presets (task lenses); All falls back to Scroll+
   *   stacked  — related secondaries stacked under primaries (~6 columns)
   * Selection, sorting and kebab actions are the shared machinery in all four.
   * ══════════════════════════════════════════════════════════ */

  /* The existing 30 fictional enrolments extended with 7 more fields —
     deterministic and fictional throughout (phones use the ACMA-reserved
     0491 570 xxx fictional-number range; never real data). */
  const WIDE_EDUCATORS = ['Maya Chen', 'Tom Barrett', 'Leilani Fa’aoso', 'Grace Duffy', 'Noah Kimura', 'Ruth Adler'];
  const WIDE_GUARDIAN_FIRST = ['Priya', 'Marcus', 'Elena', 'Sam', 'Ingrid', 'Ana', 'Aisha', 'Leo'];
  const WIDE_CCS = [85, 50, 0, 90, 65, 100, 20];
  const WIDE_BOOKINGS = [5, 3, 2, 4, 1, 5, 3];
  const WIDE_ROWS = ROWS.map((r, i) => ({
    ...r,
    educator: WIDE_EDUCATORS[i % WIDE_EDUCATORS.length],
    guardian: `${WIDE_GUARDIAN_FIRST[i % WIDE_GUARDIAN_FIRST.length]} ${r.name.split(' ').slice(-1)[0]}`,
    phone: `0491 570 ${String(110 + i * 3).padStart(3, '0')}`,
    ccs: WIDE_CCS[i % WIDE_CCS.length],
    lastAttend: `2026-06-${String(((i * 5) % 28) + 1).padStart(2, '0')}`,
    bookings: WIDE_BOOKINGS[i % WIDE_BOOKINGS.length],
    absences: (i * 3) % 9,
  }));

  const WIDE_COLUMNS = [
    { key: 'name', label: 'Child', type: 'text', primary: true },
    { key: 'room', label: 'Room', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'educator', label: 'Educator', type: 'text' },
    { key: 'guardian', label: 'Guardian', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'phone', nowrap: true },
    { key: 'ccs', label: 'CCS %', type: 'percent', num: true },
    { key: 'balance', label: 'Balance', type: 'money', num: true },
    { key: 'lastAttend', label: 'Last attendance', type: 'date', nowrap: true },
    { key: 'bookings', label: 'Bookings/wk', type: 'count', num: true },
    { key: 'absences', label: 'Absences', type: 'count', num: true },
    { key: 'start', label: 'Enrolled', type: 'date', nowrap: true },
  ];
  const wideColBy = (key) => WIDE_COLUMNS.find((c) => c.key === key);

  /* value-typed sorting for the wide column set (money/percent/count = numeric) */
  const wideCompare = (col) => (a, b) => {
    if (col.type === 'money' || col.type === 'percent' || col.type === 'count') return a[col.key] - b[col.key];
    if (col.type === 'date') return a[col.key] < b[col.key] ? -1 : a[col.key] > b[col.key] ? 1 : 0;
    return String(a[col.key]).localeCompare(String(b[col.key]));
  };
  const sortWide = (rows, sort) => {
    if (!sort) return rows;
    const out = [...rows].sort(wideCompare(wideColBy(sort.key)));
    return sort.dir === 'desc' ? out.reverse() : out;
  };

  const wideCell = (row, col) => {
    if (col.type === 'status') {
      return (
        <span className={cx('ds-pill', 'ds-pill--sm', 'ds-pill--minimal', STATUS_PILL[row.status])}>
          {row.status}
        </span>
      );
    }
    if (col.type === 'date') return fmtDate(row[col.key]);
    if (col.type === 'money') return fmtMoney(row[col.key]);
    if (col.type === 'percent') return `${row[col.key]}%`;
    if (col.type === 'count') return String(row[col.key]);
    return row[col.key];
  };

  /* secondary-line renderings for the stacked approach */
  const WIDE_SUB_FMT = {
    guardian: (r) => r.guardian,
    phone: (r) => r.phone,
    educator: (r) => r.educator,
    ccs: (r) => `${r.ccs}% CCS`,
    bookings: (r) => `${r.bookings} bkg/wk`,
    absences: (r) => `${r.absences} absent`,
  };

  /* approach 2 — the five priority columns; the rest go behind the expander */
  const WIDE_PRIORITY_KEYS = ['name', 'room', 'status', 'balance', 'lastAttend'];
  const WIDE_PRIORITY_COLS = WIDE_PRIORITY_KEYS.map(wideColBy);
  const WIDE_DETAIL_COLS = WIDE_COLUMNS.filter((c) => !WIDE_PRIORITY_KEYS.includes(c.key));

  /* approach 3 — named column presets (task lenses) */
  const WIDE_VIEWS = {
    overview: { label: 'Overview', keys: ['name', 'room', 'status', 'guardian', 'balance'] },
    attendance: { label: 'Attendance', keys: ['name', 'room', 'lastAttend', 'bookings', 'absences'] },
    billing: { label: 'Billing', keys: ['name', 'guardian', 'ccs', 'balance', 'start'] },
    all: { label: 'All', keys: WIDE_COLUMNS.map((c) => c.key) },
  };

  /* approach 4 — ~6 visual columns; secondaries stack under their primary
     (sorting applies to the primary of each stack — the honest cost) */
  const WIDE_STACKS = [
    { col: wideColBy('name'), subs: ['guardian', 'phone'] },
    { col: wideColBy('room'), subs: ['educator'] },
    { col: wideColBy('status'), subs: [] },
    { col: wideColBy('balance'), subs: ['ccs'] },
    { col: wideColBy('lastAttend'), subs: ['bookings', 'absences'] },
    { col: wideColBy('start'), subs: [] },
  ];

  /*
   * WideDataTable — the shared renderer for all four approaches. Reuses the
   * foundations machinery (DsCheckbox selection, RowMenu kebab, sort-header
   * buttons + classes) and adds:
   *   hscroll    — Scroll+ shell: pinned select/name/actions columns, scroll
   *                state classes, 44px buttons, edge fades, arrow-key scroll
   *   alwaysBar  — approach 1 always shows the scroll bar/buttons; Views only
   *                grows them when the columns actually overflow (automatic)
   *   expandable — approach 2 per-row expander revealing detailCols
   *   stacked    — approach 4 [{ col, subs }] specs with secondary lines
   */
  function WideDataTable({
    label, columns, rows, sort, onSort,
    selected, onToggleRow, onToggleAll, onAction,
    hscroll = false, alwaysBar = false,
    expandable = false, expanded, onToggleExpand, detailCols = [],
    stacked = false,
  }) {
    const wrapRef = useRef(null);
    const [xState, setXState] = useState({ start: true, end: true, overflow: false });

    /* scroll-state classes come from here — pinned-column shadows and edge
       fades key off is-x-start / is-x-end; buttons disable at the ends */
    const updateX = () => {
      const el = wrapRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = { start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1, overflow: max > 1 };
      setXState((cur) =>
        cur.start === next.start && cur.end === next.end && cur.overflow === next.overflow ? cur : next
      );
    };
    useEffect(() => {
      if (!hscroll) return undefined;
      updateX();
      window.addEventListener('resize', updateX);
      return () => window.removeEventListener('resize', updateX);
    }, [hscroll, columns.length]);

    /* ~2 data columns per click; instant when the user prefers reduced motion */
    const nudge = (dir) => {
      const el = wrapRef.current;
      if (!el) return;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollBy({ left: dir * 280, behavior: reduce ? 'auto' : 'smooth' });
    };
    /* the wrap itself is focusable — arrow keys scroll without a trackpad.
       Only when the wrap has focus: inner controls keep their own arrows. */
    const onWrapKey = (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.currentTarget.scrollBy({ left: -80 }); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.currentTarget.scrollBy({ left: 80 }); }
    };

    /* normalise flat and stacked column shapes into one spec list */
    const specs = stacked ? columns : columns.map((c) => ({ col: c, subs: [] }));
    const colCount = specs.length + 2 + (expandable ? 1 : 0);
    const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
    const someSelected = !allSelected && rows.some((r) => selected.has(r.id));
    const pinTh = (extra) => cx('ds-datatable__th', hscroll && 'ds-datatable__pin', hscroll && extra);
    const pinTd = (extra) => cx('ds-datatable__td', hscroll && 'ds-datatable__pin', hscroll && extra);

    const table = (
      <table className="ds-datatable__table">
        <caption className="ds-datatable__sr">{label}</caption>
        <thead>
          <tr>
            <th scope="col" className={cx(pinTh('ds-datatable__pin--select'), 'ds-datatable__select')}>
              <DsCheckbox
                checked={allSelected}
                indeterminate={someSelected}
                label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                onChange={() => onToggleAll(rows)}
              />
            </th>
            {expandable && (
              <th scope="col" className="ds-datatable__th ds-datatable__expand-col">
                <span className="ds-datatable__sr">Row details</span>
              </th>
            )}
            {specs.map((spec, i) => {
              const active = sort && sort.key === spec.col.key;
              const pin = i === 0 && 'ds-datatable__pin--primary';
              return (
                <th
                  key={spec.col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cx(pinTh(pin), spec.col.num && 'ds-datatable__th--num')}
                >
                  <button
                    type="button"
                    className={cx('ds-datatable__sort', active && 'ds-datatable__sort--active')}
                    onClick={() => onSort(spec.col.key)}
                  >
                    <span>
                      {spec.col.label}
                      {stacked && spec.subs.length > 0 && (
                        <span className="ds-datatable__th-sub">
                          + {spec.subs.map((k) => wideColBy(k).label).join(' · ')}
                        </span>
                      )}
                    </span>
                    <span className="ds-datatable__sort-icon" aria-hidden="true">
                      {active ? (sort.dir === 'asc' ? <IconSortAsc /> : <IconSortDesc />) : <IconSortBoth />}
                    </span>
                  </button>
                </th>
              );
            })}
            <th scope="col" className={cx(pinTh('ds-datatable__pin--end'), 'ds-datatable__actions')}>
              <span className="ds-datatable__sr">Row actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSel = selected.has(row.id);
            const isOpen = expandable && expanded.has(row.id);
            return (
              <React.Fragment key={row.id}>
                <tr className={cx('ds-datatable__row', isSel && 'ds-datatable__row--selected')}>
                  <td className={cx(pinTd('ds-datatable__pin--select'), 'ds-datatable__select')}>
                    <DsCheckbox
                      checked={isSel}
                      label={`Select ${row.name}`}
                      onChange={() => onToggleRow(row.id)}
                    />
                  </td>
                  {expandable && (
                    <td className="ds-datatable__td ds-datatable__expand-col">
                      <button
                        type="button"
                        className="ds-datatable__expander"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? `wb-dtw-detail-${row.id}` : undefined}
                        aria-label={`${isOpen ? 'Hide' : 'Show'} all fields for ${row.name}`}
                        onClick={() => onToggleExpand(row.id)}
                      >
                        <IconChevRight />
                      </button>
                    </td>
                  )}
                  {specs.map((spec, i) => {
                    const pin = i === 0 && 'ds-datatable__pin--primary';
                    const subLine = spec.subs.map((k) => WIDE_SUB_FMT[k](row)).join(' · ');
                    return (
                      <td
                        key={spec.col.key}
                        className={cx(
                          pinTd(pin),
                          spec.col.num && 'ds-datatable__td--num',
                          spec.col.primary && 'ds-datatable__td--primary',
                          spec.col.nowrap && 'ds-datatable__td--nowrap'
                        )}
                      >
                        {wideCell(row, spec.col)}
                        {subLine !== '' && <span className="ds-datatable__stack-sub">{subLine}</span>}
                      </td>
                    );
                  })}
                  <td className={cx(pinTd('ds-datatable__pin--end'), 'ds-datatable__actions')}>
                    <RowMenu rowName={row.name} onAction={onAction} />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="ds-datatable__row ds-datatable__row--static ds-datatable__row--detail">
                    <td colSpan={colCount} className="ds-datatable__td ds-datatable__detail-cell">
                      <div className="ds-datatable__detail-grid" id={`wb-dtw-detail-${row.id}`}>
                        {detailCols.map((c) => (
                          <div key={c.key} className="ds-datatable__detail-item">
                            <span className="ds-datatable__detail-label">{c.label}</span>
                            <span className="ds-datatable__detail-value">{wideCell(row, c)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    );

    if (!hscroll) {
      return (
        <div className="ds-datatable ds-datatable--comfortable">
          <div className="ds-datatable__wrap">{table}</div>
        </div>
      );
    }

    return (
      <div className="ds-datatable ds-datatable--comfortable">
        <div
          className={cx(
            'ds-datatable__hshell',
            xState.start && 'is-x-start',
            xState.end && 'is-x-end',
            xState.overflow && 'is-x-overflow'
          )}
        >
          {(alwaysBar || xState.overflow) && (
            <div className="ds-datatable__hbar">
              <span className="ds-datatable__hbar-note" aria-hidden="true">
                {xState.overflow ? 'More columns — scroll, use the buttons, or focus the table and use arrow keys' : 'All columns fit — nothing to scroll'}
              </span>
              <button
                type="button"
                className="ds-datatable__scroll-btn"
                aria-label="Scroll columns left"
                disabled={xState.start}
                onClick={() => nudge(-1)}
              >
                <IconChevLeft />
              </button>
              <button
                type="button"
                className="ds-datatable__scroll-btn"
                aria-label="Scroll columns right"
                disabled={xState.end}
                onClick={() => nudge(1)}
              >
                <IconChevRight />
              </button>
            </div>
          )}
          <div className="ds-datatable__hview">
            <div
              ref={wrapRef}
              className={cx('ds-datatable__wrap', 'ds-datatable__wrap--hscroll', alwaysBar && 'ds-datatable__wrap--scrollbar')}
              tabIndex={xState.overflow ? 0 : -1}
              role="group"
              aria-label={`${label} — columns scroll sideways; left and right arrow keys scroll`}
              onScroll={updateX}
              onKeyDown={onWrapKey}
            >
              {table}
            </div>
            <div className="ds-datatable__hfade ds-datatable__hfade--start" aria-hidden="true"></div>
            <div className="ds-datatable__hfade ds-datatable__hfade--end" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    );
  }

  const WIDE_APPROACH_LABELS = {
    scroll: 'Scroll+',
    expand: 'Priority + expand',
    views: 'Views',
    stacked: 'Stacked cells',
  };

  const WIDE_NOTES = {
    scroll:
      'Naive horizontal scroll fails mouse-first admins like Sandra three ways: the scrollbar is invisible until mid-scroll, there is no anchor column so rows lose their identity, and there is no click affordance at all — with no trackpad swipe, off-screen columns may as well not exist. Scroll+ fixes each one: child name and row actions stay pinned with an elevation shadow once the body scrolls, the scrollbar is styled and always visible, the 44px buttons move two columns per click (disabled at the ends), edge fades signal the cut-off, and the focused table scrolls with arrow keys. The honest cost stays: the data is still off-screen — comparing Phone against Enrolled means moving the viewport.',
    expand:
      'Progressive disclosure: five priority columns stay scannable and nothing hides behind a scrollbar — the 44px chevron opens the other seven fields as labelled pairs directly under the row, and Expand all opens every row at once. Sorting still works on every visible column. The honest cost: comparing a non-priority field ACROSS rows (say, CCS %) means expanding row after row — cross-row comparison is exactly what this approach gives up.',
    views:
      'A view is a task lens — Overview for the morning scan, Attendance for roll-call questions, Billing for fee conversations. That matches how admins actually work (task modes), instead of making every task scroll past every column. All (12 columns) falls back to the Scroll+ affordances automatically the moment the content overflows. Honest costs: someone must curate the presets per table, and comparing a field across two lenses means switching between them.',
    stacked:
      'Density by composition: related secondaries stack under their primary — guardian and phone under the child, educator under the room, CCS % under the balance, bookings and absences as a compact meta line under the attendance date — so all 12 fields land in ~6 visual columns with no scroll at common desktop widths. Everything is visible at once and rows stay scannable. Honest costs: column-level sorting on the stacked secondaries is lost (each header sorts its primary only — you cannot sort by educator or CCS % here), and rows read denser.',
  };

  function WideCard() {
    const [approach, setApproach] = useState('scroll');
    const [preset, setPreset] = useState('overview');
    const { sort, cycle, setSort } = useSort();
    const [selected, setSelected] = useState(() => new Set());
    const [expanded, setExpanded] = useState(() => new Set());
    const [lastAction, setLastAction] = useState(null);

    /* first 14 of the 30 wide rows — enough to scroll, sort and compare */
    const baseRows = useMemo(() => WIDE_ROWS.slice(0, 14), []);
    const rows = useMemo(() => sortWide(baseRows, sort), [baseRows, sort]);

    const viewCols = WIDE_VIEWS[preset].keys.map(wideColBy);
    const visibleSortKeys =
      approach === 'expand' ? WIDE_PRIORITY_KEYS
        : approach === 'views' ? WIDE_VIEWS[preset].keys
          : approach === 'stacked' ? WIDE_STACKS.map((s) => s.col.key)
            : WIDE_COLUMNS.map((c) => c.key);
    /* an approach/preset that hides the sorted column clears the sort —
       nothing orders by an invisible field (same rule as the toolbar card) */
    useEffect(() => {
      if (sort && !visibleSortKeys.includes(sort.key)) setSort(null);
    }, [approach, preset]);

    const toggleRow = (id) =>
      setSelected((cur) => {
        const next = new Set(cur);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    const toggleAll = (rs) =>
      setSelected((cur) => {
        const next = new Set(cur);
        const all = rs.every((r) => next.has(r.id));
        rs.forEach((r) => { if (all) next.delete(r.id); else next.add(r.id); });
        return next;
      });
    const toggleExpand = (id) =>
      setExpanded((cur) => {
        const next = new Set(cur);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    const allExpanded = baseRows.every((r) => expanded.has(r.id));

    const shared = {
      rows, sort, onSort: cycle,
      selected, onToggleRow: toggleRow, onToggleAll: toggleAll,
      onAction: (a) => setLastAction(a),
    };

    return (
      <Card
        legacy={['Datatable', 'Spreadsheet']}
        ds="ds-datatable — wide tables (10+ columns)"
        status="wip"
        note="Design exploration. Office tables routinely carry 5–10+ columns; today that means bare horizontal scroll, which hides data and fails mouse-first, less tech-savvy admins (Sandra — no trackpad swipe, no visible scrollbar). But scroll done well might still be the best UX, so it is not discounted: four approaches over the same 12-column enrolment dataset, switchable here for side-by-side judgement. Selection, value-typed sorting and the row-actions kebab are the shared machinery in every approach."
      >
        <Controls>
          <VariantPills
            label="Approach"
            options={[
              { value: 'scroll', label: 'Scroll+' },
              { value: 'expand', label: 'Priority + expand' },
              { value: 'views', label: 'Views' },
              { value: 'stacked', label: 'Stacked cells' },
            ]}
            value={approach}
            onChange={setApproach}
          />
        </Controls>
        <Stage stack>
          {approach === 'expand' && (
            <div className="ds-datatable__leadbar">
              <p className="ds-datatable__colcount" role="status">
                {WIDE_PRIORITY_COLS.length} priority columns shown — {WIDE_DETAIL_COLS.length} more per row behind the expander
              </p>
              <button
                type="button"
                className="ds-btn ds-btn--ghost"
                onClick={() => setExpanded(allExpanded ? new Set() : new Set(baseRows.map((r) => r.id)))}
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
          )}
          {approach === 'views' && (
            <div className="ds-datatable__leadbar">
              <VariantPills
                label="View"
                options={Object.keys(WIDE_VIEWS).map((k) => ({ value: k, label: WIDE_VIEWS[k].label }))}
                value={preset}
                onChange={setPreset}
              />
              <p className="ds-datatable__colcount" role="status">
                Showing {viewCols.length} of {WIDE_COLUMNS.length} columns
              </p>
            </div>
          )}
          {approach === 'scroll' && (
            <WideDataTable
              label="Children and enrolments — 12 columns, Scroll+"
              columns={WIDE_COLUMNS}
              hscroll
              alwaysBar
              {...shared}
            />
          )}
          {approach === 'expand' && (
            <WideDataTable
              label="Children and enrolments — priority columns with row expand"
              columns={WIDE_PRIORITY_COLS}
              expandable
              expanded={expanded}
              onToggleExpand={toggleExpand}
              detailCols={WIDE_DETAIL_COLS}
              {...shared}
            />
          )}
          {approach === 'views' && (
            <WideDataTable
              label={`Children and enrolments — ${WIDE_VIEWS[preset].label} view`}
              columns={viewCols}
              hscroll
              {...shared}
            />
          )}
          {approach === 'stacked' && (
            <WideDataTable
              label="Children and enrolments — stacked cells"
              columns={WIDE_STACKS}
              stacked
              {...shared}
            />
          )}
          <p className="mb-state-note" role="status">
            {`Approach: ${WIDE_APPROACH_LABELS[approach]}. Selection: ${selected.size} of ${baseRows.length} — it survives switching approaches. `}
            {lastAction ? `Last row action: ${lastAction}.` : 'No row action yet — every approach keeps the kebab.'}
          </p>
        </Stage>
        <StateNote text={WIDE_NOTES[approach]} />
        <StateNote text="Trade-offs, honestly framed for review: Scroll+ keeps all 12 columns sortable and rows comparable but leaves data off-screen; Priority + expand keeps everything reachable but gives up cross-row comparison of the hidden seven; Views matches task flow but needs per-table curation and cross-view comparison means switching; Stacked shows everything at once but loses secondary sorting and reads denser. Scroll+ done properly may still win — that is the point of exploring it alongside the alternatives instead of discounting it. On phones, Priority + expand and Stacked cells degrade naturally into the card-collapse shipped in the responsive card above (noted, not rebuilt here); Scroll+ and Views would still hand over to that collapse below the breakpoint." />
      </Card>
    );
  }

  function DatatableWorkbench() {
    return (
      <React.Fragment>
        <FoundationsCard />
        <ToolbarCard />
        <CardsCard />
        <WideCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-datatable');
  if (el) ReactDOM.createRoot(el).render(<DatatableWorkbench />);
})();
