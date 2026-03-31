import { useCallback } from 'react';
import { File } from 'expo-file-system';
import { useStore } from '@/lib/store';
import { Track } from '@/lib/types';
import { searchYouTube } from '@/lib/youtube';
import { getDownloadUrl } from '@/lib/api';
import { getTrackFile, ensureTrackDirectory } from '@/lib/storage';

export function useDownload() {
  const updateTrack = useStore((s) => s.updateTrack);

  const downloadTrack = useCallback(
    async (track: Track) => {
      ensureTrackDirectory();
      const destination = getTrackFile(track.id);

      updateTrack(track.playlistId, track.id, {
        downloadStatus: 'downloading',
        downloadProgress: 0,
      });

      try {
        // Search YouTube on-device (mobile IP, not blocked)
        const videoId = await searchYouTube(
          `${track.title} ${track.artist} official audio`
        );
        console.log(`Found: ${videoId} for "${track.title} - ${track.artist}"`);

        // Download via server (Cobalt handles deciphering)
        const url = getDownloadUrl(videoId);
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Download timed out')), 120000)
        );
        const download = File.downloadFileAsync(url, destination, {
          idempotent: true,
        });
        const file = await Promise.race([download, timeout]);

        updateTrack(track.playlistId, track.id, {
          downloadStatus: 'completed',
          downloadProgress: 100,
          localUri: file.uri,
        });
      } catch (err) {
        console.error('Download failed:', err);
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
