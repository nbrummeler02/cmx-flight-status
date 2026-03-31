import requests
API_KEY = "219b2eabf4c7b1e0ceb2120f9cb67600"

def get_flights(direction='arrival', iata='CMX', flight_date=None, flight_number=None):
    # direction: 'arrival' or 'departure'.
    # iata: airport code to search for. default CMX.
    # flight_date: 'YYYY-MM-DD' optional filter for date.
    # flight_number: flight code e.g. 'UA5140' or numeric string.
    query = {
        'access_key': API_KEY,
    }

    if flight_number:
        # Flight search by flight_iata (with airline code) is generally more reliable.
        # If numeric-only, use flight_number filter.
        normalized = flight_number.strip().upper()
        if normalized.isdigit():
            query['flight_number'] = normalized
        else:
            query['flight_iata'] = normalized

    if not flight_number:
        # Only include airport filter when flight number is not specified.
        # If both provided, still include iata as context (and direction decides arr/dep).
        if direction == 'departure':
            query['dep_iata'] = iata
        else:
            query['arr_iata'] = iata
    else:
        # include requested iata if provided
        if iata:
            if direction == 'departure':
                query['dep_iata'] = iata
            else:
                query['arr_iata'] = iata

    if flight_date:
        query['flight_date'] = flight_date

    # Build URL with query parameters
    url = 'https://api.aviationstack.com/v1/flights?' + '&'.join(f"{k}={requests.utils.quote(str(v))}" for k, v in query.items())
    return requests.get(url).json()