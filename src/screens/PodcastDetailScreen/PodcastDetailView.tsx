import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePodcastStore } from "../../hooks/usePodcastStore";
import { useQueueStore } from "../../hooks/useQueueStore";
import {
  formatPodcastDetail,
  FormattedEpisode,
  FormattedPodcastDetail,
} from "./PodcastDetailPresenter";
import type { Episode, Podcast, QueueItem } from "../../models";

// =============================================================================
// Types
// =============================================================================

interface PodcastDetailViewProps {
  podcastId: string;
  onEpisodePress: (episodeId: string) => void;
  onPlayEpisode: (episode: Episode, podcast: Podcast) => void;
  onUnsubscribe: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const COLORS = {
  primary: "#007AFF",
  background: "#F2F2F7",
  cardBackground: "#FFFFFF",
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  border: "#E5E5EA",
  danger: "#FF3B30",
  success: "#34C759",
  played: "#C7C7CC",
};

// =============================================================================
// Sub-Components
// =============================================================================

interface PodcastHeaderProps {
  podcast: FormattedPodcastDetail;
  onUnsubscribe: () => void;
  showFullDescription: boolean;
  onToggleDescription: () => void;
}

const PodcastHeader = ({
  podcast,
  onUnsubscribe,
  showFullDescription,
  onToggleDescription,
}: PodcastHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <Image
        source={{ uri: podcast.artworkUrl }}
        style={styles.artwork}
        defaultSource={require("../../../assets/icon.png")}
      />
      <View style={styles.headerInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {podcast.author}
        </Text>
        <Text style={styles.episodeCount}>{podcast.episodeCountLabel}</Text>
      </View>
    </View>

    <TouchableOpacity onPress={onToggleDescription}>
      <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 3}>
        {podcast.description}
      </Text>
      {podcast.description.length > 150 && (
        <Text style={styles.showMoreText}>
          {showFullDescription ? "Show less" : "Show more"}
        </Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity style={styles.unsubscribeButton} onPress={onUnsubscribe}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      <Text style={styles.unsubscribeText}>Subscribed</Text>
    </TouchableOpacity>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Episodes</Text>
    </View>
  </View>
);

interface EpisodeCardProps {
  episode: FormattedEpisode;
  podcast: Podcast;
  onPress: () => void;
  onPlay: () => void;
  onAddToQueue: () => void;
}

const EpisodeCard = ({
  episode,
  onPress,
  onPlay,
  onAddToQueue,
}: EpisodeCardProps) => (
  <TouchableOpacity
    style={[styles.episodeCard, episode.played && styles.episodeCardPlayed]}
    onPress={onPress}
  >
    <View style={styles.episodeContent}>
      <Text
        style={[styles.episodeTitle, episode.played && styles.episodeTitlePlayed]}
        numberOfLines={2}
      >
        {episode.displayTitle}
      </Text>
      <Text style={styles.episodeDescription} numberOfLines={2}>
        {episode.truncatedDescription}
      </Text>
      <View style={styles.episodeMeta}>
        <Text style={styles.episodeDate}>{episode.formattedPublishDate}</Text>
        <Text style={styles.episodeDuration}>{episode.formattedDuration}</Text>
        {episode.played && (
          <View style={styles.playedBadge}>
            <Ionicons name="checkmark" size={12} color={COLORS.textSecondary} />
            <Text style={styles.playedText}>Played</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.episodeActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPlay}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="play-circle" size={36} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAddToQueue}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="list" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const EmptyEpisodes = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="mic-off-outline" size={48} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>No Episodes</Text>
    <Text style={styles.emptyMessage}>
      This podcast doesn't have any episodes yet
    </Text>
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading podcast...</Text>
  </View>
);

const NotFoundState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger} />
    <Text style={styles.emptyTitle}>Podcast Not Found</Text>
    <Text style={styles.emptyMessage}>
      This podcast may have been removed from your library
    </Text>
  </View>
);

// =============================================================================
// Main Component
// =============================================================================

export const PodcastDetailView = ({
  podcastId,
  onEpisodePress,
  onPlayEpisode,
  onUnsubscribe,
}: PodcastDetailViewProps) => {
  const { podcasts, loading } = usePodcastStore();
  const { addToQueue, queue } = useQueueStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Find the podcast by ID
  const podcast = podcasts.find((p) => p.id === podcastId);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Add refresh logic when RSS service integration is complete
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleUnsubscribe = useCallback(() => {
    Alert.alert(
      "Unsubscribe",
      `Are you sure you want to unsubscribe from "${podcast?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsubscribe",
          style: "destructive",
          onPress: onUnsubscribe,
        },
      ]
    );
  }, [podcast?.title, onUnsubscribe]);

  const handleAddToQueue = useCallback(
    (episode: Episode) => {
      if (!podcast) return;

      // Check if already in queue
      const isInQueue = queue.some((item) => item.episode.id === episode.id);
      if (isInQueue) {
        Alert.alert("Already in Queue", "This episode is already in your queue");
        return;
      }

      const queueItem: QueueItem = {
        id: `${episode.id}-${Date.now()}`,
        episode,
        podcast,
        position: queue.length,
      };

      addToQueue(queueItem);
      Alert.alert("Added to Queue", `"${episode.title}" has been added to your queue`);
    },
    [podcast, queue, addToQueue]
  );

  const handlePlayEpisode = useCallback(
    (episode: Episode) => {
      if (!podcast) return;
      onPlayEpisode(episode, podcast);
    },
    [podcast, onPlayEpisode]
  );

  const toggleDescription = useCallback(() => {
    setShowFullDescription((prev) => !prev);
  }, []);

  // Get the raw episode for play/queue actions
  const getRawEpisode = useCallback(
    (episodeId: string): Episode | undefined => {
      return podcast?.episodes.find((e) => e.id === episodeId);
    },
    [podcast]
  );

  const renderEpisode = useCallback(
    ({ item }: { item: FormattedEpisode }) => {
      const rawEpisode = getRawEpisode(item.id);
      if (!rawEpisode || !podcast) return null;

      return (
        <EpisodeCard
          episode={item}
          podcast={podcast}
          onPress={() => onEpisodePress(item.id)}
          onPlay={() => handlePlayEpisode(rawEpisode)}
          onAddToQueue={() => handleAddToQueue(rawEpisode)}
        />
      );
    },
    [podcast, getRawEpisode, onEpisodePress, handlePlayEpisode, handleAddToQueue]
  );

  const keyExtractor = useCallback((item: FormattedEpisode) => item.id, []);

  // Loading state
  if (loading && !podcast) {
    return <LoadingState />;
  }

  // Not found state
  if (!podcast) {
    return <NotFoundState />;
  }

  // Format podcast for display
  const formattedPodcast = formatPodcastDetail(podcast);

  return (
    <FlatList
      style={styles.container}
      data={formattedPodcast.episodes}
      renderItem={renderEpisode}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <PodcastHeader
          podcast={formattedPodcast}
          onUnsubscribe={handleUnsubscribe}
          showFullDescription={showFullDescription}
          onToggleDescription={toggleDescription}
        />
      }
      ListEmptyComponent={<EmptyEpisodes />}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    marginBottom: 16,
  },
  artwork: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  episodeCount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: 16,
  },
  unsubscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
    marginBottom: 16,
  },
  unsubscribeText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: "500",
    marginLeft: 6,
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  episodeCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  episodeCardPlayed: {
    opacity: 0.7,
  },
  episodeContent: {
    flex: 1,
    marginRight: 12,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  episodeTitlePlayed: {
    color: COLORS.played,
  },
  episodeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  episodeMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  episodeDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  episodeDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  playedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  playedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  episodeActions: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});

export default PodcastDetailView;
