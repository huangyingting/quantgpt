/* One-tap sign-in on /signin (onetap.py): Continue with Google, Apple or
   GitHub. The server lists the providers that are configured; with none,
   nothing is drawn. Each button is a plain link to
   /auth/oauth/<provider>/start, carrying the visit's attribution (attr.js)
   and the page the visitor was headed for. This file also answers the
   provider's return: a refusal, the email-link step (one password sign-in
   links the provider) and the authenticator step. ASCII only. */
(function(){
  "use strict";
  function $(id){ return document.getElementById(id); }
  var box=$("onetap");
  if(!box) return;
  // the buttons' styles ride with the script (the page stays inside its
  // HTML budget, and nothing here shows before the script draws it).
  // Provider marks in their own colours on a neutral button, per each
  // provider's branding rules
  var st=document.createElement("style");
  st.textContent='.onetap{margin:0 0 .25rem}.onetap[hidden]{display:none}.ot-btns{display:grid;gap:.5rem}.ot-btn{display:flex;align-items:center;justify-content:center;gap:.6rem;min-height:44px;padding:0 1rem;border:1px solid var(--line2);border-radius:var(--radius,5px);background:var(--field);color:var(--ink);font-family:"Segoe UI",Selawik,system-ui,sans-serif;font-size:.9rem;font-weight:600;text-decoration:none;transition:border-color var(--ease,.15s),background-color var(--ease,.15s)}.ot-btn svg{width:18px;height:18px;flex:0 0 18px}.ot-btn:hover{border-color:var(--pg-hover-edge,#46546a);background:var(--pg-field-hi,#0e131c)}.ot-btn:focus-visible{outline:2px solid var(--amber);outline-offset:2px}.ot-btn:active{background:var(--bg)}.ot-fine{font-size:.72rem;line-height:1.55;color:var(--muted);margin:.6rem 0 0}.ot-fine a{color:var(--amber);text-decoration:underline;text-underline-offset:2px}.ot-or{display:flex;align-items:center;gap:.6rem;margin:.9rem 0 .8rem;color:var(--faint);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}.ot-or::before,.ot-or::after{content:"";flex:1;height:1px;background:var(--line2)}.ot-2fa{margin-bottom:.5rem}.ot-2fa input[type=text]{width:100%}@media (max-width:480px){.ot-btn{min-height:48px;font-size:.95rem}}';
  document.head.appendChild(st);
  var LOGO={
    google:'<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
    apple:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
    github:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
  };
  var NAMES={google:"Google",apple:"Apple",github:"GitHub"};
  var ERR={
    cancelled:"Sign-in was cancelled. Try again, or sign in with your email instead.",
    state:"That sign-in link was already used or came from another tab. Start again.",
    expired:"That sign-in took too long. Start again.",
    token:"We could not confirm that sign-in. Start again.",
    exchange:"The provider did not answer. Try again in a moment.",
    unverified:"That account has no verified email. Verify it with the provider, or sign in with your email instead.",
    limit:"Too many sign-ups from this address today. Try tomorrow.",
    taken:"That sign-in is already linked to another QuantGPT account.",
    linked_elsewhere:"That sign-in is already linked to another QuantGPT account.",
    email:"That email address is not one we can use.",
    account:"That account no longer exists.",
    signin:"Sign in first, then link it from your account page.",
    off:"That sign-in is not available right now. Use your email instead."
  };
  function q(name){ try{ return new URLSearchParams(location.search).get(name)||""; }catch(e){ return ""; } }
  function note(text, warn){
    var e=$("err"); if(!e) return;
    e.textContent=text;
    e.style.color=warn?"":"var(--amber,#F0A83C)";
  }
  function startUrl(p){
    var A=window.QGAttr||{}, utm=A.utm||{}, s=new URLSearchParams();
    if(A.src) s.set("src",A.src);
    if(A.rdt_cid) s.set("rdt_cid",A.rdt_cid);
    if(A.rdt_uuid) s.set("rdt_uuid",A.rdt_uuid);
    if(A.twclid) s.set("twclid",A.twclid);
    if(A.ref) s.set("ref",A.ref);
    Object.keys(utm).forEach(function(k){ if(/^utm_[a-z]+$/.test(k)&&utm[k]) s.set(k,utm[k]); });
    var n=q("next"); if(n&&n.charAt(0)==="/"&&n.charAt(1)!=="/") s.set("next",n);
    var qs=s.toString();
    return "/auth/oauth/"+p+"/start"+(qs?"?"+qs:"");
  }
  function draw(list){
    if(!list.length) return;
    var btns=document.createElement("div"); btns.className="ot-btns";
    list.forEach(function(p){
      var a=document.createElement("a");
      a.className="ot-btn ot-"+p.id; a.href=startUrl(p.id);
      a.innerHTML=(LOGO[p.id]||"")+"<span></span>";
      a.querySelector("span").textContent="Continue with "+(p.label||NAMES[p.id]||p.id);
      btns.appendChild(a);
    });
    var fine=document.createElement("p"); fine.className="ot-fine";
    fine.innerHTML='By continuing you confirm you are 18 or older, use market data for personal, '+
      'non-professional purposes, and accept the <a href="https://quantgpt.co/terms.html" target="_blank" rel="noopener">Terms of Service</a>, '+
      '<a href="https://quantgpt.co/privacy.html" target="_blank" rel="noopener">Privacy Policy</a> and '+
      '<a href="https://quantgpt.co/disclosures.html" target="_blank" rel="noopener">Disclosures</a>.';
    var or=document.createElement("div"); or.className="ot-or"; or.innerHTML="<span>or with email</span>";
    box.appendChild(btns); box.appendChild(fine); box.appendChild(or);
    box.hidden=false;
  }
  // on the provider's return for the 2FA step or the email-link step the
  // buttons stay off: tapping one again would only loop back here
  var step=q("oauth");
  if(step!=="2fa"&&step!=="link"){
    fetch("/api/auth/oauth/providers").then(function(r){ return r.json(); })
      .then(function(d){ draw((d&&d.providers)||[]); }).catch(function(){});
  }

  // ---- the provider's return ----
  var prov=NAMES[q("provider")]||"that provider";
  var code=q("oauth_error");
  if(code) note(ERR[code]||"That sign-in did not work. Try again.", true);
  if(q("oauth")==="link"){
    var t=$("tab-in"); if(t) t.click();
    note("An account with this email already exists. Sign in with your password once and "+prov+
         " is linked to it; after that, one tap signs you in.");
  }
  if(q("oauth")==="2fa"){
    var f=document.createElement("form"); f.className="ot-2fa";
    f.innerHTML='<p class="hint">Signed in with '+prov.replace(/[<>&"]/g,"")+'. Enter the 6-digit code from your '+
      'authenticator app, or a recovery code.</p>'+
      '<input id="ot-code" type="text" maxlength="11" autocomplete="one-time-code" '+
      'placeholder="authenticator or recovery code" aria-label="Authenticator or recovery code">'+
      '<button class="qg-btn go" type="submit">Continue</button>';
    box.parentNode.insertBefore(f, box);
    ["f","f2"].forEach(function(id){ var e=$(id); if(e) e.className="hidden"; });
    var tabs=document.querySelector(".tabs"); if(tabs) tabs.style.display="none";
    f.onsubmit=function(e){
      e.preventDefault();
      fetch("/api/auth/oauth/2fa",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code:$("ot-code").value})})
      .then(function(r){ return r.json(); }).then(function(d){
        if(d.ok){ var n=d.next||"/"; location.href=(n.charAt(0)==="/"&&n.charAt(1)!=="/")?n:"/"; }
        else note(d.need_2fa?"Wrong code. Try the next one.":String(d.error||"Try again."), true);
      }).catch(function(){ note("Network hiccup. Try again.", true); });
    };
    try{ $("ot-code").focus(); }catch(e){}
  }
})();
