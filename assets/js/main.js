(function () {
  var header = document.querySelector(".header");
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("siteNav");
  var revealEls = document.querySelectorAll("[data-reveal]");
  var filterBtns = document.querySelectorAll(".filter-btn");
  var serviceCards = document.querySelectorAll(".service-card");
  var reviewTrack = document.getElementById("reviewTrack");
  var prevReview = document.getElementById("prevReview");
  var nextReview = document.getElementById("nextReview");
  var bookingForm = document.getElementById("bookingForm");
  var formStatus = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var dateInput = document.getElementById("date");
  var yearEl = document.getElementById("year");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var closeLightbox = document.getElementById("closeLightbox");
  var galleryBtns = document.querySelectorAll(".gallery-btn");
  var reviewIndex = 0;
  var reviewTimer = null;
  var reviewCount = reviewTrack ? reviewTrack.children.length : 0;
  var lastRequest = null;

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href="#inicio"], a[href="index.html#inicio"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      if (nav && menuToggle) {
        nav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "#inicio");
    });
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      serviceCards.forEach(function (card) {
        var cat = card.getAttribute("data-cat");
        var visible = filter === "all" || cat === filter;
        card.hidden = !visible;
      });
    });
  });

  function goReview(index) {
    if (!reviewCount || !reviewTrack) {
      return;
    }
    reviewIndex = (index + reviewCount) % reviewCount;
    reviewTrack.style.transform = "translateX(" + String(-reviewIndex * 100) + "%)";
  }

  function startReviews() {
    if (!reviewCount) {
      return;
    }
    clearInterval(reviewTimer);
    reviewTimer = setInterval(function () {
      goReview(reviewIndex + 1);
    }, 5200);
  }

  if (prevReview && nextReview) {
    prevReview.addEventListener("click", function () {
      goReview(reviewIndex - 1);
      startReviews();
    });
    nextReview.addEventListener("click", function () {
      goReview(reviewIndex + 1);
      startReviews();
    });
    startReviews();
  }

  if (dateInput) {
    function toLocalISO(date) {
      var y = date.getFullYear();
      var m = String(date.getMonth() + 1).padStart(2, "0");
      var d = String(date.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + d;
    }
    var today = new Date();
    var todayISO = toLocalISO(today);
    var maxDateObj = new Date(today);
    maxDateObj.setDate(maxDateObj.getDate() + 120);
    var maxDateISO = toLocalISO(maxDateObj);
    dateInput.min = todayISO;
    dateInput.max = maxDateISO;
  }

  if (bookingForm && formStatus) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      formStatus.textContent = "";
      formStatus.className = "status";

      var data = new FormData(bookingForm);
      var name = String(data.get("name") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var service = String(data.get("service") || "").trim();
      var date = String(data.get("date") || "").trim();
      var time = String(data.get("time") || "").trim();
      var notes = String(data.get("notes") || "").trim();
      var website = String(data.get("website") || "").trim();
      var consent = data.get("consent") === "on";
      var phoneDigits = phone.replace(/\D+/g, "");
      var minDate = dateInput ? dateInput.min : "";
      var maxDate = dateInput ? dateInput.max : "";

      if (name.length < 3) {
        return fail("Introduce un nombre válido.");
      }
      if (phoneDigits.length < 9) {
        return fail("Introduce un teléfono válido.");
      }
      if (!service || !date || !time) {
        return fail("Completa servicio, fecha y hora.");
      }
      if (!consent) {
        return fail("Debes aceptar el tratamiento de datos.");
      }
      if (website) {
        return fail("No se pudo procesar la solicitud.");
      }
      if (minDate && new Date(date + "T00:00:00") < new Date(minDate + "T00:00:00")) {
        return fail("La fecha no puede ser anterior a hoy.");
      }
      if (maxDate && new Date(date + "T00:00:00") > new Date(maxDate + "T00:00:00")) {
        return fail("La fecha debe estar dentro de los próximos 120 días.");
      }

      var fingerprint = [phoneDigits, service, date, time].join("|");
      if (
        lastRequest &&
        lastRequest.fingerprint === fingerprint &&
        Date.now() - lastRequest.ts < 5 * 60 * 1000
      ) {
        return fail("Ya recibimos una solicitud igual hace unos minutos.");
      }

      formStatus.textContent = "Enviando solicitud...";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      window.setTimeout(function () {
        lastRequest = { fingerprint: fingerprint, ts: Date.now() };

        formStatus.textContent = "Solicitud registrada correctamente.";
        formStatus.classList.add("ok");
        bookingForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar solicitud";
        }
      }, 900);
    });
  }

  function fail(message) {
    formStatus.textContent = message;
    formStatus.classList.add("err");
  }

  function closeLb() {
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
  }

  galleryBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      if (!img || !lightbox || !lightboxImage || !lightboxCaption) {
        return;
      }
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCaption.textContent = btn.getAttribute("data-caption") || img.alt;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  if (closeLightbox) {
    closeLightbox.addEventListener("click", closeLb);
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLb();
      }
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeLb();
    }
  });

})();
