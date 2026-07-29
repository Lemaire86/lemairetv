/* ---------------- ISO → FULL COUNTRY NAME ---------------- */
const isoToFullName = {
  "HT": "Haiti",
  "FR": "France",
  "US": "United States",
  "CA": "Canada",
  "ES": "Spain",
  "DO": "Dominican Republic",
  "MX": "Mexico",
  "GB": "United Kingdom",
  "BR": "Brazil",
  "CO": "Colombia",
  "AR": "Argentina",
  "DE": "Germany",
  "IT": "Italy",
  "JP": "Japan",
  "MT": "Malta",
  "MO": "Macau",
  "MA": "Morocco",
  "PT": "Portugal",
  "NL": "Netherlands",
  "BE": "Belgium",
  "CH": "Switzerland",
  "SE": "Sweden",
  "NO": "Norway",
  "FI": "Finland",
  "DK": "Denmark",
  "IE": "Ireland",
  "RU": "Russia",
  "CN": "China",
  "IN": "India",
  "KR": "South Korea",
  "AU": "Australia",
  "NZ": "New Zealand",
  "ZA": "South Africa",

  "AD": "Andorra",
  "AE": "United Arab Emirates",
  "AL": "Albania",
  "AM": "Armenia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BA": "Bosnia and Herzegovina",
  "BG": "Bulgaria",
  "BY": "Belarus",
  "CL": "Chile",
  "CR": "Costa Rica",
  "CY": "Cyprus",
  "CZ": "Czech Republic",
  "EE": "Estonia",
  "EG": "Egypt",
  "FO": "Faroe Islands",
  "GE": "Georgia",
  "GL": "Greenland",
  "GR": "Greece",
  "HK": "Hong Kong",
  "HR": "Croatia",
  "HU": "Hungary",
  "ID": "Indonesia",
  "IL": "Israel",
  "IQ": "Iraq",
  "IR": "Iran",
  "IS": "Iceland",
  "KP": "North Korea",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "LV": "Latvia",
  "MC": "Monaco",
  "MD": "Moldova",
  "ME": "Montenegro",
  "MK": "North Macedonia",
  "PE": "Peru",
  "PL": "Poland",
  "PY": "Paraguay",
  "QA": "Qatar",
  "RO": "Romania",
  "RS": "Serbia",
  "SA": "Saudi Arabia",
  "SI": "Slovenia",
  "SK": "Slovakia",
  "SM": "San Marino",
  "SO": "Somalia",
  "TD": "Chad",
  "TR": "Turkey",
  "TT": "Trinidad and Tobago",
  "TW": "Taiwan",
  "UA": "Ukraine",
  "VE": "Venezuela",
  "XK": "Kosovo"
};

/* ---------------- PLAYLISTS ---------------- */
const playlists = [
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
  "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u"
];

let channels = [];
let countries = new Set();

/* ---------------- LOAD PLAYLISTS ---------------- */
async function loadPlaylists() {
  for (const url of playlists) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      parseM3U(text);
    } catch (e) {
      console.log("Erreur playlist:", url);
    }
  }

  renderCountries();
  showAllChannels();
}

/* ---------------- PARSE M3U (FINAL VERSION) ---------------- */
function parseM3U(text) {
  const lines = text.split("\n");
  let name = "", logo = "", country = "";

  lines.forEach(line => {

    if (line.startsWith("#EXTINF")) {

      const info = line.split(",");
      name = info[1] || "Unknown";

      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      logo = logoMatch ? logoMatch[1] : "assets/logo.png";

      const countryMatch = line.match(/country="(.*?)"/);
      let raw = countryMatch ? countryMatch[1] : "Unknown";

      /* ---------------- FORCE HAITI ---------------- */
      const haitiCodes = [
        "HT","HAITI","HTI","HA","HAT","AYITI",
        "LMTV","LEMAIRE","LEMAIRE TV","HTV","HTV1"
      ];

      if (haitiCodes.includes(raw.toUpperCase())) {
        country = "Haiti";
      } else {
        /* ---------------- ISO → FULL NAME ---------------- */
        country = isoToFullName[raw.toUpperCase()] || raw;
      }

      countries.add(country);
    }

    if (line.startsWith("http")) {
      channels.push({ name, logo, url: line.trim(), country });
    }
  });
}

/* ---------------- RENDER COUNTRY LIST ---------------- */
function renderCountries() {
  const list = document.getElementById("countries-list");

  let all = [...countries];
  all.sort();

  list.innerHTML = "";

  all.forEach(ct => {
    const item = document.createElement("div");
    item.className = "country-item";
    item.textContent = ct;
    item.onclick = () => showCountryChannels(ct);
    list.appendChild(item);
  });
}

/* ---------------- SHOW ALL CHANNELS ---------------- */
function showAllChannels() {
  document.getElementById("country-title").textContent = "ALL CHANNELS";

  const grid = document.getElementById("channels-grid");
  grid.innerHTML = "";

  channels.forEach(ch => {
    const tile = document.createElement("div");
    tile.className = "channel-tile";

    tile.innerHTML = `
      <img src="${ch.logo}">
      <span>${ch.name}</span>
    `;

    tile.onclick = () => {
      window.location.href = `live-tv.html?channel=${encodeURIComponent(ch.url)}`;
    };

    grid.appendChild(tile);
  });
}

/* ---------------- SHOW CHANNELS BY COUNTRY ---------------- */
function showCountryChannels(ct) {
  document.getElementById("country-title").textContent = ct;

  const grid = document.getElementById("channels-grid");
  grid.innerHTML = "";

  channels
    .filter(ch => ch.country === ct)
    .forEach(ch => {

      const tile = document.createElement("div");
      tile.className = "channel-tile";

      tile.innerHTML = `
        <img src="${ch.logo}">
        <span>${ch.name}</span>
      `;

      tile.onclick = () => {
        window.location.href = `live-tv.html?channel=${encodeURIComponent(ch.url)}`;
      };

      grid.appendChild(tile);
    });
}

/* ---------------- BUTTON ALL CHANNELS ---------------- */
document.getElementById("all-channels-btn").onclick = showAllChannels;

/* ---------------- SUPER SEARCH ---------------- */
document.getElementById("search-global-input").oninput = function () {
  const q = this.value.toLowerCase();
  const box = document.getElementById("search-suggestions");

  if (!q) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }

  box.style.display = "block";
  box.innerHTML = "";

  const results = [];

  /* --- MATCH COUNTRIES --- */
  [...countries].forEach(ct => {
    if (ct.toLowerCase().includes(q)) {
      results.push({ type: "country", name: ct });
    }
  });

  /* --- MATCH CHAÎNES --- */
  channels.forEach(ch => {
    if (ch.name.toLowerCase().includes(q)) {
      results.push({ type: "channel", name: ch.name, url: ch.url, country: ch.country });
    }
  });

  /* --- DISPLAY RESULTS --- */
  results.slice(0, 20).forEach(r => {
    const item = document.createElement("div");
    item.className = "suggestion-item";

    if (r.type === "country") {
      item.textContent = "🌍 " + r.name;
      item.onclick = () => showCountryChannels(r.name);
    }

    if (r.type === "channel") {
      item.textContent = "📺 " + r.name + " (" + r.country + ")";
      item.onclick = () => {
        window.location.href = `live-tv.html?channel=${encodeURIComponent(r.url)}`;
      };
    }

    box.appendChild(item);
  });
};

/* ---------------- START ---------------- */
loadPlaylists();
