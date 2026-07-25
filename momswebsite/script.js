/* ==========================================================
   Ever Clean LLC, Northern Virginia house cleaning service — adaptive site behavior
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

  /* ---------- Quote form → Google Sheets ---------- */
  // Submissions are sent to the Google Apps Script Web App URL in the
  // form's action attribute (set in index.html). The script appends a
  // row to the Google Sheet: Timestamp | Name | Contact | ZIP | Referral.
  const form = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate required fields (form has novalidate)
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

    // Prevent double-submits while sending
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    fetch(form.action, {
      method: "POST",
      mode: "no-cors", // Apps Script doesn't send CORS headers; opaque response is fine
      body: new FormData(form),
    })
      .then(() => {
        // Success: lock the form and show the confirmation message
        form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
        submitBtn.textContent = "Request Sent ✓";
        success.hidden = false;
        success.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "nearest",
        });
      })
      .catch(() => {
        // Network failed: let them try again, point to the email fallback
        submitBtn.disabled = false;
        submitBtn.textContent = "Request Your Quote";
        alert(
          "Something went wrong sending your request. Please try again, or email us at ever.clean.nova@gmail.com"
        );
      });
  });

  form.querySelectorAll("input").forEach((input) =>
    input.addEventListener("input", () => input.classList.remove("invalid"))
  );

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
