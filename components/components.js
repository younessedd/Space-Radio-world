document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollReveal();
    initThemeToggle();
});

function initNavigation() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    console.log('Burger button found:', mobileMenuBtn);
    console.log('Nav links found:', navLinks);

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            console.log('Burger button clicked!');
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            console.log('Classes after toggle:', {
                burger: mobileMenuBtn.className,
                nav: navLinks.className
            });
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    } else {
        console.error('Burger button or nav links not found!');
    }

    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-header, .station-card, .show-card, .music-card, .review-card, .stat-card, .forecast-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(`${savedTheme}-mode`);

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        
        document.body.classList.remove('dark-mode', 'light-mode');
        document.body.classList.add(isDark ? 'light-mode' : 'dark-mode');
        
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
}

window.addEventListener('scroll', () => {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
});
