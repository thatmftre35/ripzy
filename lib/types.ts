export interface Playlist {
  id: string;
  spotifyId: string;
  name: string;
  imageUrl?: string;
  trackCount: number;
  createdAt: number;
}

export interface Track {
  id: string;
  playlistId: string;
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  imageUrl?: string;
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress: number;
  localUri?: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  queue: Track[];
  queueIndex: number;
}
