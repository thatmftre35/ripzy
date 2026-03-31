import { useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlaylistCard } from '@/components/playlist-card';
import { AddPlaylistSheet } from '@/components/add-playlist-sheet';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/lib/store';
import { Playlist } from '@/lib/types';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const playlists = useStore((s) => s.playlists);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const handlePlaylistPress = useCallback(
    (playlist: Playlist) => {
      router.push(`/playlist/${playlist.id}` as any);
    },
    [router]
  );

  const handlePlaylistAdded = useCallback(() => {
    setShowAddSheet(false);
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Ripzy</ThemedText>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            No playlists yet
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap + to add a Spotify playlist
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaylistCard playlist={item} onPress={() => handlePlaylistPress(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.text }]}
        onPress={() => setShowAddSheet(true)}
        activeOpacity={0.8}
      >
        <ThemedText style={[styles.fabText, { color: colors.background }]}>+</ThemedText>
      </TouchableOpacity>

      <AddPlaylistSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdded={handlePlaylistAdded}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
