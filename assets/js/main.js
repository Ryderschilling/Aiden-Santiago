/* Aiden Santiago | Compass, mockup by Ryder Schilling */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header scroll state ---------- */
  var header = $('.header');
  if (header && header.classList.contains('header--hero')) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Retract the handed-off menu circle ---------- */
  var docEl = document.documentElement;
  if (docEl.classList.contains('menu-retract')) {
    var release = function () {
      docEl.style.overflow = '';
      docEl.classList.remove('menu-retract');
      /* keep --mx/--my/--mr on :root: they are the circle's origin for the
         shrink that is about to run, and inline vars on .menu override them
         next time it opens. */
    };
    if (reduced) {
      release();
    } else {
      /* two frames: let the new page paint under the sheet first */
      requestAnimationFrame(function () { requestAnimationFrame(release); });
      setTimeout(release, 900); /* backstop if frames are throttled */
    }
  }

  /* ---------- Full-screen menu ---------- */
  var menuBtn = $('.menu-btn'), menu = $('#drawer');
  if (menuBtn && menu) {
    var menuNav = $('.menu__nav', menu);
    var menuLinks = $$('a', menuNav);
    var menuImgs = $$('.menu__bg img', menu);

    /* split each label into letters so they can lift in sequence */
    menuLinks.forEach(function (a) {
      var text = (a.textContent || '').trim();
      a.setAttribute('aria-label', text);
      var wrap = document.createElement('span');
      wrap.className = 'menu__t';
      wrap.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (ch, i) {
        var l = document.createElement('span');
        l.className = 'ltr';
        l.textContent = ch === ' ' ? ' ' : ch;
        l.style.transitionDelay = (i * 22) + 'ms';
        wrap.appendChild(l);
      });
      a.textContent = '';
      a.appendChild(wrap);
    });

    var showImg = function (key) {
      menuImgs.forEach(function (im) {
        im.classList.toggle('on', !!key && im.getAttribute('data-menu-img') === key);
      });
    };
    menuLinks.forEach(function (a) {
      var key = a.getAttribute('data-img');
      a.addEventListener('mouseenter', function () { showImg(key); });
      a.addEventListener('focus', function () { showImg(key); });
    });
    menuNav.addEventListener('mouseleave', function () { showImg(null); });

    menu.setAttribute('inert', '');

    var setMenu = function (open) {
      if (open) {
        /* the circle grows out of the hamburger itself */
        var r = menuBtn.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var far = Math.sqrt(Math.pow(Math.max(x, window.innerWidth - x), 2) +
                            Math.pow(Math.max(y, window.innerHeight - y), 2));
        menu.style.setProperty('--mx', x.toFixed(1) + 'px');
        menu.style.setProperty('--my', y.toFixed(1) + 'px');
        menu.style.setProperty('--mr', Math.ceil(far * 1.14 + 24) + 'px');
      }
      menuBtn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      menu.classList.remove('is-leaving'); /* a navigation that never happened */
      if (header) header.classList.toggle('is-menu', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.removeAttribute('inert');
        menu.focus({ preventScroll: true });
      } else {
        menu.setAttribute('inert', '');
        showImg(null);
        menuBtn.focus();
      }
    };

    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    /* clicking a nav link: let the page load underneath, then the NEXT page
       retracts this same circle back into the hamburger. */
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { setMenu(false); return; }
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { setMenu(false); return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) { setMenu(false); return; }
      try {
        sessionStorage.setItem('as-menu-open', JSON.stringify({
          x: menu.style.getPropertyValue('--mx'),
          y: menu.style.getPropertyValue('--my'),
          r: menu.style.getPropertyValue('--mr')
        }));
      } catch (err) {}
      menu.classList.add('is-leaving');
    });

    /* coming back via bfcache must not restore a half-open menu */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      menu.classList.remove('is-leaving');
      setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (menuBtn.getAttribute('aria-expanded') === 'true') setMenu(true);
    });
  }

  /* ---------- Reveals ---------- */
  var RV = '.sec-head > *, .about-split__body > *, .about-split__media, .pcard, .nbgrid .nbcard, .area-grid .nbcard, .trio a, .pillar, .statrow .s, .steps li, .form, .contact-info > *, .footer .fsoc a, .cta__body > *, .valband__body > *, .news > *, .calc > *, .rstat, .record__live, .record__in > .kicker, .record__in > h2';
  if (!reduced && 'IntersectionObserver' in window) {
    $$(RV).forEach(function (el) {
      if (getComputedStyle(el).position === 'sticky') return;
      el.setAttribute('data-rv', '');
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    $$('[data-rv]').forEach(function (el) { io.observe(el); });
    document.addEventListener('focusin', function (e) {
      var t = e.target.closest('[data-rv]'); if (t) t.classList.add('in');
    });
  }

  /* ---------- Neighborhood rail: scroll drives it sideways ---------- */
  var nbrun = $('[data-nbrun]');
  if (nbrun) {
    var nbTrack = $('.nbrun__track', nbrun);
    var nbRail = $('[data-nbrail]', nbrun);
    var nbProg = $('[data-nbprog] > span', nbrun);
    var nbItems = $$('.nbcard, .nbrail__end', nbRail);
    var nbMQ = window.matchMedia('(min-width: 941px) and (pointer: fine)');
    var nbMax = 0, nbTick = false;

    var nbPaint = function () {
      if (!nbMax) return;
      var r = nbTrack.getBoundingClientRect();
      var span = r.height - window.innerHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      nbRail.style.transform = 'translate3d(' + (-p * nbMax).toFixed(2) + 'px,0,0)';
      if (nbProg) nbProg.style.width = (p * 100).toFixed(2) + '%';
    };

    var nbMeasure = function () {
      if (reduced || !nbMQ.matches) {
        nbrun.classList.remove('is-pinned');
        nbTrack.style.height = '';
        nbRail.style.transform = '';
        if (nbProg) nbProg.style.width = '';
        nbMax = 0;
        return;
      }
      nbrun.classList.add('is-pinned');
      nbRail.style.transform = 'none';
      var pad = parseFloat(getComputedStyle(nbRail).paddingLeft) || 0;
      nbMax = Math.max(0, nbRail.scrollWidth - window.innerWidth + pad);
      nbTrack.style.height = (window.innerHeight + nbMax) + 'px';
      nbPaint();
    };

    window.addEventListener('scroll', function () {
      if (nbTick) return;
      nbTick = true;
      requestAnimationFrame(function () { nbPaint(); nbTick = false; });
    }, { passive: true });

    var nbResize;
    window.addEventListener('resize', function () {
      clearTimeout(nbResize);
      nbResize = setTimeout(nbMeasure, 120);
    });
    window.addEventListener('load', nbMeasure);
    if (nbMQ.addEventListener) nbMQ.addEventListener('change', nbMeasure);
    nbMeasure();

    /* lazy images sit far off to the right in layout terms, so the browser
       never preloads them. Wake them up one viewport early. */
    if ('IntersectionObserver' in window) {
      var nbPre = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        $$('img[loading="lazy"]', nbRail).forEach(function (im) { im.loading = 'eager'; });
        nbPre.disconnect();
      }, { rootMargin: '150% 0px' });
      nbPre.observe(nbrun);
    }

    /* keyboard: pull the focused card into view */
    nbRail.addEventListener('focusin', function (e) {
      if (!nbMax) return;
      var card = e.target.closest('.nbcard, .nbrail__end');
      if (!card) return;
      var i = nbItems.indexOf(card);
      var last = nbItems.length - 1;
      var p = last > 0 ? i / last : 0;
      var docTop = nbTrack.getBoundingClientRect().top + window.pageYOffset;
      var top = docTop + p * (nbTrack.offsetHeight - window.innerHeight);
      window.scrollTo(0, Math.max(0, Math.round(top)));
    });
  }

  /* ---------- Video pause (SC 2.2.2) ---------- */
  $$('[data-video-pause]').forEach(function (btn) {
    var vid = document.getElementById(btn.getAttribute('data-video-pause'));
    if (!vid) return;
    var render = function (playing) {
      btn.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
      $('.i-pause', btn).style.display = playing ? '' : 'none';
      $('.i-play', btn).style.display = playing ? 'none' : '';
    };
    btn.addEventListener('click', function () {
      if (vid.paused) { vid.play(); render(true); } else { vid.pause(); render(false); }
    });
    if (reduced) { vid.pause(); vid.removeAttribute('autoplay'); render(false); } else { render(!vid.paused); }
  });

  /* ---------- Hero search: hash, because static hosts eat query strings ---------- */
  $$('form[data-hash-search]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = form.querySelector('input').value.trim();
      window.location.href = '/search/' + (v ? '#q=' + encodeURIComponent(v) : '');
    });
  });

  /* ---------- Search page ---------- */
  var results = $('#results');
  if (results) {
    var data = JSON.parse($('#listings').textContent);
    var input = $('#q'), rcount = $('#rcount'), empty = $('#empty');
    var status = 'all';

    var money = function (n) { return '$' + n.toLocaleString('en-US'); };
    var specs = function (p) {
      var b = [];
      if (p.bd) b.push(p.bd + ' BD');
      if (p.ba) b.push(p.ba + ' BA');
      if (p.sqft) b.push(p.sqft + ' Sq Ft');
      if (!b.length) b.push('Land');
      return b.join(' &nbsp;|&nbsp; ');
    };

    var render = function () {
      var q = (input.value || '').trim().toLowerCase();
      var out = data.filter(function (p) {
        var okS = status === 'all' || p.status === status;
        var okQ = !q || (p.name + ' ' + p.addr + ' ' + p.city).toLowerCase().indexOf(q) > -1;
        return okS && okQ;
      });
      results.innerHTML = out.map(function (p) {
        return '<article class="pcard">' +
          '<div class="pcard__media">' +
          '<img src="/' + p.photo + '" alt="' + p.name + ', ' + p.city + '" loading="lazy" width="1400" height="933">' +
          '<span class="pcard__status">' + p.status + '</span></div>' +
          '<div class="pcard__body">' +
          '<h2 class="pcard__name">' + p.name + '</h2>' +
          '<p class="pcard__addr">' + p.addr + '</p>' +
          '<p class="pcard__specs">' + specs(p) + '</p>' +
          '<p class="pcard__price">' + money(p.price) + '</p>' +
          '</div></article>';
      }).join('');
      rcount.textContent = out.length + (out.length === 1 ? ' property' : ' properties');
      empty.hidden = out.length !== 0;
    };

    var readHash = function () {
      var m = /(?:^|&)q=([^&]*)/.exec(window.location.hash.replace(/^#/, ''));
      if (m) input.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
    };

    input.addEventListener('input', render);
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        status = b.getAttribute('data-filter');
        $$('.filters button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        render();
      });
    });
    window.addEventListener('hashchange', function () { readHash(); render(); });
    readHash();
    render();
  }

  /* ---------- Mortgage calculator ---------- */
  var cf = $('#calc-form');
  if (cf) {
    var ids = ['c-price', 'c-down', 'c-term', 'c-rate', 'c-tax', 'c-ins', 'c-hoa'];
    var defaults = {};
    ids.forEach(function (i) { defaults[i] = document.getElementById(i).value; });
    var usd = function (n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    };
    var calc = function () {
      var num = function (i) { return parseFloat(document.getElementById(i).value) || 0; };
      var price = num('c-price'), down = num('c-down'), years = num('c-term');
      var rate = num('c-rate') / 100 / 12, n = years * 12;
      var principal = Math.max(price - down, 0);
      var pi = rate > 0 && n > 0
        ? principal * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
        : (n > 0 ? principal / n : 0);
      var tx = num('c-tax') / 12, ins = num('c-ins') / 12, hoa = num('c-hoa');
      var total = pi + tx + ins + hoa;
      $('#c-total').textContent = usd(total);
      $('#c-pi').textContent = usd(pi);
      $('#c-tx').textContent = usd(tx);
      $('#c-in').textContent = usd(ins);
      $('#c-ho').textContent = usd(hoa);
      var parts = [pi, tx, ins, hoa];
      parts.forEach(function (v, i) {
        document.getElementById('b' + (i + 1)).style.width = (total > 0 ? (v / total) * 100 : 0) + '%';
      });
    };
    ids.forEach(function (i) {
      document.getElementById(i).addEventListener('input', calc);
      document.getElementById(i).addEventListener('change', calc);
    });
    $('#c-reset').addEventListener('click', function () {
      ids.forEach(function (i) { document.getElementById(i).value = defaults[i]; });
      calc();
    });
    calc();
  }

  /* ---------- Forms to mailto ---------- */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = form.getAttribute('data-mailto');
      var subject = form.getAttribute('data-subject') || 'Website inquiry';
      var lines = [];
      $$('input, select, textarea', form).forEach(function (f) {
        if (!f.name || f.type === 'submit' || !f.value) return;
        var lab = form.querySelector('label[for="' + f.id + '"]');
        lines.push((lab ? lab.textContent.trim() : f.name) + ': ' + f.value);
      });
      lines.push('', 'Sent from the Aiden Santiago website');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      var ok = $('.form__ok', form);
      if (ok) { ok.hidden = false; ok.focus(); }
    });
  });

  /* ---------- Footer: area list paints the coast behind it ---------- */
  var scene = $('.footer__scene');
  if (scene) {
    var frames = {};
    $$('img', scene).forEach(function (im) { frames[im.getAttribute('data-area')] = im; });
    var active = null;
    var show = function (name) {
      if (active === name) return;
      if (active && frames[active]) frames[active].classList.remove('on');
      active = name;
      if (name && frames[name]) frames[name].classList.add('on');
    };
    $$('.flink[data-area]').forEach(function (a) {
      var n = a.getAttribute('data-area');
      a.addEventListener('mouseenter', function () { show(n); });
      a.addEventListener('focus', function () { show(n); });
      a.addEventListener('mouseleave', function () { show(null); });
      a.addEventListener('blur', function () { show(null); });
    });
  }

  /* ---------- Footer wordmark reveal ---------- */
  var wordmark = $('.wordmark');
  if (wordmark) {
    if (reduced || !('IntersectionObserver' in window)) {
      wordmark.classList.add('in');
    } else {
      var wio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); wio.unobserve(e.target); } });
      }, { threshold: 0.25 });
      wio.observe(wordmark);
    }
  }

  /* ---------- Live time on the coast ---------- */
  var ct = $('[data-coast-time]');
  if (ct) {
    var tick = function () {
      var t = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit'
      });
      ct.textContent = t + ' on 30A';
    };
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- Count-up stats (the record band) ---------- */
  var numFmt = {
    int:  function (v) { return String(Math.round(v)); },
    usdM: function (v) { return '$' + (v / 1e6).toFixed(1) + 'M'; },
    usdK: function (v) { return '$' + Math.round(v / 1e3) + 'K'; }
  };
  var counters = $$('[data-count]');
  if (counters.length) {
    var runCount = function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var f = numFmt[el.getAttribute('data-fmt')] || numFmt.int;
      if (reduced || !isFinite(end)) { el.textContent = f(end || 0); return; }
      var dur = 1500, t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        el.textContent = f(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.55 });
      counters.forEach(function (el) { cio.observe(el); });
    } else { counters.forEach(runCount); }
  }

  /* ---------- Live clock since the last closing ---------- */
  var since = $('[data-since]');
  if (since) {
    var sinceFrom = new Date(since.getAttribute('data-since')).getTime();
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var tickSince = function () {
      var ms = Date.now() - sinceFrom;
      if (!isFinite(ms) || ms < 0) { since.textContent = 'just now'; return; }
      var t = Math.floor(ms / 1000);
      since.textContent = Math.floor(t / 86400) + 'd ' + pad2(Math.floor(t % 86400 / 3600)) + 'h '
        + pad2(Math.floor(t % 3600 / 60)) + 'm ' + pad2(t % 60) + 's';
    };
    tickSince();
    setInterval(tickSince, 1000);
  }

  /* ---------- Window section: a framed video widens to full bleed ---------- */
  var win = $('[data-win]');
  if (win && !reduced) {
    var winTall = win.closest('.winsec').querySelector('.winsec__tall');
    var winBody = $('[data-win-body]');
    var winVid = $('video', win);
    var winEdges = $$('.winsec__edge', win.closest('.winsec'));
    var winTick = false;
    var winPaint = function () {
      var travel = winTall.offsetHeight - window.innerHeight;
      var p = travel > 0 ? Math.min(1, Math.max(0, -winTall.getBoundingClientRect().top / travel)) : 0;
      var e = Math.min(1, p / 0.8);
      var sx = (window.innerWidth < 760 ? 13 : 30) * (1 - e);
      var sy = 9 * (1 - e);
      win.style.clipPath = 'inset(' + sy.toFixed(2) + '% ' + sx.toFixed(2) + '% round ' + (2 - 2 * e).toFixed(1) + 'px)';
      var k = Math.min(1, Math.max(0, (p - 0.34) / 0.28));
      winEdges.forEach(function (n) { n.style.opacity = String(1 - Math.min(1, e * 1.6)); });
      winBody.style.opacity = String(k);
      winBody.style.transform = 'translateY(' + (26 - 26 * k).toFixed(1) + 'px)';
    };
    window.addEventListener('scroll', function () {
      if (winTick) return; winTick = true;
      requestAnimationFrame(function () { winPaint(); winTick = false; });
    }, { passive: true });
    window.addEventListener('resize', winPaint);
    winPaint();
    if ('IntersectionObserver' in window) {
      var wio2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) {
            if (winVid.preload !== 'auto') { winVid.preload = 'auto'; winVid.load(); }
            var pr = winVid.play(); if (pr && pr.catch) pr.catch(function () {});
          } else { winVid.pause(); }
        });
      }, { threshold: 0.05 });
      wio2.observe(win);
    }
  }

  /* ---------- Reels rail: exactly one card is live, by hover, focus or centre ---------- */
  var rail = $('[data-reels]');
  if (rail) {
    var rcards = $$('.rcard', rail);
    var rHover = null, rCentre = null, rVisible = true, rLive = null;
    var rStop = function (card) {
      if (!card) return;
      var v = $('video', card); if (v && !v.paused) v.pause();
    };
    var rStart = function (card) {
      var v = $('video', card); if (!v) return;
      if (!v.getAttribute('src') && v.getAttribute('data-src')) {
        v.setAttribute('src', v.getAttribute('data-src'));
        v.addEventListener('loadeddata', function () { v.classList.add('is-ready'); }, { once: true });
      }
      try { v.currentTime = 0; } catch (e) {}
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    };
    var rApply = function () {
      var live = (rVisible && !reduced) ? (rHover || rCentre) : null;
      rcards.forEach(function (c) { c.classList.toggle('is-live', c === (rHover || rCentre)); });
      if (live === rLive) return;
      rStop(rLive);
      rLive = live;
      if (live) rStart(live);
    };
    var rFindCentre = function () {
      var rr = rail.getBoundingClientRect(), mid = rr.left + rr.width / 2, best = null, bd = Infinity;
      rcards.forEach(function (c) {
        var cr = c.getBoundingClientRect();
        var d = Math.abs(cr.left + cr.width / 2 - mid);
        if (d < bd) { bd = d; best = c; }
      });
      rCentre = best; rApply();
    };
    var rTimer = null;
    rail.addEventListener('scroll', function () {
      clearTimeout(rTimer); rTimer = setTimeout(rFindCentre, 70);
    }, { passive: true });
    rcards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { rHover = c; rApply(); });
      c.addEventListener('mouseleave', function () { if (rHover === c) { rHover = null; rApply(); } });
      c.addEventListener('focus', function () {
        rHover = c; rApply();
        if (c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      c.addEventListener('blur', function () { if (rHover === c) { rHover = null; rApply(); } });
    });
    if ('IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { rVisible = e.isIntersecting; rApply(); });
      }, { threshold: 0.2 });
      rio.observe(rail);
    }
    rFindCentre();
    window.addEventListener('resize', rFindCentre);
  }

  /* ---------- Year ---------- */
  var y = $('[data-current-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
