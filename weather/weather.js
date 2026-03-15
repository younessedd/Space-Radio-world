document.addEventListener('DOMContentLoaded', () => {
    const weatherContent = document.getElementById('weatherContent');
    const forecastGrid = document.getElementById('forecastGrid');
    const cityInput = document.getElementById('cityInput');
    const searchCityBtn = document.getElementById('searchCityBtn');
    const locationBtn = document.getElementById('locationBtn');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const weatherDate = document.getElementById('weatherDate');
    const citySuggestions = document.getElementById('citySuggestions');

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    weatherDate.textContent = today.toLocaleDateString('en-US', options);

    let currentUnit = 'metric';
    window.currentCity = 'London';
    let userLat = null;
    let userLon = null;
    let debounceTimer = null;
    let currentFetchController = null;

    const API_KEY = '4d8fb5b93d4af21d66a2948710284366';

    // Popular cities for default suggestions
    const popularCities = [
        { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
        { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
        { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
        { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
        { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
        { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
        { name: 'Los Angeles', country: 'US', lat: 34.0522, lon: -118.2437 },
        { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
        { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 }
    ];

    const weatherIcons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };

    // Calculate distance between two coordinates in km
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

    // Get user location for geo-aware sorting
    function getUserLocationCoords() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLat = position.coords.latitude;
                        userLon = position.coords.longitude;
                        resolve({ lat: userLat, lon: userLon });
                    },
                    () => resolve(null)
                );
            } else {
                resolve(null);
            }
        });
    }

    // Search cities using OpenWeatherMap API
    async function searchCities(query) {
        if (currentFetchController) {
            currentFetchController.abort();
        }
        currentFetchController = new AbortController();

        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=10&appid=${API_KEY}`,
                { signal: currentFetchController.signal }
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.map(city => ({
                name: city.name,
                country: city.country,
                lat: city.lat,
                lon: city.lon,
                state: city.state || ''
            }));
        } catch (error) {
            if (error.name === 'AbortError') return [];
            console.error('City search error:', error);
            return [];
        }
    }

    // Highlight matching text
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Render city suggestions
    function renderCitySuggestions(cities, query) {
        if (cities.length === 0) {
            citySuggestions.innerHTML = '<div class="city-suggestion-empty">No cities found</div>';
            citySuggestions.classList.add('active');
            return;
        }

        // Sort by distance if user location is available
        if (userLat !== null && userLon !== null) {
            cities.sort((a, b) => {
                const distA = calculateDistance(userLat, userLon, a.lat, a.lon);
                const distB = calculateDistance(userLat, userLon, b.lat, b.lon);
                return distA - distB;
            });
        }

        citySuggestions.innerHTML = cities.map(city => {
            const displayName = city.state ? `${city.name}, ${city.state}` : city.name;
            const distance = (userLat !== null && userLon !== null) 
                ? Math.round(calculateDistance(userLat, userLon, city.lat, city.lon))
                : null;
            
            return `
                <div class="city-suggestion-item" data-name="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}">
                    <div class="city-suggestion-icon">📍</div>
                    <div class="city-suggestion-info">
                        <div class="city-suggestion-name">${highlightMatch(displayName, query)}</div>
                        <div class="city-suggestion-country">${city.country}</div>
                    </div>
                    ${distance !== null ? `<div class="city-suggestion-distance">${distance} km</div>` : ''}
                </div>
            `;
        }).join('');

        citySuggestions.classList.add('active');
    }

    // Handle city input change
    function handleCityInput() {
        const query = cityInput.value.trim();
        
        if (debounceTimer) clearTimeout(debounceTimer);
        
        if (query.length < 2) {
            // Show popular cities when input is empty or too short
            renderCitySuggestions(popularCities.map(c => ({
                name: c.name,
                country: c.country,
                lat: c.lat,
                lon: c.lon
            })), '');
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            const cities = await searchCities(query);
            renderCitySuggestions(cities, query);
        }, 300);
    }

    // Select city from suggestions
    function selectCity(name, lat, lon) {
        cityInput.value = name;
        citySuggestions.classList.remove('active');
        loadWeatherByCoords(lat, lon);
    }

    // Event listeners for city search
    cityInput.addEventListener('input', handleCityInput);
    
    cityInput.addEventListener('focus', () => {
        const query = cityInput.value.trim();
        if (query.length < 2) {
            renderCitySuggestions(popularCities.map(c => ({
                name: c.name,
                country: c.country,
                lat: c.lat,
                lon: c.lon
            })), '');
        }
    });

    citySuggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.city-suggestion-item');
        if (item) {
            selectCity(item.dataset.name, parseFloat(item.dataset.lat), parseFloat(item.dataset.lon));
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.city-search-wrapper')) {
            citySuggestions.classList.remove('active');
        }
    });

    async function getCityFromCoords(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    return data[0].name;
                }
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
        return null;
    }

    function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const city = await getCityFromCoords(latitude, longitude);
                    resolve(city || 'London');
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async function fetchWeather(city) {
        try {
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;

            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentUrl),
                fetch(forecastUrl)
            ]);

            if (!currentResponse.ok) {
                throw new Error('City not found');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            return { current: currentData, forecast: forecastData };
        } catch (error) {
            console.error('Weather fetch error:', error);
            throw error;
        }
    }

    function renderCurrentWeather(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed);
        const description = data.weather[0].description;
        const icon = weatherIcons[data.weather[0].icon] || '🌤️';
        const cityName = data.name;
        const country = data.sys.country;

        weatherContent.innerHTML = `
            <div class="current-weather">
                <div class="weather-main">
                    <div class="weather-icon" onclick="this.innerHTML='⏳'; window.loadWeatherByCity(window.currentCity)" title="Click to refresh">${icon}</div>
                    <div class="temperature">${temp}<span>°</span></div>
                    <div class="weather-description">${description}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <span class="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                        <div class="detail-info">
                            <h4>Location</h4>
                            <p>${cityName}, ${country}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg></span>
                        <div class="detail-info">
                            <h4>Feels Like</h4>
                            <p>${feelsLike}°</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></span>
                        <div class="detail-info">
                            <h4>Humidity</h4>
                            <p>${humidity}%</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg></span>
                        <div class="detail-info">
                            <h4>Wind Speed</h4>
                            <p>${windSpeed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderForecast(data) {
        const dailyData = [];
        const seenDates = new Set();

        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!seenDates.has(date) && dailyData.length < 5) {
                seenDates.add(date);
                dailyData.push(item);
            }
        });

        forecastGrid.innerHTML = dailyData.map(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = date.getDate();
            const icon = weatherIcons[day.weather[0].icon] || '🌤️';
            const temp = Math.round(day.main.temp);

            return `
                <div class="forecast-card">
                    <div class="forecast-day">${dayName}, ${dateNum}</div>
                    <div class="forecast-icon">${icon}</div>
                    <div class="forecast-temp">${temp}°</div>
                </div>
            `;
        }).join('');
    }

    async function loadWeather(city) {
        weatherContent.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            const data = await fetchWeather(city);
            renderCurrentWeather(data.current);
            renderForecast(data.forecast);
            window.currentCity = city;
        } catch (error) {
            weatherContent.innerHTML = `
                <div class="weather-error">
                    <h3>⚠️ City Not Found</h3>
                    <p>Please try searching for a different city.</p>
                </div>
            `;
        }
    }

    // Global function for onclick handlers
    window.loadWeatherByCity = loadWeather;

    // Search button click
    searchCityBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            loadWeather(city);
        }
    });

    // Location button click - get user location and load weather
    locationBtn.addEventListener('click', async () => {
        weatherContent.innerHTML = '<div class="loading-spinner"></div>';
        
        if (!navigator.geolocation) {
            weatherContent.innerHTML = `
                <div class="weather-error">
                    <h3>⚠️ Location Not Supported</h3>
                    <p>Your browser does not support geolocation.</p>
                </div>
            `;
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await loadWeatherByCoords(latitude, longitude);
            },
            (error) => {
                weatherContent.innerHTML = `
                    <div class="weather-error">
                        <h3>⚠️ Location Error</h3>
                        <p>Unable to get your location. Please enable location access.</p>
                    </div>
                `;
            }
        );
    });

    // Enter key to search
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                loadWeather(city);
            }
        }
    });

    // Unit toggle
    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            unitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUnit = btn.dataset.unit;
            loadWeather(window.currentCity);
        });
    });

    // Load weather on page load - load default immediately, then update with user location when granted
    function initWeather() {
        // Load default weather immediately
        loadWeather('London');
        
        let lastLat = null;
        let lastLon = null;
        
        // Function to load weather from coordinates
        const loadFromLocation = (position) => {
            const { latitude, longitude } = position.coords;
            if (lastLat !== latitude || lastLon !== longitude) {
                lastLat = latitude;
                lastLon = longitude;
                loadWeatherByCoords(latitude, longitude);
            }
        };
        
        // Try to get user location
        if (navigator.geolocation) {
            // Try immediately
            navigator.geolocation.getCurrentPosition(loadFromLocation, () => {}, { timeout: 5000 });
            
            // Watch for location changes continuously
            navigator.geolocation.watchPosition(loadFromLocation, () => {}, { 
                enableHighAccuracy: false, 
                maximumAge: 30000 
            });
            
            // Poll continuously every 2 seconds to catch permission changes
            setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        if (lastLat !== latitude || lastLon !== longitude) {
                            lastLat = latitude;
                            lastLon = longitude;
                            loadWeatherByCoords(latitude, longitude);
                        }
                    },
                    () => {},
                    { timeout: 2000 }
                );
            }, 2000);
        }
        
        // Also listen for visibility change to refresh when user returns to tab after granting permission
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        if (lastLat !== latitude || lastLon !== longitude) {
                            lastLat = latitude;
                            lastLon = longitude;
                            loadWeatherByCoords(latitude, longitude);
                        }
                    },
                    () => {},
                    { timeout: 3000 }
                );
            }
        });
    }
    
    // Load weather by coordinates directly using OpenWeatherMap
    async function loadWeatherByCoords(lat, lon) {
        weatherContent.innerHTML = '<div class="loading-spinner"></div>';
        
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;

        const currentResponse = await fetch(currentUrl);
        const currentData = await currentResponse.json();
        
        if (currentData.cod == 200) {
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            renderCurrentWeather(currentData);
            renderForecast(forecastData);
            window.currentCity = currentData.name;
            
            // Show notification that weather was updated with user location
            if (window.showToastNotification) {
                showToastNotification(`Weather updated for ${currentData.name}`, 'success');
            }
        } else {
            loadWeather('London');
        }
    }
    
    // Make functions available globally
    window.initWeather = initWeather;
    window.loadWeatherByCoords = loadWeatherByCoords;
    
    initWeather();
});
