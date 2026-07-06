/*
 * Office Migration Board — Overlays & feedback workbench (wb-overlays).
 * Interactive review candidates for ds-dialog, ds-toast, ds-tooltip and the
 * standalone ds-menu extraction. New ds-* classes live in wip/overlays.css
 * (--sd-* tokens only); shipped classes (ds-btn, ds-fab, ds-sheet, ds-menu
 * list/items, ds-card rows) are used as-is from docs/assets/css/components/.
 * No innerHTML anywhere; every button carries type="button".
 * Wrapped in an IIFE: Babel-standalone scripts share one global scope.
 */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, Controls, Stage, VariantPills, Toggle, ShowAll, Cell, StateNote, icons, cx } = window.WB;

  /* ── Local inline SVG icons (currentColor, aria-hidden by callers) ────── */
  const sevIcons = {
    success: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8.5 12.5l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    error: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    warning: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 10v4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17.2" r="1.2" fill="currentColor" />
      </svg>
    ),
    info: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="7.8" r="1.2" fill="currentColor" />
      </svg>
    ),
  };

  const menuIcons = {
    pencil: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M11.3 2.3a1 1 0 011.4 0l1 1a1 1 0 010 1.4L5.5 12.9 2.5 13.5l.6-3L11.3 2.3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    copy: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 3.5v-.2A1.3 1.3 0 009.2 2H3.8a1.3 1.3 0 00-1.3 1.3v5.4a1.3 1.3 0 001.3 1.3h.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    archive: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.2 6.5V12a1.3 1.3 0 001.3 1.3h7a1.3 1.3 0 001.3-1.3V6.5M6.5 9.3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    trash: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 4h11M6 4V2.8A0.8 0.8 0 016.8 2h2.4a0.8 0.8 0 01.8.8V4M4 4l.6 8.9A1.3 1.3 0 005.9 14h4.2a1.3 1.3 0 001.3-1.1L12 4M6.6 6.8v4.4M9.4 6.8v4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };

  /* close an open popup when pointer goes down anywhere outside `ref` */
  function useOutsideClose(ref, open, close) {
    useEffect(() => {
      if (!open) return undefined;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
  }

  /* ════════════════════════════════════════════════════════════════════════
   * 1. ds-dialog — CommonModal / CommonPersistentModal
   * ══════════════════════════════════════════════════════════════════════ */

  const FOCUSABLE = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

  function DsDialog({ open, size, persistent, labelId, title, actions, onClose, portal, lockScroll, children }) {
    const panelRef = useRef(null);
    const openerRef = useRef(null);
    const [nudged, setNudged] = useState(false);

    /* initial focus → panel; focus returns to the opener on close */
    useEffect(() => {
      if (open) {
        openerRef.current = document.activeElement;
        if (panelRef.current) panelRef.current.focus();
      } else if (openerRef.current) {
        if (openerRef.current.focus) openerRef.current.focus();
        openerRef.current = null;
      }
    }, [open]);

    /* page-level demo locks body scroll while open */
    useEffect(() => {
      if (!open || !lockScroll) return undefined;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [open, lockScroll]);

    if (!open) return null;

    const nudge = () => {
      setNudged(false);
      /* restart the CSS animation even on rapid repeat clicks */
      requestAnimationFrame(() => setNudged(true));
    };
    const dismissAttempt = () => { if (persistent) nudge(); else onClose(); };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        dismissAttempt();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      /* focus trap — Tab cycles inside the panel */
      const focusables = Array.from(panelRef.current.querySelectorAll(FOCUSABLE));
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      }
    };

    const node = (
      <div className={cx('ds-dialog', `ds-dialog--${size}`, 'is-open')} onKeyDown={onKeyDown}>
        <div className="ds-dialog__backdrop" onClick={dismissAttempt} aria-hidden="true"></div>
        <div
          className={cx('ds-dialog__panel', nudged && 'is-nudged')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          tabIndex={-1}
          ref={panelRef}
          onAnimationEnd={(e) => { if (e.animationName === 'ds-dialog-nudge') setNudged(false); }}
        >
          <h4 className="ds-dialog__title" id={labelId}>{title}</h4>
          <div className="ds-dialog__body">{children}</div>
          <div className="ds-dialog__actions">{actions}</div>
        </div>
      </div>
    );
    return portal ? ReactDOM.createPortal(node, document.body) : node;
  }

  const DIALOG_SIZES = ['sm', 'md', 'lg', 'fullscreen'];
  const DIALOG_TITLE = 'Archive this booking?';

  function DialogBodyCopy() {
    return (
      <React.Fragment>
        <p>Archiving hides this booking from day-to-day views. Families keep their full history, and you can restore the booking at any time from the archive.</p>
        <p>Recurring sessions attached to this booking are paused, not deleted.</p>
      </React.Fragment>
    );
  }

  function DialogCard() {
    const [size, setSize] = useState('md');
    const [persistent, setPersistent] = useState(false);
    const [scopedOpen, setScopedOpen] = useState(false);
    const [pageOpen, setPageOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [showAll, setShowAll] = useState(true);
    const [last, setLast] = useState(null);

    const dialogActions = (done) => (
      <React.Fragment>
        <button type="button" className="ds-btn ds-btn--minimal" onClick={() => done('Cancel')}>Cancel</button>
        <button type="button" className="ds-btn ds-btn--solid" onClick={() => done('Archive booking')}>Archive booking</button>
      </React.Fragment>
    );

    const staticPanel = (title, body) => (
      <div className="ds-dialog__panel" tabIndex={-1} aria-hidden="true">
        <p className="ds-dialog__title">{title}</p>
        <div className="ds-dialog__body">{body}</div>
        <div className="ds-dialog__actions">
          <button type="button" className="ds-btn ds-btn--minimal" tabIndex={-1}>Cancel</button>
          <button type="button" className="ds-btn ds-btn--solid" tabIndex={-1}>Confirm</button>
        </div>
      </div>
    );

    return (
      <Card
        legacy={['CommonModal', 'CommonPersistentModal']}
        ds="ds-dialog"
        status="wip"
        note="One dialog replaces both legacy modals — persistent is a mode, not a separate component. Sizes sm/md/lg/fullscreen, focus trapped inside the panel, focus returned to the opener on close, and in persistent mode a blocked dismiss nudges the panel instead of silently ignoring the click. Below the mobile breakpoint the same title/body/actions swap into the shipped ds-sheet."
      >
        <Controls>
          <VariantPills label="Size" options={DIALOG_SIZES} value={size} onChange={setSize} />
          <Toggle label="Persistent" on={persistent} onChange={setPersistent} />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>

        {/* scoped demo — the overlay positions against this stage for easy review */}
        <Stage stack>
          <div className="mbo-scope">
            <button type="button" className="ds-btn ds-btn--solid" onClick={() => setScopedOpen(true)}>
              Open dialog (in stage)
            </button>
            <button type="button" className="ds-btn ds-btn--ghost" onClick={() => setPageOpen(true)}>
              Open over the page
            </button>
            <DsDialog
              open={scopedOpen}
              size={size}
              persistent={persistent}
              labelId="wbo-dialog-scoped-title"
              title={DIALOG_TITLE}
              onClose={() => setScopedOpen(false)}
              actions={dialogActions((a) => { setLast(a); setScopedOpen(false); })}
            >
              <DialogBodyCopy />
            </DsDialog>
          </div>
          {/* full-viewport demo renders through a portal onto document.body */}
          <DsDialog
            open={pageOpen}
            size={size}
            persistent={persistent}
            portal
            lockScroll
            labelId="wbo-dialog-page-title"
            title={DIALOG_TITLE}
            onClose={() => setPageOpen(false)}
            actions={dialogActions((a) => { setLast(a); setPageOpen(false); })}
          >
            <DialogBodyCopy />
          </DsDialog>
        </Stage>
        <StateNote text={
          (last ? `Last action: ${last}. ` : '') +
          (persistent
            ? 'Persistent mode: backdrop click and Escape nudge the panel instead of closing — a visible “finish this first” cue the legacy persistent modal never gave.'
            : 'Dismissible mode: backdrop click, Escape or either action closes. Tab is trapped inside the panel; closing returns focus to the button that opened it.')
        } />

        {/* mobile presentation-swap — same content as the shipped ds-sheet */}
        <Stage>
          <div className="mbo-phone">
            <div className="mbo-phone__screen">
              <p className="mbo-phone__title">Bookings</p>
              <p className="mbo-copy">On phones the dialog presentation swaps to the shipped bottom sheet — same title, body and actions, thumb-reachable.</p>
              <button type="button" className="ds-btn ds-btn--solid" onClick={() => setSheetOpen(true)}>
                Archive booking…
              </button>
            </div>
            <div className={cx('ds-sheet-overlay', sheetOpen && 'is-open')}>
              <div className="ds-sheet__scrim" onClick={() => setSheetOpen(false)}></div>
              <div className="ds-sheet" role="dialog" aria-modal="true" aria-labelledby="wbo-dialog-sheet-title">
                <div className="ds-sheet__grabber" aria-hidden="true"></div>
                <div className="ds-sheet__header">
                  <p className="ds-sheet__title" id="wbo-dialog-sheet-title">{DIALOG_TITLE}</p>
                  <div className="ds-sheet__header-actions">
                    <button type="button" className="ds-fab ds-fab--lg ds-fab--default" aria-label="Close" onClick={() => setSheetOpen(false)}>
                      <span className="ds-fab__icon" aria-hidden="true"><icons.close /></span>
                    </button>
                  </div>
                </div>
                <div className="ds-sheet__list">
                  <p className="mbo-copy">Archiving hides this booking from day-to-day views. Families keep their full history, and you can restore the booking at any time from the archive.</p>
                  <p className="mbo-copy">Recurring sessions attached to this booking are paused, not deleted.</p>
                </div>
                <div className="ds-sheet__footer">
                  <div className="mbo-sheet-actions">
                    <button type="button" className="ds-btn ds-btn--solid" onClick={() => { setLast('Archive booking (sheet)'); setSheetOpen(false); }}>Archive booking</button>
                    <button type="button" className="ds-btn ds-btn--ghost" onClick={() => setSheetOpen(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Stage>

        {showAll && (
          <Stage>
            <ShowAll>
              <Cell tag="Panel — title / body / actions">
                <div className="mbo-panel-demo">{staticPanel('Archive this booking?', <p>Families keep their full history.</p>)}</div>
              </Cell>
              <Cell tag="Long content — body scrolls">
                <div className="mbo-panel-demo mbo-panel-demo--scroll">
                  {staticPanel(
                    'Terms of service update for all Space centres',
                    <React.Fragment>
                      <p>Long content never pushes the actions off-screen — the body region scrolls internally while the title and actions stay pinned.</p>
                      <p>This paragraph, and the ones after it, exist to overflow the demo panel’s reduced max-height so the internal scroll is visible in a static grid.</p>
                      <p>Data-stability: word-break on the title and body keeps unbroken strings from blowing out the panel width.</p>
                    </React.Fragment>
                  )}
                </div>
              </Cell>
              <Cell tag="Empty body — tolerated">
                <div className="mbo-panel-demo">{staticPanel('Discard changes?', null)}</div>
              </Cell>
            </ShowAll>
          </Stage>
        )}
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
   * 2. ds-toast — ToastNotification
   * ══════════════════════════════════════════════════════════════════════ */

  const TOAST_DURATION = 5000;
  const TOAST_SEVERITIES = ['success', 'error', 'warning', 'info'];
  const TOAST_MSGS = {
    success: {
      short: 'Booking saved.',
      long: 'Booking saved. Families on the waitlist for this session have been notified automatically and the roster has been updated to match.',
    },
    error: {
      short: 'Couldn’t save the booking.',
      long: 'Couldn’t save the booking. The session data didn’t reach the server — check the connection and try again; nothing has been lost.',
    },
    warning: {
      short: 'Session is near capacity.',
      long: 'Session is near capacity. Only two educator-to-child ratio places remain for Tuesday — new bookings may be waitlisted.',
    },
    info: {
      short: 'CCS estimates updated.',
      long: 'CCS estimates updated. Overnight processing refreshed the Child Care Subsidy estimates on every active enrolment for this fortnight.',
    },
  };
  const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function DsToast({ toast, onDismiss, onGone }) {
    const [paused, setPaused] = useState(false);
    const remainRef = useRef(TOAST_DURATION);
    const startRef = useRef(0);
    const Icon = sevIcons[toast.severity];

    /* auto-dismiss timer — pauses on hover/focus, resumes with time left */
    useEffect(() => {
      if (paused || toast.leaving) return undefined;
      startRef.current = Date.now();
      const t = setTimeout(() => onDismiss(toast.id), remainRef.current);
      return () => {
        clearTimeout(t);
        remainRef.current = Math.max(0, remainRef.current - (Date.now() - startRef.current));
      };
    }, [paused, toast.leaving]);

    /* removal from the queue happens after the exit fade */
    useEffect(() => {
      if (!toast.leaving) return undefined;
      const t = setTimeout(() => onGone(toast.id), 250);
      return () => clearTimeout(t);
    }, [toast.leaving]);

    return (
      <div
        className={cx('ds-toast', `ds-toast--${toast.severity}`, paused && 'is-paused', toast.leaving && 'is-leaving')}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
      >
        <span className="ds-toast__icon" aria-hidden="true"><Icon /></span>
        <p className="ds-toast__msg">{toast.msg}</p>
        <button type="button" className="ds-toast__dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>
          <icons.close />
        </button>
        <span className="ds-toast__progress" aria-hidden="true"></span>
      </div>
    );
  }

  /* permanent polite live region — present even when empty so pushes announce */
  function ToastStack({ placement, toasts, onDismiss, onGone }) {
    return (
      <div className={cx('ds-toast-stack', `ds-toast-stack--${placement}`)} role="status" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <DsToast key={t.id} toast={t} onDismiss={onDismiss} onGone={onGone} />
        ))}
      </div>
    );
  }

  function StaticToast({ severity, msg }) {
    return (
      <div className={cx('ds-toast', `ds-toast--${severity}`)}>
        <span className="ds-toast__icon" aria-hidden="true">{sevIcons[severity]()}</span>
        <p className="ds-toast__msg">{msg}</p>
        <button type="button" className="ds-toast__dismiss" aria-label={`Dismiss ${severity} example`} tabIndex={-1}>
          <icons.close />
        </button>
      </div>
    );
  }

  function ToastCard() {
    const [deskToasts, setDeskToasts] = useState([]);
    const [phoneToasts, setPhoneToasts] = useState([]);
    const [longMsg, setLongMsg] = useState(false);
    const [showAll, setShowAll] = useState(true);
    const idRef = useRef(0);

    const pushTo = (setter) => (severity) => {
      const id = ++idRef.current;
      const msg = TOAST_MSGS[severity][longMsg ? 'long' : 'short'];
      /* queue caps at 3 — the oldest drops to make room */
      setter((cur) => [...cur, { id, severity, msg, leaving: false }].slice(-3));
    };
    const dismissFrom = (setter) => (id) =>
      setter((cur) => cur.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const removeFrom = (setter) => (id) => setter((cur) => cur.filter((t) => t.id !== id));

    return (
      <Card
        legacy="ToastNotification"
        ds="ds-toast"
        status="wip"
        note="All four severities from the feedback tokens — the legacy toast only had success and error, so warning and info are new. Auto-dismisses after ~5 s with a visible progress bar that pauses on hover or keyboard focus, a queue capped at three (oldest drops), and a permanent polite live region so screen readers hear every push."
      >
        <Controls>
          <Toggle label="Long message" on={longMsg} onChange={setLongMsg} />
          <Toggle label="Show all severities" on={showAll} onChange={setShowAll} />
        </Controls>

        {/* desktop placement — top-right of a wide stage */}
        <Stage stack>
          <div className="mbo-scope mbo-scope--short">
            <div className="mbo-row">
              {TOAST_SEVERITIES.map((sev) => (
                <button key={sev} type="button" className="ds-btn ds-btn--ghost" onClick={() => pushTo(setDeskToasts)(sev)}>
                  {capitalise(sev)}
                </button>
              ))}
            </div>
            <ToastStack placement="top-right" toasts={deskToasts} onDismiss={dismissFrom(setDeskToasts)} onGone={removeFrom(setDeskToasts)} />
          </div>
        </Stage>
        <StateNote text="Fire more than three and the oldest drops off the queue. Hover or Tab onto a toast to pause its countdown — the progress bar freezes with it, and resumes with the time that was left. Dismiss is a real 44px-hit-area button; the stack is role=status, so pushes are announced politely without stealing focus." />

        {/* mobile placement — bottom of a phone frame */}
        <Stage>
          <div className="mbo-phone">
            <div className="mbo-phone__screen">
              <p className="mbo-phone__title">Today</p>
              <p className="mbo-copy">On phones the stack docks to the bottom, above the safe-area inset, and slides up instead of in from the right.</p>
              <div className="mbo-row">
                <button type="button" className="ds-btn ds-btn--solid" onClick={() => pushTo(setPhoneToasts)('success')}>Save</button>
                <button type="button" className="ds-btn ds-btn--ghost" onClick={() => pushTo(setPhoneToasts)('error')}>Fail a save</button>
              </div>
            </div>
            <ToastStack placement="bottom" toasts={phoneToasts} onDismiss={dismissFrom(setPhoneToasts)} onGone={removeFrom(setPhoneToasts)} />
          </div>
        </Stage>

        {showAll && (
          <Stage>
            <ShowAll>
              {TOAST_SEVERITIES.map((sev) => (
                <Cell key={sev} tag={`${capitalise(sev)}${sev === 'warning' || sev === 'info' ? ' · new vs legacy' : ''}`}>
                  <StaticToast severity={sev} msg={TOAST_MSGS[sev].short} />
                </Cell>
              ))}
              <Cell tag="Long message — wraps">
                <StaticToast severity="warning" msg={TOAST_MSGS.warning.long} />
              </Cell>
              <Cell tag="Empty message — tolerated">
                <StaticToast severity="info" msg="" />
              </Cell>
            </ShowAll>
          </Stage>
        )}
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
   * 3. ds-tooltip — Tooltips (legacy was hover-only; ours must not be)
   * ══════════════════════════════════════════════════════════════════════ */

  const TIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'];
  const TIP_OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const HOLD_MS = 500;

  /* wraps a single trigger element: hover (delayed), focus (immediate) and
     press-and-hold ≥500ms all show; Escape hides; flips when it would clip */
  function TooltipAnchor({ id, text, placement, hoverDelay, children }) {
    const [open, setOpen] = useState(false);
    const [actual, setActual] = useState(placement);
    const anchorRef = useRef(null);
    const tipRef = useRef(null);
    const hoverTimer = useRef(null);
    const holdTimer = useRef(null);

    useEffect(() => () => { clearTimeout(hoverTimer.current); clearTimeout(holdTimer.current); }, []);

    const computePlacement = () => {
      const anchor = anchorRef.current;
      const tip = tipRef.current;
      if (!anchor || !tip) return placement;
      const stageEl = anchor.closest('.mb-stage') || document.documentElement;
      const a = anchor.getBoundingClientRect();
      const t = tip.getBoundingClientRect(); /* visibility:hidden keeps layout, so this measures */
      const s = stageEl.getBoundingClientRect();
      const gap = 12;
      const fits = {
        top: a.top - t.height - gap >= s.top,
        bottom: a.bottom + t.height + gap <= s.bottom,
        left: a.left - t.width - gap >= s.left,
        right: a.right + t.width + gap <= s.right,
      };
      if (fits[placement]) return placement;
      if (fits[TIP_OPPOSITE[placement]]) return TIP_OPPOSITE[placement];
      return placement;
    };

    const show = () => { setActual(computePlacement()); setOpen(true); };
    const hide = () => {
      clearTimeout(hoverTimer.current);
      clearTimeout(holdTimer.current);
      setOpen(false);
    };

    /* Escape dismisses even when shown via hover (WCAG 1.4.13) */
    useEffect(() => {
      if (!open) return undefined;
      const onKey = (e) => { if (e.key === 'Escape') hide(); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const trigger = React.cloneElement(children, {
      'aria-describedby': id,
      onPointerEnter: (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(show, hoverDelay);
      },
      onPointerLeave: () => hide(),
      onFocus: () => show(),
      onBlur: () => hide(),
      /* the touch story — press and hold ≥500 ms shows, release hides */
      onPointerDown: () => {
        clearTimeout(holdTimer.current);
        holdTimer.current = setTimeout(show, HOLD_MS);
      },
      onPointerUp: (e) => {
        clearTimeout(holdTimer.current);
        if (e.pointerType !== 'mouse') hide();
      },
      onPointerCancel: () => hide(),
      onKeyDown: (e) => { if (e.key === 'Escape') hide(); },
    });

    return (
      <span className="ds-tooltip-anchor" ref={anchorRef}>
        {trigger}
        <span id={id} role="tooltip" ref={tipRef} className={cx('ds-tooltip', `ds-tooltip--${actual}`, open && 'is-open')}>
          {text}
          <span className="ds-tooltip__arrow" aria-hidden="true"></span>
        </span>
      </span>
    );
  }

  function StaticTooltip({ placement, label }) {
    return (
      <span className="mbo-tip-demo">
        <span className="ds-tooltip-anchor">
          <button type="button" className="ds-btn ds-btn--ghost ds-btn--icon-only" aria-label={`${placement} placement example`} tabIndex={-1}>
            <span className="ds-btn__icon" aria-hidden="true"><icons.plus /></span>
          </button>
          <span className={cx('ds-tooltip', `ds-tooltip--${placement}`, 'is-open')} aria-hidden="true">
            {label}
            <span className="ds-tooltip__arrow" aria-hidden="true"></span>
          </span>
        </span>
      </span>
    );
  }

  function TooltipCard() {
    const [placement, setPlacement] = useState('top');
    const [delayOn, setDelayOn] = useState(true);
    const [showAll, setShowAll] = useState(true);
    const delay = delayOn ? 300 : 0;

    return (
      <Card
        legacy="Tooltips"
        ds="ds-tooltip"
        status="wip"
        note="The legacy tooltip was hover-only, which fails on iPads and for keyboard users. This one shows on hover (300 ms intent delay), immediately on keyboard focus, and on press-and-hold ≥500 ms for touch. Escape hides it, the trigger is wired with aria-describedby, and the preferred placement auto-flips when it would clip the stage. Plain text only — rich or interactive content belongs in a popover, not a tooltip."
      >
        <Controls>
          <VariantPills label="Placement" options={TIP_PLACEMENTS} value={placement} onChange={setPlacement} />
          <Toggle label="300 ms hover delay" on={delayOn} onChange={setDelayOn} />
          <Toggle label="Show all placements" on={showAll} onChange={setShowAll} />
        </Controls>

        <Stage>
          <span className="mbo-tip-demo">
            <TooltipAnchor id="wbo-tip-focus" text="Add a booking" placement={placement} hoverDelay={delay}>
              <button type="button" className="ds-btn ds-btn--solid ds-btn--icon-only" aria-label="Add a booking">
                <span className="ds-btn__icon" aria-hidden="true"><icons.plus /></span>
              </button>
            </TooltipAnchor>
          </span>
          <span className="mbo-tip-demo">
            <TooltipAnchor id="wbo-tip-hold" text="Shown after a 500 ms press-and-hold — the touch story" placement={placement} hoverDelay={delay}>
              <button type="button" className="ds-btn ds-btn--ghost">Press and hold me</button>
            </TooltipAnchor>
          </span>
          {/* pinned to the stage corner so the preferred placement clips → auto-flip */}
          <span className="mbo-tip-corner">
            <TooltipAnchor id="wbo-tip-corner" text="I flip away from the edge instead of clipping" placement={placement} hoverDelay={delay}>
              <button type="button" className="ds-btn ds-btn--minimal ds-btn--icon-only" aria-label="Corner target — placement auto-flips">
                <span className="ds-btn__icon" aria-hidden="true"><icons.search /></span>
              </button>
            </TooltipAnchor>
          </span>
        </Stage>
        <StateNote text={`Hover waits ${delay} ms (intent delay${delayOn ? '' : ' off'}); Tab to a trigger shows it immediately; press-and-hold for 500 ms works with a finger or a mouse. Escape hides it. Try the corner target with a clipping placement — it flips to the opposite side instead of getting cut off.`} />

        {showAll && (
          <Stage scroll>
            <ShowAll>
              {TIP_PLACEMENTS.map((p) => (
                <Cell key={p} tag={`--${p}`}>
                  <StaticTooltip placement={p} label={`Placement ${p}`} />
                </Cell>
              ))}
            </ShowAll>
          </Stage>
        )}
      </Card>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
   * 4. ds-menu — standalone extraction (BtnMenu)
   * ══════════════════════════════════════════════════════════════════════ */

  const MENU_ITEMS = [
    { id: 'edit', label: 'Edit booking', icon: 'pencil' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'archive', label: 'Archive', icon: 'archive' },
    'divider',
    { id: 'delete', label: 'Delete permanently', icon: 'trash', disabled: true },
  ];
  const MENU_NAV = MENU_ITEMS.filter((i) => i !== 'divider');

  function StandaloneMenu({ align, onPick }) {
    const [open, setOpen] = useState(false);
    const [pendingFocus, setPendingFocus] = useState(null);
    const rootRef = useRef(null);
    const anchorRef = useRef(null);
    const itemRefs = useRef({});
    const typeBuf = useRef({ str: '', t: 0 });

    useOutsideClose(rootRef, open, () => setOpen(false));

    const close = (refocus) => {
      setOpen(false);
      if (refocus && anchorRef.current) anchorRef.current.focus();
    };

    const focusItem = (idx) => {
      const item = MENU_NAV[(idx + MENU_NAV.length) % MENU_NAV.length];
      const node = itemRefs.current[item.id];
      if (node) node.focus();
    };
    const currentIndex = () => MENU_NAV.findIndex((i) => itemRefs.current[i.id] === document.activeElement);

    useEffect(() => {
      if (open && pendingFocus) {
        focusItem(pendingFocus === 'first' ? 0 : MENU_NAV.length - 1);
        setPendingFocus(null);
      }
    }, [open, pendingFocus]);

    const onAnchorClick = (e) => {
      if (open) { setOpen(false); return; }
      setOpen(true);
      /* e.detail === 0 → keyboard-triggered click (Enter/Space): focus item 1 */
      if (e.detail === 0) setPendingFocus('first');
    };
    const onAnchorKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setPendingFocus('first'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setPendingFocus('last'); }
    };

    const onTypeahead = (ch) => {
      const now = Date.now();
      const buf = typeBuf.current;
      buf.str = (now - buf.t < 500 ? buf.str : '') + ch.toLowerCase();
      buf.t = now;
      const match = MENU_NAV.find((i) => i.label.toLowerCase().startsWith(buf.str));
      if (match && itemRefs.current[match.id]) itemRefs.current[match.id].focus();
    };

    const onMenuKey = (e) => {
      const i = currentIndex();
      if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(i + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(i === -1 ? MENU_NAV.length - 1 : i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
      else if (e.key === 'End') { e.preventDefault(); focusItem(MENU_NAV.length - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { onTypeahead(e.key); }
    };

    return (
      <div className={cx('ds-menu-anchor', align === 'end' && 'ds-menu-anchor--end', open && 'is-open')} ref={rootRef}>
        <button
          type="button"
          className="ds-btn ds-btn--ghost"
          aria-haspopup="menu"
          aria-expanded={open}
          ref={anchorRef}
          onClick={onAnchorClick}
          onKeyDown={onAnchorKey}
        >
          Actions
          <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>
        </button>
        <div className="ds-menu" role="menu" aria-label="Booking actions" onKeyDown={onMenuKey}>
          {MENU_ITEMS.map((item, i) =>
            item === 'divider' ? (
              <div key={`divider-${i}`} className="ds-menu__divider" role="separator"></div>
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="ds-menu__item"
                aria-disabled={item.disabled || undefined}
                ref={(node) => { itemRefs.current[item.id] = node; }}
                onClick={() => { if (item.disabled) return; onPick(item.label); close(true); }}
              >
                <span className="ds-menu__icon" aria-hidden="true">{menuIcons[item.icon]()}</span>
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  function MenuCard() {
    const [align, setAlign] = useState('start');
    const [showAll, setShowAll] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [last, setLast] = useState(null);

    return (
      <Card
        legacy="BtnMenu"
        ds="ds-menu (standalone)"
        status="wip"
        note="The .ds-menu list and items already ship inside input.css — this card renders those real classes and adds only what a standalone, button-anchored menu needs: an anchor wrapper, open/close transition and item states. Full keyboard support (arrows, Home/End, typeahead, Escape-returns-focus), per-item disabled and a divider — all new versus the legacy click-only BtnMenu. On phones the same actions present as a bottom-sheet list."
      >
        <Controls>
          <VariantPills label="Align" options={[{ value: 'start', label: 'Start' }, { value: 'end', label: 'End' }]} value={align} onChange={setAlign} />
          <Toggle label="Show all states" on={showAll} onChange={setShowAll} />
        </Controls>

        <Stage room>
          <StandaloneMenu align={align} onPick={setLast} />
        </Stage>
        <StateNote text={
          (last ? `Last action picked: ${last}. ` : '') +
          'Open with click, Enter, Space or an arrow key (ArrowUp lands on the last item). Arrows wrap and visit the disabled item without activating it (APG pattern — discoverable, inert); Home/End jump; typing “du” jumps to Duplicate; Escape closes and returns focus to the anchor; outside click closes.'
        } />

        {/* phone presentation-swap — the same actions as a ds-sheet list */}
        <Stage>
          <div className="mbo-phone">
            <div className="mbo-phone__screen">
              <p className="mbo-phone__title">Booking</p>
              <p className="mbo-copy">On phones a small floating menu is a poor touch target — the same actions swap into the shipped bottom sheet.</p>
              <button type="button" className="ds-btn ds-btn--ghost" onClick={() => setSheetOpen(true)}>
                Actions
                <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>
              </button>
            </div>
            <div className={cx('ds-sheet-overlay', sheetOpen && 'is-open')}>
              <div className="ds-sheet__scrim" onClick={() => setSheetOpen(false)}></div>
              <div className="ds-sheet" role="dialog" aria-modal="true" aria-labelledby="wbo-menu-sheet-title">
                <div className="ds-sheet__grabber" aria-hidden="true"></div>
                <div className="ds-sheet__header">
                  <p className="ds-sheet__title" id="wbo-menu-sheet-title">Booking actions</p>
                  <div className="ds-sheet__header-actions">
                    <button type="button" className="ds-fab ds-fab--lg ds-fab--default" aria-label="Close" onClick={() => setSheetOpen(false)}>
                      <span className="ds-fab__icon" aria-hidden="true"><icons.close /></span>
                    </button>
                  </div>
                </div>
                <div className="ds-sheet__list">
                  {MENU_NAV.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={cx('ds-card', 'ds-card--clickable', 'ds-card--compact', item.disabled && 'ds-card--disabled')}
                      disabled={item.disabled}
                      onClick={() => { setLast(`${item.label} (sheet)`); setSheetOpen(false); }}
                    >
                      <div className="ds-title-block">
                        <span className="ds-menu__icon" aria-hidden="true">{menuIcons[item.icon]()}</span>
                        <div className="ds-title-block__content">
                          <p className="ds-title-block__title ds-title-block__title--medium">{item.label}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Stage>

        {showAll && (
          <Stage>
            <ShowAll>
              <Cell tag="Anchor — closed">
                <button type="button" className="ds-btn ds-btn--ghost" aria-haspopup="menu" aria-expanded="false" tabIndex={-1}>
                  Actions
                  <span className="ds-btn__icon" aria-hidden="true"><icons.chevron /></span>
                </button>
              </Cell>
              <Cell tag="Open — icons · hover · disabled · divider">
                <div className="ds-menu ds-menu--static" aria-hidden="true">
                  <button type="button" className="ds-menu__item" tabIndex={-1}>
                    <span className="ds-menu__icon"><menuIcons.pencil /></span>Edit booking
                  </button>
                  <button type="button" className="ds-menu__item is-active" tabIndex={-1}>
                    <span className="ds-menu__icon"><menuIcons.copy /></span>Duplicate (hover/active)
                  </button>
                  <button type="button" className="ds-menu__item" tabIndex={-1}>
                    <span className="ds-menu__icon"><menuIcons.archive /></span>Archive
                  </button>
                  <div className="ds-menu__divider"></div>
                  <button type="button" className="ds-menu__item" aria-disabled="true" tabIndex={-1}>
                    <span className="ds-menu__icon"><menuIcons.trash /></span>Delete permanently (disabled)
                  </button>
                </div>
              </Cell>
              <Cell tag="Long label — wraps, no blowout">
                <div className="ds-menu ds-menu--static" aria-hidden="true">
                  <button type="button" className="ds-menu__item" tabIndex={-1}>
                    <span className="ds-menu__icon"><menuIcons.archive /></span>
                    Archive and notify every family with an active or pending enrolment on this booking
                  </button>
                </div>
              </Cell>
            </ShowAll>
          </Stage>
        )}
      </Card>
    );
  }

  /* ── Mount ─────────────────────────────────────────────────────────────── */
  function OverlaysWorkbench() {
    return (
      <React.Fragment>
        <DialogCard />
        <ToastCard />
        <TooltipCard />
        <MenuCard />
      </React.Fragment>
    );
  }

  const el = document.getElementById('wb-overlays');
  if (el) ReactDOM.createRoot(el).render(<OverlaysWorkbench />);
})();
