# Plugin-API helper library (foundation kit)

Paste this block at the top of **every** `use_figma` call (JS scope doesn't persist between
calls), then compose screens from the builders. It encodes the patterns that render Stardust
screens faithfully: Inter font loading, the `--sd-*` token values as constants, a gradient +
shadow, text, vector icons, auto-layout frames, and the core screen scaffolding.

> Adapt the token map and component dimensions to whatever system you're authoring. The
> *structure* (font preload → helpers → screen builders → layout) is the reusable part.

## Contents
- Setup: fonts + token map + gradient
- `tx` — text nodes
- `icon` — recoloured, rescaled vector icons from inline SVG
- `fr` / `circle` — auto-layout frames + ellipses
- Screen scaffolding: `screen` / `whiteScreen` / `hero` / `sheet` / `titles` / `spacer`
- Element builders: `btn` / `field` / `avatar` / a generic row / `statePanel`
- Layout: positioning rows

## Setup

```js
const F = figma;
// Inter weights. NOTE the spaces: "Semi Bold" not "SemiBold", "Extra Bold" not "ExtraBold".
await Promise.all(['Regular','Medium','Semi Bold','Bold'].map(s => F.loadFontAsync({family:'Inter', style:s})));
F.currentPage.name = 'Sign-in flows';  // renaming the CURRENT page is fine; SWITCHING pages is not

const hex = (h) => { h = h.replace('#',''); return { r:parseInt(h.slice(0,2),16)/255, g:parseInt(h.slice(2,4),16)/255, b:parseInt(h.slice(4,6),16)/255 }; };
const solid = (h, a = 1) => ({ type:'SOLID', color:hex(h), opacity:a });

// Stardust token VALUES (mirror docs/assets/css/tokens.css). Authoring uses concrete hex.
const T = { cyan700:'#00776B', cyan900:'#004B40', cyan100:'#AFDEDC', cyan600:'#008480',
  grey100:'#FAFAFA', grey200:'#F6F6F6', grey300:'#F1F1F1', grey400:'#E2E2E2', grey500:'#D0D0D0',
  textPri:'#252525', textSec:'#838383', textDis:'#BDBDBD', white:'#FFFFFF',
  orange500:'#FF9800', purple500:'#8068BA', red20:'#FDE8EE', red800:'#D21D3E' };

// Cosmic hero gradient: vertical linear cyan-700 → cyan-900 (a robust stand-in for a top-centre
// radial glow). The transform [[0,1,0],[-1,0,1]] orients the gradient top→bottom.
const gstop = (h, p, a = 1) => ({ position:p, color:{ ...hex(h), a } });
const cosmic = { type:'GRADIENT_LINEAR', gradientTransform:[[0,1,0],[-1,0,1]],
  gradientStops:[gstop(T.cyan700,0), gstop(T.cyan900,1)] };
```

## Text

```js
function tx(c, o = {}) {
  const t = F.createText();
  t.fontName = { family:'Inter', style:o.weight || 'Regular' };
  t.fontSize = o.size || 16;
  t.characters = c;
  t.fills = [solid(o.color || T.textPri)];
  t.textAlignHorizontal = o.align || 'LEFT';
  if (o.ls) t.letterSpacing = { unit:'PERCENT', value:o.ls };
  if (o.lh) t.lineHeight = { unit:'PERCENT', value:o.lh };
  if (o.width) { t.textAutoResize = 'HEIGHT'; t.resize(o.width, t.height); } // fixed width → wraps
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';                                 // hugs (no wrap)
  if (o.opacity != null) t.opacity = o.opacity;
  return t;
}
```

## Icons (inline SVG → recoloured, rescaled vector)

`createNodeFromSvg` returns a wrapper FRAME of vector children. Two traps it avoids (see gotchas):
recolour only the **vector descendants** (not the wrapper, or you get a filled square), and
`rescale` to the target size (resizing the frame would clip, not scale).

```js
const SVG = {
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#000"/><path d="M4.5 20.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5z" fill="#000"/></svg>',
  view:'<svg viewBox="0 0 24 24"><path d="M12 5c5 0 9 4.6 10 7-1 2.4-5 7-10 7S3 14.4 2 12c1-2.4 5-7 10-7z" fill="none" stroke="#000" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#000"/></svg>',
  // …add the icons your screens use (chevrons, add, tick, image, star, dot, …). fill/stroke "#000"
  //   is a placeholder — `icon()` recolours it.
};
function icon(name, size, color, opacity) {
  const n = F.createNodeFromSvg(SVG[name]);
  const paint = [solid(color)];
  const rec = (nd) => {
    if (['VECTOR','ELLIPSE','RECTANGLE','LINE','POLYGON','STAR','BOOLEAN_OPERATION'].includes(nd.type)) {
      if (Array.isArray(nd.fills) && nd.fills.length) nd.fills = paint;
      if (Array.isArray(nd.strokes) && nd.strokes.length) nd.strokes = paint;
    }
    if ('children' in nd) nd.children.forEach(rec);
  };
  if ('children' in n) n.children.forEach(rec);
  n.fills = [];                  // clear wrapper-frame fill so it isn't a solid square
  n.rescale(size / n.width);     // scale node + children to target size
  if (opacity != null) n.opacity = opacity;
  n.name = name;
  return n;
}
```

