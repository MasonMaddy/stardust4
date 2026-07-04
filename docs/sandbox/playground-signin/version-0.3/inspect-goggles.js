/*
 * inspect-goggles.js — "anatomy" inspector for the Playground Sign-in prototype.
 *
 * A dependency-free devtools-style overlay: toggle it on, hover any element inside the
 * PHONE device and it draws the box-model anatomy (margin / border / padding / content)
 * and a panel of computed values — crucially mapping each value back to its Stardust
 * --sd-* token where one matches, so a dev can see "16px → --sd-spacing-4" rather than
 * just a number. Values with no token match are flagged (useful: this prototype hand-rolls
 * a lot of inline styles, and "off-token" is exactly what the alignment work wants to find).
 *
 * Phone-only by design — childcare educators use the phone build; the iPad frame is ignored.
 * Plain <script> (no JSX/babel). Skipped entirely in ?bare=1 capture mode.
 */
(function () {
  'use strict';

  if (new URLSearchParams(location.search).get('bare')) return; // clean capture mode — no tool

  var root = document.documentElement;
  var scaler = document.getElementById('scaler');

  // ── current stage scale ──────────────────────────────────────────────────
  // The whole harness is CSS-transform-scaled to fit the viewport. getBoundingClientRect()
  // already returns post-transform screen pixels (so overlay boxes line up), but computed
  // padding/border/margin are in the element's own layout units — multiply those by the
  // scale when drawing the box geometry. Tooltip values stay in layout (device) units.
  function curScale() {
    try { return new DOMMatrixReadOnly(getComputedStyle(scaler).transform).a || 1; }
    catch (e) { return 1; }
  }

  // ── token index ────────────────────────────────────────────────────────────
  // Reverse map: resolved value → --sd-* token name(s). Built once, lazily, from the
  // loaded stylesheets (tokens.css is same-origin so its rules are readable).
  var idx = null;
  var probe = null;

  function getProbe() {
    if (!probe) {
      probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';
      document.body.appendChild(probe);
    }
    return probe;
  }

  // Normalise any CSS colour to canonical rgb()/rgba() via the browser.
  function normColor(v) {
    if (!v) return null;
    var p = getProbe();
    p.style.color = '';
    p.style.color = v;
    if (!p.style.color) return null; // browser rejected it — not a colour
    return getComputedStyle(p).color || null;
  }

  var rootFont = parseFloat(getComputedStyle(root).fontSize) || 16;
  function toPx(v) {
    if (!v) return null;
    v = String(v).trim();
    if (v.endsWith('px')) return parseFloat(v);
    if (v.endsWith('rem')) return parseFloat(v) * rootFont;
    if (v.endsWith('em')) return parseFloat(v) * rootFont;
    var n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function push(map, key, name) {
    if (key == null) return;
    (map[key] = map[key] || []).push(name);
  }

  // Prefer a semantic token (no trailing -<number>) over a raw primitive, then the shortest.
  function pickName(names) {
    if (!names || !names.length) return null;
    var semantic = names.filter(function (n) { return !/-\d+$/.test(n); });
    var pool = semantic.length ? semantic : names;
    return pool.slice().sort(function (a, b) { return a.length - b.length; })[0];
  }

  function buildIndex() {
    var names = new Set();
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var rules;
      try { rules = sheets[i].cssRules; } catch (e) { continue; } // cross-origin (Google Fonts)
      if (!rules) continue;
      for (var r = 0; r < rules.length; r++) {
        var st = rules[r].style;
        if (!st) continue;
        for (var k = 0; k < st.length; k++) {
          var prop = st[k];
          if (prop.indexOf('--sd-') === 0) names.add(prop);
        }
      }
    }
    var out = { color: {}, space: {}, radius: {}, fontSize: {}, fontWeight: {}, lineHeight: {}, raw: {} };
    var cs = getComputedStyle(root);
    names.forEach(function (name) {
      var val = cs.getPropertyValue(name).trim();
      if (!val) return;
      out.raw[name] = val;
      if (name.indexOf('colour') > -1 || name.indexOf('color') > -1) {
        push(out.color, normColor(val), name);
      } else if (name.indexOf('radius') > -1) {
        push(out.radius, String(toPx(val)), name);
      } else if (name.indexOf('spacing') > -1) {
        push(out.space, String(toPx(val)), name);
      } else if (name.indexOf('font-size') > -1) {
        push(out.fontSize, String(toPx(val)), name);
      } else if (name.indexOf('font-weight') > -1) {
        push(out.fontWeight, val.trim(), name);
      } else if (name.indexOf('line-height') > -1) {
        push(out.lineHeight, val.trim(), name);
      }
    });
    return out;
  }

  function ensureIndex() { if (!idx) idx = buildIndex(); return idx; }

  function tokColor(v) { var c = normColor(v); return c ? pickName(ensureIndex().color[c]) : null; }
  function tokPx(map, v) { var px = toPx(v); return px == null ? null : pickName(ensureIndex()[map][String(px)]); }
  function tokExact(map, v) { return pickName(ensureIndex()[map][String(v).trim()]); }

  // ── DOM scaffolding (built once, on first activate) ──────────────────────────
  var ui = null;
  function buildUI() {
    var style = document.createElement('style');
    style.textContent = [
      '.ig-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:Inter,system-ui,sans-serif;}',
      '.ig-box{position:fixed;pointer-events:none;box-sizing:border-box;}',
      '.ig-margin{background:rgba(246,178,107,0.30);}',
      '.ig-border{background:rgba(255,221,120,0.30);}',
      '.ig-padding{background:rgba(140,208,153,0.42);}',
      '.ig-content{background:rgba(116,178,235,0.50);outline:1px solid rgba(70,130,200,0.9);}',
      '.ig-tip{position:fixed;pointer-events:none;z-index:2147483001;max-width:320px;min-width:230px;',
      '  background:#1d2127;color:#e7eaf0;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.4);',
      '  padding:12px 13px 11px;font-size:12px;line-height:1.45;overflow:hidden;}',
      '.ig-tip-head{display:flex;align-items:baseline;gap:8px;margin:0 0 9px;padding-bottom:9px;border-bottom:1px solid rgba(255,255,255,.10);}',
      '.ig-tag{font-weight:700;color:#8fe3c8;font-size:12.5px;}',
      '.ig-cls{color:#9aa3b2;font-size:11px;word-break:break-all;}',
      '.ig-dims{margin-left:auto;color:#cdd3dd;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600;}',
      '.ig-row{display:flex;align-items:center;gap:8px;padding:2.5px 0;}',
      '.ig-k{color:#8b94a3;width:62px;flex:0 0 auto;font-size:11px;}',
      '.ig-v{color:#e7eaf0;font-variant-numeric:tabular-nums;}',
      '.ig-sw{display:inline-block;width:11px;height:11px;border-radius:3px;border:1px solid rgba(255,255,255,.25);vertical-align:-1px;margin-right:5px;}',
      '.ig-tok{margin-left:auto;font-size:10.5px;font-weight:600;color:#7fd3b6;background:rgba(127,211,182,.13);',
      '  border-radius:5px;padding:1.5px 6px;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}',
      '.ig-tok.off{color:#e7a98c;background:rgba(231,169,140,.13);}',
      '.ig-btn{position:fixed;right:18px;bottom:18px;z-index:2147483002;pointer-events:auto;',
      '  display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;',
      '  background:#1d2127;color:#e7eaf0;border-radius:999px;padding:10px 15px;font:600 13px Inter,sans-serif;',
      '  box-shadow:0 6px 22px rgba(0,0,0,.28);transition:background .15s,box-shadow .15s;}',
      '.ig-btn:hover{box-shadow:0 8px 28px rgba(0,0,0,.36);}',
      '.ig-btn.on{background:#00776b;color:#fff;}',
      '.ig-btn.ig-hide{display:none;}', // mobile-only: no affordance on Tablet
      '.ig-btn svg{width:16px;height:16px;}',
      '.ig-wip{font:700 9.5px Inter,sans-serif;letter-spacing:.07em;text-transform:uppercase;',
      '  background:rgba(246,178,107,.22);color:#f6b26b;border-radius:5px;padding:2px 5px;margin-left:1px;}',
      '.ig-btn.on .ig-wip{background:rgba(255,255,255,.22);color:#fff;}',
      '.ig-toast{position:fixed;right:18px;bottom:64px;z-index:2147483002;pointer-events:none;',
      '  background:#1d2127;color:#e7eaf0;font:500 12px Inter,sans-serif;border-radius:9px;',
      '  padding:8px 12px;box-shadow:0 6px 22px rgba(0,0,0,.3);opacity:0;transition:opacity .25s;max-width:240px;}',
      '.ig-toast.show{opacity:1;}',
      '.ig-legend{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483002;',
      '  pointer-events:none;display:none;gap:14px;background:#1d2127;color:#cdd3dd;border-radius:9px;',
      '  padding:7px 13px;font:500 11px Inter,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.3);}',
      '.ig-legend.show{display:flex;}',
      '.ig-legend span{display:inline-flex;align-items:center;gap:5px;}',
      '.ig-legend i{width:10px;height:10px;border-radius:3px;display:inline-block;}',
      'body.ig-active .device:not(.is-ipad) .device-screen *{cursor:crosshair !important;}'
    ].join('\n');
    document.head.appendChild(style);

    var layer = document.createElement('div');
    layer.className = 'ig-layer';
    var boxes = {};
    ['margin', 'border', 'padding', 'content'].forEach(function (n) {
      var b = document.createElement('div');
      b.className = 'ig-box ig-' + n;
      b.style.display = 'none';
      layer.appendChild(b);
      boxes[n] = b;
    });
    var tip = document.createElement('div');
    tip.className = 'ig-tip';
    tip.style.display = 'none';
    layer.appendChild(tip);
    document.body.appendChild(layer);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ig-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/>' +
      '<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>' +
      '<line x1="16.5" y1="16.5" x2="21" y2="21"/></svg><span class="ig-label">Inspect</span>' +
      '<span class="ig-wip">WIP</span>';
    document.body.appendChild(btn);

    var toast = document.createElement('div');
    toast.className = 'ig-toast';
    document.body.appendChild(toast);

    var legend = document.createElement('div');
    legend.className = 'ig-legend';
    legend.innerHTML =
      '<span><i style="background:rgba(246,178,107,.8)"></i>margin</span>' +
      '<span><i style="background:rgba(255,221,120,.85)"></i>border</span>' +
      '<span><i style="background:rgba(140,208,153,.9)"></i>padding</span>' +
      '<span><i style="background:rgba(116,178,235,.95)"></i>content</span>' +
      '<span style="color:#7f8896">· click to pin · Esc to exit</span>';
    document.body.appendChild(legend);

    return { layer: layer, boxes: boxes, tip: tip, btn: btn, toast: toast, legend: legend };
  }

  var toastTimer = null;
  function showToast(msg) {
    ui.toast.textContent = msg;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { ui.toast.classList.remove('show'); }, 2400);
  }

  // ── inspection ───────────────────────────────────────────────────────────────
  var active = false, pinned = false, lastEl = null;

  function isPhoneTarget(el) {
    if (!el || !el.closest) return false;
    var ds = el.closest('.device-screen');
    if (!ds) return false;
    var dev = ds.closest('.device');
    return dev && !dev.classList.contains('is-ipad');
  }

  function tokenChip(name) {
    if (name) return '<span class="ig-tok">' + name + '</span>';
    return '<span class="ig-tok off">no token</span>';
  }

  function fmtPx(v) {
    var n = parseFloat(v);
    if (isNaN(n)) return v;
    return (Math.round(n * 10) / 10) + 'px';
  }

  function sideValue(cs, prop) {
    // collapse top/right/bottom/left to a single value when uniform, else show all four
    var t = cs[prop + 'Top'], r = cs[prop + 'Right'], b = cs[prop + 'Bottom'], l = cs[prop + 'Left'];
    if (t === r && r === b && b === l) return { text: fmtPx(t), uniform: true, val: t };
    return { text: [t, r, b, l].map(fmtPx).join(' '), uniform: false, val: null };
  }

  function row(k, v, tok) {
    return '<div class="ig-row"><span class="ig-k">' + k + '</span><span class="ig-v">' + v + '</span>' +
      (tok !== undefined ? tokenChip(tok) : '') + '</div>';
  }

  function describe(el) {
    var cs = getComputedStyle(el);
    var s = curScale();
    var r = el.getBoundingClientRect();

    // box-model regions in screen pixels (computed values are layout units → ×scale)
    var m = { t: parseFloat(cs.marginTop) * s, r: parseFloat(cs.marginRight) * s, b: parseFloat(cs.marginBottom) * s, l: parseFloat(cs.marginLeft) * s };
    var bd = { t: parseFloat(cs.borderTopWidth) * s, r: parseFloat(cs.borderRightWidth) * s, b: parseFloat(cs.borderBottomWidth) * s, l: parseFloat(cs.borderLeftWidth) * s };
    var p = { t: parseFloat(cs.paddingTop) * s, r: parseFloat(cs.paddingRight) * s, b: parseFloat(cs.paddingBottom) * s, l: parseFloat(cs.paddingLeft) * s };

    place(ui.boxes.margin, r.left - m.l, r.top - m.t, r.width + m.l + m.r, r.height + m.t + m.b);
    place(ui.boxes.border, r.left, r.top, r.width, r.height);
    place(ui.boxes.padding, r.left + bd.l, r.top + bd.t, r.width - bd.l - bd.r, r.height - bd.t - bd.b);
    place(ui.boxes.content, r.left + bd.l + p.l, r.top + bd.t + p.t,
      r.width - bd.l - bd.r - p.l - p.r, r.height - bd.t - bd.b - p.t - p.b);

    // ---- panel ----
    var tag = el.tagName.toLowerCase();
    var cls = el.classList.length ? '.' + Array.prototype.slice.call(el.classList).join('.') : '';
    var w = Math.round(r.width / s), h = Math.round(r.height / s);

    var html = '<div class="ig-tip-head"><span class="ig-tag">' + tag + '</span>' +
      (cls ? '<span class="ig-cls">' + cls + '</span>' : '') +
      '<span class="ig-dims">' + w + ' × ' + h + '</span></div>';

    var pad = sideValue(cs, 'padding');
    html += row('padding', pad.text, pad.uniform ? tokPx('space', pad.val) : undefined);
    var mar = sideValue(cs, 'margin');
    if (parseFloat(mar.text) || !mar.uniform) html += row('margin', mar.text, mar.uniform ? tokPx('space', mar.val) : undefined);

    var gap = cs.gap || cs.rowGap;
    if (gap && parseFloat(gap)) html += row('gap', fmtPx(gap), tokPx('space', gap));

    var rad = cs.borderTopLeftRadius;
    if (rad && parseFloat(rad)) {
      var uniform = rad === cs.borderTopRightRadius && rad === cs.borderBottomLeftRadius && rad === cs.borderBottomRightRadius;
      var radTxt = rad.indexOf('%') > -1 ? rad : fmtPx(rad);
      html += row('radius', uniform ? radTxt : 'mixed', uniform ? (tokExact('radius', rad) || tokPx('radius', rad)) : undefined);
    }

    if (parseFloat(cs.borderTopWidth)) {
      html += row('border', fmtPx(cs.borderTopWidth) + ' ' + cs.borderTopStyle, tokColor(cs.borderTopColor));
    }

    var col = cs.color;
    html += row('color', '<span class="ig-sw" style="background:' + col + '"></span>' + rgbShort(col), tokColor(col));

    var bg = cs.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      html += row('bg', '<span class="ig-sw" style="background:' + bg + '"></span>' + rgbShort(bg), tokColor(bg));
    }

    // typography only where there's actual text
    if (el.textContent && el.textContent.trim() && hasOwnText(el)) {
      html += row('font', fmtPx(cs.fontSize) + ' / ' + fmtPx(cs.lineHeight === 'normal' ? cs.fontSize : cs.lineHeight), tokPx('fontSize', cs.fontSize));
      html += row('weight', cs.fontWeight, tokExact('fontWeight', cs.fontWeight));
    }

    ui.tip.innerHTML = html;
  }

  function hasOwnText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) return true;
    }
    return false;
  }

  function rgbShort(v) {
    // rgb(0, 119, 107) → #00776b ; keep rgba with alpha as-is
    var m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(v);
    if (!m) return v;
    return '#' + [m[1], m[2], m[3]].map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
  }

  function place(box, x, y, w, h) {
    if (w <= 0 || h <= 0) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.style.width = w + 'px';
    box.style.height = h + 'px';
  }

  function positionTip(x, y) {
    var t = ui.tip;
    t.style.display = 'block';
    var w = t.offsetWidth, h = t.offsetHeight;
    var nx = x + 16, ny = y + 16;
    if (nx + w > innerWidth - 8) nx = x - w - 16;
    if (nx < 8) nx = 8;
    if (ny + h > innerHeight - 8) ny = innerHeight - h - 8;
    if (ny < 8) ny = 8;
    t.style.left = nx + 'px';
    t.style.top = ny + 'px';
  }

  function clearBoxes() {
    Object.keys(ui.boxes).forEach(function (k) { ui.boxes[k].style.display = 'none'; });
    ui.tip.style.display = 'none';
  }

  function onMove(e) {
    if (!active || pinned) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!isPhoneTarget(el)) { lastEl = null; clearBoxes(); return; }
    lastEl = el;
    describe(el);
    positionTip(e.clientX, e.clientY);
  }

  function onClick(e) {
    if (!active) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!isPhoneTarget(el)) return; // let clicks outside the phone (e.g. the toggle) behave
    // inside the phone: swallow the prototype's own handler and pin instead
    e.preventDefault();
    e.stopPropagation();
    if (pinned && el === lastEl) { pinned = false; ui.legend.classList.add('show'); return; }
    pinned = true;
    lastEl = el;
    describe(el);
    positionTip(e.clientX, e.clientY);
    ui.legend.classList.remove('show');
  }

  function onKey(e) {
    if (e.key === 'Escape' && active) { e.preventDefault(); setActive(false); }
  }

  function setActive(on) {
    active = on;
    pinned = false;
    document.body.classList.toggle('ig-active', on);
    ui.btn.classList.toggle('on', on);
    ui.btn.querySelector('.ig-label').textContent = on ? 'Inspecting' : 'Inspect';
    ui.legend.classList.toggle('show', on);
    if (on) {
      ensureIndex();
      if (document.querySelector('.device.is-ipad')) showToast('Inspector works in Phone mode — switch the device toggle to Phone.');
    } else {
      clearBoxes();
    }
  }

  // mobile-only: the toggle exists only while the Phone device is showing. Switching to Tablet
  // hides the affordance entirely (and turns the inspector off if it was running).
  function syncDeviceMode() {
    if (!ui) return;
    var ipad = !!document.querySelector('.device.is-ipad');
    ui.btn.classList.toggle('ig-hide', ipad);
    if (ipad && active) setActive(false);
  }

  function init() {
    ui = buildUI();
    ui.btn.addEventListener('click', function () { setActive(!active); });
    var app = document.getElementById('app');
    if (app && window.MutationObserver) {
      new MutationObserver(syncDeviceMode).observe(app, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    }
    syncDeviceMode();
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    // keep pinned/last highlight aligned if the stage rescales or scrolls
    window.addEventListener('resize', function () { if (active && lastEl) describe(lastEl); });
    document.addEventListener('scroll', function () { if (active && lastEl && !pinned) clearBoxes(); }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
