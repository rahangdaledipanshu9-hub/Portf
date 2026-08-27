/* =========================================================
   MUDIT MEHTA — CYBERSECURITY PORTFOLIO
   script.js — vanilla JavaScript, no dependencies

   Security notes for this file:
   - No eval(), no new Function(), no innerHTML with user input.
     All user-supplied values are written with textContent or
     passed through encodeURIComponent.
   - No inline event handlers anywhere in index.html; every
     listener is attached here.
   - No secrets. If you add a form endpoint below, use a public
     endpoint (Formspree / FormSubmit style). Never put an API
     key or private token in this file — it ships to the browser.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     CONFIG
     Leave empty to use the mailto fallback.
     Set to a public form endpoint (e.g. "https://formspree.io/f/xxxxxxx")
     to POST the form instead.
     --------------------------------------------------------- */
  var CONTACT_FORM_ENDPOINT = "";

  var EMAIL = "muditmehta99999@gmail.com";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* =========================================================
     1. THEME TOGGLE (persisted in localStorage, dark by default)
     ========================================================= */
  var themeBtn = $("[data-theme-toggle]");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#06090C" : "#F2F5F7");
  }

  var storedTheme = null;
  try { storedTheme = localStorage.getItem("mm-theme"); } catch (e) { /* storage blocked */ }
  applyTheme(storedTheme === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("mm-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* =========================================================
     2. MOBILE NAVIGATION
     ========================================================= */
  var navToggle = $("[data-nav-toggle]");
  var nav = $("#primary-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  /* =========================================================
     3. STICKY HEADER STATE + 4. SCROLL PROGRESS
     ========================================================= */
  var header = $("[data-header]");
  var progress = $("[data-progress]");
  var toTop = $("[data-to-top]");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle("is-stuck", y > 12);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct.toFixed(2) + "%";
    }

    if (toTop) {
      var show = y > window.innerHeight * 0.8;
      toTop.hidden = !show;
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* =========================================================
     5. ACTIVE NAVIGATION STATE
     ========================================================= */
  var navLinks = $$(".nav-list a");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      var bestId = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });

      if (bestId) {
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + bestId);
        });
      }
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* =========================================================
     6. SCROLL REVEAL
     ========================================================= */
  var revealEls = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var delay = Math.min(i * 70, 280);
        window.setTimeout(function () {
          entry.target.classList.add("is-visible");
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* =========================================================
     7. HERO TYPING EFFECT
     ========================================================= */
  var typed = $("[data-typed]");
  if (typed) {
    var fullText = typed.getAttribute("data-typed-text") || typed.textContent;
    if (reduceMotion) {
      typed.textContent = fullText;
    } else {
      typed.textContent = "";
      var i = 0;
      var type = function () {
        if (i <= fullText.length) {
          typed.textContent = fullText.slice(0, i);
          i += 1;
          window.setTimeout(type, 42);
        }
      };
      window.setTimeout(type, 450);
    }
  }

  /* =========================================================
     8. EXPERIENCE ACCORDIONS
     ========================================================= */
  $$("[data-accordion]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panelId = btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  });

  /* =========================================================
     9. PROJECT MODAL (keyboard accessible, Escape to close)
     ========================================================= */
  var modal = $("[data-modal]");
  var lastFocused = null;

  function fillModal(btn) {
    var map = {
      "[data-modal-title]": "title",
      "[data-modal-index]": "index",
      "[data-modal-stack]": "stack",
      "[data-modal-role]": "role",
      "[data-modal-overview]": "overview",
      "[data-modal-availability]": "availability"
    };
    Object.keys(map).forEach(function (sel) {
      var node = $(sel, modal);
      if (node) node.textContent = btn.getAttribute("data-" + map[sel]) || "";
    });
  }

  function openModal(btn) {
    if (!modal) return;
    lastFocused = document.activeElement;
    fillModal(btn);
    modal.hidden = false;
    document.body.classList.add("is-locked");
    var closeBtn = $(".modal-close", modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  $$("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn); });
  });

  if (modal) {
    $$("[data-modal-close]", modal).forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    // Focus trap
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = $$('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      closeNav();
    }
  });

  /* =========================================================
     10. COPY BUTTONS
     ========================================================= */
  var toast = $("[data-toast]");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.requestAnimationFrame(function () { toast.classList.add("is-visible"); });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () { toast.hidden = true; }, 250);
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (e.g. opening the file directly)
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy") || "";
      copyText(value).then(
        function () { showToast("Copied to clipboard"); },
        function () { showToast("Copy failed — select the text instead"); }
      );
    });
  });

  /* =========================================================
     11. CONTACT FORM
     ========================================================= */
  var form = $("[data-form]");

  if (form) {
    var statusEl = $("[data-form-status]", form);
    var noteEl = $("[data-form-note]", form);

    if (noteEl && CONTACT_FORM_ENDPOINT) {
      noteEl.textContent = "Messages are sent straight to my inbox.";
    }

    var setError = function (input, message) {
      var field = input.closest(".field");
      var errorEl = $('[data-error-for="' + input.id + '"]', form);
      if (field) field.classList.toggle("has-error", Boolean(message));
      if (errorEl) {
        errorEl.textContent = message || "";
        errorEl.hidden = !message;
      }
      input.setAttribute("aria-invalid", message ? "true" : "false");
    };

    // Strips angle brackets and control characters before the value is
    // used anywhere. Defence in depth: values are only ever written with
    // textContent or encodeURIComponent.
    var clean = function (value) {
      return String(value).replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();
    };

    var isEmail = function (value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var subject = form.elements.subject;
      var message = form.elements.message;
      var honeypot = form.elements.company;

      // Silently ignore bot submissions
      if (honeypot && honeypot.value) return;

      var ok = true;

      if (!clean(name.value)) { setError(name, "Enter your name."); ok = false; } else setError(name, "");
      if (!isEmail(clean(email.value))) { setError(email, "Enter a valid email address."); ok = false; } else setError(email, "");
      if (!clean(subject.value)) { setError(subject, "Add a subject."); ok = false; } else setError(subject, "");
      if (clean(message.value).length < 10) { setError(message, "Add at least 10 characters."); ok = false; } else setError(message, "");

      if (!ok) {
        if (statusEl) statusEl.textContent = "Check the highlighted fields.";
        var firstError = $(".field.has-error input, .field.has-error textarea", form);
        if (firstError) firstError.focus();
        return;
      }

      var payload = {
        name: clean(name.value),
        email: clean(email.value),
        subject: clean(subject.value),
        message: clean(message.value)
      };

      if (CONTACT_FORM_ENDPOINT) {
        if (statusEl) statusEl.textContent = "Sending…";
        fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            form.reset();
            if (statusEl) statusEl.textContent = "Message sent. I'll reply from " + EMAIL + ".";
          })
          .catch(function () {
            if (statusEl) statusEl.textContent = "That didn't send. Email me directly at " + EMAIL + ".";
          });
        return;
      }

      // No endpoint configured — hand off to the visitor's email client.
      var body =
        "Name: " + payload.name + "\n" +
        "Email: " + payload.email + "\n\n" +
        payload.message;

      var mailto =
        "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(payload.subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;
      if (statusEl) statusEl.textContent = "Your email app should be open with the message ready to send.";
    });
  }

  /* =========================================================
     12. POINTER GLOW (desktop only, skipped for reduced motion)
     ========================================================= */
  var glow = $("[data-cursor]");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (glow && finePointer && !reduceMotion) {
    var gx = 0, gy = 0, cx = 0, cy = 0, glowOn = false;

    window.addEventListener("mousemove", function (e) {
      gx = e.clientX;
      gy = e.clientY;
      if (!glowOn) { glowOn = true; glow.classList.add("is-on"); }
    }, { passive: true });

    var loop = function () {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      window.requestAnimationFrame(loop);
    };
    loop();
  }

  /* =========================================================
     13. CURRENT YEAR
     ========================================================= */
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* =========================================================
     14. SMOOTH SCROLL FALLBACK
     CSS handles this; this covers browsers without
     scroll-behavior and keeps focus in the right place for
     keyboard and screen reader users.
     ========================================================= */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

      // Move focus without stealing the visible outline from mouse users
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });

      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

})();
