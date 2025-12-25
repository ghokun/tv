# TV

> [!WARNING]  
> No longer maintained. Switched to a local dispatcharr instance to manage my 
my playlists and EPGs.

This is an IPTV playlist and EPG generator. On a scheduled run (hourly):

1. Fetches a public IPTV list
2. Filters out with a white list
3. Appends custom channels
4. Generates `playlist.m3u` and `channels.xml` files
5. Generates EPG information (`guide.xml`) using `channels.xml` file
6. Commits and pushes the changes

## Usage

Updated playlist and guide files are found under `bin` directory. Use the
following links in your favorite IPTV application.

Recommended free to use apps:

1. [https://m3u-ip.tv][1] Works good on Tizen TV.
2. [https://tivimate.com][2] Works good on Android based systems (GoogleTV, Firestick, Android).

#### Playlist:

```
https://raw.githubusercontent.com/ghokun/tv/main/bin/playlist.m3u
```

#### EPG:

```
https://raw.githubusercontent.com/ghokun/tv/main/bin/guide.xml
```

## Disclaimer

No video files are stored in this repository. The repository simply contains
user-submitted links to publicly available video stream URLs, which to the best
of my knowledge have been intentionally made publicly by the copyright holders.
If any links in these playlists infringe on your rights as a copyright holder,
they may be removed by sending a pull request or opening an issue. However, note
that I have no control over the destination of the link, and just removing the
link from the playlist will not remove its contents from the web. Note that
linking does not directly infringe copyright because no copy is made on the site
providing the link, and thus this is not a valid reason to send a DMCA notice to
GitHub. To remove this content from the web, you should contact the web host
that's actually hosting the content (not GitHub, nor the maintainers of this
repository).

[1]: https://m3u-ip.tv
[2]: https://tivimate.com
