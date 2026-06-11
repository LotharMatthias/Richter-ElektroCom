/**
 * Richter ElektroCom — Mobile-First JavaScript
 * All interactions optimised for touch devices first
 */

// Scroll to top on page load
window.addEventListener('load', function () {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0, 0);
    initMobileMenu();
    initCarousel();
    initTestimonialsCarousel();
    initScrollAnimations();
    initCountUp();
    initTickerPause();
    initContactToggle();
    initContactForm();
    initScrollToContact();
    initSmoothAnchors();
    initFloatingContact();
});

/* ========================================
   MOBILE MENU
   ======================================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const closeBtn = document.getElementById('mobileMenuClose');
    const overlay = document.getElementById('mobileMenuOverlay');
    const nav = document.querySelector('.nav-boxes');
    if (!toggle || !nav) return;

    function openMenu() {
        toggle.classList.add('active');
        nav.classList.add('mobile-menu-open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        toggle.classList.remove('active');
        nav.classList.remove('mobile-menu-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Close all open dropdowns
        document.querySelectorAll('.nav-box-dropdown.dropdown-open').forEach(function (d) {
            d.classList.remove('dropdown-open');
        });
    }

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (nav.classList.contains('mobile-menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeMenu();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (nav.classList.contains('mobile-menu-open') &&
            !nav.contains(e.target) &&
            !toggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Dropdown accordion on mobile
    var dropdowns = document.querySelectorAll('.nav-box-dropdown');
    dropdowns.forEach(function (dropdown) {
        var navBox = dropdown.querySelector('.nav-box');
        if (!navBox) return;

        navBox.addEventListener('click', function (e) {
            // Only accordion behaviour below 900px
            if (window.innerWidth < 900) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                dropdowns.forEach(function (other) {
                    if (other !== dropdown) other.classList.remove('dropdown-open');
                });

                dropdown.classList.toggle('dropdown-open');
            }
        });
    });

    // Close menu when a dropdown-item is tapped
    nav.addEventListener('click', function (e) {
        if (e.target.classList.contains('dropdown-item')) {
            closeMenu();
        }
    });

    // Close menu when a simple nav-box (non-dropdown) is tapped
    nav.querySelectorAll('.nav-box').forEach(function (box) {
        if (!box.closest('.nav-box-dropdown')) {
            box.addEventListener('click', function () {
                if (window.innerWidth < 900) closeMenu();
            });
        }
    });
}

/* ========================================
   BUSINESS AREAS CAROUSEL
   ======================================== */
function initCarousel() {
    var track = document.querySelector('.carousel-track');
    var cards = document.querySelectorAll('.carousel-card');
    var leftArrow = document.querySelector('.carousel-arrow-left');
    var rightArrow = document.querySelector('.carousel-arrow-right');
    var dots = document.querySelectorAll('.dot');
    if (!track || !cards.length) return;

    var current = 0;
    var total = cards.length;

    function update(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;

        var prev = (current - 1 + total) % total;
        var next = (current + 1) % total;

        cards.forEach(function (card, i) {
            card.classList.remove('active', 'prev', 'next');
            if (i === current) card.classList.add('active');
            else if (i === prev) card.classList.add('prev');
            else if (i === next) card.classList.add('next');
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    if (leftArrow) leftArrow.addEventListener('click', function () { update(current - 1); });
    if (rightArrow) rightArrow.addEventListener('click', function () { update(current + 1); });

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { update(i); });
    });

    // Touch / swipe
    var startX = 0;
    var startY = 0;
    var isDragging = false;

    track.addEventListener('touchstart', function (e) {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
        isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
        if (!isDragging) return;
        isDragging = false;
        var dx = startX - e.changedTouches[0].clientX;
        var dy = startY - e.changedTouches[0].clientY;
        // Only trigger if horizontal swipe > vertical
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) update(current + 1);
            else update(current - 1);
        }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') update(current - 1);
        if (e.key === 'ArrowRight') update(current + 1);
    });

    update(0);
}

/* ========================================
   TESTIMONIALS AUTO-SCROLL CAROUSEL
   ======================================== */
