/* ─────────────────────────────────────────────
   Clearlyst — script.js
───────────────────────────────────────────── */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


// ── Nav ───────────────────────────────────────
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setMenu(open) {
  navMobile.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
  const [a, b, c] = navToggle.querySelectorAll('span');
  a.style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
  b.style.opacity   = open ? '0' : '';
  c.style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
}

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => setMenu(!navMobile.classList.contains('open')));
  navMobile.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = (nav ? nav.offsetHeight : 0) + 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});


// ── Text decode effect ────────────────────────
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

function scramble(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.nodeValue });
  const total = nodes.reduce((n, t) => n + t.text.length, 0);
  const duration = 900;
  const start = performance.now();

  const frame = now => {
    const progress = Math.min((now - start) / duration, 1);
    let revealed = Math.floor(total * progress);
    nodes.forEach(({ node, text }) => {
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (revealed > 0 || ch === ' ') out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        revealed--;
      }
      node.nodeValue = out;
    });
    if (progress < 1) requestAnimationFrame(frame);
    else nodes.forEach(({ node, text }) => { node.nodeValue = text; });
  };
  requestAnimationFrame(frame);
}


// ── Scroll reveal (with sibling stagger) ──────
document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('in-view');
    if (!reduceMotion) {
      const targets = el.matches('[data-scramble]') ? [el] : el.querySelectorAll('[data-scramble]');
      targets.forEach(scramble);
    }
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── Counters ──────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
  const duration = 1600;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));


// ── Card spotlight ────────────────────────────
if (finePointer) {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest('.glass');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}


// ── Hero audit console ────────────────────────
const consoleEl     = document.getElementById('auditConsole');
const consoleBody   = document.getElementById('consoleBody');
const consoleStatus = document.getElementById('consoleStatus');

if (consoleEl && consoleBody) {
  const steps = [
    { text: 'mapping customer journey',   status: 'done',            cls: 'ok' },
    { text: 'auditing lead flow',         status: 'leak found',      cls: 'warn' },
    { text: 'reviewing sales follow-up',  status: 'gap found',       cls: 'warn' },
    { text: 'scanning operations',        status: 'manual work',     cls: 'warn' },
    { text: 'checking capacity',          status: 'ok',              cls: 'ok' },
    { text: 'bottlenecks identified',     status: '3',               cls: 'info' },
    { text: 'fix + automation plan',      status: 'ready',           cls: 'ok' },
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const makeLine = step => {
    const line = document.createElement('div');
    line.className = 'c-line';
    line.innerHTML = '<span class="c-prompt">›</span><span class="c-text"></span><span class="c-fill"></span><span class="c-status"></span>';
    line.querySelector('.c-text').textContent = step.text;
    const status = line.querySelector('.c-status');
    status.textContent = step.status;
    status.classList.add(step.cls);
    return line;
  };

  const renderStatic = () => {
    steps.forEach(s => consoleBody.appendChild(makeLine(s)));
    consoleEl.classList.add('is-scaled');
    consoleStatus.textContent = 'scale-ready';
  };

  const run = async () => {
    while (true) {
      consoleBody.innerHTML = '';
      consoleEl.classList.remove('is-scaled');
      consoleStatus.textContent = 'auditing…';
      await wait(500);

      for (const step of steps) {
        const line = makeLine(step);
        const textEl = line.querySelector('.c-text');
        const statusEl = line.querySelector('.c-status');
        const caret = document.createElement('span');
        caret.className = 'c-caret';
        textEl.textContent = '';
        statusEl.style.visibility = 'hidden';
        line.querySelector('.c-fill').style.visibility = 'hidden';
        textEl.after(caret);
        consoleBody.appendChild(line);

        for (let i = 1; i <= step.text.length; i++) {
          textEl.textContent = step.text.slice(0, i);
          await wait(22);
        }
        await wait(260);
        caret.remove();
        line.querySelector('.c-fill').style.visibility = '';
        statusEl.style.visibility = '';
        await wait(240);
      }

      consoleStatus.textContent = 'scaling ↑';
      consoleEl.classList.add('is-scaled');
      await wait(5200);
    }
  };

  if (reduceMotion) renderStatic();
  else run();
}


// ── Network background (nodes drift upward = growth) ──
const canvas = document.getElementById('bgNet');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const pointer = { x: -9999, y: -9999 };
  let w = 0, h = 0, dpr = 1, nodes = [], rafId = null;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (w * h) / 22000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.08 + Math.random() * 0.22),
      r: 0.8 + Math.random() * 1.6,
      hot: Math.random() < 0.18,
    }));
  };

  const LINK = 140;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.y < -20) { n.y = h + 20; n.x = Math.random() * w; }
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const alpha = (1 - Math.sqrt(d2) / LINK) * 0.22;
        ctx.strokeStyle = (a.hot || b.hot) ? `rgba(74,222,128,${alpha})` : `rgba(34,211,238,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const pdx = a.x - pointer.x, pdy = a.y - pointer.y;
      const pd = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pd < 180) {
        ctx.strokeStyle = `rgba(34,211,238,${(1 - pd / 180) * 0.45})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.hot ? 'rgba(74,222,128,0.9)' : 'rgba(34,211,238,0.7)';
      if (n.hot) { ctx.shadowColor = 'rgba(74,222,128,0.9)'; ctx.shadowBlur = 10; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafId = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduceMotion) {
    draw();
    cancelAnimationFrame(rafId);
  } else {
    if (finePointer) {
      window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
      document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(draw);
    });
    rafId = requestAnimationFrame(draw);
  }
}


// ── Contact form (FormSubmit AJAX) ────────────
const form = document.getElementById('contactForm');

if (form) {
  const submitBtn   = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const btnText     = submitBtn.querySelector('.btn-text');
  const btnLoading  = submitBtn.querySelector('.btn-loading');

  const markInvalid = field => {
    field.style.borderColor = 'rgba(248,113,113,0.8)';
    field.style.boxShadow   = '0 0 0 3px rgba(248,113,113,0.15)';
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) { markInvalid(field); valid = false; }
    });

    if (!valid) {
      form.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
        { duration: 400, easing: 'ease-out' }
      );
      return;
    }

    const data = {
      name:     form.name.value.trim(),
      business: form.business.value.trim(),
      industry: form.industry.value,
      revenue:  form.revenue.value || 'Not specified',
      phone:    form.phone.value.trim(),
      email:    form.email.value.trim(),
      bottleneck: form.message.value.trim() || 'Not provided',
    };

    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled       = true;

    try {
      const response = await fetch('https://formsubmit.co/ajax/Clearlyst@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject:  'New Growth Audit Request — Clearlyst Website',
          _template: 'table',
          _captcha:  'false',
          ...data,
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');

      form.style.display        = 'none';
      formSuccess.style.display = 'flex';
      formSuccess.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 600, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' }
      );
    } catch {
      btnText.style.display    = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled       = false;

      let errEl = form.querySelector('.form-error-msg');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error-msg';
        errEl.style.cssText = 'color:rgba(248,113,113,0.95);margin-top:12px;font-size:0.9rem;text-align:center;';
        submitBtn.insertAdjacentElement('afterend', errEl);
      }
      errEl.textContent = 'Submission failed — please email us directly at Clearlyst@gmail.com';
    }
  });

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    });
  });
}