## Frames + ellipses

`fr` is a do-everything auto-layout frame factory; opts let you set mode, gaps, padding,
alignment, fill, radius, stroke without repeating boilerplate.

```js
function fr(name, opts = {}) {
  const f = F.createFrame(); f.name = name;
  f.fills = opts.fill ? [solid(opts.fill, opts.fillA == null ? 1 : opts.fillA)] : [];
  if (opts.w && opts.h) f.resize(opts.w, opts.h);
  if (opts.mode) {
    f.layoutMode = opts.mode;                                   // 'VERTICAL' | 'HORIZONTAL'
    f.itemSpacing = opts.gap == null ? 0 : opts.gap;
    f.primaryAxisSizingMode = opts.primFixed ? 'FIXED' : 'AUTO';
    f.counterAxisSizingMode = opts.cntFixed ? 'FIXED' : 'AUTO';
    if (opts.pad != null || opts.pt != null) {
      f.paddingTop = opts.pt != null ? opts.pt : (opts.pad || 0);
      f.paddingBottom = opts.pb != null ? opts.pb : (opts.pad || 0);
      f.paddingLeft = opts.pl != null ? opts.pl : (opts.pad || 0);
      f.paddingRight = opts.pr != null ? opts.pr : (opts.pad || 0);
    }
    if (opts.align) f.primaryAxisAlignItems = opts.align;       // 'MIN'|'CENTER'|'MAX'|'SPACE_BETWEEN'
    if (opts.cross) f.counterAxisAlignItems = opts.cross;       // 'MIN'|'CENTER'|'MAX'
  }
  if (opts.radius != null) f.cornerRadius = opts.radius;
  if (opts.stroke) { f.strokes = [solid(opts.stroke)]; f.strokeWeight = opts.sw || 1; }
  return f;
}
const circle = (d, fill, a) => { const e = F.createEllipse(); e.resize(d, d); e.fills = [solid(fill, a == null ? 1 : a)]; return e; };
```

## Screen scaffolding

