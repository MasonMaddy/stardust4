/*
 * Office Migration Board — Structure & data workbench (wb-structure).
 * Interactive workbench cards for ds-tabs and ds-accordion (new builds — WIP,
 * classes live in wip/structure.css), the SectionCard composition recipe
 * (shipped ds-card + ds-title-block + ds-btn, no new classes) and the
 * ds-datatable programme placeholder. Follows the WB contract in wb/_helpers.jsx.
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useRef, useEffect, useLayoutEffect, useId } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, CheckboxGlyphs, icons, cx } = window.WB;

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* WB.Card's status map predates the WIP tier — workbench.css already ships
     .mb-pill--wip, so this local wrapper renders the same card head with it.
     (Same markup as WB.Card; only the status pill class differs.) */
  function WipCard({ legacy, ds, note, children }) {
    const names = Array.isArray(legacy) ? legacy : [legacy];
    return (
      <article className="mb-wb-card">
        <div className="mb-wb-card__head">
          <h3 className="mb-wb-card__map">
            {names.map((n) => (
              <span key={n} className="mb-legacy">{n}</span>
            ))}
            <span className="mb-arrow" aria-hidden="true">→</span>
            <span className="mb-target">{ds}</span>
          </h3>
          <span className="mb-pill mb-pill--wip">WIP</span>
        </div>
        {note ? <p className="mb-wb-card__note">{note}</p> : null}
        {children}
      </article>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * ds-tabs — NavTabs → tabs with a real overflow story
   * ══════════════════════════════════════════════════════════ */

  /*
   * Full WAI-ARIA tabs pattern:
   *  - roles tablist/tab/tabpanel, aria-selected + aria-controls/labelledby
   *  - roving tabindex (active tab is the only Tab stop)
   *  - Arrow ←/→ wrap and skip disabled tabs; Home/End jump
   *  - AUTOMATIC activation: focus selects (panels here are lightweight;
   *    heavy panels would argue for manual activation instead)
   *  - --scrollable: scroll-snap overflow, gradient edge fades driven from
   *    scroll position, active tab auto-scrolled into view
   */
  function DsTabs({ items, align = 'start', scrollable = false, ariaLabel, panelText }) {
    const baseId = useId().replace(/[^a-zA-Z0-9-]/g, '');
    const [active, setActive] = useState(() => Math.max(0, items.findIndex((t) => !t.disabled)));
    const [fades, setFades] = useState({ start: false, end: false });
    const listRef = useRef(null);
    const indicatorRef = useRef(null);
    const tabRefs = useRef([]);
    const painted = useRef(false);

    const enabledIdx = items.map((t, i) => (t.disabled ? null : i)).filter((i) => i !== null);

    /* if the active tab becomes disabled (e.g. via the workbench toggle),
       selection falls back to the first enabled tab */
    useEffect(() => {
      if (items[active] && items[active].disabled) {
        setActive(Math.max(0, items.findIndex((t) => !t.disabled)));
      }
    }, [items, active]);

    const measure = () => {
      const el = tabRefs.current[active];
      const ind = indicatorRef.current;
      if (!el || !ind) return;
      if (!painted.current) {
        /* first paint: place the indicator without animating from width 0 */
        ind.style.transition = 'none';
      }
      ind.style.width = `${el.offsetWidth}px`;
      ind.style.transform = `translateX(${el.offsetLeft}px)`;
      if (!painted.current) {
        void ind.offsetWidth; /* flush so the cleared transition doesn't animate */
        ind.style.transition = '';
        painted.current = true;
      }
    };

    const updateFades = () => {
      const list = listRef.current;
      if (!list || !scrollable) return;
      const start = list.scrollLeft > 1;
      const end = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
      setFades((f) => (f.start === start && f.end === end ? f : { start, end }));
    };

    useLayoutEffect(() => { measure(); }, [active, align, scrollable, items]);

    useEffect(() => {
      const sync = () => { measure(); updateFades(); };
      window.addEventListener('resize', sync);
      let ro;
      if (window.ResizeObserver && listRef.current) {
        ro = new ResizeObserver(sync);
        ro.observe(listRef.current);
      }
      /* Inter loading late changes tab widths — re-measure once fonts settle */
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
      return () => {
        window.removeEventListener('resize', sync);
        if (ro) ro.disconnect();
      };
    }, [active, align, scrollable, items]);

    /* keep the active tab visible inside a scrollable strip */
    useEffect(() => {
      const el = tabRefs.current[active];
      if (el && scrollable) {
        el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    }, [active, scrollable]);

    useEffect(() => { updateFades(); }, [scrollable, items]);

    const focusTab = (i) => { const el = tabRefs.current[i]; if (el) el.focus(); };
    const step = (from, delta) => {
      if (!enabledIdx.length) return;
      const pos = enabledIdx.indexOf(from);
      focusTab(enabledIdx[(pos + delta + enabledIdx.length) % enabledIdx.length]);
    };
    const onKeyDown = (e, i) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(i, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(i, -1); }
      else if (e.key === 'Home') { e.preventDefault(); focusTab(enabledIdx[0]); }
      else if (e.key === 'End') { e.preventDefault(); focusTab(enabledIdx[enabledIdx.length - 1]); }
    };

    return (
      <div
        className={cx(
          'ds-tabs',
          align === 'center' && 'ds-tabs--center',
          align === 'end' && 'ds-tabs--end',
          scrollable && 'ds-tabs--scrollable',
          fades.start && 'ds-tabs--fade-start',
          fades.end && 'ds-tabs--fade-end'
        )}
      >
        <div className="ds-tabs__strip">
          {scrollable && <span className="ds-tabs__fade ds-tabs__fade--start" aria-hidden="true"></span>}
          {scrollable && <span className="ds-tabs__fade ds-tabs__fade--end" aria-hidden="true"></span>}
          <div className="ds-tabs__list" role="tablist" aria-label={ariaLabel} ref={listRef} onScroll={updateFades}>
            {items.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${baseId}-panel-${i}`}
                aria-disabled={t.disabled || undefined}
                tabIndex={i === active ? 0 : -1}
                ref={(el) => { tabRefs.current[i] = el; }}
                className={cx('ds-tabs__tab', i === active && 'ds-tabs__tab--active', t.disabled && 'ds-tabs__tab--disabled')}
                onClick={() => { if (!t.disabled) setActive(i); }}
                onFocus={() => { if (!t.disabled) setActive(i); }}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                {/* data-label feeds the CSS width-reserve trick (no active-bold jitter) */}
                <span className="ds-tabs__label" data-label={t.label}>{t.label}</span>
              </button>
            ))}
            <span className="ds-tabs__indicator" ref={indicatorRef} aria-hidden="true"></span>
          </div>
        </div>
        {items.map((t, i) => (
          <div
            key={t.label}
            role="tabpanel"
            id={`${baseId}-panel-${i}`}
            aria-labelledby={`${baseId}-tab-${i}`}
            hidden={i !== active}
            tabIndex={0}
            className="ds-tabs__panel"
          >
            {panelText ? panelText(t, i) : `${t.label} — panel content stands in for real page sections.`}
          </div>
        ))}
      </div>
    );
  }

  const TABS_BASE = (withDisabled) => [
    { label: 'Overview' },
    { label: 'Bookings' },
    { label: 'Enrolment & attendance history' }, /* long label — width stability check */
    { label: 'Billing', disabled: withDisabled },
    { label: 'Reports' },
  ];
  const TABS_MANY = [
    'Overview', 'Bookings', 'Attendance', 'Billing & payments', 'Enrolments', 'Waitlist',
    'Staff rota', 'Reports', 'Messages', 'Documents', 'Health & medical', 'Settings',
  ].map((label) => ({ label }));

  function TabsCard() {
    const [align, setAlign] = useState('start');
    const [withDisabled, setWithDisabled] = useState(true);
    const [overflow, setOverflow] = useState(false);
    const [showAll, setShowAll] = useState(false);

    return (
      <WipCard
        legacy="NavTabs"
        ds="ds-tabs"
        note="New build. The legacy NavTabs was a Vuetify wrap with NO overflow story — extra tabs just squashed. ds-tabs adds a first-class scroll story (snap, edge fades, auto-scroll to active) plus the full tablist keyboard/ARIA contract the legacy never had."
      >
        <Controls>
          <VariantPills
            label="Alignment"
            options={[{ value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' }]}
            value={align}
            onChange={setAlign}
          />
          <Toggle label="Disabled tab" on={withDisabled} onChange={setWithDisabled} />
          <Toggle label="Overflow (12 tabs)" on={overflow} onChange={setOverflow} />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage scroll>
            <ShowAll>
              <Cell tag="Start">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsTabs items={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} ariaLabel="Start-aligned tabs" />
                </div>
              </Cell>
              <Cell tag="Center">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsTabs align="center" items={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} ariaLabel="Centered tabs" />
                </div>
              </Cell>
              <Cell tag="End">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsTabs align="end" items={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} ariaLabel="End-aligned tabs" />
                </div>
              </Cell>
              <Cell tag="With disabled">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsTabs items={[{ label: 'One' }, { label: 'Two', disabled: true }, { label: 'Three' }]} ariaLabel="Tabs with a disabled tab" />
                </div>
              </Cell>
              <Cell tag="Scrollable · 12 tabs">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsTabs scrollable items={TABS_MANY} ariaLabel="Scrollable tabs (all states demo)" />
                </div>
              </Cell>
            </ShowAll>
          </Stage>
        ) : (
          <Stage stack>
            {overflow ? (
              <div style={{ width: '100%', maxWidth: 420 }}>
                <DsTabs
                  scrollable
                  items={TABS_MANY}
                  ariaLabel="Centre sections (overflow demo)"
                  panelText={(t) => `${t.label} — one of 12 sections in a strip constrained to 420px. Scroll the strip by touch or trackpad, or arrow through it; the edge fades show where more tabs are hiding.`}
                />
              </div>
            ) : (
              <DsTabs
                align={align}
                items={TABS_BASE(withDisabled)}
                ariaLabel="Centre sections"
              />
            )}
          </Stage>
        )}
        <StateNote text="Automatic activation: focusing a tab selects it (a deliberate choice — these panels are light; heavy panels would argue for manual Enter-to-activate). Roving tabindex keeps the strip a single Tab stop: Arrow ←/→ wrap and skip the disabled tab, Home/End jump. The overflow demo is the story NavTabs never had — scroll-snap strip, gradient edge fades signalling hidden tabs, active tab auto-scrolled into view; works by touch, trackpad and keyboard. Active-label bold is width-reserved so switching tabs never jitters the strip." />
      </WipCard>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * ds-accordion — ExpansionPanels → real expand/collapse behaviour
   * ══════════════════════════════════════════════════════════ */

  /* composition proof: a live shipped ds-checkbox-field inside a panel */
  function PanelCheckbox() {
    const [checked, setChecked] = useState(true);
    return (
      <label className="ds-checkbox-field">
        <span className={cx('ds-checkbox', 'ds-checkbox--interactive', checked ? 'ds-checkbox--checked' : 'ds-checkbox--unchecked')}>
          <input
            type="checkbox"
            className="ds-checkbox__native"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="ds-checkbox__box" aria-hidden="true"><CheckboxGlyphs /></span>
        </span>
        <span className="ds-checkbox-field__text">Email a summary when this section changes</span>
      </label>
    );
  }

  /*
   * Headers are real <button>s inside <h4> heading wrappers (APG accordion
   * pattern): Enter/Space toggles natively, aria-expanded/aria-controls wire
   * header↔panel, Arrow ↑/↓ + Home/End move between headers. The disabled
   * item stays focusable with aria-disabled (discoverable, just won't open).
   * Collapsed panels get `inert` so their content is unreachable while the
   * grid-rows CSS animation runs (instant under prefers-reduced-motion).
   */
  function DsAccordion({ items, mode = 'single', separated = false, defaultOpen = [] }) {
    const baseId = useId().replace(/[^a-zA-Z0-9-]/g, '');
    const [open, setOpen] = useState(defaultOpen);
    const rootRef = useRef(null);

    /* switching multiple → single collapses down to the first open panel */
    useEffect(() => {
      if (mode === 'single') setOpen((cur) => (cur.length > 1 ? cur.slice(0, 1) : cur));
    }, [mode]);

    const toggle = (id) =>
      setOpen((cur) => {
        if (cur.includes(id)) return cur.filter((x) => x !== id);
        return mode === 'single' ? [id] : [...cur, id];
      });

    const onHeaderKey = (e) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const headers = Array.from(rootRef.current.querySelectorAll('.ds-accordion__header'));
      const idx = headers.indexOf(e.currentTarget);
      if (idx === -1) return;
      e.preventDefault();
      let next = idx;
      if (e.key === 'ArrowDown') next = (idx + 1) % headers.length;
      if (e.key === 'ArrowUp') next = (idx - 1 + headers.length) % headers.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = headers.length - 1;
      headers[next].focus();
    };

    return (
      <div className={cx('ds-accordion', separated && 'ds-accordion--separated')} ref={rootRef}>
        {items.map((it) => {
          const isOpen = open.includes(it.id);
          return (
            <div key={it.id} className={cx('ds-accordion__item', it.disabled && 'ds-accordion__item--disabled')}>
              <h4 className="ds-accordion__heading">
                <button
                  type="button"
                  className="ds-accordion__header"
                  id={`${baseId}-h-${it.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`${baseId}-p-${it.id}`}
                  aria-disabled={it.disabled || undefined}
                  onClick={() => { if (!it.disabled) toggle(it.id); }}
                  onKeyDown={onHeaderKey}
                >
                  <span className="ds-accordion__title">{it.title}</span>
                  <span className="ds-accordion__chevron" aria-hidden="true"><icons.chevron /></span>
                </button>
              </h4>
              <div
                className={cx('ds-accordion__panel', isOpen && 'ds-accordion__panel--open')}
                role="region"
                id={`${baseId}-p-${it.id}`}
                aria-labelledby={`${baseId}-h-${it.id}`}
                inert={isOpen ? undefined : ''}
              >
                <div className="ds-accordion__panel-inner">
                  <div className="ds-accordion__body">{it.body}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const ACCORDION_ITEMS = [
    {
      id: 'session',
      title: 'Session details',
      body: <p>Monday–Friday, 8:00am–4:00pm in the Possums room. Casual days are billed at the standard daily rate.</p>,
    },
    {
      id: 'history',
      title: 'Enrolment & attendance history — a deliberately long panel',
      body: (
        <React.Fragment>
          <p>Long-content check: the grid-rows animation is content-height agnostic, so this panel opens to its natural height without any JS measuring — resize the window with it open and it reflows.</p>
          <p>Enrolled 12 February 2024 into the Wombats room, moved to Possums on 14 July 2025. Attendance has averaged 4.2 days per week across the enrolment, with seasonal dips across December–January. Two absences in the current quarter were covered by allowable-absence provisions; none required documentation.</p>
          <p>The enrolment record carries three amendments, each initiated from the family portal and approved same-day. No outstanding actions.</p>
        </React.Fragment>
      ),
    },
    {
      id: 'notify',
      title: 'Notification preferences',
      body: (
        <React.Fragment>
          <p>Composition proof — a live, shipped ds-checkbox-field working inside a WIP accordion panel:</p>
          <PanelCheckbox />
        </React.Fragment>
      ),
    },
    {
      id: 'archive',
      title: 'Archived enrolments',
      disabled: true,
      body: <p>Unreachable — this item is disabled.</p>,
    },
  ];

  function AccordionCard() {
    const [mode, setMode] = useState('single');
    const [separated, setSeparated] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const mini = () => [
      { id: 'a', title: 'First section', body: <p>Panel body copy.</p> },
      { id: 'b', title: 'Second section', body: <p>Panel body copy.</p> },
    ];

    return (
      <WipCard
        legacy="ExpansionPanels"
        ds="ds-accordion"
        note="New build. The legacy ExpansionPanels was styling-only on top of Vuetify — no behaviour of its own. ds-accordion owns the behaviour: animated height, single/multiple expand, a full keyboard contract, and it composes shipped form controls inside panels."
      >
        <Controls>
          <VariantPills
            label="Expand mode"
            options={[{ value: 'single', label: 'Single' }, { value: 'multiple', label: 'Multiple' }]}
            value={mode}
            onChange={setMode}
          />
          <Toggle label="Separated" on={separated} onChange={setSeparated} />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage scroll>
            <ShowAll>
              <Cell tag="Grouped · closed">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsAccordion items={mini()} mode="multiple" />
                </div>
              </Cell>
              <Cell tag="Grouped · open">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsAccordion items={mini()} mode="multiple" defaultOpen={['a']} />
                </div>
              </Cell>
              <Cell tag="Disabled item">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsAccordion items={[{ id: 'a', title: 'Open section', body: <p>Panel body copy.</p> }, { id: 'b', title: 'Disabled section', disabled: true, body: <p>Unreachable.</p> }]} mode="multiple" defaultOpen={['a']} />
                </div>
              </Cell>
              <Cell tag="Separated">
                <div style={{ width: '100%', maxWidth: 300 }}>
                  <DsAccordion items={mini()} mode="multiple" separated defaultOpen={['a']} />
                </div>
              </Cell>
            </ShowAll>
          </Stage>
        ) : (
          <Stage stack>
            <DsAccordion items={ACCORDION_ITEMS} mode={mode} separated={separated} defaultOpen={['session']} />
          </Stage>
        )}
        <StateNote text="Single mode closes siblings when a panel opens; Multiple lets panels stack. Height animates with CSS grid-template-rows 0fr→1fr (content-height agnostic, no JS measuring) and is instant under prefers-reduced-motion; collapsed panels are inert so nothing inside them is reachable. Enter/Space toggles a header, Arrow ↑/↓ wrap between headers, Home/End jump; the disabled item stays focusable with aria-disabled so it remains discoverable — it just won’t open. Mapping decision for --separated: the legacy style’s literal light-purple border dies here — it maps to the closest semantic tokens, border/default (purple-200) + radius/m, so a Figma re-theme carries it automatically." />
      </WipCard>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * SectionCard → ds-card section recipe (composition, NO new classes)
   * ══════════════════════════════════════════════════════════ */
  function SectionRecipe({ subtitle, actions }) {
    /* plain .ds-card = the non-interactive Container family (card doc §variants):
       the card is NOT clickable; only the trailing buttons are interactive */
    return (
      <div className="ds-card" style={{ width: '100%', maxWidth: 560 }}>
        <div className="ds-title-block">
          <div className="ds-title-block__content">
            <p className="ds-title-block__title ds-title-block__title--semibold">Funding details</p>
            {subtitle && <p className="ds-title-block__subtitle">Entitlements for this enrolment</p>}
          </div>
        </div>
        {actions && (
          <span className="ds-card__trailing">
            <button type="button" className="ds-btn ds-btn--minimal">History</button>
            <button type="button" className="ds-btn ds-btn--ghost">Edit</button>
          </span>
        )}
      </div>
    );
  }

  function SectionCardCard() {
    const [subtitle, setSubtitle] = useState(true);
    const [actions, setActions] = useState(true);
    const [showAll, setShowAll] = useState(false);

    return (
      <Card
        legacy="SectionCard"
        ds="ds-card (section recipe)"
        status="Partial"
        note="The card itself is Built — what remains is documenting this composition on the card page: plain ds-card (Container family) + ds-title-block title/subtitle column + shipped ds-btn actions in the ds-card__trailing slot. No new classes, no new CSS."
      >
        <Controls>
          <Toggle label="Subtitle" on={subtitle} onChange={setSubtitle} />
          <Toggle label="Actions" on={actions} onChange={setActions} />
          <Toggle label="Show all combinations" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage stack>
            <ShowAll>
              <Cell tag="Title only"><SectionRecipe subtitle={false} actions={false} /></Cell>
              <Cell tag="Title + subtitle"><SectionRecipe subtitle actions={false} /></Cell>
              <Cell tag="Title + actions"><SectionRecipe subtitle={false} actions /></Cell>
              <Cell tag="Full recipe"><SectionRecipe subtitle actions /></Cell>
            </ShowAll>
          </Stage>
        ) : (
          <Stage>
            <SectionRecipe subtitle={subtitle} actions={actions} />
          </Stage>
        )}
        <StateNote text="Recipe, not a component — it will be documented on the ds-card page at build time, and the legacy #body slot naming dies here. Everything above is shipped library CSS: the card is the non-interactive Container family, so the buttons are the only interactive elements; body content, when a section needs it, is normal page flow below the header card rather than a magic slot." />
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════
   * ds-datatable — placeholder only (programme, not a card)
   * ══════════════════════════════════════════════════════════ */
  function DatatableCard() {
    return (
      <Card
        legacy={['Datatable', 'Spreadsheet']}
        ds="ds-datatable (programme)"
        status="Missing"
        note="No demo here on purpose — a datatable built as one workbench card would bake in decisions the programme needs to make in order."
      >
        <StateNote text="The datatable is a programme, not a card: phased build (table foundations → toolbar/filter-chips → responsive card-collapse) starts after this wave’s review. Spreadsheet inline-editing becomes a documented pattern (decision). Right-click context menus become visible row actions." />
      </Card>
    );
  }

  function StructureWorkbench() {
    return (
      <React.Fragment>
        <TabsCard />
        <AccordionCard />
        <SectionCardCard />
        <DatatableCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-structure');
  if (el) ReactDOM.createRoot(el).render(<StructureWorkbench />);
})();
