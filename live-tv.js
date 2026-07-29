/* ---------------- PLAYLISTS ---------------- */
const playlists = [
  "https://iptv-org.github.io/iptv/countries/fr.m3u",
  "https://ip-tv.app/France",

  /* Playlist Haiti ou a */
  "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u",

  "https://ip-tv.app/Haiti",
  "https://iptv-org.github.io/iptv/countries/ht.m3u",

  "https://ip-tv.app/USA",
  "https://ip-tv.app/Sports",
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
];

/* ---------------- GLOBALS ---------------- */
let channels = [];
let currentIndex = 0;

/* ---------------- CATEGORIES KI PI ENPÒTAN YO ---------------- */
const importantCategories = [
  "Movies",
  "Series",
  "Kids",
  "Cartoons",
  "Anime",
  "News",
  "World News",
  "Local News",
  "Music",
  "Radio Music",
  "Hits",
  "Sports",
  "Live Sports",
  "Football",
  "Basketball",
  "General",
  "Lifestyle",
  "Documentary"
];

/* ---------------- LOAD PLAYLISTS ---------------- */
async function loadPlaylists() {
  for (const url of playlists) {
    try {
      const res = await fetch(url);
      const text = await res.text();

      /* Playlist Haiti ou a → fòse kategori Haiti */
      if (url.includes("Lemaire86/Le-Maire-TV")) {
        parseM3U(text, "Haiti");
      } else {
        parseM3U(text);
      }

    } catch (e) {
      console.log("Error loading playlist:", url);
    }
  }

  fillCategories();   // ← RANPLI CATEGORIES YO
  renderChannels();   // ← Afiche lis chèn yo
  if (channels.length > 0) loadChannel(0);
}

/* ---------------- PARSE M3U ---------------- */
function parseM3U(text, forceCategory = null) {
  const lines = text.split("\n");
  let name = "";
  let logo = "";
  let category = "";
  let country = "";

  lines.forEach(line => {

    if (line.startsWith("#EXTINF")) {

      const info = line.split(",");
      name = info[1] || "Unknown";

      const tvgLogoMatch = line.match(/tvg-logo="(.*?)"/);
      logo = tvgLogoMatch ? tvgLogoMatch[1] : "assets/logo.png";

      const groupMatch = line.match(/group-title="(.*?)"/);
      category = groupMatch ? groupMatch[1] : "General";

      const countryMatch = line.match(/country="(.*?)"/);
      country = countryMatch ? countryMatch[1] : "Unknown";

      /* FÒSE KATEGORI HAITI */
      if (forceCategory) {
        category = forceCategory;
        country = forceCategory;
      }
    }

    if (line.startsWith("http")) {
      channels.push({
        name,
        logo,
        url: line.trim(),
        category,
        country
      });
    }
  });
}

/* ---------------- FILL IMPORTANT CATEGORIES ---------------- */
function fillCategories() {
  const select = document.getElementById("filter-category");

  select.innerHTML = `<option value="">Categories</option>`;

  importantCategories.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/* ---------------- RENDER CHANNELS ---------------- */
function renderChannels() {
  const list = document.getElementById("channel-list");
  list.innerHTML = "";

  const search = document.getElementById("search-input").value.toLowerCase();
  const filterCat = document.getElementById("filter-category").value;
  const filterCountry = document.getElementById("filter-country").value;

  channels.forEach((ch, index) => {

    if (search && !ch.name.toLowerCase().includes(search)) return;

    if (filterCat && ch.category !== filterCat) return;

    if (filterCountry && ch.country !== filterCountry) return;

    const item = document.createElement("div");
    item.className = "channel-item";
    item.onclick = () => loadChannel(index);

    const logo = document.createElement("img");
    logo.src = ch.logo;

    const info = document.createElement("div");
    info.className = "channel-info";
    info.innerHTML = `
      <h4>${ch.name}</h4>
      <small>${ch.category} • ${ch.country}</small>
    `;

    item.appendChild(logo);
    item.appendChild(info);
    list.appendChild(item);
  });
}

/* ---------------- LOAD CHANNEL ---------------- */
function loadChannel(index) {
  currentIndex = index;
  const ch = channels[index];

  document.getElementById("current-logo").src = ch.logo;
  document.getElementById("current-name").textContent = ch.name;
  document.getElementById("current-meta").textContent = `${ch.category} • ${ch.country}`;
  document.getElementById("current-url").textContent = ch.url;

  const player = document.getElementById("tv-player");
  player.src = ch.url;
  player.play().catch(() => {});
}

/* ---------------- BUTTONS ---------------- */
document.getElementById("btn-prev").onclick = () => {
  currentIndex = (currentIndex - 1 + channels.length) % channels.length;
  loadChannel(currentIndex);
};

document.getElementById("btn-next").onclick = () => {
  currentIndex = (currentIndex + 1) % channels.length;
  loadChannel(currentIndex);
};

/* ---------------- FILTER EVENTS ---------------- */
document.getElementById("search-input").oninput = renderChannels;
document.getElementById("filter-category").onchange = renderChannels;
document.getElementById("filter-country").onchange = renderChannels;

/* ---------------- START ---------------- */
loadPlaylists();
