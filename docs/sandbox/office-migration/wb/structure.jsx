/*
 * Office Migration Board — Structure & data workbench (wb-structure). STUB.
 * The structure wave replaces this with interactive workbench cards for
 * ds-tabs, ds-accordion, the ds-card section recipe and the ds-datatable
 * programme. See wb/_helpers.jsx for the WB contract this file must follow.
 */
(function () {
  const { Stub } = window.WB;

  function StructureWorkbench() {
    return <Stub text="This wave is being built — tabs, accordion, section-card and datatable workbench cards land here. Mapping, status and decisions are recorded in the section intro above." />;
  }

  const el = document.getElementById('wb-structure');
  if (el) ReactDOM.createRoot(el).render(<StructureWorkbench />);
})();
