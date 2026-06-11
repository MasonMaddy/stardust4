/*
 * Stardust Design System — anatomy hover linking
 *
 * Behaviour: hovering or focusing an .anatomy-row[data-for="x"] adds
 * .anatomy-highlight to the element with [data-part="x"] inside the
 * page's .anatomy-preview, visually linking the row to the part.
 *
 * SECURITY: this script reads only hardcoded data attributes from the
 * static page and toggles a class. No user input is processed, nothing
 * is written via innerHTML, and no data leaves the page. Pure DOM class
 * toggling — same constraints as nav.js.
 */
(function () {
  'use strict';

  document.querySelectorAll('.anatomy-row[data-for]').forEach(function (row) {
    var target = document.querySelector('[data-part="' + row.getAttribute('data-for') + '"]');
    if (!target) return;

    function on()  { target.classList.add('anatomy-highlight'); }
    function off() { target.classList.remove('anatomy-highlight'); }

    row.addEventListener('mouseenter', on);
    row.addEventListener('mouseleave', off);
    row.addEventListener('focus', on);
    row.addEventListener('blur', off);
  });
}());
