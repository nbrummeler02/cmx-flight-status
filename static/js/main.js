// Load flight data safely
async function load_flights() {
    try {
        const res = await fetch("/flights");
        const data = await res.json();

        const container = document.getElementById("flights");
        container.innerHTML = ""; // Clear previous content

        if (!data.data || data.data.length === 0) {
            container.innerHTML = "<p>No flight data available.</p>";
            return;
        }

        // Filter arrivals and departures, limit to 2 each
        const arrivals = data.data.filter(f => f.arrival).slice(0, 2);
        const departures = data.data.filter(f => f.departure).slice(0, 2);

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
        container.innerHTML = `
            <strong>${data.name || "Unknown location"}</strong><br>
            Temperature: ${data.main?.temp ?? "N/A"}°F<br>
            Condition: ${data.weather?.[0]?.description ?? "N/A"}<br>
            Humidity: ${data.main?.humidity ?? "N/A"}%<br>
            Wind: ${data.wind?.speed ?? "N/A"} m/s
        `;
    } catch (err) {
        console.error("Error loading weather:", err);
        document.getElementById("weather").innerHTML = "<p>Failed to load weather data.</p>";
    }
}

// call it on page load
window.addEventListener("DOMContentLoaded", load_weather);


//load and refresh webcam (every 30 seconds)
function refresh_cam() {
    const cam = document.getElementById("webcam")
    cam.src = "https://www.michigan.gov/mdot/-/media/Project-Webcams/CMX_cam.jpg" + new Date().getTime();
}

load_flights();
load_weather();
refresh_cam();
//refresh every 60 seconds
setInterval(load_flights, 60000);
setInterval(load_weather, 60000);
//refresh every 30 seconds 
setInterval(refresh_cam, 30000)