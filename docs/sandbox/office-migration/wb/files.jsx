/*
 * Office Migration Board — Files workbench (wb-files).
 *
 * ds-file-upload: ONE consolidated uploader replacing the legacy trio —
 * InputFile (compact row) + DragAndDropFileUpload (dropzone) merge into a
 * single component; deprecated FileUpload is not ported (Out).
 *
 * Everything below is real behaviour: real drag events with visible
 * invalid-type rejection (the legacy silently ignored invalid drags), a real
 * native file dialog via a properly-labelled hidden input, simulated upload
 * progress, per-file errors and aria-live announcements. WIP classes live in
 * wip/files.css (--sd-* tokens only). No innerHTML anywhere.
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, icons, cx } = window.WB;

  const MAX_BYTES = 500 * 1024; // demo max-size limit (500 KB)

  /* accept setting gates BOTH drag validation and the native dialog */
  const ACCEPT = {
    all:    { attr: undefined,        sub: 'Any file type',                      reason: 'Any file type', body: 'any file type' },
    images: { attr: 'image/*',        sub: 'Images only (PNG, JPG, GIF, WebP)',  reason: 'Images only',   body: 'images only' },
    csv:    { attr: '.csv,text/csv',  sub: 'CSV files only',                     reason: 'CSV only',      body: 'CSV files only' },
  };

  /* ── Local SVG glyphs (currentColor) ─────────────────────────────────── */
  const IconUpload = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15V4m0 0L8 8m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  const IconBlock = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.2 6.2l11.6 11.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
  const IconAlert = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 22 20H2L12 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
  const GLYPHS = {
    image: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="9.5" r="1.7" fill="currentColor" />
        <path d="M4.5 17.5l4.5-4.5 3 3 4-4 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    csv: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 3h9l4 4v14H6V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8.5 11.5h7M8.5 14.5h7M8.5 17.5h7M12 11.5v6" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    file: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 3h9l4 4v14H6V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  };

  /* ── Pure helpers ─────────────────────────────────────────────────────── */
  const CSV_MIMES = ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values'];

  /* during drag we only have MIME types (no names); unknown/empty types pass
   * and get the definitive extension check on drop */
  function dragTypeAllowed(acceptKey, mime) {
    if (acceptKey === 'all' || !mime) return true;
    if (acceptKey === 'images') return mime.indexOf('image/') === 0;
    return CSV_MIMES.indexOf(mime) !== -1;
  }
  function dragVerdict(acceptKey, dataTransfer) {
    if (!dataTransfer || !dataTransfer.items) return 'valid';
    const fileItems = Array.from(dataTransfer.items).filter((i) => i.kind === 'file');
    if (!fileItems.length) return 'valid';
    return fileItems.some((i) => dragTypeAllowed(acceptKey, i.type)) ? 'valid' : 'invalid';
  }
  /* definitive per-file validation on drop / dialog pick */
  function fileAllowed(acceptKey, file) {
    if (acceptKey === 'all') return true;
    if (acceptKey === 'images') return file.type.indexOf('image/') === 0;
    return /\.csv$/i.test(file.name) || CSV_MIMES.indexOf(file.type) !== -1;
  }

  function kindOf(file) {
    if (file.type && file.type.indexOf('image/') === 0) return 'image';
    if (/\.csv$/i.test(file.name) || CSV_MIMES.indexOf(file.type) !== -1) return 'csv';
    return 'file';
  }
  function extLabel(name, kind) {
    const dot = name.lastIndexOf('.');
    if (dot > 0 && name.length - dot <= 6) return name.slice(dot + 1).toUpperCase();
    return kind === 'image' ? 'Image' : 'File';
  }
  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  /* middle truncation: tail (last chars + extension) is preserved, the head
   * ellipsises in CSS — full name stays in the DOM for assistive tech */
  function splitName(name) {
    const TAIL = 9;
    if (name.length <= TAIL + 4) return [name, ''];
    return [name.slice(0, name.length - TAIL), name.slice(-TAIL)];
  }
  function listNames(names) {
    return names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`;
  }
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── ds-file-upload — the WIP component itself (prop-driven) ─────────── */
  function FileUpload({ idBase, compact, touch, accept, multiple, maxOn, disabled }) {
    const [items, setItems] = useState([]);        // {id,name,size,kind,progress,done,error}
    const [drag, setDrag] = useState(null);        // null | 'valid' | 'invalid'
    const [rejection, setRejection] = useState(null); // {names:[], reason}
    const [announce, setAnnounce] = useState('');
    const inputRef = useRef(null);
    const rootRef = useRef(null);
    const depth = useRef(0);                       // dragenter/leave nesting counter
    const timers = useRef(new Map());              // itemId → interval (simulated upload)

    const acceptCfg = ACCEPT[accept] || ACCEPT.all;
    const inputId = `${idBase}-input`;
    const subId = `${idBase}-sub`;
    const subText = acceptCfg.sub + (maxOn ? ' · up to 500 KB each' : '');

    /* clear all simulated uploads on unmount */
    useEffect(() => {
      const map = timers.current;
      return () => { map.forEach((t) => clearInterval(t)); map.clear(); };
    }, []);

    /* finish uploads that reached 100% */
    useEffect(() => {
      const finished = items.filter((it) => !it.error && !it.done && it.progress >= 100);
      if (!finished.length) return;
      finished.forEach((it) => {
        const t = timers.current.get(it.id);
        if (t) { clearInterval(t); timers.current.delete(it.id); }
      });
      setItems((cur) => cur.map((it) => (!it.error && !it.done && it.progress >= 100 ? { ...it, done: true } : it)));
      setAnnounce(`${listNames(finished.map((it) => it.name))} uploaded.`);
    }, [items]);

    const startUpload = (id) => {
      if (prefersReducedMotion()) {
        /* reduced motion: no animated bar — complete immediately */
        setItems((cur) => cur.map((it) => (it.id === id ? { ...it, progress: 100 } : it)));
        return;
      }
      const t = setInterval(() => {
        setItems((cur) => cur.map((it) =>
          it.id === id && !it.done && !it.error
            ? { ...it, progress: Math.min(100, it.progress + 7 + Math.random() * 16) }
            : it));
      }, 160);
      timers.current.set(id, t);
    };

    const addFiles = (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      const take = multiple ? files : files.slice(0, 1); // single mode replaces
      const accepted = [];
      const rejectedNames = [];
      take.forEach((f) => {
        if (fileAllowed(accept, f)) accepted.push(f);
        else rejectedNames.push(f.name);
      });

      const stamp = Date.now();
      const fresh = accepted.map((f, i) => ({
        id: `${stamp}-${i}-${f.name}`,
        name: f.name,
        size: f.size,
        kind: kindOf(f),
        progress: 0,
        done: false,
        error: maxOn && f.size > MAX_BYTES
          ? `Too large — files must be 500 KB or less (this one is ${formatSize(f.size)}).`
          : null,
      }));

      if (fresh.length) {
        if (!multiple) { timers.current.forEach((t) => clearInterval(t)); timers.current.clear(); }
        setItems((cur) => (multiple ? [...cur, ...fresh] : fresh));
        fresh.filter((it) => !it.error).forEach((it) => startUpload(it.id));
      }
      setRejection(rejectedNames.length ? { names: rejectedNames, reason: acceptCfg.reason, body: acceptCfg.body } : null);

      const parts = [];
      if (fresh.length === 1) parts.push(`Added ${fresh[0].name}.`);
      else if (fresh.length > 1) parts.push(`Added ${fresh.length} files.`);
      const errCount = fresh.filter((it) => it.error).length;
      if (errCount) parts.push(`${errCount} over the 500 KB limit.`);
      if (rejectedNames.length) parts.push(`${rejectedNames.length} not added — ${acceptCfg.reason}.`);
      if (parts.length) setAnnounce(parts.join(' '));
    };

    const removeItem = (id) => {
      const idx = items.findIndex((it) => it.id === id);
      const removed = items[idx];
      const t = timers.current.get(id);
      if (t) { clearInterval(t); timers.current.delete(id); }
      setItems((cur) => cur.filter((it) => it.id !== id));
      if (removed) setAnnounce(`Removed ${removed.name}.`);
      /* keep keyboard users anchored: focus the next remove target, else the input */
      window.requestAnimationFrame(() => {
        if (!rootRef.current) return;
        const btns = rootRef.current.querySelectorAll('.ds-fileupload__remove');
        if (btns.length) btns[Math.min(idx, btns.length - 1)].focus();
        else if (inputRef.current) inputRef.current.focus();
      });
    };

    /* ── real drag events, gated by the accept setting ── */
    const evaluateDrag = (e) => {
      e.preventDefault();
      if (disabled) { e.dataTransfer.dropEffect = 'none'; return; }
      const v = dragVerdict(accept, e.dataTransfer);
      e.dataTransfer.dropEffect = v === 'invalid' ? 'none' : 'copy';
      setDrag((prev) => (prev === v ? prev : v));
    };
    const onDragEnter = (e) => { depth.current += 1; evaluateDrag(e); };
    const onDragOver = evaluateDrag;
    const onDragLeave = (e) => {
      e.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDrag(null);
    };
    const onDrop = (e) => {
      e.preventDefault();
      depth.current = 0;
      setDrag(null);
      if (!disabled) addFiles(e.dataTransfer.files);
    };

    /* click anywhere on the zone opens the real native dialog; the label and
     * input already handle themselves (guard avoids a double dialog) */
    const onZoneClick = (e) => {
      if (disabled) return;
      if (e.target.closest && e.target.closest('label, input, button, a')) return;
      if (inputRef.current) inputRef.current.click();
    };
    const onInputChange = (e) => {
      addFiles(e.target.files);
      e.target.value = ''; // allow re-picking the same file
    };

    const compactSummary = items.length === 0
      ? 'No file selected'
      : items.length === 1 ? items[0].name : `${items.length} files selected`;

    const fileInput = (
      /* the REAL native input — visually hidden but focusable + labelled, so
       * Tab + Enter/Space open the dialog; accept gates the picker itself */
      <input
        ref={inputRef}
        type="file"
        id={inputId}
        className="ds-fileupload__input"
        accept={acceptCfg.attr}
        multiple={multiple}
        disabled={disabled}
        aria-label={multiple ? 'Choose files to upload' : 'Choose a file to upload'}
        aria-describedby={subId}
        onChange={onInputChange}
      />
    );

    return (
      <div ref={rootRef} className={cx('ds-fileupload', compact && 'ds-fileupload--compact', touch && 'ds-fileupload--touch')}>
        <div
          className={cx(
            'ds-fileupload__zone',
            drag === 'valid' && 'ds-fileupload__zone--dragover',
            drag === 'invalid' && 'ds-fileupload__zone--invalid',
            disabled && 'ds-fileupload__zone--disabled'
          )}
          onClick={onZoneClick}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {compact ? (
            <React.Fragment>
              <span className="ds-fileupload__icon" aria-hidden="true">
                {drag === 'invalid' ? <IconBlock /> : <GLYPHS.file />}
              </span>
              <p className={cx('ds-fileupload__hint', drag === 'invalid' && 'ds-fileupload__hint--reject')}>
                {drag === 'invalid' ? `${acceptCfg.reason} — that type isn’t accepted` : compactSummary}
              </p>
              <label className="ds-fileupload__browse" htmlFor={inputId}>Browse…</label>
              {fileInput}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span className="ds-fileupload__icon" aria-hidden="true">
                {drag === 'invalid' ? <IconBlock /> : <IconUpload />}
              </span>
              {drag === 'invalid' ? (
                <p className="ds-fileupload__hint ds-fileupload__hint--reject">
                  {acceptCfg.reason} — that file type can’t be dropped here.
                </p>
              ) : (
                <React.Fragment>
                  <p className="ds-fileupload__hint ds-fileupload__hint--drag">
                    Drag and drop {multiple ? 'files' : 'a file'} here, or{' '}
                    <label className="ds-fileupload__browse" htmlFor={inputId}>browse</label>
                  </p>
                  <p className="ds-fileupload__hint ds-fileupload__hint--touch">
                    Tap to add {multiple ? 'files' : 'a file'} — camera, photos or files
                  </p>
                </React.Fragment>
              )}
              <p className="ds-fileupload__hint ds-fileupload__hint--sub" id={subId}>{subText}</p>
              {fileInput}
            </React.Fragment>
          )}
        </div>

        {/* in compact the requirements line sits under the row — same id, only
          * one of the two ever renders, so aria-describedby always resolves */}
        {compact && <p className="ds-fileupload__hint ds-fileupload__hint--sub" id={subId}>{subText}</p>}

        {rejection && rejection.names.length > 0 && (
          /* visible rejection with the reason — reuses the shipped message-box */
          <div className="ds-message-box ds-message-box--red">
            <div className="ds-message-box__row">
              <span className="ds-message-box__icon" aria-hidden="true"><IconAlert /></span>
              <div className="ds-message-box__text">
                <div className="ds-message-box__title-row">
                  <p className="ds-message-box__title">
                    {rejection.names.length === 1 ? '1 file wasn’t added' : `${rejection.names.length} files weren’t added`}
                  </p>
                  <button type="button" className="ds-message-box__close" aria-label="Dismiss rejection message" onClick={() => setRejection(null)}>
                    <icons.close />
                  </button>
                </div>
                <p className="ds-message-box__body">
                  {listNames(rejection.names)} — this uploader accepts {rejection.body}.
                </p>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <ul className="ds-fileupload__list">
            {items.map((it) => {
              const [start, end] = splitName(it.name);
              const Glyph = GLYPHS[it.kind] || GLYPHS.file;
              return (
                <li key={it.id} className={cx('ds-fileupload__item', it.error && 'ds-fileupload__item--error')}>
                  <span className="ds-fileupload__glyph" aria-hidden="true"><Glyph /></span>
                  <div className="ds-fileupload__body">
                    <span className="ds-fileupload__name" title={it.name}>
                      <span className="ds-fileupload__name-start">{start}</span>
                      {end !== '' && <span className="ds-fileupload__name-end">{end}</span>}
                    </span>
                    <span className="ds-fileupload__meta">
                      {formatSize(it.size)} · {extLabel(it.name, it.kind)}
                      {it.done && <span className="ds-fileupload__meta-done"> · Uploaded</span>}
                    </span>
                    {it.error ? (
                      <span className="ds-fileupload__error">{it.error}</span>
                    ) : !it.done ? (
                      <span
                        className="ds-fileupload__progress"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(it.progress)}
                        aria-label={`Uploading ${it.name}`}
                      >
                        <span className="ds-fileupload__progress-bar" style={{ width: `${it.progress}%` }} />
                      </span>
                    ) : null}
                  </div>
                  <button type="button" className="ds-fileupload__remove" aria-label={`Remove ${it.name}`} onClick={() => removeItem(it.id)}>
                    <icons.close />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <span className="ds-fileupload__live" aria-live="polite">{announce}</span>
      </div>
    );
  }

  /* ── Static class-forced renders for the show-all grid ───────────────── */
  function StaticZone({ mod, invalid, hint, sub, browse }) {
    return (
      <div className="ds-fileupload" aria-hidden="true">
        <div className={cx('ds-fileupload__zone', mod)}>
          <span className="ds-fileupload__icon">{invalid ? <IconBlock /> : <IconUpload />}</span>
          <p className={cx('ds-fileupload__hint', invalid && 'ds-fileupload__hint--reject')}>
            {hint}{browse ? <React.Fragment>, or <span className="ds-fileupload__browse">browse</span></React.Fragment> : null}
          </p>
          {sub ? <p className="ds-fileupload__hint ds-fileupload__hint--sub">{sub}</p> : null}
        </div>
      </div>
    );
  }
  function StaticItem({ name, size, progress, error, done }) {
    const [start, end] = splitName(name);
    return (
      <div className="ds-fileupload" aria-hidden="true">
        <ul className="ds-fileupload__list">
          <li className={cx('ds-fileupload__item', error && 'ds-fileupload__item--error')}>
            <span className="ds-fileupload__glyph"><GLYPHS.csv /></span>
            <div className="ds-fileupload__body">
              <span className="ds-fileupload__name" title={name}>
                <span className="ds-fileupload__name-start">{start}</span>
                {end !== '' && <span className="ds-fileupload__name-end">{end}</span>}
              </span>
              <span className="ds-fileupload__meta">
                {size} · CSV{done && <span className="ds-fileupload__meta-done"> · Uploaded</span>}
              </span>
              {error ? (
                <span className="ds-fileupload__error">{error}</span>
              ) : !done ? (
                <span className="ds-fileupload__progress">
                  <span className="ds-fileupload__progress-bar" style={{ width: `${progress}%` }} />
                </span>
              ) : null}
            </div>
            <button type="button" tabIndex={-1} className="ds-fileupload__remove"><icons.close /></button>
          </li>
        </ul>
      </div>
    );
  }

  /* ── The one deep workbench card ─────────────────────────────────────── */
  function FileUploadCard() {
    const [layout, setLayout] = useState('dropzone');
    const [accept, setAccept] = useState('csv');
    const [multiple, setMultiple] = useState(true);
    const [maxOn, setMaxOn] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const phoneFrame = {
      width: 340,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: '20px 14px',
      background: 'var(--sd-colour-surface-default)',
      border: '1px solid var(--sd-colour-border-strong)',
      borderRadius: 28,
    };

    return (
      <Card
        legacy={['InputFile', 'DragAndDropFileUpload']}
        ds="ds-file-upload"
        status="wip"
        note="Consolidation decision: ONE component replaces the legacy trio — the dropzone (DragAndDropFileUpload) and the compact input-like row (InputFile) are the same component in two layouts, and the soft-deprecated FileUpload is not ported. Key improvement: an invalid file-type drag gets a visible rejection with the reason — the legacy uploader silently ignored invalid drags."
      >
        <Controls>
          <VariantPills
            label="Layout"
            options={[{ value: 'dropzone', label: 'Dropzone' }, { value: 'compact', label: 'Compact' }]}
            value={layout}
            onChange={setLayout}
          />
          <VariantPills
            label="Accept"
            options={[{ value: 'all', label: 'All files' }, { value: 'images', label: 'Images' }, { value: 'csv', label: 'CSV' }]}
            value={accept}
            onChange={setAccept}
          />
          <Toggle label="Multiple" on={multiple} onChange={setMultiple} />
          <Toggle label="Max 500 KB" on={maxOn} onChange={setMaxOn} />
          <Toggle label="Disabled" on={disabled} onChange={setDisabled} />
        </Controls>

        <Stage stack>
          <FileUpload
            idBase="wb-fu-main"
            compact={layout === 'compact'}
            accept={accept}
            multiple={multiple}
            maxOn={maxOn}
            disabled={disabled}
          />
        </Stage>
        <StateNote text="Drag files from your desktop: a valid type highlights the zone affirmatively; an invalid type (try an image with Accept = CSV) shows a visible rejection with the reason, and a dropped invalid file gets a dismissible message. Click the zone — or Tab to it and press Enter/Space — to open the real native file dialog; the accept setting gates the picker too. Added files upload with simulated progress (skipped under reduced motion); with Max 500 KB on, larger files get a friendly inline error. Long filenames truncate in the middle so the extension survives; remove targets are 44 px; adds, removals and errors are announced politely." />

        <Stage>
          <Cell tag="Phone · compact, touch presentation">
            <div style={phoneFrame}>
              <FileUpload idBase="wb-fu-phone" compact touch accept={accept} multiple={false} maxOn={maxOn} disabled={false} />
            </div>
          </Cell>
        </Stage>
        <StateNote text="Touch story: on a phone the zone is simply a tap target for the native file / camera picker — drag affordances are hidden below the 640px breakpoint by a CSS presentation swap in wip/files.css (this frame forces it with the --touch modifier; resize the window to see the real media query on the demo above)." />

        <Stage scroll>
          <ShowAll>
            <Cell tag="Idle (empty state)">
              <StaticZone hint="Drag and drop files here" browse sub="CSV files only · up to 500 KB each" />
            </Cell>
            <Cell tag="Drag-over · valid">
              <StaticZone mod="ds-fileupload__zone--dragover" hint="Drop to add files" sub="CSV files only · up to 500 KB each" />
            </Cell>
            <Cell tag="Drag-over · invalid">
              <StaticZone mod="ds-fileupload__zone--invalid" invalid hint="CSV only — that file type can’t be dropped here." />
            </Cell>
            <Cell tag="List · uploading">
              <StaticItem name="enrolments-march.csv" size="240 KB" progress={62} />
            </Cell>
            <Cell tag="Item · error">
              <StaticItem name="quarterly-enrolment-report-final-v2.csv" size="1.8 MB" error="Too large — files must be 500 KB or less (this one is 1.8 MB)." />
            </Cell>
            <Cell tag="Disabled">
              <StaticZone mod="ds-fileupload__zone--disabled" hint="Drag and drop files here" browse sub="CSV files only" />
            </Cell>
          </ShowAll>
        </Stage>
        <StateNote text="Static class-forced renders for side-by-side review — the live component above is the behavioural source of truth. The error cell doubles as the long-filename check: the name truncates in the middle, keeping the tail and extension." />
      </Card>
    );
  }

  function FilesWorkbench() {
    return <FileUploadCard />;
  }

  const el = document.getElementById('wb-files');
  if (el) ReactDOM.createRoot(el).render(<FilesWorkbench />);
})();
