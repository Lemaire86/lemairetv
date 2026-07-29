/* ---------------- PLAYLISTS ---------------- */
const playlists = [
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
  "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u"
];

let channels = [];
let categories = new Set();

/* ---------------- CLEAN CATEGORY LIST ---------------- */
const allowedCategories = [
  "Movies", "Series", "Kids", "Cartoons", "Anime",
  "News", "World News", "Local News",
  "Music", "Radio", "Hits",
  "Sports", "Live Sports", "Football", "Basketball",
  "General", "Lifestyle", "Documentary"
];

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

  renderCategories();
  showAllChannels();
}

/* ---------------- PARSE M3U ---------------- */
function parseM3U(text) {
  const lines = text.split("\n");
  let name = "", logo = "", category = "";

  lines.forEach(line => {

    if (line.startsWith("#EXTINF")) {

      const info = line.split(",");
      name = info[1] || "Unknown";

      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      logo = logoMatch ? logoMatch[1] : "assets/logo.png";

      const catMatch = line.match(/group-title="(.*?)"/);
      category = catMatch ? catMatch[1] : "General";

      /* REMOVE COUNTRY NAMES */
      if (allowedCategories.includes(category)) {
        categories.add(category);
      }
    }

    if (line.startsWith("http")) {
      channels.push({ name, logo, url: line.trim(), category });
    }
  });
}

/* ---------------- RENDER CATEGORY LIST ---------------- */
function renderCategories() {
  const list = document.getElementById("categories-list");

  let all = [...categories];
  all.sort();

  list.innerHTML = "";

  all.forEach(cat => {
    const item = document.createElement("div");
    item.className = "category-item";
    item.textContent = cat;
    item.onclick = () => showCategoryChannels(cat);
    list.appendChild(item);
  });
}

/* ---------------- SHOW ALL CHANNELS ---------------- */
function showAllChannels() {
  document.getElementById("category-title").textContent = "ALL CHANNELS";

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

/* ---------------- SHOW CHANNELS BY CATEGORY ---------------- */
function showCategoryChannels(cat) {
  document.getElementById("category-title").textContent = cat;

  const grid = document.getElementById("channels-grid");
  grid.innerHTML = "";

  channels
    .filter(ch => ch.category === cat)
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

  /* --- MATCH CATEGORIES --- */
  [...categories].forEach(cat => {
    if (cat.toLowerCase().includes(q)) {
      results.push({ type: "category", name: cat });
    }
  });

  /* --- MATCH CHAÎNES --- */
  channels.forEach(ch => {
    if (ch.name.toLowerCase().includes(q)) {
      results.push({ type: "channel", name: ch.name, url: ch.url, category: ch.category });
    }
  });

  /* --- DISPLAY RESULTS --- */
  results.slice(0, 20).forEach(r => {
    const item = document.createElement("div");
    item.className = "suggestion-item";

    if (r.type === "category") {
      item.textContent = "📂 " + r.name;
      item.onclick = () => showCategoryChannels(r.name);
    }

    if (r.type === "channel") {
      item.textContent = "📺 " + r.name + " (" + r.category + ")";
      item.onclick = () => {
        window.location.href = `live-tv.html?channel=${encodeURIComponent(r.url)}`;
      };
    }

    box.appendChild(item);
  });
};

/* ---------------- START ---------------- */
loadPlaylists();
