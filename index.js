(() => {
  'use strict';

  const THEME_KEY = 'intelitech-theme';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  };

  const initTheme = () => {
    const saved = getSavedTheme();
    applyTheme(saved || getSystemTheme());
  };

  const initThemeToggle = () => {
    const toggle = () => {
      const next =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage indisponível */
      }
    };

    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.addEventListener('click', toggle);
    });
  };

  const initNavbar = () => {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    const close = () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

    document.addEventListener('click', (e) => {
      if (!links.contains(e.target) && !toggle.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };

  const initScroll = () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  const initReveal = () => {
    const items = document.querySelectorAll('.reveal');
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  };

  const initFooterYear = () => {
    document.querySelectorAll('.footer-year').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  };

  initTheme();
  initThemeToggle();
  initNavbar();
  initScroll();
  initReveal();
  initFooterYear();
})();