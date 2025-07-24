function getCookieAccordingToSection() {
    return localStorage.getItem("hs_theme");
  }
  
  function toggleThemeClass(theme, el) {
    if (theme === "dark") el.classList.add("dark");
    else el.classList.remove("dark");
  }
  
  function toggleThemeStyle(theme, target, el, btnIcons) {
    if (theme === "dark") {
      target.classList.add("dark");
      if (btnIcons[0]) btnIcons[0].classList.remove("hidden");
      if (btnIcons[1]) btnIcons[1].classList.add("hidden");
      el.classList.add("opacity-50", "pointer-events-none");
    } else {
      target.classList.remove("dark");
      if (btnIcons[0]) btnIcons[0].classList.add("hidden");
      if (btnIcons[1]) btnIcons[1].classList.remove("hidden");
      el.classList.remove("opacity-50", "pointer-events-none");
    }
  }
  
  function setTheme(evt) {
    const themeToggles = document.querySelectorAll(
      "[data-hs-component-dark-mode]"
    );
  
    themeToggles.forEach((el) => {
      const attr = el.getAttribute("data-hs-component-dark-mode");
      const target = attr
        ? document.querySelector(el.getAttribute("data-hs-component-dark-mode"))
        : null;
  
      if (target) {
        const btnIcons = el.querySelectorAll("[data-svg]");
  
        toggleThemeStyle(evt.detail, target, el, btnIcons);
  
        if (target.querySelector("iframe")) {
          toggleThemeClass(
            evt.detail,
            target.querySelector("iframe").contentWindow.document.documentElement
          );
        }
      } else if (el.tagName.toLowerCase() === "iframe") {
        toggleThemeClass(evt.detail, el.contentWindow.document.documentElement);
      } else {
        return false;
      }
    });
  }
  
  window.addEventListener("load", () => {
    setTheme({ detail: getCookieAccordingToSection() });
  });
  
  document.addEventListener("click", (evt) => {
    const toggle = evt.target.closest("[data-hs-component-dark-mode]");
  
    if (!toggle) return;
  
    const target = document.querySelector(
      toggle.getAttribute("data-hs-component-dark-mode")
    );
  
    if (!target || getCookieAccordingToSection() === "dark") return;
  
    const btnIcons = toggle.querySelectorAll("[data-svg]");
    btnIcons.forEach((icon) => icon.classList.toggle("hidden"));
  
    target.classList.toggle("dark");
  
    if (target.querySelector("iframe")) {
      const html =
        target.querySelector("iframe").contentWindow.document.documentElement;
      html.classList.toggle("dark");
    }
  
    target.dispatchEvent(
      new CustomEvent("on-hs-appearance-change", {
        detail: target.classList.contains("dark") ? "dark" : "light",
      })
    );
  });
  
  window.addEventListener("on-hs-appearance-change", (evt) => setTheme(evt));
  