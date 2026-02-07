import React, { useMemo } from 'react';
import { View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useQueueViewModel } from './QueueViewModel';
import { FormattedQueueItem, QueueViewProps } from './Queue.types';
import { styles } from './Queue.styles';
import { CardQueueItem, HeaderQueue, StateEmpty } from '../../components';

export const QueueView = ({ onEpisodePress, onPlayItem }: QueueViewProps) => {
  const viewModel = useQueueViewModel(onEpisodePress, onPlayItem);

  // Get currently playing item and all other items (must be before early return)
  const currentlyPlayingItem = viewModel.currentlyPlaying;
  const otherItems = useMemo(
    () => viewModel.displayQueue.filter((item) => !item.isCurrentlyPlaying),
    [viewModel.displayQueue],
  );

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
      onPlay={() => viewModel.handlePlayItem(item)}
      onPress={() => viewModel.handleEpisodePress(item)}
    />
  );

  if (viewModel.isEmpty) {
    return (
      <View style={styles.container}>
        <StateEmpty
          icon='list-outline'
          title='Your Queue is Empty'
          message='Add episodes to your queue from any podcast to listen to them next'
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <HeaderQueue
        count={viewModel.queueStats.count}
        remainingTime={viewModel.queueStats.remainingTime}
        onClear={viewModel.handleClearQueue}
        hasItems={viewModel.hasItems}
      />

      {viewModel.hasItems && (
        <View style={styles.queueListContainer}>
          {/* Currently Playing Episode - Fixed at top, not draggable */}
          {currentlyPlayingItem && (
            <View>
              <CardQueueItem
                item={currentlyPlayingItem}
                drag={() => {}}
                isActive={false}
                onRemove={() =>
                  viewModel.handleRemoveFromQueue(currentlyPlayingItem.id)
                }
                onPlay={() => viewModel.handlePlayItem(currentlyPlayingItem)}
                onPress={() =>
                  viewModel.handleEpisodePress(currentlyPlayingItem)
                }
                isDraggable={false}
              />
            </View>
          )}

          {/* All Other Episodes - Draggable */}
          {otherItems.length > 0 && (
            <DraggableFlatList
              data={otherItems}
              onDragEnd={({ from, to }) => {
                // Map draggable list indices to actual queue indices
                const fromItem = otherItems[from];
                const toItem = otherItems[to];

                const actualFromIndex = viewModel.displayQueue.findIndex(
                  (item) => item.id === fromItem.id,
                );
                const actualToIndex = viewModel.displayQueue.findIndex(
                  (item) => item.id === toItem.id,
                );

                viewModel.handleReorder(actualFromIndex, actualToIndex);
              }}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              activationDistance={10}
              animationConfig={{
                damping: 20,
                stiffness: 120,
                mass: 0.3,
                overshootClamping: true,
              }}
            />
          )}
        </View>
      )}
    </GestureHandlerRootView>
  );
};

export default QueueView;
