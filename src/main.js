import config from '../config.json' assert { type: 'json' };
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

    playlist.items.forEach((item) => {
      // Filter out by whitelist
      if (item.tvg.id in config.whitelisted) {
        let channel = config.whitelisted[item.tvg.id];
        // Append filtered channel link
        if ('m3u' in channel) {
          m3u = m3u.concat('\n', channel.m3u);
        } else {
          m3u = m3u.concat('\n', item.raw);
        }
        // Append EPG information
        channels = channels.concat('\n', channel.epg);
      }
    });

    Object.keys(config.custom).forEach((key) => {
      let channel = config.custom[key];
      m3u = m3u.concat('\n', channel.m3u);
      channels = channels.concat('\n', channel.epg);
    });

    // Write playlist file
    m3u = m3u.concat('\n');
    fs.writeFile('bin/playlist.m3u', m3u, (err) => {
      if (err) {
        console.error(err);
      }
    });

    // Write channels file
    channels = channels.concat('\n', '</channels>\n');
    fs.writeFile('bin/channels.xml', channels, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}).on('error', (err) => {
  console.error(err.message);
});
