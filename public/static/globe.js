/* The event desk's Globe view (terminal/pages/events.html), on canvas 2D
   with no library: docs/GLOBE_PLAN_2026-09-24.md, path (a), steps P2a,
   P2b, P3, P4, P5, P6 and P11.

   The page keeps its one drawMap and its fill logic; in Globe mode it asks
   this engine for each country's path and each point's place instead of
   the flat projection. Map mode never touches the engine's projection, so
   the flat map draws the same pixels as before the globe existed.

   What is here:
     - the orthographic projection: rotate each point's unit vector by the
       view centre, cull the back hemisphere, and push a hidden vertex out
       to the horizon rim so a partly hidden country closes along the rim
       and never across the disc by a chord; a ring wholly behind is
       skipped, a country wholly behind draws nothing
     - the backdrop: the disc, a thin limb glow, the graticule every 30
       degrees drawn as sampled arcs (hidden on phones)
     - PulseSystem, the landing pulse: a ring that grows and fades over
       1.2 s where an event lands, then the page's steady dot; at most 500;
       a cyan rim where the event started a house futuretest (P4)
     - CometSystem (P4): the ripple family (one arc per ring of
       world.ripple, labelled with the ring's median and its count of past
       cases), the pin family (amber, to each pinned country) and the
       chokepoint family (a restricted chokepoint to its theater's country
       funds, never an index, bond, dollar or sector fund); great circles
       on the Globe, planar curves on the Map and in the Continent view; at
       most 24; still arcs under reduced motion. rippleComets, pinComets,
       chokeComets and ftMarks plan them from the page's records.
     - motion: idle turning at 4 degrees a second (Kamil, 2026-09-24),
       paused by any touch, a hover, an open drawer or reduced motion and
       resumed 1.5 s after release; drag inertia at the finger's own speed
       over its last 100 ms, from the release only and in closed form per
       step, so a flick glides the same distance at 60, 120, 144 or 240
       Hz; an eased fly to a place and a zoom. Every step is
       scaled by the frame's own dt or the time since the motion began,
       never by a frame count.
     - the loop: requestAnimationFrame only while something moves, and
       never when the tab is hidden (visibilitychange), the canvas is off
       screen (IntersectionObserver) or the page is in Map mode; nothing is
       drawn while nothing moves; idle turning paints at about 30 frames a
       second, a drag, a glide and a fly at the screen's own rate
     - the coast's levels of detail (from the futuretest globe, ft/hires):
       full, then two simplified outlines made once by Douglas-Peucker on
       the sphere; while the view moves each paint takes the coarsest one
       that strays no more than 1.5 px on screen, and the first paint at
       rest is in full detail again. The land stays one fill per country.
     - ?debug=1: a readout on the canvas of the draw work per frame (ms and
       p95), the frames drawn a second, and the display's refresh rate read
       from the loop's own frame intervals (detectRate)
     - pointer input: drag, wheel and pinch to zoom from 1x to 4x around
       the pointer, taps handed back to the page (tap-to-tip on touch),
       and the phone's engage model: a first tap engages the globe (an
       amber ring, touch-action none, one finger turns it), a tap on empty
       sea or scrolling it off screen lets the page have the finger back
     - the Continent view (P3): the globe at a preset, one of the ten
       theaters or six continents of worldgeo.py (world-centroids.json
       carries them), framed by fitView from the members' own points so no
       preset is hand-tuned; no turning, the sea drawn to the canvas edge
       so it reads as a regional map, and an eased fly in and out
     - the keyboard (P2b): arrows turn it (shift for 30 degrees), plus and
       minus zoom, Home resets, space pauses the turning, [ and ] step
       through the events by severity, Enter opens one, Escape steps back,
       1, 2 and 3 pick the view; keyAction is the one table of them
     - Live: a polite live region that says each thing once
     - listRows: the globe as a list, one row per country, by severity,
       built from the very events the page draws
     - the degrade ladder: when the draw work per frame averages over 18 ms
       it steps down one rung (the device pixel ratio to 1.5, then 1, then
       the limb glow, the graticule, the borders; on a phone the borders
       go first) and says so in the ladder log and, in dev, the console
     - freeSpot: a label that would sit on another mark's box moves to the
       other side, above or below, or is left out
     - the time bar (P5): GlobeFeed, the live poll of the map's rows stored
       after a cursor, once a minute, paused while the tab is hidden or the
       desk looks back, each new row landing at its turn in the next minute
       in the order of its own moment (staggerTimes); moment, the feed's
       own time or the start of its date in UTC, which the page's 24 hour
       cut reads; the freshness strip's rows; the browser's clock with the
       UTC value for the tips; the page-kept snapshot (qg_events_snap)
     - the legend's layers (P6): the density counts and their fill, the
       odds ticks (the crowd's price and its move, never a book's), and a
       replayed event's ripple from the globe payload alone
     - the brief's still globe (P11, terminal/pages/brief.html): the
       basemap decoder, the busiest overnight theater, and stillGlobe, one
       paint of a small globe turned to it from a still engine that never
       asks for a frame

   No data lives here: every mark the page draws is a record it already
   has. ASCII only (terminal/test_world.py). */
