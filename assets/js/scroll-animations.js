/**
 * Scroll Animation System
 * Modern ES6 scroll animations with Intersection Observer
 * Uses requestAnimationFrame for GPU-accelerated parallax/rotation
 */
(function() {
    'use strict';

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08
    };

    // ============================================
    // Intersection Observer for entry animations
    // ============================================
    const entryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            } else {
                entry.target.classList.remove('animated');
            }
        });
    }, observerOptions);

    const animateOnEnter = document.querySelectorAll(
        '.fade-in, .slide-left, .slide-right, .slide-up, .slide-down, .scale-in, .rotate-on-scroll, .magnetic, .blur-in, .reveal-up'
    );
    animateOnEnter.forEach(el => entryObserver.observe(el));

    // ============================================
    // Stagger animations for containers
    // ============================================
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                const items = entry.target.querySelectorAll('.stagger-item');
                items.forEach((item, index) => {
                    setTimeout(() => item.classList.add('animated'), index * 60);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stagger-container').forEach(container => {
        staggerObserver.observe(container);
    });

    // ============================================
    // Parallax scrolling with requestAnimationFrame
    // ============================================
    const parallaxElements = document.querySelectorAll('.parallax, [data-parallax]');
    let parallaxTicking = false;

    function updateParallax() {
        const scrollY = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.25;
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const offset = (scrollY - elementTop) * speed;
            el.style.transform = `translateY(${offset}px)`;
        });
        
        parallaxTicking = false;
    }

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            if (!parallaxTicking) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        }, { passive: true });
        
        updateParallax();
    }

    // ============================================
    // Scroll Rotation with requestAnimationFrame
    // ============================================
    const rotateElements = document.querySelectorAll('.rotate-on-scroll');
    let rotateTicking = false;

    function updateRotation() {
        const windowHeight = window.innerHeight;
        
        rotateElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = elementCenter - viewportCenter;
            const maxRotation = 12;
            const rotation = Math.max(-maxRotation, Math.min(maxRotation, distance * 0.02));
            
            if (el.classList.contains('animated')) {
                el.style.transform = `rotate(${rotation}deg) scale(1)`;
            }
        });
        
        rotateTicking = false;
    }

    if (rotateElements.length > 0) {
        window.addEventListener('scroll', () => {
            if (!rotateTicking) {
                requestAnimationFrame(updateRotation);
                rotateTicking = true;
            }
        }, { passive: true });
        
        updateRotation();
    }

    // ============================================
    // Magnetic/Elastic cursor effect
    // ============================================
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        
        el.addEventListener('mousemove', (e) => {
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });

    // ============================================
    // Initialize existing revealed elements
    // ============================================
    document.querySelectorAll('.reveal.revealed, .scroll-reveal.revealed').forEach(el => {
        el.classList.add('animated');
    });

})();
