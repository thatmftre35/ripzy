import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/lib/store';
import { getStorageUsage, deleteAllTracks } from '@/lib/storage';
import { formatFileSize } from '@/lib/format';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [storageUsage, setStorageUsage] = useState(0);
  const playlists = useStore((s) => s.playlists);

  useEffect(() => {
    setStorageUsage(getStorageUsage());
  }, []);

  const handleClearDownloads = () => {
    Alert.alert(
      'Clear All Downloads',
      'This will delete all downloaded MP3 files. Your playlists will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await deleteAllTracks();
            setStorageUsage(0);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      <View style={styles.section}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.rowLabel}>Playlists</ThemedText>
          <ThemedText style={[styles.rowValue, { color: colors.textSecondary }]}>
            {playlists.length}
          </ThemedText>
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.rowLabel}>Storage Used</ThemedText>
          <ThemedText style={[styles.rowValue, { color: colors.textSecondary }]}>
            {formatFileSize(storageUsage)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={handleClearDownloads}
          activeOpacity={0.6}
        >
          <ThemedText style={[styles.rowLabel, { color: colors.destructive }]}>
            Clear All Downloads
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          Ripzy v1.0.0
        </ThemedText>
      </View>
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
    paddingBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  section: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowValue: {
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
