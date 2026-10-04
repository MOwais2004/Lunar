(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- starfield (reused for hero + final CTA) ---------- */
  function starfield(canvas){
    var ctx = canvas.getContext('2d');
    var stars = [], bright = [], w = 0, h = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mx = 0, my = 0, tx = 0, ty = 0;

    function build(){
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round((w * h) / 5200);
      stars = [];
      for (var i = 0; i < count; i++){
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.1 + 0.25,
          a: Math.random() * 0.55 + 0.20,
          sp: Math.random() * 1.6 + 0.4,
          ph: Math.random() * Math.PI * 2,
          d: Math.random() * 0.75 + 0.25
        });
      }
      bright = [];
      for (var j = 0; j < Math.round(count / 26); j++){
        bright.push({
          x: Math.random() * w, y: Math.random() * h * 0.72,
          r: Math.random() * 1.1 + 1.0,
          ph: Math.random() * Math.PI * 2,
          d: Math.random() * 0.6 + 0.4
        });
      }
    }

    // don't burn frames drawing a starfield that's scrolled out of view
    var onscreen = true;
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(e){ onscreen = e[0].isIntersecting; }).observe(canvas);
    }

    function draw(t){
      if (!onscreen){ requestAnimationFrame(draw); return; }
      if (w && h){
        ctx.clearRect(0, 0, w, h);
        tx += (mx - tx) * 0.05;
        ty += (my - ty) * 0.05;

        for (var i = 0; i < stars.length; i++){
          var s = stars[i];
          var tw = reduce ? 1 : 0.62 + 0.38 * Math.sin(t * 0.0011 * s.sp + s.ph);
          ctx.globalAlpha = s.a * tw;
          ctx.fillStyle = '#dfe9ff';
          ctx.beginPath();
          ctx.arc(s.x + tx * s.d * 14, s.y + ty * s.d * 9, s.r, 0, 6.2832);
          ctx.fill();
        }
        for (var j = 0; j < bright.length; j++){
          var b = bright[j];
          var tw2 = reduce ? 1 : 0.5 + 0.5 * Math.sin(t * 0.0009 + b.ph);
          var bx = b.x + tx * b.d * 20, by = b.y + ty * b.d * 13;
          var len = b.r * 7 * tw2;
          ctx.globalAlpha = 0.55 * tw2;
          ctx.strokeStyle = 'rgba(210,228,255,.85)';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(bx - len, by); ctx.lineTo(bx + len, by);
          ctx.moveTo(bx, by - len); ctx.lineTo(bx, by + len);
          ctx.stroke();
          ctx.globalAlpha = 0.9 * tw2;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(bx, by, b.r * 0.62, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', build);
    window.addEventListener('pointermove', function(e){
      if (reduce) return;
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, {passive:true});

    build();
    requestAnimationFrame(draw);
  }

  var c1 = document.getElementById('stars');
  var c2 = document.getElementById('stars2');
  if (c1) starfield(c1);
  if (c2) starfield(c2);

  /* ---------- hero entrance, gated on the display font ---------- */
  // Only the display face changes the arc's metrics, so gate on that one
  // rather than fonts.ready, which waits for all six files.
  function load(){ document.body.classList.add('loaded'); remeasure(); }
  if (document.fonts && document.fonts.load){
    document.fonts.load('1em "Bagel Fat One"').then(load, load);
    setTimeout(load, 600);
  } else { load(); }

  /* ---------- number tick-up ---------- */
  function countUp(el){
    var raw = (el.dataset.final || el.textContent).trim();
    el.dataset.final = raw;
    var m = raw.match(/^([\d.]+)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1]);
    var suffix = m[2];
    var decimals = (m[1].split('.')[1] || '').length;
    var dur = 1500, t0 = performance.now();
    (function step(t){
      var k = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * e).toFixed(decimals) + suffix;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    })(t0);
  }

  /* ---------- scroll reveals ---------- */
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.classList.contains('stats')){
          en.target.querySelectorAll('.stat b').forEach(countUp);
        }
        io.unobserve(en.target);
      });
    }, {rootMargin:'0px 0px -12% 0px', threshold:0.12});
    items.forEach(function(el){ io.observe(el); });
  }

  /* ---------- cursor glow on cards ---------- */
  if (!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.step,.feat,.plan').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, {passive:true});
    });
  }

  /* ---------- hero parallax: planet, wordmark and copy at three rates ---------- */
  var hero       = document.querySelector('.hero');
  var planetWrap = document.getElementById('planetWrap');
  var orbitEl    = document.getElementById('orbit');
  var heroBody   = document.getElementById('heroBody');
  var finalSec   = document.querySelector('.final');
  var finalMoon  = document.querySelector('.final-moon');
  var sy = 0, pmx = 0, pmy = 0, tmx = 0, tmy = 0;

  window.addEventListener('scroll', function(){ sy = window.scrollY || 0; }, {passive:true});
  window.addEventListener('pointermove', function(e){
    pmx = (e.clientX / window.innerWidth  - 0.5) * 2;
    pmy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, {passive:true});

  // Geometry is cached instead of read per frame. offsetHeight and
  // getBoundingClientRect both force synchronous layout, and this loop ran
  // them on every single frame.
  var heroH = 1, finalTop = 0, finalH = 0, vh = window.innerHeight;
  function remeasure(){
    if (!hero) return;              // load() can fire before these are assigned
    heroH = hero.offsetHeight || 1;
    vh = window.innerHeight;
    if (finalSec){ finalTop = finalSec.offsetTop; finalH = finalSec.offsetHeight; }
  }
  window.addEventListener('resize', remeasure);

  function motion(){
    tmx += (pmx - tmx) * 0.06;
    tmy += (pmy - tmy) * 0.06;

    if (sy < heroH * 1.25){
      // planet drifts slowest, the word a touch faster, the copy fastest
      planetWrap.style.transform = 'translate(calc(-50% + ' + (tmx * 8).toFixed(2) + 'px), ' + (sy * 0.20 + tmy * 8).toFixed(2) + 'px)';
      orbitEl.style.transform    = 'translate(calc(-50% + ' + (tmx * 15).toFixed(2) + 'px), ' + (sy * 0.06 + tmy * 13).toFixed(2) + 'px)';
      heroBody.style.transform   = 'translateY(' + (sy * 0.30).toFixed(2) + 'px)';
      heroBody.style.opacity     = Math.max(0, 1 - sy / (heroH * 0.55)).toFixed(3);
    }

    if (finalMoon){
      var top = finalTop - sy;
      if (top < vh && top + finalH > 0){
        var prog = 1 - top / vh;
        finalMoon.style.transform = 'translate(calc(-50% + ' + (tmx * 6).toFixed(2) + 'px), ' + (-prog * 44).toFixed(2) + 'px)';
      }
    }
    requestAnimationFrame(motion);
  }
  if (!reduce) requestAnimationFrame(motion);

  /* ---------- nav background on scroll ---------- */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      nav.classList.toggle('stuck', window.scrollY > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
