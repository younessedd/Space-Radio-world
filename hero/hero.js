document.addEventListener('DOMContentLoaded', () => {
    const heroStatNumbers = document.querySelectorAll('.hero-stats .stat-number');
    
    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        if (isNaN(target)) return;
        
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
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    heroStatNumbers.forEach(stat => observer.observe(stat));
    
    function startLiveListenerSimulation() {
        const listenersCount = document.getElementById('listeners-count');
        if (!listenersCount) return;
        
        setInterval(() => {
            const currentText = listenersCount.textContent;
            const current = parseInt(currentText.replace(/[^0-9]/g, ''));
            if (isNaN(current)) return;
            
            const change = Math.floor(Math.random() * 201) - 100;
            const newCount = Math.max(45000, Math.min(55000, current + change));
            listenersCount.textContent = newCount.toLocaleString();
        }, 4000);
    }
    
    setTimeout(startLiveListenerSimulation, 2500);
    
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