function initTestimonialsCarousel() {
    var grid = document.querySelector('.testimonials-grid');
    var cards = document.querySelectorAll('.testimonial-card');
    var pagination = document.querySelector('.testimonials-pagination');
    if (!grid || !cards.length) return;

    function getCardsPerView() {
        return window.innerWidth < 600 ? 1 : 2;
    }

    var cardsPerView = getCardsPerView();
    var totalPages = Math.ceil(cards.length / cardsPerView);
    var currentPage = 0;
    var autoInterval;
    var dots = [];

    function buildDots() {
        if (!pagination) return;
        pagination.innerHTML = '';
        dots = [];
        cardsPerView = getCardsPerView();
        totalPages = Math.ceil(cards.length / cardsPerView);
        if (currentPage >= totalPages) currentPage = 0;

        for (var i = 0; i < totalPages; i++) {
            var dot = document.createElement('div');
            dot.classList.add('pagination-dot');
            if (i === currentPage) dot.classList.add('active');
            (function (idx) {
                dot.addEventListener('click', function () {
                    currentPage = idx;
                    slide();
                    restartAuto();
                });
            })(i);
            pagination.appendChild(dot);
            dots.push(dot);
        }
    }

    function slide() {
        var cardW = cards[0].offsetWidth;
        var gap = window.innerWidth < 600 ? 16 : (window.innerWidth < 900 ? 24 : 32);
        var offset = (cardW + gap) * cardsPerView * currentPage;
        grid.style.transform = 'translateX(-' + offset + 'px)';
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === currentPage);
        });
    }

    function next() {
        currentPage = (currentPage + 1) % totalPages;
        slide();
    }

    function startAuto() {
        autoInterval = setInterval(next, 5000);
    }
    function stopAuto() {
        clearInterval(autoInterval);
    }
    function restartAuto() {
        stopAuto();
        startAuto();
    }

    // Touch swipe on testimonials
    var tStartX = 0;
    var tStartY = 0;
    grid.addEventListener('touchstart', function (e) {
        tStartX = e.changedTouches[0].clientX;
        tStartY = e.changedTouches[0].clientY;
        stopAuto();
    }, { passive: true });

    grid.addEventListener('touchend', function (e) {
        var dx = tStartX - e.changedTouches[0].clientX;
        var dy = tStartY - e.changedTouches[0].clientY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                currentPage = (currentPage + 1) % totalPages;
            } else {
                currentPage = (currentPage - 1 + totalPages) % totalPages;
            }
            slide();
        }
        startAuto();
    }, { passive: true });

    // Pause on hover (desktop)
    grid.addEventListener('mouseenter', stopAuto);
    grid.addEventListener('mouseleave', startAuto);

    // Recalc on resize
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            buildDots();
            slide();
        }, 250);
    });

    buildDots();
    slide();
    startAuto();
}

/* ========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ======================================== */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.trust-card, .footer-col').forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/* ========================================
   COUNT-UP ANIMATION
   ======================================== */
function initCountUp() {
    if (!('IntersectionObserver' in window)) return;

    var numbers = document.querySelectorAll('.trust-number');
    if (!numbers.length) return;

    var done = false;
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !done) {
                done = true;
                numbers.forEach(function (el) {
                    var text = el.textContent.trim();
                    var num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                    var suffix = text.replace(/[0-9]/g, '').trim();
                    var start = null;
                    var duration = 2500;

                    function step(ts) {
                        if (!start) start = ts;
                        var p = Math.min((ts - start) / duration, 1);
                        // Cubic ease-in-out: slow start, fast middle, slow end
                        var ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                        el.textContent = Math.floor(ease * num) + suffix;
                        if (p < 1) requestAnimationFrame(step);
                        else el.textContent = text;
                    }
                    requestAnimationFrame(step);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    var section = document.querySelector('.trust-section');
    if (section) observer.observe(section);
}

/* ========================================
   TICKER PAUSE
   ======================================== */
function initTickerPause() {
    var track = document.querySelector('.ticker-track');
    if (!track) return;
    track.addEventListener('mouseenter', function () {
        track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', function () {
        track.style.animationPlayState = 'running';
    });
}

/* ========================================
   CONTACT BAR TOGGLE
   ======================================== */
function initContactToggle() {
    var btn = document.getElementById('contactToggle');
    var bar = document.getElementById('contactBar');
    if (!btn || !bar) return;

    btn.addEventListener('click', function () {
        bar.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !bar.contains(e.target)) {
            bar.classList.remove('active');
        }
    });
}

/* ========================================
   CONTACT FORM
   ======================================== */
function initContactForm() {
    var form = document.getElementById('contactForm');
    var msg = document.getElementById('formSuccessMessage');
    if (!form || !msg) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        console.log('Form submitted:', data);

        msg.classList.add('show');
        form.reset();
        setTimeout(function () { msg.classList.remove('show'); }, 10000);
        msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/* ========================================
   SCROLL TO CONTACT
   ======================================== */
function initScrollToContact() {
    document.querySelectorAll('.scroll-to-contact').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });
}

/* ========================================
   SMOOTH ANCHOR LINKS
   ======================================== */
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') return;
            // Skip if handled by scroll-to-contact
            if (this.classList.contains('scroll-to-contact')) return;

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });
}

/* ========================================
   FLOATING CONTACT BOX (tap to expand on mobile)
   ======================================== */
function initFloatingContact() {
    var box = document.querySelector('.floating-contact-box');
    if (!box) return;

    box.addEventListener('click', function (e) {
        // Only toggle on mobile/tablet
        if (window.innerWidth < 900) {
            e.stopPropagation();
            box.classList.toggle('expanded');
        }
    });

    // Close when tapping outside
    document.addEventListener('click', function (e) {
        if (!box.contains(e.target)) {
            box.classList.remove('expanded');
        }
    });
}
