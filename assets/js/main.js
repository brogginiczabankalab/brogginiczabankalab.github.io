/* =============================================================
   Translational Neurosurgery Laboratory — interactions
   Vanilla JS, no dependencies.
   ============================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Theme ---------------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('tnl-theme'); } catch (e) { /* private mode */ }
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));

  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tnl-theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------- Sticky nav ---------------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile menu ---------------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Reveal on scroll ----------------
     IntersectionObserver drives the effect, but a scroll/resize sweep runs
     alongside it as a safety net: anything whose top has entered the viewport
     is revealed regardless of what the observer reported. An element that
     never un-hides is far worse than one that animates a frame early. */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var reveal = function (el) { el.classList.add('is-in'); };

    var sweep = function () {
      var limit = window.innerHeight * 0.94;
      var pending = false;
      for (var i = 0; i < revealables.length; i++) {
        var el = revealables[i];
        if (el.classList.contains('is-in')) continue;
        if (el.getBoundingClientRect().top < limit) reveal(el);
        else pending = true;
      }
      if (!pending) {
        window.removeEventListener('scroll', onSweep);
        window.removeEventListener('resize', onSweep);
      }
    };

    var sweepTicking = false;
    var onSweep = function () {
      if (sweepTicking) return;
      sweepTicking = true;
      requestAnimationFrame(function () { sweep(); sweepTicking = false; });
    };

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
      revealables.forEach(function (el) { revealObserver.observe(el); });
    }

    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('resize', onSweep);
    sweep();
    window.addEventListener('load', sweep);
  }

  /* ---------------- Animated counters ---------------- */
  var stats = document.getElementById('stats');
  if (stats) {
    var runCounters = function () {
      stats.querySelectorAll('[data-count]').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (reduceMotion) { el.textContent = String(target); return; }
        var duration = 1400, start = null;
        var step = function (ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          // easeOutExpo
          var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = String(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounters(); statObserver.disconnect(); }
        });
      }, { threshold: 0.4 });
      statObserver.observe(stats);
    } else {
      runCounters();
    }
  }

  /* ---------------- Hero parallax ---------------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion && window.matchMedia('(min-width: 941px)').matches) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          var rate = parseFloat(el.getAttribute('data-parallax')) || 0.05;
          el.style.transform = 'translate3d(0,' + (y * rate).toFixed(2) + 'px,0)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- Active section in nav ---------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkFor = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });
  // Only worth running where the nav actually indexes several in-page sections.
  // On the sub-pages the nav points at other documents, and the active link is
  // already marked in the HTML — the spy would only fight it.
  if (Object.keys(linkFor).length > 1 && sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = linkFor[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove('is-active'); });
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Publications ---------------- */
  var pubs = window.PUBLICATIONS || [];
  var list = document.getElementById('pubList');
  var countEl = document.getElementById('pubCount');

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };

  // "Broggini T, Duckworth J, …" with Broggini emphasised and long lists collapsed
  var formatAuthors = function (authors) {
    var mark = function (name) {
      return /^Broggini\b/.test(name) ? '<b>' + esc(name) + '</b>' : esc(name);
    };
    if (authors.length <= 8) return authors.map(mark).join(', ');
    var head = authors.slice(0, 5).map(mark);
    var tail = mark(authors[authors.length - 1]);
    var hiddenHasBroggini = authors.slice(5, -1).some(function (n) { return /^Broggini\b/.test(n); });
    var middle = hiddenHasBroggini
      ? '… <b>Broggini T</b> … '
      : '… ';
    return head.join(', ') + ', ' + middle + tail
      + ' <span style="opacity:.6">(' + authors.length + ' authors)</span>';
  };

  var render = function (items) {
    if (!list) return;
    list.innerHTML = items.map(function (p, i) {
      var pubmed = p.pmid ? 'https://pubmed.ncbi.nlm.nih.gov/' + p.pmid + '/' : null;
      var doi = p.doi ? 'https://doi.org/' + p.doi : null;
      return ''
        + '<article class="pub" style="animation-delay:' + Math.min(i * 22, 420) + 'ms">'
        +   '<div class="pub-yr">' + esc(p.year || '—') + '</div>'
        +   '<div>'
        +     '<h3 class="pub-title">' + esc(p.title) + '</h3>'
        +     '<p class="pub-authors">' + formatAuthors(p.authors) + '</p>'
        +     '<div class="pub-jrnl">'
        +       '<em>' + esc(p.journal) + '</em>'
        +       (p.featured ? '<span class="pub-star">★ Selected</span>' : '')
        +     '</div>'
        +   '</div>'
        +   '<div class="pub-links">'
        +     (doi ? '<a href="' + esc(doi) + '" target="_blank" rel="noopener">DOI</a>' : '')
        +     (pubmed ? '<a href="' + esc(pubmed) + '" target="_blank" rel="noopener">PubMed</a>' : '')
        +   '</div>'
        + '</article>';
    }).join('');
    if (countEl) {
      countEl.textContent = items.length + ' of ' + pubs.length + ' publications';
    }
  };

  var applyFilter = function (key) {
    var items = key === 'all' ? pubs
      : key === 'featured' ? pubs.filter(function (p) { return p.featured; })
      : pubs.filter(function (p) { return p.tags.indexOf(key) !== -1; });
    render(items);
  };

  if (list && pubs.length) {
    render(pubs);

    // Annotate each filter button with its result count
    document.querySelectorAll('.filter').forEach(function (btn) {
      var key = btn.getAttribute('data-filter');
      var n = key === 'all' ? pubs.length
        : key === 'featured' ? pubs.filter(function (p) { return p.featured; }).length
        : pubs.filter(function (p) { return p.tags.indexOf(key) !== -1; }).length;
      btn.insertAdjacentHTML('beforeend', ' <span class="n">' + n + '</span>');

      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        applyFilter(key);
      });
    });
  } else if (countEl) {
    countEl.textContent = 'Publication list unavailable';
  }

  /* ---------------- Lightbox ---------------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbCap = document.getElementById('lightboxCap');
  var lbClose = document.getElementById('lightboxClose');
  var lastFocus = null;

  var openLightbox = function (src, alt, cap) {
    if (!lb) return;
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCap.textContent = cap || '';
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  };
  var closeLightbox = function () {
    if (!lb) return;
    lb.classList.remove('is-open');
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  document.querySelectorAll('.gitem').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      if (img) openLightbox(img.currentSrc || img.src, img.alt, btn.getAttribute('data-cap'));
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      if (navLinks && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* ---------------- Location map (load on request) ----------------
     The embed is only injected once the visitor clicks, so no request
     reaches Google — and no cookie is set — on a plain page view. */
  var mapWrap = document.getElementById('map');
  var mapBtn = document.getElementById('mapLoad');
  if (mapWrap && mapBtn) {
    mapBtn.addEventListener('click', function () {
      var query = mapWrap.getAttribute('data-query') || '';
      var frame = document.createElement('iframe');
      frame.className = 'map-embed';
      frame.title = 'Map showing the location of the laboratory';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(query) + '&z=16&output=embed';
      mapWrap.innerHTML = '';
      mapWrap.appendChild(frame);
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
