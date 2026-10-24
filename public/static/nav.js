// Shared nav + link lights. Drop <span id="qgnav"></span> in the opsbar and
// include this script; it renders the page links (current one highlighted)
// and the AI light (MCP connected) beside Connected and the clock.
// ======================= THE THEME =======================
// Night (the default), Day or System (docs/context/brand-design.md, Theme
// modes). The choice lives in the qg_theme cookie, scoped to .quantgpt.co
// so the site can read it too, and in the account's prefs ("theme") so it
// follows the member to a new device. server.py (_theme_boot) writes a
// tiny nonce'd script into every page's <head> that sets
// <html data-theme> from the cookie before first paint; desk.css does the
// rest, System through @media (prefers-color-scheme). This block is the
// API a page uses: QGTheme.mode() (night, day, system), QGTheme.dark()
// (what is showing now), QGTheme.set(mode, save), QGTheme.token(name),
// and a "qg-theme" event on document whenever what is showing changes
// (a choice, or the system flipping while on System), so a chart drawn
// on a canvas can redraw in the new colours.
(function () {
  "use strict";
  var MODES = { night: 1, day: 1, system: 1 };
  var root = document.documentElement;
  var DARK = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)qg_theme=(night|day|system)(?:;|$)/);
    return m ? m[1] : "night";
  }
  function mode() {
    var a = root.getAttribute("data-theme");
    return MODES[a] ? a : "night";
  }
  function dark() {
    var m = mode();
    if (m === "day") return false;
    if (m === "system") return !!(DARK && DARK.matches);
    return true;
  }
  function token(name, fallback) {
    var v = "";
    try { v = getComputedStyle(root).getPropertyValue(name).trim(); } catch (e) {}
    return v || fallback || "";
  }
  function paintChrome() {
    // the browser's own bar follows the page ground
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark() ? "#0A0D13" : token("--bg", "#F5F2EB"));
  }
  var last = null;
  function changed() {
    paintChrome();
    var now = dark() ? "night" : "day";
    if (now === last) return;
    last = now;
    try {
      document.dispatchEvent(new CustomEvent("qg-theme", { detail: { mode: mode(), showing: now } }));
    } catch (e) {}
  }
  function writeCookie(m) {
    var host = location.hostname, dom = "";
    if (/(^|\.)quantgpt\.co$/.test(host)) dom = "; Domain=.quantgpt.co";
    var sec = location.protocol === "https:" ? "; Secure" : "";
    if (m === "night") {
      // the default: no cookie at all, so nothing changes for anyone who
      // never chose
      document.cookie = "qg_theme=; Path=/; Max-Age=0; SameSite=Lax" + dom + sec;
    } else {
      document.cookie = "qg_theme=" + m + "; Path=/; Max-Age=31536000; SameSite=Lax" + dom + sec;
    }
  }
  function apply(m) {
    if (!MODES[m]) m = "night";
    if (m === "night") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", m);
    changed();
  }
  // save: true writes the account's prefs as well (signed in only; a 401
  // is fine, the cookie still holds the choice on this browser)
  function set(m, save) {
    if (!MODES[m]) m = "night";
    writeCookie(m);
    apply(m);
    if (save) {
      return fetch("/api/account/prefs", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs: { theme: m } })
      }).then(function (r) { return r.json(); }).catch(function () { return { error: "offline" }; });
    }
    return Promise.resolve({ ok: true });
  }
  // the pre-paint script ran from the cookie; a page cached before it
  // existed has no attribute yet, so the cookie is applied here too
  if (mode() !== readCookie()) apply(readCookie());
  if (DARK) {
    var onSys = function () { if (mode() === "system") changed(); };
    if (DARK.addEventListener) DARK.addEventListener("change", onSys);
    else if (DARK.addListener) DARK.addListener(onSys);
  }
  last = dark() ? "night" : "day";
  paintChrome();
  // another device chose: once a browser session, the account's stored
  // choice wins over this browser's cookie (signed out: a quiet 401)
  try {
    if (!sessionStorage.getItem("qg_theme_sync") && /^\/(?!static\/)/.test(location.pathname)) {
      sessionStorage.setItem("qg_theme_sync", "1");
      // signed in or not, asked once for the whole page (KI-169): a signed-out
      // visitor never calls the account API, so no 401 is logged
      var qgAuth = window.qgAuth || (window.qgAuth = fetch("/api/auth/state",{credentials:"same-origin"}).then(function(r){return r.ok?r.json():{};}).then(function(a){return !!(a&&a.signed_in);}).catch(function(){return true;}));
      qgAuth.then(function (inn) {
        return inn ? fetch("/api/account/prefs", { credentials: "same-origin" }) : null;
      })
        .then(function (r) { return r && r.ok ? r.json() : null; })
        .then(function (d) {
          var t = d && d.prefs && d.prefs.theme;
          if (MODES[t] && t !== readCookie()) set(t, false);
        }).catch(function () {});
    }
  } catch (e) {}
  window.QGTheme = { mode: mode, dark: dark, set: set, token: token };
})();

