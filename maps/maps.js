document.addEventListener('DOMContentLoaded', () => {
    const locationsGrid = document.getElementById('locationsGrid');
    
    const locations = [
        { city: 'New York', address: 'Times Square, NY 10036', emoji: '🇺🇸', lat: 40.7580, lng: -73.9855 },
        { city: 'London', address: 'Oxford Street, London', emoji: '🇬🇧', lat: 51.5152, lng: -0.1419 },
        { city: 'Tokyo', address: 'Shibuya, Tokyo', emoji: '🇯🇵', lat: 35.6595, lng: 139.7004 },
        { city: 'Paris', address: 'Champs-Élysées, Paris', emoji: '🇫🇷', lat: 48.8698, lng: 2.3078 },
        { city: 'Sydney', address: 'Sydney Opera House', emoji: '🇦🇺', lat: -33.8568, lng: 151.2153 },
        { city: 'Berlin', address: 'Alexanderplatz, Berlin', emoji: '🇩🇪', lat: 52.5219, lng: 13.4132 }
    ];
    
    locationsGrid.innerHTML = locations.map((loc, index) => `
        <div class="location-card" data-index="${index}">
            <h4>${loc.emoji} ${loc.city}</h4>
            <p>${loc.address}</p>
        </div>
    `).join('');
    
    let map;
    
    const mapContainer = document.getElementById('map');
    if (mapContainer && typeof L !== 'undefined') {
        // Initialize map with touch interactions disabled
        map = L.map('map', { 
            scrollWheelZoom: false,
            touchZoom: false,
            dragging: false,
            tap: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: true
        }).setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        locations.forEach(loc => {
            L.marker([loc.lat, loc.lng])
                .addTo(map)
                .bindPopup(`<b>${loc.emoji} ${loc.city}</b><br>${loc.address}`);
        });
        
        // Enable touch interactions only when user clicks on map
        let isMapActive = false;
        
        mapContainer.addEventListener('click', (e) => {
            // Only enable if clicking directly on map container
            if (e.target === mapContainer || mapContainer.contains(e.target)) {
                if (!isMapActive) {
                    map.touchZoom.enable();
                    map.dragging.enable();
                    map.tap.enable();
                    map.doubleClickZoom.enable();
                    map.boxZoom.enable();
                    map.keyboard.enable();
                    isMapActive = true;
                }
            }
        });
        
        // Disable interactions when clicking outside map
        document.addEventListener('click', (e) => {
            if (!mapContainer.contains(e.target)) {
                map.touchZoom.disable();
                map.dragging.disable();
                map.tap.disable();
                map.doubleClickZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();
                isMapActive = false;
            }
        });
        
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                const loc = locations[index];
                map.setView([loc.lat, loc.lng], 12);
            });
        });
    } else if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;background:linear-gradient(135deg,#0a0a0f,#1a1a2e);">
                <div style="font-size:4rem;">🗺️</div>
                <p style="color:var(--text-muted);">Interactive map powered by Leaflet</p>
                <p style="color:var(--text-muted);font-size:0.875rem;">Add your API key for full functionality</p>
            </div>
        `;
    }
});
