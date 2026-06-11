/*
 * Stardust Design System — Side Navigation
 *
 * SECURITY: All nav HTML is assembled from hardcoded strings defined in this file.
 * No user input, URL parameters, query strings, or fetched data ever reaches innerHTML.
 * DOM nodes are built with createElement / setAttribute / createTextNode only.
 * This is intentional and must be preserved by future contributors.
 *
 * To add a component: add one object to COMPONENT_LINKS and commit.
 * To add a token page: add one object to TOKEN_LINKS and commit.
 *
 * BASE_PATH must match the GitHub Pages repository path (no trailing slash).
 * Update it here if the repo is renamed or moved.
 *
 * Path note: GitHub Pages serves the /docs folder as the web root.
 * Physical file docs/components/button.html → URL /stardust4/components/button.html
 * Do NOT include /docs/ in these paths.
 */

(function () {
  'use strict';

  /* ── Configuration ───────────────────────────────────────────────────── */

  var BASE_PATH = '/stardust4';

  /* All values are hardcoded strings. No external data. */
  var COMPONENT_LINKS = [
    { label: 'Button', href: BASE_PATH + '/components/button.html', status: 'wip' },
    { label: 'Avatar', href: BASE_PATH + '/components/avatar.html', status: 'wip' },
    { label: 'Checkbox', href: BASE_PATH + '/components/checkbox.html', status: 'wip' },
    { label: 'Icons',        href: BASE_PATH + '/components/icons.html',        status: 'wip' },
    { label: 'Radio Button', href: BASE_PATH + '/components/radio-button.html', status: 'wip' },
    { label: 'Pill',         href: BASE_PATH + '/components/pill.html',         status: 'wip' },
    { label: 'FAB',            href: BASE_PATH + '/components/fab.html',            status: 'wip' },
    { label: 'Selection Pill', href: BASE_PATH + '/components/selection-pill.html', status: 'wip' },
    { label: 'Toggle',         href: BASE_PATH + '/components/toggle.html',         status: 'wip' },
    { label: 'Title Block',    href: BASE_PATH + '/components/title-block.html',    status: 'wip' },
    { label: 'Input',          href: BASE_PATH + '/components/input.html',          status: 'wip' },
    /* Add new components below this line: */
    /* { label: 'Badge',  href: BASE_PATH + '/components/badge.html', status: 'wip' }, */
  ];

  /* Sandbox — development artifact, linked in nav for easy access during workshop */
  var SANDBOX_LINKS = [
    { label: 'Sandbox', href: BASE_PATH + '/sandbox/', status: 'dev' },
  ];

  var TOKEN_LINKS = [
    { label: 'Colour',     href: BASE_PATH + '/tokens/colour.html'     },
    { label: 'Typography', href: BASE_PATH + '/tokens/typography.html' },
    { label: 'Spacing',    href: BASE_PATH + '/tokens/spacing.html'    },
    { label: 'Radius',     href: BASE_PATH + '/tokens/radius.html'     },
    { label: 'Motion',     href: BASE_PATH + '/tokens/motion.html'     },
  ];

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  /**
   * Build a nav anchor from a hardcoded href and label.
   * Both arguments come only from the hardcoded arrays above — never user data.
   */
  function buildNavLink(href, label, isActive, status) {
    var a = document.createElement('a');
    a.setAttribute('href', href);
    var cls = 'ds-sidenav__link';
    if (isActive) {
      cls += ' active';
      a.setAttribute('aria-current', 'page');
    }
    a.className = cls;
    if (status) { a.setAttribute('data-status', status); }
    a.appendChild(document.createTextNode(label));
    return a;
  }

  function buildSection(title, links, currentPath) {
    var section = document.createElement('div');
    section.className = 'ds-sidenav__section';

    var label = document.createElement('p');
    label.className = 'ds-sidenav__section-label';
    label.setAttribute('aria-hidden', 'true');
    label.appendChild(document.createTextNode(title));
    section.appendChild(label);

    var list = document.createElement('ul');
    list.className = 'ds-sidenav__list';
    list.setAttribute('role', 'list');

    links.forEach(function (item) {
      var li = document.createElement('li');
      var isActive = currentPath === item.href ||
                     (item.href !== BASE_PATH + '/' && currentPath.indexOf(item.href) === 0);
      li.appendChild(buildNavLink(item.href, item.label, isActive, item.status || null));
      list.appendChild(li);
    });

    section.appendChild(list);
    return section;
  }

  /* ── Build nav ───────────────────────────────────────────────────────── */

  function buildNav() {
    var currentPath = window.location.pathname;

    var nav = document.createElement('nav');
    nav.className = 'ds-sidenav';
    nav.setAttribute('aria-label', 'Stardust Design System');

    /* ── Header / logo ── */
    var header = document.createElement('div');
    header.className = 'ds-sidenav__header';

    var logo = document.createElement('a');
    logo.className = 'ds-sidenav__logo';
    logo.setAttribute('href', BASE_PATH + '/');

    var logoName = document.createElement('span');
    logoName.className = 'ds-sidenav__logo-name';
    /* "Stardust" in coral, rest in navy */
    var starEm = document.createElement('em');
    starEm.appendChild(document.createTextNode('Star'));
    logoName.appendChild(starEm);
    logoName.appendChild(document.createTextNode('dust'));

    var logoSub = document.createElement('span');
    logoSub.className = 'ds-sidenav__logo-sub';
    logoSub.appendChild(document.createTextNode('Design System'));

    logo.appendChild(logoName);
    logo.appendChild(logoSub);
    header.appendChild(logo);
    nav.appendChild(header);

    /* ── Body ── */
    var body = document.createElement('div');
    body.className = 'ds-sidenav__body';

    /* Overview link */
    var isHome = currentPath === BASE_PATH + '/' ||
                 currentPath === BASE_PATH + '/index.html' ||
                 currentPath === BASE_PATH;
    var overviewList = document.createElement('ul');
    overviewList.className = 'ds-sidenav__list';
    overviewList.setAttribute('role', 'list');
    var homeLi = document.createElement('li');
    homeLi.appendChild(buildNavLink(BASE_PATH + '/', 'Overview', isHome, null));
    overviewList.appendChild(homeLi);
    body.appendChild(overviewList);

    /* Components section */
    if (COMPONENT_LINKS.length > 0) {
      body.appendChild(buildSection('Components', COMPONENT_LINKS, currentPath));
    }

    /* Tokens section */
    if (TOKEN_LINKS.length > 0) {
      body.appendChild(buildSection('Tokens', TOKEN_LINKS, currentPath));
    }

    /* Sandbox section — development workspace link */
    if (SANDBOX_LINKS.length > 0) {
      body.appendChild(buildSection('Workshop', SANDBOX_LINKS, currentPath));
    }

    nav.appendChild(body);

    /* ── Footer ── */
    var footer = document.createElement('div');
    footer.className = 'ds-sidenav__footer';

    var ghLink = document.createElement('a');
    ghLink.className = 'ds-sidenav__footer-link';
    ghLink.setAttribute('href', 'https://github.com/MasonMaddy/stardust4');
    ghLink.setAttribute('target', '_blank');
    ghLink.setAttribute('rel', 'noopener noreferrer');
    ghLink.appendChild(document.createTextNode('GitHub ↗'));
    footer.appendChild(ghLink);
    nav.appendChild(footer);

    return nav;
  }

  /* ── Inject ──────────────────────────────────────────────────────────── */

  function inject() {
    var container = document.getElementById('site-nav');
    if (!container) { return; }
    container.appendChild(buildNav());
  }

  /* ── Right-TOC scroll-spy ────────────────────────────────────────────── */

  function initScrollSpy() {
    var tocLinks = document.querySelectorAll('.page-toc__nav a');
    if (tocLinks.length === 0) { return; }

    var sections = [];
    tocLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var el = document.getElementById(href.slice(1));
        if (el) { sections.push({ el: el, link: a }); }
      }
    });

    if (sections.length === 0) { return; }

    function onScroll() {
      var scrollY = window.scrollY;
      var active = sections[0];

      sections.forEach(function (s) {
        if (s.el.getBoundingClientRect().top + scrollY - 40 <= scrollY) {
          active = s;
        }
      });

      tocLinks.forEach(function (a) { a.classList.remove('active'); });
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

  /* ── Collapsible example code blocks ─────────────────────────────────── */
  /*
   * Finds every .code-block inside an .eng-example that has more content
   * than the collapsed height and injects a "View Code" overlay button.
   * CSS in main.css handles the visual collapse/expand; this JS only
   * manages the toggle class and button lifecycle.
   *
   * SECURITY: No user input or external data is used. All DOM nodes are
   * created with createElement / textContent. No innerHTML writes.
   */
  function initCollapsibleCode() {
    var blocks = document.querySelectorAll('.eng-example .code-block');
    blocks.forEach(function (block) {
      var pre = block.querySelector('pre');
      if (!pre || pre.scrollHeight <= 80) return;   // already fits — skip

      block.classList.add('code-block--collapsible');

      var overlay = document.createElement('div');
      overlay.className = 'code-block__reveal-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      var btn = document.createElement('button');
      btn.className = 'code-block__reveal-btn';
      btn.type = 'button';
      btn.textContent = 'View Code';

      btn.addEventListener('click', function () {
        var expanded = block.classList.toggle('is-expanded');
        if (expanded) {
          pre.setAttribute('tabindex', '-1');
          pre.focus({ preventScroll: true });
        }
      });

      overlay.appendChild(btn);
      block.appendChild(overlay);
    });
  }

  /* ── Entry point ─────────────────────────────────────────────────────── */

  function init() {
    inject();
    initScrollSpy();
    initCopyButtons();
    initCollapsibleCode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
