const PLAYLIST_REGEX = /playlist\/([a-zA-Z0-9]+)/;

export function extractPlaylistId(url: string): string | null {
  const match = url.match(PLAYLIST_REGEX);
  return match ? match[1] : null;
}

export function isValidSpotifyPlaylistUrl(url: string): boolean {
  return PLAYLIST_REGEX.test(url);
}
