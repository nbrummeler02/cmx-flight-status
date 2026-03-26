from flask import Flask, render_template, jsonify
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
    ##url = f"https://api.aviationstack.com/v1/slights?access_key={AVIATIONSTACK_KEY}&arr_iata=CMX"
    ##if date:
    ##    url += f"&flight_date={date}"
    ##data = requests.get(url).json()
    return jsonify(LOCAL_FLIGHTS)
    ##return jsonify(get_flights())

@app.route("/weather")
def weather():
    ##testing
    data = {
        "name": "Houghton",
        "main": {"temp": 35.6, "humidity": 40},
        "weather": [{"description": "clear sky", "icon": "01d"}],
        "wind": {"speed": 5.5}
    }
    return jsonify(data)

    ##city = "Houghton"
    ##url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_KEY}&units=imperial"

    ##try:
       ## response = requests.get(url, timeout=5)
        ##data = response.json()

        # if API returned an error
        ##if response.status_code != 200 or "main" not in data:
           ## message = data.get("message", "Weather data unavailable")
           ## return jsonify({"error": message})

       ## normal case
        ##temp = data["main"].get("temp", "N/A")
        ##description = data.get("weather", [{}])[0].get("description", "N/A")
        ##city_name = data.get("name", "Unknown")

        ##return jsonify({
            ##"Temperature": temp,
            ##"Description": description,
            ##"City": city_name
       ## })

    ##except Exception as e:
        ## catch network/API errors
        ##return jsonify({"error": str(e)})
    
@app.route("/webcam")
def webcam():
    import requests
    from flask import Response
    url = "https://direct-webcam-url.jpg"
    r = requests.get(url)
    return Response(r.content, mimetype="image/jpeg")
    
if __name__ == "__main__":
    app.run(debug=True)