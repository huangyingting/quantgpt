// QuantGPT University: the way back from a lesson to its chapter.
//
// A chapter shell plays an old lesson through /university/<id>/play, which
// sends it to /learn/<n>?uni=<id>. This script, loaded by lessons 1 to 6,
// reads that id and puts "Back to University" first in the lesson's finale
// (#final), so the last button returns to the chapter with ?from=lesson and
// the chapter marks the lesson played. With no ?uni= in the address the
// lesson is untouched: /learn stays the public shelf. ASCII only.
(function () {
  "use strict";
  var m = /[?&]uni=([SG][1-5])(?:&|$)/.exec(location.search);
  if (!m) return;
  var id = m[1];
  function add() {
    var fin = document.getElementById("final");
    if (!fin || document.getElementById("uni-back")) return;
    var box = fin.querySelector(".row") || fin;
    Array.prototype.forEach.call(box.querySelectorAll("a.pri"), function (a) {
      a.className = "sec";
    });
    var a = document.createElement("a");
    a.id = "uni-back";
    a.className = "pri";
    a.href = "/university/" + id + "?from=lesson";
    a.textContent = "Back to University: chapter " + id + " \u25B8";
    box.insertBefore(a, box.firstChild);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", add);
  } else {
    add();
  }
})();
