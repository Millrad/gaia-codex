/* ===== core.js =====
   全站基础交互：JS 标记、滚动进度、顶栏状态、索引抽屉（焦点陷阱）、
   滚动揭示（IntersectionObserver）、锁定条目提示、页脚年份。
   无依赖，defer 加载；JS 失效时页面仍完整可读。 */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 滚动进度 ---------- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  /* ---------- 页面入场暗幕 ---------- */
  var veil = document.createElement("div");
  veil.className = "page-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.appendChild(veil);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      veil.classList.add("is-done");
      setTimeout(function () {
        veil.remove();
      }, 900);
    });
  });

  /* ---------- 顶栏 / 进度 / 隐藏逻辑 ---------- */
  var head = document.querySelector("[data-head]");
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";

    if (head) {
      head.classList.toggle("is-solid", y > 80);
      if (!document.body.classList.contains("is-drawer-open")) {
        var goingDown = y > lastY + 6;
        if (goingDown && y > 320) head.classList.add("is-hidden");
        else if (y < lastY - 6 || y < 120) head.classList.remove("is-hidden");
      }
    }
    lastY = y;

    var stickyBar = document.querySelector("[data-stickybar]");
    if (stickyBar) {
      var rect = stickyBar.parentElement.getBoundingClientRect();
      var headH = parseInt(getComputedStyle(docEl).getPropertyValue("--head-h"), 10) || 64;
      stickyBar.classList.toggle("is-stuck", rect.top <= headH);
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------- 索引抽屉 ---------- */
  var drawer = document.getElementById("drawer");
  var openBtn = document.querySelector("[data-drawer-open]");
  var closeBtn = document.querySelector("[data-drawer-close]");
  var lastFocus = null;

  if (drawer) {
    for (var i = 0; i < drawer.querySelectorAll(".drawer__list li").length; i++) {
      drawer.querySelectorAll(".drawer__list li")[i].style.setProperty("--i", i);
    }
    /* 抽屉里的封存条目：点击提示权限未开放（此时 toast 已挂到 document 上，用事件委托统一处理） */

    var openDrawer = function () {
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-drawer-open");
      if (openBtn) openBtn.setAttribute("aria-expanded", "true");
      if (head) head.classList.remove("is-hidden");
      var first = drawer.querySelector("a, button");
      if (first) setTimeout(function () { first.focus(); }, 120);
    };

    var closeDrawer = function () {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-drawer-open");
      if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    if (openBtn) openBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;
      var f = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });
  }

  /* ---------- 锁定条目提示 ---------- */
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-show");
    }, 2600);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var inDrawer = e.target.closest(".drawer");
    if (inDrawer) {
      var item = e.target.closest('[data-locked="true"]');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        showToast("该档案需要更高权限 · 权限未开放");
      }
      return;
    }
    var locked = e.target.closest('[data-locked="true"]');
    if (locked) {
      e.preventDefault();
      showToast(locked.getAttribute("data-locked") === "race"
        ? "该条目由外部共享者提供 · 权限未开放"
        : "该档案需要更高权限 · 权限未开放");
    }
  });

  /* 键盘可达：种族表里的封存条目 */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest ? e.target.closest('[data-locked="race"]') : null;
    if (!el) return;
    e.preventDefault();
    showToast("该条目由外部共享者提供 · 权限未开放");
  });

  /* ---------- 滚动揭示 ---------- */
  var revealEls = document.querySelectorAll("[data-reveal], .reveal");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add("is-in");
    });
  } else {
    var groups = new Map();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var parent = el.parentElement;
          var idx = groups.get(parent) || 0;
          groups.set(parent, idx + 1);
          el.style.setProperty("--d", Math.min(idx, 6) * 70 + "ms");
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    Array.prototype.forEach.call(revealEls, function (el) {
      io.observe(el);
    });
  }

  /* ---------- 页内锚点平滑滚动补偿顶栏 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var headH = parseInt(getComputedStyle(docEl).getPropertyValue("--head-h"), 10) || 64;
    var top = target.getBoundingClientRect().top + window.scrollY - headH - 12;
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
})();
