/*
 * Stardust Design System — Global Navigation
 *
 * SECURITY: All nav HTML is assembled from hardcoded strings defined in this file.
 * No user input, URL parameters, query strings, or fetched data ever reaches innerHTML.
 * This is intentional and must be preserved. If you're adding a new component or token
 * page, add one entry to the arrays below and commit — that is the only change needed.
 *
 * To add a component: add one object to COMPONENT_LINKS below.
 * To add a token page: add one object to TOKEN_LINKS below.
 *
 * BASE_PATH must match the GitHub Pages repo path. Update it if the repo is renamed.
 */

(function () {
  'use strict';

  /* ── Configuration ───────────────────────────────────────────────────── */

  var BASE_PATH = '/stardust4';

  /* All values are hardcoded strings. No external data. */
  var COMPONENT_LINKS = [
    { label: 'Button',  href: BASE_PATH + '/docs/components/button.html' },
    /* Add new components below this line: */
    /* { label: 'Badge',   href: BASE_PATH + '/docs/components/badge.html' }, */
  ];

  var TOKEN_LINKS = [
    { label: 'Colour',     href: BASE_PATH + '/docs/tokens/colour.html' },
    { label: 'Typography', href: BASE_PATH + '/docs/tokens/typography.html' },
    { label: 'Spacing',    href: BASE_PATH + '/docs/tokens/spacing.html' },
    { label: 'Radius',     href: BASE_PATH + '/docs/tokens/radius.html' },
  ];

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  /**
   * Safely create an anchor element from a hardcoded href and label.
   * Both arguments are hardcoded strings from the arrays above — never user data.
   * We use setAttribute + createTextNode rather than innerHTML for defence-in-depth.
   */
  function buildLink(href, label, isCurrent) {
    var a = document.createElement('a');
    a.setAttribute('href', href);
    if (isCurrent) { a.className = 'active'; a.setAttribute('aria-current', 'page'); }
    a.appendChild(document.createTextNode(label));
    return a;
  }

  function buildSep() {
    var span = document.createElement('span');
    span.className = 'xp-nav__sep';
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  function buildSectionLabel(text) {
    var span = document.createElement('span');
    span.className = 'xp-nav__section-label';
    span.setAttribute('aria-hidden', 'true');
    span.appendChild(document.createTextNode(text));
    return span;
  }

  /* ── Build nav ───────────────────────────────────────────────────────── */

  function buildNav() {
    var currentPath = window.location.pathname;

    var nav = document.createElement('nav');
    nav.className = 'xp-nav';
    nav.setAttribute('aria-label', 'Stardust Design System');

    /* Logo */
    var logo = document.createElement('a');
    logo.className = 'xp-nav__logo';
    logo.setAttribute('href', BASE_PATH + '/docs/index.html');
    var logoSpan = document.createElement('span');
    logoSpan.appendChild(document.createTextNode('Stardust'));
    logo.appendChild(logoSpan);
    nav.appendChild(logo);

    /* Nav link list */
    var ul = document.createElement('ul');
    ul.className = 'xp-nav__links';
    ul.setAttribute('role', 'list');

    /* Home link */
    var homeLi = document.createElement('li');
    homeLi.appendChild(buildLink(BASE_PATH + '/docs/index.html', 'Home',
      currentPath === BASE_PATH + '/docs/index.html' || currentPath === BASE_PATH + '/docs/'));
    ul.appendChild(homeLi);

    /* Separator + "Components" label */
    var sepLi1 = document.createElement('li'); sepLi1.appendChild(buildSep()); ul.appendChild(sepLi1);
    var compLabel = document.createElement('li'); compLabel.appendChild(buildSectionLabel('Components')); ul.appendChild(compLabel);

    COMPONENT_LINKS.forEach(function (item) {
      var li = document.createElement('li');
      li.appendChild(buildLink(item.href, item.label, currentPath === item.href || currentPath.indexOf(item.href) === 0));
      ul.appendChild(li);
    });

    /* Separator + "Tokens" label */
    var sepLi2 = document.createElement('li'); sepLi2.appendChild(buildSep()); ul.appendChild(sepLi2);
    var tokLabel = document.createElement('li'); tokLabel.appendChild(buildSectionLabel('Tokens')); ul.appendChild(tokLabel);

    TOKEN_LINKS.forEach(function (item) {
      var li = document.createElement('li');
      li.appendChild(buildLink(item.href, item.label, currentPath === item.href));
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    /* GitHub link */
    var gh = document.createElement('a');
    gh.className = 'xp-nav__github';
    gh.setAttribute('href', 'https://github.com/MasonMaddy/stardust4');
    gh.setAttribute('target', '_blank');
    gh.setAttribute('rel', 'noopener noreferrer');
    gh.appendChild(document.createTextNode('GitHub ↗'));
    nav.appendChild(gh);

    return nav;
  }

  /* ── Inject ──────────────────────────────────────────────────────────── */

  function inject() {
    var container = document.getElementById('site-nav');
    if (!container) { return; }
    container.appendChild(buildNav());
  }

  /* ── Scroll-spy (sidebar in-page nav) ───────────────────────────────── */

  function initScrollSpy() {
    var sidebarLinks = document.querySelectorAll('.sidebar__nav a');
    if (sidebarLinks.length === 0) { return; }

    var sections = [];
    sidebarLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var el = document.getElementById(href.slice(1));
        if (el) { sections.push({ el: el, link: a }); }
      }
    });

    if (sections.length === 0) { return; }

    var navOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) + 24;

    function onScroll() {
      var scrollY = window.scrollY;
      var active = sections[0];

      sections.forEach(function (s) {
        if (s.el.getBoundingClientRect().top + scrollY - navOffset <= scrollY) {
          active = s;
        }
      });

      sidebarLinks.forEach(function (a) { a.classList.remove('active'); });
      if (active) { active.link.classList.add('active'); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Copy buttons ────────────────────────────────────────────────────── */

  function initCopyButtons() {
    document.querySelectorAll('.code-block').forEach(function (block) {
      var pre = block.querySelector('pre');
      if (!pre) { return; }

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.appendChild(document.createTextNode('Copy'));

      btn.addEventListener('click', function () {
        var text = pre.textContent || '';
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(function () {
          btn.textContent = 'Error';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        });
      });

      block.appendChild(btn);
    });
  }

  /* ── Entry point ─────────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      inject();
      initScrollSpy();
      initCopyButtons();
    });
  } else {
    inject();
    initScrollSpy();
    initCopyButtons();
  }

}());
