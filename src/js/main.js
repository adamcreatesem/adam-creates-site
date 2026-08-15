/* ========================================
   ADAM CREATES — Main JavaScript
   ======================================== */

import {
  init3DMouseTracking,
  initHeroAtom,
  initSkillGlobe,
  initLiquidShapes,
  initBgParticles,
  dispose3DScenes
} from './three-effects.js';
import { initScrollWorld } from './scroll-world/index.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Initialize 3D Effects ──
  init3DMouseTracking();

  setTimeout(() => {
    initHeroAtom();
    initSkillGlobe();
    initLiquidShapes();
    initBgParticles();
  }, 300);

  // ── Initialize Scroll World (Horizon Landscape) ──
  // Delayed slightly to let the page settle, then start the terrain
  const destroyScrollWorld = initScrollWorld();

  // ---------- Navigation ----------
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const mobileBackdrop = document.getElementById('mobileBackdrop');

  function toggleMenu(open) {
    navToggle.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    if (mobileBackdrop) mobileBackdrop.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => {
    toggleMenu(!navLinks.classList.contains('active'));
  });

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => toggleMenu(false));
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // ---------- Navbar Scroll Effect ----------
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);
  });

  // ---------- Active Nav Link Highlighting ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function highlightNavLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNavLink);

  // ---------- Scroll Reveal Animation ----------
  function setupReveals() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }
  setupReveals();

  // ---------- Hero Text Morphing ----------
  function initHeroMorph() {
    const morphContainer = document.getElementById('heroMorphText');
    if (!morphContainer) return;

    const words = ['Web Development', 'Web Apps', 'Automation', 'Digital Tools', 'Your Vision'];
    let currentIndex = 0;
    let interval = null;

    function morphToNext() {
      const currentSpan = morphContainer.querySelector('.morph-in');
      if (!currentSpan) return;

      const nextIndex = (currentIndex + 1) % words.length;
      const nextWord = words[nextIndex];

      // Create outgoing element
      const outSpan = document.createElement('span');
      outSpan.className = 'morph-out';
      outSpan.textContent = currentSpan.textContent;
      outSpan.style.position = 'absolute';
      outSpan.style.left = '0';
      outSpan.style.top = '0';
      outSpan.style.whiteSpace = 'nowrap';

      // Create incoming element
      const inSpan = document.createElement('span');
      inSpan.className = 'morph-in';
      inSpan.textContent = nextWord;

      // Transition outgoing
      currentSpan.classList.remove('morph-in');
      currentSpan.classList.add('morph-out');
      currentSpan.style.position = 'absolute';
      currentSpan.style.left = '0';
      currentSpan.style.top = '0';

      morphContainer.appendChild(inSpan);

      // Clean up old after transition
      setTimeout(() => {
        const oldOut = morphContainer.querySelector('.morph-out');
        if (oldOut && oldOut !== inSpan) oldOut.remove();
      }, 400);

      currentIndex = nextIndex;
    }

    // Start cycling
    interval = setInterval(morphToNext, 2800);

    // Pause on hover
    morphContainer.addEventListener('mouseenter', () => clearInterval(interval));
    morphContainer.addEventListener('mouseleave', () => {
      interval = setInterval(morphToNext, 2800);
    });
  }
  initHeroMorph();

  // ---------- Scroll-Driven Background Shifts ----------
  function initScrollBackgrounds() {
    const sections = [
      { id: 'hero', light: '#FAF7F3', dark: '#161616' },
      { id: 'about', light: '#FFFFFF', dark: '#1A1A1A' },
      { id: 'services', light: '#FFFFFF', dark: '#1A1A1A' },
      { id: 'work', light: '#FAF7F3', dark: '#161616' },
      { id: 'process', light: '#FFFFFF', dark: '#1A1A1A' },
      { id: 'faq', light: '#F5F0EB', dark: '#121212' },
      { id: 'contact', light: '#F5F0EB', dark: '#121212' },
    ];

    const body = document.body;
    let currentBg = '';

    function updateBackground() {
      const scrollY = window.pageYOffset;
      const viewportH = window.innerHeight;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      let activeSection = sections[0];

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        if (center < viewportH && center > -rect.height) {
          activeSection = section;
        }
      }

      const newBg = isDark ? activeSection.dark : activeSection.light;
      if (newBg !== currentBg) {
        currentBg = newBg;
        body.style.background = newBg;
        // Also update navbar background when scrolled
        const navbar = document.getElementById('navbar');
        if (navbar && navbar.classList.contains('scrolled')) {
          navbar.style.background = newBg;
        }
      }
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateBackground();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Update on theme change
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const origListener = themeToggle.click;
      themeToggle.addEventListener('click', () => {
        setTimeout(updateBackground, 50);
      });
    }

    // Initial set
    setTimeout(updateBackground, 100);
  }
  initScrollBackgrounds();

  // ---------- Contact Form ----------
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span> <i class=\"fas fa-spinner fa-spin\"></i>';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        submitBtn.innerHTML = '<span>Sent! I\'ll be in touch soon</span> <i class=\"fas fa-check\"></i>';
        submitBtn.classList.add('state-success');
        setTimeout(() => {
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('state-success');
          submitBtn.disabled = false;
        }, 3000);
      })
      .catch(() => {
        submitBtn.innerHTML = '<span>Something went wrong. Please email me directly</span> <i class=\"fas fa-exclamation-triangle\"></i>';
        submitBtn.classList.add('state-error');
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('state-error');
          submitBtn.disabled = false;
        }, 4000);
      });
    });
  }

  // ---------- Back to Top ----------
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.pageYOffset > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = 70;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---------- Force reveal visible elements on load ----------
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
  }, 500);

  // ---------- FAQ Accordion ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---------- Legal Modals ----------
  const legalModal = document.getElementById('legalModal');
  const legalModalBody = document.getElementById('legalModalBody');
  const legalModalClose = document.querySelector('.legal-modal-close');

  const legalPages = {
    privacy: {
      title: 'Privacy Policy',
      date: 'Last updated: June 25, 2026',
      content: `
        <h3>Information We Collect</h3>
        <p>We collect minimal information necessary to provide our services. This may include your name, email address, and project details when you voluntarily submit them through our contact form.</p>
        <h3>How We Use Your Information</h3>
        <p>Your information is used solely to respond to your inquiries, provide requested services, and improve our offerings. We do not sell, rent, or share your personal data with third parties for their marketing purposes.</p>
        <h3>Data Security</h3>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
        <h3>Your Rights</h3>
        <p>You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact us at the email address provided on this site.</p>
        <h3>Cookies</h3>
        <p>We use minimal cookies for analytics and site functionality. You can control cookie preferences through your browser settings.</p>
      `
    },
    terms: {
      title: 'Terms of Service',
      date: 'Last updated: June 25, 2026',
      content: `
        <h3>Acceptance of Terms</h3>
        <p>By accessing and using this website, you agree to these Terms of Service. If you do not agree, please do not use this site.</p>
        <h3>Services</h3>
        <p>All services are provided based on mutually agreed scope, timeline, and pricing documented in a separate service agreement. This website serves as a portfolio and informational resource.</p>
        <h3>Intellectual Property</h3>
        <p>All content on this website, including text, graphics, and code, is the property of ADAM CREATES unless otherwise noted. Unauthorized reproduction or distribution is prohibited.</p>
        <h3>Limitation of Liability</h3>
        <p>ADAM CREATES is not liable for any indirect, incidental, or consequential damages arising from the use of this website or services provided.</p>
        <h3>Contact</h3>
        <p>For questions about these terms, please reach out via the contact form or email provided on this site.</p>
      `
    }
  };

  document.querySelectorAll('.legal-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      const legal = legalPages[page];
      if (!legal) return;

      legalModalBody.innerHTML = `
        <h2>${legal.title}</h2>
        <p class="legal-date">${legal.date}</p>
        ${legal.content}
      `;
      legalModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (legalModalClose) {
    legalModalClose.addEventListener('click', closeLegalModal);
  }

  document.querySelector('.legal-modal-overlay')?.addEventListener('click', closeLegalModal);

  function closeLegalModal() {
    legalModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal.classList.contains('active')) {
      closeLegalModal();
    }
  });

  // ---------- SEO Structured Data ----------
  function addStructuredData() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'ADAM CREATES',
      description: 'Custom websites, web apps, and Google Apps Script automation services.',
      url: window.location.origin,
      serviceType: ['Web Development', 'Web Apps', 'Automation']
    });
    document.head.appendChild(script);
  }
  addStructuredData();

  // ---------- Interactive Motion Effects ----------

  // 1. Ripple Click Effect
  function initRippleEffect() {
    document.querySelectorAll('.btn, .srv-card, .work-card, .skill-card, .faq-q, .contact-card-row, .about-highlight').forEach(el => {
      el.classList.add('ripple-container');
      el.addEventListener('click', function(e) {
        if (e.target.closest('a, button, input, select, textarea')) return;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }
  initRippleEffect();

  // 2. Magnetic Button Effect
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta');

    magneticBtns.forEach(btn => {
      btn.classList.add('magnetic-btn');

      btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const pull = 6;
        const pullX = (x / (rect.width / 2)) * pull;
        const pullY = (y / (rect.height / 2)) * pull;
        this.style.transform = `translate(${pullX}px, ${pullY}px)`;
      });

      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }
  initMagneticButtons();

  // ---------- Marquee Duplicate for Infinite Scroll ----------
  function initMarquee() {
    const content = document.getElementById('marqueeContent');
    if (!content) return;
    content.innerHTML += content.innerHTML;
  }
  initMarquee();

  // ---------- 3D Card Tilt (Subtle) ----------
  function initSubtleCardTilt() {
    // Only apply to non-work cards to avoid covering buttons
    const cards = document.querySelectorAll('.skill-card, .srv-card, .about-card, .about-highlight');

    cards.forEach(card => {
      const depthElements = card.querySelectorAll('.skill-card-head, .srv-icon, .about-card-icon, h3');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        // Gentle 3-degree max rotation
        card.style.transform = `perspective(800px) rotateX(${-mouseY * 3}deg) rotateY(${mouseX * 3}deg)`;
        card.style.transition = 'transform 0.05s ease-out';

        // Subtle depth on first elements only
        depthElements.forEach((el, idx) => {
          const pull = (idx + 1) * 2;
          el.style.transform = `translate3d(${mouseX * pull}px, ${mouseY * pull}px, ${pull}px)`;
          el.style.transition = 'transform 0.05s ease-out';
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease-out';
        depthElements.forEach(el => { el.style.transform = ''; });
      });
    });
  }
  initSubtleCardTilt();

  // ---------- Pixel Stars Particle Effect ----------
  function initPixelStars() {
    const canvas = document.createElement('canvas');
    canvas.id = 'pixelStarsCanvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let stars = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let touchActive = false;
    let animFrame = null;
    let pixelSize = 3;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        touchActive = true;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      touchActive = false;
      mouseX = -9999;
      mouseY = -9999;
    });

    document.addEventListener('touchcancel', () => {
      touchActive = false;
      mouseX = -9999;
      mouseY = -9999;
    });

    function createStar() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: pixelSize * (Math.floor(Math.random() * 2) + 1),
        baseBright: Math.random() * 0.5 + 0.3,
        bright: 0,
        twinkleSpeed: Math.random() * 0.008 + 0.003,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        hue: Math.random() < 0.3 ? (Math.random() < 0.5 ? 0 : 45) : 0,
        sat: Math.random() < 0.3 ? 80 : 0
      };
    }

    const starCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 8000), 120);

    for (let i = 0; i < starCount; i++) {
      const s = createStar();
      s.bright = s.baseBright;
      stars.push(s);
    }

    const radius = 180;

    function drawStars() {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
          const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
          star.bright = star.baseBright * (0.4 + 0.6 * twinkle);

          star.x += star.vx;
          star.y += star.vy;

          if (star.x < -10) star.x = canvas.width + 10;
          if (star.x > canvas.width + 10) star.x = -10;
          if (star.y < -10) star.y = canvas.height + 10;
          if (star.y > canvas.height + 10) star.y = -10;

          const dx = star.x - mouseX;
          const dy = star.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = star.bright;

          if (dist < radius) {
            const force = (1 - dist / radius) * 4;
            if (dist > 1) {
              star.x += (dx / dist) * force;
              star.y += (dy / dist) * force;
            }
            alpha = Math.min(1, star.bright + (1 - dist / radius) * 0.6);

            const glowRadius = star.size * (2 + (1 - dist / radius) * 3);
            ctx.globalAlpha = (1 - dist / radius) * 0.12;
            ctx.fillStyle = star.hue === 45 ? '#FFD700' : star.hue === 0 ? '#FF3B30' : '#FFFFFF';
            ctx.fillRect(
              Math.floor(star.x / pixelSize) * pixelSize - glowRadius / 2,
              Math.floor(star.y / pixelSize) * pixelSize - glowRadius / 2,
              glowRadius,
              glowRadius
            );
            ctx.globalAlpha = 1;
          }

          const px = Math.floor(star.x / pixelSize) * pixelSize;
          const py = Math.floor(star.y / pixelSize) * pixelSize;

          ctx.globalAlpha = alpha * 0.85;

          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

          if (star.hue === 45 && star.sat > 0) {
            ctx.fillStyle = '#FFD700';
          } else if (star.hue === 0 && star.sat > 0) {
            ctx.fillStyle = '#FF6B6B';
          } else {
            ctx.fillStyle = isDark ? '#E8E8E8' : '#1A1A1A';
          }

          ctx.fillRect(px, py, star.size, star.size);

          if (star.size > pixelSize && alpha > 0.5) {
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px + 1, py + 1, pixelSize, pixelSize);
          }

          ctx.globalAlpha = 1;
        });

        ctx.globalAlpha = 0.06;
        const gx = Math.floor(mouseX / pixelSize) * pixelSize;
        const gy = Math.floor(mouseY / pixelSize) * pixelSize;
        if (mouseX > -5000) {
          ctx.fillStyle = '#FF3B30';
          ctx.fillRect(gx - 100, gy - 100, 200, 200);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(gx - 60, gy - 60, 120, 120);
        }
        ctx.globalAlpha = 1;

      animFrame = requestAnimationFrame(drawStars);
    }

    drawStars();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        const newCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 8000), 120);
        if (newCount > stars.length) {
          for (let i = stars.length; i < newCount; i++) {
            const s = createStar();
            s.bright = s.baseBright;
            stars.push(s);
          }
        } else if (newCount < stars.length) {
          stars.length = newCount;
        }
      }, 300);
    });
  }
  initPixelStars();

  // ---------- Preloader ----------
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 400);
    });
  }

  // ---------- Auto-Update Copyright Year ----------
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ---------- Custom Pixel Cursor ----------
  function initPixelCursor() {
    const cursor = document.createElement('div');
    cursor.id = 'pixelCursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      const px = Math.round(cursorX / 3) * 3;
      const py = Math.round(cursorY / 3) * 3;
      cursor.style.left = px + 'px';
      cursor.style.top = py + 'px';
      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    document.querySelectorAll('a, button, .btn, .srv-card, .work-card, .skill-card, .faq-q').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursor.style.background = 'var(--color-accent)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '6px';
        cursor.style.height = '6px';
        cursor.style.background = 'var(--color-primary)';
      });
    });
  }
  initPixelCursor();

  // ---------- Sound Toggle (Web Audio) ----------
  const soundToggleBtn = document.getElementById('soundToggle');
  let soundEnabled = false;
  let audioCtx = null;

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.classList.toggle('active', soundEnabled);
      soundToggleBtn.innerHTML = soundEnabled
        ? '<i class="fas fa-volume-up"></i>'
        : '<i class="fas fa-volume-off"></i>';

      if (soundEnabled && !audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    });

    document.addEventListener('click', () => {
      if (!soundEnabled || !audioCtx) return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    });
  }

  // ---------- Theme Toggle (Dark/Light Mode) ----------
  const themeToggle = document.getElementById('themeToggle');
  let darkMode = localStorage.getItem('theme') === 'dark';

  function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    }
  }

  applyTheme(darkMode);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      darkMode = !darkMode;
      applyTheme(darkMode);
    });
  }

  // ---------- 3D Parallax Scroll ----------
  function initParallax() {
    const container = document.getElementById('parallaxContainer');
    if (!container) return;

    const shapes = container.querySelectorAll('.parallax-shape');
    if (!shapes.length) return;

    const originals = [];
    shapes.forEach(shape => {
      const rect = shape.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      originals.push({
        el: shape,
        speed: parseFloat(shape.dataset.speed) || 0.3,
        origX: rect.left - parentRect.left,
        origY: rect.top - parentRect.top
      });
    });

    let ticking = false;

    function onScroll() {
      const scrollY = window.pageYOffset;

      originals.forEach(item => {
        const offset = scrollY * item.speed * 0.3;
        const maxOffset = 200;
        const clampedOffset = Math.min(offset, maxOffset);
        item.el.style.transform = `translateY(${clampedOffset}px)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    });

    onScroll();
  }
  initParallax();

  console.log('✨ ADAM CREATES initialized with 3D effects');
});
