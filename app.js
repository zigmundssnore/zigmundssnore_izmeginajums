import { createLightbox } from "./lightbox.js";

// Uzstāda aktuālo gadu footerī
function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

// Navigācijas menu toggle
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });
}

// Gallery izveide automātiski no photo1 → photo100
function buildGallery() {
  const grid = document.getElementById('gallery');
  if (!grid) return;
  const frag = document.createDocumentFragment();

  for (let i = 1; i <= 100; i++) {
    const a = document.createElement('a');
    a.href = `photo${i}.jpg`;
    a.className = 'gallery-item';
    a.dataset.index = String(i - 1);
    a.dataset.caption = `Art piece ${i}`;

    const picture = document.createElement('picture');

    const sAvif = document.createElement('source');
    sAvif.type = 'image/avif';
    sAvif.srcset = `photo${i}.avif`;

    const sWebp = document.createElement('source');
    sWebp.type = 'image/webp';
    sWebp.srcset = `photo${i}.webp`;

    const img = document.createElement('img');
    img.src = `photo${i}.jpg`;
    img.alt = `Art piece ${i}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.srcset = `photo${i}-480.jpg 480w, photo${i}-800.jpg 800w, photo${i}-1200.jpg 1200w`;
    img.sizes = '(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 25vw';

    picture.append(sAvif, sWebp, img);
    a.appendChild(picture);
    frag.appendChild(a);
  }

  grid.appendChild(frag);
}

// Fade-in sections ar IntersectionObserver
function revealSections() {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach(s => io.observe(s));
}

// Particles uz melna fona
function createParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return { pause() {}, play() {}, isPaused: true };

  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  let rafId = null;
  let paused = false;

  const colors = ['#FF6A00','#FFA94D'];

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.8+0.4,
    o: Math.random()*0.6+0.2,
    vx: (Math.random()-0.5)*0.15,
    vy: - (Math.random()*0.25+0.05),
    c: colors[(Math.random()*colors.length)|0],
    flicker: Math.random()*0.02+0.005
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,106,0,0.08)';
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx + (Math.random()-0.5)*0.02;
      p.y += p.vy;
      p.o += (Math.random()-0.5)*p.flicker;

      if (p.y < -10) { 
        p.y = h + 10; 
        p.x = Math.random()*w; 
      }

      ctx.beginPath();
      ctx.fillStyle = p.c; 
      ctx.globalAlpha = Math.max(0.08, Math.min(0.8, p.o));
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    rafId = requestAnimationFrame(draw);
  }

  const onResize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', onResize, { passive: true });

  const play = () => { 
    if (!rafId) { 
      paused = false; 
      rafId = requestAnimationFrame(draw); 
    } 
  };
  const pause = () => { 
    paused = true; 
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; } 
    ctx.clearRect(0, 0, w, h); 
  };

  play(); // automātiski ieslēdzam

  return { pause, play, isPaused: paused };
}

// Galvenā inicializācija
function init() {
  initYear();
  initNav();
  buildGallery();
  createLightbox('#gallery');
  revealSections();
  
  const particlesCtrl = createParticles();

  const toggle = document.getElementById('particles-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const nowPause = !toggle.getAttribute('aria-pressed') || toggle.getAttribute('aria-pressed') === 'false';
      toggle.setAttribute('aria-pressed', String(nowPause));
      if (nowPause) {
        particlesCtrl.pause();
        toggle.textContent = 'Resume Sparks';
      } else {
        particlesCtrl.play();
        toggle.textContent = 'Pause Sparks';
      }
    });
  }

  // Lightbox event pauses
  document.addEventListener('lightbox-open', () => particlesCtrl && particlesCtrl.pause());
  document.addEventListener('lightbox-close', () => {
    const toggleBtn = document.getElementById('particles-toggle');
    if (toggleBtn && toggleBtn.getAttribute('aria-pressed') === 'true') return;
    particlesCtrl && particlesCtrl.play();
  });
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
