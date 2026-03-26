import requests
API_KEY = "41812e969cec6208773bd8d8749d03aa"

def get_flights():
    url = f"https://api.aviationstack.com/v1/flights?access_key={API_KEY}&arr_iata=CMX"
    return requests.get(url).json()