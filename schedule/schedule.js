document.addEventListener('DOMContentLoaded', () => {
    const scheduleContent = document.getElementById('scheduleContent');
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    
    const emojiIcons = {
        '🌅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>',
        '⚡': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        '☀️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        '🎵': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        '🌆': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/></svg>',
        '🌙': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        '💻': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
        '🎷': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 2 4 4 4 8v8c0 4 4 6 8 6s8-2 8-6V8c0-4-4-6-8-6z"/><path d="M4 8c0 0 4-2 8-2s8 2 8 2"/></svg>',
        '🎸': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        '📰': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V6.414a2 2 0 0 1 .293-.707l5.414-5.414a2 2 0 0 1 2.828 0l.828.828a2 2 0 0 0 1.414.293V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"/></svg>',
        '🎉': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10l4.24 4.24"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>',
        '🚀': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5.5-2c.74 0 1.26.5 2 1s3.74 1.5 5.5 1.5 4.5-1.5 5.5-1.5c1.76 1.5 5.5 2 5.5 2s-.5-3.74-2-5c-.74-.5-1.26-1-2-2s-3.74-1.5-5.5-1.5-4.5 1.5-5.5 1.5c-.74 0-1.26-.5-2-1s-3.74-.76-5.5-.76z"/><path d="M12 16c4-1.5 6-4 6-4s-2-2.5-6-4-6 4-6 4 2 2.5 6 4z"/></svg>',
        '🌞': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        '🏖️': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>',
        '🎹': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="6" y1="7" x2="6" y2="7.01"/><line x1="10" y1="7" x2="10" y2="7.01"/><line x1="14" y1="7" x2="14" y2="7.01"/><line x1="18" y1="7" x2="18" y2="7.01"/></svg>',
        '🪐': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
        '🍳': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a8 8 0 0 1 16 0 8 8 0 0 1-16 0"/><path d="M12 12V8"/><circle cx="12" cy="14" r="2"/></svg>',
        '🎻': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 4l-8 8 8 8"/><path d="M16 8l-8 8"/></svg>',
        '🌊': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
        '📅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    };
    
    const djIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
    
    const scheduleData = {
        monday: [
            { time: '6:00 AM', show: 'Cosmic Morning', dj: 'DJ Starwave', emoji: '🌅' },
            { time: '10:00 AM', show: 'Morning Boost', dj: 'DJ Solar', emoji: '⚡' },
            { time: '12:00 PM', show: 'Midday Orbit', dj: 'DJ Nebula', emoji: '☀️' },
            { time: '3:00 PM', show: 'Afternoon Escape', dj: 'DJ Pulse', emoji: '🎵' },
            { time: '6:00 PM', show: 'Evening Chill', dj: 'DJ Luna', emoji: '🌆' },
            { time: '8:00 PM', show: 'Starlight Sessions', dj: 'DJ Aurora', emoji: '🌙' }
        ],
        tuesday: [
            { time: '6:00 AM', show: 'Cosmic Morning', dj: 'DJ Starwave', emoji: '🌅' },
            { time: '10:00 AM', show: 'Tech Talk Radio', dj: 'DJ Byte', emoji: '💻' },
            { time: '12:00 PM', show: 'Midday Orbit', dj: 'DJ Nebula', emoji: '☀️' },
            { time: '3:00 PM', show: 'Jazz Journey', dj: 'DJ Sax', emoji: '🎷' },
            { time: '6:00 PM', show: 'Evening Chill', dj: 'DJ Luna', emoji: '🌆' },
            { time: '8:00 PM', show: 'Starlight Sessions', dj: 'DJ Aurora', emoji: '🌙' }
        ],
        wednesday: [
            { time: '6:00 AM', show: 'Cosmic Morning', dj: 'DJ Starwave', emoji: '🌅' },
            { time: '10:00 AM', show: 'Morning Boost', dj: 'DJ Solar', emoji: '⚡' },
            { time: '12:00 PM', show: 'Midday Orbit', dj: 'DJ Nebula', emoji: '☀️' },
            { time: '3:00 PM', show: 'Rock Legends', dj: 'DJ Guitar', emoji: '🎸' },
            { time: '6:00 PM', show: 'Evening Chill', dj: 'DJ Luna', emoji: '🌆' },
            { time: '8:00 PM', show: 'Starlight Sessions', dj: 'DJ Aurora', emoji: '🌙' }
        ],
        thursday: [
            { time: '6:00 AM', show: 'Cosmic Morning', dj: 'DJ Starwave', emoji: '🌅' },
            { time: '10:00 AM', show: 'News Hour', dj: 'DJ News', emoji: '📰' },
            { time: '12:00 PM', show: 'Midday Orbit', dj: 'DJ Nebula', emoji: '☀️' },
            { time: '3:00 PM', show: 'Afternoon Escape', dj: 'DJ Pulse', emoji: '🎵' },
            { time: '6:00 PM', show: 'Evening Chill', dj: 'DJ Luna', emoji: '🌆' },
            { time: '8:00 PM', show: 'Starlight Sessions', dj: 'DJ Aurora', emoji: '🌙' }
        ],
        friday: [
            { time: '6:00 AM', show: 'Cosmic Morning', dj: 'DJ Starwave', emoji: '🌅' },
            { time: '10:00 AM', show: 'Morning Boost', dj: 'DJ Solar', emoji: '⚡' },
            { time: '12:00 PM', show: 'Midday Orbit', dj: 'DJ Nebula', emoji: '☀️' },
            { time: '3:00 PM', show: 'Friday Warmup', dj: 'DJ Beat', emoji: '🎵' },
            { time: '6:00 PM', show: 'Weekend Preview', dj: 'DJ Nova', emoji: '🎉' },
            { time: '8:00 PM', show: 'Friday Night Live', dj: 'DJ Supernova', emoji: '🚀' }
        ],
        saturday: [
            { time: '8:00 AM', show: 'Weekend Morning', dj: 'DJ Starwave', emoji: '🌞' },
            { time: '10:00 AM', show: 'Chill Vibes', dj: 'DJ Wave', emoji: '🏖️' },
            { time: '12:00 PM', show: 'Saturday Mix', dj: 'DJ Pulse', emoji: '🎵' },
            { time: '3:00 PM', show: 'Electronic Hour', dj: 'DJ Synth', emoji: '🎹' },
            { time: '6:00 PM', show: 'Weekend Blastoff', dj: 'DJ Supernova', emoji: '🚀' },
            { time: '10:00 PM', show: 'Late Night Grooves', dj: 'DJ Void', emoji: '🪐' }
        ],
        sunday: [
            { time: '8:00 AM', show: 'Sunday Morning', dj: 'DJ Starwave', emoji: '🌞' },
            { time: '10:00 AM', show: 'Acoustic Sessions', dj: 'DJ Guitar', emoji: '🎸' },
            { time: '12:00 PM', show: 'Sunday Brunch', dj: 'DJ Luna', emoji: '🍳' },
            { time: '2:00 PM', show: 'Classical Hour', dj: 'DJ Classic', emoji: '🎻' },
            { time: '4:00 PM', show: 'Sunday Chill', dj: 'DJ Wave', emoji: '🌊' },
            { time: '6:00 PM', show: 'Week Prep', dj: 'DJ Nova', emoji: '📅' }
        ]
    };
    
    function renderSchedule(day) {
        const items = scheduleData[day];
        scheduleContent.innerHTML = items.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-info">
                    <div class="schedule-show">${item.show}</div>
                    <div class="schedule-dj">${djIcon} ${item.dj}</div>
                </div>
                <div class="schedule-emoji">${emojiIcons[item.emoji]}</div>
            </div>
        `).join('');
    }
    
    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderSchedule(tab.dataset.day);
        });
    });
    
    renderSchedule('monday');
});
