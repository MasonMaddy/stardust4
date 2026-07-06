/*
 * Office Migration Board — Date & time workbench (wb-datetime). STUB.
 * The date & time wave replaces this with interactive workbench cards for
 * ds-date-picker (input + inline modes), ds-time-picker and ds-calendar.
 * See wb/_helpers.jsx for the WB contract this file must follow.
 */
(function () {
  const { Stub } = window.WB;

  function DatetimeWorkbench() {
    return <Stub text="This wave is being built — date picker, time picker and calendar workbench cards land here. Mapping, status and decisions are recorded in the section intro above." />;
  }

  const el = document.getElementById('wb-datetime');
  if (el) ReactDOM.createRoot(el).render(<DatetimeWorkbench />);
})();
