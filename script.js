/* Mudit Mehta — portfolio behaviour. No dependencies.
   Security: no eval, no new Function, no innerHTML. Every value the visitor
   types is written with textContent or encodeURIComponent. No inline handlers
   in the HTML, so the CSP needs no 'unsafe-inline'. No secrets in this file. */
(function () {
  "use strict";

  /* Leave empty for the mailto fallback, or paste a public form endpoint
     (e.g. "https://formspree.io/f/xxxxxxx") to POST instead. */
  var CONTACT_FORM_ENDPOINT = "";
  var EMAIL = "muditmehta99999@gmail.com";

  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* theme */
  var tBtn = $("[data-theme-toggle]");
  function theme(v) {
    document.documentElement.setAttribute("data-theme", v);
    if (tBtn) tBtn.setAttribute("aria-label", v === "dark" ? "Switch to light theme" : "Switch to dark theme");
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute("content", v === "dark" ? "#080A0B" : "#EFF2F1");
  }
  var saved = null;
  try { saved = localStorage.getItem("mm-theme"); } catch (e) {}
  theme(saved === "light" ? "light" : "dark");
  if (tBtn) tBtn.addEventListener("click", function () {
    var n = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    theme(n);
    try { localStorage.setItem("mm-theme", n); } catch (e) {}
  });

  /* mobile nav */
  var nav = $("#nav"), burger = $("[data-nav-toggle]");
  function shut() {
    if (!nav) return;
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }
  if (nav && burger) {
    burger.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
      burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", shut); });
  }

  /* header state, scroll progress, back to top */
  var hdr = $("[data-header]"), bar = $("[data-progress]"), top = $("[data-to-top]"), tick = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hdr) hdr.classList.toggle("stuck", y > 10);
    if (bar) {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + "%";
    }
    if (top) top.hidden = y < innerHeight * 0.8;
  }
  addEventListener("scroll", function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { onScroll(); tick = false; });
  }, { passive: true });
  onScroll();
  if (top) top.addEventListener("click", function () {
    scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" });
  });

  /* active nav link */
  var links = $$(".nav a");
  var secs = links.map(function (a) {
    var h = a.getAttribute("href");
    return h && h.charAt(0) === "#" ? document.querySelector(h) : null;
  }).filter(Boolean);

  if ("IntersectionObserver" in window && secs.length) {
    var seen = {};
    var navObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { seen[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, top2 = 0;
      Object.keys(seen).forEach(function (k) { if (seen[k] > top2) { top2 = seen[k]; best = k; } });
      if (best) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + best); });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, .01, .25, .5, 1] });
    secs.forEach(function (s) { navObs.observe(s); });
  }

  /* scroll reveal */
  var rev = $$(".reveal");
  if (rm || !("IntersectionObserver" in window)) {
    rev.forEach(function (el) { el.classList.add("vis"); });
  } else {
    var ro = new IntersectionObserver(function (es, o) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add("vis"); }, Math.min(i * 65, 260));
        o.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: .1 });
    rev.forEach(function (el) { ro.observe(el); });
  }

  /* hero typing */
  var typed = $("[data-typed]");
  if (typed) {
    var full = typed.getAttribute("data-typed-text") || typed.textContent;
    if (rm) { typed.textContent = full; }
    else {
      typed.textContent = "";
      var i = 0;
      (function type() {
        if (i > full.length) return;
        typed.textContent = full.slice(0, i++);
        setTimeout(type, 34);
      })();
    }
  }

  /* accordions */
  $$("[data-accordion]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = document.getElementById(b.getAttribute("aria-controls"));
      if (!p) return;
      var open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", open ? "false" : "true");
      p.hidden = open;
    });
  });

  /* project modal */
  var modal = $("[data-modal]"), last = null;
  var FIELDS = { "[data-modal-title]": "title", "[data-modal-index]": "index", "[data-modal-stack]": "stack",
                 "[data-modal-role]": "role", "[data-modal-overview]": "overview", "[data-modal-availability]": "availability" };
  function shutModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("lock");
    if (last && last.focus) last.focus();
  }
  $$("[data-project]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!modal) return;
      last = document.activeElement;
      Object.keys(FIELDS).forEach(function (sel) {
        var n = $(sel, modal);
        if (n) n.textContent = b.getAttribute("data-" + FIELDS[sel]) || "";
      });
      modal.hidden = false;
      document.body.classList.add("lock");
      var x = $(".modal-x", modal);
      if (x) x.focus();
    });
  });
  if (modal) {
    $$("[data-modal-close]", modal).forEach(function (el) { el.addEventListener("click", shutModal); });
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("button,[href],input,textarea", modal).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { shutModal(); shut(); }
  });

  /* copy buttons */
  var toast = $("[data-toast]"), tt;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(function () { toast.classList.add("vis"); });
    clearTimeout(tt);
    tt = setTimeout(function () {
      toast.classList.remove("vis");
      setTimeout(function () { toast.hidden = true; }, 250);
    }, 2200);
  }
  function copy(text) {
    if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, no) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (err) { no(err); }
      finally { document.body.removeChild(ta); }
    });
  }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      copy(b.getAttribute("data-copy") || "").then(
        function () { say("Copied to clipboard"); },
        function () { say("Copy failed — select the text instead"); }
      );
    });
  });

  /* contact form */
  var form = $("[data-form]");
  if (form) {
    var st = $("[data-form-status]", form), note = $("[data-form-note]", form);
    if (note && CONTACT_FORM_ENDPOINT) note.textContent = "Messages go straight to my inbox.";

    function flag(el, msg) {
      var f = el.closest(".f"), e = $('[data-error-for="' + el.id + '"]', form);
      if (f) f.classList.toggle("bad", !!msg);
      if (e) { e.textContent = msg || ""; e.hidden = !msg; }
      el.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function clean(v) {
      return String(v).replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var E = form.elements;
      if (E.company && E.company.value) return; // honeypot

      var ok = true;
      if (!clean(E.name.value)) { flag(E.name, "Enter your name."); ok = false; } else flag(E.name, "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(E.email.value))) { flag(E.email, "Enter a valid email address."); ok = false; } else flag(E.email, "");
      if (!clean(E.subject.value)) { flag(E.subject, "Add a subject."); ok = false; } else flag(E.subject, "");
      if (clean(E.message.value).length < 10) { flag(E.message, "Add at least 10 characters."); ok = false; } else flag(E.message, "");

      if (!ok) {
        if (st) st.textContent = "Check the highlighted fields.";
        var first = $(".f.bad input, .f.bad textarea", form);
        if (first) first.focus();
        return;
      }

      var d = { name: clean(E.name.value), email: clean(E.email.value),
                subject: clean(E.subject.value), message: clean(E.message.value) };

      if (CONTACT_FORM_ENDPOINT) {
        if (st) st.textContent = "Sending…";
        fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(d)
        }).then(function (r) {
          if (!r.ok) throw new Error("failed");
          form.reset();
          if (st) st.textContent = "Message sent. I'll reply from " + EMAIL + ".";
        }).catch(function () {
          if (st) st.textContent = "That didn't send. Email me directly at " + EMAIL + ".";
        });
        return;
      }

      location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(d.subject) +
        "&body=" + encodeURIComponent("Name: " + d.name + "\nEmail: " + d.email + "\n\n" + d.message);
      if (st) st.textContent = "Your email app should open with the message ready to send.";
    });
  }

  /* pointer glow, desktop only */
  var glow = $("[data-cursor]");
  if (glow && matchMedia("(hover: hover) and (pointer: fine)").matches && !rm) {
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; glow.classList.add("on"); }
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      glow.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* year */
  var y = $("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());

  /* smooth scroll + focus handoff for keyboard users */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "start" });
      t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });
})();
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
