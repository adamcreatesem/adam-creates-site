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

    const words = ['AI Automation', 'Web Development', 'Web Apps', 'Automation', 'Digital Tools', 'Your Vision'];
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

  // ── Business-Type Modal (For Your Business) ──
  const FIT_CONTENT = {
    restaurants: {
      tag: 'Restaurants & Cafes',
      intro: 'Your food is great — but people can\u2019t find it. We fix the part between the kitchen and the customer.',
      get: ['A website that shows your menu, prices, and photos', 'QR menu customers scan at the table', 'WhatsApp ordering — no third-party apps or fees', 'Your real reviews front and center'],
      does: ['More people find you on Google', 'Customers see the menu before they walk in', 'Orders come to your phone directly', 'You keep every birr instead of paying app commissions'],
      sample: 'See a sample restaurant site \u2192'
    },
    guesthouses: {
      tag: 'Guest Houses & Hotels',
      intro: 'Booking.com takes 15\u201320% of every stay. Your own site brings guests back to you directly.',
      get: ['A direct-booking website with real photos', 'Book Direct button — WhatsApp or call, no middleman', 'Guest reviews pulled from your real listings', 'Occupancy at a glance'],
      does: ['Returning guests book you directly', 'You stop paying the OTA commission', 'Your rooms stay full with less effort', 'Diaspora guests find you on Google'],
      sample: 'See a sample guest house site \u2192'
    },
    clinics: {
      tag: 'Clinics & Hospitals',
      intro: 'Patients wait 60\u2013180 minutes — it\u2019s the #1 complaint about clinics in Addis. Booking fixes it.',
      get: ['Appointment booking + automatic reminders', 'Patient records that are easy to search', 'A professional site that builds trust', 'Follow-up reminders patients actually receive'],
      does: ['No-show rate drops', 'Your staff stops managing paper diaries', 'Patients feel their time is respected', 'You look established and serious'],
      sample: 'See a sample clinic site \u2192'
    },
    travel: {
      tag: 'Travel Agencies',
      intro: 'You sell journeys, but your own booking journey starts from zero. We build the bridge.',
      get: ['Package & itinerary pages that sell', 'Inquiry form + WhatsApp automation', 'Tour photos that make people want to go', 'Customer follow-up that never forgets'],
      does: ['Inquiries come to one place', 'Leads get answered fast — even at night', 'Packages are easy to share on WhatsApp', 'You look bigger than your size'],
      sample: 'See a sample travel site \u2192'
    },
    construction: {
      tag: 'Construction & Real Estate',
      intro: 'People buy with their eyes. Show them what you\u2019ve built and they\u2019ll trust you with what they\u2019re building.',
      get: ['A portfolio that shows completed projects', 'Quote requests that come to your WhatsApp', 'Property listings with real photos', 'A professional brand for bids and clients'],
      does: ['Clients see proof before they call', 'Quote requests arrive ready to answer', 'You win more bids with a real presence', 'Referrals have somewhere to land'],
      sample: 'See a sample construction site \u2192'
    },
    schools: {
      tag: 'Schools & Training',
      intro: 'Parents choose with trust. An academic, credible site is the difference between maybe and enrolled.',
      get: ['A site that shows mission, programs, and results', 'Enrollment inquiries + fee tracking', 'Accreditation and achievements front and center', 'A calendar parents can see'],
      does: ['Parents trust you before visiting', 'Enrollment inquiries come organized', 'Your reputation is visible to everyone', 'Students\u2019 families find you on Google'],
      sample: 'See a sample school site \u2192'
    },
    retail: {
      tag: 'Shops & Retail',
      intro: 'Your shop closes at 9pm. Your catalog shouldn\u2019t have to.',
      get: ['A catalog customers can browse anytime', 'Stock list that\u2019s easy to update', 'WhatsApp ordering with prefilled messages', 'A Google presence that brings walk-ins'],
      does: ['Customers check stock before traveling', 'Orders arrive on your phone', 'You look professional on every platform', 'Sales keep happening after closing time'],
      sample: 'See a sample shop site \u2192'
    },
    beauty: {
      tag: 'Salons, Gyms & More',
      intro: 'Appointments, memberships, and repeat clients — handled without the clipboard.',
      get: ['Online booking + reminders', 'Client history at your fingertips', 'Membership and package tracking', 'A site that shows your work beautifully'],
      does: ['No-shows drop with reminders', 'Clients book without calling', 'Packages renew on schedule', 'Your work is your best advertisement'],
      sample: 'See a sample salon site \u2192'
    },
    pharmacies: {
      tag: 'Pharmacies',
      intro: '40% of pharmacies lose money to expired stock. Track it before it expires — not after.',
      get: ['Stock with expiry-date alerts', 'Sales log that\u2019s audit-ready', 'Reorder reminders before you run out', 'A site that lists what you actually carry'],
      does: ['Less money lost to expiry', 'You\u2019re ready when inspectors ask', 'Never out of your best sellers', 'Customers find you when they need you'],
      sample: 'See a sample pharmacy site \u2192'
    },
    bakeries: {
      tag: 'Bakeries & Food Makers',
      intro: 'You\u2019re a maker, not a bookkeeper. Let the system count while you bake.',
      get: ['Product list with real photos', 'Ingredient stock tracking', 'Production log — what you made and sold', 'Wholesale orders organized'],
      does: ['You know what sold before it\u2019s gone', 'Ingredients never run out mid-batch', 'Wholesale customers order smoothly', 'Your brand looks as good as your bread'],
      sample: 'See a sample bakery site \u2192'
    },
    events: {
      tag: 'Event Planners & Photographers',
      intro: 'Your work is stunning — let your website carry that weight while you\u2019re on the job.',
      get: ['A portfolio that sells your style', 'Package pages with clear pricing', 'Deposit & payment tracking', 'Inquiry form + fast follow-up'],
      does: ['Couples find you on Google', 'Packages answer questions before you do', 'Deposits are never forgotten', 'Your best work does the talking'],
      sample: 'See a sample events site \u2192'
    },
    auto: {
      tag: 'Auto, Garages & Parts',
      intro: 'Every car has a story. Track it, and your customers never have to explain theirs twice.',
      get: ['Job tracking for every vehicle', 'Vehicle history — no more \u201cwhat did we do last time?\u201d', 'Booking for service slots', 'A site that looks as solid as your work'],
      does: ['Jobs never fall through the cracks', 'Customers get updates without asking', 'Repeat visits come automatically', 'You look like the shop people trust'],
      sample: 'See a sample auto site \u2192'
    }
  };

  const fitModal = document.getElementById('fitModal');
  if (fitModal) {
    const tagEl = document.getElementById('fitModalTag');
    const titleEl = document.getElementById('fitModalTitle');
    const introEl = document.getElementById('fitModalIntro');
    const getEl = document.getElementById('fitModalGet');
    const doesEl = document.getElementById('fitModalDoes');
    const sampleEl = document.getElementById('fitModalSample');
    let lastFocus = null;

    const closeModal = () => {
      fitModal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    const openModal = (key) => {
      const pool = currentLang === 'am' ? FIT_CONTENT_AM : FIT_CONTENT;
      const c = pool[key] || FIT_CONTENT[key];
      if (!c) return;
      lastFocus = document.activeElement;
      tagEl.textContent = c.tag;
      titleEl.textContent = c.tag;
      introEl.textContent = c.intro;
      getEl.innerHTML = c.get.map((li) => `<li>${li}</li>`).join('');
      doesEl.innerHTML = c.does.map((li) => `<li>${li}</li>`).join('');
      sampleEl.textContent = c.sample;
      fitModal.hidden = false;
      document.body.style.overflow = 'hidden';
      fitModal.querySelector('.fit-modal-close').focus();
    };

    document.querySelectorAll('.fit-item').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.fit));
    });
    fitModal.querySelectorAll('[data-fit-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !fitModal.hidden) closeModal();
    });
  }

  // ── Sample Preview Modal (mini window) ──
  const previewModal = document.getElementById('previewModal');
  if (previewModal) {
    const iframe = document.getElementById('previewIframe');
    const titleEl = document.getElementById('previewModalTitle');
    const openFull = document.getElementById('previewOpenFull');
    // Samples ship inside this site at /samples/ — works everywhere
    const SAMPLES_BASE = '/samples';

    const closePreview = () => {
      previewModal.hidden = true;
      iframe.src = 'about:blank';
      document.body.style.overflow = '';
    };

    const openPreview = (path, title) => {
      titleEl.textContent = title;
      openFull.href = SAMPLES_BASE + path;
      iframe.src = SAMPLES_BASE + path;
      previewModal.hidden = false;
      document.body.style.overflow = 'hidden';
      previewModal.querySelector('.preview-modal-close').focus();
    };

    document.querySelectorAll('.work-preview-btn').forEach((btn) => {
      btn.addEventListener('click', () => openPreview(btn.dataset.preview, btn.dataset.title));
    });
    previewModal.querySelectorAll('[data-preview-close]').forEach((el) => {
      el.addEventListener('click', closePreview);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !previewModal.hidden) closePreview();
    });
  }

  // ── Language toggle (English / Amharic) ──
  const I18N = {
    'nav.home': { en: 'Home', am: 'መነሻ' },
    'nav.about': { en: 'About', am: 'ስለ እኔ' },
    'nav.services': { en: 'Services', am: 'አገልግሎቶች' },
    'nav.work': { en: 'Work', am: 'ስራዎቼ' },
    'nav.foryou': { en: 'For Your Business', am: 'ለንግድዎ' },
    'nav.faq': { en: 'FAQ', am: 'ጥያቄዎች' },
    'nav.talk': { en: "Let's Talk", am: 'እንነጋገር' },
    'nav.contact': { en: 'Contact', am: 'ያግኙኝ' },
    'hero.badge': { en: '✦ Available For Projects', am: '✦ ለፕሮጀክቶች ዝግጁ' },
    'hero.line1': { en: 'I Build', am: 'የሚሰሩ' },
    'hero.line2': { en: 'Things That Work.', am: 'ነገሮችን እገነባለሁ።' },
    'hero.desc': { en: 'I design the solution, direct the build, and ship it working.', am: 'መፍትሄውን እቀርጻለሁ፣ ግንባታውን እመራለሁ፣ የሚሰራ ሆኖ አስረክባለሁ።' },
    'hero.seeWork': { en: 'See My Work', am: 'ስራዎቼን ይመልከቱ' },
    'hero.start': { en: 'Start a Project', am: 'ፕሮጀክት ይጀምሩ' },
    'about.tag': { en: 'About', am: 'ስለ እኔ' },
    'about.title': { en: 'The Person Behind the Work', am: 'ከስራዎቹ ጀርባ ያለው ሰው' },
    'about.hi': { en: "Hey, I'm Adam", am: 'ሰላም፣ አዳም ነኝ' },
    'about.p1': { en: 'I build things that work — websites, web apps, automation, voice systems, and content. AI is the fastest tool in my kit, and I use it openly, because the work is mine.', am: 'የሚሰሩ ነገሮችን እገነባለሁ — ድህረ ገጾች፣ ዌብ መተግበሪያዎች፣ አውቶሜሽን፣ የድምጽ ሲስተሞች እና ኮንቴንት። AI በእኔ ኪት ውስጥ ፈጣኑ መሳሪያ ነው፣ በግልጽ እጠቀምበታለሁ፣ ምክንያቱም ስራው የእኔ ነው።' },
    'about.p2': { en: 'I translate between English, Arabic, and Amharic.', am: 'በእንግሊዝኛ፣ በአረብኛ እና በአማርኛ እተረጉማለሁ።' },
    'about.h1': { en: 'Creative Approach', am: 'የፈጠራ አቀራረብ' },
    'about.h1.d': { en: 'Every project starts with a strong concept before a single line of code or frame is cut.', am: 'እያንዳንዱ ፕሮጀክት አንድም የኮድ መስመር ወይም ፍሬም ከመቁረጡ በፊት በጠንካራ አስተሳሰብ ይጀምራል።' },
    'about.h2': { en: 'Reliable Delivery', am: 'አስተማማኝ አቅርቦት' },
    'about.h2.d': { en: 'Clear communication, realistic timelines, and work that exceeds expectations, every time.', am: 'ግልጽ ግንኙነት፣ ተጨባጭ የጊዜ ገደቦች፣ እና ከተስፋ በላይ የሆነ ስራ — ሁልጊዜም።' },
    'about.h3': { en: 'Client-First Mindset', am: 'ደንበኛን የማስቀደም አመለካከት' },
    'about.h3.d': { en: 'Your goals are my goals. I listen, adapt, and deliver what actually serves your needs.', am: 'ግቦችዎ የእኔ ግቦች ናቸው። አዳምጣለሁ፣ እላምዳለሁ፣ እና ፍላጎትዎን የሚያገለግልን አስረክባለሁ።' },
    'services.tag': { en: 'Services', am: 'አገልግሎቶች' },
    'services.title': { en: 'What I Can Do For You', am: 'ምን ማድረግ እንደምችል' },
    'services.desc': { en: 'Seven ways I can help.', am: 'ሰባት የመርዳት መንገዶች።' },
    'services.s1': { en: 'AI Automation & Integration', am: 'AI አውቶሜሽን እና ውህደት' },
    'services.s1.d': { en: 'AI agents that operate your real tools, via Composio (100+ integrations).', am: 'በኮምፖሲዮ (ከ100 በላይ ውህደቶች) እውነተኛ መሳሪያዎችዎን የሚያንቀሳቅሱ AI ወኪሎች።' },
    'services.s2': { en: 'WhatsApp Business Systems', am: 'የWhatsApp ቢዝነስ ሲስተሞች' },
    'services.s2.d': { en: 'Trilingual automated replies (English, Arabic, Amharic), voice notes, and AI voice replies.', am: 'የሶስት ቋንቋ አውቶማቲክ መልሶች (እንግሊዝኛ፣ አረብኛ፣ አማርኛ)፣ የድምጽ ማስታወሻዎች እና AI የድምጽ መልሶች።' },
    'services.s3': { en: 'Voice AI & Translation', am: 'የድምጽ AI እና ትርጉም' },
    'services.s3.d': { en: 'TTS and transcription in 32+ languages, plus translation between English, Arabic, and Amharic.', am: 'ከ32 በላይ ቋንቋዎች TTS እና ቅጂ፣ በተጨማሪም በእንግሊዝኛ፣ አረብኛ እና አማርኛ መካከል ትርጉም።' },
    'services.s4': { en: 'Data Pipelines & Reporting', am: 'የዳታ ፓይፕላይን እና ሪፖርት' },
    'services.s4.d': { en: 'Spreadsheet to clean reports, delivered automatically.', am: 'ከተመን ሉህ ወደ ንጹህ ሪፖርቶች፣ በራስ-ሰር የሚደርሱ።' },
    'services.s5': { en: 'Websites & Web Apps', am: 'ድህረ ገጾች እና ዌብ መተግበሪያዎች' },
    'services.s5.d': { en: 'Custom sites and apps, designed by me and built with AI collaboration.', am: 'በእኔ የተነደፉ እና በAI ትብብር የተገነቡ ብጁ ጣቢያዎች እና መተግበሪያዎች።' },
    'services.s6': { en: 'Research & Scraping', am: 'ምርምር እና ውሂብ መሰብሰብ' },
    'services.s6.d': { en: 'Lead generation, competitor analysis, and market intelligence.', am: 'ደንበኛ ማፍራት፣ የተፎካካሪ ትንተና እና የገበያ መረጃ።' },
    'services.s7': { en: 'Content Creation (Images & Video)', am: 'ኮንቴንት መፍጠር (ምስሎች እና ቪዲዮ)' },
    'services.s7.d': { en: 'AI-generated images and short videos for social and ads.', am: 'ለማህበራዊ ሚዲያ እና ለማስታወቂያ AI የተፈጠሩ ምስሎች እና አጫጭር ቪዲዮዎች።' },
    'services.cta': { en: 'Discuss This', am: 'ይህን ይወያዩ' },
    'foryou.tag': { en: 'For Your Business', am: 'ለንግድዎ' },
    'foryou.title': { en: "Whatever You Run, There's a Fit", am: 'የሚያንቀሳቅሱት ሁሉ፣ የሚስማማ አለው' },
    'foryou.desc': { en: 'Websites, systems, and automation for every kind of business in Addis Ababa.', am: 'በአዲስ አበባ ለሚገኙ ሁሉም አይነት ንግዶች ድህረ ገጾች፣ ሲስተሞች እና አውቶሜሽን።' },
    'fit.restaurants': { en: 'Restaurants & Cafes', am: 'ምግብ ቤቶች እና ካፌዎች' },
    'fit.restaurants.d': { en: 'Website + QR menu + reviews + sales log', am: 'ድህረ ገጽ + QR ሜኑ + ግምገማዎች + የሽያጭ መዝገብ' },
    'fit.guesthouses': { en: 'Guest Houses & Hotels', am: 'የእንግዳ ማረፊያዎች እና ሆቴሎች' },
    'fit.guesthouses.d': { en: 'Direct booking + occupancy + real reviews', am: 'ቀጥታ ቦታ ማስያዝ + ሙላት + እውነተኛ ግምገማዎች' },
    'fit.clinics': { en: 'Clinics & Hospitals', am: 'ክሊኒኮች እና ሆስፒታሎች' },
    'fit.clinics.d': { en: 'Appointments + reminders + patient records', am: 'ቀጠሮዎች + ማስታወሻዎች + የህመምተኛ መዝገቦች' },
    'fit.travel': { en: 'Travel Agencies', am: 'የጉዞ ኤጀንሲዎች' },
    'fit.travel.d': { en: 'Packages + itineraries + inquiry automation', am: 'ፓኬጆች + የጉዞ መርሃ ግብሮች + የጥያቄ አውቶሜሽን' },
    'fit.construction': { en: 'Construction & Real Estate', am: 'ኮንስትራክሽን እና ሪል እስቴት' },
    'fit.construction.d': { en: 'Portfolio + quotes + WhatsApp automation', am: 'ፖርትፎሊዮ + ጥቅሶች + WhatsApp አውቶሜሽን' },
    'fit.schools': { en: 'Schools & Training', am: 'ትምህርት ቤቶች እና ስልጠና' },
    'fit.schools.d': { en: 'Enrollment + credibility + fee tracking', am: 'ምዝገባ + ተዓማኒነት + የክፍያ ክትትል' },
    'fit.retail': { en: 'Shops & Retail', am: 'ሱቆች እና ችርቻሮ' },
    'fit.retail.d': { en: 'Catalog + stock list + WhatsApp ordering', am: 'ካታሎግ + የእቃ ዝርዝር + WhatsApp ማዘዝ' },
    'fit.beauty': { en: 'Salons, Gyms & More', am: 'ሳሎኖች፣ ጂሞች እና ሌሎችም' },
    'fit.beauty.d': { en: 'Booking + client history + memberships', am: 'ቦታ ማስያዝ + የደንበኛ ታሪክ + አባልነቶች' },
    'fit.pharmacies': { en: 'Pharmacies', am: 'ፋርማሲዎች' },
    'fit.pharmacies.d': { en: 'Stock + expiry alerts + compliance-ready records', am: 'ክምችት + የጊዜ ማስጠንቀቂያ + ለህግ ዝግጁ መዝገቦች' },
    'fit.bakeries': { en: 'Bakeries & Food Makers', am: 'ዳቦ ቤቶች እና የምግብ አምራቾች' },
    'fit.bakeries.d': { en: 'Product list + ingredient stock + production log', am: 'የምርት ዝርዝር + የጥሬ እቃ ክምችት + የምርት መዝገብ' },
    'fit.events': { en: 'Event Planners & Photographers', am: 'የዝግጅት አዘጋጆች እና ፎቶግራፍ አንሺዎች' },
    'fit.events.d': { en: 'Portfolio + packages + deposit tracking', am: 'ፖርትፎሊዮ + ፓኬጆች + የተረከብ ክትትል' },
    'fit.auto': { en: 'Auto, Garages & Parts', am: 'መኪና፣ ጋራጆች እና መለዋወጫዎች' },
    'fit.auto.d': { en: 'Job tracking + vehicle history + bookings', am: 'የስራ ክትትል + የተሽከርካሪ ታሪክ + ቦታ ማስያዝ' },
    'foryou.tax': { en: '"Your tax bill is decided by someone guessing your sales. I give you real records — then your tax is based on what you actually earned, not a guess."', am: '"የታክስ መጠንዎ የሚወሰነው ሽያጭዎን በመገመት ነው። እውነተኛ መዝገቦችን እሰጥዎታለሁ — ከዚያ ታክስዎ በግምት ሳይሆን ባገኙት ትክክለኛ ገቢ ላይ ይመሰረታል።"' },
    'foryou.tax.note': { en: 'Manual receipts are now illegal in Ethiopia. Be ready when the tax office asks.', am: 'በኢትዮጵያ በእጅ የሚሰጡ ደረሰኞች አሁን ህገ-ወጥ ናቸው። የግብር ቢሮ ሲጠይቅ ዝግጁ ይሁኑ።' },
    'modal.get': { en: 'What you get', am: 'ምን ያገኛሉ' },
    'modal.does': { en: 'What it does for your business', am: 'ለንግድዎ ምን ያደርጋል' },
    'work.tag': { en: 'Portfolio', am: 'ፖርትፎሊዮ' },
    'work.title': { en: 'Recent Work', am: 'የቅርብ ስራዎች' },
    'work.desc': { en: 'Real projects, shipped and built to last — plus concept samples for every kind of business.', am: 'እውነተኛ ፕሮጀክቶች፣ የተረከቡ እና ዘላቂ ሆነው የተገነቡ — በተጨማሪም ለሁሉም አይነት ንግድ የናሙና ጣቢያዎች።' },
    'process.tag': { en: 'Process', am: 'ሂደት' },
    'process.title': { en: 'How I Work', am: 'እንዴት እሰራለሁ' },
    'process.desc': { en: 'From idea to delivery, no surprises.', am: 'ከሀሳብ እስከ አቅርቦት፣ ያለ ምንም ድንገተኛ።' },
    'process.p1': { en: 'Discovery Call', am: 'የመጀመሪያ ውይይት' },
    'process.p1.d': { en: 'We talk through your goals and map out the path.', am: 'ስለ ግቦችዎ እንወያያለን እና መንገዱን እንቀርጻለን።' },
    'process.p2': { en: 'Planning & Design', am: 'እቅድ እና ንድፍ' },
    'process.p2.d': { en: 'I sketch concepts and you give feedback.', am: 'ሀሳቦችን እሳለሁ እና አስተያየት ይሰጣሉ።' },
    'process.p3': { en: 'Build & Refine', am: 'ግንባታ እና ማጣራት' },
    'process.p3.d': { en: 'I build it, test it, and refine it until it works.', am: 'እገነባለሁ፣ እሞክራለሁ፣ እስከሚሰራ ድረስ አጣራለሁ።' },
    'process.p4': { en: 'Deliver & Support', am: 'አቅርቦት እና ድጋፍ' },
    'process.p4.d': { en: "Final delivery and support. I don't disappear after launch.", am: 'የመጨረሻ አቅርቦት እና ድጋፍ። ከመጀመር በኋላ አልጠፋም።' },
    'faq.tag': { en: 'FAQ', am: 'ጥያቄዎች' },
    'faq.title': { en: 'Common Questions', am: 'የተለመዱ ጥያቄዎች' },
    'faq.desc': { en: 'Quick answers before we start.', am: 'ከመጀመራችን በፊት ፈጣን መልሶች።' },
    'faq.q1': { en: 'How long does a typical project take?', am: 'የተለመደ ፕሮጀክት ምን ያህል ጊዜ ይወስዳል?' },
    'faq.a1': { en: "A website takes 1 to 3 weeks. I'll give you a clear timeline in our first chat.", am: 'ድህረ ገጽ ከ1 እስከ 3 ሳምንት ይወስዳል። በመጀመሪያ ውይይታችን ግልጽ የጊዜ ሰሌዳ እሰጥዎታለሁ።' },
    'faq.q2': { en: 'How does pricing work?', am: 'ዋጋ እንዴት ይወሰናል?' },
    'faq.a2': { en: 'Fixed pricing, split 50% to start and 50% on completion. Agreed upfront.', am: 'ቋሚ ዋጋ፣ 50% ለመጀመር እና 50% ሲጠናቀቅ። ከመጀመሪያው ይስማማለን።' },
    'faq.q3': { en: 'Can we work together remotely?', am: 'በርቀት አብረን መስራት እንችላለን?' },
    'faq.a3': { en: 'Yes, I work with clients worldwide via email or video calls.', am: 'አዎ፣ በኢሜል ወይም በቪዲዮ ጥሪ ከዓለም ዙሪያ ካሉ ደንበኞች ጋር እሰራለሁ።' },
    'faq.q4': { en: 'Do you offer revisions?', am: 'ክለሳ ይሰጣሉ?' },
    'faq.a4': { en: 'Yes, every project includes revisions.', am: 'አዎ፣ እያንዳንዱ ፕሮጀክት ክለሳዎችን ያካትታል።' },
    'faq.q5': { en: 'What do you need from me to get started?', am: 'ለመጀመር ከእኔ ምን ያስፈልግዎታል?' },
    'faq.a5': { en: "Your goals, brand assets, and content. I'll guide you through it.", am: 'ግቦችዎ፣ የብራንድ ንብረቶች እና ኮንቴንት። በሙሉ እመራዎታለሁ።' },
    'cta.title': { en: 'Got a Project in Mind?', am: 'በአእምሮዎ ፕሮጀክት አለ?' },
    'cta.desc': { en: "Let's talk about what you need.", am: 'ስለሚፈልጉት እንነጋገር።' },
    'cta.start': { en: 'Start a Project', am: 'ፕሮጀክት ይጀምሩ' },
    'contact.tag': { en: 'Contact', am: 'ያግኙኝ' },
    'contact.title': { en: "Let's Make It Happen", am: 'እንፈጽመው' },
    'contact.desc': { en: "Got a project, an idea, or just curious? Reach out and let's talk about what I can do for you.", am: 'ፕሮጀክት፣ ሀሳብ፣ ወይም ዝም ብለው ማወቅ ይፈልጋሉ? ያነጋግሩኝ እና ምን ማድረግ እንደምችል እንወያይ።' },
    'footer.desc': { en: 'Bringing ideas to life through custom websites, web apps, and automation.', am: 'ሀሳቦችን በብጁ ድህረ ገጾች፣ ዌብ መተግበሪያዎች እና አውቶሜሽን ወደ ህይወት ማምጣት።' },
    'footer.nav': { en: 'Navigation', am: 'መሄጃ' },
    'footer.services': { en: 'Services', am: 'አገልግሎቶች' },
  };

  // Amharic versions of the business-type modals (FIT_CONTENT)
  const FIT_CONTENT_AM = {
    restaurants: { tag: 'ምግብ ቤቶች እና ካፌዎች', intro: 'ምግብዎ ጥሩ ነው — ግን ሰዎች ሊያገኙት አይችሉም። በኩሽና እና በደንበኛ መካከል ያለውን ክፍተት እንፈታለን።', get: ['ሜኑዎን፣ ዋጋዎን እና ፎቶዎችን የሚያሳይ ድህረ ገጽ', 'ደንበኞች በጠረጴዛ ላይ የሚቃኙት QR ሜኑ', 'WhatsApp ማዘዝ — ያለ ሶስተኛ ወገን መተግበሪያዎች ወይም ክፍያዎች', 'እውነተኛ ግምገማዎችዎ በፊት ላይ'], does: ['ብዙ ሰዎች በGoogle ያገኙዎታል', 'ደንበኞች ከመግባታቸው በፊት ሜኑውን ያያሉ', 'ትዕዛዞች በቀጥታ ወደ ስልክዎ ይደርሳሉ', 'ከመተግበሪያ ኮሚሽን ይልቅ ገንዘብዎን ሙሉ በሙሉ ያቆያሉ'], sample: 'የናሙና ምግብ ቤት ጣቢያ ይመልከቱ →' },
    guesthouses: { tag: 'የእንግዳ ማረፊያዎች እና ሆቴሎች', intro: 'Booking.com ከእያንዳንዱ ቆይታ 15–20% ይወስዳል። የራስዎ ጣቢያ እንግዶችን በቀጥታ ወደ እርስዎ ይመልሳል።', get: ['እውነተኛ ፎቶዎች ያሉት ቀጥተኛ ቦታ ማስያዣ ድህረ ገጽ', 'Book Direct አዝራር — WhatsApp ወይም ጥሪ፣ ያለ አማላጅ', 'ከእውነተኛ ዝርዝሮችዎ የተወሰዱ የእንግዳ ግምገማዎች', 'ሙላትዎ በአንድ እይታ'], does: ['የተመለሱ እንግዶች በቀጥታ ያስይዛሉ', 'የOTA ኮሚሽን መክፈል ያቆማሉ', 'ክፍሎችዎ በትንሽ ጥረት ሙሉ ሆነው ይቆያሉ', 'ዲያስፖራ እንግዶች በGoogle ያገኙዎታል'], sample: 'የናሙና እንግዳ ማረፊያ ጣቢያ ይመልከቱ →' },
    clinics: { tag: 'ክሊኒኮች እና ሆስፒታሎች', intro: 'ታካሚዎች 60–180 ደቂቃ ይጠብቃሉ — በአዲስ አበባ ስለ ክሊኒኮች ቁጥር አንድ ቅሬታ ነው። ቦታ ማስያዝ ይፈታዋል።', get: ['ቀጠሮ ማስያዝ + አውቶማቲክ ማስታወሻዎች', 'በቀላሉ የሚፈለጉ የታካሚ መዝገቦች', 'እምነትን የሚገነባ ሙያዊ ጣቢያ', 'ታካሚዎች የሚደርሳቸው የክትትል ማስታወሻዎች'], does: ['ያልተገኙ ቀጠሮዎች ይቀንሳሉ', 'ሰራተኞችዎ የወረቀት መዝገብ ማስተዳደር ያቆማሉ', 'ታካሚዎች ጊዜያቸው እንደተከበረ ይሰማቸዋል', 'ሙያዊ እና ከባድ ሆነው ይታያሉ'], sample: 'የናሙና ክሊኒክ ጣቢያ ይመልከቱ →' },
    travel: { tag: 'የጉዞ ኤጀንሲዎች', intro: 'ጉዞዎችን ይሸጣሉ፣ ግን የራስዎ የቦታ ማስያዣ ሂደት ከዜሮ ይጀምራል። ድልድዩን እንገነባለን።', get: ['የሚሸጡ የፓኬጅ እና የጉዞ መርሃ ግብር ገጾች', 'የጥያቄ ቅጽ + WhatsApp አውቶሜሽን', 'ሰዎች እንዲሄዱ የሚያደርጉ የጉዞ ፎቶዎች', 'የማይረሳ የደንበኛ ክትትል'], does: ['ጥያቄዎች ወደ አንድ ቦታ ይመጣሉ', 'መሪዎች በፍጥነት — ሌሊትም ቢሆን — ይመለሳሉ', 'ፓኬጆች በWhatsApp ለማጋራት ቀላል', 'ከመጠንዎ በላይ ትልቅ ሆነው ይታያሉ'], sample: 'የናሙና ጉዞ ጣቢያ ይመልከቱ →' },
    construction: { tag: 'ኮንስትራክሽን እና ሪል እስቴት', intro: 'ሰዎች በዓይናቸው ይገዛሉ። የገነቡትን አሳዩዋቸው እና የሚገነቡትን ያምኑዎታል።', get: ['የተጠናቀቁ ፕሮጀክቶችን የሚያሳይ ፖርትፎሊዮ', 'በቀጥታ ወደ WhatsApp የሚመጡ የጥቅስ ጥያቄዎች', 'በእውነተኛ ፎቶዎች የንብረት ዝርዝሮች', 'ለጨረታዎች እና ደንበኞች ሙያዊ ብራንድ'], does: ['ደንበኞች ከመጥራታቸው በፊት ማስረጃ ያያሉ', 'የጥቅስ ጥያቄዎች ለመመለስ ዝግጁ ሆነው ይደርሳሉ', 'በእውነተኛ መገኘት ብዙ ጨረታዎች ያሸንፋሉ', 'ማጣቀሻዎች የሚያርፉበት ቦታ አላቸው'], sample: 'የናሙና ኮንስትራክሽን ጣቢያ ይመልከቱ →' },
    schools: { tag: 'ትምህርት ቤቶች እና ስልጠና', intro: 'ወላጆች በእምነት ይመርጣሉ። ሙያዊ ድህረ ገጽ በምናልባት እና በተመዘገበ መካከል ያለው ልዩነት ነው።', get: ['ተልዕኮ፣ ፕሮግራሞች እና ውጤቶችን የሚያሳይ ጣቢያ', 'የምዝገባ ጥያቄዎች + የክፍያ ክትትል', 'እውቅና እና ስኬቶች ግንባር ቀደም', 'ወላጆች የሚያዩት የቀን መቁጠሪያ'], does: ['ወላጆች ከመጎብኘታቸው በፊት ያምኑዎታል', 'የምዝገባ ጥያቄዎች የተደራጁ ይመጣሉ', 'ስምዎ ለሁሉም ይታያል', 'ተማሪ ቤተሰቦች በGoogle ያገኙዎታል'], sample: 'የናሙና ትምህርት ቤት ጣቢያ ይመልከቱ →' },
    retail: { tag: 'ሱቆች እና ችርቻሮ', intro: 'ሱቅዎ በ9 ይዘጋል። ካታሎግዎ መዘጋት የለበትም።', get: ['ደንበኞች በማንኛውም ጊዜ የሚመለከቱት ካታሎግ', 'ለማዘመን ቀላል የእቃ ዝርዝር', 'በተሞላ መልዕክት WhatsApp ማዘዝ', 'ደንበኞችን የሚያመጣ የGoogle መገኘት'], does: ['ደንበኞች ከመሄዳቸው በፊት እቃው መኖሩን ይፈትሻሉ', 'ትዕዛዞች ወደ ስልክዎ ይደርሳሉ', 'በሁሉም መድረክ ላይ ሙያዊ ሆነው ይታያሉ', 'ከመዝጊያ ጊዜ በኋላም ሽያጭ ይቀጥላል'], sample: 'የናሙና ሱቅ ጣቢያ ይመልከቱ →' },
    beauty: { tag: 'ሳሎኖች፣ ጂሞች እና ሌሎችም', intro: 'ቀጠሮዎች፣ አባልነቶች እና ተደጋጋሚ ደንበኞች — ያለ ወረቀት የሚስተናገዱ።', get: ['የመስመር ላይ ቦታ ማስያዝ + ማስታወሻዎች', 'የደንበኛ ታሪክ በጣት ጫፍዎ', 'የአባልነት እና ፓኬጅ ክትትል', 'ስራዎን በሚያምር ሁኔታ የሚያሳይ ጣቢያ'], does: ['በማስታወሻዎች ያልመጡ ደንበኞች ይቀንሳሉ', 'ደንበኞች ሳይደውሉ ያስይዛሉ', 'ፓኬጆች በሰሌዳው ይታደሳሉ', 'ስራዎ ምርጥ ማስታወቂያዎ ነው'], sample: 'የናሙና ሳሎን ጣቢያ ይመልከቱ →' },
    pharmacies: { tag: 'ፋርማሲዎች', intro: '40% የሚሆኑ ፋርማሲዎች በጊዜው ባልተሸጠ ክምችት ገንዘብ ያጣሉ። ከመበላሹ በፊት ይከታተሉት — ከተበላሸ በኋላ አይደለም።', get: ['የጊዜ ማስጠንቀቂያ ያለው ክምችት', 'ለኦዲት ዝግጁ የሽያጭ መዝገብ', 'ከማለቁ በፊት የማዘዝ ማስታወሻዎች', 'የሚሸከሙትን የሚዘረዝር ጣቢያ'], does: ['በመበላሸት የሚጠፋ ገንዘብ ይቀንሳል', 'ተቆጣጣሪዎች ሲጠይቁ ዝግጁ ነዎት', 'ምርጥ ሽያጮችዎ ከመጥፋት ይታደጋሉ', 'ደንበኞች በሚፈልጉበት ጊዜ ያገኙዎታል'], sample: 'የናሙና ፋርማሲ ጣቢያ ይመልከቱ →' },
    bakeries: { tag: 'ዳቦ ቤቶች እና የምግብ አምራቾች', intro: 'እርስዎ ሰሪ ነዎት፣ መጽሐፍ ጠባቂ አይደሉም። እርስዎ ሲጋግሩ ሲስተሙ ይቁጠር።', get: ['በእውነተኛ ፎቶዎች የምርት ዝርዝር', 'የጥሬ እቃ ክምችት ክትትል', 'የምርት መዝገብ — ምን አዘጋጅተዋል እና ሸጠዋል', 'የተደራጁ የጅምላ ትዕዛዞች'], does: ['ምርት ከማለቁ በፊት ምን እንደሸጡ ያውቃሉ', 'ጥሬ እቃ በመሃል ስራ አያልቅም', 'የጅምላ ደንበኞች በተቀላጠፈ ያዝዛሉ', 'ብራንድዎ እንደ ዳቦዎ ጥሩ ይመስላል'], sample: 'የናሙና ዳቦ ቤት ጣቢያ ይመልከቱ →' },
    events: { tag: 'የዝግጅት አዘጋጆች እና ፎቶግራፍ አንሺዎች', intro: 'ስራዎ አስደናቂ ነው — በስራ ላይ እያሉ ድህረ ገጹ ያንን ክብደት ይሸከም።', get: ['ስልትዎን የሚሸጥ ፖርትፎሊዮ', 'ግልጽ ዋጋ ያላቸው የፓኬጅ ገጾች', 'የተረከብ እና የክፍያ ክትትል', 'የጥያቄ ቅጽ + ፈጣን ክትትል'], does: ['ጥንዶች በGoogle ያገኙዎታል', 'ፓኬጆች ከእርስዎ በፊት ጥያቄዎችን ይመልሳሉ', 'ተረከቦች አይረሱም', 'ምርጥ ስራዎ ይናገራል'], sample: 'የናሙና ዝግጅት ጣቢያ ይመልከቱ →' },
    auto: { tag: 'መኪና፣ ጋራጆች እና መለዋወጫዎች', intro: 'እያንዳንዱ መኪና ታሪክ አለው። ይከታተሉት፣ ደንበኞችዎ ታሪካቸውን ሁለት ጊዜ መናገር አይጠበቅባቸውም።', get: ['ለእያንዳንዱ ተሽከርካሪ የስራ ክትትል', 'የተሽከርካሪ ታሪክ — ምን አደረግን? የሚለው ጥያቄ ያበቃል', 'ለአገልግሎት ቦታ ማስያዝ', 'እንደ ስራዎ ጠንካራ የሚመስል ጣቢያ'], does: ['ስራዎች አይረሱም', 'ደንበኞች ሳይጠይቁ መረጃ ያገኛሉ', 'ተደጋጋሚ ጉብኝቶች በራስ-ሰር ይመጣሉ', 'ሰዎች የሚያምኑት ሱቅ ሆነው ይታያሉ'], sample: 'የናሙና አውቶ ጣቢያ ይመልከቱ →' },
  };

  let currentLang = localStorage.getItem('lang') || 'en';
  const langToggle = document.getElementById('langToggle');

  const applyLang = (lang) => {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    if (langToggle) langToggle.textContent = lang === 'am' ? 'English' : 'አማርኛ';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const entry = I18N[key];
      if (entry && entry[lang]) el.textContent = entry[lang];
    });
    // Re-render open fit modal with the new language
    const fitModal = document.getElementById('fitModal');
    if (fitModal && !fitModal.hidden) {
      const openBtn = document.querySelector('.fit-item.active');
      if (openBtn) openBtn.click();
    }
  };

  // Respect ?lang=am on load
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'am') applyLang('am');
  else applyLang(localStorage.getItem('lang') || 'en');

  if (langToggle) {
    langToggle.addEventListener('click', () => applyLang(currentLang === 'am' ? 'en' : 'am'));
  }

  console.log('✨ ADAM CREATES initialized with 3D effects');
});
