import { FormattedHistoryItem } from '../../models';
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

import { CompletedEpisodesViewProps } from './CompletedEpisodes.types';
import { useCompletedEpisodesViewModel } from './CompletedEpisodesViewModel';
import { styles } from './CompletedEpisodes.styles';
import { CardHistoryItem, EpisodeActionsMenu, Toast } from '../../components';
import { COLORS } from '../../constants';

export const CompletedEpisodesView = ({
  podcastId,
}: CompletedEpisodesViewProps) => {
  const viewModel = useCompletedEpisodesViewModel(podcastId);

  if (viewModel.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  if (viewModel.isEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Completed Episodes</Text>
        <Text style={styles.emptyText}>
          Episodes you finish from this podcast will appear here.
        </Text>
      </View>
    );
  }

  const renderEpisode = ({
    item,
    index,
  }: {
    item: FormattedHistoryItem;
    index: number;
  }) => (
    <CardHistoryItem
      item={item}
      isLast={index === viewModel.episodes.length - 1}
      onMenuPress={() => viewModel.handleOpenMenu(index)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.summaryText}>{viewModel.summary}</Text>
      </View>

      <FlatList
        data={viewModel.episodes}
        renderItem={renderEpisode}
        keyExtractor={(item: FormattedHistoryItem) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <EpisodeActionsMenu
        visible={viewModel.menuIndex !== null}
        episodeTitle={viewModel.menuEpisodeTitle}
        onAddToQueue={viewModel.handleAddToQueue}
        onShare={viewModel.handleShare}
        onClose={viewModel.handleCloseMenu}
      />

      <Toast
        message={viewModel.toast.message}
        visible={viewModel.toast.visible}
        translateY={viewModel.toast.translateY}
        opacity={viewModel.toast.opacity}
        onDismiss={viewModel.toast.dismissToast}
      />
    </View>
  );
};
