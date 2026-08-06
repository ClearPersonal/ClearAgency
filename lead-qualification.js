/* ─────────────────────────────────────────────
   Clearlyst — lead-qualification.js
───────────────────────────────────────────── */

// ── Header: glass on scroll ───────────────────
const lqHeader = document.getElementById('lqHeader');
window.addEventListener('scroll', () => {
  lqHeader.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });


// ── Smooth scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = lqHeader.offsetHeight + 16;
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


// ── Qualification Form — FormSubmit AJAX ──────
const form        = document.getElementById('qualForm');
const submitBtn   = document.getElementById('lqSubmitBtn');
const formSuccess = document.getElementById('lqFormSuccess');
const btnText     = submitBtn.querySelector('.btn-text');
const btnLoading  = submitBtn.querySelector('.btn-loading');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Basic validation
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    if (field.type === 'checkbox' ? !field.checked : !field.value.trim()) {
      if (field.type === 'checkbox') {
        field.nextElementSibling.style.borderColor = 'rgba(255,80,80,0.7)';
      } else {
        field.style.borderColor = 'rgba(255,80,80,0.7)';
        field.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.12)';
      }
      valid = false;
    }
  });

  if (!valid) {
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

  const data = {
    name:                   form.name.value.trim(),
    business:               form.business.value.trim(),
    phone:                  form.phone.value.trim(),
    email:                  form.email.value.trim(),
    city:                   form.city.value.trim(),
    service:                form.service.value,
    volume:                 form.volume.value,
    budget:                 form.budget.value,
    pay_per_appointment:    form.pay_per_appointment.checked ? 'Yes' : 'No',
  };

  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled       = true;

  // Fire-and-forget: notify the WhatsApp Zap. Independent of FormSubmit
  // below, so a hiccup here never blocks the visitor's success state.
  fetch('https://hooks.zapier.com/hooks/catch/26520606/46zb1x2/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      lead_source: `${data.service} — ${data.city} — Budget: ${data.budget}`,
      link_to_lead_info: `tel:${data.phone}`,
    }),
  }).catch(() => {});

  try {
    const response = await fetch('https://formsubmit.co/ajax/Clearlyst@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject:  'New Lead Qualification Application — Clearlyst',
        _template: 'table',
        _captcha:  'false',
        ...data,
      }),
    });

    if (response.ok) {
      form.style.display        = 'none';
      formSuccess.style.display = 'flex';
      formSuccess.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 600, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' }
      );
    } else {
      throw new Error('Network response was not ok');
    }
  } catch {
    btnText.style.display    = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled       = false;

    let errEl = form.querySelector('.form-error-msg');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error-msg';
      errEl.style.cssText = 'color:rgba(255,100,100,0.9);margin-top:12px;font-size:0.9rem;text-align:center;';
      submitBtn.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = 'Submission failed — please email us directly at Clearlyst@gmail.com';
  }
});

form.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('input', () => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    if (field.type === 'checkbox' && field.nextElementSibling) {
      field.nextElementSibling.style.borderColor = '';
    }
  });
  field.addEventListener('change', () => {
    field.style.borderColor = '';
    if (field.type === 'checkbox' && field.nextElementSibling) {
      field.nextElementSibling.style.borderColor = '';
    }
  });
});


// ── Hero Video — autoplay muted, tap to unmute, fallback play button ──
(function () {
  const video   = document.getElementById('lqVideo');
  const playBtn = document.getElementById('lqPlayBtn');
  const muteBtn = document.getElementById('lqMuteBtn');
  if (!video || !playBtn || !muteBtn) return;

  // Autoplay is attempted via the `autoplay` attribute; this catches
  // browsers/in-app browsers (e.g. Facebook/Instagram) that block it
  // so the user always has a way to start playback.
  const attemptPlay = video.play();
  if (attemptPlay !== undefined) {
    attemptPlay.catch(() => playBtn.classList.remove('is-hidden'));
  }

  video.addEventListener('play',  () => playBtn.classList.add('is-hidden'));
  video.addEventListener('pause', () => playBtn.classList.remove('is-hidden'));

  playBtn.addEventListener('click', () => video.play());

  video.addEventListener('click', () => {
    if (video.paused) video.play();
    else video.pause();
  });

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteBtn.classList.toggle('is-unmuted', !video.muted);
    muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  });
})();


// ── Sticky Mobile CTA — hide once the form is visible ─
(function () {
  const stickyCta = document.getElementById('lqStickyCta');
  const formWrap  = document.getElementById('qualifyForm');
  if (!stickyCta || !formWrap) return;

  const ctaObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        stickyCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );
  ctaObserver.observe(formWrap);
})();
