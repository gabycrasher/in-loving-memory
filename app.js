const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealItems = [...document.querySelectorAll(".reveal")];

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -48px" },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });
}

const pixelReveal = document.querySelector("#pixel-reveal");

if (!reduceMotion.matches) {
  const pixels = Array.from({ length: 96 }, (_, index) => {
    const pixel = document.createElement("i");
    const row = Math.floor(index / 12);
    const column = index % 12;
    const distanceFromFocus = Math.hypot(column - 7, row - 3.5);
    pixel.style.setProperty("--delay", `${120 + distanceFromFocus * 55 + Math.random() * 160}ms`);
    return pixel;
  });
  pixelReveal.append(...pixels);
  window.setTimeout(() => pixelReveal.remove(), 1800);
} else {
  pixelReveal.remove();
}

const storyOptions = [...document.querySelectorAll(".story-option")];
const storyCopy = document.querySelector("[data-story-copy]");
const storyMessages = {
  celebration: "Today we celebrate the joy he gave, the wisdom he shared, and the love that lives on in every person he touched.",
  reflection: "Though deeply missed, he remains close in every lesson remembered, every story retold, and every smile that carries his warmth.",
};

storyOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const mode = option.dataset.mode;
    document.body.classList.toggle("celebration-mode", mode === "celebration");
    document.body.classList.toggle("reflection-mode", mode === "reflection");
    storyCopy.textContent = storyMessages[mode];

    storyOptions.forEach((item) => {
      const isActive = item === option;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  });
});

const countElement = document.querySelector("[data-count]");
let countStarted = false;

function animateCount() {
  if (countStarted) return;
  countStarted = true;
  const target = Number(countElement.dataset.count);

  if (reduceMotion.matches) {
    countElement.textContent = String(target);
    return;
  }

  const startTime = performance.now();
  const duration = 1200;

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    countElement.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

if ("IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    animateCount();
    observer.disconnect();
  });
  countObserver.observe(countElement);
} else {
  animateCount();
}

const particleCanvas = document.querySelector("#memory-particles");
const particleContext = particleCanvas.getContext("2d");
let memoryParticles = [];
let particleFrame = null;

function sizeParticleCanvas() {
  const bounds = particleCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  particleCanvas.width = Math.round(bounds.width * ratio);
  particleCanvas.height = Math.round(bounds.height * ratio);
  particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  memoryParticles = Array.from({ length: Math.min(58, Math.round(bounds.width / 22)) }, () => ({
    x: Math.random() * bounds.width,
    y: Math.random() * bounds.height,
    radius: 0.8 + Math.random() * 1.8,
    speed: 0.12 + Math.random() * 0.3,
    drift: -0.12 + Math.random() * 0.24,
    alpha: 0.18 + Math.random() * 0.48,
  }));
}

function drawMemoryParticles() {
  const bounds = particleCanvas.getBoundingClientRect();
  particleContext.clearRect(0, 0, bounds.width, bounds.height);

  memoryParticles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    if (particle.y < -8) particle.y = bounds.height + 8;
    if (particle.x < -8) particle.x = bounds.width + 8;
    if (particle.x > bounds.width + 8) particle.x = -8;

    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    particleContext.fillStyle = `rgba(239, 215, 150, ${particle.alpha})`;
    particleContext.fill();
  });

  particleFrame = requestAnimationFrame(drawMemoryParticles);
}

if (!reduceMotion.matches) {
  sizeParticleCanvas();
  drawMemoryParticles();
  window.addEventListener("resize", sizeParticleCanvas, { passive: true });
} else {
  particleCanvas.hidden = true;
}

const dotHeart = document.querySelector("#dot-heart");

for (let row = 0; row < 11; row += 1) {
  for (let column = 0; column < 17; column += 1) {
    const dot = document.createElement("i");
    const x = (column - 8) / 5.7;
    const y = (5 - row) / 4.1;
    const heartEquation = (x * x + y * y - 1) ** 3 - x * x * y ** 3;
    if (heartEquation <= 0) {
      dot.className = "is-heart";
      dot.style.setProperty("--delay", `${(row + column) * 34}ms`);
    }
    dotHeart.append(dot);
  }
}

const filmStage = document.querySelector("#film-stage");
const filmSlides = [...document.querySelectorAll("[data-film-slide]")];
const filmJumpButtons = [...document.querySelectorAll("[data-film-jump]")];
const filmPreviousButton = document.querySelector("#film-prev");
const filmNextButton = document.querySelector("#film-next");
const filmPlayButton = document.querySelector("#film-play");
const filmStatus = document.querySelector("#film-status");
let activeFilmIndex = 0;
let filmTimer = null;
let filmTouchStartX = null;
let filmTouchStartY = null;

