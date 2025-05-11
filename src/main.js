import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import { get } from 'https';
import parser from 'iptv-playlist-parser';

let downloadImage = (url, dest) => {
  let request = get(url, (response) => {
    if (response.headers['content-type'].startsWith('image')) {
      let file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('end', () => {
        file.close();
      });
    } else {
      console.warn(`${url} does not contain an image.`);
    }
  }).on('error', (err) => {
    // Delete the file async if there is an error
    fs.unlink(dest);
    console.error(err);
  });
  request.on('error', (err) => {
    console.error(err);
  });
};

// Fetch original m3u playlist
get(config.playlist, (res) => {
  let data = [];
  res.on('data', (chunk) => {
    data.push(chunk);
  });

  res.on('end', () => {
    const raw = Buffer.concat(data).toString();
    const playlist = parser.parse(raw);

    let m3u = playlist.header.raw;
    let channels = '<?xml version="1.0" encoding="UTF-8"?>\n<channels>';

    const channelMap = new Map();
    playlist.items.map((item) => {
      channelMap.set(item.tvg.id, item);
    });

    for (const [key, value] of Object.entries(config.channels)) {
      // Append channel list
      let item;
      if (channelMap.has(key)) {
        item = channelMap.get(key);
      }

      let logo = 'logo' in value ? value.logo : item.tvg.logo;
      downloadImage(logo, `bin/logo/${key}.png`);
      let tvgLogo = `https://raw.githubusercontent.com/ghokun/tv/main/bin/logo/${key}.png`;

      let name = 'name' in value ? value.name : item.name;
      let url = 'url' in value ? value.url : item.url;

      if (item != undefined) {
        if (value.url == item.url)
          console.warn(`Remote contains same url for channel ${key}.`);
        if (value.logo == item.tvg.logo)
          console.warn(`Remote contains same logo for channel ${key}.`);
      }

      m3u = m3u.concat(
        `\n#EXTINF:-1 tvg-id="${key}" tvg-logo="${tvgLogo}" group-title="${value.group_title}",${name}\n${url}`
      );

      // Append EPG information
      if (value.epg_site) {
        channels = channels.concat(
          `\n<channel site="${value.epg_site}" lang="${value.lang}" xmltv_id="${key}" site_id="${value.epg_site_id}">${value.name}</channel>`
        );
      }
    }

    // Write playlist file
    m3u = m3u.concat('\n');
    fs.writeFile('bin/playlist.m3u', m3u, (err) => {
      if (err) {
        console.error(err);
      }
    });

    // Write channels file
    channels = channels.concat('\n</channels>\n');
    fs.writeFile('bin/channels.xml', channels, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}).on('error', (err) => {
  console.error(err.message);
});
