// The verify banner and the trial's first-hour checklist (nudge_mail.py,
// the 2026-10-14 telemetry review). nav.js loads this on every terminal
// page. One strip under the opsbar:
//   - an unverified address: "Confirm your email" with the 6-digit code
//     from the email (POST /api/auth/verify-code, sent on the 6th digit)
//     and Send a new code (POST /api/auth/resend-verify, once a minute);
//     the account page has its own banner, so not there
//   - an account in its trial that has not done all three: connect your
//     AI, ask it one question, run one backtest, each ticked from what the
//     account already did (GET /api/account/nudges), with an X that hides
//     it for good (POST /api/account/nudges/dismiss)
// Nothing shows signed out, and nothing on the sign-in, join and consent
// pages. ASCII only.
(function () {
  "use strict";
  if (window.qgNudges) return;
  window.qgNudges = 1;
  var path = location.pathname;
  if (/^\/(signin|login|join|reset|accept|oauth|status|s|study)(\/|$)/.test(path)) return;

  var css = document.createElement("style");
  css.textContent =
    ".qg-nudge{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin:.75rem auto 0;max-width:1440px;" +
    "box-sizing:border-box;width:calc(100% - 2.5rem);padding:.6rem .9rem;border:1px solid var(--line2,#1E2634);" +
    "border-left:2px solid var(--amber,#F0A83C);border-radius:var(--radius,6px);background:var(--surface,#10151E);" +
    "font-family:var(--sans,system-ui,sans-serif);font-size:.84rem;line-height:1.45;color:var(--ink,#E7ECF4)}" +
    ".qg-nudge .nk{font-family:var(--mono,Consolas,Cascadia Mono Web,monospace);font-size:.62rem;letter-spacing:.14em;color:var(--amber,#F0A83C);white-space:nowrap}" +
    ".qg-nudge .nt{flex:1;min-width:200px;color:var(--muted,#9AA5B6)}.qg-nudge .nt b{color:var(--ink,#E7ECF4);font-weight:600}" +
    ".qg-nudge .nm{font-size:.78rem;color:var(--faint,#778498)}.qg-nudge .nm.bad{color:var(--down,#E5484D)}.qg-nudge .nm.ok{color:var(--up,#43BD85)}" +
    ".qg-nudge .nc{font-family:var(--mono,Consolas,Cascadia Mono Web,monospace);font-size:1rem;letter-spacing:.35em;text-align:center;width:9.5rem;" +
    "min-height:36px;padding:.3rem .4rem .3rem .75rem;box-sizing:border-box;background:var(--field,#0B0F16);color:var(--ink,#E7ECF4);" +
    "border:1px solid var(--line2,#1E2634);border-radius:var(--radius-sm,4px)}" +
    ".qg-nudge .nc::placeholder{color:var(--faint,#778498)}.qg-nudge .nc:focus{outline:0;border-color:var(--amber,#F0A83C);box-shadow:0 0 0 2px rgba(240,168,60,.18)}" +
    ".qg-nudge ol{display:flex;gap:.4rem 1.1rem;flex-wrap:wrap;list-style:none;margin:0;padding:0;flex:1;min-width:220px}" +
    ".qg-nudge li a{display:inline-flex;align-items:center;gap:.4rem;color:var(--ink,#E7ECF4);text-decoration:none;min-height:32px}" +
    ".qg-nudge li a:hover{color:var(--amber,#F0A83C)}" +
    ".qg-nudge li .bx{width:15px;height:15px;border:1px solid var(--edge,#5E6A7E);border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;line-height:1;flex:none}" +
    ".qg-nudge li.on a{color:var(--faint,#778498);text-decoration:line-through}" +
    ".qg-nudge li.on .bx{background:var(--up,#43BD85);border-color:var(--up,#43BD85);color:var(--on-up,#062B1A)}" +
    ".qg-nudge .nx{background:none;border:0;color:var(--muted,#9AA5B6);cursor:pointer;font-size:1rem;line-height:1;padding:.3rem .45rem;min-height:32px}" +
    ".qg-nudge .nx:hover{color:var(--ink,#E7ECF4)}" +
    "@media (max-width:560px){.qg-nudge{width:calc(100% - 1.5rem);margin-top:.6rem;padding:.6rem .7rem}.qg-nudge .nt,.qg-nudge ol{min-width:0;flex-basis:100%}" +
    ".qg-nudge ol{flex-direction:column;gap:.1rem}.qg-nudge .qg-btn{width:100%}.qg-nudge .nc{width:100%;font-size:16px;min-height:44px}.qg-nudge .nx{position:absolute;right:.35rem;top:.35rem}.qg-nudge{position:relative;padding-right:2.2rem}}";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function place(node) {
    var bar = document.querySelector(".opsbar");
    if (bar && bar.parentNode) bar.parentNode.insertBefore(node, bar.nextSibling);
    else document.body.insertBefore(node, document.body.firstChild);
  }
  function cap(t) { t = String(t || ""); return t.charAt(0).toUpperCase() + t.slice(1); }
  function post(url, body) {
    return fetch(url, {method: "POST", credentials: "same-origin",
      headers: {"Content-Type": "application/json"}, body: JSON.stringify(body || {})})
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }

  function verifyStrip(v) {
    var box = el("div", "qg-nudge");
    box.id = "qg-verify";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Confirm your email");
    box.appendChild(el("span", "nk", "CONFIRM YOUR EMAIL"));
    var t = el("span", "nt");
    t.appendChild(document.createTextNode("Enter the 6-digit code we sent to "));
    t.appendChild(el("b", "", v.to || "your address"));
    t.appendChild(document.createTextNode(", so the notices about your account reach you."));
    box.appendChild(t);
    var f = el("form");
    f.style.cssText = "display:contents";
    f.noValidate = true;
    var inp = el("input", "nc");
    inp.type = "text";
    inp.setAttribute("inputmode", "numeric");
    inp.setAttribute("autocomplete", "one-time-code");
    inp.setAttribute("pattern", "[0-9]*");
    inp.maxLength = 6;
    inp.placeholder = "\u2022\u2022\u2022\u2022\u2022\u2022";
    inp.setAttribute("aria-label", "6-digit code");
    f.appendChild(inp);
    box.appendChild(f);
    var b = el("button", "qg-btn secondary", "Send a new code");
    b.type = "button";
    var m = el("span", "nm");
    m.setAttribute("aria-live", "polite");
    function say(text, cls) { m.textContent = text; m.className = "nm" + (cls ? " " + cls : ""); }
    var timer = null;
    function wait(sec) {
      clearInterval(timer);
      var left = Math.max(0, sec | 0);
      function tick() {
        if (left <= 0) { clearInterval(timer); b.disabled = false; b.textContent = "Send a new code"; return; }
        b.disabled = true; b.textContent = "Send a new code (" + left + "s)"; left--;
      }
      tick();
      if (left > 0) timer = setInterval(tick, 1000);
    }
    var busy = false;
    function check() {
      var code = inp.value.replace(/\D/g, "");
      if (code.length !== 6) { say("Enter the 6 digits from the email.", "bad"); return; }
      if (busy) return;
      busy = true;
      post("/api/auth/verify-code", {code: code}).then(function (d) {
        busy = false;
        if (d && d.ok) {
          say("Email confirmed.", "ok");
          inp.disabled = true; b.disabled = true; clearInterval(timer);
          setTimeout(function () { box.remove(); }, 2500);
          return;
        }
        var text;
        if (d && d.dead) text = "Too many wrong tries. Send a new code.";
        else if (d && d.expired) text = "That code has expired. Send a new code.";
        else if (d && d.left != null) text = "Wrong code. " + d.left + (d.left === 1 ? " try" : " tries") + " left.";
        else text = d && d.error ? cap(d.error) + "." : "Try again.";
        say(text, "bad");
        inp.select();
      }).catch(function () { busy = false; say("Network hiccup. Try again.", "bad"); });
    }
    function digits() {
      var v6 = inp.value.replace(/\D/g, "").slice(0, 6);
      if (inp.value !== v6) inp.value = v6;
      if (v6.length === 6) check();
    }
    inp.addEventListener("input", digits);
    inp.addEventListener("paste", function (e) {
      var c = e.clipboardData || window.clipboardData;
      if (!c) return;
      e.preventDefault();
      inp.value = String(c.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      digits();
    });
    f.addEventListener("submit", function (e) { e.preventDefault(); check(); });
    b.addEventListener("click", function () {
      b.disabled = true;
      post("/api/auth/resend-verify").then(function (d) {
        if (d && d.already) { box.remove(); return; }
        if (d && d.error) { say(cap(d.error) + ".", "bad"); wait(d.wait || 60); return; }
        say(d && d.verify_sent ? "A new code is on its way. The old one no longer works."
          : "It did not go. Try again in a minute.", d && d.verify_sent ? "" : "bad");
        inp.value = "";
        wait(60);
      }).catch(function () { b.disabled = false; say("It did not go. Try again in a minute.", "bad"); });
    });
    box.appendChild(b);
    box.appendChild(m);
    if (v.wait) wait(v.wait);
    return box;
  }

  function checklist(f) {
    var box = el("div", "qg-nudge");
    box.id = "qg-firsthour";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Your first hour");
    box.appendChild(el("span", "nk", "YOUR FIRST HOUR \u00b7 " + (f.done || 0) + " OF 3"));
    var ol = el("ol");
    (f.steps || []).forEach(function (s) {
      var li = el("li", s.done ? "on" : "");
      var a = el("a");
      a.href = s.href;
      var bx = el("span", "bx", s.done ? "\u2713" : "");
      bx.setAttribute("aria-hidden", "true");
      a.appendChild(bx);
      a.appendChild(document.createTextNode(s.label));
      if (s.done) a.setAttribute("aria-label", s.label + ", done");
      li.appendChild(a);
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var x = el("button", "nx", "\u00d7");
    x.type = "button";
    x.setAttribute("aria-label", "Hide this checklist");
    x.addEventListener("click", function () {
      box.remove();
      post("/api/account/nudges/dismiss", {what: "firsthour"}).catch(function () {});
    });
    box.appendChild(x);
    return box;
  }

  function show(d) {
    if (!d || d.error) return;
    var nodes = [];
    if (d.firsthour && d.firsthour.show) nodes.push(checklist(d.firsthour));
    if (d.verify && d.verify.show && path !== "/account") nodes.push(verifyStrip(d.verify));
    if (!nodes.length) return;
    document.head.appendChild(css);
    // placed in reverse so the first one sits right under the opsbar
    for (var i = nodes.length - 1; i >= 0; i--) place(nodes[i]);
  }

  function go() {
    var auth = window.qgAuth || Promise.resolve(true);
    auth.then(function (inn) {
      if (!inn) return null;
      return fetch("/api/account/nudges", {credentials: "same-origin"})
        .then(function (r) { return r.ok ? r.json() : null; });
    }).then(show).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
