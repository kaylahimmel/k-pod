import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFullPlayerViewModel } from './FullPlayerViewModel';
import { FullPlayerViewProps, PLAYBACK_SPEEDS } from './FullPlayer.types';
import { createStyles } from './FullPlayer.styles';
import { PlaybackSpeed } from '../../models';
import { useSettingsStore, useThemeColors, useThemedStyles } from '../../hooks';
import {
  HeaderBackButton,
  HeaderCloseButton,
  LinkedText,
  RichText,
} from '../../components';

export const FullPlayerView = ({
  episode,
  podcast,
  onDismiss,
}: FullPlayerViewProps) => {
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const viewModel = useFullPlayerViewModel(episode, podcast, onDismiss);
  const { settings } = useSettingsStore();
  const [speedPickerVisible, setSpeedPickerVisible] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  // On Android the modal is full-screen and edge-to-edge draws under the
  // status bar, so the header needs the top inset. The iOS sheet already
  // sits below the status bar - and the root SafeAreaProvider still reports
  // the full window inset there, so adding it would double the gap. Use a
  // small fixed padding matching the header buttons' own padding instead
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? insets.top + 8 : 8;

  const handleSpeedSelect = (speed: PlaybackSpeed) => {
    viewModel.handleSpeedChange(speed);
    setSpeedPickerVisible(false);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: topPadding }]}
        testID='full-player-scroll'
      >
        <View style={styles.header}>
          <HeaderBackButton onPress={viewModel.handleBack} />
          <HeaderCloseButton
            onPress={viewModel.handleDismiss}
            accessibilityLabel='Close player'
          />
        </View>
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: viewModel.podcast.artworkUrl }}
            style={styles.artwork}
            resizeMode='cover'
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {viewModel.episode.title}
          </Text>
          <Text style={styles.podcastTitle} numberOfLines={1}>
            {viewModel.podcast.title}
          </Text>
        </View>
        {viewModel.episode.description && (
          <View style={styles.descriptionContainer}>
            {descriptionExpanded ? (
              <RichText
                blocks={viewModel.descriptionBlocks}
                onLinkPress={viewModel.handleLinkPress}
              />
            ) : (
              // Collapsed uses flat segments: numberOfLines cannot clamp across
              // the separate Views that block layout produces
              <LinkedText
                segments={viewModel.descriptionSegments}
                onLinkPress={viewModel.handleLinkPress}
                style={styles.descriptionText}
                numberOfLines={2}
              />
            )}
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <Text style={styles.seeMoreText}>
                {descriptionExpanded ? 'See less' : 'See more'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={viewModel.duration || 1}
            value={viewModel.position}
            onSlidingComplete={viewModel.handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.progressTrack}
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {viewModel.playbackTime.current}
            </Text>
            <Text style={styles.timeText}>
              {viewModel.playbackTime.remaining}
            </Text>
          </View>
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={viewModel.handleSkipBackward}
            accessibilityLabel={`Skip backward ${settings.skipBackwardSeconds} seconds`}
          >
            <Ionicons name='play-back' size={32} color={colors.textPrimary} />
            <Text style={styles.skipLabel}>
              {settings.skipBackwardSeconds}s
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={viewModel.handlePlayPause}
            accessibilityLabel={viewModel.isPlaying ? 'Pause' : 'Play'}
          >
            <Ionicons
              name={viewModel.isPlaying ? 'pause' : 'play'}
              size={36}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={viewModel.handleSkipForward}
            accessibilityLabel={`Skip forward ${settings.skipForwardSeconds} seconds`}
          >
            <Ionicons
              name='play-forward'
              size={32}
              color={colors.textPrimary}
            />
            <Text style={styles.skipLabel}>{settings.skipForwardSeconds}s</Text>
          </TouchableOpacity>
        </View>
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
      </ScrollView>
    </>
  );
};

export default FullPlayerView;
