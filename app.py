from flask import Flask, render_template, jsonify
import requests
from services.flights import get_flights
from config import AVIATIONSTACK_KEY, WEATHER_KEY

app = Flask (__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/flights")
def flights():
    url = f"https://api.aviationstack.com/v1/slights?access_key={AVIATIONSTACK_KEY}&arr_iata=CMX"
    if date:
        url += f"&flight_date={date}"
    data = requests.get(url).json()
    return jsonify(get_flights())

@app.route("/weather")
def weather():
    url = f"https://api.openweathermap.org/data/3.0/onecall/overview?lat={47.1684}&lon={-88.4891}&appid={WEATHER_KEY}&units=imperial"
    data = rquests.get(url).json()
    return jsonify({
        "Temperature": data["main"]["temp"],
        "Wind": data["wind"]["speed"],
        "conditions": data["weather"][0]["description"]
    })
if __name__ == "__main__":
    app.run(debug=True)