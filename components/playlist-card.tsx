import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Playlist } from '@/lib/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress: () => void;
}

export function PlaylistCard({ playlist, onPress }: PlaylistCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.content}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {playlist.name}
        </ThemedText>
        <ThemedText style={[styles.count, { color: colors.textSecondary }]}>
          {playlist.trackCount} tracks
        </ThemedText>
      </View>
      <ThemedText style={[styles.arrow, { color: colors.textSecondary }]}>
        {'\u203A'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
  },
  count: {
    fontSize: 14,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  },
});
