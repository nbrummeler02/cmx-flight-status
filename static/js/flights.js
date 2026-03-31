async function load_flights() {
    try {
        const flightType = document.getElementById('flight-type') ? document.getElementById('flight-type').value : 'departure';
        const response = await fetch(`/flights?type=${flightType}`);
        const data = await response.json();

        const flightsDiv = document.getElementById('flights');

        if (data.error) {
            flightsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        const flightsArray = data.data || [];
        const directionLabel = flightType === 'departure' ? 'Departures' : 'Arrivals';

        if (flightsArray.length === 0) {
            flightsDiv.innerHTML = `<p>No ${directionLabel.toLowerCase()} data available.</p>`;
            return;
        }

        let html = `<h2>${directionLabel}</h2>`;
        html += '<table><thead><tr><th>Flight</th><th>Airline</th><th>Departure</th><th>Arrival</th><th>Status</th></tr></thead><tbody>';

        flightsArray.slice(0, 10).forEach(flight => {
            const dep = flight.departure ? flight.departure.iata || flight.departure.airport : 'N/A';
            const arr = flight.arrival ? flight.arrival.iata || flight.arrival.airport : 'N/A';
            const airline = flight.airline ? flight.airline.name : 'N/A';
            const flightNum = flight.flight ? flight.flight.iata || flight.flight.number : 'N/A';
            const status = flight.flight_status || 'N/A';

            html += `<tr><td>${flightNum}</td><td>${airline}</td><td>${dep}</td><td>${arr}</td><td>${status}</td></tr>`;
        });

        html += '</tbody></table>';
        flightsDiv.innerHTML = html;
    } catch (err) {
        console.error(err);
        document.getElementById('flights').innerHTML = `<p>Error loading flights</p>`;
    }
}
