document.addEventListener('DOMContentLoaded', () => {
    const stationsGrid = document.getElementById('stationsGrid');
    const stationSearch = document.getElementById('stationSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchBtn = document.getElementById('searchBtn');
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

    const API_BASE = 'https://de1.api.radio-browser.info/json';

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
            const response = await fetch(`${API_BASE}/stations/search?limit=100&hidebroken=true&order=clickcount&reverse=true`);
            allStations = await response.json();
        } catch (error) {
            console.error('Error fetching all stations:', error);
        }
    }

    function showSuggestions(matches) {
        if (matches.length === 0 || stationSearch.value.trim() === '') {
            searchSuggestions.style.display = 'none';
            return;
        }

        searchSuggestions.innerHTML = matches.slice(0, 8).map(station => `
            <div class="suggestion-item" data-name="${station.name}">
                <span class="suggestion-icon">📻</span>
                <span class="suggestion-name">${station.name}</span>
                <span class="suggestion-genre">${(station.tags || 'Various').split(',')[0]}</span>
            </div>
        `).join('');

        searchSuggestions.style.display = 'block';

        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                stationSearch.value = item.dataset.name;
                searchSuggestions.style.display = 'none';
                performSearch(item.dataset.name);
            });
        });
    }

    function filterStations(searchTerm) {
        if (!searchTerm || allStations.length === 0) {
            showSuggestions([]);
            return;
        }

        const term = searchTerm.toLowerCase();
        const matches = allStations.filter(station => 
            station.name.toLowerCase().includes(term) ||
            (station.tags && station.tags.toLowerCase().includes(term))
        );

        showSuggestions(matches);
    }

    stationSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const value = e.target.value.trim();
        
        if (value.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            filterStations(value);
        }, 300);
    });

    stationSearch.addEventListener('blur', () => {
        setTimeout(() => {
            searchSuggestions.style.display = 'none';
        }, 200);
    });

    stationSearch.addEventListener('focus', () => {
        if (stationSearch.value.trim().length >= 2 && allStations.length > 0) {
            filterStations(stationSearch.value.trim());
        }
    });

    function performSearch(searchTerm) {
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter.value;
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        fetchStations(searchTerm, activeGenre, 20, country).then(renderStations);
    }

    function renderStations(stations, totalCount = 0) {
        if (stations.length === 0) {
            stationsGrid.innerHTML = '<p class="no-results">No stations found. Try a different search.</p>';
            document.getElementById('paginationControls')?.remove();
            return;
        }

        stationsGrid.innerHTML = stations.map((station, index) => `
            <div class="station-card" data-url="${station.url_resolved || station.url}" data-name="${station.name}" data-genre="${station.tags || 'Various'}" data-logo="${station.favicon || ''}" data-index="${index}">
                <div class="station-logo-container">
                    ${station.favicon ? `<img src="${station.favicon}" alt="${station.name}" onerror="this.parentElement.innerHTML='<span>📻</span>'">` : '<span>📻</span>'}
                </div>
                <h3 class="station-name">${station.name}</h3>
                <p class="station-genre"><span>${(station.tags || 'Various').split(',')[0]}</span></p>
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
        const country = countryFilter.value;
        
        // Scroll to Live Radio section immediately
        const radioSection = document.getElementById('radio');
        radioSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        fetchStations(searchTerm, activeGenre, stationsPerPage, country, offset).then(stations => {
            renderStations(stations, 500);
        });
    }

    function playStation(card) {
        const url = card.dataset.url;
        const name = card.dataset.name;
        const genre = card.dataset.genre;
        const logo = card.dataset.logo;

        document.querySelectorAll('.station-card').forEach(c => c.classList.remove('playing'));
        card.classList.add('playing');

        currentStationData = { url, name, genre, logo };
        
        currentStation.textContent = name;
        currentGenre.textContent = genre.split(',')[0];
        
        if (logo) {
            currentLogo.innerHTML = `<img src="${logo}" alt="${name}" onerror="this.innerHTML='<span>📻</span>'">`;
        } else {
            currentLogo.innerHTML = '<span>📻</span>';
        }

        playerBar.classList.add('active');
        
        audioPlayer.src = url;
        audioPlayer.volume = volumeSlider.value / 100;
        audioPlayer.play().then(() => {
            isPlaying = true;
            updatePlayButton();
            audioVisualizer.classList.add('playing');
        }).catch(error => {
            console.error('Error playing station:', error);
            showToastNotification('Unable to play this station. Please try another one.', 'error');
        });
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

        // Immediate visual feedback
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
        currentPage = 1;
        const stations = await fetchStations();
        renderStations(stations, 500);
        await fetchAllStations();
    }

    searchBtn.addEventListener('click', async () => {
        const searchTerm = stationSearch.value.trim();
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter.value;
        currentPage = 1;
        
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
        renderStations(stations, 500);
    });

    stationSearch.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const searchTerm = stationSearch.value.trim();
            const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
            const country = countryFilter.value;
            currentPage = 1;
            
            stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
            const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
            renderStations(stations, 500);
        }
    });

    countryFilter.addEventListener('change', async () => {
        const searchTerm = stationSearch.value.trim();
        const activeGenre = document.querySelector('.genre-btn.active').dataset.genre;
        const country = countryFilter.value;
        currentPage = 1;
        
        stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
        const stations = await fetchStations(searchTerm, activeGenre, stationsPerPage, country);
        renderStations(stations, 500);
    });

    genreBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            genreBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const genre = btn.dataset.genre;
            const searchTerm = stationSearch.value.trim();
            const country = countryFilter.value;
            currentPage = 1;
            
            stationsGrid.innerHTML = '<div class="loading-spinner"></div>';
            const stations = await fetchStations(searchTerm, genre, stationsPerPage, country);
            renderStations(stations, 500);
        });
    });

    loadStations();

    // Touch swipe pagination for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    stationsGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stationsGrid.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Check if there's a pagination control
        const pagination = document.getElementById('paginationControls');
        if (!pagination) return;
        
        const totalPages = Math.ceil(500 / stationsPerPage);
        
        // Swipe left - next page
        if (swipeDistance < -minSwipeDistance && currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
        
        // Swipe right - previous page
        if (swipeDistance > minSwipeDistance && currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }
});
