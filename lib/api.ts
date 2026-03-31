import { Playlist, Track } from './types';

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

export function getDownloadUrl(title: string, artist: string): string {
  const params = new URLSearchParams({ title, artist });
  return `${API_BASE}/api/download?${params.toString()}`;
}
