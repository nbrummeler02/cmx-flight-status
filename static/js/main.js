//load flight data
async function load_flights() {
    const res = await fetch("/flights");
    const data = await res.json();

    document.getElementById("flights").innerText = 
    json.stringify(data, null, 2);
}

//load weather
async function load_weather() {
    const res = await fetch("/weather");
    const data = await res.json();
    document.getElementById("weather").innerText =
        `Temp: ${data.temperature}°F | Wind: ${data.wind} mph | ${data.conditions}`;
}

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