/* ==========================================================
   [Company Name] — adaptive site behavior
   Sticky nav · mobile drawer · scroll reveal · form · resize
   ========================================================== */

(function () {
  "use strict";

  /* ---------- Sticky nav ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu drawer ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  function setMenu(open) {
    links.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () =>
    setMenu(!links.classList.contains("open"))
  );
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );

  // Close on Escape (keyboard users)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) setMenu(false);
  });

  // ADAPTIVE: if the viewport crosses back to desktop width (e.g. tablet
  // rotation), reset the drawer so the desktop nav isn't stuck hidden
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  const onLayoutChange = () => { if (desktopQuery.matches) setMenu(false); };
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", onLayoutChange);
  } else {
    desktopQuery.addListener(onLayoutChange); // older Safari
  }

  /* ---------- Scroll reveal — adaptive to motion preference ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Quote form ---------- */
  // NOTE: Validates and shows success locally. To RECEIVE submissions,
  // connect a backend (Formspree, Netlify Forms, or your own endpoint)
  // in the marked block below. Do not launch without this — a premium
  // site whose form goes nowhere breaks the brand before the first clean.
  const form = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstInvalid = null;
    form.querySelectorAll("input[required]").forEach((input) => {
      const empty = input.value.trim() === "";
      input.classList.toggle("invalid", empty);
      if (empty && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus(); // helps mobile users find the missed field
      return;
    }

    /* --- Replace this block with a real submission, e.g.:
       fetch("https://formspree.io/f/yourFormId", {
         method: "POST",
         body: new FormData(form),
         headers: { Accept: "application/json" },
       }).then(() => { show success });
    --- */
    form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
    success.hidden = false;
    success.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  });

  form.querySelectorAll("input").forEach((input) =>
    input.addEventListener("input", () => input.classList.remove("invalid"))
  );

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();