(function () {
  "use strict";
  // theme modes (desk.css; the Day palette is warm paper with soft
  // graphite land, never the night globe inverted). The canvas cannot
  // read var(), so each colour is read from its token at draw time and
  // cached until the theme changes. The --pg-* tokens are the desk
  // page's own (events.html); a page that does not set them (the brief
  // card) gets the night or Day value here, by what is showing.
  var TKC = {};
  function dayShown() {
    if (typeof document === "undefined" || !document.documentElement) return false;           // node, in the tests
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "day") return true;
    return t === "system" && !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
  }
  function tk(name, night, day) {
    if (!(name in TKC)) {
      var v = "";
      try { v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch (e) {}
      TKC[name] = v || (dayShown() ? day : night);
    }
    return TKC[name];
  }
  function ta(name, night, day, a) { return "rgba(" + tk(name, night, day) + "," + a + ")"; }
  function retheme() { TKC = {}; }
  if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("qg-theme", retheme);
  var D2R = Math.PI / 180, TAU = Math.PI * 2;
  var RATE = 4 * D2R;           // idle turning, radians a second
  var RESUME_MS = 1500;         // turning resumes this long after a release
  var ZMIN = 1, ZMAX = 4;
  var PULSE_MS = 1200, PULSE_CAP = 500;
  var IDLE_FRAME_MS = 30;       // idle turning paints at about 30 fps
  var FLY_MS = 600;
  var VMAX = 1.5;               // radians a second: the fastest a flick keeps turning
  var DECAY = 0.2;              // seconds: inertia fades by e each 0.2 s, spent by about 600 ms
  var TAP_PX = 6, TAP_MS = 700;
  var PHI_MAX = 80 * D2R;
  var LAND_TILT = 20;           // the default view looks down from 20 degrees north
  var TIMES = 240;              // frames kept for the draw-time readout
  var LADDER_MS = 18;           // the degrade ladder steps down above this draw time a frame
  var LADDER_N = 12;            // averaged over this many painted frames
  var DESK_STEPS = ["dpr1.5", "dpr1", "halo", "grid", "borders"];
  var PHONE_STEPS = ["borders", "dpr1.5", "dpr1", "halo"];
  var TURN_DEG = 10, TURN_BIG = 30, KEY_ZOOM = 1.5;
  // the coast's levels of detail: full, then two simplified outlines (the
  // most a dropped vertex strays, as a chord on the unit sphere: about 0.2
  // and 0.5 degrees); a moving view takes the coarsest one that strays no
  // more than LOD_PX on screen
  var LOD_TOL = [0, 0.0035, 0.009], LOD_PX = 1.5;
  var RATES = [48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 280, 300, 360];
  var DEBUG_RE = /[?&](?:ft_)?debug=1(?:&|$)/;
  var READOUT_MS = 500;         // the debug readout writes twice a second

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function wrap(a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; }
  function now() { return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now(); }
  var raf = typeof requestAnimationFrame !== "undefined" ? function (f) { return requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(now()); }, 16); };
  var caf = typeof cancelAnimationFrame !== "undefined" ? function (h) { cancelAnimationFrame(h); } : function (h) { clearTimeout(h); };

  // ------------------------------------------------------------- the coast's levels of detail (pure)

  // the distance from vertex i to the chord a..b, all unit vectors in v (x, y, z)
  function chordDist(v, a, b, i) {
    var ax = v[a * 3], ay = v[a * 3 + 1], az = v[a * 3 + 2];
    var ux = v[b * 3] - ax, uy = v[b * 3 + 1] - ay, uz = v[b * 3 + 2] - az;
    var px = v[i * 3] - ax, py = v[i * 3 + 1] - ay, pz = v[i * 3 + 2] - az;
    var uu = ux * ux + uy * uy + uz * uz, t = uu > 1e-18 ? clamp((px * ux + py * uy + pz * uz) / uu, 0, 1) : 0;
    var dx = px - t * ux, dy = py - t * uy, dz = pz - t * uz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  // Douglas-Peucker on a closed ring of n unit vectors: the indices kept,
  // first and last always, so no dropped vertex strays more than tol from
  // the outline; a ring is never cut under four vertices
  function simplifyRing(v, n, tol) {
    var out = [], i;
    if (!(tol > 0) || n <= 4) { for (i = 0; i < n; i++) out.push(i); return out; }
    var keep = new Uint8Array(n), far = 0, fd = -1;
    for (i = 1; i < n - 1; i++) {
      var dx = v[i * 3] - v[0], dy = v[i * 3 + 1] - v[1], dz = v[i * 3 + 2] - v[2], d = dx * dx + dy * dy + dz * dz;
      if (d > fd) { fd = d; far = i; }
    }
    keep[0] = 1; keep[n - 1] = 1; keep[far] = 1;
    var stack = [0, far, far, n - 1];
    while (stack.length) {
      var b = stack.pop(), a = stack.pop(), best = -1, bi = -1;
      for (i = a + 1; i < b; i++) { var dd = chordDist(v, a, b, i); if (dd > best) { best = dd; bi = i; } }
      if (bi >= 0 && best > tol) { keep[bi] = 1; stack.push(a, bi, bi, b); }
    }
    for (i = 0; i < n; i++) { if (keep[i]) out.push(i); }
    if (out.length < 4) out = [0, Math.floor(n / 3), Math.floor(2 * n / 3), n - 1];
    return out;
  }
  // the level of detail for a paint: 0 at rest; while the view moves, the
  // coarsest level whose tolerance is under LOD_PX on screen. pxPerRad is
  // the screen length of one radian of arc at the view centre (the radius).
  function lodFor(pxPerRad, moving) {
    if (!moving) return 0;
    for (var k = LOD_TOL.length - 1; k > 0; k--) { if (LOD_TOL[k] * pxPerRad <= LOD_PX) return k; }
    return 0;
  }
  // the levels for a world of rings (setWorld's geo): [geo, level 1, level
  // 2], each one list per country of rings; a ring the simplification
  // cannot shorten is the same array as the level before
  function coastLods(geo) {
    var lods = [geo];
    for (var k = 1; k < LOD_TOL.length; k++) {
      var prev = lods[k - 1], lvl = [];
      for (var i = 0; i < geo.length; i++) {
        var rings = [];
        for (var r = 0; r < geo[i].length; r++) {
          var v = geo[i][r], n = v.length / 3, idx = simplifyRing(v, n, LOD_TOL[k]), m = idx.length;
          if (m >= n) { rings.push(prev[i][r]); continue; }
          var s = new Float64Array(m * 3);
          for (var j = 0; j < m; j++) { s[j * 3] = v[idx[j] * 3]; s[j * 3 + 1] = v[idx[j] * 3 + 1]; s[j * 3 + 2] = v[idx[j] * 3 + 2]; }
          rings.push(s.length < prev[i][r].length ? s : prev[i][r]);
        }
        lvl.push(rings);
      }
      lods.push(lvl);
    }
    return lods;
  }

  // ------------------------------------------------------------- the clock (pure)

  // a glide's step: the distance a velocity decaying by e every DECAY
  // seconds covers in dt seconds, as a share of that velocity, in closed
  // form, so the steps of any frame rate add up to the same glide
  function glideStep(dt) { return DECAY * (1 - Math.exp(-dt / DECAY)); }
  // the display's refresh rate from requestAnimationFrame intervals (ms):
  // the lower quartile, so a dropped frame does not halve it, snapped to a
  // common rate within 5%; 0 until there are enough intervals
  function detectRate(ints) {
    var ok = [], i;
    for (i = 0; i < (ints || []).length; i++) { if (ints[i] > 1.5 && ints[i] < 70) ok.push(ints[i]); }
    if (ok.length < 8) return 0;
    ok.sort(function (a, b) { return a - b; });
    var hz = 1000 / ok[Math.floor(ok.length / 4)];
    for (i = 0; i < RATES.length; i++) { if (Math.abs(hz - RATES[i]) / RATES[i] < 0.05) return RATES[i]; }
    return Math.round(hz);
  }
  // ?debug=1 (or ?ft_debug=1, the futuretest hub's) on the page's address
  function debugOn(opts) {
    if (opts && opts.debug != null) return !!opts.debug;
    try { return typeof location !== "undefined" && DEBUG_RE.test(String(location.search || "")); } catch (x) { return false; }
  }

  function Engine(opts) {
    var self = this;
    opts = opts || {};
    this.opts = opts;
    this.draw = opts.draw || function () {};
    this.reduced = opts.reduced || function () { return false; };
    this.grid = opts.grid || function () { return true; };
    this.wrapEl = opts.wrap || null;
    this.mode = "map";                    // "map", "globe" or "continent"
    this.lam = 20 * D2R; this.phi = LAND_TILT * D2R; this.zoom = 1;
    this.W = 0; this.H = 0; this.cx = 0; this.cy = 0; this.R = 1;
    this.cl = 1; this.sl = 0; this.cp = 1; this.sp = 0;
    this.geo = [];
    this.buf = new Float64Array(2 * 1024);
    this.P = {x: 0, y: 0, vis: false, d: 0};
    this.holds = {}; this.resumeAt = 0; this.spin = true;
    this.rafId = 0; this.last = 0; this.lastPaint = 0; this.dirty = false;
    this.vl = 0; this.vp = 0; this.fly = null;
    this.pulse = new PulseSystem(this);
    this.comet = new CometSystem(this);
    this.engaged = false; this.touched = false;
    this.hidden = typeof document !== "undefined" ? !!document.hidden : false;
    this.onscreen = true;
    this.times = []; this.ti = 0;
    this.presets = []; this.presetById = {}; this.presetId = null;
    this.drop = {}; this.dprCap = 2; this.win = []; this.ladderLog = [];
    this.lods = [this.geo]; this.lod = 0; this.coarse = false; this.dragging = false;
    this.dbg = null;
    this._tick = function (t) { self.tick(t); };
    // a still engine (the brief's globe, P11) paints once and never asks
    // for a frame: no loop, so nothing to stop or start again
    if (opts.still) return;
    // ?debug=1: the readout, a line on the page's own wrapper (the page
    // styles it by its class)
    if (debugOn(opts) && this.wrapEl && typeof document !== "undefined" && document.createElement) {
      var dEl = document.createElement("p");
      dEl.className = opts.debugClass || "globe-debug";
      dEl.setAttribute("aria-hidden", "true");
      dEl.textContent = "frame time: waiting for a frame";
      this.wrapEl.appendChild(dEl);
      this.dbg = {el: dEl, ints: [], t0: 0, n: 0, hz: 0};
    }
    // the loop stops when the tab is hidden and when the canvas scrolls off
    // screen, and starts again when either comes back
    if (typeof document !== "undefined" && document.addEventListener) {
      document.addEventListener("visibilitychange", function () {
        self.hidden = !!document.hidden;
        if (self.hidden) self.stop(); else self.kick();
      });
    }
    if (opts.canvas && typeof IntersectionObserver !== "undefined") {
      new IntersectionObserver(function (list) {
        var e = list[list.length - 1];
        self.onscreen = !!(e && e.isIntersecting);
        if (!self.onscreen) { self.stop(); self.engage(false); } else self.kick();
      }).observe(opts.canvas);
    }
  }

  // the pulse rings in flight (PulseSystem's), read and cleared as ever
  Object.defineProperty(Engine.prototype, "rings", {
    get: function () { return this.pulse.rings; },
    set: function (v) { this.pulse.rings = v || []; }
  });

  // the sphere is drawn: Globe or Continent (Map is the page's flat map)
  Engine.prototype.round = function () { return this.mode !== "map"; };

  // ------------------------------------------------------------- projection

  Engine.prototype.setWorld = function (list) {
    var geo = [], most = 0;
    for (var i = 0; i < list.length; i++) {
      var rings = list[i].rings || [], out = [];
      for (var k = 0; k < rings.length; k++) {
        var r = rings[k], n = r.length, v = new Float64Array(n * 3);
        for (var j = 0; j < n; j++) {
          var lo = r[j][0] * D2R, la = r[j][1] * D2R, c = Math.cos(la);
          v[j * 3] = c * Math.cos(lo); v[j * 3 + 1] = c * Math.sin(lo); v[j * 3 + 2] = Math.sin(la);
        }
        out.push(v);
        if (n > most) most = n;
      }
      geo.push(out);
    }
    this.geo = geo;
    this.lods = this.opts.still ? [geo] : coastLods(geo);   // a still globe is only ever drawn at rest
    this.lod = 0;
    if (this.buf.length < most * 2) this.buf = new Float64Array(most * 2);
  };

  // the frame for this paint: centre, radius and the rotation's sines, and
  // the coast's level of detail (coarse only in a paint the loop makes
  // while the view moves; any other paint is at rest, in full)
  Engine.prototype.frame = function (W, H) {
    this.W = W; this.H = H; this.cx = W / 2; this.cy = H / 2;
    this.R = Math.min(W, H) * 0.42 * this.zoom;
    this.cl = Math.cos(this.lam); this.sl = Math.sin(this.lam);
    this.cp = Math.cos(this.phi); this.sp = Math.sin(this.phi);
    this.lod = this.coarse && this.lods[1] ? lodFor(this.R, true) : 0;
  };

  // a unit vector to the screen. The view centre goes to +x: turn by the
  // centre's longitude about the pole, then by its latitude. Screen x is
  // the rotated y, screen y the rotated z; the point faces us when its
  // rotated x is positive. A point behind is pushed out to the rim.
  Engine.prototype.pv = function (x, y, z) {
    var x1 = x * this.cl + y * this.sl, y1 = -x * this.sl + y * this.cl;
    var xd = x1 * this.cp + z * this.sp, zd = -x1 * this.sp + z * this.cp;
    var P = this.P;
    P.d = xd; P.vis = xd > 0;
    if (P.vis) { P.x = this.cx + this.R * y1; P.y = this.cy - this.R * zd; }
    else {
      var r = Math.sqrt(y1 * y1 + zd * zd) || 1e-9;
      P.x = this.cx + this.R * y1 / r; P.y = this.cy - this.R * zd / r;
    }
    return P;
  };
  Engine.prototype.pt = function (lon, lat) {
    var la = lat * D2R, lo = lon * D2R, c = Math.cos(la);
    return this.pv(c * Math.cos(lo), c * Math.sin(lo), Math.sin(la));
  };
  // the screen back to [lon, lat], or null off the disc
  Engine.prototype.invert = function (sx, sy) {
    var Y = (sx - this.cx) / this.R, Z = -(sy - this.cy) / this.R, r2 = Y * Y + Z * Z;
    if (r2 > 1) return null;
    var X = Math.sqrt(1 - r2);
    var x1 = X * this.cp - Z * this.sp, z = X * this.sp + Z * this.cp;
    var x = x1 * this.cl - Y * this.sl, y = x1 * this.sl + Y * this.cl;
    return [Math.atan2(y, x) / D2R, Math.asin(clamp(z, -1, 1)) / D2R];
  };
  Engine.prototype.inDisc = function (sx, sy) {
    var dx = sx - this.cx, dy = sy - this.cy;
    return dx * dx + dy * dy <= this.R * this.R;
  };

  // country i as one Path2D in screen space, or null when all of it is
  // behind, at this paint's level of detail
  Engine.prototype.path = function (i) {
    var rings = ((this.lod && this.lods[this.lod]) || this.geo)[i]; if (!rings) return null;
    var path = null, buf = this.buf, cx = this.cx, cy = this.cy, R = this.R;
    var cl = this.cl, sl = this.sl, cp = this.cp, sp = this.sp;
    for (var k = 0; k < rings.length; k++) {
      var v = rings[k], n = v.length / 3, any = 0, j;
      for (j = 0; j < n; j++) {
        var x = v[j * 3], y = v[j * 3 + 1], z = v[j * 3 + 2];
        var x1 = x * cl + y * sl, y1 = -x * sl + y * cl;
        var xd = x1 * cp + z * sp, zd = -x1 * sp + z * cp;
        if (xd > 0) { buf[j * 2] = cx + R * y1; buf[j * 2 + 1] = cy - R * zd; any++; }
        else { var r = Math.sqrt(y1 * y1 + zd * zd) || 1e-9; buf[j * 2] = cx + R * y1 / r; buf[j * 2 + 1] = cy - R * zd / r; }
      }
      if (!any) continue;                 // a ring wholly behind adds nothing
      if (!path) path = new Path2D();
      path.moveTo(buf[0], buf[1]);
      for (j = 1; j < n; j++) path.lineTo(buf[j * 2], buf[j * 2 + 1]);
      path.closePath();
    }
    return path;
  };

  // ------------------------------------------------------------- painting

  Engine.prototype.backdrop = function (ctx) {
    var W = this.W, H = this.H, cx = this.cx, cy = this.cy, R = this.R;
    if (this.mode === "continent") {
      // the horizon hidden: the sea runs to the canvas edge, so a preset
      // reads as a regional map and not as a ball
      ctx.fillStyle = tk("--pg-globe-sea", "#0C111A", "#EEEAE1"); ctx.fillRect(0, 0, W, H);
      if (this.grid() && !this.drop.grid) this.graticule(ctx);
      return;
    }
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, tk("--pg-ocean-top", "#0B1019", "#EFEBE2")); g.addColorStop(1, tk("--bg", "#0A0D13", "#F5F2EB"));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (!this.drop.halo) {
      var glow = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 12);
      glow.addColorStop(0, ta("--pg-rule-rgb", "46,58,77", "120,112,98", ".25")); glow.addColorStop(1, ta("--pg-rule-rgb", "46,58,77", "120,112,98", "0"));
      ctx.beginPath(); ctx.arc(cx, cy, R + 12, 0, TAU); ctx.fillStyle = glow; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = tk("--pg-globe-sea", "#0C111A", "#EEEAE1"); ctx.fill();
    ctx.strokeStyle = ta("--pg-rule-rgb", "46,58,77", "120,112,98", ".6"); ctx.lineWidth = 1; ctx.stroke();
    if (this.grid() && !this.drop.grid) this.graticule(ctx);
  };
  // meridians and parallels every 30 degrees, sampled every 4 so they bend
  // with the sphere; the pen lifts behind the horizon
  Engine.prototype.graticule = function (ctx) {
    var lon, lat, p, pen;
    ctx.strokeStyle = ta("--pg-rule-rgb", "46,58,77", "120,112,98", ".35"); ctx.lineWidth = 1; ctx.beginPath();
    for (lon = -180; lon < 180; lon += 30) {
      pen = false;
      for (lat = -80; lat <= 80; lat += 4) { p = this.pt(lon, lat); if (p.vis) { if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); pen = true; } else pen = false; }
    }
    for (lat = -60; lat <= 60; lat += 30) {
      pen = false;
      for (lon = -180; lon <= 180; lon += 4) { p = this.pt(lon, lat); if (p.vis) { if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); pen = true; } else pen = false; }
    }
    ctx.stroke();
  };

  // ------------------------------------------------------------- the pulses (P2a, P4)

  // PulseSystem: the landing pulse, one ring per arriving event that grows
  // and fades over 1.2 s, then the page's steady dot. At most 500 rings are
  // kept (the oldest goes first). An event that started a house futuretest
  // (scorecard.house_started) shares its pulse with a cyan rim. Under
  // reduced motion nothing is added: arrivals are drawn still.
  function PulseSystem(engine) { this.E = engine; this.rings = []; }
  PulseSystem.prototype.land = function (lon, lat, col, delay, rim) {
    var E = this.E;
    if (E.reduced()) return;
    if (this.rings.length >= PULSE_CAP) this.rings.shift();
    var la = lat * D2R, lo = lon * D2R, c = Math.cos(la);
    this.rings.push({x: c * Math.cos(lo), y: c * Math.sin(lo), z: Math.sin(la), col: col || tk("--ink", "#E7ECF4", "#1A2130"), rim: rim || null,
                     t0: now() + (delay || 0)});
    E.kick();
  };
  PulseSystem.prototype.draw = function (ctx, t) {
    if (!this.rings.length) return;
    var E = this.E, keep = [], P = E.P, i;
    t = t == null ? now() : t;
    for (i = 0; i < this.rings.length; i++) {
      var q = this.rings[i], u = (t - q.t0) / PULSE_MS;
      if (u >= 1) continue;
      keep.push(q);
      if (u < 0) continue;
      E.pv(q.x, q.y, q.z); if (!P.vis) continue;
      var e = 1 - (1 - u) * (1 - u) * (1 - u), rad = 4 + 20 * e, d = Math.max(0.25, P.d);
      var ang = Math.atan2(P.y - E.cy, P.x - E.cx) + Math.PI / 2;
      ctx.globalAlpha = 0.9 * (1 - u); ctx.strokeStyle = q.col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(P.x, P.y, rad, rad * d, ang, 0, TAU); ctx.stroke();
      if (q.rim) {
        ctx.strokeStyle = q.rim; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(P.x, P.y, rad + 3, (rad + 3) * d, ang, 0, TAU); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    this.rings = keep;
  };
  Engine.prototype.land = function (lon, lat, col, delay, rim) { this.pulse.land(lon, lat, col, delay, rim); };
  Engine.prototype.pulses = function (ctx, t) { this.pulse.draw(ctx, t); };

  // ------------------------------------------------------------- the comets (P4)

  // What flies, planned from records the page already has. Every arc maps
  // to a record: the ripple's rings (world.ripple), the member's pins, a
  // restricted chokepoint's theater funds. An endpoint is always an event's
  // place, a pinned country, a chokepoint or the country of a country's
  // own fund, never anything else; nothing flies for a row with no place.
  // A tail takes the event's lens color, never the sign of a return: the
  // signed median is text in the label, beside the count of past cases.
  function unit(lon, lat) {
    var la = lat * D2R, lo = lon * D2R, c = Math.cos(la);
    return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)];
  }
  // the great-circle distance between two [lon, lat], in km
  function gcKm(a, b) {
    var p = unit(a[0], a[1]), q = unit(b[0], b[1]);
    return Math.acos(clamp(p[0] * q[0] + p[1] * q[1] + p[2] * q[2], -1, 1)) * 6371;
  }
  function signed(v) {
    if (v == null || isNaN(v)) return "no median";
    var n = v * 100; if (Math.abs(n) < 0.05) n = 0;
    return (n > 0 ? "+" : "") + n.toFixed(1) + "%";
  }
  function plural(n, one) { return n + " " + one + (n === 1 ? "" : "s"); }

  var RING_ORDER = ["origin", "region", "continent", "world"];
  var RING_NAME = {origin: "Its own fund", region: "Its region", continent: "Its continent", world: "The rest of the world"};
  // the ripple family: one arc per ring of world.ripple, in the order
  // origin, region, continent, world, from the event to the nearest country
  // whose own fund the ring reads (ring_countries, which never holds an
  // index). Its label carries the ring's median 5 sessions after the past
  // events of the kind and how many past cases there were. ev: {id, pos:
  // [lon, lat]}; r: the /api/world/ripple payload; points: {country: [lon,
  // lat]}; o: {color: the lens color, kind: the kind in words}.
  function rippleComets(ev, r, points, o) {
    o = o || {};
    if (!ev || !ev.pos || !r || !r.rings || !r.ring_countries) return [];
    var out = [], k = 0, kind = String(o.kind || "event").toLowerCase();
    RING_ORDER.forEach(function (ring) {
      var cs = (r.ring_countries[ring] || []).filter(function (c) { return !!(points && points[c]); });
      if (!cs.length) return;                  // no fund's country on the map: nothing flies
      var to = cs[0], best = Infinity;
      cs.forEach(function (c) { var d = gcKm(ev.pos, points[c]); if (d < best) { best = d; to = c; } });
      var rec = ((r.ring_record || {})[ring] || {})["5"] || null;
      var where = ring === "origin" ? r.country : (ring === "region" ? r.region : (ring === "continent" ? r.continent : ""));
      var m = rec ? rec.median : null;
      out.push({key: "ripple:" + ev.id + ":" + ring, family: "ripple", ring: ring, event: ev.id,
                from: ev.pos.slice(), to: points[to].slice(), target: to, order: k++,
                col: o.color || tk("--ink", "#E7ECF4", "#1A2130"), w: 1 + 2 * Math.min(1, Math.abs(m || 0) / 0.03),
                lines: [RING_NAME[ring] + (where ? " (" + where + ")" : "") + ": " + (m == null ? "no median yet" : signed(m) + " at 5 sessions"),
                        "after past " + kind + " events, " + plural(rec ? rec.n : 0, "past case")]});
    });
    return out;
  }
  // the pin family: from the event to each pinned country, in amber,
  // labelled with that country's pinned tickers; none to the event's own.
  // On the canvas the pin's own label at the tip is that label (the list
  // and the tip carry the comet's), so the ticker is never drawn twice.
  function pinComets(ev, pins, points) {
    if (!ev || !ev.pos) return [];
    var by = {}, order = [];
    (pins || []).forEach(function (p) {
      if (!p || !p.country || !points || !points[p.country]) return;
      if (!by[p.country]) { by[p.country] = []; order.push(p.country); }
      by[p.country].push(p.ticker);
    });
    return order.filter(function (c) { return c !== ev.country; }).map(function (c, i) {
      var t = by[c];
      return {key: "pin:" + ev.id + ":" + c, family: "pin", event: ev.id, from: ev.pos.slice(), to: points[c].slice(),
              target: c, order: RING_ORDER.length + i, col: tk("--amber", "#F0A83C", "#8F5200"), w: 1.4, onPin: true,
              lines: [t.slice(0, 3).join(" ") + (t.length > 3 ? " +" + (t.length - 3) : "")]};
    });
  }
  // the chokepoint family: from a restricted chokepoint (transits at or
  // under o.cut of their 90 day median, events.RESTRICTION) to the
  // countries of the country funds of the theater it sits in. presets:
  // world-centroids.json's, whose theater funds are [ticker, country]
  // through the inverse of COUNTRY_ETF, so an index, bond, dollar or sector
  // fund is never there; a $ ticker is refused here as well.
  function chokeComets(chokes, presets, points, o) {
    o = o || {};
    var cut = o.cut == null ? 0.5 : o.cut, out = [];
    (chokes || []).forEach(function (c) {
      if (!c || c.lat == null || c.lon == null || c.ratio == null || c.ratio > cut) return;
      var seen = {};
      (presets || []).forEach(function (p) {
        if (p.kind !== "theater" || (p.members || []).indexOf(c.country) < 0) return;
        (p.funds || []).forEach(function (f) {
          var t = f && f[0], country = f && f[1];
          if (!t || /^\$/.test(t) || !country || seen[country] || !points || !points[country]) return;
          seen[country] = 1;
          out.push({key: "choke:" + c.portid + ":" + country, family: "choke", choke: c.portid,
                    from: [c.lon, c.lat], to: points[country].slice(), target: country, order: out.length,
                    col: o.color || tk("--down", "#DF605E", "#B0302D"), w: 1.2, lines: [t]});
        });
      });
    });
    return out;
  }
  // your futuretests: one mark per country where a tracking futuretest
  // sits (scenario.countries_of: the scenario's country, or the what-if
  // id's), labelled with day k of N and the book beside the cone's median.
  // An armed one, or one with no place (the pandemic), draws nothing.
  function ftLine(f) {
    var k = f.sessions || 0, n = f.days || 63;
    return "day " + k + " of " + n + (f.now != null ? ", book " + signed(f.now) + ", cone median " + signed(f.median_now) : ", too early for a reading");
  }
  function ftMarks(fts, points) {
    var by = {}, order = [];
    (fts || []).forEach(function (f) {
      if (!f || f.status !== "tracking") return;
      (f.countries || []).forEach(function (c) {
        if (!points || !points[c]) return;
        if (!by[c]) { by[c] = []; order.push(c); }
        if (by[c].indexOf(f) < 0) by[c].push(f);
      });
    });
    return order.map(function (c) {
      var list = by[c], f = list[0];
      return {country: c, pos: points[c].slice(), fts: list,
              lines: [String(f.name || f.label || "Futuretest").slice(0, 30) + (list.length > 1 ? " +" + (list.length - 1) + " more" : ""), ftLine(f)]};
    });
  }

  var COMET_CAP = 24;           // comets kept at once; past it the oldest go, a fading one first
  var RING_MS = 420;            // one comet's flight: the ripple's own pace, a ring each 420 ms
  var FADE_MS = 900;            // a fresh arrival's comet fades this long after it lands
  var TRAIL = 12;               // points in a comet's tail
  var SAMPLES = 32;             // points along a whole arc
  var LIFT = 0.14;              // a long great circle's height at its middle, in globe radii
  function HEAD() { return ta("--ink-rgb", "231,236,244", "26,33,48", ".7"); }

  function slerp(a, b, ang, s) {
    var sa = Math.sin(ang);
    if (ang < 1e-6 || sa < 1e-6) {
      var x = a[0] + (b[0] - a[0]) * s, y = a[1] + (b[1] - a[1]) * s, z = a[2] + (b[2] - a[2]) * s, n = Math.sqrt(x * x + y * y + z * z) || 1;
      return [x / n, y / n, z / n];
    }
    var p = Math.sin((1 - s) * ang) / sa, q = Math.sin(s * ang) / sa;
    return [a[0] * p + b[0] * q, a[1] * p + b[1] * q, a[2] * p + b[2] * q];
  }
  // CometSystem: the comets in flight and landed, by group ("ripple",
  // "pin", "choke", "arrival"), at most 24
  function CometSystem(engine) { this.E = engine; this.list = []; }
  // one group's comets set to specs: a comet already there by its key keeps
  // its flight; a new one flies from now, its order a ring's time after
  // the first, or lands at once as a still arc when fly is false or under
  // reduced motion. A sticky comet stays once landed (a selected event's,
  // the chokepoints'); any other fades. A fresh arrival under reduced
  // motion is announced by the page and not flown.
  CometSystem.prototype.set = function (group, specs, fly, sticky) {
    var E = this.E, t = now(), keep = {}, have = {}, i;
    specs = specs || [];
    if (!sticky && E.reduced()) specs = [];
    for (i = 0; i < specs.length; i++) keep[specs[i].key] = 1;
    this.list = this.list.filter(function (c) {
      if (c.group !== group) return true;
      if (keep[c.key]) { have[c.key] = 1; return true; }
      return false;
    });
    var still = !fly || E.reduced();
    for (i = 0; i < specs.length; i++) {
      var s = specs[i];
      if (have[s.key] || !s.from || !s.to) continue;
      var a = unit(s.from[0], s.from[1]), b = unit(s.to[0], s.to[1]);
      this.list.push({key: s.key, group: group, s: s, a: a, b: b, sticky: !!sticky, dur: RING_MS,
                      ang: Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)),
                      t0: still ? -1e12 : t + (s.order || 0) * RING_MS});
    }
    while (this.list.length > COMET_CAP) {
      var drop = 0;
      for (i = 0; i < this.list.length; i++) { if (!this.list[i].sticky) { drop = i; break; } }
      this.list.splice(drop, 1);
    }
    E.dirty = true; E.kick();
  };
  CometSystem.prototype.clear = function (group) { this.set(group, [], false, true); };
  // anything still to fly, flying, or fading
  CometSystem.prototype.moving = function (t) {
    t = t == null ? now() : t;
    for (var i = 0; i < this.list.length; i++) {
      var c = this.list[i];
      if (t < c.t0 + c.dur + (c.sticky ? 0 : FADE_MS)) return true;
    }
    return false;
  };
  CometSystem.prototype.inFlight = function (t) {
    t = t == null ? now() : t;
    return this.list.filter(function (c) { return t >= c.t0 && t < c.t0 + c.dur; }).length;
  };
  // the arc from its start to the fraction head, as [x, y, shown] points.
  // On the Globe: the great circle, lifted toward its middle (a lifted
  // point beyond the limb stays in sight), in SAMPLES steps. On the Map
  // and in the Continent view: a planar curve bowed upward between the two
  // places place() gives, or null when either is out of the view.
  CometSystem.prototype.path = function (c, head, globe, place) {
    var E = this.E, n = Math.max(2, Math.ceil(SAMPLES * head) + 1), out = [], k;
    if (globe) {
      var lift = LIFT * Math.min(1, c.ang / 0.6);
      for (k = 0; k < n; k++) {
        var s = head * k / (n - 1), v = slerp(c.a, c.b, c.ang, s), h = 1 + lift * Math.sin(Math.PI * s);
        out.push(E.pvFree(v[0] * h, v[1] * h, v[2] * h));
      }
      return out;
    }
    var p0 = place(c.s.from[0], c.s.from[1]), p1 = place(c.s.to[0], c.s.to[1]);
    if (!p0 || !p1) return null;
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.sqrt(dx * dx + dy * dy);
    var nx = len ? -dy / len : 0, ny = len ? dx / len : -1;
    if (ny > 0) { nx = -nx; ny = -ny; }                  // bow upward on the screen
    var qx = (p0[0] + p1[0]) / 2 + nx * 0.22 * len, qy = (p0[1] + p1[1]) / 2 + ny * 0.22 * len;
    for (k = 0; k < n; k++) {
      var u = head * k / (n - 1), a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
      out.push([a * p0[0] + b * qx + d * p1[0], a * p0[1] + b * qy + d * p1[1], true]);
    }
    return out;
  };
  function strokeRun(ctx, pts, from, to) {
    var pen = false;
    ctx.beginPath();
    for (var k = Math.max(0, from); k <= to; k++) {
      var p = pts[k];
      if (!p[2]) { pen = false; continue; }
      if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      pen = true;
    }
    ctx.stroke();
  }
  // every comet on ctx; returns the labels drawn, [{x, y, w, h, comet}],
  // for the page's hit test. place(lon, lat) is the page's (the flat map,
  // or the Continent view's frame). taken: label boxes already on the
  // canvas (freeSpot). phone: only the last comet to land is labelled
  // (the list carries the rest).
  CometSystem.prototype.draw = function (ctx, place, t, taken, phone) {
    var E = this.E, out = [], globe = E.mode === "globe", landed = [], i;
    t = t == null ? now() : t;
    var list = this.list.filter(function (c) { return c.sticky || t < c.t0 + c.dur + FADE_MS; });
    this.list = list;
    if (!list.length) return out;
    for (i = 0; i < list.length; i++) {
      var c = list[i], u = (t - c.t0) / c.dur;
      if (u < 0) continue;
      var head = Math.min(1, u), fade = c.sticky || u <= 1 ? 1 : Math.max(0, 1 - (t - c.t0 - c.dur) / FADE_MS);
      var pts = this.path(c, head, globe, place);
      if (!pts || !pts.length) continue;
      var tip = pts[pts.length - 1], col = c.s.col, w = c.s.w || 1.2, n = pts.length;
      var dx = pts[n - 1][0] - pts[0][0], dy = pts[n - 1][1] - pts[0][1];
      ctx.strokeStyle = col; ctx.lineWidth = w;
      if (u >= 1 && dx * dx + dy * dy < 16) {
        // an arc to its own place (an event in the country whose fund it
        // is): a still ring around it instead
        if (tip[2]) { ctx.globalAlpha = 0.8 * fade; ctx.beginPath(); ctx.arc(tip[0], tip[1], 10, 0, TAU); ctx.stroke(); }
      } else {
        ctx.globalAlpha = (u >= 1 ? 0.55 : 0.3) * fade;
        strokeRun(ctx, pts, 0, n - 1);
        if (u < 1) {
          // the tail: the last points behind the head, brighter, then the head
          ctx.globalAlpha = 0.95; ctx.lineWidth = w + 0.6;
          strokeRun(ctx, pts, n - TRAIL, n - 1);
          if (tip[2]) {
            ctx.globalAlpha = 0.35; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tip[0], tip[1], 5, 0, TAU); ctx.fill();
            ctx.globalAlpha = 1; ctx.fillStyle = HEAD(); ctx.beginPath(); ctx.arc(tip[0], tip[1], 2.4, 0, TAU); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (u >= 1 && tip[2]) landed.push({c: c, x: tip[0], y: tip[1], fade: fade});
    }
    if (phone && landed.length > 1) {
      var last = landed[0];
      landed.forEach(function (x) { if (x.c.t0 >= last.c.t0) last = x; });
      landed = [last];
    }
    taken = taken || [];
    ctx.font = "10px Cascadia Mono, Consolas, Cascadia Mono Web, monospace";
    landed.forEach(function (x) {
      var lines = x.c.s.lines || [], wmax = 0;
      if (!lines.length || x.c.s.onPin) return;
      lines.forEach(function (s) { wmax = Math.max(wmax, ctx.measureText(s).width); });
      var bw = wmax + 8, bh = 12 * lines.length + 4;
      var at = freeSpot(taken, x.x, x.y, 5, bw, bh, x.c.key);
      if (!at) return;
      ctx.globalAlpha = x.fade;
      ctx.fillStyle = ta("--pg-bg-rgb", "10,13,19", "245,242,235", ".85"); ctx.fillRect(at.x, at.y, bw, bh);
      lines.forEach(function (s, k) {
        ctx.fillStyle = k ? tk("--pg-old-muted", "#8B96A8", "#4E5767") : (x.c.s.family === "pin" ? tk("--amber", "#F0A83C", "#8F5200") : tk("--ink", "#E7ECF4", "#1A2130"));
        ctx.fillText(s, at.x + 4, at.y + 12 + 12 * k);
      });
      ctx.globalAlpha = 1;
      out.push({x: at.x, y: at.y, w: bw, h: bh, comet: x.c.s});
    });
    return out;
  };
  // a point with no push to the rim: [x, y, shown], where a point lifted
  // above the sphere is shown beyond the limb too
  Engine.prototype.pvFree = function (x, y, z) {
    var x1 = x * this.cl + y * this.sl, y1 = -x * this.sl + y * this.cl;
    var xd = x1 * this.cp + z * this.sp, zd = -x1 * this.sp + z * this.cp;
    return [this.cx + this.R * y1, this.cy - this.R * zd, xd > 0 || y1 * y1 + zd * zd > 1];
  };
  Engine.prototype.comets = function (group, specs, fly, sticky) { this.comet.set(group, specs, fly, sticky); };
  Engine.prototype.drawComets = function (ctx, place, taken, phone) { return this.comet.draw(ctx, place, null, taken, phone); };

  // ------------------------------------------------------------- motion

  Engine.prototype.setMode = function (m) {
    this.mode = m === "globe" || m === "continent" ? m : "map";
    this.vl = this.vp = 0; this.fly = null;
    if (this.mode === "map") { this.stop(); this.rings = []; this.engage(false); }
    this.kick();                                  // comets still in flight carry on in any view
  };
  Engine.prototype.jump = function (lon, lat) {
    this.lam = wrap(lon * D2R); this.phi = clamp(lat, -60, 70) * D2R;
    this.vl = this.vp = 0; this.fly = null; this.dirty = true; this.kick();
  };
  // an eased fly to a place, and to a zoom when one is given; done runs
  // when it lands (at once under reduced motion, which jumps)
  Engine.prototype.flyTo = function (lon, lat, zoom, done) {
    if (!this.round()) return;
    var tl = wrap(lon * D2R), tp = clamp(lat, -60, 70) * D2R;
    var tz = zoom == null ? this.zoom : clamp(zoom, ZMIN, ZMAX);
    if (this.reduced()) { this.jump(lon, lat); this.zoom = tz; if (done) done(); return; }
    this.vl = this.vp = 0;
    this.fly = {l0: this.lam, p0: this.phi, z0: this.zoom, dl: wrap(tl - this.lam), dp: tp - this.phi,
                dz: tz - this.zoom, t0: now(), done: done || null};
    this.kick();
  };
  // where the view looks now, as [lon, lat]
  Engine.prototype.centre = function () {
    return [wrap(this.lam) / D2R, this.phi / D2R];
  };
  // the keyboard's turn: the view moves dl degrees east and dp north, and
  // the idle turning waits its 1.5 s, as after a release
  Engine.prototype.turnBy = function (dl, dp) {
    if (!this.round()) return false;
    this.touched = true; this.vl = this.vp = 0; this.fly = null;
    this.lam = wrap(this.lam + dl * D2R); this.phi = clamp(this.phi + dp * D2R, -PHI_MAX, PHI_MAX);
    this.hold("key", true); this.hold("key", false);
    this.dirty = true; this.kick();
    return true;
  };
  Engine.prototype.zoomAt = function (f, sx, sy) {
    var z = clamp(this.zoom * f, ZMIN, ZMAX);
    if (z === this.zoom) return false;
    var before = sx == null ? null : this.invert(sx, sy);
    this.zoom = z; this.frame(this.W, this.H);
    // keep the place under the pointer under the pointer: two small
    // corrections of the centre converge on it
    for (var i = 0; before && i < 2; i++) {
      var after = this.invert(sx, sy); if (!after) break;
      this.lam = wrap(this.lam + (before[0] - after[0]) * D2R);
      this.phi = clamp(this.phi + (before[1] - after[1]) * D2R, -PHI_MAX, PHI_MAX);
      this.frame(this.W, this.H);
    }
    this.dirty = true; this.kick();
    return true;
  };
  Engine.prototype.hold = function (name, on) {
    var was = !!this.holds[name];
    this.holds[name] = !!on;
    if (was && !on) this.resumeAt = now() + RESUME_MS;
    this.kick();
  };
  Engine.prototype.held = function () {
    for (var k in this.holds) { if (this.holds[k]) return true; }
    return false;
  };
  Engine.prototype.setSpin = function (on) { this.spin = !!on; if (on) this.resumeAt = 0; this.kick(); };
  // turning now: the Globe view (a Continent preset stands still), on, not
  // reduced, nothing holding it, the resume delay over
  Engine.prototype.turning = function (t) {
    return this.mode === "globe" && this.spin && !this.reduced() && !this.fly && !this.held() && t >= this.resumeAt;
  };
  // the view itself moving: a fly, a glide, a drag or a pinch, or the idle
  // turn. Its paints take the coarse coast.
  Engine.prototype.moving = function (t) {
    if (!this.round()) return false;
    return !!(this.fly || this.dragging || this.vl || this.vp || this.turning(t == null ? now() : t));
  };
  // whether the loop has anything to do. A glide waits for the release (the
  // finger moves the view itself while it is down), and a view last painted
  // with the coarse coast wants one more paint, in full, at rest.
  Engine.prototype.wants = function () {
    if (this.opts.still || this.hidden || !this.onscreen) return false;
    if (this.comet.moving()) return true;         // a comet flies on the flat map too (P4)
    if (!this.round()) return false;
    if (this.dirty || this.fly || this.rings.length || this.lod > 0 || ((this.vl || this.vp) && !this.dragging)) return true;
    return this.mode === "globe" && this.spin && !this.reduced() && !this.held();
  };
  Engine.prototype.kick = function () {
    if (!this.rafId && this.wants()) { this.last = 0; this.rafId = raf(this._tick); }
  };
  Engine.prototype.stop = function () { if (this.rafId) { caf(this.rafId); this.rafId = 0; } };
  Engine.prototype.tick = function (t) {
    this.rafId = 0;
    if (this.hidden || !this.onscreen) return;
    if (!this.round()) {
      // the flat map moves for nothing but its comets
      if (this.comet.moving(t)) { this.paint(t); this.rafId = raf(this._tick); }
      return;
    }
    // an interval counts for the readout only between two frames of one
    // running loop (kick starts a loop with last at 0), so it reads vsyncs
    if (this.dbg && this.last) { this.dbg.ints.push(t - this.last); if (this.dbg.ints.length > TIMES) this.dbg.ints.shift(); }
    var dt = this.last ? Math.min(0.1, Math.max(0, (t - this.last) / 1000)) : 0;
    this.last = t;
    var paint = this.dirty; this.dirty = false;
    if (this.fly) {
      var F = this.fly, u = Math.min(1, (t - F.t0) / FLY_MS), e = 1 - Math.pow(1 - u, 3);
      this.lam = wrap(F.l0 + F.dl * e); this.phi = F.p0 + F.dp * e;
      this.zoom = F.z0 + F.dz * e;
      if (u >= 1) { this.fly = null; if (F.done) F.done(); }
      paint = true;
    } else if ((this.vl || this.vp) && !this.dragging) {
      // the glide after a release, each step in closed form (glideStep)
      var s = glideStep(dt), k = Math.exp(-dt / DECAY);
      this.lam = wrap(this.lam + this.vl * s); this.phi = clamp(this.phi + this.vp * s, -PHI_MAX, PHI_MAX);
      this.vl *= k; this.vp *= k;
      if (Math.abs(this.vl) + Math.abs(this.vp) < 0.02) { this.vl = 0; this.vp = 0; }
      paint = true;
    } else if (this.turning(t)) {
      this.lam = wrap(this.lam - RATE * dt);   // the way the earth turns: the view drifts west
      if (t - this.lastPaint >= IDLE_FRAME_MS) paint = true;
    }
    var mv = this.moving(t);
    if (!mv && this.lod > 0) paint = true;      // at rest again: the coast in full
    if (this.rings.length || this.comet.moving(t)) paint = true;
    if (paint) { this.coarse = mv; this.paint(t); this.coarse = false; }
    var go = this.wants();
    if (this.dbg) this.readout(t, go);
    if (go) this.rafId = raf(this._tick);
  };
  Engine.prototype.paint = function (t) {
    var a = now();
    this.draw();
    var ms = now() - a;
    this.lastPaint = t == null ? a : t;
    if (this.times.length < TIMES) this.times.push(ms); else { this.times[this.ti] = ms; this.ti = (this.ti + 1) % TIMES; }
    if (this.dbg) this.dbg.n++;
    this.measure(ms);
  };
  // the ?debug=1 readout, twice a second while the loop runs and once when
  // it stops: the draw work per painted frame (the mean and p95 of the
  // last few seconds), the frames drawn a second, and the display's rate
  // with its budget a frame
  Engine.prototype.readout = function (t, go) {
    var d = this.dbg;
    if (!d.t0) { d.t0 = t; d.n = 0; if (go) return; }
    if (go && t - d.t0 < READOUT_MS) return;
    var s = this.stats();
    d.hz = detectRate(d.ints) || d.hz;
    var work = s.n ? s.avg.toFixed(2) + " ms a frame (p95 " + s.p95.toFixed(2) + ")" : "no frame drawn yet";
    var rate = d.hz ? "display " + d.hz + " Hz, budget " + (1000 / d.hz).toFixed(1) + " ms" : "display rate not read yet";
    d.el.textContent = go && t > d.t0 ?
      work + ", " + Math.round(d.n * 1000 / (t - d.t0)) + " fps drawn; " + rate :
      "idle, no redraw; last frames " + work + "; " + rate;
    d.t0 = go ? t : 0; d.n = 0;
  };
  // the draw work per painted frame over the last few seconds, in ms
  Engine.prototype.stats = function () {
    var s = this.times.slice().sort(function (a, b) { return a - b; }), n = s.length;
    if (!n) return {n: 0};
    var sum = 0; for (var i = 0; i < n; i++) sum += s[i];
    return {n: n, avg: sum / n, p95: s[Math.min(n - 1, Math.floor(n * 0.95))], max: s[n - 1], level: this.ladderLog.length};
  };

  // ------------------------------------------------------------- the degrade ladder (P2b)

  // every LADDER_N painted frames on the sphere, if the draw work averaged
  // over LADDER_MS, one rung down; never back up in the same visit
  Engine.prototype.measure = function (ms) {
    if (!this.round()) return;
    this.win.push(ms);
    if (this.win.length < LADDER_N) return;
    var sum = 0; for (var i = 0; i < this.win.length; i++) sum += this.win[i];
    this.win = [];
    if (sum / LADDER_N > LADDER_MS) this.degrade(sum / LADDER_N);
  };
  // the next rung: on a desktop the pixel ratio to 1.5, then 1, then the
  // limb glow, the graticule and the borders; on a phone the borders
  // first. A pixel ratio rung the screen is already under is passed over.
  Engine.prototype.degrade = function (avg) {
    var phone = !!(this.opts.phone && this.opts.phone()), dpr = this.opts.dpr || 1;
    var steps = phone ? PHONE_STEPS : DESK_STEPS, step = null, i;
    for (i = 0; i < steps.length; i++) {
      var s = steps[i], cap = Math.min(dpr, this.dprCap);
      if (this.drop[s]) continue;
      if ((s === "dpr1.5" && cap <= 1.5) || (s === "dpr1" && cap <= 1)) { this.drop[s] = true; continue; }
      step = s; break;
    }
    if (!step) return null;
    this.drop[step] = true;
    if (step === "dpr1.5") this.dprCap = 1.5;
    if (step === "dpr1") this.dprCap = 1;
    var line = "globe: draw work " + avg.toFixed(1) + " ms a frame, over " + LADDER_MS + " ms: dropped " + step;
    this.ladderLog.push(line);
    if (this.opts.log) this.opts.log(line);
    if (this.opts.onDegrade) this.opts.onDegrade(step, avg);
    this.dirty = true; this.kick();
    return step;
  };

  // ------------------------------------------------------------- the Continent view (P3)

  // the centre and zoom that frame these points ([lon, lat] each) on a W by
  // H canvas. The centre starts at their mean direction and moves twice to
  // the middle of their projected box; the zoom is the largest, from 1x to
  // 4x, that keeps every point clear of the edge by a margin, with about
  // 3.4 degrees of arc added around each point for the country around it.
  function fitView(pts, W, H) {
    var vs = [], sx = 0, sy = 0, sz = 0, i;
    for (i = 0; i < pts.length; i++) {
      if (!pts[i]) continue;
      var la = pts[i][1] * D2R, lo = pts[i][0] * D2R, c = Math.cos(la);
      var v = [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)];
      vs.push(v); sx += v[0]; sy += v[1]; sz += v[2];
    }
    if (!vs.length || !W || !H) return null;
    var n = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
    var lam = Math.atan2(sy, sx), phi = Math.asin(clamp(sz / n, -1, 1));
    function view() {
      var cl = Math.cos(lam), sl = Math.sin(lam), cp = Math.cos(phi), sp = Math.sin(phi), out = [];
      for (var k = 0; k < vs.length; k++) {
        var x = vs[k][0], y = vs[k][1], z = vs[k][2];
        var x1 = x * cl + y * sl, y1 = -x * sl + y * cl;
        out.push([x1 * cp + z * sp, y1, -x1 * sp + z * cp]);
      }
      return out;
    }
    for (var it = 0; it < 2; it++) {
      var o = view(), y0 = 1, y9 = -1, z0 = 1, z9 = -1;
      for (i = 0; i < o.length; i++) {
        y0 = Math.min(y0, o[i][1]); y9 = Math.max(y9, o[i][1]); z0 = Math.min(z0, o[i][2]); z9 = Math.max(z9, o[i][2]);
      }
      // the middle of the box back to a direction, as Engine.invert does
      var my = (y0 + y9) / 2, mz = (z0 + z9) / 2, X = Math.sqrt(Math.max(0, 1 - my * my - mz * mz));
      var cl = Math.cos(lam), sl = Math.sin(lam), cp = Math.cos(phi), sp = Math.sin(phi);
      var x1 = X * cp - mz * sp, zz = X * sp + mz * cp;
      lam = Math.atan2(x1 * sl + my * cl, x1 * cl - my * sl); phi = Math.asin(clamp(zz, -1, 1));
    }
    phi = clamp(phi, -60 * D2R, 70 * D2R);
    var o2 = view(), base = 0.42 * Math.min(W, H), padX = Math.max(14, W * 0.06), padY = Math.max(14, H * 0.08), best = Infinity;
    for (i = 0; i < o2.length; i++) {
      if (o2[i][0] <= 0.05) { best = base; break; }              // over the horizon: the whole globe it is
      best = Math.min(best, (W / 2 - padX) / (Math.abs(o2[i][1]) + 0.06), (H / 2 - padY) / (Math.abs(o2[i][2]) + 0.06));
    }
    return {lon: lam / D2R, lat: phi / D2R, zoom: clamp(best / base, ZMIN, ZMAX)};
  }
  // a view ({lon, lat, zoom}, as fitView gives) on a W by H canvas as a
  // function from [lon, lat] to the screen, or null behind the horizon:
  // the page asks it what a preset frames without moving the globe
  function projector(v, W, H) {
    var lam = v.lon * D2R, phi = v.lat * D2R, R = 0.42 * Math.min(W, H) * v.zoom;
    var cl = Math.cos(lam), sl = Math.sin(lam), cp = Math.cos(phi), sp = Math.sin(phi);
    return function (lon, lat) {
      var la = lat * D2R, lo = lon * D2R, c = Math.cos(la), x = c * Math.cos(lo), y = c * Math.sin(lo), z = Math.sin(la);
      var x1 = x * cl + y * sl, y1 = -x * sl + y * cl;
      if (x1 * cp + z * sp <= 0) return null;
      return [W / 2 + R * y1, H / 2 - R * (-x1 * sp + z * cp)];
    };
  }
  // the presets (world-centroids.json "presets") and the country points
  // their frames come from; a member the map has no point for is left out
  Engine.prototype.setPresets = function (list, points) {
    var out = [], by = {};
    (list || []).forEach(function (p) {
      var pts = (p.members || []).map(function (m) { return points && points[m]; }).filter(function (q) { return !!q; });
      if (!p.id || !pts.length) return;
      var q = {id: p.id, kind: p.kind, label: p.label, short: p.short || p.label, members: (p.members || []).slice(), pts: pts};
      out.push(q); by[p.id] = q;
    });
    this.presets = out; this.presetById = by;
  };
  Engine.prototype.preset = function (id) { return this.presetById[id] || null; };
  // a preset's frame on this canvas (it depends on the canvas's shape)
  Engine.prototype.presetView = function (id, W, H) {
    var p = this.presetById[id];
    return p ? fitView(p.pts, W || this.W, H || this.H) : null;
  };

  // ------------------------------------------------------------- the phone's engage model

  Engine.prototype.engage = function (on) {
    on = !!on && this.round();
    if (on === this.engaged) return;
    this.engaged = on;
    if (this.wrapEl) this.wrapEl.classList.toggle("engaged", on);
    if (this.opts.onEngage) this.opts.onEngage(on);
  };

  // ------------------------------------------------------------- pointer input

  // h: {hover(ev), leave(), tap(ev, kind)}; kind is "mouse" or "touch"
  Engine.prototype.bind = function (canvas, h) {
    var self = this, pts = {}, n = 0, start = null, moved = false, pinch = null, pinched = false, lastT = 0, samples = [];
    function scale() {
      var r = canvas.getBoundingClientRect();
      return {r: r, k: (self.W || r.width) / (r.width || 1)};
    }
    function local(ev) { var s = scale(); return [(ev.clientX - s.r.left) * s.k, (ev.clientY - s.r.top) * s.k, s.k]; }
    function spread() {
      var ids = Object.keys(pts); if (ids.length < 2) return null;
      var a = pts[ids[0]], b = pts[ids[1]], dx = a.x - b.x, dy = a.y - b.y;
      return {d: Math.sqrt(dx * dx + dy * dy) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
    }
    canvas.addEventListener("pointerdown", function (ev) {
      pts[ev.pointerId] = {x: ev.clientX, y: ev.clientY, t: now()};
      n = Object.keys(pts).length;
      if (n === 1) {
        start = {x: ev.clientX, y: ev.clientY, t: now(), kind: ev.pointerType === "touch" ? "touch" : "mouse"};
        moved = false; pinched = false; lastT = now(); samples = [];
        self.vl = self.vp = 0; self.fly = null;
      } else if (n === 2 && self.round()) { pinch = spread(); pinched = true; }
      self.touched = true;
      self.hold("press", true);
      if (self.round() && (ev.pointerType !== "touch" || self.engaged)) {
        try { canvas.setPointerCapture(ev.pointerId); } catch (x) {}
      }
    });
    canvas.addEventListener("pointermove", function (ev) {
      var p = pts[ev.pointerId], flat = !self.round();
      // a mouse already resting on the canvas when the page loaded never
      // sent pointerenter: its first move holds the turning too
      if (ev.pointerType === "mouse" && !self.holds.hover) self.hold("hover", true);
      // a mouse over the flat map hovers pressed or not, as it always did
      if (!p || (flat && ev.pointerType !== "touch")) { if (ev.pointerType !== "touch") h.hover(ev); if (!p) return; }
      var dx = ev.clientX - p.x, dy = ev.clientY - p.y, t = now(), tp = p.t;
      p.x = ev.clientX; p.y = ev.clientY; p.t = t;
      if (start && !moved && Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) > TAP_PX) {
        moved = true;
        if (!flat || ev.pointerType === "touch") h.leave();
      }
      if (flat) return;                           // the flat map does not turn
      if (n >= 2 && pinch) {
        var s = spread(); if (!s) return;
        var q = local({clientX: s.x, clientY: s.y});
        self.dragging = true;
        self.zoomAt(s.d / pinch.d, q[0], q[1]);
        self.lam = wrap(self.lam - (s.x - pinch.x) * q[2] / self.R);
        self.phi = clamp(self.phi + (s.y - pinch.y) * q[2] / self.R, -PHI_MAX, PHI_MAX);
        pinch = s; self.dirty = true; self.kick();
        return;
      }
      if (!moved) return;
      self.dragging = true;                       // the finger moves the view: no glide until the release
      var k = scale().k, free = ev.pointerType !== "touch" || self.engaged;
      var dl = -dx * k / self.R, dp = free ? dy * k / self.R : 0;
      self.lam = wrap(self.lam + dl); self.phi = clamp(self.phi + dp, -PHI_MAX, PHI_MAX);
      // the release speed: the finger's own over its last 100 ms, by the
      // events' own times (no event rate is assumed), and capped: a flick
      // carries on at most about 17 degrees past the finger
      if (!samples.length) samples.push([tp, 0, 0]);
      samples.push([t, dl, dp]);
      while (samples.length > 2 && t - samples[1][0] >= 100) samples.shift();
      var span = (t - samples[0][0]) / 1000, sl = 0, sp = 0;
      for (var i = 1; i < samples.length; i++) { sl += samples[i][1]; sp += samples[i][2]; }
      if (span > 0) { self.vl = clamp(sl / span, -VMAX, VMAX); self.vp = clamp(sp / span, -VMAX, VMAX); }
      lastT = t;
      self.dirty = true; self.kick();
    });
    function up(ev, cancel) {
      if (!pts[ev.pointerId]) return;
      delete pts[ev.pointerId];
      n = Object.keys(pts).length;
      if (n >= 2) { pinch = spread(); return; }
      pinch = null;
      if (n > 0) return;
      var t = now(), kind = start ? start.kind : "mouse";
      // a mouse on the flat map clicks as it always did, moved or not;
      // anywhere else a tap is short and still
      var tap = !cancel && !!start && !pinched &&
                ((kind === "mouse" && !self.round()) || (!moved && t - start.t < TAP_MS));
      // a flick keeps turning a little; a drag that stopped before release does not
      if (!moved || pinched || self.reduced() || t - lastT > 90) { self.vl = 0; self.vp = 0; }
      start = null; samples = [];
      self.dragging = false;                      // the glide, if any, starts now
      self.hold("press", false);
      if (tap) h.tap(ev, kind);
    }
    canvas.addEventListener("pointerup", function (ev) { up(ev, false); });
    canvas.addEventListener("pointercancel", function (ev) { up(ev, true); });
    canvas.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") self.hold("hover", true); });
    canvas.addEventListener("pointerleave", function (ev) {
      if (ev.pointerType === "touch") return;
      self.hold("hover", false);
      if (!start) h.leave();
    });
    canvas.addEventListener("wheel", function (ev) {
      if (!self.round()) return;                  // the page scrolls over the flat map, as it always has
      var q = local(ev);
      // zoom while there is room to; at 1x a scroll down carries on down the page
      if (self.zoomAt(Math.exp(-ev.deltaY * 0.0015), q[0], q[1])) { ev.preventDefault(); self.touched = true; }
    }, {passive: false});
  };

  // ------------------------------------------------------------- the keyboard (P2b)

  // one key, as the desk reads it, or null for a key the globe leaves to
  // the page. Every drag and pinch has a key here or a button beside it
  // (WCAG 2.5.1).
  function keyAction(key, shift) {
    var d = shift ? TURN_BIG : TURN_DEG;
    switch (key) {
      case "ArrowLeft": return {act: "turn", dl: -d, dp: 0};
      case "ArrowRight": return {act: "turn", dl: d, dp: 0};
      case "ArrowUp": return {act: "turn", dl: 0, dp: d};
      case "ArrowDown": return {act: "turn", dl: 0, dp: -d};
      case "+": case "=": return {act: "zoom", f: KEY_ZOOM};
      case "-": case "_": return {act: "zoom", f: 1 / KEY_ZOOM};
      case "Home": return {act: "home"};
      case " ": case "Spacebar": return {act: "spin"};
      case "]": return {act: "step", dir: 1};
      case "[": return {act: "step", dir: -1};
      case "Enter": return {act: "open"};
      case "Escape": case "Esc": return {act: "escape"};
      case "1": return {act: "view", view: "map"};
      case "2": return {act: "view", view: "globe"};
      case "3": return {act: "view", view: "continent"};
    }
    return null;
  }
  // the wrapper takes the keys while it has the focus itself (a button
  // inside it keeps its own). h: {spin(), home(), step(dir), open(),
  // escape(), view(name), turned(), zoomed()}; each returns false for a
  // key it did not use, so the page keeps it (an arrow scrolls the page
  // over the flat map).
  Engine.prototype.keys = function (el, h) {
    var self = this;
    el.addEventListener("keydown", function (ev) {
      if (ev.target !== el || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (self.handleKey(ev.key, ev.shiftKey, h)) ev.preventDefault();
    });
  };
  Engine.prototype.handleKey = function (key, shift, h) {
    var a = keyAction(key, shift);
    if (!a) return false;
    switch (a.act) {
      case "turn":
        if (!this.turnBy(a.dl, a.dp)) return false;
        if (h.turned) h.turned();
        return true;
      case "zoom":
        if (!this.round()) return false;
        this.touched = true;
        this.zoomAt(a.f);
        if (h.zoomed) h.zoomed();
        return true;
      case "spin":
        if (this.mode !== "globe") return false;
        this.setSpin(!this.spin);
        if (h.spin) h.spin(this.spin);
        return true;
      case "home": return h.home ? h.home() !== false : false;
      case "step": return h.step ? h.step(a.dir) !== false : false;
      case "open": return h.open ? h.open() !== false : false;
      case "escape": return h.escape ? h.escape() !== false : false;
      case "view": return h.view ? h.view(a.view) !== false : false;
    }
    return false;
  };

  // ------------------------------------------------------------- the live region (P2b)

  // a polite live region: each line once (the same line again within a
  // second is dropped), cleared first so a repeat later is read again
  function Live(el) { this.el = el; this.last = ""; this.t = -1e9; this.said = []; }
  Live.prototype.say = function (text) {
    if (!this.el || !text) return;
    var t = now(), el = this.el;
    if (text === this.last && t - this.t < 1000) return;
    this.last = text; this.t = t; this.said.push(text);
    if (this.said.length > 20) this.said.shift();
    el.textContent = "";
    setTimeout(function () { el.textContent = text; }, 40);
  };

  // ------------------------------------------------------------- the globe as a list (P2b)

  // one row per country from the events the page draws (and the
  // chokepoints and pins it draws), the worst severity first. evs: the
  // page's own filtered list; o: {chokes: [...] or null, pins: [...],
  // kindLabel(kind)}. A row: {country, n, worst, worstId, ids, kinds:
  // [[label, n]], chokes: [...], pins: [tickers]}.
  function listRows(evs, o) {
    o = o || {};
    var by = {}, order = [], label = o.kindLabel || function (k) { return k; };
    function row(name) {
      if (!by[name]) { by[name] = {country: name, n: 0, worst: null, worstId: null, ids: [], kinds: {}, chokes: [], pins: []}; order.push(name); }
      return by[name];
    }
    (evs || []).forEach(function (e) {
      var r = row(e.country || "");
      r.n++; r.ids.push(e.id);
      var s = e.severity || 0;
      if (r.worst == null || s > r.worst) { r.worst = s; r.worstId = e.id; }
      var k = label(e.kind); r.kinds[k] = (r.kinds[k] || 0) + 1;
    });
    (o.chokes || []).forEach(function (c) { row(c.country || "").chokes.push(c); });
    (o.pins || []).forEach(function (p) { if (p.country) row(p.country).pins.push(p.ticker); });
    var rows = order.map(function (k) {
      var r = by[k];
      r.kinds = Object.keys(r.kinds).map(function (x) { return [x, r.kinds[x]]; }).sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
      return r;
    });
    rows.sort(function (a, b) {
      if ((a.worst == null) !== (b.worst == null)) return a.worst == null ? 1 : -1;
      return (b.worst || 0) - (a.worst || 0) || b.n - a.n || (a.country < b.country ? -1 : (a.country > b.country ? 1 : 0));
    });
    return rows;
  }

  // ------------------------------------------------------------- labels that do not collide (P3)

  function overlaps(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  // a w by h label for the mark at (x, y) of radius r: to its right, as the
  // desk always drew it, else its left, above or below, the first spot
  // that meets no box in taken (except the mark's own, by key). Returns
  // the spot's top left and its index (0 is the usual one), or null when
  // every spot is taken; the spot chosen joins taken.
  function freeSpot(taken, x, y, r, w, h, key) {
    var cands = [[x + r + 3, y - h / 2], [x - r - 3 - w, y - h / 2], [x - w / 2, y - r - 3 - h], [x - w / 2, y + r + 3]];
    for (var i = 0; i < cands.length; i++) {
      var box = {x: cands[i][0], y: cands[i][1], w: w, h: h, key: key};
      var hit = false;
      for (var j = 0; j < taken.length && !hit; j++) {
        if (taken[j].key != null && taken[j].key === key && taken[j].mark) continue;
        hit = overlaps(box, taken[j]);
      }
      if (!hit) { taken.push(box); return {x: box.x, y: box.y, i: i}; }
    }
    return null;
  }

  // ------------------------------------------------------------- the time bar and the live feed (P5)

  var POLL_MS = 60000;          // the live poll: once a minute, as the pins poll
  var SPREAD_MS = 55000;        // a poll's new rows land across this much of the next minute
  var PAGES = 5;                // a poll follows "more" this many pages at most
  var DAY_MS = 86400000, HOUR_MS = 3600000;
  var SNAP_KEY = "qg_events_snap", SNAP_DAYS = 7, SNAP_ROWS = 400;

  function two(n) { return (n < 10 ? "0" : "") + n; }
  // a row's moment, as events.feed_time reads it: the feed's own time when
  // "at" carries one (a moment with no zone is UTC), else the start of its
  // date in UTC, which is where a date-only row lands on any replayed day.
  // {t: ms, grain: "time" or "date"}, or null with neither.
  function moment(e) {
    var s = String((e && e.at) || "").trim();
    if (s.length > 10) {
      var iso = s.replace(" ", "T");
      if (!/(Z|[+-]\d\d:?\d\d)$/.test(iso)) iso += "Z";
      var t = Date.parse(iso);
      if (!isNaN(t)) return {t: t, grain: "time"};
    }
    var d = String((e && e.date) || "").slice(0, 10);
    if (/^\d{4}-\d\d-\d\d$/.test(d)) { var u = Date.parse(d + "T00:00:00Z"); if (!isNaN(u)) return {t: u, grain: "date"}; }
    return null;
  }
  // the moment a new row's arrival is ordered by: its own time, or when the
  // desk stored it (created) for a feed with no moment (Wikipedia,
  // PortWatch, EONET, the calendars)
  function arrivalMs(e) {
    var m = moment(e);
    if (m && m.grain === "time") return m.t;
    return e && e.created != null ? Number(e.created) * 1000 : (m ? m.t : 0);
  }
  // one poll's new rows spread over the next minute in the order of their
  // own moments: half by rank, so none bunch, half by the real gaps between
  // them, so a quiet stretch reads as one. [{row, delay}] in arrival order.
  function staggerTimes(rows, spread) {
    spread = spread == null ? SPREAD_MS : spread;
    var list = (rows || []).map(function (r, i) { return {row: r, t: arrivalMs(r), i: i}; });
    list.sort(function (a, b) { return a.t - b.t || a.i - b.i; });
    var n = list.length, t0 = n ? list[0].t : 0, span = n ? list[n - 1].t - t0 : 0;
    return list.map(function (x, k) {
      var rank = n > 1 ? k / (n - 1) : 0, gap = span > 0 ? (x.t - t0) / span : rank;
      return {row: x.row, delay: Math.round(spread * (0.5 * rank + 0.5 * gap))};
    });
  }
  // the browser's local clock, and the UTC value the feeds write, for a tip
  function hhmm(ms) { var d = new Date(ms); return two(d.getHours()) + ":" + two(d.getMinutes()); }
  function utcText(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + "-" + two(d.getUTCMonth() + 1) + "-" + two(d.getUTCDate()) + " " + two(d.getUTCHours()) + ":" + two(d.getUTCMinutes()) + " UTC";
  }
  function agoText(ms) {
    var m = Math.max(0, Math.round(ms / 60000));
    if (m < 1) return "just now";
    if (m < 90) return m + " min ago";
    var h = Math.round(m / 60);
    if (h < 48) return h + " h ago";
    return Math.round(h / 24) + " days ago";
  }
  var FEED_NAMES = {gdelt: "GDELT", usgs: "USGS", gdacs: "GDACS", wikipedia: "Wikipedia", eonet: "NASA EONET", edgar: "SEC EDGAR",
                    fomc: "The Fed calendar", bls: "BLS calendar", earnings: "Earnings calendar", portwatch: "IMF PortWatch", odds: "Odds"};
  // the freshness strip: one row per feed from the globe payload's feeds
  // (globe_api.feeds: name, minutes, last_run, last_ok, ok in unix seconds).
  // Stale when its last run failed, or its last good run is older than
  // twice its cadence and ten minutes more; a stale feed says when it last
  // ran well, in the browser's time with the UTC stamp in the tip.
  function freshness(feeds, nowMs) {
    return (feeds || []).map(function (f) {
      var mins = f.minutes || null, okMs = f.last_ok ? f.last_ok * 1000 : null, runMs = f.last_run ? f.last_run * 1000 : null;
      var late = !okMs || (mins ? nowMs - okMs > (2 * mins + 10) * 60000 : false);
      var stale = !f.ok || late;
      var every = mins ? (mins >= 1440 ? "daily" : (mins >= 60 ? "every " + Math.round(mins / 60) + " h" : "every " + mins + " min")) : "";
      var text = (FEED_NAMES[f.name] || f.name) + (every ? ", " + every : "") + ", " +
        (stale ? (okMs ? "last good " + agoText(nowMs - okMs) + " (" + hhmm(okMs) + ")" : "no good run yet") : "fetched " + agoText(nowMs - (runMs || okMs)));
      var tip = (runMs ? "Last run " + utcText(runMs) : "Never run") + (okMs ? "; last good " + utcText(okMs) : "") + (f.ok ? "" : "; the last run failed");
      return {name: f.name, text: text, tip: tip, stale: stale};
    });
  }
  // the page-kept snapshot (localStorage qg_events_snap): the member's own
  // map rows of the last 7 days, the newest 400, with the moment it was
  // taken and the cursor, so a page that loads offline shows what it last
  // had and says as of when. The member's own browser only.
  function snapPack(evs, cursor, nowMs) {
    var cut = new Date(nowMs - SNAP_DAYS * DAY_MS).toISOString().slice(0, 10);
    var keep = (evs || []).filter(function (e) { return e && String(e.date || "") >= cut; })
      .sort(function (a, b) { return (b.created || 0) - (a.created || 0); }).slice(0, SNAP_ROWS);
    return JSON.stringify({v: 1, as_of: nowMs, cursor: cursor == null ? null : cursor, events: keep});
  }
  function snapUnpack(text) {
    try {
      var s = JSON.parse(text || "");
      if (!s || s.v !== 1 || !s.as_of || !Array.isArray(s.events)) return null;
      return s;
    } catch (e) { return null; }
  }

  // GlobeFeed: the live poll. Every minute, while the tab is shown and the
  // desk is live, it asks the map for the rows the desk stored after its
  // cursor (/api/world/map?after=, events only), follows "more" a few
  // pages, and hands each new row to the page at its turn in the next
  // minute (staggerTimes), so a feed that runs every 5 minutes reads as a
  // steady desk. It never invents a row: each arrival is one the server
  // returned. o: {get(url) -> Promise of the JSON, days() -> the map's
  // window, arrive(row), state(name, info), hidden() -> bool, every, spread,
  // nowS() -> the clock in unix seconds (tests)}.
  //
  // The cursor is the created of the newest row the page has; nothing is
  // asked before a full load of the map (seen). A full load that came back
  // empty (a quiet window, a new member) leaves no cursor, so the first
  // poll after it starts from the moment the feed was made, less
  // START_SKEW_S for a browser clock a little ahead of the box's. A row the
  // page already holds only takes the fresher fields (the page's arrive),
  // so the overlap lands nothing twice.
  var START_SKEW_S = 300;
  function GlobeFeed(o) {
    this.o = o || {};
    this.cursor = null; this.timer = 0; this.busy = false; this.live = true;
    this.pending = []; this.lastOk = 0; this.fails = 0; this.loaded = false;
    this.origin = Math.floor((this.o.nowS ? this.o.nowS() : Date.now() / 1000) - START_SKEW_S);
  }
  // rows the page already has (a full load of the map): the cursor moves past them
  GlobeFeed.prototype.seen = function (rows) {
    var self = this;
    this.loaded = true;
    (rows || []).forEach(function (r) { if (r && r.created != null && (self.cursor == null || r.created > self.cursor)) self.cursor = Number(r.created); });
  };
  // the minute's beat: nothing while the tab is hidden; else the page's own
  // tick (o.tick: the clock, the payload, the strip), then the poll
  GlobeFeed.prototype.start = function () {
    var self = this;
    this.stop();
    this.timer = setInterval(function () {
      if (self.o.hidden && self.o.hidden()) return;
      if (self.o.tick) self.o.tick();
      self.poll();
    }, this.o.every || POLL_MS);
  };
  GlobeFeed.prototype.stop = function () { if (this.timer) { clearInterval(this.timer); this.timer = 0; } };
  // Live or not: a desk looking back at the day (the scrubber) polls nothing
  // until it is live again, and its cursor waits where it was
  GlobeFeed.prototype.setLive = function (on) { this.live = !!on; };
  GlobeFeed.prototype.url = function () {
    var d = this.o.days ? this.o.days() : 365;
    return "/api/world/map?days=" + d + "&after=" + encodeURIComponent(String(this.cursor));
  };
  // one poll: the pages it follows are gathered first, so the whole
  // minute's rows are spread together in the order of their moments
  GlobeFeed.prototype.poll = function (page, got) {
    var self = this, o = this.o;
    page = page || 0; got = got || [];
    if (!this.live || (this.cursor == null && !this.loaded) || (o.hidden && o.hidden()) || (this.busy && !page)) return Promise.resolve(false);
    if (this.cursor == null) this.cursor = this.origin;          // an empty full load: from the feed's own start
    this.busy = true;
    return o.get(this.url()).then(function (d) {
      var rows = (d && d.events) || [];
      if (d && d.cursor != null && (self.cursor == null || d.cursor >= self.cursor)) self.cursor = Number(d.cursor);
      self.seen(rows);
      got = got.concat(rows);
      if (d && d.more && page + 1 < PAGES) return self.poll(page + 1, got);
      self.schedule(got);
      self.lastOk = Date.now(); self.fails = 0;
      self.busy = false;
      if (o.state) o.state("ok", {rows: got.length});
      return true;
    }).catch(function (x) {
      self.busy = false; self.fails++;
      self.schedule(got);                         // the pages already read still land
      if (o.state) o.state(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "behind", {error: String((x && x.message) || x)});
      return false;
    });
  };
  // each row to the page at its turn; a stop (the page leaving live) lets
  // the rows already fetched land at once, so none is lost
  GlobeFeed.prototype.schedule = function (rows) {
    var self = this, o = this.o;
    staggerTimes(rows, o.spread == null ? SPREAD_MS : o.spread).forEach(function (x) {
      var job = {row: x.row, h: 0};
      job.h = setTimeout(function () {
        self.pending = self.pending.filter(function (j) { return j !== job; });
        if (o.arrive) o.arrive(x.row, true);
      }, x.delay);
      self.pending.push(job);
    });
  };
  GlobeFeed.prototype.flush = function () {
    var o = this.o, list = this.pending;
    this.pending = [];
    list.forEach(function (j) { clearTimeout(j.h); if (o.arrive) o.arrive(j.row, false); });
  };

  // ------------------------------------------------------------- density, odds ticks (P6)

  // events per country: the counts a density fill reads, and its top.
  // evs: the page's own filtered list (the lens, the kind, the window).
  function densityOf(evs) {
    var by = {}, max = 0;
    (evs || []).forEach(function (e) { if (!e || !e.country || e.upcoming) return; by[e.country] = (by[e.country] || 0) + 1; if (by[e.country] > max) max = by[e.country]; });
    return {by: by, max: max};
  }
  // a count's fill, on a log scale from 1 to the top: a faint to a full
  // cyan. A count, never a score: no color says good or bad.
  function densityFill(n, max) {
    if (!n || !max) return null;
    var u = max > 1 ? Math.log(n) / Math.log(max) : 1;
    return ta("--cyan-rgb", "95,184,212", "18,98,124", (0.1 + 0.4 * u).toFixed(2));
  }
  // the odds ticks: one per country the crowd's odds speak to (the globe
  // payload's odds.by_country, globe_api.odds_moves: markets matched to a
  // scenario with a country, the largest one-day moves), the largest move
  // first. The label is the crowd's price and its move in points; the sign
  // is text and the tick's direction, never a book's return.
  function oddsTicks(byCountry, points) {
    var out = [];
    Object.keys(byCountry || {}).sort().forEach(function (c) {
      var rows = (byCountry[c] || []).filter(function (r) { return r && r.price != null && r.change != null; });
      if (!rows.length || !points || !points[c]) return;
      rows = rows.slice().sort(function (a, b) { return Math.abs(b.change) - Math.abs(a.change) || (a.market_id < b.market_id ? -1 : 1); });
      var top = rows[0], pts = Math.round(top.change * 100);
      out.push({country: c, pos: points[c].slice(), rows: rows, dir: pts > 0 ? 1 : (pts < 0 ? -1 : 0),
                label: "crowd's price " + Math.round(top.price * 100) + "%, " + (pts > 0 ? "+" : "") + pts + " pts" + (rows.length > 1 ? " +" + (rows.length - 1) : "")});
    });
    return out;
  }
  // a replayed event's ripple, from the globe payload alone (no request per
  // event): the ring targets of its country less the index that stands in
  // for a country's own fund (worldgeo.COUNTRY_ETF's "$" entries, mirrored
  // here and checked by test_globe.py), and the past medians and counts the
  // payload carries for it. Null when the payload has no record for it.
  var INDEX_STANDINS = {"United States of America": "$SPX"};
  function payloadRipple(row, pay) {
    var t = row && pay && pay.rings ? pay.rings[row.country] : null;
    if (!t || !row.record) return null;
    var rc = {};
    RING_ORDER.forEach(function (ring) { rc[ring] = ((t.to || {})[ring] || []).filter(function (x) { return !INDEX_STANDINS[x]; }); });
    return {country: row.country, region: t.region, continent: t.continent, rings: {}, ring_countries: rc, ring_record: row.record, analogues: row.past};
  }
  // a line for one market, as the card and the tip say it
  function oddsLine(r) {
    var pts = Math.round((r.change || 0) * 100);
    return String(r.question || "").slice(0, 90) + ": " + Math.round(r.price * 100) + "% on " + (r.venue === "kalshi" ? "Kalshi" : "Polymarket") +
      ", " + Math.round(r.was * 100) + "% a day before (" + (pts > 0 ? "+" : "") + pts + " pts)";
  }

  // ------------------------------------------------------------- the brief's still globe (P11)

  // the basemap (static/world-110m.json, TopoJSON) as the desk decodes it:
  // one {name, rings, lon, lat} per country, Antarctica left out, the point
  // the mean of its largest ring. events.html keeps its own copy, since it
  // draws the flat map with the switch off and globe.js never loaded;
  // test_brief.py holds the two to the same output.
  // The date line (180 degrees). Two countries in world-110m (Russia's
  // Chukotka, Fiji) have rings that step from +180 to -180 and back. On the
  // flat map that step is a line across the whole world and the fill turns
  // into a band. unwrapRing makes a ring continuous (longitudes may run past
  // 180); flatRings then cuts it at the date line into pieces that each stay
  // inside -180..180, so the flat map draws them in place. The sphere keeps
  // the unwrapped ring: its trigonometry does not care past 180.
  function unwrapRing(pts) {
    var out = [], off = 0;
    for (var k = 0; k < pts.length; k++) {
      var x = pts[k][0] + off;
      if (k) {
        var d = x - out[k - 1][0];
        if (d > 180) { off -= 360; x -= 360; } else if (d < -180) { off += 360; x += 360; }
      }
      out.push([x, pts[k][1]]);
    }
    return out;
  }
  function clipAt(ring, cut, keepLow) {
    var out = [], n = ring.length;
    function inside(p) { return keepLow ? p[0] <= cut : p[0] >= cut; }
    for (var k = 0; k < n; k++) {
      var a = ring[k], b = ring[(k + 1) % n], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) { var t = (cut - a[0]) / (b[0] - a[0]); out.push([cut, a[1] + t * (b[1] - a[1])]); }
    }
    return out;
  }
  function shiftRing(ring, by) { return ring.map(function (p) { return [p[0] + by, p[1]]; }); }
  function flatRings(ring) {
    var lo = Infinity, hi = -Infinity;
    ring.forEach(function (p) { if (p[0] < lo) lo = p[0]; if (p[0] > hi) hi = p[0]; });
    var parts;
    if (hi > 180) parts = [clipAt(ring, 180, true), shiftRing(clipAt(ring, 180, false), -360)];
    else if (lo < -180) parts = [clipAt(ring, -180, false), shiftRing(clipAt(ring, -180, true), 360)];
    else parts = [ring];
    return parts.filter(function (r) { return r.length >= 3; });
  }
  function decodeTopo(t) {
    var tf = t.transform, arcs = t.arcs.map(function (arc) {
      var x = 0, y = 0; return arc.map(function (p) { x += p[0]; y += p[1]; return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]]; });
    });
    function ring(idx) {
      var out = [];
      idx.forEach(function (i) { var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; if (out.length) a = a.slice(1); out = out.concat(a); });
      return out;
    }
    var list = [];
    t.objects.countries.geometries.forEach(function (g) {
      var name = (g.properties || {}).name || "";
      if (name === "Antarctica") return;
      var polys = g.type === "Polygon" ? [g.arcs] : (g.arcs || []);
      var rings = [], flat = [], big = null, bigN = 0;
      polys.forEach(function (poly) {
        poly.forEach(function (r, k) { var pts = ring(r), un = unwrapRing(pts); rings.push(un); flat.push.apply(flat, flatRings(un)); if (k === 0 && pts.length > bigN) { bigN = pts.length; big = pts; } });
      });
      var cx = 0, cy = 0;
      if (big) { big.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= big.length; cy /= big.length; }
      list.push({name: name, rings: rings, flat: flat, lon: cx, lat: cy});
    });
    return list;
  }
  // the theater the brief's globe turns to: the busiest overnight, in the
  // brief's own order (the most arrivals, then the worst severity, then
  // the name, as brief.build_house sorts them), the first with a preset.
  // {theater, preset}, or null when nothing arrived in a standing theater.
  function briefTheater(theaters, presets) {
    var by = {};
    (presets || []).forEach(function (p) { if (p && p.id && p.kind === "theater") by[p.id] = p; });
    var list = (theaters || []).filter(function (t) { return t && t.id && by[t.id] && (t.n || 0) > 0; });
    list.sort(function (a, b) {
      return (b.n || 0) - (a.n || 0) || (b.severity || 0) - (a.severity || 0) || (a.label < b.label ? -1 : (a.label > b.label ? 1 : 0));
    });
    return list.length ? {theater: list[0], preset: by[list[0].id]} : null;
  }
  // One paint of a small globe, and no loop: a still engine (it never asks
  // for a frame and listens for nothing) in the Globe view at 1x, turned to
  // the middle of the preset's own countries (fitView's centre, tilted no
  // further than the desk's views). The countries as the desk draws them (a
  // country with an event of severity 1 or more tinted by its worst), the
  // preset's own countries ringed in cyan, and each event with a place a
  // dot in its lens color, sized by severity as the desk sizes them, scaled
  // to the canvas. ctx is already in CSS pixels, W by H. o: {world:
  // decodeTopo's list, points: {country: [lon, lat]}, preset: {members},
  // events: rows with lat and lon or a country, color(row), grid}.
  // {lon, lat, placed: events with a place, drawn: those on the near side,
  // engine}.
  function STILL_LAND() { return tk("--pg-land", "#151C27", "#D3CCBE"); }
  function STILL_BORDER() { return tk("--pg-rule", "#2E3A4D", "#B5AD9D"); }
  function STILL_RING() { return ta("--cyan-rgb", "95,184,212", "18,98,124", ".85"); }
  function stillGlobe(ctx, W, H, o) {
    o = o || {};
    var E = new Engine({still: true, grid: function () { return o.grid !== false; }});
    E.mode = "globe"; E.spin = false;
    var world = o.world || [], points = o.points || {}, mine = {}, rings = [];
    E.setWorld(world);
    var pts = ((o.preset && o.preset.members) || []).map(function (m) { mine[m] = 1; return points[m]; }).filter(function (q) { return !!q; });
    var v = fitView(pts, W, H), lon = v ? v.lon : 20, lat = v ? v.lat : LAND_TILT;
    E.lam = wrap(lon * D2R); E.phi = clamp(lat, -60, 70) * D2R; E.zoom = 1;
    E.frame(W, H);
    E.backdrop(ctx);
    var evs = o.events || [], hot = {};
    evs.forEach(function (e) { var s = (e && e.severity) || 0; if (e && e.country && s >= 1) hot[e.country] = Math.max(hot[e.country] || 0, s); });
    world.forEach(function (co, i) {
      var path = E.path(i); if (!path) return;                 // wholly behind: not drawn
      ctx.fillStyle = hot[co.name] ? ta("--down-rgb", "223,96,94", "176,48,45", Math.min(0.32, 0.1 + hot[co.name] * 0.1)) : STILL_LAND();
      ctx.fill(path);
      ctx.strokeStyle = STILL_BORDER(); ctx.lineWidth = 0.5; ctx.stroke(path);
      if (mine[co.name]) rings.push(path);
    });
    // the theater's own countries, over their neighbours' borders
    ctx.strokeStyle = STILL_RING(); ctx.lineWidth = 1;
    rings.forEach(function (path) { ctx.stroke(path); });
    var k = clamp(Math.min(W, H) / 400, 0.5, 1), placed = 0, drawn = 0;
    evs.slice().sort(function (a, b) { return ((a && a.severity) || 0) - ((b && b.severity) || 0); }).forEach(function (e) {
      if (!e) return;
      var pos = e.lat != null && e.lon != null ? [Number(e.lon), Number(e.lat)] : points[e.country];
      if (!pos || isNaN(pos[0]) || isNaN(pos[1])) return;      // no place: nothing drawn
      placed++;
      var p = E.pt(pos[0], pos[1]); if (!p.vis) return;          // the far side
      ctx.beginPath(); ctx.arc(p.x, p.y, (3 + Math.min(4, (e.severity || 0.5) * 2.2)) * k, 0, TAU);
      ctx.fillStyle = (o.color ? o.color(e) : tk("--ink", "#E7ECF4", "#1A2130")) + "cc"; ctx.fill();
      drawn++;
    });
    return {lon: lon, lat: lat, placed: placed, drawn: drawn, engine: E};
  }

  var API = {
    retheme: retheme,
    // the page's engine stays reachable as QGGlobe.last, so its stats() (the
    // draw time per frame) and ladderLog can be read from the console on
    // real hardware
    create: function (opts) { API.last = new Engine(opts); return API.last; },
    last: null,
    Engine: Engine, Live: Live, keyAction: keyAction, listRows: listRows, fitView: fitView, projector: projector,
    freeSpot: freeSpot, overlaps: overlaps,
    PulseSystem: PulseSystem, CometSystem: CometSystem, rippleComets: rippleComets, pinComets: pinComets,
    chokeComets: chokeComets, ftMarks: ftMarks, ftLine: ftLine, gcKm: gcKm, signed: signed,
    GlobeFeed: GlobeFeed, moment: moment, arrivalMs: arrivalMs, staggerTimes: staggerTimes, hhmm: hhmm, utcText: utcText,
    agoText: agoText, freshness: freshness, snapPack: snapPack, snapUnpack: snapUnpack,
    densityOf: densityOf, densityFill: densityFill, oddsTicks: oddsTicks, oddsLine: oddsLine,
    payloadRipple: payloadRipple, INDEX_STANDINS: INDEX_STANDINS,
    decodeTopo: decodeTopo, briefTheater: briefTheater, stillGlobe: stillGlobe,
    simplifyRing: simplifyRing, lodFor: lodFor, coastLods: coastLods, glideStep: glideStep, detectRate: detectRate,
    LOD_TOL: LOD_TOL, LOD_PX: LOD_PX, FLY_MS: FLY_MS, DECAY_S: DECAY, IDLE_FRAME_MS: IDLE_FRAME_MS,
    COMET_CAP: COMET_CAP, RING_MS: RING_MS, PULSE_CAP: PULSE_CAP, TRAIL: TRAIL,
    RATE_DEG: RATE / D2R, RESUME_MS: RESUME_MS, PULSE_MS: PULSE_MS, ZMIN: ZMIN, ZMAX: ZMAX,
    LADDER_MS: LADDER_MS, LADDER_N: LADDER_N, DESK_STEPS: DESK_STEPS, PHONE_STEPS: PHONE_STEPS,
    POLL_MS: POLL_MS, SPREAD_MS: SPREAD_MS, DAY_MS: DAY_MS, HOUR_MS: HOUR_MS, SNAP_KEY: SNAP_KEY
  };
  if (typeof window !== "undefined") window.QGGlobe = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})();
