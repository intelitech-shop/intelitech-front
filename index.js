(() => {
  'use strict';

  const THEME_KEY = 'intelitech-theme';

  const PRODUCTS = [
    { id: 'smartphone-pro-x', nome: 'Smartphone Pro X', categoria: 'Smartphones', preco: 3999.9, img: 'imagens/produtos/smartphone.png', destaque: true },
    { id: 'notebook-ultra-14', nome: 'Notebook Ultra 14', categoria: 'Notebooks', preco: 5499.0, img: 'imagens/produtos/notebook.png', destaque: true },
    { id: 'fone-maxsound', nome: 'Fone Bluetooth MaxSound', categoria: 'Áudio', preco: 899.9, img: 'imagens/produtos/fone.png', destaque: true },
    { id: 'smartwatch-fit-pro', nome: 'Smartwatch Fit Pro', categoria: 'Wearables', preco: 1299.0, img: 'imagens/produtos/smartwatch.png', destaque: false },
    { id: 'teclado-rgb', nome: 'Teclado Mecânico RGB', categoria: 'Periféricos', preco: 649.9, img: 'imagens/produtos/teclado.png', destaque: true },
    { id: 'tablet-vision-11', nome: 'Tablet Vision 11', categoria: 'Tablets', preco: 2499.0, img: 'imagens/produtos/tablet.png', destaque: false },
    { id: 'mouse-game-turbo', nome: 'Mouse Gamer Turbo', categoria: 'Periféricos', preco: 349.9, img: 'imagens/produtos/mouse.png', destaque: false },
    { id: 'caixa-mini', nome: 'Caixa de Som Mini', categoria: 'Áudio', preco: 459.9, img: 'imagens/produtos/caixasom.png', destaque: false },
];

  const formatBRL = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cardTemplate = (p, { highlight = false, prefix = '' } = {}) => `
    <article class="product-card">
      <a href="${prefix}pages/produtos/produtos.html" class="product-card-inner" aria-label="${p.nome}">
        <div class="product-media">
          <img src="${prefix}${p.img}" alt="${p.nome}" loading="lazy" />
          ${highlight ? '<span class="product-tag">Destaque</span>' : ''}
        </div>
        <div class="product-body">
          <h4>${p.nome}</h4>
          <span class="product-cat">${p.categoria}</span>
        </div>
        <div class="product-foot">
          <span class="product-price"><small>a partir de</small> ${formatBRL(p.preco)}</span>
          <span class="product-cta" aria-hidden="true">+</span>
        </div>
      </a>
    </article>`;

  window.INTELITECH = Object.freeze({ PRODUCTS, cardTemplate });

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

  const initCarousel = () => {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const wrap = document.getElementById('carouselTrackWrap');
    const dotsBox = document.getElementById('carouselDots');
    const featured = PRODUCTS.filter((p) => p.destaque);

    track.innerHTML = featured.map((p) => cardTemplate(p, { highlight: true })).join('');

    const cardWidth = () => {
      const first = track.querySelector('.product-card');
      if (!first) return 300;
      const style = getComputedStyle(track);
      return first.getBoundingClientRect().width + parseFloat(style.columnGap || style.gap || '22');
    };

    const perView = () => Math.max(1, Math.floor(wrap.clientWidth / cardWidth()));

    const buildDots = () => {
      if (!dotsBox || featured.length <= perView()) {
        if (dotsBox) dotsBox.innerHTML = '';
        return;
      }
      const pages = featured.length - perView() + 1;
      dotsBox.innerHTML = Array.from(
        { length: pages },
        (_, i) => `<button type="button" class="carousel-dot" data-page="${i}" aria-label="Ir para página ${i + 1}"></button>`
      ).join('');
      dotsBox.querySelectorAll('.carousel-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          track.scrollTo({ left: Number(dot.dataset.page) * cardWidth(), behavior: 'smooth' });
        });
      });
    };

    const prevBtn = track.closest('.carousel')?.querySelector('[data-carousel="prev"]');
    const nextBtn = track.closest('.carousel')?.querySelector('[data-carousel="next"]');

    const sync = () => {
      const page = Math.min(Math.max(Math.round(track.scrollLeft / cardWidth()), 0), featured.length - 1);
      dotsBox?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === Math.min(page, dotsBox.children.length - 1));
      });
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };

    const scrollBy = (dir) => {
      track.scrollBy({ left: dir * cardWidth() * perView(), behavior: 'smooth' });
    };

    prevBtn?.addEventListener('click', () => scrollBy(-1));
    nextBtn?.addEventListener('click', () => scrollBy(1));

    let raf = 0;
    track.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      },
      { passive: true }
    );

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const autoplayMs = 5000;
    let timer = null;

    const startAutoplay = () => {
      if (reduced || nextBtn?.disabled) return;
      timer = setInterval(() => {
        if (nextBtn?.disabled) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          nextBtn.click();
        }
      }, autoplayMs);
    };

    const stopAutoplay = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const section = track.closest('.carousel-section');
    section?.addEventListener('mouseenter', stopAutoplay);
    section?.addEventListener('mouseleave', startAutoplay);
    section?.addEventListener('focusin', stopAutoplay);
    section?.addEventListener('focusout', startAutoplay);
    nextBtn?.addEventListener('click', stopAutoplay);
    prevBtn?.addEventListener('click', stopAutoplay);

    window.addEventListener('resize', () => {
      buildDots();
      sync();
    });

    buildDots();
    sync();
    startAutoplay();
  };

  initTheme();
  initThemeToggle();
  initNavbar();
  initScroll();
  initReveal();
  initFooterYear();
  initCarousel();
})();