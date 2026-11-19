/* Slava_PLT — интерактив и скролл-эффекты */
(function () {
  'use strict';
  var D = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var big = function (n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace('.', ',') + '\u00a0млн';
    if (n >= 1e4) { var t = n / 1e3; return (t % 1 ? t.toFixed(1).replace('.', ',') : t) + '\u00a0тыс.'; }
    return fmt(n);
  };
  var fmt = function (n) { return n.toLocaleString('ru-RU').replace(/,/g, ' '); };
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16l14-8z"/></svg>';
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var dragMoved = false;
  /* ---------- build content ---------- */
  var track = $('.works__track');
  D.works.forEach(function (w, i) {
    var el = document.createElement('article');
    el.className = 'work';
    el.setAttribute('role', 'listitem');
    el.tabIndex = 0;
    el.dataset.id = w.id;
    el.dataset.tag = w.tag;
    el.dataset.title = w.title;
    el.setAttribute('aria-label', 'Смотреть: ' + w.title);
    el.innerHTML =
      '<img class="work__poster" src="assets/img/' + w.id + '_poster.webp" alt="" loading="lazy">' +
      '<video muted loop playsinline preload="none" data-src="assets/video/' + w.id + '_loop.mp4"></video>' +
      '<span class="work__num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="work__play">' + PLAY + '</span>' +
      '<div class="work__info"><p class="work__tag">' + w.tag + '</p><h3 class="work__title">' + w.title + '</h3></div>';
    track.appendChild(el);
  });

  var wide = $('.wide__list');
  D.wide.forEach(function (w, i) {
    var el = document.createElement('article');
    el.className = 'wide-item';
    el.innerHTML =
      '<div class="wide-item__media" tabindex="0" role="button" aria-label="Смотреть: ' + w.title + '" data-id="' + w.id + '" data-tag="' + w.tag + '" data-title="' + w.title + '" data-wide="1">' +
      '<img src="assets/img/' + w.id + '_poster.webp" alt="" loading="lazy">' +
      '<video muted loop playsinline preload="none" data-src="assets/video/' + w.id + '_loop.mp4"></video>' +
      '<span class="work__play">' + PLAY + '</span></div>' +
      '<div class="wide-item__text"><span class="wide-item__num">0' + (i + 1) + '</span><p class="wide-item__tag">' + w.tag + '</p><h3>' + w.title + '</h3><p>' + w.text + '</p></div>';
    wide.appendChild(el);
  });

  var rows = [$('.styles__row--1'), $('.styles__row--2')];
  var half = Math.ceil(D.styles.length / 2);
  [D.styles.slice(0, half), D.styles.slice(half)].forEach(function (list, r) {
    var html = list.concat(list, list).map(function (s) {
      return '<figure class="style-card"><img src="assets/img/style_' + s[0] + '.webp" alt="Стиль: ' + s[1] + '" loading="lazy"><span>' + s[1] + '</span></figure>';
    }).join('');
    rows[r].innerHTML = html;
  });

  var tables = $('.price__tables');
  D.prices.forEach(function (p) {
    var li = D.qty.map(function (q, i) {
      return '<li><span>' + (i === 0 ? '1 ролик' : 'от ' + fmt(q) + ' шт') + '</span><span>' + fmt(p.list[i]) + ' ₽</span></li>';
    }).join('');
    tables.insertAdjacentHTML('beforeend', '<div class="ptable"><h3>' + p.name + '</h3><p>цена за 1 ролик, все ролики в одном стиле</p><ul>' + li + '</ul></div>');
  });

  /* reviews */
  var cols = $('.reviews__cols');
  if (D.reviews.length) {
    var nCol = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
    var colEls = [];
    for (var c = 0; c < nCol; c++) { var ce = document.createElement('div'); ce.className = 'reviews__col'; cols.appendChild(ce); colEls.push(ce); }
    D.reviews.forEach(function (r, i) {
      var html = '<blockquote class="review"><div class="review__q">“</div>' +
        (r.img ? '<img class="review__img" src="' + r.img + '" alt="Скриншот отзыва" loading="lazy">' : '') +
        (r.text ? '<p class="review__text">' + r.text + '</p>' : '') +
        '<p class="review__who">' + (r.who || '') + '</p>' + (r.what ? '<p class="review__what">' + r.what + '</p>' : '') + '</blockquote>';
      colEls[i % nCol].insertAdjacentHTML('beforeend', html);
    });
  } else {
    cols.style.display = 'none';
  }
  var voicesBox = $('.reviews__voices');
  D.voices.forEach(function (v, vi) {
    var bars = '';
    for (var bi = 0; bi < 46; bi++) bars += '<i style="height:' + (18 + Math.round(Math.abs(Math.sin(bi * 1.37 + vi * 2.1) * Math.cos(bi * .31)) * 82)) + '%"></i>';
    var el = document.createElement('figure');
    el.className = 'voice';
    el.innerHTML = '<div class="voice__player"><button class="voice__btn" aria-label="Слушать голосовой отзыв ' + v.title + '">' + PLAY + '</button>' +
      '<div class="voice__bars" aria-hidden="true">' + bars + '</div><span class="voice__meta">' + v.dur + '</span></div>' +
      '<figcaption><p class="voice__title">' + v.title + '</p><p class="voice__text">' + v.text + '</p><p class="review__who">' + v.who + '</p></figcaption>' +
      '<audio preload="none" src="' + v.src + '"></audio>';
    voicesBox.appendChild(el);
  });
  $$('.voice').forEach(function (el) {
    var a = $('audio', el), btn = $('.voice__btn', el), bars = $$('.voice__bars i', el), meta = $('.voice__meta', el), dur = meta.textContent;
    btn.addEventListener('click', function () {
      $$('.voice audio').forEach(function (o) { if (o !== a) o.pause(); });
      if (a.paused) { var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); } else a.pause();
    });
    a.addEventListener('play', function () { el.classList.add('is-playing'); btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'; });
    a.addEventListener('pause', function () { el.classList.remove('is-playing'); btn.innerHTML = PLAY; });
    $('.voice__bars', el).addEventListener('click', function (e) {
      var r = this.getBoundingClientRect(), k = (e.clientX - r.left) / r.width;
      var go = function () { a.currentTime = k * a.duration; var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); };
      $$('.voice audio').forEach(function (o) { if (o !== a) o.pause(); });
      if (a.readyState >= 1) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    });
    a.addEventListener('ended', function () { meta.textContent = dur; bars.forEach(function (bar) { bar.classList.remove('on'); }); });
    a.addEventListener('timeupdate', function () {
      var k = a.duration ? a.currentTime / a.duration : 0, t = Math.floor(a.currentTime);
      meta.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
      bars.forEach(function (bar, i) { bar.classList.toggle('on', i / bars.length < k); });
    });
  });
  var resBox = $('.results__nums');
  D.results.forEach(function (r) {
    resBox.insertAdjacentHTML('beforeend', '<div class="result"><b data-count="' + r.n + '">' + big(r.n) + '</b><span>' + r.label + '</span></div>');
  });
  var cl = $('.clients__list');
  D.clients.forEach(function (c) {
    cl.insertAdjacentHTML('beforeend', '<li><b>' + (c.url ? '<a href="' + c.url + '" target="_blank" rel="noopener">' + c.name + ' ↗</a>' : c.name) + '</b><span>' + c.meta + '</span><em>' + c.note + '</em></li>');
  });

  var faq = $('.faq__list');
  D.faq.forEach(function (q, i) {
    faq.insertAdjacentHTML('beforeend',
      '<div class="qa"><button class="qa__q" aria-expanded="false" aria-controls="qa' + i + '">' + q[0] + '<span class="qa__icon" aria-hidden="true"></span></button>' +
      '<div class="qa__a" id="qa' + i + '"><div><p>' + q[1] + '</p></div></div></div>');
  });
  $$('.qa__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.parentNode, open = !qa.classList.contains('is-open');
      $$('.qa.is-open').forEach(function (o) { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); });
      qa.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
      if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    });
  });

  /* вертикальный шоурил для портретных экранов */
  /* Safari не умеет прозрачный VP9 — показываем статичный кадр баннера */
  var ua = navigator.userAgent, isApple = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || (/Macintosh/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua));
  if (isApple) { var gb = $('.gift__banner'); var im = new Image(); im.src = gb.poster; im.className = 'gift__banner'; im.alt = ''; gb.replaceWith(im); }

  /* ---------- lazy video play/pause ---------- */
  var vidIO = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.src && !v.src) { v.src = v.dataset.src; }
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '200px 200px' });
  $$('video[data-src]').forEach(function (v) { vidIO.observe(v); });

  /* ---------- lightbox ---------- */
  var lb = $('.lightbox'), lbv = $('.lightbox__video'), lastFocus = null, lenis = null;
  function openLB(el) {
    lastFocus = el;
    $$('audio').forEach(function (a) { a.pause(); });
    $$('video[data-src]').forEach(function (v) { v.pause(); });
    lbv.src = 'assets/video/' + el.dataset.id + '.mp4';
    lbv.poster = 'assets/img/' + el.dataset.id + '_poster.webp';
    $('.lightbox__tag').textContent = el.dataset.tag;
    $('.lightbox__title').textContent = el.dataset.title;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    if (hasGsap) gsap.fromTo('.lightbox__box', { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'power3.out' });
    var p = lbv.play(); if (p && p.catch) p.catch(function () {});
    $('.lightbox__close').focus();
  }
  function closeLB() {
    lbv.pause(); lbv.removeAttribute('src'); lbv.load();
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.work, .wide-item__media, .i360__media');
    if (t && !dragMoved) openLB(t);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLB();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.work, .wide-item__media, .i360__media')) { e.preventDefault(); openLB(e.target); }
    if (e.key === 'Tab' && !lb.hidden) { e.preventDefault(); (document.activeElement === lbv ? $('.lightbox__close') : lbv).focus(); }
  });
  $('.lightbox__close').addEventListener('click', closeLB);
  $('.lightbox__bg').addEventListener('click', closeLB);

  /* ---------- calculator ---------- */
  var tab = 0, qi = 1;
  var steps = $('.calc__steps'), range = $('.calc__range'), num = $('.calc__num');
  D.qty.forEach(function (q, i) {
    steps.insertAdjacentHTML('beforeend', '<button role="radio" aria-checked="' + (i === qi) + '" data-q="' + i + '">' + fmt(q) + '<small>' + (i === 0 ? 'ролик' : 'шт') + '</small></button>');
  });
  var shown = 600;
  function renderCalc(animate) {
    var p = D.prices[tab].list[qi], q = D.qty[qi], base = D.prices[tab].list[0];
    $$('button', steps).forEach(function (b, i) { b.setAttribute('aria-checked', String(i === qi)); });
    range.value = qi;
    range.setAttribute('aria-valuetext', fmt(q) + ' шт, ' + fmt(p) + ' ₽ за ролик');
    $('.calc__sum').textContent = fmt(p * q) + ' ₽';
    $('.calc__save').textContent = qi ? '−' + Math.round((1 - p / base) * 100) + '% от цены одного ролика' : '';
    if (hasGsap && animate && !reduce) {
      var o = { v: shown };
      gsap.to(o, { v: p, duration: .7, ease: 'power3.out', onUpdate: function () { num.textContent = fmt(Math.round(o.v)); } });
    } else num.textContent = fmt(p);
    shown = p;
  }
  steps.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { qi = +b.dataset.q; renderCalc(true); } });
  range.addEventListener('input', function () { qi = +range.value; renderCalc(true); });
  var tabs = $$('.calc__tabs button'), tabBg = $('.calc__tab-bg');
  function moveTab() {
    var b = tabs[tab];
    tabBg.style.width = b.offsetWidth + 'px';
    tabBg.style.transform = 'translateX(' + (b.offsetLeft - 5) + 'px)';
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () {
      tab = i;
      tabs.forEach(function (x, j) { x.setAttribute('aria-selected', String(j === i)); });
      moveTab(); renderCalc(true);
    });
  });
  window.addEventListener('resize', moveTab);
  moveTab(); renderCalc(false);

  /* ---------- mobile menu ---------- */
  var burger = $('.burger'), mm = $('.mobile-menu');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    mm.classList.toggle('is-open', open);
    mm.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { if (burger.getAttribute('aria-expanded') === 'true') burger.click(); }); });

  /* ---------- cursor + magnetic + tilt ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    $$('.tilt').forEach(function (t) {
      t.addEventListener('mousemove', function (e) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = 'perspective(700px) rotateY(' + x * 18 + 'deg) rotateX(' + -y * 18 + 'deg) scale(1.04)';
      });
      t.addEventListener('mouseleave', function () { t.style.transform = ''; });
    });
  }

  /* ---------- header hide/show ---------- */
  var header = $('.header'), lastY = 0, nearTop = false;
  function onScrollHeader(y) {
    header.classList.toggle('is-solid', y > 40);
    if (y > 300 && y > lastY + 4 && !nearTop) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 300) header.classList.remove('is-hidden');
    lastY = y;
  }
  /* меню появляется, когда курсор у верхнего края экрана */
  if (fine) {
    window.addEventListener('mousemove', function (e) {
      var top = e.clientY < 90 || (nearTop && e.clientY < 120 && header.contains(e.target));
      if (top && !nearTop) { nearTop = true; header.classList.remove('is-hidden'); }
      else if (!top && nearTop && e.clientY > 140) { nearTop = false; if (lastY > 300) header.classList.add('is-hidden'); }
    }, { passive: true });
  }

  /* ---------- vertical works: slider ---------- */
  var vp = $('.works__viewport'), rail = $('.slider__rail'), thumb = $('.slider__thumb'), fill = $('.slider__fill');
  function maxScroll() { return Math.max(1, vp.scrollWidth - vp.clientWidth); }
  function syncThumb() {
    var rw = rail.clientWidth, tw = Math.max(90, rw * vp.clientWidth / vp.scrollWidth), k = vp.scrollLeft / maxScroll();
    thumb.style.width = tw + 'px';
    var x = (rw - tw) * k;
    thumb.style.transform = 'translateX(' + x + 'px)';
    fill.style.width = (x + tw / 2) + 'px';
    rail.setAttribute('aria-valuenow', Math.round(k * 100));
  }
  vp.addEventListener('scroll', syncThumb, { passive: true });
  window.addEventListener('resize', syncThumb);
  function railTo(clientX, grabOffset) {
    var r = rail.getBoundingClientRect(), tw = thumb.offsetWidth;
    var k = Math.min(1, Math.max(0, (clientX - r.left - grabOffset) / (r.width - tw)));
    vp.scrollLeft = k * maxScroll();
  }
  var grab = null;
  thumb.addEventListener('pointerdown', function (e) {
    e.preventDefault(); thumb.setPointerCapture(e.pointerId);
    grab = e.clientX - thumb.getBoundingClientRect().left; rail.classList.add('is-drag');
    vp.style.scrollBehavior = 'auto';
  });
  thumb.addEventListener('pointermove', function (e) { if (grab !== null) railTo(e.clientX, grab); });
  thumb.addEventListener('pointerup', function () { grab = null; rail.classList.remove('is-drag'); vp.style.scrollBehavior = ''; });
  rail.addEventListener('pointerdown', function (e) { if (e.target.closest('.slider__thumb')) return; vp.style.scrollBehavior = 'smooth'; railTo(e.clientX, thumb.offsetWidth / 2); });
  function step(dir) { var c = $('.work', vp); vp.style.scrollBehavior = 'smooth'; vp.scrollLeft += dir * (c ? c.offsetWidth + 20 : 300) * 2; }
  $('.slider__btn--prev').addEventListener('click', function () { step(-1); });
  $('.slider__btn--next').addEventListener('click', function () { step(1); });
  rail.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  /* перетаскивание мышью (на телефоне — обычный свайп) */
  function dragScroll(el, onMove) {
    var down = false, sx = 0, sl = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; dragMoved = false; sx = e.clientX; sl = el.scrollLeft; el.classList.add('is-grab'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 6) dragMoved = true; el.scrollLeft = sl - dx; if (onMove) onMove(); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; el.classList.remove('is-grab'); setTimeout(function () { dragMoved = false; }, 50); });
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  dragScroll(vp);
  /* ряды стилей: можно тянуть, и они сами едут при прокрутке страницы */
  var scrollers = $$('.styles__scroller');
  scrollers.forEach(function (sc) {
    dragScroll(sc);
    var third = function () { return sc.scrollWidth / 3; };
    var init = function () { sc.scrollLeft = third(); };
    window.addEventListener('load', init); init();
    sc.addEventListener('scroll', function () {
      var t = third();
      if (sc.scrollLeft < t * .5) sc.scrollLeft += t;
      else if (sc.scrollLeft > t * 1.5) sc.scrollLeft -= t;
    }, { passive: true });
  });
  var lastPageY = window.scrollY;
  function moveRows(y) {
    var d = y - lastPageY; lastPageY = y;
    scrollers.forEach(function (sc) { sc.scrollLeft += d * .6 * +sc.dataset.dir; });
  }
  window.addEventListener('scroll', function () { if (!lenis) moveRows(window.scrollY); }, { passive: true });
  setTimeout(syncThumb, 0);

  /* ---------- no-GSAP / reduced motion fallback ---------- */
  function finishPreloader() {
    document.body.classList.remove('is-loading');
    var pl = $('.preloader'); if (pl) pl.remove();
  }
  if (!hasGsap || reduce) {
    finishPreloader();
    $$('[data-count]').forEach(function (el) { el.textContent = fmt(+el.dataset.count) + (el.dataset.suffix || ''); });
    $$('.about__chunk').forEach(function (ch) { ch.classList.add('is-active'); });
    $$('.wide-item__media').forEach(function (m) { m.style.clipPath = 'none'; });
    window.addEventListener('scroll', function () { onScrollHeader(window.scrollY); }, { passive: true });
    $$('.about__chunk').forEach(function (ch) {
      new IntersectionObserver(function (e) { if (e[0].isIntersecting) setPose(+ch.dataset.pose); }, { threshold: .6 }).observe(ch);
    });
    return;
  }

  /* ================= GSAP ================= */
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', function (e) { ScrollTrigger.update(); onScrollHeader(e.scroll); moveRows(e.scroll); });
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: (id === '#hero' || id === '#works') ? 0 : -10, duration: 1.6 });
    });
  });

  /* split text into chars */
  $$('.split').forEach(function (el) {
    var words = el.textContent.split(' ');
    el.innerHTML = words.map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (ch) {
        return '<span class="ch" style="display:inline-block">' + ch + '</span>';
      }).join('') + '</span>';
    }).join(' ');
  });

  /* ---------- сразу первый экран, без загрузки ---------- */
  finishPreloader(); lenis.start();
  intro();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  function intro() {
    var tl = gsap.timeline();
    tl.from('.hero__title .line .ch', { yPercent: 115, rotate: 6, duration: 1, ease: 'power4.out', stagger: .022 })
      .from('.hero__word-text', { yPercent: 70, opacity: 0, letterSpacing: '.3em', duration: 1.2, ease: 'power4.out' }, '-=.7')
      .from('.hero__bucks i', { scale: 0, rotate: -40, opacity: 0, duration: .9, ease: 'back.out(2)', stagger: .08 }, '-=.8')
      .from('.hero__kicker span, .hero__kicker i', { y: 20, opacity: 0, stagger: .06, duration: .6 }, .2)
      .from('.hero__lead, .hero__ctas, .stats', { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out' }, '-=.9')
      .from('.hero__avatar img', { yPercent: 30, opacity: 0, duration: 1.1, ease: 'power3.out' }, .3)
      .from('.hero__avatar-card', { scaleY: 0, transformOrigin: '50% 100%', duration: .9, ease: 'power3.out' }, .3)
      .from('.bubble', { scale: 0, transformOrigin: '100% 50%', duration: .6, ease: 'back.out(2)' }, 1.1)
      .from('.float-card', { opacity: 0, scale: .6, duration: 1, stagger: .1, ease: 'power3.out' }, .4)
      .add(countStats, .9);
    return tl;
  }
  function countStats() {
    $$('.stats [data-count]').forEach(function (el) {
      var o = { v: 0 }, to = +el.dataset.count;
      gsap.to(o, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(Math.round(o.v)) + (el.dataset.suffix || ''); } });
    });
  }

  var mm2 = gsap.matchMedia();

  /* ---------- hero scroll-out ---------- */
  gsap.to('.hero__inner', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__avatar', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('.float-card').forEach(function (f) {
    var d = +f.dataset.depth;
    gsap.to(f, { y: -260 * d, rotate: '+=' + (d * 14), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  if (fine) {
    var heroEl = $('.hero');
    var qx = $$('.float-card').map(function (f) { return gsap.quickTo(f, 'xPercent', { duration: .9, ease: 'power3' }); });
    heroEl.addEventListener('mousemove', function (e) {
      var x = e.clientX / innerWidth - .5;
      $$('.float-card').forEach(function (f, i) { qx[i](x * 30 * +f.dataset.depth); });
    });
  }

  /* ---------- marquee with scroll velocity ---------- */
  $$('.marquee').forEach(function (m) {
    var tr = $('.marquee__track', m);
    tr.innerHTML += tr.innerHTML;
    var dir = +m.dataset.dir, x = 0, w = 0;
    function measure() { w = tr.scrollWidth / 2; }
    measure(); window.addEventListener('resize', measure);
    gsap.ticker.add(function () {
      var v = Math.min(Math.abs(lenis.velocity || 0), 60);
      x += dir * (0.6 + v * 0.35);
      if (x <= -w) x += w; if (x > 0) x -= w;
      tr.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  });

  /* ---------- vertical works: появление + подсказка ползунком ---------- */
  gsap.from('.work', { y: 80, opacity: 0, rotate: 3, ease: 'power3.out', duration: 1, stagger: .07, scrollTrigger: { trigger: '.works__viewport', start: 'top 85%' } });
  gsap.from('.slider', { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.slider', start: 'top 95%' } });
  ScrollTrigger.create({ trigger: '.slider', start: 'top 85%', once: true, onEnter: function () {
    var o = { k: 0 }, m = maxScroll();
    gsap.timeline({ delay: .5 })
      .to(o, { k: .35, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { vp.scrollLeft = o.k * m; } })
      .to(o, { k: 0, duration: 1, ease: 'power2.inOut', onUpdate: function () { vp.scrollLeft = o.k * m; } });
  } });
  /* боковые надписи «листайте вниз» — только в начале сайта */
  gsap.from('.works__head .h2', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.works', start: 'top 75%' } });

  /* ---------- wide works ---------- */
  $$('.wide-item').forEach(function (it) {
    var media = $('.wide-item__media', it);
    gsap.fromTo(media, { clipPath: 'inset(12% 12% 12% 12% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none', scrollTrigger: { trigger: it, start: 'top 90%', end: 'top 35%', scrub: true } });
    gsap.fromTo($$('img, video', media), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.wide-item__text > *', it), { y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 70%' } });
  });

  gsap.fromTo('.i360__media', { clipPath: 'inset(10% 10% 10% 10% round 28px)', rotate: -3 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', rotate: 0, ease: 'none', scrollTrigger: { trigger: '.i360', start: 'top 85%', end: 'top 30%', scrub: true } });
  gsap.from('.i360__text > *', { y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.i360', start: 'top 70%' } });
  gsap.from('.pay__card', { y: 60, opacity: 0, rotate: 2, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.pay__grid', start: 'top 85%' } });
  gsap.from('.other__card', { y: 50, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.other', start: 'top 88%' } });

  /* ---------- section heads ---------- */
  $$('.section-head .h2').forEach(function (h) {
    if (h.closest('.works')) return;
    gsap.from(h, { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* ---------- styles rows ---------- */


  /* ---------- honey drip into price ---------- */
  var drip = $('.drip-path');
  var drops = [[70, 50, .7], [170, 60, 1], [310, 70, .55], [450, 55, .85], [610, 80, .6], [760, 60, 1], [940, 75, .5], [1070, 55, .8], [1240, 70, .65], [1350, 50, .95]];
  function dripPath(t) {
    // t: 0 = flat top band, 1 = full drops
    var base = 30 + 50 * t, d = 'M0,0 H1440 V' + base.toFixed(1);
    var pts = drops.slice().reverse();
    var x = 1440;
    pts.forEach(function (p) {
      var cx = p[0], hw = p[1] / 2, len = base + 150 * t * p[2];
      d += ' L' + (cx + hw * 2) + ',' + base.toFixed(1) +
        ' C' + (cx + hw) + ',' + base.toFixed(1) + ' ' + (cx + hw) + ',' + len.toFixed(1) + ' ' + cx + ',' + len.toFixed(1) +
        ' C' + (cx - hw) + ',' + len.toFixed(1) + ' ' + (cx - hw) + ',' + base.toFixed(1) + ' ' + (cx - hw * 2) + ',' + base.toFixed(1);
      x = cx - hw * 2;
    });
    return d + ' L0,' + base.toFixed(1) + ' Z';
  }
  drip.setAttribute('d', dripPath(0));
  var dp = { t: 0 };
  gsap.to(dp, { t: 1, ease: 'none', scrollTrigger: { trigger: '.price', start: 'top 95%', end: 'top 10%', scrub: .5 }, onUpdate: function () { drip.setAttribute('d', dripPath(dp.t)); } });
  gsap.from('.calc', { y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.calc', start: 'top 85%' } });
  gsap.from('.ptable', { y: 60, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.price__tables', start: 'top 85%' } });
  gsap.from('.gift', { scale: .92, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.gift', start: 'top 88%' } });

  /* ---------- process stacking ---------- */
  var stepEls = $$('.step');
  stepEls.forEach(function (s, i) {
    if (i === stepEls.length - 1) return;
    gsap.to(s, {
      scale: .9 + i * .012, '--dim': .55, ease: 'none',
      scrollTrigger: { trigger: stepEls[i + 1], start: 'top 55%', end: 'top ' + (90 + (i + 1) * 18) + 'px', scrub: true }
    });
  });

  /* ---------- about poses (hard cut, без дрожания) ---------- */
  function setPose(n) {
    $$('.pose').forEach(function (p) { p.classList.toggle('is-on', +p.dataset.pose === n); });
  }
  $$('.about__chunk').forEach(function (ch) {
    ScrollTrigger.create({
      trigger: ch, start: 'top 60%', end: 'bottom 40%',
      onToggle: function (st) { ch.classList.toggle('is-active', st.isActive); if (st.isActive) setPose(+ch.dataset.pose); }
    });
  });

  /* ---------- reviews ---------- */
  mm2.add('(min-width: 900px)', function () {
    $$('.reviews__col').forEach(function (c, i) {
      if (i !== 1) return; gsap.fromTo(c, { y: 70 }, { y: -50, ease: 'none', scrollTrigger: { trigger: '.reviews', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  gsap.from('.review, .voice', { y: 50, opacity: 0, stagger: .06, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.reviews', start: 'top 70%' } });

  $$('.result b').forEach(function (el) {
    var to = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () {
      gsap.to(o, { v: to, duration: 2, ease: 'power2.out', onUpdate: function () { el.textContent = big(o.v >= to ? to : Math.round(o.v / 100) * 100); } });
    } });
  });
  gsap.from('.clients li', { y: 30, opacity: 0, stagger: .07, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.clients', start: 'top 85%' } });

  /* ---------- contact ---------- */
  gsap.from('.contact__title .ch', { yPercent: 100, opacity: 0, stagger: .015, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
  gsap.from('.qr', { rotate: -12, y: 80, opacity: 0, duration: 1.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.contact__row', start: 'top 85%' } });
  gsap.from('.contact__avatar', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.contact__avatar', start: 'top 95%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
