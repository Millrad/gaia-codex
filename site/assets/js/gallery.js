/* ===== gallery.js =====
   势力页共用交互：章节进度指示、图片占位淡入、表格横向滚动提示。
   内容已全部静态渲染，本脚本只做增强。 */
(function () {
  "use strict";

  /* 图片解码完成后淡入，避免加载中闪烁 */
  var imgs = document.querySelectorAll(".f-figure__img, .f-hero__media img");
  Array.prototype.forEach.call(imgs, function (img) {
    if (img.complete) {
      img.classList.add("is-ready");
      return;
    }
    img.addEventListener(
      "load",
      function () {
        img.classList.add("is-ready");
      },
      { once: true }
    );
  });

  /* 章节进度：右下角 01–0N 竖排指示 */
  var sections = document.querySelectorAll(".f-section[id]");
  if (sections.length > 1) {
    var rail = document.createElement("nav");
    rail.className = "section-rail";
    rail.setAttribute("aria-label", "章节导航");
    Array.prototype.forEach.call(sections, function (s, i) {
      var link = document.createElement("a");
      link.href = "#" + s.id;
      link.className = "section-rail__dot";
      link.innerHTML = '<span class="section-rail__num">' + String(i + 1).padStart(2, "0") + "</span>";
      link.setAttribute("aria-label", s.querySelector(".s-title") ? s.querySelector(".s-title").textContent : "第" + (i + 1) + "节");
      rail.appendChild(link);
    });
    document.body.appendChild(rail);

    var dots = rail.querySelectorAll("a");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var idx = Array.prototype.indexOf.call(sections, en.target);
          if (en.isIntersecting) {
            Array.prototype.forEach.call(dots, function (d, di) {
              d.classList.toggle("is-active", di === idx);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    Array.prototype.forEach.call(sections, function (s) {
      io.observe(s);
    });
  }

  /* 表格宽度超出时加 is-scrollable，提示可横向滚动 */
  Array.prototype.forEach.call(document.querySelectorAll(".table-wrap"), function (wrap) {
    var check = function () {
      wrap.classList.toggle("is-scrollable", wrap.scrollWidth > wrap.clientWidth + 4);
    };
    check();
    window.addEventListener("resize", check, { passive: true });
  });
})();
