/*
 * Office Migration Board — Actions & identity workbench (wb-actions).
 * Fully interactive demos of the Built/Partial components in this family.
 * Uses only ds-* classes that exist in docs/assets/css/components/ —
 * hover/focus/pressed are pseudo-class states and are experienced live.
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useEffect } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, icons, cx } = window.WB;

  const BTN_VARIANTS = ['solid', 'ghost', 'minimal', 'destructive'];
  const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ── Buttons — BtnPrimary/…/BtnTextPrimary → ds-btn ─────────────────── */
  function ButtonCard() {
    const [variant, setVariant] = useState('solid');
    const [disabled, setDisabled] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);
    const [iconOnly, setIconOnly] = useState(false);
    const [leading, setLeading] = useState(false);
    const [trailing, setTrailing] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [clicks, setClicks] = useState(0);

    const btnClass = (v) =>
      cx('ds-btn', `ds-btn--${v}`, iconOnly && 'ds-btn--icon-only', !iconOnly && fullWidth && 'ds-btn--full');

    const renderButton = (v, opts = {}) => (
      <button
        type="button"
        className={btnClass(v)}
        disabled={opts.disabled ?? disabled}
        aria-label={iconOnly ? `${capitalise(v)} action` : undefined}
        onClick={() => setClicks((c) => c + 1)}
      >
        {(iconOnly || leading) && <span className="ds-btn__icon" aria-hidden="true"><icons.plus /></span>}
        {!iconOnly && capitalise(v)}
        {!iconOnly && trailing && <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>}
      </button>
    );

    return (
      <Card
        legacy={['BtnPrimary', 'BtnSecondary', 'BtnSecondarySolid', 'BtnSuccess', 'BtnTextPrimary']}
        ds="ds-btn"
        status="Built"
        note="The variant matrix (solid / ghost / minimal / destructive) replaces all five legacy buttons. No dedicated success button — a deliberate decision. The legacy library’s own docs carried a TODO to “refactor the buttons”; this is that refactor."
      >
        <Controls>
          <VariantPills label="Variant" options={BTN_VARIANTS.map((v) => ({ value: v, label: capitalise(v) }))} value={variant} onChange={setVariant} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
          <Toggle label="Full width" on={fullWidth} onChange={setFullWidth} />
          <Toggle label="Icon only" on={iconOnly} onChange={setIconOnly} />
          <Toggle label="Leading icon" on={leading} onChange={setLeading} />
          <Toggle label="Trailing icon" on={trailing} onChange={setTrailing} />
          <Toggle label="Show all variants" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage>
            <ShowAll>
              {BTN_VARIANTS.map((v) => (
                <Cell key={v} tag={capitalise(v)}>{renderButton(v, { disabled: false })}</Cell>
              ))}
              {BTN_VARIANTS.map((v) => (
                <Cell key={`${v}-d`} tag={`${capitalise(v)} · disabled`}>{renderButton(v, { disabled: true })}</Cell>
              ))}
            </ShowAll>
          </Stage>
        ) : (
          <Stage>{renderButton(variant)}</Stage>
        )}
        <StateNote text={`Live component — click it (${clicks} click${clicks === 1 ? '' : 's'} so far). Hover, focus and pressed are pseudo-class states: mouse over, Tab to, or press the button to see them — they aren’t simulated with classes.`} />
      </Card>
    );
  }

  /* ── FAB — BtnIcon → ds-btn icon-only / ds-fab ──────────────────────── */
  const FAB_TYPES = ['default', 'secondary', 'tertiary', 'inverse'];
  const FAB_SIZES = ['sm', 'md', 'lg', 'xl'];

  function FabCard() {
    const [type, setType] = useState('default');
    const [size, setSize] = useState('lg');
    const [filled, setFilled] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const renderFab = (t, s, opts = {}) => {
      const isFilled = opts.filled ?? filled;
      const isDisabled = opts.disabled ?? disabled;
      return (
        <button
          type="button"
          className={cx('ds-fab', `ds-fab--${s}`, `ds-fab--${t}`, isFilled && 'ds-fab--filled', isDisabled && 'ds-fab--disabled')}
          disabled={isDisabled}
          aria-label={s === 'xl' ? undefined : 'New item'}
        >
          <span className="ds-fab__icon" aria-hidden="true"><icons.plus /></span>
          {s === 'xl' && <span className="ds-fab__label">New booking</span>}
        </button>
      );
    };

    return (
      <Card
        legacy="BtnIcon"
        ds="ds-btn icon-only / ds-fab"
        status="Built"
        note="Icon-only buttons use the Button’s icon-only modifier (see the Buttons card above); floating/prominent icon actions use the FAB — 4 types × 4 sizes, xl is the extended FAB with a label."
      >
        <Controls>
          <VariantPills label="Type" options={FAB_TYPES.map((t) => ({ value: t, label: capitalise(t) }))} value={type} onChange={setType} />
          <VariantPills label="Size" options={FAB_SIZES} value={size} onChange={setSize} />
          <Toggle label="Filled" on={filled} onChange={setFilled} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
          <Toggle label="Show all variants" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage>
            <ShowAll>
              {FAB_TYPES.flatMap((t) =>
                FAB_SIZES.map((s) => (
                  <Cell key={`${t}-${s}`} tag={`${capitalise(t)} · ${s}`}>{renderFab(t, s)}</Cell>
                ))
              )}
            </ShowAll>
          </Stage>
        ) : (
          <Stage>{renderFab(type, size)}</Stage>
        )}
        <StateNote text="Hover, focus and pressed are pseudo-class states — interact with the live FAB to see them." />
      </Card>
    );
  }

  /* ── Selection pills — BtnToggleGroup / BtnToggle → ds-selection-pill ─ */
  const PILL_OPTIONS = ['Day', 'Week', 'Month', 'Quarter'];

  function SelectionPillCard() {
    const [mode, setMode] = useState('single');
    const [single, setSingle] = useState('Week');
    const [multi, setMulti] = useState(['Week']);
    const [indicator, setIndicator] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const isSelected = (opt) => (mode === 'single' ? single === opt : multi.includes(opt));
    const pick = (opt) => {
      if (mode === 'single') setSingle(opt);
      else setMulti((cur) => (cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt]));
    };
    const summary = mode === 'single' ? single : (multi.length ? multi.join(', ') : 'nothing');

    return (
      <Card
        legacy={['BtnToggleGroup', 'BtnToggle']}
        ds="ds-selection-pill"
        status="Partial"
        note="Same job — single/multi toggle selection. A button-styled density variant is under review, which is what keeps this Partial."
      >
        <Controls>
          <VariantPills
            label="Selection mode"
            options={[{ value: 'single', label: 'Single' }, { value: 'multi', label: 'Multi' }]}
            value={mode}
            onChange={setMode}
          />
          <Toggle label="Check indicator" on={indicator} onChange={setIndicator} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
        </Controls>
        <Stage>
          <div role="group" aria-label="Period" className="mb-pillrow">
            {PILL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={cx('ds-selection-pill', isSelected(opt) && 'ds-selection-pill--selected', disabled && 'ds-selection-pill--disabled')}
                aria-pressed={isSelected(opt)}
                disabled={disabled}
                onClick={() => pick(opt)}
              >
                <span className="ds-selection-pill__label">{opt}</span>
                {indicator && isSelected(opt) && (
                  <span className="ds-selection-pill__indicator" aria-hidden="true"><icons.check /></span>
                )}
              </button>
            ))}
          </div>
        </Stage>
        <StateNote text={`Working ${mode}-select group — selected: ${summary}. In single mode a click moves the selection; in multi mode it toggles.`} />
      </Card>
    );
  }

  /* ── Menu — BtnMenu → ds-menu (standalone extraction pending) ────────── */
  const MENU_ITEMS = ['Edit booking', 'Duplicate', 'Archive'];

  function MenuCard() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState(null);

    return (
      <Card
        legacy="BtnMenu"
        ds="ds-menu (standalone)"
        status="Partial"
        note=".ds-menu already ships inside input.css — open/close works today (shown live below). Extraction to a standalone component plus full keyboard navigation (arrow keys, typeahead) lands in the overlays wave."
      >
        <Stage room>
          <div
            className={cx('ds-select', open && 'is-open')}
            style={{ width: 240 }}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          >
            <button
              type="button"
              className="ds-btn ds-btn--ghost"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              Actions
              <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>
            </button>
            {/* menu positions off the .ds-select wrapper; is-open shows it */}
            <div className="ds-menu" role="menu" aria-label="Booking actions">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="menuitem"
                  className="ds-menu__item"
                  onClick={() => { setLast(item); setOpen(false); }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </Stage>
        <StateNote text={last ? `Last action picked: ${last}.` : 'Open the menu and pick an action — Escape closes it.'} />
      </Card>
    );
  }

  /* ── Avatar — Avatar → ds-avatar ─────────────────────────────────────── */
  const AVATAR_KINDS = [
    { value: 'image', label: 'Image' },
    { value: 'initials', label: 'Initials' },
    { value: 'broken', label: 'Broken image' },
  ];
  const AVATAR_SIZES = [
    { value: '48', label: '48px' },
    { value: '64', label: '64px' },
    { value: '80', label: '80px' },
  ];

  /* one avatar instance; `broken` renders a real <img> with an invalid src so
     the initials fallback is exercised for real (onError), not simulated */
  function AvatarDemo({ kind, shape, size, bordered, onFallback }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => { setFailed(false); }, [kind]);
    useEffect(() => { if (failed && onFallback) onFallback(); }, [failed]);

    const showInitials = kind === 'initials' || (kind === 'broken' && failed);
    return (
      <div
        className={cx(
          'ds-avatar',
          shape === 'round' ? 'ds-avatar--round' : 'ds-avatar--square',
          bordered && 'ds-avatar--bordered',
          showInitials ? 'ds-avatar--initials' : 'ds-avatar--image'
        )}
        style={{ '--avatar-size': `${size}px` }}
        aria-hidden="true"
      >
        {showInitials ? 'JA' : (
          <div className="avatar-photo-placeholder">
            {kind === 'broken'
              ? <img src="data:," alt="" onError={() => setFailed(true)} />
              : <icons.person />}
          </div>
        )}
      </div>
    );
  }

  function AvatarCard() {
    const [kind, setKind] = useState('image');
    const [shape, setShape] = useState('round');
    const [size, setSize] = useState('64');
    const [bordered, setBordered] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [fellBack, setFellBack] = useState(false);
    useEffect(() => { if (kind !== 'broken') setFellBack(false); }, [kind]);

    return (
      <Card
        legacy="Avatar"
        ds="ds-avatar"
        status="Built"
        note="Image, initials and icon types with round/square shapes; initials are the built-in image fallback. The “Broken image” state below loads a real failing <img> so you can watch the fallback happen."
      >
        <Controls>
          <VariantPills label="Type" options={AVATAR_KINDS} value={kind} onChange={setKind} />
          <VariantPills label="Shape" options={[{ value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }]} value={shape} onChange={setShape} />
          <VariantPills label="Size" options={AVATAR_SIZES} value={size} onChange={setSize} />
          <Toggle label="Bordered" on={bordered} onChange={setBordered} />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>
        {showAll ? (
          <Stage>
            <ShowAll>
              <Cell tag="Image · round"><AvatarDemo kind="image" shape="round" size={size} bordered={bordered} /></Cell>
              <Cell tag="Initials · round"><AvatarDemo kind="initials" shape="round" size={size} bordered={bordered} /></Cell>
              <Cell tag="Fallback (broken img)"><AvatarDemo kind="broken" shape="round" size={size} bordered={bordered} /></Cell>
              <Cell tag="Image · square"><AvatarDemo kind="image" shape="square" size={size} bordered={bordered} /></Cell>
              <Cell tag="Initials · square"><AvatarDemo kind="initials" shape="square" size={size} bordered={bordered} /></Cell>
            </ShowAll>
          </Stage>
        ) : (
          <Stage>
            <AvatarDemo kind={kind} shape={shape} size={size} bordered={bordered} onFallback={() => setFellBack(true)} />
          </Stage>
        )}
        <StateNote text={kind === 'broken' && fellBack
          ? 'The image failed to load — the component fell back to initials, exactly as it would in production.'
          : 'Image avatars use the canonical .avatar-photo-placeholder clipping wrapper — never a raw <img> in .ds-avatar--image.'} />
      </Card>
    );
  }

  /* ── Avatar and Name → ds-avatar + ds-title-block (composition) ──────── */
  function AvatarNameCard() {
    const [subtitle, setSubtitle] = useState(true);
    const [name, setName] = useState('Jamie Anderson');
    const initials = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '–';

    return (
      <Card
        legacy="Avatar and Name"
        ds="ds-avatar + ds-title-block"
        status="Built"
        note="Not a dedicated component in Stardust — composed from Avatar and the Title Block. Edit the name to watch the initials recompute."
      >
        <Controls>
          <Toggle label="Subtitle" on={subtitle} onChange={setSubtitle} />
          <div className="mb-control" style={{ flex: '0 1 280px' }}>
            <span className="mb-control__label">Name</span>
            <div className="ds-input" style={{ width: 200, '--input-height': '44px' }}>
              <div className="ds-input__box">
                <input
                  className="ds-input__field"
                  type="text"
                  aria-label="Person name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Controls>
        <Stage>
          <div className="ds-title-block">
            <div className="ds-avatar ds-avatar--round ds-avatar--bordered ds-avatar--initials" style={{ '--avatar-size': '48px' }} aria-hidden="true">{initials}</div>
            <div className="ds-title-block__content">
              <p className="ds-title-block__title ds-title-block__title--medium">{name || 'Unnamed'}</p>
              {subtitle && <p className="ds-title-block__subtitle">Possums room</p>}
            </div>
          </div>
        </Stage>
      </Card>
    );
  }

  function ActionsWorkbench() {
    return (
      <React.Fragment>
        <ButtonCard />
        <FabCard />
        <SelectionPillCard />
        <MenuCard />
        <AvatarCard />
        <AvatarNameCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-actions');
  if (el) ReactDOM.createRoot(el).render(<ActionsWorkbench />);
})();
