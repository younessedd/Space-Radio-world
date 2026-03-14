document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-stars');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const stars = [];
    const numStars = 200;
    
    class Star {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.twinklePhase += this.twinkleSpeed;
            this.opacity = 0.3 + Math.sin(this.twinklePhase) * 0.4;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                animateCounter(statNumber);
                observer.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    const listenLiveBtn = document.getElementById('listenLiveBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    
    if (listenLiveBtn) {
        listenLiveBtn.addEventListener('click', () => {
            const radioSection = document.getElementById('radio');
            if (radioSection) {
                radioSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const weatherSection = document.getElementById('weather');
            if (weatherSection) {
                weatherSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