function setFilmSlide(index) {
  activeFilmIndex = (index + filmSlides.length) % filmSlides.length;

  filmSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeFilmIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  filmJumpButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === activeFilmIndex;
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-complete", buttonIndex < activeFilmIndex);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const chapter = filmSlides[activeFilmIndex].querySelector("figcaption span").textContent.split("/")[1].trim();
  filmStatus.textContent = `Memory ${activeFilmIndex + 1} of ${filmSlides.length}: ${chapter}`;

  filmStage.setAttribute("aria-label", `${filmStatus.textContent}. Use the previous and next buttons or arrow keys to change scenes.`);
}

function scheduleFilmAdvance() {
  window.clearTimeout(filmTimer);
  if (filmPlayButton.getAttribute("aria-pressed") !== "true") return;
  filmTimer = window.setTimeout(() => {
    setFilmSlide(activeFilmIndex + 1);
    scheduleFilmAdvance();
  }, 4800);
}

function toggleMemoryFilm() {
  const willPlay = filmPlayButton.getAttribute("aria-pressed") !== "true";
  filmPlayButton.setAttribute("aria-pressed", String(willPlay));
  filmPlayButton.setAttribute("aria-label", willPlay ? "Pause memory film" : "Play memory film");
  filmPlayButton.querySelector("span").textContent = willPlay ? "Pause memories" : "Play memories";
  if (willPlay) scheduleFilmAdvance();
  else window.clearTimeout(filmTimer);
}

filmPreviousButton.addEventListener("click", () => {
  setFilmSlide(activeFilmIndex - 1);
  scheduleFilmAdvance();
});

filmNextButton.addEventListener("click", () => {
  setFilmSlide(activeFilmIndex + 1);
  scheduleFilmAdvance();
});

filmPlayButton.addEventListener("click", toggleMemoryFilm);

filmJumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilmSlide(Number(button.dataset.filmJump));
    scheduleFilmAdvance();
  });
});

filmStage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setFilmSlide(activeFilmIndex - 1);
    scheduleFilmAdvance();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setFilmSlide(activeFilmIndex + 1);
    scheduleFilmAdvance();
  }
});

filmStage.addEventListener("dragstart", (event) => {
  if (event.target.closest("img")) event.preventDefault();
});

filmStage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  filmTouchStartX = event.clientX;
  filmTouchStartY = event.clientY;
});

filmStage.addEventListener("pointerup", (event) => {
  if (filmTouchStartX === null || filmTouchStartY === null) return;
  const horizontalDistance = event.clientX - filmTouchStartX;
  const verticalDistance = event.clientY - filmTouchStartY;
  filmTouchStartX = null;
  filmTouchStartY = null;

  if (Math.abs(horizontalDistance) < 54 || Math.abs(horizontalDistance) < Math.abs(verticalDistance) * 1.2) return;
  setFilmSlide(activeFilmIndex + (horizontalDistance < 0 ? 1 : -1));
  scheduleFilmAdvance();
});

filmStage.addEventListener("pointercancel", () => {
  filmTouchStartX = null;
  filmTouchStartY = null;
});

