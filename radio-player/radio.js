document.addEventListener('DOMContentLoaded', () => {
    const stationsGrid = document.getElementById('stationsGrid');
    const stationSearch = document.getElementById('stationSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchBtn = document.getElementById('searchBtn');
    const locateBtn = document.getElementById('locateBtn');
    const countryFilter = document.getElementById('countryFilter');
    const genreBtns = document.querySelectorAll('.genre-btn');
    const audioPlayer = document.getElementById('audioPlayer');
    const playerBar = document.getElementById('playerBar');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentStation = document.getElementById('currentStation');
    const currentGenre = document.getElementById('currentGenre');
    const currentLogo = document.getElementById('currentLogo');
    const audioVisualizer = document.getElementById('audioVisualizer');

    let currentStationData = null;
    let isPlaying = false;
    let searchTimeout = null;
    let allStations = [];
    let currentPage = 1;
    const stationsPerPage = 20;
    let userLocation = null;
    let isLocating = false;

    const API_BASE = 'https://de1.api.radio-browser.info/json';

    // Touch swipe variables
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isScrolling = false;
    let scrollTimeout = null;

    // Debounce function
    function debounce(func, wait) {
        return function executedFunction(...args) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Calculate distance between two coordinates (Haversine formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Sort stations by relevance: exact match > close match > popularity > geo location
    function sortStations(stations, searchTerm) {
        const term = searchTerm.toLowerCase();
        
        return stations.map(station => {
            const name = (station.name || '').toLowerCase();
            const tags = (station.tags || '').toLowerCase();
            const country = (station.country || '').toLowerCase();
            const city = (station.city || '').toLowerCase();
            
            let score = 0;
            
            // Exact match (starts with search term)
            if (name.startsWith(term)) score += 100;
            else if (name.includes(term)) score += 50;
            
            // Tag match
            if (tags.includes(term)) score += 30;
            
            // Country/City match
            if (country.includes(term) || city.includes(term)) score += 20;
            
            // Popularity (click count)
            score += (station.clickcount || 0) / 100;
            
            // Geo proximity (if user location available)
            if (userLocation && station.geo_lat && station.geo_long) {
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lon,
                    station.geo_lat, station.geo_long
                );
                // Closer stations get higher score (max 10 points for stations within 100km)
                if (distance < 100) score += 10 - (distance / 10);
            }
            
            return { ...station, _score: score };
        }).sort((a, b) => b._score - a._score);
    }

    // Highlight matching text
    function highlightMatch(text, searchTerm) {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Get country flag emoji
    function getCountryFlag(countryCode) {
        if (!countryCode) return '🌍';
        const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    async function fetchStations(search = '', genre = '', limit = 20, country = '', offset = 0) {
        let url = `${API_BASE}/stations/search?limit=${limit}&hidebroken=true&order=clickcount&reverse=true&offset=${offset}`;
        
        if (search) {
            url += `&name=${encodeURIComponent(search)}`;
        }
        
        if (genre) {
            url += `&tag=${encodeURIComponent(genre)}`;
        }

        if (country) {
            url += `&countrycode=${encodeURIComponent(country)}`;
        }
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching stations:', error);
            return [];
        }
    }

    async function fetchAllStations() {
        try {
            const response = await fetch(`${API_BASE}/stations/search?limit=200&hidebroken=true&order=clickcount&reverse=true`);
            allStations = await response.json();
        } catch (error) {
            console.error('Error fetching all stations:', error);
        }
    }

    function showSuggestions(matches, searchTerm) {
        if (matches.length === 0 || stationSearch.value.trim() === '') {
            searchSuggestions.style.display = 'none';
            return;
        }

        const sortedMatches = sortStations(matches, searchTerm).slice(0, 10);

        searchSuggestions.innerHTML = sortedMatches.map(station => {
            const flag = getCountryFlag(station.countrycode);
            const highlightedName = highlightMatch(station.name, searchTerm);
            const genre = (station.tags || 'Various').split(',')[0] || 'Various';
            
            return `
                <div class="suggestion-item" data-url="${station.url_resolved || station.url}" data-name="${station.name}" data-genre="${station.tags || 'Various'}" data-logo="${station.favicon || ''}" data-lat="${station.geo_lat || ''}" data-lon="${station.geo_long || ''}">
                    <div class="suggestion-logo">
                        ${station.favicon ? `<img src="${station.favicon}" alt="" onerror="this.parentElement.innerHTML='<span>📻</span>'">` : '<span>📻</span>'}
                    </div>
                    <div class="suggestion-info">
                        <span class="suggestion-name">${highlightedName}</span>
                        <span class="suggestion-location">${flag} ${station.country || ''} ${station.city ? '• ' + station.city : ''}</span>
                    </div>
                    <span class="suggestion-genre">${genre}</span>
                </div>
            `;
        }).join('');

        searchSuggestions.style.display = 'block';
        searchSuggestions.style.opacity = '1';
        searchSuggestions.style.transform = 'translateY(0)';

        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                stationSearch.value = item.dataset.name;
                searchSuggestions.style.display = 'none';
                playStationFromData(item.dataset);
            });
        });
    }

    function filterStations(searchTerm) {
        if (!searchTerm || allStations.length === 0) {
            showSuggestions([], '');
            return;
        }

        const term = searchTerm.toLowerCase();
        const matches = allStations.filter(station => 
            (station.name && station.name.toLowerCase().includes(term)) ||
            (station.tags && station.tags.toLowerCase().includes(term)) ||
            (station.country && station.country.toLowerCase().includes(term)) ||
            (station.city && station.city.toLowerCase().includes(term))
        );

        showSuggestions(matches, searchTerm);
    }

    const debouncedFilter = debounce((value) => {
        filterStations(value);
    }, 300);

    stationSearch.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        if (value.length < 1) {
            searchSuggestions.style.display = 'none';
            return;
        }

        debouncedFilter(value);
    });

    stationSearch.addEventListener('blur', () => {
        setTimeout(() => {
            searchSuggestions.style.display = 'none';
        }, 200);
    });

    stationSearch.addEventListener('focus', () => {
        if (stationSearch.value.trim().length >= 1 && allStations.length > 0) {
            filterStations(stationSearch.value.trim());
        }
    });

    // Geolocation functionality - only if locateBtn exists
    if (locateBtn) {
        locateBtn.addEventListener('click', async () => {
            if (isLocating) return;
            
            if (userLocation) {
                userLocation = null;
                locateBtn.classList.remove('active');
                showToastNotification('Location disabled', 'info');
                return;
            }
            
            if (!navigator.geolocation) {
                showToastNotification('Geolocation not supported', 'error');
                return;
            }
            
            isLocating = true;
            locateBtn.classList.add('active');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    isLocating = false;
                    locateBtn.classList.add('active');
                    showToastNotification('Location enabled - nearby stations prioritized', 'success');
                    
                    if (stationSearch.value.trim()) {
                        performSearch(stationSearch.value.trim());
                    } else {
                        loadStations();
                    }
                },
                (error) => {
                    isLocating = false;
                    locateBtn.classList.remove('active');
                    showToastNotification('Could not detect location', 'error');
                }
            );
        });
    }

    function performSearch(searchTerm) {
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter ? countryFilter.value : '';
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        
        fetchStations(searchTerm, activeGenre, 20, country).then(stations => {
            const sorted = sortStations(stations, searchTerm);
            renderStations(sorted, stations.length);
        });
    }

    function playStationFromData(data) {
        const card = document.createElement('div');
        card.dataset.url = data.url;
        card.dataset.name = data.name;
        card.dataset.genre = data.genre;
        card.dataset.logo = data.logo;
        playStation(card);
    }

    function renderStations(stations, totalCount = 0) {
        if (stations.length === 0) {
            stationsGrid.innerHTML = '<p class="no-results">No stations found. Try a different search.</p>';
            document.getElementById('paginationControls')?.remove();
            return;
        }

        stationsGrid.innerHTML = stations.map((station, index) => `
            <div class="station-card" data-url="${station.url_resolved || station.url}" data-name="${station.name}" data-genre="${station.tags || 'Various'}" data-logo="${station.favicon || ''}" data-lat="${station.geo_lat || ''}" data-lon="${station.geo_long || ''}" data-country="${station.country || ''}" data-city="${station.city || ''}" data-index="${index}">
                <div class="station-logo-container">
                    ${station.favicon ? `<img src="${station.favicon}" alt="${station.name}" onerror="this.parentElement.innerHTML='<span>📻</span>'">` : '<span>📻</span>'}
                </div>
                <h3 class="station-name">${station.name}</h3>
                <p class="station-genre"><span>${(station.tags || 'Various').split(',')[0]}</span></p>
                ${station.country ? `<p class="station-location">${getCountryFlag(station.countrycode)} ${station.country}</p>` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.station-card').forEach(card => {
            card.addEventListener('click', () => playStation(card));
        });

        renderPagination(totalCount);
    }

    function renderPagination(totalCount) {
        const existingPagination = document.getElementById('paginationControls');
        if (existingPagination) {
            existingPagination.remove();
        }

        const totalPages = Math.ceil(totalCount / stationsPerPage);
        if (totalPages <= 1) return;

        const pagination = document.createElement('div');
        pagination.id = 'paginationControls';
        pagination.className = 'pagination-controls';
        
        let paginationHTML = '';
        
        if (currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">← Prev</button>`;
        }
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Next →</button>`;
        }

        pagination.innerHTML = paginationHTML;
        stationsGrid.after(pagination);

        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => goToPage(parseInt(btn.dataset.page)));
        });
    }

    function goToPage(page) {
        currentPage = page;
        const offset = (currentPage - 1) * stationsPerPage;
        const searchTerm = stationSearch.value.trim();
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter ? countryFilter.value : '';
        
        const radioSection = document.getElementById('radio');
        radioSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        fetchStations(searchTerm, activeGenre, stationsPerPage, country, offset).then(stations => {
            renderStations(stations, stations.length);
        });
    }

    function playStation(card) {
        const url = card.dataset.url;
        const name = card.dataset.name;
        const genre = card.dataset.genre;
        const logo = card.dataset.logo;

        document.querySelectorAll('.station-card').forEach(c => c.classList.remove('playing'));
        card.classList.add('playing');
        card.classList.add('loading');

        currentStationData = { url, name, genre, logo };
        
        currentStation.textContent = name;
        currentGenre.textContent = genre.split(',')[0];
        
        if (logo) {
            currentLogo.innerHTML = `<img src="${logo}" alt="${name}" onerror="this.parentElement.innerHTML='<span>📻</span>'">`;
        } else {
            currentLogo.innerHTML = '<span>📻</span>';
        }

        playerBar.classList.add('active');
        playerBar.classList.add('loading');
        
        audioPlayer.src = url;
        audioPlayer.volume = volumeSlider.value / 100;
        
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButton();
                audioVisualizer.classList.add('playing');
                card.classList.remove('loading');
                playerBar.classList.remove('loading');
            }).catch(error => {
                console.error('Error playing station:', error);
                showToastNotification('Loading station...', 'info');
                
                setTimeout(() => {
                    audioPlayer.src = url;
                    audioPlayer.volume = volumeSlider.value / 100;
                    audioPlayer.play().then(() => {
                        isPlaying = true;
                        updatePlayButton();
                        audioVisualizer.classList.add('playing');
                        card.classList.remove('loading');
                        playerBar.classList.remove('loading');
                    }).catch(err => {
                        console.error('Retry failed:', err);
                        showToastNotification('Unable to play this station', 'error');
                        card.classList.remove('loading');
                        playerBar.classList.remove('loading');
                    });
                }, 2000);
            });
        }
    }

    function showToastNotification(message, type = 'success') {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        const icon = type === 'error' ? '✕' : '✓';
        const title = type === 'error' ? 'Playback Error' : 'Success';
        
        toast.innerHTML = `
            <div class="toast-icon" style="background: ${type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)'}">${icon}</div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    function updatePlayButton() {
        const playIcon = playPauseBtn.querySelector('.play-icon');
        playIcon.textContent = isPlaying ? '⏸' : '▶';
    }

    playPauseBtn.addEventListener('click', () => {
        if (!currentStationData) return;

        const playIcon = playPauseBtn.querySelector('.play-icon');
        playIcon.style.opacity = '0.5';
        
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            audioVisualizer.classList.remove('playing');
            playIcon.textContent = '▶';
        } else {
            audioPlayer.play().then(() => {
                isPlaying = true;
                audioVisualizer.classList.add('playing');
                playIcon.textContent = '⏸';
            }).catch(error => {
                console.error('Error playing:', error);
                showToastNotification('Unable to play station', 'error');
            });
        }
        
        setTimeout(() => playIcon.style.opacity = '1', 100);
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    async function loadStations() {
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        
        // Load default stations immediately to ensure content is always shown
        const defaultStations = await fetchStations('', '', 20, 'US');
        renderStations(defaultStations, defaultStations.length);
        
        // Then try to get user location in background
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                
                userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                
                // Try to get country from coordinates
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lon}`);
                    const data = await response.json();
                    
                    if (data.address && data.address.country_code) {
                        const countryCode = data.address.country_code.toUpperCase();
                        if (countryFilter) {
                            countryFilter.value = countryCode;
                        }
                        showToastNotification(`Showing stations from ${data.address.country || 'Your Country'}`, 'success');
                        
                        // Load stations from user's country
                        const stations = await fetchStations('', '', 20, countryCode);
                        renderStations(stations, stations.length);
                    }
                } catch (e) {
                    console.log('Could not get country from location');
                    showToastNotification('Showing popular radio stations', 'info');
                }
            } catch (e) {
                // Location not available or denied - default stations already loaded
                console.log('Could not detect location, using default stations');
                showToastNotification('Showing popular radio stations', 'info');
            }
        } else {
            // Geolocation not supported - default stations already loaded
            showToastNotification('Showing popular radio stations', 'info');
        }
        
        await fetchAllStations();
    }

    searchBtn.addEventListener('click', async () => {
        const searchTerm = stationSearch.value.trim();
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter ? countryFilter.value : '';
        currentPage = 1;
        
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
        const sorted = sortStations(stations, searchTerm);
        renderStations(sorted, stations.length);
    });

    stationSearch.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const searchTerm = stationSearch.value.trim();
            const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
            const country = countryFilter ? countryFilter.value : '';
            currentPage = 1;
            
            stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
            const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
            const sorted = sortStations(stations, searchTerm);
            renderStations(sorted, stations.length);
        }
    });

    if (countryFilter) {
        countryFilter.addEventListener('change', async () => {
            const searchTerm = stationSearch.value.trim();
            const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
            const country = countryFilter.value;
            currentPage = 1;
            
            stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
            const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
            renderStations(stations, stations.length);
        });
    }

    genreBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            genreBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const genre = btn.dataset.genre;
            const searchTerm = stationSearch.value.trim();
            const country = countryFilter ? countryFilter.value : '';
            currentPage = 1;
            
            stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
            const stations = await fetchStations(searchTerm, genre, stationsPerPage, country);
            const sorted = sortStations(stations, searchTerm);
            renderStations(sorted, stations.length);
        });
    });

    loadStations();

    // ============================================
    // INFINITE RADIO CAROUSEL SYSTEM
    // ============================================
    
    const RadioCarousel = {
        // Configuration
        config: {
            transitionDuration: 400,
            swipeThreshold: 50,
            autoPlayDelay: 5000
        },
        
        // State
        state: {
            stations: [],
            currentIndex: 0,
            isAnimating: false,
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            containerWidth: 0,
            cardWidth: 0,
            gap: 16
        },
        
        // DOM Elements
        elements: {
            grid: null,
            audio: null
        },
        
        // Initialize the carousel
        init() {
            this.elements.grid = document.getElementById('stationsGrid');
            this.elements.audio = document.querySelector('audio');
            
            if (!this.elements.grid) return;
            
            this.state.stations = Array.from(
                this.elements.grid.querySelectorAll('.station-card')
            );
            
            if (this.state.stations.length === 0) return;
            
            this.calculateDimensions();
            this.setupEventListeners();
            this.updateCarouselPosition(false);
            this.updateActiveStation();
        },
        
        // Calculate card and container dimensions
        calculateDimensions() {
            const firstCard = this.state.stations[0];
            const gridStyle = getComputedStyle(this.elements.grid);
            
            this.state.cardWidth = firstCard.offsetWidth;
            this.state.gap = parseInt(gridStyle.gap) || 16;
            this.state.containerWidth = this.elements.grid.offsetWidth;
        },
        
        // Setup all event listeners
        setupEventListeners() {
            // Touch events for swipe
            this.elements.grid.addEventListener('touchstart', 
                this.handleTouchStart.bind(this), 
                { passive: true }
            );
            
            this.elements.grid.addEventListener('touchmove', 
                this.handleTouchMove.bind(this), 
                { passive: true }
            );
            
            this.elements.grid.addEventListener('touchend', 
                this.handleTouchEnd.bind(this), 
                { passive: true }
            );
            
            // Keyboard navigation
            document.addEventListener('keydown', this.handleKeyboard.bind(this));
            
            // Click on station card
            this.elements.grid.addEventListener('click', this.handleCardClick.bind(this));
            
            // Window resize
            window.addEventListener('resize', () => {
                this.calculateDimensions();
                this.updateCarouselPosition(false);
            });
        },
        
        // Handle touch start
        handleTouchStart(e) {
            this.state.touchStartX = e.changedTouches[0].screenX;
            this.state.touchStartY = e.changedTouches[0].screenY;
        },
        
        // Handle touch move
        handleTouchMove(e) {
            // Prevent vertical scroll interference
        },
        
        // Handle touch end
        handleTouchEnd(e) {
            this.state.touchEndX = e.changedTouches[0].screenX;
            this.state.touchEndY = e.changedTouches[0].screenY;
            
            this.handleSwipe();
        },
        
        // Handle swipe detection
        handleSwipe() {
            const deltaX = this.state.touchEndX - this.state.touchStartX;
            const deltaY = this.state.touchEndY - this.state.touchStartY;
            
            // Ignore vertical swipes
            if (Math.abs(deltaY) > Math.abs(deltaX)) return;
            
            if (Math.abs(deltaX) > this.config.swipeThreshold) {
                if (deltaX > 0) {
                    this.prevStation();
                } else {
                    this.nextStation();
                }
            }
        },
        
        // Handle keyboard navigation
        handleKeyboard(e) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextStation();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevStation();
            }
        },
        
        // Handle card click
        handleCardClick(e) {
            const card = e.target.closest('.station-card');
            if (!card) return;
            
            const index = this.state.stations.indexOf(card);
            if (index !== -1 && index !== this.state.currentIndex) {
                this.goToStation(index);
            }
        },
        
        // Go to next station
        nextStation() {
            this.state.currentIndex = (this.state.currentIndex + 1) % this.state.stations.length;
            this.updateCarouselPosition(true);
            this.updateActiveStation();
        },
        
        // Go to previous station
        prevStation() {
            this.state.currentIndex = (this.state.currentIndex - 1 + this.state.stations.length) % this.state.stations.length;
            this.updateCarouselPosition(true);
            this.updateActiveStation();
        },
        
        // Go to specific station
        goToStation(index) {
            if (this.state.isAnimating) return;
            
            this.state.currentIndex = index;
            this.updateCarouselPosition(true);
            this.updateActiveStation();
        },
        
        // Update carousel position with smooth animation
        updateCarouselPosition(animate = true) {
            const { currentIndex, cardWidth, gap } = this.state;
            const scrollPosition = currentIndex * (cardWidth + gap);
            
            this.elements.grid.style.scrollBehavior = animate ? 'smooth' : 'auto';
            this.elements.grid.scrollLeft = scrollPosition;
            
            // Handle animation state
            if (animate) {
                this.state.isAnimating = true;
                setTimeout(() => {
                    this.state.isAnimating = false;
                }, this.config.transitionDuration);
            }
        },
        
        // Update active station
        updateActiveStation() {
            // Remove active class from all stations
            this.state.stations.forEach(station => {
                station.classList.remove('active-station');
            });
            
            // Add active class to current station
            const currentStation = this.state.stations[this.state.currentIndex];
            if (currentStation) {
                currentStation.classList.add('active-station');
                this.playStation(currentStation);
            }
        },
        
        // Play station
        playStation(station) {
            const url = station.dataset.url;
            const name = station.dataset.name;
            const country = station.dataset.country || '';
            const city = station.dataset.city || '';
            
            if (!url || !this.elements.audio) return;
            
            // Load and play
            this.elements.audio.src = url;
            this.elements.audio.play().catch(err => {
                console.log('Auto-play prevented:', err.message);
            });
            
            // Update UI
            this.updatePlayerUI(name, country, city, station);
        },
        
        // Update player UI
        updatePlayerUI(name, country, city, station) {
            const playerBar = document.getElementById('playerBar');
            const nowPlayingName = document.getElementById('nowPlayingName');
            const currentLogo = document.getElementById('currentLogo');
            
            if (playerBar) playerBar.classList.add('active');
            if (nowPlayingName) {
                nowPlayingName.textContent = name;
            }
            
            // Update logo
            if (currentLogo) {
                const logoContainer = station.querySelector('.station-logo-container');
                if (logoContainer) {
                    const img = logoContainer.querySelector('img');
                    if (img && img.src) {
                        currentLogo.innerHTML = `<img src="${img.src}" alt="${name}">`;
                    } else {
                        currentLogo.innerHTML = '<span>📻</span>';
                    }
                }
            }
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for stations to be loaded
        setTimeout(() => {
            RadioCarousel.init();
            // Add scroll listener to detect centered card
            setTimeout(() => setupCenterDetection(), 600);
        }, 500);
    });
    
    // Also try to init after loadStations completes
    const originalLoadStations = loadStations;
    loadStations = async function() {
        await originalLoadStations.apply(this, arguments);
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            RadioCarousel.init();
            setTimeout(() => setupCenterDetection(), 600);
        }, 100);
    };
    
    // Detect which card is centered in viewport
    function setupCenterDetection() {
        const grid = document.getElementById('stationsGrid');
        if (!grid) return;
        
        const cards = grid.querySelectorAll('.station-card');
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].offsetWidth || 284;
        const gap = 16;
        
        function updateCenterCard() {
            const scrollLeft = grid.scrollLeft;
            const viewportCenter = grid.offsetWidth / 2;
            const scrollCenter = scrollLeft + viewportCenter;
            
            // Find card closest to center
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            cards.forEach((card, index) => {
                const cardCenter = card.offsetLeft + (cardWidth / 2);
                const distance = Math.abs(cardCenter - scrollCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            
            // Update active class
            cards.forEach((card, i) => {
                if (i === closestIndex) {
                    card.classList.add('active-station');
                    // Play station
                    const url = card.dataset.url;
                    const name = card.dataset.name;
                    const audio = document.querySelector('audio');
                    if (url && audio && audio.src !== url) {
                        audio.src = url;
                        audio.play().catch(() => {});
                        
                        const playerBar = document.getElementById('playerBar');
                        const nowPlayingName = document.getElementById('nowPlayingName');
                        const currentLogo = document.getElementById('currentLogo');
                        
                        if (playerBar) playerBar.classList.add('active');
                        if (nowPlayingName) nowPlayingName.textContent = name;
                        if (currentLogo) {
                            const img = card.querySelector('.station-logo-container img');
                            currentLogo.innerHTML = img && img.src ? `<img src="${img.src}" alt="${name}">` : '<span>📻</span>';
                        }
                    }
                } else {
                    card.classList.remove('active-station');
                }
            });
        }
        
        // Listen to scroll events
        let scrollTimeout;
        grid.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateCenterCard, 100);
        });
        
        // Initial detection
        updateCenterCard();
    }

    // Touch swipe for horizontal scrolling
    stationsGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isScrolling = false;
    }, { passive: true });

    stationsGrid.addEventListener('touchmove', (e) => {
        const touchX = e.changedTouches[0].screenX;
        const touchY = e.changedTouches[0].screenY;
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);
        
        // Determine if scrolling horizontally or vertically
        if (deltaX > deltaY) {
            // Horizontal swipe - prevent vertical scroll
            isScrolling = true;
            e.preventDefault();
        }
    }, { passive: false });

    stationsGrid.addEventListener('touchend', (e) => {
        if (!isScrolling) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only handle if it's primarily a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) * 2) {
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > minSwipeDistance) {
                // Scroll to next/previous card
                const cardWidth = 280; // min-width of station cards
                const currentScroll = stationsGrid.scrollLeft;
                const scrollAmount = cardWidth + 16; // card width + gap
                
                if (deltaX > 0) {
                    // Swipe right - scroll to previous
                    stationsGrid.scrollTo({
                        left: Math.max(0, currentScroll - scrollAmount),
                        behavior: 'smooth'
                    });
                } else {
                    // Swipe left - scroll to next
                    stationsGrid.scrollTo({
                        left: currentScroll + scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }
});
