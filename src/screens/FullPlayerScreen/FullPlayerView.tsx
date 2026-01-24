import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFullPlayerViewModel } from './FullPlayerViewModel';
import { FullPlayerViewProps, PLAYBACK_SPEEDS } from './FullPlayer.types';
import { styles } from './FullPlayer.styles';
import { COLORS } from '../../constants';
import { PlaybackSpeed } from '../../models';
import { useSettingsStore, useToast } from '../../hooks';
import { Toast } from '../../components';

export const FullPlayerView = ({
  episode,
  podcast,
  onDismiss,
}: FullPlayerViewProps) => {
  const viewModel = useFullPlayerViewModel(episode, podcast, onDismiss);
  const { settings } = useSettingsStore();
  const toast = useToast();
  const [speedPickerVisible, setSpeedPickerVisible] = useState(false);

  const handleAddToQueue = () => {
    viewModel.handleAddToQueue();
    toast.showToast('Added to queue');
  };

  const handleSpeedSelect = (speed: PlaybackSpeed) => {
    viewModel.handleSpeedChange(speed);
    setSpeedPickerVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Episode Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: podcast.artworkUrl }}
          style={styles.artwork}
          resizeMode='cover'
        />
      </View>

      {/* Episode Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.title}
        </Text>
        <Text style={styles.podcastTitle} numberOfLines={1}>
          {podcast.title}
        </Text>
      </View>

      {/* Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={viewModel.duration || 1}
          value={viewModel.position}
          onSlidingComplete={viewModel.handleSeek}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.border}
          thumbTintColor={COLORS.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{viewModel.playbackTime.current}</Text>
          <Text style={styles.timeText}>
            {viewModel.playbackTime.remaining}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        {/* Skip Backward */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={viewModel.handleSkipBackward}
          accessibilityLabel={`Skip backward ${settings.skipBackwardSeconds} seconds`}
        >
          <Ionicons name='play-back' size={32} color={COLORS.textPrimary} />
          <Text style={styles.skipLabel}>{settings.skipBackwardSeconds}s</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={viewModel.handlePlayPause}
          accessibilityLabel={viewModel.isPlaying ? 'Pause' : 'Play'}
        >
          <Ionicons
            name={viewModel.isPlaying ? 'pause' : 'play'}
            size={36}
            color={COLORS.cardBackground}
          />
        </TouchableOpacity>

        {/* Skip Forward */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={viewModel.handleSkipForward}
          accessibilityLabel={`Skip forward ${settings.skipForwardSeconds} seconds`}
        >
          <Ionicons name='play-forward' size={32} color={COLORS.textPrimary} />
          <Text style={styles.skipLabel}>{settings.skipForwardSeconds}s</Text>
        </TouchableOpacity>
      </View>

      {/* Speed Control */}
      <View style={styles.speedContainer}>
        <TouchableOpacity
          style={styles.speedButton}
          onPress={() => setSpeedPickerVisible(true)}
          accessibilityLabel={`Playback speed ${viewModel.speedDisplay.label}`}
        >
          <Text style={styles.speedButtonText}>
            {viewModel.speedDisplay.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddToQueue}
          accessibilityLabel='Add to queue'
        >
          <Ionicons name='list-outline' size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionButtonText}>Add to Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Up Next Preview */}
      {viewModel.hasUpNext && viewModel.upNextItem && (
        <View style={styles.upNextContainer}>
          <Text style={styles.upNextHeader}>Up Next</Text>
          <View style={styles.upNextContent}>
            <Image
              source={{ uri: viewModel.upNextItem.artworkUrl }}
              style={styles.upNextArtwork}
              resizeMode='cover'
            />
            <View style={styles.upNextInfo}>
              <Text style={styles.upNextEpisodeTitle} numberOfLines={1}>
                {viewModel.upNextItem.episodeTitle}
              </Text>
              <Text style={styles.upNextPodcastTitle} numberOfLines={1}>
                {viewModel.upNextItem.podcastTitle}
              </Text>
            </View>
            <Text style={styles.upNextDuration}>
              {viewModel.upNextItem.formattedDuration}
            </Text>
          </View>
        </View>
      )}

      {/* Speed Picker Modal */}
      <Modal
        visible={speedPickerVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setSpeedPickerVisible(false)}
      >
        <Pressable
          style={styles.speedPickerOverlay}
          onPress={() => setSpeedPickerVisible(false)}
        >
          <View
            style={styles.speedPickerContainer}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.speedPickerHeader}>
              <Text style={styles.speedPickerTitle}>Playback Speed</Text>
              <TouchableOpacity onPress={() => setSpeedPickerVisible(false)}>
                <Text style={styles.speedPickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.speedPickerOptions}>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedOption,
                    viewModel.speed === speed && styles.speedOptionSelected,
                  ]}
                  onPress={() => handleSpeedSelect(speed)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      viewModel.speed === speed &&
                        styles.speedOptionTextSelected,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Toast */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        translateY={toast.translateY}
        opacity={toast.opacity}
        onDismiss={toast.dismissToast}
      />
    </ScrollView>
  );
};

export default FullPlayerView;