A screen is a fixed 390×800 vertical auto-layout: a fixed-height **hero** (transparent, over the
screen's gradient) + a **sheet** that grows to fill. `layoutAlign:'STRETCH'` makes a child fill
the cross axis; `layoutGrow:1` makes it absorb remaining primary-axis space.

```js
function screen(name) { const s = fr(name, { mode:'VERTICAL', primFixed:true, cntFixed:true }); s.resize(390,800); s.fills = [{...cosmic}]; s.clipsContent = true; return s; }
function whiteScreen(name) { const s = fr(name, { mode:'VERTICAL', primFixed:true, cntFixed:true, fill:T.grey100 }); s.resize(390,800); s.clipsContent = true; return s; }

function hero(h, opt = {}) {
  const f = fr('hero', { mode:'VERTICAL', gap:16, cross:'CENTER',
    align: opt.nav ? 'MIN' : 'CENTER', primFixed:true, cntFixed:true, pl:30, pr:30, pt: opt.nav ? 52 : 0 });
  f.resize(390, h); f.layoutAlign = 'STRETCH'; f.clipsContent = true;
  starfield(f);                       // decorative; see note below
  if (opt.nav) nav(f, opt.nav, opt.service);
  return f;
}
function sheet(gap) {
  const f = fr('sheet', { mode:'VERTICAL', gap: gap == null ? 16 : gap, fill:T.white, cntFixed:true, pt:26, pb:22, pl:26, pr:26 });
  f.layoutAlign = 'STRETCH'; f.layoutGrow = 1; f.topLeftRadius = 32; f.topRightRadius = 32;
  f.effects = [{ type:'DROP_SHADOW', color:{ r:0, g:40/255, b:34/255, a:0.3 }, offset:{ x:0, y:-10 }, radius:36, spread:0, visible:true, blendMode:'NORMAL' }];
  return f;
}
function titles(t1, t2) { const w = fr('titles', { mode:'VERTICAL', gap:6, cross:'CENTER' });
  if (t1) w.appendChild(tx(t1, { size:22, weight:'Bold', color:T.white, align:'CENTER' }));
  if (t2) w.appendChild(tx(t2, { size:15, color:T.cyan100, align:'CENTER' })); return w; }
const spacer = () => { const s = fr('spacer', {}); s.layoutAlign = 'STRETCH'; s.layoutGrow = 1; s.resize(10,10); return s; };

// Absolutely-positioned children (starfield, nav). MUST appendChild BEFORE setting
// layoutPositioning='ABSOLUTE' (the parent needs a layoutMode at the moment you set it).
function starfield(host) {
  [['star',30,30,30,.42],['dot',150,96,10,.5],['star',322,16,14,.4]].forEach(([n,x,y,s,o]) => {
    const ic = icon(n, s, T.white, o); host.appendChild(ic); ic.layoutPositioning = 'ABSOLUTE'; ic.x = x; ic.y = y;
  });
}
function nav(host, kind, service) {
  const lbl = tx('‹ ' + (kind === 'back' ? 'Back' : 'Logout'), { size:15, weight:'Semi Bold', color:T.white });
  host.appendChild(lbl); lbl.layoutPositioning = 'ABSOLUTE'; lbl.x = 16; lbl.y = 18;
  if (service) { const sv = tx(service.toUpperCase(), { size:14, weight:'Bold', color:T.white, ls:4 });
    host.appendChild(sv); sv.layoutPositioning = 'ABSOLUTE'; sv.x = (390 - sv.width)/2; sv.y = 20; }
}
```

## Element builders

```js
function btn(label, disabled) {
  const b = fr('button', { mode:'HORIZONTAL', align:'CENTER', cross:'CENTER', fill: disabled ? T.grey200 : T.cyan700, radius:16, primFixed:true, cntFixed:true });
  b.layoutAlign = 'STRETCH'; b.resize(338,50);
  b.appendChild(tx(label, { size:16, weight:'Semi Bold', color: disabled ? T.textDis : T.white })); return b;
}
function field(label, value, placeholder, lead, trail) {
  const w = fr(label, { mode:'VERTICAL', gap:6 }); w.layoutAlign = 'STRETCH';
  w.appendChild(tx(label, { size:14, weight:'Medium', color:T.textSec }));
  const inp = fr('input', { mode:'HORIZONTAL', cross:'CENTER', gap:10, fill:T.white, radius:16, stroke:T.grey500, sw:1, primFixed:true, cntFixed:true, pl: lead?14:16, pr: trail?14:16 });
  inp.layoutAlign = 'STRETCH'; inp.resize(338,52);
  if (lead) inp.appendChild(icon(lead, 20, T.textSec, 0.55));
  const v = tx(value || placeholder, { size:16, weight: value?'Medium':'Regular', color: value?T.textPri:T.textDis }); v.layoutGrow = 1; inp.appendChild(v);
  if (trail) inp.appendChild(icon(trail, 20, T.textSec, 0.55));
  w.appendChild(inp); return w;
}
function avatar(e, size) {            // {initials,color} or {photo:true}
  if (e.photo) { const a = fr('avatar', { mode:'HORIZONTAL', align:'CENTER', cross:'CENTER', fill:T.grey300, radius:size/2, primFixed:true, cntFixed:true }); a.resize(size,size); a.appendChild(icon('person', size*0.55, T.textSec, 0.5)); return a; }
  const a = fr('avatar', { mode:'HORIZONTAL', align:'CENTER', cross:'CENTER', fill:e.color, radius:size/2, primFixed:true, cntFixed:true }); a.resize(size,size);
  a.appendChild(tx(e.initials, { size:size*0.33, weight:'Bold', color:T.white })); return a;
}
// centred blocking / empty state (app-disabled, no-rooms, error+retry). Appends into a sheet.
function statePanel(sh, o) {
  const wrap = fr('panel', { mode:'VERTICAL', gap:0, cross:'CENTER', align:'CENTER' }); wrap.layoutAlign='STRETCH'; wrap.layoutGrow=1;
  const c = fr('circ', { mode:'HORIZONTAL', align:'CENTER', cross:'CENTER', fill: o.tone==='error'?T.red20:T.grey200, radius:33, primFixed:true, cntFixed:true }); c.resize(66,66);
  o.iconName ? c.appendChild(icon(o.iconName,28,T.textSec,0.5)) : c.appendChild(tx(o.glyph, { size:27, weight:'Semi Bold', color: o.tone==='error'?T.red800:T.textSec }));
  wrap.appendChild(c);
  const sp = (h) => { const s = fr('s',{}); s.resize(10,h); wrap.appendChild(s); };
  sp(20); wrap.appendChild(tx(o.title, { size:20, weight:'Bold', align:'CENTER' }));
  sp(8);  wrap.appendChild(tx(o.body, { size:14, color:T.textSec, align:'CENTER', lh:150, width:250 }));
  sh.appendChild(wrap);
  if (o.primary) sh.appendChild(btn(o.primary, false));
}
```

## Composing + laying out

A screen builder composes these, e.g.:

```js
function S_service() {
  const s = screen('A · Service sign-in');
  const h = hero(340); h.appendChild(/* emblem */); h.appendChild(titles('Sign in', 'Please sign into your service')); s.appendChild(h);
  const sh = sheet();
  sh.appendChild(field('Username', 'sample', 'Username', 'user', null));
  sh.appendChild(field('Password', '••••••••', 'Password', null, 'view'));
  sh.appendChild(spacer());
  sh.appendChild(btn('Sign in', false));
  s.appendChild(sh);
  return s;
}

// Lay screens into labelled rows, one row per flow:
function place(arr, y) { arr.forEach((s, i) => { s.x = i * 460; s.y = y; }); }
function rowTitle(t, y) { const n = tx(t, { size:28, weight:'Bold', color:T.textPri }); F.currentPage.appendChild(n); n.x = 0; n.y = y - 70; }
rowTitle('1 · Cold start', 0); place([S_service() /*, …*/], 0);
F.viewport.scrollAndZoomIntoView(F.currentPage.children);
```
