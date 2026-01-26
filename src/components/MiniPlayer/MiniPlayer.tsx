import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { playerStore } from '../../stores/playerStore';
import { queueStore } from '../../stores/queueStore';
import { COLORS } from '../../constants';
import { RootStackParamList } from '../../navigation/types';
import { styles } from './MiniPlayer.styles';

export const MiniPlayer = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentEpisode = playerStore((state) => state.currentEpisode);
  const isPlaying = playerStore((state) => state.isPlaying);
  const setIsPlaying = playerStore((state) => state.setIsPlaying);
  const position = playerStore((state) => state.position);
  const duration = playerStore((state) => state.duration);
  const queue = queueStore((state) => state.queue);

  // Find the podcast for the current episode from the queue
  const currentPodcast = useMemo(() => {
    if (!currentEpisode) return null;
    const queueItem = queue.find(
      (item) => item.episode.id === currentEpisode.id,
    );
    return queueItem?.podcast ?? null;
  }, [currentEpisode, queue]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (duration === 0) return 0;
    return (position / duration) * 100;
  }, [position, duration]);

  const handlePress = useCallback(() => {
    if (currentEpisode && currentPodcast) {
      navigation.navigate('FullPlayer', {
        episode: currentEpisode,
        podcast: currentPodcast,
      });
    }
  }, [currentEpisode, currentPodcast, navigation]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const hasEpisode = currentEpisode !== null;

  // Empty state when no episode is playing
  if (!hasEpisode) {
    return (
      <View style={styles.container} testID='mini-player-empty'>
        <View style={styles.content}>
          <View style={styles.artwork}>
            <Ionicons
              name='musical-notes'
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
          <View style={styles.info}>
            <Text
              style={styles.emptyText}
              numberOfLines={1}
              testID='mini-player-empty-text'
            >
              No episode playing
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} testID='mini-player-progress' />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
      testID='mini-player'
    >
      <View style={styles.content}>
        {currentPodcast?.artworkUrl ? (
          <Image
            source={{ uri: currentPodcast.artworkUrl }}
            style={styles.artworkImage}
            testID='mini-player-artwork'
          />
        ) : (
          <View style={styles.artwork}>
            <Ionicons
              name='musical-notes'
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
        )}

        <View style={styles.info}>
          <Text
            style={styles.title}
            numberOfLines={1}
            testID='mini-player-title'
          >
            {currentEpisode.title}
          </Text>
          <Text
            style={styles.podcastName}
            numberOfLines={1}
            testID='mini-player-podcast'
          >
            {currentPodcast?.title ?? 'Unknown Podcast'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          testID='mini-player-play-button'
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={COLORS.cardBackground}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          testID='mini-player-progress'
        />
      </View>
    </TouchableOpacity>
  );
};
