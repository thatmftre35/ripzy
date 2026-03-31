import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Track, PlayerState } from './types';

interface AppState {
  // Playlists
  playlists: Playlist[];
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;

  // Tracks
  tracksByPlaylist: Record<string, Track[]>;
  setTracks: (playlistId: string, tracks: Track[]) => void;
  updateTrack: (playlistId: string, trackId: string, updates: Partial<Track>) => void;
  getPlaylistTracks: (playlistId: string) => Track[];

  // Player
  player: PlayerState;
  setPlayerTrack: (track: Track, queue: Track[], queueIndex: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setPosition: (positionMs: number) => void;
  setDuration: (durationMs: number) => void;
  playNext: () => Track | null;
  playPrev: () => Track | null;
  clearPlayer: () => void;
}

const initialPlayerState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  queue: [],
  queueIndex: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Playlists
      playlists: [],
      addPlaylist: (playlist) =>
        set((state) => ({ playlists: [playlist, ...state.playlists] })),
      removePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
          tracksByPlaylist: Object.fromEntries(
            Object.entries(state.tracksByPlaylist).filter(([key]) => key !== id)
          ),
        })),

      // Tracks
      tracksByPlaylist: {},
      setTracks: (playlistId, tracks) =>
        set((state) => ({
          tracksByPlaylist: { ...state.tracksByPlaylist, [playlistId]: tracks },
        })),
      updateTrack: (playlistId, trackId, updates) =>
        set((state) => {
          const tracks = state.tracksByPlaylist[playlistId] || [];
          return {
            tracksByPlaylist: {
              ...state.tracksByPlaylist,
              [playlistId]: tracks.map((t) =>
                t.id === trackId ? { ...t, ...updates } : t
              ),
            },
          };
        }),
      getPlaylistTracks: (playlistId) => get().tracksByPlaylist[playlistId] || [],

      // Player
      player: initialPlayerState,
      setPlayerTrack: (track, queue, queueIndex) =>
        set({ player: { ...get().player, currentTrack: track, queue, queueIndex, positionMs: 0 } }),
      setPlaying: (isPlaying) =>
        set({ player: { ...get().player, isPlaying } }),
      setPosition: (positionMs) =>
        set({ player: { ...get().player, positionMs } }),
      setDuration: (durationMs) =>
        set({ player: { ...get().player, durationMs } }),
      playNext: () => {
        const { player } = get();
        const nextIndex = player.queueIndex + 1;
        if (nextIndex < player.queue.length) {
          const nextTrack = player.queue[nextIndex];
          set({ player: { ...player, currentTrack: nextTrack, queueIndex: nextIndex, positionMs: 0 } });
          return nextTrack;
        }
        return null;
      },
      playPrev: () => {
        const { player } = get();
        const prevIndex = player.queueIndex - 1;
        if (prevIndex >= 0) {
          const prevTrack = player.queue[prevIndex];
          set({ player: { ...player, currentTrack: prevTrack, queueIndex: prevIndex, positionMs: 0 } });
          return prevTrack;
        }
        return null;
      },
      clearPlayer: () => set({ player: initialPlayerState }),
    }),
    {
      name: 'ripzy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playlists: state.playlists,
        tracksByPlaylist: state.tracksByPlaylist,
      }),
    }
  )
);