const galleryItems = [...document.querySelectorAll(".gallery-item")];
const galleryFilterButtons = [...document.querySelectorAll("[data-filter]")];
const galleryResult = document.querySelector("#gallery-result");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("figure img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const lightboxCount = lightbox.querySelector(".lightbox-count");
const closeButton = lightbox.querySelector(".lightbox-close");
const previousButton = lightbox.querySelector(".lightbox-prev");
const nextButton = lightbox.querySelector(".lightbox-next");
let activeImageIndex = 0;
let lightboxReturnFocus = null;
let touchStartX = null;

function visibleGalleryItems() {
  return galleryItems.filter((item) => !item.hidden);
}

function animateFilteredItems(items) {
  items.forEach((item) => item.classList.remove("is-filtering-in"));
  if (reduceMotion.matches) return;

  requestAnimationFrame(() => {
    items.forEach((item, index) => {
      item.style.setProperty("--filter-delay", `${Math.min(index, 8) * 38}ms`);
      item.classList.add("is-filtering-in");
      window.setTimeout(() => item.classList.remove("is-filtering-in"), 900);
    });
  });
}

function filterGallery(filter) {
  if (lightbox.getAttribute("aria-hidden") === "false") closeLightbox();

  galleryItems.forEach((item) => {
    const categories = item.dataset.category.split(" ");
    item.hidden = filter !== "all" && !categories.includes(filter);
  });

  galleryFilterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const visibleCount = visibleGalleryItems().length;
  const filterLabel = galleryFilterButtons.find((button) => button.dataset.filter === filter).textContent.trim();
  galleryResult.textContent = filter === "all"
    ? `Showing all ${visibleCount} moments`
    : `Showing ${visibleCount} ${filterLabel.toLowerCase()} moments`;
  animateFilteredItems(visibleGalleryItems());
}

galleryFilterButtons.forEach((button) => {
  button.addEventListener("click", () => filterGallery(button.dataset.filter));
});

function showLightboxImage(index) {
  const visibleItems = visibleGalleryItems();
  activeImageIndex = (index + visibleItems.length) % visibleItems.length;
  const item = visibleItems[activeImageIndex];
  const source = item.querySelector("img");
  lightboxImage.src = source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = item.dataset.caption;
  lightboxCount.textContent = `${String(activeImageIndex + 1).padStart(2, "0")} / ${String(visibleItems.length).padStart(2, "0")}`;
}

function openLightbox(item) {
  const index = visibleGalleryItems().indexOf(item);
  lightboxReturnFocus = document.activeElement;
  showLightboxImage(index);
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  closeButton.focus();
}

function closeLightbox() {
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
  lightboxReturnFocus?.focus();
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => openLightbox(item));
});

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => showLightboxImage(activeImageIndex - 1));
nextButton.addEventListener("click", () => showLightboxImage(activeImageIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener("pointerdown", (event) => {
  touchStartX = event.clientX;
});

lightbox.addEventListener("pointerup", (event) => {
  if (touchStartX === null) return;
  const distance = event.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 54) return;
  showLightboxImage(activeImageIndex + (distance < 0 ? 1 : -1));
});

document.addEventListener("keydown", (event) => {
  if (lightbox.getAttribute("aria-hidden") === "true") return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showLightboxImage(activeImageIndex - 1);
  if (event.key === "ArrowRight") showLightboxImage(activeImageIndex + 1);
});

const candleButton = document.querySelector("#light-candle");
const candleMessage = document.querySelector("#candle-message");

function releaseCandleLight() {
  if (reduceMotion.matches) return;
  const bounds = candleButton.getBoundingClientRect();
  const colors = ["#efd796", "#d6a84b", "#b85543", "#fcfaf4"];

  for (let index = 0; index < 42; index += 1) {
    const spark = document.createElement("i");
    spark.className = "candle-spark";
    spark.style.setProperty("--x", `${bounds.left + bounds.width / 2 + (-30 + Math.random() * 60)}px`);
    spark.style.setProperty("--y", `${bounds.top + bounds.height / 2}px`);
    spark.style.setProperty("--size", `${3 + Math.random() * 7}px`);
    spark.style.setProperty("--color", colors[index % colors.length]);
    spark.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    spark.style.setProperty("--duration", `${1.2 + Math.random() * 1.2}s`);
    document.body.append(spark);
    window.setTimeout(() => spark.remove(), 2600);
  }
}

function lightCandle() {
  candleButton.classList.add("is-lit");
  candleButton.querySelector("span:last-child").textContent = "The candle is lit";
  candleMessage.textContent = "His light remains in every heart, every lesson, and every act of love he inspired.";
  releaseCandleLight();
}

candleButton.addEventListener("click", lightCandle);

const pageProgressBar = document.querySelector("#page-progress span");
const chapterLinks = [...document.querySelectorAll(".chapter-rail a")];
const chapterTargets = chapterLinks.map((link) => document.querySelector(link.getAttribute("href")));
const navigationLinks = [...document.querySelectorAll(".chapter-rail a, .nav-links a, .mobile-dock a")];
let scrollFrameRequested = false;

function updateNavigationState(activeTarget) {
  const activeHash = `#${activeTarget.id}`;
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === activeHash;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function updateScrollProgress() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(Math.max(window.scrollY / scrollRange, 0), 1) : 0;
  pageProgressBar.style.transform = `scaleX(${progress})`;

  const threshold = window.innerHeight * 0.46;
  let activeChapterIndex = 0;
  chapterTargets.forEach((target, index) => {
    if (target.getBoundingClientRect().top <= threshold) activeChapterIndex = index;
  });

  updateNavigationState(chapterTargets[activeChapterIndex]);
  document.body.classList.toggle("nav-scrolled", window.scrollY > 24);

  scrollFrameRequested = false;
}

function requestScrollProgressUpdate() {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  requestAnimationFrame(updateScrollProgress);
}

window.addEventListener("scroll", requestScrollProgressUpdate, { passive: true });
window.addEventListener("resize", requestScrollProgressUpdate, { passive: true });
updateScrollProgress();

const printTributeButton = document.querySelector("#print-tribute");
printTributeButton.addEventListener("click", () => window.print());

document.addEventListener("visibilitychange", () => {
  if (!document.hidden || filmPlayButton.getAttribute("aria-pressed") !== "true") return;
  filmPlayButton.setAttribute("aria-pressed", "false");
  filmPlayButton.setAttribute("aria-label", "Play memory film");
  filmPlayButton.querySelector("span").textContent = "Play memories";
  window.clearTimeout(filmTimer);
});

window.addEventListener("pagehide", () => {
  if (particleFrame) cancelAnimationFrame(particleFrame);
  window.clearTimeout(filmTimer);
});
