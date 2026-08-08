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
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let currentX = pointerX;
    let currentY = pointerY;

    window.addEventListener('mousemove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
    }, { passive: true });

    function followPointer() {
      currentX += (pointerX - currentX) * .25;
      currentY += (pointerY - currentY) * .25;
      fairy.style.left = `${currentX - 4}px`;
      fairy.style.top = `${currentY - 7}px`;
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
  }

  function setupCopyButtons() {
    document.querySelectorAll('.article-content figure.highlight, .article-content > pre').forEach(function (block) {
      const code = block.querySelector('pre') || block;
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
