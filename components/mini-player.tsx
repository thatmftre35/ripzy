import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/lib/store';
import { useAudioPlayer } from '@/hooks/use-audio-player';

export function MiniPlayer() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const player = useStore((s) => s.player);
  const { togglePlayPause, playNext } = useAudioPlayer();

  if (!player.currentTrack) return null;

  const progress = player.durationMs > 0 ? player.positionMs / player.durationMs : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
    >
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.text, width: `${progress * 100}%` },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {player.currentTrack.title}
          </ThemedText>
          <ThemedText style={[styles.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>
            {player.currentTrack.artist}
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
            <ThemedText style={styles.controlIcon}>
              {player.isPlaying ? '\u275A\u275A' : '\u25B6'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={playNext} style={styles.controlButton}>
            <ThemedText style={styles.controlIcon}>{'\u23ED'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 13,
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  controlIcon: {
    fontSize: 16,
  },
});
