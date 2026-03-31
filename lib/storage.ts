import { Paths, Directory, File } from 'expo-file-system';

function getTracksDir(): Directory {
  return new Directory(Paths.document, 'ripzy', 'tracks');
}

export function ensureTrackDirectory(): void {
  const dir = getTracksDir();
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

export function getTrackFile(trackId: string): File {
  return new File(getTracksDir(), `${trackId}.mp3`);
}

export function deleteTrackFile(trackId: string): void {
  const file = getTrackFile(trackId);
  if (file.exists) {
    file.delete();
  }
}

export function deleteAllTracks(): void {
  const dir = getTracksDir();
  if (dir.exists) {
    dir.delete();
  }
  dir.create({ intermediates: true });
}

export function getStorageUsage(): number {
  const dir = getTracksDir();
  if (!dir.exists) return 0;
  return dir.size ?? 0;
}
