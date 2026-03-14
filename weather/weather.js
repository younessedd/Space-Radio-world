document.addEventListener('DOMContentLoaded', () => {
    const weatherContent = document.getElementById('weatherContent');
    const forecastGrid = document.getElementById('forecastGrid');
    const cityInput = document.getElementById('cityInput');
    const searchCityBtn = document.getElementById('searchCityBtn');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const weatherDate = document.getElementById('weatherDate');

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    weatherDate.textContent = today.toLocaleDateString('en-US', options);

    let currentUnit = 'metric';
    let currentCity = 'London';

    const API_KEY = '4d8fb5b93d4af21d66a2948710284366';

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
        return new Promise((resolve) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoords(latitude, longitude);
                        resolve(city || 'London');
                    },
                    () => {
                        resolve('London');
                    }
                );
            } else {
                resolve('London');
            }
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
        const country = data.country;

        weatherContent.innerHTML = `
            <div class="current-weather">
                <div class="weather-main">
                    <div class="weather-icon" onclick="this.innerHTML='⏳'; loadWeather(currentCity)" title="Click to refresh">${icon}</div>
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
            const icon = weatherIcons[day.weather[0].icon] || '🌤️';
            const temp = Math.round(day.main.temp);

            return `
                <div class="forecast-card">
                    <div class="forecast-day">${dayName}</div>
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
            currentCity = city;
        } catch (error) {
            weatherContent.innerHTML = `
                <div class="weather-error">
                    <h3>⚠️ City Not Found</h3>
                    <p>Please try searching for a different city.</p>
                </div>
            `;
        }
    }

    searchCityBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            loadWeather(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                loadWeather(city);
            }
        }
    });

    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            unitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUnit = btn.dataset.unit;
            loadWeather(currentCity);
        });
    });

    loadWeather(currentCity);

    getUserLocation().then(city => {
        loadWeather(city);
    });
});
