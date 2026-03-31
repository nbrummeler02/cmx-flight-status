from flask import Flask, render_template, jsonify, request
import requests
from LOCAL_FLIGHTS import LOCAL_FLIGHTS
from LOCAL_WEATHER import LOCAL_WEATHER
from services.flights import get_flights
from config import AVIATIONSTACK_KEY, WEATHER_KEY
from datetime import date

app = Flask (__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/flights")
def flights():
    # Get query args from frontend.
    # type: arrival or departure (default arrival)
    flight_type = request.args.get('type', 'arrival').lower()
    if flight_type not in ('arrival', 'departure'):
        flight_type = 'arrival'

    # Airport IATA filter; optional in local mode and API mode.
    iata = request.args.get('iata', '').upper().strip()
    if iata and len(iata) not in (3, 4):
        return jsonify({"error": "Invalid IATA code (3-4 characters)."}), 400

    # Optional date filter passed by frontend (YYYY-MM-DD)
    flight_date = request.args.get('date')
    if flight_date:
        try:
            from datetime import datetime
            datetime.strptime(flight_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    flight_number = request.args.get('flight', '').strip().upper() or None
    use_local = request.args.get('local', '').lower() in ('1', 'true', 'yes') or request.args.get('source', '').lower() == 'local'

    if use_local:
        # local data source for testing only.
        # This avoids external API calls and lets you confirm behavior with known sample records.
        results = []
        for f in LOCAL_FLIGHTS.get('data', []):
            if flight_type == 'arrival' and iata and f.get('arrival', {}).get('iata', '').upper() != iata:
                continue
            if flight_type == 'departure' and iata and f.get('departure', {}).get('iata', '').upper() != iata:
                continue

            if flight_number:
                flight_id = (f.get('flight', {}).get('iata') or f.get('flight', {}).get('number') or '').upper()
                if flight_number not in flight_id:
                    continue

            if flight_date:
                # match either departure or arrival date if provided
                dep_date = (f.get('departure', {}).get('scheduled') or '')[:10]
                arr_date = (f.get('arrival', {}).get('scheduled') or '')[:10]
                if flight_date not in (dep_date, arr_date):
                    continue

            results.append(f)

        return jsonify({'data': results, 'source': 'local'})

    data = get_flights(direction=flight_type, iata=iata, flight_date=flight_date, flight_number=flight_number)

    # fallback to local sample data when external API returns empty
    # this is useful to avoid zero results while testing.
    if (not data or not data.get('data')) and flight_number:
        matches = []
        for f in LOCAL_FLIGHTS.get('data', []):
            real_flight = (f.get('flight', {}).get('iata') or f.get('flight', {}).get('number') or '').upper()
            if flight_number in real_flight:
                matches.append(f)
        if matches:
            return jsonify({'data': matches, 'source': 'local-fallback'})

    return jsonify(data)

@app.route("/weather")
def weather():
    city = request.args.get('city', 'Houghton')

    # Get current weather
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_KEY}&units=imperial"
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={WEATHER_KEY}&units=imperial"

    try:
        current_res = requests.get(current_url, timeout=5)
        forecast_res = requests.get(forecast_url, timeout=5)

        current_data = current_res.json()
        forecast_data = forecast_res.json()

        if current_res.status_code != 200 or "main" not in current_data:
            return jsonify({"error": current_data.get("message", "Current weather unavailable")})

        if forecast_res.status_code != 200 or "list" not in forecast_data:
            return jsonify({"error": forecast_data.get("message", "Forecast unavailable")})

        # Process forecast
        by_date = {}
        for item in forecast_data["list"]:
            d = item["dt_txt"][:10]
            main = item["main"]
            if d not in by_date:
                by_date[d] = {"min": main["temp_min"], "max": main["temp_max"], "items": [item]}
            else:
                by_date[d]["min"] = min(by_date[d]["min"], main["temp_min"])
                by_date[d]["max"] = max(by_date[d]["max"], main["temp_max"])
                by_date[d]["items"].append(item)

        forecast = []
        for d in sorted(by_date.keys())[:4]:  # Get up to 4 days to ensure we have 3 full days
            sample = by_date[d]["items"][len(by_date[d]["items"]) // 2]
            weather = sample["weather"][0]
            forecast.append({
                "date": d,
                "temp_min": round(by_date[d]["min"], 1),
                "temp_max": round(by_date[d]["max"], 1),
                "description": weather["description"],
                "icon": weather["icon"]
            })
        
        # Return exactly 3 days
        forecast = forecast[:3]

        return jsonify({
            "city": current_data["name"],
            "current": {
                "temp": current_data["main"]["temp"],
                "description": current_data["weather"][0]["description"],
                "humidity": current_data["main"]["humidity"],
                "wind_speed": current_data["wind"]["speed"]
            },
            "forecast": forecast
        })

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/webcam")
def webcam():
    import requests
    from flask import Response
    url = "https://direct-webcam-url.jpg"
    r = requests.get(url)
    return Response( mimetype="image/jpeg")
    
if __name__ == "__main__":
    app.run(debug=True)