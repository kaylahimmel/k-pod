import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PodcastPreviewViewProps,
  FormattedPreviewEpisode,
} from './PodcastPreview.types';
import { usePodcastPreviewViewModel } from './usePodcastPreviewViewModel';
import { Toast, StateLoading, StateError, StateEmpty } from '../../components';
import { styles } from './PodcastPreview.styles';
import { COLORS } from '../../constants';

export const PodcastPreviewView = ({
  podcast,
  onSubscribe,
  onEpisodePress,
}: PodcastPreviewViewProps) => {
  const viewModel = usePodcastPreviewViewModel(
    podcast,
    onSubscribe,
    onEpisodePress,
  );

  const renderEpisodeCard = (
    episode: FormattedPreviewEpisode,
    index: number,
    isLast: boolean,
  ) => (
    <TouchableOpacity
      key={episode.id}
      style={[styles.episodeCard, isLast && styles.episodeCardLast]}
      onPress={() => viewModel.handleEpisodePress(episode.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.episodeTitle} numberOfLines={2}>
        {episode.displayTitle}
      </Text>
      <Text style={styles.episodeDescription} numberOfLines={2}>
        {episode.truncatedDescription}
      </Text>
      <View style={styles.episodeMeta}>
        <Text style={styles.episodeDate}>{episode.formattedPublishDate}</Text>
        <Text style={styles.episodeDuration}>{episode.formattedDuration}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEpisodesContent = () => {
    if (viewModel.isLoadingEpisodes) {
      return <StateLoading message='Loading episodes...' />;
    }

    if (viewModel.hasEpisodeError) {
      return (
        <StateError
          message={viewModel.episodeError!}
          onRetry={viewModel.handleRetryEpisodes}
        />
      );
    }

    if (viewModel.hasNoEpisodes) {
      return (
        <StateEmpty
          icon='albums-outline'
          title='No Episodes'
          message='No episodes available for this podcast'
        />
      );
    }

    return (
      <View style={styles.episodesList}>
        {viewModel.formattedEpisodes.map((episode, index) =>
          renderEpisodeCard(
            episode,
            index,
            index === viewModel.formattedEpisodes.length - 1,
          ),
        )}
      </View>
    );
  };

  // Build button styles from viewModel styleKeys
  const subscribeButtonStyles = viewModel.subscribeButtonState.styleKeys.map(
    (key) => styles[key],
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with artwork and info */}
        <View style={styles.header}>
          <Image
            source={{ uri: viewModel.formattedPodcast.artworkUrl }}
            style={styles.artwork}
            defaultSource={require('../../../assets/icon.png')}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {viewModel.formattedPodcast.displayTitle}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {viewModel.formattedPodcast.author}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.genre}>
                {viewModel.formattedPodcast.genre}
              </Text>
              <Text style={styles.episodeCount}>
                {viewModel.formattedPodcast.episodeCountLabel}
              </Text>
            </View>
            <TouchableOpacity
              style={subscribeButtonStyles}
              onPress={viewModel.handleSubscribe}
              disabled={viewModel.subscribeButtonState.isDisabled}
            >
              {viewModel.subscribeButtonState.showSpinner ? (
                <ActivityIndicator size='small' color={COLORS.cardBackground} />
              ) : (
                <Ionicons
                  name={viewModel.subscribeButtonState.iconName}
                  size={18}
                  color={COLORS.cardBackground}
                />
              )}
              <Text style={styles.subscribeButtonText}>
                {viewModel.subscribeButtonState.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description section */}
        {viewModel.formattedPodcast.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text
              style={styles.description}
              numberOfLines={viewModel.showFullDescription ? undefined : 4}
            >
              {viewModel.showFullDescription
                ? viewModel.formattedPodcast.description
                : viewModel.formattedPodcast.truncatedDescription}
            </Text>
            {viewModel.formattedPodcast.description.length > 200 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={viewModel.toggleDescription}
              >
                <Text style={styles.showMoreText}>
                  {viewModel.showFullDescription ? 'Show less' : 'Show more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Episodes section */}
        <View style={styles.episodesSection}>
          <View style={styles.episodesHeader}>
            <Text style={styles.sectionTitle}>Recent Episodes</Text>
          </View>
          {renderEpisodesContent()}
        </View>
      </ScrollView>

      <Toast
        message={viewModel.toast.message}
        visible={viewModel.toast.visible}
        translateY={viewModel.toast.translateY}
        opacity={viewModel.toast.opacity}
        onDismiss={viewModel.toast.dismissToast}
      />
    </>
  );
};

export default PodcastPreviewView;
