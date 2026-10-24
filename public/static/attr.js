/* Attribution on the terminal (docs LAUNCH_PLAN_OCT1.md item 9).
   A terminal link can carry src (a /go/ partner code), the utm_* tags
   and the ad click ids (rdt_cid, twclid), e.g. /join?src=CODE.
   They are kept in this tab's sessionStorage (qg_src, qg_utm, qg_rdt_cid,
   qg_twclid, the keys signin.html already used), so a visitor who goes from /join to
   Stripe and back to /welcome, or on to /signin, still brings them to the
   signup. A tag on the link wins over one kept earlier. Nothing here is
   sent anywhere by itself: join.html adds src and utm_* to the checkout
   link, and welcome.html and signin.html put them in the signup body.
   The server cleans every value again (accounts.clean_src, clean_utm).
   Global Privacy Control or Do Not Track: the click ids and a Reddit
   campaign code (rd-*) are neither kept nor sent, and any kept earlier are
   cleared, the same check as site/nav.js (privacy.html section 8). The
   server drops them too when the request carries the signal.
   ref: the referring site's word from site/nav.js (google, x, other;
   never an address), kept as qg_ref, first touch; dropped under GPC or DNT.
   rdt_uuid (2026-10-19, Brett: Reddit enhanced capture): the Reddit
   pixel's own _rdt_uuid value, which site/nav.js carries onto the door,
   /join and /signin links beside rdt_cid, kept as qg_rdt_uuid, first
   touch, and posted with the signup, the claim and the checkout like the
   click id; dropped under GPC or DNT. The server also keeps both in the
   qg_attr cookie (accounts.attr_cookie_value). */
(function () {
  "use strict";
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  function load(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function keep(k, v) { try { if (v) { sessionStorage.setItem(k, v); } } catch (e) {} }
  function drop(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  function cleanSrc(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32); }
  function cleanCid(v) { return String(v || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 200); }
  function cleanUuid(v) { return String(v || "").replace(/[^A-Za-z0-9._-]/g, "").slice(0, 100); }
  function cleanRef(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24); }
  function cleanTag(v) { return String(v || "").replace(/[^A-Za-z0-9 _.:+\/-]/g, "").trim().slice(0, 100); }
  function cleanUtm(o) {
    var out = {};
    UTM.forEach(function (k) { var v = cleanTag(o && o[k]); if (v) { out[k] = v; } });
    return out;
  }
  var q = null;
  try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
  function arg(k) { return q ? (q.get(k) || "") : ""; }

  var optOut = false;
  try {
    optOut = navigator.globalPrivacyControl === true ||
             navigator.doNotTrack === "1" || window.doNotTrack === "1";
  } catch (e) { optOut = false; }
  var linkSrc = cleanSrc(arg("src"));
  var keptSrc = cleanSrc(load("qg_src"));
  var cid = cleanCid(arg("rdt_cid")) || cleanCid(load("qg_rdt_cid"));
  var xcid = cleanCid(arg("twclid")) || cleanCid(load("qg_twclid"));
  // first touch: the pixel id this tab kept wins over a later link's
  var ruuid = cleanUuid(load("qg_rdt_uuid")) || cleanUuid(arg("rdt_uuid"));
  // first touch: the word this tab kept wins over a later link's
  var ref = cleanRef(load("qg_ref")) || cleanRef(arg("ref"));
  if (optOut) {
    cid = "";
    xcid = "";
    ref = "";
    ruuid = "";
    drop("qg_rdt_cid");
    drop("qg_rdt_uuid");
    drop("qg_twclid");
    drop("qg_ref");
    if (linkSrc.indexOf("rd-") === 0) { linkSrc = ""; }
    if (keptSrc.indexOf("rd-") === 0) { keptSrc = ""; drop("qg_src"); }
  }
  var src = linkSrc || keptSrc;
  var linkUtm = {};
  UTM.forEach(function (k) { linkUtm[k] = arg(k); });
  var utm = cleanUtm(linkUtm);
  if (Object.keys(utm).length) {
    keep("qg_utm", JSON.stringify(utm));
  } else {
    try { utm = cleanUtm(JSON.parse(load("qg_utm") || "{}")); } catch (e) { utm = {}; }
  }
  keep("qg_src", src);
  keep("qg_rdt_cid", cid);
  keep("qg_twclid", xcid);
  keep("qg_rdt_uuid", ruuid);
  keep("qg_ref", ref);

  // the query string for a terminal link: src and the utm_* tags, else the
  // referrer word (the ad click ids never leave the tab this way)
  function query() {
    var parts = [];
    if (src) { parts.push("src=" + encodeURIComponent(src)); }
    UTM.forEach(function (k) { if (utm[k]) { parts.push(k + "=" + encodeURIComponent(utm[k])); } });
    if (!parts.length && ref) { parts.push("ref=" + encodeURIComponent(ref)); }
    return parts.join("&");
  }
  // add it to a link's href, before any #hash
  function tag(a) {
    var qs = query();
    if (!qs || !a || !a.getAttribute) { return; }
    var href = a.getAttribute("href") || "";
    var hash = "";
    var i = href.indexOf("#");
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    a.setAttribute("href", href + (href.indexOf("?") >= 0 ? "&" : "?") + qs + hash);
  }
  window.QGAttr = { src: src, rdt_cid: cid, rdt_uuid: ruuid, twclid: xcid, utm: utm, ref: ref,
                    query: query, tag: tag };
})();
