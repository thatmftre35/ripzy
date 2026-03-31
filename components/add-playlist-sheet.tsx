import { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/lib/store';
import { extractPlaylistId, isValidSpotifyPlaylistUrl } from '@/lib/spotify';
import { fetchPlaylist } from '@/lib/api';
import { Playlist, Track } from '@/lib/types';

interface AddPlaylistSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddPlaylistSheet({ visible, onClose, onAdded }: AddPlaylistSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addPlaylist = useStore((s) => s.addPlaylist);
  const setTracks = useStore((s) => s.setTracks);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUrl(text);
  };

  const handleAdd = async () => {
    if (!isValidSpotifyPlaylistUrl(url)) {
      Alert.alert('Invalid URL', 'Please paste a valid Spotify playlist link.');
      return;
    }

    const spotifyId = extractPlaylistId(url);
    if (!spotifyId) return;

    setLoading(true);
    try {
      const data = await fetchPlaylist(spotifyId);
      const playlistId = `pl_${Date.now()}`;

      const playlist: Playlist = {
        id: playlistId,
        spotifyId,
        name: data.playlist.name,
        imageUrl: data.playlist.imageUrl,
        trackCount: data.playlist.trackCount,
        createdAt: Date.now(),
      };

      const tracks: Track[] = data.tracks.map((t, i) => ({
        id: `tr_${playlistId}_${i}`,
        playlistId,
        spotifyId: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        durationMs: t.durationMs,
        imageUrl: t.imageUrl,
        downloadStatus: 'pending' as const,
        downloadProgress: 0,
      }));

      addPlaylist(playlist);
      setTracks(playlistId, tracks);
      setUrl('');
      onAdded();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to fetch playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <ThemedText style={[styles.cancelButton, { color: colors.textSecondary }]}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.sheetTitle}>Add Playlist</ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            placeholder="Paste Spotify playlist link..."
            placeholderTextColor={colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleAdd}
          />

          <TouchableOpacity
            style={[styles.pasteButton, { borderColor: colors.border }]}
            onPress={handlePaste}
            activeOpacity={0.6}
          >
            <ThemedText style={styles.pasteButtonText}>Paste from Clipboard</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.text, opacity: loading ? 0.6 : 1 },
            ]}
            onPress={handleAdd}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <ThemedText style={[styles.addButtonText, { color: colors.background }]}>
                Add Playlist
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#666',
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    fontSize: 16,
    width: 60,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pasteButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pasteButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
