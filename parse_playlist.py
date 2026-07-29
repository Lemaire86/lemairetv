import requests

playlists = [
    "https://iptv-org.github.io/iptv/countries/fr.m3u",
    "https://ip-tv.app/France",
    "https://ip-tv.app/Haiti",
    "https://iptv-org.github.io/iptv/countries/ht.m3u",
    "https://ip-tv.app/USA",
    "https://ip-tv.app/Sports",
    "https://iptv-org.github.io/iptv/index.m3u",
    "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
    "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
]

def parse_m3u(text):
    channels = []
    lines = text.split("\n")
    name = ""
    logo = ""
    category = ""
    country = ""

    for line in lines:
        if line.startswith("#EXTINF"):
            info = line.split(",")
            name = info[1] if len(info) > 1 else "Unknown"

            import re
            tvg_logo = re.search(r'tvg-logo="(.*?)"', line)
            logo = tvg_logo.group(1) if tvg_logo else ""

            group = re.search(r'group-title="(.*?)"', line)
            category = group.group(1) if group else "General"

            ctry = re.search(r'country="(.*?)"', line)
            country = ctry.group(1) if ctry else "Unknown"

        elif line.startswith("http"):
            channels.append({
                "name": name,
                "logo": logo,
                "url": line.strip(),
                "category": category,
                "country": country,
            })
    return channels

all_channels = []

for url in playlists:
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            chans = parse_m3u(r.text)
            all_channels.extend(chans)
            print(f"{url}: {len(chans)} channels")
        else:
            print(f"Failed {url}: {r.status_code}")
    except Exception as e:
        print(f"Error {url}: {e}")

print(f"TOTAL CHANNELS: {len(all_channels)}")
