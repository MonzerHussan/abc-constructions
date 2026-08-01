/* ABC Design Review — preview interactions (language toggle, mobile frame, tabs, sidebar) */
(function () {
  function setLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-ph-ar][data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", lang === "ar" ? el.getAttribute("data-ph-ar") : el.getAttribute("data-ph-en"));
    });
    document.querySelectorAll("[data-tt-ar][data-tt-en]").forEach(function (el) {
      el.setAttribute("title", lang === "ar" ? el.getAttribute("data-tt-ar") : el.getAttribute("data-tt-en"));
    });
  }

  function toggleLang() {
    setLang(document.documentElement.lang === "ar" ? "en" : "ar");
  }

  function toggleMobile() {
    document.body.classList.toggle("mobile");
    document.body.classList.remove("sidebar-open");
  }

  function toggleSidebar() {
    document.body.classList.toggle("sidebar-open");
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-pane]");
    if (trigger) {
      e.preventDefault();
      var id = trigger.getAttribute("data-pane");
      document.querySelectorAll("[data-pane]").forEach(function (n) {
        n.classList.toggle("active", n === trigger);
      });
      document.querySelectorAll(".pane").forEach(function (p) {
        p.classList.toggle("active", p.id === id);
      });
      document.body.classList.remove("sidebar-open");
      if (window.scrollTo) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  window.previewLang = function () { toggleLang(); };
  window.previewMobile = function () { toggleMobile(); };
  window.previewSidebar = function () { toggleSidebar(); };

  setLang(document.documentElement.lang || "ar");
})();
