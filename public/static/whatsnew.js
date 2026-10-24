// What's new (whats_new.py, 2026-10-20): the release card and the log.
//
// The card: nav.js loads this file only when /api/tiers/me says a release
// is due for this account. It asks /api/whats-new again (the answer of
// record), waits for the page to settle, and opens one dialog with the
// newest unseen releases (at most two; the rest roll into "and N more" on
// the log). On a phone the dialog is a sheet that slides up from the
// bottom. Opening it marks every due release seen on the account, so it
// shows once, on one device. It never opens over another card or a tour,
// on a ?tour=1 or first-run page, or in a sign-in session where a tour ran
// (the server keeps that mark; nav.js reports it); a tour that opens later
// puts it away.
//
// The log (/whats-new): every release this account's plan opens, newest
// first; opening it marks the unseen ones seen.
//
// Keyboard: focus moves into the dialog and stays there (Tab cycles),
// Escape closes it and focus goes back where it was. Screen readers hear
// a modal dialog named by its heading. Motion is a short fade and rise,
// a fade only under prefers-reduced-motion. Colours are desk.css tokens,
// so Night and Day both hold. ASCII only.
(function (root) {
  "use strict";
  if (root.qgRelBooted) return;
  root.qgRelBooted = true;
  var doc = root.document;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeHref(h) {
    h = String(h || "");
    return (h.charAt(0) === "/" && h.charAt(1) !== "/") ? h : "/whats-new";
  }
  function post(body) {
    try {
      fetch("/api/whats-new/event", { method: "POST", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
  }
  // seen on the account: the cached ladder and Help's dot follow
  function forget() {
    try { sessionStorage.removeItem("qg_tiers2"); } catch (e) {}
    var w = root.qgTiers && root.qgTiers.whats_new;
    if (w) { w.due = 0; w.unseen = 0; }
    if (root.qgRelDot) root.qgRelDot(false);
  }
  function copy(text, btn) {
    var done = function () {
      var was = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", was);
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = was; }, 1600);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
        return;
      }
    } catch (e) {}
    try {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      doc.execCommand("copy");
      doc.body.removeChild(ta);
    } catch (e) {}
    done();
  }

  // one release, as the card and the log both draw it
  function relHtml(r, tag, cls, idp) {
    var body = "";
    for (var i = 0; i < (r.body || []).length; i++) body += "<li>" + esc(r.body[i]) + "</li>";
    var img = r.image && r.image.src && String(r.image.src).indexOf("/static/") === 0
      ? "<img class='rel-img qg-media' src='" + esc(r.image.src) + "' alt='" + esc(r.image.alt || "") + "' loading='lazy'>" : "";
    var prompt = r.prompt
      ? "<div class='rel-ask'><span class='rel-ask-l'>Try it with your AI</span>" +
        "<span class='rel-ask-q'>" + esc(r.prompt) + "</span></div>" : "";
    var acts = "<div class='rel-act'>" +
      "<a class='qg-btn rel-try' data-id='" + esc(r.id) + "' href='" + esc(safeHref(r.try && r.try.href)) + "'>" +
      esc((r.try && r.try.label) || "Open it") + "</a>" +
      (r.prompt ? "<button type='button' class='qg-btn secondary rel-copy' data-id='" + esc(r.id) +
        "' data-q='" + esc(r.prompt) + "'>Copy the prompt</button>" : "") + "</div>";
    return "<article class='rel-item " + (cls || "") + "'>" +
      "<p class='rel-date'><time datetime='" + esc(r.date) + "'>" + esc(r.date) + "</time>" +
      (r.fresh ? "<span class='rel-new'>New</span>" : "") + "</p>" +
      "<" + tag + " class='rel-t'" + (idp ? " id='" + idp + "'" : "") + ">" + esc(r.title) + "</" + tag + ">" +
      "<p class='rel-sum'" + (idp ? " id='" + idp + "-d'" : "") + ">" + esc(r.summary) + "</p>" +
      (body ? "<ul class='rel-body'>" + body + "</ul>" : "") + img + prompt + acts + "</article>";
  }

  var css = doc.createElement("style");
  css.textContent =
    ".rel-item .rel-date{margin:0;display:flex;align-items:center;gap:.5rem;font-family:var(--mono);font-size:.74rem;color:var(--faint);letter-spacing:.02em}" +
    ".rel-new{font-family:var(--sans);font-size:.7rem;font-weight:700;letter-spacing:.04em;color:var(--on-amber);background:var(--amber-fill);border-radius:999px;padding:1px 8px}" +
    ".rel-item .rel-t{margin:.25rem 0 .2rem;font-family:var(--cond);font-weight:700;font-size:1.3rem;line-height:1.15;color:var(--ink);letter-spacing:0;border:0;padding:0}" +
    ".rel-item .rel-sum{margin:0 0 .45rem;font-size:.95rem;line-height:1.5;color:var(--ink)}" +
    ".rel-item .rel-body{margin:0 0 .7rem;padding:0;list-style:none}" +
    ".rel-item .rel-body li{position:relative;padding:.12rem 0 .12rem 1rem;font-size:.88rem;line-height:1.5;color:var(--muted)}" +
    ".rel-item .rel-body li::before{content:'';position:absolute;left:0;top:.62em;width:6px;height:6px;border-radius:1px;background:var(--amber-fill)}" +
    ".rel-item .rel-img{display:block;max-width:100%;height:auto;border-radius:var(--radius);border:1px solid var(--line);margin:0 0 .7rem}" +
    ".rel-item .rel-ask{display:flex;flex-direction:column;gap:.15rem;margin:0 0 .7rem;padding:.5rem .7rem;background:var(--field);border:1px solid var(--line2);border-radius:var(--radius)}" +
    ".rel-item .rel-ask-l{font-size:.74rem;font-weight:600;color:var(--muted)}" +
    ".rel-item .rel-ask-q{font-family:var(--mono);font-size:.82rem;color:var(--ink)}" +
    ".rel-item .rel-act{display:flex;flex-wrap:wrap;gap:.5rem}" +
    ".rel-item .rel-act .qg-btn{min-width:0;margin:0}" +
    // the card
    "#qg-rel{position:fixed;inset:0;z-index:430;display:flex;align-items:center;justify-content:center;padding:16px;font-family:var(--sans)}" +
    "#qg-rel .rel-scrim{position:absolute;inset:0;background:var(--scrim,rgba(5,7,11,.72))}" +
    "#qg-rel .rel-card{position:relative;box-sizing:border-box;width:min(560px,100%);max-height:calc(100vh - 32px);overflow-y:auto;" +
      "background:var(--surface);color:var(--ink);border:1px solid var(--line2);border-radius:var(--radius-lg,10px);" +
      "box-shadow:0 24px 64px rgba(var(--shade-rgb,0,0,0),.45);overscroll-behavior:contain}" +
    "#qg-rel .rel-top{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.7rem .6rem .2rem 1.15rem}" +
    "#qg-rel .rel-h{margin:0;font-family:var(--sans);font-size:.95rem;font-weight:650;color:var(--ink);letter-spacing:0;border:0;padding:0;outline:none;display:flex;align-items:center;gap:.5rem}" +
    "#qg-rel .rel-h::before{content:'';width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid var(--amber-fill)}" +
    "#qg-rel .rel-x{min-width:44px;min-height:44px;background:none;border:0;border-radius:var(--radius);color:var(--muted);font-size:22px;line-height:1;cursor:pointer}" +
    "#qg-rel .rel-x:hover{color:var(--ink);background:var(--surface2)}" +
    "#qg-rel .rel-item{padding:.75rem 1.15rem .95rem}" +
    "#qg-rel .rel-item + .rel-item{border-top:1px solid var(--line2)}" +
    "#qg-rel .rel-more{display:block;margin:0 1.15rem .6rem;font-size:.88rem;color:var(--amber);text-decoration:underline;text-underline-offset:3px}" +
    "#qg-rel .rel-foot{position:sticky;bottom:0;background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.6rem 1.15rem .9rem;border-top:1px solid var(--line2)}" +
    "#qg-rel .rel-foot a{font-size:.88rem;color:var(--muted);text-decoration:underline;text-underline-offset:3px}" +
    "#qg-rel .rel-foot a:hover{color:var(--ink)}" +
    "#qg-rel :focus-visible{outline:2px solid var(--amber);outline-offset:2px}" +
    "#qg-rel .rel-h:focus,#qg-rel .rel-h:focus-visible{outline:none}" +
    "#qg-rel .rel-grab{display:none}" +
    "#qg-rel.in .rel-scrim{animation:relFade 180ms ease-out both}" +
    "#qg-rel.in .rel-card{animation:relRise 220ms cubic-bezier(.2,0,0,1) both}" +
    "@keyframes relFade{from{opacity:0}to{opacity:1}}" +
    "@keyframes relRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}" +
    "@keyframes relSheet{from{transform:translateY(100%)}to{transform:none}}" +
    "@media (max-width:600px){#qg-rel{align-items:flex-end;padding:0}" +
      "#qg-rel .rel-card{width:100%;max-height:88vh;border-radius:16px 16px 0 0;border-bottom:0;padding-bottom:env(safe-area-inset-bottom)}" +
      "#qg-rel .rel-grab{display:block;width:40px;height:4px;border-radius:2px;background:var(--line2);margin:8px auto 0}" +
      "#qg-rel .rel-top{padding-top:.3rem}" +
      "#qg-rel.in .rel-card{animation:relSheet 260ms cubic-bezier(.2,0,0,1) both}" +
      "#qg-rel .rel-item .rel-act .qg-btn{flex:1 1 auto}}" +
    "@media (prefers-reduced-motion: reduce){#qg-rel.in .rel-card,#qg-rel.in .rel-scrim{animation:relFade 1ms linear both}}";
  doc.head.appendChild(css);

  // ------------------------------------------------------------ the log
  var log = doc.getElementById("wn-log");
  if (log) {
    doc.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-q]");
      if (b) {
        copy(b.getAttribute("data-q"), b);
        if (b.getAttribute("data-id")) post({ event: "clicked", ids: [b.getAttribute("data-id")], target: "prompt", surface: "log" });
        return;
      }
      var a = e.target.closest && e.target.closest(".rel-try");
      if (a) post({ event: "clicked", ids: [a.getAttribute("data-id")], target: "try", surface: "log" });
    });
    fetch("/api/whats-new", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (d) {
      var rels = (d && d.releases) || [];
      if (!rels.length) {
        log.innerHTML = "<p class='wn-empty'>Nothing here yet. Each release lands here the day it goes live.</p>";
        return;
      }
      var html = "", fresh = [];
      for (var i = 0; i < rels.length; i++) {
        // fresh: unseen and live after this account was made (the server says)
        if (rels[i].fresh) fresh.push(rels[i].id);
        html += relHtml(rels[i], "h3", "wn-rel");
      }
      log.innerHTML = html;
      if (fresh.length) { post({ event: "seen", ids: fresh, surface: "log" }); forget(); }
    }).catch(function () {
      log.innerHTML = "<p class='wn-empty'>The log did not load. Refresh the page to try again.</p>";
    });
    return;
  }

  // ------------------------------------------------------------ the card
  var box = null, back = null, shown = [], overflow = "";
  // a tour on this page (nav.js sets qgRelQuiet as it reports one); a tour
  // earlier in the sign-in session already left nothing due on the server
  function quiet() {
    if (/[?&](first|tour)=1(&|$)/.test(String(location.search || ""))) return true;
    return !!root.qgRelQuiet;
  }
  function otherUp() {
    if (root.qgTourPending) return true;
    var sel = ["#qg-tour", "#qgtour", "#qg-wn", "#qg-tier.open", "#qg-pal.open", "#qg-help.open",
               "#qg-xpop", "#qg-agent.open", "#qgside.open"];
    for (var i = 0; i < sel.length; i++) if (doc.querySelector(sel[i])) return true;
    return false;
  }
  function focusables() {
    return Array.prototype.filter.call(
      box.querySelectorAll("a[href],button:not([disabled]),[tabindex='0']"),
      function (el) { return el.offsetParent !== null || el === doc.activeElement; });
  }
  function onKey(e) {
    if (!box) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close("escape");
      return;
    }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (doc.activeElement === first || !box.contains(doc.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && doc.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  function remove() {
    if (!box) return;
    root.removeEventListener("keydown", onKey, true);
    if (box.parentNode) box.parentNode.removeChild(box);
    box = null;
    doc.documentElement.style.overflow = overflow;
    if (back && back.focus && doc.contains(back) && back !== doc.body) {
      try { back.focus({ preventScroll: true }); } catch (e) { back.focus(); }
    }
    back = null;
  }
  function close(how) {
    if (!box) return;
    post({ event: "dismissed", ids: shown, how: how, surface: "card" });
    remove();
  }
  // another card or a tour opening later puts the card away (nav.js
  // overlayQuiet); it was already seen, so it does not come back
  root.qgRelHide = remove;

  function open(d) {
    var card = d.card || [];
    if (!card.length || box) return;
    shown = card.map(function (r) { return r.id; });
    var rolled = (d.due || []).filter(function (id) { return shown.indexOf(id) < 0; });
    var items = "";
    for (var i = 0; i < card.length; i++) items += relHtml(card[i], "h3", "", i === 0 ? "qg-rel-t0" : "");
    var more = d.more > 0
      ? "<a class='rel-more' href='/whats-new' data-how='more'>And " + d.more + " more on What's new</a>" : "";
    back = doc.activeElement;
    box = doc.createElement("div");
    box.id = "qg-rel";
    box.innerHTML =
      "<div class='rel-scrim' data-how='backdrop'></div>" +
      "<div class='rel-card' role='dialog' aria-modal='true' aria-labelledby='qg-rel-h qg-rel-t0' aria-describedby='qg-rel-t0-d'>" +
      "<div class='rel-grab' aria-hidden='true'></div>" +
      "<div class='rel-top'><h2 class='rel-h' id='qg-rel-h' tabindex='-1'>What's new</h2>" +
      "<button type='button' class='rel-x' aria-label='Close'>&times;</button></div>" +
      items + more +
      "<div class='rel-foot'><a href='/whats-new' data-how='log'>See every release</a>" +
      "<button type='button' class='qg-btn secondary rel-done'>Got it</button></div></div>";
    overflow = doc.documentElement.style.overflow;
    doc.documentElement.style.overflow = "hidden";
    doc.body.appendChild(box);
    // the fade and rise (a fade only under reduced motion, the CSS); the
    // glossary leaves the card's words alone
    box.className = "in qg-gloss-off";
    root.addEventListener("keydown", onKey, true);
    box.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest(".rel-x")) { close("close"); return; }
      if (t.closest(".rel-done")) { close("done"); return; }
      if (t.classList.contains("rel-scrim")) { close("backdrop"); return; }
      var cp = t.closest("[data-q]");
      if (cp) {
        copy(cp.getAttribute("data-q"), cp);
        post({ event: "clicked", ids: [cp.getAttribute("data-id")], target: "prompt", surface: "card" });
        return;
      }
      var tr = t.closest(".rel-try");
      if (tr) {
        post({ event: "clicked", ids: [tr.getAttribute("data-id")], target: "try", surface: "card" });
        post({ event: "dismissed", ids: shown, how: "try", surface: "card" });
        return;
      }
      var lk = t.closest("a[data-how]");
      if (lk) {
        var how = lk.getAttribute("data-how");
        post({ event: "clicked", ids: shown, target: how, surface: "card" });
        post({ event: "dismissed", ids: shown, how: how, surface: "card" });
      }
    });
    // shown once: opening marks every due release seen on the account (the
    // rolled-up ones too, so the next page does not open a second card)
    post({ event: "seen", ids: shown, also: rolled, surface: "card" });
    forget();
    var h = doc.getElementById("qg-rel-h");
    try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
  }

  if (quiet()) return;
  fetch("/api/whats-new", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.card || !d.card.length) { if (d && !d.unseen && root.qgRelDot) root.qgRelDot(false); return; }
    // after the page's own first paint and any tour that is about to start
    function go() {
      setTimeout(function () { if (!quiet() && !otherUp()) open(d); }, 1500);
    }
    if (doc.readyState === "complete") go();
    else root.addEventListener("load", go);
  }).catch(function () {});
})(window);
