import { useCallback } from 'react';
import { File } from 'expo-file-system';
import { useStore } from '@/lib/store';
import { Track } from '@/lib/types';
import { getDownloadUrl } from '@/lib/api';
import { getTrackFile, ensureTrackDirectory } from '@/lib/storage';

export function useDownload() {
  const updateTrack = useStore((s) => s.updateTrack);

  const downloadTrack = useCallback(
    async (track: Track) => {
      ensureTrackDirectory();

      const destination = getTrackFile(track.id);
      const url = getDownloadUrl(track.title, track.artist);

      updateTrack(track.playlistId, track.id, {
        downloadStatus: 'downloading',
        downloadProgress: 0,
      });

      try {
        const file = await File.downloadFileAsync(url, destination, { idempotent: true });
        updateTrack(track.playlistId, track.id, {
          downloadStatus: 'completed',
          downloadProgress: 100,
          localUri: file.uri,
        });
      } catch (err) {
        updateTrack(track.playlistId, track.id, {
          downloadStatus: 'failed',
          downloadProgress: 0,
        });
      }
    },
    [updateTrack]
  );

  const downloadAll = useCallback(
    async (tracks: Track[]) => {
      for (const track of tracks) {
        if (track.downloadStatus !== 'completed') {
          await downloadTrack(track);
        }
      }
    },
    [downloadTrack]
  );

  return { downloadTrack, downloadAll };
}
