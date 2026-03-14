document.addEventListener('DOMContentLoaded', () => {
    const musicGrid = document.getElementById('musicGrid');
    
    const emojiIcons = {
        '⭐': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13" stroke="url(#starGrad1)"/><circle cx="6" cy="18" r="3" fill="#fbbf24"/><circle cx="18" cy="16" r="3" fill="#fbbf24"/><defs><linearGradient id="starGrad1" x1="9" y1="5" x2="21" y2="16"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs></svg>',
        '🪐': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8"/><ellipse cx="12" cy="12" rx="9" ry="3" transform="rotate(-30 12 12)" stroke="url(#saturnGrad)"/><defs><linearGradient id="saturnGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs></svg>',
        '💫': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2" fill="#c084fc"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke-linecap="round" stroke="#c084fc"/></svg>',
        '🌙': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24"/><circle cx="12" cy="12" r="3" fill="#fbbf24" opacity="0.5"/></svg>',
        '☀️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="6" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444"/><path d="M12 2v3M12 19v3M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h3M21 12h3M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round" stroke="#ef4444"/><circle cx="12" cy="12" r="2" fill="#ef4444"/></svg>',
        '🌕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9" fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8"/><circle cx="12" cy="12" r="3" fill="#e2e8f0"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="#94a3b8" stroke-linecap="round"/></svg>',
        '🌌': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12c0 0 2-2 4-2 2.5 0 3 2 6 2 2.5 0 2.5-2 5-2 2 0 3 1 4 2" stroke-linecap="round" opacity="0.6" stroke="#818cf8"/><path d="M3 8c0 0 2-2 4-2 2.5 0 3 2 6 2 2.5 0 2.5-2 5-2 2 0 3 1 4 2" stroke-linecap="round" opacity="0.8" stroke="#a78bfa"/><path d="M3 16c0 0 2-2 4-2 2.5 0 3 2 6 2 2.5 0 2.5-2 5-2 2 0 3 1 4 2" stroke-linecap="round" opacity="0.8" stroke="#c084fc"/><path d="M3 20c0 0 2-2 4-2 2.5 0 3 2 6 2 2.5 0 2.5-2 5-2 2 0 3 1 4 2" stroke-linecap="round" opacity="0.6" stroke="#f472b6"/></svg>',
        '📡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2" fill="#22c55e"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-linecap="round" stroke="#22c55e"/><circle cx="12" cy="12" r="5" stroke="#22c55e" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="8" stroke="#22c55e" stroke-dasharray="2 3" opacity="0.4"/></svg>'
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
