import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Track } from '@/lib/types';
import { formatDuration } from '@/lib/format';

interface TrackRowProps {
  track: Track;
  index: number;
  onPress: () => void;
  isCurrentTrack?: boolean;
}

export function TrackRow({ track, index, onPress, isCurrentTrack }: TrackRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const statusIcon = () => {
    switch (track.downloadStatus) {
      case 'completed':
        return <ThemedText style={[styles.statusIcon, { color: colors.textSecondary }]}>{'\u2713'}</ThemedText>;
      case 'downloading':
        return (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color={colors.text} />
          </View>
        );
      case 'failed':
        return <ThemedText style={[styles.statusIcon, { color: colors.destructive }]}>!</ThemedText>;
      default:
        return <ThemedText style={[styles.statusIcon, { color: colors.textSecondary }]}>{'\u2193'}</ThemedText>;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <ThemedText style={[styles.index, { color: colors.textSecondary }]}>
        {index + 1}
      </ThemedText>
      <View style={styles.content}>
        <ThemedText
          style={[styles.title, isCurrentTrack && { color: colors.tint }]}
          numberOfLines={1}
        >
          {track.title}
        </ThemedText>
        <ThemedText style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
          {track.artist}
        </ThemedText>
      </View>
      <ThemedText style={[styles.duration, { color: colors.textSecondary }]}>
        {formatDuration(track.durationMs)}
      </ThemedText>
      {statusIcon()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  index: {
    width: 28,
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  artist: {
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    fontSize: 13,
    marginLeft: 12,
  },
  statusIcon: {
    fontSize: 18,
    marginLeft: 12,
    width: 24,
    textAlign: 'center',
  },
  progressContainer: {
    marginLeft: 12,
    width: 24,
    alignItems: 'center',
  },
});
