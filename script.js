(() => {
  'use strict';

  const page = document.querySelector('.landing');
  if (!page) return;

  const progress = document.querySelector('.reading-progress');
  const header = document.querySelector('.landing-nav');
  const counter = document.querySelector('[data-story-number]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollRange = 0;
  let framePending = false;
  let headerScrolled = false;

  function renderScroll() {
    const position = Math.max(0, window.scrollY);
    const ratio = scrollRange > 0 ? Math.min(1, position / scrollRange) : 0;

    if (progress) progress.style.transform = `scaleX(${ratio})`;

    const nextHeaderState = position > 24;
    if (header && nextHeaderState !== headerScrolled) {
      header.classList.toggle('is-scrolled', nextHeaderState);
      headerScrolled = nextHeaderState;
    }
    framePending = false;
  }

  function scheduleScroll() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(renderScroll);
  }

  function measurePage() {
    scrollRange = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    scheduleScroll();
  }

  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', measurePage, { passive: true });
  window.addEventListener('load', measurePage, { once: true });
  window.addEventListener('pageshow', measurePage);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(measurePage);
    resizeObserver.observe(document.body);
  }
  if (document.fonts) document.fonts.ready.then(measurePage);
  measurePage();
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    if (!reducedMotion.matches) {
      page.classList.add('motion-ready');
      page.querySelectorAll('[data-reveal]').forEach((element) => {
        revealObserver.observe(element);
      });
    }
    reducedMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      page.classList.remove('motion-ready');
      revealObserver.disconnect();
    });
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && counter) {
          counter.textContent = entry.target.dataset.chapter;
        }
      });
    }, { rootMargin: '-15% 0px -45% 0px' });

    page.querySelectorAll('[data-chapter]').forEach((chapter) => {
      chapterObserver.observe(chapter);
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
