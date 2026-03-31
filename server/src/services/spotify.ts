import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let tokenExpiry = 0;

async function ensureAuth() {
  if (Date.now() < tokenExpiry) return;

  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body.access_token);
  tokenExpiry = Date.now() + (data.body.expires_in - 60) * 1000;
}

export async function getPlaylistData(playlistId: string) {
  await ensureAuth();

  const playlist = await spotifyApi.getPlaylist(playlistId);
  const { name, images, tracks: trackInfo } = playlist.body;

  // Fetch all tracks (handle pagination)
  let allItems = playlist.body.tracks.items;
  let next = playlist.body.tracks.next;

  while (next) {
    const offset = allItems.length;
    const more = await spotifyApi.getPlaylistTracks(playlistId, { offset, limit: 100 });
    allItems = allItems.concat(more.body.items);
    next = more.body.next;
  }

  const tracks = allItems
    .filter((item) => item.track && !item.track.is_local)
    .map((item) => {
      const track = item.track!;
      return {
        id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        album: track.album.name,
        durationMs: track.duration_ms,
        imageUrl: track.album.images?.[0]?.url,
      };
    });

  return {
    playlist: {
      id: playlistId,
      name,
      imageUrl: images?.[0]?.url,
      trackCount: tracks.length,
    },
    tracks,
  };
}
