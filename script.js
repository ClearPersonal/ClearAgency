/* ─────────────────────────────────────────────
   Clearlyst — script.js
───────────────────────────────────────────── */

// ── Nav: glass on scroll ──────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });


// ── Mobile nav toggle ─────────────────────────
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  // Animate hamburger to X
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity  = '';
    spans[2].style.transform = '';
  });
});


// ── Smooth scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ── Scroll Reveal ─────────────────────────────
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── Counter Animation ─────────────────────────
function animateCounter(el) {
  const raw    = el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const target = parseFloat(raw);
  const isDecimal = el.dataset.decimal === 'true';
  const duration = 1600;
  const startTime = performance.now();

  const update = (now) => {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;

    el.textContent = isDecimal
      ? current.toFixed(1) + suffix
      : Math.floor(current) + suffix;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
  };

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));


// ── Contact Form — FormSubmit AJAX ────────────
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

const btnText    = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = 'rgba(255,80,80,0.7)';
      field.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.12)';
      valid = false;
    }
  });

  if (!valid) {
    // Shake the form slightly
    form.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 420, easing: 'ease-out' }
    );
    return;
  }

  // Gather form data
  const data = {
    name:     form.name.value.trim(),
    business: form.business.value.trim(),
    industry: form.industry.value,
    phone:    form.phone.value.trim(),
    email:    form.email.value.trim(),
    budget:   form.budget.value || 'Not specified',
    message:  form.message.value.trim() || 'No message provided',
  };

  // Loading state
  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled       = true;

  try {
    const response = await fetch('https://formsubmit.co/ajax/Clearlyst@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject:  'New Lead from Clearlyst Website',
        _template: 'table',
        ...data,
      }),
    });

    if (response.ok) {
      // Success
      form.style.display        = 'none';
      formSuccess.style.display = 'flex';

      // Animate success in
      formSuccess.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 600, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' }
      );
    } else {
      throw new Error('Network response was not ok');
    }
  } catch {
    // Fallback: show error and restore button
    btnText.style.display    = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled       = false;

    // Attempt mailto fallback
    const subject = encodeURIComponent('New Lead from Clearlyst Website');
    const body = encodeURIComponent(
      `Name: ${data.name}\nBusiness: ${data.business}\nIndustry: ${data.industry}\nPhone: ${data.phone}\nEmail: ${data.email}\nBudget: ${data.budget}\nMessage: ${data.message}`
    );
    window.location.href = `mailto:Clearlyst@gmail.com?subject=${subject}&body=${body}`;
  }
});

// Clear field error style on input
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
  });
});


// ── Proof of Work — Video Row Arrows ─────────
(function () {
  const scroll  = document.getElementById('workVideos');
  const prevBtn = document.getElementById('vidPrev');
  const nextBtn = document.getElementById('vidNext');
  if (!scroll || !prevBtn || !nextBtn) return;

  function getSlideWidth() {
    const item = scroll.querySelector('.work-video-item');
    if (!item) return scroll.clientWidth * 0.72;
    const gap = parseInt(getComputedStyle(scroll).gap) || 16;
    return item.offsetWidth + gap;
  }

  prevBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    scroll.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
  });

  // Prevent the touch from triggering vertical page scroll on the video row
  scroll.addEventListener('touchmove', e => {
    e.stopPropagation();
  }, { passive: true });
})();


// ── Subtle cursor glow ────────────────────────
// Only on non-touch devices
if (window.matchMedia('(hover: hover)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(91,164,255,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 1;
    transition: opacity 0.5s;
    will-change: transform;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  const animateGlow = () => {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animateGlow);
  };
  animateGlow();
}
