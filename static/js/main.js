/* CoRAct project page. No build tools, analytics, external JS or network data fetches. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.CORACT_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let toastTimer;

  function notify(message) {
    const element = $('#toast');
    if (!element) return;
    clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add('visible');
    toastTimer = setTimeout(() => element.classList.remove('visible'), 3400);
  }

  // Accept relative asset paths and ordinary web URLs; never evaluate configuration as HTML.
  function safeURL(value, allowRelative = true) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const candidate = value.trim();
    const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate);
    if (candidate.startsWith('//')) return '';
    if (!hasScheme && allowRelative) return candidate;
    try {
      const parsed = new URL(candidate);
      return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
    } catch (_) { return ''; }
  }

  function configureExternalLink(selector, value) {
    const element = $(selector);
    const url = safeURL(value, false);
    if (!element || !url) return;
    element.href = url;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
    element.classList.remove('is-unavailable');
    element.removeAttribute('aria-disabled');
    element.removeAttribute('tabindex');
    $('.pending-label', element)?.remove();
  }

  const paperURL = safeURL(config.paperUrl);
  if (paperURL) $$('[data-paper]').forEach(link => { link.href = paperURL; });
  configureExternalLink('#code-link', config.codeUrl);
  configureExternalLink('#arxiv-link', config.arxivUrl);

  if (Array.isArray(config.authors) && config.authors.length) {
    const container = $('#authors');
    const fragment = document.createDocumentFragment();
    let hasEqual = false;
    config.authors.forEach(author => {
      if (!author || typeof author.name !== 'string' || !author.name.trim()) return;
      const span = document.createElement('span');
      span.className = 'author-name';
      const url = safeURL(author.url, false);
      const label = document.createElement(url ? 'a' : 'span');
      label.textContent = author.name.trim();
      if (url) { label.href = url; label.target = '_blank'; label.rel = 'noopener noreferrer'; }
      span.append(label);
      if (author.affiliations || author.equal) {
        const sup = document.createElement('sup');
        sup.textContent = `${author.affiliations || ''}${author.equal ? '*' : ''}`;
        span.append(sup);
      }
      if (author.equal) hasEqual = true;
      fragment.append(span);
    });
    if (fragment.childNodes.length) {
      container.replaceChildren(fragment);
      if (hasEqual) {
        const equal = document.createElement('p');
        equal.className = 'equal-contribution';
        equal.textContent = '* Equal contribution';
        container.append(equal);
      }
    }
  }
  if (Array.isArray(config.affiliations) && config.affiliations.length) {
    const container = $('#affiliations');
    config.affiliations.forEach(item => {
      if (!item || typeof item.name !== 'string' || !item.name.trim()) return;
      const span = document.createElement('span');
      span.className = 'affiliation-item';
      if (item.id) {
        const sup = document.createElement('sup');
        sup.textContent = `${item.id} `;
        span.append(sup);
      }
      span.append(document.createTextNode(item.name.trim()));
      container.append(span);
    });
    container.hidden = !container.childNodes.length;
  }
  if (typeof config.venue === 'string' && config.venue.trim()) {
    $('#venue').textContent = config.venue.trim();
    $('#venue').hidden = false;
  }
  const siteURL = safeURL(config.siteUrl, false);
  if (siteURL) {
    const normalized = siteURL.endsWith('/') ? siteURL : `${siteURL}/`;
    const canonical = document.createElement('link');
    canonical.rel = 'canonical'; canonical.href = normalized;
    document.head.append(canonical);
    const metadata = {
      'og:url': normalized,
      'og:image': new URL('static/images/framework.png', normalized).href,
      'og:image:alt': 'CoRAct framework: reasoning, action, and consequence alignment',
      'twitter:image': new URL('static/images/framework.png', normalized).href
    };
    Object.entries(metadata).forEach(([property, content]) => {
      const meta = document.createElement('meta');
      meta.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property);
      meta.content = content;
      document.head.append(meta);
    });
  }

  // A deliberately empty video slot becomes a real player only when a URL is provided.
  const video = $('#overview-video');
  const videoSource = safeURL(config.videoSrc);
  if (video && videoSource) {
    video.src = videoSource;
    const poster = safeURL(config.videoPoster);
    if (poster) video.poster = poster;
    const captions = safeURL(config.videoCaptions);
    if (captions) {
      const track = document.createElement('track');
      track.kind = 'captions'; track.src = captions;
      track.srclang = config.videoCaptionLanguage || 'en';
      track.label = config.videoCaptionLabel || 'English';
      video.append(track);
    }
    $('#video-placeholder').hidden = true;
    $('#video-status').textContent = 'VIDEO OVERVIEW';
    video.hidden = false;
    video.addEventListener('error', () => {
      video.hidden = true;
      $('#video-placeholder').hidden = false;
      $('#video-status').textContent = 'VIDEO UNAVAILABLE';
      $('#video-placeholder > p').textContent = 'The video could not be loaded. Please check its configured path.';
    });
  }
  $('#video-placeholder-button')?.addEventListener('click', () => {
    notify('The introduction video has not been added yet.');
  });

  // Accessible tab switching; arrows/Home/End work from the keyboard.
  $$('[data-tabs]').forEach(component => {
    const tabs = $$('[role="tab"]', component);
    const panels = $$('[role="tabpanel"]', component);
    function selectTab(tab, moveFocus = false) {
      tabs.forEach(item => {
        const isCurrent = item === tab;
        item.setAttribute('aria-selected', String(isCurrent));
        item.tabIndex = isCurrent ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
      if (moveFocus) tab.focus({ preventScroll: true });
      scheduleScrollUpdate();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[next], true);
      });
    });
  });

  // Hover light and local click ripple. Static focus treatment remains for reduced motion.
  const pulseTimers = new WeakMap();
  $$('.glow-target').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType === 'touch' || element.matches('.is-unavailable,:disabled')) return;
      const box = element.getBoundingClientRect();
      element.style.setProperty('--light-x', `${event.clientX - box.left}px`);
      element.style.setProperty('--light-y', `${event.clientY - box.top}px`);
      element.classList.add('pointer-lit');
    }, { passive: true });
    element.addEventListener('pointerleave', () => element.classList.remove('pointer-lit'));
  });
  document.addEventListener('click', event => {
    const element = event.target.closest('.glow-target');
    if (!element || element.matches('.is-unavailable,:disabled')) return;
    clearTimeout(pulseTimers.get(element));
    element.classList.add('is-tapped');
    pulseTimers.set(element, setTimeout(() => element.classList.remove('is-tapped'), 800));
    if (reducedMotion.matches) return;
    const box = element.getBoundingClientRect();
    const size = Math.min(550, Math.max(box.width, box.height) * 1.8);
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.width = `${size}px`; ripple.style.height = `${size}px`;
    const keyboard = event.detail === 0;
    ripple.style.left = `${keyboard ? box.width / 2 : event.clientX - box.left}px`;
    ripple.style.top = `${keyboard ? box.height / 2 : event.clientY - box.top}px`;
    element.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    setTimeout(() => ripple.remove(), 900);
  });

  // Click-to-enlarge images. Native <dialog> handles Escape and focus containment.
  const dialog = $('#figure-dialog');
  let previousFocus = null;
  $$('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      previousFocus = document.activeElement;
      const original = $('img', link);
      $('#lightbox-image').src = link.href;
      $('#lightbox-image').alt = original?.alt || 'Enlarged CoRAct figure';
      $('#lightbox-caption').textContent = $('figcaption', link.closest('figure'))?.textContent || '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
      $('#close-lightbox').focus({ preventScroll: true });
    });
  });
  $('#close-lightbox')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    previousFocus?.focus({ preventScroll: true });
  });

  // Citation is not fabricated: an empty config stays visibly pending.
  const bibtex = typeof config.bibtex === 'string' ? config.bibtex.trim() : '';
  if (bibtex) {
    $('#citation-empty').hidden = true;
    $('#bibtex-pre').hidden = false;
    $('#bibtex-code').textContent = bibtex;
    $('#copy-citation').disabled = false;
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* File previews and some browsers need the fallback below. */ }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    textarea.setAttribute('readonly', '');
    document.body.append(textarea);
    textarea.select();
    let successful = false;
    try { successful = document.execCommand('copy'); } catch (_) {}
    textarea.remove();
    return successful;
  }
  $('#copy-citation')?.addEventListener('click', async () => {
    if (!bibtex) return;
    const copied = await copyText(bibtex);
    notify(copied ? 'BibTeX copied to clipboard.' : 'Copy was blocked by the browser. Select and copy the citation manually.');
    if (copied) {
      const label = $('#copy-citation span');
      label.textContent = 'Copied';
      setTimeout(() => { label.textContent = 'Copy'; }, 2200);
    }
  });

  // Subtle reveal on figures only. Content remains visible without JavaScript.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px 50px 0px' });
    $$('[data-reveal]').forEach(element => {
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
  }

  // Reading progress + section navigation: one passive, requestAnimationFrame-throttled listener.
  const sectionIds = ['video-overview', 'abstract', 'method', 'results', 'correction', 'real-world', 'citation'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = $$('[data-section-link]');
  const progress = $('#reading-progress');
  const backToTop = $('.back-to-top');
  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    const scrollY = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    backToTop?.classList.toggle('is-visible', scrollY > 700);
    const readingLine = scrollY + Math.min(220, window.innerHeight * .29);
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top + scrollY <= readingLine) current = section.id;
    }
    if (max > 0 && max - scrollY < 24) current = 'citation';
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollUpdate() {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScrollUpdate).observe(document.querySelector('main'));
  updateScroll();
})();
