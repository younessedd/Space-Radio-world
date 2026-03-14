document.addEventListener('DOMContentLoaded', () => {
    const showsGrid = document.getElementById('showsGrid');
    
    const shows = [
        { title: 'Cosmic Morning', dj: 'DJ Starwave', time: '6:00 AM - 10:00 AM', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop', description: 'Start your day with uplifting beats and cosmic energy.' },
        { title: 'Midday Orbit', dj: 'DJ Nebula', time: '12:00 PM - 3:00 PM', image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop', description: 'Smooth grooves to keep you energized through the day.' },
        { title: 'Afternoon Escape', dj: 'DJ Pulse', time: '3:00 PM - 6:00 PM', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop', description: 'Wind down with chill vibes and ambient soundscapes.' },
        { title: 'Starlight Sessions', dj: 'DJ Aurora', time: '8:00 PM - 12:00 AM', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop', description: 'Evening electronica with deep bass and atmospheric tracks.' },
        { title: 'Deep Space Radio', dj: 'DJ Void', time: '12:00 AM - 4:00 AM', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop', description: 'Experimental sounds from the edge of the universe.' },
        { title: 'Weekend Blastoff', dj: 'DJ Supernova', time: 'Saturday 6PM - 10PM', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop', description: 'High-energy weekend mixes to launch your Saturday night.' }
    ];
    
    const djIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
    const timeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    
    showsGrid.innerHTML = shows.map(show => `
        <div class="show-card">
            <div class="show-image">
                <img src="${show.image}" alt="${show.title}">
            </div>
            <div class="show-content">
                <h3 class="show-title">${show.title}</h3>
                <p class="show-dj">${djIcon} ${show.dj}</p>
                <p class="show-time">${timeIcon} ${show.time}</p>
                <p class="show-description">${show.description}</p>
            </div>
        </div>
    `).join('');
});
