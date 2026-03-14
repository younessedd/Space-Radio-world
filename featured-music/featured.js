document.addEventListener('DOMContentLoaded', () => {
    const musicGrid = document.getElementById('musicGrid');
    
    const emojiIcons = {
        '⭐': '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        '🪐': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
        '💫': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>',
        '🌙': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        '☀️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        '🌕': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
        '🌌': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
        '📡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.93 4.93l14.14 14.14M2 12h2m16 0h2M12 2v2m0 16v2"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" opacity="0.3"/></svg>'
    };
    
    const tracks = [
        { title: 'Starlight Symphony', artist: 'Aurora Beats', emoji: '⭐' },
        { title: 'Cosmic Dance', artist: 'Galaxy Groove', emoji: '🪐' },
        { title: 'Neon Dreams', artist: 'Synth Wave', emoji: '💫' },
        { title: 'Midnight Orbit', artist: 'Night Sky', emoji: '🌙' },
        { title: 'Solar Flare', artist: 'Sun Burst', emoji: '☀️' },
        { title: 'Lunar Echo', artist: 'Moon Sound', emoji: '🌕' },
        { title: 'Nebula Nights', artist: 'Space Cadet', emoji: '🌌' },
        { title: 'Pulsar Beat', artist: 'Radio Star', emoji: '📡' }
    ];
    
    musicGrid.innerHTML = tracks.map((track, index) => `
        <div class="music-card">
            <div class="music-rank">${index + 1}</div>
            <div class="music-cover">${emojiIcons[track.emoji]}</div>
            <div class="music-info">
                <div class="music-title">${track.title}</div>
                <div class="music-artist">${track.artist}</div>
            </div>
        </div>
    `).join('');
});
