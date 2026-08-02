/* ---------------- PLAYLISTS LMTV (TRIYE SELON SA OU TE KREYE YO) ---------------- */
const playlists = [

  /* 🇭🇹 LMTV – PREMYE NAN LIS LA */
  "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u",

  /* 🎶 MUSIC */
  "https://iptv-org.github.io/iptv/categories/music.m3u",
  "https://iptv-org.github.io/iptv/categories/entertainment.m3u",

  /* 🎥 MOVIES */
  "https://iptv-org.github.io/iptv/categories/movies.m3u",
  "https://iptv-org.github.io/iptv/categories/classic.m3u",
  "https://iptv-org.github.io/iptv/categories/series.m3u",

  /* 👶 KIDS */
  "https://iptv-org.github.io/iptv/categories/kids.m3u",
  "https://iptv-org.github.io/iptv/categories/family.m3u",

  /* 😂 CARTOONS */
  "https://iptv-org.github.io/iptv/categories/animation.m3u",
  "https://iptv-org.github.io/iptv/categories/comedy.m3u",

  /* 📰 NEWS */
  "https://iptv-org.github.io/iptv/categories/news.m3u",
  "https://iptv-org.github.io/iptv/categories/business.m3u",
  "https://iptv-org.github.io/iptv/categories/general.m3u",

  /* 🇫🇷 FRANCE */
  "https://iptv-org.github.io/iptv/countries/fr.m3u",
  "https://ip-tv.app/France",
  "https://iptv-org.github.io/iptv/categories/culture.m3u",

  /* 🇭🇹 HAITI */
  "https://ip-tv.app/Haiti",
  "https://iptv-org.github.io/iptv/countries/ht.m3u",

  /* 🌍 MELANJE (OPTIONAL) */
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://iptv-org.github.io/iptv/index.country.m3u",
  "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
];

/* ---------------- CATEGORIES KI PI ENPÒTAN YO ---------------- */
const importantCategories = [
  "Music",
  "Movies",
  "Kids",
  "Cartoons",
  "News",
  "France",
  "Haiti"
];

/* ---------------- LOAD PLAYLISTS ---------------- */
async function loadPlaylists() {
  for (const url of playlists) {
    try {
      const res = await fetch(url);
      const text = await res.text();

      if (url.includes("Le-Maire-TV")) {
        parseM3U(text, "Haiti", "Haiti");

      } else if (url.includes("/music") || url.includes("/entertainment")) {
        parseM3U(text, "Music", "France");

      } else if (url.includes("/movies") || url.includes("/classic") || url.includes("/series")) {
        parseM3U(text, "Movies", "France");

      } else if (url.includes("/kids") || url.includes("/family")) {
        parseM3U(text, "Kids", "France");

      } else if (url.includes("/animation") || url.includes("/comedy")) {
        parseM3U(text, "Cartoons", "France");

      } else if (url.includes("/news") || url.includes("/business") || url.includes("/general")) {
        parseM3U(text, "News", "France");

      } else if (url.includes("/fr") || url.includes("France")) {
        parseM3U(text, "France", "France");

      } else if (url.includes("/ht") || url.includes("Haiti")) {
        parseM3U(text, "Haiti", "Haiti");

      } else {
        parseM3U(text);
      }

    } catch (e) {
      console.log("Error loading playlist:", url);
    }
  }

  /* FÒSE LMTV VIN PREMYE CHÈN */
  channels = [
    {
      name: "LE MAIRE TV",
      logo: "https://raw.githubusercontent.com/Lemaire86/lemairetv/refs/heads/main/assets/logo.png",
      url: "https://lmtv.lemairetv.uk/hls/stream.m3u8",
      category: "Haiti",
      country: "Haiti"
    },
    ...channels
  ];

  fillCategories();
  renderChannels();
  loadChannel(0);
}

/* ---------------- PARSE M3U ---------------- */
function parseM3U(text, forceCategory = null, forceCountry = null) {
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

      if (forceCategory) category = forceCategory;
      if (forceCountry) country = forceCountry;
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
