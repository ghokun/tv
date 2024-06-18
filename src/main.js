import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import { get } from 'https';
import parser from 'iptv-playlist-parser';

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

    for (const [key, value] of Object.entries(config.whitelisted)) {
      // Append filtered channel link
      if ('m3u' in value) {
        m3u = m3u.concat(
          `\n#EXTINF:-1 tvg-id="${key}" tvg-logo="${value.m3u.tvg_logo}" group-title="${value.m3u.group_title}",${value.m3u.name}\n${value.m3u.url}`
        );
      } else if (channelMap.has(key)) {
        let item = channelMap.get(key);
        m3u = m3u.concat(
          `\n#EXTINF:-1 tvg-id="${item.tvg.id}" tvg-logo="${item.tvg.logo}" group-title="${value.group}",${item.name}\n${item.url}`
        );
      } else {
        console.error(`Could not find m3u information for channel ${key}!`);
      }
      // Append EPG information
      if ('epg' in value) {
        channels = channels.concat(
          `\n<channel site="${value.epg.site}" lang="${value.epg.lang}" xmltv_id="${key}" site_id="${value.epg.site_id}">${value.epg.channel}</channel>`
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
