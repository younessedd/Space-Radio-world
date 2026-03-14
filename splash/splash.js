document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stars');
    const ctx = canvas.getContext('2d');
    const enterBtn = document.getElementById('enterBtn');
    const splashScreen = document.getElementById('splash');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const stars = [];
    const numStars = 400;
    const shootingStars = [];
    
    class Star {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.twinklePhase += this.twinkleSpeed;
            this.opacity = 0.5 + Math.sin(this.twinklePhase) * 0.5;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
            
            if (this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.3})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }
    
    class ShootingStar {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.5;
            this.speed = Math.random() * 10 + 15;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
            this.length = Math.random() * 100 + 50;
            this.opacity = 1;
            this.active = true;
        }
        
        update() {
            if (!this.active) return;
            
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= 0.02;
            
            if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
                this.active = false;
            }
        }
        
        draw() {
            if (!this.active) return;
            
            const endX = this.x - Math.cos(this.angle) * this.length;
            const endY = this.y - Math.sin(this.angle) * this.length;
            
            const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
    
    let lastShootingStar = 0;
    
    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        if (timestamp - lastShootingStar > 3000 + Math.random() * 5000) {
            const inactiveShootingStar = shootingStars.find(s => !s.active);
            if (inactiveShootingStar) {
                inactiveShootingStar.reset();
            } else if (shootingStars.length < 5) {
                shootingStars.push(new ShootingStar());
            }
            lastShootingStar = timestamp;
        }
        
        shootingStars.forEach(shootingStar => {
            shootingStar.update();
            shootingStar.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
    
    enterBtn.addEventListener('click', () => {
        splashScreen.classList.add('hidden');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 800);
    });
    
    setTimeout(() => {
        enterBtn.style.pointerEvents = 'auto';
    }, 3000);
});
