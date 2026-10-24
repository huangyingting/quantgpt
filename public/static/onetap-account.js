/* Sign-in methods on /account (onetap.py): link or unlink Google, Apple or
   GitHub. The panel stays hidden when no provider is configured and none
   is linked. Linking goes through the provider (/auth/oauth/<p>/start?link=1)
   and needs a recent sign-in, like adding a passkey. ASCII only. */
(function(){
  "use strict";
  function $(id){ return document.getElementById(id); }
  var panel=$("signin-methods"), t=$("ot-table"), msg=$("ot-msg");
  if(!panel||!t) return;
  function say(text, ok){
    var s=String(text||""); s=s.charAt(0).toUpperCase()+s.slice(1);
    msg.textContent=s; msg.style.color=ok?"var(--up,#43BD85)":"var(--down,#DF605E)";
  }
  function paint(list){
    panel.hidden=!list.length;
    t.style.display=list.length?"table":"none";
    t.textContent="";
    list.forEach(function(p){
      var tr=document.createElement("tr");
      var a=document.createElement("td"); a.textContent=p.label;
      var b=document.createElement("td"); b.textContent=p.linked?("Linked"+(p.email?": "+p.email:"")):"Not linked";
      var c=document.createElement("td");
      if(p.can_link){
        var l=document.createElement("a"); l.href="/auth/oauth/"+encodeURIComponent(p.id)+"/start?link=1";
        l.textContent="Link "+p.label; c.appendChild(l);
      } else if(p.linked&&p.can_unlink){
        var u=document.createElement("a"); u.href="#"; u.textContent="Unlink";
        u.style.color="var(--down,#DF605E)";
        u.onclick=function(e){
          e.preventDefault();
          fetch("/api/auth/oauth/unlink",{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({provider:p.id})}).then(function(r){ return r.json(); })
          .then(function(d){
            if(d.ok){ say(p.label+" unlinked.", true); load(); }
            else say(d.reauth?"For your security, sign out and sign in again to unlink.":(d.error||"Try again."));
          }).catch(function(){ say("Network hiccup. Try again."); });
        };
        c.appendChild(u);
      } else if(p.linked){
        c.textContent="Your only way in";
      }
      tr.appendChild(a); tr.appendChild(b); tr.appendChild(c); t.appendChild(tr);
    });
  }
  function load(){
    fetch("/api/auth/oauth/linked").then(function(r){ return r.json(); })
      .then(function(d){ paint((d&&d.providers)||[]); }).catch(function(){});
  }
  load();
  try{
    var q=new URLSearchParams(location.search);
    if(q.get("linked")) say({google:"Google",apple:"Apple",github:"GitHub"}[q.get("linked")]+" linked. One tap signs you in from now on.", true);
    if(q.get("reauth")==="1") say("For your security, sign out and sign in again, then link the provider.");
  }catch(e){}
})();
