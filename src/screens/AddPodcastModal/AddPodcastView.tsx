import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddPodcastViewModel } from './AddPodcastViewModel';
import { AddPodcastViewProps } from './AddPodcast.types';
import {
  formatPodcastPreview,
  formatEpisodeCount,
} from './AddPodcastPresenter';
import { styles } from './AddPodcast.styles';
import { COLORS } from '../../constants';

export const AddPodcastView = ({
  onDismiss,
  onGoToDiscover,
}: AddPodcastViewProps) => {
  const viewModel = useAddPodcastViewModel(onDismiss, onGoToDiscover);

  const isAddButtonDisabled =
    viewModel.url.trim().length === 0 || viewModel.modalState === 'loading';

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color={COLORS.primary} />
      <Text style={styles.loadingText}>Fetching podcast...</Text>
    </View>
  );

  // Render preview state
  const renderPreview = () => {
    if (!viewModel.previewPodcast) return null;

    const preview = formatPodcastPreview(viewModel.previewPodcast);

    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Image
              source={{ uri: preview.artworkUrl }}
              style={styles.previewArtwork}
              resizeMode='cover'
            />
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {preview.title}
              </Text>
              <Text style={styles.previewAuthor} numberOfLines={1}>
                {preview.author}
              </Text>
              <View style={styles.previewMeta}>
                <View style={styles.previewMetaItem}>
                  <Ionicons
                    name='mic-outline'
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.previewMetaText}>
                    {formatEpisodeCount(preview.episodeCount)}
                  </Text>
                </View>
                <View style={styles.previewMetaItem}>
                  <Ionicons
                    name='time-outline'
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.previewMetaText}>
                    {preview.latestEpisodeDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {preview.description ? (
            <Text style={styles.previewDescription} numberOfLines={3}>
              {preview.description}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            viewModel.isAlreadySubscribed && styles.alreadySubscribedButton,
          ]}
          onPress={viewModel.handleSubscribe}
          disabled={viewModel.isAlreadySubscribed}
          accessibilityLabel={
            viewModel.isAlreadySubscribed ? 'Already subscribed' : 'Subscribe'
          }
        >
          <Text
            style={[
              styles.subscribeButtonText,
              viewModel.isAlreadySubscribed && styles.alreadySubscribedText,
            ]}
          >
            {viewModel.isAlreadySubscribed ? 'Already Subscribed' : 'Subscribe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeUrlButton}
          onPress={viewModel.handleClearPreview}
          accessibilityLabel='Try a different URL'
        >
          <Text style={styles.changeUrlText}>Try a different URL</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render input state (idle or error)
  const renderInput = () => (
    <>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>RSS Feed URL</Text>
        <View
          style={[
            styles.inputContainer,
            viewModel.modalState === 'error' && styles.inputContainerError,
          ]}
        >
          <TextInput
            style={styles.input}
            value={viewModel.url}
            onChangeText={viewModel.handleUrlChange}
            placeholder='https://example.com/feed.xml'
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='url'
            returnKeyType='go'
            onSubmitEditing={viewModel.handleFetchPodcast}
            accessibilityLabel='RSS feed URL input'
          />
          {viewModel.url.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => viewModel.handleUrlChange('')}
              accessibilityLabel='Clear URL'
            >
              <Ionicons
                name='close-circle'
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {viewModel.modalState === 'error' && viewModel.errorMessage && (
          <View style={styles.errorContainer}>
            <Ionicons name='alert-circle' size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
          </View>
        )}
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Enter the RSS feed URL of a podcast to subscribe. You can usually find
          this on the podcast&#39;s website.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          isAddButtonDisabled && styles.addButtonDisabled,
        ]}
        onPress={viewModel.handleFetchPodcast}
        disabled={isAddButtonDisabled}
        accessibilityLabel='Add podcast'
      >
        <Text
          style={[
            styles.addButtonText,
            isAddButtonDisabled && styles.addButtonTextDisabled,
          ]}
        >
          Add Podcast
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.changeUrlButton}
        onPress={viewModel.handleDiscoverPodcastPress}
        accessibilityLabel='Cancel adding podcast'
      >
        <Text style={styles.changeUrlText}>Discover New Podcasts</Text>
      </TouchableOpacity>
    </>
  );

  // Determine which content to render based on state
  const renderContent = () => {
    switch (viewModel.modalState) {
      case 'loading':
        return renderLoading();
      case 'preview':
        return renderPreview();
      default:
        return renderInput();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onDismiss}
            accessibilityLabel='Cancel'
          >
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Podcast</Text>
          <View style={styles.headerButton}>
            <Text
              style={[styles.headerButtonText, styles.headerButtonDisabled]}
            >
              {'      '}
            </Text>
          </View>
        </View>

        {renderContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPodcastView;
