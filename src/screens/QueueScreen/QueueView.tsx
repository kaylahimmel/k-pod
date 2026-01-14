import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../../constants/Colors";
import { useQueueViewModel } from "./QueueViewModel";
import { FormattedQueueItem, QueueViewProps } from "./Queue.types";
import { styles } from "./Queue.styles";
import { CardNowPlaying, CardQueueItem, HeaderQueue } from "../../components";

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="list-outline" size={64} color={COLORS.textSecondary} />
    <Text style={styles.emptyTitle}>Your Queue is Empty</Text>
    <Text style={styles.emptyMessage}>
      Add episodes to your queue from any podcast to listen to them next
    </Text>
  </View>
);

export const QueueView = ({ onEpisodePress }: QueueViewProps) => {
  const viewModel = useQueueViewModel(onEpisodePress);

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<FormattedQueueItem>) => (
    <CardQueueItem
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
      <HeaderQueue
        count={viewModel.queueStats.count}
        remainingTime={viewModel.queueStats.remainingTime}
        onClear={viewModel.handleClearQueue}
        hasItems={viewModel.hasUpcoming}
      />

      {viewModel.hasCurrentlyPlaying && viewModel.currentlyPlaying && (
        <CardNowPlaying
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
