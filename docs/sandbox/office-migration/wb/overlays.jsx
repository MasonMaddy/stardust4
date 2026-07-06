/*
 * Office Migration Board — Overlays & feedback workbench (wb-overlays). STUB.
 * The overlays wave replaces this with interactive workbench cards for
 * ds-dialog, ds-toast, ds-tooltip, ds-message-box and the standalone ds-menu
 * extraction. See wb/_helpers.jsx for the WB contract this file must follow.
 */
(function () {
  const { Stub } = window.WB;

  function OverlaysWorkbench() {
    return <Stub text="This wave is being built — dialog, toast, tooltip and message-box workbench cards land here. Mapping, status and decisions are recorded in the section intro above." />;
  }

  const el = document.getElementById('wb-overlays');
  if (el) ReactDOM.createRoot(el).render(<OverlaysWorkbench />);
})();
