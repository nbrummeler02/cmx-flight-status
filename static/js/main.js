// Load flight data safely
// options: {iata, flight, date, local}
async function load_flights(options = {}) {
    try {
        // Normalize user input for query params.
        const iata = (options.iata || 'CMX').trim().toUpperCase();
        const flight = (options.flight || '').trim().toUpperCase();
        const date = options.date || '';
        const local = options.local ? 'true' : '';

        // the query string is passed as request args to the Flask endpoint
        const baseParams = new URLSearchParams({ iata });
        if (flight) baseParams.set('flight', flight);
        if (date) baseParams.set('date', date);
        if (local) baseParams.set('local', local);

        // Fetch both arrival+departure versions concurrently.
        const [arrRes, depRes] = await Promise.all([
            fetch(`/flights?type=arrival&${baseParams.toString()}`),
            fetch(`/flights?type=departure&${baseParams.toString()}`)
        ]);

        const [arrData, depData] = await Promise.all([arrRes.json(), depRes.json()]);

        const arrivals = Array.isArray(arrData.data) ? arrData.data.slice(0, 2) : [];
        const departures = Array.isArray(depData.data) ? depData.data.slice(0, 2) : [];

        const container = document.getElementById("flights");
        container.innerHTML = ""; // Clear previous content

        if (arrivals.length === 0 && departures.length === 0) {
            container.innerHTML = "<p>No flight data available.</p>";
            return;
        }

        // Helper to produce DOM elements for a flight row.
        function create_flight_element(flight, type) {
            const dep = flight.departure || {};
            const arr = flight.arrival || {};
            const airline = (flight.airline && flight.airline.name) || "Unknown Airline";
            const flight_num = (flight.flight?.iata || flight.flight?.number) || "N/A";
            const status = flight.flight_status || "Unknown";

            let other_airport = "Unknown";
            let time = "Unknown";

            if (type === "arrival") {
                other_airport = dep.airport || "Unknown Airport";
                time = arr.scheduled ? new Date(arr.scheduled).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : "Unknown";
            } else {
                other_airport = arr.airport || "Unknown Airport";
                time = dep.scheduled ? new Date(dep.scheduled).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : "Unknown";
            }

            const el = document.createElement("div");
            el.classList.add("flight");
            el.innerHTML = `
                <strong>${airline} - Flight ${flight_num}</strong><br>
                From: ${dep.airport || "Unknown"} (${dep.iata || "N/A"}) at ${dep.scheduled ? new Date(dep.scheduled).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : "N/A"}<br>
                To: ${arr.airport || "Unknown"} (${arr.iata || "N/A"}) at ${arr.scheduled ? new Date(arr.scheduled).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : "N/A"}<br>
                Scheduled Time: ${time}<br>
                Status: ${status}
                <hr>
            `;
            return el;
        }

        // Add arrivals
        const arrivals_header = document.createElement("h3");
        arrivals_header.innerText = "Arrivals";
        container.appendChild(arrivals_header);
        if (arrivals.length === 0) {
            container.appendChild(document.createElement("p")).innerText = "No arrivals available.";
        } else {
            arrivals.forEach(f => container.appendChild(create_flight_element(f, "arrival")));
        }

        // Add departures
        const departures_header = document.createElement("h3");
        departures_header.innerText = "Departures";
        container.appendChild(departures_header);
        if (departures.length === 0) {
            container.appendChild(document.createElement("p")).innerText = "No departures available.";
        } else {
            departures.forEach(f => container.appendChild(create_flight_element(f, "departure")));
        }

    } catch (err) {
        console.error("Error loading flights:", err);
        document.getElementById("flights").innerHTML = "<p>Failed to load flight data.</p>";
    }
}

//load weather
async function load_weather() {
    try {
        const res = await fetch("/weather");
        const data = await res.json();

        console.log("Weather data:", data); // check the browser console

        const container = document.getElementById("weather");
        if (data.current) {
            container.innerHTML = `
                <strong>${data.city || "Unknown location"}</strong><br>
                Current: ${data.current.temp}°F<br>
                Condition: ${data.current.description}<br>
                Humidity: ${data.current.humidity}%<br>
                Wind: ${data.current.wind_speed} m/s
            `;
        } else {
            container.innerHTML = "<p>No current weather available.</p>";
        }

        // Render forecast if available
        const forecastContainer = document.getElementById("forecast");
        if (data.forecast && data.forecast.length > 0) {
            forecastContainer.innerHTML = data.forecast.map(day => `
                <div class="forecast-day">
                    <strong>${new Date(day.date).toLocaleDateString()}</strong><br>
                    ${day.temp_min}° / ${day.temp_max}°F<br>
                    ${day.description}<br>
                    <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
                </div>
            `).join("");
        } else {
            forecastContainer.innerHTML = "<p>No forecast available.</p>";
        }
    } catch (err) {
        console.error("Error loading weather:", err);
        document.getElementById("weather").innerHTML = "<p>Failed to load weather data.</p>";
        document.getElementById("forecast").innerHTML = "<p>Failed to load forecast.</p>";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    load_weather();
});

// refresh weather every 60 seconds (flight auto-refresh is handled in index search UI)
setInterval(load_weather, 60000);