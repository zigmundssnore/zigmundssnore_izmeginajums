export function createLightbox(gallerySelector) {
  const gallery = document.querySelector(gallerySelector);
  if (!gallery) return;

  const items = Array.from(gallery.querySelectorAll('a[data-index]'));
  let current = -1;
  let busy = false; // lai neviens rapid click nesabojā galeriju

  // Backdrop un saturs
  const backdrop = document.createElement('div');
  backdrop.className = 'lb-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const content = document.createElement('div');
  content.className = 'lb-content';

  const img = document.createElement('img');
  img.className = 'lb-img';
  img.alt = '';
  img.loading = 'lazy'; // lazy-load

  const caption = document.createElement('div');
  caption.className = 'lb-caption';

  const btnClose = document.createElement('button');
  btnClose.className = 'lb-close';
  btnClose.type = 'button';
  btnClose.setAttribute('aria-label', 'Close');
  btnClose.textContent = 'Close';

  const btnPrev = document.createElement('button');
  btnPrev.className = 'lb-prev';
  btnPrev.type = 'button';
  btnPrev.setAttribute('aria-label', 'Previous');
  btnPrev.textContent = '‹';

  const btnNext = document.createElement('button');
  btnNext.className = 'lb-next';
  btnNext.type = 'button';
  btnNext.setAttribute('aria-label', 'Next');
  btnNext.textContent = '›';

  content.append(img, caption, btnClose, btnPrev, btnNext);
  backdrop.appendChild(content);
  document.body.appendChild(backdrop);

  function open(index) {
    if (busy) return;
    busy = true;
    current = index;
    const el = items[current];
    const href = el.getAttribute('href');
    img.src = href;
    caption.textContent = el.dataset.caption || '';
    backdrop.classList.add('active');
    document.dispatchEvent(new CustomEvent('lightbox-open'));
    document.body.style.overflow = 'hidden';
    setTimeout(() => busy = false, 200);
  }

  function close() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    img.src = '';
    current = -1;
    document.dispatchEvent(new CustomEvent('lightbox-close'));
  }

  function prev() {
    if (current < 0) return;
    const nextIndex = (current - 1 + items.length) % items.length;
    open(nextIndex);
  }

  function next() {
    if (current < 0) return;
    const nextIndex = (current + 1) % items.length;
    open(nextIndex);
  }

  // Event bindings
  items.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = Number(a.dataset.index || '0');
      open(idx);
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!backdrop.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;

  content.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  });

  content.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) prev();
      else next();
    }
  });
}
