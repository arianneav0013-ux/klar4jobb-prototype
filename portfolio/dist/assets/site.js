// Progressive enhancement only: every page works without this file.
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  // Remember an explicit language choice so the root redirect respects it.
  // The switch slides first, then navigates.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".lang-switch a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var lang = link.getAttribute("hreflang");
      try { localStorage.setItem("lang", lang === "nb" ? "no" : "en"); } catch (err) {}
      if (link.getAttribute("aria-current") === "true" || reduce || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      link.parentElement.setAttribute("data-active", lang === "nb" ? "no" : "en");
      setTimeout(function () { window.location.href = link.href; }, 260);
    });
  });

  // Scroll reveals
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
