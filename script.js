"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;

body.classList.add("is-loading");

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initLoader() {
  const loader = qs("[data-loader]");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
  };

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, prefersReducedMotion ? 80 : 620);
  });

  window.setTimeout(hideLoader, 2400);
}

function initTheme() {
  const toggle = qs("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("portfolio-theme");
  const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = storedTheme || (systemLight ? "light" : "dark");

  document.documentElement.dataset.theme = initialTheme;

  toggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
  });
}

function initNavigation() {
  const nav = qs("[data-nav]");
  const toggle = qs("[data-nav-toggle]");
  const menu = qs("[data-nav-menu]");
  const links = qsa("[data-section-link]");

  const setNavState = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu?.classList.toggle("is-open", !isOpen);
    body.classList.toggle("nav-open", !isOpen);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("is-open");
      body.classList.remove("nav-open");
    });
  });
}

function initScrollProgress() {
  const progress = qs("[data-scroll-progress]");
  if (!progress) return;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const current = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
    progress.style.width = `${Math.min(current, 100)}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initScrollSpy() {
  const sections = qsa("[data-section]");
  const links = qsa("[data-section-link]");
  const byId = new Map(links.map((link) => [link.getAttribute("href")?.slice(1), link]));

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      links.forEach((link) => link.classList.remove("is-active"));
      byId.get(visible.target.id)?.classList.add("is-active");
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: [0.08, 0.2, 0.45, 0.7],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initRevealAnimations() {
  const elements = qsa(".reveal");

  if (prefersReducedMotion) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(element);
  });
}

function initCounters() {
  const counters = qsa("[data-counter]");
  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

  const animateCounter = (element) => {
    const target = Number(element.dataset.target || 0);
    const decimals = Number(element.dataset.decimals || 0);
    const duration = prefersReducedMotion ? 1 : 1300;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = target * eased;
      element.textContent = decimals ? formatter.format(Number(value.toFixed(decimals))) : Math.round(value).toString();

      if (elapsed < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initTyping() {
  const target = qs("[data-typing]");
  if (!target) return;

  const phrases = [
    "scalable Flutter applications.",
    "real-time mobile experiences.",
    "clean cross-platform products.",
  ];

  if (prefersReducedMotion) {
    target.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const phrase = phrases[phraseIndex];
    target.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(type, 42);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      window.setTimeout(type, 1300);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(type, 24);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    window.setTimeout(type, 260);
  };

  type();
}

function initTabs() {
  const buttons = qsa("[data-tab]");
  const panels = qsa("[data-panel]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
    });
  });
}

function initProjectFiltering() {
  const filters = qsa("[data-filter]");
  const projects = qsa(".project-card[data-category]");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      filters.forEach((item) => item.classList.toggle("is-active", item === filter));

      projects.forEach((project) => {
        const show = category === "all" || project.dataset.category === category;
        project.classList.toggle("is-hidden", !show);
      });
    });
  });
}

function initGallery() {
  const gallery = qs("[data-gallery]");
  const prev = qs("[data-gallery-prev]");
  const next = qs("[data-gallery-next]");

  const swap = () => gallery?.classList.toggle("is-swapped");
  prev?.addEventListener("click", swap);
  next?.addEventListener("click", swap);
}

function initCertificates() {
  const dialog = qs("[data-certificate-dialog]");
  const title = qs("[data-dialog-title]");
  const close = qs("[data-dialog-close]");

  qsa("[data-certificate]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!dialog || !title) return;
      title.textContent = button.dataset.certificate || "Certificate";
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    });
  });

  close?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function initCursor() {
  const cursor = qs("[data-cursor]");
  const dot = qs("[data-cursor-dot]");
  if (!cursor || !dot || window.matchMedia("(pointer: coarse)").matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    },
    { passive: true }
  );

  qsa("a, button, input, textarea, .project-card, .skill-card").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
  });

  const render = () => {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };

  render();
}

function initMagneticButtons() {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  qsa(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.14}px, ${y * 0.18}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function initTilt() {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  qsa("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1000px) rotateX(${py * -5}deg) rotateY(${px * 6}deg) translateY(-4px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function initParticles() {
  const canvas = qs("[data-particles]");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = Math.min(72, Math.floor(window.innerWidth / 18));
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const seed = () => {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        speed: Math.random() * 0.28 + 0.08,
        drift: Math.random() * 0.4 - 0.2,
        alpha: Math.random() * 0.45 + 0.14,
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      const dx = (pointerX - width / 2) * 0.0008;
      const dy = (pointerY - height / 2) * 0.0008;
      particle.x += particle.drift + dx;
      particle.y -= particle.speed - dy;

      if (particle.y < -10) particle.y = height + 10;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
      context.fill();
    });

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", () => {
    resize();
    seed();
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    },
    { passive: true }
  );

  resize();
  seed();
  draw();
}

initLoader();
initTheme();
initNavigation();
initScrollProgress();
initScrollSpy();
initRevealAnimations();
initCounters();
initTyping();
initTabs();
initProjectFiltering();
initGallery();
initCertificates();
initCursor();
initMagneticButtons();
initTilt();
initParticles();
