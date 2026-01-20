import React from 'react';
import { View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useQueueViewModel } from './QueueViewModel';
import { FormattedQueueItem, QueueViewProps } from './Queue.types';
import { styles } from './Queue.styles';
import { CardQueueItem, HeaderQueue, StateEmpty } from '../../components';

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

  const currentlyPlayingItem = viewModel.displayQueue[0];
  const upcomingItems = viewModel.displayQueue.slice(1);

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
          {/* Currently Playing Episode - Fixed at top */}
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

          {/* Upcoming Episodes - Draggable */}
          {upcomingItems.length > 0 && (
            <DraggableFlatList
              data={upcomingItems}
              onDragEnd={({ from, to }) =>
                viewModel.handleReorder(from + 1, to + 1)
              }
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
    </GestureHandlerRootView>
  );
};

export default QueueView;
