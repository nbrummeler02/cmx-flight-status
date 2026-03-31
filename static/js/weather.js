async function load_weather() {
    try {
        const response = await fetch('/weather');
        const data = await response.json();

        const weatherDiv = document.getElementById('weather');
        if (data.error) {
            weatherDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        const temp = data.main ? data.main.temp : 'N/A';
        const humidity = data.main ? data.main.humidity : 'N/A';
        const description = data.weather && data.weather[0] ? data.weather[0].description : 'N/A';
        const windSpeed = data.wind ? data.wind.speed : 'N/A';
        const city = data.name || 'Houghton';

        weatherDiv.innerHTML = `
            <table>
                <tbody>
                    <tr><td>City:</td><td>${city}</td></tr>
                    <tr><td>Temperature:</td><td>${temp}°F</td></tr>
                    <tr><td>Humidity:</td><td>${humidity}%</td></tr>
                    <tr><td>Description:</td><td>${description}</td></tr>
                    <tr><td>Wind Speed:</td><td>${windSpeed} mph</td></tr>
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('weather').innerHTML = '<p>Error loading weather</p>';
    }
}

// Load weather on page load
window.addEventListener('DOMContentLoaded', load_weather);
