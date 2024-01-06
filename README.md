# TV

This is a IPTV playlist and EPG generator. On a scheduled run:

1. Fetches a public IPTV list
2. Filters out with a white list
3. Appends custom channels
4. Generates `playlist.m3u` and `channels.xml` files
5. Generates EPG information (`guide.xml`) using `channels.xml` file
6. Commits and pushes the changes
