import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePlaybackController } from '../../hooks';
import { COLORS } from '../../constants';
import { RootStackParamList } from '../../navigation/types';
import { styles } from './MiniPlayer.styles';

export const MiniPlayer = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const playbackController = usePlaybackController();

  // Get the current podcast directly from playback controller
  const currentPodcast = playbackController.currentPodcast;

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (playbackController.duration === 0) return 0;
    return (playbackController.position / playbackController.duration) * 100;
  }, [playbackController.position, playbackController.duration]);

  const handlePress = useCallback(() => {
    if (playbackController.currentEpisode && currentPodcast) {
      navigation.navigate('FullPlayer', {
        episode: playbackController.currentEpisode,
        podcast: currentPodcast,
      });
    }
  }, [playbackController.currentEpisode, currentPodcast, navigation]);

  const handlePlayPause = useCallback(() => {
    playbackController.togglePlayPause();
  }, [playbackController]);

  const hasEpisode = playbackController.currentEpisode !== null;

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
            {playbackController.currentEpisode?.title}
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
            name={playbackController.isPlaying ? 'pause' : 'play'}
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
