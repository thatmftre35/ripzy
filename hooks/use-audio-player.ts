import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useStore } from '@/lib/store';
import { Track } from '@/lib/types';

let globalSound: Audio.Sound | null = null;
let isAudioSetup = false;

async function setupAudio() {
  if (isAudioSetup) return;
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
  });
  isAudioSetup = true;
}

export function useAudioPlayer() {
  const {
    player,
    setPlayerTrack,
    setPlaying,
    setPosition,
    setDuration,
    playNext: storePlayNext,
    playPrev: storePlayPrev,
    clearPlayer,
  } = useStore();

  const onStatusUpdate = useCallback(
    (status: any) => {
      if (!status.isLoaded) return;
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setPlaying(status.isPlaying);

      if (status.didJustFinish) {
        const nextTrack = storePlayNext();
        if (nextTrack?.localUri) {
          loadAndPlay(nextTrack);
        } else {
          setPlaying(false);
        }
      }
    },
    [setPosition, setDuration, setPlaying, storePlayNext]
  );

  const loadAndPlay = useCallback(
    async (track: Track) => {
      await setupAudio();

      if (globalSound) {
        await globalSound.unloadAsync();
        globalSound = null;
      }

      if (!track.localUri) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.localUri },
        { shouldPlay: true },
        onStatusUpdate
      );
      globalSound = sound;
    },
    [onStatusUpdate]
  );

  const play = useCallback(
    async (track: Track, queue: Track[], queueIndex: number) => {
      setPlayerTrack(track, queue, queueIndex);
      await loadAndPlay(track);
    },
    [setPlayerTrack, loadAndPlay]
  );

  const togglePlayPause = useCallback(async () => {
    if (!globalSound) return;
    const status = await globalSound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await globalSound.pauseAsync();
    } else {
      await globalSound.playAsync();
    }
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    if (!globalSound) return;
    await globalSound.setPositionAsync(positionMs);
  }, []);

  const playNext = useCallback(async () => {
    const nextTrack = storePlayNext();
    if (nextTrack?.localUri) {
      await loadAndPlay(nextTrack);
    }
  }, [storePlayNext, loadAndPlay]);

  const playPrev = useCallback(async () => {
    const prevTrack = storePlayPrev();
    if (prevTrack?.localUri) {
      await loadAndPlay(prevTrack);
    }
  }, [storePlayPrev, loadAndPlay]);

  const stop = useCallback(async () => {
    if (globalSound) {
      await globalSound.unloadAsync();
      globalSound = null;
    }
    clearPlayer();
  }, [clearPlayer]);

  return { play, togglePlayPause, seek, playNext, playPrev, stop };
}