(function () {
  "use strict";
  // the wordmark is always a way home (operator request, alpha day 1);
  // runs even on pages that have an opsbar but no #qgnav slot
  function markHome() {
    document.querySelectorAll(".opsbar .mark, header .mark").forEach(function (mk) {
      if (mk.closest("a")) return;
      mk.style.cursor = "pointer";
      mk.setAttribute("role", "link");
      mk.setAttribute("tabindex", "0");
      mk.setAttribute("aria-label", "QuantGPT home");
      function go() {
        if ((location.pathname.replace(/\/$/, "") || "/") !== "/") {
          location.href = "/";
        }
      }
      mk.addEventListener("click", go);
      mk.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markHome);
  } else markHome();

  var el = document.getElementById("qgnav");
  if (!el) return;

  // ======================= THE SIDEBAR =======================
  // docs/NAV.md (HIT list #3, U3, 2026-09-24). One renderer: a flat list,
  // one click per item, grouped under plain section labels. No emojis and
  // no icons (Brett, 2026-09-28, option A2): type only, section labels in
  // small mono capitals, and a 2px amber rail on the active item.
  // No dropdowns, sub-lists or carets. One button collapses the whole
  // sidebar to 64px and this device remembers it (localStorage qg_side:
  // "full" or "mini"); collapsed, each item shows its two-letter abbr
  // (tiers.py), Search a "/", Help a "?" and Account the avatar. Under
  // 768px a top bar with a menu button opens the same list as an
  // overlay. The list comes from tiers.py (the nav block of
  // /api/tiers/me); what used to be sub-links is the search palette's.
  // Four sections (mock 2, 2026-10-08): Research, Track, Your AI,
  // Community; Help and Account in the foot. All fit 900px, no scroll.
  var FULL_W = 240, MINI_W = 64, BAR_H = 48;
  var PHONE = window.matchMedia("(max-width: 767px)");
  var SIDE = "full";
  try { SIDE = localStorage.getItem("qg_side") === "mini" ? "mini" : "full"; } catch (e) {}
  // the retired top-bar switch; cleared so it is not left behind
  try { localStorage.removeItem("qg_nav"); } catch (e) {}
  var BAR_AT = "calc(" + BAR_H + "px + env(safe-area-inset-top))";
  var MONO = "var(--mono,'JetBrains Mono',Consolas,Cascadia Mono Web,monospace)";
  // the chrome's collapsed marks; tiers.py NAV_SEARCH and NAV_HELP carry
  // the same ones (test_nav_live.py holds them equal)
  var AB_SEARCH = "/", AB_HELP = "?";
  var HIDE = "position:absolute!important;width:1px!important;height:1px!important;padding:0!important;" +
    "margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important";
  var css = document.createElement("style");
  // theme modes: the chrome's own colours with no desk.css token. Night
  // keeps its values; Day and System-light turn them over.
  var NAV_DAY = "--pg-nav-grid:#CDC5B5;--pg-nav-bench:#4E5767;--pg-nav-dim:#576070";
  css.textContent =
    ":root{--pg-nav-grid:#212A38;--pg-nav-bench:#8B96A8;--pg-nav-dim:#5B6577}" +
    ":root[data-theme=\"day\"]{" + NAV_DAY + "}" +
    "@media (prefers-color-scheme: light){:root[data-theme=\"system\"]{" + NAV_DAY + "}}" +
    "#qgnav{display:none!important}" +
    "body.qg-side{padding-left:" + FULL_W + "px!important}" +
    "body.qg-side #qg-deskbar{left:" + FULL_W + "px!important}" +
    // one wordmark: the sidebar's. The page's own opsbar mark steps aside
    "body.qg-side .opsbar .mark{display:none!important}" +
    // the label strip goes at every width: the sidebar already names the
    // page. A bar with live status or links of its own (the monitor's
    // session and clock) stays
    "body.qg-side .opsbar.qg-thin{display:none!important}" +
    "#qgside{position:fixed;left:0;top:0;bottom:0;width:" + FULL_W + "px;z-index:120;box-sizing:border-box;" +
      "background:var(--surface,#10151E);border-right:1px solid var(--line,#212A38);display:flex;" +
      "flex-direction:column;font-family:var(--sans,'Segoe UI',Selawik,system-ui,sans-serif);color:var(--muted,#8B96A8)}" +
    "#qgside .sd-skip{" + HIDE + "}" +
    "#qgside .sd-skip:focus{position:static!important;width:auto!important;height:auto!important;margin:8px!important;" +
      "padding:8px 10px!important;clip:auto!important;overflow:visible!important;background:var(--amber-fill,#F0A83C);" +
      "color:#14100a;border-radius:6px;text-decoration:none;font-size:13px}" +
    "#qgside .sd-top{display:flex;align-items:center;gap:6px;padding:8px 10px 2px}" +
    "#qgside .sd-btn,#qgbar .sd-btn{width:36px;height:36px;flex:none;display:grid;place-items:center;padding:0;" +
      "background:transparent;border:1px solid transparent;border-radius:8px;color:var(--muted,#8B96A8);" +
      "cursor:pointer;font-size:16px;line-height:1}" +
    "#qgside .sd-btn:hover,#qgbar .sd-btn:hover{color:var(--ink,#E7ECF4);border-color:var(--line2,#2E3A4D)}" +
    "#qgside .sd-x{display:none}" +
    "#qgside .sd-brand{color:var(--ink,#E7ECF4);font-weight:700;font-size:15px;letter-spacing:.01em;" +
      "text-decoration:none;white-space:nowrap}" +
    "#qgside .op{display:flex;gap:10px;align-items:center;margin:4px 8px 2px;padding:7px 8px;border-radius:8px;" +
      "text-decoration:none;min-width:0}" +
    "#qgside .op:hover{background:var(--surface2,#151C27)}" +
    "#qgside .op .av{width:32px;height:32px;border:1px solid var(--amber,#F0A83C);border-radius:50%;display:grid;" +
      "place-items:center;background:var(--bg,#0A0D13);flex:none;overflow:hidden}" +
    "#qgside .op .av img{width:100%;height:100%;object-fit:cover;display:block}" +
    "#qgside .op .who{min-width:0;flex:1}" +
    "#qgside .op .h{display:block;color:var(--ink,#E7ECF4);font-size:13px;white-space:nowrap;overflow:hidden;" +
      "text-overflow:ellipsis}" +
    "#qgside .op .p{display:block;color:var(--faint,#5B6577);font-size:11.5px;margin-top:1px}" +
    "#qgside .sd-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 0 8px;scrollbar-width:thin;" +
      "scrollbar-color:var(--line2,#2E3A4D) transparent}" +
    // a group: small mono capitals, and a hairline above every group but
    // the first, so the rail reads as sections rather than one long list
    // (polish pass 1, 2026-09-29)
    "#qgside .sd-sec{font-family:" + MONO + ";font-size:10.5px;font-weight:500;text-transform:uppercase;" +
      "letter-spacing:.14em;color:var(--faint,#5B6577);padding:13px 12px 4px;margin:0 8px;" +
      "border-top:1px solid var(--line,#212A38)}" +
    "#qgside .sd-sec:first-child{border-top:0;padding-top:6px}" +
    "#qgside .sd-item{position:relative;display:flex;align-items:center;gap:10px;box-sizing:border-box;" +
      "width:calc(100% - 16px);min-height:32px;margin:1px 8px;padding:5px 10px;border:0;border-radius:8px;" +
      "background:transparent;color:var(--muted,#8B96A8);font:inherit;font-size:13.5px;font-weight:450;line-height:1.25;" +
      "text-align:left;text-decoration:none;cursor:pointer;" +
      "transition:background-color 140ms cubic-bezier(.2,0,0,1),color 140ms cubic-bezier(.2,0,0,1)}" +
    "#qgside .sd-item:hover{background:var(--surface2,#151C27);color:var(--ink,#E7ECF4)}" +
    "#qgside .sd-item:active{background:var(--surface2,#151C27);color:var(--ink,#E7ECF4);opacity:.85}" +
    // the hover underline: a 1px amber line under the label that sweeps in
    // from the left; it never shows on the active row or on a locked one
    "#qgside .sd-item::after{content:'';position:absolute;left:10px;right:10px;bottom:4px;height:1px;" +
      "background:var(--amber,#F0A83C);transform:scaleX(0);transform-origin:left center;" +
      "transition:transform 180ms cubic-bezier(.2,0,0,1);pointer-events:none}" +
    "#qgside .sd-item:hover::after{transform:scaleX(1)}" +
    "#qgside .sd-item[aria-current='page']::after,#qgside .sd-item.locked::after{display:none}" +
    // the active item: ink text at the heavier weight, a faint amber tint
    // and a 2px amber rail on its left edge
    "#qgside .sd-item[aria-current='page']{color:var(--ink,#E7ECF4);font-weight:600;background:rgba(var(--amber-rgb),.07)}" +
    "#qgside .sd-item[aria-current='page']:hover{background:rgba(var(--amber-rgb),.11)}" +
    "#qgside .sd-item[aria-current='page']::before{content:'';position:absolute;left:0;top:6px;bottom:6px;" +
      "width:2px;border-radius:1px;background:var(--amber,#F0A83C)}" +
    "#qgside .sd-item.locked{color:var(--faint,#5B6577)}" +
    // the two-letter abbr: shown only when the sidebar is collapsed
    "#qgside .ab{display:none;font-family:" + MONO + ";font-size:11.5px;font-weight:600;letter-spacing:.04em;" +
      "line-height:1}" +
    "#qgside .ab.av{width:24px;height:24px;box-sizing:border-box;border:1px solid var(--amber,#F0A83C);" +
      "border-radius:50%;place-items:center;overflow:hidden;background:var(--bg,#0A0D13)}" +
    "#qgside .ab.av img{width:100%;height:100%;object-fit:cover;display:block}" +
    "#qgside .ab.av svg{width:10px;height:auto}" +
    "#qgside .lb{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    // "soon" and a locked item's plan tag: the same small mono chip
    "#qgside .soon,#qgside .tag{flex:none;font-family:" + MONO + ";font-size:9.5px;font-weight:600;" +
      "letter-spacing:.08em;line-height:1.6;padding:0 6px;border:1px solid var(--line2,#2E3A4D);" +
      "border-radius:4px;color:var(--amber,#F0A83C)}" +
    "#qgside .tag.lock{display:inline-grid;place-items:center;height:16px;box-sizing:border-box;padding:0 5px}" +
    "#qgside .tag.lock svg{display:block}" +
    "#qgside kbd{flex:none;font-family:var(--mono,Consolas,Cascadia Mono Web,monospace);font-size:11px;color:var(--faint,#5B6577);" +
      "border:1px solid var(--line2,#2E3A4D);border-radius:4px;padding:0 5px}" +
    "#qgside .sd-foot{border-top:1px solid var(--line,#212A38);padding:6px 0 8px}" +
    "#qgside .sd-foot .lt{display:flex;align-items:center;gap:8px;min-height:32px;margin:1px 8px;padding:5px 10px;" +
      "border-radius:8px;cursor:pointer;font-size:13px;color:var(--muted,#8B96A8);box-sizing:border-box}" +
    "#qgside .sd-foot .lt:hover{background:var(--surface2,#151C27);color:var(--ink,#E7ECF4)}" +
    // the lights are real buttons: no button chrome, the text of where they sit
    "#lt-ai,#lt-agent{background:transparent;border:0;margin:0;padding:0;font:inherit;letter-spacing:inherit;" +
      "text-align:left}" +
    "#qgside .sd-foot .lt{width:calc(100% - 16px)}" +
    ".lt .ln{display:none}#qgbar .lt .lw{display:none}#qgbar .lt .ln{display:inline}" +
    // signed out: no AI to connect and no agent to ask
    "body.qg-signed-out #lt-ai,body.qg-signed-out #lt-agent{display:none!important}" +
    "#qgside .sd-foot .lt .dot{width:24px;flex:none;text-align:center;font-size:12px}" +
    "#qgside .lt .dot,#qgbar .lt .dot,#qg-deskbar .lt .dot{color:var(--faint,#5B6577)}" +
    "#qgside .lt.green .dot,#qgbar .lt.green .dot,#qg-deskbar .lt.green .dot{color:var(--up,#43BD85)}" +
    "#qgside .lt.red .dot,#qgbar .lt.red .dot,#qg-deskbar .lt.red .dot{color:var(--down,#DF605E)}" +
    // Ask AI's diamond is a mark, not a status dot
    "#qgside .sd-foot .lt .ic{width:24px;flex:none;text-align:center;font-size:12px}" +
    "#qgside a:focus-visible,#qgside button:focus-visible,#qgside .lt:focus-visible," +
      "#qgbar button:focus-visible,#qgbar .lt:focus-visible{outline:2px solid var(--amber,#F0A83C);outline-offset:-2px}" +
    "#qg-tip{position:fixed;z-index:140;transform:translateY(-50%);pointer-events:none;display:none;" +
      "background:var(--surface2,#151C27);color:var(--ink,#E7ECF4);border:1px solid var(--line2,#2E3A4D);" +
      "border-radius:6px;padding:4px 9px;font-family:var(--sans,'Segoe UI',Selawik,system-ui,sans-serif);font-size:12.5px;" +
      "white-space:nowrap;box-shadow:0 8px 24px rgba(var(--shade-rgb),.45)}" +
    "#qg-tip.on{display:block}" +
    "#qgbar,#qg-backdrop{display:none}" +
    // desktop, collapsed: 64px of two-letter abbrs; labels stay in the page
    // for screen readers, section labels become thin dividers
    "@media (min-width:768px){" +
      "body.qg-side.qg-mini{padding-left:" + MINI_W + "px!important}" +
      "body.qg-side.qg-mini #qg-deskbar{left:" + MINI_W + "px!important}" +
      ".qg-mini #qgside{width:" + MINI_W + "px}" +
      ".qg-mini #qgside .sd-top{flex-direction:column;padding:10px 0 4px}" +
      ".qg-mini #qgside .sd-brand{display:none}" +
      ".qg-mini #qgside .op{justify-content:center;margin:4px 8px 2px;padding:6px 0}" +
      ".qg-mini #qgside .op .who,.qg-mini #qgside .lb,.qg-mini #qgside kbd,.qg-mini #qgside .sd-sec span{" + HIDE + "}" +
      ".qg-mini #qgside .sd-sec{height:0;padding:0;margin:8px 16px;border-top:1px solid var(--line,#212A38)}" +
      ".qg-mini #qgside .sd-item{justify-content:center;padding:6px 0}" +
      ".qg-mini #qgside .sd-item::after{display:none}" +
      ".qg-mini #qgside .ab{display:block}.qg-mini #qgside .ab.av{display:grid}" +
      ".qg-mini #qgside .sd-scroll{scrollbar-width:none}.qg-mini #qgside .sd-scroll::-webkit-scrollbar{display:none}" +
      ".qg-mini #qgside .tag{" + HIDE + "}" +
      ".qg-mini #qgside .soon{position:absolute;right:5px;top:5px;width:7px;height:7px;padding:0;border:0;" +
        "border-radius:50%;background:var(--amber,#F0A83C);font-size:0;overflow:hidden}" +
      ".qg-mini #qgside .sd-foot .lt{justify-content:center;padding:6px 0;font-size:11px;gap:0}" +
      ".qg-mini #qgside .sd-foot .lt .dot,.qg-mini #qgside .sd-foot .lt .ic{width:auto;margin-right:3px}" +
      ".qg-mini #qgside .sd-foot .lt .lw{" + HIDE + "}" +
    "}" +
    // phones: a 48px top bar (menu, page name, AI light, agent) and the
    // same list as an overlay; tap targets are 44px
    "@media (max-width:767px){" +
      "body.qg-side{padding-left:0!important;padding-top:" + BAR_AT + "!important;--qg-sat:0px}" +
      "body.qg-side #qg-deskbar{left:0!important}" +
      // one header on a phone: the 48px bar. An opsbar with controls of
      // its own scrolls with the page
      "body.qg-side .opsbar:not(.qg-thin){position:static!important}" +
      "#qgbar{position:fixed;top:0;left:0;right:0;z-index:121;height:" + BAR_AT + ";box-sizing:border-box;" +
        "padding:env(safe-area-inset-top) 6px 0;display:flex;align-items:center;gap:4px;" +
        "background:var(--surface,#10151E);border-bottom:1px solid var(--line2,#2E3A4D);" +
        "font-family:var(--sans,'Segoe UI',Selawik,system-ui,sans-serif)}" +
      "#qgbar .sd-btn{width:44px;height:44px;font-size:19px}" +
      "#qgbar .pg{flex:1;min-width:0;color:var(--ink,#E7ECF4);font-size:15px;font-weight:600;white-space:nowrap;" +
        "overflow:hidden;text-overflow:ellipsis}" +
      "#qgbar .lights{display:flex;align-items:center;gap:2px;flex:none}" +
      "#qgbar .lt{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:44px;" +
        "min-width:44px;padding:0 8px;border-radius:8px;color:var(--muted,#8B96A8);font-size:13px;cursor:pointer;" +
        "box-sizing:border-box;white-space:nowrap}" +
      "#qgside{width:min(300px,86vw);z-index:126;transform:translateX(-100%);visibility:hidden;" +
        "transition:transform 180ms cubic-bezier(.2,0,0,1),visibility 0s linear 180ms;box-shadow:0 0 40px rgba(var(--shade-rgb),.5)}" +
      "#qgside.open{transform:none;visibility:visible;transition:transform 180ms cubic-bezier(.2,0,0,1),visibility 0s}" +
      "#qgside .sd-col{display:none}#qgside .sd-x{display:grid;width:44px;height:44px}" +
      "#qgside .sd-item,#qgside .op,#qgside .sd-foot .lt{min-height:44px}#qgside .sd-item{font-size:15px}" +
      "#qg-backdrop{position:fixed;inset:0;z-index:125;background:rgba(5,7,11,.55)}" +
      "#qg-backdrop.on{display:block}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){#qgside{transition-duration:1ms}" +
      "#qgside .sd-item,#qgside .sd-item::after{transition:none}}";
  document.head.appendChild(css);

  var here = location.pathname.replace(/\/$/, "") || "/";
  // shown only until /api/tiers/me answers, and when it cannot (a
  // signed-out visitor on a public page): the workflow map as
  // tiers.NAV_GROUPS has it, open pages only (test_nav_live.py holds the
  // labels, the abbrs and the order equal). University opens the public
  // lessons at /learn here, the page a signed-out visitor can open
  var FALLBACK = [
    { key: "research", label: "Research", items: [
      { key: "terminal", label: "Backtest", path: "/", abbr: "BT" },
      { key: "library", label: "Strategy library", path: "https://quantgpt.co/library", abbr: "LB" }] },
    { key: "track", label: "Track", items: [
      { key: "journal", label: "Journal", path: "/journal", abbr: "JN" },
      { key: "monitor", label: "Monitor", path: "/monitor", abbr: "MN" },
      { key: "events", label: "World events", path: "/events", abbr: "WE" }] },
    { key: "ai", label: "Your AI", items: [
      { key: "chat", label: "Ask AI", path: "/chat", abbr: "AI" },
      { key: "connect", label: "Connect your AI", path: "/connect", abbr: "CN" }] },
    { key: "community", label: "Community", items: [
      { key: "university", label: "University", path: "/learn", abbr: "UN" },
      { key: "forum", label: "Forum", path: "/forum", abbr: "FM" }] }];
  var TIERS = null, NAVMAP = null, ITEMS = {};

  function escA(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var TRI = "<svg width='13' height='11' viewBox='0 0 13 11' aria-hidden='true'>" +
    "<polygon points='6.5,0 13,11 0,11' fill='#F0A83C'></polygon></svg>";
  // the lock chip's padlock, in the chip's colour
  var LOCK = "<svg width='8' height='10' viewBox='0 0 8 10'><path d='M2 4.5V3a2 2 0 0 1 4 0v1.5' " +
    "fill='none' stroke='currentColor' stroke-width='1.2'/><rect x='.5' y='4.5' width='7' height='5' rx='1' " +
    "fill='currentColor'/></svg>";

  var side = document.createElement("nav");
  side.id = "qgside";
  side.setAttribute("aria-label", "QuantGPT");
  side.innerHTML =
    "<a class='sd-skip' href='#' id='qg-skip'>Skip to the page</a>" +
    "<div class='sd-top'>" +
      "<button type='button' class='sd-btn sd-col' id='qg-collapse' aria-controls='qgside' " +
        "aria-expanded='true' aria-label='Collapse the sidebar'>&#171;</button>" +
      "<button type='button' class='sd-btn sd-x' id='qg-close' aria-label='Close the menu'>&times;</button>" +
      "<a class='sd-brand' href='/'>QuantGPT</a></div>" +
    "<a class='op' href='/account' id='qg-op' data-tip='Your account'>" +
      "<span class='av'>" + TRI + "</span>" +
      "<span class='who'><span class='h' id='qg-handle'>Your account</span>" +
      "<span class='p' id='qg-plan'></span></span></a>" +
    "<button type='button' class='sd-item' id='lt-idx' data-tip='Search (press /)' " +
      "aria-label='Search: pages, strategies, threads, studies, terms. Press / or Ctrl+K.'>" +
      "<span class='ab' aria-hidden='true'>" + AB_SEARCH + "</span><span class='lb'>Search</span>" +
      "<kbd aria-hidden='true'>/</kbd></button>" +
    "<div class='sd-scroll' id='qg-navscroll'></div>" +
    "<div class='sd-foot'>" +
      "<button type='button' class='sd-item' id='lt-help' data-tip='Help'>" +
        "<span class='ab' aria-hidden='true'>" + AB_HELP + "</span><span class='lb'>Help</span></button>" +
      "<a class='sd-item' id='qg-acct' href='/account' data-tip='Account'>" +
        "<span class='ab av' aria-hidden='true'>" + TRI + "</span><span class='lb'>Account</span></a>" +
      "<span id='qg-aislot'></span></div>";
  document.body.insertBefore(side, document.body.firstChild);
  // an opsbar holding only the wordmark, the page name and stats (no
  // controls) is thin: the sidebar and the phone's top bar already say
  // all of it. A stat with an id of its own is a live status a script
  // fills (the monitor's session, the portfolio's account), so its bar stays
  Array.prototype.forEach.call(document.querySelectorAll(".opsbar"), function (ob) {
    var kids = ob.children, thin = kids.length > 0;
    for (var i = 0; i < kids.length && thin; i++) {
      var k = kids[i];
      thin = k.id === "qgnav" || k.classList.contains("mark") || (k.classList.contains("stat") && !k.id);
    }
    if (thin) ob.classList.add("qg-thin");
  });

  // phones: the top bar, and the backdrop behind the open list
  var topbar = document.createElement("div");
  topbar.id = "qgbar";
  topbar.innerHTML =
    "<button type='button' class='sd-btn' id='qg-burger' aria-controls='qgside' aria-expanded='false' " +
      "aria-label='Open the menu'>&#9776;</button>" +
    "<span class='pg qg-gloss-off' id='qg-pagename'></span><span class='lights' id='qg-barlights'></span>";
  document.body.insertBefore(topbar, side);
  var backdrop = document.createElement("div");
  backdrop.id = "qg-backdrop";
  document.body.appendChild(backdrop);

  // the status lights keep their ids and handlers; placeLights() moves
  // them: AI beside Connected and the clock on the desk bar, Ask AI into
  // the sidebar's foot; both into the top bar on a phone
  var lights = document.createElement("span");
  lights.id = "qg-lights";
  lights.hidden = true;
  lights.innerHTML =
    "<button type='button' class='lt' id='lt-ai' data-tip='Connect AI' " +
      "title='AI: not set up yet. Click to connect one.' " +
      "aria-label='Connect AI. AI connection status: not set up. Open setup.'><span class='dot'>&#9679;</span> " +
      "<span class='lw'>Connect AI</span><span class='ln'>Connect</span></button>" +
    "<button type='button' class='lt' id='lt-agent' title='Ask AI here, on this page' " +
      "aria-label='Ask AI here, on this page' data-tip='Ask AI'><span class='ic' aria-hidden='true'>&#9670;</span> " +
      "<span class='lw'>Ask AI</span><span class='ln'>Ask AI</span></button>";
  document.body.appendChild(lights);
  function placeLights() {
    var phone = PHONE.matches;
    var desk = document.getElementById("qg-deskbar"), rdy = document.getElementById("qg-rdy");
    ["lt-ai", "lt-agent"].forEach(function (id) {
      var lt = document.getElementById(id);
      if (!lt) return;
      if (phone) document.getElementById("qg-barlights").appendChild(lt);
      else if (id === "lt-agent" || !(desk && rdy)) document.getElementById("qg-aislot").appendChild(lt);
      else desk.insertBefore(lt, rdy);
    });
  }
  placeLights();

  document.body.classList.add("qg-side");
  function setSide(mode, save) {
    var was = document.body.classList.contains("qg-mini") ? "mini" : "full";
    SIDE = mode === "mini" ? "mini" : "full";
    document.body.classList.toggle("qg-mini", SIDE === "mini");
    var b = document.getElementById("qg-collapse");
    b.setAttribute("aria-expanded", SIDE === "full" ? "true" : "false");
    b.setAttribute("aria-label", SIDE === "full" ? "Collapse the sidebar" : "Expand the sidebar");
    b.setAttribute("data-tip", SIDE === "full" ? "Collapse" : "Expand");
    b.innerHTML = SIDE === "full" ? "&#171;" : "&#187;";
    if (save) { try { localStorage.setItem("qg_side", SIDE); } catch (e) {} }
    tipHide();
    // the page just changed width: an open tour re-measures its target
    // (only on a real change, not on every page load)
    if (was !== SIDE) setTimeout(function () { try { window.dispatchEvent(new Event("resize")); } catch (e) {} }, 220);
  }
  document.getElementById("qg-collapse").addEventListener("click", function () {
    setSide(SIDE === "full" ? "mini" : "full", true);
  });

  // ---- phones: the menu opens the same list as an overlay ----
  var lastFocus = null;
  function menuOpen(on) {
    if (on === side.classList.contains("open")) return;
    side.classList.toggle("open", on);
    backdrop.classList.toggle("on", on);
    var b = document.getElementById("qg-burger");
    b.setAttribute("aria-expanded", on ? "true" : "false");
    b.setAttribute("aria-label", on ? "Close the menu" : "Open the menu");
    if (on) {
      lastFocus = document.activeElement;
      document.getElementById("qg-close").focus();
    } else {
      // focus goes back where it was when the menu opened
      var back = (lastFocus && lastFocus !== document.body && document.contains(lastFocus)) ? lastFocus : b;
      lastFocus = null;
      try { back.focus(); } catch (e) {}
    }
  }
  document.getElementById("qg-burger").addEventListener("click", function () {
    menuOpen(!side.classList.contains("open"));
  });
  document.getElementById("qg-close").addEventListener("click", function () { menuOpen(false); });
  backdrop.addEventListener("click", function () { menuOpen(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && side.classList.contains("open")) menuOpen(false);
  });
  // while the overlay is open, Tab stays inside it
  side.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !side.classList.contains("open")) return;
    var f = Array.prototype.filter.call(side.querySelectorAll("a[href],button,[tabindex='0']"), function (x) {
      return x.getClientRects().length > 0; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  function onPhoneChange() {
    if (!PHONE.matches && side.classList.contains("open")) {
      side.classList.remove("open"); backdrop.classList.remove("on");
      document.getElementById("qg-burger").setAttribute("aria-expanded", "false");
    }
    tipHide();
    placeLights();
  }
  if (PHONE.addEventListener) PHONE.addEventListener("change", onPhoneChange);
  else if (PHONE.addListener) PHONE.addListener(onPhoneChange);

  // skip past the sidebar to the page's own content
  document.getElementById("qg-skip").addEventListener("click", function (e) {
    e.preventDefault();
    // the first target the member can see: a phone hides the thin opsbar
    var t = Array.prototype.filter.call(document.querySelectorAll("main, [role='main'], h1, .opsbar, .wrap"),
      function (x) { return x.getClientRects().length > 0; })[0];
    if (!t) return;
    if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    t.focus();
  });

  // ---- collapsed: a label tooltip on hover and on focus ----
  var tip = document.createElement("div");
  tip.id = "qg-tip";
  tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);
  function tipShow(t) {
    var text = t && t.getAttribute("data-tip");
    if (!text || SIDE !== "mini" || PHONE.matches) { tipHide(); return; }
    var r = t.getBoundingClientRect();
    tip.textContent = text;
    tip.style.left = Math.round(r.right + 10) + "px";
    tip.style.top = Math.round(r.top + r.height / 2) + "px";
    tip.classList.add("on");
  }
  function tipHide() { tip.classList.remove("on"); }
  side.addEventListener("mouseover", function (e) { tipShow(e.target.closest("[data-tip]")); });
  side.addEventListener("mouseleave", tipHide);
  side.addEventListener("focusin", function (e) { tipShow(e.target.closest("[data-tip]")); });
  side.addEventListener("focusout", tipHide);
  document.getElementById("qg-navscroll").addEventListener("scroll", tipHide, { passive: true });
  setSide(SIDE, false);

  // an item is "here" on its own page and on the pages under it
  function isHere(path) {
    if (!path || path.charAt(0) !== "/") return false;
    var p = path.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
    return p === here || (p !== "/" && here.indexOf(p + "/") === 0);
  }
  function pageTitle() {
    var t = String(document.title || "").split("\u00B7");
    return (t.length > 1 ? t[t.length - 1] : "").trim() || "QuantGPT";
  }
  function itemHTML(it) {
    var on = isHere(it.path);
    var opensOn = it.min_label ? ", opens on " + it.min_label : ", locked";
    var note = it.soon ? ", coming soon" : it.locked ? opensOn : "";
    var aria = it.locked ? " aria-label='" + escA(it.label + (it.soon
      ? ", coming soon. Opens a card about it." : opensOn + ". Opens the plan card.")) + "'" : "";
    return "<a class='sd-item" + (it.locked ? " locked" : "") + "' href='" + escA(it.path || "#") + "'" +
      " data-key='" + escA(it.key) + "' data-tip='" + escA(it.label + note) + "'" +
      (on ? " aria-current='page'" : "") +
      (it.locked ? " data-locked='" + escA(it.key) + "'" : "") + aria + ">" +
      "<span class='ab' aria-hidden='true'>" + escA(abbrOf(it)) + "</span>" +
      "<span class='lb'>" + escA(it.label) + "</span>" +
      (it.soon ? "<span class='soon'>soon</span>"
               : it.locked ? lockChip(it)
               // held back for launch: only a founder gets the item, tagged
               : it.hidden ? "<span class='tag' aria-hidden='true'>HIDDEN</span>" : "") + "</a>";
  }
  // the collapsed mark: tiers.py's two letters, or the label's first two
  function abbrOf(it) {
    return String(it.abbr || String(it.label || "?").slice(0, 2)).toUpperCase();
  }
  // a locked item's chip (tiers.NAV_LOCK): an empty tag is the padlock
  function lockTag(it) {
    var m = NAVMAP && NAVMAP.lock;
    if (it.tag != null) return String(it.tag);
    return String(m && it.min in m ? m[it.min] : "PRO");
  }
  function lockChip(it) {
    var t = lockTag(it);
    return t ? "<span class='tag' aria-hidden='true'>" + escA(t) + "</span>"
             : "<span class='tag lock' aria-hidden='true'>" + LOCK + "</span>";
  }
  // a section label: plain text, set in small mono capitals by the CSS
  function secHTML(label) {
    return "<div class='sd-sec'><span>" + escA(label) + "</span></div>";
  }
  function renderNav(navmap) {
    NAVMAP = (navmap && navmap.groups && navmap.groups.length) ? navmap : null;
    var groups = NAVMAP ? NAVMAP.groups : FALLBACK, cur = null;
    ITEMS = {};
    document.getElementById("qg-navscroll").innerHTML = groups.map(function (g) {
      return secHTML(g.label) +
        g.items.map(function (it) {
          ITEMS[it.key] = it;
          if (!cur && isHere(it.path)) cur = it;
          return itemHTML(it); }).join(""); }).join("");
    var acct = document.getElementById("qg-acct");
    if (isHere("/account")) acct.setAttribute("aria-current", "page");
    document.getElementById("qg-pagename").textContent = cur ? cur.label : pageTitle();
  }
  renderNav(null);
  // a locked item anywhere opens the plan card instead of navigating
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-locked]");
    if (!a) return;
    e.preventDefault();
    menuOpen(false);
    tierModal(a.getAttribute("data-locked"));
  });
  document.getElementById("qg-navscroll").addEventListener("click", function (e) {
    var a = e.target.closest("a.sd-item");
    if (a && !a.getAttribute("data-locked")) menuOpen(false);
  });
  document.getElementById("lt-ai").onclick = function () { location.href = "/connect"; };

  // ---- signed in or not, asked once (KI-169) ----
  // /api/auth/state is public and answers one boolean, so a signed-out
  // visitor's page never calls the member APIs below and logs no 401s. A
  // failed check assumes signed in, which is what the page did before.
  var qgAuth = window.qgAuth || (window.qgAuth = fetch("/api/auth/state",{credentials:"same-origin"}).then(function(r){return r.ok?r.json():{};}).then(function(a){return !!(a&&a.signed_in);}).catch(function(){return true;}));

  // ---- the operator card at the top of the sidebar ----
  var opHandle = document.getElementById("qg-handle"), opPlan = document.getElementById("qg-plan");
  qgAuth.then(function (inn) {
    return inn ? fetch("/api/forum/me").then(function (r) { return r.ok ? r.json() : null; }) : null;
  })
    .then(function (m) {
      var me = (m && (m.me || m)) || null;
      if (me && me.handle) {
        opHandle.textContent = "@" + me.handle;
        // avatar_url is built server-side and stamped ?v=<mtime>, so a
        // re-upload is a new URL instead of a stale cached image
        var av = me.avatar === 0 ? (me.avatar_url ||
          (me.uid ? "/static/avatars_user/" + me.uid + ".png" : "")) : "";
        if (/^\/static\/avatars_user\/[A-Za-z0-9_.-]+\.png(\?v=\d+)?$/.test(av)) {
          // the operator card and, collapsed, the Account entry in the foot
          Array.prototype.forEach.call(document.querySelectorAll("#qg-op .av, #qg-acct .av"), function (x) {
            x.innerHTML = "<img src='" + av + "' alt='' decoding='async'>"; });
        }
      }
    }).catch(function () {});
  function paintOp() {
    var t = TIERS;
    if (!t) return;
    opPlan.textContent = t.plan ? String(t.display_label || t.label || "") : "No plan";
    var trial = !!(t.plan && t.trial && t.trial.on);
    if (trial) {
      // the trial, counted down where the plan's name sits; one click to the plan
      var left = t.trial.days_left;
      opPlan.textContent = String(t.display_label || t.label || "") + " trial, " + left + " day" +
        (left === 1 ? "" : "s") + " left";
    }
    document.getElementById("qg-op").setAttribute("href", trial ? "/account#plan" : "/account");
    if (!t.plan && opHandle.textContent === "Your account") opHandle.textContent = "Sign in";
  }

  // ---- the INDEX palette: pages, strats, threads, studies, glossary ----
  var palCss = document.createElement("style");
  palCss.textContent =
    "#qg-pal{position:fixed;inset:0;z-index:400;background:rgba(6,8,14,.72);display:none;align-items:flex-start;justify-content:center;padding-top:12vh}" +
    "#qg-pal.open{display:flex}" +
    "#qg-pal .qp-box{width:640px;max-width:94vw;background:var(--surface,#10151E);border:1px solid var(--line2,#2E3A4D);border-radius:10px;box-shadow:0 24px 80px rgba(var(--shade-rgb),.6);overflow:hidden}" +
    "#qg-pal input{width:100%;box-sizing:border-box;background:var(--field);border:0;border-bottom:1px solid var(--field-edge,#5E6A7E);padding:.9rem 1rem;color:var(--ink,#E7ECF4);font-family:Consolas,Cascadia Mono Web,monospace;font-size:.9rem;outline:none}" +
    "#qg-pal .qp-res{max-height:52vh;overflow-y:auto;padding:.3rem 0 .4rem}" +
    "#qg-pal .qp-gh{font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.16em;color:var(--amber,#F0A83C);padding:.55rem 1rem .2rem}" +
    "#qg-pal .qp-row{padding:.42rem 1rem;cursor:pointer}" +
    "#qg-pal .qp-row.sel{background:var(--surface2,#151C27)}" +
    "#qg-pal .qp-row .rl{color:var(--ink,#E7ECF4);font-size:.85rem}" +
    "#qg-pal .qp-row .rs{color:var(--muted,#8B96A8);font-size:.72rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    "#qg-pal .qp-row.full .rs{white-space:normal}" +
    "#qg-pal .qp-row.locked .rs{color:var(--amber,#F0A83C)}" +
    "#qg-pal .qp-hint{font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.1em;color:var(--faint,#5B6577);padding:.5rem 1rem;border-top:1px solid var(--line,#212A38)}" +
    "@media (max-width:480px){#qg-pal{padding-top:6vh}#qg-pal .qp-res{max-height:60vh}}" +
    "@media (hover:none),(max-width:767px){#qg-pal .qp-hint{display:none}}";
  document.head.appendChild(palCss);

  // the public site on quantgpt.co (Vercel); the member pages, and every
  // link inside them that used to be a sub-link in the old drawer, come
  // from the sidebar map (tiers.py: each item and its `find` list)
  var PAGES = [
    ["https://quantgpt.co/learn", "Learn", "tutorials guides curriculum how to lessons education"],
    ["https://quantgpt.co/learn/become-a-quant.html", "Learn: become a quant", "curriculum quant lessons course"],
    ["https://quantgpt.co/learn/connect-claude.html", "Learn: connect Claude", "claude setup mcp tutorial"],
    ["https://quantgpt.co/learn/connect-chatgpt.html", "Learn: connect ChatGPT", "chatgpt setup mcp tutorial"],
    ["https://quantgpt.co/learn/verdict.html", "Learn: reading a verdict", "findings data validated no edge tradeoff"],
    ["https://quantgpt.co/library", "Library (browse)", "strategy library browse edges documented"],
    ["https://quantgpt.co/transmissions", "Transmissions", "announcements emails dispatches news"],
    ["https://quantgpt.co", "QuantGPT.co (home)", "landing marketing public site pricing"]];
  // a page locked for this account: the sidebar's items and the surfaces
  // (window.qgTiers) that say locked, matched by path; the row keeps the
  // item's key and the plan that opens it, so choosing it opens the card
  function palPath(u) { return String(u || "").replace(/[?#].*$/, "").replace(/\/$/, "") || "/"; }
  function palLock(url) {
    var t = window.qgTiers || TIERS, hit = null;
    if (!t || !url || url.charAt(0) !== "/") return null;
    var p = palPath(url);
    function test(x) {
      if (hit || !x || !x.locked || !x.path || x.path.charAt(0) !== "/") return;
      var q = palPath(x.path);
      if (q === p || (q !== "/" && p.indexOf(q + "/") === 0)) hit = { key: x.key, min: x.min || "" };
    }
    ((t.nav && t.nav.groups) || []).forEach(function (g) { (g.items || []).forEach(test); });
    (t.surfaces || []).forEach(test);
    return hit;
  }
  function palMark(r) {
    if (r._lk !== undefined) return r;
    r._lk = palLock(r.url);
    if (r._lk) {
      r.locked = true; r.key = r._lk.key; r.min = r._lk.min;
      var up = ((TIERS && TIERS.upsells) || {})[r.min] || {};
      r.sub = up.label ? "Opens on " + up.label : "Locked";
    }
    return r;
  }
  // every page and deep link the palette offers: the sidebar's items, then
  // their find lists (deep), then the account's, then the public site. The
  // line under a row is its section; only the public site shows its address
  function palIndex() {
    var rows = [], seen = {};
    function add(label, url, words, deep, group) {
      if (!url || url === "#" || seen[url]) return;
      seen[url] = 1;
      rows.push(palMark({ label: label, sub: group || url, url: url, words: words || "", deep: !!deep }));
    }
    var groups = NAVMAP ? NAVMAP.groups : FALLBACK;
    groups.forEach(function (g) { g.items.forEach(function (it) { add(it.label, it.path, it.words, false, g.label); }); });
    var ac = (NAVMAP && NAVMAP.account) || { label: "Account", path: "/account", find: [],
      words: "account billing keys password settings avatar handle sign out logout plan" };
    add(ac.label, ac.path, ac.words, false, ac.label);
    groups.forEach(function (g) { g.items.forEach(function (it) {
      (it.find || []).forEach(function (f) { add(it.label + ": " + f.label, f.path, "", true, g.label); }); }); });
    (ac.find || []).forEach(function (f) { add(ac.label + ": " + f.label, f.path, "", true, ac.label); });
    PAGES.forEach(function (p) { add(p[1], p[0], p[2]); });
    return rows;
  }
  var pal = null, palRows = [], palSel = 0, palTimer = null, palSeq = 0;
  function palBuild() {
    if (pal) return;
    pal = document.createElement("div");
    pal.id = "qg-pal";
    pal.setAttribute("role", "dialog");
    pal.setAttribute("aria-modal", "true");
    pal.setAttribute("aria-label", "Search QuantGPT");
    pal.innerHTML = "<div class='qp-box'>" +
      "<input type='text' placeholder='Find a page, strategy, thread, backtest or term' aria-label='Search QuantGPT' maxlength='64'>" +
      "<div class='qp-res' role='listbox'></div>" +
      "<div class='qp-hint'>Arrow keys to move, Enter to open, Esc to close</div></div>";
    document.body.appendChild(pal);
    pal.addEventListener("click", function (e) { if (e.target === pal) palClose(); });
    var inp = pal.querySelector("input");
    inp.addEventListener("input", function () {
      palRender(inp.value);
      clearTimeout(palTimer);
      palTimer = setTimeout(function () { palFetch(inp.value); }, 200);
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); palMove(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); palMove(-1); }
      else if (e.key === "Enter") { e.preventDefault(); palGo(); }
    });
  }
  var GROUP_NAMES = { pages: "Pages", library: "Strategy library",
                      forum: "Forum", studies: "Your backtests",
                      glossary: "Glossary" };
  var palServer = [];
  function palPages(q) {
    q = q.trim().toLowerCase();
    var rows = palIndex();
    // an empty query lists the pages; the deep links wait for a word
    if (!q) return rows.filter(function (r) { return !r.deep; });
    return rows.filter(function (r) {
      return (r.label + " " + r.words).toLowerCase().indexOf(q) >= 0;
    });
  }
  function palRender(q) {
    var res = pal.querySelector(".qp-res");
    var groups = [];
    var pages = palPages(q);
    if (pages.length) groups.push({ kind: "pages", rows: pages });
    groups = groups.concat(palServer);
    res.innerHTML = "";
    palRows = [];
    groups.forEach(function (g) {
      var gh = document.createElement("div");
      gh.className = "qp-gh";
      gh.textContent = GROUP_NAMES[g.kind] || g.kind;
      res.appendChild(gh);
      g.rows.forEach(function (r) {
        palMark(r);
        var d = document.createElement("div");
        d.className = "qp-row" + (r.locked ? " locked" : "");
        d.setAttribute("role", "option");
        var rl = document.createElement("span"); rl.className = "rl"; rl.textContent = r.label;
        var rs = document.createElement("span"); rs.className = "rs"; rs.textContent = r.sub || "";
        d.appendChild(rl); d.appendChild(rs);
        d.onclick = function () { palOpenRow(r, d); };
        d.onmousemove = function () { palSelect(palRows.indexOf(d)); };
        d._row = r;
        res.appendChild(d);
        palRows.push(d);
      });
    });
    if (!palRows.length && q.trim().length >= 2) {
      res.innerHTML = "<div class='qp-gh'>Nothing found for that. Try another word.</div>";
    }
    palSelect(0);
  }
  function palSelect(i) {
    if (!palRows.length) { palSel = 0; return; }
    palSel = Math.max(0, Math.min(i, palRows.length - 1));
    palRows.forEach(function (d, j) { d.classList.toggle("sel", j === palSel); });
    palRows[palSel].scrollIntoView({ block: "nearest" });
  }
  function palMove(d) { palSelect(palSel + d); }
  function palGo() { if (palRows.length) palOpenRow(palRows[palSel]._row, palRows[palSel]); }
  var palActed = false;
  function palLog(action, label) {
    var q = pal ? pal.querySelector("input").value.trim() : "";
    if (q.length < 2) return;
    try {
      navigator.sendBeacon("/api/search/log", new Blob(
        [JSON.stringify({ q: q, action: action, label: label || "" })],
        { type: "application/json" }));
    } catch (e) {}
  }
  function palOpenRow(r, d) {
    palActed = true;
    palLog("open", r.label);
    // a locked page opens its plan card here, with no page load
    if (r.locked) { palClose(); tierModal(r.key); return; }
    if (r.url) { location.href = r.url; palClose(); }
    else d.classList.toggle("full");  // glossary: definition expands in place
  }
  function palFetch(q) {
    q = q.trim();
    if (q.length < 2) { palServer = []; palRender(q); return; }
    var seq = ++palSeq;
    fetch("/api/search?q=" + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (seq !== palSeq) return;  // a newer query is in flight
        palServer = (d && d.groups) || [];
        palRender(q);
      }).catch(function () {});
  }
  function palOpen() {
    menuOpen(false);   // one overlay at a time: the phone menu closes first
    overlayQuiet("pal");
    palBuild();
    palActed = false;
    pal.classList.add("open");
    var inp = pal.querySelector("input");
    palRender(inp.value);
    if (inp.value.trim().length >= 2) palFetch(inp.value);
    inp.focus(); inp.select();
  }
  function palClose() {
    if (!pal || !pal.classList.contains("open")) return;
    if (!palActed) palLog("abandoned");  // typed something real, found nothing
    pal.classList.remove("open");
  }
  document.getElementById("lt-idx").onclick = palOpen;
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    var typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" ||
                       t.isContentEditable);
    if (e.key === "Escape") { palClose(); return; }
    if (typing) return;
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); palOpen();
    } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey &&
               (e.key === "k" || e.key === "K")) {
      e.preventDefault(); palOpen();
    }
  });
  // Ctrl+K should work even while typing in some other input
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey &&
        (e.key === "k" || e.key === "K") && !(pal && pal.classList.contains("open"))) {
      e.preventDefault(); palOpen();
    }
  });
  // the lights and Search are real buttons: Enter and Space are built in

  // ---- tiers: the ladder, the locks, and the upgrade card ----
  var tierCss = document.createElement("style");
  tierCss.textContent =
    "body.tier-quantgpt .opsbar .stat{display:none}" +
    "#qg-tier{position:fixed;inset:0;z-index:420;background:rgba(6,8,14,.76);display:none;align-items:center;justify-content:center;padding:1rem}" +
    "#qg-tier.open{display:flex}" +
    "#qg-tier .tb{width:520px;max-width:100%;background:var(--surface,#10151E);border:1px solid var(--amber,#F0A83C);border-radius:10px;box-shadow:0 24px 80px rgba(var(--shade-rgb),.6);font-family:var(--sans,'Segoe UI',Selawik,sans-serif)}" +
    "#qg-tier .th{display:flex;justify-content:space-between;align-items:center;gap:.6rem;padding:.65rem .95rem;border-bottom:1px solid var(--line,#212A38);font-family:Consolas,Cascadia Mono Web,monospace;font-size:.62rem;letter-spacing:.16em;color:var(--amber,#F0A83C)}" +
    "#qg-tier .tx{background:none;border:0;color:var(--muted,#8B96A8);cursor:pointer;font-size:16px;padding:2px 6px}" +
    "#qg-tier .tp{padding:1rem .95rem .4rem}" +
    "#qg-tier .big{font-family:var(--cond,sans-serif);font-size:2rem;font-weight:700;letter-spacing:.04em;color:var(--ink,#E7ECF4);line-height:1}" +
    "#qg-tier .big s{color:var(--faint,#5B6577);font-weight:400;font-size:1.1rem;margin-right:.5rem}" +
    "#qg-tier .big small{font-size:.9rem;color:var(--muted,#8B96A8);font-weight:400}" +
    "#qg-tier .sub{color:var(--muted,#8B96A8);font-size:.8rem;margin-top:.35rem}" +
    "#qg-tier ul{list-style:none;margin:.7rem 0 0;padding:0}" +
    "#qg-tier li{color:var(--muted,#8B96A8);font-size:.9rem;padding:.3rem 0;border-top:1px solid var(--line,#212A38)}" +
    "#qg-tier li::before{content:'\\25B8 ';color:var(--amber,#F0A83C)}" +
    "#qg-tier .tf{display:flex;gap:.6rem;padding:.8rem .95rem .95rem;flex-wrap:wrap}" +
    // Not now and Close are the house secondary button (desk.css); only the size stays here
    "#qg-tier .no{min-height:44px}" +
    "#qg-tier .fine{font-family:var(--sans,system-ui);font-size:.8rem;letter-spacing:0;color:var(--muted,#8B96A8);padding:0 .95rem .8rem;line-height:1.6}" +
    // sentence case on all three cards: Upgrade, Business (talk to us) and Soon (coming)
    "#qg-tier .th.plain{font-family:var(--sans,'Segoe UI',Selawik,sans-serif);font-size:.95rem;letter-spacing:0;color:var(--ink,#E7ECF4);font-weight:600}" +
    "#qg-tier .lede{color:var(--muted,#8B96A8);font-size:.9rem;line-height:1.6;margin:0}" +
    "#qg-tier .tf .go.plain{font-family:var(--sans,'Segoe UI',Selawik,sans-serif);letter-spacing:0}";
  document.head.appendChild(tierCss);
  var tierBox = null, tierBack = null;
  function escHtml(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML.replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  // The plan card, three ways (docs/NAV.md):
  //   Soon      the Runner while runner.MODE is not "on": the coming line
  //             and the University chapter, no price
  //   Business  a page that opens on Business (Team): "Talk to us" to the
  //             contact page, no price
  //   Upgrade   what plan opens it, the price on top of what is already
  //             paid, the list of what opens. Same layout after.
  function tierModal(surfaceKey, labelOverride, minOverride) {
    var it = ITEMS[surfaceKey] || null, s = null;
    ((TIERS && TIERS.surfaces) || []).forEach(function (x) { if (x.key === surfaceKey) s = x; });
    var label = labelOverride || (it ? it.label : s ? s.label : "This page");
    var cards = (NAVMAP && NAVMAP.cards) || null;
    var min = minOverride || (it && it.min) || (s && s.min) || "";
    // the rung that opens THIS page: a QuantGPT Pro page offers QuantGPT Pro, even to an
    // account whose next rung is QuantGPT (which would not open it)
    var ups = (TIERS && TIERS.upsells) || {};
    var u = ups[min] || (TIERS && TIERS.upsell);
    var html;
    overlayQuiet("tier");
    if (it && it.soon && cards) {
      html = "<div class='tb'><div class='th plain'><span>" + escHtml(label) + "</span>" +
        "<button class='tx' type='button' aria-label='Close'>&times;</button></div>" +
        "<div class='tp'><p class='lede'>" + escHtml(cards.coming) + "</p></div>" +
        "<div class='tf'>" + (cards.chapter ? "<a class='qg-btn go plain' href='" + escHtml(cards.chapter) +
          "'>Read the University chapter</a>" : "") +
        "<button class='qg-btn secondary no' type='button'>Close</button></div></div>";
    } else if (cards && (min === "institutional" || (u && u.to === "institutional"))) {
      html = "<div class='tb'><div class='th plain'><span>" + escHtml(label) + " is part of Business</span>" +
        "<button class='tx' type='button' aria-label='Close'>&times;</button></div>" +
        "<div class='tp'><p class='lede'>" + escHtml(cards.business) + "</p></div>" +
        "<div class='tf'><a class='qg-btn go plain' href='" + escHtml(cards.contact) + "'>Talk to us</a>" +
        "<button class='qg-btn secondary no' type='button'>Not now</button></div></div>";
    } else if (!u) {
      location.href = "/account"; return;
    } else {
      var items = "";
      (u.unlocks || []).forEach(function (line) { items += "<li>" + escHtml(line) + "</li>"; });
      html =
        "<div class='tb'><div class='th plain'><span>" + escHtml(label) + " opens on " + escHtml(u.label) + "</span>" +
        "<button class='tx' type='button' aria-label='Close'>&times;</button></div>" +
        // the plan's own price, big; what it adds to a paid plan sits in
        // the line under it (a struck $149 beside +$100 read as a sale)
        "<div class='tp'><div class='big'>$" + escHtml(u.price) + "<small> a month</small></div>" +
        "<div class='sub'>" + escHtml(u.line) + ". The same pages, and the locks open.</div>" +
        "<ul>" + items + "</ul></div>" +
        "<div class='tf'><a class='qg-btn go plain' href='" + escHtml(u.href) + "'>Upgrade to " + escHtml(u.label) + "</a>" +
        "<button class='qg-btn secondary no' type='button'>Not now</button></div>" +
        "<div class='fine'>" + escHtml(u.fine || "Billed through Stripe. Cancel any time from your account.") + "</div></div>";
    }
    if (!tierBox) {
      tierBox = document.createElement("div");
      tierBox.id = "qg-tier";
      tierBox.setAttribute("role", "dialog");
      tierBox.setAttribute("aria-modal", "true");
      document.body.appendChild(tierBox);
      tierBox.addEventListener("click", function (e) { if (e.target === tierBox) tierClose(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") tierClose(); });
    }
    tierBox.setAttribute("aria-label", "Plan card: " + label);
    tierBox.innerHTML = html;
    tierBox.querySelector(".tx").onclick = tierClose;
    tierBox.querySelector(".no").onclick = tierClose;
    if (!tierBox.classList.contains("open")) tierBack = document.activeElement;
    tierBox.classList.add("open");
    (tierBox.querySelector(".go") || tierBox.querySelector(".no")).focus();
  }
  // One overlay at a time (ease rule 6): opening one of nav.js's cards,
  // the search, a "?" (explain.js) or a tour (tour.js) puts the others
  // away. keep names the one that is opening.
  function overlayQuiet(keep) {
    if (keep !== "tier") tierClose();
    if (keep !== "pal") palClose();
    if (keep !== "help" && help) toggleHelp(false);
    if (window.qgWnHide) window.qgWnHide();
    if (window.qgRelHide) window.qgRelHide();
    try {
      if (keep !== "explain" && window.qgExplain && window.qgExplain.close) window.qgExplain.close();
      if (keep !== "tour" && window.qgTour && window.qgTour.isOpen && window.qgTour.isOpen()) window.qgTour.close();
    } catch (e) {}
  }
  window.qgOverlayQuiet = overlayQuiet;
  function tierClose() {
    if (!tierBox || !tierBox.classList.contains("open")) return;
    tierBox.classList.remove("open");
    // focus goes back to what opened the card
    if (tierBack && tierBack !== document.body && document.contains(tierBack)) {
      try { tierBack.focus(); } catch (e) {}
    }
    tierBack = null;
  }
  window.qgTierModal = tierModal;
  // held back for launch (tiers.HIDDEN, Brett 2026-10-08): links to a held
  // page leave every page, and with the futuretest switch off so does every
  // futuretest link and card ([data-futuretest]); founders keep them all.
  // A watcher catches the links a page draws later.
  var heldWatch = null;
  function heldLinks(t) {
    if (!t || t.founder) return;
    var held = t.held || [], ft = !!(t.switches && t.switches.futuretest);
    function isHeld(href) {
      var h = String(href || "");
      if (!ft && (h.indexOf("#futuretest") >= 0 || /^\/futuretest(\/|$|[?#])/.test(h))) return true;
      var p = h.replace(/^https:\/\/terminal\.quantgpt\.co/, "").replace(/[?#].*$/, "").replace(/\/$/, "");
      for (var i = 0; i < held.length; i++) {
        if (p === held[i] || p.indexOf(held[i] + "/") === 0) return true;
      }
      return false;
    }
    function sweep(root) {
      if (!root || !root.querySelectorAll) return;
      Array.prototype.forEach.call(root.querySelectorAll("a[href]"), function (a) {
        if (isHeld(a.getAttribute("href"))) a.hidden = true;
      });
    }
    // a futuretest call to action ([data-futuretest]) stays off by CSS, so a
    // page that unhides it later (the journal's Next step) cannot bring it back
    if (!ft && !document.getElementById("qg-ft-off")) {
      var st = document.createElement("style");
      st.id = "qg-ft-off";
      st.textContent = "[data-futuretest]{display:none!important}";
      document.head.appendChild(st);
    }
    sweep(document);
    if (!heldWatch && window.MutationObserver) {
      heldWatch = new MutationObserver(function (ms) {
        ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes || [], function (n) { if (n.nodeType === 1) sweep(n.parentNode || n); }); });
      });
      heldWatch.observe(document.body, { childList: true, subtree: true });
    }
  }
  // What's new (whats_new.py): /api/tiers/me carries whats_new {on, due,
  // unseen}. Help's link shows while the switch is on, with a dot while a
  // release is unseen; the card's script (static/whatsnew.js) loads only
  // when one is due and this page may hold it: never the tour, join,
  // sign-in, checkout, welcome or terms pages, nor the log itself, and never
  // on a page a tour quieted (whatsnew.js checks the rest; the server keeps
  // a tour's mark for the sign-in session)
  var REL_NEVER = /^\/(tour|join|signin|signup|login|welcome|checkout|accept|reset|verify|start|oauth|auth|billing|whats-new|account\/fix-payment)(\/|$)/;
  function relDot(show) {
    var b = document.getElementById("lt-help");
    if (!b) return;
    var d = b.querySelector(".qg-rel-dot");
    if (show && !d) {
      d = document.createElement("span");
      d.className = "qg-rel-dot";
      d.setAttribute("aria-hidden", "true");
      b.appendChild(d);
      b.setAttribute("aria-label", "Help, something new");
    } else if (!show && d) {
      b.removeChild(d);
      b.removeAttribute("aria-label");
    }
  }
  window.qgRelDot = relDot;
  function relBoot(t) {
    var w = t && t.whats_new;
    if (!w || !w.on) return;
    relDot(w.unseen > 0);
    if (!(w.due > 0) || window.qgRelLoading || REL_NEVER.test(location.pathname)) return;
    if (/[?&](first|tour)=1(&|$)/.test(String(location.search || "")) || window.qgRelQuiet) return;
    window.qgRelLoading = true;
    var sc = document.createElement("script");
    sc.src = "/static/whatsnew.js?v=wn1";
    sc.defer = true;
    document.head.appendChild(sc);
  }
  function tierApply(t) {
    TIERS = t;
    window.qgTiers = t;
    if (t.plan) document.body.classList.add("tier-" + t.plan);
    if (t.founder) document.body.classList.add("tier-founder");
    renderNav(t.nav);
    paintOp();
    heldLinks(t);
    relBoot(t);
    try { document.dispatchEvent(new CustomEvent("qg:tiers", { detail: t })); } catch (e) {}
    var m = location.search.match(/[?&]locked=([a-z]+)/);
    if (m) {
      try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
      tierModal(m[1]);
    }
  }
  (function () {
    // the sidebar map changed shape (U3): a new key, so a tab never
    // paints a map cached for the old drawer with the new renderer
    var KEY = "qg_tiers2", cached = null;
    try {
      sessionStorage.removeItem("qg_tiers");
      var raw = sessionStorage.getItem(KEY);
      if (raw) { cached = JSON.parse(raw); if (Date.now() - cached.t > 300000) cached = null; }
    } catch (e) {}
    if (cached) tierApply(cached.v);
    // signed out (a public page): the card says so and signs in back to
    // this page, the fallback list stays, and the AI lights step aside
    function signedOut() {
      if (opHandle.textContent === "Your account") opHandle.textContent = "Sign in";
      document.getElementById("qg-op").setAttribute("href",
        "/signin?next=" + encodeURIComponent(location.pathname + location.search));
      document.body.classList.add("qg-signed-out");
      lights.hidden = true;
    }
    qgAuth.then(function (inn) {
      if (!inn) { signedOut(); return null; }
      return fetch("/api/tiers/me");
    }).then(function (r) {
      if (!r) return null;
      if (r.status === 401) signedOut();
      return r.ok ? r.json() : null;
    }).then(function (t) {
      if (!t || t.error) return;
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v: t })); } catch (e) {}
      if (!cached || JSON.stringify(cached.v) !== JSON.stringify(t)) tierApply(t);
      else { TIERS = t; window.qgTiers = t; }
    }).catch(function () {});
  })();

  // ---- Ask AI: the side-panel chat wired to the full tool set ----
  var agCss = document.createElement("style");
  agCss.textContent =
    "#qg-agent{position:fixed;top:0;right:0;bottom:0;z-index:350;width:420px;max-width:100vw;background:var(--surface,#10151E);border-left:1px solid var(--line2,#2E3A4D);box-shadow:-18px 0 48px rgba(4,6,10,.55);display:none;flex-direction:column;font-family:var(--sans,'Segoe UI',Selawik,sans-serif)}" +
    "#qg-agent.open{display:flex}" +
    "#qg-agent .ah{display:flex;align-items:center;gap:.6rem;padding:.65rem .9rem;border-bottom:1px solid var(--line,#212A38);font-size:.85rem;font-weight:650;color:var(--ink,#E7ECF4)}" +
    "#qg-agent .ah .sub{color:var(--faint,#5B6577);letter-spacing:.08em}" +
    "#qg-agent .ah button{margin-left:auto;background:none;border:0;color:var(--muted,#8B96A8);cursor:pointer;font-size:15px;padding:2px 6px}" +
    "#qg-agent .ah .aclr{margin-left:0;font-size:.78rem;font-weight:400}" +
    "#qg-agent .am{flex:1;overflow-y:auto;padding:.8rem .9rem;display:flex;flex-direction:column;gap:.7rem}" +
    "#qg-agent .msg{max-width:92%;border-radius:9px;padding:.55rem .75rem;font-size:.82rem;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}" +
    "#qg-agent .msg.u{align-self:flex-end;background:var(--surface2,#151C27);border:1px solid var(--line2,#2E3A4D);color:var(--ink,#E7ECF4)}" +
    "#qg-agent .msg.a{align-self:flex-start;background:transparent;border:1px solid var(--line,#212A38);color:var(--muted,#8B96A8)}" +
    "#qg-agent .msg.a b{color:var(--ink,#E7ECF4)}" +
    // the bring-your-own-AI card (the house allowance used up)
    "#qg-agent .msg.a.house{white-space:normal}#qg-agent .msg.a.house p{margin:.35rem 0}" +
    "#qg-agent .msg.a.house ol{margin:.35rem 0 .2rem;padding-left:1.3rem}#qg-agent .msg.a.house li{margin:.25rem 0}" +
    "#qg-agent .msg.a.house a{color:var(--ink,#E7ECF4);text-decoration:underline;cursor:pointer}" +
    "#qg-agent .msg img{max-width:100%;border-radius:6px;border:1px solid var(--line2,#2E3A4D);margin:.3rem 0;display:block}" +
    "#qg-agent .tchip{align-self:flex-start;font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.1em;color:var(--faint,#5B6577);border:1px solid var(--line,#212A38);border-radius:4px;padding:.15rem .5rem}" +
    "#qg-agent .tchip.run{color:var(--amber,#F0A83C);border-color:var(--amber,#F0A83C)}" +
    "#qg-agent .tchip.err{color:var(--down);border-color:var(--down)}" +
    "#qg-agent .af{display:flex;gap:.5rem;padding:.7rem .9rem;border-top:1px solid var(--line,#212A38)}" +
    "#qg-agent textarea{flex:1;background:var(--field);border:1px solid var(--field-edge,#5E6A7E);border-radius:7px;color:var(--ink,#E7ECF4);font:inherit;font-size:.82rem;padding:.5rem .65rem;resize:none;height:60px;outline:none}" +
    "#qg-agent textarea:focus{border-color:var(--amber,#F0A83C)}" +
    "#qg-agent .asend:disabled{opacity:.5;cursor:wait}" +
    "#qg-agent .anote{font-size:.74rem;color:var(--faint,#5B6577);padding:0 .9rem .6rem}" +
    "#qg-agent .akey{display:flex;gap:.45rem;align-items:center;padding:.5rem .9rem;border-bottom:1px solid var(--line,#212A38);font-size:.78rem;color:var(--muted,#8B96A8);flex-wrap:wrap}" +
    "#qg-agent .akey select,#qg-agent .akey input{background:var(--field);border:1px solid var(--field-edge,#5E6A7E);border-radius:5px;color:var(--ink,#E7ECF4);font-family:Consolas,Cascadia Mono Web,monospace;font-size:.62rem;padding:.3rem .45rem;min-width:0}" +
    "#qg-agent .akey input{flex:1 1 9rem}" +
    "#qg-agent .akey .akc{color:var(--muted,#8B96A8);text-decoration:underline;text-underline-offset:2px}" +
    "#qg-agent .akey .akc:hover{color:var(--ink,#E7ECF4)}" +
    "@media (max-width:600px){#qg-agent{width:100vw}}" +
    // full-page mount (/chat): the same panel, no drawer chrome
    "#qg-agent.inline{position:static;display:flex;width:auto;max-width:none;height:100%;min-height:0;border-left:0;box-shadow:none}" +
    "#qg-agent.inline .ax{display:none}" +
    // a backtest drawn inline under its tool chip
    "#qg-agent .qg-viz{align-self:stretch;border:1px solid var(--line2,#2E3A4D);border-radius:8px;padding:.55rem .65rem;background:var(--field)}" +
    "#qg-agent .qg-viz canvas{width:100%;height:auto;display:block}" +
    "#qg-agent .qg-viz .vh{font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.14em;color:var(--amber,#F0A83C);margin-bottom:.35rem}" +
    "#qg-agent .qg-viz .vs{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-family:Consolas,Cascadia Mono Web,monospace;font-size:.6rem;letter-spacing:.06em;color:var(--muted,#8B96A8);margin-top:.4rem}" +
    "#qg-agent .qg-viz .vs b{color:var(--ink,#E7ECF4)}" +
    "#qg-agent .qg-viz .vf{font-family:Consolas,Cascadia Mono Web,monospace;font-size:.54rem;letter-spacing:.06em;color:var(--faint,#5B6577);margin-top:.35rem}" +
    // the disagreement: the case for and the case against, side by side
    "#qg-agent .qg-dis{align-self:stretch;border:1px solid var(--line2,#2E3A4D);border-radius:8px;background:var(--field);overflow:hidden}" +
    "#qg-agent .qg-dis .dh{display:flex;justify-content:space-between;gap:.6rem;padding:.5rem .65rem;border-bottom:1px solid var(--line,#212A38);font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.14em;color:var(--amber,#F0A83C)}" +
    "#qg-agent .qg-dis .dh b{color:var(--ink,#E7ECF4)}" +
    "#qg-agent .qg-dis .dh b.bad{color:var(--down)}#qg-agent .qg-dis .dh b.mixed{color:var(--amber,#F0A83C)}#qg-agent .qg-dis .dh b.good{color:var(--up)}" +
    "#qg-agent .qg-dis .dc{display:grid;grid-template-columns:1fr 1fr;gap:0}" +
    "#qg-agent .qg-dis .dc>div{padding:.5rem .65rem;font-size:.74rem;line-height:1.5;color:var(--muted,#8B96A8)}" +
    "#qg-agent .qg-dis .dc>div+div{border-left:1px solid var(--line,#212A38)}" +
    "#qg-agent .qg-dis .dl{font-family:Consolas,Cascadia Mono Web,monospace;font-size:.54rem;letter-spacing:.14em;color:var(--faint,#5B6577);margin-bottom:.3rem}" +
    "#qg-agent .qg-dis .dc b{color:var(--ink,#E7ECF4);font-weight:600}" +
    "#qg-agent .qg-dis .dc .no{color:var(--down)}#qg-agent .qg-dis .dc .fl{color:var(--amber,#F0A83C)}" +
    "#qg-agent .qg-dis .ds{padding:.5rem .65rem;border-top:1px solid var(--line,#212A38);font-size:.78rem;line-height:1.55;color:var(--muted,#8B96A8);white-space:pre-wrap}" +
    "#qg-agent .qg-dis .ds .dl{margin-bottom:.25rem}" +
    "@media (max-width:600px){#qg-agent .qg-dis .dc{grid-template-columns:1fr}#qg-agent .qg-dis .dc>div+div{border-left:0;border-top:1px solid var(--line,#212A38)}}";
  document.head.appendChild(agCss);
  var AG_KEY = "qg_agent_chat";
  var AG_CONF = "qg_agent_conf";   // {provider, key, model}; this browser only
  var agBusy = false, agCfg = null;
  // one panel, every AI: two wire protocols cover the market. "openai"
  // protocol = the compatible dialect OpenAI/Gemini/Groq/OpenRouter/
  // Perplexity/Ollama all speak; "anthropic" = Claude native.
  var AG_PROVIDERS = {
    anthropic:  { label: "Claude (Anthropic)", proto: "anthropic",
                  url: "https://api.anthropic.com/v1/messages",
                  model: "claude-opus-5", tools: true, ph: "sk-ant-..." },
    openai:     { label: "ChatGPT (OpenAI)", proto: "openai",
                  url: "https://api.openai.com/v1/chat/completions",
                  model: "gpt-5.2", tools: true, ph: "sk-..." },
    gemini:     { label: "Gemini (Google)", proto: "openai",
                  url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                  model: "gemini-2.5-pro", tools: true, ph: "AIza..." },
    groq:       { label: "Llama (Groq)", proto: "openai",
                  url: "https://api.groq.com/openai/v1/chat/completions",
                  model: "llama-3.3-70b-versatile", tools: true, ph: "gsk_..." },
    grok:       { label: "Grok (xAI)", proto: "openai",
                  url: "https://api.x.ai/v1/chat/completions",
                  model: "grok-4", tools: true, ph: "xai-..." },
    openrouter: { label: "Any model (OpenRouter)", proto: "openai",
                  url: "https://openrouter.ai/api/v1/chat/completions",
                  model: "anthropic/claude-sonnet-5", tools: true, ph: "sk-or-..." },
    perplexity: { label: "Perplexity", proto: "openai",
                  url: "https://api.perplexity.ai/chat/completions",
                  model: "sonar-pro", tools: false, ph: "pplx-..." },
    ollama:     { label: "Local (Ollama)", proto: "openai",
                  url: "http://localhost:11434/v1/chat/completions",
                  model: "llama3.1", tools: true, ph: "(no key needed)" },
    // the house model (house.py): QuantGPT's key through our own proxy,
    // OFF until a founder turns it on; offered only when the server says so
    house:      { label: "QuantGPT's AI (no key needed)", proto: "anthropic",
                  url: "/api/agent/house", model: "house", tools: true,
                  ph: "(no key needed)" }
  };
  // Every word the panel says about the house allowance, in one place
  // (Brett keeps editorial control). {spent}, {allowance} and {date} are
  // filled in below; nothing else is HTML.
  var HOUSE_COPY = {
    status: "{spent} of {allowance} this month",   // the key row and the welcome line
    statusFounder: "no limit",
    // the card, once the allowance is used up ("month") or today's part of it ("day")
    heading: { month: "Your house allowance for this month is used up.",
               day: "Your house allowance for today is used up." },
    why: "The house model is here to show what QuantGPT can do. Members run their own AI on it, and that has no limit.",
    connect: { link: "Connect your AI", text: "Add QuantGPT to Claude or ChatGPT at /connect. Same tools, your own model." },
    ownKey: { link: "Use your own AI", text: "Pick your AI at the top of this panel and paste its API key: Claude, ChatGPT, Gemini or any OpenAI-compatible provider. It stays in this browser." },
    returns: { month: "The allowance returns on {date}.",
               day: "Today's part of it resets at midnight UTC, on {date}. The month's allowance is {allowance}." }
  };
  var agHouse = null;   // GET /api/agent/house, once fetched
  function agMoney(n) { return n == null ? "" : "$" + Number(n).toFixed(2); }
  function agDate(s) {
    // "2026-10-01" as "October 1, 2026"; anything else as sent
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return String(s || "");
    var names = ["January", "February", "March", "April", "May", "June", "July", "August",
                 "September", "October", "November", "December"];
    return names[parseInt(m[2], 10) - 1] + " " + parseInt(m[3], 10) + ", " + m[1];
  }
  function agFill(t, x) {
    return String(t).replace(/\{spent\}/g, agMoney(x.spent)).replace(/\{allowance\}/g, agMoney(x.allowance))
                    .replace(/\{date\}/g, agDate(x.resets));
  }
  // one line: "$1.20 of $4.90 this month" (founders: no limit)
  function agHouseStatus() {
    var m = agHouse && agHouse.month;
    if (!m || m.allowance == null) return HOUSE_COPY.statusFounder;
    return agFill(HOUSE_COPY.status, m);
  }
  // the card: shown in place of a one-line refusal when the house model
  // refuses for the month or the day (x = the refusal's payload), and at
  // load when the status already says so
  function agHouseCard(x) {
    var m = document.getElementById("qg-agent-msgs");
    if (!m || !x) return null;
    var old = document.getElementById("qg-house-card");
    if (old) old.remove();
    var kind = x.refused === "day" ? "day" : "month";
    var d = document.createElement("div");
    d.className = "msg a house";
    d.id = "qg-house-card";
    function text(tag, s) { var el = document.createElement(tag); el.textContent = s; return el; }
    d.appendChild(text("b", HOUSE_COPY.heading[kind]));
    d.appendChild(text("p", HOUSE_COPY.why));
    var ol = document.createElement("ol");
    var li1 = document.createElement("li"), a1 = document.createElement("a");
    a1.href = "/connect"; a1.textContent = HOUSE_COPY.connect.link;
    li1.appendChild(a1); li1.appendChild(document.createTextNode(": " + HOUSE_COPY.connect.text));
    var li2 = document.createElement("li"), a2 = document.createElement("a");
    a2.href = "#"; a2.textContent = HOUSE_COPY.ownKey.link;
    a2.onclick = function (e) {
      e.preventDefault();
      agPickOwn();                         // the key row shows the providers and the key field
      var kin = document.getElementById("qg-agent-keyin");
      if (kin) kin.focus();
    };
    li2.appendChild(a2); li2.appendChild(document.createTextNode(": " + HOUSE_COPY.ownKey.text));
    var li3 = text("li", agFill(HOUSE_COPY.returns[kind], kind === "day"
      ? { spent: x.spent, allowance: agHouse && agHouse.month ? agHouse.month.allowance : null, resets: x.resets }
      : x));
    ol.appendChild(li1); ol.appendChild(li2); ol.appendChild(li3);
    d.appendChild(ol);
    m.appendChild(d);
    m.scrollTop = m.scrollHeight;
    return d;
  }
  function agHouseOn() { return !!(agHouse && agHouse.enabled); }
  function agLoadHouse() {
    return fetch("/api/agent/house", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : { enabled: false }; })
      .catch(function () { return { enabled: false }; })
      .then(function (h) {
        agHouse = h;
        var c = agConf();
        if (c && c.provider === "house" && !agHouseOn()) agSetConf(null);   // switched off since
        // "none" is the picker left open on an earlier page: it never
        // outlives the page view, so the row drops back on the next load
        if (c && c.provider === "none") { agSetConf(null); c = null; }
        if (!c && agHouseOn()) agSetConf({ provider: "house", key: "", model: "house" });
        if (agPanel) {
          agRenderKeyRow();
          var st = document.getElementById("qg-agent-setup");
          // the welcome line names the AI that answers: QuantGPT's own where
          // it is on for this member, else the two ways to bring one
          if (st) {
            var c2 = agConf();
            if (c2 && c2.provider === "house" && agHouseOn()) st.outerHTML = agSetupHtml();
            else if (agApiKey()) st.remove();
          }
          // already out for the month or the day: the card before the first post
          var cc = agConf();
          if (h.exhausted && cc && cc.provider === "house") agHouseCard(h.exhausted);
        }
        return h;
      });
  }
  function agHist() {
    try { return JSON.parse(localStorage.getItem(AG_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function agSave(h) {
    try { localStorage.setItem(AG_KEY, JSON.stringify(h.slice(-40))); } catch (e) {}
  }
  function agConf() {
    try { return JSON.parse(localStorage.getItem(AG_CONF) || "null"); }
    catch (e) { return null; }
  }
  function agSetConf(c) {
    try {
      if (c) localStorage.setItem(AG_CONF, JSON.stringify(c));
      else localStorage.removeItem(AG_CONF);
    } catch (e) {}
  }
  function agProvider() {
    var c = agConf();
    return (c && AG_PROVIDERS[c.provider]) ? AG_PROVIDERS[c.provider] : null;
  }
  // was referenced by agBuild but never defined: the ReferenceError killed
  // the panel before the provider row rendered, so the AGENT light did
  // nothing on a fresh browser. Ollama needs no key; every other provider does.
  function agApiKey() {
    var c = agConf();
    if (!c) return "";
    return c.key || (c.provider === "ollama" ? "local" : c.provider === "house" ? "house" : "");
  }
  var agPanel = null;
  var CHART_URL_RE = /https:\/\/terminal\.quantgpt\.co\/static\/chartpacks\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\.png/g;
  function agRenderText(el, text) {
    el.textContent = "";
    var parts = String(text).split(CHART_URL_RE);
    var urls = String(text).match(CHART_URL_RE) || [];
    for (var i = 0; i < parts.length; i++) {
      el.appendChild(document.createTextNode(parts[i]));
      if (urls[i]) {
        var img = document.createElement("img");
        img.src = urls[i]; img.alt = "chart"; img.loading = "lazy";
        el.appendChild(img);
      }
    }
  }
  // the screen reader's copy of the agent's state (qg-agent-live)
  function agSay(text) {
    var l = document.getElementById("qg-agent-live");
    if (!l) return;
    l.textContent = "";
    setTimeout(function () { l.textContent = String(text || ""); }, 60);
  }
  function agAddMsg(cls, text) {
    var m = document.getElementById("qg-agent-msgs");
    var d = document.createElement("div");
    d.className = "msg " + cls;
    agRenderText(d, text);
    m.appendChild(d);
    m.scrollTop = m.scrollHeight;
    return d;
  }
  function agAddChip(name, status) {
    var m = document.getElementById("qg-agent-msgs");
    var c = document.createElement("div");
    c.className = "tchip " + (status === "running" ? "run" : status === "error" ? "err" : "");
    c.textContent = name + (status === "running" ? " ..." :
                     status === "error" ? " FAILED" : " DONE");
    c.id = "chip-" + name;
    var old = document.getElementById("chip-" + name);
    if (old) old.replaceWith(c); else m.appendChild(c);
    m.scrollTop = m.scrollHeight;
  }
  // A backtest drawn inline: the tool endpoint attaches a compact viz
  // (equity curves, finding, stats) whenever a tool result is a backtest,
  // so the chat-first tier sees the run without a chart pack.
  function agAddViz(v) {
    var m = document.getElementById("qg-agent-msgs");
    if (!m || !v || !v.strat || v.strat.length < 2) return;
    var card = document.createElement("div");
    card.className = "qg-viz";
    var head = document.createElement("div"); head.className = "vh";
    head.textContent = "// " + (v.name || "BACKTEST") + " \u00b7 " + String(v.finding || "").toUpperCase();
    card.appendChild(head);
    var cv = document.createElement("canvas");
    cv.width = 640; cv.height = 220;
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "equity curve, strategy in amber, benchmark in grey, " + (v.start || "") + " to " + (v.end || ""));
    card.appendChild(cv);
    var s = v.stats || {}, b = v.bench_stats || {};
    function f(x, pct) { return (x == null || isNaN(x)) ? "--" : pct ? (x * 100).toFixed(1) + "%" : Number(x).toFixed(2); }
    var st = document.createElement("div"); st.className = "vs";
    st.innerHTML = "<span>CAGR <b>" + f(s.cagr, true) + "</b></span><span>SHARPE <b>" + f(s.sharpe) + "</b></span>" +
      "<span>MAX DD <b>" + f(s.maxdd, true) + "</b></span><span>PSR <b>" + f(s.psr) + "</b></span>" +
      "<span>BENCH CAGR <b>" + f(b.cagr, true) + "</b></span>" +
      (v.random ? "<span>VS RANDOM <b>" + escHtml(v.random) + "</b></span>" : "");
    card.appendChild(st);
    var foot = document.createElement("div"); foot.className = "vf";
    foot.textContent = (v.start || "") + " TO " + (v.end || "") + " \u00b7 " + (v.n || 0) + " PERIODS \u00b7 GROSS RETURNS, COSTS UNMODELLED";
    card.appendChild(foot);
    m.appendChild(card);
    drawViz(cv, v);
    m.scrollTop = m.scrollHeight;
  }
  function drawViz(cv, v) {
    var ctx = cv.getContext("2d"), W = cv.width, H = cv.height, pad = 26;
    var a = v.strat || [], b = (v.bench || []).length === a.length ? v.bench : [];
    var all = a.concat(b).filter(function (x) { return x > 0; });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    if (!(hi > lo)) { hi = lo * 1.01 + 0.01; }
    var useLog = hi / lo > 4;
    function y(val) {
      var t = useLog ? (Math.log(val) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) : (val - lo) / (hi - lo);
      return H - pad - t * (H - 2 * pad);
    }
    function x(i, n) { return pad + i / (n - 1) * (W - 2 * pad); }
    ctx.clearRect(0, 0, W, H);
    var tk = window.QGTheme ? QGTheme.token : function (n, f) { return f; };
    ctx.strokeStyle = tk("--pg-nav-grid", "#212A38"); ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gy = pad + g * (H - 2 * pad) / 4;
      ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(W - pad, gy); ctx.stroke();
    }
    function line(series, color, w) {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath();
      series.forEach(function (val, i) {
        var px = x(i, series.length), py = y(Math.max(val, lo));
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      });
      ctx.stroke();
    }
    if (b.length) line(b, tk("--pg-nav-bench", "#8B96A8"), 1.2);
    line(a, tk("--amber", "#F0A83C"), 2);
    ctx.fillStyle = tk("--pg-nav-dim", "#5B6577"); ctx.font = "10px Consolas,Cascadia Mono Web,monospace";
    ctx.fillText(hi.toFixed(1) + "x", 2, pad + 3);
    ctx.fillText(lo.toFixed(1) + "x", 2, H - pad + 3);
    ctx.fillText(useLog ? "LOG" : "LIN", W - pad - 22, pad + 3);
  }
  // Evidence grounding: after the turn, every figure in the answer is
  // checked against the tool output the model saw (server-side, pure
  // text). Figures that appear in no tool output are flagged under the
  // message. Silent when there was no tool output to check against.
  function agGround(text, evidence, el) {
    if (!text || !evidence.length) return Promise.resolve();
    return fetch("/api/agent/ground", { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: text, evidence: evidence }) })
      .then(function (r) { return r.json(); })
      .then(function (g) {
        var bad = (g && g.ungrounded) || [];
        if (!bad.length) return;
        var n = document.createElement("div");
        n.className = "tchip err";
        n.textContent = "! " + bad.length + (bad.length > 1 ? " figures" : " figure") +
          " in this answer appear in no tool output: " +
          bad.slice(0, 4).map(function (u) { return u.text; }).join(", ") +
          (bad.length > 4 ? ", ..." : "");
        el.parentNode.insertBefore(n, el.nextSibling);
      })
      .catch(function () {});
  }
  // ---- the disagreement pass: after a DATA VALIDATED finding, the skeptic
  // pass runs on the server and the model argues the other side from its
  // numbers only. Two columns the operator can follow, then the skeptic's
  // prose, grounded against the checks it was given.
  var AG_SKEPTIC_SYSTEM =
    "You are the skeptic on a quant research desk. You are given the checks a " +
    "deterministic skeptic pass ran against a backtest finding, as JSON. Using ONLY " +
    "those numbers, write the case against acting on this finding in three plain " +
    "sentences, then one sentence on what evidence would change your mind. No advice, " +
    "no orders, no figures that are not in the JSON, no em dashes.";
  function agMaybeDisagree(args, res) {
    if (!res || res.error || !res.viz) return;
    var f = String(res.viz.finding || "").toUpperCase();
    if (f !== "DATA VALIDATED" && f !== "TRADE-OFF") return;
    var a = {};
    ["filters", "rank_by", "rank_dir", "top_n", "benchmark", "start_year", "split_year", "rebalance", "entry", "name"]
      .forEach(function (k) { if (args && args[k] !== undefined) a[k] = args[k]; });
    if (!a.filters && !a.rank_by) return;
    agAddChip("challenge_finding", "running");
    var agTries = 0;
    function agTake(r) {
      if (r.error) { agAddChip("challenge_finding", "error"); return; }
      var rep = null;
      try { rep = JSON.parse(r.result); } catch (e) { agAddChip("challenge_finding", "error"); return; }
      if (rep && rep.status === "running" && rep.job_id) {
        // a slow pass hands back a job (KI-037); fetch_job long-polls
        if (++agTries > 8) { agAddChip("challenge_finding", "error"); return; }
        agRunTool("fetch_job", { job_id: rep.job_id }).then(agTake)
          .catch(function () { agAddChip("challenge_finding", "error"); });
        return;
      }
      if (!rep || !rep.checks) { agAddChip("challenge_finding", "error"); return; }
      agAddChip("challenge_finding", "done");
      agRenderDisagreement(rep, f);
    }
    agRunTool("challenge_finding", a).then(agTake)
      .catch(function () { agAddChip("challenge_finding", "error"); });
  }
  function agRenderDisagreement(rep, finding) {
    var m = document.getElementById("qg-agent-msgs");
    if (!m) return;
    var card = document.createElement("div");
    card.className = "qg-dis";
    var cls = rep.finding === "HOLDS" ? "good" : rep.finding === "FRAGILE" ? "mixed" : "bad";
    var pro = rep.checks.filter(function (c) { return c.result === "PASS"; });
    var con = rep.checks.filter(function (c) { return c.result === "FLAG" || c.result === "FAIL"; });
    function li(c) {
      return "<div><b class='" + (c.result === "FAIL" ? "no" : c.result === "FLAG" ? "fl" : "") + "'>" +
        escHtml(c.name) + "</b>: " + escHtml(c.detail) + "</div>";
    }
    card.innerHTML =
      "<div class='dh'><span>// THE OTHER SIDE &middot; " + escHtml(finding) + " MEETS THE SKEPTIC PASS</span><b class='" + cls + "'>" + escHtml(rep.finding) + "</b></div>" +
      "<div class='dc'><div><div class='dl'>THE CASE FOR &middot; " + pro.length + " CHECK" + (pro.length === 1 ? "" : "S") + " PASSED</div>" +
      (pro.length ? pro.map(li).join("") : "<div>Nothing passed.</div>") + "</div>" +
      "<div><div class='dl'>THE CASE AGAINST &middot; " + con.length + " OBJECTION" + (con.length === 1 ? "" : "S") + "</div>" +
      (con.length ? con.map(li).join("") : "<div>No objection survived the numbers.</div>") + "</div></div>" +
      "<div class='ds' id='qg-dis-say'><div class='dl'>THE SKEPTIC SAYS</div><span>thinking...</span></div>";
    m.appendChild(card);
    m.scrollTop = m.scrollHeight;
    var say = card.querySelector("#qg-dis-say span");
    var facts = JSON.stringify({ finding: rep.finding, strongest_objection: rep.strongest_objection,
                                 base: rep.base, checks: rep.checks.map(function (c) {
                                   return { name: c.name, result: c.result, detail: c.detail, numbers: c.numbers }; }) });
    if (!agConf() || !agProvider()) { say.textContent = rep.read || rep.finding; return; }
    var text = "";
    var prov = agProvider();
    var msgs = [{ role: "user", content: "The checks:\n" + facts }];
    var call = prov.proto === "anthropic"
      ? agModelCall(msgs, function (d) { text += d; say.textContent = text; }, function () {}, AG_SKEPTIC_SYSTEM)
      : agModelCallOpenAI([{ role: "system", content: AG_SKEPTIC_SYSTEM }].concat(msgs),
                          function (d) { text += d; say.textContent = text; }, function () {}, true);
    call.then(function (out) {
      if (!text && out && out.text) { text = out.text; say.textContent = text; }
      if (!text && out && out.blocks) {
        text = out.blocks.filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("");
        say.textContent = text;
      }
      if (!text) { say.textContent = rep.read || rep.finding; return; }
      return agGround(text, [facts], card);
    }).catch(function () { say.textContent = rep.read || rep.finding; });
  }
  function agSetupHtml() {
    if (agHouseOn()) {
      var used = agHouse.month && agHouse.month.allowance != null ? " (" + agHouseStatus() + ")" : "";
      return "<div class='msg a' id='qg-agent-setup'>Ask in plain words: a backtest, a screen, " +
        "a grade. QuantGPT's own AI answers here, no key needed" + used + ". " +
        "To use your own AI instead (Claude, ChatGPT, Gemini, Grok, Llama and more), " +
        "press Use your own AI above.</div>";
    }
    return "<div class='msg a' id='qg-agent-setup'>Ask in plain words: a backtest, a screen, " +
      "a grade. The AI runs the QuantGPT tools on our data and draws the backtest under its answer.\n\n" +
      "To answer here, this panel needs an AI: connect Claude or ChatGPT from Connect your AI, " +
      "with no key to paste, or press Use your own AI above and paste an API key. The key stays " +
      "in this browser and goes only to your provider.</div>";
  }
  // One line under the box. The key line only where a key is in play (not
  // QuantGPT's own AI); the advice line only in the drawer, since /chat
  // carries its own note beside the panel.
  function agRenderNote() {
    var el = document.getElementById("qg-agent-note");
    if (!el) return;
    var c = agConf(), parts = ["Same tools as Connect your AI."];
    if (!(c && c.provider === "house")) parts.push("Your key stays in this browser.");
    if (!agInline) parts.push("Research, not advice.");
    el.textContent = parts.join(" ");
  }
  // the picker is open: Use your own AI was pressed on this page view
  var agPick = false;
  function agPickOwn() {
    agPick = true;
    if (agHouseOn()) agSetConf({ provider: "none" });   // off the house model while the member picks
    agRenderKeyRow();
    var kin = document.getElementById("qg-agent-keyin");
    if (kin) kin.focus();
  }
  // Ask AI leads with asking (the UX pass, 2026-10-08): the row names the AI
  // that answers, and pasting a key sits behind Use your own AI. While the
  // house status is still on its way the row stays empty, so it never shows
  // the picker for a moment and then drops back.
  function agRenderKeyRow() {
    agRenderNote();
    var row = document.getElementById("qg-agent-keyrow");
    if (!row) return;
    var c = agConf();
    if (agHouse === null) { row.innerHTML = ""; return; }
    if (c && c.provider === "house" && agHouseOn()) {
      // one line: "$1.20 of $4.90 this month" (founders: no limit)
      var left = " &middot; " + agHouseStatus();
      row.innerHTML =
        "<span style='color:var(--up,#43BD85)'>" + AG_PROVIDERS.house.label + "</span>" + left +
        " <button type='button' class='qg-btn secondary' id='qg-agent-own'>Use your own AI</button>";
      document.getElementById("qg-agent-own").onclick = agPickOwn;
      return;
    }
    if (c && AG_PROVIDERS[c.provider] && c.provider !== "house") {
      row.innerHTML =
        "<span style='color:var(--up,#43BD85)'>" +
        AG_PROVIDERS[c.provider].label + "</span> &middot; " +
        "<input id='qg-agent-modelin' value='" +
        String(c.model).replace(/[<>'\"]/g, "") + "' title='model id'>" +
        " <button type='button' class='qg-btn secondary' id='qg-agent-keyforget'>Forget the key</button>";
      var mi = document.getElementById("qg-agent-modelin");
      mi.onchange = function () {
        var cc = agConf(); cc.model = mi.value.trim() ||
          AG_PROVIDERS[cc.provider].model; agSetConf(cc);
      };
      document.getElementById("qg-agent-keyforget").onclick = function () {
        agSetConf(null); agPick = false;
        if (agHouseOn()) agSetConf({ provider: "house", key: "", model: "house" });
        agRenderKeyRow();
      };
      return;
    }
    if (!agPick && !(c && c.provider === "none")) {
      // no AI answers here yet: one button, and the way that needs no key
      row.innerHTML =
        "<span>No AI set up here yet.</span>" +
        " <button type='button' class='qg-btn secondary' id='qg-agent-own'>Use your own AI</button>" +
        " <a class='akc' href='/connect'>Or connect Claude or ChatGPT</a>";
      document.getElementById("qg-agent-own").onclick = agPickOwn;
      return;
    }
    var opts = Object.keys(AG_PROVIDERS).filter(function (k) {
      return k !== "house";
    }).map(function (k) {
      return "<option value='" + k + "'>" + AG_PROVIDERS[k].label + "</option>";
    }).join("");
    row.innerHTML =
      "<select id='qg-agent-provsel' aria-label='AI provider'>" + opts + "</select>" +
      "<input id='qg-agent-keyin' type='password' aria-label='API key' placeholder='" +
      AG_PROVIDERS.anthropic.ph + "'>" +
      " <button type='button' class='qg-btn' id='qg-agent-keysave'>Save</button>" +
      " <button type='button' class='qg-btn secondary' id='qg-agent-back'>" +
      (agHouseOn() ? "Back to QuantGPT's AI" : "Cancel") + "</button>";
    var ps = document.getElementById("qg-agent-provsel");
    ps.onchange = function () {
      document.getElementById("qg-agent-keyin").placeholder =
        AG_PROVIDERS[ps.value].ph;
    };
    document.getElementById("qg-agent-back").onclick = function () {
      agPick = false;
      agSetConf(agHouseOn() ? { provider: "house", key: "", model: "house" } : null);
      agRenderKeyRow();
    };
    document.getElementById("qg-agent-keysave").onclick = function () {
      var prov = ps.value;
      var v = (document.getElementById("qg-agent-keyin").value || "").trim();
      if (!v && prov !== "ollama") return;
      agPick = false;
      agSetConf({ provider: prov, key: v,
                  model: AG_PROVIDERS[prov].model });
      var s = document.getElementById("qg-agent-setup");
      if (s) s.remove();
      agRenderKeyRow();
      document.getElementById("qg-agent-in").focus();
    };
  }
  // One panel, two homes: the drawer on every page, or mounted full-page
  // on /chat (the chat-first tier's desk). Same ids, same loop, same key.
  var agInline = false;
  function agMount(root, inline) {
    agPanel = root;
    agInline = !!inline;
    root.id = "qg-agent";
    if (inline) root.classList.add("inline");
    root.innerHTML =
      "<div class='ah'><span>&#9670; Ask AI</span>" +
      "<button class='aclr' type='button' title='Clear this conversation'>Clear</button>" +
      "<button class='ax' aria-label='Close'>&times;</button></div>" +
      "<div class='akey' id='qg-agent-keyrow'></div>" +
      "<div class='am' id='qg-agent-msgs'></div>" +
      // a streamed answer is announced once, whole, when it ends (site audit
      // 2026-10-22, AIF-46): a live region on the growing bubble itself
      // would read every fragment as it arrives
      "<div id='qg-agent-live' role='status' aria-live='polite' style='" + HIDE + "'></div>" +
      "<div class='af'><textarea id='qg-agent-in' aria-label='Ask your AI' placeholder='Ask your AI for a backtest, a screen, a grade... it runs the tools right here.'></textarea>" +
      "<button class='qg-btn asend' id='qg-agent-send'>Ask</button></div>" +
      "<div class='anote' id='qg-agent-note'></div>";
    agPanel.querySelector(".ax").onclick = function () { agPanel.classList.remove("open"); };
    agPanel.querySelector(".aclr").onclick = function () {
      agSave([]); document.getElementById("qg-agent-msgs").innerHTML =
        agApiKey() ? "" : agSetupHtml();
    };
    var ta = document.getElementById("qg-agent-in");
    ta.onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); agSend(); }
    };
    document.getElementById("qg-agent-send").onclick = agSend;
    if ((!agApiKey() || (agConf() || {}).provider === "house") && !agHist().length) {
      document.getElementById("qg-agent-msgs").innerHTML = agSetupHtml();
    }
    agHist().forEach(function (m) { agAddMsg(m.role === "user" ? "u" : "a", m.content); });
    agRenderKeyRow();
    agLoadCfg();
    agLoadHouse();
  }
  function agBuild() {
    if (agPanel) return;
    var p = document.createElement("div");
    document.body.appendChild(p);
    agMount(p, false);
  }
  var agCfgPromise = null;
  function agLoadCfg() {
    if (agCfg) return Promise.resolve(agCfg);
    if (!agCfgPromise) {
      agCfgPromise = fetch("/api/agent/config")
        .then(function (r) {
          if (!r.ok) throw new Error("config " + r.status);
          return r.json();
        })
        .then(function (c) { agCfg = c; return c; })
        .catch(function (e) {
          agCfgPromise = null;   // failed fetch never poisons the panel
          throw e;
        });
    }
    return agCfgPromise;
  }
  // The agentic loop runs HERE, in the operator's browser, on their key.
  // Our server only executes tools (session-gated /api/agent/tool).
  function agSSE(r, onLine) {
    var reader = r.body.getReader(), dec = new TextDecoder(), buf = "";
    function pump() {
      return reader.read().then(function (x) {
        if (x.done) return;
        buf += dec.decode(x.value, { stream: true });
        var lines = buf.split("\n");
        buf = lines.pop();
        lines.forEach(function (ln) {
          if (ln.indexOf("data:") !== 0) return;
          var payload = ln.slice(5).trim();
          if (payload === "[DONE]") return;
          try { onLine(JSON.parse(payload)); } catch (e) {}
        });
        return pump();
      });
    }
    return pump();
  }
  function agHttpErr(r) {
    return r.text().then(function (t) {
      var msg = "model API " + r.status;
      try {
        var j = JSON.parse(t);
        msg = (j.error && (j.error.message || j.error)) || msg;
      } catch (e) {}
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    });
  }
  // OpenAI-compatible dialect: OpenAI, Gemini, Groq, OpenRouter,
  // Perplexity, Ollama. Streams deltas; accumulates tool_calls.
  function agModelCallOpenAI(messages, onDelta, onToolStart, noTools) {
    var conf = agConf(), prov = agProvider();
    // no token cap here: newer OpenAI models reject max_tokens (they want
    // max_completion_tokens) and every provider defaults sensibly
    var body = { model: conf.model, messages: messages, stream: true };
    if (prov.tools && !noTools) {
      body.tools = agCfg.tools.map(function (t) {
        return { type: "function", function: { name: t.name,
                 description: t.description, parameters: t.input_schema } };
      });
    }
    var headers = { "content-type": "application/json" };
    if (conf.key) headers["authorization"] = "Bearer " + conf.key;
    return fetch(prov.url, { method: "POST", headers: headers,
                             body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok) return agHttpErr(r);
        var text = "", calls = {}, finish = null;
        return agSSE(r, function (ev) {
          var ch = (ev.choices || [])[0] || {};
          var d = ch.delta || {};
          if (d.content) { text += d.content; onDelta(d.content); }
          (d.tool_calls || []).forEach(function (tc) {
            var slot = calls[tc.index] = calls[tc.index] ||
              { id: tc.id, name: "", args: "" };
            if (tc.id) slot.id = tc.id;
            if (tc.function) {
              if (tc.function.name) {
                slot.name += tc.function.name;
                onToolStart(slot.name);
              }
              if (tc.function.arguments) slot.args += tc.function.arguments;
            }
          });
          if (ch.finish_reason) finish = ch.finish_reason;
        }).then(function () {
          return { text: text,
                   calls: Object.keys(calls).map(function (k) { return calls[k]; }),
                   stop: finish };
        });
      });
  }
  // one post to the house proxy. A 429 with Retry-After (every house lane
  // in use, or the day's ceiling held by answers still running) passes on
  // its own, so it is asked again after 1, 2, 4 and 8 seconds and a tool
  // loop is not cut off between two steps. The plan's calls or dollars
  // used up carry no Retry-After and end the turn at once.
  function agHousePost(messages, mode, tries) {
    return fetch("/api/agent/house", { method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: messages, mode: mode }) })
      .then(function (r) {
        if (r.status !== 429 || !r.headers.get("Retry-After") || tries >= 4) return r;
        return new Promise(function (ok) { setTimeout(ok, 1000 * Math.pow(2, tries)); })
          .then(function () { return agHousePost(messages, mode, tries + 1); });
      });
  }
  // Claude native protocol
  function agModelCall(messages, onDelta, onToolStart, systemOverride) {
    var conf = agConf();
    // thinking is on by default on current Claude models and counts toward
    // max_tokens, so the caps leave it room (1500 truncated answers)
    var req = conf.provider === "house"
      ? agHousePost(messages, systemOverride ? "skeptic" : "agent", 0)
      : fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": conf.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({ model: conf.model, max_tokens: systemOverride ? 4000 : 16000,
        system: systemOverride || agCfg.system, tools: systemOverride ? [] : agCfg.tools,
        messages: messages, stream: true })
    });
    return req.then(function (r) {
      if (!r.ok) return r.text().then(function (t) {
        var msg = "model API " + r.status, j = null;
        try { j = JSON.parse(t); msg = j.error.message || msg; } catch (e) {}
        var err = new Error(msg);
        // the house allowance used up (month or day): the panel shows the
        // bring-your-own-AI card instead of the message
        if (j && j.refused) err.refused = j;
        throw err;
      });
      var reader = r.body.getReader(), dec = new TextDecoder(), buf = "";
      var blocks = [], cur = null, stop = null, streamErr = null;
      function handle(ev) {
        var et = ev.type;
        if (et === "content_block_start") {
          var cb = ev.content_block || {};
          if (cb.type === "tool_use") {
            cur = { type: "tool_use", id: cb.id, name: cb.name, _json: "" };
            blocks.push(cur);
            onToolStart(cb.name);
          } else if (cb.type === "thinking") {
            cur = { type: "thinking", thinking: cb.thinking || "", signature: cb.signature || "" };
            blocks.push(cur);
          } else if (cb.type === "text") {
            cur = null; blocks.push({ type: "text", text: cb.text || "" });
          } else {
            // redacted_thinking, fallback markers: kept as sent
            cur = null; blocks.push(JSON.parse(JSON.stringify(cb)));
          }
        } else if (et === "content_block_delta") {
          var d = ev.delta || {}, last = blocks[blocks.length - 1];
          if (d.type === "text_delta" && last && last.type === "text") {
            last.text += d.text || "";
            onDelta(d.text || "");
          } else if (d.type === "input_json_delta" && cur && cur.type === "tool_use") {
            cur._json += d.partial_json || "";
          } else if (d.type === "thinking_delta" && cur && cur.type === "thinking") {
            cur.thinking += d.thinking || "";
          } else if (d.type === "signature_delta" && cur && cur.type === "thinking") {
            cur.signature += d.signature || "";
          }
        } else if (et === "message_delta") {
          stop = (ev.delta || {}).stop_reason || stop;
        } else if (et === "error") {
          streamErr = (ev.error && ev.error.message) || "the model stream stopped";
        }
      }
      function pump() {
        return reader.read().then(function (x) {
          if (x.done) {
            if (streamErr) throw new Error(streamErr);
            return { blocks: blocks, stop: stop };
          }
          buf += dec.decode(x.value, { stream: true });
          var lines = buf.split("\n");
          buf = lines.pop();
          lines.forEach(function (ln) {
            if (ln.indexOf("data:") !== 0) return;
            try { handle(JSON.parse(ln.slice(5))); } catch (e) {}
          });
          return pump();
        });
      }
      return pump();
    });
  }
  function agRunTool(name, args) {
    return fetch("/api/agent/tool", { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, args: args }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (name === "run_backtest") {
          try { agMaybeDisagree(args, res); } catch (e) {}
        }
        return res;
      });
  }
  function agSend() {
    if (agBusy) return;
    if (!agConf() || !agProvider()) {
      // the question stays in the box; the picker opens above it
      agAddMsg("a", "To answer here, this panel needs an AI. Pick yours above and paste its API key "
               + "(it stays in this browser), or connect Claude or ChatGPT to QuantGPT from "
               + "Connect your AI, with no key to paste.");
      agPickOwn();
      return;
    }
    var ta = document.getElementById("qg-agent-in");
    var q = ta.value.trim();
    if (!q) return;
    if (!agCfg) {
      // tool definitions not loaded yet (or the first fetch failed):
      // load now, visibly, then send
      var note = agAddMsg("a", "loading the tool definitions...");
      agLoadCfg().then(function () { note.remove(); agSend(); })
        .catch(function (e) {
          agRenderText(note, "could not load the tool definitions ("
            + (e.message || e) + "). Is the terminal link up? Try again.");
        });
      return;
    }
    ta.value = "";
    var hist = agHist();
    hist.push({ role: "user", content: q });
    agSave(hist);
    agAddMsg("u", q);
    agBusy = true;
    document.getElementById("qg-agent-send").disabled = true;
    agSay("Answering.");
    var msgsBox = document.getElementById("qg-agent-msgs");
    if (msgsBox) msgsBox.setAttribute("aria-busy", "true");
    var live = agAddMsg("a", "");
    var acc = "";
    var evidence = [];   // tool args + results this turn, for grounding
    var prov = agProvider();
    function onDelta(delta) {
      acc += delta;
      agRenderText(live, acc);
      var m = document.getElementById("qg-agent-msgs");
      m.scrollTop = m.scrollHeight;
    }
    function onTool(name) { agAddChip(name, "running"); }
    var plain = agHist().slice(-24).map(function (m) {
      return { role: m.role, content: m.content };
    });
    var run;
    if (prov.proto === "anthropic") {
      var convo = plain;
      run = function turn(loopsLeft) {
        return agModelCall(convo, onDelta, onTool).then(function (out) {
          if (out.stop === "refusal") {
            onDelta((acc ? "\n\n" : "") + "[the model declined this request; rephrase it, or arm a different model]");
            return;
          }
          if (out.stop !== "tool_use" || loopsLeft <= 0) return;
          var assistant = [], calls = [];
          // after a mid-output fallback only text before the last marker
          // travels back; everything after it echoes normally
          var cut = -1;
          out.blocks.forEach(function (b, i) { if (b.type === "fallback") cut = i; });
          out.blocks.forEach(function (b, i) {
            if (b.type === "fallback") return;
            if (i < cut && b.type !== "text") return;
            if (b.type === "text") {
              if (b.text) assistant.push({ type: "text", text: b.text });
            } else if (b.type === "thinking") {
              assistant.push({ type: "thinking", thinking: b.thinking, signature: b.signature });
            } else if (b.type !== "tool_use") {
              assistant.push(b);
            } else {
              var args = {};
              try { args = JSON.parse(b._json || "{}"); } catch (e) {}
              assistant.push({ type: "tool_use", id: b.id, name: b.name,
                               input: args });
              calls.push({ id: b.id, name: b.name, args: args });
            }
          });
          convo.push({ role: "assistant", content: assistant });
          return Promise.all(calls.map(function (c) {
            evidence.push(JSON.stringify(c.args || {}));
            return agRunTool(c.name, c.args).then(function (res) {
              agAddChip(c.name, res.error ? "error" : "done");
              if (!res.error) evidence.push(String(res.result || ""));
              if (res.viz) agAddViz(res.viz);
              return { type: "tool_result", tool_use_id: c.id,
                       content: res.error ? ("tool error: " + res.error)
                                          : String(res.result || ""),
                       is_error: !!res.error };
            });
          })).then(function (results) {
            convo.push({ role: "user", content: results });
            return turn(loopsLeft - 1);
          });
        });
      };
    } else {
      var omsgs = [{ role: "system", content: agCfg.system }].concat(plain);
      run = function turn(loopsLeft) {
        return agModelCallOpenAI(omsgs, onDelta, onTool).then(function (out) {
          if (!out.calls.length || loopsLeft <= 0) {
            if (!prov.tools && !acc) {
              onDelta("[this provider does not support tool calling; " +
                      "answers are model-only]");
            }
            return;
          }
          omsgs.push({ role: "assistant",
                       content: out.text || null,
                       tool_calls: out.calls.map(function (c) {
                         return { id: c.id, type: "function",
                                  function: { name: c.name,
                                              arguments: c.args || "{}" } };
                       }) });
          return Promise.all(out.calls.map(function (c) {
            var args = {};
            try { args = JSON.parse(c.args || "{}"); } catch (e) {}
            evidence.push(JSON.stringify(args));
            return agRunTool(c.name, args).then(function (res) {
              agAddChip(c.name, res.error ? "error" : "done");
              if (!res.error) evidence.push(String(res.result || ""));
              if (res.viz) agAddViz(res.viz);
              return { role: "tool", tool_call_id: c.id,
                       content: res.error ? ("tool error: " + res.error)
                                          : String(res.result || "") };
            });
          })).then(function (results) {
            results.forEach(function (r2) { omsgs.push(r2); });
            return turn(loopsLeft - 1);
          });
        });
      };
    }
    run(6)
    .then(function () { return agGround(acc, evidence, live); })
    .catch(function (e) {
      if (e && e.refused) {
        agHouseCard(e.refused);
        agLoadHouse();                       // the key row's "$x of $y this month"
        return;
      }
      acc += (acc ? "\n\n" : "") + "[" + String(e.message || e) + "]";
      agRenderText(live, acc);
    })
    .finally(function () {
      agBusy = false;
      document.getElementById("qg-agent-send").disabled = false;
      if (msgsBox) msgsBox.removeAttribute("aria-busy");
      agSay(acc ? acc : "No answer came back.");
      if (acc) {
        var h = agHist();
        h.push({ role: "assistant", content: acc });
        agSave(h);
      } else { live.remove(); }
    });
  }
  document.getElementById("lt-agent").onclick = function () {
    if (agInline) {   // on /chat the agent IS the page: the light focuses it
      var ta = document.getElementById("qg-agent-in");
      if (ta) ta.focus();
      return;
    }
    agBuild();
    agPanel.classList.toggle("open");
    if (agPanel.classList.contains("open")) {
      document.getElementById("qg-agent-in").focus();
    }
  };
  // /chat mounts the same agent full-page through this handle
  window.qgAgent = {
    mount: function (root) { if (!agPanel) agMount(root, true); return agPanel; },
    ask: function (q) {
      var ta = document.getElementById("qg-agent-in");
      if (!ta) return;
      ta.value = q; ta.focus(); agSend();
    },
    send: agSend, history: agHist, conf: agConf, providers: AG_PROVIDERS,
    renderText: agRenderText
  };

  // ---- AI pushes: the operator's AI can drive this screen ----
  var pushCss = document.createElement("style");
  pushCss.textContent =
    "#qg-pushes{position:fixed;right:16px;bottom:40px;z-index:390;display:flex;flex-direction:column;gap:.6rem;max-width:360px}" +
    "@media (max-width:480px){#qg-pushes{bottom:calc(16px + env(safe-area-inset-bottom));right:8px;left:8px;max-width:none}}" +
    ".qg-push{background:var(--surface,#10151E);border:1px solid var(--amber,#F0A83C);border-radius:10px;padding:.8rem .95rem;box-shadow:0 14px 44px rgba(var(--shade-rgb),.55);animation:qgp-in 220ms cubic-bezier(.2,.7,.25,1)}" +
    "@keyframes qgp-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){.qg-push{animation:none}}" +
    ".qg-push .ph{font-size:.74rem;font-weight:600;color:var(--amber,#F0A83C);margin-bottom:.3rem}" +
    ".qg-push .pt{color:var(--ink,#E7ECF4);font-size:.86rem;font-weight:600}" +
    ".qg-push .pb{color:var(--muted,#8B96A8);font-size:.76rem;margin-top:.2rem}" +
    ".qg-push img{max-width:100%;border-radius:6px;border:1px solid var(--line2,#2E3A4D);margin-top:.5rem;display:block}" +
    ".qg-push .pa{display:flex;gap:.6rem;margin-top:.55rem}";
  document.head.appendChild(pushCss);
  function renderPush(e) {
    var box = document.getElementById("qg-pushes");
    if (!box) {
      box = document.createElement("div");
      box.id = "qg-pushes";
      document.body.appendChild(box);
    }
    var d = document.createElement("div");
    d.className = "qg-push";
    var h = document.createElement("div"); h.className = "ph";
    // a founder's daily summary (maintenance.py) is the desk's, not the AI's:
    // the MCP ui_push tool can only send note, study or chart
    h.textContent = e.kind === "maintenance" ? "Maintenance due" :
      "Your AI " + (e.kind === "study" ? "put a study on your shelf" :
                    e.kind === "chart" ? "sent a chart" : "flagged something");
    var t = document.createElement("div"); t.className = "pt"; t.textContent = e.title;
    d.appendChild(h); d.appendChild(t);
    if (e.body) { var b = document.createElement("div"); b.className = "pb"; b.textContent = e.body; d.appendChild(b); }
    if (e.chart) { var img = document.createElement("img"); img.src = e.chart; img.alt = e.title; d.appendChild(img); }
    var pa = document.createElement("div"); pa.className = "pa";
    if (e.url) {
      var go = document.createElement("a"); go.className = "qg-btn go"; go.href = e.url;
      go.textContent = "Open it"; pa.appendChild(go);
    }
    var dis = document.createElement("button"); dis.className = "qg-btn secondary dis"; dis.type = "button";
    dis.textContent = "Dismiss"; dis.onclick = function () { d.remove(); };
    pa.appendChild(dis); d.appendChild(pa);
    box.appendChild(d);
    while (box.children.length > 3) box.firstChild.remove();
  }
  function pollPushes() {
    if (document.visibilityState !== "visible") return;
    fetch("/api/ui/pending").then(function (r) { return r.json(); })
      .then(function (d) { (d.events || []).forEach(renderPush); })
      .catch(function () {});
  }
  setInterval(pollPushes, 8000);

  // ---- desk status bar (desktop): the AI light, Connected and the clock ----
  if (window.matchMedia("(min-width: 481px)").matches) {
    var barCss = document.createElement("style");
    barCss.textContent =
      "#qg-deskbar{position:fixed;left:0;right:0;bottom:0;z-index:9;height:24px;background:var(--surface,#10151E);border-top:1px solid var(--line,#212A38);display:flex;align-items:center;gap:1.1rem;padding:0 1.25rem;font-family:Consolas,Cascadia Mono Web,monospace;font-size:.58rem;letter-spacing:.12em;color:var(--faint,#5B6577)}" +
      // the right-hand cluster: the AI light, Connected, the clock
      "#qg-deskbar #lt-ai{margin-left:auto}" +
      "#qg-deskbar .rdy{margin-left:auto;display:inline-flex;align-items:center;gap:.35rem}" +
      "#qg-deskbar #lt-ai~.rdy{margin-left:0}" +
      "#qg-deskbar .rdy i{font-style:normal;color:var(--up)}" +
      "#qg-deskbar .rdy.down i{color:var(--down)}" +
      "#qg-deskbar .lt{display:inline-flex;align-items:center;gap:.3rem;cursor:pointer;color:var(--muted,#8B96A8)}" +
      // the light's dot carries its state (paint() sets green or red)
      "#qg-deskbar .lt.green .dot{color:var(--up,#43BD85)}#qg-deskbar .lt.red .dot{color:var(--down,#DF605E)}" +
      "body{padding-bottom:24px}";
    document.head.appendChild(barCss);
    var bar = document.createElement("div");
    bar.id = "qg-deskbar";
    // a named landmark, so the status line is not loose page content (axe region)
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Terminal status");
    bar.innerHTML =
      "<span class='rdy' id='qg-rdy'><i>\u25cf</i> <span>Connected</span></span>" +
      "<span id='qg-clock'></span>";
    document.body.appendChild(bar);
    function tickClock() {
      try {
        document.getElementById("qg-clock").textContent =
          new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York",
            hour: "numeric", minute: "2-digit", second: "2-digit" }) + " ET";
      } catch (e) {}
    }
    tickClock(); setInterval(tickClock, 1000);
    window.qgDeskReady = function (ok) {
      var el = document.getElementById("qg-rdy");
      if (el) {
        el.className = "rdy" + (ok ? "" : " down");
        el.lastElementChild.textContent = ok ? "Connected" : "Reconnecting";
      }
    };
  }
  // the AI light sits on the desk bar, which exists only now; Ask AI sits
  // in the sidebar's foot (placeLights, in the sidebar code)
  placeLights();

  // yellow = not connected (default), green = connected, red = error
  function paint(id, svc) {
    var el = document.getElementById(id);
    if (!el || !svc) return;
    var dot = document.getElementById(id === "lt-ai" ? "navdot-ai" : "navdot-alpaca");
    if (dot) dot.className = "nd " + (svc.state === "green" ? "green" : svc.state === "red" ? "red" : "");
    el.className = "lt " + (svc.state === "green" ? "green" :
                            svc.state === "red" ? "red" : "");
    if (svc.detail) el.title = svc.detail;
    var lab = "";
    if (id === "lt-ai") {
      var lw = el.querySelector(".lw"), ln = el.querySelector(".ln");
      if (svc.offline) {
        // our server is down, not the member's AI: keep the last label,
        // so it never asks them to redo a setup that is fine
        lab = (lw && lw.textContent) || "Connect AI";
      } else {
        // the label says the state in words: connected, or what to do
        var on = svc.state === "green";
        lab = on ? "AI connected" : "Connect AI";
        if (lw) lw.textContent = lab;
        if (ln) ln.textContent = on ? "AI on" : "Connect";
        el.setAttribute("data-tip", lab);
      }
      lab += ". ";
    }
    // the spoken name starts with the words on screen
    el.setAttribute("aria-label", lab + (id === "lt-ai" ? "AI" : "ALPACA") +
      " connection status: " + (svc.detail || svc.state || "not connected") + ". Open setup.");
  }
  function refresh() {
    qgAuth.then(function (inn) {
      if (!inn) return;               // signed out: the lights are hidden, nothing to ask
      return statusNow();
    });
  }
  function statusNow() {
    return fetch("/api/status").then(function (r) { return r.json(); }).then(function (s) {
      paint("lt-ai", s.ai);
      if (window.qgDeskReady) window.qgDeskReady(true);
    }).catch(function () {
      if (window.qgDeskReady) window.qgDeskReady(false);
      // through paint(), so the AI light goes red and never keeps the last
      // good poll's green
      paint("lt-ai", { state: "red", detail: "status check failed, server unreachable", offline: true });
    });
  }
  refresh();
  setInterval(refresh, 120000);

  // ------------- WHAT'S NEW interstitial (alpha changelog) -------------
  // Quickly dismissible; the checkbox quiets it until a NEWER entry ships.
  // X or GOT IT hides it for this browser session only.
  (function () {
    var wcss = document.createElement("style");
    wcss.textContent =
      "#qg-wn{position:fixed;z-index:290;right:14px;bottom:14px;width:380px;max-width:calc(100vw - 20px);" +
      "background:var(--surface,#10151E);border:1px solid var(--amber,#F0A83C);border-radius:8px;" +
      "box-shadow:0 18px 48px rgba(4,6,10,.72);font-family:var(--mono,Consolas,Cascadia Mono Web,monospace);display:none}" +
      "#qg-wn.open{display:block}" +
      "#qg-wn .wh{display:flex;justify-content:space-between;align-items:center;padding:.6rem .85rem;" +
      "border-bottom:1px solid var(--line2,#2E3A4D);color:var(--amber,#F0A83C);font-size:10px;letter-spacing:.14em}" +
      "#qg-wn .wd{color:var(--up,#43BD85);font-weight:700}" +
      "#qg-wn .wx{background:none;border:0;color:var(--muted,#8B96A8);cursor:pointer;font-size:15px;line-height:1;padding:2px 6px}" +
      "#qg-wn .wb{padding:.6rem .85rem .75rem;max-height:46vh;overflow-y:auto}" +
      "#qg-wn .wi{font-size:11.5px;line-height:1.55;color:var(--muted,#8B96A8);padding:.22rem 0;font-family:var(--sans,'Segoe UI',Selawik,sans-serif)}" +
      "#qg-wn .wi::before{content:'\\25B8 ';color:var(--amber,#F0A83C)}" +
      "#qg-wn .wprev{display:block;width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line,#212A38);color:var(--faint,#5B6577);font:inherit;font-size:9.5px;letter-spacing:.12em;padding:.5rem 0 .1rem;margin-top:.45rem;cursor:pointer}" +
      "#qg-wn .wprev:hover{color:var(--amber,#F0A83C)}" +
      "#qg-wn .wdh{font-size:9.5px;letter-spacing:.14em;color:var(--amber,#F0A83C);padding:.5rem 0 .15rem}" +
      "#qg-wn .wf{display:flex;justify-content:space-between;align-items:center;gap:.7rem;" +
      "padding:.55rem .85rem;border-top:1px solid var(--line,#212A38)}" +
      "#qg-wn label{display:flex;gap:.4rem;align-items:center;color:var(--faint,#5B6577);font-size:9.5px;letter-spacing:.06em;cursor:pointer}" +
      "@media(max-width:480px){#qg-wn{bottom:calc(16px + env(safe-area-inset-bottom));left:8px;right:auto;width:auto;max-width:52vw;border-radius:20px}" +
      "#qg-wn.expanded{right:8px;max-width:none;border-radius:8px}" +
      "#qg-wn:not(.expanded) .wb,#qg-wn:not(.expanded) .wf{display:none}#qg-wn .wh{cursor:pointer;min-height:40px;gap:.5rem;padding:.5rem .8rem;font-size:9px;white-space:nowrap;overflow:hidden}" +
      "#qg-wn:not(.expanded) .wh>span:first-child{overflow:hidden;text-overflow:ellipsis}}";
    document.head.appendChild(wcss);
    // on a phone the card is a one-line pill until tapped (it covered half the screen)
    document.addEventListener("click", function (e) {
      var h = e.target.closest && e.target.closest("#qg-wn .wh");
      if (!h || e.target.closest(".wx")) return;
      if (matchMedia("(max-width:480px)").matches) document.getElementById("qg-wn").classList.toggle("expanded");
    });

    // first-session quiet: the changelog waits until this browser has seen
    // a run complete (terminal.html sets qg_ran), so day one is the RAMP
    // and the study definition, not a dialog over both
    try { if (!localStorage.getItem("qg_ran")) return; } catch (e) {}
    var box = null;
    // one overlay at a time (ease rule 6): the card never opens by itself
    // on top of something else. A page tour that is about to start, or any
    // other card, keeps it away for this page view; it tries again on the
    // next one. Help, the search, a lock card, a "?" or a tour opening
    // later puts it away (window.qgWnHide).
    function otherUp() {
      if (window.qgTourPending) return true;
      var sel = ["#qg-tour", "#qgtour", "#qg-tier.open", "#qg-pal.open", "#qg-help.open",
                 "#qg-xpop", "#qg-agent.open", "#qgside.open"];
      for (var i = 0; i < sel.length; i++) if (document.querySelector(sel[i])) return true;
      return false;
    }
    window.qgWnHide = function () { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; };
    function whenSettled(cb) {
      // after the page's own first paint and a tour's start (tour.js opens
      // 700ms after the plan arrives)
      function go() { setTimeout(cb, 1500); }
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go);
    }
    fetch("/api/changelog").then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.latest) return;
      try {
        if (localStorage.getItem("qg_wn_quiet") === d.latest) return;
        if (sessionStorage.getItem("qg_wn_seen") === d.latest) return;
      } catch (e) {}
      whenSettled(function () { if (!otherUp()) openWn(d); });
    }).catch(function () {});
    var wnTold = false;
    function markWn(d) {
      try { sessionStorage.setItem("qg_wn_seen", d.latest); localStorage.setItem("qg_wn_quiet", d.latest); } catch (e) {}
      if (wnTold) return;
      wnTold = true;
      try {
        fetch("/api/account/tours", {method: "POST", credentials: "same-origin", keepalive: true,
          headers: {"Content-Type": "application/json"}, body: JSON.stringify({tour: "whatsnew"})}).catch(function () {});
      } catch (e) {}
    }
    function openWn(d) {
      var e0 = d.entries[0];
      box = document.createElement("div");
      box.id = "qg-wn";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-label", "What's new");
      function wnEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
      var items = "";
      for (var i = 0; i < e0.items.length; i++) {
        items += "<div class='wi'>" + wnEsc(e0.items[i]) + "</div>";
      }
      // only the newest day up front; earlier days fold out on request
      var prev = "";
      for (var j = 1; j < d.entries.length; j++) {
        var ej = d.entries[j];
        prev += "<div class='wdh'>Alpha day " + (ej.day || "?") +
                " &middot; " + wnEsc(ej.date) + "</div>";
        for (var k = 0; k < ej.items.length; k++) {
          prev += "<div class='wi'>" + wnEsc(ej.items[k]) + "</div>";
        }
      }
      if (prev) {
        items += "<button class='wprev' type='button' aria-expanded='false'>" +
                 "Read the earlier days &#9662;</button>" +
                 "<div id='qg-wn-prev' style='display:none'>" + prev + "</div>";
      }
      box.innerHTML =
        "<div class='wh'><span>What's new &middot; <span class='wd'>" + wnEsc(e0.date) + "</span></span>" +
        "<button class='wx' aria-label='Dismiss'>&times;</button></div>" +
        "<div class='wb'>" + items + "</div>" +
        "<div class='wf'><span></span><button class='qg-btn wgo'>Got it</button></div>";
      document.body.appendChild(box);
      // shown once: opening it marks it seen in this browser and on the
      // account, so it does not come back on the next page, session or
      // device (Brett, 2026-10-08); the account page's Replay tours
      // brings it back
      markWn(d);
      requestAnimationFrame(function () { if (box) box.className = "open"; });
      function closeWn() { markWn(d); window.qgWnHide(); }
      box.querySelector(".wx").onclick = closeWn;
      box.querySelector(".wgo").onclick = closeWn;
      var pv = box.querySelector(".wprev");
      if (pv) pv.onclick = function () {
        var el = document.getElementById("qg-wn-prev");
        var open = el.style.display === "none";
        el.style.display = open ? "" : "none";
        pv.setAttribute("aria-expanded", open ? "true" : "false");
        pv.innerHTML = open ? "Hide the earlier days &#9652;"
                            : "Read the earlier days &#9662;";
      };
    }
  })();

  // ------------- What's new: the release card (whats_new.py) -------------
  // A page tour, a ?tour=1 page or the first run (/?first=1) quiets the card
  // for the rest of this sign-in session: it never shares a session with a
  // tour. The server keeps the mark in the session itself (event quiet), so
  // no browser storage is used. An open tour puts an open card away.
  function relQuietSession() {
    if (window.qgRelQuiet) return;
    window.qgRelQuiet = true;
    if (document.body.classList.contains("qg-signed-out")) return;
    try {
      fetch("/api/whats-new/event", {method: "POST", credentials: "same-origin", keepalive: true,
        headers: {"Content-Type": "application/json"}, body: JSON.stringify({event: "quiet"})}).catch(function () {});
    } catch (e) {}
  }
  if (/[?&](first|tour)=1(&|$)/.test(String(location.search || ""))) relQuietSession();
  document.addEventListener("qg:tour-open", function () {
    relQuietSession();
    if (window.qgRelHide) window.qgRelHide();
  });

  // ---------------- HELP desk panel (every page, one file) ----------------
  var hcss = document.createElement("style");
  hcss.textContent =
    "#qg-help{position:fixed;z-index:300;right:14px;bottom:14px;width:340px;max-width:calc(100vw - 20px);" +
    "background:var(--surface,#10151E);border:1px solid var(--line2,#2E3A4D);display:none;" +
    "box-shadow:0 18px 48px rgba(4,6,10,.72);font-family:var(--sans,system-ui,sans-serif);letter-spacing:0}" +
    "#qg-help.open{display:block}" +
    "#qg-help .hh{padding:.45rem .5rem .45rem .8rem;font-size:14px;font-weight:600;color:var(--ink,#E7ECF4);" +
    "border-bottom:1px solid var(--line2,#2E3A4D);background:var(--surface2,#151C27);display:flex;justify-content:space-between;align-items:center}" +
    "#qg-help .hx{background:none;border:0;color:var(--muted,#8B96A8);cursor:pointer;font-size:18px;line-height:1;padding:2px 6px;" +
    "min-width:32px;min-height:32px;border-radius:6px}" +
    "#qg-help .hx:hover{color:var(--ink,#E7ECF4)}" +
    "#qg-help .hb{padding:.7rem .8rem .8rem;max-height:70vh;overflow-y:auto}" +
    "#qg-help .hl{font-size:12px;color:var(--muted,#8B96A8);margin:.8rem 0 .35rem}" +
    "#qg-help .hl:first-child{margin-top:0}" +
    "#qg-help .fix{display:flex;align-items:center;box-sizing:border-box;min-height:44px;font-size:14px;line-height:1.35;" +
    "color:var(--ink,#E7ECF4);text-decoration:none;padding:.35rem 0;border-bottom:1px solid var(--line,#212A38)}" +
    "#qg-help .fix:hover{color:var(--amber,#F0A83C)}" +
    "#qg-help .fix[hidden]{display:none}" +
    "#qg-help select,#qg-help textarea{width:100%;box-sizing:border-box;background:var(--field);border:1px solid var(--field-edge,#5E6A7E);" +
    "border-radius:6px;color:var(--ink,#E7ECF4);font-family:inherit;font-size:14px;padding:.45rem .55rem;margin-bottom:.45rem}" +
    "#qg-help select{min-height:44px}" +
    "#qg-help textarea{min-height:74px}" +
    "#qg-help .hsend{width:100%}" +
    "#qg-help a.hsend{display:flex;align-items:center;justify-content:center;box-sizing:border-box;text-decoration:none}" +
    "#qg-help [hidden]{display:none!important}" +
    "#qg-help .hmsg{font-size:12px;color:var(--up,#43BD85);min-height:1.2em;margin-top:.4rem}" +
    "#qg-help .hmsg.err{color:var(--down,#DF605E)}" +
    "#qg-help .tkt{font-size:12px;color:var(--muted,#8B96A8);padding:.3rem 0;border-bottom:1px solid var(--line,#212A38)}" +
    "#qg-help .tkt b{color:var(--amber,#F0A83C)}" +
    "#qg-help .tkt .rp{display:block;color:var(--ink,#E7ECF4);margin-top:.2rem;font-size:13px}" +
    // touch: the close button is a full 44px target
    "@media (pointer:coarse),(max-width:767px){#qg-help .hx{min-width:44px;min-height:44px}}" +
    "@media (max-width:480px){#qg-help{bottom:calc(16px + env(safe-area-inset-bottom))}}" +
    // What's new's unseen dot: on Help's link and on the sidebar's Help icon
    ".qg-rel-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--amber-fill,#F0A83C);flex:none}" +
    "#qg-help .qg-rel-dot{margin-left:.5rem}#qg-help .qg-rel-dot[hidden]{display:none}" +
    // the sidebar's Help: beside the label, or on the icon's corner when the
    // sidebar is folded to icons
    ".qg-mini #qgside #lt-help .qg-rel-dot{position:absolute;top:5px;right:calc(50% - 14px);" +
    "box-shadow:0 0 0 2px var(--surface,#10151E)}";
  document.head.appendChild(hcss);

  var help = document.createElement("div");
  help.id = "qg-help";
  help.setAttribute("role", "dialog");
  help.setAttribute("aria-label", "Help desk");
  help.innerHTML =
    "<div class='hh'><span>Help</span><button class='hx' aria-label='Close help'>&times;</button></div>" +
    "<div class='hb'>" +
    "<div class='hl'>Try these first</div>" +
    "<a class='fix' id='qg-help-wn' href='/whats-new' hidden>What's new<span class='qg-rel-dot' hidden></span></a>" +
    "<a class='fix' id='qg-help-firstrun' href='/tour?replay=1' hidden>See what you get: the product tour</a>" +
    "<a class='fix' id='qg-help-intro' href='/start?replay=1'>New here: watch the one-minute intro</a>" +
    "<a class='fix' id='qg-help-tour' href='#' hidden>Take this page's tour</a>" +
    "<a class='fix' href='/university'>QuantGPT University</a>" +
    "<a class='fix' href='/connect'>AI light not green: open Connect your AI and follow the steps again</a>" +
    "<a class='fix' href='https://quantgpt.co/learn/verdict.html'>The three findings, explained</a>" +
    "<a class='fix' href='/forum#help'>Run failing or empty: the troubleshooting checklist on the forum</a>" +
    "<a class='fix' href='/go/discord?from=/help' target='_blank' rel='noopener noreferrer'>A quick question: ask other members on the QuantGPT Discord</a>" +
    "<a class='fix' href='/reset'>Locked out: reset your password</a>" +
    "<a class='fix' href='/account'>Keys, plan, and profile live on your account page</a>" +
    "<div class='hl'>Still stuck? Send us a ticket</div>" +
    // signed out (a public page such as /learn): the ticket needs an
    // account, so the form steps aside for a sign-in that comes back here
    "<a class='qg-btn hsend' id='qg-help-signin' href='/signin' hidden>Sign in to send a ticket</a>" +
    "<div id='qg-help-tkt'>" +
    "<select id='qg-help-cat' aria-label='Category'>" +
    "<option value='bug'>Something is broken</option>" +
    "<option value='request'>A request: data, a factor or a feature</option>" +
    "<option value='ai-connection'>Connecting my AI</option>" +
    "<option value='backtest'>A backtest or a screen</option>" +
    "<option value='account'>My account or signing in</option>" +
    "<option value='billing'>Billing</option>" +
    "<option value='other'>Something else</option></select>" +
    "<textarea id='qg-help-msg' placeholder='What happened? What did you expect? We see your recent runs automatically, so no need to paste them.'></textarea>" +
    "<button class='qg-btn hsend' id='qg-help-send'>Send the ticket</button>" +
    "<div class='hmsg' id='qg-help-note'></div>" +
    "<div class='hl'>Your tickets</div><div id='qg-help-mine'></div>" +
    "</div>" +
    "<div class='hl' style='margin-bottom:0'>We answer within one business day &middot; desk@quantgpt.co</div>" +
    "</div>";
  document.body.appendChild(help);

  function escT(x){ var d=document.createElement("div"); d.textContent=x==null?"":String(x); return d.innerHTML.replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  // the ticket form for a signed-in operator, the sign-in link otherwise
  function helpSignedOut(){
    var a = document.getElementById("qg-help-signin");
    a.setAttribute("href", "/signin?next=" + encodeURIComponent(location.pathname + location.search));
    a.hidden = false;
    document.getElementById("qg-help-tkt").hidden = true;
  }
  function loadMine(){
    if (document.body.classList.contains("qg-signed-out")) { helpSignedOut(); return; }
    fetch("/api/support/mine").then(function(r){
      if (r.status === 401) { helpSignedOut(); return {}; }
      return r.json();
    }).then(function(d){
      var el = document.getElementById("qg-help-mine");
      var ts = (d.tickets || []);
      if (!ts.length){ el.innerHTML = "<div class='tkt'>None yet.</div>"; return; }
      el.innerHTML = ts.slice(0, 5).map(function(t){
        var last = (t.replies && t.replies.length) ? t.replies[t.replies.length-1] : null;
        return "<div class='tkt'><b>#" + t.id + "</b> " + escT(t.category) +
          " &middot; " + escT(String(t.status).charAt(0).toUpperCase() + String(t.status).slice(1)) +
          (last ? "<span class='rp'>desk: " + escT(last.body).slice(0, 200) + "</span>" : "") + "</div>";
      }).join("");
    }).catch(function(){});
  }
  var helpBack = null;
  function toggleHelp(open){
    var was = help.classList.contains("open");
    var want = (open !== undefined) ? open : !was;
    if (want) overlayQuiet("help");
    if (want && !was) {
      // the page's own tour, offered only on a page that has one
      var tl = document.getElementById("qg-help-tour");
      tl.hidden = !document.querySelector("script[data-tour]");
      tl.setAttribute("href", location.pathname + "?tour=1");
      // the first-run tour's replay, only while its switch is on (tour.py);
      // it takes the one-minute intro's place, so Help never offers two
      var ft = !!(window.qgTiers && window.qgTiers.first_tour);
      document.getElementById("qg-help-firstrun").hidden = !ft;
      // What's new (whats_new.py): the log, with a dot while a release is unseen
      var rw = window.qgTiers && window.qgTiers.whats_new, rl = document.getElementById("qg-help-wn");
      rl.hidden = !(rw && rw.on);
      rl.querySelector(".qg-rel-dot").hidden = !(rw && rw.unseen > 0);
      rl.setAttribute("aria-label", rw && rw.unseen > 0 ? "What's new, " + rw.unseen + " unseen" : "What's new");
      document.getElementById("qg-help-intro").hidden = ft;
      helpBack = document.activeElement;
    }
    help.classList.toggle("open", want);
    if (want) loadMine();
    if (want && !was) {
      var first = help.querySelector(".fix:not([hidden])");
      if (first) { try { first.focus(); } catch (e) {} }
    } else if (!want && was) {
      // focus goes back to what opened Help
      var back = helpBack;
      helpBack = null;
      if (back && back !== document.body && document.contains(back)) { try { back.focus(); } catch (e) {} }
    }
  }
  var hlt = document.getElementById("lt-help");
  hlt.onclick = function(){ menuOpen(false); toggleHelp(); };   // the phone menu closes first
  if (hlt.tagName !== "BUTTON") {   // the sidebar's Help is a real button: Enter and Space are built in
    hlt.tabIndex = 0; hlt.setAttribute("role", "button");
    hlt.onkeydown = function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggleHelp(); } };
  }
  help.querySelector(".hx").onclick = function(){ toggleHelp(false); };
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") toggleHelp(false); });
  document.getElementById("qg-help-send").onclick = function(){
    var note = document.getElementById("qg-help-note");
    var msg = document.getElementById("qg-help-msg");
    note.className = "hmsg"; note.textContent = "Sending...";
    fetch("/api/support/ticket", {method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({category: document.getElementById("qg-help-cat").value,
                            message: msg.value})})
    .then(function(r){
      if (r.status === 401) { note.textContent = ""; helpSignedOut(); return {}; }
      return r.json();
    }).then(function(d){
      if (!d.id && !d.error) return;
      if (d.error){ note.className = "hmsg err"; note.textContent = d.error; return; }
      msg.value = "";
      note.textContent = "Ticket #" + d.id + " sent. " + (d.note || "");
      loadMine();
    }).catch(function(){ note.className = "hmsg err"; note.textContent = "No connection. Try again."; });
  };

  // ======================= POLISH =======================
  // Visual polish pass 1 (2026-09-29). Three small behaviours the shared
  // stylesheet (desk.css, "polish 1") draws; this only toggles classes.
  //
  //   1. sections below the fold fade and rise once, the first time they
  //      scroll into view (IntersectionObserver, 300ms, off entirely when
  //      the reader asked for reduced motion). What is already on screen
  //      at load is never touched, so nothing moves while the reader reads.
  //   2. a tile figure that still reads "--" while its JSON is on the way
  //      shimmers until the number lands (or eight seconds pass).
  //   3. a table column that is mostly figures is right-aligned with
  //      tabular digits (.qg-num), the header with it.
  (function polish() {
    var reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var REVEAL = ".qg-card, .card, .panel, .sec, .section-card, .bcard, .tile, .cfi";
    function reveal() {
      if (reduce || !("IntersectionObserver" in window)) return;
      document.body.classList.add("qg-motion");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          io.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
      var fold = window.innerHeight, n = 0;
      Array.prototype.forEach.call(document.querySelectorAll(REVEAL), function (el) {
        if (n >= 80 || el.classList.contains("qg-reveal")) return;
        // one animation per block: a tile inside a card rides with the card
        var up = el.parentElement && el.parentElement.closest(REVEAL);
        if (up) return;
        var r = el.getBoundingClientRect();
        if (r.height === 0 || r.top < fold) return;   // on screen already, or hidden: leave it
        el.classList.add("qg-reveal");
        io.observe(el);
        n++;
      });
    }
    var WAIT = ".tile b, .tile .v, .tile .n, .cfi .v, .cfi b, .stat b, .kpi .v, .kpi b, .hero b, .hero .v";
    function waiting(el) {
      var s = (el.textContent || "").replace(/\s+/g, "");
      return s === "" || s === "--" || s === "-" || s === "...";
    }
    function shimmer() {
      var marked = [];
      Array.prototype.forEach.call(document.querySelectorAll(WAIT), function (el) {
        if (el.children.length || !waiting(el)) return;
        el.classList.add("qg-wait");
        marked.push(el);
      });
      if (!marked.length) return;
      var mo = null, stop = null;
      function sweep(all) {
        marked = marked.filter(function (el) {
          if (!all && waiting(el) && document.contains(el)) return true;
          el.classList.remove("qg-wait");
          return false;
        });
        if (!marked.length) { if (mo) mo.disconnect(); clearTimeout(stop); }
      }
      mo = new MutationObserver(function () { sweep(false); });
      mo.observe(document.body, { subtree: true, childList: true, characterData: true });
      stop = setTimeout(function () { sweep(true); }, 8000);
    }
    var NUM = /^[+-]?[$]?\d[\d,]*(\.\d+)?\s?(%|x|pts?|bps|d|days?|yrs?|k|m|b)?$|^--$|^n\/a$/i;
    function numify(table) {
      var rows = Array.prototype.filter.call(table.rows, function (r) { return r.cells.length > 1; });
      if (rows.length < 2) return;
      var cols = 0;
      rows.forEach(function (r) { cols = Math.max(cols, r.cells.length); });
      for (var c = 0; c < cols; c++) {
        var seen = 0, num = 0;
        rows.forEach(function (r) {
          var cell = r.cells[c];
          if (!cell || cell.tagName === "TH" || cell.colSpan > 1) return;
          var s = (cell.textContent || "").trim();
          if (!s) return;
          seen++;
          if (NUM.test(s)) num++;
        });
        if (seen < 2 || num / seen < 0.7) continue;
        rows.forEach(function (r) {
          var cell = r.cells[c];
          if (cell && cell.colSpan <= 1) cell.classList.add("qg-num");
        });
      }
    }
    var pending = null, touched = [];
    function numAll(tables) {
      Array.prototype.forEach.call(tables, numify);
    }
    function numLater(t) {
      if (touched.indexOf(t) < 0) touched.push(t);
      clearTimeout(pending);
      pending = setTimeout(function () { var ts = touched; touched = []; numAll(ts); }, 250);
    }
    function numWatch() {
      numAll(document.querySelectorAll("table"));
      if (!("MutationObserver" in window)) return;
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          var t = m.target && m.target.closest && m.target.closest("table");
          if (t) numLater(t);
          else if (m.addedNodes) Array.prototype.forEach.call(m.addedNodes, function (nd) {
            if (nd.nodeType !== 1) return;
            if (nd.tagName === "TABLE") numLater(nd);
            else if (nd.querySelectorAll) Array.prototype.forEach.call(nd.querySelectorAll("table"), numLater);
          });
        });
      }).observe(document.body, { subtree: true, childList: true });
    }
    function start() {
      try { reveal(); } catch (e) {}
      try { shimmer(); } catch (e) {}
      try { numWatch(); } catch (e) {}
    }
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start);
  })();
})();
// ---- the verify banner and the trial's first-hour checklist ----
// static/nudges.js (nudge_mail.py, the 2026-10-14 telemetry review): one
// strip under the opsbar for an unverified address or an account in its
// trial; it asks /api/account/nudges only when signed in.
(function () {
  if (window.qgNudgesLoaded) return;
  window.qgNudgesLoaded = 1;
  var s = document.createElement("script");
  s.src = "/static/nudges.js?v=vcode1";
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
