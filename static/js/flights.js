async function load_flights() {
    const res = await fetch("/flights");
    const data = await res.json();

    document.getElementById("flights").innerText = 
    json.stringify(data, null, 2);
}
load_flights();
setInterval(load_flights, 50000);