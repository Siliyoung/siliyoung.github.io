(function () {
  'use strict';

  const assets = window.FAIRY_ASSETS || {};
  const canReveal = 'IntersectionObserver' in window;
  if (canReveal) document.documentElement.classList.add('js-ready');
  const root = document.documentElement;
  const fairy = document.getElementById('fairy-sprite');
  const sparkleLayer = document.getElementById('sparkle-layer');
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');

  root.style.setProperty('--forest-bg', `url("${assets.IMAGE_BACKGROUND_OVERALL || ''}")`);
  root.style.setProperty('--article-bg', `url("${assets.IMAGE_BACKGROUND_ARTICLE || ''}")`);

  if (fairy) {
    fairy.style.backgroundImage = `url("${assets.IMAGE_FAIRY_IDLE || ''}")`;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasPointer = false;
    fairy.classList.add('fairy-hidden');

    window.addEventListener('mousemove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!hasPointer) {
        currentX = pointerX;
        currentY = pointerY;
        hasPointer = true;
        fairy.classList.remove('fairy-hidden');
      }
    }, { passive: true });

    function followPointer() {
      if (hasPointer) {
        currentX += (pointerX - currentX) * .25;
        currentY += (pointerY - currentY) * .25;
        fairy.style.left = `${currentX - 4}px`;
        fairy.style.top = `${currentY - 7}px`;
      }
      requestAnimationFrame(followPointer);
    }
    followPointer();

    window.addEventListener('mousedown', function (event) {
      fairy.classList.add('casting');
      fairy.style.backgroundImage = `url("${assets.IMAGE_FAIRY_CASTING || ''}")`;
      createSparkles(event.clientX, event.clientY);
    });
    window.addEventListener('mouseup', function () {
      fairy.classList.remove('casting');
      fairy.style.backgroundImage = `url("${assets.IMAGE_FAIRY_IDLE || ''}")`;
    });
    function placeFairy(x, y) {
      pointerX = x;
      pointerY = y;
      currentX = x;
      currentY = y;
      hasPointer = true;
      fairy.classList.remove('fairy-hidden');
      fairy.style.left = `${x - 4}px`;
      fairy.style.top = `${y - 7}px`;
    }

    window.addEventListener('touchstart', function (event) {
      const touch = event.touches[0];
      if (!touch) return;
      placeFairy(touch.clientX, touch.clientY);
      fairy.classList.add('casting');
      fairy.style.backgroundImage = `url("${assets.IMAGE_FAIRY_CASTING || ''}")`;
      createSparkles(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', function (event) {
      const touch = event.touches[0];
      if (touch) placeFairy(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('touchend', function () {
      fairy.classList.remove('casting');
      fairy.style.backgroundImage = `url("${assets.IMAGE_FAIRY_IDLE || ''}")`;
    }, { passive: true });
  }

  function setupAmbientForest() {
    const scene = document.querySelector('.ambient-forest');
    if (!scene) return;
    window.addEventListener('mousemove', function (event) {
      const x = (event.clientX / window.innerWidth - .5) * 2;
      const y = (event.clientY / window.innerHeight - .5) * 2;
      scene.style.setProperty('--parallax-x', `${x * 8}px`);
      scene.style.setProperty('--parallax-y', `${y * 6}px`);
    }, { passive: true });
  }
  function setupCalendar() {
    const calendar = document.getElementById('forest-calendar');
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    if (!calendar || !grid || !title) return;
    const posts = Array.isArray(window.CALENDAR_POSTS) ? window.CALENDAR_POSTS : [];
    const grouped = {};
    posts.forEach(function (post) { (grouped[post.date] ||= []).push(post); });
    let viewDate = new Date();
    let mode = 'month';
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    function renderMonth() {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      title.textContent = `${year} · ${String(month + 1).padStart(2, '0')}`;
      grid.innerHTML = '';
      grid.className = 'calendar-grid month-view';
      const first = new Date(year, month, 1).getDay();
      const total = new Date(year, month + 1, 0).getDate();
      for (let i = 0; i < first; i += 1) grid.insertAdjacentHTML('beforeend', '<span class="calendar-empty"></span>');
      for (let day = 1; day <= total; day += 1) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayPosts = grouped[key] || [];
        const cell = document.createElement(dayPosts.length ? 'button' : 'span');
        cell.className = `calendar-day${dayPosts.length ? ' has-post' : ''}`;
        cell.type = 'button';
        cell.innerHTML = `${day}${dayPosts.length ? '<i>✦</i>' : ''}`;
        if (dayPosts.length) cell.addEventListener('click', () => showPosts(key));
        grid.appendChild(cell);
      }
    }
    function renderYear() {
      const year = viewDate.getFullYear();
      title.textContent = `${year} 年`;
      grid.innerHTML = '';
      grid.className = 'calendar-grid year-view';
      for (let month = 0; month < 12; month += 1) {
        const monthCell = document.createElement('button');
        monthCell.type = 'button';
        monthCell.className = 'calendar-month-cell';
        const count = posts.filter((post) => post.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
        monthCell.innerHTML = `<strong>${month + 1}月</strong><span>${count ? `✦ ${count} 篇` : '—'}</span>`;
        monthCell.addEventListener('click', () => { mode = 'month'; viewDate = new Date(year, month, 1); update(); });
        grid.appendChild(monthCell);
      }
    }function showPosts(key) {
      const [year, month, day] = key.split('-');
      window.location.href = `/archives/${year}/${month}/${day}/`;
    }
    function update() { mode === 'month' ? renderMonth() : renderYear(); }
    document.getElementById('calendar-prev').addEventListener('click', () => { mode === 'month' ? viewDate.setMonth(viewDate.getMonth() - 1) : viewDate.setFullYear(viewDate.getFullYear() - 1); update(); });
    document.getElementById('calendar-next').addEventListener('click', () => { mode === 'month' ? viewDate.setMonth(viewDate.getMonth() + 1) : viewDate.setFullYear(viewDate.getFullYear() + 1); update(); });    title.addEventListener('click', () => { if (mode === 'month') { mode = 'year'; update(); } });
    update();
  }
  function setupSearch() {
    const toggle = document.querySelector('.search-toggle');
    const panel = document.getElementById('search-panel');
    const input = document.getElementById('site-search');
    const close = document.getElementById('search-close');
    const results = document.getElementById('search-results');
    const index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    if (!toggle || !panel || !input || !results) return;

    function renderResults(query) {
      const keyword = query.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '<div class="search-empty">输入关键词搜索文章</div>';
        return;
      }
      const matches = index.filter(function (item) {
        return `${item.title} ${item.excerpt}`.toLowerCase().includes(keyword);
      }).slice(0, 8);
      results.innerHTML = matches.length
        ? matches.map(function (item) {
          return `<a class="search-result" href="${item.path}"><strong>${item.title}</strong><small>${item.date} · ${item.excerpt}</small></a>`;
        }).join('')
        : '<div class="search-empty">没有找到相关文章</div>';
    }

    toggle.addEventListener('click', function () {
      const opened = panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', String(!opened));
      if (opened) {
        input.focus();
        renderResults(input.value);
      }
    });
    input.addEventListener('input', function () { renderResults(input.value); });
    if (close) close.addEventListener('click', function () {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  }
  function setupCopyButtons() {
    document.querySelectorAll('.article-content figure.highlight, .article-content > pre').forEach(function (block) {
      const code = block.matches('figure.highlight') ? block.querySelector('.code pre') : (block.querySelector('pre') || block);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', '复制代码');
      button.addEventListener('click', async function () {
        const text = code.innerText || code.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
        } catch (error) {
          const area = document.createElement('textarea');
          area.value = text;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        button.textContent = 'Copied';
        button.classList.add('copied');
        window.setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 1400);
      });
      block.appendChild(button);
    });
  }
  function createSparkles(x, y) {
    if (!sparkleLayer) return;
    const count = 12 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      const angle = (Math.PI * 2 * i / count) + (Math.random() - .5) * .7;
      const distance = 40 + Math.random() * 95;
      particle.className = 'sparkle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * distance + 38}px`);
      particle.style.setProperty('--size', `${4 + Math.random() * 7}px`);
      particle.style.animationDelay = `${Math.random() * 90}ms`;
      sparkleLayer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }


  if (header) {
    const updateHeaderVisibility = function () {
      header.classList.toggle('nav-hidden', window.scrollY > 80);
    };
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    updateHeaderVisibility();
  }
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  setupAmbientForest();
  setupCalendar();
  setupSearch();
  setupCopyButtons();

  if (!canReveal) return;

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}());
