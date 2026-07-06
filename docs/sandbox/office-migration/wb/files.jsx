/*
 * Office Migration Board — Files workbench (wb-files). STUB.
 * The files wave replaces this with an interactive workbench card for
 * ds-file-upload (dropzone + browse + mobile camera/files).
 * See wb/_helpers.jsx for the WB contract this file must follow.
 */
(function () {
  const { Stub } = window.WB;

  function FilesWorkbench() {
    return <Stub text="This wave is being built — the ds-file-upload workbench card lands here. Mapping, status and decisions are recorded in the section intro above." />;
  }

  const el = document.getElementById('wb-files');
  if (el) ReactDOM.createRoot(el).render(<FilesWorkbench />);
})();
