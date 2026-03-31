import { useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackRow } from '@/components/track-row';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/lib/store';
import { useDownload } from '@/hooks/use-download';
import { useAudioPlayer } from '@/hooks/use-audio-player';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const playlist = useStore((s) => s.playlists.find((p) => p.id === id));
  const tracks = useStore((s) => s.tracksByPlaylist[id!] || []);
  const currentTrack = useStore((s) => s.player.currentTrack);
  const { downloadTrack, downloadAll } = useDownload();
  const { play } = useAudioPlayer();

  const handleTrackPress = useCallback(
    (track: typeof tracks[number], index: number) => {
      if (track.downloadStatus === 'completed' && track.localUri) {
        const downloadedTracks = tracks.filter(
          (t) => t.downloadStatus === 'completed' && t.localUri
        );
        const queueIndex = downloadedTracks.findIndex((t) => t.id === track.id);
        play(track, downloadedTracks, queueIndex);
      } else if (track.downloadStatus === 'pending' || track.downloadStatus === 'failed') {
        downloadTrack(track);
      }
    },
    [tracks, play, downloadTrack]
  );

  const handleDownloadAll = useCallback(() => {
    const pending = tracks.filter((t) => t.downloadStatus !== 'completed');
    if (pending.length === 0) {
      Alert.alert('All Done', 'All tracks have been downloaded.');
      return;
    }
    downloadAll(tracks);
  }, [tracks, downloadAll]);

  if (!playlist) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
          Playlist not found
        </ThemedText>
      </ThemedView>
    );
  }

  const completedCount = tracks.filter((t) => t.downloadStatus === 'completed').length;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 60 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.playlistName}>{playlist.name}</ThemedText>
            <ThemedText style={[styles.trackCount, { color: colors.textSecondary }]}>
              {completedCount}/{tracks.length} downloaded
            </ThemedText>
            <TouchableOpacity
              style={[styles.downloadAllButton, { borderColor: colors.border }]}
              onPress={handleDownloadAll}
              activeOpacity={0.6}
            >
              <ThemedText style={styles.downloadAllText}>Download All</ThemedText>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            index={index}
            onPress={() => handleTrackPress(item, index)}
            isCurrentTrack={currentTrack?.id === item.id}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  playlistName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  trackCount: {
    fontSize: 14,
    marginTop: 4,
  },
  downloadAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  downloadAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
