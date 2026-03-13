// ═══════════════════════════════════════════
// BEAQME APP — Cursor, Animations, Theme Toggle
// ═══════════════════════════════════════════

(function() {
    'use strict';

    // ─────────────────────────────────────────
    // MOBILE MENU
    // ─────────────────────────────────────────
    let menuOpen = false;
    window.toggleMenu = function() {
        menuOpen = !menuOpen;
        const mm = document.getElementById('mobileMenu');
        const mt = document.getElementById('menuToggle');
        if (mm) mm.classList.toggle('active', menuOpen);
        if (mt) mt.classList.toggle('open', menuOpen);
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    };

    document.addEventListener('click', e => {
        const mm = document.getElementById('mobileMenu');
        const mt = document.getElementById('menuToggle');
        if (menuOpen && mm && mt && !mm.contains(e.target) && !mt.contains(e.target)) {
            window.toggleMenu();
        }
    });

    // ─────────────────────────────────────────
    // DARK/LIGHT THEME TOGGLE
    // ─────────────────────────────────────────
    function getPreferredTheme() {
        const saved = localStorage.getItem('bq_theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('bq_theme', theme);
    }

    window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'light' ? 'dark' : 'light');
    };

    // Apply theme immediately
    applyTheme(getPreferredTheme());

    // ─────────────────────────────────────────
    // CUSTOM CURSOR
    // ─────────────────────────────────────────
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        document.body.classList.add('cursor-none');

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Lerp smoothing
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate(${cursorX - cursor.offsetWidth/2}px, ${cursorY - cursor.offsetHeight/2}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effect on interactive elements
        const hoverTargets = 'a, button, [onclick], input, textarea, .case-card, .service-card, .lab-card, .blog-card';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverTargets)) cursor.classList.add('hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverTargets)) cursor.classList.remove('hover');
        });
    }

    // ─────────────────────────────────────────
    // SCROLL REVEAL (IntersectionObserver)
    // ─────────────────────────────────────────
    function setupReveal() {
        const revealEls = document.querySelectorAll('.reveal, .reveal-left');
        if (!revealEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('in'), idx * 80);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => observer.observe(el));
    }

    // ─────────────────────────────────────────
    // HEADER SCROLL EFFECT
    // ─────────────────────────────────────────
    function setupHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ─────────────────────────────────────────
    // SMOOTH SCROLL for anchor links
    // ─────────────────────────────────────────
    function setupSmoothScroll() {
        document.addEventListener('click', e => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ─────────────────────────────────────────
    // TYPING EFFECT
    // ─────────────────────────────────────────
    function setupTypingEffect() {
        const el = document.getElementById('typingText');
        if (!el) return;

        const words = ['software', 'design', 'automacao', 'AI', 'estrategia'];
        let wordIdx = 0;
        let charIdx = 0;
        let deleting = false;

        function type() {
            const current = words[wordIdx];
            if (!deleting) {
                el.textContent = current.slice(0, charIdx + 1);
                charIdx++;
                if (charIdx === current.length) {
                    deleting = true;
                    setTimeout(type, 1800);
                    return;
                }
                setTimeout(type, 80);
            } else {
                el.textContent = current.slice(0, charIdx);
                charIdx--;
                if (charIdx < 0) {
                    deleting = false;
                    charIdx = 0;
                    wordIdx = (wordIdx + 1) % words.length;
                    setTimeout(type, 400);
                    return;
                }
                setTimeout(type, 40);
            }
        }
        setTimeout(type, 1000);
    }

    // ─────────────────────────────────────────
    // COUNT UP ANIMATION (for case study results)
    // ─────────────────────────────────────────
    function setupCountUp() {
        const counters = document.querySelectorAll('[data-count-up]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.getAttribute('data-count-up'));
                const suffix = el.getAttribute('data-suffix') || '';
                const prefix = el.getAttribute('data-prefix') || '';
                const duration = 1500;
                const start = performance.now();

                function update(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * eased);
                    el.textContent = prefix + current + suffix;
                    if (progress < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
                observer.unobserve(el);
            });
        }, { threshold: 0.3 });

        counters.forEach(el => observer.observe(el));
    }

    // ─────────────────────────────────────────
    // EASTER EGG
    // ─────────────────────────────────────────
    console.log(
        '%c Beaqme ',
        'background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;font-size:20px;font-weight:bold;padding:10px 20px;border-radius:8px;'
    );
    console.log('%c Feito com cafe e codigo. Quer construir algo? beaqme.com', 'color:#a0a0a0;font-size:12px;');

    // ─────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        setupReveal();
        setupHeaderScroll();
        setupSmoothScroll();
        setupTypingEffect();
        setupCountUp();

        // Init auth if available
        if (typeof BqAuth !== 'undefined') {
            BqAuth.init();
        }
    });

})();
