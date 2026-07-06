(() => {
  const { Stub } = window.WB;
  const el = document.getElementById('wb-datatable');
  if (el) ReactDOM.createRoot(el).render(<Stub text="This wave is being built" />);
})();
