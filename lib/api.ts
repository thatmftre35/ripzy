const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://ripzy.onrender.com';

interface SpotifyPlaylistResponse {
  playlist: {
    id: string;
    name: string;
    imageUrl?: string;
    trackCount: number;
  };
  tracks: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    durationMs: number;
    imageUrl?: string;
  }>;
}

export async function fetchPlaylist(spotifyId: string): Promise<SpotifyPlaylistResponse> {
  const response = await fetch(`${API_BASE}/api/spotify/playlist/${spotifyId}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch playlist');
  }
  return response.json();
}

export function getDownloadUrl(videoId: string): string {
  return `${API_BASE}/api/download?videoId=${encodeURIComponent(videoId)}`;
}
