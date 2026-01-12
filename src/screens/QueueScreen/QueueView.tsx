import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../../constants/Colors";
import { useQueueViewModel } from "./QueueViewModel";
import { type FormattedQueueItem } from "./QueuePresenter";
import { styles } from "./Queue.styles";

interface QueueViewProps {
  onEpisodePress?: (episodeId: string, podcastId: string) => void;
}

// =============================================================================
// Sub-components
// =============================================================================

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="list-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>Your Queue is Empty</Text>
    <Text style={styles.emptyMessage}>
      Add episodes to your queue from any podcast to listen to them next
    </Text>
  </View>
);

interface NowPlayingCardProps {
  item: FormattedQueueItem;
  isPlaying: boolean;
  onPress: () => void;
}

const NowPlayingCard = ({ item, isPlaying, onPress }: NowPlayingCardProps) => (
  <TouchableOpacity style={styles.nowPlayingContainer} onPress={onPress}>
    <View style={styles.nowPlayingHeader}>
      <Ionicons
        name={isPlaying ? "volume-high" : "pause"}
        size={14}
        color="#FFFFFF"
      />
      <Text style={styles.nowPlayingLabel}>
        {isPlaying ? "NOW PLAYING" : "PAUSED"}
      </Text>
    </View>
    <View style={styles.nowPlayingContent}>
      {item.podcastArtworkUrl ? (
        <Image
          source={{ uri: item.podcastArtworkUrl }}
          style={styles.nowPlayingArtwork}
        />
      ) : (
        <View style={styles.nowPlayingArtwork}>
          <Ionicons
            name="musical-notes"
            size={30}
            color={COLORS.textSecondary}
          />
        </View>
      )}
      <View style={styles.nowPlayingInfo}>
        <Text style={styles.nowPlayingTitle} numberOfLines={2}>
          {item.displayTitle}
        </Text>
        <Text style={styles.nowPlayingPodcast} numberOfLines={1}>
          {item.podcastTitle}
        </Text>
        <Text style={styles.nowPlayingDuration}>{item.formattedDuration}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface QueueItemCardProps {
  item: FormattedQueueItem;
  drag: () => void;
  isActive: boolean;
  onRemove: () => void;
  onPress: () => void;
}

const QueueItemCard = ({
  item,
  drag,
  isActive,
  onRemove,
  onPress,
}: QueueItemCardProps) => (
  <ScaleDecorator>
    <TouchableOpacity
      style={[styles.queueItemContainer, isActive && styles.queueItemDragging]}
      onPress={onPress}
      onLongPress={drag}
      delayLongPress={150}
    >
      <View style={styles.queueItemContent}>
        <TouchableOpacity
          style={styles.dragHandle}
          onLongPress={drag}
          delayLongPress={0}
        >
          <Ionicons name="menu" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {item.podcastArtworkUrl ? (
          <Image
            source={{ uri: item.podcastArtworkUrl }}
            style={styles.queueItemArtwork}
          />
        ) : (
          <View style={styles.queueItemArtwork}>
            <Ionicons
              name="musical-notes"
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
        )}

        <View style={styles.queueItemInfo}>
          <Text style={styles.queueItemTitle} numberOfLines={2}>
            {item.displayTitle}
          </Text>
          <Text style={styles.queueItemPodcast} numberOfLines={1}>
            {item.podcastTitle}
          </Text>
          <View style={styles.queueItemMeta}>
            <Text style={styles.queueItemDuration}>
              {item.formattedDuration}
            </Text>
            <Text style={styles.queueItemPosition}>{item.positionLabel}</Text>
          </View>
        </View>

        <View style={styles.queueItemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </ScaleDecorator>
);

interface QueueHeaderProps {
  count: string;
  remainingTime: string;
  onClear: () => void;
  hasItems: boolean;
}

const QueueHeader = ({
  count,
  remainingTime,
  onClear,
  hasItems,
}: QueueHeaderProps) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerRow}>
      <View style={styles.headerStats}>
        <Text style={styles.headerTitle}>Up Next: {count}</Text>
        <Text style={styles.headerSubtitle}>{remainingTime}</Text>
      </View>
      {hasItems && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// =============================================================================
// Main Component
// =============================================================================

export const QueueView = ({ onEpisodePress }: QueueViewProps) => {
  const viewModel = useQueueViewModel(onEpisodePress);

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<FormattedQueueItem>) => (
    <QueueItemCard
      item={item}
      drag={drag}
      isActive={isActive}
      onRemove={() => viewModel.handleRemoveFromQueue(item.id)}
      onPress={() => viewModel.handlePlayItem(item)}
    />
  );

  if (viewModel.isEmpty) {
    return (
      <View style={styles.container}>
        <EmptyState />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueueHeader
        count={viewModel.queueStats.count}
        remainingTime={viewModel.queueStats.remainingTime}
        onClear={viewModel.handleClearQueue}
        hasItems={viewModel.hasUpcoming}
      />

      {viewModel.hasCurrentlyPlaying && viewModel.currentlyPlaying && (
        <NowPlayingCard
          item={viewModel.currentlyPlaying}
          isPlaying={viewModel.isPlaying}
          onPress={() =>
            viewModel.currentlyPlaying &&
            viewModel.handleEpisodePress(viewModel.currentlyPlaying)
          }
        />
      )}

      {viewModel.hasUpcoming && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Up Next</Text>
          </View>

          <DraggableFlatList
            data={viewModel.upcomingItems}
            onDragEnd={({ from, to }) => viewModel.handleReorder(from, to)}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </GestureHandlerRootView>
  );
};

export default QueueView;
