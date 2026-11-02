/* ===== anim.js =====
   视觉增强层：逐字入场（data-split）、单行淡入（data-fade）、
   轻视差（data-parallax）、图块缩放揭示、跑马灯（data-marquee）。
   rAF 驱动 + IntersectionObserver 门控，滚动不阻塞。 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* 图片解码后用 is-ready 淡入（无论是否降级都要跑，否则图片不可见） */
  function markReady(img) {
    img.classList.add("is-ready");
  }
  Array.prototype.forEach.call(
    document.querySelectorAll(".f-figure__img, .f-hero__media img, .hero__media img"),
    function (img) {
      if (img.complete && img.naturalWidth) markReady(img);
      else {
        img.addEventListener("load", function () { markReady(img); }, { once: true });
        img.addEventListener("error", function () { markReady(img); }, { once: true });
      }
    }
  );

  if (reduce.matches) return;

  /* ---------- 逐字拆分 ----------
     用 span 包住单个字会触发字体回退与排版跳变（首字可跑到版心之外），
     因此按行包裹：每字一个 inline-block 包进「行」容器，行宽由容器决定。 */
  function splitChars(el) {
    if (el.dataset.splitDone) return;
    var text = el.dataset.split || el.textContent.trim();
    var chars = Array.from(text);
    el.textContent = "";
    var line = document.createElement("span");
    line.className = "split-line";
    chars.forEach(function (ch, i) {
      var span = document.createElement("span");
      span.className = "split-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.setProperty("--i", i);
      line.appendChild(span);
    });
    el.appendChild(line);
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", text);
  }

  var splits = document.querySelectorAll("[data-split]");
  Array.prototype.forEach.call(splits, splitChars);

  /* ---------- 英雄区容器进入 ---------- */
  var heroes = document.querySelectorAll("[data-hero], .hero");
  Array.prototype.forEach.call(heroes, function (h) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        h.classList.add("is-in");
      });
    });
  });

  /* data-fade（英雄区副标题/标签）在容器出现后逐个入场 */
  var fades = document.querySelectorAll("[data-fade]");
  Array.prototype.forEach.call(fades, function (el, i) {
    el.style.setProperty("--i", i);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add("is-in");
      });
    });
  });

  /* ---------- 轻视差 ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (parallaxEls.length) {
    var raf = null;
    var update = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.12;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var mid = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = "translate3d(0," + (-mid * speed).toFixed(2) + "px,0)";
      });
      raf = null;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!raf) raf = requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  /* ---------- 跑马灯 ---------- */
  var marquees = document.querySelectorAll("[data-marquee]");
  Array.prototype.forEach.call(marquees, function (box) {
    var track = box.querySelector(".marquee-track");
    if (!track) return;
    var clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    box.appendChild(clone);
    var x = 0;
    var w = track.scrollWidth;
    var speed = parseFloat(box.dataset.marquee) || 0.35;
    var dir = box.dataset.marqueeDir === "left" ? 1 : -1;
    var running = true;

    var io = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    });
    io.observe(box);

    function step() {
      if (running && !document.hidden) {
        x += dir * speed;
        if (x <= -w) x += w;
        if (x >= 0 && dir > 0) x -= w;
        track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
        clone.style.transform = "translate3d(" + (x + (dir > 0 ? w : -w)).toFixed(2) + "px,0,0)";
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- 图块缩放揭示 ---------- */
  if ("IntersectionObserver" in window) {
    var figIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            figIO.unobserve(en.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    Array.prototype.forEach.call(document.querySelectorAll(".f-figure, .tile"), function (el) {
      figIO.observe(el);
    });
  }
})();
