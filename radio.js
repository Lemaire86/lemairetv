// URL playlist GitHub
const radioPlaylist = "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/radio.m3u";

let radioStations = [];
let currentIndex = -1;

// LOAD PLAYLIST
async function loadRadioPlaylist() {
  try {
    const res = await fetch(radioPlaylist);
    const text = await res.text();
    parseRadioM3U(text);
    renderRadioList();
    renderRadioGrid(); // 🔥 FIX: grid radio yo parèt
  } catch (e) {
    console.log("Erreur radio playlist:", e);
  }
}

// PARSE M3U
function parseRadioM3U(text) {
  const lines = text.split("\n");
  let name = "";

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith("#EXTINF")) {
      const info = line.split(",");
      name = info[1] || "Station inconnue";
    }

    if (line.startsWith("http")) {
      radioStations.push({
        name,
        logo: "assets/radio/default.png",
        stream: line.trim()
      });
    }
  });
}

// LISTE RADIO (BO GOCH)
function renderRadioList() {
  const list = document.getElementById("station-list");
  list.innerHTML = "";

  radioStations.forEach((station, i) => {
    const div = document.createElement("div");
    div.className = "station-item";
    div.innerHTML = `
      <span>${i + 1}</span>
      <img src="${station.logo}">
      <span>${station.name}</span>
    `;
    div.onclick = () => playStation(i);
    list.appendChild(div);
  });
}

// GRID RADIO (BO DWAT)
function renderRadioGrid() {
  const grid = document.getElementById("station-grid");
  grid.innerHTML = "";

  radioStations.forEach((station, i) => {
    const tile = document.createElement("div");
    tile.className = "station-tile";
    tile.innerHTML = `
      <img src="${station.logo}">
      <h4>${station.name}</h4>
    `;
    tile.onclick = () => playStation(i);
    grid.appendChild(tile);
  });
}

// PLAY STATION
function playStation(index) {
  currentIndex = index;

  const station = radioStations[index];
  const audio = document.getElementById("bottom-player");
  const title = document.getElementById("bottom-title");

  title.textContent = station.name;
  audio.src = station.stream;
  audio.play().catch(err => {
    console.log("STREAM PLAY ERROR:", err);
  });

  audio.onerror = () => {
    alert("Impossible de lire cette station.");
  };
}

// NEXT / PREV
document.getElementById("next-btn").onclick = () => {
  if (currentIndex < radioStations.length - 1) playStation(currentIndex + 1);
};

document.getElementById("prev-btn").onclick = () => {
  if (currentIndex > 0) playStation(currentIndex - 1);
};

// START
loadRadioPlaylist();
